import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { agregarDocumento, editarDocumento } from '../../../api/obras'
import Alerta from '../../../components/ui/Alerta'
import AreaTexto from '../../../components/ui/AreaTexto'
import Boton from '../../../components/ui/Boton'
import Campo from '../../../components/ui/Campo'
import { manejarErrorApi } from '../../../utils/errores'

// Mismas reglas que el backend (documentoSchema)
const esquema = z.object({
  nombre: z.string().trim().min(1, 'El nombre del documento es obligatorio').max(150, 'Máximo 150 caracteres'),
  tipoArchivo: z.string().trim().max(30, 'Máximo 30 caracteres'),
  enlace: z
    .string()
    .trim()
    .min(1, 'El enlace es obligatorio')
    .max(2000, 'El enlace es demasiado largo')
    .regex(/^https?:\/\/\S+$/i, 'El enlace debe empezar por http:// o https://'),
  observaciones: z.string().trim().max(300, 'Máximo 300 caracteres'),
})

// El PUT reemplaza el documento: un campo opcional que no se envía se borra
const aPayload = (datos) => Object.fromEntries(Object.entries(datos).filter(([, v]) => v !== ''))

export default function FormularioDocumento({ obraId, documento, onGuardado, onCerrar }) {
  const editando = Boolean(documento)
  const [errorGeneral, setErrorGeneral] = useState('')
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(esquema),
    defaultValues: {
      nombre: documento?.nombre ?? '',
      tipoArchivo: documento?.tipoArchivo ?? '',
      enlace: documento?.enlace ?? '',
      observaciones: documento?.observaciones ?? '',
    },
  })

  const enviar = async (datos) => {
    setErrorGeneral('')
    try {
      const payload = aPayload(datos)
      if (editando) await editarDocumento(obraId, documento._id, payload)
      else await agregarDocumento(obraId, payload)
      onGuardado()
    } catch (error) {
      setErrorGeneral(manejarErrorApi(error, setError))
    }
  }

  return (
    <form onSubmit={handleSubmit(enviar)} noValidate className="space-y-4">
      {errorGeneral && <Alerta>{errorGeneral}</Alerta>}
      <Campo label="Nombre" autoComplete="off" error={errors.nombre?.message} {...register('nombre')} />
      <Campo
        label="Enlace"
        type="url"
        inputMode="url"
        autoComplete="off"
        placeholder="https://"
        ayuda="Enlace a Drive, OneDrive u otro servicio."
        error={errors.enlace?.message}
        {...register('enlace')}
      />
      <Campo label="Tipo de archivo" autoComplete="off" placeholder="PDF, MIDI, audio…" error={errors.tipoArchivo?.message} {...register('tipoArchivo')} />
      <AreaTexto label="Observaciones" rows={2} error={errors.observaciones?.message} {...register('observaciones')} />
      <div className="flex justify-end gap-2 pt-2">
        <Boton variante="secundario" onClick={onCerrar} disabled={isSubmitting}>
          Cancelar
        </Boton>
        <Boton type="submit" cargando={isSubmitting}>
          {editando ? 'Guardar cambios' : 'Agregar documento'}
        </Boton>
      </div>
    </form>
  )
}
