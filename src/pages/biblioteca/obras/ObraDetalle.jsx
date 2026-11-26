import { useCallback, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { FiArrowLeft, FiExternalLink } from 'react-icons/fi'
import { cambiarEstadoObra, obtenerObra } from '../../../api/obras'
import Disponibilidad from '../../../components/biblioteca/Disponibilidad'
import Alerta from '../../../components/ui/Alerta'
import Boton from '../../../components/ui/Boton'
import Cargando from '../../../components/ui/Cargando'
import ConfirmDialog from '../../../components/ui/ConfirmDialog'
import Etiqueta from '../../../components/ui/Etiqueta'
import { useConsulta } from '../../../hooks/useConsulta'
import {
  ETIQUETA_ESTADO_INTERPRETACION,
  ETIQUETA_ESTADO_PRESTAMO,
  ETIQUETA_PROCEDENCIA,
  ETIQUETA_REGISTRO,
  ETIQUETA_TIPO_ENTREGA,
  faltantesDeObra,
} from '../../../utils/constantes'
import { mensajeDeError } from '../../../utils/errores'
import { fechaDia, formatearDuracion, formatearFechaHora } from '../../../utils/fechas'
import Indicadores from './Indicadores'

const enlaceSeguro = (url) => /^https?:\/\//i.test(url)
const enlaceInterno = 'text-marca-700 underline underline-offset-2'

function Seccion({ id, titulo, children }) {
  return (
    <section aria-labelledby={id} className="space-y-3 rounded-lg border border-linea bg-superficie p-5">
      <h2 id={id} className="text-lg font-semibold text-tinta">
        {titulo}
      </h2>
      {children}
    </section>
  )
}

function Datos({ children }) {
  return <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{children}</dl>
}

function Dato({ titulo, children }) {
  return (
    <div>
      <dt className="text-sm text-tinta-suave">{titulo}</dt>
      <dd className="mt-0.5 break-words text-tinta">{children || children === 0 ? children : '—'}</dd>
    </div>
  )
}

function Tabla({ titulo, columnas, children }) {
  return (
    <div className="overflow-x-auto rounded-md border border-linea">
      <table className="w-full text-left text-sm">
        <caption className="sr-only">{titulo}</caption>
        <thead className="border-b border-linea bg-hundido text-tinta-suave">
          <tr>
            {columnas.map((c) => (
              <th key={c} scope="col" className="px-3 py-2 font-medium">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-linea">{children}</tbody>
      </table>
    </div>
  )
}

const Vacio = ({ children }) => <p className="text-sm text-tinta-suave">{children}</p>

function ListaObras({ obras }) {
  return (
    <ul className="space-y-1.5 text-sm">
      {obras.map((o) => (
        <li key={o._id}>
          <Link to={`/obras/${o._id}`} className={enlaceInterno}>
            {o.titulo}
          </Link>
          {(o.autor || o.arreglista || o.carpeta) && (
            <span className="text-tinta-suave">
              {' '}
              — {[o.arreglista || o.autor, o.carpeta && `carpeta ${o.carpeta.numero}`].filter(Boolean).join(' · ')}
            </span>
          )}
        </li>
      ))}
    </ul>
  )
}

export default function ObraDetalle() {
  const { id } = useParams()
  const consultar = useCallback((signal) => obtenerObra(id, signal), [id])
  const { datos, cargando, error, recargar } = useConsulta(consultar)

  const [confirmando, setConfirmando] = useState(false)
  const [procesando, setProcesando] = useState(false)

  const volver = (
    <Link to="/obras" className="inline-flex items-center gap-1 text-sm text-marca-700 underline underline-offset-2">
      <FiArrowLeft aria-hidden="true" />
      Volver a obras
    </Link>
  )

  if (!datos) {
    return (
      <div className="mx-auto max-w-5xl space-y-4">
        {volver}
        {cargando && <Cargando texto="Cargando obra…" />}
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

  const { obra, adaptaciones, otrasAdaptaciones, mosaicosRelacionados, prestamos, interpretaciones, vecesInterpretada } = datos
  const faltantes = obra.pendienteDeCompletar ? faltantesDeObra(obra) : []
  const esMosaico = obra.tipoRegistro === 'mosaico'

  const cambiarEstado = async () => {
    setProcesando(true)
    try {
      await cambiarEstadoObra(obra._id, !obra.activa)
      toast.success(obra.activa ? 'Obra inactivada' : 'Obra activada')
      recargar()
    } catch (e) {
      toast.error(mensajeDeError(e))
    } finally {
      setProcesando(false)
      setConfirmando(false)
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      {volver}

      <header className="space-y-3 rounded-lg border border-linea bg-superficie p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-tinta">{obra.titulo}</h2>
            <div className="flex flex-wrap items-center gap-2">
              <Etiqueta tono="neutro">{ETIQUETA_REGISTRO[obra.tipoRegistro]}</Etiqueta>
              <Disponibilidad estado={obra.estadoDisponibilidad} />
              <Indicadores obra={obra} />
            </div>
          </div>
          <Boton variante={obra.activa ? 'peligroSuave' : 'primario'} onClick={() => setConfirmando(true)}>
            {obra.activa ? 'Inactivar' : 'Activar'}
          </Boton>
        </div>
        {obra.pendienteDeCompletar && (
          <Alerta tipo="aviso">
            Obra pendiente de completar.
            {faltantes.length > 0 && <> Faltan: {faltantes.join(', ')}.</>}
          </Alerta>
        )}
      </header>

      <Seccion id="s-principal" titulo="Datos principales">
        <Datos>
          <Dato titulo="Autor">{obra.autor}</Dato>
          <Dato titulo="Arreglista">{obra.arreglista}</Dato>
          <Dato titulo="Orquestador">{obra.orquestador}</Dato>
          <Dato titulo="Opus">{obra.opus}</Dato>
          <Dato titulo="Año de composición">{obra.anioComposicion}</Dato>
          <Dato titulo="Año del arreglo">{obra.anioArreglo}</Dato>
          <Dato titulo="Tipo de obra">{obra.tipoObra?.nombre}</Dato>
          <Dato titulo="Procedencia">{ETIQUETA_PROCEDENCIA[obra.procedencia]}</Dato>
          <Dato titulo="Agrupación">{obra.agrupacion?.nombre}</Dato>
          <Dato titulo="Carpeta">
            {obra.carpeta && (
              <Link to={`/carpetas/${obra.carpeta._id}`} className={enlaceInterno}>
                {obra.carpeta.numero}
              </Link>
            )}
            {obra.carpeta?.ubicacionFisica && <span className="text-tinta-suave"> · {obra.carpeta.ubicacionFisica}</span>}
          </Dato>
          {obra.obraOriginal && (
            <Dato titulo="Adaptación de">
              <Link to={`/obras/${obra.obraOriginal._id}`} className={enlaceInterno}>
                {obra.obraOriginal.titulo}
              </Link>
              {obra.obraOriginal.autor && <span className="text-tinta-suave"> · {obra.obraOriginal.autor}</span>}
            </Dato>
          )}
        </Datos>
        {obra.observaciones && <Dato titulo="Observaciones">{obra.observaciones}</Dato>}
      </Seccion>

      <Seccion id="s-musical" titulo="Características musicales y material">
        <Datos>
          <Dato titulo="Tonalidad">{obra.tonalidad}</Dato>
          <Dato titulo="Compás">{obra.compas}</Dato>
          <Dato titulo="Tiempo">{obra.tiempo}</Dato>
          <Dato titulo="Duración">{formatearDuracion(obra.duracion)}</Dato>
          <Dato titulo="Número de movimientos">{obra.numeroMovimientos}</Dato>
          <Dato titulo="Edición">{obra.edicion}</Dato>
          <Dato titulo="Formato">{obra.formato}</Dato>
          <Dato titulo="Detalle del material">{obra.detalleMaterial}</Dato>
          <Dato titulo="Estado del material">{obra.estadoMaterial}</Dato>
          <Dato titulo="Factible sin voz">{{ si: 'Sí', no: 'No' }[obra.factibleSinVoz]}</Dato>
          <Dato titulo="Director (concierto histórico)">{obra.directorConcierto}</Dato>
          <Dato titulo="Solista (concierto histórico)">{obra.solistaConcierto}</Dato>
        </Datos>
      </Seccion>

      <Seccion id="s-instrumentacion" titulo="Instrumentación">
        {obra.instrumentacion.length === 0 ? (
          <Vacio>No se ha registrado la instrumentación.</Vacio>
        ) : (
          <Tabla titulo="Instrumentación" columnas={['Familia', 'Instrumento', 'Cantidad']}>
            {obra.instrumentacion.map((fila) => (
              <tr key={`${fila.familia?._id}-${fila.instrumento?._id}`}>
                <td className="px-3 py-2 text-tinta-suave">{fila.familia?.nombre ?? '—'}</td>
                <td className="px-3 py-2 font-medium">{fila.instrumento?.nombre ?? '—'}</td>
                <td className="px-3 py-2">{fila.cantidad}</td>
              </tr>
            ))}
          </Tabla>
        )}
      </Seccion>

      {esMosaico && (
        <Seccion id="s-canciones" titulo={`Canciones del mosaico (${obra.canciones.length})`}>
          {obra.canciones.length === 0 ? (
            <Vacio>Este mosaico aún no tiene canciones registradas.</Vacio>
          ) : (
            <Tabla titulo="Canciones del mosaico" columnas={['N.º', 'Título', 'Compositor', 'Género', 'Observación']}>
              {obra.canciones.map((c) => (
                <tr key={c.orden}>
                  <td className="px-3 py-2">{c.orden}</td>
                  <td className="px-3 py-2 font-medium">{c.titulo}</td>
                  <td className="px-3 py-2 text-tinta-suave">{c.compositor || '—'}</td>
                  <td className="px-3 py-2 text-tinta-suave">{c.genero || '—'}</td>
                  <td className="px-3 py-2 text-tinta-suave">{c.observacion || '—'}</td>
                </tr>
              ))}
            </Tabla>
          )}
        </Seccion>
      )}

      {(adaptaciones.length > 0 || otrasAdaptaciones.length > 0 || mosaicosRelacionados.length > 0) && (
        <Seccion id="s-relacionadas" titulo="Obras relacionadas">
          {adaptaciones.length > 0 && (
            <div className="space-y-1.5">
              <h3 className="text-sm font-medium text-tinta">Adaptaciones de esta obra</h3>
              <ListaObras obras={adaptaciones} />
            </div>
          )}
          {otrasAdaptaciones.length > 0 && (
            <div className="space-y-1.5">
              <h3 className="text-sm font-medium text-tinta">Otras adaptaciones de la misma obra original</h3>
              <ListaObras obras={otrasAdaptaciones} />
            </div>
          )}
          {mosaicosRelacionados.length > 0 && (
            <div className="space-y-1.5">
              <h3 className="text-sm font-medium text-tinta">Aparece en estos mosaicos</h3>
              <ListaObras obras={mosaicosRelacionados} />
            </div>
          )}
        </Seccion>
      )}

      <Seccion id="s-documentos" titulo={`Documentos digitales (${obra.documentos.length})`}>
        {obra.documentos.length === 0 ? (
          <Vacio>No hay documentos digitales.</Vacio>
        ) : (
          <ul className="space-y-2 text-sm">
            {obra.documentos.map((d) => (
              <li key={d._id}>
                {enlaceSeguro(d.enlace) ? (
                  <a href={d.enlace} target="_blank" rel="noopener noreferrer" className={`${enlaceInterno} inline-flex items-center gap-1`}>
                    {d.nombre}
                    <FiExternalLink aria-hidden="true" />
                    <span className="sr-only">(se abre en una pestaña nueva)</span>
                  </a>
                ) : (
                  <span>{d.nombre}</span>
                )}
                {d.tipoArchivo && <span className="text-tinta-suave"> · {d.tipoArchivo}</span>}
                {d.observaciones && <p className="text-tinta-suave">{d.observaciones}</p>}
              </li>
            ))}
          </ul>
        )}
      </Seccion>

      <Seccion id="s-prestamos" titulo="Préstamos">
        {prestamos.length === 0 ? (
          <Vacio>Esta obra no tiene préstamos.</Vacio>
        ) : (
          <Tabla titulo="Préstamos de la obra" columnas={['Código', 'Solicitante', 'Entrega', 'Fecha de entrega', 'Estado']}>
            {prestamos.map((p) => (
              <tr key={p._id}>
                <td className="px-3 py-2 font-medium">{p.codigo}</td>
                <td className="px-3 py-2">
                  {p.solicitante}
                  {p.institucion && <span className="text-tinta-suave"> · {p.institucion}</span>}
                </td>
                <td className="px-3 py-2 text-tinta-suave">{ETIQUETA_TIPO_ENTREGA[p.tipoEntrega]}</td>
                <td className="px-3 py-2 text-tinta-suave">{fechaDia(p.fechaEntrega)}</td>
                <td className="px-3 py-2">
                  <Etiqueta tono={p.estado === 'pendiente' ? 'aviso' : 'ok'}>{ETIQUETA_ESTADO_PRESTAMO[p.estado] ?? p.estado}</Etiqueta>
                </td>
              </tr>
            ))}
          </Tabla>
        )}
      </Seccion>

      <Seccion id="s-interpretaciones" titulo={`Interpretaciones (interpretada ${vecesInterpretada} ${vecesInterpretada === 1 ? 'vez' : 'veces'})`}>
        {interpretaciones.length === 0 ? (
          <Vacio>Esta obra no tiene interpretaciones.</Vacio>
        ) : (
          <Tabla titulo="Interpretaciones de la obra" columnas={['Código', 'Fecha prevista', 'Programa', 'Director', 'Estado']}>
            {interpretaciones.map((i) => (
              <tr key={i._id}>
                <td className="px-3 py-2 font-medium">{i.codigo}</td>
                <td className="px-3 py-2 text-tinta-suave">{fechaDia(i.fechaPrevista)}</td>
                <td className="px-3 py-2">{i.programa || '—'}</td>
                <td className="px-3 py-2 text-tinta-suave">{i.director || '—'}</td>
                <td className="px-3 py-2">
                  <Etiqueta tono={i.estado === 'programada' ? 'info' : 'neutro'}>
                    {ETIQUETA_ESTADO_INTERPRETACION[i.estado] ?? i.estado}
                  </Etiqueta>
                </td>
              </tr>
            ))}
          </Tabla>
        )}
      </Seccion>

      <p className="text-xs text-tinta-suave">
        Creada {formatearFechaHora(obra.createdAt)}
        {obra.creadaPor?.nombre && ` por ${obra.creadaPor.nombre}`} · Última modificación {formatearFechaHora(obra.updatedAt)}
        {obra.modificadaPor?.nombre && ` por ${obra.modificadaPor.nombre}`}
      </p>

      <ConfirmDialog
        abierto={confirmando}
        titulo={obra.activa ? 'Inactivar obra' : 'Activar obra'}
        textoConfirmar={obra.activa ? 'Inactivar' : 'Activar'}
        variante={obra.activa ? 'peligro' : 'primario'}
        cargando={procesando}
        onConfirmar={cambiarEstado}
        onCerrar={() => setConfirmando(false)}
      >
        {obra.activa ? (
          <>
            <p>
              ¿Inactivar <strong className="text-tinta">{obra.titulo}</strong>?
            </p>
            <p>No se podrá modificar ni prestar mientras esté inactiva. Se rechaza si tiene un préstamo físico pendiente o interpretaciones programadas.</p>
          </>
        ) : (
          <p>
            ¿Activar <strong className="text-tinta">{obra.titulo}</strong>?
          </p>
        )}
      </ConfirmDialog>
    </div>
  )
}
