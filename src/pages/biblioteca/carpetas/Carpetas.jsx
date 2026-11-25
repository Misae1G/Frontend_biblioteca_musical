import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { FiCheckCircle, FiPlus, FiSlash } from 'react-icons/fi'
import { listarCarpetas } from '../../../api/carpetas'
import Alerta from '../../../components/ui/Alerta'
import Boton from '../../../components/ui/Boton'
import Campo from '../../../components/ui/Campo'
import Cargando from '../../../components/ui/Cargando'
import Etiqueta from '../../../components/ui/Etiqueta'
import Modal from '../../../components/ui/Modal'
import Paginacion from '../../../components/ui/Paginacion'
import Selector from '../../../components/ui/Selector'
import { useConsulta } from '../../../hooks/useConsulta'
import { useDebounce } from '../../../hooks/useDebounce'
import { fechaDia } from '../../../utils/fechas'
import DialogoEstadoCarpeta from './DialogoEstadoCarpeta'
import FormularioCarpeta from './FormularioCarpeta'

const LIMITE = 50

export function EstadoCarpeta({ activa }) {
  return activa ? (
    <Etiqueta tono="ok" Icono={FiCheckCircle}>Activa</Etiqueta>
  ) : (
    <Etiqueta tono="neutro" Icono={FiSlash}>Inactiva</Etiqueta>
  )
}

export default function Carpetas() {
  const [q, setQ] = useState('')
  const [activa, setActiva] = useState('true')
  const [pagina, setPagina] = useState(1)
  const qRetrasado = useDebounce(q.trim(), 350)

  const consultar = useCallback(
    (signal) => listarCarpetas({ q: qRetrasado, activa, pagina, limite: LIMITE }, signal),
    [qRetrasado, activa, pagina]
  )
  const { datos, cargando, error, recargar } = useConsulta(consultar)

  const [formulario, setFormulario] = useState(null) // { carpeta: null } crea, { carpeta } edita
  const [cambioEstado, setCambioEstado] = useState(null)

  // Si la página quedó vacía (p. ej. se inactivó la última carpeta de la página), se retrocede una
  useEffect(() => {
    if (datos && datos.carpetas.length === 0 && pagina > 1) setPagina(pagina - 1)
  }, [datos, pagina])

  const cambiarFiltro = (poner) => (e) => {
    poner(e.target.value)
    setPagina(1)
  }

  const alGuardar = () => {
    toast.success(formulario.carpeta ? 'Carpeta actualizada' : 'Carpeta creada')
    // Una carpeta nueva está activa: si se estaba viendo "Inactivas" no aparecería
    if (!formulario.carpeta && activa === 'false') setActiva('')
    setFormulario(null)
    recargar()
  }

  const carpetas = datos?.carpetas ?? []

  const acciones = (carpeta) => (
    <div className="flex flex-wrap gap-1">
      <Boton variante="fantasma" tamano="pequeno" onClick={() => setFormulario({ carpeta })} aria-label={`Editar la carpeta ${carpeta.numero}`}>
        Editar
      </Boton>
      <Boton
        variante={carpeta.activa ? 'peligroSuave' : 'fantasma'}
        tamano="pequeno"
        onClick={() => setCambioEstado(carpeta)}
        aria-label={`${carpeta.activa ? 'Inactivar' : 'Activar'} la carpeta ${carpeta.numero}`}
      >
        {carpeta.activa ? 'Inactivar' : 'Activar'}
      </Boton>
    </div>
  )

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-xl text-sm text-tinta-suave">
          Carpetas físicas donde se guardan las obras. Cada obra pertenece a una carpeta.
        </p>
        <Boton onClick={() => setFormulario({ carpeta: null })}>
          <FiPlus aria-hidden="true" />
          Nueva carpeta
        </Boton>
      </div>

      <section aria-label="Filtros" className="grid gap-4 rounded-lg border border-linea bg-superficie p-4 sm:grid-cols-2">
        <Campo
          label="Buscar"
          type="search"
          placeholder="Número o ubicación"
          maxLength={100}
          value={q}
          onChange={cambiarFiltro(setQ)}
        />
        <Selector label="Estado" value={activa} onChange={cambiarFiltro(setActiva)}>
          <option value="">Todas</option>
          <option value="true">Activas</option>
          <option value="false">Inactivas</option>
        </Selector>
      </section>

      {error && (
        <Alerta>
          <p>{error}</p>
          <Boton variante="secundario" tamano="pequeno" className="mt-2" onClick={recargar}>
            Reintentar
          </Boton>
        </Alerta>
      )}

      {cargando && !datos && <Cargando texto="Cargando carpetas…" />}

      {datos && (
        <div aria-busy={cargando} className={cargando ? 'opacity-60 transition-opacity' : 'transition-opacity'}>
          {carpetas.length === 0 ? (
            <p className="rounded-lg border border-linea bg-superficie p-8 text-center text-tinta-suave">
              No hay carpetas que coincidan con los filtros.
            </p>
          ) : (
            <>
              <div className="hidden overflow-x-auto rounded-lg border border-linea bg-superficie md:block">
                <table className="w-full text-left text-sm">
                  <caption className="sr-only">Carpetas</caption>
                  <thead className="border-b border-linea bg-hundido text-tinta-suave">
                    <tr>
                      <th scope="col" className="px-4 py-3 font-medium">Número</th>
                      <th scope="col" className="px-4 py-3 font-medium">Ubicación</th>
                      <th scope="col" className="px-4 py-3 font-medium">Obras</th>
                      <th scope="col" className="px-4 py-3 font-medium">Última revisión</th>
                      <th scope="col" className="px-4 py-3 font-medium">Revisada por</th>
                      <th scope="col" className="px-4 py-3 font-medium">Estado</th>
                      <th scope="col" className="px-4 py-3 font-medium">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-linea">
                    {carpetas.map((c) => (
                      <tr key={c._id}>
                        <td className="px-4 py-3 font-medium">
                          <Link to={`/carpetas/${c._id}`} className="text-marca-700 underline underline-offset-2">
                            {c.numero}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-tinta-suave">{c.ubicacionFisica || '—'}</td>
                        <td className="px-4 py-3">{c.cantidadObras}</td>
                        <td className="px-4 py-3 text-tinta-suave">{fechaDia(c.ultimaRevision) || '—'}</td>
                        <td className="px-4 py-3 text-tinta-suave">{c.revisadaPor || '—'}</td>
                        <td className="px-4 py-3"><EstadoCarpeta activa={c.activa} /></td>
                        <td className="px-4 py-3">{acciones(c)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <ul className="space-y-3 md:hidden">
                {carpetas.map((c) => (
                  <li key={c._id} className="space-y-2 rounded-lg border border-linea bg-superficie p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <Link to={`/carpetas/${c._id}`} className="font-medium text-marca-700 underline underline-offset-2">
                        Carpeta {c.numero}
                      </Link>
                      <EstadoCarpeta activa={c.activa} />
                    </div>
                    <p className="text-sm text-tinta-suave">{c.ubicacionFisica || 'Sin ubicación'}</p>
                    <p className="text-sm text-tinta-suave">
                      {c.cantidadObras} {c.cantidadObras === 1 ? 'obra' : 'obras'} · Revisión: {fechaDia(c.ultimaRevision) || '—'}
                    </p>
                    {acciones(c)}
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
              etiqueta={datos.total === 1 ? 'carpeta' : 'carpetas'}
              deshabilitado={cargando}
              onCambiar={setPagina}
            />
          </div>
        </div>
      )}

      <Modal
        abierto={Boolean(formulario)}
        onCerrar={() => setFormulario(null)}
        titulo={formulario?.carpeta ? 'Editar carpeta' : 'Nueva carpeta'}
      >
        {formulario && (
          <FormularioCarpeta carpeta={formulario.carpeta} onGuardado={alGuardar} onCerrar={() => setFormulario(null)} />
        )}
      </Modal>

      <DialogoEstadoCarpeta carpeta={cambioEstado} onCambiado={recargar} onCerrar={() => setCambioEstado(null)} />
    </div>
  )
}
