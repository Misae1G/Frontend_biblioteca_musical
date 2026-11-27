import { useSearchParams } from 'react-router-dom'
import Pestanas, { PanelPestana } from '../../../components/ui/Pestanas'
import CopiaBiblioteca from './CopiaBiblioteca'
import ReporteVista from './ReporteVista'

const TIPOS = [
  { id: 'obras', texto: 'Obras' },
  { id: 'inventario', texto: 'Inventario' },
  { id: 'prestamos', texto: 'Préstamos', conFechas: true },
  { id: 'interpretaciones', texto: 'Interpretaciones', conFechas: true },
  { id: 'copia', texto: 'Copia de la biblioteca' },
]

// El reporte activo vive en la URL (?tipo=prestamos)
export default function Reportes() {
  const [params, setParams] = useSearchParams()
  const tipo = TIPOS.find((t) => t.id === params.get('tipo')) ?? TIPOS[0]

  return (
    <div className="mx-auto max-w-6xl">
      <Pestanas etiqueta="Tipos de reporte" pestanas={TIPOS} activa={tipo.id} onCambiar={(id) => setParams({ tipo: id }, { replace: true })} />
      <PanelPestana id={tipo.id}>
        {/* key: al cambiar de reporte, el período y las descargas empiezan de cero */}
        {tipo.id === 'copia' ? <CopiaBiblioteca /> : <ReporteVista key={tipo.id} tipo={tipo.id} conFechas={tipo.conFechas} />}
      </PanelPestana>
    </div>
  )
}
