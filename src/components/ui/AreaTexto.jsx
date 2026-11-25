import { forwardRef, useId } from 'react'
import { FiAlertCircle } from 'react-icons/fi'

// Texto de varias líneas, con la misma apariencia que Campo
const AreaTexto = forwardRef(function AreaTexto({ label, error, ayuda, rows = 3, className = '', ...resto }, ref) {
  const id = useId()
  const idError = `${id}-error`
  const idAyuda = `${id}-ayuda`
  const describe = [error && idError, ayuda && idAyuda].filter(Boolean).join(' ') || undefined

  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-tinta">
        {label}
      </label>
      <textarea
        id={id}
        ref={ref}
        rows={rows}
        aria-invalid={error ? true : undefined}
        aria-describedby={describe}
        className={`block w-full resize-y rounded-md border bg-superficie px-3 py-2 text-tinta ${
          error ? 'border-peligro' : 'border-linea'
        }`}
        {...resto}
      />
      {ayuda && (
        <p id={idAyuda} className="mt-1 text-sm text-tinta-suave">
          {ayuda}
        </p>
      )}
      {error && (
        <p id={idError} className="mt-1 flex items-start gap-1 text-sm text-peligro">
          <FiAlertCircle className="mt-0.5 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </p>
      )}
    </div>
  )
})

export default AreaTexto
