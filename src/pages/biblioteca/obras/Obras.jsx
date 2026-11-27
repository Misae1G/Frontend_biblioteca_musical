import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { FiPlus } from 'react-icons/fi'
import { listarObras } from '../../../api/obras'
import Disponibilidad from '../../../components/biblioteca/Disponibilidad'
import Alerta from '../../../components/ui/Alerta'
import Boton from '../../../components/ui/Boton'
import Campo from '../../../components/ui/Campo'
import Cargando from '../../../components/ui/Cargando'
import Etiqueta from '../../../components/ui/Etiqueta'
import Paginacion from '../../../components/ui/Paginacion'
import Pestanas, { PanelPestana } from '../../../components/ui/Pestanas'
import Selector from '../../../components/ui/Selector'
import { useCatalogos } from '../../../hooks/useCatalogos'
import { useConsulta } from '../../../hooks/useConsulta'
import { useDebounce } from '../../../hooks/useDebounce'
import { ETIQUETA_DISPONIBILIDAD, ETIQUETA_PROCEDENCIA, ETIQUETA_REGISTRO } from '../../../utils/constantes'
import Indicadores from './Indicadores'

const LIMITE = 25
const VISTAS = [
  { id: 'todas', texto: 'Todas las obras' },
  { id: 'pendientes', texto: 'Pendientes de completar' },
]
// Filtros que viven en la URL: al volver desde una ficha se conserva la búsqueda y la página
const SECUNDARIOS = ['procedencia', 'tipoObra', 'agrupacion', 'familia', 'instrumento', 'activa', 'requiereRevision']

const opciones = (mapa) => Object.entries(mapa).map(([valor, texto]) => ({ valor, texto }))

// Campo de texto con retraso que escribe su valor en la URL
function useTextoEnUrl(clave, params, cambiar) {
  const enUrl = params.get(clave) ?? ''
  const [texto, setTexto] = useState(enUrl)
  const retrasado = useDebounce(texto.trim(), 350)
  useEffect(() => {
    if (retrasado !== enUrl) cambiar({ [clave]: retrasado })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [retrasado])
  return [texto, setTexto]
}

export default function Obras() {
  const [params, setParams] = useSearchParams()
  const valor = (clave) => params.get(clave) ?? ''
  const vista = valor('vista') === 'pendientes' ? 'pendientes' : 'todas'
  const pagina = Math.max(1, Number(valor('pagina')) || 1)
  const activa = valor('activa') || 'true'

  // Cambia filtros: vacío = quitar de la URL; cualquier cambio vuelve a la página 1 (salvo que sea la propia página)
  const cambiar = useCallback(
    (cambios) =>
      setParams(
        (previo) => {
          const siguiente = new URLSearchParams(previo)
          for (const [clave, v] of Object.entries(cambios)) {
            if (v === '' || v == null) siguiente.delete(clave)
            else siguiente.set(clave, v)
          }
          if (!('pagina' in cambios)) siguiente.delete('pagina')
          return siguiente
        },
        { replace: true }
      ),
    [setParams]
  )

  const [q, setQ] = useTextoEnUrl('q', params, cambiar)
  const [carpeta, setCarpeta] = useTextoEnUrl('carpeta', params, cambiar)

  const catalogos = useCatalogos()
  const cat = catalogos.datos
  const nombreDe = (item) => (item.activo ? item.nombre : `${item.nombre} (inactivo)`)
  const familiaElegida = params.get('familia') ?? ''
  const instrumentosVisibles = useMemo(
    () => (cat?.instrumento ?? []).filter((i) => !familiaElegida || i.familia === familiaElegida),
    [cat, familiaElegida]
  )

  const filtros = {
    q: valor('q'),
    carpeta: valor('carpeta'),
    tipoRegistro: valor('tipoRegistro'),
    disponibilidad: valor('disponibilidad'),
    procedencia: valor('procedencia'),
    tipoObra: valor('tipoObra'),
    agrupacion: valor('agrupacion'),
    familia: valor('familia'),
    instrumento: valor('instrumento'),
    requiereRevision: valor('requiereRevision'),
    activa,
    pendienteDeCompletar: vista === 'pendientes' ? 'true' : '',
  }
  const clave = JSON.stringify(filtros)
  const consultar = useCallback(
    (signal) => listarObras({ ...JSON.parse(clave), pagina, limite: LIMITE }, signal),
    [clave, pagina]
  )
  const { datos, cargando, error, recargar } = useConsulta(consultar)

  // Si la página quedó vacía, se retrocede una
  useEffect(() => {
    if (datos && datos.obras.length === 0 && pagina > 1) cambiar({ pagina: String(pagina - 1) })
  }, [datos, pagina, cambiar])

  const hayFiltros = ['q', 'carpeta', 'tipoRegistro', 'disponibilidad', ...SECUNDARIOS].some((c) => params.get(c))
  const secundariosActivos = SECUNDARIOS.some((c) => params.get(c))
  const limpiar = () => {
    setQ('')
    setCarpeta('')
    setParams(vista === 'pendientes' ? { vista } : {}, { replace: true })
  }

  const obras = datos?.obras ?? []

  const selector = (etiqueta, clavePropia, hijos, extra = {}) => (
    <Selector label={etiqueta} value={valor(clavePropia)} onChange={(e) => cambiar({ [clavePropia]: e.target.value, ...extra })}>
      {hijos}
    </Selector>
  )
  const opcionesDe = (lista) =>
    (lista ?? []).map((item) => (
      <option key={item._id} value={item._id}>
        {nombreDe(item)}
      </option>
    ))
  const opcionesFijas = (mapa) =>
    opciones(mapa).map(({ valor: v, texto }) => (
      <option key={v} value={v}>
        {texto}
      </option>
    ))

  const encabezadoObra = (obra) => (
    <>
      <Link to={`/obras/${obra._id}`} className="font-medium text-marca-700 underline underline-offset-2">
        {obra.titulo}
      </Link>
      {obra.tipoRegistro === 'mosaico' && (
        <p className="text-xs text-tinta-suave">
          {obra.totalCanciones ?? 0} {obra.totalCanciones === 1 ? 'canción' : 'canciones'}
          {obra.cancionesCoincidentes?.length > 0 && <> · Coincide: {obra.cancionesCoincidentes.join(', ')}</>}
        </p>
      )}
    </>
  )

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div className="flex justify-end">
        <Link
          to="/obras/nueva"
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-marca-600 px-4 py-2 text-sm font-medium text-white hover:bg-marca-700"
        >
          <FiPlus aria-hidden="true" />
          Nueva obra
        </Link>
      </div>
      <Pestanas etiqueta="Vistas de obras" pestanas={VISTAS} activa={vista} onCambiar={(id) => cambiar({ vista: id === 'pendientes' ? id : '' })} />
      <PanelPestana id={vista}>
        <div className="space-y-5">
          {vista === 'pendientes' && (
            <Alerta tipo="info">
              Obras migradas del catálogo original a las que les faltan datos obligatorios (por ejemplo el tipo de obra,
              la procedencia o la agrupación). Ábrelas para completarlas.
            </Alerta>
          )}

          <section aria-label="Filtros" className="space-y-4 rounded-lg border border-linea bg-superficie p-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Campo
                label="Buscar"
                type="search"
                placeholder="Título, autor, arreglista, canción…"
                maxLength={100}
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
              <Campo
                label="Carpeta"
                placeholder="Número de carpeta"
                maxLength={20}
                value={carpeta}
                onChange={(e) => setCarpeta(e.target.value)}
              />
              {selector('Tipo de registro', 'tipoRegistro', <><option value="">Todos</option>{opcionesFijas(ETIQUETA_REGISTRO)}</>)}
              {selector('Disponibilidad', 'disponibilidad', <><option value="">Todas</option>{opcionesFijas(ETIQUETA_DISPONIBILIDAD)}</>)}
            </div>

            <details open={secundariosActivos || undefined} className="group">
              <summary className="cursor-pointer text-sm font-medium text-marca-700">Más filtros</summary>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {selector('Procedencia', 'procedencia', <><option value="">Todas</option>{opcionesFijas(ETIQUETA_PROCEDENCIA)}</>)}
                {selector('Tipo de obra', 'tipoObra', <><option value="">Todos</option>{opcionesDe(cat?.tipoObra)}</>)}
                {selector('Agrupación', 'agrupacion', <><option value="">Todas</option>{opcionesDe(cat?.agrupacion)}</>)}
                {selector('Familia de instrumentos', 'familia', <><option value="">Todas</option>{opcionesDe(cat?.familiaInstrumento)}</>, { instrumento: '' })}
                {selector('Instrumento', 'instrumento', <><option value="">Todos</option>{opcionesDe(instrumentosVisibles)}</>)}
                <Selector label="Estado" value={activa} onChange={(e) => cambiar({ activa: e.target.value === 'true' ? '' : e.target.value })}>
                  <option value="true">Activas</option>
                  <option value="false">Inactivas</option>
                  <option value="todas">Todas</option>
                </Selector>
                {selector('Revisión', 'requiereRevision', <><option value="">Todas</option><option value="true">Marcadas para revisar</option><option value="false">Sin marca de revisión</option></>)}
              </div>
              {catalogos.error && (
                <p className="mt-3 text-sm text-peligro">No se pudieron cargar los catálogos de los filtros: {catalogos.error}</p>
              )}
            </details>

            {hayFiltros && (
              <Boton variante="fantasma" tamano="pequeno" onClick={limpiar}>
                Limpiar filtros
              </Boton>
            )}
          </section>

          {error && (
            <Alerta>
              <p>{error}</p>
              <Boton variante="secundario" tamano="pequeno" className="mt-2" onClick={recargar}>
                Reintentar
              </Boton>
            </Alerta>
          )}

          {cargando && !datos && <Cargando texto="Cargando obras…" />}

          {datos && (
            <div aria-busy={cargando} className={cargando ? 'opacity-60 transition-opacity' : 'transition-opacity'}>
              {obras.length === 0 ? (
                <p className="rounded-lg border border-linea bg-superficie p-8 text-center text-tinta-suave">
                  {vista === 'pendientes' && !hayFiltros ? 'No hay obras pendientes de completar.' : 'No hay obras que coincidan con los filtros.'}
                </p>
              ) : (
                <>
                  <div className="hidden overflow-x-auto rounded-lg border border-linea bg-superficie md:block">
                    <table className="w-full text-left text-sm">
                      <caption className="sr-only">Obras</caption>
                      <thead className="border-b border-linea bg-hundido text-tinta-suave">
                        <tr>
                          <th scope="col" className="px-4 py-3 font-medium">Título</th>
                          <th scope="col" className="px-4 py-3 font-medium">Autor</th>
                          <th scope="col" className="px-4 py-3 font-medium">Registro</th>
                          <th scope="col" className="px-4 py-3 font-medium">Tipo de obra</th>
                          <th scope="col" className="px-4 py-3 font-medium">Carpeta</th>
                          <th scope="col" className="px-4 py-3 font-medium">Estado</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-linea">
                        {obras.map((obra) => (
                          <tr key={obra._id} className="align-top">
                            <td className="px-4 py-3">{encabezadoObra(obra)}</td>
                            <td className="px-4 py-3 text-tinta-suave">{obra.autor || '—'}</td>
                            <td className="px-4 py-3">
                              <Etiqueta tono="neutro">{ETIQUETA_REGISTRO[obra.tipoRegistro] ?? obra.tipoRegistro}</Etiqueta>
                            </td>
                            <td className="px-4 py-3 text-tinta-suave">{obra.tipoObra?.nombre ?? '—'}</td>
                            <td className="px-4 py-3">
                              {obra.carpeta ? (
                                <Link to={`/carpetas/${obra.carpeta._id}`} className="text-marca-700 underline underline-offset-2">
                                  {obra.carpeta.numero}
                                </Link>
                              ) : (
                                '—'
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex flex-col items-start gap-1.5">
                                <Disponibilidad estado={estadoDe(obra)} />
                                <Indicadores obra={obra} />
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <ul className="space-y-3 md:hidden">
                    {obras.map((obra) => (
                      <li key={obra._id} className="space-y-2 rounded-lg border border-linea bg-superficie p-4">
                        <div>{encabezadoObra(obra)}</div>
                        <p className="text-sm text-tinta-suave">
                          {[obra.autor, ETIQUETA_REGISTRO[obra.tipoRegistro], obra.tipoObra?.nombre].filter(Boolean).join(' · ')}
                        </p>
                        {obra.carpeta && (
                          <p className="text-sm">
                            Carpeta{' '}
                            <Link to={`/carpetas/${obra.carpeta._id}`} className="text-marca-700 underline underline-offset-2">
                              {obra.carpeta.numero}
                            </Link>
                          </p>
                        )}
                        <div className="flex flex-wrap items-center gap-1.5">
                          <Disponibilidad estado={estadoDe(obra)} />
                          <Indicadores obra={obra} />
                        </div>
                      </li>
                    ))}
                  </ul>
                </>
              )}

              <div className="mt-4">
                <Paginacion
                  pagina={datos.pagina}
                  paginas={datos.paginas}
                  total={datos.total}
                  etiqueta={datos.total === 1 ? 'obra' : 'obras'}
                  deshabilitado={cargando}
                  onCambiar={(n) => cambiar({ pagina: String(n) })}
                />
              </div>
            </div>
          )}
        </div>
      </PanelPestana>
    </div>
  )
}

// El listado trae los dos indicadores (el virtual del backend no llega en .select de lista)
function estadoDe(obra) {
  if (obra.estadoDisponibilidad) return obra.estadoDisponibilidad
  if (obra.prestadaFisicamente && obra.enInterpretacion) return 'en_interpretacion_y_prestada'
  if (obra.prestadaFisicamente) return 'prestada_fisicamente'
  if (obra.enInterpretacion) return 'en_interpretacion'
  return 'disponible'
}
