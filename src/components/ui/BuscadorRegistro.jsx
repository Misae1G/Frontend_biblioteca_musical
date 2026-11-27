import { useEffect, useId, useState } from 'react'
import { isCancel } from 'axios'
import { FiAlertCircle } from 'react-icons/fi'
import { useDebounce } from '../../hooks/useDebounce'
import { mensajeDeError } from '../../utils/errores'
import Boton from './Boton'

// Elige UN registro de una lista grande (carpetas, obras) buscando por texto.
// buscar(texto, signal) -> Promise<array>; mostrar(item) -> texto; valor: item elegido o null.
export default function BuscadorRegistro({ label, valor, mostrar, buscar, onElegir, error, ayuda, placeholder, obligatorio = false }) {
  const id = useId()
  const [texto, setTexto] = useState('')
  const consulta = useDebounce(texto.trim(), 300)
  const [estado, setEstado] = useState({ items: [], cargando: false, error: '' })

  useEffect(() => {
    if (valor || !consulta) {
      setEstado({ items: [], cargando: false, error: '' })
      return undefined
    }
    const controlador = new AbortController()
    setEstado((p) => ({ ...p, cargando: true, error: '' }))
    buscar(consulta, controlador.signal)
      .then((items) => setEstado({ items, cargando: false, error: '' }))
      .catch((e) => {
        if (!isCancel(e)) setEstado({ items: [], cargando: false, error: mensajeDeError(e) })
      })
    return () => controlador.abort()
    // `buscar` suele ser una función nueva en cada render: solo importa el texto buscado
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [consulta, valor])

  const idError = `${id}-error`
  const idLista = `${id}-lista`

  return (
    <div>
      <span id={`${id}-etiqueta`} className="mb-1 block text-sm font-medium text-tinta">
        {label}
        {obligatorio && <span aria-hidden="true"> *</span>}
      </span>

      {valor ? (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-linea bg-hundido px-3 py-2">
          <p className="text-tinta">{mostrar(valor)}</p>
          <Boton variante="fantasma" tamano="pequeno" onClick={() => onElegir(null)} aria-label={`Cambiar: ${label}`}>
            Cambiar
          </Boton>
        </div>
      ) : (
        <>
          <input
            type="search"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder={placeholder}
            maxLength={100}
            aria-labelledby={`${id}-etiqueta`}
            aria-invalid={error ? true : undefined}
            aria-describedby={[error && idError, consulta && idLista].filter(Boolean).join(' ') || undefined}
            className={`block min-h-10 w-full rounded-md border bg-superficie px-3 py-2 text-tinta ${error ? 'border-peligro' : 'border-linea'}`}
          />
          {consulta && (
            <div id={idLista} className="mt-2" aria-live="polite">
              {estado.error ? (
                <p className="text-sm text-peligro">{estado.error}</p>
              ) : estado.cargando ? (
                <p className="text-sm text-tinta-suave">Buscando…</p>
              ) : estado.items.length === 0 ? (
                <p className="text-sm text-tinta-suave">Sin resultados.</p>
              ) : (
                <ul className="divide-y divide-linea rounded-md border border-linea">
                  {estado.items.map((item) => (
                    <li key={item._id} className="flex items-center justify-between gap-2 px-3 py-2 text-sm">
                      <span>{mostrar(item)}</span>
                      <Boton variante="secundario" tamano="pequeno" onClick={() => { setTexto(''); onElegir(item) }} aria-label={`Elegir ${mostrar(item)}`}>
                        Elegir
                      </Boton>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </>
      )}

      {ayuda && <p className="mt-1 text-sm text-tinta-suave">{ayuda}</p>}
      {error && (
        <p id={idError} className="mt-1 flex items-start gap-1 text-sm text-peligro">
          <FiAlertCircle className="mt-0.5 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </p>
      )}
    </div>
  )
}
