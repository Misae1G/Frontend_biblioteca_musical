import { FiTool } from 'react-icons/fi'

// Marcador de los módulos que se construyen en los pasos siguientes
export default function EnConstruccion({ modulo }) {
  return (
    <div className="mx-auto mt-10 max-w-md rounded-lg border border-linea bg-superficie p-8 text-center">
      <FiTool className="mx-auto text-2xl text-laton" aria-hidden="true" />
      <h2 className="mt-3 text-lg font-semibold text-tinta">{modulo}</h2>
      <p className="mt-1 text-sm text-tinta-suave">Este módulo se construye en uno de los siguientes pasos.</p>
    </div>
  )
}
