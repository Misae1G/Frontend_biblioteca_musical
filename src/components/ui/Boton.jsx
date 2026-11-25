import { FiLoader } from 'react-icons/fi'

const VARIANTES = {
  primario: 'bg-marca-600 text-white hover:bg-marca-700',
  secundario: 'border border-linea bg-superficie text-tinta hover:bg-hundido',
  peligro: 'bg-peligro text-white hover:opacity-90',
  peligroSuave: 'text-peligro hover:bg-peligro-fondo',
  fantasma: 'text-marca-600 hover:bg-marca-50',
}

const TAMANOS = {
  normal: 'min-h-10 px-4 py-2',
  pequeno: 'min-h-8 px-2.5 py-1',
}

export default function Boton({
  variante = 'primario',
  tamano = 'normal',
  cargando = false,
  disabled = false,
  type = 'button',
  className = '',
  children,
  ...resto
}) {
  return (
    <button
      type={type}
      disabled={disabled || cargando}
      aria-busy={cargando || undefined}
      className={`inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${TAMANOS[tamano]} ${VARIANTES[variante]} ${className}`}
      {...resto}
    >
      {cargando && <FiLoader className="animate-spin" aria-hidden="true" />}
      {children}
    </button>
  )
}
