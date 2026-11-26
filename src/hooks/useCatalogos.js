import { useCallback } from 'react'
import { listarCatalogos } from '../api/catalogos'
import { useConsulta } from './useConsulta'

const TIPOS = ['tipoObra', 'agrupacion', 'familiaInstrumento', 'instrumento']

// Trae los 4 catálogos completos (activos e inactivos: una obra puede conservar valores inactivos).
// datos = { tipoObra: [], agrupacion: [], familiaInstrumento: [], instrumento: [] }
export function useCatalogos() {
  const consultar = useCallback(
    async (signal) => {
      const listas = await Promise.all(TIPOS.map((tipo) => listarCatalogos({ tipo }, signal).then((r) => r.catalogos)))
      return Object.fromEntries(TIPOS.map((tipo, n) => [tipo, listas[n]]))
    },
    []
  )
  return useConsulta(consultar)
}
