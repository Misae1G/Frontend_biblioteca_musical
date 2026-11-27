import { useCallback, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { FiArrowLeft } from 'react-icons/fi'
import { cambiarEstadoInterpretacion, obtenerInterpretacion } from '../../../api/interpretaciones'
import EstadoInterpretacion from '../../../components/biblioteca/EstadoInterpretacion'
import Alerta from '../../../components/ui/Alerta'
import Boton from '../../../components/ui/Boton'
import Cargando from '../../../components/ui/Cargando'
import ConfirmDialog from '../../../components/ui/ConfirmDialog'
import Modal from '../../../components/ui/Modal'
import { useConsulta } from '../../../hooks/useConsulta'
import { ETIQUETA_ESTADO_INTERPRETACION, TRANSICIONES_INTERPRETACION } from '../../../utils/constantes'
import { mensajeDeError } from '../../../utils/errores'
import { fechaDia, formatearFechaHora } from '../../../utils/fechas'
import FormularioInterpretacion from './FormularioInterpretacion'

const enlace = 'text-marca-700 underline underline-offset-2'

// Texto de cada botón y aviso de la confirmación, según el estado al que se pasa
const ACCIONES = {
  interpretada: { boton: 'Marcar como interpretada', variante: 'primario', aviso: 'Si fue un error, podrás volver a programarla.' },
  programada: { boton: 'Volver a programada', variante: 'secundario', aviso: 'La obra volverá a figurar «En interpretación».' },
  cancelada: { boton: 'Cancelar interpretación', variante: 'peligroSuave', aviso: 'Es un estado final: no se puede deshacer.' },
  no_interpretada: { boton: 'Marcar como no interpretada', variante: 'secundario', aviso: 'Es un estado final: no se puede deshacer.' },
}

function Dato({ titulo, children }) {
  return (
    <div>
      <dt className="text-sm text-tinta-suave">{titulo}</dt>
      <dd className="mt-0.5 break-words text-tinta">{children || '—'}</dd>
    </div>
  )
}

export default function InterpretacionDetalle() {
  const { id } = useParams()
  const consultar = useCallback((signal) => obtenerInterpretacion(id, signal), [id])
  const { datos, cargando, error, recargar } = useConsulta(consultar)
  const [editando, setEditando] = useState(false)
  const [nuevoEstado, setNuevoEstado] = useState(null)
  const [procesando, setProcesando] = useState(false)

  const volver = (
    <Link to="/interpretaciones" className={`inline-flex items-center gap-1 text-sm ${enlace}`}>
      <FiArrowLeft aria-hidden="true" />
      Volver a interpretaciones
    </Link>
  )

  if (!datos) {
    return (
      <div className="mx-auto max-w-4xl space-y-4">
        {volver}
        {cargando && <Cargando texto="Cargando interpretación…" />}
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

  const { interpretacion } = datos
  const { obra } = interpretacion
  const destinos = TRANSICIONES_INTERPRETACION[interpretacion.estado] ?? []

  const cambiarEstado = async () => {
    setProcesando(true)
    try {
      const respuesta = await cambiarEstadoInterpretacion(interpretacion._id, nuevoEstado)
      toast.success(respuesta.msg)
      recargar()
    } catch (e) {
      toast.error(mensajeDeError(e))
    } finally {
      setProcesando(false)
      setNuevoEstado(null)
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      {volver}

      <header className="space-y-3 rounded-lg border border-linea bg-superficie p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-tinta">Interpretación {interpretacion.codigo}</h2>
            <EstadoInterpretacion estado={interpretacion.estado} />
          </div>
          <Boton variante="secundario" onClick={() => setEditando(true)}>Editar</Boton>
        </div>
        {interpretacion.estado === 'programada' && (
          <Alerta tipo="info">La obra figura «En interpretación» mientras tenga interpretaciones programadas.</Alerta>
        )}
        {destinos.length > 0 ? (
          <div className="flex flex-wrap gap-2" role="group" aria-label="Cambiar el estado">
            {destinos.map((destino) => (
              <Boton key={destino} variante={ACCIONES[destino].variante} onClick={() => setNuevoEstado(destino)}>
                {ACCIONES[destino].boton}
              </Boton>
            ))}
          </div>
        ) : (
          <p className="text-sm text-tinta-suave">Este estado es final: ya no se puede cambiar.</p>
        )}
      </header>

      <section aria-labelledby="s-datos" className="space-y-3 rounded-lg border border-linea bg-superficie p-5">
        <h2 id="s-datos" className="text-lg font-semibold text-tinta">Datos de la interpretación</h2>
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Dato titulo="Obra">
            {obra && (
              <Link to={`/obras/${obra._id}`} className={enlace}>
                {obra.titulo}
              </Link>
            )}
            {obra?.carpeta && <span className="text-tinta-suave"> · Carpeta {obra.carpeta.numero}</span>}
          </Dato>
          <Dato titulo="Fecha prevista">{fechaDia(interpretacion.fechaPrevista)}</Dato>
          <Dato titulo="Programa o concierto">{interpretacion.programa}</Dato>
          <Dato titulo="Director">{interpretacion.director}</Dato>
          <Dato titulo="Solista">{interpretacion.solista}</Dato>
        </dl>
        {interpretacion.observaciones && <Dato titulo="Observaciones">{interpretacion.observaciones}</Dato>}
      </section>

      <p className="text-xs text-tinta-suave">
        Registrada {formatearFechaHora(interpretacion.createdAt)}
        {interpretacion.registradoPor?.nombre && ` por ${interpretacion.registradoPor.nombre}`}
      </p>

      <Modal abierto={editando} onCerrar={() => setEditando(false)} titulo="Editar interpretación" ancho="max-w-2xl">
        {editando && (
          <FormularioInterpretacion
            interpretacion={interpretacion}
            onCerrar={() => setEditando(false)}
            onGuardado={(respuesta) => {
              toast.success(respuesta.msg)
              setEditando(false)
              recargar()
            }}
          />
        )}
      </Modal>

      <ConfirmDialog
        abierto={Boolean(nuevoEstado)}
        titulo="Cambiar el estado"
        textoConfirmar="Confirmar"
        variante={nuevoEstado === 'cancelada' ? 'peligro' : 'primario'}
        cargando={procesando}
        onConfirmar={cambiarEstado}
        onCerrar={() => setNuevoEstado(null)}
      >
        {nuevoEstado && (
          <>
            <p>
              ¿Pasar <strong className="text-tinta">{interpretacion.codigo}</strong> a «{ETIQUETA_ESTADO_INTERPRETACION[nuevoEstado]}»?
            </p>
            <p>{ACCIONES[nuevoEstado].aviso}</p>
          </>
        )}
      </ConfirmDialog>
    </div>
  )
}
