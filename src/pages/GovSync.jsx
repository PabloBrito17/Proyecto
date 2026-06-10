import { useEffect, useState } from 'react'
import { useTerritorio } from '../TerritoryContext'

const ESTADO_CONFIG = {
  activo: { label: 'ACTIVO', color: '#00c4a0', bg: 'rgba(0,196,160,0.1)' },
  en_riesgo: { label: 'EN RIESGO', color: '#f5a623', bg: 'rgba(245,166,35,0.1)' },
  atrasado: { label: 'ATRASADO', color: '#e84040', bg: 'rgba(232,64,64,0.1)' },
  negociacion: { label: 'NEGOCIACIÓN', color: '#0077ff', bg: 'rgba(0,119,255,0.1)' },
}

function BarraCumplimiento({ pct, color }) {
  return (
    <div style={{ height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden', marginTop: 8 }}>
      <div style={{
        height: '100%', width: `${pct}%`, borderRadius: 2,
        background: `linear-gradient(90deg, ${color}, ${color}aa)`,
        transition: 'width 1s ease'
      }} />
    </div>
  )
}

function AcuerdoCard({ a }) {
  const cfg = ESTADO_CONFIG[a.estado] || ESTADO_CONFIG.activo
  // Fecha de referencia demo: coherente con los datos del seed (Q4 2023 / inicio 2024)
  const FECHA_DEMO = new Date('2024-04-15')
  const diasRestantes = Math.round((new Date(a.fecha_vencimiento) - FECHA_DEMO) / 86400000)

  return (
    <div style={{
      background: 'var(--bg2)', borderRadius: 10, padding: 18,
      border: `1px solid ${a.alerta ? 'rgba(232,64,64,0.3)' : 'var(--border)'}`,
      borderLeft: `3px solid ${cfg.color}`,
      position: 'relative'
    }}>
      {a.alerta && (
        <div style={{
          position: 'absolute', top: 10, right: 12,
          fontSize: 9, fontFamily: 'var(--mono)', color: '#e84040',
          background: 'rgba(232,64,64,0.12)', padding: '3px 8px', borderRadius: 4
        }}>
          ⚠ {a.alerta}
        </div>
      )}

      <div style={{ marginBottom: 10 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 4, paddingRight: a.alerta ? 160 : 0 }}>
          {a.titulo}
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: 'var(--text2)' }}>{a.entidad}</span>
          <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--text3)' }} />
          <span style={{ fontSize: 11, color: 'var(--text3)' }}>{a.tipo}</span>
          <span style={{
            fontSize: 9, fontFamily: 'var(--mono)', padding: '2px 8px',
            background: cfg.bg, color: cfg.color, borderRadius: 4
          }}>{cfg.label}</span>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
        <span style={{ color: 'var(--text3)' }}>Cumplimiento</span>
        <span style={{ fontFamily: 'var(--mono)', fontWeight: 700, color: cfg.color }}>
          {a.cumplimiento_pct}%
        </span>
      </div>
      <BarraCumplimiento pct={a.cumplimiento_pct} color={cfg.color} />

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontSize: 10, color: 'var(--text3)' }}>
        <span>Inicio: {a.fecha_inicio}</span>
        <span style={{ color: diasRestantes < 30 && diasRestantes > 0 ? '#f5a623' : diasRestantes <= 0 ? '#e84040' : 'var(--text3)' }}>
          {diasRestantes > 0 ? `Vence en ${diasRestantes}d` : diasRestantes === 0 ? 'Vence hoy' : `Venció hace ${Math.abs(diasRestantes)}d`}
        </span>
      </div>
    </div>
  )
}

export default function GovSync() {
  const [acuerdos, setAcuerdos] = useState([])
  const [errorCarga, setErrorCarga] = useState(false)

  const { territorioActual } = useTerritorio()

  useEffect(() => {
    fetch(`/api/govsync/${territorioActual}`)
      .then(r => r.json())
      .then(d => { setAcuerdos(d); setErrorCarga(false) })
      .catch(() => { setAcuerdos([]); setErrorCarga(true) })
  }, [territorioActual])

  const alertas = acuerdos.filter(a => a.alerta)
  const porEstado = ['activo', 'en_riesgo', 'atrasado', 'negociacion']
    .map(e => ({ estado: e, count: acuerdos.filter(a => a.estado === e).length }))
  const avgCumplimiento = acuerdos.length
    ? (acuerdos.reduce((s, a) => s + a.cumplimiento_pct, 0) / acuerdos.length).toFixed(1)
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
          ARTICULACIÓN INTERINSTITUCIONAL
        </h1>
        <p style={{ color: 'var(--text2)', fontSize: 12 }}>
          Acuerdos interinstitucionales · Seguimiento y alertas tempranas
        </p>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 20 }}>
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8, padding: '14px 16px' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text3)', marginBottom: 4 }}>TOTAL</div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 28, fontWeight: 700 }}>{acuerdos.length}</div>
          <div style={{ fontSize: 10, color: 'var(--text3)' }}>acuerdos</div>
        </div>
        {porEstado.map(({ estado, count }) => {
          const cfg = ESTADO_CONFIG[estado]
          return (
            <div key={estado} style={{ background: 'var(--bg2)', border: `1px solid var(--border)`, borderTop: `2px solid ${cfg.color}`, borderRadius: 8, padding: '14px 16px' }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: cfg.color, letterSpacing: 1, marginBottom: 4 }}>{cfg.label}</div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 28, fontWeight: 700, color: cfg.color }}>{count}</div>
            </div>
          )
        })}
      </div>

      {/* Alertas banner */}
      {alertas.length > 0 && (
        <div style={{
          background: 'rgba(232,64,64,0.06)', border: '1px solid rgba(232,64,64,0.25)',
          borderRadius: 8, padding: '12px 16px', marginBottom: 20,
          display: 'flex', alignItems: 'center', gap: 16
        }}>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: '#e84040' }}>⚠ {alertas.length} ALERTA{alertas.length > 1 ? 'S' : ''} ACTIVA{alertas.length > 1 ? 'S' : ''}</span>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {alertas.map(a => (
              <span key={a.id} style={{ fontSize: 11, color: '#f5a623' }}>
                {a.titulo}: {a.alerta}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Cumplimiento promedio */}
      <div style={{
        background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10,
        padding: 16, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 20
      }}>
        <div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text3)', marginBottom: 4 }}>CUMPLIMIENTO PROMEDIO</div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 32, fontWeight: 700, color: avgCumplimiento < 50 ? '#e84040' : '#f5a623' }}>
            {avgCumplimiento}%
          </div>
        </div>
        <div style={{ flex: 1, height: 8, background: 'var(--border)', borderRadius: 4, overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: `${avgCumplimiento}%`,
            background: 'linear-gradient(90deg, #e84040, #f5a623)',
            borderRadius: 4, transition: 'width 1s ease'
          }} />
        </div>
      </div>

      {/* Grid de acuerdos */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {acuerdos.map(a => <AcuerdoCard key={a.id} a={a} />)}
      </div>
    </div>
  )
}
