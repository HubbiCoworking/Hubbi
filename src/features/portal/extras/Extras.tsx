import { useState } from 'react';
import { Alert, Check, Clock, Close, Leaf } from '../../../components/Icons';
import { DIET_LABEL, EXTRAS, EXTRAS_MAX_QTY, extraById, PURPOSES, purposeLabel } from '../../../data/extras';
import {
  chosenLines, draftTotals, maxPointsUnits, orderTotals, suggestedDraft, withPeople, withPointsUnits, withQty,
  type ExtrasDraft,
} from '../../../domain/extras';
import type { ExtrasLine, ExtrasOrder, Purpose } from '../../../domain/types';
import { brl } from '../../../lib/format';
import { Dialog } from '../Dialog';

/* Comodidades (spec 002): cartão do resumo (T07), painel de escolha (T48) e situação do pedido
   (T08, T12). Textos MSG-27 a MSG-31. */

export const MSG_DELIVERY = 'Entregamos no seu espaço durante a reserva.';
export const MSG_SEPARATE = 'As comodidades são uma cobrança separada, paga na recepção. O desconto do plano vale só para o espaço.';

const perLabel = (per: 'person' | 'unit') => (per === 'person' ? 'por pessoa' : 'por unidade');

/** Quantidade com − e +, cada botão com o nome do que muda (WCAG 2.5.3, 4.1.2). */
export function Stepper({ label, value, min, max, onChange, unit }: {
  label: string; value: number; min: number; max: number; onChange: (v: number) => void; unit?: string;
}) {
  return (
    <div className="qty" role="group" aria-label={label}>
      <button type="button" aria-label={`Diminuir ${label}`} disabled={value <= min} onClick={() => onChange(value - 1)}>−</button>
      <output aria-live="polite">{value}{unit ? <span className="sr-only"> {unit}</span> : null}</output>
      <button type="button" aria-label={`Aumentar ${label}`} disabled={value >= max} onClick={() => onChange(value + 1)}>+</button>
    </div>
  );
}

// ---------- T48 Escolher comodidades ----------

type PickerProps = {
  initial: ExtrasDraft;
  /** Lugares do espaço: máximo de pessoas (RN26). */
  seats: number;
  /** Pontos que podem ir para itens (RN22 ampliada). */
  balance: number;
  /** Mostra finalidade e pessoas no painel (T12, onde não há o cartão do resumo). */
  withSetup?: boolean;
  confirmLabel: string;
  onConfirm: (draft: ExtrasDraft) => void;
  onClose: () => void;
};

export function ExtrasPicker({ initial, seats, balance, withSetup = false, confirmLabel, onConfirm, onClose }: PickerProps) {
  const [draft, setDraft] = useState(initial);
  const totals = draftTotals(draft);

  return (
    <Dialog title="Escolher comodidades" describedBy="xp-desc" onClose={onClose}>
      <p className="muted" id="xp-desc">{MSG_DELIVERY} Preço fixo, sem desconto do plano.</p>

      {withSetup && (
        <div className="xp-setup">
          <label className="sf" htmlFor="xp-purpose">
            <span className="sf-label">Para que você vai usar o espaço?</span>
            <select id="xp-purpose" value={draft.purpose ?? ''} onChange={(e) => setDraft({ ...draft, purpose: (e.target.value || null) as Purpose | null })}>
              <option value="">Não informar</option>
              {PURPOSES.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
            </select>
          </label>
          <div className="sf">
            <span className="sf-label" id="xp-people-l">Quantas pessoas?</span>
            <Stepper label="pessoas" value={draft.people} min={1} max={seats} onChange={(v) => setDraft(withPeople(draft, v))} />
          </div>
        </div>
      )}

      <ul className="xp-list">
        {EXTRAS.map((item) => {
          const line = draft.lines[item.id];
          const qty = line?.qty ?? 0;
          const max = maxPointsUnits(draft, item.id, balance);
          return (
            <li key={item.id} className={qty > 0 ? 'on' : ''}>
              <div className="xp-info">
                <p className="xp-name">{item.name}</p>
                <p className="xp-desc">{item.description}</p>
                <p className="xp-price">
                  <b>{brl(item.price)}</b> {perLabel(item.per)}
                  {item.points !== null && <> · ou <b>{item.points} pontos</b></>}
                </p>
                {item.diet.length > 0 && (
                  <ul className="xp-diet" aria-label="Restrições alimentares atendidas">
                    {item.diet.map((d) => <li key={d}>{DIET_LABEL[d]}</li>)}
                  </ul>
                )}
              </div>
              <div className="xp-ctrl">
                <Stepper label={item.name} value={qty} min={0} max={EXTRAS_MAX_QTY} onChange={(v) => setDraft(withQty(draft, item.id, v))} unit={qty === 1 ? 'unidade' : 'unidades'} />
                {item.points !== null && qty > 0 && (
                  <div className="xp-points">
                    <span id={`xp-pts-${item.id}`}><Leaf className="inline-ic" />Com pontos</span>
                    <Stepper label={`unidades de ${item.name} pagas com pontos`} value={line!.pointsUnits} min={0} max={Math.max(line!.pointsUnits, max)} onChange={(v) => setDraft(withPointsUnits(draft, item.id, v))} />
                    {line!.pointsUnits >= max && line!.pointsUnits < qty && (
                      <small className="xp-limit">Você tem {balance} pontos. Dá para pagar {max} {max === 1 ? 'unidade' : 'unidades'} com pontos.</small>
                    )}
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      <label className="switch-row" htmlFor="xp-nodisp">
        <span><b>Sem descartáveis</b><small>Servimos em canecas e copos da casa.</small></span>
        <input type="checkbox" role="switch" id="xp-nodisp" checked={draft.noDisposables} onChange={(e) => setDraft({ ...draft, noDisposables: e.target.checked })} />
      </label>

      <div className="xp-foot">
      <p className="xp-total" aria-live="polite">
        <span>{totals.units === 0 ? 'Nenhum item escolhido' : `${totals.units} ${totals.units === 1 ? 'item' : 'itens'}`}</span>
        <b>{brl(totals.money)}</b>
        {totals.points > 0 && <small>e {totals.points} pontos verdes (você tem {balance})</small>}
      </p>
      <div className="dialog-actions">
        <button type="button" className="btn btn-soft" onClick={onClose}>Voltar</button>
        <button type="button" className="btn btn-primary" onClick={() => onConfirm(draft)}>{confirmLabel}</button>
      </div>
      </div>
    </Dialog>
  );
}

// ---------- T07 cartão "Comodidades" no resumo ----------

type CardProps = {
  draft: ExtrasDraft;
  onChange: (d: ExtrasDraft) => void;
  seats: number;
  balance: number;
};

export function ExtrasCard({ draft, onChange, seats, balance }: CardProps) {
  const [open, setOpen] = useState(false);
  const chosen = chosenLines(draft);
  const totals = draftTotals(draft);
  const suggestion = draft.purpose ? chosenLines(suggestedDraft(draft.purpose, draft.people)) : [];
  const suggestionTotal = draft.purpose ? draftTotals(suggestedDraft(draft.purpose, draft.people)).money : 0;
  const hasSuggestion = suggestion.length > 0 && suggestion.some((s) => (draft.lines[s.item.id]?.qty ?? 0) !== s.qty);

  const addSuggestion = () => {
    const s = suggestedDraft(draft.purpose, draft.people);
    onChange({ ...draft, lines: { ...draft.lines, ...s.lines } });
  };

  return (
    <section className="card bn-extras" aria-labelledby="bn-extras-t">
      <p className="eyebrow">Comodidades</p>
      <h2 id="bn-extras-t" className="xp-title">Café e snacks durante a reserva <span className="muted">(opcional)</span></h2>

      <fieldset className="arrival">
        <legend>Para que você vai usar o espaço?</legend>
        <div className="seg">
          {PURPOSES.map((p) => (
            <span key={p.id}>
              <input type="radio" name="purpose" id={`pur-${p.id}`} checked={draft.purpose === p.id} onChange={() => onChange({ ...draft, purpose: p.id })} />
              <label htmlFor={`pur-${p.id}`}>{p.label}</label>
            </span>
          ))}
        </div>
        {draft.purpose && <p className="muted small"><button type="button" className="link-btn" onClick={() => onChange({ ...draft, purpose: null })}>Não informar a finalidade</button></p>}
      </fieldset>

      <div className="xp-people">
        <span className="sf-label">Quantas pessoas?</span>
        <Stepper label="pessoas" value={draft.people} min={1} max={seats} onChange={(v) => onChange(withPeople(draft, v))} />
        <span className="muted small">Até {seats} {seats === 1 ? 'lugar' : 'lugares'} neste espaço.</span>
      </div>

      {hasSuggestion && (
        <div className="xp-suggest">
          <p><b>Sugestão para {purposeLabel(draft.purpose!).toLowerCase()}:</b> {suggestion.map((s) => `${s.qty}× ${s.item.name}`).join(' e ')} · {brl(suggestionTotal)}</p>
          <button type="button" className="btn btn-soft" onClick={addSuggestion}>Adicionar sugestão</button>
        </div>
      )}

      {chosen.length > 0 ? (
        <ul className="xp-chosen" aria-label="Itens escolhidos">
          {chosen.map((l) => (
            <li key={l.item.id}>
              <span>{l.qty}× {l.item.name}{l.pointsUnits > 0 && <small> · {l.pointsUnits} com pontos</small>}</span>
              <b>{brl((l.qty - l.pointsUnits) * l.item.price)}</b>
            </li>
          ))}
        </ul>
      ) : (
        <p className="muted small">Nenhum item escolhido.</p>
      )}

      <button type="button" className="btn btn-soft xp-open" aria-haspopup="dialog" onClick={() => setOpen(true)}>
        {chosen.length ? 'Alterar itens' : 'Escolher itens'}
      </button>
      <p className="after-row"><Clock /><span>{MSG_DELIVERY}</span></p>
      {totals.units > 0 && <p className="muted small">{MSG_SEPARATE}</p>}

      {open && (
        <ExtrasPicker
          initial={draft}
          seats={seats}
          balance={balance}
          confirmLabel="Usar estes itens"
          onConfirm={(d) => { onChange(d); setOpen(false); }}
          onClose={() => setOpen(false)}
        />
      )}
    </section>
  );
}

// ---------- T08 e T12: situação do pedido ----------

const STATE: Record<ExtrasLine['state'], { label: string; cls: string }> = {
  to_deliver: { label: 'A entregar', cls: 'status--pending' },
  delivered: { label: 'Entregue', cls: 'status--confirmed' },
  cancelled: { label: 'Cancelado', cls: 'status--cancelled' },
};

type StatusProps = {
  order: ExtrasOrder | null;
  /** T12: mostra pedir e cancelar. */
  canOrder?: boolean;
  editable?: boolean;
  onAdd?: () => void;
  onCancelLine?: (line: ExtrasLine) => void;
};

export function ExtrasStatus({ order, canOrder = false, editable = false, onAdd, onCancelLine }: StatusProps) {
  const t = orderTotals(order);
  if (!order && !editable) return null;
  return (
    <section className="card xp-status" aria-labelledby="xp-status-t">
      <div className="card-head">
        <h2 id="xp-status-t">Comodidades</h2>
        {order?.purpose && <span className="muted small">{purposeLabel(order.purpose)} · {order.people} {order.people === 1 ? 'pessoa' : 'pessoas'}</span>}
      </div>

      {order && order.lines.length > 0 ? (
        <ul className="xp-lines">
          {order.lines.map((l) => {
            const item = extraById(l.itemId);
            const st = STATE[l.state];
            return (
              <li key={l.id} className={l.state === 'cancelled' ? 'off' : ''}>
                <div>
                  <p className="xp-name">{l.qty}× {item?.name ?? 'Item'}</p>
                  <p className="muted small">
                    {brl((l.qty - l.pointsUnits) * l.unitPrice)}
                    {l.pointsUnits > 0 && ` · ${l.pointsUnits * (l.unitPoints ?? 0)} pontos`}
                  </p>
                </div>
                <span className={`status ${st.cls}`}>{l.state === 'delivered' ? <Check /> : l.state === 'cancelled' ? <Close /> : <Clock />}{st.label}</span>
                {editable && l.state === 'to_deliver' && (
                  <button type="button" className="btn btn-danger-soft xp-cancel" onClick={() => onCancelLine?.(l)} aria-label={`Cancelar ${item?.name ?? 'item'}`}>Cancelar</button>
                )}
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="muted">Nenhuma comodidade pedida.</p>
      )}

      {order && t.active > 0 && (
        <dl className="bn-rows">
          <div><dt>Comodidades (cobrança separada)</dt><dd>{brl(t.due)}</dd></div>
          {t.points > 0 && <div className="minus"><dt>Pagos com pontos</dt><dd>{t.points} pontos</dd></div>}
          <div><dt>{t.open > 0 ? 'A pagar na recepção' : 'Situação'}</dt><dd>{t.open > 0 ? brl(t.open) : 'Pago'}</dd></div>
        </dl>
      )}
      {order?.noDisposables && <p className="after-row"><Leaf /><span>Sem descartáveis: servimos em canecas e copos da casa.</span></p>}

      {editable && (canOrder ? (
        <>
          <p className="after-row"><Clock /><span>{MSG_DELIVERY} Item ainda não entregue pode ser cancelado sem custo.</span></p>
          <button type="button" className="btn btn-soft" aria-haspopup="dialog" onClick={onAdd}>Pedir itens</button>
        </>
      ) : (
        <p className="locked"><Alert /><span>Esta reserva já terminou. Não é possível pedir comodidades.</span></p>
      ))}
    </section>
  );
}
