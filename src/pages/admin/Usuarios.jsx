import { useEffect, useState } from 'react'
import { isCancel } from 'axios'
import { toast } from 'react-toastify'
import { FiCheckCircle, FiKey, FiPlus, FiSlash } from 'react-icons/fi'
import { cambiarEstadoUsuario, listarUsuarios, restablecerPasswordUsuario } from '../../api/usuarios'
import Alerta from '../../components/ui/Alerta'
import Boton from '../../components/ui/Boton'
import Campo from '../../components/ui/Campo'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import Cargando from '../../components/ui/Cargando'
import Etiqueta from '../../components/ui/Etiqueta'
import Modal from '../../components/ui/Modal'
import Paginacion from '../../components/ui/Paginacion'
import Selector from '../../components/ui/Selector'
import { useDebounce } from '../../hooks/useDebounce'
import { ETIQUETA_ROL } from '../../layout/menu'
import { useAuth } from '../../store/authStore'
import { mensajeDeError } from '../../utils/errores'
import { formatearFechaHora } from '../../utils/fechas'
import FormularioUsuario from './FormularioUsuario'
import PasswordTemporal from './PasswordTemporal'

const LIMITE = 20

function InsigniasCuenta({ cuenta }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <Etiqueta tono={cuenta.rol === 'administrador' ? 'marca' : 'info'}>{ETIQUETA_ROL[cuenta.rol]}</Etiqueta>
      {cuenta.activo ? (
        <Etiqueta tono="ok" Icono={FiCheckCircle}>
          Activa
        </Etiqueta>
      ) : (
        <Etiqueta tono="neutro" Icono={FiSlash}>
          Desactivada
        </Etiqueta>
      )}
      {cuenta.debeCambiarPassword && (
        <Etiqueta tono="aviso" Icono={FiKey}>
          Contraseña temporal
        </Etiqueta>
      )}
    </div>
  )
}

// El backend solo permite editar y restablecer cuentas con rol "usuario",
// y un administrador no puede desactivarse a sí mismo.
function Acciones({ cuenta, esYo, onEditar, onRestablecer, onEstado }) {
  const esUsuario = cuenta.rol === 'usuario'
  return (
    <div className="flex flex-wrap gap-1">
      {esUsuario && (
        <Boton variante="fantasma" tamano="pequeno" onClick={() => onEditar(cuenta)} aria-label={`Editar a ${cuenta.nombre}`}>
          Editar
        </Boton>
      )}
      {esUsuario && (
        <Boton
          variante="fantasma"
          tamano="pequeno"
          onClick={() => onRestablecer(cuenta)}
          aria-label={`Restablecer la contraseña de ${cuenta.nombre}`}
        >
          Restablecer contraseña
        </Boton>
      )}
      <Boton
        variante={cuenta.activo ? 'peligroSuave' : 'fantasma'}
        tamano="pequeno"
        disabled={esYo && cuenta.activo}
        title={esYo && cuenta.activo ? 'No puedes desactivar tu propia cuenta' : undefined}
        onClick={() => onEstado(cuenta)}
        aria-label={`${cuenta.activo ? 'Desactivar' : 'Activar'} la cuenta de ${cuenta.nombre}`}
      >
        {cuenta.activo ? 'Desactivar' : 'Activar'}
      </Boton>
    </div>
  )
}

const textosConfirmacion = (confirmacion) => {
  if (!confirmacion) return {}
  const { tipo, cuenta } = confirmacion
  if (tipo === 'password') {
    return {
      titulo: 'Restablecer contraseña',
      boton: 'Restablecer contraseña',
      variante: 'primario',
      mensaje: [
        `Se generará una contraseña temporal nueva para ${cuenta.nombre}.`,
        'La contraseña actual dejará de funcionar y sus sesiones abiertas se cerrarán.',
      ],
    }
  }
  return cuenta.activo
    ? {
        titulo: 'Desactivar cuenta',
        boton: 'Desactivar',
        variante: 'peligro',
        mensaje: [
          `¿Desactivar la cuenta de ${cuenta.nombre}?`,
          'No podrá iniciar sesión y sus sesiones abiertas dejarán de funcionar. Podrás activarla de nuevo.',
        ],
      }
    : {
        titulo: 'Activar cuenta',
        boton: 'Activar',
        variante: 'primario',
        mensaje: [`¿Activar la cuenta de ${cuenta.nombre}? Podrá volver a iniciar sesión.`],
      }
}

export default function Usuarios() {
  const yo = useAuth((s) => s.usuario)

  // Filtros y paginación
  const [q, setQ] = useState('')
  const [rol, setRol] = useState('')
  const [activo, setActivo] = useState('')
  const [pagina, setPagina] = useState(1)
  const qRetrasado = useDebounce(q.trim(), 350)

  // Datos
  const [datos, setDatos] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [recarga, setRecarga] = useState(0)

  // Diálogos
  const [formulario, setFormulario] = useState(null) // { usuario: null } crea, { usuario } edita
  const [confirmacion, setConfirmacion] = useState(null) // { tipo: 'estado' | 'password', cuenta }
  const [procesando, setProcesando] = useState(false)
  const [temporal, setTemporal] = useState(null) // { titulo, cuenta, password }

  useEffect(() => {
    const controlador = new AbortController()
    setCargando(true)
    setError('')
    listarUsuarios({ q: qRetrasado, rol, activo, pagina, limite: LIMITE }, controlador.signal)
      .then((respuesta) => {
        // Si la página quedó vacía (p. ej. se desactivó la última cuenta de un filtro), se retrocede una
        if (!respuesta.usuarios.length && pagina > 1) setPagina(pagina - 1)
        else setDatos(respuesta)
      })
      .catch((e) => {
        if (!isCancel(e)) setError(mensajeDeError(e))
      })
      .finally(() => {
        if (!controlador.signal.aborted) setCargando(false)
      })
    return () => controlador.abort()
  }, [qRetrasado, rol, activo, pagina, recarga])

  const recargar = () => setRecarga((n) => n + 1)

  const cambiarFiltro = (poner) => (e) => {
    poner(e.target.value)
    setPagina(1)
  }

  const alGuardar = (respuesta) => {
    const eraNueva = !formulario.usuario
    setFormulario(null)
    if (eraNueva) {
      setTemporal({ titulo: 'Usuario creado', cuenta: respuesta.usuario, password: respuesta.passwordTemporal })
    } else {
      toast.success('Usuario actualizado')
    }
    recargar()
  }

  const confirmar = async () => {
    setProcesando(true)
    try {
      const { tipo, cuenta } = confirmacion
      if (tipo === 'estado') {
        await cambiarEstadoUsuario(cuenta._id, !cuenta.activo)
        toast.success(cuenta.activo ? 'Cuenta desactivada' : 'Cuenta activada')
      } else {
        const respuesta = await restablecerPasswordUsuario(cuenta._id)
        setTemporal({
          titulo: 'Contraseña restablecida',
          cuenta: respuesta.usuario,
          password: respuesta.passwordTemporal,
        })
      }
      recargar()
    } catch (e) {
      toast.error(mensajeDeError(e))
    } finally {
      setProcesando(false)
      setConfirmacion(null)
    }
  }

  const acciones = (cuenta) => (
    <Acciones
      cuenta={cuenta}
      esYo={cuenta._id === yo._id}
      onEditar={(c) => setFormulario({ usuario: c })}
      onRestablecer={(c) => setConfirmacion({ tipo: 'password', cuenta: c })}
      onEstado={(c) => setConfirmacion({ tipo: 'estado', cuenta: c })}
    />
  )

  const nombreConMarca = (cuenta) => (
    <span className="flex flex-wrap items-center gap-2">
      <span className="font-medium text-tinta">{cuenta.nombre}</span>
      {cuenta._id === yo._id && <Etiqueta tono="laton">Tú</Etiqueta>}
    </span>
  )

  const textos = textosConfirmacion(confirmacion)
  const cuentas = datos?.usuarios ?? []

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-xl text-sm text-tinta-suave">
          Crea y administra las cuentas de los usuarios del sistema. Las cuentas de administrador solo se pueden
          activar o desactivar.
        </p>
        <Boton onClick={() => setFormulario({ usuario: null })}>
          <FiPlus aria-hidden="true" />
          Nuevo usuario
        </Boton>
      </div>

      <section aria-label="Filtros" className="grid gap-4 rounded-lg border border-linea bg-superficie p-4 sm:grid-cols-3">
        <Campo
          label="Buscar"
          type="search"
          placeholder="Nombre, usuario o correo"
          maxLength={100}
          value={q}
          onChange={cambiarFiltro(setQ)}
        />
        <Selector label="Rol" value={rol} onChange={cambiarFiltro(setRol)}>
          <option value="">Todos</option>
          <option value="administrador">Administrador</option>
          <option value="usuario">Usuario</option>
        </Selector>
        <Selector label="Estado" value={activo} onChange={cambiarFiltro(setActivo)}>
          <option value="">Todos</option>
          <option value="true">Activas</option>
          <option value="false">Desactivadas</option>
        </Selector>
      </section>

      {error && (
        <Alerta>
          <p>{error}</p>
          <Boton variante="secundario" tamano="pequeno" className="mt-2" onClick={recargar}>
            Reintentar
          </Boton>
        </Alerta>
      )}

      {cargando && !datos && <Cargando texto="Cargando cuentas…" />}

      {datos && (
        <div aria-busy={cargando} className={cargando ? 'opacity-60 transition-opacity' : 'transition-opacity'}>
          {cuentas.length === 0 ? (
            <p className="rounded-lg border border-linea bg-superficie p-8 text-center text-tinta-suave">
              No hay cuentas que coincidan con los filtros.
            </p>
          ) : (
            <>
              {/* Pantallas medianas y grandes: tabla */}
              <div className="hidden overflow-x-auto rounded-lg border border-linea bg-superficie md:block">
                <table className="w-full text-left text-sm">
                  <caption className="sr-only">Cuentas del sistema</caption>
                  <thead className="border-b border-linea bg-hundido text-tinta-suave">
                    <tr>
                      <th scope="col" className="px-4 py-3 font-medium">Nombre</th>
                      <th scope="col" className="px-4 py-3 font-medium">Cuenta</th>
                      <th scope="col" className="px-4 py-3 font-medium">Rol y estado</th>
                      <th scope="col" className="px-4 py-3 font-medium">Último acceso</th>
                      <th scope="col" className="px-4 py-3 font-medium">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-linea">
                    {cuentas.map((cuenta) => (
                      <tr key={cuenta._id}>
                        <td className="px-4 py-3">{nombreConMarca(cuenta)}</td>
                        <td className="px-4 py-3 text-tinta-suave">{cuenta.correo ?? cuenta.nombreUsuario}</td>
                        <td className="px-4 py-3">
                          <InsigniasCuenta cuenta={cuenta} />
                        </td>
                        <td className="px-4 py-3 text-tinta-suave">{formatearFechaHora(cuenta.ultimoAcceso, 'Nunca')}</td>
                        <td className="px-4 py-3">{acciones(cuenta)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Móvil: tarjetas */}
              <ul className="space-y-3 md:hidden">
                {cuentas.map((cuenta) => (
                  <li key={cuenta._id} className="space-y-2 rounded-lg border border-linea bg-superficie p-4">
                    {nombreConMarca(cuenta)}
                    <p className="text-sm text-tinta-suave">{cuenta.correo ?? cuenta.nombreUsuario}</p>
                    <InsigniasCuenta cuenta={cuenta} />
                    <p className="text-xs text-tinta-suave">
                      Último acceso: {formatearFechaHora(cuenta.ultimoAcceso, 'Nunca')}
                    </p>
                    {acciones(cuenta)}
                  </li>
                ))}
              </ul>
            </>
          )}

          <div className="mt-4">
            <Paginacion
              pagina={datos.pagina}
              paginas={datos.paginas}
              total={datos.total}
              etiqueta={datos.total === 1 ? 'cuenta' : 'cuentas'}
              deshabilitado={cargando}
              onCambiar={setPagina}
            />
          </div>
        </div>
      )}

      <Modal
        abierto={Boolean(formulario)}
        onCerrar={() => setFormulario(null)}
        titulo={formulario?.usuario ? 'Editar usuario' : 'Nuevo usuario'}
      >
        {formulario && (
          <FormularioUsuario usuario={formulario.usuario} onGuardado={alGuardar} onCerrar={() => setFormulario(null)} />
        )}
      </Modal>

      <ConfirmDialog
        abierto={Boolean(confirmacion)}
        titulo={textos.titulo}
        textoConfirmar={textos.boton}
        variante={textos.variante}
        cargando={procesando}
        onConfirmar={confirmar}
        onCerrar={() => setConfirmacion(null)}
      >
        {textos.mensaje?.map((linea) => (
          <p key={linea}>{linea}</p>
        ))}
      </ConfirmDialog>

      <Modal abierto={Boolean(temporal)} onCerrar={() => setTemporal(null)} titulo={temporal?.titulo ?? ''} bloqueado>
        {temporal && (
          <PasswordTemporal cuenta={temporal.cuenta} password={temporal.password} onCerrar={() => setTemporal(null)} />
        )}
      </Modal>
    </div>
  )
}
