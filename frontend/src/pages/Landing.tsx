import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  Sprout,
  ArrowRight,
  TrendingUp,
  Truck,
  Brain,
  CheckCircle2,
  MapPin,
  ShoppingBag,
  Building2,
  RefreshCw,
  Sparkles,
  ArrowDown,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';

/* ──────────────────────────────────────────────
   Master Container — 1200px, consistent padding
   ────────────────────────────────────────────── */
function Container({ children, className = '', style = {} }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={className}
      style={{
        width: '100%',
        maxWidth: 1200,
        marginLeft: 'auto',
        marginRight: 'auto',
        paddingLeft: 24,
        paddingRight: 24,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/* ──────────────────────────────────────────────
   Animate-on-scroll wrapper
   ────────────────────────────────────────────── */
function FadeIn({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(10px)',
        transition: 'opacity 0.35s ease, transform 0.35s ease',
      }}
    >
      {children}
    </div>
  );
}

/* ──────────────────────────────────────────────
   Crop Forecast Data (unchanged)
   ────────────────────────────────────────────── */
const cropData: Record<string, {
  name: string; current: string; forecast: string; growth: string;
  confidence: string; recommendation: string; advisory: string;
  chartData: Array<{ day: string; actual: number | null; forecast: number | null }>;
}> = {
  tomato: {
    name: 'Tomato (Hybrid Grade-A)',
    current: '1,500 kg', forecast: '2,200 kg', growth: '+46%', confidence: '87%',
    recommendation: 'Tomato demand is projected to surge across Coimbatore and Tiruppur retail hubs.',
    advisory: 'Farmers in Pollachi and Kinathukadavu may prepare additional harvest supply to capture early-mandi spot premiums over the next 7 days.',
    chartData: [
      { day: 'Day -10', actual: 1100, forecast: null }, { day: 'Day -8', actual: 1220, forecast: null },
      { day: 'Day -6', actual: 1310, forecast: null }, { day: 'Day -4', actual: 1390, forecast: null },
      { day: 'Day -2', actual: 1470, forecast: null }, { day: 'Today', actual: 1500, forecast: 1500 },
      { day: 'Day +2', actual: null, forecast: 1720 }, { day: 'Day +4', actual: null, forecast: 1940 },
      { day: 'Day +6', actual: null, forecast: 2150 }, { day: 'Day +7', actual: null, forecast: 2200 },
    ],
  },
  onion: {
    name: 'Small Onion (Shallots)',
    current: '2,100 kg', forecast: '2,450 kg', growth: '+16%', confidence: '91%',
    recommendation: 'Steady regional absorption with tightening supply from northern mandis.',
    advisory: 'Hold bulk lots until mid-week auctions as institutional procurement orders from hotel chains are scheduled to open.',
    chartData: [
      { day: 'Day -10', actual: 1800, forecast: null }, { day: 'Day -8', actual: 1920, forecast: null },
      { day: 'Day -6', actual: 1980, forecast: null }, { day: 'Day -4', actual: 2050, forecast: null },
      { day: 'Day -2', actual: 2080, forecast: null }, { day: 'Today', actual: 2100, forecast: 2100 },
      { day: 'Day +2', actual: null, forecast: 2220 }, { day: 'Day +4', actual: null, forecast: 2310 },
      { day: 'Day +6', actual: null, forecast: 2400 }, { day: 'Day +7', actual: null, forecast: 2450 },
    ],
  },
  banana: {
    name: 'Banana (Robusta / G9)',
    current: '3,200 kg', forecast: '4,100 kg', growth: '+28%', confidence: '84%',
    recommendation: 'Festive season demand spike anticipated across supermarket chains.',
    advisory: 'Coordinate multi-farm collection early to fill 5-tonne refrigerated vehicles for direct metro delivery.',
    chartData: [
      { day: 'Day -10', actual: 2600, forecast: null }, { day: 'Day -8', actual: 2750, forecast: null },
      { day: 'Day -6', actual: 2900, forecast: null }, { day: 'Day -4', actual: 3050, forecast: null },
      { day: 'Day -2', actual: 3120, forecast: null }, { day: 'Today', actual: 3200, forecast: 3200 },
      { day: 'Day +2', actual: null, forecast: 3450 }, { day: 'Day +4', actual: null, forecast: 3700 },
      { day: 'Day +6', actual: null, forecast: 3950 }, { day: 'Day +7', actual: null, forecast: 4100 },
    ],
  },
};

/* ──────────────────────────────────────────────
   CSS-in-JS Styles (inline, scoped to this page)
   ────────────────────────────────────────────── */
const S = {
  page: { minHeight: '100vh', background: '#fff', color: '#0f172a', fontFamily: "'Inter', system-ui, -apple-system, sans-serif" } as React.CSSProperties,

  /* HEADER */
  header: { position: 'sticky' as const, top: 0, zIndex: 50, height: 64, background: '#fff', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center' },
  headerInner: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '100%' },
  logo: { display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: '#0f172a' },
  logoIcon: { width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg,#059669,#0d9488)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' },
  logoText: { fontSize: 20, fontWeight: 800, letterSpacing: '-0.02em' },
  logoAccent: { color: '#059669' },
  nav: { display: 'flex', alignItems: 'center', gap: 32, fontSize: 14, fontWeight: 500, color: '#475569' } as React.CSSProperties,
  navLink: { textDecoration: 'none', color: '#475569', transition: 'color 0.15s' },
  headerActions: { display: 'flex', alignItems: 'center', gap: 12 },
  signIn: { fontSize: 14, fontWeight: 600, color: '#334155', textDecoration: 'none', padding: '6px 12px' },
  joinBtn: { fontSize: 14, fontWeight: 600, color: '#fff', background: '#059669', padding: '8px 20px', borderRadius: 10, textDecoration: 'none', border: 'none', transition: 'background 0.15s' },
  dashBtn: { fontSize: 14, fontWeight: 600, color: '#fff', background: '#059669', padding: '8px 20px', borderRadius: 10, textDecoration: 'none' },

  /* SECTION SPACING */
  sectionWhite: { padding: '72px 0', background: '#fff' } as React.CSSProperties,
  sectionLightGreen: { padding: '72px 0', background: '#f0fdf4' } as React.CSSProperties,
  sectionLightGray: { padding: '72px 0', background: '#f8fafc' } as React.CSSProperties,

  /* HEADINGS */
  sectionLabel: { display: 'inline-block', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#059669', marginBottom: 10 },
  sectionTitle: { fontSize: 36, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: 10 },
  sectionDesc: { fontSize: 16, color: '#64748b', lineHeight: 1.6, maxWidth: 600 },

  /* CARDS */
  card: { background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', padding: 24, transition: 'box-shadow 0.2s, transform 0.2s' } as React.CSSProperties,
};

/* ══════════════════════════════════════════════
   LANDING PAGE COMPONENT
   ══════════════════════════════════════════════ */
export default function Landing() {
  const { user } = useAuth();
  const [activeCrop, setActiveCrop] = useState<'tomato' | 'onion' | 'banana'>('tomato');
  const [logisticsOptimized, setLogisticsOptimized] = useState(true);
  const crop = cropData[activeCrop];

  return (
    <div style={S.page}>

      {/* ═══════════════════════════════════════
          1. HEADER — 64px, white, subtle border
          ═══════════════════════════════════════ */}
      <header style={S.header}>
        <Container style={S.headerInner}>
          <Link to="/" style={S.logo}>
            <div style={S.logoIcon}><Sprout size={18} /></div>
            <span style={S.logoText}>Agri<span style={S.logoAccent}>Direct</span></span>
          </Link>

          <nav style={S.nav} className="hidden md:flex">
            <Link to="/marketplace" style={S.navLink}>Marketplace</Link>
            <a href="#how-it-works" style={S.navLink}>How It Works</a>
            <Link to="/market-prices" style={S.navLink}>Price Intelligence</Link>
            <a href="#ai-forecast" style={S.navLink}>AI Forecast</a>
            <a href="#logistics" style={S.navLink}>Logistics</a>
          </nav>

          <div style={S.headerActions}>
            {user ? (
              <Link to={`/${user.role.toLowerCase()}`} style={S.dashBtn}>
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" style={S.signIn}>Sign In</Link>
                <Link to="/register" style={S.joinBtn}>Join AgriDirect</Link>
              </>
            )}
          </div>
        </Container>
      </header>

      {/* ═══════════════════════════════════════
          2. HERO — Two-column, 50/50
          ═══════════════════════════════════════ */}
      <section style={{ padding: '80px 0 72px', background: '#fff' }}>
        <Container>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'center' }} className="hero-grid">
            {/* LEFT */}
            <div>
              <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#059669', marginBottom: 20 }}>
                INDIA'S DIGITAL FARM-TO-MARKET PLATFORM
              </p>
              <h1 style={{ fontSize: 54, fontWeight: 900, lineHeight: 1.05, letterSpacing: '-0.03em', margin: '0 0 24px' }}>
                <span style={{ color: '#0f172a' }}>Sell smarter.</span><br />
                <span style={{ color: '#059669' }}>Buy directly.</span>
              </h1>
              <p style={{ fontSize: 17, color: '#64748b', lineHeight: 1.65, maxWidth: 500, marginBottom: 32 }}>
                AgriDirect helps farmers and FPOs connect with verified buyers while providing transparent prices, demand intelligence and smarter logistics.
              </p>

              <div style={{ display: 'flex', gap: 14, marginBottom: 32, flexWrap: 'wrap' }}>
                <Link to="/login?role=farmer" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#059669', color: '#fff', padding: '14px 28px', borderRadius: 12, fontSize: 15, fontWeight: 700, textDecoration: 'none', transition: 'background 0.15s' }}>
                  Sell Your Produce <ArrowRight size={16} />
                </Link>
                <Link to="/marketplace" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#fff', color: '#334155', padding: '14px 28px', borderRadius: 12, fontSize: 15, fontWeight: 600, textDecoration: 'none', border: '1px solid #e2e8f0' }}>
                  Explore Marketplace
                </Link>
              </div>

              <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap' }}>
                {['Verified Buyers', 'Transparent Prices', 'AI Demand Insights'].map((t) => (
                  <span key={t} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 14, fontWeight: 500, color: '#475569' }}>
                    <CheckCircle2 size={16} color="#059669" /> {t}
                  </span>
                ))}
              </div>
            </div>

            {/* RIGHT — Single large image */}
            <div style={{ position: 'relative' }}>
              <img
                src="https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=1400&q=85"
                alt="Agricultural harvesting"
                style={{ width: '100%', height: 480, objectFit: 'cover', borderRadius: 16, display: 'block' }}
              />
              {/* One small badge */}
              <div style={{ position: 'absolute', bottom: 16, left: 16, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)', padding: '10px 16px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: '#059669', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700 }}>✓</div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }}>Verified Producer Cluster</p>
                  <p style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>Pollachi • Coimbatore Region</p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ═══════════════════════════════════════
          3. TRUST STRIP — 4 items, light green bg
          ═══════════════════════════════════════ */}
      <section style={{ padding: '28px 0', background: '#f0fdf4', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
        <Container>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }} className="trust-grid">
            {[
              { icon: <ShoppingBag size={18} />, title: 'Direct Market Access', desc: 'Zero middlemen trade' },
              { icon: <TrendingUp size={18} />, title: 'Transparent Prices', desc: 'Real-time APMC benchmarks' },
              { icon: <Brain size={18} />, title: 'AI Demand Forecasting', desc: '30-day predictive trends' },
              { icon: <Truck size={18} />, title: 'Smart Logistics', desc: 'Route-optimized delivery' },
            ].map((item) => (
              <div key={item.title} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: '#fff', border: '1px solid #d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669', flexShrink: 0 }}>
                  {item.icon}
                </div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{item.title}</p>
                  <p style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ═══════════════════════════════════════
          4. MARKET SNAPSHOT
          ═══════════════════════════════════════ */}
      <FadeIn>
        <section style={S.sectionWhite}>
          <Container>
            <div style={{ marginBottom: 32 }}>
              <p style={S.sectionLabel}>LIVE MARKET DATA</p>
              <h2 style={S.sectionTitle}>Today's Market Snapshot</h2>
              <p style={S.sectionDesc}>Current benchmark prices and regional demand signals.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 18 }} className="market-grid">
              {[
                { crop: 'Tomato', grade: 'Hybrid Grade-A', price: '₹28', trend: '↑ 8.4%', trendColor: '#059669', demand: 'High Demand', demandBg: '#ecfdf5', demandColor: '#047857', mandi: 'Coimbatore APMC' },
                { crop: 'Onion', grade: 'Bellary Medium', price: '₹31', trend: '→ Steady', trendColor: '#64748b', demand: 'Medium Demand', demandBg: '#f1f5f9', demandColor: '#475569', mandi: 'Coimbatore APMC' },
                { crop: 'Banana', grade: 'G9 Cavendish', price: '₹35', trend: '↑ 5.2%', trendColor: '#059669', demand: 'High Demand', demandBg: '#ecfdf5', demandColor: '#047857', mandi: 'Pollachi Mandi' },
                { crop: 'Coconut', grade: 'Matured Grade-A', price: '₹42', trend: '• Stable', trendColor: '#64748b', demand: 'Stable Demand', demandBg: '#f1f5f9', demandColor: '#475569', mandi: 'Anamalai Mandi' },
              ].map((item) => (
                <div key={item.crop} style={{ ...S.card, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 160 }} className="market-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                    <div>
                      <p style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>{item.crop}</p>
                      <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{item.grade}</p>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: item.trendColor }}>{item.trend}</span>
                  </div>
                  <div>
                    <p style={{ fontSize: 30, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }}>
                      {item.price}<span style={{ fontSize: 14, fontWeight: 400, color: '#94a3b8' }}>/kg</span>
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                      <span style={{ fontSize: 11, color: '#94a3b8' }}>{item.mandi}</span>
                      <span style={{ fontSize: 11, fontWeight: 600, color: item.demandColor, background: item.demandBg, padding: '2px 8px', borderRadius: 6 }}>
                        {item.demand}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 20, textAlign: 'right' }}>
              <Link to="/market-prices" style={{ fontSize: 14, fontWeight: 600, color: '#059669', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                View all prices <ArrowRight size={14} />
              </Link>
            </div>
          </Container>
        </section>
      </FadeIn>

      {/* ═══════════════════════════════════════
          5. PROBLEM — SIH 26033
          ═══════════════════════════════════════ */}
      <FadeIn>
        <section style={S.sectionLightGray}>
          <Container>
            <div style={{ textAlign: 'center', maxWidth: 700, margin: '0 auto 48px' }}>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#dc2626', background: '#fef2f2', padding: '4px 14px', borderRadius: 20 }}>
                SIH PROBLEM STATEMENT 26033
              </span>
              <h2 style={{ ...S.sectionTitle, marginTop: 14 }}>From Farm to Consumer</h2>
              <p style={{ fontSize: 16, color: '#64748b', lineHeight: 1.65 }}>
                The traditional agricultural supply chain can involve multiple coordination layers between producers and consumers, reducing transparency and farmer realization while increasing consumer prices.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }} className="problem-grid">
              {/* Traditional */}
              <div style={{ ...S.card, padding: 32 }}>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>Traditional Supply Chain</h3>
                <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 24 }}>Fragmented multi-middleman handoffs</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {['Farmer', 'Local Trader', 'Wholesaler', 'Distributor', 'Retailer', 'Consumer'].map((step, i) => (
                    <div key={step}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 10, background: '#f8fafc' }}>
                        <span style={{ width: 24, height: 24, borderRadius: 6, background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#64748b', flexShrink: 0 }}>{i + 1}</span>
                        <span style={{ fontSize: 14, fontWeight: 600, color: '#334155' }}>{step}</span>
                      </div>
                      {i < 5 && (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: '4px 0', color: '#cbd5e1' }}>
                          <ArrowDown size={14} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* With AgriDirect */}
              <div style={{ ...S.card, padding: 32, borderColor: '#a7f3d0', background: '#fafffe' }}>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>With AgriDirect</h3>
                <p style={{ fontSize: 13, color: '#059669', marginBottom: 24 }}>Direct digital coordination bridge</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {/* Node 1 */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderRadius: 12, background: '#fff', border: '1px solid #d1fae5' }}>
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: '#059669', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Sprout size={18} /></div>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>Farmer / FPO</p>
                      <p style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>Direct digital lot registration</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center', padding: '4px 0', color: '#059669' }}><ArrowDown size={16} /></div>

                  {/* Node 2 — AgriDirect */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderRadius: 12, background: '#0f172a', color: '#fff' }}>
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: '#10b981', color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 13, flexShrink: 0 }}>AD</div>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 700 }}>AgriDirect Platform</p>
                      <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>AI matching, pricing & logistics</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center', padding: '4px 0', color: '#059669' }}><ArrowDown size={16} /></div>

                  {/* Node 3 */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderRadius: 12, background: '#fff', border: '1px solid #bfdbfe' }}>
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: '#3b82f6', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Building2 size={18} /></div>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>Buyer / Consumer</p>
                      <p style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>Fresh delivery at benchmark rates</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Container>
        </section>
      </FadeIn>

      {/* ═══════════════════════════════════════
          6. SOLUTION — Capabilities
          ═══════════════════════════════════════ */}
      <FadeIn>
        <section style={S.sectionWhite}>
          <Container>
            <div style={{ textAlign: 'center', maxWidth: 700, margin: '0 auto 48px' }}>
              <p style={S.sectionLabel}>CORE CAPABILITIES</p>
              <h2 style={S.sectionTitle}>One Platform. One Connected Supply Chain.</h2>
              <p style={{ ...S.sectionDesc, margin: '0 auto' }}>Connect supply, demand, pricing and logistics through one digital platform.</p>
            </div>

            {/* 3 + 2 grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 20 }} className="cap-grid-3">
              {[
                { icon: <ShoppingBag size={22} />, iconBg: '#ecfdf5', iconColor: '#047857', title: 'Direct Marketplace', desc: 'Connect farmers and FPOs directly with verified bulk buyers and institutional procurers.' },
                { icon: <TrendingUp size={22} />, iconBg: '#eff6ff', iconColor: '#1d4ed8', title: 'Price Intelligence', desc: 'Transparent market signals and price discovery feeds directly from APMC terminal mandis.' },
                { icon: <Brain size={22} />, iconBg: '#faf5ff', iconColor: '#7e22ce', title: 'AI Demand Forecasting', desc: 'Predict upcoming regional crop consumption to optimize harvest timing and protect earnings.' },
              ].map((f) => (
                <div key={f.title} style={S.card} className="cap-card">
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: f.iconBg, color: f.iconColor, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>{f.icon}</div>
                  <h3 style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>{f.title}</h3>
                  <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6 }}>{f.desc}</p>
                </div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20, maxWidth: 800, margin: '0 auto' }} className="cap-grid-2">
              {[
                { icon: <Sparkles size={22} />, iconBg: '#fffbeb', iconColor: '#b45309', title: 'Smart Matching', desc: 'Match supply lots with buyer volume, distance proximity, and grade specifications.' },
                { icon: <Truck size={22} />, iconBg: '#eef2ff', iconColor: '#4338ca', title: 'Smart Logistics', desc: 'Automated multi-farm pickup and delivery routing that optimizes vehicle capacity.' },
              ].map((f) => (
                <div key={f.title} style={S.card} className="cap-card">
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: f.iconBg, color: f.iconColor, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>{f.icon}</div>
                  <h3 style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>{f.title}</h3>
                  <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6 }}>{f.desc}</p>
                </div>
              ))}
            </div>
          </Container>
        </section>
      </FadeIn>

      {/* ═══════════════════════════════════════
          7. HOW IT WORKS — 4 steps
          ═══════════════════════════════════════ */}
      <FadeIn>
        <section id="how-it-works" style={S.sectionLightGreen}>
          <Container>
            <div style={{ textAlign: 'center', maxWidth: 600, margin: '0 auto 48px' }}>
              <p style={S.sectionLabel}>END-TO-END WORKFLOW</p>
              <h2 style={S.sectionTitle}>How the platform works</h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, position: 'relative' }} className="workflow-grid">
              {/* connecting line */}
              <div style={{ position: 'absolute', top: 36, left: '12.5%', right: '12.5%', height: 2, background: '#d1fae5', zIndex: 0 }} className="workflow-line" />

              {[
                { num: '01', title: 'LIST PRODUCE', desc: 'Farmer/FPO lists produce with crop variety, quantity and expected price.' },
                { num: '02', title: 'GET MATCHED', desc: 'AI matches supply with demand by proximity, volume and grade.' },
                { num: '03', title: 'OPTIMIZE DELIVERY', desc: 'System plans efficient multi-farm pickup and delivery routes.' },
                { num: '04', title: 'COMPLETE TRADE', desc: 'Produce is delivered and payment status is tracked digitally.' },
              ].map((s) => (
                <div key={s.num} style={{ ...S.card, textAlign: 'center', position: 'relative', zIndex: 1 }} className="workflow-card">
                  <p style={{ fontSize: 28, fontWeight: 900, color: '#059669', marginBottom: 12 }}>{s.num}</p>
                  <h4 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 10 }}>{s.title}</h4>
                  <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6 }}>{s.desc}</p>
                </div>
              ))}
            </div>
          </Container>
        </section>
      </FadeIn>

      {/* ═══════════════════════════════════════
          8. AI DEMAND INTELLIGENCE — 55/45 split
          ═══════════════════════════════════════ */}
      <FadeIn>
        <section id="ai-forecast" style={S.sectionWhite}>
          <Container>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
              <div>
                <p style={S.sectionLabel}>PREDICTIVE ANALYTICS</p>
                <h2 style={S.sectionTitle}>AI Demand Intelligence</h2>
                <p style={S.sectionDesc}>Understand what the market may need before you sell.</p>
              </div>
              {/* Crop selector */}
              <div style={{ display: 'flex', gap: 4, background: '#f1f5f9', borderRadius: 10, padding: 4 }}>
                {(['tomato', 'onion', 'banana'] as const).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setActiveCrop(c)}
                    style={{
                      padding: '7px 16px', borderRadius: 8, fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer',
                      background: activeCrop === c ? '#fff' : 'transparent',
                      color: activeCrop === c ? '#059669' : '#64748b',
                      boxShadow: activeCrop === c ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                      transition: 'all 0.15s',
                    }}
                  >
                    {c.charAt(0).toUpperCase() + c.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '55fr 45fr', gap: 24 }} className="ai-grid">
              {/* LEFT — Chart & metrics */}
              <div style={{ ...S.card, padding: 28 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div>
                    <h3 style={{ fontSize: 17, fontWeight: 700, color: '#0f172a' }}>{crop.name}</h3>
                    <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 3 }}>30-Day predictive volume horizon</p>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#059669', background: '#ecfdf5', padding: '4px 12px', borderRadius: 8 }}>
                    Growth: {crop.growth}
                  </span>
                </div>

                <div style={{ height: 240, width: '100%', background: '#f8fafc', borderRadius: 12, padding: 8 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={crop.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="fgGreen" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#16a34a" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="fgGray" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#64748b" stopOpacity={0.15} />
                          <stop offset="95%" stopColor="#64748b" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                      <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                      <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} formatter={(val: any) => [`${val} kg`, 'Demand']} />
                      <ReferenceLine x="Today" stroke="#059669" strokeDasharray="3 3" />
                      <Area type="monotone" dataKey="actual" stroke="#475569" strokeWidth={2} fillOpacity={1} fill="url(#fgGray)" />
                      <Area type="monotone" dataKey="forecast" stroke="#16a34a" strokeWidth={2.5} strokeDasharray="4 4" fillOpacity={1} fill="url(#fgGreen)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* 4 metrics */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginTop: 16 }}>
                  {[
                    { label: 'Current Demand', value: crop.current, bg: '#f8fafc' },
                    { label: 'Forecast Peak', value: crop.forecast, bg: '#ecfdf5' },
                    { label: 'Projected Growth', value: crop.growth, bg: '#f8fafc' },
                    { label: 'Confidence', value: crop.confidence, bg: '#f8fafc' },
                  ].map((m) => (
                    <div key={m.label} style={{ background: m.bg, borderRadius: 10, padding: '10px 12px' }}>
                      <p style={{ fontSize: 11, color: '#94a3b8', fontWeight: 500 }}>{m.label}</p>
                      <p style={{ fontSize: 17, fontWeight: 800, color: '#0f172a', marginTop: 3 }}>{m.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* RIGHT — Recommendation */}
              <div style={{ ...S.card, padding: 28, background: '#fafafe', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: '#f3e8ff', color: '#7e22ce', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Brain size={18} /></div>
                    <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#7e22ce' }}>AI RECOMMENDATION</span>
                  </div>

                  <p style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', lineHeight: 1.4, marginBottom: 20 }}>
                    "{crop.recommendation}"
                  </p>

                  <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 12, padding: 16, marginBottom: 20 }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: '#92400e', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 6 }}>Harvest Advisory</p>
                    <p style={{ fontSize: 13, color: '#78350f', lineHeight: 1.5 }}>{crop.advisory}</p>
                  </div>

                  <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6 }}>
                    AgriDirect's engine cross-references arrival volumes from 42 Tamil Nadu mandis with institutional demand signals.
                  </p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24, paddingTop: 20, borderTop: '1px solid #e2e8f0' }}>
                  <Link to="/farmer/insights" style={{ fontSize: 14, fontWeight: 600, color: '#059669', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    View AI Forecast <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          </Container>
        </section>
      </FadeIn>

      {/* ═══════════════════════════════════════
          9. SMART LOGISTICS — 60/40 split
          ═══════════════════════════════════════ */}
      <FadeIn>
        <section id="logistics" style={S.sectionLightGray}>
          <Container>
            <div style={{ display: 'grid', gridTemplateColumns: '60fr 40fr', gap: 24 }} className="logistics-grid">
              {/* LEFT — Route visualization */}
              <div style={{ ...S.card, padding: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <MapPin size={16} color="#059669" />
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>3 Farm Pickups → 1 Buyer DC</span>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#059669', background: '#ecfdf5', padding: '3px 10px', borderRadius: 6 }}>Optimal Route</span>
                </div>

                <div style={{ position: 'relative', height: 280, width: '100%', background: '#0f172a', borderRadius: 14, overflow: 'hidden' }}>
                  <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} viewBox="0 0 600 300">
                    <defs>
                      <pattern id="lgGrid" width="30" height="30" patternUnits="userSpaceOnUse">
                        <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#1e293b" strokeWidth="0.8" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#lgGrid)" />
                    <path d="M 100 80 L 220 180 L 360 110 L 480 220" fill="none" stroke={logisticsOptimized ? '#22c55e' : '#64748b'} strokeWidth="3" strokeDasharray={logisticsOptimized ? 'none' : '5 4'} />
                    {logisticsOptimized && <circle cx="480" cy="220" r="16" fill="#22c55e" fillOpacity="0.25" />}
                  </svg>
                  <div style={{ position: 'absolute', top: '20%', left: '12%', background: 'rgba(15,23,42,0.9)', color: '#fff', padding: '8px 12px', borderRadius: 10, border: '1px solid #334155', zIndex: 1 }}>
                    <p style={{ fontSize: 12, fontWeight: 700, color: '#4ade80' }}>Farm 1 (Pollachi)</p>
                    <p style={{ fontSize: 10, color: '#94a3b8' }}>400 kg Tomato</p>
                  </div>
                  <div style={{ position: 'absolute', top: '52%', left: '32%', background: 'rgba(15,23,42,0.9)', color: '#fff', padding: '8px 12px', borderRadius: 10, border: '1px solid #334155', zIndex: 1 }}>
                    <p style={{ fontSize: 12, fontWeight: 700, color: '#4ade80' }}>Farm 2 (Kinathukadavu)</p>
                    <p style={{ fontSize: 10, color: '#94a3b8' }}>350 kg Onion</p>
                  </div>
                  <div style={{ position: 'absolute', top: '30%', left: '56%', background: 'rgba(15,23,42,0.9)', color: '#fff', padding: '8px 12px', borderRadius: 10, border: '1px solid #334155', zIndex: 1 }}>
                    <p style={{ fontSize: 12, fontWeight: 700, color: '#4ade80' }}>Farm 3 (Sulur)</p>
                    <p style={{ fontSize: 10, color: '#94a3b8' }}>450 kg Potato</p>
                  </div>
                  <div style={{ position: 'absolute', bottom: '14%', right: '6%', background: '#022c22', color: '#fff', padding: '10px 14px', borderRadius: 10, border: '1px solid #065f46', zIndex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: '#6ee7b7' }}>
                      <Building2 size={13} /> FreshMart DC
                    </div>
                    <p style={{ fontSize: 10, color: '#94a3b8', marginTop: 2 }}>1,200 kg Drop</p>
                  </div>
                </div>
              </div>

              {/* RIGHT — description & metrics */}
              <div style={{ ...S.card, padding: 28, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ ...S.sectionLabel, color: '#4338ca' }}>SMART LOGISTICS</p>
                  <h3 style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', lineHeight: 1.2, margin: '10px 0 14px' }}>Smarter logistics from farm to buyer</h3>
                  <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6, marginBottom: 24 }}>
                    Automated route algorithms cluster regional farm pickups to optimize vehicle loading, reducing empty return transit.
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    {[
                      { label: 'Total Route', value: '48 km' },
                      { label: 'Travel Time', value: '1h 35m' },
                      { label: 'Consolidated Load', value: '1,200 kg' },
                      { label: 'Vehicle Capacity', value: '1,500 kg' },
                    ].map((m) => (
                      <div key={m.label} style={{ background: '#f8fafc', borderRadius: 10, padding: '12px 14px' }}>
                        <p style={{ fontSize: 11, color: '#94a3b8', fontWeight: 500 }}>{m.label}</p>
                        <p style={{ fontSize: 20, fontWeight: 900, color: '#0f172a', marginTop: 3 }}>{m.value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, paddingTop: 20, borderTop: '1px solid #e2e8f0' }}>
                  <button
                    type="button"
                    onClick={() => setLogisticsOptimized(!logisticsOptimized)}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#64748b', background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    <RefreshCw size={14} className={logisticsOptimized ? '' : 'animate-spin'} style={{ color: logisticsOptimized ? '#64748b' : '#059669' }} />
                    Re-calculate route
                  </button>
                  <Link to="/buyer/logistics" style={{ fontSize: 14, fontWeight: 600, color: '#059669', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    Explore Logistics <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          </Container>
        </section>
      </FadeIn>

      {/* ═══════════════════════════════════════
          10. IMPACT — 4 equal columns
          ═══════════════════════════════════════ */}
      <FadeIn>
        <section style={S.sectionWhite}>
          <Container>
            <div style={{ textAlign: 'center', maxWidth: 600, margin: '0 auto 48px' }}>
              <p style={S.sectionLabel}>MEASURABLE VALUE</p>
              <h2 style={S.sectionTitle}>Better outcomes across the supply chain</h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }} className="impact-grid">
              {[
                { icon: <Sprout size={24} />, iconBg: '#ecfdf5', iconColor: '#047857', label: 'FARMERS', title: 'Better market access', desc: 'Connect directly with verified bulk buyers and discover transparent prices.' },
                { icon: <Building2 size={24} />, iconBg: '#eff6ff', iconColor: '#1d4ed8', label: 'BUYERS', title: 'Simpler procurement', desc: 'Post exact volume requirements and match with screened farm lots.' },
                { icon: <ShoppingBag size={24} />, iconBg: '#faf5ff', iconColor: '#7e22ce', label: 'CONSUMERS', title: 'Greater price transparency', desc: 'Buy fresh agricultural produce traced back to the harvesting farm.' },
                { icon: <Truck size={24} />, iconBg: '#eef2ff', iconColor: '#4338ca', label: 'SUPPLY CHAIN', title: 'Lower coordination friction', desc: 'Reduce unnecessary transit handoffs through pooled regional dispatch.' },
              ].map((item) => (
                <div key={item.label} style={{ ...S.card, textAlign: 'center', padding: 28 }} className="impact-card">
                  <div style={{ width: 48, height: 48, borderRadius: 14, background: item.iconBg, color: item.iconColor, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>{item.icon}</div>
                  <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: '#94a3b8', marginBottom: 6 }}>{item.label}</p>
                  <h3 style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>{item.title}</h3>
                  <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6 }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </Container>
        </section>
      </FadeIn>

      {/* ═══════════════════════════════════════
          11. FINAL CTA
          ═══════════════════════════════════════ */}
      <section style={{ padding: '80px 0', background: 'linear-gradient(135deg, #065f46, #0f766e)', color: '#fff', position: 'relative' }}>
        <Container>
          <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto' }}>
            <h2 style={{ fontSize: 38, fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 16 }}>
              Make farm-to-market trade smarter.
            </h2>
            <p style={{ fontSize: 17, color: '#a7f3d0', lineHeight: 1.6, marginBottom: 32 }}>
              Connect producers, buyers and consumers through a more transparent agricultural marketplace.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 14, flexWrap: 'wrap' }}>
              <Link to="/register?role=farmer" style={{ background: '#fff', color: '#065f46', padding: '14px 32px', borderRadius: 12, fontSize: 15, fontWeight: 700, textDecoration: 'none' }}>
                Join as Farmer
              </Link>
              <Link to="/marketplace" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', padding: '14px 32px', borderRadius: 12, fontSize: 15, fontWeight: 600, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.3)' }}>
                Explore Marketplace
              </Link>
            </div>

            {/* Quick demo shortcuts */}
            <div style={{ marginTop: 40, paddingTop: 28, borderTop: '1px solid rgba(255,255,255,0.2)' }}>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#a7f3d0', marginBottom: 12 }}>
                SIH Demo Quick Sign-In
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}>
                {['Farmer (Ravi)', 'Buyer (FreshMart)', 'Consumer (Priya)', 'Admin Console'].map((label) => (
                  <Link key={label} to="/login" style={{ fontSize: 12, padding: '6px 14px', borderRadius: 8, background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.2)', color: '#d1fae5', textDecoration: 'none', fontWeight: 500 }}>
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ═══════════════════════════════════════
          12. FOOTER
          ═══════════════════════════════════════ */}
      <footer style={{ background: '#0f172a', color: '#94a3b8', padding: '56px 0 32px' }}>
        <Container>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 40, marginBottom: 40 }} className="footer-grid">
            {/* Brand */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: '#059669', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Sprout size={16} /></div>
                <span style={{ fontSize: 16, fontWeight: 800, color: '#f8fafc' }}>AgriDirect</span>
              </div>
              <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6, maxWidth: 360 }}>
                A digital agricultural marketplace connecting farmers directly with verified buyers and institutional consumers across Tamil Nadu.
              </p>
            </div>

            {/* Platform */}
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#e2e8f0', marginBottom: 16 }}>Platform</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <Link to="/marketplace" style={{ fontSize: 13, color: '#94a3b8', textDecoration: 'none' }}>Marketplace</Link>
                <a href="#how-it-works" style={{ fontSize: 13, color: '#94a3b8', textDecoration: 'none' }}>How It Works</a>
                <Link to="/market-prices" style={{ fontSize: 13, color: '#94a3b8', textDecoration: 'none' }}>Price Intelligence</Link>
                <a href="#ai-forecast" style={{ fontSize: 13, color: '#94a3b8', textDecoration: 'none' }}>AI Forecast</a>
                <a href="#logistics" style={{ fontSize: 13, color: '#94a3b8', textDecoration: 'none' }}>Logistics</a>
              </div>
            </div>

            {/* Account */}
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#e2e8f0', marginBottom: 16 }}>Account</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <Link to="/login" style={{ fontSize: 13, color: '#94a3b8', textDecoration: 'none' }}>Sign In</Link>
                <Link to="/register" style={{ fontSize: 13, color: '#94a3b8', textDecoration: 'none' }}>Join AgriDirect</Link>
                <Link to="/register?role=farmer" style={{ fontSize: 13, color: '#94a3b8', textDecoration: 'none' }}>Sell as Farmer</Link>
                <Link to="/register?role=buyer" style={{ fontSize: 13, color: '#94a3b8', textDecoration: 'none' }}>Procure as Buyer</Link>
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid #1e293b', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: '#475569' }}>
            <p>© 2026 AgriDirect. All rights reserved.</p>
            <p>Smart India Hackathon • SIH 26033</p>
          </div>
        </Container>
      </footer>

      {/* ═══════════════════════════════════════
          RESPONSIVE STYLES (injected via style tag)
          ═══════════════════════════════════════ */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

        .hero-grid { grid-template-columns: 1fr 1fr !important; }
        .market-card:hover, .cap-card:hover, .impact-card:hover, .workflow-card:hover {
          box-shadow: 0 6px 20px rgba(0,0,0,0.06);
          transform: translateY(-2px);
        }

        @media (max-width: 1024px) {
          .hero-grid { grid-template-columns: 1fr !important; }
          .problem-grid { grid-template-columns: 1fr !important; }
          .ai-grid { grid-template-columns: 1fr !important; }
          .logistics-grid { grid-template-columns: 1fr !important; }
          .cap-grid-3 { grid-template-columns: 1fr 1fr !important; }
          .cap-grid-2 { grid-template-columns: 1fr 1fr !important; max-width: 100% !important; }
          .workflow-grid { grid-template-columns: 1fr 1fr !important; }
          .workflow-line { display: none !important; }
          .footer-grid { grid-template-columns: 1fr !important; }
        }

        @media (max-width: 640px) {
          .hero-grid { grid-template-columns: 1fr !important; }
          .market-grid { grid-template-columns: 1fr 1fr !important; }
          .trust-grid { grid-template-columns: 1fr 1fr !important; }
          .cap-grid-3 { grid-template-columns: 1fr !important; }
          .cap-grid-2 { grid-template-columns: 1fr !important; }
          .impact-grid { grid-template-columns: 1fr 1fr !important; }
          .workflow-grid { grid-template-columns: 1fr !important; }
          .workflow-line { display: none !important; }
        }
      `}</style>
    </div>
  );
}
