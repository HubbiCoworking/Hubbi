import { EMPTY_FILTERS, type FeatureGroup, type Filters, type Space } from '../data/catalog';

const GROUPS: FeatureGroup[] = ['environment', 'equipment', 'accessibility', 'sustainability'];

/** Um critério ativo, com o texto que a pessoa lê e como removê-lo. */
export type Criterion = { key: string; label: string; remove: (f: Filters) => Filters };

const TYPE_LABEL = { room: 'Só salas', desk: 'Só mesas', station: 'Só estações' } as const;

/** Lista os critérios ativos (para os chips de filtro e para achar o que mais limita). */
export function activeCriteria(f: Filters): Criterion[] {
  const out: Criterion[] = [];
  if (f.type !== 'all') out.push({ key: 'type', label: TYPE_LABEL[f.type], remove: (x) => ({ ...x, type: 'all' }) });
  if (f.minSeats) out.push({ key: 'minSeats', label: `${f.minSeats} lugares ou mais`, remove: (x) => ({ ...x, minSeats: 0 }) });
  if (f.minOutlets) out.push({ key: 'minOutlets', label: `${f.minOutlets} tomadas ou mais`, remove: (x) => ({ ...x, minOutlets: 0 }) });
  if (f.minMbps) out.push({ key: 'minMbps', label: `${f.minMbps} Mbps ou mais`, remove: (x) => ({ ...x, minMbps: 0 }) });
  if (f.minComputers) out.push({ key: 'minComputers', label: `${f.minComputers} computador${f.minComputers > 1 ? 'es' : ''} ou mais`, remove: (x) => ({ ...x, minComputers: 0 }) });
  for (const g of GROUPS) {
    for (const item of f[g]) {
      out.push({ key: `${g}:${item}`, label: item, remove: (x) => ({ ...x, [g]: x[g].filter((i) => i !== item) }) });
    }
  }
  return out;
}

/** RN20: o espaço precisa atender a TODOS os critérios. Característica ausente não passa. */
export function matchesFilters(s: Space, f: Filters): boolean {
  if (f.type !== 'all' && s.type !== f.type) return false;
  if (s.seats < f.minSeats || s.outlets < f.minOutlets || s.mbps < f.minMbps || s.computers < f.minComputers) return false;
  return GROUPS.every((g) => f[g].every((item) => s.features[g].includes(item)));
}

/** RN20: sem resultado, aponta o critério cuja retirada devolve mais espaços. */
export function mostRestrictive(spaces: Space[], f: Filters): { criterion: Criterion; count: number } | null {
  let best: { criterion: Criterion; count: number } | null = null;
  for (const c of activeCriteria(f)) {
    const count = spaces.filter((s) => matchesFilters(s, c.remove(f))).length;
    if (count > 0 && (!best || count > best.count)) best = { criterion: c, count };
  }
  return best;
}

export const applyPreset = (preset: Partial<Filters>): Filters => ({ ...EMPTY_FILTERS, ...preset });
