
export interface AIResponse {
  mensagem_chat: string;
  sugestao_upsell: boolean;
  item_sugerido: string;
  valor_total: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: AIResponse;
}

export interface SplitRule {
  walletId: string;
  fixedValue?: number;
  percentualValue?: number;
  recipient: 'PLATFORM' | 'PARTNER';
}

export interface SubAccount {
  id: string;
  name: string;
  email: string;
  cpfCnpj: string;
  status: 'ACTIVE' | 'PENDING' | 'BLOCKED';
  balance: number;
  splitConfig: {
    platformFixed: number; // Taxa de conveniência integral da NightFlow
    partnerPercent: number; // Percentual do remanescente para o parceiro (geralmente 100%)
  };
}

export interface Transaction {
  id: string;
  date: string;
  customer: string;
  amount: number;
  platformFee: number;
  status: 'CONFIRMED' | 'PENDING' | 'REFUNDED';
  type: 'TICKET' | 'COMBO' | 'RESERVATION';
}

export interface Reservation {
  id: string;
  customerName: string;
  type: string;
  peopleCount: number;
  status: 'PAID' | 'PENDING' | 'CHECKED_IN';
}

export interface PromoterSale {
  id: string;
  description: string;
  amount: number;
  commission: number;
  date: string;
}

export interface Promoter {
  id: string;
  name: string;
  level: 'Silver' | 'Gold' | 'Diamond';
  avatar: string;
  totalSales: number;
  totalCommission: number;
  refCode: string;
  recentSales: PromoterSale[];
}
