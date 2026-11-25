import { api } from './cliente'

// Quita los filtros vacíos para no enviar "?q=&rol=" al backend
const sinVacios = (params) => Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v != null))

// GET /usuarios -> { usuarios, total, pagina, paginas }
export const listarUsuarios = async (params, signal) => {
  const { data } = await api.get('/usuarios', { params: sinVacios(params), signal })
  return data
}

// POST /usuarios -> { msg, usuario, passwordTemporal }
export const crearUsuario = async (datos) => (await api.post('/usuarios', datos)).data

// PUT /usuarios/:id -> { msg, usuario } (solo cuentas con rol "usuario")
export const editarUsuario = async (id, datos) => (await api.put(`/usuarios/${id}`, datos)).data

// PATCH /usuarios/:id/estado -> { msg, usuario }
export const cambiarEstadoUsuario = async (id, activo) => (await api.patch(`/usuarios/${id}/estado`, { activo })).data

// POST /usuarios/:id/restablecer-password -> { msg, usuario, passwordTemporal }
export const restablecerPasswordUsuario = async (id) => (await api.post(`/usuarios/${id}/restablecer-password`)).data
