import { BrowserRouter, Routes, Route, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { TerritoryProvider, useTerritorio } from './TerritoryContext'
import TerritoryMind from './pages/TerritoryMind'
import TerritoryCapacity from './pages/TerritoryCapacity'
import TerritoryGPT from './pages/TerritoryGPT'
import GovSync from './pages/GovSync'
import TransformTracker from './pages/TransformTracker'
import LearningEngine from './pages/LearningEngine'
import Presentacion from './pages/Presentacion'
import Comparador from './pages/Comparador'
import Login from './pages/Login'
import DocumentIngesta from './pages/DocumentIngesta'
import CalibracionTRI from './pages/CalibracionTRI'
import VerificacionDemo from './pages/VerificacionDemo'
import EstadoSistema from './pages/EstadoSistema'

const NAV_ITEMS = [
  { path: '/',            label: 'Panel Central / Inteligencia Territorial', tag: 'Dashboard',      color: '#00c4a0' },
  { path: '/capacity',    label: 'Capacidades del Territorio (TRI)',          tag: 'TRI',            color: '#0077ff' },
  { path: '/gpt',         label: 'Consultor IA Territorial',                  tag: 'IA',             color: '#a855f7' },
  { path: '/govsync',     label: 'Articulación Interinstitucional',           tag: 'Coordinación',   color: '#f5a623' },
  { path: '/tracker',     label: 'Seguimiento de Transformación',             tag: 'Trayectoria',    color: '#ff6b35' },
  { path: '/learning',    label: 'Motor de Aprendizaje Territorial',          tag: 'Conocimiento',   color: '#22d3ee' },
  { path: '/comparar',    label: 'Comparador de Territorios',                 tag: 'Comparativo',    color: '#84cc16' },
  { path: '/documentos',  label: 'Documentos del Territorio',                 tag: 'Documentos',     color: '#0077ff' },
  { path: '/calibracion',  label: 'Calibración Metodológica TRI',             tag: 'Calibración',    color: '#00c4a0' },
  { path: '/verificacion',  label: 'Verificación de Demo',                       tag: 'Pre-demo',       color: '#e84040' },
]

const TERRITORIO_COLORS = ['#00c4a0', '#0077ff']

function TerritorySelector() {
  const { territorios, territorioActual, setTerritorioActual } = useTerritorio()

  if (!territorios.length) return null

  return (
    <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)',
      background: 'rgba(0,0,0,0.2)' }}>
      <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--text3)',
        letterSpacing: 2, marginBottom: 6 }}>TERRITORIO ACTIVO</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {territorios.map((t, i) => {
          const isActive = territorioActual === t.id
          const color = TERRITORIO_COLORS[i] || '#8a9bb5'
          return (
            <button key={t.id} onClick={() => setTerritorioActual(t.id)} style={{
              background: isActive ? `${color}15` : 'transparent',
              border: `1px solid ${isActive ? color : 'var(--border)'}`,
              borderRadius: 6, padding: '7px 10px', cursor: 'pointer',
              textAlign: 'left', transition: 'all 0.15s',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%',
                  background: isActive ? color : 'var(--border)', flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600,
                    color: isActive ? 'var(--text)' : 'var(--text2)', lineHeight: 1.2 }}>
                    {t.nombre}
                  </div>
                  <div style={{ fontSize: 9, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>
                    {t.depto} · {Number(t.poblacion).toLocaleString()} hab
                  </div>
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function ComoFuncionaModal({ onClose }) {
  const FUENTES = [
    { dim: 'Gobernanza Territorial',       vars: 'Institucionalidad formal, cohesión social, coordinación interinstitucional, participación ciudadana', fuentes: 'Registros municipales, acuerdos interinstitucionales activos, encuestas de percepción ciudadana' },
    { dim: 'Capacidades Territoriales',    vars: 'Capital humano, capacidad productiva, infraestructura habilitante, diversificación del tejido empresarial', fuentes: 'Registros fiscales municipales, encuesta de hogares nacional, diagnósticos de cadenas de valor' },
    { dim: 'Movilización de Recursos',     vars: 'Inversión pública, cooperación internacional activa, inversión privada, recaudación local propia', fuentes: 'Presupuesto municipal, registros de proyectos de cooperación, datos de comercio exterior' },
    { dim: 'Dinámica Laboral Territorial', vars: 'Mercado laboral local, movilidad interna, conectividad laboral, absorción de fuerza laboral, movilidad internacional', fuentes: 'Encuesta de hogares nacional, registro civil, datos de remesas, registros de retorno migratorio' },
  ]

  const PASOS = [
    { num: '01', titulo: 'Entrada de datos', color: '#00c4a0', texto: 'Los módulos de diagnóstico capturan información cuantitativa y cualitativa del territorio: encuestas, registros institucionales, fuentes censales, planes de desarrollo.' },
    { num: '02', titulo: 'Ponderación',       color: '#0077ff', texto: 'Cada variable tiene un peso relativo dentro de su dimensión. En Gobernanza, por ejemplo, la ejecución presupuestaria pesa más que la percepción ciudadana.' },
    { num: '03', titulo: 'Cálculo del puntaje', color: '#a855f7', texto: 'El Motor de Inteligencia SOTI procesa las variables ponderadas y genera el valor final entre 0 y 100 para cada dimensión.' },
    { num: '04', titulo: 'Actualización',     color: '#f5a623', texto: 'Cada vez que se registra una nueva intervención o se carga un diagnóstico actualizado, el sistema recalcula automáticamente el puntaje afectado.' },
  ]

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24,
    }} onClick={onClose}>
      <div style={{
        width: '100%', maxWidth: 720, maxHeight: '85vh',
        background: 'var(--bg2)', border: '1px solid var(--border)',
        borderRadius: 14, overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
      }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{
          padding: '18px 24px', borderBottom: '1px solid var(--border)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: 'rgba(0,196,160,0.04)',
        }}>
          <div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 700,
              color: 'var(--accent)', letterSpacing: 2 }}>ARQUITECTURA DEL MOTOR TRI</div>
            <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 3 }}>
              Motor de Inteligencia Territorial · Construcción del Índice TRI
            </div>
          </div>
          <button onClick={onClose} style={{
            background: 'none', border: '1px solid var(--border)', borderRadius: 6,
            color: 'var(--text3)', fontSize: 16, width: 30, height: 30,
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>×</button>
        </div>

        {/* Contenido scrollable */}
        <div style={{ overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* Flujo de 4 pasos */}
          <div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--text3)',
              letterSpacing: 2, marginBottom: 14 }}>FLUJO DE CONSTRUCCIÓN DE UN INDICADOR</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {PASOS.map((p, i) => (
                <div key={i} style={{
                  background: 'var(--bg3)', border: `1px solid ${p.color}25`,
                  borderRadius: 10, padding: 16, position: 'relative', overflow: 'hidden',
                }}>
                  <div style={{
                    position: 'absolute', top: 10, right: 12,
                    fontFamily: 'var(--mono)', fontSize: 28, fontWeight: 700,
                    color: `${p.color}12`, lineHeight: 1,
                  }}>{p.num}</div>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: p.color,
                    letterSpacing: 2, marginBottom: 6 }}>{p.num} · {p.titulo.toUpperCase()}</div>
                  <p style={{ fontSize: 11, color: 'var(--text2)', lineHeight: 1.6, margin: 0 }}>
                    {p.texto}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Tabla de fuentes */}
          <div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--text3)',
              letterSpacing: 2, marginBottom: 14 }}>FUENTES TÍPICAS POR DIMENSIÓN</div>
            <div style={{ border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
              <div style={{
                display: 'grid', gridTemplateColumns: '130px 1fr 1fr',
                background: 'rgba(0,196,160,0.06)', borderBottom: '1px solid var(--border)',
                padding: '8px 14px',
              }}>
                {['Dimensión', 'Variables principales', 'Fuentes de datos'].map(h => (
                  <div key={h} style={{ fontFamily: 'var(--mono)', fontSize: 9,
                    color: 'var(--text3)', letterSpacing: 1 }}>{h.toUpperCase()}</div>
                ))}
              </div>
              {FUENTES.map((f, i) => (
                <div key={i} style={{
                  display: 'grid', gridTemplateColumns: '130px 1fr 1fr',
                  padding: '10px 14px', gap: 8,
                  borderBottom: i < FUENTES.length - 1 ? '1px solid var(--border)' : 'none',
                  background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)',
                }}>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 600,
                    color: 'var(--accent)', lineHeight: 1.4 }}>{f.dim}</div>
                  <div style={{ fontSize: 10, color: 'var(--text2)', lineHeight: 1.5 }}>{f.vars}</div>
                  <div style={{ fontSize: 10, color: 'var(--text3)', lineHeight: 1.5 }}>{f.fuentes}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Nota demo */}
          <div style={{
            padding: '10px 14px', borderRadius: 8,
            background: 'rgba(245,166,35,0.06)', border: '1px solid rgba(245,166,35,0.2)',
          }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: '#f5a623',
              letterSpacing: 1, marginBottom: 4 }}>NOTA · VERSIÓN DEMO</div>
            <p style={{ fontSize: 11, color: 'var(--text2)', lineHeight: 1.5, margin: 0 }}>
              En esta versión los puntajes son ilustrativos y reflejan condiciones reales de los territorios piloto.
              En la versión productiva, cada municipio carga sus propios datos y el sistema genera su perfil TRI dinámicamente.
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}

function Sidebar({ modo, onCambiarModo }) {
  const navigate = useNavigate()
  const { territorioActual } = useTerritorio()
  const [modalAbierto, setModalAbierto] = useState(false)
  const [docsCount, setDocsCount]       = useState(null)

  useEffect(() => {
    if (!territorioActual) return
    fetch(`/api/documentos/${territorioActual}`)
      .then(r => r.json())
      .then(d => setDocsCount(Array.isArray(d) ? d.length : 0))
      .catch(() => setDocsCount(0))
  }, [territorioActual])

  return (
    <>
    {modalAbierto && <ComoFuncionaModal onClose={() => setModalAbierto(false)} />}
    <aside style={{
      width: 248, minWidth: 248, background: 'var(--bg2)',
      borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column',
      position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 100
    }}>
      {/* Logo */}
      <div style={{ padding: '18px 16px 14px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--accent)',
          letterSpacing: 3, marginBottom: 3 }}>◈ SOTI</div>
        <div style={{ fontSize: 10, color: 'var(--text3)', lineHeight: 1.3 }}>
          Sistema Operativo<br />Territorial Inteligente
        </div>
      </div>

      {/* Selector de territorio */}
      <TerritorySelector />

      {/* Nav */}
      <nav style={{ flex: 1, padding: '6px 0', overflowY: 'auto' }}>
        {NAV_ITEMS.map(item => (
          <NavLink key={item.path} to={item.path} end={item.path === '/'}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '9px 16px', textDecoration: 'none',
              background: isActive ? `${item.color}12` : 'transparent',
              borderLeft: isActive ? `2px solid ${item.color}` : '2px solid transparent',
              transition: 'all 0.15s',
            })}>
            {({ isActive }) => (<>
              <span style={{ width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
                background: isActive ? item.color : 'var(--text3)', transition: 'background 0.15s' }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 10, fontWeight: 600, fontFamily: 'var(--mono)',
                  color: isActive ? 'var(--text)' : 'var(--text2)' }}>{item.label}</div>
                <div style={{ fontSize: 9, color: isActive ? item.color : 'var(--text3)', display: 'flex', alignItems: 'center', gap: 5 }}>
                  {item.tag}
                  {/* Badge de documentos solo en el ítem de documentos */}
                  {item.path === '/documentos' && docsCount !== null && (
                    <span style={{
                      fontFamily: 'var(--mono)', fontSize: 8, padding: '0px 4px',
                      background: docsCount > 0 ? 'rgba(0,196,160,0.2)' : 'rgba(245,166,35,0.2)',
                      border: `1px solid ${docsCount > 0 ? 'rgba(0,196,160,0.5)' : 'rgba(245,166,35,0.5)'}`,
                      borderRadius: 3, color: docsCount > 0 ? '#00c4a0' : '#f5a623',
                    }}>{docsCount > 0 ? `${docsCount} doc${docsCount !== 1 ? 's' : ''}` : '! sin docs'}</span>
                  )}
                </div>
              </div>
            </>)}
          </NavLink>
        ))}
      </nav>

      {/* Botón presentación */}
      <div style={{ padding: '12px 14px', borderTop: '1px solid var(--border)' }}>
        <button onClick={() => navigate('/presentacion')} style={{
          width: '100%', padding: '9px 12px',
          background: 'rgba(0,196,160,0.1)', border: '1px solid rgba(0,196,160,0.3)',
          borderRadius: 8, color: 'var(--accent)', fontFamily: 'var(--mono)',
          fontSize: 10, cursor: 'pointer', letterSpacing: 1,
          transition: 'all 0.15s', marginBottom: 8,
        }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,196,160,0.2)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,196,160,0.1)'}
        >
          ▶ MODO PRESENTACIÓN
        </button>
        <button onClick={() => setModalAbierto(true)} style={{
          width: '100%', padding: '9px 12px',
          background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)',
          borderRadius: 8, color: 'var(--text3)', fontFamily: 'var(--mono)',
          fontSize: 10, cursor: 'pointer', letterSpacing: 1,
          transition: 'all 0.15s', marginBottom: 8,
        }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = 'var(--text2)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.color = 'var(--text3)' }}
        >
          ⓘ ARQUITECTURA DEL MOTOR TRI
        </button>
        {/* Botón Estado del Sistema — solo en modo institucional */}
        {modo === 'institucional' && (
          <button onClick={() => navigate('/estado-sistema')} style={{
            width: '100%', padding: '9px 12px',
            background: 'rgba(0,119,255,0.08)', border: '1px solid rgba(0,119,255,0.25)',
            borderRadius: 8, color: '#0077ff', fontFamily: 'var(--mono)',
            fontSize: 10, cursor: 'pointer', letterSpacing: 1,
            transition: 'all 0.15s', marginBottom: 8,
          }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,119,255,0.15)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,119,255,0.08)'}
          >
            ◫ ESTADO DEL SISTEMA
          </button>
        )}
        {/* Botón cambiar modo */}
        <button onClick={onCambiarModo} style={{
          width: '100%', padding: '7px 12px',
          background: 'transparent', border: '1px solid var(--border)',
          borderRadius: 8, color: 'var(--text3)', fontFamily: 'var(--mono)',
          fontSize: 9, cursor: 'pointer', letterSpacing: 1,
          transition: 'all 0.15s', marginBottom: 8,
        }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text2)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text3)'}
        >
          ⇄ CAMBIAR MODO
        </button>
        <div style={{ fontSize: 9, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>
          v1.4 · DEMO INSTITUCIONAL
        </div>
        <div style={{ fontSize: 9, color: 'var(--text3)' }}>© Rafael Velásquez</div>
      </div>
    </aside>
    </>
  )
}

function Layout({ children, modo, onCambiarModo }) {
  const location = useLocation()
  const current = NAV_ITEMS.find(i =>
    i.path === '/' ? location.pathname === '/' : location.pathname.startsWith(i.path)
  ) || NAV_ITEMS[0]

  // No mostrar layout para presentación
  if (location.pathname === '/presentacion') return <>{children}</>

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar modo={modo} onCambiarModo={onCambiarModo} />
      <main style={{ marginLeft: 248, flex: 1, minHeight: '100vh', position: 'relative', zIndex: 1 }}>
        <div style={{
          height: 48, borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 24px', background: 'var(--bg2)', position: 'sticky', top: 0, zIndex: 50
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: current.color }}>
              {current.label}
            </span>
            <span style={{ fontSize: 11, color: 'var(--text3)' }}>/ {current.tag}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{
              fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: 1,
              color: '#f5a623', border: '1px solid rgba(245,166,35,0.4)',
              background: 'rgba(245,166,35,0.08)', padding: '2px 8px', borderRadius: 4,
            }}>
              ⚠ DATOS DEMOSTRATIVOS
            </span>
            {modo === 'institucional' && (
              <span style={{
                fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: 1,
                color: '#0077ff', border: '1px solid rgba(0,119,255,0.4)',
                background: 'rgba(0,119,255,0.08)', padding: '2px 8px', borderRadius: 4,
              }}>
                PILOTO EL SALVADOR · VALIDACIÓN 2026
              </span>
            )}
            <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text3)' }}>
              {new Date().toLocaleDateString('es-SV', { year: 'numeric', month: 'short', day: 'numeric' })}
            </div>
          </div>
        </div>
        <div style={{ padding: 24 }}>{children}</div>
      </main>
    </div>
  )
}

function SelectorModo({ onSelect }) {
  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24,
    }}>
      <div style={{ width: '100%', maxWidth: 640 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 22, fontWeight: 700, color: 'var(--accent)', letterSpacing: 6, marginBottom: 8 }}>
            ◈ SOTI
          </div>
          <div style={{ fontSize: 13, color: 'var(--text2)' }}>Selecciona el modo de presentación</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {/* Modo Municipal */}
          <div
            onClick={() => onSelect('municipal')}
            style={{
              background: 'var(--bg2)', border: '1px solid rgba(0,196,160,0.3)',
              borderRadius: 14, padding: 28, cursor: 'pointer', transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(0,196,160,0.8)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(0,196,160,0.3)'; e.currentTarget.style.transform = 'translateY(0)' }}
          >
            <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: '#00c4a0', letterSpacing: 2, marginBottom: 12 }}>
              MODO A
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>
              Vista Municipal
            </div>
            <div style={{ fontSize: 11, color: 'var(--text3)', lineHeight: 1.5, marginBottom: 16 }}>
              Gestión e implementación territorial. Para alcaldes, técnicos municipales y equipos de gobernanza local.
            </div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--text3)', letterSpacing: 1 }}>
              Flujo estándar · Sin módulos de evaluación académica
            </div>
          </div>

          {/* Modo Institucional */}
          <div
            onClick={() => onSelect('institucional')}
            style={{
              background: 'var(--bg2)', border: '1px solid rgba(0,119,255,0.3)',
              borderRadius: 14, padding: 28, cursor: 'pointer', transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(0,119,255,0.8)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(0,119,255,0.3)'; e.currentTarget.style.transform = 'translateY(0)' }}
          >
            <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: '#0077ff', letterSpacing: 2, marginBottom: 12 }}>
              MODO B
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>
              Vista Institucional
            </div>
            <div style={{ fontSize: 11, color: 'var(--text3)', lineHeight: 1.5, marginBottom: 16 }}>
              Evaluación y validación. Para BID, CEPAL, Banco Mundial, gobiernos nacionales y academia.
            </div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--text3)', letterSpacing: 1 }}>
              Incluye Estado de Madurez del Sistema · Badge de contexto piloto
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <span style={{ fontSize: 10, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>
            El modo puede cambiarse desde el menú lateral en cualquier momento
          </span>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const [usuario, setUsuario] = useState(null)
  const [modoSistema, setModoSistema] = useState(null)  // null | 'municipal' | 'institucional'

  if (!usuario) return <Login onLogin={setUsuario} />

  if (!modoSistema) return <SelectorModo onSelect={setModoSistema} />

  return (
    <BrowserRouter>
      <TerritoryProvider>
        <Layout modo={modoSistema} onCambiarModo={() => setModoSistema(null)}>
          <Routes>
            <Route path="/"             element={<TerritoryMind />} />
            <Route path="/capacity"     element={<TerritoryCapacity />} />
            <Route path="/gpt"          element={<TerritoryGPT />} />
            <Route path="/govsync"      element={<GovSync />} />
            <Route path="/tracker"      element={<TransformTracker />} />
            <Route path="/learning"     element={<LearningEngine />} />
            <Route path="/comparar"     element={<Comparador />} />
            <Route path="/presentacion" element={<Presentacion />} />
            <Route path="/documentos"   element={<DocumentIngesta />} />
            <Route path="/calibracion"   element={<CalibracionTRI />} />
            <Route path="/verificacion"  element={<VerificacionDemo />} />
            {modoSistema === 'institucional' && (
              <Route path="/estado-sistema" element={<EstadoSistema />} />
            )}
          </Routes>
        </Layout>
      </TerritoryProvider>
    </BrowserRouter>
  )
}
