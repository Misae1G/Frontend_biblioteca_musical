import { api } from './cliente'
import { sinVacios } from './utilidades'

// GET /catalogos?tipo&familia&activo -> { catalogos } (sin paginación, ordenado por nombre)
export const listarCatalogos = async (params, signal) => {
  const { data } = await api.get('/catalogos', { params: sinVacios(params), signal })
  return data
}

// POST /catalogos { tipo, nombre, familia? } -> { msg, catalogo }. "familia" solo para instrumentos.
export const crearCatalogo = async (datos) => (await api.post('/catalogos', datos)).data

// PUT /catalogos/:id { nombre } -> { msg, catalogo }
export const renombrarCatalogo = async (id, nombre) => (await api.put(`/catalogos/${id}`, { nombre })).data

// PATCH /catalogos/:id/estado { activo } -> { msg, catalogo }
export const cambiarEstadoCatalogo = async (id, activo) => (await api.patch(`/catalogos/${id}/estado`, { activo })).data
