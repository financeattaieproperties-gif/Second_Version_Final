import { useState, type FormEvent } from 'react';
import { ShieldCheck, Eye, EyeOff, Mail, Lock, Globe } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getAdminServerUrl, isDesktopClient, setAdminServerUrl } from '../api';

const S = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    background: 'radial-gradient(circle at 50% 25%, #0A1F5C 0%, #020E3A 50%, #010826 100%)',
    padding: '1.5rem',
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    color: '#FFFFFF',
    position: 'relative' as const,
    boxSizing: 'border-box' as const,
  } as const,
  brand: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: 8,
    marginBottom: '1.5rem',
  } as const,
  brandCaption: {
    fontSize: 10,
    letterSpacing: '0.22em',
    textTransform: 'uppercase' as const,
    color: '#94A3B8',
    fontWeight: 600,
  } as const,
  card: {
    background: 'rgba(10, 20, 48, 0.78)',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    borderRadius: 22,
    padding: '2.5rem 2.25rem',
    width: '100%',
    maxWidth: 420,
    boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.75), inset 0 1px 1px rgba(255, 255, 255, 0.15)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    boxSizing: 'border-box' as const,
  } as const,
  avatarBadge: {
    width: 52,
    height: 52,
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.08)',
    border: '1px solid rgba(255, 255, 255, 0.18)',
    color: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 1.25rem',
    fontWeight: 700,
    fontSize: '1.25rem',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.35)',
    letterSpacing: '-0.02em',
  } as const,
  title: {
    fontSize: '1.65rem',
    fontWeight: 700,
    marginBottom: '0.35rem',
    color: '#FFFFFF',
    letterSpacing: '-0.025em',
    textAlign: 'center' as const,
  } as const,
  sub: {
    fontSize: '0.84rem',
    color: '#94A3B8',
    marginBottom: '1.35rem',
    lineHeight: 1.5,
    textAlign: 'center' as const,
  } as const,
  roleBox: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    padding: '8px 12px',
    marginBottom: '1.25rem',
    borderRadius: 8,
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    fontSize: 11,
    color: '#CBD5E1',
    fontVariantNumeric: 'tabular-nums',
  } as const,
  codeBadge: {
    fontSize: 11,
    fontWeight: 600,
    color: '#FFFFFF',
    background: 'rgba(255, 255, 255, 0.1)',
    padding: '2px 7px',
    borderRadius: 4,
    border: '1px solid rgba(255, 255, 255, 0.15)',
  } as const,
  inputWrap: {
    position: 'relative' as const,
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    marginBottom: '0.9rem',
  } as const,
  inputIcon: {
    position: 'absolute' as const,
    insetInlineStart: 14,
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#94A3B8',
    pointerEvents: 'none' as const,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  } as const,
  input: {
    width: '100%',
    padding: '0.82rem 1rem 0.82rem 2.75rem',
    border: '1px solid rgba(255, 255, 255, 0.14)',
    borderRadius: 12,
    fontSize: '0.9rem',
    outline: 'none',
    background: 'rgba(255, 255, 255, 0.07)',
    color: '#FFFFFF',
    boxSizing: 'border-box' as const,
    transition: 'border-color 0.2s, box-shadow 0.2s',
  } as const,
  passwordInput: {
    width: '100%',
    padding: '0.82rem 2.75rem 0.82rem 2.75rem',
    border: '1px solid rgba(255, 255, 255, 0.14)',
    borderRadius: 12,
    fontSize: '0.9rem',
    outline: 'none',
    background: 'rgba(255, 255, 255, 0.07)',
    color: '#FFFFFF',
    boxSizing: 'border-box' as const,
    transition: 'border-color 0.2s, box-shadow 0.2s',
  } as const,
  passwordToggle: {
    position: 'absolute' as const,
    insetInlineEnd: 10,
    top: '50%',
    transform: 'translateY(-50%)',
    width: 32,
    height: 32,
    borderRadius: 8,
    border: 'none',
    background: 'transparent',
    color: '#94A3B8',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    padding: 0,
  } as const,
  utilRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    margin: '0.2rem 0 1.25rem',
    fontSize: '0.82rem',
    color: '#94A3B8',
  } as const,
  rememberLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: 7,
    cursor: 'pointer',
    userSelect: 'none' as const,
    color: '#CBD5E1',
  } as const,
  checkbox: {
    accentColor: '#0145F2',
    width: 15,
    height: 15,
    borderRadius: 4,
    cursor: 'pointer',
  } as const,
  forgotBtn: {
    background: 'none',
    border: 'none',
    color: '#94A3B8',
    fontSize: '0.82rem',
    cursor: 'pointer',
    padding: 0,
    textDecoration: 'none',
  } as const,
  notice: {
    background: 'rgba(1, 69, 242, 0.15)',
    color: '#93C5FD',
    border: '1px solid rgba(1, 69, 242, 0.3)',
    padding: '0.65rem 0.85rem',
    borderRadius: 8,
    marginBottom: '1rem',
    fontSize: '0.78rem',
    lineHeight: 1.4,
  } as const,
  btn: {
    width: '100%',
    padding: '0.82rem 1rem',
    background: '#FFFFFF',
    border: 'none',
    borderRadius: 12,
    color: '#020E3A',
    fontWeight: 700,
    fontSize: '0.92rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.35)',
    transition: 'background-color 0.15s, transform 0.1s',
  } as const,
  divider: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    margin: '1.25rem 0',
    fontSize: 12,
    color: '#64748B',
    fontWeight: 500,
  } as const,
  dividerLine: {
    flex: 1,
    height: 1,
    background: 'rgba(255, 255, 255, 0.12)',
  } as const,
  googleBtn: {
    width: '100%',
    padding: '0.78rem 1rem',
    background: 'rgba(255, 255, 255, 0.06)',
    border: '1px solid rgba(255, 255, 255, 0.14)',
    borderRadius: 12,
    color: '#FFFFFF',
    fontWeight: 600,
    fontSize: '0.88rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    transition: 'background-color 0.15s',
  } as const,
  err: {
    background: 'rgba(239, 68, 68, 0.15)',
    color: '#FCA5A5',
    border: '1px solid rgba(239, 68, 68, 0.35)',
    padding: '0.65rem 1rem',
    borderRadius: 10,
    marginBottom: '1rem',
    fontSize: '0.82rem',
    textAlign: 'center' as const,
  } as const,
  accountRow: {
    marginTop: '1.25rem',
    textAlign: 'center' as const,
    fontSize: '0.82rem',
    color: '#94A3B8',
  } as const,
  accountLink: {
    color: '#FFFFFF',
    fontWeight: 600,
    textDecoration: 'none',
    cursor: 'pointer',
    background: 'none',
    border: 'none',
    padding: 0,
    marginLeft: 6,
  } as const,
  privateNote: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: '1.15rem',
    fontSize: 11,
    color: '#64748B',
  } as const,
  footer: {
    marginTop: '1.75rem',
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center' as const,
  } as const,
};

function GoogleMark() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

export default function Login() {
  const { login, loginWithGoogle } = useAuth();
  const desktopMode = isDesktopClient();
  const [serverUrl, setServerUrl] = useState(() => getAdminServerUrl());
  const [editingServer, setEditingServer] = useState(false);
  const [serverDraft, setServerDraft] = useState(() => getAdminServerUrl());
  const [u, setU] = useState('');
  const [p, setP] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [showForgotNotice, setShowForgotNotice] = useState(false);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);

  const saveServer = () => {
    try {
      const normalized = setAdminServerUrl(serverDraft);
      setServerUrl(normalized);
      setServerDraft(normalized);
      setEditingServer(false);
      setErr('');
    } catch (error) {
      setErr(error instanceof Error ? error.message : 'Invalid server URL.');
    }
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr('');
    try {
      sessionStorage.setItem('attaie_admin_play_entrance', '1');
      await login(u, p);
    } catch {
      sessionStorage.removeItem('attaie_admin_play_entrance');
      setErr('Invalid username or password.');
    } finally {
      setBusy(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleBusy(true);
    setErr('');
    try {
      sessionStorage.setItem('attaie_admin_play_entrance', '1');
      await loginWithGoogle();
    } catch (error) {
      sessionStorage.removeItem('attaie_admin_play_entrance');
      const message = error instanceof Error ? error.message : 'Google sign-in failed.';
      setErr(
        message.includes('popup-closed-by-user')
          ? 'Google sign-in popup was closed before completing.'
          : message
      );
    } finally {
      setGoogleBusy(false);
    }
  };

  return (
    <div style={S.page} data-panel-id="admin">
      <div style={S.brand}>
        <img
          src="/login-logo.png"
          alt="Attaie Properties"
          style={{ maxWidth: 260, width: '100%', height: 'auto', display: 'block', margin: '0 auto' }}
        />
        <span style={S.brandCaption}>Website Admin CRM</span>
      </div>
      <div style={S.card}>
        <div style={S.avatarBadge}>
          <span>A</span>
        </div>
        <h1 style={S.title}>Welcome Back</h1>
        <p style={S.sub}>Sign in to continue to Attaie Website Admin</p>

        <div style={S.roleBox}>
          <span><strong>Role:</strong> Website Administrator</span>
          <code style={S.codeBadge}>{desktopMode ? 'Desktop App' : '/admin'}</code>
        </div>

        {desktopMode && (
          <div style={{ marginBottom: '1rem', padding: '8px 10px', borderRadius: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', fontSize: 11, color: '#CBD5E1' }}>
            {!editingServer ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  <Globe size={13} />
                  <span>{serverUrl.replace(/^https?:\/\//, '')}</span>
                </span>
                <button
                  type="button"
                  onClick={() => { setServerDraft(serverUrl); setEditingServer(true); }}
                  style={{ background: 'none', border: 'none', color: '#93C5FD', fontSize: 11, fontWeight: 600, cursor: 'pointer', padding: 0, flexShrink: 0 }}
                >
                  Change Server
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <input
                  type="url"
                  value={serverDraft}
                  onChange={e => setServerDraft(e.target.value)}
                  placeholder="https://attaieproperties.com"
                  style={{ width: '100%', padding: '6px 8px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.25)', color: '#fff', fontSize: 11, boxSizing: 'border-box' }}
                />
                <div style={{ display: 'flex', gap: 6, justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button type="button" onClick={() => setServerDraft('https://attaieproperties.com')} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', color: '#E2E8F0', fontSize: 10, padding: '3px 6px', borderRadius: 4, cursor: 'pointer' }}>Main</button>
                    <button type="button" onClick={() => setServerDraft('https://www.attaieproperties.com')} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', color: '#E2E8F0', fontSize: 10, padding: '3px 6px', borderRadius: 4, cursor: 'pointer' }}>WWW</button>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button type="button" onClick={() => setEditingServer(false)} style={{ background: 'none', border: 'none', color: '#94A3B8', fontSize: 11, cursor: 'pointer' }}>Cancel</button>
                    <button type="button" onClick={saveServer} style={{ background: '#0145F2', border: 'none', color: '#fff', fontSize: 11, fontWeight: 600, padding: '4px 9px', borderRadius: 5, cursor: 'pointer' }}>Save</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {err && <div style={S.err}>{err}</div>}

        <form onSubmit={submit}>
          <div style={S.inputWrap}>
            <span style={S.inputIcon}>
              <Mail size={17} />
            </span>
            <input
              id="admin-login-username"
              style={S.input}
              placeholder="Email address or username"
              value={u}
              onChange={e => setU(e.target.value)}
              autoComplete="username"
              required
            />
          </div>

          <div style={S.inputWrap}>
            <span style={S.inputIcon}>
              <Lock size={17} />
            </span>
            <input
              id="admin-login-password"
              style={S.passwordInput}
              placeholder="Password"
              type={showPassword ? 'text' : 'password'}
              value={p}
              onChange={e => setP(e.target.value)}
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              style={S.passwordToggle}
              onClick={() => setShowPassword(prev => !prev)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              aria-pressed={showPassword}
              title={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <div style={S.utilRow}>
            <label style={S.rememberLabel}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={e => setRememberMe(e.target.checked)}
                style={S.checkbox}
              />
              <span>Remember me</span>
            </label>
            <button
              type="button"
              style={S.forgotBtn}
              onClick={() => setShowForgotNotice(prev => !prev)}
            >
              Forgot password?
            </button>
          </div>

          {showForgotNotice && (
            <div style={S.notice}>
              Please contact Attaie IT Administration (Kabul Head Office) to reset credentials.
            </div>
          )}

          <button style={S.btn} disabled={busy || googleBusy}>
            <span>{busy ? 'Signing in…' : 'Sign In'}</span>
            <span aria-hidden="true">→</span>
          </button>
        </form>

        <div style={S.accountRow}>
          <span>Don't have an account?</span>
          <button
            type="button"
            style={S.accountLink}
            onClick={() => setShowForgotNotice(true)}
          >
            Contact Admin
          </button>
        </div>

        <div style={S.privateNote}>
          <ShieldCheck size={13} />
          <span>Private, authorized staff access only · Fixed Role Workspace</span>
        </div>
      </div>
      <footer style={S.footer}>Attaie Properties · Kabul, Afghanistan</footer>
    </div>
  );
}
