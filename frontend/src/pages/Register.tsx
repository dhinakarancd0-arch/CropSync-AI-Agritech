import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  Sprout,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Building2,
  ShoppingBag,
  Users,
  Eye,
  EyeOff,
} from 'lucide-react';
import toast from 'react-hot-toast';

type RoleType = 'FARMER' | 'FPO' | 'BUYER' | 'CONSUMER';

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

const inputError: React.CSSProperties = { borderColor: C.error };

const labelStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  color: C.text,
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
  display: 'block',
  marginBottom: 6,
};

/* Focus helpers */
const onFocus = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
  e.currentTarget.style.borderColor = C.green;
  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(5,150,105,0.1)';
};
const onBlur = (hasError: boolean) => (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
  e.currentTarget.style.borderColor = hasError ? C.error : C.border;
  e.currentTarget.style.boxShadow = 'none';
};

export default function Register() {
  const [searchParams] = useSearchParams();
  const initialRoleParam = (searchParams.get('role') || '').toUpperCase();
  const initialRole: RoleType =
    initialRoleParam === 'BUYER' || initialRoleParam === 'FPO' || initialRoleParam === 'CONSUMER'
      ? (initialRoleParam as RoleType)
      : 'FARMER';

  const [role, setRole] = useState<RoleType>(initialRole);
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    full_name: '', email: '', phone: '', password: '', location: '',
    farm_name: '', farm_size_acres: '',
    business_name: '', business_type: '',
    fpo_name: '', registration_number: '', member_count: '',
    address: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const { register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (initialRoleParam && ['FARMER', 'FPO', 'BUYER', 'CONSUMER'].includes(initialRoleParam)) {
      setRole(initialRoleParam as RoleType);
    }
  }, [initialRoleParam]);

  const update = (field: string, val: string) => {
    setForm((prev) => ({ ...prev, [field]: val }));
    if (errors[field]) {
      setErrors((prev) => { const next = { ...prev }; delete next[field]; return next; });
    }
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.full_name.trim()) {
      errs.full_name = role === 'FPO' || role === 'BUYER' ? 'Contact person name is required' : 'Full legal name is required';
    } else if (form.full_name.trim().length < 2) {
      errs.full_name = 'Name must be at least 2 characters';
    }
    if (!form.email.trim()) {
      errs.email = 'Email address is required';
    } else if (!form.email.includes('@') || !form.email.includes('.')) {
      errs.email = 'Please enter a valid email address';
    }
    if (!form.phone.trim()) {
      errs.phone = 'Phone number is required';
    } else if (form.phone.trim().length < 10) {
      errs.phone = 'Enter a valid 10-digit phone number';
    }
    if (!form.password) {
      errs.password = 'Password is required';
    } else if (form.password.length < 6) {
      errs.password = 'Password must be at least 6 characters';
    }
    if (!form.location.trim()) {
      errs.location = role === 'CONSUMER' ? 'Delivery city/location is required' : 'Primary region / state is required';
    }
    if (role === 'BUYER' && !form.business_name.trim()) {
      errs.business_name = 'Business / company name is required';
    }
    if (role === 'FPO' && !form.fpo_name.trim()) {
      errs.fpo_name = 'Organization name is required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const payload: Record<string, any> = {
        full_name: form.full_name.trim(), email: form.email.trim(),
        phone: form.phone.trim(), password: form.password,
        role: role, location: form.location.trim(),
      };
      if (role === 'FARMER') {
        payload.farm_name = form.farm_name.trim() || undefined;
        payload.farm_size_acres = form.farm_size_acres ? parseFloat(form.farm_size_acres) : undefined;
      } else if (role === 'FPO') {
        payload.fpo_name = form.fpo_name.trim() || form.full_name.trim();
        payload.registration_number = form.registration_number.trim() || undefined;
        payload.member_count = form.member_count ? parseInt(form.member_count, 10) : undefined;
      } else if (role === 'BUYER') {
        payload.business_name = form.business_name.trim();
        payload.business_type = form.business_type.trim() || 'Supermarket / Retail Chain';
      } else if (role === 'CONSUMER') {
        payload.address = form.address.trim() || form.location.trim();
      }

      await register(payload);
      toast.success('Account created successfully! Welcome to AgriDirect.');
      navigate('/');
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Registration failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  const getButtonText = () => {
    switch (role) {
      case 'FARMER': return 'Create Farmer Account';
      case 'FPO': return 'Create FPO Account';
      case 'BUYER': return 'Create Buyer Account';
      case 'CONSUMER': return 'Create Consumer Account';
    }
  };

  /* ──────── Role card helper ──────── */
  const roles: { key: RoleType; label: string; sub: string; icon: React.ReactNode }[] = [
    { key: 'FARMER', label: 'Farmer', sub: 'Sell produce', icon: <Sprout size={16} /> },
    { key: 'FPO', label: 'FPO', sub: 'Aggregate & sell', icon: <Users size={16} /> },
    { key: 'BUYER', label: 'Bulk Buyer', sub: 'Source direct', icon: <Building2 size={16} /> },
    { key: 'CONSUMER', label: 'Consumer', sub: 'Buy fresh', icon: <ShoppingBag size={16} /> },
  ];

  /* ──────── Field renderer ──────── */
  const Field = ({ id, label, type = 'text', field, placeholder, required, half }: {
    id: string; label: string; type?: string; field: string; placeholder: string; required?: boolean; half?: boolean;
  }) => (
    <div style={{ flex: half ? '1 1 0' : '1 1 100%', minWidth: half ? 0 : '100%' }}>
      <label htmlFor={id} style={labelStyle}>{label}{required ? ' *' : ''}</label>
      <input
        id={id}
        type={type}
        value={(form as any)[field]}
        onChange={(e) => update(field, e.target.value)}
        style={{ ...inputBase, ...(errors[field] ? inputError : {}) }}
        onFocus={onFocus}
        onBlur={onBlur(!!errors[field])}
        placeholder={placeholder}
        autoComplete={type === 'email' ? 'email' : type === 'tel' ? 'tel' : type === 'password' ? 'new-password' : 'off'}
        min={type === 'number' ? '0' : undefined}
        step={type === 'number' && field === 'farm_size_acres' ? '0.5' : undefined}
      />
      {errors[field] && <p style={{ fontSize: 12, color: C.error, marginTop: 4, fontWeight: 500 }}>{errors[field]}</p>}
    </div>
  );

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
          src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1600&q=85"
          alt="Agricultural field at sunrise"
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
            Grow your market,<br />
            <span style={{ color: '#6ee7b7' }}>not your dependency.</span>
          </h1>
          <p style={{ fontSize: 14, color: '#cbd5e1', lineHeight: 1.6, maxWidth: 380 }}>
            Connect producers, buyers and consumers through a transparent digital marketplace.
          </p>
        </div>

        {/* Bottom trust */}
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
        padding: '40px 48px', overflowY: 'auto', background: C.bg,
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
            Create your AgriDirect account
          </h2>
          <p style={{ fontSize: 15, color: C.textLight, margin: '0 0 24px' }}>
            Choose how you participate in the farm-to-market ecosystem.
          </p>

          {/* Role selector — 4 columns */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 24 }} className="role-grid">
            {roles.map((r) => {
              const sel = role === r.key;
              return (
                <button
                  key={r.key}
                  type="button"
                  onClick={() => setRole(r.key)}
                  className="role-card"
                  style={{
                    height: 64, padding: '0 12px', borderRadius: 9,
                    border: `1.5px solid ${sel ? C.green : C.border}`,
                    background: sel ? C.greenLight : C.white,
                    display: 'flex', alignItems: 'center', gap: 10,
                    cursor: 'pointer', transition: 'border-color 0.15s, background 0.15s',
                    textAlign: 'left', position: 'relative',
                  }}
                >
                  <div style={{
                    width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                    background: sel ? C.green : '#f1f5f9',
                    color: sel ? '#fff' : C.textLight,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'background 0.15s, color 0.15s',
                  }}>
                    {r.icon}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: sel ? C.navy : C.text, lineHeight: 1.2 }}>{r.label}</p>
                    <p style={{ fontSize: 10, color: C.textMuted, marginTop: 2 }}>{r.sub}</p>
                  </div>
                  {sel && <span style={{ position: 'absolute', top: 6, right: 6, width: 7, height: 7, borderRadius: '50%', background: C.green }} />}
                </button>
              );
            })}
          </div>

          {/* Registration form */}
          <form onSubmit={handleSubmit} noValidate>
            {/* Row 1: Name + Phone */}
            <div style={{ display: 'flex', gap: 14, marginBottom: 16 }} className="form-row">
              <Field id="reg-name" label={role === 'FPO' || role === 'BUYER' ? 'Contact Person' : 'Full Legal Name'} field="full_name" placeholder={role === 'FARMER' ? 'e.g. K. Ramasamy' : 'e.g. Rajesh Kumar'} required half />
              <Field id="reg-phone" label="Phone Number" type="tel" field="phone" placeholder="+91 98765 43210" required half />
            </div>

            {/* Row 2: Email + Password */}
            <div style={{ display: 'flex', gap: 14, marginBottom: 16 }} className="form-row">
              <Field id="reg-email" label="Email Address" type="email" field="email" placeholder="you@domain.com" required half />

              {/* Password with eye toggle — inline instead of Field component */}
              <div style={{ flex: '1 1 0', minWidth: 0 }}>
                <label htmlFor="reg-password" style={labelStyle}>Password *</label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="reg-password"
                    type={showPass ? 'text' : 'password'}
                    value={form.password}
                    onChange={(e) => update('password', e.target.value)}
                    style={{ ...inputBase, paddingRight: 42, ...(errors.password ? inputError : {}) }}
                    onFocus={onFocus}
                    onBlur={onBlur(!!errors.password)}
                    placeholder="••••••••••••"
                    autoComplete="new-password"
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
            </div>

            {/* Row 3: Location (full width) */}
            <div style={{ marginBottom: 16 }}>
              <Field id="reg-location" label={role === 'CONSUMER' ? 'Delivery City / Location' : 'Primary Region / State'} field="location" placeholder="e.g. Coimbatore, Tamil Nadu" required />
            </div>

            {/* Role-specific fields */}
            {role === 'FARMER' && (
              <div style={{ display: 'flex', gap: 14, marginBottom: 16 }} className="form-row">
                <Field id="reg-farm" label="Farm / Cooperative Name" field="farm_name" placeholder="e.g. Green Acres Organic" half />
                <Field id="reg-acres" label="Acreage / Farm Size (Acres)" type="number" field="farm_size_acres" placeholder="e.g. 12.5" half />
              </div>
            )}

            {role === 'FPO' && (
              <>
                <div style={{ display: 'flex', gap: 14, marginBottom: 16 }} className="form-row">
                  <Field id="reg-fpo-name" label="Organization Name" field="fpo_name" placeholder="e.g. Anamalai Growers FPO Ltd." required half />
                  <Field id="reg-cin" label="Registration / CIN Number" field="registration_number" placeholder="e.g. U01100TZ2021PTC03412" half />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <Field id="reg-members" label="Number of Associated Farmers" type="number" field="member_count" placeholder="e.g. 250" />
                </div>
              </>
            )}

            {role === 'BUYER' && (
              <div style={{ display: 'flex', gap: 14, marginBottom: 16 }} className="form-row">
                <Field id="reg-biz" label="Business / Company Name" field="business_name" placeholder="e.g. FreshMart Hypermarket" required half />
                <div style={{ flex: '1 1 0', minWidth: 0 }}>
                  <label htmlFor="reg-biz-type" style={labelStyle}>Procurement Category</label>
                  <select
                    id="reg-biz-type"
                    value={form.business_type}
                    onChange={(e) => update('business_type', e.target.value)}
                    style={{ ...inputBase, cursor: 'pointer', appearance: 'auto' as any }}
                    onFocus={onFocus as any}
                    onBlur={onBlur(false) as any}
                  >
                    <option value="Supermarket / Retail Chain">Supermarket / Retail Chain</option>
                    <option value="Wholesale Distributor">Wholesale Distributor</option>
                    <option value="Food Processing Entity">Food Processing Entity</option>
                    <option value="Agricultural Exporter">Agricultural Exporter</option>
                    <option value="HoReCa (Hotel/Restaurant/Catering)">HoReCa (Hotel / Restaurant)</option>
                  </select>
                </div>
              </div>
            )}

            {role === 'CONSUMER' && (
              <div style={{ marginBottom: 16 }}>
                <Field id="reg-address" label="Delivery Street Address" field="address" placeholder="e.g. 42, Green Park Avenue, RS Puram" />
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="auth-btn"
              style={{
                width: '100%', height: 48, borderRadius: 8, background: C.green, color: '#fff',
                fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                transition: 'background 0.15s', opacity: loading ? 0.6 : 1, marginTop: 4,
              }}
            >
              {loading ? 'Creating Account...' : <><span>{getButtonText()}</span> <ArrowRight size={15} /></>}
            </button>
          </form>

          {/* Sign-in link */}
          <div style={{ textAlign: 'center', marginTop: 14, fontSize: 13, color: C.textLight }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: C.green, fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
          </div>
        </div>
      </div>

      {/* Responsive styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        .auth-btn:hover:not(:disabled) { background: #047857 !important; }
        .role-card:hover { border-color: #a7f3d0 !important; }

        @media (max-width: 1024px) {
          .auth-left { display: none !important; }
          .auth-right { width: 100% !important; padding: 32px 20px !important; }
          .auth-mobile-logo { display: flex !important; }
          .role-grid { grid-template-columns: 1fr 1fr !important; }
        }

        @media (max-width: 640px) {
          .form-row { flex-direction: column !important; gap: 16px !important; }
          .role-grid { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
    </div>
  );
}
