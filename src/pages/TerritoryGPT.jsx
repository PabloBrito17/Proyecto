import { useState, useRef, useEffect } from 'react'
import { useTerritorio } from '../TerritoryContext'
import { exportarDiagnosticoPDF } from '../utils/exportarPDF'

const SUGERENCIAS = [
  '¿Cuáles son los principales cuellos de botella para el desarrollo territorial?',
  'Analiza el riesgo de la alta emigración juvenil en el contexto del TRI',
  'Dame una estrategia de corto plazo para mejorar la gobernanza',
  'Evalúa las oportunidades en el sector cafetalero',
  '¿Qué acuerdos GovSync son prioritarios activar?',
]

function Mensaje({ msg }) {
  const isUser = msg.role === 'user'
  return (
    <div style={{
      display: 'flex', gap: 10,
      justifyContent: isUser ? 'flex-end' : 'flex-start',
      marginBottom: 14,
    }}>
      {!isUser && (
        <div style={{
          width: 28, height: 28, borderRadius: 6,
          background: 'rgba(168,85,247,0.2)', border: '1px solid rgba(168,85,247,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, fontFamily: 'var(--mono)', fontSize: 9, color: '#a855f7', marginTop: 2
        }}>GPT</div>
      )}
      <div style={{
        maxWidth: '75%', padding: '10px 14px', borderRadius: 8,
        fontSize: 12, lineHeight: 1.6,
        background: isUser ? 'rgba(0,119,255,0.15)' : 'var(--bg3)',
        border: isUser ? '1px solid rgba(0,119,255,0.3)' : '1px solid var(--border)',
        color: 'var(--text)', whiteSpace: 'pre-wrap',
      }}>
        {msg.content}
      </div>
    </div>
  )
}

function renderTextoMd(texto) {
  if (!texto) return null
  return texto.split('\n').map((line, i) => {
    const parts = line.split(/(\*\*[^*]+\*\*)/)
    return (
      <span key={i}>
        {parts.map((p, j) =>
          p.startsWith('**') && p.endsWith('**')
            ? <strong key={j} style={{ color: 'var(--text)', fontWeight: 600 }}>{p.slice(2, -2)}</strong>
            : p
        )}
        {'\n'}
      </span>
    )
  })
}

export default function TerritoryGPT() {
  const { territorioActual, territorios } = useTerritorio()
  const territorioInfo = territorios.find(t => t.id === territorioActual) || null
  const nombreTerritorio = territorioInfo?.nombre || 'Territorio'
  const [mensajes, setMensajes] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [diagnostico, setDiagnostico] = useState(null)
  const [loadingDiag, setLoadingDiag] = useState(false)
  const [exportando, setExportando] = useState(false)
  const [exportMsg, setExportMsg] = useState(null)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    setMensajes([])
    setDiagnostico(null)
  }, [territorioActual])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensajes])

  const enviar = async (texto) => {
    const msg = texto || input.trim()
    if (!msg) return
    setInput('')
    const nuevos = [...mensajes, { role: 'user', content: msg }]
    setMensajes(nuevos)
    setLoading(true)
    try {
      const res = await fetch('/api/territorygpt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mensaje: msg,
          historial: mensajes.map(m => ({ role: m.role, content: m.content })),
          tid: territorioActual
        })
      })
      const data = await res.json()
      setMensajes([...nuevos, { role: 'assistant', content: data.respuesta || data.error }])
    } catch {
      setMensajes([...nuevos, { role: 'assistant', content: 'Error de conexión con el servidor.' }])
    }
    setLoading(false)
  }

  const generarDiagnostico = async () => {
    setLoadingDiag(true)
    setDiagnostico(null)
    try {
      const res = await fetch(`/api/diagnostico/${territorioActual}`)
      const data = await res.json()
      setDiagnostico(data.texto)
    } catch {
      setDiagnostico('Error generando diagnóstico.')
    }
    setLoadingDiag(false)
  }

  const exportarPDF = async () => {
    setExportando(true)
    setExportMsg(null)
    try {
      // Carga todos los datos necesarios en paralelo
      const [territorio, indicadores, triRadar, acuerdos, diagRes] = await Promise.all([
        fetch(`/api/territorio/${territorioActual}`).then(r => r.json()),
        fetch(`/api/indicadores/${territorioActual}`).then(r => r.json()),
        fetch(`/api/tri/radar/${territorioActual}`).then(r => r.json()),
        fetch(`/api/govsync/${territorioActual}`).then(r => r.json()),
        diagnostico ? Promise.resolve({ texto: diagnostico }) : fetch(`/api/diagnostico/${territorioActual}`).then(r => r.json()),
      ])
      const nombreArchivo = await exportarDiagnosticoPDF({
        territorio,
        indicadores,
        triRadar,
        diagnosticoTexto: diagRes.texto,
        acuerdos,
      })
      setExportMsg({ ok: true, texto: `✓ ${nombreArchivo}` })
      if (!diagnostico) setDiagnostico(diagRes.texto)
    } catch (err) {
      setExportMsg({ ok: false, texto: `Error: ${err.message}` })
    }
    setExportando(false)
    setTimeout(() => setExportMsg(null), 5000)
  }

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontFamily: 'var(--mono)', fontSize: 16, fontWeight: 700, letterSpacing: 1, marginBottom: 4 }}>
          CONSULTOR IA TERRITORIAL
        </h1>
        <p style={{ color: 'var(--text2)', fontSize: 12 }}>
          Inteligencia territorial contextualizada · {nombreTerritorio}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20, height: 'calc(100vh - 160px)' }}>

        {/* Chat */}
        <div style={{
          background: 'var(--bg2)', border: '1px solid var(--border)',
          borderRadius: 10, display: 'flex', flexDirection: 'column', overflow: 'hidden'
        }}>
          <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
            {mensajes.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 24, color: 'rgba(168,85,247,0.4)', marginBottom: 12 }}>◈</div>
                <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 20 }}>
                  TerritoryGPT conoce el perfil completo de {nombreTerritorio}.<br />
                  Haz una pregunta o usa una sugerencia.
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 420, margin: '0 auto' }}>
                  {SUGERENCIAS.map((s, i) => (
                    <button key={i} onClick={() => enviar(s)} style={{
                      background: 'var(--bg3)', border: '1px solid var(--border)',
                      borderRadius: 8, padding: '8px 14px', fontSize: 11,
                      color: 'var(--text2)', textAlign: 'left', cursor: 'pointer',
                    }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(168,85,247,0.5)'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {mensajes.map((m, i) => <Mensaje key={i} msg={m} />)}
            {loading && (
              <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
                <div style={{ width: 28, height: 28, borderRadius: 6, background: 'rgba(168,85,247,0.2)', border: '1px solid rgba(168,85,247,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--mono)', fontSize: 9, color: '#a855f7' }}>GPT</div>
                <div style={{ padding: '10px 14px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, display: 'flex', gap: 4, alignItems: 'center' }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: '#a855f7', opacity: 0.7, animation: `pulse 1.2s ${i * 0.2}s infinite` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8 }}>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); enviar() } }}
              placeholder="Pregunta sobre el territorio... (Enter para enviar)"
              style={{
                flex: 1, background: 'var(--bg3)', border: '1px solid var(--border)',
                borderRadius: 8, padding: '8px 12px', color: 'var(--text)',
                fontSize: 12, resize: 'none', height: 60, outline: 'none',
              }}
            />
            <button onClick={() => enviar()} disabled={loading || !input.trim()} style={{
              background: loading ? 'var(--border)' : 'rgba(168,85,247,0.2)',
              border: '1px solid rgba(168,85,247,0.4)',
              borderRadius: 8, padding: '0 16px',
              color: '#a855f7', fontSize: 14, alignSelf: 'stretch', cursor: 'pointer'
            }}>→</button>
          </div>
        </div>

        {/* Panel derecho */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, overflowY: 'auto' }}>

          {/* Diagnóstico + PDF */}
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: 20 }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: '#a855f7', letterSpacing: 2, marginBottom: 12 }}>
              DIAGNÓSTICO NARRATIVO
            </div>
            <p style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 14, lineHeight: 1.5 }}>
              Análisis ejecutivo basado en todos los indicadores del territorio.
            </p>

            {/* Botón generar */}
            <button onClick={generarDiagnostico} disabled={loadingDiag} style={{
              width: '100%', padding: '9px', marginBottom: 8,
              background: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.3)',
              borderRadius: 8, color: '#a855f7', fontSize: 11, fontFamily: 'var(--mono)',
              cursor: loadingDiag ? 'default' : 'pointer',
            }}>
              {loadingDiag ? '⟳ Analizando...' : '◈ Generar Diagnóstico'}
            </button>

            {/* Botón exportar PDF */}
            <button onClick={exportarPDF} disabled={exportando} style={{
              width: '100%', padding: '9px',
              background: exportando ? 'var(--bg3)' : 'rgba(0,196,160,0.12)',
              border: `1px solid ${exportando ? 'var(--border)' : 'rgba(0,196,160,0.35)'}`,
              borderRadius: 8, color: exportando ? 'var(--text3)' : '#00c4a0',
              fontSize: 11, fontFamily: 'var(--mono)',
              cursor: exportando ? 'default' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}>
              {exportando
                ? <><span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⟳</span> Generando PDF...</>
                : '⬇ Exportar Diagnóstico PDF'}
            </button>

            {/* Mensaje resultado exportación */}
            {exportMsg && (
              <div style={{
                marginTop: 8, padding: '7px 10px', borderRadius: 6, fontSize: 10,
                fontFamily: 'var(--mono)',
                background: exportMsg.ok ? 'rgba(0,196,160,0.08)' : 'rgba(232,64,64,0.08)',
                border: `1px solid ${exportMsg.ok ? 'rgba(0,196,160,0.25)' : 'rgba(232,64,64,0.25)'}`,
                color: exportMsg.ok ? '#00c4a0' : '#e84040',
              }}>
                {exportMsg.texto}
              </div>
            )}

            {/* Texto diagnóstico */}
            {diagnostico && (
              <div style={{
                marginTop: 12, padding: 12, background: 'var(--bg3)',
                border: '1px solid var(--border)', borderRadius: 8,
                fontSize: 11, lineHeight: 1.7, color: 'var(--text2)',
                maxHeight: 340, overflowY: 'auto', whiteSpace: 'pre-wrap',
              }}>
                {renderTextoMd(diagnostico)}
              </div>
            )}
          </div>

          {/* Contexto inyectado */}
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: 16 }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text3)', letterSpacing: 2, marginBottom: 10 }}>
              CONTEXTO INYECTADO A GPT
            </div>
            {[
              ['12 indicadores territoriales', '#00c4a0'],
              ['TRI · 4 dimensiones', '#0077ff'],
              ['Perfil sociodemográfico', '#a855f7'],
              ['Acuerdos GovSync + alertas', '#f5a623'],
              ['Trayectoria histórica TRI', '#ff6b35'],
            ].map(([label, color]) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <div style={{ width: 4, height: 4, borderRadius: '50%', background: color, flexShrink: 0 }} />
                <span style={{ fontSize: 11, color: 'var(--text2)' }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
          40% { transform: scale(1); opacity: 1; }
        }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
