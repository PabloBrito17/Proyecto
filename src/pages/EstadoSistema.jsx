export default function EstadoSistema() {
  const COMPONENTES = [
    { modulo: 'Motor TRI (5 dimensiones)',              madurez: 'Piloto Validado',  nota: 'Operativo en 2 territorios piloto. Scores calculados con datos reales de campo.',                                  actualizado: 'Jun 2026' },
    { modulo: 'Radar TRI + Overlay PTI',                madurez: 'Piloto Validado',  nota: 'Visualización dual TRI/PTI con brecha cuantificada. Validado con stakeholders BID/CEPAL.',                          actualizado: 'Jun 2026' },
    { modulo: 'TerritoryGPT (asistente IA)',            madurez: 'Piloto Validado',  nota: 'Respuestas contextualizadas por territorio. Fallback a modo offline funcional.',                                     actualizado: 'Jun 2026' },
    { modulo: 'GovSync (articulación interinstitucional)', madurez: 'Piloto Validado', nota: 'Registro de acuerdos y seguimiento de compromisos entre actores territoriales.',                                  actualizado: 'Jun 2026' },
    { modulo: 'TransformTracker (hoja de ruta)',        madurez: 'Piloto Validado',  nota: 'Seguimiento de intervenciones y avance por eje de transformación.',                                                  actualizado: 'Jun 2026' },
    { modulo: 'Comparador territorial',                 madurez: 'Piloto Validado',  nota: 'Análisis comparativo entre San Marcos del Valle y Sensuntepeque activo.',                                            actualizado: 'Jun 2026' },
    { modulo: 'Calibración metodológica TRI',           madurez: 'Piloto Validado',  nota: 'Asistente de 5 preguntas + candados visuales de núcleo fijo. Documentación de transparencia metodológica.',         actualizado: 'Jun 2026' },
    { modulo: 'Indicador REM (remesas)',                madurez: 'Piloto Validado',  nota: 'Vínculo remesas-dinámica laboral activo en radar dimensional.',                                                      actualizado: 'Jun 2026' },
    { modulo: 'LearningEngine (motor de aprendizaje)',  madurez: 'En Desarrollo',    nota: 'Arquitectura definida. Integración con base de conocimiento territorial en curso.',                                  actualizado: '—'        },
    { modulo: 'DocumentIngesta (análisis documental)',  madurez: 'En Desarrollo',    nota: 'Ingesta de documentos municipales en prueba. Extracción de indicadores semi-automatizada.',                          actualizado: '—'        },
    { modulo: 'SOTI-Municipal (versión simplificada)',  madurez: 'Proyectado v2.0',  nota: 'Versión de entrada para municipios con equipos técnicos reducidos.',                                                 actualizado: '—'        },
    { modulo: 'Dimensión Ambiental / Resiliencia',      madurez: 'En Desarrollo',    nota: 'Integración como restricción estructural del TRI en curso. Marco metodológico definido. Validación de campo pendiente para mid-2026.', actualizado: '—'        },
  ]

  const colorMadurez = {
    'Piloto Validado':  { color: '#00c4a0', bg: 'rgba(0,196,160,0.08)',   border: 'rgba(0,196,160,0.25)'   },
    'En Desarrollo':    { color: '#f5a623', bg: 'rgba(245,166,35,0.08)',  border: 'rgba(245,166,35,0.25)'  },
    'Proyectado v2.0':  { color: '#8a9bb5', bg: 'rgba(138,155,181,0.06)', border: 'rgba(138,155,181,0.2)'  },
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'var(--mono)', fontSize: 16, fontWeight: 700, letterSpacing: 1, marginBottom: 4 }}>
          ESTADO DE MADUREZ DEL SISTEMA
        </h1>
        <p style={{ color: 'var(--text2)', fontSize: 12 }}>
          SOTI · Piloto El Salvador · Fase de Validación 2026 · 2 territorios activos
        </p>
      </div>

      {/* Leyenda */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
        {Object.entries(colorMadurez).map(([label, cfg]) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: cfg.color }} />
            <span style={{ fontSize: 11, color: 'var(--text2)', fontFamily: 'var(--mono)' }}>{label}</span>
          </div>
        ))}
      </div>

      {/* Tabla */}
      <div style={{ border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '2fr 1fr 2fr 80px',
          background: 'rgba(0,196,160,0.05)', borderBottom: '1px solid var(--border)',
          padding: '8px 16px',
        }}>
          {['Módulo / Componente', 'Madurez', 'Nota', 'Actualizado'].map(h => (
            <div key={h} style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--text3)', letterSpacing: 1 }}>
              {h.toUpperCase()}
            </div>
          ))}
        </div>

        {COMPONENTES.map((c, i) => {
          const cfg = colorMadurez[c.madurez] || colorMadurez['Proyectado v2.0']
          return (
            <div key={i} style={{
              display: 'grid', gridTemplateColumns: '2fr 1fr 2fr 80px',
              padding: '12px 16px', gap: 8, alignItems: 'start',
              borderBottom: i < COMPONENTES.length - 1 ? '1px solid var(--border)' : 'none',
              background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)',
            }}>
              <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text)', lineHeight: 1.3 }}>{c.modulo}</div>
              <div>
                <span style={{
                  display: 'inline-block', padding: '3px 8px', borderRadius: 4,
                  fontFamily: 'var(--mono)', fontSize: 9,
                  color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}`,
                  whiteSpace: 'nowrap',
                }}>
                  {c.madurez}
                </span>
              </div>
              <div style={{ fontSize: 11, color: 'var(--text3)', lineHeight: 1.5 }}>{c.nota}</div>
              <div style={{ fontSize: 10, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>{c.actualizado}</div>
            </div>
          )
        })}
      </div>

      {/* Nota metodológica */}
      <div style={{
        marginTop: 20, padding: '12px 16px',
        background: 'rgba(245,166,35,0.05)', border: '1px solid rgba(245,166,35,0.2)',
        borderRadius: 8,
      }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: '#f5a623', letterSpacing: 1, marginBottom: 6 }}>
          NOTA METODOLÓGICA · VISTA INSTITUCIONAL
        </div>
        <p style={{ fontSize: 11, color: 'var(--text2)', lineHeight: 1.5, margin: 0 }}>
          SOTI v2.0 se encuentra en fase de validación piloto. Los módulos clasificados como "Piloto Validado" han sido
          operados en condiciones reales en San Marcos del Valle (La Libertad) y Municipio de Sensuntepeque (Cabañas),
          El Salvador. Los clasificados como "En Desarrollo" tienen arquitectura funcional con validación metodológica
          en curso. Los "Proyectados v2.0" tienen diseño conceptual documentado y dependen de evidencia de los ciclos
          de intervención en curso.
        </p>
      </div>
    </div>
  )
}
