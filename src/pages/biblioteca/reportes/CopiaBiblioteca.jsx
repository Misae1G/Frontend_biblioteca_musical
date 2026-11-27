import { useState } from 'react'
import { toast } from 'react-toastify'
import { FiDownload } from 'react-icons/fi'
import { descargarReporte } from '../../../api/reportes'
import Boton from '../../../components/ui/Boton'
import { guardarArchivo } from '../../../utils/descargas'
import { mensajeDeError } from '../../../utils/errores'

// La copia de la biblioteca solo existe en Excel: no tiene vista previa en pantalla
export default function CopiaBiblioteca() {
  const [descargando, setDescargando] = useState(false)

  const bajar = async () => {
    setDescargando(true)
    try {
      const { blob, nombre } = await descargarReporte('copia', 'xlsx')
      guardarArchivo(blob, nombre)
      toast.success('Copia descargada')
    } catch (e) {
      toast.error(mensajeDeError(e))
    } finally {
      setDescargando(false)
    }
  }

  return (
    <section aria-labelledby="titulo-copia" className="max-w-2xl space-y-4 rounded-lg border border-linea bg-superficie p-5">
      <h2 id="titulo-copia" className="text-xl font-semibold text-tinta">Copia de la biblioteca</h2>
      <p className="text-sm text-tinta-suave">
        Un archivo de Excel con todas las obras (activas e inactivas), las carpetas, los préstamos y las interpretaciones.
        Sirve como respaldo legible; puede tardar unos segundos en generarse.
      </p>
      <Boton onClick={bajar} cargando={descargando}>
        <FiDownload aria-hidden="true" />
        Descargar copia (Excel)
      </Boton>
    </section>
  )
}
