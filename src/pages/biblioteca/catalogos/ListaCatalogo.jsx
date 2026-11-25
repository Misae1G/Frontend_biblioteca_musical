import { useCallback, useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import { FiCheckCircle, FiPlus, FiSlash } from 'react-icons/fi'
import { cambiarEstadoCatalogo, listarCatalogos } from '../../../api/catalogos'
import Alerta from '../../../components/ui/Alerta'
import Boton from '../../../components/ui/Boton'
import Campo from '../../../components/ui/Campo'
import Cargando from '../../../components/ui/Cargando'
import ConfirmDialog from '../../../components/ui/ConfirmDialog'
import Etiqueta from '../../../components/ui/Etiqueta'
import Modal from '../../../components/ui/Modal'
import Selector from '../../../components/ui/Selector'
import { useConsulta } from '../../../hooks/useConsulta'
import { mensajeDeError } from '../../../utils/errores'
import { normalizarTexto } from '../../../utils/texto'
import FormularioCatalogo from './FormularioCatalogo'

const todos = (tipo) => (signal) => listarCatalogos({ tipo }, signal).then((r) => r.catalogos)

// Contenido de una pestaña: los valores de UN tipo de catálogo.
// El backend no pagina los catálogos: se traen todos (activos e inactivos) y se filtra aquí.
export default function ListaCatalogo({ tipo }) {
  const esInstrumento = tipo.id === 'instrumento'

  const consultar = useCallback((signal) => todos(tipo.id)(signal), [tipo.id])
  const valores = useConsulta(consultar)

  // Los instrumentos necesitan sus familias (para mostrarlas y para elegir al crear)
  const consultarFamilias = useCallback(
    (signal) => (esInstrumento ? todos('familiaInstrumento')(signal) : Promise.resolve([])),
    [esInstrumento]
  )
  const familias = useConsulta(consultarFamilias)

  const [busqueda, setBusqueda] = useState('')
  const [estado, setEstado] = useState('true')
  const [familiaFiltro, setFamiliaFiltro] = useState('')

  const [formulario, setFormulario] = useState(null) // { item: null } crea, { item } renombra
  const [confirmacion, setConfirmacion] = useState(null) // valor al que se le cambia el estado
  const [procesando, setProcesando] = useState(false)

  const nombreFamilia = useMemo(() => new Map((familias.datos ?? []).map((f) => [f._id, f.nombre])), [familias.datos])
  const familiasActivas = useMemo(() => (familias.datos ?? []).filter((f) => f.activo), [familias.datos])

  const visibles = useMemo(() => {
    const texto = normalizarTexto(busqueda)
    return (valores.datos ?? []).filter(
      (item) =>
        (estado === '' || item.activo === (estado === 'true')) &&
        (!familiaFiltro || item.familia === familiaFiltro) &&
        (!texto || normalizarTexto(item.nombre).includes(texto))
    )
  }, [valores.datos, busqueda, estado, familiaFiltro])

  const recargar = () => {
    valores.recargar()
    if (esInstrumento) familias.recargar()
  }

  const alGuardar = (respuesta) => {
    setFormulario(null)
    toast.success(formulario.item ? 'Cambios guardados' : `${tipo.singular[0].toUpperCase()}${tipo.singular.slice(1)} creado`)
    // Si el nuevo valor quedaría oculto por el filtro de estado, se muestran todos
    if (!formulario.item && respuesta.catalogo && estado === 'false') setEstado('')
    recargar()
  }

  const cambiarEstado = async () => {
    setProcesando(true)
    try {
      await cambiarEstadoCatalogo(confirmacion._id, !confirmacion.activo)
      toast.success(confirmacion.activo ? 'Desactivado' : 'Activado')
      recargar()
    } catch (e) {
      toast.error(mensajeDeError(e))
    } finally {
      setProcesando(false)
      setConfirmacion(null)
    }
  }

  const cargandoInicial = (valores.cargando && !valores.datos) || (esInstrumento && familias.cargando && !familias.datos)
  const error = valores.error || familias.error
  const sinValores = valores.datos && valores.datos.length === 0

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-xl text-sm text-tinta-suave">{tipo.ayuda}</p>
        <Boton onClick={() => setFormulario({ item: null })}>
          <FiPlus aria-hidden="true" />
          {tipo.nuevo}
        </Boton>
      </div>

      {tipo.id === 'tipoObra' && sinValores && (
        <Alerta tipo="info">
          Aún no hay tipos de obra. Créalos aquí para poder completar las obras que quedaron pendientes de la migración.
        </Alerta>
      )}

      <section
        aria-label="Filtros"
        className={`grid gap-4 rounded-lg border border-linea bg-superficie p-4 ${esInstrumento ? 'sm:grid-cols-3' : 'sm:grid-cols-2'}`}
      >
        <Campo
          label="Buscar"
          type="search"
          placeholder="Nombre"
          maxLength={80}
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        {esInstrumento && (
          <Selector label="Familia" value={familiaFiltro} onChange={(e) => setFamiliaFiltro(e.target.value)}>
            <option value="">Todas</option>
            {(familias.datos ?? []).map((familia) => (
              <option key={familia._id} value={familia._id}>
                {familia.nombre}
              </option>
            ))}
          </Selector>
        )}
        <Selector label="Estado" value={estado} onChange={(e) => setEstado(e.target.value)}>
          <option value="">Todos</option>
          <option value="true">Activos</option>
          <option value="false">Inactivos</option>
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

      {cargandoInicial && <Cargando texto="Cargando…" />}

      {valores.datos && !cargandoInicial && (
        <div aria-busy={valores.cargando} className={valores.cargando ? 'opacity-60 transition-opacity' : 'transition-opacity'}>
          {visibles.length === 0 ? (
            <p className="rounded-lg border border-linea bg-superficie p-8 text-center text-tinta-suave">
              {sinValores ? 'Todavía no hay valores en esta lista.' : 'No hay valores que coincidan con los filtros.'}
            </p>
          ) : (
            <>
              <p className="mb-2 text-sm text-tinta-suave" aria-live="polite">
                {visibles.length} {visibles.length === 1 ? 'valor' : 'valores'}
              </p>
              <div className="overflow-x-auto rounded-lg border border-linea bg-superficie">
                <table className="w-full text-left text-sm">
                  <caption className="sr-only">{tipo.texto}</caption>
                  <thead className="border-b border-linea bg-hundido text-tinta-suave">
                    <tr>
                      <th scope="col" className="px-4 py-3 font-medium">Nombre</th>
                      {esInstrumento && <th scope="col" className="px-4 py-3 font-medium">Familia</th>}
                      <th scope="col" className="px-4 py-3 font-medium">Estado</th>
                      <th scope="col" className="px-4 py-3 font-medium">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-linea">
                    {visibles.map((item) => (
                      <tr key={item._id}>
                        <td className="px-4 py-3 font-medium text-tinta">{item.nombre}</td>
                        {esInstrumento && (
                          <td className="px-4 py-3 text-tinta-suave">{nombreFamilia.get(item.familia) ?? '—'}</td>
                        )}
                        <td className="px-4 py-3">
                          {item.activo ? (
                            <Etiqueta tono="ok" Icono={FiCheckCircle}>Activo</Etiqueta>
                          ) : (
                            <Etiqueta tono="neutro" Icono={FiSlash}>Inactivo</Etiqueta>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            <Boton
                              variante="fantasma"
                              tamano="pequeno"
                              onClick={() => setFormulario({ item })}
                              aria-label={`Renombrar ${item.nombre}`}
                            >
                              Renombrar
                            </Boton>
                            <Boton
                              variante={item.activo ? 'peligroSuave' : 'fantasma'}
                              tamano="pequeno"
                              onClick={() => setConfirmacion(item)}
                              aria-label={`${item.activo ? 'Desactivar' : 'Activar'} ${item.nombre}`}
                            >
                              {item.activo ? 'Desactivar' : 'Activar'}
                            </Boton>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}

      <Modal
        abierto={Boolean(formulario)}
        onCerrar={() => setFormulario(null)}
        titulo={formulario?.item ? `Renombrar ${tipo.singular}` : tipo.nuevo}
      >
        {formulario && (
          <FormularioCatalogo
            tipo={tipo}
            item={formulario.item}
            familias={familiasActivas}
            onGuardado={alGuardar}
            onCerrar={() => setFormulario(null)}
          />
        )}
      </Modal>

      <ConfirmDialog
        abierto={Boolean(confirmacion)}
        titulo={confirmacion?.activo ? 'Desactivar' : 'Activar'}
        textoConfirmar={confirmacion?.activo ? 'Desactivar' : 'Activar'}
        variante={confirmacion?.activo ? 'peligro' : 'primario'}
        cargando={procesando}
        onConfirmar={cambiarEstado}
        onCerrar={() => setConfirmacion(null)}
      >
        {confirmacion?.activo ? (
          <>
            <p>
              ¿Desactivar <strong className="text-tinta">{confirmacion.nombre}</strong>?
            </p>
            <p>Dejará de ofrecerse para obras nuevas; las obras que ya lo tienen lo conservan. Podrás activarlo de nuevo.</p>
          </>
        ) : (
          <p>
            ¿Activar <strong className="text-tinta">{confirmacion?.nombre}</strong>? Volverá a ofrecerse al registrar obras.
          </p>
        )}
      </ConfirmDialog>
    </div>
  )
}
