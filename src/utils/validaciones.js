import { z } from 'zod'

// Misma regla que el backend (src/validators/auth.js)
export const passwordNuevaSchema = z
  .string()
  .min(8, 'La contraseña debe tener al menos 8 caracteres')
  .refine((v) => new TextEncoder().encode(v).length <= 72, 'La contraseña es demasiado larga (máximo 72 caracteres)')
  .refine((v) => /[A-Za-z]/.test(v) && /\d/.test(v), 'La contraseña debe incluir letras y números')
