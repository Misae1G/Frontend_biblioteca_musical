import { useCallback, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { FiArrowLeft } from 'react-icons/fi'
import { obtenerCarpeta } from '../../../api/carpetas'
import Disponibilidad from '../../../components/biblioteca/Disponibilidad'
import Alerta from '../../../components/ui/Alerta'
import Boton from '../../../components/ui/Boton'
import Cargando from '../../../components/ui/Cargando'
import Etiqueta from '../../../components/ui/Etiqueta'
import Modal from '../../../components/ui/Modal'
import { useConsulta } from '../../../hooks/useConsulta'
import { ETIQUETA_REGISTRO } from '../../../utils/constantes'
import { fechaDia } from '../../../utils/fechas'
import { EstadoCarpeta } from './Carpetas'
import DialogoEstadoCarpeta from './DialogoEstadoCarpeta'
import FormularioCarpeta from './FormularioCarpeta'

function Dato({ titulo, children }) {
  return (
    <div>
      <dt className="text-sm text-tinta-suave">{titulo}</dt>
      <dd className="mt-0.5 text-tinta">{children || '—'}</dd>
    </div>
  )
}

export default function CarpetaDetalle() {
  const { id } = useParams()
  const consultar = useCallback((signal) => obtenerCarpeta(id, signal), [id])
  const { datos, cargando, error, recargar } = useConsulta(consultar)

  const [editando, setEditando] = useState(false)
  const [cambioEstado, setCambioEstado] = useState(null)

  const volver = (
    <Link to="/carpetas" className="inline-flex items-center gap-1 text-sm text-marca-700 underline underline-offset-2">
      <FiArrowLeft aria-hidden="true" />
      Volver a carpetas
    </Link>
  )

  if (!datos) {
    return (
      <div className="mx-auto max-w-5xl space-y-4">
        {volver}
        {cargando && <Cargando texto="Cargando carpeta…" />}
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

  const { carpeta, obras } = datos

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {volver}

      <section aria-labelledby="titulo-carpeta" className="space-y-4 rounded-lg border border-linea bg-superficie p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <h2 id="titulo-carpeta" className="text-xl font-semibold text-tinta">
              Carpeta {carpeta.numero}
            </h2>
            <EstadoCarpeta activa={carpeta.activa} />
          </div>
          <div className="flex gap-2">
            <Boton variante="secundario" onClick={() => setEditando(true)}>Editar</Boton>
            <Boton variante={carpeta.activa ? 'peligroSuave' : 'primario'} onClick={() => setCambioEstado(carpeta)}>
              {carpeta.activa ? 'Inactivar' : 'Activar'}
            </Boton>
          </div>
        </div>
        <dl className="grid gap-4 sm:grid-cols-3">
          <Dato titulo="Ubicación física">{carpeta.ubicacionFisica}</Dato>
          <Dato titulo="Última revisión">{fechaDia(carpeta.ultimaRevision)}</Dato>
          <Dato titulo="Revisada por">{carpeta.revisadaPor}</Dato>
        </dl>
        {carpeta.observaciones && <Dato titulo="Observaciones">{carpeta.observaciones}</Dato>}
      </section>

      <section aria-labelledby="titulo-obras" className="space-y-3">
        <h2 id="titulo-obras" className="text-lg font-semibold text-tinta">
          Obras en esta carpeta ({obras.length})
        </h2>
        {obras.length === 0 ? (
          <p className="rounded-lg border border-linea bg-superficie p-8 text-center text-tinta-suave">
            Esta carpeta no tiene obras.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-linea bg-superficie">
            <table className="w-full text-left text-sm">
              <caption className="sr-only">Obras de la carpeta {carpeta.numero}</caption>
              <thead className="border-b border-linea bg-hundido text-tinta-suave">
                <tr>
                  <th scope="col" className="px-4 py-3 font-medium">Título</th>
                  <th scope="col" className="px-4 py-3 font-medium">Autor</th>
                  <th scope="col" className="px-4 py-3 font-medium">Registro</th>
                  <th scope="col" className="px-4 py-3 font-medium">Disponibilidad</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-linea">
                {obras.map((obra) => (
                  <tr key={obra._id}>
                    <td className="px-4 py-3 font-medium">
                      <Link to={`/obras/${obra._id}`} className="text-marca-700 underline underline-offset-2">
                        {obra.titulo}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-tinta-suave">{obra.autor || '—'}</td>
                    <td className="px-4 py-3">
                      <Etiqueta tono="neutro">{ETIQUETA_REGISTRO[obra.tipoRegistro] ?? obra.tipoRegistro}</Etiqueta>
                    </td>
                    <td className="px-4 py-3">
                      <Disponibilidad estado={obra.estadoDisponibilidad} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <Modal abierto={editando} onCerrar={() => setEditando(false)} titulo="Editar carpeta">
        {editando && (
          <FormularioCarpeta
            carpeta={carpeta}
            onGuardado={() => {
              setEditando(false)
              toast.success('Carpeta actualizada')
              recargar()
            }}
            onCerrar={() => setEditando(false)}
          />
        )}
      </Modal>

      <DialogoEstadoCarpeta carpeta={cambioEstado} onCambiado={recargar} onCerrar={() => setCambioEstado(null)} />
    </div>
  )
}
