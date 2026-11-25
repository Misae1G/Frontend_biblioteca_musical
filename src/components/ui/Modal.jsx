import { useEffect, useId, useRef } from 'react'

// Ventana modal con el <dialog> nativo: el navegador se encarga del foco, de Escape y del fondo bloqueado.
// El contenido solo se monta mientras está abierta, así los formularios arrancan limpios cada vez.
// `bloqueado` impide cerrarla (por ejemplo, mientras se guarda).
export default function Modal({ abierto, onCerrar, titulo, ancho = 'max-w-md', bloqueado = false, children }) {
  const ref = useRef(null)
  const idTitulo = useId()

  useEffect(() => {
    const dialogo = ref.current
    if (abierto && !dialogo.open) dialogo.showModal()
    if (!abierto && dialogo.open) dialogo.close()
  }, [abierto])

  return (
    <dialog
      ref={ref}
      aria-labelledby={idTitulo}
      onCancel={(e) => bloqueado && e.preventDefault()}
      onClose={onCerrar}
      onClick={(e) => e.target === ref.current && !bloqueado && onCerrar()}
      className={`m-auto max-h-[90vh] w-[calc(100%-2rem)] ${ancho} overflow-y-auto rounded-lg bg-superficie p-0 text-tinta shadow-xl backdrop:bg-tinta/50`}
    >
      {abierto && (
        <div className="p-6">
          <h2 id={idTitulo} className="mb-4 text-xl font-semibold text-marca-700">
            {titulo}
          </h2>
          {children}
        </div>
      )}
    </dialog>
  )
}
