import { FiLoader } from 'react-icons/fi'

export default function Cargando({ texto = 'Cargando…', pantallaCompleta = false }) {
  return (
    <div
      role="status"
      className={`flex items-center justify-center gap-2 text-tinta-suave ${pantallaCompleta ? 'min-h-screen' : 'py-10'}`}
    >
      <FiLoader className="animate-spin" aria-hidden="true" />
      <span>{texto}</span>
    </div>
  )
}
