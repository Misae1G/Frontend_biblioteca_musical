import { useEffect, useState } from 'react'
import { isCancel } from 'axios'
import { mensajeDeError } from '../utils/errores'

// Ejecuta una consulta al backend y devuelve { datos, cargando, error, recargar }.
// - `consultar(signal)` debe estar memorizada con useCallback: cuando cambia, se vuelve a consultar.
// - Cancela la consulta anterior si llega otra (o si el componente se cierra).
// - Mientras recarga conserva los datos anteriores para que la pantalla no parpadee.
export function useConsulta(consultar) {
  const [estado, setEstado] = useState({ datos: null, cargando: true, error: '' })
  const [recarga, setRecarga] = useState(0)

  useEffect(() => {
    const controlador = new AbortController()
    setEstado((previo) => ({ ...previo, cargando: true, error: '' }))
    consultar(controlador.signal)
      .then((datos) => setEstado({ datos, cargando: false, error: '' }))
      .catch((error) => {
        if (!isCancel(error)) setEstado((previo) => ({ ...previo, cargando: false, error: mensajeDeError(error) }))
      })
    return () => controlador.abort()
  }, [consultar, recarga])

  return { ...estado, recargar: () => setRecarga((n) => n + 1) }
}
