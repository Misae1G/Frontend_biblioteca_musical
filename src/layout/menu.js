import { FiArchive, FiBarChart2, FiCalendar, FiLayers, FiMusic, FiSend, FiUsers } from 'react-icons/fi'

// Opciones del menú lateral por rol. El administrador solo gestiona cuentas.
export const MENU = {
  usuario: [
    { ruta: '/obras', texto: 'Obras', Icono: FiMusic },
    { ruta: '/carpetas', texto: 'Carpetas', Icono: FiArchive },
    { ruta: '/catalogos', texto: 'Catálogos', Icono: FiLayers },
    { ruta: '/prestamos', texto: 'Préstamos', Icono: FiSend },
    { ruta: '/interpretaciones', texto: 'Interpretaciones', Icono: FiCalendar },
    { ruta: '/reportes', texto: 'Reportes', Icono: FiBarChart2 },
  ],
  administrador: [{ ruta: '/usuarios', texto: 'Usuarios', Icono: FiUsers }],
}

export const ETIQUETA_ROL = { administrador: 'Administrador', usuario: 'Usuario' }
