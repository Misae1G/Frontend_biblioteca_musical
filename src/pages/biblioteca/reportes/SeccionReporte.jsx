import { formatearValor, planDeSeccion } from '../../../utils/reportes'
import GraficoBarras from './GraficoBarras'

// Una sección del reporte: gráfico (si aplica) y tabla (si no es demasiado larga)
export default function SeccionReporte({ seccion, id }) {
  const titulo = seccion.titulo || 'Detalle'
  const plan = planDeSeccion(seccion)
  const total = seccion.filas.length

  return (
    <section aria-labelledby={id} className="space-y-3 rounded-lg border border-linea bg-superficie p-5">
      <h3 id={id} className="text-lg font-semibold text-tinta">
        {titulo} <span className="text-sm font-normal text-tinta-suave">({total.toLocaleString('es-EC')} {total === 1 ? 'fila' : 'filas'})</span>
      </h3>

      {total === 0 && <p className="text-sm text-tinta-suave">Sin datos para este reporte.</p>}

      {plan.grafico && (
        <>
          <GraficoBarras titulo={titulo} etiquetaValor={plan.grafico.etiquetaValor} datos={plan.grafico.datos} />
          {plan.truncado && (
            <p className="text-sm text-tinta-suave">
              Se grafican las {plan.grafico.datos.length} primeras de {total.toLocaleString('es-EC')}.
            </p>
          )}
        </>
      )}

      {total > 0 && plan.tabla && (
        <div className="overflow-x-auto rounded-md border border-linea">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">{titulo}</caption>
            <thead className="border-b border-linea bg-hundido text-tinta-suave">
              <tr>
                {seccion.columnas.map((c) => (
                  <th key={c.clave} scope="col" className={`px-3 py-2 font-medium ${c.numero ? 'text-right' : ''}`}>
                    {c.etiqueta}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-linea">
              {seccion.filas.map((fila, n) => (
                <tr key={n}>
                  {seccion.columnas.map((c) => (
                    <td key={c.clave} className={`px-3 py-2 ${c.numero ? 'text-right tabular-nums' : ''}`}>
                      {formatearValor(fila[c.clave], c.numero)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {total > 0 && !plan.tabla && (
        <p className="rounded-md bg-info-fondo px-3 py-2 text-sm text-info">
          Esta sección tiene {total.toLocaleString('es-EC')} filas: el detalle completo está en la descarga (PDF o Excel).
        </p>
      )}
    </section>
  )
}
