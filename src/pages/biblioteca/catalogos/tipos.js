// Los 4 catálogos que maneja el backend. La procedencia (ecuatoriana / universal) no es un catálogo: es un valor fijo.
export const TIPOS_CATALOGO = [
  {
    id: 'tipoObra',
    texto: 'Tipos de obra',
    singular: 'tipo de obra',
    nuevo: 'Nuevo tipo de obra',
    ayuda: 'Se elige al registrar o completar cada obra.',
  },
  {
    id: 'agrupacion',
    texto: 'Agrupaciones',
    singular: 'agrupación',
    nuevo: 'Nueva agrupación',
    ayuda: 'Formato o agrupación para la que está escrita cada obra.',
  },
  {
    id: 'familiaInstrumento',
    texto: 'Familias de instrumentos',
    singular: 'familia',
    nuevo: 'Nueva familia',
    ayuda: 'Agrupan los instrumentos. Una familia no se puede desactivar mientras tenga instrumentos activos.',
  },
  {
    id: 'instrumento',
    texto: 'Instrumentos',
    singular: 'instrumento',
    nuevo: 'Nuevo instrumento',
    ayuda: 'Cada instrumento pertenece a una familia. Se usan en la instrumentación de las obras.',
  },
]
