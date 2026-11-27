import { api } from './cliente'
import { sinVacios } from './utilidades'
import { hoyEcuador } from '../utils/fechas'

// GET /reportes/:tipo?formato=json&desde&hasta
// -> { tipo, titulo, filtros, resumen, secciones, generado }. desde/hasta (AAAA-MM-DD) solo aplican a préstamos e interpretaciones.
export const obtenerReporte = async (tipo, { desde, hasta } = {}, signal) => {
  const { data } = await api.get(`/reportes/${tipo}`, { params: sinVacios({ formato: 'json', desde, hasta }), signal })
  return data
}

// Nombre del archivo según Content-Disposition (en producción el backend debe exponer esa cabecera por CORS).
// Se limpia para que no pueda traer rutas ni caracteres raros.
export const nombreDeArchivo = (cabecera) => {
  const m = /filename="?([^";]+)"?/i.exec(cabecera ?? '')
  return m ? m[1].replace(/[^\w.-]/g, '_') : null
}

// Descarga el reporte generado por el backend (pdf o xlsx). Devuelve { blob, nombre }.
// El backend arma los archivos: el frontend no genera PDF ni Excel.
export const descargarReporte = async (tipo, formato, { desde, hasta } = {}) => {
  try {
    const respuesta = await api.get(`/reportes/${tipo}`, {
      params: sinVacios({ formato, desde, hasta }),
      responseType: 'blob',
      timeout: 120000, // los reportes con todas las obras tardan más que una consulta normal
    })
    const base = tipo === 'copia' ? 'copia-biblioteca' : `reporte-${tipo}`
    return {
      blob: respuesta.data,
      nombre: nombreDeArchivo(respuesta.headers['content-disposition']) ?? `${base}-${hoyEcuador()}.${formato}`,
    }
  } catch (error) {
    // Con responseType "blob" el error llega como Blob: se convierte para poder leer su mensaje
    if (error.response?.data instanceof Blob) {
      try {
        error.response.data = JSON.parse(await error.response.data.text())
      } catch {
        /* no era JSON: se deja como está */
      }
    }
    throw error
  }
}
