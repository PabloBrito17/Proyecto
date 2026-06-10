const express = require('express');
const cors = require('cors');
const path = require('path');
const initSqlJs = require('sql.js');
const seed = require('./seed');

const app = express();
app.use(cors());
app.use(express.json());

let db;

function query(sql, params = []) {
  const stmt = db.prepare(sql);
  const rows = [];
  if (params.length) stmt.bind(params);
  while (stmt.step()) rows.push(stmt.getAsObject());
  stmt.free();
  return rows;
}
function queryOne(sql, params = []) {
  const rows = query(sql, params);
  return rows[0] || null;
}

initSqlJs().then(SQL => {
  db = new SQL.Database();
  seed(db);
  console.log('\n◈ SOTI Demo Backend iniciado\n');

  // ── LISTA DE TERRITORIOS ──
  app.get('/api/territorios', (req, res) => {
    res.json(query('SELECT id, nombre, pais, poblacion, depto, descripcion FROM territorio ORDER BY id'));
  });

  // ── TERRITORIO POR ID ──
  app.get('/api/territorio/:id', (req, res) => {
    const t = queryOne('SELECT * FROM territorio WHERE id=?', [req.params.id]);
    if (!t) return res.status(404).json({ error: 'No encontrado' });
    res.json(t);
  });

  // Compat legacy (territorio 1)
  app.get('/api/territorio', (req, res) => {
    res.json(queryOne('SELECT * FROM territorio WHERE id=1'));
  });

  // ── INDICADORES ──
  app.get('/api/indicadores/:tid', (req, res) => {
    res.json(query('SELECT * FROM indicadores WHERE territorio_id=? ORDER BY id', [req.params.tid]));
  });
  app.get('/api/indicadores', (req, res) => {
    res.json(query('SELECT * FROM indicadores WHERE territorio_id=1 ORDER BY id'));
  });

  // ── TRI RADAR ──
  app.get('/api/tri/radar/:tid', (req, res) => {
    const row = queryOne(
      'SELECT * FROM tri_historial WHERE territorio_id=? ORDER BY año DESC, trimestre DESC LIMIT 1',
      [req.params.tid]
    );
    if (!row) return res.json([]);
    res.json([
      { dimension: 'Gobernanza Territorial',       valor: row.gobernanza },
      { dimension: 'Capacidades Territoriales',    valor: row.capacidades_territoriales },
      { dimension: 'Movilización de Recursos',     valor: row.movilizacion_recursos },
      { dimension: 'Dinámica Laboral Territorial', valor: row.dinamica_laboral },
    ]);
  });
  app.get('/api/tri/radar', (req, res) => {
    const row = queryOne('SELECT * FROM tri_historial WHERE territorio_id=1 ORDER BY año DESC, trimestre DESC LIMIT 1');
    if (!row) return res.json([]);
    res.json([
      { dimension: 'Gobernanza Territorial',       valor: row.gobernanza },
      { dimension: 'Capacidades Territoriales',    valor: row.capacidades_territoriales },
      { dimension: 'Movilización de Recursos',     valor: row.movilizacion_recursos },
      { dimension: 'Dinámica Laboral Territorial', valor: row.dinamica_laboral },
    ]);
  });

  // ── TRI HISTÓRICO ──
  app.get('/api/tri/historial/:tid', (req, res) => {
    const rows = query(
      'SELECT * FROM tri_historial WHERE territorio_id=? ORDER BY año, trimestre',
      [req.params.tid]
    );
    res.json(rows.map(r => ({
      periodo: `Q${r.trimestre} ${r.año}`,
      TRI: r.tri_global,
      'Gobernanza Territorial':       r.gobernanza,
      'Capacidades Territoriales':    r.capacidades_territoriales,
      'Movilización de Recursos':     r.movilizacion_recursos,
      'Dinámica Laboral Territorial': r.dinamica_laboral,
    })));
  });
  app.get('/api/tri/historial', (req, res) => {
    const rows = query('SELECT * FROM tri_historial WHERE territorio_id=1 ORDER BY año, trimestre');
    res.json(rows.map(r => ({
      periodo: `Q${r.trimestre} ${r.año}`,
      TRI: r.tri_global,
      'Gobernanza Territorial':       r.gobernanza,
      'Capacidades Territoriales':    r.capacidades_territoriales,
      'Movilización de Recursos':     r.movilizacion_recursos,
      'Dinámica Laboral Territorial': r.dinamica_laboral,
    })));
  });

  // ── GOVSYNC ──
  app.get('/api/govsync/:tid', (req, res) => {
    res.json(query('SELECT * FROM acuerdos_govsync WHERE territorio_id=? ORDER BY id', [req.params.tid]));
  });
  app.get('/api/govsync', (req, res) => {
    res.json(query('SELECT * FROM acuerdos_govsync WHERE territorio_id=1 ORDER BY id'));
  });

  // ── CONOCIMIENTO ──
  app.get('/api/conocimiento/:tid', (req, res) => {
    res.json(query('SELECT * FROM conocimiento WHERE territorio_id=? ORDER BY relevancia DESC', [req.params.tid]));
  });
  app.get('/api/conocimiento', (req, res) => {
    res.json(query('SELECT * FROM conocimiento WHERE territorio_id=1 ORDER BY relevancia DESC'));
  });

  // ── COMPARADOR: datos de ambos territorios ──
  app.get('/api/comparar/:tid1/:tid2', (req, res) => {
    const { tid1, tid2 } = req.params;
    const t1 = queryOne('SELECT * FROM territorio WHERE id=?', [tid1]);
    const t2 = queryOne('SELECT * FROM territorio WHERE id=?', [tid2]);
    const i1 = query('SELECT * FROM indicadores WHERE territorio_id=? ORDER BY id', [tid1]);
    const i2 = query('SELECT * FROM indicadores WHERE territorio_id=? ORDER BY id', [tid2]);
    const tri1 = queryOne('SELECT * FROM tri_historial WHERE territorio_id=? ORDER BY año DESC, trimestre DESC LIMIT 1', [tid1]);
    const tri2 = queryOne('SELECT * FROM tri_historial WHERE territorio_id=? ORDER BY año DESC, trimestre DESC LIMIT 1', [tid2]);
    res.json({ t1, t2, i1, i2, tri1, tri2 });
  });

  // ── TERRITORYGPT (con territorio dinámico) ──
  app.post('/api/territorygpt', async (req, res) => {
    const { mensaje, historial = [], tid = 1 } = req.body;
    const apiKey = process.env.ANTHROPIC_API_KEY;

    const territorio = queryOne('SELECT * FROM territorio WHERE id=?', [tid]);

    if (!apiKey) {
      const demoRespuestas = {
        '1': `**${territorio?.nombre || 'San Marcos del Valle'} — Análisis TerritoryGPT**\n\nEl territorio registra un TRI de 35.0/100 con tendencia ascendente (+6.9 puntos en 8 trimestres). La Gobernanza Territorial (30.1) y la Movilización de Recursos (27.4) son los restrictores sistémicos principales — actúan como techo para las demás dimensiones.\n\nLa oportunidad inmediata de mayor impacto es el nicho de productos especiales para exportación, que combina vocación productiva existente con demanda documentada. La Red de Productoras Locales (240 integrantes) es el actor ancla más confiable para una intervención.\n\nMotor de Inteligencia SOTI — modo demostración activo.`,
        '2': `**${territorio?.nombre || 'Mun. de Sensuntepeque'} — Análisis TerritoryGPT**\n\nEl territorio presenta una paradoja estructural: PTI de 51.8/100 (potencial alto) frente a TRI de 27.5/100 (resiliencia baja). Una brecha de 24.3 puntos que señala capacidades latentes que el sistema institucional no logra activar.\n\nEl aislamiento vial es el restrictor dominante dentro de Capacidades Territoriales (31.2). El corredor logístico binacional representa la intervención de mayor impacto sistémico: resuelve conectividad, activa la ganadería y posiciona al territorio como nodo regional.\n\nMotor de Inteligencia SOTI — modo demostración activo.`
      };
      return res.json({
        respuesta: demoRespuestas[String(tid)] || demoRespuestas['1'],
        modo: 'demo'
      });
    }
    const indicadores = query('SELECT * FROM indicadores WHERE territorio_id=?', [tid]);
    const tri = queryOne('SELECT * FROM tri_historial WHERE territorio_id=? ORDER BY año DESC, trimestre DESC LIMIT 1', [tid]);
    const alertas = query("SELECT alerta FROM acuerdos_govsync WHERE territorio_id=? AND alerta IS NOT NULL AND alerta != ''", [tid]);

    const contexto = `Eres TerritoryGPT, motor de inteligencia del SOTI (Sistema Operativo Territorial Inteligente).
Analizas: "${territorio.nombre}", ${territorio.pais} — ${territorio.descripcion}

PERFIL: ${territorio.poblacion} hab | ${territorio.superficie_km2} km² | ${territorio.economia_principal} | Emigración ${territorio.emigracion_anual_pct}%/año | Plan DET ${territorio.plan_det_año}

INDICADORES: ${indicadores.map(i => `${i.nombre}: ${i.valor}${i.unidad}(${i.tendencia})`).join(' | ')}

TRI Q4-2023: Global ${tri?.tri_global} | Gobernanza Territorial ${tri?.gobernanza} | Capacidades Territoriales ${tri?.capacidades_territoriales} | Movilización de Recursos ${tri?.movilizacion_recursos} | Dinámica Laboral ${tri?.dinamica_laboral}

ALERTAS: ${alertas.map(a => a.alerta).join(' | ') || 'Ninguna'}

Responde en español. Analítico, preciso, orientado a decisiones. Máximo 4 párrafos.`;

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514', max_tokens: 1024,
          system: contexto,
          messages: [...historial, { role: 'user', content: mensaje }]
        })
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error.message);
      res.json({ respuesta: data.content[0].text, modo: 'api' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // ── DIAGNÓSTICO ──
  app.get('/api/diagnostico/:tid', async (req, res) => {
    const tid = req.params.tid;
    const apiKey = process.env.ANTHROPIC_API_KEY;

    const territorio = queryOne('SELECT * FROM territorio WHERE id=?', [tid]);
    const indicadores = query('SELECT * FROM indicadores WHERE territorio_id=?', [tid]);
    const tri = queryOne('SELECT * FROM tri_historial WHERE territorio_id=? ORDER BY año DESC, trimestre DESC LIMIT 1', [tid]);

    if (!apiKey) {
      const demos = {
        '1': `**San Marcos del Valle — Diagnóstico Territorial SOTI**\n\nEl territorio registra un TRI de 35.0/100 con crecimiento sostenido de 6.9 puntos en 8 trimestres. La Gobernanza Territorial (30.1) y la Movilización de Recursos (27.4) actúan como restrictores sistémicos que frenan la consolidación, mientras las Capacidades Territoriales (43.8) muestran mayor avance relativo.\n\n**Restrictor primario:** La Gobernanza Territorial es el cuello de botella dominante — la debilidad institucional municipal limita la apropiación de recursos externos y la ejecución de acuerdos interinstitucionales. Dos acuerdos activos están en riesgo o vencidos, señalando capacidad de negociación pero baja capacidad de seguimiento.\n\n**Oportunidades priorizadas:** El nicho de productos especiales para exportación combina vocación productiva existente con demanda documentada. La Red de Productoras Locales (240 integrantes) es el actor ancla más confiable para una intervención. La brecha crítica no está en la producción primaria sino en certificación, trazabilidad y acceso a mercado diferenciado.`,
        '2': `**Mun. de Sensuntepeque — Diagnóstico Territorial SOTI**\n\nEl territorio presenta una paradoja estructural: PTI de 51.8/100 — el más alto del piloto — convive con un TRI de 27.5/100. Esta brecha de 24.3 puntos entre potencial y resiliencia es el hallazgo diagnóstico central: existen capacidades latentes que el sistema institucional local no logra activar.\n\n**Restrictor primario:** El aislamiento vial es el restrictor sistémico dominante dentro de las Capacidades Territoriales (31.2). Tres proyectos de inversión privada se retiraron citando la conectividad como factor decisivo. La Dinámica Laboral (29.6) y la Movilización de Recursos (22.8) confirman el patrón de territorio con alto potencial y baja capacidad de activación.\n\n**Oportunidades priorizadas:** El corredor logístico binacional representa la intervención de mayor impacto sistémico: resuelve el aislamiento, activa la ganadería y posiciona al territorio como nodo regional. La Cooperativa Regional de Productores (180 socios) es el actor ancla para cualquier intervención en la cadena productiva principal.`
      };
      return res.json({ texto: demos[tid] || demos['1'], modo: 'demo' });
    }

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514', max_tokens: 800,
          messages: [{
            role: 'user',
            content: `Diagnóstico narrativo ejecutivo 3 párrafos para "${territorio.nombre}" (${territorio.descripcion}):
TRI Global: ${tri?.tri_global}/100 | Gobernanza Territorial ${tri?.gobernanza} | Capacidades Territoriales ${tri?.capacidades_territoriales} | Movilización de Recursos ${tri?.movilizacion_recursos} | Dinámica Laboral ${tri?.dinamica_laboral}
Indicadores: ${indicadores.map(i=>`${i.nombre} ${i.valor}${i.unidad}`).join(', ')}
Estructura: 1) Situación actual, 2) Cuellos de botella, 3) Oportunidades priorizadas. Markdown con negritas. Tono técnico-ejecutivo.`
          }]
        })
      });
      const data = await response.json();
      res.json({ texto: data.content[0].text, modo: 'api' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // compat legacy
  app.get('/api/diagnostico', async (req, res) => {
    req.params = { tid: '1' };
    // relay to handler above by re-calling
    const tid = '1';
    const apiKey = process.env.ANTHROPIC_API_KEY;
    const territorio = queryOne('SELECT * FROM territorio WHERE id=?', [tid]);
    const indicadores = query('SELECT * FROM indicadores WHERE territorio_id=?', [tid]);
    const tri = queryOne('SELECT * FROM tri_historial WHERE territorio_id=? ORDER BY año DESC, trimestre DESC LIMIT 1', [tid]);
    if (!apiKey) {
      return res.json({ texto: `**${territorio?.nombre || 'San Marcos del Valle'} — Diagnóstico Demo**\n\nTRI 35.0/100. Gobernanza Territorial crítica (30.1). Oportunidad clave: productos especiales para exportación.\n\nMotor de Inteligencia SOTI disponible en modo demostración.`, modo: 'demo' });
    }
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 800, messages: [{ role: 'user', content: `Diagnóstico 3 párrafos "${territorio.nombre}": TRI ${tri?.tri_global} | ${indicadores.map(i=>`${i.nombre} ${i.valor}`).join(', ')}` }] })
      });
      const data = await response.json();
      res.json({ texto: data.content[0].text, modo: 'api' });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });

  // ── DOCUMENTOS DEL TERRITORIO ──
  // IMPORTANTE: las rutas específicas (/upload, /bpf/*) deben ir ANTES
  // del wildcard /:territorioId para que Express no las intercepte.

  // BPF — Batería de Preguntas Fundacionales (definida antes de las rutas que la usan)
  const BPF_PREGUNTAS = [
    { dimension: 'Gobernanza Territorial', pregunta: '¿Cuántos acuerdos interinstitucionales activos tiene el municipio?' },
    { dimension: 'Gobernanza Territorial', pregunta: '¿Existe mesa de gobernanza operativa con participación multiactor?' },
    { dimension: 'Gobernanza Territorial', pregunta: '¿Cuál es el nivel de ejecución presupuestaria del último ejercicio (%)?' },
    { dimension: 'Capacidades Territoriales', pregunta: '¿Qué perfil técnico tiene el equipo municipal (número de profesionales)?' },
    { dimension: 'Capacidades Territoriales', pregunta: '¿Existe infraestructura habilitante (conectividad, agua, energía) con cobertura >70%?' },
    { dimension: 'Capacidades Territoriales', pregunta: '¿Cuál es la cobertura educativa (escolaridad promedio de la PEA en años)?' },
    { dimension: 'Movilización de Recursos', pregunta: '¿Cuáles son las fuentes de financiamiento activas (propias, nacionales, cooperación)?' },
    { dimension: 'Movilización de Recursos', pregunta: '¿Existe capacidad instalada de formulación de proyectos (equipo o unidad)?' },
    { dimension: 'Movilización de Recursos', pregunta: '¿Qué cooperantes u organismos han operado en el territorio en los últimos 3 años?' },
    { dimension: 'Dinámica Laboral Territorial', pregunta: '¿Cuál es la tasa de emigración anual estimada (% de PEA)?' },
    { dimension: 'Dinámica Laboral Territorial', pregunta: '¿Existen programas activos de empleo o formación técnica en el territorio?' },
    { dimension: 'Dinámica Laboral Territorial', pregunta: '¿Qué sectores concentran el empleo formal en el territorio?' },
  ];

  // POST /api/documentos/upload  — registrar nuevo documento
  app.post('/api/documentos/upload', (req, res) => {
    try {
      const { territorio_id, tipo, nombre, contenido_texto } = req.body || {};
      if (!territorio_id || !tipo || !nombre)
        return res.status(400).json({ error: 'Faltan campos requeridos: territorio_id, tipo, nombre' });
      const fecha_carga = new Date().toISOString().slice(0, 10);
      db.run(
        `INSERT INTO documentos_territorio (territorio_id, tipo, nombre, fecha_carga, contenido_texto) VALUES (?, ?, ?, ?, ?)`,
        [territorio_id, tipo, nombre, fecha_carga, contenido_texto || null]
      );
      // sql.js no expone lastID directamente; recuperamos el id recién insertado
      const row = queryOne(
        'SELECT id FROM documentos_territorio WHERE territorio_id=? AND nombre=? ORDER BY id DESC LIMIT 1',
        [territorio_id, nombre]
      );
      res.json({ ok: true, id: row ? row.id : null });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  // GET /api/documentos/bpf/:territorioId  — preguntas pendientes de BPF
  app.get('/api/documentos/bpf/:territorioId', (req, res) => {
    try {
      const tid = parseInt(req.params.territorioId);
      const respondidas = query(
        'SELECT dimension, pregunta FROM bpf_respuestas WHERE territorio_id = ?',
        [tid]
      );
      const respondSet = new Set(respondidas.map(r => `${r.dimension}||${r.pregunta}`));
      const pendientes = BPF_PREGUNTAS.filter(p => !respondSet.has(`${p.dimension}||${p.pregunta}`));
      res.json({ total: BPF_PREGUNTAS.length, pendientes, respondidas: respondidas.length });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  // POST /api/documentos/bpf/respuesta  — guardar respuesta BPF
  app.post('/api/documentos/bpf/respuesta', (req, res) => {
    try {
      const { territorio_id, dimension, pregunta, respuesta } = req.body || {};
      if (!territorio_id || !dimension || !pregunta)
        return res.status(400).json({ error: 'Faltan campos: territorio_id, dimension, pregunta' });
      const fecha = new Date().toISOString().slice(0, 10);
      db.run(
        `INSERT INTO bpf_respuestas (territorio_id, dimension, pregunta, respuesta, fecha) VALUES (?, ?, ?, ?, ?)`,
        [territorio_id, dimension, pregunta, respuesta || '', fecha]
      );
      res.json({ ok: true });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  // GET /api/documentos/:territorioId  — lista documentos (wildcard SIEMPRE al final)
  app.get('/api/documentos/:territorioId', (req, res) => {
    try {
      const tid = parseInt(req.params.territorioId);
      const rows = query(
        'SELECT * FROM documentos_territorio WHERE territorio_id = ? ORDER BY fecha_carga DESC',
        [tid]
      );
      res.json(rows || []);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  // ── PTI CONFIG ──
  app.get('/api/pti/:tid', (req, res) => {
    const pti = queryOne(
      "SELECT valor FROM indicadores WHERE territorio_id=? AND codigo='PTI' LIMIT 1",
      [req.params.tid]
    );
    res.json({ pti_global: pti ? pti.valor : null });
  });

  // ── LOGIN ──
  const USUARIOS = [
    { usuario: 'admin.soti', contrasena: 'soti2026*', perfil: 'Administrador' },
    { usuario: 'demo.soti',  contrasena: 'demo2026*', perfil: 'Observador' },
  ];
  app.post('/api/login', (req, res) => {
    const { usuario, contrasena } = req.body || {};
    const match = USUARIOS.find(u => u.usuario === (usuario || '').trim() && u.contrasena === contrasena);
    if (match) {
      res.json({ ok: true, perfil: match.perfil, usuario: match.usuario });
    } else {
      res.status(401).json({ ok: false, error: 'Usuario o contraseña incorrectos' });
    }
  });

  // ── CALIBRACIÓN TRI (persistencia) ──
  app.get('/api/calibracion/:tid', (req, res) => {
    try {
      const row = queryOne(
        'SELECT respuestas_json, ajustes_json, fecha_actualizacion FROM calibracion_tri WHERE territorio_id=?',
        [req.params.tid]
      );
      if (!row) return res.json({ respuestas: {}, ajustes: [], fecha: null });
      res.json({
        respuestas: JSON.parse(row.respuestas_json || '{}'),
        ajustes:    JSON.parse(row.ajustes_json    || '[]'),
        fecha:      row.fecha_actualizacion,
      });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post('/api/calibracion/:tid', (req, res) => {
    try {
      const tid = req.params.tid;
      const { respuestas, ajustes } = req.body || {};
      if (!respuestas) return res.status(400).json({ error: 'respuestas requerido' });
      const fecha = new Date().toISOString();
      const existing = queryOne('SELECT id FROM calibracion_tri WHERE territorio_id=?', [tid]);
      if (existing) {
        db.run(
          'UPDATE calibracion_tri SET respuestas_json=?, ajustes_json=?, fecha_actualizacion=? WHERE territorio_id=?',
          [JSON.stringify(respuestas), JSON.stringify(ajustes || []), fecha, tid]
        );
      } else {
        db.run(
          'INSERT INTO calibracion_tri (territorio_id, respuestas_json, ajustes_json, fecha_actualizacion) VALUES (?,?,?,?)',
          [tid, JSON.stringify(respuestas), JSON.stringify(ajustes || []), fecha]
        );
      }
      res.json({ ok: true, fecha });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  // ── HEALTH / DEMO CHECK ──
  app.get('/api/health', (req, res) => {
    try {
      const territorios = query('SELECT COUNT(*) as n FROM territorio');
      const indicadores = query('SELECT COUNT(*) as n FROM indicadores');
      const triRows     = query('SELECT COUNT(*) as n FROM tri_historial');
      res.json({
        status: 'ok',
        territorios: territorios[0]?.n || 0,
        indicadores:  indicadores[0]?.n || 0,
        tri_records:  triRows[0]?.n || 0,
        ai_mode:      process.env.ANTHROPIC_API_KEY ? 'api' : 'demo',
        timestamp:    new Date().toISOString(),
      });
    } catch (e) {
      res.status(500).json({ status: 'error', error: e.message });
    }
  });

  // ── PRODUCCIÓN: servir build estático de Vite ──────────────────────────────
  const distPath = path.join(__dirname, '../dist');
  const fs = require('fs');
  if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    // Catch-all para React Router (BrowserRouter)
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => console.log(`  → http://localhost:${PORT}\n`));
});
