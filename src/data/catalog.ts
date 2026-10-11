/* Dados de exemplo do protótipo (fictícios). Valores seguem o data-model.md da spec 001. */

export type SpaceType = 'room' | 'desk' | 'station';

/** Grupos de características da RN20. */
export type FeatureGroup = 'environment' | 'equipment' | 'accessibility' | 'sustainability';

export type Space = {
  id: string;
  name: string;
  type: SpaceType;
  /** Tipo e andar para exibir, ex.: "Sala de reunião · 3º andar". */
  kind: string;
  floor: string;
  seats: number;
  outlets: number;
  computers: number;
  /** Internet contratada, em Mbps (informativo; RN20). */
  mbps: number;
  features: Record<FeatureGroup, string[]>;
  hourly: number;
  /** Foto ilustrativa (public/spaces/{id}-640.webp e -1200.webp). O texto alternativo descreve o
   *  que se vê, para quem usa leitor de tela; os números e itens já aparecem em texto no cartão. */
  photo: { alt: string; credit: string };
};

export const SPACE_TYPE_LABEL: Record<SpaceType, string> = { room: 'Salas', desk: 'Mesas', station: 'Estações' };

/** Listas padrão da RN20 (ajustáveis pelo administrador). */
export const FEATURE_OPTIONS: Record<FeatureGroup, { title: string; items: string[] }> = {
  environment: { title: 'Ambiente', items: ['Ar-condicionado', 'Ventilação natural', 'Luz natural', 'Silencioso'] },
  equipment: { title: 'Equipamentos', items: ['Quadro branco', 'TV ou tela', 'Projetor', 'Videoconferência', 'Monitor extra', 'Impressora', 'Cabo de rede'] },
  accessibility: { title: 'Acessibilidade', items: ['Acesso sem degraus', 'Banheiro adaptado', 'Piso tátil', 'Vaga reservada', 'Intérprete sob pedido'] },
  sustainability: { title: 'Práticas sustentáveis', items: ['Iluminação LED', 'Coleta seletiva', 'Sem descartáveis', 'Energia eficiente'] },
};

const f = (environment: string[], equipment: string[], accessibility: string[], sustainability: string[]) =>
  ({ environment, equipment, accessibility, sustainability });

export const SPACES: Space[] = [
  { id: 'sala-aurora', name: 'Sala Aurora', type: 'room', kind: 'Sala de reunião · 3º andar', floor: '3º andar', seats: 8, outlets: 8, computers: 0, mbps: 300,
    features: f(['Luz natural', 'Ar-condicionado'], ['TV ou tela', 'Quadro branco'], ['Acesso sem degraus', 'Banheiro adaptado'], ['Iluminação LED']), hourly: 80,
    photo: { alt: 'Sala de reunião com mesa comprida, cadeiras pretas, quadro branco na parede e janelas do chão ao teto.', credit: 'Mateusz Zatorski' } },
  { id: 'sala-esmeralda', name: 'Sala Esmeralda', type: 'room', kind: 'Sala de reunião · 3º andar', floor: '3º andar', seats: 10, outlets: 10, computers: 0, mbps: 300,
    features: f(['Ar-condicionado'], ['TV ou tela', 'Videoconferência'], ['Acesso sem degraus'], ['Iluminação LED', 'Coleta seletiva']), hourly: 95,
    photo: { alt: 'Sala de reunião com mesa oval de madeira, cadeiras de couro caramelo e parede de vidro.', credit: 'S O C I A L . C U T' } },
  { id: 'sala-ruby', name: 'Sala Ruby', type: 'room', kind: 'Sala de reunião · 1º andar', floor: '1º andar', seats: 6, outlets: 6, computers: 0, mbps: 200,
    features: f(['Luz natural', 'Ventilação natural'], ['Quadro branco', 'TV ou tela'], [], ['Sem descartáveis']), hourly: 60,
    photo: { alt: 'Sala ampla com mesa de reunião, cadeiras rosadas e janelas grandes dos dois lados.', credit: 'Nastuh Abootalebi' } },
  { id: 'estacao-norte', name: 'Estação Norte', type: 'station', kind: 'Estação de trabalho · 2º andar', floor: '2º andar', seats: 4, outlets: 12, computers: 4, mbps: 500,
    features: f(['Ventilação natural', 'Luz natural'], ['Monitor extra', 'Cabo de rede', 'Quadro branco'], ['Acesso sem degraus', 'Banheiro adaptado'], ['Iluminação LED', 'Coleta seletiva']), hourly: 40,
    photo: { alt: 'Bancadas de madeira com computadores de tela grande, luminárias e janelas ao fundo.', credit: 'Annie Spratt' } },
  { id: 'estacao-sul', name: 'Estação Sul', type: 'station', kind: 'Estação de trabalho · 2º andar', floor: '2º andar', seats: 4, outlets: 8, computers: 2, mbps: 300,
    features: f(['Ar-condicionado'], ['Cabo de rede', 'Impressora'], ['Acesso sem degraus'], ['Energia eficiente']), hourly: 35,
    photo: { alt: 'Salão com fileiras de mesas, computadores e divisórias baixas entre os lugares.', credit: 'Petr' } },
  { id: 'mesa-12', name: 'Mesa 12', type: 'desk', kind: 'Hot-desk · 2º andar', floor: '2º andar', seats: 1, outlets: 2, computers: 0, mbps: 100,
    features: f(['Silencioso'], [], ['Acesso sem degraus'], []), hourly: 15,
    photo: { alt: 'Mesa individual escura junto a uma parede de tijolos, com notebook, monitor e cadeira clara.', credit: 'Jonathan Kemper' } },
  { id: 'mesa-14', name: 'Mesa 14', type: 'desk', kind: 'Hot-desk · 2º andar', floor: '2º andar', seats: 1, outlets: 2, computers: 0, mbps: 100,
    features: f(['Luz natural'], [], ['Acesso sem degraus', 'Piso tátil'], ['Iluminação LED']), hourly: 15,
    photo: { alt: 'Bancada branca junto à janela, com notebook, bancos altos e uma planta grande.', credit: 'Alesia Kazantceva' } },
  { id: 'cabine-foco', name: 'Cabine Foco', type: 'station', kind: 'Estação individual · 1º andar', floor: '1º andar', seats: 1, outlets: 2, computers: 0, mbps: 200,
    features: f(['Silencioso'], ['Monitor extra'], [], ['Iluminação LED']), hourly: 20,
    photo: { alt: 'Cabine fechada de vidro e paredes brancas, com mesa e assento para uma pessoa, dentro de um escritório.', credit: 'Uneebo Office Design' } },
];

/** Etiquetas curtas do cartão: números e depois equipamentos e ambiente. */
export function spaceTags(s: Space): string[] {
  return [
    `${s.seats} ${s.seats > 1 ? 'lugares' : 'lugar'}`,
    `${s.outlets} tomadas`,
    `${s.mbps} Mbps`,
    ...(s.computers ? [`${s.computers} computador${s.computers > 1 ? 'es' : ''}`] : []),
    ...s.features.equipment,
    ...s.features.environment,
  ];
}

export type NeedId = 'meeting' | 'focus' | 'dev' | 'creative';

/** Atalhos de necessidade (RN20): combinações de filtros que a pessoa pode ajustar. */
export const NEEDS: { id: NeedId; label: string; preset: Partial<Filters> }[] = [
  { id: 'meeting', label: 'Reunião de equipe', preset: { minSeats: 6, equipment: ['TV ou tela'] } },
  { id: 'focus', label: 'Foco individual', preset: { environment: ['Silencioso'] } },
  { id: 'dev', label: 'Desenvolvimento', preset: { minOutlets: 6, minMbps: 200, equipment: ['Monitor extra'] } },
  { id: 'creative', label: 'Criativo e marketing', preset: { equipment: ['Quadro branco', 'TV ou tela'], environment: ['Luz natural'] } },
];

/** Filtros da busca (RN20): mínimos nos números e itens das listas, todos combinados. */
export type Filters = {
  type: SpaceType | 'all';
  minSeats: number;
  minOutlets: number;
  minMbps: number;
  minComputers: number;
} & Record<FeatureGroup, string[]>;

export const EMPTY_FILTERS: Filters = {
  type: 'all', minSeats: 0, minOutlets: 0, minMbps: 0, minComputers: 0,
  environment: [], equipment: [], accessibility: [], sustainability: [],
};

export type Plan = {
  id: string;
  name: string;
  discount: number;
  price: number;
  description: string;
  social?: boolean;
  /** Duração em dias (data-model: todos os planos de exemplo têm 30 dias). */
  days?: number;
};

export const PLAN_DAYS = 30;

/** Categorias do Plano Social (RN19, padrão ajustável pelo administrador). */
export const SOCIAL_CATEGORIES = [
  { id: 'student', label: 'Estudante' },
  { id: 'micro', label: 'Microempreendedor' },
  { id: 'nonprofit', label: 'Organização sem fins lucrativos' },
] as const;

/** Observação curta do pedido do Plano Social: a gerência avalia; mantemos o texto conciso. */
export const SOCIAL_NOTE_MAX = 140;

/** Planos (RN13, RN19). Valores de exemplo, ajustáveis pelo administrador. */
export const PLANS: Plan[] = [
  { id: 'essencial', name: 'Essencial', discount: 10, price: 120, description: 'Para quem usa o espaço algumas vezes por mês.' },
  { id: 'profissional', name: 'Profissional', discount: 20, price: 250, description: 'Para quem trabalha daqui toda semana.' },
  { id: 'equipe', name: 'Equipe', discount: 30, price: 480, description: 'Para times que reservam salas de reunião com frequência.' },
  { id: 'social', name: 'Social', discount: 30, price: 60, social: true, description: 'Para estudantes, microempreendedores e organizações sem fins lucrativos. A recepção confirma o direito e não guarda seus comprovantes.' },
];

/** Opções de plano do simulador (inclui avulso). */
export const SIM_PLANS: { id: string; name: string; discount: number }[] = [
  { id: 'avulso', name: 'Avulso', discount: 0 },
  ...PLANS.map((p) => ({ id: p.id, name: p.name, discount: p.discount })),
];

/** Pontos verdes (RN22). */
export const GREEN_POINTS = { redeemCost: 100, redeemDiscount: 10, perCompleted: 10 } as const;

/** Cancelamento (RN07): multa entre 24h e 2h antes. */
export const LATE_CANCEL_FEE = 0.5;

/** Exemplo fixo usado na demonstração e no login. */
export const DEMO_MEMBER = { firstName: 'Ana', planName: 'Profissional', planDiscount: 20, points: 140 } as const;
