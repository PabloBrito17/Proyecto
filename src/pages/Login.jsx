import { useState } from 'react'

export default function Login({ onLogin }) {
  const [usuario, setUsuario]       = useState('')
  const [contrasena, setContrasena] = useState('')
  const [error, setError]           = useState(null)
  const [loading, setLoading]       = useState(false)

  const intentarAcceso = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario: usuario.trim(), contrasena }),
      })
      const data = await res.json()
      if (data.ok) {
        onLogin(data)
      } else {
        setError(data.error || 'Usuario o contraseña incorrectos')
      }
    } catch {
      setError('No se pudo conectar con el servidor.')
    }
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Fondo decorativo */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse at 50% 40%, rgba(0,196,160,0.06) 0%, transparent 65%)',
      }} />
      <div style={{
        position: 'absolute', top: 80, left: '15%', width: 320, height: 320,
        border: '1px solid rgba(0,196,160,0.06)', borderRadius: '50%', pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: 60, right: '12%', width: 220, height: 220,
        border: '1px solid rgba(0,119,255,0.06)', borderRadius: '50%', pointerEvents: 'none',
      }} />

      {/* Tarjeta de acceso */}
      <div style={{
        width: 400, position: 'relative', zIndex: 10,
        background: 'var(--bg2)',
        border: '1px solid var(--border)',
        borderRadius: 16,
        padding: '44px 40px 40px',
        boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
      }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            fontFamily: 'var(--mono)', fontSize: 28, fontWeight: 700,
            color: 'var(--accent)', letterSpacing: 6, marginBottom: 8,
          }}>◈ SOTI</div>
          <div style={{
            fontSize: 11, color: 'var(--text3)', lineHeight: 1.6, letterSpacing: 0.5,
          }}>
            Sistema Operativo Territorial Inteligente<br />
            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10 }}>
              Acceso restringido a usuarios autorizados
            </span>
          </div>
          <div style={{
            width: 48, height: 1,
            background: 'linear-gradient(90deg, transparent, var(--accent), transparent)',
            margin: '18px auto 0',
          }} />
        </div>

        {/* Formulario */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{
              display: 'block', fontFamily: 'var(--mono)',
              fontSize: 9, letterSpacing: 2, color: 'var(--text3)', marginBottom: 7,
            }}>USUARIO</label>
            <input
              type="text"
              value={usuario}
              onChange={e => { setUsuario(e.target.value); setError(null) }}
              onKeyDown={e => e.key === 'Enter' && intentarAcceso(e)}
              autoComplete="username"
              style={{
                width: '100%', boxSizing: 'border-box',
                background: 'var(--bg3)',
                border: `1px solid ${error ? 'rgba(232,64,64,0.5)' : 'var(--border)'}`,
                borderRadius: 8, padding: '10px 14px',
                color: 'var(--text)', fontSize: 13, outline: 'none',
                fontFamily: 'var(--mono)', letterSpacing: 0.5,
                transition: 'border-color 0.15s',
              }}
              onFocus={e => !error && (e.target.style.borderColor = 'rgba(0,196,160,0.5)')}
              onBlur={e => !error && (e.target.style.borderColor = 'var(--border)')}
            />
          </div>

          <div>
            <label style={{
              display: 'block', fontFamily: 'var(--mono)',
              fontSize: 9, letterSpacing: 2, color: 'var(--text3)', marginBottom: 7,
            }}>CONTRASEÑA</label>
            <input
              type="password"
              value={contrasena}
              onChange={e => { setContrasena(e.target.value); setError(null) }}
              onKeyDown={e => e.key === 'Enter' && intentarAcceso(e)}
              autoComplete="current-password"
              style={{
                width: '100%', boxSizing: 'border-box',
                background: 'var(--bg3)',
                border: `1px solid ${error ? 'rgba(232,64,64,0.5)' : 'var(--border)'}`,
                borderRadius: 8, padding: '10px 14px',
                color: 'var(--text)', fontSize: 13, outline: 'none',
                fontFamily: 'var(--mono)', letterSpacing: 2,
                transition: 'border-color 0.15s',
              }}
              onFocus={e => !error && (e.target.style.borderColor = 'rgba(0,196,160,0.5)')}
              onBlur={e => !error && (e.target.style.borderColor = 'var(--border)')}
            />
          </div>

          {/* Error */}
          {error && (
            <div style={{
              padding: '8px 12px', borderRadius: 6,
              background: 'rgba(232,64,64,0.08)',
              border: '1px solid rgba(232,64,64,0.25)',
              fontSize: 11, color: '#e84040', fontFamily: 'var(--mono)',
              textAlign: 'center',
            }}>
              {error}
            </div>
          )}

          {/* Botón */}
          <button
            onClick={intentarAcceso}
            disabled={loading || !usuario || !contrasena}
            style={{
              marginTop: 4,
              width: '100%', padding: '12px',
              background: loading || !usuario || !contrasena
                ? 'rgba(0,196,160,0.05)'
                : 'rgba(0,196,160,0.15)',
              border: `1px solid ${loading || !usuario || !contrasena
                ? 'rgba(0,196,160,0.15)'
                : 'rgba(0,196,160,0.4)'}`,
              borderRadius: 8,
              color: loading || !usuario || !contrasena ? 'var(--text3)' : 'var(--accent)',
              fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: 2,
              cursor: loading || !usuario || !contrasena ? 'default' : 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {loading ? '⟳ VERIFICANDO...' : 'INGRESAR AL SISTEMA'}
          </button>
        </div>

        {/* Footer */}
        <div style={{ marginTop: 28, textAlign: 'center' }}>
          <div style={{
            fontFamily: 'var(--mono)', fontSize: 9,
            color: 'var(--text3)', letterSpacing: 1,
          }}>
            v2.0 · DEMO PILOT · © Rafael Velásquez
          </div>
        </div>
      </div>
    </div>
  )
}
