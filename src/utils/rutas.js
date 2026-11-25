// Pantalla de inicio según el rol: el administrador solo gestiona cuentas
export const rutaInicio = (usuario) => (usuario?.rol === 'administrador' ? '/usuarios' : '/obras')

// A dónde ir justo después de iniciar sesión
export const destinoTrasLogin = (usuario, desde) => {
  if (usuario.debeCambiarPassword) return '/cambiar-password'
  const destino = desde?.pathname
  if (destino && destino !== '/login' && destino !== '/') return `${destino}${desde.search ?? ''}`
  return rutaInicio(usuario)
}
