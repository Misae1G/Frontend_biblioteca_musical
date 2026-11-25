import { useState } from 'react'
import { toast } from 'react-toastify'
import { cambiarEstadoCarpeta } from '../../../api/carpetas'
import ConfirmDialog from '../../../components/ui/ConfirmDialog'
import { mensajeDeError } from '../../../utils/errores'

// Confirmación para activar/inactivar una carpeta. Se usa en el listado y en el detalle.
// Si el backend la rechaza (p. ej. tiene obras activas) muestra su mensaje en un aviso.
export default function DialogoEstadoCarpeta({ carpeta, onCambiado, onCerrar }) {
  const [procesando, setProcesando] = useState(false)
  const inactivando = carpeta?.activa

  const confirmar = async () => {
    setProcesando(true)
    try {
      await cambiarEstadoCarpeta(carpeta._id, !carpeta.activa)
      toast.success(inactivando ? 'Carpeta inactivada' : 'Carpeta activada')
      onCambiado()
    } catch (e) {
      toast.error(mensajeDeError(e))
    } finally {
      setProcesando(false)
      onCerrar()
    }
  }

  return (
    <ConfirmDialog
      abierto={Boolean(carpeta)}
      titulo={inactivando ? 'Inactivar carpeta' : 'Activar carpeta'}
      textoConfirmar={inactivando ? 'Inactivar' : 'Activar'}
      variante={inactivando ? 'peligro' : 'primario'}
      cargando={procesando}
      onConfirmar={confirmar}
      onCerrar={onCerrar}
    >
      {inactivando ? (
        <>
          <p>
            ¿Inactivar la carpeta <strong className="text-tinta">{carpeta?.numero}</strong>?
          </p>
          <p>Solo se puede si no tiene obras activas. Podrás activarla de nuevo.</p>
        </>
      ) : (
        <p>
          ¿Activar la carpeta <strong className="text-tinta">{carpeta?.numero}</strong>?
        </p>
      )}
    </ConfirmDialog>
  )
}
