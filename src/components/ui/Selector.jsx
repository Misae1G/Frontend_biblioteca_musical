import { forwardRef, useId } from 'react'
import { FiAlertCircle } from 'react-icons/fi'

// Lista desplegable accesible, con la misma apariencia que Campo
const Selector = forwardRef(function Selector({ label, error, className = '', children, ...resto }, ref) {
  const id = useId()
  const idError = `${id}-error`

  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-tinta">
        {label}
      </label>
      <select
        id={id}
        ref={ref}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? idError : undefined}
        className={`block min-h-10 w-full rounded-md border bg-superficie px-3 py-2 text-tinta ${
          error ? 'border-peligro' : 'border-linea'
        }`}
        {...resto}
      >
        {children}
      </select>
      {error && (
        <p id={idError} className="mt-1 flex items-start gap-1 text-sm text-peligro">
          <FiAlertCircle className="mt-0.5 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </p>
      )}
    </div>
  )
})

export default Selector
