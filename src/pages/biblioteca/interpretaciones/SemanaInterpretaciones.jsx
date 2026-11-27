import { useCallback } from 'react'
import { Link } from 'react-router-dom'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import { obtenerSemana } from '../../../api/interpretaciones'
import EstadoInterpretacion from '../../../components/biblioteca/EstadoInterpretacion'
import Alerta from '../../../components/ui/Alerta'
import Boton from '../../../components/ui/Boton'
import Campo from '../../../components/ui/Campo'
import Cargando from '../../../components/ui/Cargando'
import { useConsulta } from '../../../hooks/useConsulta'
import { etiquetaDia, fechaDia, hoyEcuador, sumarDias } from '../../../utils/fechas'

const enlace = 'text-marca-700 underline underline-offset-2'

// Programación de una semana (lunes a domingo). `fecha` vacía = semana actual.
export default function SemanaInterpretaciones({ fecha, onCambiarFecha }) {
  const consultar = useCallback((signal) => obtenerSemana(fecha, signal), [fecha])
  const { datos, cargando, error, recargar } = useConsulta(consultar)
  const hoy = hoyEcuador()

  const dias = datos ? Array.from({ length: 7 }, (_, n) => sumarDias(datos.desde, n)) : []
  const porDia = new Map(dias.map((d) => [d, []]))
  for (const i of datos?.interpretaciones ?? []) porDia.get(fechaDia(i.fechaPrevista))?.push(i)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex items-center gap-2">
          <Boton variante="secundario" disabled={!datos} onClick={() => onCambiarFecha(sumarDias(datos.desde, -7))} aria-label="Semana anterior">
            <FiChevronLeft aria-hidden="true" />
            Anterior
          </Boton>
          <Boton variante="secundario" disabled={!datos} onClick={() => onCambiarFecha(sumarDias(datos.desde, 7))} aria-label="Semana siguiente">
            Siguiente
            <FiChevronRight aria-hidden="true" />
          </Boton>
          <Boton variante="fantasma" onClick={() => onCambiarFecha('')} disabled={!fecha}>
            Esta semana
          </Boton>
        </div>
        <Campo label="Ir a la semana de" type="date" value={fecha} onChange={(e) => onCambiarFecha(e.target.value)} />
      </div>

      {error && (
        <Alerta>
          <p>{error}</p>
          <Boton variante="secundario" tamano="pequeno" className="mt-2" onClick={recargar}>
            Reintentar
          </Boton>
        </Alerta>
      )}
      {cargando && !datos && <Cargando texto="Cargando la semana…" />}

      {datos && (
        <div aria-busy={cargando} className={cargando ? 'opacity-60 transition-opacity' : 'transition-opacity'}>
          <h2 className="mb-3 text-lg font-semibold text-tinta" aria-live="polite">
            Semana del {datos.desde} al {datos.hasta}
          </h2>
          <ol className="divide-y divide-linea overflow-hidden rounded-lg border border-linea bg-superficie">
            {dias.map((dia) => {
              const items = porDia.get(dia)
              const esHoy = dia === hoy
              return (
                <li key={dia} className={`grid gap-2 p-4 md:grid-cols-[12rem_1fr] ${esHoy ? 'bg-laton-fondo' : ''}`}>
                  <p className="text-sm font-medium capitalize text-tinta">
                    {etiquetaDia(dia)}
                    {esHoy && <span className="ml-2 rounded bg-laton-texto px-1.5 py-0.5 text-xs font-normal text-white normal-case">Hoy</span>}
                  </p>
                  {items.length === 0 ? (
                    <p className="text-sm text-tinta-suave">Sin interpretaciones.</p>
                  ) : (
                    <ul className="space-y-3">
                      {items.map((i) => (
                        <li key={i._id} className="space-y-1 text-sm">
                          <div className="flex flex-wrap items-center gap-2">
                            <Link to={`/interpretaciones/${i._id}`} className={`font-medium ${enlace}`}>
                              {i.codigo}
                            </Link>
                            <EstadoInterpretacion estado={i.estado} />
                          </div>
                          <p>
                            {i.obra ? (
                              <Link to={`/obras/${i.obra._id}`} className={enlace}>
                                {i.obra.titulo}
                              </Link>
                            ) : (
                              '—'
                            )}
                            {i.obra?.carpeta && <span className="text-tinta-suave"> · Carpeta {i.obra.carpeta.numero}</span>}
                          </p>
                          <p className="text-tinta-suave">
                            {i.programa} · Director: {i.director}
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              )
            })}
          </ol>
        </div>
      )}
    </div>
  )
}
