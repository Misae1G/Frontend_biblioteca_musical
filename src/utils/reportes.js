// Lógica pura para mostrar un reporte (JSON del backend) como gráficos y tablas

export const MAX_FILAS_TABLA = 50 // más filas que esto solo se ven en la descarga
export const MAX_FILAS_GRAFICO = 30 // una sección completa de hasta 30 filas se grafica entera
export const MAX_BARRAS_RANKING = 12 // si es más larga pero viene ordenada de mayor a menor, se grafican las primeras

const ordenadaDeMayorAMenor = (filas, clave) => filas.every((f, n) => n === 0 || filas[n - 1][clave] >= f[clave])

// Decide cómo mostrar una sección: { tabla, grafico, truncado }
// - tabla: se muestra completa si no es muy larga
// - grafico: { clave, etiqueta, datos } con la primera columna de texto y la primera numérica; null si no aplica
export const planDeSeccion = (seccion) => {
  const { columnas, filas } = seccion
  const etiqueta = columnas.find((c) => !c.numero)
  const numerica = columnas.find((c) => c.numero)
  const plan = { tabla: filas.length <= MAX_FILAS_TABLA, grafico: null, truncado: false }
  if (!etiqueta || !numerica || filas.length < 2) return plan

  let usadas = null
  if (filas.length <= MAX_FILAS_GRAFICO) usadas = filas
  else if (ordenadaDeMayorAMenor(filas, numerica.clave)) {
    usadas = filas.slice(0, MAX_BARRAS_RANKING)
    plan.truncado = true
  }
  if (usadas) {
    plan.grafico = {
      clave: numerica.clave,
      etiquetaValor: numerica.etiqueta,
      datos: usadas.map((f) => ({ nombre: String(f[etiqueta.clave] || '(sin dato)'), valor: Number(f[numerica.clave]) || 0 })),
    }
  }
  return plan
}

export const formatearValor = (valor, numero) =>
  numero && typeof valor === 'number' ? valor.toLocaleString('es-EC') : valor === '' || valor == null ? '—' : String(valor)
