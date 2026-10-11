import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from '../../components/Icons';
import { A11yMenu } from '../../components/A11yMenu';
import { Logo } from '../../components/Logo';
import { SkipLink } from '../../components/SkipLink';
import '../../styles/auth.css';

type Props = { children: ReactNode; aside: ReactNode; footer?: ReactNode; proto?: ReactNode };

/** Moldura das telas de acesso: formulário à esquerda, painel da marca à direita. */
export function AuthLayout({ children, aside, footer, proto }: Props) {
  return (
    <div className="auth-page">
      <SkipLink />
      <div className="page">
        <main className="auth zoom-area" id="conteudo" tabIndex={-1}>
          <div className="top">
            <Logo label="Hubbi, voltar para o site" />
            <span className="top-end">
              <A11yMenu compact />
              <Link className="back" to="/"><ArrowLeft /><span>Voltar para o site</span></Link>
            </span>
          </div>
          {children}
          {footer}
        </main>
        {aside}
      </div>
      {proto}
    </div>
  );
}
