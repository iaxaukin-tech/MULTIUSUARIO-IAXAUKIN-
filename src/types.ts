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
  isTelemetryLimited?: boolean;
  allowedTotalAnalyses?: number;
  totalAnalysesCount?: number;
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
  isTelemetryLimited?: boolean;
  allowedTotalAnalyses?: number;
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
      'Hasta 150 análisis con IA al mes (Cupo de 5 diarios)',
      'Ventana de modelado temporal de 60 minutos',
      'Identificación de soporte y desequilibrio general',
      'Vectores de entrada con cálculo de 10 pips'
    ],
    color: 'emerald-400',
    bgColor: 'rgba(16, 185, 129, 0.1)'
  },
  PRO: {
    id: 'PRO',
    name: 'Socio Pro',
    price: '$79 / Mes',
    features: [
      'Hasta 900 análisis con IA al mes (Cupo de 30 diarios)',
      'Prioridad de procesamiento (Sin tiempos de espera)',
      'Identificación avanzada de BOS, CHoCH y desequilibrios',
      'Soporte técnico individual de alta prioridad 24/7',
      'Sugerencias para lotaje y gestión cuantitativa'
    ],
    color: 'brand-lime',
    bgColor: 'rgba(204, 255, 0, 0.1)'
  },
  INSTITUTIONAL: {
    id: 'INSTITUTIONAL',
    name: 'Socio Institucional',
    price: 'A Consultar',
    features: [
      'Múltiples beneficios para Academias, Comunidades o Equipos',
      'Hasta 3,000 análisis de alta precisión al mes (100 diarios)',
      'Automatización vía Webhooks: retransmisión de análisis en tiempo real a tu comunidad (Telegram, Discord, etc.)',
      'Condiciones comerciales especiales y opciones de marca blanca',
      'Soporte premium dedicado y reportes de liquidez avanzada',
      'Contacto directo con Gerencia: gerencia@iaxaukin.com'
    ],
    color: 'gold',
    bgColor: 'rgba(212, 175, 55, 0.1)'
  }
};
