import Boton from './Boton'
import Modal from './Modal'

// Confirmación antes de una acción que cambia datos (desactivar, restablecer, etc.)
export default function ConfirmDialog({
  abierto,
  titulo,
  children,
  textoConfirmar = 'Confirmar',
  variante = 'primario',
  cargando = false,
  onConfirmar,
  onCerrar,
}) {
  return (
    <Modal abierto={abierto} onCerrar={onCerrar} titulo={titulo} bloqueado={cargando}>
      <div className="space-y-2 text-sm text-tinta-suave">{children}</div>
      <div className="mt-6 flex justify-end gap-2">
        <Boton variante="secundario" onClick={onCerrar} disabled={cargando}>
          Cancelar
        </Boton>
        <Boton variante={variante} onClick={onConfirmar} cargando={cargando}>
          {textoConfirmar}
        </Boton>
      </div>
    </Modal>
  )
}
