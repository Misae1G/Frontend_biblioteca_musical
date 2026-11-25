import { create } from 'zustand'
import { toast } from 'react-toastify'
import { api, registrarAlExpirarSesion } from '../api/cliente'

export const useAuth = create((set) => ({
  usuario: null,
  verificando: true, // true mientras se consulta si ya hay una sesión abierta

  // Al abrir la aplicación: ¿hay sesión? (la cookie la maneja el navegador)
  iniciar: async () => {
    try {
      const { data } = await api.get('/auth/me')
      set({ usuario: data.usuario })
    } catch {
      set({ usuario: null })
    } finally {
      set({ verificando: false })
    }
  },

  login: async (identificador, password) => {
    const { data } = await api.post('/auth/login', { identificador, password })
    set({ usuario: data.usuario })
    return data
  },

  logout: async () => {
    try {
      await api.post('/auth/logout')
    } catch {
      // aunque falle la red, se cierra la sesión en este equipo
    }
    set({ usuario: null })
  },

  // El backend devuelve una cookie nueva y el usuario actualizado
  cambiarPassword: async (passwordActual, passwordNueva) => {
    const { data } = await api.post('/auth/cambiar-password', { passwordActual, passwordNueva })
    set({ usuario: data.usuario })
    return data
  },

  limpiar: () => set({ usuario: null }),
}))

// Ante un 401 con la sesión abierta: se limpia y las rutas protegidas llevan al login
registrarAlExpirarSesion((mensaje) => {
  if (!useAuth.getState().usuario) return
  useAuth.getState().limpiar()
  toast.info(mensaje ?? 'Tu sesión terminó. Inicia sesión de nuevo', { toastId: 'sesion-expirada' })
})
