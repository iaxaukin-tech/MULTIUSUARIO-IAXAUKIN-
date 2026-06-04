export type SubscriptionPlan = 'RETAIL' | 'PRO' | 'INSTITUTIONAL';
export type SubscriptionStatus = 'PENDING_APPROVAL' | 'ACTIVE' | 'EXPIRED' | 'INACTIVE';

export interface User {
  id: string;
  username: string;
  email: string;
  role: 'ADMIN' | 'USER';
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  joinedAt: string;
  expiresAt?: string;
  paymentReceiptUrl?: string;
  lastAnalysisAt?: string;
  dailyUsage?: {
    date: string; // Formatted local date YYYY-MM-DD
    count: number;
  };
}

export interface ActivationCode {
  code: string;
  plan: SubscriptionPlan;
  durationDays: number;
  isUsed: boolean;
  usedBy?: string;
  createdAt: string;
}

export interface MarketPlanDetails {
  id: SubscriptionPlan;
  name: string;
  price: string;
  features: string[];
  color: string;
  bgColor: string;
}

export const PLAN_DETAILS: Record<SubscriptionPlan, MarketPlanDetails> = {
  RETAIL: {
    id: 'RETAIL',
    name: 'Socio Retail',
    price: '$29 / Mes',
    features: [
      '5 Análisis diarios de gráficos',
      'Ventana de modelado temporal (60-min)',
      'Acceso a análisis de soporte general',
      'Vectores de entrada de 10 pips'
    ],
    color: 'emerald-400',
    bgColor: 'rgba(16, 185, 129, 0.1)'
  },
  PRO: {
    id: 'PRO',
    name: 'Socio Pro',
    price: '$79 / Mes',
    features: [
      '30 Análisis diarios de gráficos con IA',
      'Prioridad de procesamiento (Bajo tiempo de espera)',
      'Identificación avanzada de BOS/CHoCH',
      'Soporte directo vía VIP Telegram',
      'Sugerencias de Lotaje Institucional'
    ],
    color: 'brand-lime',
    bgColor: 'rgba(204, 255, 0, 0.1)'
  },
  INSTITUTIONAL: {
    id: 'INSTITUTIONAL',
    name: 'Socio Institucional',
    price: '$199 / Mes',
    features: [
      '100 Análisis diarios de gráficos con IA (Alta Precisión)',
      'Reporte de Liquidez Avanzada (Order Blocks & FVG)',
      'Asesoría 1-a-1 semanal con analista senior',
      'Webhooks en tiempo real para TradingView'
    ],
    color: 'gold',
    bgColor: 'rgba(212, 175, 55, 0.1)'
  }
};
