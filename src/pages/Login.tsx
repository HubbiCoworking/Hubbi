import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Alert, ArrowRight, Calendar, Check, Clock, Leaf, Mail, Team, Wallet } from '../components/Icons';
import { Mark } from '../components/Mark';
import { ProtoBar } from '../components/ProtoBar';
import { DEMO_MEMBER } from '../data/catalog';
import { redeemProgress } from '../domain/points';
import { AuthLayout } from '../features/auth/AuthLayout';
import { PasswordField, TextField } from '../features/auth/fields';
import { useTimers } from '../features/auth/useTimers';
import { useReducedMotion, useReplayClass } from '../lib/motion';
import { cssVars } from '../lib/style';
import { useDocumentTitle } from '../lib/useDocumentTitle';
import { safeNext } from '../features/portal/guards';
import { signIn, signInDemo } from '../store/store';
import { emailError } from '../lib/validation';

type View = 'login' | 'recover' | 'sent';
type ProtoState = 'login' | 'invalid' | 'error' | 'loading' | 'recover' | 'sent';

const PROTO: { id: ProtoState; label: string }[] = [
  { id: 'login', label: 'Padrão' },
  { id: 'invalid', label: 'Campos vazios' },
  { id: 'error', label: 'Login inválido' },
  { id: 'loading', label: 'Carregando' },
  { id: 'recover', label: 'Recuperar senha' },
  { id: 'sent', label: 'Link enviado' },
];

const CONTEXT: Record<string, string> = {
  book: 'Entre para concluir sua reserva. O espaço e o preço que você escolheu continuam na tela depois.',
  plan: 'Entre para pedir o seu plano. A recepção ativa quando registrar o pagamento.',
};

const SAMPLE_EMAIL = 'ana.souza@email.com';
const RESEND_SECONDS = 30;

type LocationState = { email?: string; sent?: boolean } | null;

/** T02 Login (/login) e T03 Recuperar senha (/forgot-password). F01; FR-002; RN17; MSG-02. */
export default function Login({ mode = 'login' }: { mode?: 'login' | 'recover' }) {
  useDocumentTitle(mode === 'recover' ? 'Recuperar senha · Hubbi' : 'Entrar · Hubbi');
  const navigate = useNavigate();
  const routeState = useLocation().state as LocationState;
  const reduce = useReducedMotion();
  const { later, clear } = useTimers();
  const [params] = useSearchParams();
  const intent = params.get('intent') ?? '';
  const next = safeNext(params.get('next'));
  const context = CONTEXT[intent];
  const startView: View = mode === 'recover' ? (routeState?.sent ? 'sent' : 'recover') : 'login';

  const [view, setView] = useState<View>(startView);
  const [anim, setAnim] = useState<'enter' | 'swap'>('enter');
  const [proto, setProto] = useState<ProtoState | null>(startView);

  // Login
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [failed, setFailed] = useState(false);
  const [loading, setLoading] = useState(false);
  // Recuperar
  const [recEmail, setRecEmail] = useState(routeState?.email ?? '');
  const [recError, setRecError] = useState('');
  const [recLoading, setRecLoading] = useState(false);
  const [sentTo, setSentTo] = useState(routeState?.email || SAMPLE_EMAIL);
  const [resendIn, setResendIn] = useState(RESEND_SECONDS);

  const emailRef = useRef<HTMLInputElement>(null);
  const passRef = useRef<HTMLInputElement>(null);
  const recRef = useRef<HTMLInputElement>(null);
  const alertRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  // Ao chegar por navegação interna (ex.: "Esqueci minha senha"), o foco vai para o primeiro campo.
  const focusNext = useRef<'heading' | 'email' | 'rec' | 'alert' | null>(
    routeState ? (startView === 'recover' ? 'rec' : startView === 'sent' ? 'heading' : 'email') : null,
  );
  const [formRef, shakeForm] = useReplayClass<HTMLFormElement>('shake', reduce);
  const [recFormRef, shakeRec] = useReplayClass<HTMLFormElement>('shake', reduce);

  useEffect(() => {
    const target = focusNext.current;
    focusNext.current = null;
    if (target === 'email') emailRef.current?.focus();
    else if (target === 'rec') recRef.current?.focus();
    else if (target === 'alert') alertRef.current?.focus();
    else if (target === 'heading') headingRef.current?.focus();
  });

  // Contagem para reenviar o link
  useEffect(() => {
    if (view !== 'sent' || resendIn <= 0) return;
    const id = window.setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => window.clearTimeout(id);
  }, [view, resendIn]);

  function go(next: View, focus: typeof focusNext.current = 'heading') {
    setAnim('swap');
    setView(next);
    focusNext.current = focus;
  }

  function resetLogin() {
    clear();
    setLoading(false);
    setFailed(false);
    setErrors({});
  }

  function validateLogin(e = email, p = password): boolean {
    const next = { email: emailError(e), password: p ? '' : 'Digite sua senha.' };
    setErrors(next);
    if (next.email || next.password) {
      (next.email ? emailRef : passRef).current?.focus();
      shakeForm();
      return false;
    }
    return true;
  }

  function showLoginError() {
    setLoading(false);
    setPassword('');
    setFailed(true);
    focusNext.current = 'alert';
    shakeForm();
  }

  function onLogin(ev: FormEvent) {
    ev.preventDefault();
    if (loading || !validateLogin()) return;
    setFailed(false);
    setLoading(true);
    const started = Date.now();
    signIn(email, password).then((client) => {
      // Espera mínima para o estado "Entrando…" ser percebido.
      later(() => {
        if (client) navigate(next, { replace: true });
        else showLoginError();
      }, Math.max(0, 700 - (Date.now() - started)));
    });
  }

  function enterDemo() {
    signInDemo();
    navigate(next, { replace: true });
  }

  function onRecover(ev: FormEvent) {
    ev.preventDefault();
    if (recLoading) return;
    const err = emailError(recEmail);
    setRecError(err);
    if (err) { recRef.current?.focus(); shakeRec(); return; }
    setRecLoading(true);
    later(() => { setRecLoading(false); openSent(recEmail.trim()); }, 1100);
  }

  function openSent(address: string) {
    setSentTo(address || SAMPLE_EMAIL);
    setResendIn(RESEND_SECONDS);
    go('sent');
    setProto('sent');
  }

  function toRecover() {
    clear();
    navigate('/forgot-password', { state: { email } });
  }

  function toLogin() {
    clear();
    navigate('/login', { state: {} });
  }

  function onProto(s: ProtoState) {
    setProto(s);
    clear();
    setRecLoading(false);
    if (mode === 'login' && (s === 'recover' || s === 'sent')) {
      navigate('/forgot-password', { state: { email: email || undefined, sent: s === 'sent' } });
      return;
    }
    if (s === 'recover') { setRecError(''); go('recover', 'rec'); return; }
    if (s === 'sent') { openSent(recEmail.trim() || SAMPLE_EMAIL); return; }
    if (mode === 'recover') { navigate('/login'); return; }
    resetLogin();
    if (view !== 'login') go('login', 'email');
    if (s === 'login') return;
    if (s === 'invalid') { setEmail(''); setPassword(''); validateLogin('', ''); return; }
    if (!email) setEmail(SAMPLE_EMAIL);
    if (s === 'error') showLoginError();
    if (s === 'loading') { if (!password) setPassword('senha-exemplo'); setLoading(true); }
  }

  const sectionClass = `view ${anim}`;

  return (
    <AuthLayout
      footer={<p className="legal">Ao entrar, você concorda com os <a href="#termos">Termos de uso</a> e a <a href="#privacidade">Política de privacidade</a>.</p>}
      aside={<LoginAside />}
      proto={<ProtoBar states={PROTO} active={proto} onSelect={onProto} />}
    >
      <div className="stage stage--center">
        {view === 'login' && (
          <section key="login" className={sectionClass} aria-labelledby="login-t">
            <h1 id="login-t" ref={headingRef} tabIndex={-1} style={cssVars({ '--i': 0 })}>Que bom te ver de novo.</h1>
            <p className="sub" style={cssVars({ '--i': 1 })}>{context ?? 'Entre para reservar seu espaço e acompanhar suas reservas.'}</p>

            <div className="alert" role="alert" tabIndex={-1} ref={alertRef} hidden={!failed}>
              <Alert />
              <div><b>E-mail ou senha incorretos.</b><p>Confira e tente de novo, ou recupere sua senha.</p></div>
            </div>

            <form ref={formRef} onSubmit={onLogin} noValidate style={cssVars({ '--i': 3 })}>
              <TextField
                ref={emailRef}
                id="email"
                label="E-mail"
                type="email"
                autoComplete="username"
                inputMode="email"
                placeholder="nome@email.com"
                value={email}
                readOnly={loading}
                error={errors.email}
                onChange={(e) => { setEmail(e.target.value); if (errors.email) setErrors((x) => ({ ...x, email: emailError(e.target.value) })); }}
                onBlur={() => { if (email) setErrors((x) => ({ ...x, email: emailError(email) })); }}
              />
              <PasswordField
                ref={passRef}
                id="password"
                label="Senha"
                autoComplete="current-password"
                value={password}
                readOnly={loading}
                error={errors.password}
                labelAside={<button className="link-btn" type="button" onClick={toRecover}>Esqueci minha senha</button>}
                onChange={(e) => { setPassword(e.target.value); if (e.target.value) setErrors((x) => ({ ...x, password: '' })); }}
              />
              <button className="btn btn-primary" type="submit" aria-busy={loading} disabled={loading}>
                {loading ? <><span className="spinner" aria-hidden="true" /><span>Entrando…</span></> : <><span>Entrar</span><ArrowRight className="arrow" /></>}
              </button>
            </form>

            <div className="divider" style={cssVars({ '--i': 4 })}>ou</div>
            <p className="signup" style={cssVars({ '--i': 5 })}>
              Ainda não tem conta? <Link to={`/signup${intent ? `?intent=${intent}` : ''}`}>Criar conta grátis</Link>
            </p>
            <div className="demo-entry" style={cssVars({ '--i': 6 })}>
              <button className="btn btn-soft" type="button" onClick={enterDemo}>Entrar com a conta de exemplo</button>
              <p>Protótipo: entra como Ana, membro do plano Profissional, com reservas e pontos de exemplo.</p>
            </div>
            <p className="team-note" style={cssVars({ '--i': 7 })}>
              <Team /><span>É da equipe do coworking? Entre por aqui também. O sistema abre o painel certo para o seu perfil.</span>
            </p>
          </section>
        )}

        {view === 'recover' && (
          <section key="recover" className={sectionClass} aria-labelledby="rec-t">
            <span className="badge-proto">Fluxo a confirmar na spec</span>
            <h1 id="rec-t" ref={headingRef} tabIndex={-1}>Vamos criar uma senha nova.</h1>
            <p className="sub">Informe o e-mail da sua conta. Enviamos um link para você criar outra senha.</p>
            <form ref={recFormRef} onSubmit={onRecover} noValidate>
              <TextField
                ref={recRef}
                id="rec-email"
                label="E-mail"
                type="email"
                autoComplete="username"
                inputMode="email"
                placeholder="nome@email.com"
                value={recEmail}
                readOnly={recLoading}
                error={recError}
                onChange={(e) => { setRecEmail(e.target.value); if (recError) setRecError(emailError(e.target.value)); }}
              />
              <button className="btn btn-primary" type="submit" aria-busy={recLoading} disabled={recLoading}>
                {recLoading ? <><span className="spinner" aria-hidden="true" /><span>Enviando…</span></> : <span>Enviar link</span>}
              </button>
              <button className="btn btn-soft" type="button" onClick={toLogin}>Voltar para o login</button>
            </form>
          </section>
        )}

        {view === 'sent' && (
          <section key="sent" className={sectionClass} aria-labelledby="sent-t">
            <div className="done-icon mail" aria-hidden="true"><Mail /></div>
            <h1 id="sent-t" ref={headingRef} tabIndex={-1}>Confira seu e-mail.</h1>
            <p className="sub">Se houver uma conta com <span className="mail-box">{sentTo}</span>, você vai receber um link para criar uma nova senha.</p>
            <button className="btn btn-primary" type="button" onClick={toLogin}>Voltar para o login</button>
            <p className="resend" aria-live="polite">
              {resendIn > 0 ? (
                <>Não chegou? Você pode reenviar em <b>{resendIn}</b> s.</>
              ) : (
                <button className="link-btn" type="button" onClick={() => setResendIn(RESEND_SECONDS)}>Reenviar link</button>
              )}
            </p>
          </section>
        )}

      </div>
    </AuthLayout>
  );
}

function LoginAside() {
  const perks = [
    { icon: <Calendar />, title: 'Suas reservas num lugar só', text: 'Próximas, passadas e canceladas, com o estado de cada uma.' },
    { icon: <Wallet />, title: 'Pagamentos sem surpresa', text: 'O que já foi pago, o que falta e até quando pagar.' },
    { icon: <Leaf />, title: 'Seus pontos verdes', text: 'O saldo e quanto falta para o próximo desconto.' },
  ];
  const { cost, progress, canRedeem, missing } = redeemProgress(DEMO_MEMBER.points);
  return (
    <aside className="aside aside--stack" aria-label="O que você encontra depois de entrar">
      <Mark className="big-mark" />
      <h2>Seu espaço <span>está te esperando.</span></h2>
      <ul className="perks">
        {perks.map((p) => (
          <li key={p.title}><span className="ic" aria-hidden="true">{p.icon}</span><div><b>{p.title}</b><span>{p.text}</span></div></li>
        ))}
      </ul>
      <div className="next" aria-label="Exemplo da próxima reserva">
        <div className="next-top">
          <p>Próxima reserva (exemplo)</p>
          <span className="state"><Check />Confirmada</span>
        </div>
        <h3>Sala Aurora</h3>
        <div className="res-meta">
          <span><Calendar />Terça, 14/10</span>
          <span><Clock />14:00 às 16:00</span>
          <span>R$ 128,00 com 20% do plano</span>
        </div>
        <div className="next-points">
          <b>{DEMO_MEMBER.points}</b>
          <div>
            <span>pontos verdes · {canRedeem ? 'já valem 10% de desconto' : `faltam ${missing} para 10% de desconto`}</span>
            <div className="next-bar" role="img" aria-label={`${progress} de ${cost} pontos para o próximo desconto`}><i style={{ width: `${(progress / cost) * 100}%` }} /></div>
          </div>
        </div>
      </div>
    </aside>
  );
}
