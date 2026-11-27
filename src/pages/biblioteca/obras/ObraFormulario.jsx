import { useCallback, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'react-toastify'
import { FiArrowDown, FiArrowLeft, FiArrowUp, FiPlus, FiTrash2 } from 'react-icons/fi'
import { listarCarpetas } from '../../../api/carpetas'
import { crearObra, editarObra, listarObras, obtenerObra } from '../../../api/obras'
import Alerta from '../../../components/ui/Alerta'
import AreaTexto from '../../../components/ui/AreaTexto'
import Boton from '../../../components/ui/Boton'
import BuscadorRegistro from '../../../components/ui/BuscadorRegistro'
import Campo from '../../../components/ui/Campo'
import Cargando from '../../../components/ui/Cargando'
import Selector from '../../../components/ui/Selector'
import { useCatalogos } from '../../../hooks/useCatalogos'
import { useConsulta } from '../../../hooks/useConsulta'
import { ETIQUETA_PROCEDENCIA, ETIQUETA_REGISTRO, faltantesDeObra } from '../../../utils/constantes'
import { manejarErrorApi } from '../../../utils/errores'
import { aPayload, crearEsquema, valoresIniciales } from './esquemaObra'

// Valores activos del catálogo, más el que la obra ya tiene aunque esté inactivo (el backend lo conserva)
const opcionesDe = (lista = [], actual) =>
  lista
    .filter((i) => i.activo || i._id === actual)
    .map((i) => (
      <option key={i._id} value={i._id}>
        {i.activo ? i.nombre : `${i.nombre} (inactivo)`}
      </option>
    ))

const mostrarCarpeta = (c) => `Carpeta ${c.numero}${c.ubicacionFisica ? ` — ${c.ubicacionFisica}` : ''}`
const mostrarObra = (o) => `${o.titulo}${o.autor ? ` — ${o.autor}` : ''}`

function Grupo({ titulo, children }) {
  return (
    <fieldset className="space-y-4 rounded-lg border border-linea bg-superficie p-5">
      <legend className="px-1 text-lg font-semibold text-tinta">{titulo}</legend>
      {children}
    </fieldset>
  )
}

const Rejilla = ({ children }) => <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{children}</div>

function Formulario({ obra, catalogos }) {
  const navigate = useNavigate()
  const editando = Boolean(obra)
  const completo = !obra?.pendienteDeCompletar
  const [errorGeneral, setErrorGeneral] = useState('')
  const [carpeta, setCarpeta] = useState(obra?.carpeta ?? null)
  const [original, setOriginal] = useState(obra?.obraOriginal ?? null)

  const esquema = useMemo(() => crearEsquema({ completo }), [completo])
  const {
    register,
    control,
    handleSubmit,
    setError,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(esquema), defaultValues: valoresIniciales(obra) })

  const instrumentacion = useFieldArray({ control, name: 'instrumentacion' })
  const canciones = useFieldArray({ control, name: 'canciones' })
  const tipoRegistro = watch('tipoRegistro')
  const filas = watch('instrumentacion')

  const buscarCarpetas = (q, signal) => listarCarpetas({ q, activa: 'true', limite: 10 }, signal).then((r) => r.carpetas)
  const buscarObras = (q, signal) =>
    listarObras({ q, activa: 'true', limite: 10 }, signal).then((r) => r.obras.filter((o) => o._id !== obra?._id))

  const enviar = async (datos) => {
    setErrorGeneral('')
    try {
      const payload = aPayload(datos)
      const respuesta = editando ? await editarObra(obra._id, payload) : await crearObra(payload)
      toast.success(respuesta.msg)
      navigate(`/obras/${respuesta.obra._id}`)
    } catch (error) {
      setErrorGeneral(manejarErrorApi(error, setError))
    }
  }

  const alFallar = () => setErrorGeneral('Revisa los campos marcados en rojo.')

  const sel = (nombre, etiqueta, hijos, extra = {}) => (
    <Selector label={etiqueta} error={errors[nombre]?.message} {...register(nombre)} {...extra}>
      {hijos}
    </Selector>
  )
  const campo = (nombre, etiqueta, props = {}) => (
    <Campo label={etiqueta} autoComplete="off" error={errors[nombre]?.message} {...register(nombre)} {...props} />
  )
  const marca = (texto) => (completo ? `${texto} *` : texto)

  return (
    <form onSubmit={handleSubmit(enviar, alFallar)} noValidate className="space-y-5">
      {errorGeneral && <Alerta>{errorGeneral}</Alerta>}
      {obra?.pendienteDeCompletar && (
        <Alerta tipo="aviso">
          Esta obra está pendiente de completar. Puedes guardarla por partes; seguirá pendiente mientras falte:{' '}
          {faltantesDeObra(obra).join(', ') || 'ningún dato'}.
        </Alerta>
      )}

      <Grupo titulo="Datos principales">
        <Rejilla>
          {campo('titulo', 'Título *', { className: 'sm:col-span-2' })}
          {sel(
            'tipoRegistro',
            'Tipo de registro *',
            <>
              <option value="">Elige…</option>
              {Object.entries(ETIQUETA_REGISTRO).map(([v, t]) => (
                <option key={v} value={v}>{t}</option>
              ))}
            </>
          )}
          {campo('autor', tipoRegistro === 'mosaico' ? 'Autor' : marca('Autor'))}
          {campo('arreglista', 'Arreglista')}
          {campo('orquestador', 'Orquestador')}
          {campo('opus', 'Opus')}
          {campo('anioComposicion', 'Año de composición', { inputMode: 'numeric', maxLength: 4 })}
          {campo('anioArreglo', 'Año del arreglo', { inputMode: 'numeric', maxLength: 4 })}
        </Rejilla>
        {tipoRegistro === 'adaptacion' && (
          <BuscadorRegistro
            label="Obra original"
            valor={original}
            mostrar={mostrarObra}
            buscar={buscarObras}
            placeholder="Busca la obra original por título o autor"
            ayuda="Opcional. Enlaza esta adaptación con la obra de la que parte."
            error={errors.obraOriginal?.message}
            onElegir={(item) => {
              setOriginal(item)
              setValue('obraOriginal', item?._id ?? '')
            }}
          />
        )}
      </Grupo>

      <Grupo titulo="Clasificación y ubicación">
        <Rejilla>
          {sel('tipoObra', marca('Tipo de obra'), <><option value="">Elige…</option>{opcionesDe(catalogos.tipoObra, obra?.tipoObra?._id)}</>)}
          {sel(
            'procedencia',
            marca('Procedencia'),
            <>
              <option value="">Elige…</option>
              {Object.entries(ETIQUETA_PROCEDENCIA).map(([v, t]) => (
                <option key={v} value={v}>{t}</option>
              ))}
            </>
          )}
          {sel('agrupacion', marca('Agrupación'), <><option value="">Elige…</option>{opcionesDe(catalogos.agrupacion, obra?.agrupacion?._id)}</>)}
        </Rejilla>
        <Controller
          control={control}
          name="carpeta"
          render={({ field }) => (
            <BuscadorRegistro
              label="Carpeta"
              obligatorio
              valor={carpeta}
              mostrar={mostrarCarpeta}
              buscar={buscarCarpetas}
              placeholder="Busca por número de carpeta o ubicación"
              error={errors.carpeta?.message}
              onElegir={(item) => {
                setCarpeta(item)
                field.onChange(item?._id ?? '')
              }}
            />
          )}
        />
        {catalogos.tipoObra.filter((t) => t.activo).length === 0 && (
          <Alerta tipo="info">
            No hay tipos de obra activos. Créalos en <Link to="/catalogos" className="underline">Catálogos</Link> para poder asignarlos.
          </Alerta>
        )}
      </Grupo>

      <Grupo titulo="Instrumentación">
        {errors.instrumentacion?.message && <Alerta>{errors.instrumentacion.message}</Alerta>}
        {instrumentacion.fields.length === 0 && <p className="text-sm text-tinta-suave">Sin instrumentos. Agrega los que use la obra.</p>}
        <ul className="space-y-3">
          {instrumentacion.fields.map((fila, n) => {
            const familiaElegida = filas?.[n]?.familia
            const actuales = obra?.instrumentacion?.[n]
            const delaFamilia = (catalogos.instrumento ?? []).filter((i) => i.familia === familiaElegida)
            const e = errors.instrumentacion?.[n]
            return (
              <li key={fila.id} className="grid items-start gap-3 rounded-md border border-linea p-3 sm:grid-cols-[1fr_1fr_6rem_auto]">
                <Selector
                  label="Familia"
                  error={e?.familia?.message}
                  {...register(`instrumentacion.${n}.familia`, { onChange: () => setValue(`instrumentacion.${n}.instrumento`, '') })}
                >
                  <option value="">Elige…</option>
                  {opcionesDe(catalogos.familiaInstrumento, actuales?.familia?._id)}
                </Selector>
                <Selector label="Instrumento" error={e?.instrumento?.message} disabled={!familiaElegida} {...register(`instrumentacion.${n}.instrumento`)}>
                  <option value="">{familiaElegida ? 'Elige…' : 'Primero la familia'}</option>
                  {opcionesDe(delaFamilia, actuales?.instrumento?._id)}
                </Selector>
                <Campo label="Cantidad" inputMode="numeric" error={e?.cantidad?.message} {...register(`instrumentacion.${n}.cantidad`)} />
                <Boton
                  variante="peligroSuave"
                  className="sm:mt-6"
                  onClick={() => instrumentacion.remove(n)}
                  aria-label={`Quitar el instrumento ${n + 1}`}
                >
                  <FiTrash2 aria-hidden="true" />
                  Quitar
                </Boton>
              </li>
            )
          })}
        </ul>
        <Boton variante="secundario" onClick={() => instrumentacion.append({ familia: '', instrumento: '', cantidad: '1' })}>
          <FiPlus aria-hidden="true" />
          Agregar instrumento
        </Boton>
      </Grupo>

      {tipoRegistro === 'mosaico' && (
        <Grupo titulo="Canciones del mosaico">
          {errors.canciones?.message && <Alerta>{errors.canciones.message}</Alerta>}
          {errors.canciones?.root?.message && <Alerta>{errors.canciones.root.message}</Alerta>}
          {canciones.fields.length === 0 && <p className="text-sm text-tinta-suave">Aún no hay canciones. El orden es el de esta lista.</p>}
          <ol className="space-y-3">
            {canciones.fields.map((fila, n) => {
              const e = errors.canciones?.[n]
              return (
                <li key={fila.id} className="space-y-3 rounded-md border border-linea p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-tinta">Canción {n + 1}</p>
                    <div className="flex gap-1">
                      <Boton variante="fantasma" tamano="pequeno" disabled={n === 0} onClick={() => canciones.swap(n, n - 1)} aria-label={`Subir la canción ${n + 1}`}>
                        <FiArrowUp aria-hidden="true" />
                      </Boton>
                      <Boton variante="fantasma" tamano="pequeno" disabled={n === canciones.fields.length - 1} onClick={() => canciones.swap(n, n + 1)} aria-label={`Bajar la canción ${n + 1}`}>
                        <FiArrowDown aria-hidden="true" />
                      </Boton>
                      <Boton variante="peligroSuave" tamano="pequeno" onClick={() => canciones.remove(n)} aria-label={`Quitar la canción ${n + 1}`}>
                        <FiTrash2 aria-hidden="true" />
                      </Boton>
                    </div>
                  </div>
                  <Rejilla>
                    <Campo label="Título *" autoComplete="off" error={e?.titulo?.message} {...register(`canciones.${n}.titulo`)} />
                    <Campo label="Compositor" autoComplete="off" error={e?.compositor?.message} {...register(`canciones.${n}.compositor`)} />
                    <Campo label="Género" autoComplete="off" error={e?.genero?.message} {...register(`canciones.${n}.genero`)} />
                  </Rejilla>
                  <Campo label="Observación" autoComplete="off" error={e?.observacion?.message} {...register(`canciones.${n}.observacion`)} />
                </li>
              )
            })}
          </ol>
          <Boton variante="secundario" onClick={() => canciones.append({ titulo: '', compositor: '', genero: '', observacion: '' })}>
            <FiPlus aria-hidden="true" />
            Agregar canción
          </Boton>
        </Grupo>
      )}

      <Grupo titulo="Características musicales">
        <Rejilla>
          {campo('tonalidad', 'Tonalidad')}
          {campo('compas', 'Compás')}
          {campo('tiempo', 'Tiempo')}
          {campo('duracion', 'Duración', { placeholder: 'm:ss', ayuda: 'Formato m:ss, por ejemplo 4:05' })}
          {campo('numeroMovimientos', 'Número de movimientos', { inputMode: 'numeric' })}
        </Rejilla>
      </Grupo>

      <Grupo titulo="Edición y material">
        <Rejilla>
          {campo('edicion', 'Edición')}
          {campo('formato', 'Formato')}
          {campo('detalleMaterial', 'Detalle del material')}
          {campo('estadoMaterial', 'Estado del material')}
          {sel('factibleSinVoz', 'Factible sin voz', <><option value="">Sin dato</option><option value="si">Sí</option><option value="no">No</option></>)}
        </Rejilla>
      </Grupo>

      <Grupo titulo="Conciertos históricos y notas">
        <Rejilla>
          {campo('directorConcierto', 'Director del concierto')}
          {campo('solistaConcierto', 'Solista del concierto')}
        </Rejilla>
        <AreaTexto label="Observaciones" error={errors.observaciones?.message} {...register('observaciones')} />
        <label className="flex items-start gap-2 text-sm text-tinta">
          <input type="checkbox" className="mt-1 size-4" {...register('requiereRevision')} />
          <span>Marcar para revisión (la obra aparecerá con la marca «Revisar»)</span>
        </label>
      </Grupo>

      <div className="flex flex-wrap justify-end gap-2">
        <Boton variante="secundario" onClick={() => navigate(editando ? `/obras/${obra._id}` : '/obras')} disabled={isSubmitting}>
          Cancelar
        </Boton>
        <Boton type="submit" cargando={isSubmitting}>
          {editando ? 'Guardar cambios' : 'Registrar obra'}
        </Boton>
      </div>
    </form>
  )
}

export default function ObraFormulario() {
  const { id } = useParams()
  const editando = Boolean(id)
  const catalogos = useCatalogos()
  const consultar = useCallback((signal) => (id ? obtenerObra(id, signal) : Promise.resolve(null)), [id])
  const ficha = useConsulta(consultar)

  const volver = (
    <Link to={id ? `/obras/${id}` : '/obras'} className="inline-flex items-center gap-1 text-sm text-marca-700 underline underline-offset-2">
      <FiArrowLeft aria-hidden="true" />
      {id ? 'Volver a la obra' : 'Volver a obras'}
    </Link>
  )

  const error = catalogos.error || ficha.error
  const listo = catalogos.datos && (!editando || ficha.datos)

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      {volver}
      <h2 className="text-2xl font-semibold text-tinta">{editando ? 'Editar obra' : 'Nueva obra'}</h2>

      {error && !listo && (
        <Alerta>
          <p>{error}</p>
          <Boton variante="secundario" tamano="pequeno" className="mt-2" onClick={() => { catalogos.recargar(); ficha.recargar() }}>
            Reintentar
          </Boton>
        </Alerta>
      )}
      {!listo && !error && <Cargando texto="Cargando…" />}

      {listo && editando && !ficha.datos.obra.activa && (
        <Alerta tipo="aviso">La obra está inactiva. Actívala desde su ficha para poder modificarla.</Alerta>
      )}
      {listo && (!editando || ficha.datos.obra.activa) && (
        <Formulario key={ficha.datos?.obra._id ?? 'nueva'} obra={ficha.datos?.obra ?? null} catalogos={catalogos.datos} />
      )}
    </div>
  )
}
