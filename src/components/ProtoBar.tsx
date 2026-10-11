const SHOW = import.meta.env.VITE_SHOW_PROTO !== 'false';

type Props<T extends string> = {
  states: { id: T; label: string }[];
  active: T | null;
  onSelect: (id: T) => void;
};

/** Barra flutuante para revisar os estados de uma tela. Some com VITE_SHOW_PROTO=false. */
export function ProtoBar<T extends string>({ states, active, onSelect }: Props<T>) {
  if (!SHOW) return null;
  return (
    <nav className="proto" aria-label="Estados do protótipo">
      <span>Estados do protótipo</span>
      {states.map((s) => (
        <button key={s.id} type="button" aria-pressed={active === s.id} onClick={() => onSelect(s.id)}>
          {s.label}
        </button>
      ))}
    </nav>
  );
}
