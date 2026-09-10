import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './hooks/useAuth';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import FarmerDashboard from './pages/farmer/Dashboard';
import FarmerProduce from './pages/farmer/Produce';
import FarmerListProduce from './pages/farmer/ListProduce';
import FarmerOffers from './pages/farmer/Offers';
import FarmerOrders from './pages/farmer/Orders';
import FarmerInsights from './pages/farmer/Insights';
import BuyerDashboard from './pages/buyer/Dashboard';
import BuyerRequirements from './pages/buyer/Requirements';
import BuyerPostRequirement from './pages/buyer/PostRequirement';
import BuyerMatches from './pages/buyer/Matches';
import BuyerOffers from './pages/buyer/Offers';
import BuyerOrders from './pages/buyer/Orders';
import BuyerLogistics from './pages/buyer/Logistics';
import ConsumerHome from './pages/consumer/Home';
import ConsumerCart from './pages/consumer/Cart';
import ConsumerOrders from './pages/consumer/Orders';
import AdminDashboard from './pages/admin/Dashboard';
import Marketplace from './pages/Marketplace';
import MarketPrices from './pages/MarketPrices';
import AIChat from './pages/AIChat';
import SupplyChain from './pages/SupplyChain';
import Impact from './pages/Impact';
import DashboardLayout from './layouts/DashboardLayout';
import type { ReactNode } from 'react';

function ProtectedRoute({ children, roles }: { children: ReactNode; roles?: string[] }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div></div>;
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" />;
  return <>{children}</>;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={user ? <Navigate to={`/${user.role.toLowerCase()}`} /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to={`/${user.role.toLowerCase()}`} /> : <Register />} />
      <Route path="/marketplace" element={<Marketplace />} />
      <Route path="/market-prices" element={<MarketPrices />} />
      <Route path="/supply-chain" element={<SupplyChain />} />
      <Route path="/impact" element={<Impact />} />

      {/* Farmer Routes */}
      <Route path="/farmer" element={<ProtectedRoute roles={['FARMER', 'FPO']}><DashboardLayout role="FARMER" /></ProtectedRoute>}>
        <Route index element={<FarmerDashboard />} />
        <Route path="produce" element={<FarmerProduce />} />
        <Route path="list-produce" element={<FarmerListProduce />} />
        <Route path="offers" element={<FarmerOffers />} />
        <Route path="orders" element={<FarmerOrders />} />
        <Route path="insights" element={<FarmerInsights />} />
        <Route path="market-prices" element={<MarketPrices />} />
        <Route path="ai-chat" element={<AIChat />} />
      </Route>

      {/* Buyer Routes */}
      <Route path="/buyer" element={<ProtectedRoute roles={['BUYER']}><DashboardLayout role="BUYER" /></ProtectedRoute>}>
        <Route index element={<BuyerDashboard />} />
        <Route path="requirements" element={<BuyerRequirements />} />
        <Route path="post-requirement" element={<BuyerPostRequirement />} />
        <Route path="matches" element={<BuyerMatches />} />
        <Route path="offers" element={<BuyerOffers />} />
        <Route path="orders" element={<BuyerOrders />} />
        <Route path="logistics" element={<BuyerLogistics />} />
        <Route path="marketplace" element={<Marketplace />} />
        <Route path="market-prices" element={<MarketPrices />} />
        <Route path="ai-chat" element={<AIChat />} />
      </Route>

      {/* Consumer Routes */}
      <Route path="/consumer" element={<ProtectedRoute roles={['CONSUMER']}><DashboardLayout role="CONSUMER" /></ProtectedRoute>}>
        <Route index element={<ConsumerHome />} />
        <Route path="cart" element={<ConsumerCart />} />
        <Route path="orders" element={<ConsumerOrders />} />
        <Route path="marketplace" element={<Marketplace />} />
      </Route>

      {/* Admin Routes */}
      <Route path="/admin" element={<ProtectedRoute roles={['ADMIN']}><DashboardLayout role="ADMIN" /></ProtectedRoute>}>
        <Route index element={<AdminDashboard />} />
        <Route path="supply-chain" element={<SupplyChain />} />
        <Route path="ai-chat" element={<AIChat />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster position="top-right" toastOptions={{
          duration: 3000,
          style: { background: '#1e293b', color: '#f8fafc', borderRadius: '12px', fontSize: '14px' }
        }} />
      </AuthProvider>
    </BrowserRouter>
  );
}
