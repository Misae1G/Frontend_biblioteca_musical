const formatoFechaHora = new Intl.DateTimeFormat('es-EC', {
  timeZone: 'America/Guayaquil',
  dateStyle: 'medium',
  timeStyle: 'short',
})

// Momentos exactos (último acceso, creación): se muestran en hora de Ecuador
export const formatearFechaHora = (iso, vacio = '—') => (iso ? formatoFechaHora.format(new Date(iso)) : vacio)

// Fechas de solo día: el backend las guarda como "2026-11-18T00:00:00.000Z".
// Se toman los primeros 10 caracteres; con new Date() en Ecuador (UTC-5) saldría un día antes.
export const fechaDia = (iso) => (iso ? String(iso).slice(0, 10) : '')

// Duración en segundos -> "4:05" o "1:02:30"
export const formatearDuracion = (segundos) => {
  if (segundos == null) return ''
  const h = Math.floor(segundos / 3600)
  const m = Math.floor((segundos % 3600) / 60)
  const s = String(segundos % 60).padStart(2, '0')
  return h ? `${h}:${String(m).padStart(2, '0')}:${s}` : `${m}:${s}`
}

// Fecha de hoy (AAAA-MM-DD) en Ecuador, para valores por defecto de <input type="date">
export const hoyEcuador = () => new Date().toLocaleDateString('en-CA', { timeZone: 'America/Guayaquil' })

// Suma días a una fecha AAAA-MM-DD sin pasar por la zona horaria del navegador
export const sumarDias = (dia, n) => new Date(Date.parse(`${dia}T00:00:00.000Z`) + n * 86400000).toISOString().slice(0, 10)

// "2026-11-18" -> "miércoles, 18 de noviembre"
export const etiquetaDia = (dia) =>
  new Date(`${dia}T00:00:00.000Z`).toLocaleDateString('es-EC', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' })
