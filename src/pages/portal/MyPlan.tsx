import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Check, Clock, Close, Tag } from '../../components/Icons';
import { ProtoBar } from '../../components/ProtoBar';
import { PLAN_DAYS, PLANS, SOCIAL_CATEGORIES, SOCIAL_NOTE_MAX, type Plan } from '../../data/catalog';
import type { SocialCategory, Subscription } from '../../domain/types';
import { Dialog } from '../../features/portal/Dialog';
import { daysBetween, ddmmyyyy } from '../../lib/dates';
import { brl } from '../../lib/format';
import { useDocumentTitle } from '../../lib/useDocumentTitle';
import {
  activeSubscription, cancelPlanRenewal, keepPlan, lastRejected, planById, registerPlanPayment, requestPlan,
  requestedSubscription, resetDemoData, reviewSocial, scheduledSubscription, sessionClient, simulateNearExpiry,
  useDB, withdrawRequest,
} from '../../store/store';

const NEAR_DAYS = 5;
type ProtoAction = 'approve' | 'reject' | 'pay' | 'near' | 'reset';
type Draft = { plan: Plan; kind: 'new' | 'change' | 'renewal' };

const CATEGORY_LABEL = Object.fromEntries(SOCIAL_CATEGORIES.map((c) => [c.id, c.label])) as Record<SocialCategory, string>;

/** T28 Meu plano + T29 Solicitar plano (/app/plan). FR-013, FR-022; RN13, RN16, RN19.
 *  Textos: MSG-21 e MSG-22 (ui-messages, seção 6). */
export default function MyPlan() {
  useDocumentTitle('Meu plano · Hubbi');
  const db = useDB();
  const client = sessionClient(db)!;
  const now = new Date();
  const current = activeSubscription(db, client.id, now);
  const scheduled = scheduledSubscription(db, client.id, now);
  const pending = requestedSubscription(db, client.id);
  const rejected = lastRejected(db, client.id);
  const showRejected = !current && !pending && rejected !== null;

  const [draft, setDraft] = useState<Draft | null>(null);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [toast, setToast] = useState<{ text: string; tone: 'ok' | 'err' } | null>(null);
  const plansRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 6000);
    return () => window.clearTimeout(t);
  }, [toast]);

  const end = current ? new Date(current.sub.end) : null;
  const daysLeft = end ? daysBetween(now, end) : 0;
  const near = current !== null && daysLeft <= NEAR_DAYS;
  const canRenew = near && !current!.sub.cancelAtEnd && !pending && !scheduled;

  const goToPlans = () => {
    plansRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    plansRef.current?.querySelector<HTMLElement>('button:not([disabled])')?.focus({ preventScroll: true });
  };

  const send = (d: Draft, social?: { category: SocialCategory; note?: string }) => {
    const r = requestPlan({ clientId: client.id, planId: d.plan.id, kind: d.kind, social });
    setDraft(null);
    if (!r.ok) { setToast({ tone: 'err', text: 'Você já tem um pedido em andamento. Desista dele antes de fazer outro.' }); return; }
    setToast({
      tone: 'ok',
      text: d.plan.social
        ? `Solicitação enviada. A gerência analisa o Plano Social; depois a recepção registra o pagamento de ${brl(d.plan.price)}.`
        : `Solicitação enviada. O plano é ativado quando a recepção registrar o pagamento de ${brl(d.plan.price)}.`,
    });
  };

  // Renovação: mesmo resumo antes de enviar; no Plano Social a elegibilidade é revista (RN19).
  const renew = () => { if (current) setDraft({ plan: current.plan, kind: 'renewal' }); };

  // Ações simuladas da equipe (PRD 6.3): gerência analisa o Plano Social, recepção registra o pagamento.
  const proto: { id: ProtoAction; label: string }[] = [
    ...(pending?.social?.review === 'pending' ? [{ id: 'approve' as const, label: 'Gerência aprova o Plano Social' }, { id: 'reject' as const, label: 'Gerência recusa o Plano Social' }] : []),
    ...(pending && (!pending.social || pending.social.review === 'approved') ? [{ id: 'pay' as const, label: `Recepção registra pagamento de ${brl(pending.price ?? 0)}` }] : []),
    ...(current && !near ? [{ id: 'near' as const, label: 'Simular: faltam 3 dias para vencer' }] : []),
    { id: 'reset', label: 'Restaurar dados de exemplo' },
  ];

  const onProto = (a: ProtoAction) => {
    if (a === 'reset') { resetDemoData(); setToast({ tone: 'ok', text: 'Dados de exemplo restaurados.' }); return; }
    if (a === 'near') { simulateNearExpiry(client.id); setToast({ tone: 'ok', text: 'Protótipo: o plano agora vence em 3 dias.' }); return; }
    if (!pending) return;
    if (a === 'approve') { reviewSocial(pending.id, true); setToast({ tone: 'ok', text: 'A gerência aprovou o Plano Social. Falta a recepção registrar o pagamento.' }); return; }
    if (a === 'reject') {
      reviewSocial(pending.id, false, 'A categoria informada não foi confirmada pela gerência.');
      setToast({ tone: 'ok', text: 'A gerência recusou o Plano Social.' });
      return;
    }
    const r = registerPlanPayment(pending.id);
    setToast(r.ok
      ? { tone: 'ok', text: pending.kind === 'new' ? `Pagamento registrado: plano ${planById(pending.planId)?.name} ativo.` : `Pagamento registrado: o plano ${planById(pending.planId)?.name} começa em ${ddmmyyyy(new Date(pending.start))}.` }
      : { tone: 'err', text: 'O Plano Social precisa da aprovação da gerência antes do pagamento.' });
  };

  return (
    <>
      <div className="myplan">
        <header className="page-head">
          <div>
            <h1>Meu plano</h1>
            <p className="sub">Com um plano, você paga menos em toda reserva. Você pede por aqui e a recepção ativa quando registrar o pagamento.</p>
          </div>
        </header>

        <div className="dt-grid">
          <div className="dt-main">
            {current ? (
              <section className={`card plan-now${near ? ' near' : ''}`} aria-labelledby="pn-t">
                <div className="pn-top">
                  <div>
                    <p className="eyebrow">Seu plano</p>
                    <h2 id="pn-t">{current.plan.name}</h2>
                  </div>
                  {current.sub.cancelAtEnd
                    ? <span className="status status--cancelled"><Close />Renovação cancelada</span>
                    : <span className="status status--confirmed"><Check />Ativo</span>}
                </div>
                <p className="pn-big">{current.plan.discount}%<small>de desconto em toda reserva</small></p>
                <dl className="pn-facts">
                  <div><dt>Valor</dt><dd>{brl(current.plan.price)} a cada {current.plan.days ?? PLAN_DAYS} dias</dd></div>
                  <div><dt>Vigência</dt><dd>{ddmmyyyy(new Date(current.sub.start))} a {ddmmyyyy(end!)}</dd></div>
                  <div><dt>Vence</dt><dd className={near ? 'warn-text' : ''}>{daysLeft === 0 ? 'hoje' : daysLeft === 1 ? 'amanhã' : `em ${daysLeft} dias`}</dd></div>
                </dl>

                {current.sub.cancelAtEnd ? (
                  <p className="after-row warn"><Alert /><span>O plano segue até {ddmmyyyy(end!)} e não será renovado. Depois disso, suas reservas valem o preço cheio.</span></p>
                ) : near && !pending && !scheduled ? (
                  <p className="after-row warn"><Clock /><span>Seu plano vence {daysLeft <= 1 ? (daysLeft === 0 ? 'hoje' : 'amanhã') : `em ${daysLeft} dias`}. Renove para manter o desconto a partir de {ddmmyyyy(end!)}.</span></p>
                ) : null}

                {scheduled && (
                  <p className="after-row ok"><Check /><span>A partir de {ddmmyyyy(new Date(scheduled.start))}: plano {planById(scheduled.planId)?.name}, já pago.</span></p>
                )}

                <div className="pn-actions">
                  {canRenew && <button type="button" className="btn btn-primary" onClick={renew}>Renovar plano · {brl(current.plan.price)}</button>}
                  {current.sub.cancelAtEnd ? (
                    <button type="button" className="btn btn-primary" onClick={() => { keepPlan(client.id); setToast({ tone: 'ok', text: 'Pronto: seu plano volta a poder ser renovado.' }); }}>Manter meu plano</button>
                  ) : (
                    <>
                      <button type="button" className="btn btn-soft" onClick={goToPlans} disabled={!!pending}>Trocar de plano</button>
                      <button type="button" className="btn btn-danger-soft" onClick={() => setCancelOpen(true)}>Cancelar plano</button>
                    </>
                  )}
                </div>
              </section>
            ) : (
              <section className="card plan-none" aria-labelledby="pnone-t">
                <span className="state-icon" aria-hidden="true"><Tag /></span>
                <h2 id="pnone-t">Você está sem plano.</h2>
                <p className="muted">Hoje suas reservas valem o preço cheio. Com um plano, você paga de 10% a 30% menos em toda reserva, em qualquer espaço.</p>
              </section>
            )}

            {showRejected && (
              <p className="after-row warn" role="status"><Alert /><span><b>A gerência recusou o seu pedido do Plano Social.</b> {rejected!.social?.reason} Você continua como cliente avulso e pode escolher outro plano abaixo.</span></p>
            )}

            {pending && <RequestStatus sub={pending} onWithdraw={() => { withdrawRequest(pending.id); setToast({ tone: 'ok', text: 'Pedido cancelado. Nada foi cobrado.' }); }} />}

            <section className="plans-pick" aria-labelledby="pp-t" ref={plansRef}>
              <div className="card-head">
                <h2 id="pp-t">{current ? 'Trocar de plano' : 'Escolha um plano'}</h2>
                {pending && <span className="muted small">Você já tem um pedido em andamento.</span>}
              </div>
              <ul className="plan-grid">
                {PLANS.map((p) => {
                  const isCurrent = current?.plan.id === p.id;
                  const disabled = isCurrent || !!pending || !!current?.sub.cancelAtEnd;
                  const label = isCurrent ? 'Seu plano atual' : current ? `Trocar para o ${p.name}` : p.social ? 'Pedir o Plano Social' : `Contratar o ${p.name}`;
                  return (
                    <li key={p.id} className={`plan-opt${p.social ? ' social' : ''}${isCurrent ? ' current' : ''}`}>
                      {p.social && <span className="badge-soc">Preço social</span>}
                      <h3>{p.name}</h3>
                      <p className="po-pct">{p.discount}%<small>de desconto</small></p>
                      <p className="po-price"><b>{brl(p.price)}</b> a cada {p.days ?? PLAN_DAYS} dias</p>
                      <p className="po-desc">{p.description}</p>
                      <button type="button" className={`btn ${p.social && !disabled ? 'btn-primary' : 'btn-soft'}`} disabled={disabled} onClick={() => setDraft({ plan: p, kind: current ? 'change' : 'new' })}>{label}</button>
                    </li>
                  );
                })}
              </ul>
              {current?.sub.cancelAtEnd && <p className="muted small">Para trocar de plano, primeiro clique em "Manter meu plano".</p>}
            </section>
          </div>

          <aside className="dt-side">
            <section className="card" aria-labelledby="how-t">
              <h2 id="how-t">Como funciona</h2>
              <ol className="steps">
                <li><span>1</span><p>Você escolhe o plano e envia o pedido. Nada é cobrado aqui.</p></li>
                <li><span>2</span><p>No Plano Social, a gerência confere se você tem direito.</p></li>
                <li><span>3</span><p>Você paga na recepção e o plano é ativado na hora.</p></li>
              </ol>
            </section>
            <section className="card" aria-labelledby="rules-t">
              <h2 id="rules-t">Bom saber</h2>
              <ul className="conf-notes">
                <li><Check /><span>Um plano por vez. A troca vale a partir do vencimento do plano atual.</span></li>
                <li><Check /><span>Cancelar não devolve o valor pago: o plano segue até o vencimento e só não renova.</span></li>
                <li><Check /><span>Reservas já feitas mantêm o valor gravado, com ou sem plano.</span></li>
                <li><Check /><span>Plano Social: leve um comprovante à recepção. Ninguém guarda cópia do documento.</span></li>
              </ul>
            </section>
          </aside>
        </div>
      </div>

      {draft && (
        <RequestDialog
          draft={draft}
          currentEnd={end}
          currentSocial={draft.kind === 'renewal' ? current?.sub.social : undefined}
          onClose={() => setDraft(null)}
          onConfirm={(social) => send(draft, social)}
        />
      )}

      {cancelOpen && current && (
        <Dialog title={`Cancelar o plano ${current.plan.name}?`} describedBy="cp-text" onClose={() => setCancelOpen(false)}>
          <p id="cp-text" className="cd-lead cd-lead--half">Não há devolução do valor pago. O plano continua até {ddmmyyyy(end!)}; cancelar só impede a renovação, e a troca vale a partir dessa data.</p>
          {(pending || scheduled) && <p className="muted small">O pedido em andamento e a troca agendada também deixam de valer.</p>}
          <div className="dialog-actions">
            <button type="button" className="btn btn-soft" onClick={() => setCancelOpen(false)}>Voltar</button>
            <button type="button" className="btn btn-danger" onClick={() => { cancelPlanRenewal(client.id); setCancelOpen(false); setToast({ tone: 'ok', text: `Plano cancelado. O desconto vale até ${ddmmyyyy(end!)}.` }); }}>Cancelar plano</button>
          </div>
        </Dialog>
      )}

      {toast && (
        <div className={`toast toast--${toast.tone}`} role="status">
          {toast.tone === 'ok' ? <Check /> : <Alert />}<span>{toast.text}</span>
          <button type="button" aria-label="Fechar aviso" onClick={() => setToast(null)}><Close /></button>
        </div>
      )}
      <ProtoBar states={proto} active={null} onSelect={onProto} />
    </>
  );
}

/** Pedido em andamento: etapas até o plano valer (RN13, RN19). */
function RequestStatus({ sub, onWithdraw }: { sub: Subscription; onWithdraw: () => void }) {
  const plan = planById(sub.planId);
  const social = sub.social;
  const steps = [
    ...(social ? [{ label: 'Análise da gerência', done: social.review === 'approved', now: social.review === 'pending' }] : []),
    { label: `Pagamento de ${brl(sub.price ?? 0)} na recepção`, done: false, now: !social || social.review === 'approved' },
    { label: sub.kind === 'new' ? 'Plano ativo' : `Plano vale a partir de ${ddmmyyyy(new Date(sub.start))}`, done: false, now: false },
  ];
  const title = { new: `Pedido do plano ${plan?.name}`, change: `Troca para o plano ${plan?.name}`, renewal: `Renovação do plano ${plan?.name}` }[sub.kind ?? 'new'];
  return (
    <section className="card req" aria-labelledby="req-t">
      <div className="card-head">
        <h2 id="req-t">{title}</h2>
        <span className="status status--pending"><Clock />Em andamento</span>
      </div>
      <ol className="req-steps">
        {steps.map((s) => (
          <li key={s.label} className={s.done ? 'done' : s.now ? 'now' : ''}>
            <span aria-hidden="true">{s.done ? <Check /> : null}</span>
            <p>{s.label}{s.done && <span className="sr-only"> (concluído)</span>}{s.now && <span className="sr-only"> (etapa atual)</span>}</p>
          </li>
        ))}
      </ol>
      {social && (
        <p className="muted small">Categoria: <b>{CATEGORY_LABEL[social.category]}</b>{social.note ? ` · Observação: “${social.note}”` : ''}</p>
      )}
      <p className="muted">Solicitação enviada. O plano é ativado quando a recepção registrar o pagamento de {brl(sub.price ?? 0)}.</p>
      <button type="button" className="link-btn" onClick={onWithdraw}>Desistir do pedido</button>
    </section>
  );
}

/** T29: resumo do plano antes de enviar o pedido. Plano Social pede categoria e observação curta. */
function RequestDialog({ draft, currentEnd, currentSocial, onClose, onConfirm }: {
  draft: Draft; currentEnd: Date | null; currentSocial?: Subscription['social'];
  onClose: () => void; onConfirm: (social?: { category: SocialCategory; note?: string }) => void;
}) {
  const { plan, kind } = draft;
  const [category, setCategory] = useState<SocialCategory | null>(currentSocial?.category ?? null);
  const [note, setNote] = useState(currentSocial?.note ?? '');
  const [error, setError] = useState('');
  const startText = useMemo(() => (kind !== 'new' && currentEnd ? `em ${ddmmyyyy(currentEnd)}, no vencimento do plano atual` : 'quando a recepção registrar o pagamento'), [kind, currentEnd]);

  const confirm = () => {
    if (plan.social && !category) { setError('Escolha a categoria para a gerência analisar o pedido.'); return; }
    onConfirm(plan.social && category ? { category, note } : undefined);
  };

  return (
    <Dialog title={kind === 'change' ? `Trocar para o plano ${plan.name}?` : kind === 'renewal' ? `Renovar o plano ${plan.name}?` : `Pedir o plano ${plan.name}?`} describedBy="rd-rows" onClose={onClose}>
      <dl className="bn-rows" id="rd-rows">
        <div><dt>Desconto</dt><dd>{plan.discount}% em toda reserva</dd></div>
        <div><dt>Duração</dt><dd>{plan.days ?? PLAN_DAYS} dias</dd></div>
        <div><dt>Começa</dt><dd className="wrap">{startText}</dd></div>
        <div className="sum"><dt>Valor</dt><dd>{brl(plan.price)}</dd></div>
      </dl>
      {kind === 'change' && currentEnd && (
        <p className="cd-lead cd-lead--half">Não há devolução do valor pago. O plano atual continua até {ddmmyyyy(currentEnd)}, e a troca vale a partir dessa data.</p>
      )}

      {plan.social && (
        <fieldset className="soc-fields">
          <legend>Qual é a sua categoria?</legend>
          <div className="seg">
            {SOCIAL_CATEGORIES.map((c) => (
              <span key={c.id}>
                <input type="radio" name="soc-cat" id={`soc-${c.id}`} checked={category === c.id} onChange={() => { setCategory(c.id); setError(''); }} aria-invalid={error ? true : undefined} aria-describedby={error ? 'soc-err' : undefined} />
                <label htmlFor={`soc-${c.id}`}>{c.label}</label>
              </span>
            ))}
          </div>
          {error && <p className="field-err" id="soc-err" role="alert"><Alert />{error}</p>}
          <label className="soc-note-label" htmlFor="soc-note">Observação para a gerência <span className="muted">(opcional)</span></label>
          <textarea id="soc-note" rows={2} maxLength={SOCIAL_NOTE_MAX} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ex.: curso e instituição, ou nome da organização" aria-describedby="soc-count soc-help" />
          <p className="soc-meta"><span id="soc-help">Seja breve. Leve um comprovante à recepção; ninguém guarda cópia.</span><span id="soc-count" aria-live="polite">{note.length}/{SOCIAL_NOTE_MAX}</span></p>
        </fieldset>
      )}

      <div className="dialog-actions">
        <button type="button" className="btn btn-soft" onClick={onClose}>Voltar</button>
        <button type="button" className="btn btn-primary" onClick={confirm}>Enviar solicitação</button>
      </div>
    </Dialog>
  );
}
