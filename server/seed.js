module.exports = function seedDatabase(db) {
  db.run(`
    CREATE TABLE IF NOT EXISTS territorio (
      id INTEGER PRIMARY KEY, nombre TEXT, pais TEXT,
      poblacion INTEGER, superficie_km2 REAL,
      economia_principal TEXT, emigracion_anual_pct REAL, plan_det_año INTEGER,
      depto TEXT, lat REAL, lng REAL, descripcion TEXT
    );
    CREATE TABLE IF NOT EXISTS indicadores (
      id INTEGER PRIMARY KEY, territorio_id INTEGER, codigo TEXT, nombre TEXT,
      valor REAL, unidad TEXT, tendencia TEXT, categoria TEXT, año INTEGER
    );
    CREATE TABLE IF NOT EXISTS tri_historial (
      id INTEGER PRIMARY KEY, territorio_id INTEGER,
      año INTEGER, trimestre INTEGER,
      tri_global REAL,
      gobernanza REAL,
      capacidades_territoriales REAL,
      movilizacion_recursos REAL,
      dinamica_laboral REAL
    );
    CREATE TABLE IF NOT EXISTS acuerdos_govsync (
      id INTEGER PRIMARY KEY, territorio_id INTEGER,
      titulo TEXT, entidad TEXT, tipo TEXT, estado TEXT,
      fecha_inicio TEXT, fecha_vencimiento TEXT,
      cumplimiento_pct REAL, alerta TEXT
    );
    CREATE TABLE IF NOT EXISTS conocimiento (
      id INTEGER PRIMARY KEY, territorio_id INTEGER,
      tipo TEXT, titulo TEXT, fuente TEXT,
      fecha TEXT, relevancia REAL, tags TEXT
    );
    CREATE TABLE IF NOT EXISTS documentos_territorio (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      territorio_id INTEGER NOT NULL,
      tipo TEXT NOT NULL,
      nombre TEXT NOT NULL,
      fecha_carga TEXT,
      contenido_texto TEXT,
      FOREIGN KEY (territorio_id) REFERENCES territorio(id)
    );
    CREATE TABLE IF NOT EXISTS bpf_respuestas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      territorio_id INTEGER NOT NULL,
      dimension TEXT NOT NULL,
      pregunta TEXT NOT NULL,
      respuesta TEXT,
      fecha TEXT,
      FOREIGN KEY (territorio_id) REFERENCES territorio(id)
    );
  `);

  // ──────────────────────────────────────────────────────────────────────────
  // TERRITORIO 1: San Marcos del Valle
  // Perfil: cafetalero, zona montañosa, 18.420 hab., alta emigración juvenil
  // ──────────────────────────────────────────────────────────────────────────
  db.run(`INSERT INTO territorio VALUES (
    1,'San Marcos del Valle','Centroamérica',18420,87.3,
    'Café / Granos Básicos',4.8,2025,
    'Región Occidental',13.6929,-89.3312,
    'Municipio cafetalero con alta emigración juvenil y gobernanza débil. TRI en ascenso pero por debajo del umbral de transformación.'
  )`);

  const ind1 = [
    [1,1,'PTI','Potencial Territorial Integrado',42.3,'índice','↓','global',2025],
    [2,1,'TRI','Índice de Resiliencia Territorial',35.0,'índice','↗','global',2025],
    [3,1,'EMI','Tasa de Emigración Neta',4.8,'%/año','→','laboral',2025],
    [4,1,'ING','Ingreso per Cápita Mensual',187.4,'USD','↗','económico',2025],
    [5,1,'DES','Desempleo Juvenil (18-29)',34.1,'%','↓','laboral',2025],
    [6,1,'INV','Inversión Pública Municipal',2.3,'% PIB local','↓','fiscal',2025],
    [7,1,'COB','Cobertura Servicios Básicos',82.0,'%','↗','infraestructura',2025],
    [8,1,'CAF','Producción Principal (qq/año)',1240,'qq/año','↓','productivo',2025],
    [9,1,'ASO','Organizaciones Comunitarias Activas',12,'unidades','→','gobernanza',2025],
    [10,1,'EDU','Años Promedio Escolaridad PEA',6.8,'años','↗','capacidades',2025],
    [11,1,'FOR','Tasa Ocupación Formal',31.0,'%','↗','laboral',2025],
    [12,1,'REM','Remesas / Ingreso Territorial Est.',22.0,'%','→','laboral',2025],
  ];
  ind1.forEach(r => db.run(`INSERT INTO indicadores VALUES (${r.map(v=>typeof v==='string'?`'${v}'`:v).join(',')})`));

  // Trayectoria 8 trimestres — (id, tid, año, trim, tri_global, gobernanza, capacidades, movilizacion, laboral)
  const tri1 = [
    [1,1,2023,1, 28.1, 22.1, 34.8, 21.0, 34.4],
    [2,1,2023,2, 29.4, 23.0, 35.6, 21.8, 36.2],
    [3,1,2023,3, 30.2, 23.8, 36.4, 22.5, 38.0],
    [4,1,2023,4, 31.0, 24.6, 37.2, 23.2, 38.9],
    [5,1,2024,1, 31.8, 25.4, 38.0, 23.9, 39.7],
    [6,1,2024,2, 33.1, 26.8, 39.2, 25.0, 41.3],
    [7,1,2024,3, 34.2, 28.0, 40.5, 26.1, 42.4],
    [8,1,2024,4, 35.0, 30.1, 43.8, 27.4, 38.7],
  ];
  tri1.forEach(r => db.run(`INSERT INTO tri_historial VALUES (${r.join(',')})`));

  const acuerdos1 = [
    [1,1,'Plan DET 2025-2030','Ministerio de Planificación','Planificación','en_riesgo','2025-02-01','2025-12-15',38.0,'VENCIMIENTO PRÓXIMO — Q4 2025'],
    [2,1,'Fondo Municipal Productivo','Agencia de Desarrollo Agropecuario','Financiamiento','activo','2024-09-01','2026-03-31',67.0,null],
    [3,1,'Proyecto Agua Potable','Ente Rector de Agua','Infraestructura','atrasado','2024-06-01','2026-06-30',44.0,'PLAZO VENCIDO'],
    [4,1,'Capacitación Técnica Jóvenes','Fondo Nacional de Formación','Formación','activo','2025-03-01','2025-12-15',72.0,null],
    [5,1,'Cooperación Técnica Regional','Organismo Multilateral A','Inversión','negociacion','2025-05-01','2026-05-01',15.0,null],
  ];
  acuerdos1.forEach(r => db.run(`INSERT INTO acuerdos_govsync VALUES (${r.map(v=>v===null?'NULL':typeof v==='string'?`'${v}'`:v).join(',')})`));

  const conoc1 = [
    [1,1,'diagnóstico','Análisis Cadena Valor Producto Principal 2023','Centro Regional de Investigación Agrícola','2025-03-12',0.92,'café,valor,exportación'],
    [2,1,'lección','Fracaso proyecto riego 2021: apropiación comunitaria insuficiente','Fondo Nacional de Inversión','2024-01-20',0.88,'gobernanza,riego,apropiación'],
    [3,1,'metodología','Marco Metodológico TRI — Versión 2.0','SOTI','2025-01-05',0.95,'TRI,medición,territorio'],
    [4,1,'actor','Red de Productoras Locales — 240 integrantes','Alcaldía Municipal','2025-06-14',0.79,'género,producción,organización'],
    [5,1,'tendencia','Emigración juvenil acelerada Q3-Q4 2023: alza 12%','Registro Civil Nacional','2025-09-01',0.85,'emigración,juventud,alerta'],
    [6,1,'oportunidad','Nicho exportación productos especiales: demanda insatisfecha','Consejo de Exportadores','2025-04-07',0.91,'exportación,nicho,mercado'],
  ];
  conoc1.forEach(r => db.run(`INSERT INTO conocimiento VALUES (${r.map(v=>typeof v==='string'?`'${v}'`:v).join(',')})`));

  // ──────────────────────────────────────────────────────────────────────────
  // TERRITORIO 2: Mun. de Sensuntepeque
  // Perfil: ganadero-granos, aislamiento vial, alta brecha PTI-TRI
  // ──────────────────────────────────────────────────────────────────────────
  db.run(`INSERT INTO territorio VALUES (
    2,'Mun. de Sensuntepeque','Centroamérica',24150,142.6,
    'Ganadería / Maíz / Frijol',3.2,2025,
    'Región Central',13.8738,-88.6289,
    'Municipio ganadero con alta potencialidad no realizada. Aislamiento vial severo como restrictor sistémico. Gobierno local con iniciativa pero baja capacidad técnica.'
  )`);

  const ind2 = [
    [13,2,'PTI','Potencial Territorial Integrado',51.8,'índice','↗','global',2025],
    [14,2,'TRI','Índice de Resiliencia Territorial',27.5,'índice','↗','global',2025],
    [15,2,'EMI','Tasa de Emigración Neta',3.2,'%/año','↓','laboral',2025],
    [16,2,'ING','Ingreso per Cápita Mensual',142.6,'USD','↗','económico',2025],
    [17,2,'DES','Desempleo Juvenil (18-29)',41.8,'%','↓','laboral',2025],
    [18,2,'INV','Inversión Pública Municipal',3.8,'% PIB local','↗','fiscal',2025],
    [19,2,'COB','Cobertura Servicios Básicos',71.0,'%','↗','infraestructura',2025],
    [20,2,'GAN','Producción Principal (cabezas)',8400,'unidades','→','productivo',2025],
    [21,2,'ASO','Organizaciones Comunitarias Activas',8,'unidades','↗','gobernanza',2025],
    [22,2,'EDU','Años Promedio Escolaridad PEA',5.9,'años','↗','capacidades',2025],
    [23,2,'FOR','Tasa Ocupación Formal',24.0,'%','↗','laboral',2025],
    [24,2,'REM','Remesas / Ingreso Territorial Est.',18.0,'%','→','laboral',2025],
  ];
  ind2.forEach(r => db.run(`INSERT INTO indicadores VALUES (${r.map(v=>typeof v==='string'?`'${v}'`:v).join(',')})`));

  const tri2 = [
    [9,2,2023,1,  23.1, 19.8, 28.4, 17.2, 27.0],
    [10,2,2023,2, 23.8, 20.4, 29.0, 17.8, 27.8],
    [11,2,2023,3, 24.4, 21.0, 29.6, 18.4, 28.6],
    [12,2,2023,4, 25.0, 21.6, 30.2, 19.0, 29.4],
    [13,2,2024,1, 25.6, 22.2, 30.8, 19.6, 30.0],
    [14,2,2024,2, 26.3, 22.9, 31.5, 20.2, 30.7],
    [15,2,2024,3, 26.9, 23.5, 32.1, 20.8, 31.4],
    [16,2,2024,4, 27.5, 26.4, 31.2, 22.8, 29.6],
  ];
  tri2.forEach(r => db.run(`INSERT INTO tri_historial VALUES (${r.join(',')})`));

  const acuerdos2 = [
    [6,2,'Rehabilitación Red Vial Principal','Ministerio de Obras Públicas','Infraestructura','activo','2024-10-01','2026-03-30',52.0,null],
    [7,2,'Programa Ganadería Sostenible','Agencia de Desarrollo Agropecuario','Productivo','activo','2025-01-01','2026-06-30',28.0,null],
    [8,2,'Fondo de Inversión Municipal','Ministerio de Hacienda','Fiscal','en_riesgo','2025-01-15','2025-10-30',19.0,'DESEMBOLSO PENDIENTE'],
    [9,2,'Escuela de Campo para Productores','Organismo Internacional de Alimentación','Formación','activo','2025-04-01','2026-01-31',41.0,null],
  ];
  acuerdos2.forEach(r => db.run(`INSERT INTO acuerdos_govsync VALUES (${r.map(v=>v===null?'NULL':typeof v==='string'?`'${v}'`:v).join(',')})`));

  const conoc2 = [
    [7,2,'diagnóstico','Estudio Potencial Ganadero Regional 2022','Instituto Interamericano de Cooperación Agrícola','2024-11-08',0.89,'ganadería,potencial,región'],
    [8,2,'lección','Proyecto forestal 2019 sin mercado destino: pérdida total','Centro Nacional de Tecnología Agropecuaria','2023-03-15',0.86,'forestal,mercado,planificación'],
    [9,2,'actor','Cooperativa Regional de Productores — 180 socios','Registro de Cooperativas','2025-07-22',0.82,'cooperativa,ganadería,organización'],
    [10,2,'tendencia','Aislamiento vial frena inversión privada: 3 proyectos retirados','Centro de Estudios Económicos','2026-01-18',0.94,'infraestructura,inversión,vialidad'],
    [11,2,'oportunidad','Corredor logístico binacional: 40km de brecha crítica','Secretaría de Integración Económica Regional','2025-09-05',0.96,'logística,binacional,regional'],
    [12,2,'metodología','Plan de Ordenamiento Territorial en elaboración','Alcaldía Municipal','2025-10-10',0.77,'OT,planificación,municipio'],
  ];
  conoc2.forEach(r => db.run(`INSERT INTO conocimiento VALUES (${r.map(v=>typeof v==='string'?`'${v}'`:v).join(',')})`));

  // ── CALIBRACIÓN TRI (tabla de persistencia) ──
  db.run(`
    CREATE TABLE IF NOT EXISTS calibracion_tri (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      territorio_id INTEGER NOT NULL UNIQUE,
      respuestas_json TEXT NOT NULL,
      ajustes_json TEXT,
      fecha_actualizacion TEXT,
      FOREIGN KEY (territorio_id) REFERENCES territorio(id)
    );
  `);
};
