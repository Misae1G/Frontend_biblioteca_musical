import { useCallback, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { FiArrowLeft } from 'react-icons/fi'
import { obtenerPrestamo } from '../../../api/prestamos'
import EstadoPrestamo from '../../../components/biblioteca/EstadoPrestamo'
import Alerta from '../../../components/ui/Alerta'
import Boton from '../../../components/ui/Boton'
import Cargando from '../../../components/ui/Cargando'
import Etiqueta from '../../../components/ui/Etiqueta'
import Modal from '../../../components/ui/Modal'
import { useConsulta } from '../../../hooks/useConsulta'
import { ETIQUETA_ESTADO_FISICO, ETIQUETA_TIPO_ENTREGA } from '../../../utils/constantes'
import { fechaDia, formatearFechaHora } from '../../../utils/fechas'
import FormularioDevolucion from './FormularioDevolucion'
import FormularioPrestamo from './FormularioPrestamo'

const enlace = 'text-marca-700 underline underline-offset-2'
const TONO_FISICO = { buen_estado: 'ok', deteriorado: 'aviso', danado: 'peligro' }

function Dato({ titulo, children }) {
  return (
    <div>
      <dt className="text-sm text-tinta-suave">{titulo}</dt>
      <dd className="mt-0.5 break-words text-tinta">{children || '—'}</dd>
    </div>
  )
}

export default function PrestamoDetalle() {
  const { id } = useParams()
  const consultar = useCallback((signal) => obtenerPrestamo(id, signal), [id])
  const { datos, cargando, error, recargar } = useConsulta(consultar)
  const [modal, setModal] = useState(null) // 'editar' | 'devolucion'

  const volver = (
    <Link to="/prestamos" className={`inline-flex items-center gap-1 text-sm ${enlace}`}>
      <FiArrowLeft aria-hidden="true" />
      Volver a préstamos
    </Link>
  )

  if (!datos) {
    return (
      <div className="mx-auto max-w-4xl space-y-4">
        {volver}
        {cargando && <Cargando texto="Cargando préstamo…" />}
        {error && (
          <Alerta>
            <p>{error}</p>
            <Boton variante="secundario" tamano="pequeno" className="mt-2" onClick={recargar}>
              Reintentar
            </Boton>
          </Alerta>
        )}
      </div>
    )
  }

  const { prestamo } = datos
  const { obra, devolucion } = prestamo
  const esFisico = prestamo.tipoEntrega === 'fisico'

  const alGuardar = (respuesta) => {
    toast.success(respuesta.msg)
    setModal(null)
    recargar()
  }

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      {volver}

      <header className="space-y-3 rounded-lg border border-linea bg-superficie p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-tinta">Préstamo {prestamo.codigo}</h2>
            <div className="flex flex-wrap items-center gap-2">
              <EstadoPrestamo estado={prestamo.estado} />
              <Etiqueta tono="neutro">{ETIQUETA_TIPO_ENTREGA[prestamo.tipoEntrega]}</Etiqueta>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Boton variante="secundario" onClick={() => setModal('editar')}>Editar</Boton>
            {esFisico && !devolucion && <Boton onClick={() => setModal('devolucion')}>Registrar devolución</Boton>}
          </div>
        </div>
        {esFisico && !devolucion && (
          <Alerta tipo="aviso">La obra sigue prestada físicamente hasta que se registre la devolución.</Alerta>
        )}
      </header>

      <section aria-labelledby="s-datos" className="space-y-3 rounded-lg border border-linea bg-superficie p-5">
        <h2 id="s-datos" className="text-lg font-semibold text-tinta">Datos del préstamo</h2>
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Dato titulo="Obra">
            {obra && (
              <Link to={`/obras/${obra._id}`} className={enlace}>
                {obra.titulo}
              </Link>
            )}
            {obra?.carpeta && <span className="text-tinta-suave"> · Carpeta {obra.carpeta.numero}</span>}
          </Dato>
          <Dato titulo="Solicitante">{prestamo.solicitante}</Dato>
          <Dato titulo="Institución u orquesta">{prestamo.institucion}</Dato>
          <Dato titulo="Persona que recibe">{prestamo.personaQueRecibe}</Dato>
          <Dato titulo="Fecha de solicitud">{fechaDia(prestamo.fechaSolicitud)}</Dato>
          <Dato titulo="Fecha de entrega">{fechaDia(prestamo.fechaEntrega)}</Dato>
        </dl>
        {prestamo.observaciones && <Dato titulo="Observaciones">{prestamo.observaciones}</Dato>}
      </section>

      {esFisico && (
        <section aria-labelledby="s-devolucion" className="space-y-3 rounded-lg border border-linea bg-superficie p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 id="s-devolucion" className="text-lg font-semibold text-tinta">Devolución</h2>
            {devolucion && (
              <Boton variante="fantasma" tamano="pequeno" onClick={() => setModal('devolucion')}>
                Editar devolución
              </Boton>
            )}
          </div>
          {devolucion ? (
            <>
              <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Dato titulo="Fecha de devolución">{fechaDia(devolucion.fechaDevolucion)}</Dato>
                <Dato titulo="Persona que devuelve">{devolucion.personaQueDevuelve}</Dato>
                <Dato titulo="Estado físico">
                  <Etiqueta tono={TONO_FISICO[devolucion.estadoFisico]}>{ETIQUETA_ESTADO_FISICO[devolucion.estadoFisico]}</Etiqueta>
                </Dato>
                <Dato titulo="Recibida por">{devolucion.recibidoPor?.nombre}</Dato>
              </dl>
              {devolucion.observaciones && <Dato titulo="Observaciones">{devolucion.observaciones}</Dato>}
            </>
          ) : (
            <p className="text-sm text-tinta-suave">Aún no se ha devuelto.</p>
          )}
        </section>
      )}

      <p className="text-xs text-tinta-suave">
        Registrado {formatearFechaHora(prestamo.createdAt)}
        {prestamo.registradoPor?.nombre && ` por ${prestamo.registradoPor.nombre}`}
      </p>

      <Modal abierto={modal === 'editar'} onCerrar={() => setModal(null)} titulo="Editar préstamo" ancho="max-w-2xl">
        {modal === 'editar' && <FormularioPrestamo prestamo={prestamo} onCerrar={() => setModal(null)} onGuardado={alGuardar} />}
      </Modal>
      <Modal
        abierto={modal === 'devolucion'}
        onCerrar={() => setModal(null)}
        titulo={devolucion ? 'Editar devolución' : 'Registrar devolución'}
        ancho="max-w-xl"
      >
        {modal === 'devolucion' && <FormularioDevolucion prestamo={prestamo} onCerrar={() => setModal(null)} onGuardado={alGuardar} />}
      </Modal>
    </div>
  )
}
