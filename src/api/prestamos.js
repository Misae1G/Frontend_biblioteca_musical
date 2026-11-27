import { api } from './cliente'
import { sinVacios } from './utilidades'

// GET /prestamos?q&tipoEntrega&estado&desde&hasta&obra&pagina&limite -> { prestamos, total, pagina, paginas }
export const listarPrestamos = async (params, signal) => {
  const { data } = await api.get('/prestamos', { params: sinVacios(params), signal })
  return data
}

// GET /prestamos/:id -> { prestamo }
export const obtenerPrestamo = async (id, signal) => (await api.get(`/prestamos/${id}`, { signal })).data

// POST /prestamos -> { msg, prestamo }
export const crearPrestamo = async (datos) => (await api.post('/prestamos', datos)).data

// PUT /prestamos/:id -> { msg, prestamo }. La obra y el tipo de entrega no se corrigen.
export const editarPrestamo = async (id, datos) => (await api.put(`/prestamos/${id}`, datos)).data

// POST /prestamos/:id/devolucion -> { msg, prestamo } (solo físicos, una vez)
export const registrarDevolucion = async (id, datos) => (await api.post(`/prestamos/${id}/devolucion`, datos)).data

// PUT /prestamos/:id/devolucion -> { msg, prestamo }
export const editarDevolucion = async (id, datos) => (await api.put(`/prestamos/${id}/devolucion`, datos)).data
