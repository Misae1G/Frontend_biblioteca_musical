import { FiCheckCircle, FiClock, FiRotateCcw } from 'react-icons/fi'
import Etiqueta from '../ui/Etiqueta'
import { ETIQUETA_ESTADO_PRESTAMO } from '../../utils/constantes'

const ESTILOS = {
  pendiente: { tono: 'aviso', Icono: FiClock },
  devuelto: { tono: 'ok', Icono: FiRotateCcw },
  finalizado: { tono: 'neutro', Icono: FiCheckCircle },
}

// Estado de un préstamo: pendiente (físico sin devolver), devuelto (físico) o finalizado (digital)
export default function EstadoPrestamo({ estado }) {
  const estilo = ESTILOS[estado]
  if (!estilo) return null
  return (
    <Etiqueta tono={estilo.tono} Icono={estilo.Icono}>
      {ETIQUETA_ESTADO_PRESTAMO[estado]}
    </Etiqueta>
  )
}
