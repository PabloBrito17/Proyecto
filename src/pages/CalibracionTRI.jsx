import { useState, useEffect } from 'react'
import { useTerritorio } from '../TerritoryContext'

const NUCLEO_FIJO = [
  {
    id: 'dim1_cohesion',
    dimension: 'Gobernanza Territorial',
    variable: 'Cohesión social como precondición',
    razon: 'Variable estructural del modelo TRI. Su ponderación es invariable por diseño metodológico — modificarla rompería la comparabilidad entre territorios.',
  },
  {
    id: 'dim2_capital',
    dimension: 'Capacidades Territoriales',
    variable: 'Capital humano base (escolaridad PEA)',
    razon: 'Indicador de stock estructural. Varía solo con censos nacionales, no con intervenciones puntuales.',
  },
  {
    id: 'dim3_recaud',
    dimension: 'Movilización de Recursos',
    variable: 'Recaudación municipal propia como ratio base',
    razon: 'Indicador de autonomía fiscal estructural. Núcleo del modelo de soberanía territorial.',
  },
  {
    id: 'dim4_emigr',
    dimension: 'Dinámica Laboral Territorial',
    variable: 'Tasa de emigración neta anual',
    razon: 'Variable de contexto territorial invariable a corto plazo. Refleja condición estructural, no resultado de política.',
  },
]

const AJUSTABLES = [
  {
    id: 'adj_infra',
    dimension: 'Capacidades Territoriales',
    variable: 'Ponderación de infraestructura habilitante',
    rango: '15%–35% del score Dim 2',
    default: '25%',
    contextos: { rural: '30%', 'peri-urbano': '25%', urbano: '18%' },
  },
  {
    id: 'adj_coop',
    dimension: 'Movilización de Recursos',
    variable: 'Peso de cooperación internacional activa',
    rango: '20%–40% del score Dim 3',
    default: '30%',
    contextos: { alta: '35%', media: '30%', baja: '22%' },
  },
  {
    id: 'adj_movilidad',
    dimension: 'Dinámica Laboral Territorial',
    variable: 'Peso de movilidad laboral internacional',
    rango: '15%–40% del score Dim 4',
    default: '25%',
    contextos: { alta: '38%', media: '25%', baja: '16%' },
  },
]

const PREGUNTAS = [
  {
    id: 'tipo',
    label: 'Tipo de municipio',
    tooltip: 'Determina la ponderación de infraestructura habilitante en el TRI.',
    opciones: ['rural', 'peri-urbano', 'urbano'],
  },
  {
    id: 'base_productiva',
    label: 'Base productiva dominante',
    tooltip: 'Orienta la interpretación de la subdimensión productiva del TRI.',
    opciones: ['agricultura / ganadería', 'servicios', 'manufactura', 'mixta'],
  },
  {
    id: 'remesas',
    label: 'Nivel estimado de remesas',
    tooltip: 'Ajusta el peso de movilidad laboral internacional en Dinámica Laboral.',
    opciones: ['alto (>20% ingreso territorial)', 'medio (10–20%)', 'bajo (<10%)'],
  },
  {
    id: 'poblacion',
    label: 'Población aproximada',
    tooltip: 'Contextualiza los umbrales de densidad institucional del TRI.',
    opciones: ['menos de 10.000 hab', '10.000–50.000 hab', 'más de 50.000 hab'],
  },
  {
    id: 'actor_ancla',
    label: '¿Existe un actor ancla identificado?',
    tooltip: 'Actor ancla: empresa, cooperativa u organización que estructura la economía local.',
    opciones: ['sí', 'no', 'en identificación'],
  },
]

const STATUS = { idle: 'idle', loading: 'loading', saved: 'saved', error: 'error' }

export default function CalibracionTRI() {
  const { territorioActual, territorios } = useTerritorio()
  const territorio = territorios.find(t => t.id === territorioActual)

  const [paso, setPaso]               = useState('menu')
  const [respuestas, setRespuestas]   = useState({})
  const [preguntaIdx, setPreguntaIdx] = useState(0)
  const [configurado, setConfigurado] = useState(false)
  const [saveStatus, setSaveStatus]   = useState(STATUS.idle)
  const [cargando, setCargando]       = useState(false)
  const [errorCarga, setErrorCarga]   = useState(null)

  // ── Cargar calibración guardada al montar o cambiar territorio ──
  useEffect(() => {
    if (!territorioActual) return
    setCargando(true)
    setErrorCarga(null)

    fetch(`/api/calibracion/${territorioActual}`)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then(data => {
        if (data && data.respuestas && Object.keys(data.respuestas).length > 0) {
          setRespuestas(data.respuestas)
          setConfigurado(true)
        }
      })
      .catch(err => {
        // No es error crítico — puede no haber calibración guardada
        console.warn('Sin calibración guardada:', err.message)
      })
      .finally(() => setCargando(false))
  }, [territorioActual])

  const preguntaActual = PREGUNTAS[preguntaIdx]
  const totalPreguntas = PREGUNTAS.length

  const responder = (valor) => {
    const nuevas = { ...respuestas, [preguntaActual.id]: valor }
    setRespuestas(nuevas)
    if (preguntaIdx < totalPreguntas - 1) {
      setPreguntaIdx(preguntaIdx + 1)
    } else {
      guardarCalibracion(nuevas)
      setConfigurado(true)
      setPaso('completado')
    }
  }

  const guardarCalibracion = (resp) => {
    setSaveStatus(STATUS.loading)
    const ajustes = calcularAjustes(resp)

    fetch(`/api/calibracion/${territorioActual}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ respuestas: resp, ajustes }),
    })
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then(() => {
        setSaveStatus(STATUS.saved)
        setTimeout(() => setSaveStatus(STATUS.idle), 4000)
      })
      .catch(() => {
        setSaveStatus(STATUS.error)
      })
  }

  const reintentarGuardado = () => guardarCalibracion(respuestas)

  const calcularAjustes = (resp) => {
    const ajustes = []
    if (resp.tipo) {
      const v = AJUSTABLES.find(a => a.id === 'adj_infra')
      ajustes.push({ variable: v.variable, valor: v.contextos[resp.tipo] || v.default, criterio: `Tipo: ${resp.tipo}` })
    }
    if (resp.remesas) {
      const v = AJUSTABLES.find(a => a.id === 'adj_movilidad')
      const key = resp.remesas.startsWith('alto') ? 'alta' : resp.remesas.startsWith('medio') ? 'media' : 'baja'
      ajustes.push({ variable: v.variable, valor: v.contextos[key] || v.default, criterio: `Remesas: ${resp.remesas}` })
    }
    return ajustes
  }

  const ajustesActuales = calcularAjustes(respuestas)

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'var(--mono)', fontSize: 16, fontWeight: 700, letterSpacing: 1, marginBottom: 4 }}>
          CALIBRACIÓN METODOLÓGICA TRI
        </h1>
        <p style={{ color: 'var(--text2)', fontSize: 12 }}>
          {territorio?.nombre} · Arquitectura de variables y protocolo contextual
        </p>
      </div>

      {/* Banner de estado de guardado */}
      {saveStatus === STATUS.saved && (
        <div style={{
          marginBottom: 16, padding: '10px 16px', borderRadius: 8,
          background: 'rgba(0,196,160,0.08)', border: '1px solid rgba(0,196,160,0.3)',
          fontSize: 11, color: '#00c4a0', fontFamily: 'var(--mono)',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          ✓ CONFIGURACIÓN GUARDADA CORRECTAMENTE — Calibración persistida para {territorio?.nombre}
        </div>
      )}
      {saveStatus === STATUS.error && (
        <div style={{
          marginBottom: 16, padding: '10px 16px', borderRadius: 8,
          background: 'rgba(232,64,64,0.07)', border: '1px solid rgba(232,64,64,0.25)',
          fontSize: 11, color: '#e84040', fontFamily: 'var(--mono)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span>⚠ No se pudo guardar la calibración en el servidor.</span>
          <button onClick={reintentarGuardado} style={{
            background: 'rgba(232,64,64,0.15)', border: '1px solid rgba(232,64,64,0.3)',
            borderRadius: 4, padding: '3px 10px', color: '#e84040',
            fontFamily: 'var(--mono)', fontSize: 10, cursor: 'pointer',
          }}>↺ REINTENTAR</button>
        </div>
      )}
      {saveStatus === STATUS.loading && (
        <div style={{
          marginBottom: 16, padding: '10px 16px', borderRadius: 8,
          background: 'rgba(0,119,255,0.07)', border: '1px solid rgba(0,119,255,0.2)',
          fontSize: 11, color: '#0077ff', fontFamily: 'var(--mono)',
        }}>
          ⟳ Guardando calibración...
        </div>
      )}

      {cargando && (
        <div style={{ marginBottom: 16, fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>
          Cargando calibración previa...
        </div>
      )}

      {/* MENÚ INICIAL */}
      {paso === 'menu' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, maxWidth: 700 }}>
          <div
            onClick={() => { setPaso('asistente'); setPreguntaIdx(0); setRespuestas({}) }}
            style={{
              background: 'var(--bg2)', border: '1px solid rgba(0,196,160,0.3)',
              borderRadius: 12, padding: 24, cursor: 'pointer', transition: 'all 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(0,196,160,0.7)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(0,196,160,0.3)'}
          >
            <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: '#00c4a0', letterSpacing: 2, marginBottom: 10 }}>
              ⚙ ASISTENTE DE CALIBRACIÓN
            </div>
            <p style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.5, margin: 0 }}>
              5 preguntas sobre el perfil del territorio. El sistema pre-configura automáticamente las variables ajustables del TRI.
            </p>
            {configurado && (
              <div style={{ marginTop: 10, fontSize: 10, color: '#00c4a0', fontFamily: 'var(--mono)' }}>
                ✓ CALIBRACIÓN APLICADA · {Object.keys(respuestas).length} parámetros configurados
              </div>
            )}
          </div>

          <div
            onClick={() => setPaso('candados')}
            style={{
              background: 'var(--bg2)', border: '1px solid var(--border)',
              borderRadius: 12, padding: 24, cursor: 'pointer', transition: 'all 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(0,119,255,0.4)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: '#0077ff', letterSpacing: 2, marginBottom: 10 }}>
              🔒 ARQUITECTURA DE VARIABLES
            </div>
            <p style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.5, margin: 0 }}>
              Variables de núcleo fijo y variables ajustables por contexto. Transparencia metodológica completa del TRI.
            </p>
          </div>

          {/* Resumen de calibración activa */}
          {configurado && ajustesActuales.length > 0 && (
            <div style={{
              gridColumn: '1 / -1',
              background: 'rgba(0,196,160,0.04)', border: '1px solid rgba(0,196,160,0.2)',
              borderRadius: 10, padding: '14px 18px',
            }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: '#00c4a0', letterSpacing: 2, marginBottom: 10 }}>
                CALIBRACIÓN ACTIVA — {territorio?.nombre}
              </div>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {ajustesActuales.map((aj, i) => (
                  <div key={i} style={{
                    padding: '6px 12px', background: 'var(--bg3)',
                    borderRadius: 6, display: 'flex', gap: 8, alignItems: 'center',
                  }}>
                    <span style={{ fontSize: 11, color: 'var(--text2)' }}>{aj.criterio}</span>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: '#00c4a0', fontWeight: 700 }}>{aj.valor}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ASISTENTE — pregunta por pregunta */}
      {paso === 'asistente' && (
        <div style={{ maxWidth: 560 }}>
          <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text3)' }}>
              PREGUNTA {preguntaIdx + 1} / {totalPreguntas}
            </div>
            <div style={{ flex: 1, height: 2, background: 'var(--border)', borderRadius: 1 }}>
              <div style={{ width: `${((preguntaIdx + 1) / totalPreguntas) * 100}%`, height: '100%', background: '#00c4a0', borderRadius: 1, transition: 'width 0.3s' }} />
            </div>
          </div>

          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: 24 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>
              {preguntaActual.label}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 20, lineHeight: 1.5 }}>
              {preguntaActual.tooltip}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {preguntaActual.opciones.map(op => (
                <button
                  key={op}
                  onClick={() => responder(op)}
                  style={{
                    padding: '10px 16px', background: 'var(--bg3)',
                    border: '1px solid var(--border)', borderRadius: 8,
                    color: 'var(--text)', fontSize: 12, cursor: 'pointer',
                    textAlign: 'left', transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#00c4a0'; e.currentTarget.style.color = '#00c4a0' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text)' }}
                >
                  {op}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => setPaso('menu')}
            style={{ marginTop: 12, background: 'none', border: 'none', color: 'var(--text3)', fontSize: 11, cursor: 'pointer', fontFamily: 'var(--mono)' }}
          >
            ← cancelar
          </button>
        </div>
      )}

      {/* CANDADOS — arquitectura de variables */}
      {paso === 'candados' && (
        <div style={{ maxWidth: 720 }}>
          <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text2)', letterSpacing: 1, margin: 0 }}>
              NÚCLEO FIJO — VARIABLES NO MODIFICABLES
            </h2>
            <button
              onClick={() => setPaso('menu')}
              style={{ background: 'none', border: 'none', color: 'var(--text3)', fontSize: 11, cursor: 'pointer', fontFamily: 'var(--mono)' }}
            >
              ← volver
            </button>
          </div>

          {NUCLEO_FIJO.map(v => (
            <div key={v.id} style={{
              background: 'var(--bg2)', border: '1px solid var(--border)',
              borderLeft: '3px solid rgba(138,155,181,0.5)',
              borderRadius: '0 8px 8px 0', padding: '12px 16px', marginBottom: 8,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>🔒</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>{v.variable}</span>
              </div>
              <div style={{ fontSize: 10, color: '#0077ff', fontFamily: 'var(--mono)', marginBottom: 4 }}>{v.dimension}</div>
              <div style={{ fontSize: 11, color: 'var(--text3)', lineHeight: 1.5 }}>{v.razon}</div>
            </div>
          ))}

          <div style={{ marginTop: 24, marginBottom: 12 }}>
            <h2 style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text2)', letterSpacing: 1, margin: 0 }}>
              VARIABLES AJUSTABLES POR CONTEXTO
            </h2>
          </div>

          {AJUSTABLES.map(v => (
            <div key={v.id} style={{
              background: 'var(--bg2)', border: '1px solid rgba(0,196,160,0.2)',
              borderLeft: '3px solid #00c4a0',
              borderRadius: '0 8px 8px 0', padding: '12px 16px', marginBottom: 8,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>{v.variable}</span>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: '#00c4a0' }}>{v.rango}</span>
              </div>
              <div style={{ fontSize: 10, color: '#0077ff', fontFamily: 'var(--mono)', marginBottom: 6 }}>{v.dimension}</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {Object.entries(v.contextos).map(([ctx, val]) => (
                  <span key={ctx} style={{
                    fontSize: 10, padding: '2px 8px',
                    background: 'rgba(0,196,160,0.08)', border: '1px solid rgba(0,196,160,0.2)',
                    borderRadius: 4, color: 'var(--text2)', fontFamily: 'var(--mono)',
                  }}>
                    {ctx}: {val}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* COMPLETADO */}
      {paso === 'completado' && (
        <div style={{ maxWidth: 560 }}>
          <div style={{
            background: 'rgba(0,196,160,0.06)', border: '1px solid rgba(0,196,160,0.3)',
            borderRadius: 12, padding: 24, marginBottom: 20,
          }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: '#00c4a0', letterSpacing: 2, marginBottom: 12 }}>
              ✓ CALIBRACIÓN COMPLETADA
            </div>
            <div style={{ fontSize: 13, color: 'var(--text)', marginBottom: 16 }}>
              Ajustes aplicados al perfil de <strong>{territorio?.nombre}</strong>:
            </div>
            {ajustesActuales.map((aj, i) => (
              <div key={i} style={{
                padding: '8px 12px', background: 'var(--bg3)',
                borderRadius: 6, marginBottom: 6,
                display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
              }}>
                <div>
                  <div style={{ fontSize: 12, color: 'var(--text)' }}>{aj.variable}</div>
                  <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 2 }}>{aj.criterio}</div>
                </div>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 13, color: '#00c4a0', fontWeight: 700 }}>{aj.valor}</span>
              </div>
            ))}

            <div style={{ marginTop: 16, padding: '8px 12px', background: 'rgba(0,196,160,0.05)', borderRadius: 6 }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--text3)', marginBottom: 6, letterSpacing: 1 }}>
                PARÁMETROS CONTEXTUALES REGISTRADOS
              </div>
              {Object.entries(respuestas).map(([k, v]) => {
                const preg = PREGUNTAS.find(p => p.id === k)
                return (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, paddingBottom: 3 }}>
                    <span style={{ color: 'var(--text3)' }}>{preg?.label}</span>
                    <span style={{ color: 'var(--text2)', fontFamily: 'var(--mono)' }}>{v}</span>
                  </div>
                )
              })}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={() => setPaso('menu')}
              style={{
                padding: '9px 20px', background: 'rgba(0,196,160,0.1)',
                border: '1px solid rgba(0,196,160,0.3)', borderRadius: 8,
                color: '#00c4a0', fontFamily: 'var(--mono)', fontSize: 10,
                cursor: 'pointer', letterSpacing: 1,
              }}
            >
              ← VOLVER AL MENÚ
            </button>
            <button
              onClick={() => { setRespuestas({}); setPreguntaIdx(0); setConfigurado(false); setPaso('asistente') }}
              style={{
                padding: '9px 20px', background: 'transparent',
                border: '1px solid var(--border)', borderRadius: 8,
                color: 'var(--text3)', fontFamily: 'var(--mono)', fontSize: 10,
                cursor: 'pointer', letterSpacing: 1,
              }}
            >
              ↺ RECALIBRAR
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
