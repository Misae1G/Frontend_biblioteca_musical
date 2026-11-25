import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { crearCarpeta, editarCarpeta } from '../../../api/carpetas'
import Alerta from '../../../components/ui/Alerta'
import AreaTexto from '../../../components/ui/AreaTexto'
import Boton from '../../../components/ui/Boton'
import Campo from '../../../components/ui/Campo'
import { manejarErrorApi } from '../../../utils/errores'
import { fechaDia } from '../../../utils/fechas'

// Mismas reglas que el backend (src/validators/carpetas.js)
const esquema = z.object({
  numero: z
    .string()
    .trim()
    .min(1, 'El número es obligatorio')
    .max(20, 'Máximo 20 caracteres')
    .regex(/^[A-Za-z0-9-]+$/, 'Solo letras, números y guiones, sin espacios'),
  ubicacionFisica: z.string().trim().max(150, 'Máximo 150 caracteres'),
  ultimaRevision: z.string().refine((v) => v === '' || /^\d{4}-\d{2}-\d{2}$/.test(v), 'Fecha no válida'),
  revisadaPor: z.string().trim().max(100, 'Máximo 100 caracteres'),
  observaciones: z.string().trim().max(500, 'Máximo 500 caracteres'),
})

// Los opcionales vacíos no se envían (el backend no acepta cadenas vacías).
// El PUT reemplaza el registro: al editar se envían todos los campos con valor, y el que se vacía se borra.
const aPayload = (datos) =>
  Object.fromEntries(Object.entries(datos).filter(([, valor]) => valor !== ''))

export default function FormularioCarpeta({ carpeta, onGuardado, onCerrar }) {
  const editando = Boolean(carpeta)
  const [errorGeneral, setErrorGeneral] = useState('')

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(esquema),
    defaultValues: {
      numero: carpeta?.numero ?? '',
      ubicacionFisica: carpeta?.ubicacionFisica ?? '',
      ultimaRevision: fechaDia(carpeta?.ultimaRevision) ?? '',
      revisadaPor: carpeta?.revisadaPor ?? '',
      observaciones: carpeta?.observaciones ?? '',
    },
  })

  const enviar = async (datos) => {
    setErrorGeneral('')
    try {
      const payload = aPayload(datos)
      const respuesta = editando ? await editarCarpeta(carpeta._id, payload) : await crearCarpeta(payload)
      onGuardado(respuesta)
    } catch (error) {
      const mensaje = manejarErrorApi(error, setError)
      if (error.response?.status === 409) setError('numero', { type: 'server', message: mensaje })
      else setErrorGeneral(mensaje)
    }
  }

  return (
    <form onSubmit={handleSubmit(enviar)} noValidate className="space-y-4">
      {errorGeneral && <Alerta>{errorGeneral}</Alerta>}
      <Campo
        label="Número"
        autoComplete="off"
        ayuda="Letras, números y guiones. Se guarda en mayúsculas."
        error={errors.numero?.message}
        {...register('numero')}
      />
      <Campo label="Ubicación física" autoComplete="off" error={errors.ubicacionFisica?.message} {...register('ubicacionFisica')} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Campo label="Última revisión" type="date" error={errors.ultimaRevision?.message} {...register('ultimaRevision')} />
        <Campo label="Revisada por" autoComplete="off" error={errors.revisadaPor?.message} {...register('revisadaPor')} />
      </div>
      <AreaTexto label="Observaciones" error={errors.observaciones?.message} {...register('observaciones')} />
      <div className="flex justify-end gap-2 pt-2">
        <Boton variante="secundario" onClick={onCerrar} disabled={isSubmitting}>
          Cancelar
        </Boton>
        <Boton type="submit" cargando={isSubmitting}>
          {editando ? 'Guardar cambios' : 'Crear carpeta'}
        </Boton>
      </div>
    </form>
  )
}
