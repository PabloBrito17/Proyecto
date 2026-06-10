import { useEffect, useState } from 'react'
import { useTerritorio } from '../TerritoryContext'
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts'

const RANGOS_TRI = [
  { min: 0,  max: 25,  nivel: 'Crítico',        etiqueta: 'Intervención urgente', color: '#e84040',
    significado: 'Capacidades mínimas. Requiere atención inmediata y apoyo externo.' },
  { min: 26, max: 45,  nivel: 'Frágil',          etiqueta: 'Bases débiles',        color: '#f5a623',
    significado: 'Avances incipientes. Riesgo alto de retroceso sin intervención sostenida.' },
  { min: 46, max: 65,  nivel: 'En desarrollo',   etiqueta: 'Potencial visible',    color: '#f5d623',
    significado: 'Progreso identificable. Requiere consolidar procesos y fortalecer actores clave.' },
  { min: 66, max: 80,  nivel: 'Consolidado',     etiqueta: 'Funcional',            color: '#22d3ee',
    significado: 'Capacidades establecidas. Puede servir como referencia para otros territorios.' },
  { min: 81, max: 100, nivel: 'Avanzado',        etiqueta: 'Modelo replicable',    color: '#00c4a0',
    significado: 'Excelencia institucional. Territorio con condiciones para escalar y exportar prácticas.' },
]

const TOOLTIPS_DIMENSION = {
  'Gobernanza Territorial':
    'Capacidad del territorio para tomar decisiones colectivas legítimas y sostener acuerdos en el tiempo. Integra institucionalidad formal y cohesión social como precondición.',
  'Capacidades Territoriales':
    'Capacidad de diseñar e implementar estrategias con autonomía creciente. Integra capital humano, capacidad productiva e infraestructura habilitante.',
  'Movilización de Recursos':
    'Capacidad de identificar, acceder y absorber recursos financieros, técnicos y políticos con autonomía estratégica respecto a ciclos externos de cooperación.',
  'Dinámica Laboral Territorial':
    'Capacidad del territorio de gestionar su fuerza laboral como activo de desarrollo: estructura del mercado, movilidad interna, conectividad y flujos internacionales.',
  'Resiliencia Ambiental':
    'Restricción estructural de la transformación territorial. Grado en que las condiciones ambientales y climáticas condicionan, habilitan o limitan el desarrollo de las demás capacidades del territorio.',
}

function getRango(valor) {
  return RANGOS_TRI.find(r => valor >= r.min && valor <= r.max) || RANGOS_TRI[0]
}

function TooltipDimension({ dimension, valor, children }) {
  const [pos, setPos] = useState(null)
  const rango = getRango(valor)
  const desc = TOOLTIPS_DIMENSION[dimension] || ''

  const handleOpen = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setPos({ top: rect.bottom + 8, left: Math.min(rect.left, window.innerWidth - 300) })
  }

  return (
    <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
      {children}
      <button
        onClick={handleOpen}
        style={{
          marginLeft: 5, background: 'none', border: 'none',
          color: pos ? 'var(--accent)' : 'var(--text3)',
          cursor: 'pointer', fontSize: 12, padding: 0, lineHeight: 1,
          transition: 'color 0.15s',
        }}
        title="Ver definición e interpretación"
      >ⓘ</button>
      {pos && (
        <>
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 199 }}
            onClick={() => setPos(null)}
          />
          <div style={{
            position: 'fixed', top: pos.top, left: pos.left, zIndex: 200,
            width: 280, background: 'var(--bg)',
            border: '1px solid var(--border)', borderRadius: 10,
            padding: 14, boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
          }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: rango.color,
              letterSpacing: 1, marginBottom: 6 }}>
              {dimension.toUpperCase()} — {valor}/100
            </div>
            <p style={{ fontSize: 11, color: 'var(--text2)', lineHeight: 1.5, marginBottom: 10 }}>
              {desc}
            </p>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: rango.color,
              marginBottom: 6 }}>
              NIVEL ACTUAL: {rango.nivel.toUpperCase()} · {rango.etiqueta}
            </div>
            <p style={{ fontSize: 10, color: 'var(--text3)', lineHeight: 1.4, marginBottom: 10 }}>
              {rango.significado}
            </p>
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 8 }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--text3)',
                letterSpacing: 1, marginBottom: 5 }}>TABLA DE RANGOS</div>
              {RANGOS_TRI.map(r => (
                <div key={r.nivel} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '2px 6px', borderRadius: 3, marginBottom: 2,
                  background: valor >= r.min && valor <= r.max ? `${r.color}15` : 'transparent',
                  border: `1px solid ${valor >= r.min && valor <= r.max ? r.color : 'transparent'}`,
                }}>
                  <span style={{ fontSize: 9, color: r.color, fontFamily: 'var(--mono)' }}>
                    {r.min}–{r.max}
                  </span>
                  <span style={{ fontSize: 9, color: 'var(--text2)' }}>{r.nivel}</span>
                  <span style={{ fontSize: 9, color: 'var(--text3)' }}>{r.etiqueta}</span>
                </div>
              ))}
            </div>
            <button onClick={() => setPos(null)} style={{
              marginTop: 8, width: '100%', background: 'none',
              border: '1px solid var(--border)', borderRadius: 4,
              color: 'var(--text3)', fontSize: 9, padding: '3px 0',
              cursor: 'pointer', fontFamily: 'var(--mono)',
            }}>CERRAR</button>
          </div>
        </>
      )}
    </span>
  )
}

function DimensionBar({ label, valor, color = '#0077ff' }) {
  const pct = valor
  const rango = getRango(valor)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <TooltipDimension dimension={label} valor={valor}>
          <span style={{ fontSize: 12, fontWeight: 500 }}>{label}</span>
        </TooltipDimension>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <span style={{
            fontSize: 9, fontFamily: 'var(--mono)', padding: '2px 6px',
            background: `${rango.color}20`, color: rango.color, borderRadius: 3
          }}>{rango.nivel.toUpperCase()}</span>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 14, fontWeight: 700 }}>{valor}</span>
        </div>
      </div>
      <div style={{ height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${pct}%`, borderRadius: 2,
          background: `linear-gradient(90deg, ${color}, ${color}cc)`,
          transition: 'width 1s ease'
        }} />
      </div>
    </div>
  )
}

export default function TerritoryCapacity() {
  const [radar, setRadar] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorCarga, setErrorCarga] = useState(false)
  const [modoEjecutivo, setModoEjecutivo] = useState(true)
  const [ptiGlobal, setPtiGlobal] = useState(null)
  const [remesasPct, setRemesasPct] = useState(null)

  const { territorioActual } = useTerritorio()

  useEffect(() => {
    setLoading(true)
    Promise.all([
      fetch(`/api/tri/radar/${territorioActual}`).then(r => r.json()),
      fetch(`/api/pti/${territorioActual}`).then(r => r.json()),
      fetch(`/api/indicadores/${territorioActual}`).then(r => r.json()),
    ])
      .then(([radarData, ptiData, indicadoresData]) => {
        setRadar(radarData)
        setPtiGlobal(ptiData.pti_global)
        const rem = indicadoresData.find(i => i.codigo === 'REM')
        setRemesasPct(rem ? rem.valor : null)
        setLoading(false)
      })
      .catch(() => { setLoading(false); setErrorCarga(true) })
  }, [territorioActual])

  const triGlobal = radar.length
    ? (radar.reduce((s, d) => s + d.valor, 0) / radar.length).toFixed(1)
    : '--'

  // Resiliencia Ambiental: valor derivado del promedio TRI, con penalización
  // refleja restricción estructural, no es dato de campo — se marca como estimado
  const resilienciaAmbiental = radar.length
    ? Math.max(10, Math.round(parseFloat(triGlobal) * 0.72))
    : null

  // PTI distribuido proporcionalmente entre dimensiones para el radar overlay
  const radarConPTI = radar.map(d => ({
    ...d,
    pti: ptiGlobal !== null
      ? parseFloat((ptiGlobal * (d.valor > 0 ? (d.valor / (radar.reduce((s,x) => s+x.valor,0)/radar.length)) : 1)).toFixed(1))
      : null
  }))

  const brechaPTI = ptiGlobal !== null && radar.length
    ? (ptiGlobal - parseFloat(triGlobal)).toFixed(1)
    : null

  const dimColors = ['#0077ff', '#00c4a0', '#a855f7', '#22d3ee', '#f5a623', '#84cc16']

  return (
    <div>
      {errorCarga && (
        <div style={{ marginBottom: 16, padding: '10px 14px', borderRadius: 8,
          background: 'rgba(232,64,64,0.07)', border: '1px solid rgba(232,64,64,0.25)',
          fontSize: 11, color: '#e84040', fontFamily: 'var(--mono)' }}>
          No se pudo cargar los datos del territorio. Verifique que el backend esté activo.
        </div>
      )}
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--mono)', fontSize: 16, fontWeight: 700, letterSpacing: 1, marginBottom: 4 }}>
            CAPACIDADES DEL TERRITORIO (TRI)
          </h1>
          <p style={{ color: 'var(--text2)', fontSize: 12 }}>
            Índice de Resiliencia Territorial · 4 dimensiones · {
              radar.length > 0
                ? (() => { const m = new Date().getMonth(); const q = m < 3 ? 1 : m < 6 ? 2 : m < 9 ? 3 : 4; return `Q${q} ${new Date().getFullYear()}` })()
                : 'Q4 2025'
            }
          </p>
        </div>
        {/* Toggle modo ejecutivo */}
        <button
          onClick={() => setModoEjecutivo(v => !v)}
          style={{
            padding: '6px 14px', borderRadius: 6, border: '1px solid var(--border)',
            background: modoEjecutivo ? 'rgba(0,119,255,0.1)' : 'var(--bg3)',
            color: modoEjecutivo ? '#0077ff' : 'var(--text3)',
            fontFamily: 'var(--mono)', fontSize: 10, cursor: 'pointer', letterSpacing: 1,
            transition: 'all 0.15s', whiteSpace: 'nowrap',
          }}
        >
          {modoEjecutivo ? '◈ VISTA EJECUTIVA' : '⊞ ANÁLISIS COMPLETO'}
        </button>
      </div>

      {/* MODO EJECUTIVO: TRI + Restrictor + Recomendación */}
      {modoEjecutivo && radar.length > 0 && (() => {
        const restrictor = radar.reduce((min, d) => d.valor < min.valor ? d : min, radar[0])
        const triVal = (radar.reduce((s,d) => s+d.valor, 0)/radar.length).toFixed(1)
        const rango = ([
          { min:0, max:25, nivel:'Crítico', color:'#e84040', accion:'Intervención urgente' },
          { min:26, max:45, nivel:'Frágil', color:'#f5a623', accion:'Fortalecer bases institucionales' },
          { min:46, max:65, nivel:'En desarrollo', color:'#f5d623', accion:'Consolidar actores clave' },
          { min:66, max:80, nivel:'Consolidado', color:'#22d3ee', accion:'Escalar intervenciones' },
          { min:81, max:100, nivel:'Avanzado', color:'#00c4a0', accion:'Replicar modelo' },
        ]).find(r => parseFloat(triVal) >= r.min && parseFloat(triVal) <= r.max) || {}
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
            {/* TRI Hero */}
            <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: 14 }}>
              <div style={{ background: 'var(--bg2)', border: `2px solid ${rango.color || '#0077ff'}`, borderRadius: 12,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 0' }}>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: '#0077ff', letterSpacing: 2, marginBottom: 6 }}>TRI GLOBAL</div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 56, fontWeight: 700, color: rango.color || '#0077ff', lineHeight: 1 }}>{triVal}</div>
                <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 4 }}>/ 100</div>
                <div style={{ marginTop: 8, padding: '3px 10px', background: `${rango.color}20`, borderRadius: 4 }}>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: rango.color }}>{rango.nivel}</span>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {/* Restrictor */}
                <div style={{ flex: 1, background: 'rgba(232,64,64,0.06)', border: '1px solid rgba(232,64,64,0.25)', borderRadius: 10, padding: '14px 18px' }}>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: '#e84040', letterSpacing: 2, marginBottom: 6 }}>⚠ RESTRICTOR SISTÉMICO</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{restrictor.dimension}</div>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 22, fontWeight: 700, color: '#e84040', marginTop: 2 }}>{restrictor.valor}<span style={{ fontSize: 11, color: 'var(--text3)' }}>/100</span></div>
                  <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 4, lineHeight: 1.4 }}>
                    Techo que limita el impacto de inversiones en las demás dimensiones.
                  </div>
                </div>
                {/* Recomendación */}
                <div style={{ background: 'rgba(0,196,160,0.06)', border: '1px solid rgba(0,196,160,0.2)', borderRadius: 10, padding: '12px 16px' }}>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: '#00c4a0', letterSpacing: 2, marginBottom: 4 }}>RECOMENDACIÓN PRINCIPAL</div>
                  <div style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.5 }}>
                    {rango.accion} — priorizar {restrictor.dimension} como punto de entrada de la intervención.
                  </div>
                </div>
              </div>
            </div>
            {/* Ver análisis completo */}
            <button
              onClick={() => setModoEjecutivo(false)}
              style={{
                alignSelf: 'flex-start', padding: '7px 16px', background: 'transparent',
                border: '1px solid var(--border)', borderRadius: 6,
                color: 'var(--text3)', fontFamily: 'var(--mono)', fontSize: 10,
                cursor: 'pointer', letterSpacing: 1,
              }}
            >
              ⊞ VER ANÁLISIS COMPLETO →
            </button>
          </div>
        )
      })()}

      {/* ANÁLISIS COMPLETO (oculto en modo ejecutivo) */}
      {!modoEjecutivo && <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Radar */}
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: 24 }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: '#0077ff', letterSpacing: 2, marginBottom: 16 }}>
            RADAR TRI
          </div>

          {/* Score central con referencia PTI */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 40, fontWeight: 700, color: 'var(--text)' }}>
                {triGlobal}
              </div>
              <div style={{ fontSize: 10, color: 'var(--text3)' }}>TRI GLOBAL / 100</div>
              {ptiGlobal !== null && (
                <div style={{ marginTop: 4, fontSize: 10, color: '#f5a623', fontFamily: 'var(--mono)' }}>
                  PTI {ptiGlobal} · Potencial
                </div>
              )}
            </div>
          </div>

          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={radarConPTI} margin={{ top: 0, right: 30, bottom: 0, left: 30 }}>
              <PolarGrid stroke="var(--border)" />
              <PolarAngleAxis
                dataKey="dimension"
                tick={{ fill: 'var(--text2)', fontSize: 10, fontFamily: 'var(--mono)' }}
              />
              {/* Polígono TRI — resiliencia actual */}
              <Radar
                name="TRI (Resiliencia actual)"
                dataKey="valor"
                stroke="#0077ff"
                fill="#0077ff"
                fillOpacity={0.25}
                strokeWidth={2}
              />
              {/* Polígono PTI — overlay de potencial, solo si hay datos */}
              {ptiGlobal !== null && (
                <Radar
                  name="PTI (Potencial)"
                  dataKey="pti"
                  stroke="#f5a623"
                  fill="#f5a623"
                  fillOpacity={0.08}
                  strokeWidth={1.5}
                  strokeDasharray="5 3"
                />
              )}
              <Tooltip
                contentStyle={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 6, fontSize: 11 }}
                formatter={(v, name) => [`${v}/100`, name]}
              />
            </RadarChart>
          </ResponsiveContainer>

          {/* Leyenda PTI/TRI */}
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 16, height: 2, background: '#0077ff', borderRadius: 1 }} />
              <span style={{ fontSize: 9, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>TRI · Resiliencia actual</span>
            </div>
            {ptiGlobal !== null && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 16, height: 0, borderTop: '2px dashed #f5a623' }} />
                <span style={{ fontSize: 9, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>PTI · Potencial territorial</span>
              </div>
            )}
          </div>

          {/* Tarjeta de Brecha PTI–TRI */}
          {brechaPTI !== null && (
            <div style={{
              marginTop: 12, padding: '10px 14px',
              background: parseFloat(brechaPTI) > 15
                ? 'rgba(245,166,35,0.08)'
                : 'rgba(0,119,255,0.06)',
              border: `1px solid ${parseFloat(brechaPTI) > 15
                ? 'rgba(245,166,35,0.3)'
                : 'rgba(0,119,255,0.2)'}`,
              borderRadius: 8,
            }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: '#f5a623', letterSpacing: 1, marginBottom: 4 }}>
                BRECHA PTI–TRI
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 11, color: 'var(--text2)' }}>
                  Potencial no activado por el sistema institucional
                </span>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 18, fontWeight: 700, color: '#f5a623' }}>
                  +{brechaPTI}
                </span>
              </div>
              <div style={{ fontSize: 9, color: 'var(--text3)', marginTop: 4 }}>
                PTI {ptiGlobal} − TRI {triGlobal} · {parseFloat(brechaPTI) > 15
                  ? 'Brecha alta — potencial sistémicamente bloqueado'
                  : 'Brecha moderada — convergencia en curso'}
              </div>
            </div>
          )}
        </div>

        {/* Barras por dimensión */}
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: 24 }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: '#0077ff', letterSpacing: 2, marginBottom: 16 }}>
            DESGLOSE POR DIMENSIÓN
          </div>

          {/* MEJORA 2A: Remesas inline bajo Dim 4 */}
          {radar.map((d, i) => (
            <div key={d.dimension}>
              <DimensionBar label={d.dimension} valor={d.valor} color={dimColors[i]} />
              {d.dimension === 'Dinámica Laboral Territorial' && remesasPct !== null && (
                <div style={{
                  marginTop: -4, marginBottom: 6, padding: '7px 10px',
                  background: 'rgba(34,211,238,0.05)', border: '1px solid rgba(34,211,238,0.2)',
                  borderLeft: '3px solid #22d3ee',
                  borderRadius: '0 0 6px 6px',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <div>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: '#22d3ee', letterSpacing: 1 }}>
                      REMESAS / INGRESO TERRITORIAL EST.
                    </span>
                    {remesasPct > 15 && (
                      <div style={{ fontSize: 9, color: 'var(--text3)', marginTop: 2 }}>
                        ↔ Efecto cruzado activo · vinculado a Movilización de Recursos
                      </div>
                    )}
                  </div>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 15, fontWeight: 700, color: '#22d3ee' }}>
                    {remesasPct}%
                  </span>
                </div>
              )}
            </div>
          ))}

          {/* Cuello de botella dinámico */}
          {(() => {
            const restrictor = radar.length
              ? radar.reduce((min, d) => d.valor < min.valor ? d : min, radar[0])
              : null
            if (!restrictor) return null
            return (
              <div style={{
                marginTop: 16, padding: 14, background: 'rgba(232,64,64,0.06)',
                border: '1px solid rgba(232,64,64,0.2)', borderRadius: 8
              }}>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: '#e84040', marginBottom: 6 }}>
                  ⚠ RESTRICTOR SISTÉMICO PRIMARIO
                </div>
                <p style={{ fontSize: 11, color: 'var(--text2)', lineHeight: 1.5 }}>
                  <strong style={{ color: 'var(--text)' }}>{restrictor.dimension} ({restrictor.valor})</strong>
                  {' '}actúa como restrictor sistémico. Inversiones en otras dimensiones tendrán impacto
                  limitado mientras esta permanezca en nivel crítico.
                </p>
              </div>
            )
          })()}
        </div>
      </div>
      }

      {/* Mapa de calor dimensional */}
      <div style={{ marginTop: 20, background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: 20 }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text3)', letterSpacing: 2, marginBottom: 14 }}>
          MAPA DE CALOR · CAPACIDADES
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
          {radar.map((d, i) => {
            const pct = d.valor / 100
            const r = Math.round(232 * (1 - pct) + 0 * pct)
            const g = Math.round(64 * (1 - pct) + 196 * pct)
            const b = Math.round(64 * (1 - pct) + 160 * pct)
            return (
              <div key={d.dimension} style={{
                padding: '16px 10px', borderRadius: 8, textAlign: 'center',
                background: `rgba(${r},${g},${b},0.15)`,
                border: `1px solid rgba(${r},${g},${b},0.3)`
              }}>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 18, fontWeight: 700, color: `rgb(${r},${g},${b})` }}>
                  {d.valor}
                </div>
                <div style={{ fontSize: 9, color: 'var(--text3)', marginTop: 4, lineHeight: 1.2 }}>{d.dimension}</div>
              </div>
            )
          })}
        </div>

        {/* Resiliencia Ambiental — restricción estructural estimada */}
        {resilienciaAmbiental !== null && (
          <div style={{
            marginTop: 12, padding: '12px 16px',
            background: 'rgba(132,204,22,0.05)',
            border: '1px solid rgba(132,204,22,0.2)',
            borderLeft: '3px solid #84cc16',
            borderRadius: 8,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: '#84cc16', letterSpacing: 1, marginBottom: 3 }}>
                🌿 RESILIENCIA AMBIENTAL · RESTRICCIÓN ESTRUCTURAL ESTIMADA
              </div>
              <div style={{ fontSize: 11, color: 'var(--text2)', lineHeight: 1.4, maxWidth: 480 }}>
                Las condiciones ambientales y climáticas condicionan el techo de transformación del territorio.
                Este valor es estimado — su integración como dimensión formal está en desarrollo metodológico.
              </div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 16 }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 28, fontWeight: 700, color: '#84cc16', lineHeight: 1 }}>
                {resilienciaAmbiental}
              </div>
              <div style={{ fontSize: 9, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>/ 100 · est.</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
