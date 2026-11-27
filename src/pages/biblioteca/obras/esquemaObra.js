import { z } from 'zod'
import { formatearDuracion } from '../../../utils/fechas'

const anioMaximo = new Date().getFullYear() + 1
const texto = (max) => z.string().trim().max(max, `Máximo ${max} caracteres`)

const anio = z
  .string()
  .trim()
  .refine((v) => v === '' || (/^\d{4}$/.test(v) && Number(v) >= 1000 && Number(v) <= anioMaximo), `Año entre 1000 y ${anioMaximo}`)

// "4:05" o "1:02:30" -> segundos. Vacío -> undefined. Inválido -> NaN
export const aSegundos = (valor) => {
  const v = valor.trim()
  if (!v) return undefined
  const m = /^(?:(\d+):)?(\d+):([0-5]\d)$/.exec(v)
  if (!m) return NaN
  const [, h = '0', min, s] = m
  if (m[1] !== undefined && Number(min) > 59) return NaN
  return Number(h) * 3600 + Number(min) * 60 + Number(s)
}

const instrumento = z.object({
  familia: z.string().min(1, 'Elige la familia'),
  instrumento: z.string().min(1, 'Elige el instrumento'),
  cantidad: z.string().trim().refine((v) => /^\d+$/.test(v) && Number(v) >= 1 && Number(v) <= 500, 'Entre 1 y 500'),
})

const cancion = z.object({
  titulo: z.string().trim().min(1, 'El título de la canción es obligatorio').max(200, 'Máximo 200 caracteres'),
  compositor: texto(150),
  genero: texto(100),
  observacion: texto(300),
})

// `completo`: una obra nueva, o una ya completa, debe quedar completa. Una obra pendiente puede guardarse por partes.
export const crearEsquema = ({ completo }) =>
  z
    .object({
      // Los obligatorios se comprueban en superRefine para que todos los errores salgan juntos
      titulo: texto(200),
      tipoRegistro: z.string(),
      autor: texto(150),
      arreglista: texto(150),
      orquestador: texto(150),
      opus: texto(50),
      anioComposicion: anio,
      anioArreglo: anio,
      tipoObra: z.string(),
      procedencia: z.string(),
      agrupacion: z.string(),
      instrumentacion: z.array(instrumento).max(60, 'Hay demasiados instrumentos'),
      tonalidad: texto(50),
      compas: texto(50),
      tiempo: texto(50),
      duracion: z
        .string()
        .refine((v) => {
          const s = aSegundos(v)
          return s === undefined || (Number.isInteger(s) && s <= 86400)
        }, 'Usa el formato m:ss (por ejemplo 4:05)'),
      numeroMovimientos: z
        .string()
        .trim()
        .refine((v) => v === '' || (/^\d+$/.test(v) && Number(v) >= 1 && Number(v) <= 50), 'Entero entre 1 y 50'),
      edicion: texto(150),
      formato: texto(150),
      detalleMaterial: texto(200),
      estadoMaterial: texto(150),
      factibleSinVoz: z.string(),
      directorConcierto: texto(150),
      solistaConcierto: texto(150),
      requiereRevision: z.boolean(),
      carpeta: z.string(),
      observaciones: texto(1000),
      obraOriginal: z.string(),
      canciones: z.array(cancion).max(100, 'Hay demasiadas canciones'),
    })
    .superRefine((d, ctx) => {
      const falta = (path, message) => ctx.addIssue({ code: 'custom', path: [path], message })
      if (!d.titulo) falta('titulo', 'El título es obligatorio')
      if (!['original', 'adaptacion', 'mosaico'].includes(d.tipoRegistro)) falta('tipoRegistro', 'Elige el tipo de registro')
      if (!d.carpeta) falta('carpeta', 'La carpeta es obligatoria')
      const repetidos = new Set(d.instrumentacion.map((f) => f.instrumento).filter(Boolean))
      if (repetidos.size !== d.instrumentacion.filter((f) => f.instrumento).length) {
        falta('instrumentacion', 'Hay instrumentos repetidos en la instrumentación')
      }
      if (!completo) return
      if (!d.tipoObra) falta('tipoObra', 'Elige el tipo de obra')
      if (!d.procedencia) falta('procedencia', 'Elige la procedencia')
      if (!d.agrupacion) falta('agrupacion', 'Elige la agrupación')
      if (d.tipoRegistro !== 'mosaico' && !d.autor) falta('autor', 'El autor es obligatorio')
      if (d.tipoRegistro === 'mosaico' && d.canciones.length === 0) falta('canciones', 'Un mosaico debe tener al menos una canción')
    })

export const valoresIniciales = (obra) => ({
  titulo: obra?.titulo ?? '',
  tipoRegistro: obra?.tipoRegistro ?? '',
  autor: obra?.autor ?? '',
  arreglista: obra?.arreglista ?? '',
  orquestador: obra?.orquestador ?? '',
  opus: obra?.opus ?? '',
  anioComposicion: obra?.anioComposicion ? String(obra.anioComposicion) : '',
  anioArreglo: obra?.anioArreglo ? String(obra.anioArreglo) : '',
  tipoObra: obra?.tipoObra?._id ?? '',
  procedencia: obra?.procedencia ?? '',
  agrupacion: obra?.agrupacion?._id ?? '',
  instrumentacion: (obra?.instrumentacion ?? []).map((f) => ({
    familia: f.familia?._id ?? '',
    instrumento: f.instrumento?._id ?? '',
    cantidad: String(f.cantidad ?? 1),
  })),
  tonalidad: obra?.tonalidad ?? '',
  compas: obra?.compas ?? '',
  tiempo: obra?.tiempo ?? '',
  duracion: obra?.duracion != null ? formatearDuracion(obra.duracion) : '',
  numeroMovimientos: obra?.numeroMovimientos ? String(obra.numeroMovimientos) : '',
  edicion: obra?.edicion ?? '',
  formato: obra?.formato ?? '',
  detalleMaterial: obra?.detalleMaterial ?? '',
  estadoMaterial: obra?.estadoMaterial ?? '',
  factibleSinVoz: obra?.factibleSinVoz ?? '',
  directorConcierto: obra?.directorConcierto ?? '',
  solistaConcierto: obra?.solistaConcierto ?? '',
  requiereRevision: Boolean(obra?.requiereRevision),
  carpeta: obra?.carpeta?._id ?? '',
  observaciones: obra?.observaciones ?? '',
  obraOriginal: obra?.obraOriginal?._id ?? '',
  canciones: (obra?.canciones ?? []).map((c) => ({
    titulo: c.titulo ?? '',
    compositor: c.compositor ?? '',
    genero: c.genero ?? '',
    observacion: c.observacion ?? '',
  })),
})

const CAMPOS_TEXTO = [
  'autor', 'arreglista', 'orquestador', 'opus', 'tonalidad', 'compas', 'tiempo', 'edicion', 'formato',
  'detalleMaterial', 'estadoMaterial', 'directorConcierto', 'solistaConcierto', 'observaciones', 'factibleSinVoz',
  'procedencia', 'tipoObra', 'agrupacion',
]

// El PUT reemplaza la obra: se envían todos los campos con valor y los vacíos se omiten (así se borran).
// Las canciones solo van en mosaicos y la obra original solo en adaptaciones.
export const aPayload = (d) => {
  const payload = {
    titulo: d.titulo,
    tipoRegistro: d.tipoRegistro,
    carpeta: d.carpeta,
    requiereRevision: d.requiereRevision,
    instrumentacion: d.instrumentacion.map((f) => ({ familia: f.familia, instrumento: f.instrumento, cantidad: Number(f.cantidad) })),
    canciones:
      d.tipoRegistro === 'mosaico'
        ? d.canciones.map((c) =>
            Object.fromEntries(Object.entries(c).filter(([, v]) => v !== ''))
          )
        : [],
  }
  for (const campo of CAMPOS_TEXTO) if (d[campo]) payload[campo] = d[campo]
  for (const campo of ['anioComposicion', 'anioArreglo', 'numeroMovimientos']) if (d[campo]) payload[campo] = Number(d[campo])
  const segundos = aSegundos(d.duracion)
  if (segundos !== undefined) payload.duracion = segundos
  if (d.tipoRegistro === 'adaptacion' && d.obraOriginal) payload.obraOriginal = d.obraOriginal
  return payload
}
