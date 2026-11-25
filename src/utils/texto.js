// Igual que en el backend: quita tildes, pasa a minúsculas y colapsa espacios.
// "  Sinfónica  Juvenil " -> "sinfonica juvenil". Sirve para buscar sin importar tildes ni mayúsculas.
export const normalizarTexto = (texto = '') =>
  String(texto)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
