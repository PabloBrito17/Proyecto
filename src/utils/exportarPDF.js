import { jsPDF } from 'jspdf'

// Paleta SOTI para PDF (sobre fondo blanco)
const C = {
  bg: [252, 253, 255],
  bgSection: [245, 248, 252],
  accent: [0, 168, 140],      // #00a88c
  accent2: [0, 90, 200],      // #005ac8
  danger: [200, 40, 40],
  warn: [200, 130, 20],
  ok: [30, 160, 120],
  text: [20, 30, 45],
  text2: [80, 100, 130],
  text3: [140, 160, 185],
  border: [210, 220, 235],
  white: [255, 255, 255],
}

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return [r, g, b]
}

function setFill(doc, color) { doc.setFillColor(...color) }
function setDraw(doc, color) { doc.setDrawColor(...color) }
function setTextColor(doc, color) { doc.setTextColor(...color) }

function rect(doc, x, y, w, h, color, rounded = 0) {
  setFill(doc, color)
  if (rounded) doc.roundedRect(x, y, w, h, rounded, rounded, 'F')
  else doc.rect(x, y, w, h, 'F')
}

function line(doc, x1, y1, x2, y2, color, lw = 0.3) {
  doc.setLineWidth(lw)
  setDraw(doc, color)
  doc.line(x1, y1, x2, y2)
}

function wrapText(doc, text, x, y, maxWidth, lineHeight) {
  const lines = doc.splitTextToSize(text, maxWidth)
  doc.text(lines, x, y)
  return y + lines.length * lineHeight
}

// Convierte markdown básico (**bold**) a segmentos [{text, bold}]
function parseMarkdown(text) {
  const segments = []
  const parts = text.split(/(\*\*[^*]+\*\*)/)
  parts.forEach(p => {
    if (p.startsWith('**') && p.endsWith('**')) {
      segments.push({ text: p.slice(2, -2), bold: true })
    } else if (p) {
      segments.push({ text: p, bold: false })
    }
  })
  return segments
}

// Renderiza un párrafo con negritas inline
function renderParagraph(doc, text, x, y, maxWidth, fontSize = 9, lineH = 5) {
  const cleanText = text.replace(/\*\*/g, '')
  doc.setFontSize(fontSize)
  setTextColor(doc, C.text2)
  const lines = doc.splitTextToSize(cleanText, maxWidth)
  doc.text(lines, x, y)
  return y + lines.length * lineH + 2
}

export async function exportarDiagnosticoPDF({ territorio, indicadores, triRadar, diagnosticoTexto, acuerdos }) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const W = 210, H = 297
  const MARGIN = 16
  const INNER = W - MARGIN * 2
  let y = 0

  // ─── PORTADA ──────────────────────────────────────────────────────────────

  // Header oscuro
  rect(doc, 0, 0, W, 52, [8, 14, 28])
  rect(doc, 0, 0, 4, 52, C.accent)

  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  setTextColor(doc, [0, 168, 140])
  doc.text('SOTI · SISTEMA OPERATIVO TERRITORIAL INTELIGENTE', MARGIN, 14)

  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  setTextColor(doc, [230, 240, 255])
  doc.text('DIAGNÓSTICO TERRITORIAL', MARGIN, 26)

  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  setTextColor(doc, [100, 150, 200])
  doc.text(territorio?.nombre || 'San Marcos del Valle', MARGIN, 35)

  doc.setFontSize(8)
  setTextColor(doc, [60, 90, 130])
  const fecha = new Date().toLocaleDateString('es-SV', { year: 'numeric', month: 'long', day: 'numeric' })
  doc.text(`${territorio?.pais || 'El Salvador'} · Generado: ${fecha}`, MARGIN, 44)

  // Número de página (portada = 1)
  doc.setFontSize(7)
  setTextColor(doc, [40, 70, 100])
  doc.text('1', W - MARGIN, 48, { align: 'right' })

  y = 62

  // ─── RESUMEN EJECUTIVO ─────────────────────────────────────────────────────

  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  setTextColor(doc, C.accent)
  doc.text('RESUMEN EJECUTIVO', MARGIN, y)
  line(doc, MARGIN, y + 2, W - MARGIN, y + 2, C.border)
  y += 8

  // KPIs principales en cajas
  const kpis = [
    { label: 'PTI', val: `${indicadores?.find(i => i.codigo === 'PTI')?.valor || '--'}`, sub: 'Potencial Territorial', color: C.warn },
    { label: 'TRI', val: `${indicadores?.find(i => i.codigo === 'TRI')?.valor || '--'}`, sub: 'Resiliencia Territorial', color: C.accent2 },
    { label: 'GOB', val: `${triRadar?.find(d => d.dimension === 'Gobernanza')?.valor || '--'}`, sub: 'Gobernanza', color: C.danger },
    { label: 'EMI', val: `${indicadores?.find(i => i.codigo === 'EMI')?.valor || '--'}%`, sub: 'Emigración neta', color: C.warn },
  ]

  const kpiW = (INNER - 9) / 4
  kpis.forEach((k, i) => {
    const kx = MARGIN + i * (kpiW + 3)
    rect(doc, kx, y, kpiW, 24, C.bgSection, 2)
    doc.setLineWidth(0.3)
    setDraw(doc, k.color)
    doc.roundedRect(kx, y, kpiW, 24, 2, 2, 'S')
    // Top color bar
    rect(doc, kx, y, kpiW, 2, k.color)

    doc.setFontSize(7)
    doc.setFont('helvetica', 'bold')
    setTextColor(doc, k.color)
    doc.text(k.label, kx + kpiW / 2, y + 7, { align: 'center' })

    doc.setFontSize(13)
    doc.setFont('helvetica', 'bold')
    setTextColor(doc, C.text)
    doc.text(String(k.val), kx + kpiW / 2, y + 16, { align: 'center' })

    doc.setFontSize(6)
    doc.setFont('helvetica', 'normal')
    setTextColor(doc, C.text3)
    doc.text(k.sub, kx + kpiW / 2, y + 22, { align: 'center' })
  })
  y += 30

  // ─── DIAGNÓSTICO NARRATIVO ─────────────────────────────────────────────────

  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  setTextColor(doc, C.accent)
  doc.text('ANÁLISIS TERRITORIAL', MARGIN, y)
  line(doc, MARGIN, y + 2, W - MARGIN, y + 2, C.border)
  y += 8

  if (diagnosticoTexto) {
    const paragraphs = diagnosticoTexto.split('\n\n').filter(p => p.trim())
    paragraphs.forEach(para => {
      const cleanPara = para.replace(/\*\*/g, '').trim()
      if (!cleanPara) return
      if (y > H - 30) {
        doc.addPage()
        y = MARGIN + 10
      }
      y = renderParagraph(doc, cleanPara, MARGIN, y, INNER, 8.5, 4.8)
      y += 3
    })
  } else {
    doc.setFontSize(8.5)
    doc.setFont('helvetica', 'italic')
    setTextColor(doc, C.text3)
    doc.text('(Diagnóstico no disponible — Motor de Inteligencia SOTI no alcanzó al servidor.)', MARGIN, y)
    y += 8
  }

  y += 4

  // ─── TRI — RADAR DE CAPACIDADES ────────────────────────────────────────────

  if (y > H - 80) { doc.addPage(); y = MARGIN + 10 }

  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  setTextColor(doc, C.accent)
  doc.text('ÍNDICE DE RESILIENCIA TERRITORIAL (TRI) · 6 DIMENSIONES', MARGIN, y)
  line(doc, MARGIN, y + 2, W - MARGIN, y + 2, C.border)
  y += 8

  if (triRadar && triRadar.length) {
    const dimColors = [C.accent2, C.accent, [168, 85, 247], [34, 211, 238], C.warn, [132, 204, 22]]
    const barH = 9
    const barW = INNER * 0.55
    const labelW = 42

    triRadar.forEach((dim, i) => {
      const bx = MARGIN + labelW + 2
      const by = y + i * (barH + 3)
      const pct = dim.valor / 100
      const col = dimColors[i]
      const statusColor = dim.valor < 35 ? C.danger : dim.valor < 55 ? C.warn : C.ok
      const statusLabel = dim.valor < 35 ? 'CRÍTICO' : dim.valor < 55 ? 'MODERADO' : 'ADECUADO'

      // Label
      doc.setFontSize(7.5)
      doc.setFont('helvetica', 'normal')
      setTextColor(doc, C.text2)
      doc.text(dim.dimension, MARGIN, by + barH - 2)

      // Fondo barra
      rect(doc, bx, by, barW, barH, C.border, 1.5)
      // Barra valor
      if (pct > 0) rect(doc, bx, by, barW * pct, barH, col, 1.5)

      // Valor numérico
      doc.setFontSize(8)
      doc.setFont('helvetica', 'bold')
      setTextColor(doc, C.text)
      doc.text(String(dim.valor), bx + barW + 4, by + barH - 1.5)

      // Badge estado
      const badgeX = bx + barW + 16
      rect(doc, badgeX, by + 1, 22, barH - 2, [...statusColor, 30], 2)
      doc.setFontSize(5.5)
      doc.setFont('helvetica', 'bold')
      setTextColor(doc, statusColor)
      doc.text(statusLabel, badgeX + 11, by + barH - 2.5, { align: 'center' })
    })
    y += triRadar.length * (barH + 3) + 8
  }

  // ─── INDICADORES CLAVE ─────────────────────────────────────────────────────

  if (y > H - 70) { doc.addPage(); y = MARGIN + 10 }

  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  setTextColor(doc, C.accent)
  doc.text('INDICADORES TERRITORIALES · 2024', MARGIN, y)
  line(doc, MARGIN, y + 2, W - MARGIN, y + 2, C.border)
  y += 8

  if (indicadores) {
    const cols = 3
    const cellW = (INNER - (cols - 1) * 3) / cols
    const cellH = 18
    const inds = indicadores.filter(i => !['PTI', 'TRI'].includes(i.codigo))

    inds.forEach((ind, i) => {
      const col = i % cols
      const row = Math.floor(i / cols)
      const ix = MARGIN + col * (cellW + 3)
      const iy = y + row * (cellH + 3)

      if (iy + cellH > H - 20) return // evitar overflow

      rect(doc, ix, iy, cellW, cellH, C.bgSection, 2)

      const tColor = ind.tendencia === '↗' ? C.ok : ind.tendencia === '↓' ? C.danger : C.warn
      rect(doc, ix, iy, cellW, 1.5, tColor)

      doc.setFontSize(6.5)
      doc.setFont('helvetica', 'bold')
      setTextColor(doc, tColor)
      doc.text(ind.codigo, ix + 3, iy + 6)

      doc.setFontSize(6)
      doc.setFont('helvetica', 'normal')
      setTextColor(doc, C.text3)
      const shortName = ind.nombre.length > 22 ? ind.nombre.slice(0, 22) + '…' : ind.nombre
      doc.text(shortName, ix + 3, iy + 10.5)

      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      setTextColor(doc, C.text)
      doc.text(`${ind.valor}`, ix + 3, iy + 16)

      doc.setFontSize(6)
      doc.setFont('helvetica', 'normal')
      setTextColor(doc, C.text3)
      doc.text(ind.unidad, ix + 3 + doc.getTextWidth(`${ind.valor}`) + 1, iy + 16)
    })

    const rowCount = Math.ceil(inds.length / cols)
    y += rowCount * (cellH + 3) + 6
  }

  // ─── ACUERDOS GOVSYNC ─────────────────────────────────────────────────────

  if (acuerdos && acuerdos.length) {
    if (y > H - 60) { doc.addPage(); y = MARGIN + 10 }

    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    setTextColor(doc, C.accent)
    doc.text('ACUERDOS GOVSYNC · ESTADO ACTUAL', MARGIN, y)
    line(doc, MARGIN, y + 2, W - MARGIN, y + 2, C.border)
    y += 8

    acuerdos.forEach(a => {
      if (y > H - 22) { doc.addPage(); y = MARGIN + 10 }

      const rowH = 14
      rect(doc, MARGIN, y, INNER, rowH, C.bgSection, 2)

      const estadoColors = {
        activo: C.ok, en_riesgo: C.warn, atrasado: C.danger, negociacion: C.accent2
      }
      const eColor = estadoColors[a.estado] || C.text3
      rect(doc, MARGIN, y, 3, rowH, eColor)

      // Título
      doc.setFontSize(7.5)
      doc.setFont('helvetica', 'bold')
      setTextColor(doc, C.text)
      const titulo = a.titulo.length > 36 ? a.titulo.slice(0, 36) + '…' : a.titulo
      doc.text(titulo, MARGIN + 6, y + 5.5)

      // Entidad
      doc.setFontSize(6.5)
      doc.setFont('helvetica', 'normal')
      setTextColor(doc, C.text3)
      doc.text(a.entidad, MARGIN + 6, y + 10.5)

      // Cumplimiento barra
      const bx = MARGIN + 82
      const barW2 = 50
      rect(doc, bx, y + 4, barW2, 4, C.border, 1)
      if (a.cumplimiento_pct > 0) {
        rect(doc, bx, y + 4, barW2 * a.cumplimiento_pct / 100, 4, eColor, 1)
      }
      doc.setFontSize(7)
      doc.setFont('helvetica', 'bold')
      setTextColor(doc, eColor)
      doc.text(`${a.cumplimiento_pct}%`, bx + barW2 + 2, y + 8)

      // Alerta
      if (a.alerta) {
        doc.setFontSize(6)
        doc.setFont('helvetica', 'bold')
        setTextColor(doc, C.danger)
        const alertaShort = a.alerta.length > 22 ? a.alerta.slice(0, 22) + '…' : a.alerta
        doc.text(`⚠ ${alertaShort}`, MARGIN + 6, y + rowH - 1.5)
      }

      // Fecha vencimiento
      doc.setFontSize(6)
      doc.setFont('helvetica', 'normal')
      setTextColor(doc, C.text3)
      doc.text(`Vence: ${a.fecha_vencimiento}`, W - MARGIN - 2, y + 10.5, { align: 'right' })

      y += rowH + 3
    })
  }

  // ─── PIE DE PÁGINA (todas las páginas) ──────────────────────────────────

  const totalPages = doc.getNumberOfPages()
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p)
    rect(doc, 0, H - 10, W, 10, [8, 14, 28])
    doc.setFontSize(6.5)
    doc.setFont('helvetica', 'normal')
    setTextColor(doc, [40, 70, 100])
    doc.text('SOTI · Sistema Operativo Territorial Inteligente · Documento de uso interno — Piloto v1.2', MARGIN, H - 4)
    setTextColor(doc, [60, 100, 140])
    doc.text(`${p} / ${totalPages}`, W - MARGIN, H - 4, { align: 'right' })
  }

  // ─── GUARDAR ──────────────────────────────────────────────────────────────

  const nombreArchivo = `SOTI_Diagnostico_${(territorio?.nombre || 'Territorio').replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`
  doc.save(nombreArchivo)
  return nombreArchivo
}
