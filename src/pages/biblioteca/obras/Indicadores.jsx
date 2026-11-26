import { FiAlertTriangle, FiEye, FiSlash } from 'react-icons/fi'
import Etiqueta from '../../../components/ui/Etiqueta'

// Marcas de control de una obra. Cada una lleva texto e icono (nunca solo color).
export default function Indicadores({ obra }) {
  if (!obra.pendienteDeCompletar && !obra.requiereRevision && obra.activa) return null
  return (
    <span className="flex flex-wrap items-center gap-1.5">
      {obra.pendienteDeCompletar && (
        <Etiqueta tono="aviso" Icono={FiAlertTriangle}>Pendiente de completar</Etiqueta>
      )}
      {obra.requiereRevision && (
        <Etiqueta tono="info" Icono={FiEye}>Revisar</Etiqueta>
      )}
      {!obra.activa && (
        <Etiqueta tono="neutro" Icono={FiSlash}>Inactiva</Etiqueta>
      )}
    </span>
  )
}
