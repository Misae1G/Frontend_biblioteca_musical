import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

// Los atributos SVG no entienden var(--color-...): se usan los mismos valores de la paleta
const COLOR_BARRA = '#741f2d' // marca-600
const COLOR_TEXTO = '#5f5a60' // tinta-suave
const COLOR_LINEA = '#e4dfd8' // linea

// Barras horizontales (los nombres largos de obras y autores caben mejor así).
// El gráfico no es accesible para lector de pantalla: la tabla o el resumen de texto lo acompañan.
export default function GraficoBarras({ titulo, etiquetaValor, datos }) {
  const alto = datos.length * 34 + 50
  const descripcion = `Gráfico de barras: ${titulo}. ${datos.map((d) => `${d.nombre}: ${d.valor}`).join('; ')}`

  return (
    <div role="img" aria-label={descripcion} style={{ height: alto }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={datos} layout="vertical" margin={{ top: 4, right: 24, bottom: 4, left: 8 }}>
          <CartesianGrid stroke={COLOR_LINEA} horizontal={false} />
          <XAxis type="number" allowDecimals={false} stroke={COLOR_TEXTO} tick={{ fontSize: 12 }} />
          <YAxis
            type="category"
            dataKey="nombre"
            width={170}
            stroke={COLOR_TEXTO}
            tick={{ fontSize: 12 }}
            tickFormatter={(v) => (v.length > 26 ? `${v.slice(0, 25)}…` : v)}
          />
          <Tooltip formatter={(v) => [Number(v).toLocaleString('es-EC'), etiquetaValor]} cursor={{ fill: '#f3efe9' }} />
          <Bar dataKey="valor" fill={COLOR_BARRA} radius={[0, 3, 3, 0]} isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
