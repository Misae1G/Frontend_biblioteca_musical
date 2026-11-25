// Quita los filtros vacíos para no enviar "?q=&rol=" al backend
export const sinVacios = (params) =>
  Object.fromEntries(Object.entries(params).filter(([, valor]) => valor !== '' && valor != null))
