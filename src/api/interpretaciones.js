import { api } from './cliente'
import { sinVacios } from './utilidades'

// GET /interpretaciones?q&estado&desde&hasta&obra&pagina&limite -> { interpretaciones, total, pagina, paginas }
export const listarInterpretaciones = async (params, signal) => {
  const { data } = await api.get('/interpretaciones', { params: sinVacios(params), signal })
  return data
}

// GET /interpretaciones/semana?fecha=AAAA-MM-DD (lunes a domingo; sin fecha, la semana actual)
// -> { desde, hasta, interpretaciones }
export const obtenerSemana = async (fecha, signal) => {
  const { data } = await api.get('/interpretaciones/semana', { params: sinVacios({ fecha }), signal })
  return data
}

// GET /interpretaciones/:id -> { interpretacion }
export const obtenerInterpretacion = async (id, signal) => (await api.get(`/interpretaciones/${id}`, { signal })).data

// POST /interpretaciones -> { msg, interpretacion } (nace "programada")
export const crearInterpretacion = async (datos) => (await api.post('/interpretaciones', datos)).data

// PUT /interpretaciones/:id -> { msg, interpretacion }. La obra no se corrige.
export const editarInterpretacion = async (id, datos) => (await api.put(`/interpretaciones/${id}`, datos)).data

// PATCH /interpretaciones/:id/estado { estado } -> { msg, interpretacion }
export const cambiarEstadoInterpretacion = async (id, estado) =>
  (await api.patch(`/interpretaciones/${id}/estado`, { estado })).data
