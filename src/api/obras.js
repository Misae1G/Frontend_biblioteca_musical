import { api } from './cliente'
import { sinVacios } from './utilidades'

// GET /obras?... -> { obras, total, pagina, paginas }
export const listarObras = async (params, signal) => {
  const { data } = await api.get('/obras', { params: sinVacios(params), signal })
  return data
}

// GET /obras/:id -> { obra, adaptaciones, otrasAdaptaciones, mosaicosRelacionados, prestamos, interpretaciones, vecesInterpretada }
export const obtenerObra = async (id, signal) => (await api.get(`/obras/${id}`, { signal })).data

// PATCH /obras/:id/estado { activa } -> { msg, obra }
export const cambiarEstadoObra = async (id, activa) => (await api.patch(`/obras/${id}/estado`, { activa })).data

// POST /obras -> { msg, obra }
export const crearObra = async (datos) => (await api.post('/obras', datos)).data

// PUT /obras/:id -> { msg, obra }. Reemplaza: un dato opcional que no se envía se borra.
export const editarObra = async (id, datos) => (await api.put(`/obras/${id}`, datos)).data

// Documentos digitales (enlaces). Respuestas: { msg, documento, documentos } o { msg, documentos }
export const agregarDocumento = async (id, datos) => (await api.post(`/obras/${id}/documentos`, datos)).data
export const editarDocumento = async (id, docId, datos) => (await api.put(`/obras/${id}/documentos/${docId}`, datos)).data
export const eliminarDocumento = async (id, docId) => (await api.delete(`/obras/${id}/documentos/${docId}`)).data
