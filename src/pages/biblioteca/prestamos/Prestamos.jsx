import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { FiPlus } from 'react-icons/fi'
import { listarPrestamos } from '../../../api/prestamos'
import EstadoPrestamo from '../../../components/biblioteca/EstadoPrestamo'
import Alerta from '../../../components/ui/Alerta'
import Boton from '../../../components/ui/Boton'
import Campo from '../../../components/ui/Campo'
import Cargando from '../../../components/ui/Cargando'
import Etiqueta from '../../../components/ui/Etiqueta'
import Modal from '../../../components/ui/Modal'
import Paginacion from '../../../components/ui/Paginacion'
import Selector from '../../../components/ui/Selector'
import { useConsulta } from '../../../hooks/useConsulta'
import { useFiltrosUrl, useTextoEnUrl } from '../../../hooks/useFiltrosUrl'
import { ETIQUETA_ESTADO_PRESTAMO, ETIQUETA_TIPO_ENTREGA } from '../../../utils/constantes'
import { fechaDia } from '../../../utils/fechas'
import FormularioPrestamo from './FormularioPrestamo'

const LIMITE = 25
const enlace = 'text-marca-700 underline underline-offset-2'

export default function Prestamos() {
  const navigate = useNavigate()
  const { params, valor, pagina, cambiar, vaciar } = useFiltrosUrl()
  const [q, setQ] = useTextoEnUrl('q', params, cambiar)
  const [creando, setCreando] = useState(false)

  const filtros = {
    q: valor('q'),
    tipoEntrega: valor('tipoEntrega'),
    estado: valor('estado'),
    desde: valor('desde'),
    hasta: valor('hasta'),
  }
  const clave = JSON.stringify(filtros)
  const consultar = useCallback(
    (signal) => listarPrestamos({ ...JSON.parse(clave), pagina, limite: LIMITE }, signal),
    [clave, pagina]
  )
  const { datos, cargando, error, recargar } = useConsulta(consultar)

  // Si la página quedó vacía, se retrocede una
  useEffect(() => {
    if (datos && datos.prestamos.length === 0 && pagina > 1) cambiar({ pagina: String(pagina - 1) })
  }, [datos, pagina, cambiar])

  const hayFiltros = Object.values(filtros).some(Boolean)
  const rangoInvertido = filtros.desde && filtros.hasta && filtros.desde > filtros.hasta
  const prestamos = datos?.prestamos ?? []

  const fila = (p) => ({
    codigo: (
      <Link to={`/prestamos/${p._id}`} className={`font-medium ${enlace}`}>
        {p.codigo}
      </Link>
    ),
    obra: p.obra ? (
      <Link to={`/obras/${p.obra._id}`} className={enlace}>
        {p.obra.titulo}
      </Link>
    ) : (
      '—'
    ),
  })

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-xl text-sm text-tinta-suave">
          Préstamos físicos (con devolución) y digitales de las obras de la biblioteca.
        </p>
        <Boton onClick={() => setCreando(true)}>
          <FiPlus aria-hidden="true" />
          Nuevo préstamo
        </Boton>
      </div>

      <section aria-label="Filtros" className="space-y-3 rounded-lg border border-linea bg-superficie p-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Campo
            label="Buscar"
            type="search"
            placeholder="Código, solicitante o institución"
            maxLength={100}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="lg:col-span-2"
          />
          <Selector label="Tipo de entrega" value={filtros.tipoEntrega} onChange={(e) => cambiar({ tipoEntrega: e.target.value })}>
            <option value="">Todos</option>
            {Object.entries(ETIQUETA_TIPO_ENTREGA).map(([v, t]) => <option key={v} value={v}>{t}</option>)}
          </Selector>
          <Selector label="Estado" value={filtros.estado} onChange={(e) => cambiar({ estado: e.target.value })}>
            <option value="">Todos</option>
            {Object.entries(ETIQUETA_ESTADO_PRESTAMO).map(([v, t]) => <option key={v} value={v}>{t}</option>)}
          </Selector>
          <div className="grid grid-cols-2 gap-2 sm:col-span-2 lg:col-span-5 lg:grid-cols-4">
            <Campo label="Entrega desde" type="date" value={filtros.desde} onChange={(e) => cambiar({ desde: e.target.value })} />
            <Campo label="Entrega hasta" type="date" value={filtros.hasta} onChange={(e) => cambiar({ hasta: e.target.value })} />
          </div>
        </div>
        {rangoInvertido && <Alerta tipo="aviso">La fecha «desde» es posterior a «hasta»: no habrá resultados.</Alerta>}
        {hayFiltros && (
          <Boton variante="fantasma" tamano="pequeno" onClick={() => { setQ(''); vaciar() }}>
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

      {cargando && !datos && <Cargando texto="Cargando préstamos…" />}

      {datos && (
        <div aria-busy={cargando} className={cargando ? 'opacity-60 transition-opacity' : 'transition-opacity'}>
          {prestamos.length === 0 ? (
            <p className="rounded-lg border border-linea bg-superficie p-8 text-center text-tinta-suave">
              {hayFiltros ? 'No hay préstamos que coincidan con los filtros.' : 'Todavía no hay préstamos registrados.'}
            </p>
          ) : (
            <>
              <div className="hidden overflow-x-auto rounded-lg border border-linea bg-superficie md:block">
                <table className="w-full text-left text-sm">
                  <caption className="sr-only">Préstamos</caption>
                  <thead className="border-b border-linea bg-hundido text-tinta-suave">
                    <tr>
                      <th scope="col" className="px-4 py-3 font-medium">Código</th>
                      <th scope="col" className="px-4 py-3 font-medium">Obra</th>
                      <th scope="col" className="px-4 py-3 font-medium">Solicitante</th>
                      <th scope="col" className="px-4 py-3 font-medium">Entrega</th>
                      <th scope="col" className="px-4 py-3 font-medium">Fecha de entrega</th>
                      <th scope="col" className="px-4 py-3 font-medium">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-linea">
                    {prestamos.map((p) => (
                      <tr key={p._id} className="align-top">
                        <td className="px-4 py-3">{fila(p).codigo}</td>
                        <td className="px-4 py-3">{fila(p).obra}</td>
                        <td className="px-4 py-3">
                          {p.solicitante}
                          {p.institucion && <span className="block text-xs text-tinta-suave">{p.institucion}</span>}
                        </td>
                        <td className="px-4 py-3"><Etiqueta tono="neutro">{ETIQUETA_TIPO_ENTREGA[p.tipoEntrega]}</Etiqueta></td>
                        <td className="px-4 py-3 text-tinta-suave">{fechaDia(p.fechaEntrega)}</td>
                        <td className="px-4 py-3"><EstadoPrestamo estado={p.estado} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <ul className="space-y-3 md:hidden">
                {prestamos.map((p) => (
                  <li key={p._id} className="space-y-2 rounded-lg border border-linea bg-superficie p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      {fila(p).codigo}
                      <EstadoPrestamo estado={p.estado} />
                    </div>
                    <p className="text-sm">{fila(p).obra}</p>
                    <p className="text-sm text-tinta-suave">
                      {[p.solicitante, p.institucion].filter(Boolean).join(' · ')}
                    </p>
                    <p className="text-sm text-tinta-suave">
                      {ETIQUETA_TIPO_ENTREGA[p.tipoEntrega]} · Entrega: {fechaDia(p.fechaEntrega)}
                    </p>
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
              etiqueta={datos.total === 1 ? 'préstamo' : 'préstamos'}
              deshabilitado={cargando}
              onCambiar={(n) => cambiar({ pagina: String(n) })}
            />
          </div>
        </div>
      )}

      <Modal abierto={creando} onCerrar={() => setCreando(false)} titulo="Nuevo préstamo" ancho="max-w-2xl">
        {creando && (
          <FormularioPrestamo
            onCerrar={() => setCreando(false)}
            onGuardado={(respuesta) => {
              toast.success(respuesta.msg)
              navigate(`/prestamos/${respuesta.prestamo._id}`)
            }}
          />
        )}
      </Modal>
    </div>
  )
}
