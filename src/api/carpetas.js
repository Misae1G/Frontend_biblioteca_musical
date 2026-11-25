import { api } from './cliente'
import { sinVacios } from './utilidades'

// GET /carpetas?q&activa&pagina&limite -> { carpetas (con cantidadObras), total, pagina, paginas }
export const listarCarpetas = async (params, signal) => {
  const { data } = await api.get('/carpetas', { params: sinVacios(params), signal })
  return data
}

// GET /carpetas/:id -> { carpeta, obras }
export const obtenerCarpeta = async (id, signal) => (await api.get(`/carpetas/${id}`, { signal })).data

// POST /carpetas -> { msg, carpeta }
export const crearCarpeta = async (datos) => (await api.post('/carpetas', datos)).data

// PUT /carpetas/:id -> { msg, carpeta }. Reemplaza: un dato opcional que no se envía se borra.
export const editarCarpeta = async (id, datos) => (await api.put(`/carpetas/${id}`, datos)).data

// PATCH /carpetas/:id/estado { activa } -> { msg, carpeta }
export const cambiarEstadoCarpeta = async (id, activa) => (await api.patch(`/carpetas/${id}/estado`, { activa })).data
