import { useState, useEffect } from 'react'
import { useTerritorio } from '../TerritoryContext'

const DEPARTAMENTOS = [
  { id: 'ahuachapan',   nombre: 'Ahuachapán',   cx: 48,  cy: 148, path: 'M 10,118 L 82,106 L 90,138 L 85,176 L 42,183 L 10,163 Z' },
  { id: 'sonsonate',    nombre: 'Sonsonate',     cx: 110, cy: 180, path: 'M 82,106 L 148,98 L 155,128 L 150,198 L 115,208 L 85,176 L 90,138 Z' },
  { id: 'santa_ana',    nombre: 'Santa Ana',     cx: 108, cy: 118, path: 'M 82,106 L 145,76 L 148,98 L 90,138 Z M 82,106 L 68,86 L 95,66 L 145,76 Z' },
  { id: 'chalatenango', nombre: 'Chalatenango',  cx: 200, cy: 76,  path: 'M 145,76 L 148,98 L 210,93 L 250,88 L 265,66 L 230,43 L 175,46 Z' },
  { id: 'la_libertad',  nombre: 'La Libertad',   cx: 192, cy: 172, path: 'M 148,98 L 210,93 L 225,108 L 230,153 L 210,198 L 185,208 L 155,198 L 150,168 Z' },
  { id: 'san_salvador', nombre: 'San Salvador',  cx: 248, cy: 136, path: 'M 210,93 L 250,88 L 268,108 L 260,153 L 230,153 L 225,108 Z' },
  { id: 'cuscatlan',    nombre: 'Cuscatlán',     cx: 290, cy: 126, path: 'M 250,88 L 298,83 L 310,106 L 295,148 L 268,146 L 260,118 Z' },
  { id: 'la_paz',       nombre: 'La Paz',        cx: 248, cy: 208, path: 'M 210,198 L 260,193 L 268,223 L 248,246 L 210,238 L 195,218 Z' },
  { id: 'cabanas',      nombre: 'Cabañas',       cx: 322, cy: 98,  path: 'M 298,83 L 365,78 L 372,108 L 348,128 L 310,123 L 295,106 Z' },
  { id: 'san_vicente',  nombre: 'San Vicente',   cx: 318, cy: 166, path: 'M 295,148 L 348,143 L 355,173 L 340,198 L 305,203 L 285,183 L 292,158 Z' },
  { id: 'usulutan',     nombre: 'Usulután',      cx: 362, cy: 216, path: 'M 305,203 L 380,198 L 395,226 L 370,253 L 330,256 L 308,236 Z' },
  { id: 'san_miguel',   nombre: 'San Miguel',    cx: 418, cy: 183, path: 'M 380,158 L 440,153 L 460,183 L 450,213 L 415,223 L 390,208 L 382,183 Z' },
  { id: 'morazan',      nombre: 'Morazán',       cx: 435, cy: 128, path: 'M 372,108 L 442,103 L 460,128 L 445,156 L 415,163 L 385,153 L 372,133 Z' },
  { id: 'la_union',     nombre: 'La Unión',      cx: 462, cy: 213, path: 'M 450,183 L 490,178 L 495,213 L 478,246 L 450,248 L 440,223 Z' },
]

// Tabla de coordenadas SVG + departamento por territorio_id
// Este fallback se usa si la API no trae lat/lng mapeables al SVG
const COORDS_SVG = {
  1: { cx: 185, cy: 162, deptoId: 'la_libertad', depto: 'La Libertad' },
  2: { cx: 322, cy: 103, deptoId: 'cabanas',     depto: 'Cabañas' },
}
const COORDS_DEFAULT = { cx: 255, cy: 140, deptoId: null, depto: '' }

export default function MapaElSalvador({ height = 260, compact = false }) {
  const { territorioActual, territorios } = useTerritorio()
  const [hover, setHover] = useState(null)

  // Construir lista de pins a partir de los territorios cargados desde API
  const pins = (territorios || []).map(t => {
    const coords = COORDS_SVG[t.id] || COORDS_DEFAULT
    return { ...t, ...coords }
  })

  const activoPin = pins.find(p => p.id === territorioActual) || pins[0]
  const hoverDep  = DEPARTAMENTOS.find(d => d.id === hover)

  return (
    <svg viewBox="0 0 510 275" width="100%" height={height} style={{ display: 'block' }}>
      <text x="255" y="270" textAnchor="middle"
        style={{ fontSize: 8, fill: '#1a3a5c', fontFamily: 'monospace', letterSpacing: 2 }}>
        OCÉANO PACÍFICO
      </text>

      {DEPARTAMENTOS.map(dep => {
        const isHighlight = activoPin?.deptoId === dep.id
        return (
          <g key={dep.id}>
            <path
              d={dep.path}
              fill={isHighlight ? (hover === dep.id ? '#0f3d70' : '#082848') : (hover === dep.id ? '#162840' : '#0c1a28')}
              stroke={isHighlight ? '#0066dd' : '#193040'}
              strokeWidth={isHighlight ? 1.5 : 0.7}
              style={{ transition: 'fill 0.12s', cursor: 'default' }}
              onMouseEnter={() => setHover(dep.id)}
              onMouseLeave={() => setHover(null)}
            />
            {!compact && (
              <text x={dep.cx} y={dep.cy} textAnchor="middle"
                style={{
                  fontSize: isHighlight ? 8 : 7,
                  fill: isHighlight ? '#6aabff' : '#2d5570',
                  fontFamily: 'monospace',
                  fontWeight: isHighlight ? 700 : 400,
                  pointerEvents: 'none',
                }}>
                {dep.nombre.split(' ').map((w, i) => (
                  <tspan key={i} x={dep.cx} dy={i === 0 ? 0 : 8}>{w}</tspan>
                ))}
              </text>
            )}
          </g>
        )
      })}

      {/* Todos los pins de territorios cargados desde API */}
      {pins.map(pin => {
        const isActivo = pin.id === territorioActual
        return (
          <g key={pin.id} transform={`translate(${pin.cx},${pin.cy})`} opacity={isActivo ? 1 : 0.45}>
            {isActivo && (
              <circle r="18" fill="rgba(0,196,160,0.06)">
                <animate attributeName="r" values="8;20;8" dur="2.8s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.5;0;0.5" dur="2.8s" repeatCount="indefinite" />
              </circle>
            )}
            <circle r="8"  fill={isActivo ? 'rgba(0,196,160,0.12)' : 'rgba(0,119,255,0.12)'} />
            <circle r="5"  fill={isActivo ? '#00c4a0' : '#0077ff'} />
            <circle r="2.5" fill="#ffffff" />
          </g>
        )
      })}

      {/* Label municipio activo */}
      {activoPin && !compact && (
        <g>
          <rect x={activoPin.cx + 9} y={activoPin.cy - 22}
            width={116} height={30} rx={4}
            fill="#060e1a" stroke="#00c4a0" strokeWidth={0.8} />
          <text x={activoPin.cx + 67} y={activoPin.cy - 10}
            textAnchor="middle"
            style={{ fontSize: 7, fill: '#00c4a0', fontFamily: 'monospace', fontWeight: 700, letterSpacing: 0.5 }}>
            {activoPin.nombre.toUpperCase()}
          </text>
          <text x={activoPin.cx + 67} y={activoPin.cy + 1}
            textAnchor="middle"
            style={{ fontSize: 7, fill: '#3a7060', fontFamily: 'monospace' }}>
            {activoPin.depto} · PILOTO SOTI
          </text>
        </g>
      )}

      {hover && hoverDep && (
        <g>
          <rect x={hoverDep.cx - 48} y={hoverDep.cy - 24} width={96} height={18} rx={3}
            fill="#060e1a" stroke="#193040" strokeWidth={0.8} />
          <text x={hoverDep.cx} y={hoverDep.cy - 12} textAnchor="middle"
            style={{ fontSize: 7.5, fill: '#7090b0', fontFamily: 'monospace', pointerEvents: 'none' }}>
            {hoverDep.nombre}
          </text>
        </g>
      )}

      {!compact && (
        <g transform="translate(8, 8)">
          <rect width={140} height={54} rx={4}
            fill="rgba(6,14,26,0.92)" stroke="#193040" strokeWidth={0.8} />
          <circle cx={14} cy={16} r={5} fill="#00c4a0" />
          <circle cx={14} cy={16} r={2.5} fill="white" />
          <text x={24} y={20}
            style={{ fontSize: 7.5, fill: '#c0d8e8', fontFamily: 'monospace' }}>Territorio activo</text>
          <circle cx={14} cy={36} r={5} fill="#0077ff" opacity={0.6} />
          <circle cx={14} cy={36} r={2.5} fill="white" />
          <text x={24} y={40}
            style={{ fontSize: 7.5, fill: '#7090b0', fontFamily: 'monospace' }}>Otros territorios ({pins.length})</text>
        </g>
      )}

      {!compact && (
        <text x="495" y="22" textAnchor="middle"
          style={{ fontSize: 11, fill: '#2d5570', fontFamily: 'monospace', fontWeight: 700 }}>
          N↑
        </text>
      )}
    </svg>
  )
}
