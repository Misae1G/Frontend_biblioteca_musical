import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useDebounce } from './useDebounce'

// Filtros y página guardados en la URL: al volver desde una ficha se conserva la búsqueda.
// cambiar({ clave: valor }): un valor vacío quita el filtro; cualquier cambio vuelve a la página 1
// (salvo que el cambio sea la propia página).
export function useFiltrosUrl() {
  const [params, setParams] = useSearchParams()
  const valor = (clave) => params.get(clave) ?? ''
  const pagina = Math.max(1, Number(params.get('pagina')) || 1)

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

  return { params, valor, pagina, cambiar, vaciar: (conservar = {}) => setParams(conservar, { replace: true }) }
}

// Campo de texto con retraso que escribe su valor en la URL
export function useTextoEnUrl(clave, params, cambiar) {
  const enUrl = params.get(clave) ?? ''
  const [texto, setTexto] = useState(enUrl)
  const retrasado = useDebounce(texto.trim(), 350)
  useEffect(() => {
    if (retrasado !== enUrl) cambiar({ [clave]: retrasado })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [retrasado])
  return [texto, setTexto]
}
