import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTerritorio } from '../TerritoryContext'
import MapaElSalvador from '../components/MapaElSalvador'

const CATEGORIA_COLORS = {
  global: '#00c4a0',
  económico: '#0077ff',
  social: '#a855f7',
  fiscal: '#f5a623',
  infraestructura: '#22d3ee',
  productivo: '#ff6b35',
  gobernanza: '#e84040',
  'capital humano': '#84cc16',
  ambiental: '#14b8a6',
}

function TendenciaIcon({ t }) {
  if (t === '↗') return <span style={{ color: '#00c4a0', fontSize: 16 }}>↗</span>
  if (t === '↓') return <span style={{ color: '#e84040', fontSize: 16 }}>↓</span>
  return <span style={{ color: '#f5a623', fontSize: 16 }}>→</span>
}

function IndicadorCard({ ind }) {
  const color = CATEGORIA_COLORS[ind.categoria] || '#8a9bb5'
  return (
    <div style={{
      background: 'var(--bg2)', border: '1px solid var(--border)',
      borderTop: `2px solid ${color}`, borderRadius: 8, padding: '14px 16px',
      display: 'flex', flexDirection: 'column', gap: 6,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color, letterSpacing: 1 }}>{ind.codigo}</div>
        <TendenciaIcon t={ind.tendencia} />
      </div>
      <div style={{ fontSize: 11, color: 'var(--text2)', lineHeight: 1.3 }}>{ind.nombre}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
        <span style={{ fontFamily: 'var(--mono)', fontSize: 22, fontWeight: 700, color: 'var(--text)' }}>
          {ind.valor}
        </span>
        <span style={{ fontSize: 10, color: 'var(--text3)' }}>{ind.unidad}</span>
      </div>
      <div style={{
        fontSize: 9, fontFamily: 'var(--mono)', color,
        background: `${color}15`, borderRadius: 3, padding: '2px 6px', alignSelf: 'flex-start'
      }}>
        {ind.categoria}
      </div>
    </div>
  )
}

function PTIGauge({ valor }) {
  const pct = valor / 100
  const circ = 2 * Math.PI * 70
  const color = valor < 40 ? '#e84040' : valor < 60 ? '#f5a623' : '#00c4a0'
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <svg width={180} height={120} viewBox="0 0 180 120">
        <path d="M 20 110 A 70 70 0 1 1 160 110"
          fill="none" stroke="var(--border)" strokeWidth={12} strokeLinecap="round" />
        <path d="M 20 110 A 70 70 0 1 1 160 110"
          fill="none" stroke={color} strokeWidth={12} strokeLinecap="round"
          strokeDasharray={`${circ * 0.75 * pct} ${circ}`}
          style={{ transition: 'stroke-dasharray 1s ease' }} />
        <text x="90" y="98" textAnchor="middle" fill="var(--text)"
          style={{ fontFamily: 'var(--mono)', fontSize: 28, fontWeight: 700 }}>{valor}</text>
        <text x="90" y="115" textAnchor="middle" fill="var(--text3)" fontSize={10}>/100</text>
      </svg>
      <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color, letterSpacing: 2 }}>
        PTI · POTENCIAL TERRITORIAL
      </div>
    </div>
  )
}

export default function TerritoryMind() {
  const { territorioActual } = useTerritorio()
  const [indicadores, setIndicadores] = useState([])
  const [territorio, setTerritorio] = useState(null)
  const [radar, setRadar] = useState([])
  const [tieneDocs, setTieneDocs] = useState(true)   // optimista por defecto

  useEffect(() => {
    fetch(`/api/indicadores/${territorioActual}`).then(r => r.json()).then(setIndicadores).catch(() => setIndicadores([]))
    fetch(`/api/territorio/${territorioActual}`).then(r => r.json()).then(setTerritorio).catch(() => setTerritorio(null))
    fetch(`/api/tri/radar/${territorioActual}`).then(r => r.json()).then(setRadar).catch(() => setRadar([]))
    fetch(`/api/documentos/${territorioActual}`)
      .then(r => r.json())
      .then(d => setTieneDocs(Array.isArray(d) && d.length > 0))
      .catch(() => setTieneDocs(true))
  }, [territorioActual])

  const pti = indicadores.find(i => i.codigo === 'PTI')
  const tri = indicadores.find(i => i.codigo === 'TRI')
  const resto = indicadores.filter(i => !['PTI', 'TRI'].includes(i.codigo))

  // Dimensión con puntaje más bajo = cuello de botella real
  const dimCritica = radar.length
    ? radar.reduce((min, d) => d.valor < min.valor ? d : min, radar[0])
    : null

  const navigate = useNavigate()

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'var(--mono)', fontSize: 16, fontWeight: 700, letterSpacing: 1, marginBottom: 4 }}>
          PANEL CENTRAL / INTELIGENCIA TERRITORIAL
        </h1>
        <p style={{ color: 'var(--text2)', fontSize: 12 }}>
          {territorio?.nombre} · Dashboard integral de capacidades territoriales
        </p>
      </div>

      {/* Alerta BPF — solo cuando no hay documentos */}
      {!tieneDocs && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 18px', marginBottom: 20,
          background: 'rgba(245,166,35,0.08)', border: '1px solid rgba(245,166,35,0.4)',
          borderRadius: 10, gap: 12,
        }}>
          <div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: '#f5a623',
              letterSpacing: 1, fontWeight: 700, marginBottom: 3 }}>
              ⚠ DATOS BASE INCOMPLETOS — MODO FORMULACIÓN GUIADA
            </div>
            <div style={{ fontSize: 11, color: 'var(--text2)', lineHeight: 1.5 }}>
              No se han registrado documentos territoriales para este territorio. Sin diagnóstico ni planes,
              el sistema no puede producir inteligencia territorial confiable.
              Inicia la Batería de Preguntas Fundacionales (BPF) para construir el contexto base.
            </div>
          </div>
          <button onClick={() => navigate('/documentos')} style={{
            padding: '9px 16px', background: 'rgba(245,166,35,0.15)',
            border: '1px solid rgba(245,166,35,0.5)', borderRadius: 7,
            color: '#f5a623', fontFamily: 'var(--mono)', fontSize: 10,
            cursor: 'pointer', letterSpacing: 1, whiteSpace: 'nowrap',
            transition: 'all 0.15s', flexShrink: 0,
          }}>
            INICIAR BPF →
          </button>
        </div>
      )}

      {/* Hero: métricas + mapa */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.3fr', gap: 16, marginBottom: 24 }}>

        {/* PTI */}
        <div style={{
          background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10,
          padding: 24, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center'
        }}>
          {pti && <PTIGauge valor={pti.valor} />}
        </div>

        {/* TRI + perfil */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{
            background: 'var(--bg2)', border: '1px solid var(--border)',
            borderTop: '2px solid #0077ff',
            borderRadius: 10, padding: 18, flex: 1,
            display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 6
          }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: '#0077ff', letterSpacing: 2 }}>TRI · RESILIENCIA</div>
            {tri && <>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 44, fontWeight: 700, color: 'var(--text)', lineHeight: 1 }}>
                {tri.valor}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text2)' }}>Índice de Resiliencia Territorial</div>
              {dimCritica && (
                <span style={{ padding: '3px 8px', background: '#e8404020', color: '#e84040', borderRadius: 4, fontSize: 10, fontFamily: 'var(--mono)', alignSelf: 'flex-start' }}>
                  {dimCritica.dimension.toUpperCase()} CRÍTICA · {dimCritica.valor}
                </span>
              )}
            </>}
          </div>

          <div style={{
            background: 'var(--bg2)', border: '1px solid var(--border)',
            borderRadius: 10, padding: 14
          }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--accent)', letterSpacing: 2, marginBottom: 8 }}>PERFIL</div>
            {territorio && [
              ['Población', `${Number(territorio.poblacion).toLocaleString()} hab`],
              ['Superficie', `${territorio.superficie_km2} km²`],
              ['Economía', territorio.economia_principal],
              ['Emigración', `${territorio.emigracion_anual_pct}% anual`],
              ['Plan DET', `${territorio.plan_det_año} (desact.)`],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
                <span style={{ color: 'var(--text3)' }}>{k}</span>
                <span style={{ color: 'var(--text)', fontWeight: 500, textAlign: 'right', maxWidth: '60%' }}>{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* MAPA */}
        <div style={{
          background: 'var(--bg2)', border: '1px solid var(--border)',
          borderRadius: 10, padding: 16, display: 'flex', flexDirection: 'column', gap: 10
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: '#00c4a0', letterSpacing: 2 }}>
              LOCALIZACIÓN TERRITORIAL
            </div>
            <div style={{
              fontSize: 9, fontFamily: 'var(--mono)', color: 'var(--text3)',
              background: 'var(--bg3)', padding: '2px 8px', borderRadius: 4, border: '1px solid var(--border)'
            }}>
              EL SALVADOR
            </div>
          </div>

          <MapaElSalvador height={220} />

          <div style={{
            padding: '8px 12px', background: 'rgba(0,196,160,0.06)',
            border: '1px solid rgba(0,196,160,0.2)', borderRadius: 6,
            fontSize: 10, color: 'var(--text2)', lineHeight: 1.5
          }}>
            <span style={{ color: '#00c4a0', fontWeight: 600 }}>{territorio?.nombre}</span>
            {' '}· Depto. {territorio?.depto} · {Number(territorio?.poblacion || 0).toLocaleString()} hab
          </div>
        </div>
      </div>

      {/* 10 indicadores */}
      <div>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text3)', letterSpacing: 2, marginBottom: 12 }}>
          INDICADORES TERRITORIALES · {new Date().getFullYear()}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
          {resto.map(ind => <IndicadorCard key={ind.codigo} ind={ind} />)}
        </div>
      </div>
    </div>
  )
}
