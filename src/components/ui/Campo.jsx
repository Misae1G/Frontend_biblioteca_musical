import { forwardRef, useId, useState } from 'react'
import { FiAlertCircle, FiEye, FiEyeOff } from 'react-icons/fi'

// Campo de formulario accesible: etiqueta, ayuda y error asociados al input.
// Con type="password" agrega el botón para mostrar u ocultar.
const Campo = forwardRef(function Campo({ label, error, ayuda, type = 'text', className = '', ...resto }, ref) {
  const id = useId()
  const idError = `${id}-error`
  const idAyuda = `${id}-ayuda`
  const [visible, setVisible] = useState(false)
  const esPassword = type === 'password'
  const describe = [error && idError, ayuda && idAyuda].filter(Boolean).join(' ') || undefined

  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-tinta">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          ref={ref}
          type={esPassword && visible ? 'text' : type}
          aria-invalid={error ? true : undefined}
          aria-describedby={describe}
          className={`block min-h-10 w-full rounded-md border bg-superficie px-3 py-2 text-tinta placeholder:text-tinta-suave/70 ${
            error ? 'border-peligro' : 'border-linea'
          } ${esPassword ? 'pr-11' : ''}`}
          {...resto}
        />
        {esPassword && (
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            aria-pressed={visible}
            className="absolute inset-y-0 right-0 flex w-10 items-center justify-center rounded-r-md text-tinta-suave hover:text-tinta"
          >
            {visible ? <FiEyeOff aria-hidden="true" /> : <FiEye aria-hidden="true" />}
          </button>
        )}
      </div>
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

export default Campo
