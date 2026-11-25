import { FiCheckCircle, FiMusic, FiSend } from 'react-icons/fi'
import Etiqueta from '../ui/Etiqueta'
import { ETIQUETA_DISPONIBILIDAD } from '../../utils/constantes'

const ESTILOS = {
  disponible: { tono: 'ok', Icono: FiCheckCircle },
  en_interpretacion: { tono: 'info', Icono: FiMusic },
  prestada_fisicamente: { tono: 'aviso', Icono: FiSend },
  en_interpretacion_y_prestada: { tono: 'aviso', Icono: FiSend },
}

// Estado de disponibilidad de una obra (campo `estadoDisponibilidad` del backend)
export default function Disponibilidad({ estado }) {
  const estilo = ESTILOS[estado]
  if (!estilo) return null
  return (
    <Etiqueta tono={estilo.tono} Icono={estilo.Icono}>
      {ETIQUETA_DISPONIBILIDAD[estado]}
    </Etiqueta>
  )
}
