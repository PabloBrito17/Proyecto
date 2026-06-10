import { useEffect, useState } from 'react'
import { useTerritorio } from '../TerritoryContext'

const TIPO_CONFIG = {
  diagnóstico: { icon: '◉', color: '#0077ff', label: 'Diagnóstico' },
  lección: { icon: '⚑', color: '#e84040', label: 'Lección Aprendida' },
  metodología: { icon: '⬡', color: '#a855f7', label: 'Metodología' },
  actor: { icon: '◎', color: '#00c4a0', label: 'Actor Clave' },
  tendencia: { icon: '↗', color: '#f5a623', label: 'Tendencia' },
  oportunidad: { icon: '◈', color: '#84cc16', label: 'Oportunidad' },
}

function TagsLine({ tags }) {
  return (
    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 8 }}>
      {tags.split(',').map(t => (
        <span key={t} style={{
          fontSize: 9, fontFamily: 'var(--mono)', padding: '2px 6px',
          background: 'var(--bg3)', border: '1px solid var(--border)',
          borderRadius: 3, color: 'var(--text3)'
        }}>{t.trim()}</span>
      ))}
    </div>
  )
}

function RelevanciaBar({ val }) {
  const color = val > 0.9 ? '#84cc16' : val > 0.8 ? '#00c4a0' : '#f5a623'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{ width: 50, height: 3, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${val * 100}%`, background: color, borderRadius: 2 }} />
      </div>
      <span style={{ fontFamily: 'var(--mono)', fontSize: 9, color }}>{(val * 100).toFixed(0)}%</span>
    </div>
  )
}

function ConocimientoCard({ k }) {
  const cfg = TIPO_CONFIG[k.tipo] || TIPO_CONFIG.diagnóstico
  return (
    <div style={{
      background: 'var(--bg2)', border: '1px solid var(--border)',
      borderRadius: 10, padding: 16,
      borderLeft: `3px solid ${cfg.color}`,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <span style={{ color: cfg.color, fontSize: 14 }}>{cfg.icon}</span>
          <span style={{ fontSize: 9, fontFamily: 'var(--mono)', color: cfg.color, letterSpacing: 1 }}>
            {cfg.label.toUpperCase()}
          </span>
        </div>
        <RelevanciaBar val={k.relevancia} />
      </div>
      <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text)', lineHeight: 1.4, marginBottom: 8 }}>
        {k.titulo}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text3)' }}>
        <span>{k.fuente}</span>
        <span style={{ fontFamily: 'var(--mono)' }}>{k.fecha}</span>
      </div>
      <TagsLine tags={k.tags} />
    </div>
  )
}

export default function LearningEngine() {
  const [conocimiento, setConocimiento] = useState([])
  const [errorCarga, setErrorCarga] = useState(false)
  const [filtro, setFiltro] = useState('todos')

  const { territorioActual } = useTerritorio()

  useEffect(() => {
    fetch(`/api/conocimiento/${territorioActual}`)
      .then(r => r.json())
      .then(d => { setConocimiento(d); setErrorCarga(false) })
      .catch(() => { setConocimiento([]); setErrorCarga(true) })
  }, [territorioActual])

  const tipos = ['todos', ...Object.keys(TIPO_CONFIG)]
  const filtrado = filtro === 'todos' ? conocimiento : conocimiento.filter(k => k.tipo === filtro)

  const stats = Object.keys(TIPO_CONFIG).map(tipo => ({
    tipo, count: conocimiento.filter(k => k.tipo === tipo).length,
    cfg: TIPO_CONFIG[tipo]
  })).filter(s => s.count > 0)

  const avgRel = conocimiento.length
    ? (conocimiento.reduce((s, k) => s + k.relevancia, 0) / conocimiento.length * 100).toFixed(1)
    : 0

  return (
    <div>
      {errorCarga && (
        <div style={{ marginBottom: 16, padding: '10px 14px', borderRadius: 8,
          background: 'rgba(232,64,64,0.07)', border: '1px solid rgba(232,64,64,0.25)',
          fontSize: 11, color: '#e84040', fontFamily: 'var(--mono)' }}>
          No se pudo cargar la información del servidor. Verifique la conexión.
        </div>
      )}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'var(--mono)', fontSize: 16, fontWeight: 700, letterSpacing: 1, marginBottom: 4 }}>
          MOTOR DE APRENDIZAJE TERRITORIAL
        </h1>
        <p style={{ color: 'var(--text2)', fontSize: 12 }}>
          Conocimiento acumulado · Diagnósticos · Lecciones · Metodologías · Oportunidades
        </p>
      </div>

      {/* Panel estadístico */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12, marginBottom: 20 }}>
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: '2px solid #22d3ee', borderRadius: 8, padding: 16 }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: '#22d3ee', letterSpacing: 2, marginBottom: 4 }}>TOTAL REGISTROS</div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 36, fontWeight: 700 }}>{conocimiento.length}</div>
        </div>
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: '2px solid #84cc16', borderRadius: 8, padding: 16 }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: '#84cc16', letterSpacing: 2, marginBottom: 4 }}>RELEVANCIA PROM.</div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 36, fontWeight: 700, color: '#84cc16' }}>{avgRel}%</div>
        </div>
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: '2px solid #a855f7', borderRadius: 8, padding: 16 }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: '#a855f7', letterSpacing: 2, marginBottom: 4 }}>TIPOS</div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 36, fontWeight: 700 }}>{stats.length}</div>
        </div>
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: '2px solid #f5a623', borderRadius: 8, padding: 16 }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: '#f5a623', letterSpacing: 2, marginBottom: 4 }}>ALTA RELEVANCIA</div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 36, fontWeight: 700, color: '#f5a623' }}>
            {conocimiento.filter(k => k.relevancia >= 0.9).length}
          </div>
        </div>
      </div>

      {/* Distribución visual */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: 16, marginBottom: 20 }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text3)', letterSpacing: 2, marginBottom: 12 }}>
          DISTRIBUCIÓN POR TIPO
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {stats.map(s => (
            <div key={s.tipo} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ color: s.cfg.color, fontSize: 12 }}>{s.cfg.icon}</span>
              <span style={{ fontSize: 11, color: 'var(--text2)' }}>{s.cfg.label}</span>
              <span style={{
                fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 700,
                color: s.cfg.color, background: `${s.cfg.color}15`,
                padding: '1px 6px', borderRadius: 4
              }}>{s.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {tipos.map(t => {
          const cfg = t === 'todos' ? { color: '#22d3ee', icon: '◈' } : TIPO_CONFIG[t]
          const active = filtro === t
          return (
            <button key={t} onClick={() => setFiltro(t)} style={{
              padding: '6px 12px', borderRadius: 6, fontSize: 10,
              fontFamily: 'var(--mono)', cursor: 'pointer',
              background: active ? `${cfg.color}20` : 'var(--bg2)',
              border: `1px solid ${active ? cfg.color : 'var(--border)'}`,
              color: active ? cfg.color : 'var(--text3)',
              transition: 'all 0.15s'
            }}>
              {t === 'todos' ? 'TODOS' : TIPO_CONFIG[t].label.toUpperCase()}
            </button>
          )
        })}
      </div>

      {/* Grid de conocimiento */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        {filtrado.map(k => <ConocimientoCard key={k.id} k={k} />)}
      </div>

      {filtrado.length === 0 && (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text3)', fontFamily: 'var(--mono)', fontSize: 11 }}>
          Sin registros para este tipo
        </div>
      )}
    </div>
  )
}
