import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Alerta from '../../components/ui/Alerta'
import Boton from '../../components/ui/Boton'
import Campo from '../../components/ui/Campo'
import PantallaAuth from '../../layout/PantallaAuth'
import { api } from '../../api/cliente'
import { manejarErrorApi } from '../../utils/errores'

const esquema = z.object({
  correo: z
    .string()
    .trim()
    .min(1, 'Ingresa tu correo')
    .max(150, 'El correo no es válido')
    .regex(/^\S+@\S+\.\S+$/, 'El correo no es válido'),
})

export default function Recuperar() {
  const [errorGeneral, setErrorGeneral] = useState('')
  const [mensaje, setMensaje] = useState('')
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(esquema), defaultValues: { correo: '' } })

  const enviar = async ({ correo }) => {
    setErrorGeneral('')
    try {
      const { data } = await api.post('/auth/recuperar', { correo })
      setMensaje(data.msg) // el backend responde igual exista o no el correo
    } catch (error) {
      setErrorGeneral(manejarErrorApi(error, setError))
    }
  }

  return (
    <PantallaAuth
      titulo="Recuperar contraseña"
      descripcion="Solo para cuentas de administrador. Si eres usuario, pide a un administrador que restablezca tu contraseña."
    >
      {mensaje ? (
        <div className="space-y-4">
          <Alerta tipo="exito">{mensaje}</Alerta>
          <p className="text-sm text-tinta-suave">El enlace del correo vale 15 minutos.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit(enviar)} noValidate className="space-y-4">
          {errorGeneral && <Alerta>{errorGeneral}</Alerta>}
          <Campo
            label="Correo del administrador"
            type="email"
            autoComplete="email"
            autoFocus
            error={errors.correo?.message}
            {...register('correo')}
          />
          <Boton type="submit" cargando={isSubmitting} className="w-full">
            {isSubmitting ? 'Enviando…' : 'Enviar instrucciones'}
          </Boton>
        </form>
      )}
      <p className="mt-4 text-center text-sm">
        <Link to="/login" className="text-marca-600 underline underline-offset-2 hover:text-marca-700">
          Volver a iniciar sesión
        </Link>
      </p>
    </PantallaAuth>
  )
}
