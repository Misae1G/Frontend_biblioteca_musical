const TONOS = {
  neutro: 'bg-hundido text-tinta-suave',
  marca: 'bg-marca-100 text-marca-700',
  laton: 'bg-laton-fondo text-laton-texto',
  ok: 'bg-ok-fondo text-ok',
  info: 'bg-info-fondo text-info',
  aviso: 'bg-aviso-fondo text-aviso',
  peligro: 'bg-peligro-fondo text-peligro',
}

// Insignia de estado: el significado siempre va en el texto (y, si se quiere, un ícono), nunca solo en el color
export default function Etiqueta({ tono = 'neutro', Icono, children }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${TONOS[tono]}`}>
      {Icono && <Icono aria-hidden="true" />}
      {children}
    </span>
  )
}
