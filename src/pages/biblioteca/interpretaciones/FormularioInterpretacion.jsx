import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { crearInterpretacion, editarInterpretacion } from '../../../api/interpretaciones'
import { listarObras } from '../../../api/obras'
import Alerta from '../../../components/ui/Alerta'
import AreaTexto from '../../../components/ui/AreaTexto'
import Boton from '../../../components/ui/Boton'
import BuscadorRegistro from '../../../components/ui/BuscadorRegistro'
import Campo from '../../../components/ui/Campo'
import { manejarErrorApi } from '../../../utils/errores'
import { fechaDia } from '../../../utils/fechas'

const requerido = (mensaje, max) => z.string().trim().min(1, mensaje).max(max, `Máximo ${max} caracteres`)

// Mismas reglas que el backend (src/validators/interpretaciones.js)
const base = {
  fechaPrevista: z
    .string()
    .min(1, 'La fecha prevista es obligatoria')
    .refine((v) => /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v)), 'Fecha no válida'),
  programa: requerido('El programa o concierto es obligatorio', 200),
  director: requerido('El director es obligatorio', 150),
  solista: z.string().trim().max(150, 'Máximo 150 caracteres'),
  observaciones: z.string().trim().max(1000, 'Máximo 1000 caracteres'),
}
const esquemaCrear = z.object({ ...base, obra: z.string().min(1, 'Elige la obra') })
const esquemaEditar = z.object(base)

const mostrarObra = (o) => `${o.titulo}${o.autor ? ` — ${o.autor}` : ''}`

// Programa una interpretación (`interpretacion` vacía) o corrige los datos editables de la que llega.
// La obra no se corrige: cambia la disponibilidad de dos obras.
export default function FormularioInterpretacion({ interpretacion, onGuardado, onCerrar }) {
  const editando = Boolean(interpretacion)
  const [errorGeneral, setErrorGeneral] = useState('')
  const [obra, setObra] = useState(null)

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(editando ? esquemaEditar : esquemaCrear),
    defaultValues: {
      obra: '',
      fechaPrevista: editando ? fechaDia(interpretacion.fechaPrevista) : '',
      programa: interpretacion?.programa ?? '',
      director: interpretacion?.director ?? '',
      solista: interpretacion?.solista ?? '',
      observaciones: interpretacion?.observaciones ?? '',
    },
  })

  const buscarObras = (q, signal) => listarObras({ q, activa: 'true', limite: 10 }, signal).then((r) => r.obras)

  const enviar = async (datos) => {
    setErrorGeneral('')
    try {
      // Los opcionales vacíos no se envían; en una edición, el que se vacía se borra
      const payload = Object.fromEntries(Object.entries(datos).filter(([, v]) => v !== ''))
      const respuesta = editando ? await editarInterpretacion(interpretacion._id, payload) : await crearInterpretacion(payload)
      onGuardado(respuesta)
    } catch (error) {
      setErrorGeneral(manejarErrorApi(error, setError))
    }
  }

  return (
    <form onSubmit={handleSubmit(enviar)} noValidate className="space-y-4">
      {errorGeneral && <Alerta>{errorGeneral}</Alerta>}

      {!editando && (
        <BuscadorRegistro
          label="Obra"
          obligatorio
          valor={obra}
          mostrar={mostrarObra}
          buscar={buscarObras}
          placeholder="Busca por título, autor o carpeta"
          error={errors.obra?.message}
          onElegir={(item) => {
            setObra(item)
            setValue('obra', item?._id ?? '', { shouldValidate: Boolean(item) })
          }}
        />
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Campo label="Fecha prevista *" type="date" error={errors.fechaPrevista?.message} {...register('fechaPrevista')} />
        <Campo label="Director *" autoComplete="off" error={errors.director?.message} {...register('director')} />
        <Campo label="Programa o concierto *" autoComplete="off" error={errors.programa?.message} {...register('programa')} />
        <Campo label="Solista" autoComplete="off" error={errors.solista?.message} {...register('solista')} />
      </div>
      <AreaTexto label="Observaciones" error={errors.observaciones?.message} {...register('observaciones')} />

      <div className="flex justify-end gap-2 pt-2">
        <Boton variante="secundario" onClick={onCerrar} disabled={isSubmitting}>
          Cancelar
        </Boton>
        <Boton type="submit" cargando={isSubmitting}>
          {editando ? 'Guardar cambios' : 'Programar interpretación'}
        </Boton>
      </div>
    </form>
  )
}
