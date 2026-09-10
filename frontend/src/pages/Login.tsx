import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  Sprout,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Building2,
  ShoppingBag,
  Lock,
} from 'lucide-react';
import toast from 'react-hot-toast';

/* ──────────────────────────────────────────────
   Shared inline-style tokens (matches Landing page)
   ────────────────────────────────────────────── */
const C = {
  green: '#059669',
  greenDark: '#047857',
  greenLight: '#ecfdf5',
  greenBorder: '#a7f3d0',
  navy: '#0f172a',
  text: '#334155',
  textLight: '#64748b',
  textMuted: '#94a3b8',
  border: '#e2e8f0',
  bg: '#f8fafc',
  white: '#fff',
  error: '#dc2626',
  errorBg: '#fef2f2',
};

const inputBase: React.CSSProperties = {
  width: '100%',
  height: 46,
  padding: '0 14px',
  borderRadius: 8,
  border: `1px solid ${C.border}`,
  fontSize: 14,
  color: C.navy,
  background: C.white,
  outline: 'none',
  transition: 'border-color 0.15s, box-shadow 0.15s',
  fontFamily: "'Inter', system-ui, sans-serif",
};

const inputError: React.CSSProperties = {
  borderColor: C.error,
};

const labelStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  color: C.text,
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
};

export default function Login() {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') || '';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const { login } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    const errs: { email?: string; password?: string } = {};
    if (!email.trim()) {
      errs.email = 'Email or AgriDirect ID is required';
    } else if (!email.includes('@') && !email.includes('.demo')) {
      errs.email = 'Please enter a valid email address';
    }
    if (!password) {
      errs.password = 'Password is required';
    } else if (password.length < 6) {
      errs.password = 'Password must be at least 6 characters';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      await login(email.trim(), password);
      toast.success('Welcome back to AgriDirect!');
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const demoLogin = async (role: string) => {
    setLoading(true);
    try {
      await login(`${role}@agridirect.demo`, 'AgriDirect2024!');
      toast.success(`Signed in as demo ${role}`);
    } catch (err: any) {
      toast.error('Demo sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: "'Inter', system-ui, sans-serif", color: C.navy }}>

      {/* ═══════════════════════════════════════
          LEFT IMAGE PANEL — 45%
          ═══════════════════════════════════════ */}
      <div className="auth-left" style={{
        width: '45%', minHeight: '100vh', position: 'relative',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        padding: '40px 44px', overflow: 'hidden', flexShrink: 0,
      }}>
        <img
          src="https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=1600&q=85"
          alt="Lush green agricultural farm in India"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(2,44,34,0.92) 0%, rgba(15,23,42,0.6) 50%, rgba(6,78,59,0.5) 100%)' }} />

        {/* Logo */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(16,185,129,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.navy }}>
              <Sprout size={20} strokeWidth={2.5} />
            </div>
            <div>
              <span style={{ fontSize: 20, fontWeight: 900, color: '#fff', display: 'block', letterSpacing: '-0.02em', lineHeight: 1 }}>AgriDirect</span>
              <span style={{ fontSize: 10, fontWeight: 700, color: '#6ee7b7', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 3, display: 'block' }}>Farm-to-Market Platform</span>
            </div>
          </Link>
        </div>

        {/* Center tagline */}
        <div style={{ position: 'relative', zIndex: 1, margin: 'auto 0' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 20, background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(110,231,183,0.25)', marginBottom: 14 }}>
            <ShieldCheck size={13} color="#6ee7b7" />
            <span style={{ fontSize: 12, fontWeight: 600, color: '#a7f3d0' }}>SIH 26033</span>
          </div>
          <h1 style={{ fontSize: 36, fontWeight: 800, color: '#fff', lineHeight: 1.15, letterSpacing: '-0.02em', margin: '0 0 12px' }}>
            From Farm to Market,<br />
            <span style={{ color: '#6ee7b7' }}>Smarter.</span>
          </h1>
          <p style={{ fontSize: 14, color: '#cbd5e1', lineHeight: 1.6, maxWidth: 380 }}>
            Connect producers, buyers and consumers through a transparent digital marketplace.
          </p>
        </div>

        {/* Bottom trust strip */}
        <div className="auth-left-bottom" style={{ position: 'relative', zIndex: 1, display: 'flex', gap: 24, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          {['Transparent pricing', 'Verified marketplace', 'AI-powered insights'].map((t) => (
            <span key={t} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 500, color: '#e2e8f0' }}>
              <CheckCircle2 size={14} color="#6ee7b7" /> {t}
            </span>
          ))}
        </div>
      </div>

      {/* ═══════════════════════════════════════
          RIGHT FORM PANEL — 55%
          ═══════════════════════════════════════ */}
      <div className="auth-right" style={{
        width: '55%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
        padding: '56px 48px', overflowY: 'auto', background: C.bg,
      }}>
        <div style={{ width: '100%', maxWidth: 500 }}>
          {/* Mobile logo */}
          <div className="auth-mobile-logo" style={{ display: 'none', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: C.green, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
              <Sprout size={16} />
            </div>
            <span style={{ fontSize: 18, fontWeight: 900, color: C.navy }}>AgriDirect</span>
          </div>

          {/* Heading */}
          <h2 style={{ fontSize: 34, fontWeight: 700, color: C.navy, letterSpacing: '-0.02em', lineHeight: 1.15, margin: '0 0 8px' }}>
            Welcome back
          </h2>
          <p style={{ fontSize: 15, color: C.textLight, margin: '0 0 24px' }}>
            Sign in to continue to your marketplace account.
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate>
            {/* Email */}
            <div style={{ marginBottom: 16 }}>
              <label htmlFor="login-email" style={{ ...labelStyle, display: 'block', marginBottom: 6 }}>
                Email / AgriDirect ID
              </label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); if (errors.email) setErrors((p) => ({ ...p, email: undefined })); }}
                style={{ ...inputBase, ...(errors.email ? inputError : {}) }}
                onFocus={(e) => { e.currentTarget.style.borderColor = C.green; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(5,150,105,0.1)'; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = errors.email ? C.error : C.border; e.currentTarget.style.boxShadow = 'none'; }}
                placeholder="e.g. farmer@agridirect.demo"
                autoComplete="email"
              />
              {errors.email && <p style={{ fontSize: 12, color: C.error, marginTop: 4, fontWeight: 500 }}>{errors.email}</p>}
            </div>

            {/* Password */}
            <div style={{ marginBottom: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                <label htmlFor="login-password" style={labelStyle}>Password</label>
                <Link
                  to="/login"
                  onClick={() => toast('Password reset link sent to demo registered email.', { icon: 'ℹ️' })}
                  style={{ fontSize: 12, fontWeight: 600, color: C.green, textDecoration: 'none' }}
                >
                  Forgot password?
                </Link>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  id="login-password"
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); if (errors.password) setErrors((p) => ({ ...p, password: undefined })); }}
                  style={{ ...inputBase, paddingRight: 42, ...(errors.password ? inputError : {}) }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = C.green; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(5,150,105,0.1)'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = errors.password ? C.error : C.border; e.currentTarget.style.boxShadow = 'none'; }}
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: C.textMuted, padding: 4, borderRadius: 4 }}
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p style={{ fontSize: 12, color: C.error, marginTop: 4, fontWeight: 500 }}>{errors.password}</p>}
            </div>

            {/* Remember me */}
            <div style={{ display: 'flex', alignItems: 'center', marginTop: 12, marginBottom: 16 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, fontWeight: 500, color: C.text }}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{ width: 16, height: 16, accentColor: C.green, borderRadius: 4, cursor: 'pointer' }}
                />
                Remember me
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="auth-btn"
              style={{
                width: '100%', height: 48, borderRadius: 8, background: C.green, color: '#fff',
                fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                transition: 'background 0.15s', opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? 'Authenticating...' : <><span>Sign In</span> <ArrowRight size={15} /></>}
            </button>
          </form>

          {/* Registration links */}
          <div style={{ textAlign: 'center', marginTop: 16, fontSize: 13 }}>
            <p style={{ color: C.textLight, marginBottom: 6 }}>Don't have an account?</p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
              <Link to="/register?role=farmer" style={{ color: C.green, fontWeight: 600, textDecoration: 'none' }}>Register as Farmer</Link>
              <span style={{ color: C.border }}>•</span>
              <Link to="/register?role=buyer" style={{ color: C.green, fontWeight: 600, textDecoration: 'none' }}>Register as Buyer</Link>
              <span style={{ color: C.border }}>•</span>
              <Link to="/register?role=consumer" style={{ color: C.green, fontWeight: 600, textDecoration: 'none' }}>Register as Consumer</Link>
            </div>
          </div>

          {/* Quick Demo Access */}
          <div style={{ marginTop: 24, paddingTop: 22, borderTop: `1px solid ${C.border}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: C.textLight, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Quick Demo Access</span>
              <span style={{ fontSize: 10, fontWeight: 700, color: C.green, background: C.greenLight, padding: '2px 8px', borderRadius: 4, border: `1px solid ${C.greenBorder}` }}>1-Click Sign In</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { role: 'farmer', label: 'Farmer', sub: 'Ravi', icon: <Sprout size={15} />, iconBg: '#ecfdf5', iconColor: '#047857' },
                { role: 'buyer', label: 'Buyer', sub: 'FreshMart', icon: <Building2 size={15} />, iconBg: '#eff6ff', iconColor: '#1d4ed8' },
                { role: 'consumer', label: 'Consumer', sub: 'Priya', icon: <ShoppingBag size={15} />, iconBg: '#faf5ff', iconColor: '#7e22ce' },
                { role: 'admin', label: 'Admin', sub: 'Admin Console', icon: <Lock size={14} />, iconBg: '#f1f5f9', iconColor: '#475569' },
              ].map((d) => (
                <button
                  key={d.role}
                  type="button"
                  onClick={() => demoLogin(d.role)}
                  disabled={loading}
                  className="demo-card"
                  style={{
                    height: 52, padding: '0 14px', borderRadius: 8, border: `1px solid ${C.border}`, background: C.white,
                    display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
                    transition: 'border-color 0.15s, box-shadow 0.15s, transform 0.15s',
                    textAlign: 'left',
                  }}
                >
                  <div style={{ width: 30, height: 30, borderRadius: 8, background: d.iconBg, color: d.iconColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {d.icon}
                  </div>
                  <div>
                    <strong style={{ fontSize: 13, fontWeight: 700, color: C.navy, display: 'block', lineHeight: 1.2 }}>{d.label}</strong>
                    <span style={{ fontSize: 11, color: C.textMuted }}>{d.sub}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Responsive styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        .auth-btn:hover:not(:disabled) { background: #047857 !important; }
        .demo-card:hover:not(:disabled) { border-color: #a7f3d0 !important; box-shadow: 0 2px 8px rgba(0,0,0,0.04) !important; transform: translateY(-1px) !important; }

        @media (max-width: 1024px) {
          .auth-left { display: none !important; }
          .auth-right { width: 100% !important; padding: 32px 20px !important; }
          .auth-mobile-logo { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
