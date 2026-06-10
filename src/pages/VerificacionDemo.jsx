import { useState, useCallback } from 'react'

const CHECKS = [
  { id: 'backend',     label: 'Backend activo',          url: '/api/health',            key: 'status',  expect: 'ok' },
  { id: 'territorios', label: 'Territorios cargados',    url: '/api/territorios',        key: null,      expect: 'array_nonempty' },
  { id: 'indicadores', label: 'Indicadores cargados',    url: '/api/indicadores/1',      key: null,      expect: 'array_nonempty' },
  { id: 'tri',         label: 'Serie TRI disponible',    url: '/api/tri/historial/1',    key: null,      expect: 'array_nonempty' },
  { id: 'govsync',     label: 'GovSync operativo',       url: '/api/govsync/1',          key: null,      expect: 'array_nonempty' },
  { id: 'ai',          label: 'Motor IA disponible',     url: '/api/health',             key: 'ai_mode', expect: 'any' },
  { id: 'pdf',         label: 'Exportación PDF',         url: null,                      key: null,      expect: 'jspdf' },
]

const STATUS = { pending: 'pending', running: 'running', ok: 'ok', warn: 'warn', error: 'error' }

async function runCheck(check) {
  if (check.expect === 'jspdf') {
    try {
      // Verificar que jspdf está disponible como módulo
      const mod = await import('jspdf')
      return { status: STATUS.ok, detail: 'jsPDF disponible' }
    } catch {
      return { status: STATUS.warn, detail: 'jsPDF no cargado — exportación PDF no disponible' }
    }
  }

  try {
    const r = await fetch(check.url, { signal: AbortSignal.timeout(5000) })
    if (!r.ok) return { status: STATUS.error, detail: `HTTP ${r.status}` }
    const data = await r.json()

    if (check.expect === 'array_nonempty') {
      if (!Array.isArray(data) || data.length === 0)
        return { status: STATUS.warn, detail: 'Sin datos (array vacío)' }
      return { status: STATUS.ok, detail: `${data.length} registros` }
    }

    if (check.expect === 'any') {
      const val = check.key ? data[check.key] : data
      return { status: STATUS.ok, detail: check.key === 'ai_mode' ? `Modo: ${val}` : String(val) }
    }

    const val = check.key ? data[check.key] : data
    if (val === check.expect)
      return { status: STATUS.ok, detail: `${check.key || 'respuesta'}: ${val}` }
    return { status: STATUS.warn, detail: `Valor inesperado: ${JSON.stringify(val)}` }

  } catch (err) {
    if (err.name === 'TimeoutError') return { status: STATUS.error, detail: 'Timeout — servidor no responde' }
    return { status: STATUS.error, detail: err.message }
  }
}

export default function VerificacionDemo() {
  const [results, setResults] = useState({})
  const [running, setRunning] = useState(false)
  const [done, setDone]       = useState(false)

  const runAll = useCallback(async () => {
    setRunning(true)
    setDone(false)
    const fresh = {}
    setResults({})

    for (const check of CHECKS) {
      setResults(prev => ({ ...prev, [check.id]: { status: STATUS.running, detail: 'Verificando...' } }))
      const result = await runCheck(check)
      fresh[check.id] = result
      setResults(prev => ({ ...prev, [check.id]: result }))
    }

    setRunning(false)
    setDone(true)
  }, [])

  const allOk    = done && Object.values(results).every(r => r.status === STATUS.ok || r.status === STATUS.warn)
  const hasError = done && Object.values(results).some(r => r.status === STATUS.error)
  const hasWarn  = done && !hasError && Object.values(results).some(r => r.status === STATUS.warn)

  const statusIcon = { [STATUS.pending]: '○', [STATUS.running]: '⟳', [STATUS.ok]: '●', [STATUS.warn]: '△', [STATUS.error]: '✕' }
  const statusColor = { [STATUS.pending]: 'var(--text3)', [STATUS.running]: '#0077ff', [STATUS.ok]: '#00c4a0', [STATUS.warn]: '#f5a623', [STATUS.error]: '#e84040' }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'var(--mono)', fontSize: 16, fontWeight: 700, letterSpacing: 1, marginBottom: 4 }}>
          VERIFICACIÓN DE DEMO
        </h1>
        <p style={{ color: 'var(--text2)', fontSize: 12 }}>
          Diagnóstico pre-presentación · Valida que todos los componentes estén operativos
        </p>
      </div>

      {/* Resultado global */}
      {done && (
        <div style={{
          marginBottom: 20, padding: '16px 20px', borderRadius: 10,
          background: hasError ? 'rgba(232,64,64,0.07)' : hasWarn ? 'rgba(245,166,35,0.07)' : 'rgba(0,196,160,0.07)',
          border: `1px solid ${hasError ? 'rgba(232,64,64,0.3)' : hasWarn ? 'rgba(245,166,35,0.3)' : 'rgba(0,196,160,0.3)'}`,
          display: 'flex', alignItems: 'center', gap: 14,
        }}>
          <span style={{ fontSize: 28 }}>
            {hasError ? '🔴' : hasWarn ? '🟡' : '🟢'}
          </span>
          <div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 700,
              color: hasError ? '#e84040' : hasWarn ? '#f5a623' : '#00c4a0' }}>
              {hasError ? 'ELEMENTOS PENDIENTES — Revisar antes de presentar' :
               hasWarn  ? 'APTO CON OBSERVACIONES — Funcional pero con advertencias' :
               '✓ LISTO PARA PRESENTACIÓN'}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 3 }}>
              {CHECKS.filter(c => results[c.id]?.status === STATUS.ok).length} / {CHECKS.length} verificaciones exitosas
            </div>
          </div>
        </div>
      )}

      {/* Lista de checks */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24, maxWidth: 620 }}>
        {CHECKS.map(check => {
          const r = results[check.id] || { status: STATUS.pending }
          const color = statusColor[r.status]
          return (
            <div key={check.id} style={{
              background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8,
              padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12,
              borderLeft: `3px solid ${color}`,
            }}>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 16, color, minWidth: 18, lineHeight: 1 }}>
                {r.status === STATUS.running
                  ? <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>⟳</span>
                  : statusIcon[r.status]}
              </span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{check.label}</div>
                {r.detail && (
                  <div style={{ fontSize: 10, color: r.status === STATUS.error ? '#e84040' : 'var(--text3)', marginTop: 2, fontFamily: 'var(--mono)' }}>
                    {r.detail}
                  </div>
                )}
              </div>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color, letterSpacing: 1 }}>
                {r.status.toUpperCase()}
              </span>
            </div>
          )
        })}
      </div>

      {/* Botón de ejecución */}
      <button
        onClick={runAll}
        disabled={running}
        style={{
          padding: '11px 28px',
          background: running ? 'var(--bg3)' : 'rgba(0,196,160,0.1)',
          border: `1px solid ${running ? 'var(--border)' : 'rgba(0,196,160,0.4)'}`,
          borderRadius: 8, color: running ? 'var(--text3)' : '#00c4a0',
          fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: 1,
          cursor: running ? 'not-allowed' : 'pointer',
        }}
      >
        {running ? '⟳ VERIFICANDO...' : done ? '↺ RE-VERIFICAR' : '▶ INICIAR VERIFICACIÓN'}
      </button>

      {/* Nota */}
      <div style={{ marginTop: 20, fontSize: 11, color: 'var(--text3)', lineHeight: 1.6 }}>
        Esta verificación comprueba: conectividad backend, integridad de base de datos, disponibilidad de datos demo,<br/>
        motor de inteligencia territorial y capacidad de exportación. Ejecutar antes de cada presentación.
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
