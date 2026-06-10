import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer,
         LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import MapaElSalvador from '../components/MapaElSalvador'
import { useTerritorio } from '../TerritoryContext'

// ─── Slides ────────────────────────────────────────────────────────────────

function SlidePortada({ territorio }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      height: '100%', textAlign: 'center', gap: 24,
      padding: '0 80px',
    }}>
      {/* Grid de fondo decorativo */}
      <div style={{ position: 'absolute', inset: 0, opacity: 0.04,
        backgroundImage: 'linear-gradient(#00c4a0 1px, transparent 1px), linear-gradient(90deg, #00c4a0 1px, transparent 1px)',
        backgroundSize: '40px 40px', pointerEvents: 'none' }} />

      <div style={{ fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--accent)',
        letterSpacing: 6, marginBottom: 8 }}>◈ SOTI</div>
      <h1 style={{ fontFamily: 'var(--mono)', fontSize: 52, fontWeight: 700,
        lineHeight: 1.1, color: 'var(--text)', maxWidth: 800 }}>
        SISTEMA OPERATIVO<br />
        <span style={{ color: 'var(--accent)' }}>TERRITORIAL</span><br />
        INTELIGENTE
      </h1>
      <p style={{ fontSize: 18, color: 'var(--text2)', maxWidth: 600, lineHeight: 1.6 }}>
        Infraestructura de capacidades para la transformación territorial en América Latina
      </p>
      <div style={{ marginTop: 16, padding: '12px 28px',
        background: 'rgba(0,196,160,0.08)', border: '1px solid rgba(0,196,160,0.25)',
        borderRadius: 8, fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--text2)' }}>
        {territorio
          ? `Piloto: ${territorio.nombre} · ${territorio.pais} · ${Number(territorio.poblacion).toLocaleString()} hab`
          : 'Piloto — Municipio Centroamericano Típico'}
      </div>
      <div style={{ position: 'absolute', bottom: 40,
        fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text3)', letterSpacing: 2 }}>
        Rafael Velásquez · Ex Director General FONDEPRO · Coordinador ONUDI El Salvador
      </div>
    </div>
  )
}

function SlideIndicadores({ indicadores, territorio }) {
  const pti = indicadores.find(i => i.codigo === 'PTI')
  const tri = indicadores.find(i => i.codigo === 'TRI')
  const resto = indicadores.filter(i => !['PTI','TRI'].includes(i.codigo)).slice(0, 8)

  const COLORS = { global:'#00c4a0', económico:'#0077ff', social:'#a855f7',
    fiscal:'#f5a623', infraestructura:'#22d3ee', productivo:'#ff6b35',
    gobernanza:'#e84040', 'capital humano':'#84cc16', ambiental:'#14b8a6' }

  return (
    <div style={{ padding: '40px 60px', height: '100%', display: 'flex', flexDirection: 'column', gap: 28 }}>
      <div>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--accent)', letterSpacing: 4, marginBottom: 8 }}>
          PANEL CENTRAL / INTELIGENCIA TERRITORIAL · DASHBOARD INTEGRAL
        </div>
        <h2 style={{ fontFamily: 'var(--mono)', fontSize: 32, fontWeight: 700, color: 'var(--text)' }}>
          {territorio?.nombre}
        </h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '180px 180px 1fr', gap: 20, flex: 1 }}>
        {/* PTI */}
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: '#f5a623', letterSpacing: 2 }}>PTI</div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 56, fontWeight: 700, color: '#f5a623', lineHeight: 1 }}>
            {pti?.valor}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text3)', textAlign: 'center', padding: '0 12px' }}>
            Potencial Territorial Integrado
          </div>
        </div>
        {/* TRI */}
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: '3px solid #0077ff',
          borderRadius: 12, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: '#0077ff', letterSpacing: 2 }}>TRI</div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 56, fontWeight: 700, color: '#0077ff', lineHeight: 1 }}>
            {tri?.valor}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text3)', textAlign: 'center', padding: '0 12px' }}>
            Índice de Resiliencia Territorial
          </div>
        </div>
        {/* Grid indicadores */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
          {resto.map(ind => {
            const color = COLORS[ind.categoria] || '#8a9bb5'
            return (
              <div key={ind.codigo} style={{ background: 'var(--bg2)', border: '1px solid var(--border)',
                borderTop: `2px solid ${color}`, borderRadius: 8, padding: '12px 14px' }}>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color, letterSpacing: 1, marginBottom: 4 }}>
                  {ind.codigo}
                </div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 22, fontWeight: 700, color: 'var(--text)' }}>
                  {ind.valor}
                </div>
                <div style={{ fontSize: 9, color: 'var(--text3)', marginTop: 2 }}>{ind.unidad}</div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function SlideTRI({ radar, territorio }) {
  const dimColors = ['#0077ff','#00c4a0','#a855f7','#22d3ee','#f5a623','#84cc16']
  const triGlobal = radar.length
    ? (radar.reduce((s,d) => s + d.valor, 0) / radar.length).toFixed(1) : '--'

  return (
    <div style={{ padding: '40px 60px', height: '100%', display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: '#0077ff', letterSpacing: 4, marginBottom: 8 }}>
          TERRITORYCAPACITY · ÍNDICE TRI
        </div>
        <h2 style={{ fontFamily: 'var(--mono)', fontSize: 32, fontWeight: 700, color: 'var(--text)' }}>
          6 Dimensiones de Resiliencia
        </h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28, flex: 1 }}>
        {/* Radar */}
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: 24,
          display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 48, fontWeight: 700, color: '#0077ff', marginBottom: 4 }}>
            {triGlobal}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 16 }}>TRI GLOBAL / 100</div>
          <ResponsiveContainer width="100%" height={260}>
            <RadarChart data={radar} margin={{ top: 10, right: 40, bottom: 10, left: 40 }}>
              <PolarGrid stroke="var(--border)" />
              <PolarAngleAxis dataKey="dimension"
                tick={{ fill: 'var(--text2)', fontSize: 11, fontFamily: 'var(--mono)' }} />
              <Radar dataKey="valor" stroke="#0077ff" fill="#0077ff" fillOpacity={0.25} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Barras */}
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: 28,
          display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 14 }}>
          {radar.map((d, i) => {
            const status = d.valor < 35 ? 'CRÍTICO' : d.valor < 55 ? 'MODERADO' : 'ADECUADO'
            const sc = d.valor < 35 ? '#e84040' : d.valor < 55 ? '#f5a623' : '#00c4a0'
            return (
              <div key={d.dimension}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{d.dimension}</span>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <span style={{ fontSize: 10, fontFamily: 'var(--mono)', padding: '2px 8px',
                      background: `${sc}20`, color: sc, borderRadius: 4 }}>{status}</span>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 16, fontWeight: 700 }}>{d.valor}</span>
                  </div>
                </div>
                <div style={{ height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${d.valor}%`, background: dimColors[i], borderRadius: 3 }} />
                </div>
              </div>
            )
          })}

          {radar.length > 0 && (() => {
            const restrictor = radar.reduce((min, d) => d.valor < min.valor ? d : min, radar[0])
            return (
              <div style={{ marginTop: 8, padding: 14, background: 'rgba(232,64,64,0.07)',
                border: '1px solid rgba(232,64,64,0.2)', borderRadius: 8 }}>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: '#e84040', marginBottom: 4 }}>
                  ⚠ RESTRICTOR SISTÉMICO IDENTIFICADO
                </div>
                <p style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.5 }}>
                  <strong>{restrictor.dimension} ({restrictor.valor})</strong> actúa como restrictor
                  sistémico — techo que limita el impacto de inversiones en las demás dimensiones.
                </p>
              </div>
            )
          })()}
        </div>
      </div>
    </div>
  )
}

function SlideTrayectoria({ historial, territorio }) {
  if (!historial.length) return null
  const primero = historial[0]?.TRI || 0
  const ultimo = historial[historial.length - 1]?.TRI || 0
  const variacion = (ultimo - primero).toFixed(1)

  return (
    <div style={{ padding: '40px 60px', height: '100%', display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: '#ff6b35', letterSpacing: 4, marginBottom: 8 }}>
          SEGUIMIENTO DE TRANSFORMACIÓN · TRAYECTORIA
        </div>
        <h2 style={{ fontFamily: 'var(--mono)', fontSize: 32, fontWeight: 700, color: 'var(--text)' }}>
          Evolución TRI · 2022–2023
        </h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 8 }}>
        {[
          { label: 'TRI INICIAL', val: primero, color: '#8a9bb5', sub: 'Q1 2022' },
          { label: 'TRI ACTUAL', val: ultimo, color: '#0077ff', sub: 'Q4 2023' },
          { label: 'AVANCE', val: `+${variacion}`, color: '#00c4a0', sub: '8 trimestres' },
        ].map(k => (
          <div key={k.label} style={{ background: 'var(--bg2)', border: '1px solid var(--border)',
            borderTop: `3px solid ${k.color}`, borderRadius: 10, padding: '16px 20px' }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: k.color, letterSpacing: 2, marginBottom: 6 }}>{k.label}</div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 40, fontWeight: 700, color: k.color }}>{k.val}</div>
            <div style={{ fontSize: 11, color: 'var(--text3)' }}>{k.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ flex: 1, background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: 24 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={historial} margin={{ top: 10, right: 30, bottom: 10, left: 10 }}>
            <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
            <XAxis dataKey="periodo" tick={{ fill: 'var(--text3)', fontSize: 11, fontFamily: 'var(--mono)' }} />
            <YAxis domain={[20, 55]} tick={{ fill: 'var(--text3)', fontSize: 11, fontFamily: 'var(--mono)' }} />
            <Tooltip contentStyle={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 6, fontSize: 12 }} />
            {[
              { key: 'TRI', color: '#0077ff', width: 3 },
              { key: 'Gobernanza Territorial',       color: '#e84040', width: 1.5 },
              { key: 'Capacidades Territoriales',    color: '#00c4a0', width: 1.5 },
              { key: 'Movilización de Recursos',     color: '#a855f7', width: 1.5 },
              { key: 'Dinámica Laboral Territorial', color: '#f5a623', width: 1.5 },
              { key: 'Movilización de Recursos', color: '#a855f7', width: 1.5 },
            ].map(l => (
              <Line key={l.key} type="monotone" dataKey={l.key} stroke={l.color}
                strokeWidth={l.width} dot={{ r: 4, fill: l.color }} name={l.key} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function SlideLocalización({ territorio }) {
  return (
    <div style={{ padding: '40px 60px', height: '100%', display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: '#00c4a0', letterSpacing: 4, marginBottom: 8 }}>
          LOCALIZACIÓN TERRITORIAL
        </div>
        <h2 style={{ fontFamily: 'var(--mono)', fontSize: 32, fontWeight: 700, color: 'var(--text)' }}>
          {territorio?.nombre} · {territorio?.pais}
        </h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 28, flex: 1 }}>
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: 20,
          display: 'flex', flexDirection: 'column', gap: 16 }}>
          <MapaElSalvador height={340} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: 24, flex: 1 }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--accent)', letterSpacing: 2, marginBottom: 16 }}>
              PERFIL TERRITORIAL
            </div>
            {territorio && [
              ['Municipio', territorio.nombre],
              ['Departamento', territorio.depto],
              ['País', territorio.pais],
              ['Población', `${Number(territorio.poblacion).toLocaleString()} hab`],
              ['Superficie', `${territorio.superficie_km2} km²`],
              ['Economía', territorio.economia_principal],
              ['Emigración neta', `${territorio.emigracion_anual_pct}%/año`],
              ['Plan DET vigente', `${territorio.plan_det_año} (desactualizado)`],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between',
                fontSize: 13, paddingBottom: 10, borderBottom: '1px solid var(--border)', marginBottom: 10 }}>
                <span style={{ color: 'var(--text3)' }}>{k}</span>
                <span style={{ color: 'var(--text)', fontWeight: 500 }}>{v}</span>
              </div>
            ))}
          </div>

          <div style={{ background: 'rgba(0,196,160,0.06)', border: '1px solid rgba(0,196,160,0.2)',
            borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.7, fontStyle: 'italic' }}>
              "{territorio?.descripcion}"
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function SlideResiliencia({ territorio }) {
  const nombre = territorio?.nombre || '—'
  const pilares = [
    { icon: '🏛', label: 'Gobernanza Territorial', desc: 'Decisión colectiva legítima y sostenida en el tiempo' },
    { icon: '⚙️', label: 'Capacidades Territoriales', desc: 'Autonomía creciente para diseñar e implementar estrategias' },
    { icon: '🌿', label: 'Resiliencia Ambiental', desc: 'Restricción estructural que condiciona el techo de transformación' },
  ]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '48px 64px', gap: 32 }}>
      <div>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: '#84cc16', letterSpacing: 3, marginBottom: 10 }}>
          ARQUITECTURA DE CAPACIDADES · {nombre.toUpperCase()}
        </div>
        <h2 style={{ fontFamily: 'var(--mono)', fontSize: 28, fontWeight: 700, lineHeight: 1.2, color: 'var(--text)', marginBottom: 8 }}>
          La resiliencia ambiental no es un indicador adicional.<br />
          <span style={{ color: '#84cc16' }}>Es la restricción que define el techo.</span>
        </h2>
        <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6, maxWidth: 580 }}>
          Ninguna inversión en gobernanza o capacidades institucionales alcanza su potencial
          si las condiciones ambientales y climáticas del territorio no son reconocidas
          como restricción estructural del proceso de transformación.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, flex: 1, alignItems: 'start' }}>
        {pilares.map((p, i) => (
          <div key={p.label} style={{
            padding: '24px 20px', borderRadius: 12,
            background: i === 2 ? 'rgba(132,204,22,0.07)' : 'rgba(0,196,160,0.05)',
            border: `1px solid ${i === 2 ? 'rgba(132,204,22,0.3)' : 'rgba(0,196,160,0.15)'}`,
            display: 'flex', flexDirection: 'column', gap: 12,
          }}>
            <div style={{ fontSize: 28 }}>{p.icon}</div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 700,
              color: i === 2 ? '#84cc16' : '#00c4a0', letterSpacing: 1 }}>
              {p.label.toUpperCase()}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.5 }}>{p.desc}</div>
            {i === 2 && (
              <div style={{ marginTop: 4, padding: '4px 8px', background: 'rgba(132,204,22,0.1)',
                borderRadius: 4, fontFamily: 'var(--mono)', fontSize: 9, color: '#84cc16' }}>
                EN DESARROLLO METODOLÓGICO
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{ padding: '12px 20px', background: 'rgba(132,204,22,0.05)',
        border: '1px solid rgba(132,204,22,0.2)', borderRadius: 8,
        fontSize: 12, color: 'var(--text2)', lineHeight: 1.5 }}>
        <span style={{ color: '#84cc16', fontFamily: 'var(--mono)', fontSize: 10, marginRight: 8 }}>◈</span>
        SOTI está incorporando la dimensión ambiental como restrictor estructural del TRI —
        posicionando al territorio como elegible para fondos climáticos y financiamiento verde.
      </div>
    </div>
  )
}

function SlideCierre() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', height: '100%', textAlign: 'center', gap: 32, padding: '0 80px' }}>
      <div style={{ position: 'absolute', inset: 0, opacity: 0.03,
        backgroundImage: 'radial-gradient(circle at 50% 50%, #00c4a0 1px, transparent 1px)',
        backgroundSize: '30px 30px', pointerEvents: 'none' }} />

      <div style={{ fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--accent)', letterSpacing: 6 }}>◈ SOTI</div>
      <h2 style={{ fontFamily: 'var(--mono)', fontSize: 44, fontWeight: 700, lineHeight: 1.15, color: 'var(--text)' }}>
        SOTI no es un software.<br />
        <span style={{ color: 'var(--accent)' }}>Es una apuesta</span><br />
        por la transformación.
      </h2>
      <p style={{ fontSize: 16, color: 'var(--text2)', maxWidth: 580, lineHeight: 1.7 }}>
        El fracaso de las intervenciones territoriales no es técnico — es institucional.
        SOTI ataca la raíz: la incapacidad sistémica de aprender, acumular y actuar.
      </p>

      <div style={{ display: 'flex', gap: 20, marginTop: 16 }}>
        {[
          { num: '40', label: 'Capítulos de arquitectura conceptual' },
          { num: '6', label: 'Productos operativos integrados' },
          { num: '2', label: 'Municipios piloto activos' },
        ].map(item => (
          <div key={item.label} style={{ padding: '20px 28px', background: 'rgba(0,196,160,0.07)',
            border: '1px solid rgba(0,196,160,0.2)', borderRadius: 10, textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 36, fontWeight: 700, color: '#00c4a0' }}>{item.num}</div>
            <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4, maxWidth: 130, lineHeight: 1.3 }}>{item.label}</div>
          </div>
        ))}
      </div>

      <div style={{ position: 'absolute', bottom: 40, fontFamily: 'var(--mono)',
        fontSize: 11, color: 'var(--text3)', letterSpacing: 1 }}>
        Rafael Velásquez · rafael.velasquez@soti.lat · Piloto v1.0
      </div>
    </div>
  )
}


function SlideHojaDeRuta() {
  const etapas = [
    { id: 'piloto', label: 'PILOTO ACTIVO', sub: '2 municipios', detail: 'San Marcos del Valle · Sensuntepeque', color: '#00c4a0', tec: 'React/Vite + SQLite + TerritoryGPT', inst: 'Alcaldías piloto + SOTI', ter: 'Demo funcional · datos reales' },
    { id: 'fase1',  label: 'FASE 1',        sub: '14 municipios', detail: 'Región Occidental · La Libertad · Cabañas', color: '#0077ff', tec: 'PostgreSQL + API escalable + dashboard multi-territorio', inst: 'CONAMYPE · FISDL · Gobiernos locales', ter: 'Piloto validado · 14 planes DET activos' },
    { id: 'fase2',  label: 'FASE 2',        sub: '44 municipios', detail: 'Cobertura nacional prioritaria', color: '#a855f7', tec: 'Microservicios · CI/CD · multi-tenant', inst: 'MH · MINEC · BID · PNUD', ter: '44 municipios con TRI certificado' },
    { id: 'fase3',  label: 'FASE 3',        sub: '262 municipios', detail: 'Cobertura total El Salvador', color: '#f5a623', tec: 'Cloud nativo · IA territorial avanzada', inst: 'Gobierno Central · Cooperación internacional', ter: 'Sistema nacional de inteligencia territorial' },
    { id: 'latam',  label: 'CENTROAMÉRICA', sub: '6 países', detail: 'Guatemala · Honduras · Nicaragua · Costa Rica · Panamá', color: '#ff6b35', tec: 'Arquitectura federada · API internacional', inst: 'SICA · BID · PNUD · GIZ · Banco Mundial', ter: 'Red regional de territorios inteligentes' },
  ]

  return (
    <div style={{ padding: '40px 60px', height: '100%', display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: '#00c4a0', letterSpacing: 4, marginBottom: 8 }}>
          HOJA DE RUTA DE ESCALAMIENTO · SOTI
        </div>
        <h2 style={{ fontFamily: 'var(--mono)', fontSize: 32, fontWeight: 700, color: 'var(--text)' }}>
          ¿Cómo Escala Esto?
        </h2>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {etapas.map((e, i) => (
          <div key={e.id} style={{ display: 'flex', gap: 16, alignItems: 'stretch' }}>
            {/* Conector vertical */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 28, flexShrink: 0 }}>
              <div style={{ width: 16, height: 16, borderRadius: '50%', background: e.color, border: `3px solid ${e.color}40`, flexShrink: 0 }} />
              {i < etapas.length - 1 && <div style={{ width: 2, flex: 1, background: `linear-gradient(${e.color}, ${etapas[i+1].color})`, opacity: 0.4, marginTop: 2 }} />}
            </div>

            <div style={{
              flex: 1, background: 'var(--bg2)', border: `1px solid ${e.color}30`,
              borderLeft: `3px solid ${e.color}`, borderRadius: '0 8px 8px 0',
              padding: '10px 14px',
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr 1fr 1fr', gap: 12, alignItems: 'start' }}>
                <div>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: e.color, letterSpacing: 1 }}>{e.label}</div>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>{e.sub}</div>
                  <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 2 }}>{e.detail}</div>
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 8, color: '#0077ff', letterSpacing: 1, marginBottom: 4 }}>TECNOLOGÍA</div>
                  <div style={{ fontSize: 10, color: 'var(--text2)', lineHeight: 1.4 }}>{e.tec}</div>
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 8, color: '#a855f7', letterSpacing: 1, marginBottom: 4 }}>INSTITUCIONAL</div>
                  <div style={{ fontSize: 10, color: 'var(--text2)', lineHeight: 1.4 }}>{e.inst}</div>
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 8, color: '#00c4a0', letterSpacing: 1, marginBottom: 4 }}>TERRITORIAL</div>
                  <div style={{ fontSize: 10, color: 'var(--text2)', lineHeight: 1.4 }}>{e.ter}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 4 }}>
        {[
          { label: 'Arquitectura', val: 'API-first · Multi-tenant · Sin hardcodeo territorial' },
          { label: 'Modelo de sostenibilidad', val: 'Licencia municipal + Cooperación técnica reembolsable' },
          { label: 'Inversión estimada Fase 1', val: 'USD 380K — BID FOMIN / FISDL / Cooperación bilateral' },
        ].map(k => (
          <div key={k.label} style={{ background: 'rgba(0,196,160,0.05)', border: '1px solid rgba(0,196,160,0.15)', borderRadius: 8, padding: '10px 14px' }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: '#00c4a0', letterSpacing: 1, marginBottom: 4 }}>{k.label.toUpperCase()}</div>
            <div style={{ fontSize: 11, color: 'var(--text2)', lineHeight: 1.4 }}>{k.val}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function SlideCooperacion({ territorio }) {
  const kpis = [
    { label: 'Proyectos activos', val: '2', sub: 'municipios piloto vigentes', color: '#00c4a0' },
    { label: 'Recursos movilizados', val: 'USD 1.2M', sub: 'estimado acuerdos activos', color: '#0077ff' },
    { label: 'Beneficiarios', val: '42.570', sub: 'hab. en territorios piloto', color: '#a855f7' },
    { label: 'Instituciones vinculadas', val: '11', sub: 'entidades nacionales e internacionales', color: '#f5a623' },
    { label: 'Intervenciones priorizadas', val: '9', sub: 'acuerdos interinstitucionales activos', color: '#22d3ee' },
  ]

  const cooperantes = [
    { sigla: 'BID', nombre: 'Banco Interamericano de Desarrollo', rol: 'Financiamiento FOMIN · Asistencia técnica DET', color: '#0077ff' },
    { sigla: 'PNUD', nombre: 'Programa de las Naciones Unidas para el Desarrollo', rol: 'Gobernanza local · ODS territoriales', color: '#0099cc' },
    { sigla: 'GIZ', nombre: 'Cooperación Técnica Alemana', rol: 'Fortalecimiento institucional municipal', color: '#007040' },
    { sigla: 'OIM', nombre: 'Organización Internacional para las Migraciones', rol: 'ReinserTA · Reintegración laboral de retornados', color: '#ff6b35' },
    { sigla: 'BM', nombre: 'Banco Mundial', rol: 'Fondo de Inversión Social · Municipios resilientes', color: '#e84040' },
  ]

  return (
    <div style={{ padding: '40px 60px', height: '100%', display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: '#0077ff', letterSpacing: 4, marginBottom: 8 }}>
          COOPERACIÓN Y MOVILIZACIÓN DE RECURSOS
        </div>
        <h2 style={{ fontFamily: 'var(--mono)', fontSize: 32, fontWeight: 700, color: 'var(--text)' }}>
          Gestión Basada en Resultados
        </h2>
      </div>

      {/* KPIs demo */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 }}>
        {kpis.map(k => (
          <div key={k.label} style={{ background: 'var(--bg2)', border: `1px solid ${k.color}30`, borderTop: `3px solid ${k.color}`, borderRadius: 10, padding: '14px 12px' }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: k.color, letterSpacing: 1, marginBottom: 6 }}>{k.label.toUpperCase()}</div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 22, fontWeight: 700, color: k.color }}>{k.val}</div>
            <div style={{ fontSize: 9, color: 'var(--text3)', marginTop: 4, lineHeight: 1.3 }}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Cooperantes */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text3)', letterSpacing: 2, marginBottom: 4 }}>
          COOPERANTES Y ORGANISMOS VINCULABLES
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {cooperantes.map(c => (
            <div key={c.sigla} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderLeft: `3px solid ${c.color}`, borderRadius: '0 8px 8px 0', padding: '10px 14px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 14, fontWeight: 700, color: c.color, minWidth: 36 }}>{c.sigla}</span>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text)', fontWeight: 500 }}>{c.nombre}</div>
                <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 2 }}>{c.rol}</div>
              </div>
            </div>
          ))}
          {/* Marco de gestión */}
          <div style={{ background: 'rgba(0,196,160,0.05)', border: '1px solid rgba(0,196,160,0.2)', borderRadius: 8, padding: '10px 14px' }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: '#00c4a0', letterSpacing: 1, marginBottom: 6 }}>MARCO DE GESTIÓN</div>
            <div style={{ fontSize: 10, color: 'var(--text2)', lineHeight: 1.5 }}>
              SOTI opera bajo lógica de gestión por resultados:<br/>
              TRI como indicador de progreso · Acuerdos trazables · Informes automáticos para donantes
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── CONTROLADOR PRINCIPAL ─────────────────────────────────────────────────

const SLIDES = ['portada', 'indicadores', 'tri', 'trayectoria', 'hoja_de_ruta', 'cooperacion', 'resiliencia', 'localizacion', 'cierre']
const SLIDE_LABELS = ['Portada', 'Dashboard', 'TRI', 'Trayectoria', 'Hoja de Ruta', 'Cooperación', 'Resiliencia', 'Localización', 'Cierre']

export default function Presentacion() {
  const navigate = useNavigate()
  const { territorioActual } = useTerritorio()
  const tid = territorioActual

  const [slide, setSlide] = useState(0)
  const [territorio, setTerritorio] = useState(null)
  const [indicadores, setIndicadores] = useState([])
  const [radar, setRadar] = useState([])
  const [historial, setHistorial] = useState([])

  useEffect(() => {
    fetch(`/api/territorio/${tid}`).then(r => r.json()).then(setTerritorio).catch(() => setTerritorio(null))
    fetch(`/api/indicadores/${tid}`).then(r => r.json()).then(setIndicadores).catch(() => setIndicadores([]))
    fetch(`/api/tri/radar/${tid}`).then(r => r.json()).then(setRadar).catch(() => setRadar([]))
    fetch(`/api/tri/historial/${tid}`).then(r => r.json()).then(setHistorial).catch(() => setHistorial([]))
  }, [tid])

  const prev = useCallback(() => setSlide(s => Math.max(0, s - 1)), [])
  const next = useCallback(() => setSlide(s => Math.min(SLIDES.length - 1, s + 1)), [])
  const exit = useCallback(() => navigate('/'), [navigate])

  useEffect(() => {
    const handler = e => {
      if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); next() }
      if (e.key === 'ArrowLeft') { e.preventDefault(); prev() }
      if (e.key === 'Escape') exit()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [next, prev, exit])

  const slideContent = {
    portada: <SlidePortada territorio={territorio} />,
    indicadores: <SlideIndicadores indicadores={indicadores} territorio={territorio} />,
    tri: <SlideTRI radar={radar} territorio={territorio} />,
    trayectoria: <SlideTrayectoria historial={historial} territorio={territorio} />,
    hoja_de_ruta: <SlideHojaDeRuta />,
    cooperacion: <SlideCooperacion territorio={territorio} />,
    resiliencia: <SlideResiliencia territorio={territorio} />,
    localizacion: <SlideLocalización territorio={territorio} />,
    cierre: <SlideCierre />,
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'var(--bg)', zIndex: 9999,
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Slide */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {slideContent[SLIDES[slide]]}
      </div>

      {/* Barra de control inferior */}
      <div style={{
        height: 52, background: 'var(--bg2)', borderTop: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px', zIndex: 10, flexShrink: 0,
      }}>
        {/* Indicadores de slide */}
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {SLIDES.map((_, i) => (
            <button key={i} onClick={() => setSlide(i)} style={{
              width: i === slide ? 24 : 8, height: 8, borderRadius: 4,
              background: i === slide ? 'var(--accent)' : 'var(--border)',
              border: 'none', cursor: 'pointer',
              transition: 'all 0.25s ease',
            }} title={SLIDE_LABELS[i]} />
          ))}
          <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text3)', marginLeft: 8 }}>
            {SLIDE_LABELS[slide]}
          </span>
        </div>

        {/* Controles */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text3)', marginRight: 8 }}>
            ← → NAVEGAR · ESC SALIR
          </span>
          <button onClick={prev} disabled={slide === 0} style={{
            background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 6,
            padding: '5px 14px', color: slide === 0 ? 'var(--text3)' : 'var(--text)',
            fontFamily: 'var(--mono)', fontSize: 12, cursor: slide === 0 ? 'default' : 'pointer',
          }}>←</button>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text2)', minWidth: 48, textAlign: 'center' }}>
            {slide + 1} / {SLIDES.length}
          </span>
          <button onClick={next} disabled={slide === SLIDES.length - 1} style={{
            background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 6,
            padding: '5px 14px',
            color: slide === SLIDES.length - 1 ? 'var(--text3)' : 'var(--accent)',
            fontFamily: 'var(--mono)', fontSize: 12,
            cursor: slide === SLIDES.length - 1 ? 'default' : 'pointer',
          }}>→</button>
          <button onClick={exit} style={{
            background: 'rgba(232,64,64,0.1)', border: '1px solid rgba(232,64,64,0.25)',
            borderRadius: 6, padding: '5px 14px', color: '#e84040',
            fontFamily: 'var(--mono)', fontSize: 11, cursor: 'pointer', marginLeft: 8,
          }}>✕ SALIR</button>
        </div>
      </div>
    </div>
  )
}
