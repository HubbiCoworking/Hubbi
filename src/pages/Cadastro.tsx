import { useEffect, useRef, useState, type FormEvent, type MouseEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Alert, ArrowRight, Check, Dot, Leaf, Receipt, Search, Tag } from '../components/Icons';
import { Mark } from '../components/Mark';
import { ProtoBar } from '../components/ProtoBar';
import { AuthLayout } from '../features/auth/AuthLayout';
import { FieldError, PasswordField, TextField } from '../features/auth/fields';
import { useTimers } from '../features/auth/useTimers';
import { useReducedMotion, useReplayClass } from '../lib/motion';
import { cssVars } from '../lib/style';
import { useDocumentTitle } from '../lib/useDocumentTitle';
import { createClient } from '../store/store';
import {
  documentError,
  emailError,
  maskDocument,
  maskPhone,
  nameError,
  newPasswordError,
  onlyDigits,
  passwordRules,
  phoneError,
} from '../lib/validation';

type Key = 'nome' | 'doc' | 'tel' | 'email' | 'senha' | 'termos';
type Values = { nome: string; doc: string; tel: string; email: string; senha: string; termos: boolean };
type Errors = Partial<Record<Key, string>>;
type ProtoState = 'form' | 'filled' | 'invalid' | 'dup' | 'loading' | 'done';

const LABELS: Record<Key, string> = {
  nome: 'Nome completo', doc: 'CPF ou CNPJ', tel: 'Celular com DDD', email: 'E-mail', senha: 'Senha', termos: 'Termos de uso',
};
const ORDER: Key[] = ['nome', 'doc', 'tel', 'email', 'senha', 'termos'];
const EMPTY: Values = { nome: '', doc: '', tel: '', email: '', senha: '', termos: false };
/** Dados fictícios para a barra de estados (CPF de teste válido). */
const SAMPLE: Values = { nome: 'Ana Souza', doc: '529.982.247-25', tel: '(11) 91234-5678', email: 'ana.souza@email.com', senha: 'reserva2026', termos: true };

const PROTO: { id: ProtoState; label: string }[] = [
  { id: 'form', label: 'Padrão' },
  { id: 'filled', label: 'Preenchido' },
  { id: 'invalid', label: 'Erros nos campos' },
  { id: 'dup', label: 'Já cadastrado' },
  { id: 'loading', label: 'Carregando' },
  { id: 'done', label: 'Conta criada' },
];

const CONTEXT: Record<string, string> = {
  book: 'Crie a conta para concluir sua reserva. Depois é só confirmar o espaço.',
  plan: 'Crie a conta para pedir o seu plano. A recepção ativa quando registrar o pagamento.',
};

function errorFor(key: Key, v: Values): string {
  switch (key) {
    case 'nome': return nameError(v.nome);
    case 'doc': return documentError(v.doc);
    case 'tel': return phoneError(v.tel);
    case 'email': return emailError(v.email);
    case 'senha': return newPasswordError(v.senha);
    case 'termos': return v.termos ? '' : 'Para criar a conta, aceite os Termos de uso e a Política de privacidade.';
  }
}

/** T01 Cadastro (/signup). F01; FR-001, FR-019; RN14; MSG-01. */
export default function Cadastro() {
  useDocumentTitle('Criar conta · Hubbi');
  const reduce = useReducedMotion();
  const { later, clear } = useTimers();
  const [params] = useSearchParams();
  const intent = params.get('intent') ?? '';

  const [values, setValues] = useState<Values>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [summary, setSummary] = useState<Key[]>([]);
  const [duplicate, setDuplicate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [anim, setAnim] = useState<'enter' | 'swap'>('enter');
  const [proto, setProto] = useState<ProtoState | null>('form');

  const refs = {
    nome: useRef<HTMLInputElement>(null),
    doc: useRef<HTMLInputElement>(null),
    tel: useRef<HTMLInputElement>(null),
    email: useRef<HTMLInputElement>(null),
    senha: useRef<HTMLInputElement>(null),
    termos: useRef<HTMLInputElement>(null),
  };
  const summaryRef = useRef<HTMLDivElement>(null);
  const dupRef = useRef<HTMLDivElement>(null);
  const doneHeading = useRef<HTMLHeadingElement>(null);
  const focusNext = useRef<'summary' | 'dup' | 'done' | null>(null);
  const [formRef, shake] = useReplayClass<HTMLFormElement>('shake', reduce);

  useEffect(() => {
    const t = focusNext.current;
    focusNext.current = null;
    if (t === 'summary') summaryRef.current?.focus();
    else if (t === 'dup') dupRef.current?.focus();
    else if (t === 'done') doneHeading.current?.focus();
  });

  const set = <K extends Key>(key: K, value: Values[K]) => {
    const next = { ...values, [key]: value };
    setValues(next);
    if (errors[key]) setErrors((e) => ({ ...e, [key]: errorFor(key, next) }));
  };
  const blur = (key: Key) => {
    if (values[key]) setErrors((e) => ({ ...e, [key]: errorFor(key, values) }));
  };

  function validateAll(v: Values = values): boolean {
    setDuplicate(false);
    const next: Errors = {};
    ORDER.forEach((k) => { next[k] = errorFor(k, v); });
    setErrors(next);
    const failing = ORDER.filter((k) => next[k]);
    setSummary(failing);
    if (failing.length) { focusNext.current = 'summary'; shake(); }
    return failing.length === 0;
  }

  function finish() {
    setLoading(false);
    setAnim('swap');
    setDone(true);
    setProto('done');
    focusNext.current = 'done';
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
  }

  function onSubmit(ev: FormEvent) {
    ev.preventDefault();
    if (loading || !validateAll()) return;
    setLoading(true);
    setProto('loading');
    const started = Date.now();
    createClient({
      name: values.nome,
      email: values.email,
      document: onlyDigits(values.doc),
      phone: onlyDigits(values.tel),
      password: values.senha,
    }).then((result) => {
      later(() => {
        if (result.ok) { finish(); return; }
        // MSG-01: e-mail ou documento já cadastrado (RN14).
        setLoading(false);
        setProto('dup');
        setDuplicate(true);
        focusNext.current = 'dup';
        shake();
      }, Math.max(0, 900 - (Date.now() - started)));
    });
  }

  function jumpTo(ev: MouseEvent<HTMLAnchorElement>, key: Key) {
    ev.preventDefault();
    const el = refs[key].current;
    el?.focus();
    el?.scrollIntoView({ block: 'center', behavior: reduce ? 'auto' : 'smooth' });
  }

  function onProto(s: ProtoState) {
    setProto(s);
    clear();
    setLoading(false);
    setErrors({});
    setSummary([]);
    setDuplicate(false);
    if (s === 'done') { setValues(SAMPLE); finish(); return; }
    if (done) { setDone(false); setAnim('swap'); }
    if (s === 'form') { setValues(EMPTY); return; }
    if (s === 'filled') { setValues(SAMPLE); return; }
    if (s === 'invalid') {
      const bad: Values = { nome: 'Ana', doc: '123.456.789-00', tel: '(11) 9123', email: 'ana.souza@', senha: 'abc', termos: false };
      setValues(bad);
      validateAll(bad);
      return;
    }
    setValues(SAMPLE);
    if (s === 'dup') { setDuplicate(true); focusNext.current = 'dup'; shake(); }
    if (s === 'loading') setLoading(true);
  }

  const firstName = values.nome.trim().split(/\s+/)[0] || 'Ana';
  const docDigits = onlyDigits(values.doc).length;

  return (
    <AuthLayout aside={<SignupAside />} proto={<ProtoBar states={PROTO} active={proto} onSelect={onProto} />}>
      <div className="stage">
        {!done ? (
          <section key="form" className={`view view--wide ${anim}`} aria-labelledby="t-form">
            <h1 id="t-form" style={cssVars({ '--i': 0 })}>Crie sua conta no Hubbi.</h1>
            <p className="sub" style={cssVars({ '--i': 1 })}>{CONTEXT[intent] ?? 'Leva poucos minutos. Depois é só escolher o espaço e reservar.'}</p>
            <p className="have" style={cssVars({ '--i': 2 })}>Já tem conta? <Link to={`/login${intent ? `?intent=${intent}` : ''}`}>Entrar</Link></p>

            <div className="alert" role="alert" tabIndex={-1} ref={summaryRef} hidden={!summary.length}>
              <Alert />
              <div>
                <b>{summary.length === 1 ? 'Confira o campo marcado.' : `Confira os ${summary.length} campos marcados.`}</b>
                <ul>{summary.map((k) => <li key={k}><a href={`#${k}`} onClick={(e) => jumpTo(e, k)}>{LABELS[k]}</a></li>)}</ul>
              </div>
            </div>

            <div className="alert" role="alert" tabIndex={-1} ref={dupRef} hidden={!duplicate}>
              <Alert />
              <div>
                <b>Já existe uma conta com esses dados.</b>
                <p>Entre ou recupere sua senha.</p>
                <div className="actions">
                  <Link className="solid" to="/login">Entrar</Link>
                  <Link className="line" to="/forgot-password" state={{ email: values.email.trim() || undefined }}>Recuperar senha</Link>
                </div>
              </div>
            </div>

            <form ref={formRef} className="form--sections" onSubmit={onSubmit} noValidate style={cssVars({ '--i': 3 })}>
              <fieldset>
                <legend><span className="step" aria-hidden="true">1</span>Seus dados</legend>
                <TextField ref={refs.nome} id="nome" label="Nome completo" type="text" autoComplete="name" maxLength={100}
                  value={values.nome} readOnly={loading} error={errors.nome}
                  onChange={(e) => set('nome', e.target.value)} onBlur={() => blur('nome')} />
                <TextField ref={refs.doc} id="doc" label="CPF ou CNPJ" type="text" inputMode="numeric" autoComplete="off"
                  placeholder={docDigits > 11 ? '00.000.000/0000-00' : '000.000.000-00'}
                  help="Use CNPJ se a conta for de empresa ou organização."
                  value={values.doc} readOnly={loading} error={errors.doc}
                  onChange={(e) => set('doc', maskDocument(e.target.value))} onBlur={() => blur('doc')} />
                <TextField ref={refs.tel} id="tel" label="Celular com DDD" type="tel" autoComplete="tel-national" inputMode="tel"
                  placeholder="(11) 91234-5678"
                  value={values.tel} readOnly={loading} error={errors.tel}
                  onChange={(e) => set('tel', maskPhone(e.target.value))} onBlur={() => blur('tel')} />
              </fieldset>

              <fieldset>
                <legend><span className="step" aria-hidden="true">2</span>Acesso</legend>
                <TextField ref={refs.email} id="email" label="E-mail" type="email" autoComplete="email" inputMode="email"
                  placeholder="nome@email.com"
                  value={values.email} readOnly={loading} error={errors.email}
                  onChange={(e) => set('email', e.target.value)} onBlur={() => blur('email')} />
                <PasswordField ref={refs.senha} id="senha" label="Crie uma senha" autoComplete="new-password"
                  value={values.senha} readOnly={loading} error={errors.senha}
                  onChange={(e) => set('senha', e.target.value)} onBlur={() => blur('senha')}
                  belowId="senha-rules"
                  below={
                    <ul className="rules" id="senha-rules" aria-label="Regras da senha">
                      {passwordRules.map((r) => {
                        const met = r.test(values.senha);
                        return (
                          <li key={r.id} className={met ? 'met' : ''}>
                            {met ? <Check /> : <Dot />}
                            <span>{r.label}</span>
                            {met && <span className="sr-only"> (cumprida)</span>}
                          </li>
                        );
                      })}
                    </ul>
                  }
                />
              </fieldset>

              <div className="field">
                <label className="check" htmlFor="termos">
                  <input ref={refs.termos} type="checkbox" id="termos" checked={values.termos} disabled={loading}
                    aria-invalid={errors.termos ? true : false} aria-describedby="termos-err"
                    onChange={(e) => set('termos', e.target.checked)} />
                  <span>Li e aceito os <a href="#termos">Termos de uso</a> e a <a href="#privacidade">Política de privacidade</a>.</span>
                </label>
                <FieldError id="termos-err" message={errors.termos} />
              </div>

              <button className="btn btn-primary" type="submit" aria-busy={loading} disabled={loading}>
                {loading ? <><span className="spinner" aria-hidden="true" /><span>Criando sua conta…</span></> : <><span>Criar minha conta</span><ArrowRight className="arrow" /></>}
              </button>
              <p className="free-note"><b>Cadastro sem custo.</b> Você só paga pelo que reservar.</p>
            </form>
          </section>
        ) : (
          <section key="done" className={`view view--wide ${anim}`} aria-labelledby="t-done">
            <div className="done-icon" aria-hidden="true"><Check /></div>
            <h1 id="t-done" ref={doneHeading} tabIndex={-1}>Conta criada, {firstName}!</h1>
            <p className="sub">Enviamos uma mensagem de boas-vindas para <b>{values.email.trim() || SAMPLE.email}</b>.</p>
            <div className="kind">
              <span>Sua conta agora</span>
              <p><b>Cliente avulso.</b> Você reserva qualquer espaço pagando o valor cheio, na recepção. Com um plano, ganha de 10% a 30% de desconto em toda reserva.</p>
            </div>
            <div className="done-actions">
              {intent === 'plan' ? (
                <Link className="btn btn-primary" to="/app/plan">Escolher meu plano <ArrowRight className="arrow" /></Link>
              ) : (
                <Link className="btn btn-primary" to="/app/spaces">Escolher meu espaço <ArrowRight className="arrow" /></Link>
              )}
              <Link className="btn btn-soft" to="/app">Ir para o início</Link>
            </div>
          </section>
        )}
      </div>
    </AuthLayout>
  );
}

function SignupAside() {
  const perks = [
    { icon: <Search />, title: 'Filtre pelo que precisa', text: 'Tomadas, internet, quadro branco, acessibilidade.' },
    { icon: <Receipt />, title: 'Preço final antes de confirmar', text: 'E a multa ou o estorno antes de cancelar.' },
    { icon: <Leaf />, title: 'Pontos verdes', text: 'Comparece, ganha pontos, troca por desconto.' },
    { icon: <Tag />, title: 'Plano Social', text: 'Para estudantes, microempreendedores e ONGs.' },
  ];
  return (
    <aside className="aside aside--stack" aria-label="O que você ganha com a conta">
      <Mark className="big-mark" />
      <h2>Uma conta, <span>e o espaço é seu.</span></h2>
      <ul className="perks">
        {perks.map((p) => (
          <li key={p.title}><span className="ic" aria-hidden="true">{p.icon}</span><div><b>{p.title}</b><span>{p.text}</span></div></li>
        ))}
      </ul>
      <p className="hand-note" aria-hidden="true">Só o necessário, prometido!</p>
      <div className="why">
        <h3>Por que pedimos cada dado</h3>
        <dl>
          <div><dt>CPF ou CNPJ: </dt><dd>garante uma conta por pessoa ou empresa.</dd></div>
          <div><dt>Celular: </dt><dd>a recepção avisa você sobre a sua reserva.</dd></div>
          <div><dt>E-mail: </dt><dd>é o seu login e recebe confirmações e lembretes.</dd></div>
        </dl>
        <p className="lgpd">Sua senha fica guardada de forma cifrada. Você pode pedir a exclusão dos seus dados quando quiser.</p>
      </div>
    </aside>
  );
}
