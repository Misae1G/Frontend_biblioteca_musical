import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'react-toastify'
import Alerta from '../../components/ui/Alerta'
import Boton from '../../components/ui/Boton'
import Campo from '../../components/ui/Campo'
import PantallaAuth from '../../layout/PantallaAuth'
import { api } from '../../api/cliente'
import { manejarErrorApi } from '../../utils/errores'
import { passwordNuevaSchema } from '../../utils/validaciones'

const esquema = z
  .object({
    passwordNueva: passwordNuevaSchema,
    confirmar: z.string().min(1, 'Repite la contraseña nueva'),
  })
  .refine((d) => d.passwordNueva === d.confirmar, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmar'],
  })

// Enlace del correo de recuperación: /restablecer/:token
export default function Restablecer() {
  const { token } = useParams()
  const navigate = useNavigate()
  const [errorGeneral, setErrorGeneral] = useState('')
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(esquema), defaultValues: { passwordNueva: '', confirmar: '' } })

  const enviar = async ({ passwordNueva }) => {
    setErrorGeneral('')
    try {
      const { data } = await api.post('/auth/restablecer', { token, passwordNueva })
      toast.success(data.msg)
      navigate('/login', { replace: true })
    } catch (error) {
      setErrorGeneral(manejarErrorApi(error, setError))
    }
  }

  return (
    <PantallaAuth titulo="Nueva contraseña" descripcion="Elige una contraseña nueva para tu cuenta de administrador.">
      <form onSubmit={handleSubmit(enviar)} noValidate className="space-y-4">
        {errorGeneral && (
          <Alerta>
            <p>{errorGeneral}</p>
            <p className="mt-1">
              <Link to="/recuperar" className="underline underline-offset-2">
                Solicitar un enlace nuevo
              </Link>
            </p>
          </Alerta>
        )}
        <Campo
          label="Contraseña nueva"
          type="password"
          autoComplete="new-password"
          autoFocus
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
          {isSubmitting ? 'Guardando…' : 'Restablecer contraseña'}
        </Boton>
      </form>
    </PantallaAuth>
  )
}
