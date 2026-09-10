import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useState, useEffect } from 'react';
import { notificationService } from '../services/api';
import {
  LayoutDashboard,
  Package,
  FileText,
  Handshake,
  ShoppingCart,
  TrendingUp,
  Brain,
  Truck,
  User,
  LogOut,
  Bell,
  Menu,
  X,
  Sprout,
  ShoppingBag,
  Home,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  MapPin,
  Users
} from 'lucide-react';

const menuConfig: Record<string, Array<{ path: string; label: string; icon: any }>> = {
  FARMER: [
    { path: '/farmer', label: 'Home', icon: Home },
    { path: '/farmer/produce', label: 'Produce', icon: Package },
    { path: '/farmer/offers', label: 'Offers', icon: Handshake },
    { path: '/farmer/market-prices', label: 'Market', icon: TrendingUp },
    { path: '/farmer/insights', label: 'AI Insights', icon: Brain },
    { path: '/farmer/orders', label: 'Orders', icon: ShoppingCart },
  ],
  FPO: [
    { path: '/farmer', label: 'Home', icon: Home },
    { path: '/farmer/produce', label: 'Aggregated Lots', icon: Package },
    { path: '/farmer/offers', label: 'Buyer Bids', icon: Handshake },
    { path: '/farmer/market-prices', label: 'Price Intelligence', icon: TrendingUp },
    { path: '/farmer/insights', label: 'AI Insights', icon: Brain },
    { path: '/farmer/orders', label: 'Dispatches', icon: ShoppingCart },
  ],
  BUYER: [
    { path: '/buyer', label: 'Home', icon: Home },
    { path: '/buyer/marketplace', label: 'Find Produce', icon: ShoppingBag },
    { path: '/buyer/requirements', label: 'Requirements', icon: FileText },
    { path: '/buyer/matches', label: 'Matches', icon: Handshake },
    { path: '/buyer/orders', label: 'Orders', icon: ShoppingCart },
    { path: '/buyer/logistics', label: 'Logistics', icon: Truck },
  ],
  CONSUMER: [
    { path: '/consumer', label: 'Fresh Market', icon: Home },
    { path: '/consumer/marketplace', label: 'All Products', icon: ShoppingBag },
    { path: '/consumer/cart', label: 'My Cart', icon: ShoppingCart },
    { path: '/consumer/orders', label: 'My Orders', icon: Package },
  ],
  ADMIN: [
    { path: '/admin', label: 'Overview', icon: LayoutDashboard },
    { path: '/admin/supply-chain', label: 'Supply Chain', icon: Truck },
    { path: '/admin/ai-chat', label: 'AI Intelligence', icon: Sparkles },
  ],
};

const mobileBottomNav: Record<string, Array<{ path: string; label: string; icon: any }>> = {
  FARMER: [
    { path: '/farmer', label: 'Home', icon: Home },
    { path: '/farmer/produce', label: 'Produce', icon: Package },
    { path: '/farmer/offers', label: 'Offers', icon: Handshake },
    { path: '/farmer/market-prices', label: 'Market', icon: TrendingUp },
    { path: '/farmer/insights', label: 'AI', icon: Brain },
  ],
  FPO: [
    { path: '/farmer', label: 'Home', icon: Home },
    { path: '/farmer/produce', label: 'Produce', icon: Package },
    { path: '/farmer/offers', label: 'Offers', icon: Handshake },
    { path: '/farmer/market-prices', label: 'Market', icon: TrendingUp },
    { path: '/farmer/insights', label: 'AI', icon: Brain },
  ],
  BUYER: [
    { path: '/buyer', label: 'Home', icon: Home },
    { path: '/buyer/marketplace', label: 'Produce', icon: ShoppingBag },
    { path: '/buyer/matches', label: 'Matches', icon: Handshake },
    { path: '/buyer/orders', label: 'Orders', icon: ShoppingCart },
    { path: '/buyer/logistics', label: 'Logistics', icon: Truck },
  ],
  CONSUMER: [
    { path: '/consumer', label: 'Home', icon: Home },
    { path: '/consumer/marketplace', label: 'Browse', icon: ShoppingBag },
    { path: '/consumer/cart', label: 'Cart', icon: ShoppingCart },
    { path: '/consumer/orders', label: 'Orders', icon: Package },
  ],
  ADMIN: [
    { path: '/admin', label: 'Home', icon: LayoutDashboard },
    { path: '/admin/supply-chain', label: 'Logistics', icon: Truck },
    { path: '/admin/ai-chat', label: 'AI', icon: Sparkles },
  ],
};

export default function DashboardLayout({ role }: { role: string }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifs, setShowNotifs] = useState(false);

  const menu = menuConfig[role] || menuConfig.FARMER;
  const bottomNav = mobileBottomNav[role] || mobileBottomNav.FARMER;
  const unreadCount = notifications.filter(n => !n.is_read).length;

  useEffect(() => {
    notificationService.list().then(setNotifications).catch(() => {});
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getRoleBadge = () => {
    switch (role) {
      case 'FARMER':
        return { label: 'Farmer Portal', bg: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
      case 'FPO':
        return { label: 'FPO Collective', bg: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
      case 'BUYER':
        return { label: 'Buyer Sourcing', bg: 'bg-blue-50 text-blue-800 border-blue-200' };
      case 'CONSUMER':
        return { label: 'Consumer Market', bg: 'bg-purple-50 text-purple-800 border-purple-200' };
      case 'ADMIN':
        return { label: 'Operations Admin', bg: 'bg-slate-100 text-slate-800 border-slate-300' };
      default:
        return { label: role, bg: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
  };

  const badge = getRoleBadge();

  return (
    <div className="flex flex-col h-screen bg-[#f8fafc] text-slate-900 font-sans overflow-hidden">
      {/* ============================================================
          UNIVERSAL HEADER (Height: 56px, Sticky, White, Compact)
          ============================================================ */}
      <header className="h-14 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between shrink-0 z-30 shadow-2xs">
        {/* Left: Brand + Role Badge */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition">
              <Sprout size={16} />
            </div>
            <span className="font-extrabold text-emerald-950 text-base tracking-tight hidden sm:inline">
              AgriDirect
            </span>
          </Link>

          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${badge.bg}`}>
            {badge.label}
          </span>
        </div>

        {/* Center: Contextual Direct Links (13-14px font, weight: 500) */}
        <div className="hidden lg:flex items-center gap-6 text-[13.5px] font-medium text-slate-600">
          <Link to="/marketplace" className="hover:text-emerald-700 transition flex items-center gap-1.5">
            <ShoppingBag size={15} className="text-slate-400" />
            <span>Public Mandi</span>
          </Link>
          <Link to="/market-prices" className="hover:text-emerald-700 transition flex items-center gap-1.5">
            <TrendingUp size={15} className="text-slate-400" />
            <span>Mandi Tickers</span>
          </Link>
          <Link to="/ai-chat" className="hover:text-emerald-700 transition flex items-center gap-1.5">
            <Sparkles size={15} className="text-slate-400" />
            <span>AI Advisory</span>
          </Link>
        </div>

        {/* Right: Notifications + User Profile + Logout */}
        <div className="flex items-center gap-3">
          {/* Notifications Popover */}
          <div className="relative">
            <button
              onClick={() => setShowNotifs(!showNotifs)}
              className="relative p-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
              title="Notifications"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-600" />
              )}
            </button>

            {showNotifs && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-slate-200 z-50 overflow-hidden text-xs dropdown-anim">
                <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-sm">Notifications</h4>
                  <button
                    onClick={() => {
                      notificationService.markAllRead();
                      setNotifications(n => n.map(x => ({ ...x, is_read: true })));
                    }}
                    className="text-xs text-emerald-700 font-medium hover:underline"
                  >
                    Mark all read
                  </button>
                </div>
                <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <p className="p-4 text-center text-slate-500">No new alerts</p>
                  ) : (
                    notifications.map(n => (
                      <div key={n.id} className={`p-3 ${!n.is_read ? 'bg-emerald-50/40' : ''}`}>
                        <p className="font-semibold text-slate-900 text-xs">{n.title}</p>
                        <p className="text-[11.5px] text-slate-600 mt-0.5">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Pill */}
          <div className="flex items-center gap-2 pl-2.5 border-l border-slate-200">
            <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center shrink-0">
              {user?.full_name?.charAt(0) || 'U'}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-[13px] font-semibold text-slate-900 leading-none truncate max-w-[130px]">
                {user?.full_name || 'User'}
              </p>
              <p className="text-xs text-slate-500 leading-none mt-1 truncate max-w-[130px]">
                {user?.location || 'Tamil Nadu'}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-md transition ml-1"
              title="Sign Out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* ============================================================
          MAIN BODY: Desktop Sidebar (240px, 14px Text) + Viewport Area
          ============================================================ */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar: 240px Width, 14px Font Size, 18px Icons */}
        <aside className="hidden md:flex flex-col w-60 bg-white border-r border-slate-200 shrink-0">
          <div className="px-4 pt-3 pb-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-[0.06em]">
            Menu
          </div>
          <nav className="flex-1 px-2.5 space-y-1 overflow-y-auto">
            {menu.map(item => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 h-9 px-2.5 rounded-lg text-[14px] font-medium leading-[1.4] transition-all duration-180 ease-out ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-800 font-semibold border-l-[3px] border-emerald-600 pl-[7px]'
                      : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 hover:translate-x-0.5'
                  }`}
                >
                  <Icon size={18} className={isActive ? 'text-emerald-700 shrink-0' : 'text-slate-400 shrink-0'} />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Quick AI Advisory Helper at sidebar bottom */}
          <div className="p-3 m-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <p className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
              <Sparkles size={13} className="text-emerald-600" />
              <span>AI Mandi Assistant</span>
            </p>
            <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
              Real-time demand forecasts & price spread intelligence.
            </p>
            <Link
              to="/ai-chat"
              className="inline-block mt-2 text-xs font-semibold text-emerald-700 hover:underline"
            >
              Open AI Chat →
            </Link>
          </div>
        </aside>

        {/* Mobile Slide-out Menu Overlay */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-40 md:hidden bg-black/40 backdrop-blur-xs flex">
            <div className="w-68 max-w-[80vw] bg-white h-full p-4 flex flex-col justify-between shadow-xl dropdown-anim">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                      <Sprout size={14} />
                    </div>
                    <span className="font-bold text-base text-slate-900">AgriDirect Menu</span>
                  </div>
                  <button onClick={() => setMobileMenuOpen(false)} className="p-1 text-slate-500 hover:text-slate-800">
                    <X size={20} />
                  </button>
                </div>
                <nav className="mt-4 space-y-1">
                  {menu.map(item => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-2.5 h-10 px-3 rounded-lg text-[14px] font-semibold transition-colors ${
                          isActive
                            ? 'bg-emerald-50 text-emerald-800 border-l-[3px] border-emerald-600'
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <Icon size={18} className={isActive ? 'text-emerald-700' : 'text-slate-400'} />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </nav>
              </div>

              <div className="pt-4 border-t border-slate-200">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 text-sm font-semibold text-rose-600 py-2.5 px-3 rounded-lg hover:bg-rose-50 transition"
                >
                  <LogOut size={17} /> Sign Out
                </button>
              </div>
            </div>
            <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
          </div>
        )}

        {/* Main Viewport: Full horizontal width, subtle page entrance animation on route change */}
        <main
          key={location.pathname}
          className="flex-1 overflow-y-auto p-3.5 sm:p-5 lg:p-6 pb-16 md:pb-6 w-full page-enter-anim"
        >
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-14 bg-white border-t border-slate-200 flex items-center justify-around z-30 shadow-lg">
        {bottomNav.map(item => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-[11px] font-medium transition ${
                isActive ? 'text-emerald-700 font-bold' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Icon size={18} className={isActive ? 'text-emerald-700' : 'text-slate-400'} />
              <span className="mt-0.5 leading-none">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
