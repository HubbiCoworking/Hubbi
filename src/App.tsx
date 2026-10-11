import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { LegacyRedirect } from './components/LegacyRedirect';
import { ScrollManager } from './components/ScrollManager';
import { GuestOnly, RequireAuth } from './features/portal/guards';
import { PortalLayout } from './features/portal/PortalLayout';
import Cadastro from './pages/Cadastro';
import Impact from './pages/Impact';
import Landing from './pages/Landing';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import Home from './pages/portal/Home';
import Spaces from './pages/portal/Spaces';
import BookingNew from './pages/portal/BookingNew';
import BookingConfirmation from './pages/portal/BookingConfirmation';
import Bookings from './pages/portal/Bookings';
import BookingDetail from './pages/portal/BookingDetail';
import MyPlan from './pages/portal/MyPlan';
import Rewards from './pages/portal/Rewards';

/* Rotas em inglês; textos da interface em português (PRD D7, TRD seção 4). */
export default function App() {
  return (
    <BrowserRouter>
      <ScrollManager />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/impact" element={<Impact />} />
        <Route path="/login" element={<GuestOnly><Login key="login" /></GuestOnly>} />
        <Route path="/forgot-password" element={<Login key="forgot-password" mode="recover" />} />
        <Route path="/signup" element={<GuestOnly><Cadastro /></GuestOnly>} />

        {/* Área logada do cliente (TRD 4.1) */}
        <Route path="/app" element={<RequireAuth />}>
          <Route element={<PortalLayout />}>
            <Route index element={<Home />} />
            <Route path="spaces" element={<Spaces />} />
            <Route path="bookings" element={<Bookings />} />
            <Route path="bookings/new" element={<BookingNew />} />
            <Route path="bookings/:id" element={<BookingDetail />} />
            <Route path="bookings/:id/confirmation" element={<BookingConfirmation />} />
            <Route path="plan" element={<MyPlan />} />
            <Route path="rewards" element={<Rewards />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Route>

        {/* Endereços antigos dos protótipos */}
        <Route path="/entrar" element={<LegacyRedirect to="/login" />} />
        <Route path="/cadastro" element={<LegacyRedirect to="/signup" />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
