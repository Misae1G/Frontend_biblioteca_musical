import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { listarObras } from '../../../api/obras'
import { crearPrestamo, editarPrestamo } from '../../../api/prestamos'
import Alerta from '../../../components/ui/Alerta'
import AreaTexto from '../../../components/ui/AreaTexto'
import Boton from '../../../components/ui/Boton'
import BuscadorRegistro from '../../../components/ui/BuscadorRegistro'
import Campo from '../../../components/ui/Campo'
import Selector from '../../../components/ui/Selector'
import { ETIQUETA_TIPO_ENTREGA } from '../../../utils/constantes'
import { manejarErrorApi } from '../../../utils/errores'
import { fechaDia, hoyEcuador } from '../../../utils/fechas'

const fecha = (mensaje) =>
  z
    .string()
    .min(1, mensaje)
    .refine((v) => /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v)), 'Fecha no válida')

const requerido = (mensaje, max) => z.string().trim().min(1, mensaje).max(max, `Máximo ${max} caracteres`)

// Mismas reglas que el backend (src/validators/prestamos.js)
const esquemaBase = {
  fechaSolicitud: fecha('La fecha de solicitud es obligatoria'),
  solicitante: requerido('El solicitante es obligatorio', 150),
  institucion: z.string().trim().max(150, 'Máximo 150 caracteres'),
  personaQueRecibe: requerido('La persona que recibe es obligatoria', 150),
  fechaEntrega: fecha('La fecha de entrega es obligatoria'),
  observaciones: z.string().trim().max(1000, 'Máximo 1000 caracteres'),
}
const esquemaCrear = z.object({
  ...esquemaBase,
  obra: z.string().min(1, 'Elige la obra'),
  tipoEntrega: z.enum(['fisico', 'digital'], 'Elige el tipo de entrega'),
})
const esquemaEditar = z.object(esquemaBase)

const mostrarObra = (o) =>
  `${o.titulo}${o.autor ? ` — ${o.autor}` : ''}${o.prestadaFisicamente ? ' · Prestada físicamente' : ''}`

// Registra un préstamo (`prestamo` vacío) o corrige los datos editables del que llega.
// La obra y el tipo de entrega no se corrigen: cambian la disponibilidad.
export default function FormularioPrestamo({ prestamo, onGuardado, onCerrar }) {
  const editando = Boolean(prestamo)
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
      tipoEntrega: '',
      fechaSolicitud: editando ? fechaDia(prestamo.fechaSolicitud) : hoyEcuador(),
      solicitante: prestamo?.solicitante ?? '',
      institucion: prestamo?.institucion ?? '',
      personaQueRecibe: prestamo?.personaQueRecibe ?? '',
      fechaEntrega: editando ? fechaDia(prestamo.fechaEntrega) : hoyEcuador(),
      observaciones: prestamo?.observaciones ?? '',
    },
  })

  const buscarObras = (q, signal) => listarObras({ q, activa: 'true', limite: 10 }, signal).then((r) => r.obras)

  const enviar = async (datos) => {
    setErrorGeneral('')
    try {
      // Los opcionales vacíos no se envían; en una edición, el que se vacía se borra
      const payload = Object.fromEntries(Object.entries(datos).filter(([, v]) => v !== ''))
      const respuesta = editando ? await editarPrestamo(prestamo._id, payload) : await crearPrestamo(payload)
      onGuardado(respuesta)
    } catch (error) {
      setErrorGeneral(manejarErrorApi(error, setError))
    }
  }

  return (
    <form onSubmit={handleSubmit(enviar)} noValidate className="space-y-4">
      {errorGeneral && <Alerta>{errorGeneral}</Alerta>}

      {!editando && (
        <>
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
          <Selector label="Tipo de entrega *" error={errors.tipoEntrega?.message} {...register('tipoEntrega')}>
            <option value="">Elige…</option>
            {Object.entries(ETIQUETA_TIPO_ENTREGA).map(([valor, texto]) => (
              <option key={valor} value={valor}>{texto}</option>
            ))}
          </Selector>
        </>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Campo label="Fecha de solicitud *" type="date" error={errors.fechaSolicitud?.message} {...register('fechaSolicitud')} />
        <Campo label="Fecha de entrega *" type="date" error={errors.fechaEntrega?.message} {...register('fechaEntrega')} />
        <Campo label="Solicitante *" autoComplete="off" error={errors.solicitante?.message} {...register('solicitante')} />
        <Campo label="Institución u orquesta" autoComplete="off" error={errors.institucion?.message} {...register('institucion')} />
        <Campo label="Persona que recibe *" autoComplete="off" error={errors.personaQueRecibe?.message} {...register('personaQueRecibe')} />
      </div>
      <AreaTexto label="Observaciones" error={errors.observaciones?.message} {...register('observaciones')} />

      <div className="flex justify-end gap-2 pt-2">
        <Boton variante="secundario" onClick={onCerrar} disabled={isSubmitting}>
          Cancelar
        </Boton>
        <Boton type="submit" cargando={isSubmitting}>
          {editando ? 'Guardar cambios' : 'Registrar préstamo'}
        </Boton>
      </div>
    </form>
  )
}
