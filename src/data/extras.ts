/* Comodidades (spec 002): cardápio, finalidades e kits sugeridos. Valores de exemplo, fictícios,
   ajustáveis pelo administrador (RN25). */
import type { Purpose } from '../domain/types';

export type Diet = 'vegan' | 'gluten_free' | 'lactose_free';

export type ExtraItem = {
  id: string;
  name: string;
  description: string;
  /** Por pessoa: acompanha "Quantas pessoas?" (RN26). Por unidade: quantidade própria. */
  per: 'person' | 'unit';
  price: number;
  /** Preço em pontos por unidade; null quando não aceita troca (RN22 ampliada). */
  points: number | null;
  diet: Diet[];
};

export const DIET_LABEL: Record<Diet, string> = { vegan: 'Vegano', gluten_free: 'Sem glúten', lactose_free: 'Sem lactose' };

export const EXTRAS: ExtraItem[] = [
  { id: 'cafe', name: 'Café coado', description: 'Uma xícara por pessoa, com açúcar e adoçante à parte.', per: 'person', price: 5, points: 30, diet: ['vegan', 'gluten_free', 'lactose_free'] },
  { id: 'cha', name: 'Chá ou infusão', description: 'Camomila, hortelã ou chá-verde.', per: 'person', price: 4, points: 25, diet: ['vegan', 'gluten_free', 'lactose_free'] },
  { id: 'agua', name: 'Água com e sem gás', description: 'Garrafa de 500 ml por pessoa.', per: 'person', price: 3, points: 20, diet: ['vegan', 'gluten_free', 'lactose_free'] },
  { id: 'pausa', name: 'Pausa café', description: 'Café, água e biscoitos amanteigados para cada pessoa.', per: 'person', price: 14, points: 80, diet: [] },
  { id: 'lanche', name: 'Lanche natural', description: 'Sanduíche no pão integral; opção vegana com homus e legumes.', per: 'person', price: 18, points: null, diet: ['vegan'] },
  { id: 'frutas', name: 'Bandeja de frutas', description: 'Frutas da estação cortadas. Serve até 6 pessoas.', per: 'unit', price: 32, points: null, diet: ['vegan', 'gluten_free', 'lactose_free'] },
  { id: 'garrafa', name: 'Garrafa térmica de café', description: 'Um litro de café coado, cerca de 8 xícaras.', per: 'unit', price: 20, points: 120, diet: ['vegan', 'gluten_free', 'lactose_free'] },
];

export const extraById = (id: string) => EXTRAS.find((e) => e.id === id);

/** Finalidades (RN24), na ordem em que aparecem. */
export const PURPOSES: { id: Purpose; label: string }[] = [
  { id: 'meeting', label: 'Reunião de equipe' },
  { id: 'focus', label: 'Foco individual' },
  { id: 'dev', label: 'Desenvolvimento' },
  { id: 'creative', label: 'Criativo e marketing' },
  { id: 'other', label: 'Outro' },
];

export const purposeLabel = (p: Purpose) => PURPOSES.find((x) => x.id === p)?.label ?? '';

/** Kit sugerido por finalidade (RN25). Sem `qty`: item por pessoa vem com o número de pessoas e
 *  item por unidade com 1. */
export const KITS: Record<Purpose, { id: string; qty?: number }[]> = {
  meeting: [{ id: 'pausa' }],
  focus: [{ id: 'cafe', qty: 1 }],
  dev: [{ id: 'cafe' }, { id: 'agua' }],
  creative: [{ id: 'pausa' }, { id: 'frutas' }],
  other: [],
};

/** Limite de unidades por item em um pedido (RN26). */
export const EXTRAS_MAX_QTY = 50;
