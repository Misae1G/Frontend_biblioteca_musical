import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'react-toastify'
import Alerta from '../../components/ui/Alerta'
import Boton from '../../components/ui/Boton'
import Campo from '../../components/ui/Campo'
import PantallaAuth from '../../layout/PantallaAuth'
import { useAuth } from '../../store/authStore'
import { manejarErrorApi } from '../../utils/errores'
import { rutaInicio } from '../../utils/rutas'
import { passwordNuevaSchema } from '../../utils/validaciones'

const esquema = z
  .object({
    passwordActual: z.string().min(1, 'Ingresa tu contraseña actual').max(200, 'La contraseña no es válida'),
    passwordNueva: passwordNuevaSchema,
    confirmar: z.string().min(1, 'Repite la contraseña nueva'),
  })
  .refine((d) => d.passwordActual !== d.passwordNueva, {
    message: 'La nueva contraseña debe ser distinta de la actual',
    path: ['passwordNueva'],
  })
  .refine((d) => d.passwordNueva === d.confirmar, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmar'],
  })

export default function CambiarPassword() {
  const usuario = useAuth((s) => s.usuario)
  const cambiarPassword = useAuth((s) => s.cambiarPassword)
  const logout = useAuth((s) => s.logout)
  const navigate = useNavigate()
  const [errorGeneral, setErrorGeneral] = useState('')
  const obligatorio = usuario.debeCambiarPassword

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(esquema),
    defaultValues: { passwordActual: '', passwordNueva: '', confirmar: '' },
  })

  const enviar = async ({ passwordActual, passwordNueva }) => {
    setErrorGeneral('')
    try {
      const data = await cambiarPassword(passwordActual, passwordNueva)
      toast.success(data.msg)
      navigate(rutaInicio(data.usuario), { replace: true })
    } catch (error) {
      setErrorGeneral(manejarErrorApi(error, setError))
    }
  }

  const salir = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <PantallaAuth
      titulo="Cambiar contraseña"
      descripcion={
        obligatorio
          ? 'Por seguridad debes cambiar tu contraseña temporal antes de continuar.'
          : 'Ingresa tu contraseña actual y elige una nueva.'
      }
    >
      <form onSubmit={handleSubmit(enviar)} noValidate className="space-y-4">
        {errorGeneral && <Alerta>{errorGeneral}</Alerta>}
        <Campo
          label={obligatorio ? 'Contraseña temporal' : 'Contraseña actual'}
          type="password"
          autoComplete="current-password"
          autoFocus
          error={errors.passwordActual?.message}
          {...register('passwordActual')}
        />
        <Campo
          label="Contraseña nueva"
          type="password"
          autoComplete="new-password"
          ayuda="Mínimo 8 caracteres, con letras y números."
          error={errors.passwordNueva?.message}
          {...register('passwordNueva')}
        />
        <Campo
          label="Repite la contraseña nueva"
          type="password"
          autoComplete="new-password"
          error={errors.confirmar?.message}
          {...register('confirmar')}
        />
        <Boton type="submit" cargando={isSubmitting} className="w-full">
          {isSubmitting ? 'Guardando…' : 'Cambiar contraseña'}
        </Boton>
        <p className="text-center text-sm">
          {obligatorio ? (
            <button
              type="button"
              onClick={salir}
              className="text-marca-600 underline underline-offset-2 hover:text-marca-700"
            >
              Cerrar sesión
            </button>
          ) : (
            <Link to={rutaInicio(usuario)} className="text-marca-600 underline underline-offset-2 hover:text-marca-700">
              Cancelar
            </Link>
          )}
        </p>
      </form>
    </PantallaAuth>
  )
}
