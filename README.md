# SOTI v2.0 — Sistema Operativo Territorial Inteligente
## Demo Institucional · Oleada 2

**Bifurcación Municipal / Institucional · Módulo Estado de Madurez del Sistema**

Rafael Vladimir Velásquez Guevara  
Ex Director General FONDEPRO · Coordinador ONUDI El Salvador

---

## Requisitos

- **Node.js** ≥ 18 (recomendado: v20 LTS)
- **npm** ≥ 9

```bash
node -v   # debe mostrar v18.x, v20.x o superior
npm -v    # debe mostrar 9.x o superior
```

---

## Instalación en 3 pasos

```bash
# 1. Descomprimir y entrar a la carpeta
unzip soti-v2.0-oleada2.zip
cd soti-v2.0

# 2. Instalar dependencias
npm install

# 3. Iniciar el sistema
npm run dev
```

Abrir en el navegador → **http://localhost:5173**

El sistema levanta simultáneamente:
- Backend Express + SQLite → `http://localhost:3001`
- Frontend Vite (React)    → `http://localhost:5173`

---

## Credenciales de acceso

| Usuario    | Contraseña  | Perfil        |
|------------|-------------|---------------|
| demo.soti  | demo2026*   | Observador    |
| admin.soti | soti2026*   | Administrador |

---

## Flujo de uso (Oleada 2)

```
Login → Selector de Modo → Dashboard
           ↓           ↓
     Vista Municipal  Vista Institucional
     (flujo estándar)  (+ badge piloto + Estado del Sistema)
```

El **Selector de Modo** aparece post-login. Puede cambiarse en cualquier momento desde el botón ⇄ CAMBIAR MODO en el menú lateral.

---

## Modos de operación

### Modo A — Vista Municipal
- Para alcaldes, técnicos municipales y equipos de gobernanza local
- Flujo estándar sin módulos de evaluación institucional
- Badge: ninguno

### Modo B — Vista Institucional
- Para BID, CEPAL, Banco Mundial, gobiernos nacionales
- Badge en header: `PILOTO EL SALVADOR · VALIDACIÓN 2026`
- Acceso adicional: **◫ ESTADO DEL SISTEMA** en el menú lateral
  - Tabla de 11 componentes con nivel de madurez (Piloto Validado / En Desarrollo / Proyectado v2.0)
  - Nota metodológica institucional

---

## Módulos disponibles

| Módulo | Ruta | Descripción |
|--------|------|-------------|
| Panel Central | `/` | Dashboard TRI, PTI, indicadores |
| Capacidades TRI | `/capacity` | Radar dimensional + overlay PTI |
| Consultor IA | `/gpt` | TerritoryGPT contextualizado por territorio |
| Articulación Interinstitucional | `/govsync` | Acuerdos y seguimiento |
| Seguimiento Transformación | `/tracker` | Trayectoria histórica TRI |
| Motor de Aprendizaje | `/learning` | Base de conocimiento territorial |
| Comparador | `/comparar` | Análisis San Marcos vs Sensuntepeque |
| Documentos | `/documentos` | Ingesta + BPF (12 preguntas) |
| Calibración TRI | `/calibracion` | Ajuste metodológico con persistencia |
| Modo Presentación | `/presentacion` | 8 slides ejecutivos |
| Verificación Demo | `/verificacion` | Checklist pre-presentación |
| Estado del Sistema | `/estado-sistema` | Solo modo institucional |

---

## Territorios piloto

| # | Nombre | Depto | TRI | PTI | Población |
|---|--------|-------|-----|-----|-----------|
| 1 | San Marcos del Valle | Región Occidental | 35.0 | 42.3 | 18,420 hab. |
| 2 | Mun. de Sensuntepeque | Región Central | 27.5 | 51.8 | 24,150 hab. |

---

## Operación sin conexión

SOTI funciona completamente offline:
- Base SQLite en memoria (seed automático)
- TerritoryGPT en modo demo (respuestas predefinidas)
- Todos los módulos activos sin API externa

Para IA real (TerritoryGPT con Claude):
```bash
ANTHROPIC_API_KEY=tu_clave npm run dev
```

---

## Verificar que el sistema está corriendo

```bash
curl http://localhost:3001/api/health
```

Respuesta esperada:
```json
{ "status": "ok", "territorios": 2, "indicadores": 24, "tri_records": 16 }
```

---

## Solución de problemas

**Puerto en uso:**
```bash
# macOS / Linux
lsof -ti:3001 | xargs kill -9
lsof -ti:5173 | xargs kill -9
npm run dev

# Windows (PowerShell)
netstat -ano | findstr :3001
taskkill /PID <numero> /F
```

**node_modules corruptos:**
```bash
rm -rf node_modules package-lock.json
npm install
```

**Node.js versión incorrecta (con nvm):**
```bash
nvm use    # usa la versión de .nvmrc (v20)
npm run dev
```

---

## Historial de versiones

| Versión | Descripción |
|---------|-------------|
| v2.0 Oleada 2 | Selector de Modo Municipal/Institucional · Badge piloto · EstadoSistema · Fix seed.js |
| v1.4 Oleada 1 | Radar PTI overlay · Calibración TRI · Indicador REM |
| v1.3 | Build inicial con 2 territorios piloto |

---

*SOTI v2.0 · Junio 2026 · Rafael Velásquez*
