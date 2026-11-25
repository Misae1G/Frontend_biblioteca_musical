import { useRef } from 'react'

// Pestañas accesibles (flechas, Inicio y Fin cambian de pestaña).
// El contenido debe ir dentro de <PanelPestana id={activa}>.
export default function Pestanas({ pestanas, activa, onCambiar, etiqueta }) {
  const botones = useRef({})

  const alTeclear = (e, indice) => {
    const total = pestanas.length
    const destino = { ArrowRight: (indice + 1) % total, ArrowLeft: (indice - 1 + total) % total, Home: 0, End: total - 1 }[e.key]
    if (destino === undefined) return
    e.preventDefault()
    const { id } = pestanas[destino]
    onCambiar(id)
    botones.current[id]?.focus()
  }

  return (
    <div role="tablist" aria-label={etiqueta} className="flex gap-1 overflow-x-auto border-b border-linea">
      {pestanas.map(({ id, texto }, indice) => {
        const seleccionada = id === activa
        return (
          <button
            key={id}
            ref={(el) => {
              botones.current[id] = el
            }}
            type="button"
            role="tab"
            id={`pestana-${id}`}
            aria-selected={seleccionada}
            aria-controls={`panel-${id}`}
            tabIndex={seleccionada ? 0 : -1}
            onClick={() => onCambiar(id)}
            onKeyDown={(e) => alTeclear(e, indice)}
            className={`-mb-px shrink-0 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
              seleccionada
                ? 'border-marca-600 text-marca-700'
                : 'border-transparent text-tinta-suave hover:border-linea hover:text-tinta'
            }`}
          >
            {texto}
          </button>
        )
      })}
    </div>
  )
}

export function PanelPestana({ id, children }) {
  return (
    <div role="tabpanel" id={`panel-${id}`} aria-labelledby={`pestana-${id}`} className="pt-5">
      {children}
    </div>
  )
}
