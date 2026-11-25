// Contenedor de las pantallas sin sesión (login, recuperar, restablecer, cambio obligatorio).
// Escritorio: panel vino con la marca a la izquierda y el formulario a la derecha.
// Móvil: solo el formulario, con la marca arriba.
export default function PantallaAuth({ titulo, descripcion, children }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden flex-col justify-between bg-marca-700 p-12 lg:flex">
        <p className="text-xs font-medium uppercase tracking-[0.3em] text-laton-claro">OSNE</p>

        <div>
          <p className="max-w-xs font-titulo text-5xl leading-tight text-papel">Biblioteca Musical</p>
          <p className="mt-6 max-w-xs text-base text-marca-100">
            Catálogo de obras, carpetas, préstamos e interpretaciones de la orquesta.
          </p>
        </div>

        <p className="text-xs text-marca-100/60">Acceso solo para personal autorizado</p>
      </div>

      <main className="flex items-center justify-center bg-papel px-6 py-10">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-laton-texto">OSNE</p>
            <p className="mt-1 font-titulo text-2xl text-marca-700">Biblioteca Musical</p>
          </div>

          <h1 className="text-3xl text-tinta">{titulo}</h1>
          {descripcion && <p className="mt-1 text-sm text-tinta-suave">{descripcion}</p>}
          <div className="mt-6">{children}</div>
        </div>
      </main>
    </div>
  )
}
