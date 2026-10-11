import { Navigate, useLocation } from 'react-router-dom';

const INTENT: Record<string, string> = { reservar: 'book', plano: 'plan' };

/** Redireciona os endereços em português dos protótipos antigos para as rotas em inglês (TRD 4.3). */
export function LegacyRedirect({ to }: { to: '/login' | '/signup' }) {
  const { search, hash } = useLocation();
  const params = new URLSearchParams(search);
  if (to === '/login' && params.get('etapa') === 'recuperar') return <Navigate to="/forgot-password" replace />;
  const intent = INTENT[params.get('para') ?? ''];
  return <Navigate to={`${to}${intent ? `?intent=${intent}` : ''}${hash}`} replace />;
}
