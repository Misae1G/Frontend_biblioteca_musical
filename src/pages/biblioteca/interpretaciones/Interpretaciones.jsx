import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { FiPlus } from 'react-icons/fi'
import { listarInterpretaciones } from '../../../api/interpretaciones'
import EstadoInterpretacion from '../../../components/biblioteca/EstadoInterpretacion'
import Alerta from '../../../components/ui/Alerta'
import Boton from '../../../components/ui/Boton'
import Campo from '../../../components/ui/Campo'
import Cargando from '../../../components/ui/Cargando'
import Modal from '../../../components/ui/Modal'
import Paginacion from '../../../components/ui/Paginacion'
import Pestanas, { PanelPestana } from '../../../components/ui/Pestanas'
import Selector from '../../../components/ui/Selector'
import { useConsulta } from '../../../hooks/useConsulta'
import { useFiltrosUrl, useTextoEnUrl } from '../../../hooks/useFiltrosUrl'
import { ETIQUETA_ESTADO_INTERPRETACION } from '../../../utils/constantes'
import { fechaDia } from '../../../utils/fechas'
import FormularioInterpretacion from './FormularioInterpretacion'
import SemanaInterpretaciones from './SemanaInterpretaciones'

const LIMITE = 25
const VISTAS = [
  { id: 'lista', texto: 'Listado' },
  { id: 'semana', texto: 'Vista semanal' },
]
const enlace = 'text-marca-700 underline underline-offset-2'

function Listado({ filtros, pagina, cambiar, limpiar, q, setQ }) {
  const clave = JSON.stringify(filtros)
  const consultar = useCallback(
    (signal) => listarInterpretaciones({ ...JSON.parse(clave), pagina, limite: LIMITE }, signal),
    [clave, pagina]
  )
  const { datos, cargando, error, recargar } = useConsulta(consultar)

  // Si la página quedó vacía, se retrocede una
  useEffect(() => {
    if (datos && datos.interpretaciones.length === 0 && pagina > 1) cambiar({ pagina: String(pagina - 1) })
  }, [datos, pagina, cambiar])

  const hayFiltros = Object.values(filtros).some(Boolean)
  const rangoInvertido = filtros.desde && filtros.hasta && filtros.desde > filtros.hasta
  const items = datos?.interpretaciones ?? []

  const codigo = (i) => (
    <Link to={`/interpretaciones/${i._id}`} className={`font-medium ${enlace}`}>
      {i.codigo}
    </Link>
  )
  const obra = (i) =>
    i.obra ? (
      <Link to={`/obras/${i.obra._id}`} className={enlace}>
        {i.obra.titulo}
      </Link>
    ) : (
      '—'
    )

  return (
    <div className="space-y-5">
      <section aria-label="Filtros" className="space-y-3 rounded-lg border border-linea bg-superficie p-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Campo
            label="Buscar"
            type="search"
            placeholder="Código, programa o director"
            maxLength={100}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="lg:col-span-2"
          />
          <Selector label="Estado" value={filtros.estado} onChange={(e) => cambiar({ estado: e.target.value })}>
            <option value="">Todos</option>
            {Object.entries(ETIQUETA_ESTADO_INTERPRETACION).map(([v, t]) => <option key={v} value={v}>{t}</option>)}
          </Selector>
          <div className="grid grid-cols-2 gap-2 sm:col-span-2 lg:col-span-4 lg:grid-cols-4">
            <Campo label="Fecha desde" type="date" value={filtros.desde} onChange={(e) => cambiar({ desde: e.target.value })} />
            <Campo label="Fecha hasta" type="date" value={filtros.hasta} onChange={(e) => cambiar({ hasta: e.target.value })} />
          </div>
        </div>
        {rangoInvertido && <Alerta tipo="aviso">La fecha «desde» es posterior a «hasta»: no habrá resultados.</Alerta>}
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
      {cargando && !datos && <Cargando texto="Cargando interpretaciones…" />}

      {datos && (
        <div aria-busy={cargando} className={cargando ? 'opacity-60 transition-opacity' : 'transition-opacity'}>
          {items.length === 0 ? (
            <p className="rounded-lg border border-linea bg-superficie p-8 text-center text-tinta-suave">
              {hayFiltros ? 'No hay interpretaciones que coincidan con los filtros.' : 'Todavía no hay interpretaciones registradas.'}
            </p>
          ) : (
            <>
              <div className="hidden overflow-x-auto rounded-lg border border-linea bg-superficie md:block">
                <table className="w-full text-left text-sm">
                  <caption className="sr-only">Interpretaciones</caption>
                  <thead className="border-b border-linea bg-hundido text-tinta-suave">
                    <tr>
                      <th scope="col" className="px-4 py-3 font-medium">Código</th>
                      <th scope="col" className="px-4 py-3 font-medium">Obra</th>
                      <th scope="col" className="px-4 py-3 font-medium">Programa</th>
                      <th scope="col" className="px-4 py-3 font-medium">Director</th>
                      <th scope="col" className="px-4 py-3 font-medium">Fecha prevista</th>
                      <th scope="col" className="px-4 py-3 font-medium">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-linea">
                    {items.map((i) => (
                      <tr key={i._id} className="align-top">
                        <td className="px-4 py-3">{codigo(i)}</td>
                        <td className="px-4 py-3">{obra(i)}</td>
                        <td className="px-4 py-3">{i.programa}</td>
                        <td className="px-4 py-3 text-tinta-suave">{i.director}</td>
                        <td className="px-4 py-3 text-tinta-suave">{fechaDia(i.fechaPrevista)}</td>
                        <td className="px-4 py-3"><EstadoInterpretacion estado={i.estado} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <ul className="space-y-3 md:hidden">
                {items.map((i) => (
                  <li key={i._id} className="space-y-2 rounded-lg border border-linea bg-superficie p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      {codigo(i)}
                      <EstadoInterpretacion estado={i.estado} />
                    </div>
                    <p className="text-sm">{obra(i)}</p>
                    <p className="text-sm text-tinta-suave">{i.programa} · Director: {i.director}</p>
                    <p className="text-sm text-tinta-suave">Fecha prevista: {fechaDia(i.fechaPrevista)}</p>
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
              etiqueta={datos.total === 1 ? 'interpretación' : 'interpretaciones'}
              deshabilitado={cargando}
              onCambiar={(n) => cambiar({ pagina: String(n) })}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default function Interpretaciones() {
  const navigate = useNavigate()
  const { params, valor, pagina, cambiar, vaciar } = useFiltrosUrl()
  const [q, setQ] = useTextoEnUrl('q', params, cambiar)
  const [creando, setCreando] = useState(false)
  const vista = valor('vista') === 'semana' ? 'semana' : 'lista'

  const filtros = { q: valor('q'), estado: valor('estado'), desde: valor('desde'), hasta: valor('hasta') }

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-xl text-sm text-tinta-suave">
          Programación de las obras que se interpretarán en conciertos y ensayos.
        </p>
        <Boton onClick={() => setCreando(true)}>
          <FiPlus aria-hidden="true" />
          Programar interpretación
        </Boton>
      </div>

      <Pestanas
        etiqueta="Vistas de interpretaciones"
        pestanas={VISTAS}
        activa={vista}
        onCambiar={(id) => cambiar({ vista: id === 'semana' ? id : '', pagina: '' })}
      />
      <PanelPestana id={vista}>
        {vista === 'lista' ? (
          <Listado
            filtros={filtros}
            pagina={pagina}
            cambiar={cambiar}
            q={q}
            setQ={setQ}
            limpiar={() => { setQ(''); vaciar() }}
          />
        ) : (
          <SemanaInterpretaciones fecha={valor('fecha')} onCambiarFecha={(fecha) => cambiar({ fecha })} />
        )}
      </PanelPestana>

      <Modal abierto={creando} onCerrar={() => setCreando(false)} titulo="Programar interpretación" ancho="max-w-2xl">
        {creando && (
          <FormularioInterpretacion
            onCerrar={() => setCreando(false)}
            onGuardado={(respuesta) => {
              toast.success(respuesta.msg)
              navigate(`/interpretaciones/${respuesta.interpretacion._id}`)
            }}
          />
        )}
      </Modal>
    </div>
  )
}
