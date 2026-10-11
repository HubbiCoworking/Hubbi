import { forwardRef, useState, type InputHTMLAttributes, type KeyboardEvent, type ReactNode } from 'react';
import { Alert, Eye, EyeOff } from '../../components/Icons';

export function FieldError({ id, message }: { id: string; message?: string }) {
  return (
    <p className="error" id={id} hidden={!message}>
      <Alert /><span>{message}</span>
    </p>
  );
}

type TextFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> & {
  id: string;
  label: string;
  error?: string;
  help?: ReactNode;
};

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { id, label, error, help, ...input },
  ref,
) {
  const describedBy = [help ? `${id}-help` : '', `${id}-err`].filter(Boolean).join(' ');
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input ref={ref} id={id} aria-invalid={error ? true : false} aria-describedby={describedBy} {...input} />
      {help && <p className="help" id={`${id}-help`}>{help}</p>}
      <FieldError id={`${id}-err`} message={error} />
    </div>
  );
});

type PasswordFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'id' | 'type'> & {
  id: string;
  label: string;
  error?: string;
  /** Conteúdo ao lado do rótulo (ex.: "Esqueci minha senha"). */
  labelAside?: ReactNode;
  /** Conteúdo entre o campo e o erro (ex.: regras da senha). */
  below?: ReactNode;
  belowId?: string;
};

export const PasswordField = forwardRef<HTMLInputElement, PasswordFieldProps>(function PasswordField(
  { id, label, error, labelAside, below, belowId, onKeyDown, onKeyUp, onBlur, ...input },
  ref,
) {
  const [visible, setVisible] = useState(false);
  const [caps, setCaps] = useState(false);
  const checkCaps = (e: KeyboardEvent<HTMLInputElement>) => setCaps(e.getModifierState?.('CapsLock') ?? false);
  const describedBy = [belowId, `${id}-caps`, `${id}-err`].filter(Boolean).join(' ');
  return (
    <div className="field">
      {labelAside ? (
        <div className="field-row"><label htmlFor={id}>{label}</label>{labelAside}</div>
      ) : (
        <label htmlFor={id}>{label}</label>
      )}
      <div className="control has-toggle">
        <input
          ref={ref}
          id={id}
          type={visible ? 'text' : 'password'}
          aria-invalid={error ? true : false}
          aria-describedby={describedBy}
          onKeyDown={(e) => { checkCaps(e); onKeyDown?.(e); }}
          onKeyUp={(e) => { checkCaps(e); onKeyUp?.(e); }}
          onBlur={(e) => { setCaps(false); onBlur?.(e); }}
          {...input}
        />
        <button
          className="toggle"
          type="button"
          aria-label={visible ? 'Ocultar senha' : 'Mostrar senha'}
          aria-pressed={visible}
          onClick={() => setVisible((v) => !v)}
        >
          {visible ? <EyeOff /> : <Eye />}
        </button>
      </div>
      {below}
      <p className="hint" id={`${id}-caps`} hidden={!caps}><Alert />Caps Lock está ativado.</p>
      <FieldError id={`${id}-err`} message={error} />
    </div>
  );
});
