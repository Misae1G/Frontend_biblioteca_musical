import { FiCalendar, FiCheckCircle, FiMinusCircle, FiXCircle } from 'react-icons/fi'
import Etiqueta from '../ui/Etiqueta'
import { ETIQUETA_ESTADO_INTERPRETACION } from '../../utils/constantes'

const ESTILOS = {
  programada: { tono: 'info', Icono: FiCalendar },
  interpretada: { tono: 'ok', Icono: FiCheckCircle },
  cancelada: { tono: 'neutro', Icono: FiXCircle },
  no_interpretada: { tono: 'aviso', Icono: FiMinusCircle },
}

// Estado de una interpretación (texto e icono: nunca solo color)
export default function EstadoInterpretacion({ estado }) {
  const estilo = ESTILOS[estado]
  if (!estilo) return null
  return (
    <Etiqueta tono={estilo.tono} Icono={estilo.Icono}>
      {ETIQUETA_ESTADO_INTERPRETACION[estado]}
    </Etiqueta>
  )
}
