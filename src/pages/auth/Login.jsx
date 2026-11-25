import { useState } from 'react'
import { Link } from 'react-router-dom'
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

const esquema = z.object({
  identificador: z.string().trim().min(1, 'Ingresa tu correo o usuario').max(150, 'El dato ingresado no es válido'),
  password: z.string().min(1, 'Ingresa tu contraseña').max(200, 'La contraseña no es válida'),
})

export default function Login() {
  const login = useAuth((s) => s.login)
  const [errorGeneral, setErrorGeneral] = useState('')
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(esquema), defaultValues: { identificador: '', password: '' } })

  // Al iniciar sesión, RutaPublica redirige sola (a su inicio, a donde iba o al cambio de contraseña)
  const enviar = async ({ identificador, password }) => {
    setErrorGeneral('')
    try {
      const data = await login(identificador, password)
      toast.success(data.msg)
    } catch (error) {
      setErrorGeneral(manejarErrorApi(error, setError))
    }
  }

  return (
    <PantallaAuth titulo="Iniciar sesión" descripcion="Ingresa con tu cuenta del sistema.">
      <form onSubmit={handleSubmit(enviar)} noValidate className="space-y-4">
        {errorGeneral && <Alerta>{errorGeneral}</Alerta>}
        <Campo
          label="Correo o usuario"
          autoComplete="username"
          autoFocus
          error={errors.identificador?.message}
          {...register('identificador')}
        />
        <Campo
          label="Contraseña"
          type="password"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password')}
        />
        <Boton type="submit" cargando={isSubmitting} className="w-full">
          {isSubmitting ? 'Ingresando…' : 'Ingresar'}
        </Boton>
        <p className="text-center text-sm">
          <Link to="/recuperar" className="text-marca-600 underline underline-offset-2 hover:text-marca-700">
            ¿Olvidaste tu contraseña?
          </Link>
        </p>
      </form>
    </PantallaAuth>
  )
}
