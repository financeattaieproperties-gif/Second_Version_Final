import { useState, type FormEvent } from 'react';
import { ShieldCheck, Globe, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AttaieLogoEntrance } from '../components/AttaieLogoEntrance';

const S = {
  page:  { minHeight: '100vh', display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', background: '#F7F8FA', padding: '1.5rem', fontFamily: 'system-ui, -apple-system, sans-serif' } as const,
  brand: { display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: 8, marginBottom: '1.5rem' } as const,
  brandCaption: { fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase' as const, color: '#64748B', fontWeight: 600 } as const,
  card:  { background: '#FFFFFF', borderRadius: 12, padding: '2.25rem', width: '100%', maxWidth: 400, boxShadow: '0 4px 20px rgba(15,23,42,.04)', border: '1px solid #E2E8F0' } as const,
  iconBox: { width: 48, height: 48, borderRadius: 10, background: '#F1F5F9', color: '#0F172A', display: 'grid', placeItems: 'center', marginBottom: '1.25rem' } as const,
  eyebrow: { fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', color: '#0F172A', marginBottom: 6, textTransform: 'uppercase' as const } as const,
  title: { fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.4rem', color: '#0F172A', letterSpacing: '-0.02em' } as const,
  sub:   { fontSize: '0.82rem', color: '#64748B', marginBottom: '1.25rem', lineHeight: 1.5 } as const,
  roleBox: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: '8px 12px', marginBottom: '1.25rem', borderRadius: 6, background: '#F8FAFC', border: '1px solid #E2E8F0', fontSize: 11, color: '#334155', fontVariantNumeric: 'tabular-nums' } as const,
  codeBadge: { fontSize: 11, fontWeight: 600, color: '#0F172A', background: '#FFFFFF', padding: '2px 6px', borderRadius: 4, border: '1px solid #E2E8F0' } as const,
  label: { display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#0F172A', marginBottom: '0.35rem' } as const,
  input: { width: '100%', padding: '0.65rem 0.85rem', border: '1px solid #E2E8F0', borderRadius: 7, fontSize: '0.88rem', outline: 'none', marginBottom: '1rem', background: '#F7F8FA', color: '#0F172A', boxSizing: 'border-box' as const } as const,
  passwordWrap: { position: 'relative' as const, display: 'flex', alignItems: 'center', width: '100%', marginBottom: '1rem' } as const,
  passwordInput: { width: '100%', padding: '0.65rem 2.5rem 0.65rem 0.85rem', border: '1px solid #E2E8F0', borderRadius: 7, fontSize: '0.88rem', outline: 'none', background: '#F7F8FA', color: '#0F172A', boxSizing: 'border-box' as const } as const,
  passwordToggle: { position: 'absolute' as const, insetInlineEnd: 6, top: '50%', transform: 'translateY(-50%)', width: 30, height: 30, borderRadius: 6, border: 'none', background: 'transparent', color: '#64748B', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0 } as const,
  btn:   { width: '100%', padding: '0.75rem', background: '#0F172A', border: '1px solid #0F172A', borderRadius: 8, color: '#FFFFFF', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', marginTop: '0.25rem' } as const,
  divider: { display: 'flex', alignItems: 'center', gap: 10, margin: '1.1rem 0', fontSize: 11, color: '#64748B', fontWeight: 500 } as const,
  dividerLine: { flex: 1, height: 1, background: '#E2E8F0' } as const,
  googleBtn: { width: '100%', padding: '0.68rem 0.9rem', background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: 8, color: '#0F172A', fontWeight: 600, fontSize: '0.84rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 } as const,
  err:   { background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA', padding: '0.65rem 1rem', borderRadius: 6, marginBottom: '1rem', fontSize: '0.82rem' } as const,
  privateNote: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: '1.35rem', fontSize: 10, color: '#64748B' } as const,
  footer: { marginTop: '1.5rem', fontSize: 11, color: '#64748B' } as const,
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
  const [u, setU]       = useState('');
  const [p, setP]       = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [err, setErr]   = useState('');
  const [busy, setBusy] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);

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
        <AttaieLogoEntrance mode="header" variant="navy" />
        <span style={S.brandCaption}>Website Admin CRM</span>
      </div>
      <div style={S.card}>
        <div style={S.iconBox}>
          <Globe size={22} />
        </div>
        <div style={S.eyebrow}>ATTAIE WEBSITE ADMIN</div>
        <h1 style={S.title}>Website Admin CRM</h1>
        <p style={S.sub}>Sign in to manage public listings, projects, submissions, live chat, and SEO.</p>
        <div style={S.roleBox}>
          <span><strong>Role:</strong> Website Administrator</span>
          <code style={S.codeBadge}>/admin</code>
        </div>
        {err && <div style={S.err}>{err}</div>}
        <form onSubmit={submit}>
          <label htmlFor="admin-login-username" style={S.label}>Username</label>
          <input id="admin-login-username" style={S.input} value={u} onChange={e => setU(e.target.value)} autoComplete="username" required />
          <label htmlFor="admin-login-password" style={S.label}>Password</label>
          <div style={S.passwordWrap}>
            <input
              id="admin-login-password"
              style={S.passwordInput}
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
          <button style={S.btn} disabled={busy || googleBusy}>{busy ? 'Signing in…' : 'Sign in →'}</button>
        </form>
        <div style={S.divider}>
          <span style={S.dividerLine} />
          <span>or</span>
          <span style={S.dividerLine} />
        </div>
        <button
          type="button"
          data-testid="admin-google-signin-btn"
          style={S.googleBtn}
          disabled={busy || googleBusy}
          onClick={handleGoogleSignIn}
        >
          <GoogleMark />
          <span>{googleBusy ? 'Connecting Google…' : 'Continue with Google'}</span>
        </button>
        <div style={S.privateNote}>
          <ShieldCheck size={13} />
          <span>Private, authorized staff access only · Fixed Role Workspace</span>
        </div>
      </div>
      <footer style={S.footer}>Attaie Properties · Kabul, Afghanistan</footer>
    </div>
  );
}
