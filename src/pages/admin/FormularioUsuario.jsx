import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { crearUsuario, editarUsuario } from '../../api/usuarios'
import Alerta from '../../components/ui/Alerta'
import Boton from '../../components/ui/Boton'
import Campo from '../../components/ui/Campo'
import { manejarErrorApi } from '../../utils/errores'

// Mismas reglas que el backend (src/validators/usuarios.js)
const esquema = z.object({
  nombre: z
    .string()
    .trim()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(100, 'El nombre no puede superar 100 caracteres'),
  nombreUsuario: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, 'El nombre de usuario es obligatorio')
    .regex(
      /^[a-z0-9._-]{3,30}$/,
      'El nombre de usuario debe tener de 3 a 30 caracteres: letras, números, punto, guion o guion bajo'
    ),
})

// Crea una cuenta nueva o edita la que llega en `usuario`. Al terminar llama a onGuardado(respuesta).
export default function FormularioUsuario({ usuario, onGuardado, onCerrar }) {
  const editando = Boolean(usuario)
  const [errorGeneral, setErrorGeneral] = useState('')
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(esquema),
    defaultValues: { nombre: usuario?.nombre ?? '', nombreUsuario: usuario?.nombreUsuario ?? '' },
  })

  const enviar = async (datos) => {
    setErrorGeneral('')
    try {
      const respuesta = editando ? await editarUsuario(usuario._id, datos) : await crearUsuario(datos)
      onGuardado(respuesta)
    } catch (error) {
      const mensaje = manejarErrorApi(error, setError)
      // 409: el nombre de usuario ya existe
      if (error.response?.status === 409) setError('nombreUsuario', { type: 'server', message: mensaje })
      else setErrorGeneral(mensaje)
    }
  }

  return (
    <form onSubmit={handleSubmit(enviar)} noValidate className="space-y-4">
      {errorGeneral && <Alerta>{errorGeneral}</Alerta>}
      <Campo label="Nombre completo" autoComplete="off" error={errors.nombre?.message} {...register('nombre')} />
      <Campo
        label="Nombre de usuario"
        autoComplete="off"
        autoCapitalize="none"
        spellCheck={false}
        ayuda="Con este nombre inicia sesión. De 3 a 30 caracteres; se guarda en minúsculas."
        error={errors.nombreUsuario?.message}
        {...register('nombreUsuario')}
      />
      {!editando && (
        <p className="text-sm text-tinta-suave">
          Se generará una contraseña temporal que verás una sola vez. La persona deberá cambiarla al iniciar sesión.
        </p>
      )}
      <div className="flex justify-end gap-2 pt-2">
        <Boton variante="secundario" onClick={onCerrar} disabled={isSubmitting}>
          Cancelar
        </Boton>
        <Boton type="submit" cargando={isSubmitting}>
          {editando ? 'Guardar cambios' : 'Crear usuario'}
        </Boton>
      </div>
    </form>
  )
}
