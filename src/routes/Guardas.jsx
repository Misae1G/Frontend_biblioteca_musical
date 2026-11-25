import { Navigate, Outlet, useLocation } from 'react-router-dom'
import Cargando from '../components/ui/Cargando'
import { useAuth } from '../store/authStore'
import { destinoTrasLogin, rutaInicio } from '../utils/rutas'

// Solo con sesión; con contraseña temporal solo se permite cambiarla
export function RutaProtegida({ rol }) {
  const { usuario, verificando } = useAuth()
  const location = useLocation()

  if (verificando) return <Cargando pantallaCompleta />
  if (!usuario) return <Navigate to="/login" replace state={{ desde: location }} />
  if (usuario.debeCambiarPassword) return <Navigate to="/cambiar-password" replace />
  if (rol && usuario.rol !== rol) return <Navigate to={rutaInicio(usuario)} replace />
  return <Outlet />
}

// Solo con sesión (para el cambio de contraseña, también el obligatorio)
export function RutaConSesion() {
  const { usuario, verificando } = useAuth()
  const location = useLocation()

  if (verificando) return <Cargando pantallaCompleta />
  if (!usuario) return <Navigate to="/login" replace state={{ desde: location }} />
  return <Outlet />
}

// Pantallas para quien aún no inició sesión: si ya la tiene, se le lleva a su inicio
export function RutaPublica() {
  const { usuario, verificando } = useAuth()
  const location = useLocation()

  if (verificando) return <Cargando pantallaCompleta />
  if (usuario) return <Navigate to={destinoTrasLogin(usuario, location.state?.desde)} replace />
  return <Outlet />
}

export function Raiz() {
  const { usuario, verificando } = useAuth()
  if (verificando) return <Cargando pantallaCompleta />
  return <Navigate to={usuario ? destinoTrasLogin(usuario) : '/login'} replace />
}
