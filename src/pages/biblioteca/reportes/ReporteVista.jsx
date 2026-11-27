import { useCallback, useState } from 'react'
import { toast } from 'react-toastify'
import { FiDownload } from 'react-icons/fi'
import { descargarReporte, obtenerReporte } from '../../../api/reportes'
import Alerta from '../../../components/ui/Alerta'
import Boton from '../../../components/ui/Boton'
import Campo from '../../../components/ui/Campo'
import Cargando from '../../../components/ui/Cargando'
import { useConsulta } from '../../../hooks/useConsulta'
import { guardarArchivo } from '../../../utils/descargas'
import { mensajeDeError } from '../../../utils/errores'
import { formatearFechaHora } from '../../../utils/fechas'
import SeccionReporte from './SeccionReporte'

// Un reporte: se ve en pantalla (gráficos y tablas desde el JSON) y se descarga en PDF o Excel.
// `conFechas`: préstamos e interpretaciones aceptan un período; obras e inventario no.
export default function ReporteVista({ tipo, conFechas }) {
  const [desde, setDesde] = useState('')
  const [hasta, setHasta] = useState('')
  const [descargando, setDescargando] = useState('')
  const rangoInvertido = Boolean(desde && hasta && desde > hasta)

  // Con el período mal puesto no se consulta (el backend lo rechazaría)
  const consultar = useCallback(
    (signal) => (rangoInvertido ? Promise.resolve(null) : obtenerReporte(tipo, { desde, hasta }, signal)),
    [tipo, desde, hasta, rangoInvertido]
  )
  const { datos, cargando, error, recargar } = useConsulta(consultar)

  const bajar = async (formato) => {
    setDescargando(formato)
    try {
      const { blob, nombre } = await descargarReporte(tipo, formato, { desde, hasta })
      guardarArchivo(blob, nombre)
      toast.success(`Reporte descargado (${formato === 'pdf' ? 'PDF' : 'Excel'})`)
    } catch (e) {
      toast.error(mensajeDeError(e))
    } finally {
      setDescargando('')
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        {conFechas ? (
          <div className="grid grid-cols-2 gap-3 sm:w-96">
            <Campo label="Desde" type="date" value={desde} onChange={(e) => setDesde(e.target.value)} />
            <Campo label="Hasta" type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} />
          </div>
        ) : (
          <span />
        )}
        <div className="flex flex-wrap gap-2">
          <Boton variante="secundario" cargando={descargando === 'pdf'} disabled={Boolean(descargando) || rangoInvertido} onClick={() => bajar('pdf')}>
            <FiDownload aria-hidden="true" />
            Descargar PDF
          </Boton>
          <Boton variante="secundario" cargando={descargando === 'xlsx'} disabled={Boolean(descargando) || rangoInvertido} onClick={() => bajar('xlsx')}>
            <FiDownload aria-hidden="true" />
            Descargar Excel
          </Boton>
        </div>
      </div>

      {rangoInvertido && <Alerta tipo="aviso">La fecha «desde» es posterior a «hasta». Corrige el período para ver el reporte.</Alerta>}

      {error && (
        <Alerta>
          <p>{error}</p>
          <Boton variante="secundario" tamano="pequeno" className="mt-2" onClick={recargar}>
            Reintentar
          </Boton>
        </Alerta>
      )}
      {cargando && !datos && !rangoInvertido && <Cargando texto="Generando el reporte…" />}

      {datos && !rangoInvertido && (
        <div aria-busy={cargando} className={`space-y-5 ${cargando ? 'opacity-60 transition-opacity' : 'transition-opacity'}`}>
          <header className="space-y-3 rounded-lg border border-linea bg-superficie p-5">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-xl font-semibold text-tinta">{datos.titulo}</h2>
              <p className="text-xs text-tinta-suave">Generado {formatearFechaHora(datos.generado)}</p>
            </div>
            <ul className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-tinta-suave">
              {datos.filtros.map((f) => (
                <li key={f.etiqueta}>
                  {f.etiqueta}: <span className="text-tinta">{String(f.valor)}</span>
                </li>
              ))}
            </ul>
            <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {datos.resumen.map((r) => (
                <div key={r.etiqueta} className="rounded-md bg-hundido px-3 py-2">
                  <dt className="text-xs text-tinta-suave">{r.etiqueta}</dt>
                  <dd className="text-xl font-semibold tabular-nums text-tinta">
                    {typeof r.valor === 'number' ? r.valor.toLocaleString('es-EC') : r.valor}
                  </dd>
                </div>
              ))}
            </dl>
          </header>

          {datos.secciones.map((s, n) => (
            <SeccionReporte key={`${s.titulo}-${n}`} id={`seccion-${tipo}-${n}`} seccion={s} />
          ))}
        </div>
      )}
    </div>
  )
}
