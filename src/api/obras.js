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
