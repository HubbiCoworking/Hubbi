import { useState, type ReactNode } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { getDB, sessionClient, useDB } from '../../store/store';

/** Rotas /app/* exigem conta; sem sessão, vão ao login e voltam ao destino (TRD TR-04). */
export function RequireAuth() {
  const db = useDB();
  const { pathname, search } = useLocation();
  if (!sessionClient(db)) {
    return <Navigate to={`/login?next=${encodeURIComponent(pathname + search)}`} replace />;
  }
  return <Outlet />;
}

/** /login e /signup: quem já entrou vai para /app. A checagem vale só ao abrir a página,
 *  para a tela "Conta criada" aparecer depois do cadastro. */
export function GuestOnly({ children }: { children: ReactNode }) {
  const [hadSession] = useState(() => sessionClient(getDB()) !== null);
  if (hadSession) return <Navigate to="/app" replace />;
  return <>{children}</>;
}

/** Aceita só destinos internos da área logada, para evitar redirecionamento aberto (TRD 4.2). */
export function safeNext(value: string | null): string {
  return value && value.startsWith('/app') && !value.startsWith('//') ? value : '/app';
}
