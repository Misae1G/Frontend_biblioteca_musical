import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { FiKey, FiLogOut, FiMenu, FiX } from 'react-icons/fi'
import { useAuth } from '../store/authStore'
import { ETIQUETA_ROL, MENU } from './menu'

export default function Layout() {
  const usuario = useAuth((s) => s.usuario)
  const logout = useAuth((s) => s.logout)
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [abierto, setAbierto] = useState(false)

  const opciones = MENU[usuario.rol] ?? []
  const titulo = opciones.find((o) => pathname.startsWith(o.ruta))?.texto ?? 'Biblioteca Musical'

  // El menú móvil se cierra al navegar y con Escape
  useEffect(() => setAbierto(false), [pathname])
  useEffect(() => {
    if (!abierto) return undefined
    const alTeclear = (e) => e.key === 'Escape' && setAbierto(false)
    document.addEventListener('keydown', alTeclear)
    return () => document.removeEventListener('keydown', alTeclear)
  }, [abierto])

  const salir = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  const claseEnlace = ({ isActive }) =>
    `flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
      isActive ? 'bg-white/15 text-white' : 'text-marca-100 hover:bg-white/10 hover:text-white'
    }`

  return (
    <div className="flex min-h-screen bg-papel">
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-50 focus:rounded-md focus:bg-superficie focus:px-3 focus:py-2 focus:text-marca-700"
      >
        Saltar al contenido
      </a>

      {abierto && (
        <button
          type="button"
          aria-label="Cerrar menú"
          onClick={() => setAbierto(false)}
          className="fixed inset-0 z-30 bg-tinta/50 lg:hidden"
        />
      )}

      <aside
        id="menu-lateral"
        aria-label="Menú principal"
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-marca-700 text-white transition-transform lg:static lg:translate-x-0 lg:visible ${
          abierto ? 'translate-x-0' : 'invisible -translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-5 py-5">
          <div>
            <p className="font-titulo text-lg font-semibold leading-tight">Biblioteca Musical</p>
            <p className="text-xs tracking-widest text-marca-100">OSNE</p>
          </div>
          <button
            type="button"
            onClick={() => setAbierto(false)}
            aria-label="Cerrar menú"
            className="rounded-md p-2 text-marca-100 hover:bg-white/10 lg:hidden"
          >
            <FiX aria-hidden="true" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3" aria-label="Secciones">
          {opciones.map(({ ruta, texto, Icono }) => (
            <NavLink key={ruta} to={ruta} className={claseEnlace}>
              <Icono aria-hidden="true" />
              {texto}
            </NavLink>
          ))}
        </nav>

        <div className="space-y-1 border-t border-white/15 px-3 py-4">
          <div className="px-3 pb-2">
            <p className="truncate text-sm font-medium">{usuario.nombre}</p>
            <p className="text-xs text-marca-100">{ETIQUETA_ROL[usuario.rol]}</p>
          </div>
          <Link
            to="/cambiar-password"
            className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-marca-100 hover:bg-white/10 hover:text-white"
          >
            <FiKey aria-hidden="true" />
            Cambiar contraseña
          </Link>
          <button
            type="button"
            onClick={salir}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm text-marca-100 hover:bg-white/10 hover:text-white"
          >
            <FiLogOut aria-hidden="true" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-3 border-b border-linea bg-superficie px-4 py-3 lg:px-8">
          <button
            type="button"
            onClick={() => setAbierto(true)}
            aria-label="Abrir menú"
            aria-expanded={abierto}
            aria-controls="menu-lateral"
            className="rounded-md p-2 text-tinta hover:bg-hundido lg:hidden"
          >
            <FiMenu aria-hidden="true" />
          </button>
          <h1 className="flex-1 truncate text-xl font-semibold text-marca-700">{titulo}</h1>
          <p className="hidden text-sm text-tinta-suave sm:block">{usuario.nombre}</p>
        </header>

        <main id="contenido" tabIndex={-1} className="flex-1 px-4 py-6 focus:outline-none lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
