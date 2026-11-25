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
