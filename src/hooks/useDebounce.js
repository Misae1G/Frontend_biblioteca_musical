import { useEffect, useState } from 'react'

// Devuelve el valor solo después de que deja de cambiar durante `ms` milisegundos (para búsquedas)
export function useDebounce(valor, ms = 350) {
  const [retrasado, setRetrasado] = useState(valor)

  useEffect(() => {
    const temporizador = setTimeout(() => setRetrasado(valor), ms)
    return () => clearTimeout(temporizador)
  }, [valor, ms])

  return retrasado
}
