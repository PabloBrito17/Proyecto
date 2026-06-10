import { useEffect, useState } from 'react'
import { useTerritorio } from '../TerritoryContext'

const TIPOS_DOCUMENTO = [
  { value: 'dt',        label: 'Diagnóstico Territorial (DT)',              desc: 'Línea base del territorio' },
  { value: 'pdm',       label: 'Plan de Desarrollo Municipal (PDM)',         desc: 'Plan rector municipal' },
  { value: 'pdt',       label: 'Plan de Desarrollo Territorial (PDT/PDL)',   desc: 'Plan de escala territorial' },
  { value: 'pot',       label: 'Plan de Ordenamiento Territorial (POT)',     desc: 'Ordenamiento del suelo' },
  { value: 'sectorial', label: 'Plan Sectorial Vigente',                     desc: 'Salud, educación, productivo, infraestructura' },
  { value: 'acuerdo',   label: 'Acuerdo de Cooperación Interinstitucional',  desc: 'Acuerdos activos de referencia' },
  { value: 'evaluacion',label: 'Informe de Evaluación o Seguimiento',        desc: 'Evaluaciones previas' },
]

const DIMENSION_COLOR = {
  'Gobernanza Territorial':       '#e84040',
  'Capacidades Territoriales':    '#00c4a0',
  'Movilización de Recursos':     '#a855f7',
  'Dinámica Laboral Territorial': '#f5a623',
}

export default function DocumentIngesta() {
  const { territorioActual } = useTerritorio()
  const [documentos, setDocumentos]       = useState([])
  const [bpfData, setBpfData]             = useState(null)
  const [vista, setVista]                 = useState('docs')   // 'docs' | 'bpf'
  const [cargando, setCargando]           = useState(false)
  const [guardando, setGuardando]         = useState(false)
  const [mensaje, setMensaje]             = useState(null)

  // Form estado — nuevo documento
  const [formDoc, setFormDoc] = useState({ tipo: 'dt', nombre: '', contenido_texto: '' })

  // BPF — respuestas activas
  const [respuestas, setRespuestas] = useState({})
  const [enviando, setEnviando]     = useState(null)

  const BASE = ''  // rutas relativas — pasan por el proxy de Vite

  const cargarDatos = async () => {
    if (!territorioActual) return
    setCargando(true)
    try {
      const [rDocs, rBpf] = await Promise.all([
        fetch(`${BASE}/api/documentos/${territorioActual}`).then(r => r.json()),
        fetch(`${BASE}/api/documentos/bpf/${territorioActual}`).then(r => r.json()),
      ])
      setDocumentos(Array.isArray(rDocs) ? rDocs : [])
      setBpfData(rBpf)
    } catch {
      setDocumentos([])
      setBpfData(null)
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => { cargarDatos() }, [territorioActual])

  const subirDocumento = async () => {
    if (!formDoc.nombre.trim()) {
      setMensaje({ tipo: 'error', texto: 'El nombre del documento es requerido.' })
      return
    }
    setGuardando(true)
    try {
      const res = await fetch(`${BASE}/api/documentos/upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ territorio_id: territorioActual, ...formDoc }),
      })
      const data = await res.json()
      if (data.ok) {
        setMensaje({ tipo: 'ok', texto: 'Documento registrado correctamente.' })
        setFormDoc({ tipo: 'dt', nombre: '', contenido_texto: '' })
        cargarDatos()
      } else {
        setMensaje({ tipo: 'error', texto: data.error || 'Error al registrar.' })
      }
    } catch (e) {
      setMensaje({ tipo: 'error', texto: e.message })
    } finally {
      setGuardando(false)
      setTimeout(() => setMensaje(null), 3500)
    }
  }

  const enviarRespuesta = async (dimension, pregunta) => {
    const key = `${dimension}||${pregunta}`
    const respuesta = respuestas[key] || ''
    if (!respuesta.trim()) return
    setEnviando(key)
    try {
      await fetch(`${BASE}/api/documentos/bpf/respuesta`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ territorio_id: territorioActual, dimension, pregunta, respuesta }),
      })
      setRespuestas(prev => { const n = { ...prev }; delete n[key]; return n })
      cargarDatos()
    } catch { /* silencioso */ } finally {
      setEnviando(null)
    }
  }

  const estadoDocs = documentos.length > 0 ? 'ok' : 'vacio'
  const bpfPct = bpfData ? Math.round((bpfData.respondidas / bpfData.total) * 100) : 0

  const badge = (texto, color) => (
    <span style={{
      fontFamily: 'var(--mono)', fontSize: 9, padding: '2px 7px',
      background: `${color}18`, border: `1px solid ${color}40`,
      borderRadius: 4, color, letterSpacing: 1,
    }}>{texto}</span>
  )

  return (
    <div style={{ maxWidth: 860, margin: '0 auto' }}>
      {/* Encabezado */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'var(--mono)', fontSize: 14, letterSpacing: 3, color: 'var(--accent)', marginBottom: 4 }}>
          ◈ DOCUMENTOS DEL TERRITORIO
        </h1>
        <p style={{ fontSize: 12, color: 'var(--text3)', lineHeight: 1.5 }}>
          El SOTI opera sobre conocimiento territorial estructurado. Registra aquí los documentos base
          que alimentan al sistema antes de activar cualquier módulo analítico.
        </p>
      </div>

      {/* Panel de estado */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24,
      }}>
        <div style={{
          background: 'var(--bg2)', border: `1px solid ${estadoDocs === 'ok' ? 'rgba(0,196,160,0.4)' : 'rgba(245,166,35,0.4)'}`,
          borderRadius: 10, padding: '14px 16px',
        }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--text3)', letterSpacing: 2, marginBottom: 6 }}>
            DOCUMENTOS BASE
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, color: estadoDocs === 'ok' ? '#00c4a0' : '#f5a623', marginBottom: 4 }}>
            {documentos.length}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text3)' }}>
            {estadoDocs === 'ok' ? 'El sistema opera con contexto territorial.' : 'Sin documentos — se recomienda la BPF.'}
          </div>
        </div>
        <div style={{
          background: 'var(--bg2)', border: '1px solid var(--border)',
          borderRadius: 10, padding: '14px 16px',
        }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--text3)', letterSpacing: 2, marginBottom: 6 }}>
            BATERÍA BPF · COMPLETITUD
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 6 }}>
            <span style={{ fontSize: 24, fontWeight: 700, color: bpfPct >= 80 ? '#00c4a0' : bpfPct >= 40 ? '#f5a623' : '#e84040' }}>
              {bpfPct}%
            </span>
            <span style={{ fontSize: 11, color: 'var(--text3)' }}>
              {bpfData ? `${bpfData.respondidas}/${bpfData.total} preguntas` : '—'}
            </span>
          </div>
          <div style={{ height: 4, background: 'var(--border)', borderRadius: 2 }}>
            <div style={{ height: '100%', width: `${bpfPct}%`, borderRadius: 2,
              background: bpfPct >= 80 ? '#00c4a0' : bpfPct >= 40 ? '#f5a623' : '#e84040',
              transition: 'width 0.4s' }} />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, borderBottom: '1px solid var(--border)', paddingBottom: 0 }}>
        {[
          { key: 'docs', label: 'Registrar documentos' },
          { key: 'bpf',  label: 'Batería de Preguntas Fundacionales (BPF)' },
        ].map(t => (
          <button key={t.key} onClick={() => setVista(t.key)} style={{
            padding: '8px 16px', background: 'none', cursor: 'pointer',
            fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: 1,
            border: 'none', borderBottom: vista === t.key ? '2px solid var(--accent)' : '2px solid transparent',
            color: vista === t.key ? 'var(--accent)' : 'var(--text3)',
            marginBottom: -1, transition: 'all 0.15s',
          }}>{t.label}</button>
        ))}
      </div>

      {/* ── VISTA: DOCUMENTOS ── */}
      {vista === 'docs' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {/* Formulario */}
          <div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text3)', letterSpacing: 2, marginBottom: 12 }}>
              NUEVO DOCUMENTO
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--text3)', letterSpacing: 1, display: 'block', marginBottom: 4 }}>
                TIPO DE DOCUMENTO
              </label>
              <select value={formDoc.tipo} onChange={e => setFormDoc(p => ({ ...p, tipo: e.target.value }))}
                style={{
                  width: '100%', padding: '8px 10px', background: 'var(--bg3)',
                  border: '1px solid var(--border)', borderRadius: 6,
                  color: 'var(--text)', fontFamily: 'var(--mono)', fontSize: 11,
                }}>
                {TIPOS_DOCUMENTO.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
              <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 3 }}>
                {TIPOS_DOCUMENTO.find(t => t.value === formDoc.tipo)?.desc}
              </div>
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--text3)', letterSpacing: 1, display: 'block', marginBottom: 4 }}>
                NOMBRE DEL DOCUMENTO *
              </label>
              <input
                value={formDoc.nombre}
                onChange={e => setFormDoc(p => ({ ...p, nombre: e.target.value }))}
                placeholder="Ej: PDM San Marcos del Valle 2024–2028"
                style={{
                  width: '100%', padding: '8px 10px', background: 'var(--bg3)',
                  border: '1px solid var(--border)', borderRadius: 6,
                  color: 'var(--text)', fontFamily: 'var(--mono)', fontSize: 11, boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--text3)', letterSpacing: 1, display: 'block', marginBottom: 4 }}>
                EXTRACTO DE CONTENIDO (opcional — alimenta el contexto IA)
              </label>
              <textarea
                value={formDoc.contenido_texto}
                onChange={e => setFormDoc(p => ({ ...p, contenido_texto: e.target.value }))}
                placeholder="Pega aquí los párrafos clave del documento para que el Consultor IA pueda consultarlos..."
                rows={5}
                style={{
                  width: '100%', padding: '8px 10px', background: 'var(--bg3)',
                  border: '1px solid var(--border)', borderRadius: 6,
                  color: 'var(--text)', fontFamily: 'var(--mono)', fontSize: 11,
                  resize: 'vertical', boxSizing: 'border-box',
                }}
              />
            </div>

            {mensaje && (
              <div style={{
                padding: '8px 12px', borderRadius: 6, marginBottom: 12, fontSize: 11,
                background: mensaje.tipo === 'ok' ? 'rgba(0,196,160,0.1)' : 'rgba(232,64,64,0.1)',
                border: `1px solid ${mensaje.tipo === 'ok' ? 'rgba(0,196,160,0.4)' : 'rgba(232,64,64,0.4)'}`,
                color: mensaje.tipo === 'ok' ? '#00c4a0' : '#e84040',
              }}>
                {mensaje.texto}
              </div>
            )}

            <button onClick={subirDocumento} disabled={guardando} style={{
              padding: '10px 20px', background: guardando ? 'var(--bg3)' : 'rgba(0,196,160,0.15)',
              border: '1px solid rgba(0,196,160,0.4)', borderRadius: 7,
              color: guardando ? 'var(--text3)' : 'var(--accent)',
              fontFamily: 'var(--mono)', fontSize: 10, cursor: guardando ? 'not-allowed' : 'pointer',
              letterSpacing: 1, transition: 'all 0.15s',
            }}>
              {guardando ? '◌ Registrando...' : '+ REGISTRAR DOCUMENTO'}
            </button>
          </div>

          {/* Lista de documentos */}
          <div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text3)', letterSpacing: 2, marginBottom: 12 }}>
              DOCUMENTOS REGISTRADOS · {documentos.length}
            </div>
            {cargando ? (
              <div style={{ color: 'var(--text3)', fontSize: 11 }}>Cargando…</div>
            ) : documentos.length === 0 ? (
              <div style={{
                padding: 20, border: '1px dashed var(--border)', borderRadius: 8,
                textAlign: 'center', color: 'var(--text3)', fontSize: 11, lineHeight: 1.6,
              }}>
                Sin documentos registrados.<br />
                Registra el primero o usa la BPF para construir el diagnóstico desde cero.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {documentos.map(doc => {
                  const tipo = TIPOS_DOCUMENTO.find(t => t.value === doc.tipo)
                  return (
                    <div key={doc.id} style={{
                      padding: '10px 14px', background: 'var(--bg3)',
                      border: '1px solid var(--border)', borderRadius: 8,
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text)', flex: 1, marginRight: 8 }}>
                          {doc.nombre}
                        </div>
                        {badge(tipo?.value?.toUpperCase() || doc.tipo, '#0077ff')}
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--text3)' }}>
                        {tipo?.label} · {doc.fecha_carga}
                        {doc.contenido_texto ? (
                          <span style={{ marginLeft: 8, color: '#00c4a0' }}>· con extracto IA</span>
                        ) : null}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── VISTA: BPF ── */}
      {vista === 'bpf' && (
        <div>
          <div style={{
            padding: '12px 16px', background: 'rgba(0,119,255,0.06)',
            border: '1px solid rgba(0,119,255,0.2)', borderRadius: 8, marginBottom: 20, fontSize: 11,
            color: 'var(--text2)', lineHeight: 1.6,
          }}>
            <strong style={{ color: 'var(--text)' }}>Batería de Preguntas Fundacionales (BPF)</strong> — Cuando no existen documentos base,
            el SOTI te guía para construir el diagnóstico territorial desde cero, pregunta a pregunta,
            organizado por dimensión TRI. Cada respuesta alimenta directamente el contexto del Consultor IA.
          </div>

          {bpfData?.pendientes?.length === 0 ? (
            <div style={{
              padding: 24, border: '1px solid rgba(0,196,160,0.4)', borderRadius: 10,
              textAlign: 'center', background: 'rgba(0,196,160,0.06)',
            }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>✓</div>
              <div style={{ fontFamily: 'var(--mono)', color: '#00c4a0', fontSize: 12, letterSpacing: 1, marginBottom: 4 }}>
                BPF COMPLETADA
              </div>
              <div style={{ fontSize: 11, color: 'var(--text3)' }}>
                Todas las preguntas han sido respondidas. El sistema tiene contexto territorial completo.
              </div>
            </div>
          ) : (
            Object.entries(
              (bpfData?.pendientes || []).reduce((acc, p) => {
                if (!acc[p.dimension]) acc[p.dimension] = []
                acc[p.dimension].push(p)
                return acc
              }, {})
            ).map(([dim, preguntas]) => (
              <div key={dim} style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <div style={{ width: 3, height: 16, borderRadius: 2, background: DIMENSION_COLOR[dim] || '#8a9bb5' }} />
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: DIMENSION_COLOR[dim] || 'var(--text2)',
                    letterSpacing: 1, fontWeight: 700 }}>
                    {dim.toUpperCase()}
                  </div>
                  {badge(`${preguntas.length} pendiente${preguntas.length > 1 ? 's' : ''}`, DIMENSION_COLOR[dim] || '#8a9bb5')}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingLeft: 11 }}>
                  {preguntas.map(({ dimension, pregunta }) => {
                    const key = `${dimension}||${pregunta}`
                    return (
                      <div key={key} style={{
                        padding: '12px 14px', background: 'var(--bg2)',
                        border: '1px solid var(--border)', borderRadius: 8,
                      }}>
                        <div style={{ fontSize: 11, color: 'var(--text)', marginBottom: 8, lineHeight: 1.5 }}>
                          {pregunta}
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <input
                            value={respuestas[key] || ''}
                            onChange={e => setRespuestas(prev => ({ ...prev, [key]: e.target.value }))}
                            onKeyDown={e => { if (e.key === 'Enter') enviarRespuesta(dimension, pregunta) }}
                            placeholder="Escribe la respuesta…"
                            style={{
                              flex: 1, padding: '7px 10px', background: 'var(--bg3)',
                              border: '1px solid var(--border)', borderRadius: 6,
                              color: 'var(--text)', fontFamily: 'var(--mono)', fontSize: 11,
                            }}
                          />
                          <button onClick={() => enviarRespuesta(dimension, pregunta)}
                            disabled={!respuestas[key]?.trim() || enviando === key}
                            style={{
                              padding: '7px 14px', background: 'rgba(0,196,160,0.12)',
                              border: '1px solid rgba(0,196,160,0.3)', borderRadius: 6,
                              color: 'var(--accent)', fontFamily: 'var(--mono)', fontSize: 10,
                              cursor: 'pointer', letterSpacing: 1, whiteSpace: 'nowrap',
                              opacity: !respuestas[key]?.trim() ? 0.4 : 1,
                            }}>
                            {enviando === key ? '…' : 'GUARDAR'}
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
