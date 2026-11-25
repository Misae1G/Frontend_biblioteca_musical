import { useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import Layout from './layout/Layout'
import { Raiz, RutaConSesion, RutaProtegida, RutaPublica } from './routes/Guardas'
import EnConstruccion from './pages/EnConstruccion'
import Usuarios from './pages/admin/Usuarios'
import CarpetaDetalle from './pages/biblioteca/carpetas/CarpetaDetalle'
import Carpetas from './pages/biblioteca/carpetas/Carpetas'
import Catalogos from './pages/biblioteca/catalogos/Catalogos'
import CambiarPassword from './pages/auth/CambiarPassword'
import Login from './pages/auth/Login'
import Recuperar from './pages/auth/Recuperar'
import Restablecer from './pages/auth/Restablecer'
import { useAuth } from './store/authStore'

// Módulos que se construyen en los siguientes pasos
const MODULOS_USUARIO = [
  ['obras', 'Obras'],
  ['prestamos', 'Préstamos'],
  ['interpretaciones', 'Interpretaciones'],
  ['reportes', 'Reportes'],
]

export default function App() {
  const iniciar = useAuth((s) => s.iniciar)

  useEffect(() => {
    iniciar()
  }, [iniciar])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Raiz />} />

        <Route element={<RutaPublica />}>
          <Route path="/login" element={<Login />} />
          <Route path="/recuperar" element={<Recuperar />} />
        </Route>
        {/* El enlace del correo funciona aunque ya haya una sesión abierta */}
        <Route path="/restablecer/:token" element={<Restablecer />} />

        <Route element={<RutaConSesion />}>
          <Route path="/cambiar-password" element={<CambiarPassword />} />
        </Route>

        <Route element={<RutaProtegida rol="usuario" />}>
          <Route element={<Layout />}>
            <Route path="/carpetas" element={<Carpetas />} />
            <Route path="/carpetas/:id" element={<CarpetaDetalle />} />
            <Route path="/catalogos" element={<Catalogos />} />
            {MODULOS_USUARIO.map(([ruta, nombre]) => (
              <Route key={ruta} path={`/${ruta}/*`} element={<EnConstruccion modulo={nombre} />} />
            ))}
          </Route>
        </Route>

        <Route element={<RutaProtegida rol="administrador" />}>
          <Route element={<Layout />}>
            <Route path="/usuarios" element={<Usuarios />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <ToastContainer position="top-right" autoClose={4000} newestOnTop closeOnClick pauseOnFocusLoss={false} />
    </BrowserRouter>
  )
}
