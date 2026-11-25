import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import Boton from './Boton'

// Los listados del backend responden { total, pagina, paginas }
export default function Paginacion({ pagina, paginas, total, etiqueta = 'registros', onCambiar, deshabilitado = false }) {
  if (!total) return null

  return (
    <nav aria-label="Paginación" className="flex flex-wrap items-center justify-between gap-3 text-sm">
      <p className="text-tinta-suave" aria-live="polite">
        {total} {etiqueta} · Página {pagina} de {paginas}
      </p>
      <div className="flex gap-2">
        <Boton variante="secundario" disabled={deshabilitado || pagina <= 1} onClick={() => onCambiar(pagina - 1)}>
          <FiChevronLeft aria-hidden="true" />
          Anterior
        </Boton>
        <Boton variante="secundario" disabled={deshabilitado || pagina >= paginas} onClick={() => onCambiar(pagina + 1)}>
          Siguiente
          <FiChevronRight aria-hidden="true" />
        </Boton>
      </div>
    </nav>
  )
}
