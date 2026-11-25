// El backend responde los errores como { msg, errores? }

export const mensajeDeError = (error) => {
  if (error.response) return error.response.data?.msg ?? 'Ocurrió un error inesperado'
  if (error.code === 'ECONNABORTED') return 'La solicitud tardó demasiado. Inténtalo de nuevo'
  return 'No se pudo conectar con el servidor'
}

// Pinta los errores por campo en React Hook Form y devuelve el mensaje general
// para mostrarlo en el formulario.
export const manejarErrorApi = (error, setError) => {
  const errores = error.response?.data?.errores
  if (errores && setError) {
    for (const [campo, mensaje] of Object.entries(errores)) {
      setError(campo, { type: 'server', message: mensaje })
    }
  }
  return mensajeDeError(error)
}
