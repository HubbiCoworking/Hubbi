import { Link, useLocation } from 'react-router-dom';
import { Alert } from '../components/Icons';
import { useDocumentTitle } from '../lib/useDocumentTitle';
import { AuthLayout } from '../features/auth/AuthLayout';
import { Mark } from '../components/Mark';

export default function NotFound() {
  useDocumentTitle('Página não encontrada · Hubbi');
  // Dentro do portal a página já tem menu e <main>; aqui entra só o aviso, como nas outras telas.
  if (useLocation().pathname.startsWith('/app')) {
    return (
      <div className="state-box" style={{ maxWidth: 560 }}>
        <span className="state-icon err" aria-hidden="true"><Alert /></span>
        <h1 className="h-like">Não encontramos essa página.</h1>
        <p className="muted">O endereço pode ter mudado. Volte para o início da sua conta.</p>
        <Link className="btn btn-primary" to="/app">Ir para o início</Link>
      </div>
    );
  }
  return (
    <AuthLayout
      aside={
        <aside className="aside aside--stack" aria-hidden="true">
          <Mark className="big-mark" />
          <h2>Essa sala <span>não existe.</span></h2>
        </aside>
      }
    >
      <div className="stage stage--center">
        <section className="view enter" aria-labelledby="nf-t">
          <h1 id="nf-t">Não encontramos essa página.</h1>
          <p className="sub">O endereço pode ter mudado. Volte para o início e escolha o seu espaço por lá.</p>
          <Link className="btn btn-primary" to="/">Ir para o início</Link>
        </section>
      </div>
    </AuthLayout>
  );
}
