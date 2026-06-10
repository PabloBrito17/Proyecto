import { useEffect, useState } from 'react'
import { useTerritorio } from '../TerritoryContext'
import { RadarChart, PolarGrid, PolarAngleAxis, Radar,
         ResponsiveContainer, Tooltip, Legend } from 'recharts'

const DIM_KEYS = ['gobernanza','capacidades_territoriales',
                  'movilizacion_recursos','dinamica_laboral']
const DIM_LABELS = ['Gobernanza Territorial','Capacidades Territoriales',
                    'Movilización de Recursos','Dinámica Laboral Territorial']

const CODIGO_COMUN = ['EMI','ING','DES','INV','COB','EDU','SAL','FOR']

function ColHeader({ t, color }) {
  if (!t) return <div style={{ background: 'var(--bg2)', borderRadius: 8, padding: 20 }}>—</div>
  return (
    <div style={{
      background: 'var(--bg2)', border: `1px solid ${color}40`,
      borderTop: `3px solid ${color}`, borderRadius: 10, padding: 20
    }}>
      <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color, letterSpacing: 2, marginBottom: 6 }}>
        TERRITORIO PILOTO
      </div>
      <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{t.nombre}</div>
      <div style={{ fontSize: 12, color: 'var(--text2)' }}>{t.depto} · {t.pais}</div>
      <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>
        {Number(t.poblacion).toLocaleString()} hab · {t.economia_principal}
      </div>
    </div>
  )
}

function MetricaFila({ label, v1, v2, unidad, codigo }) {
  if (v1 == null || v2 == null) return null
  const diff = (v2 - v1).toFixed(1)
  const diffColor = diff > 0 ? '#00c4a0' : diff < 0 ? '#e84040' : '#8a9bb5'
  const winner = v1 > v2 ? 1 : v1 < v2 ? 2 : 0

  // Códigos donde mayor es peor
  const mayorEsPeor = ['EMI','DES']
  const t1Win = (mayorEsPeor.includes(codigo) ? v1 < v2 : v1 > v2)
  const t2Win = (mayorEsPeor.includes(codigo) ? v2 < v1 : v2 > v1)

  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '1fr 120px 1fr',
      gap: 0, borderBottom: '1px solid var(--border)',
      alignItems: 'center', minHeight: 40
    }}>
      {/* T1 valor */}
      <div style={{
        padding: '8px 16px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6,
        background: t1Win ? 'rgba(0,196,160,0.04)' : 'transparent'
      }}>
        {t1Win && <span style={{ color: '#00c4a0', fontSize: 12 }}>★</span>}
        <span style={{ fontFamily: 'var(--mono)', fontSize: 16, fontWeight: 700,
          color: t1Win ? '#00c4a0' : 'var(--text)' }}>
          {v1}
        </span>
        <span style={{ fontSize: 10, color: 'var(--text3)' }}>{unidad}</span>
      </div>

      {/* Etiqueta centro */}
      <div style={{
        padding: '8px 12px', textAlign: 'center', borderLeft: '1px solid var(--border)',
        borderRight: '1px solid var(--border)', background: 'var(--bg3)'
      }}>
        <div style={{ fontSize: 10, color: 'var(--text3)', lineHeight: 1.3 }}>{label}</div>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 10,
          color: diffColor, marginTop: 2 }}>
          {diff > 0 ? `+${diff}` : diff} {unidad}
        </div>
      </div>

      {/* T2 valor */}
      <div style={{
        padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 6,
        background: t2Win ? 'rgba(0,119,255,0.04)' : 'transparent'
      }}>
        <span style={{ fontFamily: 'var(--mono)', fontSize: 16, fontWeight: 700,
          color: t2Win ? '#0077ff' : 'var(--text)' }}>
          {v2}
        </span>
        <span style={{ fontSize: 10, color: 'var(--text3)' }}>{unidad}</span>
        {t2Win && <span style={{ color: '#0077ff', fontSize: 12 }}>★</span>}
      </div>
    </div>
  )
}

export default function Comparador() {
  const [data, setData] = useState(null)
  const [errorCarga, setErrorCarga] = useState(false)
  const { territorioActual, territorios } = useTerritorio()

  useEffect(() => {
    // T1 = territorio activo, T2 = el otro territorio piloto
    const otroId = territorios.find(t => t.id !== territorioActual)?.id || (territorioActual === 1 ? 2 : 1)
    fetch(`/api/comparar/${territorioActual}/${otroId}`).then(r => r.json()).then(d => { setData(d); setErrorCarga(false) }).catch(() => setErrorCarga(true))
  }, [territorioActual, territorios])

  if (errorCarga) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: 400, color: '#e84040', fontFamily: 'var(--mono)', fontSize: 12 }}>
      No se pudo cargar la comparación entre territorios.
    </div>
  )
  if (!data) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: 400, color: 'var(--text2)', fontFamily: 'var(--mono)' }}>
      ⟳ Cargando comparación...
    </div>
  )

  const { t1, t2, i1, i2, tri1, tri2 } = data

  // Preparar datos radar combinado
  const radarData = DIM_LABELS.map((label, idx) => ({
    dimension: label,
    [t1?.nombre]: tri1 ? tri1[DIM_KEYS[idx]] : 0,
    [t2?.nombre]: tri2 ? tri2[DIM_KEYS[idx]] : 0,
  }))

  // Indicadores comparables (mismos códigos)
  const codigos = [...new Set([...i1.map(i=>i.codigo), ...i2.map(i=>i.codigo)])]
    .filter(c => !['PTI','TRI'].includes(c))
  const indicadoresComunes = codigos.filter(c => i1.find(i=>i.codigo===c) && i2.find(i=>i.codigo===c))

  // Score: cuántos indicadores gana cada territorio
  let score1 = 0, score2 = 0
  const mayorEsPeor = ['EMI','DES']
  indicadoresComunes.forEach(c => {
    const v1 = i1.find(i=>i.codigo===c)?.valor
    const v2 = i2.find(i=>i.codigo===c)?.valor
    if (v1 == null || v2 == null) return
    const t1wins = mayorEsPeor.includes(c) ? v1 < v2 : v1 > v2
    if (t1wins) score1++; else if (v1 !== v2) score2++
  })

  const pti1 = i1.find(i=>i.codigo==='PTI')?.valor
  const pti2 = i2.find(i=>i.codigo==='PTI')?.valor
  const triG1 = i1.find(i=>i.codigo==='TRI')?.valor
  const triG2 = i2.find(i=>i.codigo==='TRI')?.valor

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'var(--mono)', fontSize: 16, fontWeight: 700, letterSpacing: 1, marginBottom: 4 }}>
          COMPARADOR DE TERRITORIOS
        </h1>
        <p style={{ color: 'var(--text2)', fontSize: 12 }}>
          Análisis comparativo · {t1?.nombre} vs {t2?.nombre}
        </p>
      </div>

      {/* Encabezados de columna */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px 1fr', gap: 0, marginBottom: 20 }}>
        <ColHeader t={t1} color="#00c4a0" />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--mono)', fontSize: 18, color: 'var(--text3)' }}>VS</div>
        <ColHeader t={t2} color="#0077ff" />
      </div>

      {/* Score general */}
      <div style={{
        background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10,
        padding: '16px 24px', marginBottom: 20,
        display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr',
        gap: 16, textAlign: 'center'
      }}>
        {[
          { label: 'PTI', v1: pti1, v2: pti2, color1: '#00c4a0', color2: '#0077ff', mayor: true },
          { label: 'TRI Global', v1: triG1, v2: triG2, color1: '#00c4a0', color2: '#0077ff', mayor: true },
          { label: 'Población', v1: t1?.poblacion, v2: t2?.poblacion, color1: '#00c4a0', color2: '#0077ff', mayor: false },
          { label: 'Emigración', v1: t1?.emigracion_anual_pct, v2: t2?.emigracion_anual_pct, color1: '#00c4a0', color2: '#0077ff', major: false, unidad: '%' },
          { label: 'Score indicadores', v1: score1, v2: score2, color1: '#00c4a0', color2: '#0077ff', major: false, unidad: '/'+indicadoresComunes.length },
        ].map(item => (
          <div key={item.label} style={{ borderRight: '1px solid var(--border)', paddingRight: 16, lastChild: { borderRight: 'none' } }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--text3)', marginBottom: 8 }}>{item.label}</div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 12, alignItems: 'baseline' }}>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 20, fontWeight: 700,
                color: item.v1 > item.v2 ? item.color1 : 'var(--text2)' }}>
                {item.v1}{item.unidad || ''}
              </span>
              <span style={{ fontSize: 10, color: 'var(--text3)' }}>vs</span>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 20, fontWeight: 700,
                color: item.v2 > item.v1 ? item.color2 : 'var(--text2)' }}>
                {item.v2}{item.unidad || ''}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Radar comparativo */}
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: 24 }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text3)', letterSpacing: 2, marginBottom: 16 }}>
            RADAR TRI COMPARATIVO
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={radarData} margin={{ top: 10, right: 40, bottom: 10, left: 40 }}>
              <PolarGrid stroke="var(--border)" />
              <PolarAngleAxis dataKey="dimension"
                tick={{ fill: 'var(--text2)', fontSize: 10, fontFamily: 'var(--mono)' }} />
              <Radar dataKey={t1?.nombre} stroke="#00c4a0" fill="#00c4a0" fillOpacity={0.15} strokeWidth={2} />
              <Radar dataKey={t2?.nombre} stroke="#0077ff" fill="#0077ff" fillOpacity={0.15} strokeWidth={2} />
              <Legend wrapperStyle={{ fontSize: 11, fontFamily: 'var(--mono)' }} />
              <Tooltip contentStyle={{ background: 'var(--bg3)', border: '1px solid var(--border)',
                borderRadius: 6, fontSize: 11 }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Análisis síntesis */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* PTI vs TRI brecha */}
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: 18 }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text3)', letterSpacing: 2, marginBottom: 12 }}>
              BRECHA POTENCIAL vs RESILIENCIA
            </div>
            {[
              { t: t1, pti: pti1, tri: triG1, color: '#00c4a0' },
              { t: t2, pti: pti2, tri: triG2, color: '#0077ff' },
            ].map(item => {
              const brecha = (item.pti - item.tri).toFixed(1)
              const brechaColor = brecha > 15 ? '#e84040' : brecha > 8 ? '#f5a623' : '#00c4a0'
              return (
                <div key={item.t?.id} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: item.color }}>{item.t?.nombre}</span>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: brechaColor }}>
                      brecha: {brecha} pts
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 4, height: 8, borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ width: `${item.tri}%`, background: item.color, opacity: 0.9 }} />
                    <div style={{ width: `${brecha}%`, background: brechaColor, opacity: 0.4 }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9,
                    fontFamily: 'var(--mono)', color: 'var(--text3)', marginTop: 3 }}>
                    <span>TRI {item.tri}</span>
                    <span>PTI {item.pti}</span>
                  </div>
                </div>
              )
            })}
            <div style={{ fontSize: 11, color: 'var(--text2)', lineHeight: 1.5, marginTop: 8,
              padding: 10, background: 'var(--bg3)', borderRadius: 6 }}>
              <strong style={{ color: 'var(--text)' }}>{t2?.nombre}</strong> tiene mayor
              potencial no realizado (+{(pti2 - triG2).toFixed(1)} pts). La brecha señala capacidades
              latentes que el sistema institucional aún no activa.
            </div>
          </div>

          {/* Texto comparativo */}
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10,
            padding: 18, flex: 1 }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text3)', letterSpacing: 2, marginBottom: 12 }}>
              DIFERENCIADORES CLAVE
            </div>
            {[
              { icon: '→', text: `${triG1 > triG2 ? t1?.nombre : t2?.nombre} lidera en TRI Global (${triG1 > triG2 ? triG1 : triG2}/100 vs ${triG1 > triG2 ? triG2 : triG1}/100).` },
              { icon: '→', text: `${pti2 > pti1 ? t2?.nombre : t1?.nombre} registra mayor potencial sin realizar: brecha PTI–TRI de ${pti2 > pti1 ? (pti2 - triG2).toFixed(1) : (pti1 - triG1).toFixed(1)} pts.` },
              { icon: '→', text: `Restrictor compartido: Gobernanza inferior a ${Math.max(tri1?.gobernanza || 0, tri2?.gobernanza || 0) < 40 ? '40' : '50'}/100 en ambos territorios.` },
              { icon: '→', text: `Ventaja comparativa en ${score1 > score2 ? 'indicadores socioeconómicos' : 'potencial productivo'}: ${score1 > score2 ? t1?.nombre : t2?.nombre} gana ${Math.max(score1, score2)} de ${indicadoresComunes.length} métricas.` },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 10, fontSize: 11,
                color: 'var(--text2)', lineHeight: 1.4 }}>
                <span style={{ color: 'var(--accent)', flexShrink: 0 }}>{item.icon}</span>
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabla comparativa de indicadores */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
        {/* Header tabla */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 120px 1fr',
          background: 'var(--bg3)', borderBottom: '1px solid var(--border)'
        }}>
          <div style={{ padding: '10px 16px', textAlign: 'right' }}>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: '#00c4a0', fontWeight: 700 }}>
              {t1?.nombre}
            </span>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--text3)', marginLeft: 8 }}>
              ★ {score1}
            </span>
          </div>
          <div style={{ padding: '10px 12px', textAlign: 'center', borderLeft: '1px solid var(--border)',
            borderRight: '1px solid var(--border)' }}>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--text3)' }}>INDICADOR</span>
          </div>
          <div style={{ padding: '10px 16px' }}>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: '#0077ff', fontWeight: 700 }}>
              {t2?.nombre}
            </span>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--text3)', marginLeft: 8 }}>
              ★ {score2}
            </span>
          </div>
        </div>

        {/* Filas */}
        {indicadoresComunes.map(codigo => {
          const ind1 = i1.find(i => i.codigo === codigo)
          const ind2 = i2.find(i => i.codigo === codigo)
          if (!ind1 || !ind2) return null
          return (
            <MetricaFila
              key={codigo}
              label={ind1.nombre}
              v1={ind1.valor}
              v2={ind2.valor}
              unidad={ind1.unidad}
              codigo={codigo}
            />
          )
        })}
      </div>
    </div>
  )
}
