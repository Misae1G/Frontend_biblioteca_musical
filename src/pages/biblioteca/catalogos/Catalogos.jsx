import { useSearchParams } from 'react-router-dom'
import Pestanas, { PanelPestana } from '../../../components/ui/Pestanas'
import ListaCatalogo from './ListaCatalogo'
import { TIPOS_CATALOGO } from './tipos'

// La pestaña activa vive en la URL (?tipo=agrupacion): sobrevive a recargar y al botón "atrás"
export default function Catalogos() {
  const [params, setParams] = useSearchParams()
  const tipo = TIPOS_CATALOGO.find((t) => t.id === params.get('tipo')) ?? TIPOS_CATALOGO[0]

  return (
    <div className="mx-auto max-w-5xl">
      <Pestanas
        etiqueta="Tipos de catálogo"
        pestanas={TIPOS_CATALOGO}
        activa={tipo.id}
        onCambiar={(id) => setParams({ tipo: id }, { replace: true })}
      />
      <PanelPestana id={tipo.id}>
        {/* key: al cambiar de pestaña, filtros y diálogos empiezan de cero */}
        <ListaCatalogo key={tipo.id} tipo={tipo} />
      </PanelPestana>
    </div>
  )
}
