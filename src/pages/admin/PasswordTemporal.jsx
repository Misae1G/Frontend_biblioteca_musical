import { useState } from 'react'
import { FiCheck, FiCopy } from 'react-icons/fi'
import Alerta from '../../components/ui/Alerta'
import Boton from '../../components/ui/Boton'

// Muestra UNA vez la contraseña temporal (el backend no la vuelve a entregar).
// Solo vive en el estado de la página mientras este diálogo está abierto.
export default function PasswordTemporal({ cuenta, password, onCerrar }) {
  const [estadoCopia, setEstadoCopia] = useState('') // '' | 'copiado' | 'error'

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(password)
      setEstadoCopia('copiado')
    } catch {
      setEstadoCopia('error')
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-tinta-suave">
        Cuenta de <strong className="text-tinta">{cuenta.nombre}</strong>
        {cuenta.nombreUsuario && (
          <>
            {' '}
            (usuario: <span className="font-mono text-tinta">{cuenta.nombreUsuario}</span>)
          </>
        )}
        .
      </p>

      <div>
        <p className="mb-1 text-sm font-medium text-tinta">Contraseña temporal</p>
        <div className="flex items-stretch gap-2">
          <code className="flex-1 select-all break-all rounded-md border border-linea bg-hundido px-3 py-2 font-mono text-lg tracking-wide">
            {password}
          </code>
          <Boton variante="secundario" onClick={copiar} aria-label="Copiar contraseña">
            {estadoCopia === 'copiado' ? <FiCheck aria-hidden="true" /> : <FiCopy aria-hidden="true" />}
            {estadoCopia === 'copiado' ? 'Copiada' : 'Copiar'}
          </Boton>
        </div>
        {estadoCopia === 'error' && (
          <p role="status" className="mt-1 text-sm text-tinta-suave">
            No se pudo copiar automáticamente. Selecciónala y cópiala a mano.
          </p>
        )}
      </div>

      <Alerta tipo="aviso">
        Anótala o cópiala ahora: <strong>no se volverá a mostrar</strong>. Entrégala a la persona; deberá cambiarla al
        iniciar sesión.
      </Alerta>

      <div className="flex justify-end pt-2">
        <Boton onClick={onCerrar}>Listo, ya la entregué</Boton>
      </div>
    </div>
  )
}
