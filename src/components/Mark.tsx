/** Símbolo do Hubbi: três pessoas ao redor de uma mesa triangular.
 *  As pessoas usam currentColor; a mesa usa --mark-table (Pervinca por padrão). */
export function Mark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" aria-hidden="true" focusable="false">
      <polygon
        points="33,41 67,41 50,70"
        strokeLinejoin="round"
        strokeWidth={5}
        style={{ fill: 'var(--mark-table, #91A3DC)', stroke: 'var(--mark-table, #91A3DC)' }}
      />
      {[0, 120, 240].map((deg) => (
        <g key={deg} transform={`rotate(${deg} 50 50.7)`} fill="currentColor">
          <circle cx="50" cy="12" r="6" />
          <path d="M35 36h30c3.5 0 5.2-3 3.6-6l-3.4-5.6C63.8 22 61.8 21 59.5 21h-19c-2.3 0-4.3 1-5.7 3.4L31.4 30c-1.6 3 .1 6 3.6 6z" />
        </g>
      ))}
    </svg>
  );
}
