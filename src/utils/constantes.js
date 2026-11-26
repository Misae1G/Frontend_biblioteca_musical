// Textos para mostrar los valores fijos del backend

export const ETIQUETA_REGISTRO = {
  original: 'Original',
  adaptacion: 'Adaptación',
  mosaico: 'Mosaico',
}

export const ETIQUETA_DISPONIBILIDAD = {
  disponible: 'Disponible',
  en_interpretacion: 'En interpretación',
  prestada_fisicamente: 'Prestada físicamente',
  en_interpretacion_y_prestada: 'En interpretación y prestada',
}

export const ETIQUETA_PROCEDENCIA = {
  ecuatoriana: 'Ecuatoriana',
  universal: 'Universal',
}

export const ETIQUETA_ESTADO_PRESTAMO = {
  pendiente: 'Pendiente',
  devuelto: 'Devuelto',
  finalizado: 'Finalizado',
}

export const ETIQUETA_TIPO_ENTREGA = {
  fisico: 'Físico',
  digital: 'Digital',
}

export const ETIQUETA_ESTADO_INTERPRETACION = {
  programada: 'Programada',
  interpretada: 'Interpretada',
  cancelada: 'Cancelada',
  no_interpretada: 'No interpretada',
}

// Datos que el backend exige para dar una obra por completa (el autor no se exige en mosaicos)
export const faltantesDeObra = (obra) => {
  const requeridos = [
    ['titulo', 'título'],
    ['tipoRegistro', 'tipo de registro'],
    ['carpeta', 'carpeta'],
    ['tipoObra', 'tipo de obra'],
    ['procedencia', 'procedencia'],
    ['agrupacion', 'agrupación'],
  ]
  if (obra.tipoRegistro !== 'mosaico') requeridos.push(['autor', 'autor'])
  return requeridos.filter(([campo]) => !obra[campo]).map(([, etiqueta]) => etiqueta)
}
