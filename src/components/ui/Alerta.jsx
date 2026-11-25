import { FiAlertCircle, FiAlertTriangle, FiCheckCircle, FiInfo } from 'react-icons/fi'

const TIPOS = {
  error: { clases: 'border-peligro/30 bg-peligro-fondo text-peligro', Icono: FiAlertCircle, rol: 'alert' },
  aviso: { clases: 'border-aviso/30 bg-aviso-fondo text-aviso', Icono: FiAlertTriangle, rol: 'status' },
  exito: { clases: 'border-ok/30 bg-ok-fondo text-ok', Icono: FiCheckCircle, rol: 'status' },
  info: { clases: 'border-info/30 bg-info-fondo text-info', Icono: FiInfo, rol: 'status' },
}

export default function Alerta({ tipo = 'error', className = '', children }) {
  const { clases, Icono, rol } = TIPOS[tipo]
  return (
    <div role={rol} className={`flex items-start gap-2 rounded-md border px-3 py-2 text-sm ${clases} ${className}`}>
      <Icono className="mt-0.5 shrink-0" aria-hidden="true" />
      <div>{children}</div>
    </div>
  )
}
