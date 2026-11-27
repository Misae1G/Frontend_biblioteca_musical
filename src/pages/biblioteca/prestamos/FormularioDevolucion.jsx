import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { editarDevolucion, registrarDevolucion } from '../../../api/prestamos'
import Alerta from '../../../components/ui/Alerta'
import AreaTexto from '../../../components/ui/AreaTexto'
import Boton from '../../../components/ui/Boton'
import Campo from '../../../components/ui/Campo'
import Selector from '../../../components/ui/Selector'
import { ETIQUETA_ESTADO_FISICO } from '../../../utils/constantes'
import { manejarErrorApi } from '../../../utils/errores'
import { fechaDia, hoyEcuador } from '../../../utils/fechas'

// Registra la devolución de un préstamo físico, o corrige la ya registrada (`prestamo.devolucion`)
export default function FormularioDevolucion({ prestamo, onGuardado, onCerrar }) {
  const editando = Boolean(prestamo.devolucion)
  const entrega = fechaDia(prestamo.fechaEntrega)
  const [errorGeneral, setErrorGeneral] = useState('')

  const esquema = z.object({
    fechaDevolucion: z
      .string()
      .min(1, 'La fecha de devolución es obligatoria')
      .refine((v) => /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v)), 'Fecha no válida')
      .refine((v) => v >= entrega, `No puede ser anterior a la entrega (${entrega})`),
    personaQueDevuelve: z.string().trim().min(1, 'La persona que devuelve es obligatoria').max(150, 'Máximo 150 caracteres'),
    estadoFisico: z.enum(['buen_estado', 'deteriorado', 'danado'], 'Elige el estado físico'),
    observaciones: z.string().trim().max(500, 'Máximo 500 caracteres'),
  })

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(esquema),
    defaultValues: {
      fechaDevolucion: editando ? fechaDia(prestamo.devolucion.fechaDevolucion) : hoyEcuador(),
      personaQueDevuelve: prestamo.devolucion?.personaQueDevuelve ?? '',
      estadoFisico: prestamo.devolucion?.estadoFisico ?? '',
      observaciones: prestamo.devolucion?.observaciones ?? '',
    },
  })

  const enviar = async (datos) => {
    setErrorGeneral('')
    try {
      const payload = Object.fromEntries(Object.entries(datos).filter(([, v]) => v !== ''))
      const respuesta = editando ? await editarDevolucion(prestamo._id, payload) : await registrarDevolucion(prestamo._id, payload)
      onGuardado(respuesta)
    } catch (error) {
      setErrorGeneral(manejarErrorApi(error, setError))
    }
  }

  return (
    <form onSubmit={handleSubmit(enviar)} noValidate className="space-y-4">
      {errorGeneral && <Alerta>{errorGeneral}</Alerta>}
      <div className="grid gap-4 sm:grid-cols-2">
        <Campo label="Fecha de devolución *" type="date" min={entrega} error={errors.fechaDevolucion?.message} {...register('fechaDevolucion')} />
        <Campo label="Persona que devuelve *" autoComplete="off" error={errors.personaQueDevuelve?.message} {...register('personaQueDevuelve')} />
      </div>
      <Selector label="Estado físico de la obra *" error={errors.estadoFisico?.message} {...register('estadoFisico')}>
        <option value="">Elige…</option>
        {Object.entries(ETIQUETA_ESTADO_FISICO).map(([valor, texto]) => (
          <option key={valor} value={valor}>{texto}</option>
        ))}
      </Selector>
      <AreaTexto label="Observaciones" rows={2} error={errors.observaciones?.message} {...register('observaciones')} />
      <div className="flex justify-end gap-2 pt-2">
        <Boton variante="secundario" onClick={onCerrar} disabled={isSubmitting}>
          Cancelar
        </Boton>
        <Boton type="submit" cargando={isSubmitting}>
          {editando ? 'Guardar cambios' : 'Registrar devolución'}
        </Boton>
      </div>
    </form>
  )
}
