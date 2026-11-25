import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { crearCatalogo, renombrarCatalogo } from '../../../api/catalogos'
import Alerta from '../../../components/ui/Alerta'
import Boton from '../../../components/ui/Boton'
import Campo from '../../../components/ui/Campo'
import Selector from '../../../components/ui/Selector'
import { manejarErrorApi } from '../../../utils/errores'

// Mismas reglas que el backend (src/validators/catalogos.js)
const nombre = z
  .string()
  .trim()
  .min(2, 'El nombre debe tener al menos 2 caracteres')
  .max(80, 'El nombre no puede superar 80 caracteres')

const esquemaNombre = z.object({ nombre })
const esquemaInstrumento = z.object({ nombre, familia: z.string().min(1, 'Elige la familia del instrumento') })

// Crea un valor del catálogo (`item` vacío) o cambia el nombre del que llega en `item`.
// `familias`: familias activas, para elegir al crear un instrumento.
export default function FormularioCatalogo({ tipo, item, familias = [], onGuardado, onCerrar }) {
  const editando = Boolean(item)
  const pideFamilia = tipo.id === 'instrumento' && !editando
  const sinFamilias = pideFamilia && familias.length === 0
  const [errorGeneral, setErrorGeneral] = useState('')

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(pideFamilia ? esquemaInstrumento : esquemaNombre),
    defaultValues: { nombre: item?.nombre ?? '', familia: '' },
  })

  const enviar = async (datos) => {
    setErrorGeneral('')
    try {
      let respuesta
      if (editando) respuesta = await renombrarCatalogo(item._id, datos.nombre)
      else respuesta = await crearCatalogo({ tipo: tipo.id, nombre: datos.nombre, ...(pideFamilia && { familia: datos.familia }) })
      onGuardado(respuesta)
    } catch (error) {
      const mensaje = manejarErrorApi(error, setError)
      if (error.response?.status === 409) {
        // 409: nombre repetido (puede estar inactivo) o familia inactiva
        setError(mensaje.startsWith('La familia') ? 'familia' : 'nombre', { type: 'server', message: mensaje })
      } else {
        setErrorGeneral(mensaje)
      }
    }
  }

  return (
    <form onSubmit={handleSubmit(enviar)} noValidate className="space-y-4">
      {errorGeneral && <Alerta>{errorGeneral}</Alerta>}
      {sinFamilias && (
        <Alerta tipo="info">Primero crea (o activa) una familia en la pestaña «Familias de instrumentos».</Alerta>
      )}
      {pideFamilia && (
        <Selector label="Familia" error={errors.familia?.message} {...register('familia')}>
          <option value="">Elige una familia…</option>
          {familias.map((familia) => (
            <option key={familia._id} value={familia._id}>
              {familia.nombre}
            </option>
          ))}
        </Selector>
      )}
      <Campo
        label="Nombre"
        autoComplete="off"
        ayuda="No se permiten repetidos, aunque cambien las tildes o las mayúsculas."
        error={errors.nombre?.message}
        {...register('nombre')}
      />
      <div className="flex justify-end gap-2 pt-2">
        <Boton variante="secundario" onClick={onCerrar} disabled={isSubmitting}>
          Cancelar
        </Boton>
        <Boton type="submit" cargando={isSubmitting} disabled={sinFamilias}>
          {editando ? 'Guardar cambios' : 'Crear'}
        </Boton>
      </div>
    </form>
  )
}
