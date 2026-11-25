import axios from 'axios'

// Una sola instancia para toda la aplicación.
// Desarrollo: '/api' (proxy de Vite). Producción: VITE_API_URL (URL completa, con /api).
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true, // la sesión viaja en una cookie httpOnly: el frontend nunca toca el token
  timeout: 30000,
})

// El store de autenticación se registra aquí (evita una importación circular)
let alExpirarSesion = null
export const registrarAlExpirarSesion = (funcion) => {
  alExpirarSesion = funcion
}

// En estas rutas un 401 es un resultado normal (sin sesión o credenciales incorrectas)
const RUTAS_SIN_AVISO = ['/auth/me', '/auth/login', '/auth/recuperar', '/auth/restablecer']

api.interceptors.response.use(
  (respuesta) => respuesta,
  (error) => {
    const url = error.config?.url ?? ''
    if (error.response?.status === 401 && !RUTAS_SIN_AVISO.some((ruta) => url.startsWith(ruta))) {
      alExpirarSesion?.(error.response.data?.msg)
    }
    return Promise.reject(error)
  }
)
