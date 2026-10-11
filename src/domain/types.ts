/* Entidades da spec 001 (Key Entities) no formato guardado no navegador (TRD 6.2). */

export type ClientStatus = 'active' | 'inactive';

export type Client = {
  id: string;
  name: string;
  email: string;
  document: string; // só dígitos
  phone: string; // só dígitos
  passwordHash: string | null; // null: conta de exemplo, entra pelo botão do protótipo
  passwordSalt: string | null;
  status: ClientStatus;
  createdAt: string; // ISO
};

/** Estados da reserva (RN08). */
export type BookingState = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';

export type Booking = {
  id: string;
  code: string;
  clientId: string;
  spaceId: string;
  start: string; // ISO
  end: string; // ISO
  state: BookingState;
  createdAt: string;
  // Valores congelados na criação (RN06)
  fullPrice: number;
  discountPct: number;
  planName: string | null;
  greenDiscount: number;
  finalPrice: number;
  /** Meio de chegada informado pelo cliente; a recepção confirma ao concluir (RN23). */
  arrivalMode?: ArrivalMode | null;
  /** A recepção confirmou o meio de chegada informado (RN23). */
  arrivalConfirmed?: boolean;
  /** Valor já pago, registrado pela recepção (RN12). Sem o campo, nada foi pago. */
  paid?: number;
  /** Resultado do cancelamento, gravado na hora (RN07, RN11). */
  cancellation?: {
    at: string;
    by: 'client' | 'staff' | 'system';
    feePct: number;
    fee: number;
    retained: number;
    refund: number;
    pendingFee: number;
  };
};

export type ArrivalMode = 'walk' | 'bike' | 'transit' | 'carpool' | 'electric';

/** Mudança de estado da reserva (RN09): nunca apagada. */
export type BookingHistory = {
  id: string;
  bookingId: string;
  from: BookingState | null;
  to: BookingState;
  at: string;
  by: 'client' | 'staff' | 'system';
};

/** requested: pedida pelo cliente, ainda sem efeito; active: paga (pode começar no futuro, numa
 *  troca ou renovação); rejected: Plano Social recusado pela gerência (RN19). */
export type SubscriptionStatus = 'requested' | 'active' | 'expired' | 'cancelled' | 'rejected';

export type SocialCategory = 'student' | 'micro' | 'nonprofit';

export type Subscription = {
  id: string;
  clientId: string;
  planId: string;
  start: string;
  end: string; // vencimento
  status: SubscriptionStatus;
  /** Contratação nova, troca (vale no vencimento atual) ou renovação (RN13). */
  kind?: 'new' | 'change' | 'renewal';
  /** Preço gravado na solicitação: a cobrança pendente que a recepção registra. */
  price?: number;
  requestedAt?: string;
  /** Plano ativo com renovação cancelada: segue até o vencimento, sem devolução (MSG-21). */
  cancelAtEnd?: boolean;
  /** Plano Social (RN19): categoria, observação curta e a análise da gerência. */
  social?: {
    category: SocialCategory;
    note?: string;
    review: 'pending' | 'approved' | 'rejected';
    reviewedAt?: string;
    reason?: string;
  };
};

export type PointsEntry = {
  id: string;
  clientId: string;
  date: string;
  kind: 'completed' | 'streak' | 'clean_arrival' | 'redeem' | 'refund' | 'expired';
  points: number;
  label: string;
  bookingId?: string;
};

export type StoredSpace = {
  id: string;
  name: string;
  kind: string;
  floor: string;
  seats: number;
  hourly: number;
};
