import { useEffect, useState } from 'react'
import { useTerritorio } from '../TerritoryContext'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, ReferenceLine, Area, AreaChart
} from 'recharts'

const LINEAS = [
  { key: 'TRI', color: '#0077ff', label: 'TRI Global' },
  { key: 'Gobernanza Territorial',       color: '#e84040', label: 'Gobernanza Territorial' },
  { key: 'Capacidades Territoriales',    color: '#00c4a0', label: 'Capacidades Territoriales' },
  { key: 'Movilización de Recursos',     color: '#a855f7', label: 'Movilización de Recursos' },
  { key: 'Dinámica Laboral Territorial', color: '#f5a623', label: 'Dinámica Laboral' },
]

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload) return null
  return (
    <div style={{
      background: 'var(--bg3)', border: '1px solid var(--border)',
      borderRadius: 8, padding: '10px 14px', fontSize: 11
    }}>
      <div style={{ fontFamily: 'var(--mono)', color: 'var(--text2)', marginBottom: 6 }}>{label}</div>
      {payload.map(p => (
        <div key={p.dataKey} style={{ display: 'flex', gap: 8, marginBottom: 3 }}>
          <span style={{ color: p.color, fontFamily: 'var(--mono)', fontWeight: 700 }}>{p.value}</span>
          <span style={{ color: 'var(--text2)' }}>{p.name}</span>
        </div>
      ))}
    </div>
  )
}

export default function TransformTracker() {
  const [historial, setHistorial] = useState([])
  const [errorCarga, setErrorCarga] = useState(false)

  const { territorioActual } = useTerritorio()

  useEffect(() => {
    fetch(`/api/tri/historial/${territorioActual}`).then(r => r.json()).then(d => { setHistorial(d); setErrorCarga(false) }).catch(() => { setHistorial([]); setErrorCarga(true) })
  }, [territorioActual])

  if (!historial.length) return <div style={{ color: 'var(--text2)', padding: 40, textAlign: 'center' }}>Cargando...</div>

  const primero = historial[0]?.TRI || 0
  const ultimo = historial[historial.length - 1]?.TRI || 0
  const variacion = (ultimo - primero).toFixed(1)
  const velocidad = (variacion / historial.length).toFixed(2)

  // Proyección simple: 4 trimestres más con pendiente actual
  const pendiente = (historial[historial.length - 1]?.TRI - historial[historial.length - 2]?.TRI) || 0
  const proyeccion = [
    { periodo: 'Q1 2024', TRI: +(ultimo + pendiente * 1).toFixed(1), proyectado: true },
    { periodo: 'Q2 2024', TRI: +(ultimo + pendiente * 2).toFixed(1), proyectado: true },
    { periodo: 'Q3 2024', TRI: +(ultimo + pendiente * 3).toFixed(1), proyectado: true },
    { periodo: 'Q4 2024', TRI: +(ultimo + pendiente * 4).toFixed(1), proyectado: true },
  ]

  const DIMS = ['Gobernanza Territorial', 'Capacidades Territoriales', 'Movilización de Recursos', 'Dinámica Laboral Territorial']
  const ultimoReg = historial[historial.length - 1] || {}
  const dimsOrdenadas = DIMS
    .map(d => ({ dim: d, val: ultimoReg[d] ?? 999 }))
    .sort((a, b) => a.val - b.val)
  const restrictor1 = dimsOrdenadas[0]?.dim || 'dimensión crítica'
  const restrictor2 = dimsOrdenadas[1]?.dim || 'dimensión secundaria'
  const dataCompleta = [
    ...historial.map(d => ({ ...d, proyectado: false })),
    ...proyeccion
  ]

  return (
    <div>
      {errorCarga && (
        <div style={{ marginBottom: 16, padding: '10px 14px', borderRadius: 8,
          background: 'rgba(232,64,64,0.07)', border: '1px solid rgba(232,64,64,0.25)',
          fontSize: 11, color: '#e84040', fontFamily: 'var(--mono)' }}>
          No se pudo cargar la información del servidor. Verifique la conexión.
        </div>
      )}
      {error && (
        <div style={{ marginBottom: 16, padding: '10px 14px', borderRadius: 8, background: 'rgba(232,64,64,0.07)', border: '1px solid rgba(232,64,64,0.25)', fontSize: 11, color: '#e84040', fontFamily: 'var(--mono)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>⚠ Error cargando trayectoria: {error}</span>
          <button onClick={() => { setLoading(true); setError(null); fetch(`/api/tri/historial/${territorioActual}`).then(r=>r.json()).then(d=>{setHistorial(d);setLoading(false)}).catch(e=>{setError(e.message);setLoading(false)}) }} style={{ background: 'rgba(232,64,64,0.15)', border: '1px solid rgba(232,64,64,0.3)', borderRadius: 4, padding: '3px 10px', color: '#e84040', fontFamily: 'var(--mono)', fontSize: 10, cursor: 'pointer' }}>↺ REINTENTAR</button>
        </div>
      )}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'var(--mono)', fontSize: 16, fontWeight: 700, letterSpacing: 1, marginBottom: 4 }}>
          SEGUIMIENTO DE TRANSFORMACIÓN
        </h1>
        <p style={{ color: 'var(--text2)', fontSize: 12 }}>
          Trayectoria del TRI · Q1 2022 — Q4 2023 + proyección 2024
        </p>
      </div>

      {/* KPIs trayectoria */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'TRI INICIAL', val: `${primero}`, sub: 'Q1 2022', color: '#8a9bb5' },
          { label: 'TRI ACTUAL', val: `${ultimo}`, sub: 'Q4 2023', color: '#0077ff' },
          { label: 'VARIACIÓN', val: `${variacion > 0 ? '+' : ''}${variacion}`, sub: '8 trimestres', color: variacion >= 0 ? '#00c4a0' : '#e84040' },
          { label: 'VELOCIDAD', val: `${velocidad > 0 ? '+' : ''}${velocidad}`, sub: 'pts/trimestre', color: variacion >= 0 ? '#a855f7' : '#e84040' },
        ].map(k => (
          <div key={k.label} style={{
            background: 'var(--bg2)', border: '1px solid var(--border)',
            borderTop: `2px solid ${k.color}`, borderRadius: 8, padding: 16
          }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--text3)', letterSpacing: 2, marginBottom: 6 }}>{k.label}</div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 28, fontWeight: 700, color: k.color }}>{k.val}</div>
            <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 2 }}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Gráfico principal */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: 24, marginBottom: 20 }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: '#ff6b35', letterSpacing: 2, marginBottom: 20 }}>
          EVOLUCIÓN TRI MULTIDIMENSIONAL
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={historial} margin={{ top: 0, right: 20, bottom: 0, left: 0 }}>
            <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
            <XAxis dataKey="periodo" tick={{ fill: 'var(--text3)', fontSize: 10, fontFamily: 'var(--mono)' }} />
            <YAxis domain={[20, 50]} tick={{ fill: 'var(--text3)', fontSize: 10, fontFamily: 'var(--mono)' }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--text2)' }}
            />
            <ReferenceLine y={50} stroke="rgba(0,196,160,0.2)" strokeDasharray="4 4" label={{ value: 'META', fill: 'var(--text3)', fontSize: 9 }} />
            {LINEAS.map(l => (
              <Line
                key={l.key}
                type="monotone"
                dataKey={l.key}
                stroke={l.color}
                strokeWidth={l.key === 'TRI' ? 2.5 : 1.5}
                dot={{ r: 3, fill: l.color }}
                activeDot={{ r: 5 }}
                name={l.label}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Proyección */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: 24 }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: '#ff6b35', letterSpacing: 2, marginBottom: 6 }}>
          PROYECCIÓN TRI GLOBAL · 2024
        </div>
        <p style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 20 }}>
          Proyección lineal basada en pendiente Q3-Q4 2023 (+{pendiente.toFixed(1)} pts/trimestre). Sin intervención correctiva.
        </p>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={dataCompleta} margin={{ top: 0, right: 20, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="triGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0077ff" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#0077ff" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="projGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ff6b35" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#ff6b35" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
            <XAxis dataKey="periodo" tick={{ fill: 'var(--text3)', fontSize: 9, fontFamily: 'var(--mono)' }} />
            <YAxis domain={[20, 55]} tick={{ fill: 'var(--text3)', fontSize: 9, fontFamily: 'var(--mono)' }} />
            <Tooltip contentStyle={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 6, fontSize: 11 }} />
            <ReferenceLine x="Q4 2023" stroke="rgba(255,107,53,0.4)" strokeDasharray="4 4" label={{ value: 'ÚLTIMO DATO', fill: '#ff6b35', fontSize: 9 }} />
            <Area type="monotone" dataKey="TRI" stroke="#0077ff" strokeWidth={2} fill="url(#triGrad)" dot={{ r: 2 }} />
          </AreaChart>
        </ResponsiveContainer>

        <div style={{ marginTop: 16, padding: 12, background: 'rgba(255,107,53,0.06)', border: '1px solid rgba(255,107,53,0.2)', borderRadius: 8 }}>
          <div style={{ fontSize: 11, color: 'var(--text2)', lineHeight: 1.5 }}>
            <strong style={{ color: 'var(--text)' }}>Escenario tendencial:</strong> Al ritmo actual, el TRI alcanzaría{' '}
            <strong style={{ color: '#ff6b35' }}>{proyeccion[3].TRI}/100</strong> a fin de 2024.
            Para alcanzar la meta de 50 puntos en 24 meses se requiere una aceleración de{' '}
            <strong style={{ color: '#00c4a0' }}>+{(50 - ultimo) / 8 > pendiente ? ((50 - ultimo) / 8).toFixed(1) : pendiente.toFixed(1)} pts/trimestre</strong>{' '}
            con intervención focalizada en {restrictor1} y {restrictor2}.
          </div>
        </div>
      </div>
    </div>
  )
}
