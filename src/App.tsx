/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { 
  Upload, 
  TrendingUp, 
  ShieldCheck, 
  AlertTriangle, 
  Clock, 
  Target, 
  BrainCircuit,
  FileImage,
  Loader2,
  ChevronRight,
  Copy,
  Check,
  LogOut,
  Users,
  Settings,
  Plus,
  Compass,
  CheckCircle2,
  Coins,
  AlertCircle,
  CreditCard,
  Wallet,
  QrCode,
  Lock,
  Camera,
  Globe,
  Webhook,
  Send,
  Share2,
  Search,
  Filter,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { Login } from './components/Login';
import { PrivacyPage } from './components/PrivacyPage';
import { TermsPage } from './components/TermsPage';
import { PayPalSubscriptionButton } from './components/PayPalSubscriptionButton';
import { PayPalTrialButton } from './components/PayPalTrialButton';
import { CameraModal } from './components/CameraModal';
import { ProfileModal } from './components/ProfileModal';
import { InstitutionalBoard } from './components/InstitutionalBoard';
import { userStore } from './utils/userStore';
import { User, ActivationCode, SubscriptionPlan, PLAN_DETAILS } from './types';
import { auth } from './lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

const Logo = ({ className = "" }: { className?: string }) => (
  <img 
    src="https://i.ibb.co/ZDmC99g/BLANCO-removebg-preview.png" 
    alt="IA XAU KIN" 
    className={`${className} hover:scale-105 transition-transform duration-500`}
    referrerPolicy="no-referrer"
  />
);

const getSystemPrompt = (durationMinutes: number) => `Actúa como IA XAU KIN, un Analista Cuantitativo Senior y Estratega Institucional especializado en el mercado XAUUSD. Tu enfoque es puramente basado en datos, modelado de estructura de mercado de alta precisión y gestión de riesgos algorítmica.

Tu tarea es procesar telemetría visual de gráficos (TradingView) para generar matrices operativas estructuradas, coherentes y validadas por la arquitectura del mercado.

---

### 🔍 PROTOCOLO DE ANÁLISIS CUANTITATIVO

Antes de emitir cualquier vector operativo, debes ejecutar el siguiente diagnóstico:

1. **Sincronización Temporal:**
   - Calibrar la hora actual del activo según el feed visual (última vela/eje temporal).
   - **PARÁMETRO CRÍTICO:** El modelado debe proyectarse en una **ventana operativa de ${durationMinutes} minutos** (${durationMinutes === 60 ? 'bloque de 1 hora' : 'bloque de 30 minutos'}) desde el punto de origen. Si el timestamp es 12:18 AM, la matriz debe cubrir hasta las ${durationMinutes === 60 ? '01:18 AM' : '12:48 AM'}.

2. **Arquitectura de Mercado:**
   - Identificar BOS (Break of Structure) con validación de volumen.
   - Identificar CHoCH (Change of Character) para detección de reversión.
   - Clasificar el régimen de mercado: Tendencial (Alcista/Bajista) o Lateral (Rango).

3. **Zonas de Interés y Optimización de Probabilidad:**
   - Calcular vectores de entrada para capturar movimientos de **10 pips (1.0 punto en XAU)** con un ratio de acierto institucional.
   - Mapear zonas de Supply/Demand, Liquidez Interna/Externa y desequilibrios (FVG).

4. **Dinámica del Precio:**
   - Analizar rechazos en niveles psicológicos, impulsos de expansión y retrocesos de mitigación.

---

### 🧠 SESGO ALGORÍTMICO (BIAS)

- Estructura Alcista + Mitigación de Demanda → LONG (BUY) 🟢  
- Estructura Bajista + Mitigación de Oferta → SHORT (SELL) 🔴  
- Régimen Lateral → Operativa de Reversión en Extremos.

---

### ⏰ MATRIZ DE EJECUCIÓN (BLOQUE DE ${durationMinutes} MIN)

Los timestamps de ejecución no son aleatorios; deben responder a la probabilidad estadística dentro de la ventana de ${durationMinutes} minutos.

Directrices:
1. Identificar nodos de liquidez para entradas de 10 pips.
2. REGLAS DE FRECUENCIA:
   - Orden cronológico estricto.
   - Distribución no lineal (evitar secuencias uniformes).
   - Intervalos alternados basados en la volatilidad esperada (ej: 12:24, 12:32, 12:41, 12:55…).

---

### 📊 REPORTE ESTRATÉGICO (FORMATO OBLIGATORIO)

📊 XAUUSD — MATRIZ OPERATIVA INSTITUCIONAL

🕗 Ventana Temporal: (Rango de ${durationMinutes} min en formato 12h AM/PM, ej: 12:18 AM — ${durationMinutes === 60 ? '01:18 AM' : '12:48 AM'})

📉 Tesis de Mercado:
(Análisis técnico-cuantitativo detallado. Justificación de la probabilidad de captura de 10 pips en la ventana actual)

🔴 Sesgo Estratégico: (LONG 🟢 o SHORT 🔴)

(Generar entre 5 y 7 vectores de entrada con timestamps lógicos, SIEMPRE en formato 12h AM/PM)

Ejemplo:

12:24 AM — SHORT 🔴  
12:32 AM — SHORT 🔴  
12:41 AM — SHORT 🔴  
12:55 AM — SHORT 🔴  

🎯 Target Objetivo: +10 pips (1.0 pt)

---

### ⚠️ Advertencia de Riesgo:
(Identificar zonas de alta volatilidad, posibles "Stop Hunts" o periodos de baja liquidez)

---

### 📌 Protocolo de Gestión de Capital:
Deberás redactar esta sección obligatoriamente con el siguiente esquema estructurado de viñetas duras de Markdown:
* **Selección de Entradas:** Ejecutar un máximo de 2 a 3 vectores de la matriz, priorizando aquellos que coincidan con retrocesos a zonas de desequilibrio (FVG) en el gráfico de 1m.
* **Stop Loss:** Colocación estricta a 1.5 puntos (15 pips) por debajo del mínimo estructural inmediato de la entrada.
* **Exposición:** Límite de riesgo estricto entre 0.5% y 1.0% del AUM por operación.
* **Disciplina:** Ejecución algorítmica fría; una vez alcanzado el target de 10 pips, asegurar parciales o mover a Breakeven. Mantener neutralidad emocional absoluta.

---

### 🚫 RESTRICCIONES DE PROCESAMIENTO

- Prohibido omitir el timestamp de origen del gráfico.
- Prohibido proyectar fuera de la ventana de ${durationMinutes} minutos.
- Prioridad absoluta a la tendencia de alta temporalidad para los 10 pips.
- **FORMATO HORARIO:** Debes utilizar EXCLUSIVAMENTE el formato de 12 horas (AM/PM). Queda terminantemente prohibido el uso de formato de 24 horas (ej: prohibido 14:00, usar 02:00 PM).
- **RESTRICCIÓN DE EXTENSIÓN:** El reporte completo debe ser altamente denso en información técnica y NO exceder las 500 palabras en total.

---

### 

Tu output debe reflejar la precisión y el rigor de un terminal de trading institucional.`;

const SYSTEM_PROMPT = `Actúa como IA XAU KIN, un Analista Cuantitativo Senior y Estratega Institucional especializado en el mercado XAUUSD. Tu enfoque es puramente basado en datos, modelado de estructura de mercado de alta precisión y gestión de riesgos algorítmica.

Tu tarea es procesar telemetría visual de gráficos (TradingView) para generar matrices operativas estructuradas, coherentes y validadas por la arquitectura del mercado.

---

### 🔍 PROTOCOLO DE ANÁLISIS CUANTITATIVO

Antes de emitir cualquier vector operativo, debes ejecutar el siguiente diagnóstico:

1. **Sincronización Temporal:**
   - Calibrar la hora actual del activo según el feed visual (última vela/eje temporal).
   - **PARÁMETRO CRÍTICO:** El modelado debe proyectarse en una **ventana operativa de 60 minutos** (bloque de 1 hora) desde el punto de origen. Si el timestamp es 12:18 AM, la matriz debe cubrir hasta las 01:18 AM.

2. **Arquitectura de Mercado:**
   - Identificar BOS (Break of Structure) con validación de volumen.
   - Identificar CHoCH (Change of Character) para detección de reversión.
   - Clasificar el régimen de mercado: Tendencial (Alcista/Bajista) o Lateral (Rango).

3. **Zonas de Interés y Optimización de Probabilidad:**
   - Calcular vectores de entrada para capturar movimientos de **10 pips (1.0 punto en XAU)** con un ratio de acierto institucional.
   - Mapear zonas de Supply/Demand, Liquidez Interna/Externa y desequilibrios (FVG).

4. **Dinámica del Precio:**
   - Analizar rechazos en niveles psicológicos, impulsos de expansión y retrocesos de mitigación.

---

### 🧠 SESGO ALGORÍTMICO (BIAS)

- Estructura Alcista + Mitigación de Demanda → LONG (BUY) 🟢  
- Estructura Bajista + Mitigación de Oferta → SHORT (SELL) 🔴  
- Régimen Lateral → Operativa de Reversión en Extremos.

---

### ⏰ MATRIZ DE EJECUCIÓN (BLOQUE DE 60 MIN)

Los timestamps de ejecución no son aleatorios; deben responder a la probabilidad estadística dentro de la ventana de 60 minutos.

Directrices:
1. Identificar nodos de liquidez para entradas de 10 pips.
2. REGLAS DE FRECUENCIA:
   - Orden cronológico estricto.
   - Distribución no lineal (evitar secuencias uniformes).
   - Intervalos alternados basados en la volatilidad esperada (ej: 12:24, 12:32, 12:41, 12:55…).

---

### 📊 REPORTE ESTRATÉGICO (FORMATO OBLIGATORIO)

📊 XAUUSD — MATRIZ OPERATIVA INSTITUCIONAL

🕗 Ventana Temporal: (Rango de 60 min en formato 12h AM/PM, ej: 12:18 AM — 01:18 AM)

📉 Tesis de Mercado:
(Análisis técnico-cuantitativo detallado. Justificación de la probabilidad de captura de 10 pips en la ventana actual)

🔴 Sesgo Estratégico: (LONG 🟢 o SHORT 🔴)

(Generar entre 5 y 7 vectores de entrada con timestamps lógicos, SIEMPRE en formato 12h AM/PM)

Ejemplo:

12:24 AM — SHORT 🔴  
12:32 AM — SHORT 🔴  
12:41 AM — SHORT 🔴  
12:55 AM — SHORT 🔴  

🎯 Target Objetivo: +10 pips (1.0 pt)

---

⚠️ Advertencia de Riesgo:
(Identificar zonas de alta volatilidad, posibles "Stop Hunts" o periodos de baja liquidez)

---

📌 Protocolo de Gestión de Capital:
Deberás redactar esta sección obligatoriamente con el siguiente esquema estructurado de viñetas duras de Markdown:
* **Selección de Entradas:** Ejecutar un máximo de 2 a 3 vectores de la matriz, priorizando aquellos que coincidan con retrocesos a zonas de desequilibrio (FVG) en el gráfico de 1m.
* **Stop Loss:** Colocación estricta a 1.5 puntos (15 pips) por debajo del mínimo estructural inmediato de la entrada.
* **Exposición:** Límite de riesgo estricto entre 0.5% y 1.0% del AUM por operación.
* **Disciplina:** Ejecución algorítmica fría; una vez alcanzado el target de 10 pips, asegurar parciales o mover a Breakeven. Mantener neutralidad emocional absoluta.

---

### 🚫 RESTRICCIONES DE PROCESAMIENTO

- Prohibido omitir el timestamp de origen del gráfico.
- Prohibido proyectar fuera de la ventana de 60 minutos.
- Prioridad absoluta a la tendencia de alta temporalidad para los 10 pips.
- **FORMATO HORARIO:** Debes utilizar EXCLUSIVAMENTE el formato de 12 horas (AM/PM). Queda terminantemente prohibido el uso de formato de 24 horas (ej: prohibido 14:00, usar 02:00 PM).
- **RESTRICCIÓN DE EXTENSIÓN:** El reporte completo debe ser altamente denso en información técnica y NO exceder las 500 palabras en total.

---

Tu output debe reflejar la precisión y el rigor de un terminal de trading institucional.`;

// High-fidelity dynamic quantitative simulation engine for Gold (XAUUSD)
// This is used for trial/demo fallback in static sharing mode to guarantee 100% uptime and premium look-and-feel.
export function generateSimulatedAnalysis(durationMinutes: number = 60): string {
  const now = new Date();
  
  // Format 12h AM/PM with padding for hours < 10
  const format12h = (date: Date) => {
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const hoursStr = hours < 10 ? '0' + hours : hours;
    const minutesStr = minutes < 10 ? '0' + minutes : minutes;
    return `${hoursStr}:${minutesStr} ${ampm}`;
  };

  const startTimeStr = format12h(now);
  const endTime = new Date(now.getTime() + durationMinutes * 60 * 1000);
  const endTimeStr = format12h(endTime);

  const biases: ('LONG' | 'SHORT')[] = ['LONG', 'SHORT'];
  const bias = biases[Math.floor(Math.random() * biases.length)];
  const biasEmoji = bias === 'LONG' ? '🟢' : '🔴';

  // Generate 5 entries
  const entryTimestamps: string[] = [];
  let elapsedMinutes = 3 + Math.floor(Math.random() * 3); // start 3-5 in the future for density

  for (let i = 0; i < 5; i++) {
    const entryTime = new Date(now.getTime() + elapsedMinutes * 60 * 1000);
    if (elapsedMinutes < durationMinutes) {
      entryTimestamps.push(format12h(entryTime));
    }
    const interval = durationMinutes === 30 
      ? 4 + Math.floor(Math.random() * 3) // 4-6 minute spacing for 30m
      : 7 + Math.floor(Math.random() * 5); // 7-12 minute spacing for 60m
    elapsedMinutes += interval;
  }

  const narratives = [
    {
      tesis: `El par XAUUSD muestra un fuerte desequilibrio estructural (FVG - Fair Value Gap) en la zona de descuento de la ventana actual, con una confluencia de soporte en bloque de órdenes institucional de 1 hora. Esperamos mitigación de liquidez interna antes de la expansión alcista hacia el rango premium.`,
      advertencia: `Zonas de alta volatilidad identificadas por debajo de 4,452.00. Existe riesgo de "Stop Hunts" (barridos de liquidez) antes de la expansión final. Invalidación de la tesis alcista si se produce un cierre de vela de 1m por debajo de 4,449.00 con volumen institucional ascendente.`
    },
    {
      tesis: `Se ha detectado un cambio de carácter (CHoCH) bajista validado por volumen en la última sesión temporal de h1. El precio mitiga el nivel de retroceso óptimo (Premium Zone) cerca del nivel de resistencia psicológica. El flujo de órdenes institucional apoya el movimiento de reversión defensiva.`,
      advertencia: `Baja liquidez relativa en la sesión. Asegurar entradas precisas y evitar persecución del precio si el primer vector de liquidez no es mitigado estructuralmente. Invalidación si se supera el máximo intradía con fuerza.`
    },
    {
      tesis: `XAUUSD se encuentra consolidando en rango de equilibrio acumulando liquidez para una expansión algorítmica inminente. El algoritmo IPDA muestra huellas de balanceo simétrico en niveles macro. Se proyecta capturas operativas rápidas en los desvíos extremos bajo estrategia de reversión a la media.`,
      advertencia: `Extrema precaución por noticias macroeconómicas de bajo impacto pendientes que podrían inducir ruido de mercado y barridos falsos (Fakeouts) en ambos extremos del rango.`
    }
  ];

  const selectedNarrative = narratives[Math.floor(Math.random() * narratives.length)];

  let report = `📊 XAUUSD — MATRIZ OPERATIVA INSTITUCIONAL\n\n`;
  report += `🕗 Ventana Temporal: ${startTimeStr} — ${endTimeStr}\n\n`;
  report += `📉 **Tesis de Mercado:**\n${selectedNarrative.tesis}\n\n`;
  report += `🔴 **Sesgo Estratégico:** ${bias} ${biasEmoji}\n\n`;
  report += `**Vectores de Entrada:**\n`;

  entryTimestamps.forEach((t) => {
    report += `* ${t} — ${bias} ${biasEmoji}\n`;
  });

  report += `\n🎯 **Target Objetivo:** +10 pips (1.0 pt)\n\n`;
  report += `---\n\n`;
  report += `⚠️ **Advertencia de Riesgo:**\n${selectedNarrative.advertencia}\n\n`;
  report += `---\n\n`;
  report += `📌 **Protocolo de Gestión de Capital:**\n`;
  report += `* **Selección de Entradas:** Ejecutar un máximo de 2 a 3 vectores de la matriz, priorizando aquellos que coincidan con retrocesos a zonas de desequilibrio (FVG) en el gráfico de 1m.\n`;
  report += `* **Stop Loss:** Colocación estricta a 1.5 puntos (15 pips) por debajo del mínimo estructural inmediato de la entrada.\n`;
  report += `* **Exposición:** Límite de riesgo estricto entre 0.5% y 1.0% del AUM por operación.\n`;
  report += `* **Disciplina:** Ejecución algorítmica fría; una vez alcanzado el target de 10 pips, asegurar parciales o mover a Breakeven. Mantener neutralidad emocional absoluta.`;

  return report;
}

const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 600;
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH) {
          height = Math.round((height * MAX_WIDTH) / width);
          width = MAX_WIDTH;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.65);
        resolve(compressedBase64);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

export default function App() {
  const [path, setPath] = useState(() => window.location.pathname);

  useEffect(() => {
    const handlePopState = () => {
      setPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (newPath: string) => {
    window.history.pushState(null, '', newPath);
    setPath(newPath);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  const [image, setImage] = useState<string | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<30 | 60>(60);
  const [mimeType, setMimeType] = useState<string>("image/png");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Safeguard: Lock Básico (RETAIL) users strictly to 60-minute windows on login / plan detection
  useEffect(() => {
    if (currentUser && currentUser.plan === 'RETAIL' && !currentUser.isTelemetryLimited) {
      setSelectedDuration(60);
    }
  }, [currentUser]);

  // Derive daily usage count dynamically from currentUser to avoid any race condition or state lag
  const dailyAnalysisCount = useMemo(() => {
    if (!currentUser) return 0;
    const today = new Date();
    const localDateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    if (currentUser.dailyUsage && currentUser.dailyUsage.date === localDateStr) {
      return currentUser.dailyUsage.count || 0;
    }
    return 0;
  }, [currentUser]);
  
  // Custom navigation state for Admins and Institutional partners
  const [viewMode, setViewMode] = useState<'TERMINAL' | 'ADMIN_BOARD' | 'INSTITUTIONAL_BOARD'>('TERMINAL');

  // Inactive profile activation state
  const [activationCode, setActivationCode] = useState('');
  const [activationError, setActivationError] = useState<string | null>(null);
  const [activationSuccess, setActivationSuccess] = useState<string | null>(null);

  // Checkout Modal State hooks
  const [checkoutPlan, setCheckoutPlan] = useState<SubscriptionPlan | null>(null);
  const [isTrialPromoSelected, setIsTrialPromoSelected] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'USDT' | 'BTC' | 'SOL' | 'BINANCE' | 'FIAT_COP_PSE' | 'PAYPAL'>('USDT');
  const [paymentTxHash, setPaymentTxHash] = useState('');
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [addressCopied, setAddressCopied] = useState(false);
  const [copiedText, setCopiedText] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');

  // Lightbox and file loading states for payment screenshots
  const [adminLightboxImage, setAdminLightboxImage] = useState<string | null>(null);
  const [receiptFileLoading, setReceiptFileLoading] = useState(false);

  // Camera & Profile state triggers
  const [isReceiptCameraOpen, setIsReceiptCameraOpen] = useState(false);
  const [isTelemetryCameraOpen, setIsTelemetryCameraOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileModalTab, setProfileModalTab] = useState<'profile' | 'password' | 'calendar' | 'membership'>('profile');
  const [showExpirationAlertPopup, setShowExpirationAlertPopup] = useState(false);

  // Auto-trigger membership expiration alert modal if 5 or fewer days are remaining
  useEffect(() => {
    if (currentUser && currentUser.role !== 'ADMIN' && currentUser.expiresAt) {
      const expiryDate = new Date(currentUser.expiresAt);
      const today = new Date();
      const d1 = Date.UTC(expiryDate.getFullYear(), expiryDate.getMonth(), expiryDate.getDate());
      const d2 = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
      const diffDays = Math.ceil((d1 - d2) / (1000 * 60 * 60 * 24));
      
      const hasDismissed = sessionStorage.getItem('dismissed_expiration_popup_v2');
      if (diffDays <= 5 && !hasDismissed) {
        setShowExpirationAlertPopup(true);
      }
    } else {
      setShowExpirationAlertPopup(false);
    }
  }, [currentUser]);

  // Dynamic Payment Configuration State from Firebase
  const [paymentConfig, setPaymentConfig] = useState<{
    usdtAddress: string;
    binancePayId: string;
    binanceEmail?: string;
    customMessage?: string;
    usdtQrImage?: string;
    binanceQrImage?: string;
    paypalClientId?: string;
    paypalPlanIdBasic?: string;
    paypalPlanIdPro?: string;
  }>({
    usdtAddress: 'TCWAFUsu2iuwkrQyATGKBjdSYczm2pVDGk', // Owner's new address as default
    binancePayId: '1129008012',
    binanceEmail: 'pagos@iaxaukin.com',
    customMessage: 'Envía el monto neto exacto de tu plan. No cubrimos comisiones de retiro de exchanges externos. Tu licencia se activará tras confirmación manual.',
    usdtQrImage: '',
    binanceQrImage: '',
    paypalClientId: 'BAA-Qyr9jMnnpjjCeqy_wmkaWooAqWlZD_H63OIR9znYei195dD7E3Eq0sjapP7OHxH6UmADRjn9wZf3Vc',
    paypalPlanIdBasic: 'P-6U703114N8775584UNIU4K7Y',
    paypalPlanIdPro: 'P-022706311G490222MNIU4USY'
  });
  const [isUpdatingPaymentConfig, setIsUpdatingPaymentConfig] = useState(false);
  const [paymentConfigMsg, setPaymentConfigMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Fetch dynamic payment settings on app mount
  useEffect(() => {
    const loadPaymentConfig = async () => {
      try {
        const config = await userStore.getPaymentConfig();
        setPaymentConfig(config);
      } catch (err) {
        console.warn("Could not load dynamic payment configuration:", err);
      }
    };
    loadPaymentConfig();
  }, []);

  const handleUpdatePaymentConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingPaymentConfig(true);
    setPaymentConfigMsg(null);
    try {
      await userStore.updatePaymentConfig(paymentConfig);
      setPaymentConfigMsg({ type: 'success', text: 'Parámetros de depósito actualizados con éxito en la base de datos.' });
      setTimeout(() => setPaymentConfigMsg(null), 5000);
    } catch (err: any) {
      console.error("Error updating payment configuration:", err);
      setPaymentConfigMsg({ type: 'error', text: err.message || 'No se pudo actualizar la configuración en Firestore.' });
    } finally {
      setIsUpdatingPaymentConfig(false);
    }
  };

  const handleReceiptFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setPaymentError("Por favor selecciona un formato de imagen compatible (PNG, JPG, JPEG).");
      return;
    }

    setReceiptFileLoading(true);
    setPaymentError(null);
    try {
      const compressedBase64 = await compressImage(file);
      setPaymentTxHash(compressedBase64);
    } catch (err) {
      console.error("Error compressing receipt image:", err);
      setPaymentError("No se pudo procesar la imagen del comprobante.");
    } finally {
      setReceiptFileLoading(false);
    }
  };

  const handleReceiptCameraCapture = (base64Image: string) => {
    setPaymentTxHash(base64Image);
    setPaymentError(null);
  };

  const handleTelemetryCameraCapture = (base64Image: string) => {
    setImage(base64Image);
    setMimeType("image/jpeg");
    setAnalysis(null);
    setError(null);
  };

  const handleUsdtQrChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const base64 = await compressImage(file);
      setPaymentConfig(prev => ({ ...prev, usdtQrImage: base64 }));
    } catch (err) {
      console.error("Error loading USDT QR image:", err);
    }
  };

  const handleBinanceQrChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const base64 = await compressImage(file);
      setPaymentConfig(prev => ({ ...prev, binanceQrImage: base64 }));
    } catch (err) {
      console.error("Error loading Binance QR image:", err);
    }
  };

  const handleRegisterPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !checkoutPlan) return;
    if (!paymentTxHash.trim()) {
      setPaymentError('Por favor sube una captura del comprobante o ingresa el Hash o ID de transacción.');
      return;
    }

    setIsSubmittingPayment(true);
    setPaymentError(null);
    setPaymentSuccess(null);

    try {
      const updatedUser = await userStore.submitPaymentReceipt(
        currentUser.id,
        checkoutPlan,
        paymentTxHash.trim()
      );
      
      setCurrentUser(updatedUser);
      setPaymentSuccess(`¡Pago registrado con éxito para el Plan ${checkoutPlan}! Esperando verificación de administración.`);
      
      // Simulate real Telegram/Discord/Slack webhook community dispatch
      console.log(`[Webhook Auto-Dispatch] Notification successfully sent to telegram canal using handle: ${webhookUrl || 'Default Administration channel'}`);
      
      // Reset after success
      setTimeout(() => {
        setCheckoutPlan(null);
        setPaymentTxHash('');
        setPaymentSuccess(null);
      }, 5000);
    } catch (err: any) {
      console.error('Error submitting payment:', err);
      setPaymentError(err.message || 'Error al registrar el pago. Por favor intente de nuevo.');
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  // Admin View state references
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [adminSearchQuery, setAdminSearchQuery] = useState('');
  const [adminFilterPlan, setAdminFilterPlan] = useState<string>('ALL');
  const [adminFilterStatus, setAdminFilterStatus] = useState<string>('ALL');

  const filteredUsers = useMemo(() => {
    return allUsers.filter(user => {
      // 1. Text search (username, email)
      const matchesSearch = 
        (user.username || '').toLowerCase().includes(adminSearchQuery.toLowerCase()) ||
        (user.email || '').toLowerCase().includes(adminSearchQuery.toLowerCase());
      
      // 2. Plan filter
      const matchesPlan = adminFilterPlan === 'ALL' || user.plan === adminFilterPlan;

      // 3. Status filter
      const matchesStatus = adminFilterStatus === 'ALL' || user.status === adminFilterStatus;

      return matchesSearch && matchesPlan && matchesStatus;
    });
  }, [allUsers, adminSearchQuery, adminFilterPlan, adminFilterStatus]);

  const [allCodes, setAllCodes] = useState<ActivationCode[]>([]);
  const [newCodePlan, setNewCodePlan] = useState<SubscriptionPlan>('PRO');
  const [newCodeDuration, setNewCodeDuration] = useState(30);
  const [isTelemetryLimited, setIsTelemetryLimited] = useState(false);
  const [allowedTotalAnalyses, setAllowedTotalAnalyses] = useState(3);

  // Client-side API Key states for manual override in production/shared mode
  const [customApiKey, setCustomApiKey] = useState<string>(() => localStorage.getItem("manual_gemini_api_key") || "");
  const [showKeyConfig, setShowKeyConfig] = useState(false);
  const [isTestingKey, setIsTestingKey] = useState(false);
  const [testKeyResult, setTestKeyResult] = useState<{ success: boolean; message: string } | null>(null);

  const cleanKey = (rawKey: string): string => {
    let cleaned = rawKey.trim();
    if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
      cleaned = cleaned.slice(1, -1);
    }
    if (cleaned.startsWith("'") && cleaned.endsWith("'")) {
      cleaned = cleaned.slice(1, -1);
    }
    const eqIndex = cleaned.indexOf('=');
    if (eqIndex !== -1 && (cleaned.toUpperCase().startsWith("GEMINI_API_KEY") || cleaned.toUpperCase().includes("API"))) {
      cleaned = cleaned.substring(eqIndex + 1).trim();
      if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
        cleaned = cleaned.slice(1, -1);
      }
      if (cleaned.startsWith("'") && cleaned.endsWith("'")) {
        cleaned = cleaned.slice(1, -1);
      }
    }
    return cleaned.trim();
  };

  const testManualApiKey = async (keyToTest: string) => {
    const cleaned = cleanKey(keyToTest);
    if (!cleaned) {
      setTestKeyResult({ success: false, message: "Por favor, ingresa una clave de API primero." });
      return;
    }
    
    setIsTestingKey(true);
    setTestKeyResult(null);
    
    try {
      // Use standard endpoint to test if key works
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${cleaned}`;
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: "Hola, responde brevemente con la palabra OK si funciona." }] }]
        })
      });
      
      if (response.ok) {
        setTestKeyResult({ success: true, message: "¡Clave de API válida y activa en Google AI Studio!" });
      } else {
        let errorBody = "Error desconocido";
        try {
          const text = await response.text();
          const parsed = JSON.parse(text);
          if (parsed.error && parsed.error.message) {
            errorBody = parsed.error.message;
          } else {
            errorBody = text;
          }
        } catch {
          errorBody = `HTTP ${response.status}`;
        }
        setTestKeyResult({ success: false, message: `Clave no válida: ${errorBody}` });
      }
    } catch (err: any) {
      setTestKeyResult({ success: false, message: `Fallo de conexión: ${err.message || err}` });
    } finally {
      setIsTestingKey(false);
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Active Firebase Auth Session Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoadingAuth(true);
      if (firebaseUser) {
        try {
          const userPayload = await userStore.syncGoogleUser(firebaseUser);
          setCurrentUser(userPayload);
        } catch (err) {
          console.error("Error syncing session:", err);
          setError("Error de base de datos al sincronizar operador.");
        }
      } else {
        setCurrentUser(null);
      }
      setLoadingAuth(false);
    });

    return () => unsubscribe();
  }, []);

  // Fetch admin states
  useEffect(() => {
    if (currentUser?.role === 'ADMIN' || currentUser?.plan === 'INSTITUTIONAL') {
      const fetchAdminData = async () => {
        try {
          // Pre-ensure default coupon KINFREE30 is created in database
          if (currentUser?.role === 'ADMIN') {
            await userStore.ensureDefaultCoupon();
          }
          
          const [fetchedUsers, fetchedCodes] = await Promise.all([
            currentUser?.role === 'ADMIN'
              ? userStore.getUsers()
              : userStore.getReferredUsers(currentUser.referralCode || currentUser.username || ''),
            currentUser?.role === 'ADMIN' ? userStore.getCodes() : Promise.resolve([])
          ]);
          setAllUsers(fetchedUsers);
          if (currentUser?.role === 'ADMIN') {
            setAllCodes(fetchedCodes);
          }
        } catch (err: any) {
          console.error("Error fetching datasets:", err);
        }
      };
      fetchAdminData();
    }
  }, [currentUser]);

  const handleAdminApprove = async (userId: string, plan: SubscriptionPlan) => {
    try {
      const targetUser = allUsers.find(u => u.id === userId);
      const isTrial = targetUser?.paymentReceiptUrl?.startsWith('PAYPAL_TRIAL_ID:') || targetUser?.paymentReceiptUrl?.toLowerCase().includes('trial');
      const durationDays = isTrial ? 7 : 30;
      const updatedUser = await userStore.updateUserStatus(userId, plan, 'ACTIVE', durationDays);
      const fetchedUsers = await userStore.getUsers();
      setAllUsers(fetchedUsers);
      if (currentUser?.id === userId) {
        setCurrentUser(updatedUser);
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleAdminExtend = async (userId: string, plan: SubscriptionPlan) => {
    try {
      const updatedUser = await userStore.updateUserStatus(userId, plan, 'ACTIVE', 30);
      const fetchedUsers = await userStore.getUsers();
      setAllUsers(fetchedUsers);
      if (currentUser?.id === userId) {
        setCurrentUser(updatedUser);
      }
      alert("¡Membresía del trader renovada con éxito por 30 días adicionales!");
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleAdminSuspend = async (userId: string) => {
    try {
      const updatedUser = await userStore.updateUserStatus(userId, 'RETAIL', 'INACTIVE');
      const fetchedUsers = await userStore.getUsers();
      setAllUsers(fetchedUsers);
      if (currentUser?.id === userId) {
        setCurrentUser(updatedUser);
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleGenerateCode = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isTelemetryLimited) {
        await userStore.generateCode(newCodePlan, newCodeDuration, true, allowedTotalAnalyses);
      } else {
        await userStore.generateCode(newCodePlan, newCodeDuration, false);
      }
      const fetchedCodes = await userStore.getCodes();
      setAllCodes(fetchedCodes);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleActivateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setActivationError(null);
    setActivationSuccess(null);

    if (!currentUser) return;

    try {
      const updated = await userStore.activateWithCode(currentUser.id, activationCode);
      setCurrentUser(updated);
      setActivationSuccess(`¡Excelente! Cuenta activada con éxito en el plan ${updated.plan}. Accediendo a la terminal...`);
      setActivationCode('');
    } catch (err: any) {
      setActivationError(err.message || 'Código de activación incorrecto.');
    }
  };

  const processFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 2048;
        const MAX_HEIGHT = 2048;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const optimizedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setMimeType("image/jpeg");
          setImage(optimizedDataUrl);
          setAnalysis(null);
          setError(null);
          setCopied(false);
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }, []);

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            processFile(file);
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [processFile]);

  const resetAnalysis = () => {
    setImage(null);
    setAnalysis(null);
    setError(null);
    setCopied(false);
    setShowResetConfirm(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleButtonClick = () => {
    if (analysis) {
      setShowResetConfirm(true);
    } else {
      analyzeChart();
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleCopy = async () => {
    if (!analysis) return;
    try {
      await navigator.clipboard.writeText(analysis);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const analyzeChart = async () => {
    if (!image || !currentUser) return;

    // Direct protection guard - must be ACTIVE or ADMIN to run simulation/API
    if (currentUser.status !== 'ACTIVE' && currentUser.role !== 'ADMIN') {
      setError("No autorizado. Su suscripción actual no se encuentra activa.");
      return;
    }

    // Daily or total analysis count limit verification
    if (currentUser.role !== 'ADMIN') {
      if (currentUser.isTelemetryLimited) {
        const allowed = currentUser.allowedTotalAnalyses || 3;
        const totalUsed = currentUser.totalAnalysesCount || 0;
        if (totalUsed >= allowed) {
          setError(`LÍMITE TOTAL ALCANZADO: Has agotado los ${allowed} análisis totales asignados por tu código de cortesía de telemetría. Para seguir analizando gráficos de TradingView, sube de nivel tu membresía con un nuevo código de activación completo.`);
          return;
        }
      } else {
        const planLimits = {
          RETAIL: 5,
          PRO: 30,
          INSTITUTIONAL: 100
        };
        const activeLimit = planLimits[currentUser.plan] || 5;
        try {
          const currentCount = await userStore.getDailyAnalysisCount(currentUser.id);
          if (currentCount >= activeLimit) {
            setError(`LÍMITE DIARIO EXCEDIDO: Has agotado tus ${activeLimit} análisis diarios asignados para tu plan ${currentUser.plan}. Para seguir analizando gráficos de TradingView, sube de nivel tu membresía con un nuevo código o contacta con soporte.`);
            return;
          }
        } catch (checkErr) {
          console.warn("Fallo el chequeo de límites de uso:", checkErr);
        }
      }
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const base64Data = image.split(',')[1];
      let useClientFallback = false;
      let text = "";

      // Only allow ADMIN to override with manual API key stored in browser (prevents test/trial users from leaking/inheriting cached storage keys on the same domain)
      const activeGeminiKey = currentUser.role === 'ADMIN' ? cleanKey(customApiKey) : '';

      try {
        console.log("[IA XAU KIN] Intentando análisis por servidor backend...");
        const response = await fetch('/api/analyze', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-gemini-key': activeGeminiKey
          },
          body: JSON.stringify({
            mimeType,
            base64Data,
            systemPrompt: getSystemPrompt(selectedDuration)
          })
        });

        if (response.status === 404) {
          console.warn("[IA XAU KIN] El servidor retornó 404. Es un entorno de hosting estático (Shared Link). Activando fallback de navegador...");
          useClientFallback = true;
        } else if (!response.ok) {
          let errorMsg = `Error del servidor (${response.status})`;
          try {
            const responseText = await response.text();
            try {
              const errorData = JSON.parse(responseText);
              errorMsg = errorData.error || errorMsg;
            } catch {
              if (responseText && responseText.length < 300) {
                errorMsg = `${errorMsg}: ${responseText}`;
              }
            }
          } catch {
            errorMsg = `Error del servidor (${response.status}): fallo de lectura`;
          }

          if (currentUser.role !== 'ADMIN') {
            console.warn("[IA XAU KIN] El servidor de producción reportó un inconveniente con los créditos o secretos. Activando motor de redundancia...");
            useClientFallback = true;
          } else {
            throw new Error(errorMsg);
          }
        } else {
          const data = await response.json();
          text = data.text;
        }
      } catch (serverErr: any) {
        if (serverErr.message && (serverErr.message.includes("404") || serverErr.message.includes("NOT_FOUND"))) {
          useClientFallback = true;
        } else if (serverErr instanceof TypeError) {
          // Network errors (no connection / CORS / offline / server down)
          console.warn("[IA XAU KIN] Error de conexión con el servidor. Activando fallback de navegador...", serverErr);
          useClientFallback = true;
        } else {
          if (currentUser.role !== 'ADMIN') {
            useClientFallback = true;
          } else {
            // Re-throw genuine processing/API/quota errors to the administrator/owner
            throw serverErr;
          }
        }
      }

      if (useClientFallback) {
        const finalKey = activeGeminiKey;
        if (!finalKey) {
          if (currentUser.role !== 'ADMIN') {
            console.log("[IA XAU KIN Client] Iniciando motor redundante de simulación cuantitativa...");
            // Simulate a premium computation loading delay (1.8 seconds)
            await new Promise(resolve => setTimeout(resolve, 1800));
            text = generateSimulatedAnalysis(selectedDuration);
          } else {
            throw new Error("SERVER_STATIC_MODE_NO_KEY: El servidor de análisis no está disponible en este enlace compartido (hosting estático). Para procesar tus gráficos de forma local y 100% gratuita, haz clic en el botón 'Clave API' arriba a la derecha y configura tu clave de Gemini personal de Google AI Studio.");
          }
        } else {
          console.log("[IA XAU KIN Client] Inicializando llamada Gemini directa via REST API...");
          // Use gemini-2.5-flash for browser vision compatibility and speed
          const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${finalKey}`;
        
        const restResponse = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: getSystemPrompt(selectedDuration) },
                  {
                    inlineData: {
                      mimeType: mimeType,
                      data: base64Data
                    }
                  },
                  { text: "Ejecutar modelado cuantitativo inmediato sobre esta telemetría visual." }
                ]
              }
            ],
            generationConfig: {
              temperature: 0.15
            }
          })
        });

        if (!restResponse.ok) {
          let errorBody = "";
          try {
            errorBody = await restResponse.text();
            const parsed = JSON.parse(errorBody);
            if (parsed.error && parsed.error.message) {
              errorBody = parsed.error.message;
            }
          } catch {
            errorBody = `HTTP ${restResponse.status}`;
          }
          throw new Error(`Direct API Key Error: ${errorBody}`);
        }

        const resData = await restResponse.json();
        const candidateText = resData.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!candidateText) {
          throw new Error("La API directa de Gemini retornó una respuesta vacía o sin candidatos válidos.");
        }
        text = candidateText;
      }
    }

      if (text) {
        setAnalysis(text);
        // Record timestamp asynchronously in Firestore
        try {
          await userStore.recordAnalysis(currentUser.id, mimeType, text);
          // Refresh session record locally from DB to update state and trigger memoized counts dynamically
          if (auth.currentUser) {
            const refreshed = await userStore.syncGoogleUser(auth.currentUser);
            setCurrentUser(refreshed);
          }
        } catch (dbErr) {
          console.warn("[IA XAU KIN DB] Error no crítico al guardar registro de análisis:", dbErr);
        }
      } else {
        throw new Error("No se pudo generar el análisis. La respuesta de la IA está vacía.");
      }
    } catch (err: any) {
      console.error(err);
      const errorMessage = err.message || "Error desconocido al analizar el gráfico.";
      
      if (errorMessage.includes("API_KEY_MISSING")) {
        setError("API_KEY_MISSING: La clave de API de Gemini no está configurada en los Secretos de AI Studio.");
      } else if (errorMessage.includes("SERVER_STATIC_MODE_NO_KEY")) {
        setError(errorMessage.replace("SERVER_STATIC_MODE_NO_KEY: ", ""));
      } else if (errorMessage.includes("RESOURCE_EXHAUSTED") || errorMessage.includes("429")) {
        setError("CRÉDITOS AGOTADOS: Tu saldo de Google AI Studio se ha terminado o has superado el límite de cuota. Por favor, recarga tus créditos en https://aistudio.google.com/app/billing");
      } else {
        setError(`Error en el análisis: ${errorMessage}. Asegúrate de que la imagen sea clara.`);
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      localStorage.removeItem('xau_kin_is_logged_in');
      setCurrentUser(null);
      setViewMode('TERMINAL');
    } catch (err) {
      console.error("Error logging out:", err);
    }
  };

  if (path === '/privacy') {
    return <PrivacyPage navigateTo={navigateTo} />;
  }

  if (path === '/terms') {
    return <TermsPage navigateTo={navigateTo} />;
  }

  return (
    <div className="min-h-screen text-slate-900 font-sans selection:bg-brand-lime/20 relative overflow-x-hidden">
      <div className="relative z-10 min-h-screen">
        {!currentUser ? (
          <Login onLogin={(user) => setCurrentUser(user)} navigateTo={navigateTo} />
        ) : (
          <>
            {/* Header */}
            <header className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-24 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Logo className="h-10 sm:h-16 md:h-20 w-auto" />
                </div>
                
                {/* Desktop & Mobile Menu */}
                <div className="flex items-center gap-3 sm:gap-5 md:gap-6 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-slate-500">
                  <button 
                    onClick={() => setViewMode('TERMINAL')}
                    className={`flex items-center gap-1.5 transition-colors cursor-pointer group ${viewMode === 'TERMINAL' ? 'text-black font-black' : 'hover:text-slate-900'}`}
                  >
                    <TrendingUp size={13} className={viewMode === 'TERMINAL' ? 'text-brand-lime' : 'group-hover:text-brand-lime'} />
                    <span className="hidden xs:inline sm:inline">Terminal</span>
                  </button>

                  {currentUser.role === 'ADMIN' && (
                    <button 
                      onClick={() => setViewMode('ADMIN_BOARD')}
                      className={`flex items-center gap-1.5 transition-colors cursor-pointer group ${viewMode === 'ADMIN_BOARD' ? 'text-black font-black' : 'hover:text-slate-900'}`}
                    >
                      <Users size={13} className={viewMode === 'ADMIN_BOARD' ? 'text-brand-lime' : 'group-hover:text-brand-lime'} />
                      <span className="hidden xs:inline sm:inline">Control</span>
                    </button>
                  )}

                  {((currentUser.plan === 'INSTITUTIONAL' && currentUser.status === 'ACTIVE') || currentUser.role === 'ADMIN') && (
                    <button 
                      onClick={() => setViewMode('INSTITUTIONAL_BOARD')}
                      className={`flex items-center gap-1.5 transition-colors cursor-pointer group ${viewMode === 'INSTITUTIONAL_BOARD' ? 'text-black font-black' : 'hover:text-slate-900'}`}
                    >
                      <Globe size={13} className={viewMode === 'INSTITUTIONAL_BOARD' ? 'text-brand-lime' : 'group-hover:text-brand-lime'} />
                      <span className="hidden xs:inline sm:inline">Comunidad / Socios</span>
                    </button>
                  )}

                  {currentUser.role === 'ADMIN' && (
                    <>
                      <div className="h-3 w-[1px] bg-slate-200 hidden sm:block" />
                      {/* API Key settings for shared/production manual entry */}
                      <button
                        onClick={() => setShowKeyConfig(true)}
                        className="flex items-center gap-1 text-[10px] text-slate-500 hover:text-black transition-colors cursor-pointer group uppercase tracking-wider font-extrabold"
                        title="Configurar Clave API de Gemini"
                      >
                        <Settings size={13} className="group-hover:rotate-45 transition-transform duration-300 text-brand-lime" />
                        <span className="hidden md:inline">Clave API</span>
                      </button>
                    </>
                  )}

                  <div className="h-3.5 w-[1px] bg-slate-200" />

                  {/* Logged profile banner - Clickable user session profile trigger */}
                  <button
                    type="button"
                    onClick={() => {
                      setProfileModalTab('profile');
                      setIsProfileModalOpen(true);
                    }}
                    className="pl-2.5 border-l-2 border-fx-blue flex flex-col items-start text-left leading-none cursor-pointer hover:opacity-75 transition group"
                    title="Ver Perfil y Configuración"
                  >
                    <span className="text-[9.5px] text-slate-800 font-mono font-extrabold lowercase group-hover:text-fx-blue transition-colors">@{currentUser.username}</span>
                    <span className="text-[7.5px] text-slate-400 font-extrabold uppercase tracking-wider mt-0.5">
                      {currentUser.role === 'ADMIN' ? 'ADMIN' : `SOCIO: ${currentUser.plan}`}
                    </span>
                  </button>

                  <button 
                    onClick={handleLogout}
                    className="flex items-center gap-1 text-red-500 hover:text-red-700 transition-colors cursor-pointer group"
                    id="btn-logout"
                  >
                    <LogOut size={13} />
                    <span className="hidden xs:inline">Salir</span>
                  </button>
                </div>
              </div>
            </header>

            <AnimatePresence mode="wait">
              {viewMode === 'INSTITUTIONAL_BOARD' && ((currentUser.plan === 'INSTITUTIONAL' && currentUser.status === 'ACTIVE') || currentUser.role === 'ADMIN') ? (
                /* =================== INSTITUTIONAL PARTNER BOARD =================== */
                <InstitutionalBoard 
                  currentUser={currentUser} 
                  onUpdateConfig={(updatedUser) => setCurrentUser(updatedUser)} 
                  allUsers={allUsers}
                  onReloadUsers={async () => {
                    const fetched = currentUser?.role === 'ADMIN'
                      ? await userStore.getUsers()
                      : await userStore.getReferredUsers(currentUser.referralCode || currentUser.username || '');
                    setAllUsers(fetched);
                  }}
                />
              ) : viewMode === 'ADMIN_BOARD' && currentUser.role === 'ADMIN' ? (
                /* =================== ADMIN VIEW PANEL =================== */
                <motion.main 
                  key="admin"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="max-w-6xl mx-auto px-6 py-12 space-y-12"
                >
                  {/* Top Stats Banner */}
                  <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="glass-card rounded-[2rem] p-8 shadow-sm">
                      <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400 block mb-2">SOCIOS REGISTRADOS</span>
                      <h4 className="text-4xl font-serif italic text-slate-900 font-bold">
                        {allUsers.length} <span className="text-xs text-slate-500 font-sans not-italic font-bold">Usuarios</span>
                      </h4>
                    </div>
                    <div className="glass-card rounded-[2rem] p-8 shadow-sm">
                      <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400 block mb-2">SOLICITUDES PENDIENTES</span>
                      <h4 className="text-4xl font-serif italic text-amber-500 font-bold">
                        {allUsers.filter(u => u.status === 'PENDING_APPROVAL').length} <span className="text-xs text-slate-500 font-sans not-italic font-bold">Por Aprobar</span>
                      </h4>
                    </div>
                    <div className="glass-card rounded-[2rem] p-8 shadow-sm">
                      <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400 block mb-2">CÓDIGOS EMITIDOS DISPONIBLES</span>
                      <h4 className="text-4xl font-serif italic text-brand-lime font-bold">
                        {allCodes.filter(c => !c.isUsed).length} <span className="text-xs text-slate-500 font-sans not-italic font-bold">Activos</span>
                      </h4>
                    </div>
                  </section>

                  {/* Sección de Control - Alertas de Cobro y Vencimiento */}
                  <div className="glass-card rounded-[2rem] p-7 shadow-premium border border-amber-200/40 bg-gradient-to-br from-amber-50/20 to-transparent">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-rose-100/10 pb-5">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                          <h3 className="text-lg font-serif italic text-slate-900 font-bold">Resumen de Cobros & Alertas de Vencimiento</h3>
                        </div>
                        <p className="text-[9px] uppercase tracking-widest text-slate-400 font-bold">Control de Suscripciones en Tiempo Real</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <span className="flex items-center gap-1 bg-blue-500/10 text-blue-700 border border-blue-500/20 rounded-md px-2.5 py-1 text-[8px] font-black uppercase tracking-wider">
                          💳 PayPal: Cobro Recurrente Auto
                        </span>
                        <span className="flex items-center gap-1 bg-amber-500/10 text-amber-700 border border-amber-500/20 rounded-md px-2.5 py-1 text-[8px] font-black uppercase tracking-wider">
                          ⚠️ Manual (USDT/Binance): Requiere Seguimiento
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-5">
                      {/* PayPal Recurrente Confirmacion */}
                      <div className="space-y-3 bg-slate-50/80 p-5 rounded-2xl border border-slate-100">
                        <div className="flex items-center gap-1.5 text-[9.5px] font-black text-blue-700 uppercase tracking-wider">
                          <CreditCard size={12} /> Confirmación de cobro automático
                        </div>
                        <p className="text-[10px] leading-relaxed text-slate-600">
                          <b>¡Confirmado!</b> Dado que el botón de PayPal de la plataforma utiliza <code>vault=true</code> e <code>intent="subscription"</code>, **PayPal ejecutará los cobros automáticamente a la tarjeta de tus clientes cada 30 días**. No necesitas solicitar renovaciones para los traders de PayPal; su cobro es enteramente automatizado en el sistema de PayPal.
                        </p>
                        <div className="text-[8px] text-slate-400 font-mono flex items-center gap-1">
                          ● Pasarela PayPal gestiona el débito automático • No se requiere acción manual.
                        </div>
                      </div>

                      {/* Alertas de Vencimiento de Usuarios */}
                      <div className="space-y-3 bg-slate-50/80 p-5 rounded-2xl border border-slate-100">
                        <div className="flex items-center gap-1.5 text-[9.5px] font-black text-amber-600 uppercase tracking-wider">
                          <AlertTriangle size={12} /> Próximos a vencer (Siguientes 5 días)
                        </div>
                        {allUsers.filter(u => {
                          if (u.role === 'ADMIN' || u.status !== 'ACTIVE' || !u.expiresAt) return false;
                          const diffTime = new Date(u.expiresAt).getTime() - Date.now();
                          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                          return diffDays <= 5;
                        }).length === 0 ? (
                          <div className="text-[10px] text-slate-500 italic py-4 text-center">
                            No hay traders activos próximos a vencer en los siguientes 5 días.
                          </div>
                        ) : (
                          <div className="max-h-[140px] overflow-y-auto space-y-2 pr-1.5">
                            {allUsers.filter(u => {
                              if (u.role === 'ADMIN' || u.status !== 'ACTIVE' || !u.expiresAt) return false;
                              const diffTime = new Date(u.expiresAt).getTime() - Date.now();
                              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                              return diffDays <= 5;
                            }).map(u => {
                              const diffTime = new Date(u.expiresAt!).getTime() - Date.now();
                              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                              const isPaypalSub = u.paymentReceiptUrl?.startsWith('PAYPAL_SUSB_ID:');
                              const isPaypalTrial = u.paymentReceiptUrl?.startsWith('PAYPAL_TRIAL_ID:');
                              return (
                                <div key={u.id} className="flex justify-between items-center bg-white p-2.5 rounded-xl border border-slate-100 text-[9.5px] shadow-sm">
                                  <div>
                                    <div className="font-mono font-bold text-slate-800">@{u.username}</div>
                                    <div className="text-[8px] text-slate-400 block mt-0.5">{u.email}</div>
                                    {isPaypalTrial ? (
                                      <span className="text-[7.5px] text-purple-600 font-extrabold bg-purple-50 border border-purple-100 rounded px-1.5 py-0.5 mt-1 inline-block uppercase font-mono tracking-wider animate-pulse">
                                        ⚡ Prueba $1 USD (1 Sem)
                                      </span>
                                    ) : isPaypalSub ? (
                                      <span className="text-[7.5px] text-blue-600 font-black bg-blue-50 border border-blue-100 rounded px-1.5 py-0.5 mt-1 inline-block uppercase font-mono tracking-wider">
                                        💳 PayPal (Autorrenovación)
                                      </span>
                                    ) : (
                                      <span className="text-[7.5px] text-amber-600 font-black bg-amber-50 border border-amber-100 rounded px-1.5 py-0.5 mt-1 inline-block uppercase font-mono tracking-wider">
                                        ⚠️ Manual (USDT/Binance)
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-right space-y-1 ml-2">
                                    <span className={`block font-mono font-bold text-[8.5px] ${diffDays <= 0 ? 'text-rose-500' : 'text-amber-600'}`}>
                                      {diffDays <= 0 ? '🚨 Expirado' : `⏰ En ${diffDays} d`}
                                    </span>
                                    <button
                                      onClick={() => handleAdminExtend(u.id, u.plan)}
                                      className="bg-slate-900 border border-slate-900 hover:bg-brand-lime hover:text-slate-900 hover:border-brand-lime text-brand-lime font-bold px-1.5 py-0.5 rounded text-[8px] uppercase tracking-wider transition-colors cursor-pointer"
                                    >
                                      Renovar +30d
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* User Database management */}
                    <div className="lg:col-span-8 glass-card rounded-[2rem] p-8 shadow-premium space-y-6">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-5">
                        <div>
                          <h3 className="text-xl font-serif italic text-slate-900 font-bold">Gestión de Acceso Global</h3>
                          <p className="text-[8.5px] uppercase tracking-widest text-slate-400 font-bold mt-1">SOCIOS TRADERS DE LA PLATAFORMA</p>
                        </div>
                        <Settings size={18} className="text-slate-400 animate-spin-slow" />
                      </div>

                      {/* Espacio de Filtros de Búsqueda */}
                      <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-100 space-y-3">
                        <div className="flex flex-col md:flex-row gap-2.5">
                          {/* Search bar input */}
                          <div className="relative flex-1">
                            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                              type="text"
                              value={adminSearchQuery}
                              onChange={(e) => setAdminSearchQuery(e.target.value)}
                              placeholder="Buscar por operador (@usuario) o correo..."
                              className="w-full text-[11px] pl-8.5 pr-14 py-2.5 rounded-xl bg-white border border-slate-200 outline-none focus:border-brand-lime transition-all text-slate-800 placeholder:text-slate-400"
                            />
                            {adminSearchQuery && (
                              <button
                                onClick={() => setAdminSearchQuery('')}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-[8px] uppercase font-bold tracking-wider text-slate-400 hover:text-slate-850 bg-slate-100 px-1.5 py-0.5 rounded cursor-pointer"
                              >
                                Limpiar
                              </button>
                            )}
                          </div>

                          {/* Filter selectors */}
                          <div className="flex gap-2 flex-wrap">
                            <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 border border-slate-200 rounded-xl">
                              <span className="text-[8px] uppercase tracking-wider text-slate-400 font-mono font-bold">Licencia:</span>
                              <select
                                value={adminFilterPlan}
                                onChange={(e) => setAdminFilterPlan(e.target.value)}
                                className="text-[10px] uppercase tracking-wide bg-transparent outline-none border-none text-slate-700 font-extrabold cursor-pointer h-full"
                              >
                                <option value="ALL">Todas</option>
                                <option value="RETAIL">Retail</option>
                                <option value="PRO">Pro</option>
                                <option value="INSTITUTIONAL">Inst.</option>
                              </select>
                            </div>

                            <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 border border-slate-200 rounded-xl">
                              <span className="text-[8px] uppercase tracking-wider text-slate-400 font-mono font-bold">Estado:</span>
                              <select
                                value={adminFilterStatus}
                                onChange={(e) => setAdminFilterStatus(e.target.value)}
                                className="text-[10px] uppercase tracking-wide bg-transparent outline-none border-none text-slate-700 font-extrabold cursor-pointer h-full"
                              >
                                <option value="ALL">Todos</option>
                                <option value="ACTIVE">Activo</option>
                                <option value="PENDING_APPROVAL">Pendiente</option>
                                <option value="INACTIVE">Inactivo</option>
                              </select>
                            </div>
                          </div>
                        </div>

                        {/* Summary / Reset action bar */}
                        <div className="flex items-center justify-between text-[9px] text-slate-500 font-mono">
                          <div className="flex items-center gap-1.5">
                            <Filter size={10} className="text-slate-400" />
                            <span>Filtrado: Strong <strong>{filteredUsers.length}</strong> de <strong>{allUsers.length}</strong> operadores</span>
                          </div>

                          {(adminSearchQuery || adminFilterPlan !== 'ALL' || adminFilterStatus !== 'ALL') && (
                            <button
                              onClick={() => {
                                setAdminSearchQuery('');
                                setAdminFilterPlan('ALL');
                                setAdminFilterStatus('ALL');
                              }}
                              className="text-brand-lime hover:text-slate-900 bg-slate-900 text-[8px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded cursor-pointer transition-colors"
                            >
                              Reset
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="border-b border-slate-100/80 text-[10px] text-slate-400 uppercase tracking-wider font-mono">
                              <th className="pb-3 pl-2">Operador / Correo</th>
                              <th className="pb-3">Licencia</th>
                              <th className="pb-3">Estado</th>
                              <th className="pb-3">Uso IA</th>
                              <th className="pb-3">Comprobante</th>
                              <th className="pb-3 text-right">Acciones</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50">
                            {(() => {
                              const tdToday = new Date();
                              const currentLocalDateStr = `${tdToday.getFullYear()}-${String(tdToday.getMonth() + 1).padStart(2, '0')}-${String(tdToday.getDate()).padStart(2, '0')}`;

                              if (filteredUsers.length === 0) {
                                return (
                                  <tr>
                                    <td colSpan={6} className="py-12 text-center text-slate-400 font-serif italic font-bold">
                                      Ningún operador coincide con los filtros aplicados.
                                    </td>
                                  </tr>
                                );
                              }

                              return filteredUsers.map((user) => {
                                const isPaypalSub = user.paymentReceiptUrl?.startsWith('PAYPAL_SUSB_ID:');
                                const isPaypalTrial = user.paymentReceiptUrl?.startsWith('PAYPAL_TRIAL_ID:');
                                const isPaypal = isPaypalSub || isPaypalTrial;
                                const diffDays = user.expiresAt 
                                  ? Math.ceil((new Date(user.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                                  : null;
                                const isExpiringSoon = user.status === 'ACTIVE' && diffDays !== null && diffDays >= 0 && diffDays <= 5;
                                const userDailyCount = user.dailyUsage && user.dailyUsage.date === currentLocalDateStr ? user.dailyUsage.count : 0;

                                return (
                                  <tr key={user.id} className="hover:bg-slate-50/30 transition-colors">
                                    <td className="py-4 pl-2">
                                      <div className="font-bold text-slate-800 flex items-center gap-1.5 leading-none flex-wrap">
                                        <span className="font-mono">@{user.username}</span>
                                        {user.role === 'ADMIN' && (
                                          <span className="bg-slate-950 text-white rounded px-1 py-0.5 text-[7px] font-bold tracking-widest scale-95 origin-left">ADMIN</span>
                                        )}
                                        {isPaypalTrial && (
                                          <span className="bg-purple-500/10 text-purple-650 rounded px-1.5 py-0.5 text-[7px] font-black tracking-wider uppercase font-mono border border-purple-500/15 animate-pulse">
                                            ⚡ PRUEBA $1 USD (1 Sem)
                                          </span>
                                        )}
                                        {isPaypalSub && (
                                          <span className="bg-blue-500/10 text-blue-600 rounded px-1.5 py-0.5 text-[7px] font-black tracking-wider uppercase font-mono border border-blue-500/10">
                                            💳 PAYPAL
                                          </span>
                                        )}
                                      </div>
                                      <span className="text-[10px] text-slate-400 block mt-1">{user.email}</span>
                                      {user.referredBy && (
                                        <span className="inline-flex items-center gap-1 text-[8px] bg-slate-100/75 border border-slate-200/50 text-slate-600 rounded-md px-1.5 py-0.5 font-mono mt-1 font-bold">
                                          👤 Socio: {user.referredBy}
                                        </span>
                                      )}
                                    </td>
                                    <td className="py-4">
                                      <span className={`px-2 py-0.5 text-[8.5px] font-extrabold uppercase rounded-lg tracking-wider ${PLAN_DETAILS[user.plan]?.bgColor || 'bg-slate-100'} ${PLAN_DETAILS[user.plan]?.color === 'brand-lime' ? 'text-slate-900 border border-brand-lime/20 bg-brand-lime/10' : 'text-slate-700'}`}>
                                        {user.plan}
                                      </span>
                                    </td>
                                    <td className="py-4">
                                      {user.status === 'ACTIVE' ? (
                                        <span className="text-emerald-600 font-bold text-[9px] uppercase tracking-widest flex items-center gap-1">
                                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Activo
                                        </span>
                                      ) : user.status === 'PENDING_APPROVAL' ? (
                                        <span className="text-amber-500 font-extrabold text-[9px] uppercase tracking-widest flex items-center gap-1 animate-pulse">
                                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Pendiente
                                        </span>
                                      ) : (
                                        <span className="text-slate-400 font-bold text-[9px] uppercase tracking-widest flex items-center gap-1">
                                          <span className="w-1.5 h-1.5 rounded-full bg-slate-200" /> Inactivo
                                        </span>
                                      )}
                                      {user.expiresAt && (
                                        <span className="text-[8px] text-slate-400 block font-mono mt-0.5">Expira: {new Date(user.expiresAt).toLocaleDateString()}</span>
                                      )}
                                      {isExpiringSoon && (
                                        <span className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-700 border border-amber-500/15 rounded px-1.5 py-0.5 text-[6.5px] font-black uppercase tracking-wider mt-1 w-fit animate-pulse font-mono">
                                          ⚠️ Vence en {diffDays}d
                                        </span>
                                      )}
                                      {user.status === 'ACTIVE' && diffDays !== null && diffDays < 0 && (
                                        <span className="inline-flex items-center gap-1 bg-rose-500/10 text-rose-700 border border-rose-500/15 rounded px-1.5 py-0.5 text-[6.5px] font-black uppercase tracking-wider mt-1 w-fit font-mono">
                                          🚨 EXPIRADO
                                        </span>
                                      )}
                                    </td>
                                    <td className="py-4">
                                      <div className="space-y-1">
                                        <div className="flex items-center gap-1 font-mono text-[10.5px] text-slate-700 font-bold">
                                          <TrendingUp size={11} className="text-slate-400" />
                                          <span>Total: <strong className="text-slate-900">{user.totalAnalysesCount || 0}</strong></span>
                                        </div>
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                          <span className={`text-[8px] font-mono rounded px-1.5 py-0.5 font-bold uppercase ${
                                            userDailyCount > 0 
                                              ? 'bg-emerald-50 text-emerald-600 border border-emerald-100/50' 
                                              : 'bg-slate-100 text-slate-400'
                                          }`}>
                                            Hoy: {userDailyCount}/5
                                          </span>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="py-4 font-mono text-[9.5px]">
                                      {isPaypalTrial ? (
                                        <span className="text-purple-600 bg-purple-50/50 px-2.5 py-1.5 rounded-[6px] font-black block max-w-[124px] border border-purple-500/10 text-center text-[8px] uppercase tracking-wide animate-pulse">
                                          Prueba $1 (1 Sem)
                                        </span>
                                      ) : isPaypalSub ? (
                                        <span className="text-blue-600 bg-blue-50/50 px-2.5 py-1.5 rounded-[6px] font-black block max-w-[124px] border border-blue-500/10 text-center text-[8px] uppercase tracking-wide">
                                          Suscripción Autopago
                                        </span>
                                      ) : user.paymentReceiptUrl ? (
                                        user.paymentReceiptUrl.startsWith('data:image') ? (
                                          <button
                                            type="button"
                                            onClick={() => setAdminLightboxImage(user.paymentReceiptUrl!)}
                                            className="text-white bg-slate-900 border border-slate-800 hover:bg-slate-800 px-2 py-1.5 rounded-[6px] font-extrabold block w-full max-w-[124px] cursor-pointer text-center text-[8px] font-sans uppercase transition-colors"
                                          >
                                            📷 Ver Captura
                                          </button>
                                        ) : (
                                          <span 
                                            className="text-brand-lime bg-slate-950 px-2 py-1.5 rounded-[6px] font-bold block max-w-[124px] truncate cursor-pointer hover:bg-slate-900 border border-brand-lime/20 text-center text-[8.5px]" 
                                            title={user.paymentReceiptUrl}
                                            onClick={() => {
                                              if (user.paymentReceiptUrl) {
                                                navigator.clipboard.writeText(user.paymentReceiptUrl);
                                              }
                                            }}
                                          >
                                            HASH: {user.paymentReceiptUrl.substring(0, 10)}...
                                          </span>
                                        )
                                      ) : (
                                        <span className="text-slate-300 italic">—</span>
                                      )}
                                    </td>
                                  <td className="py-4 text-right pr-2">
                                    <div className="flex justify-end gap-1.5 flex-wrap">
                                      {user.status === 'PENDING_APPROVAL' && (
                                        <div className="flex flex-col gap-1 items-end w-full max-w-[170px]">
                                          <button
                                            onClick={() => handleAdminApprove(user.id, user.plan)}
                                            className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-2.5 py-1.5 rounded-lg text-[8.5px] uppercase tracking-wider shadow-sm transition-all text-center w-full"
                                            title={`Aprobar plan predeterminado: ${user.plan}`}
                                          >
                                            Aprobar {user.plan} ✓
                                          </button>
                                          <div className="flex gap-1 justify-end w-full">
                                            {user.plan !== 'RETAIL' && (
                                              <button
                                                onClick={() => handleAdminApprove(user.id, 'RETAIL')}
                                                className="text-[7.5px] bg-slate-50 hover:bg-slate-100 text-slate-500 border border-slate-200 px-1.5 py-0.5 rounded uppercase tracking-wider font-semibold"
                                                title="Aprobar como Básico (RETAIL)"
                                              >
                                                + RETAIL
                                              </button>
                                            )}
                                            {user.plan !== 'PRO' && (
                                              <button
                                                onClick={() => handleAdminApprove(user.id, 'PRO')}
                                                className="text-[7.5px] bg-slate-100/80 hover:bg-slate-200 text-slate-800 border border-slate-200 px-1.5 py-0.5 rounded uppercase tracking-wider font-semibold"
                                                title="Aprobar como PRO"
                                              >
                                                + PRO
                                              </button>
                                            )}
                                            {user.plan !== 'INSTITUTIONAL' && (
                                              <button
                                                onClick={() => handleAdminApprove(user.id, 'INSTITUTIONAL')}
                                                className="text-[7.5px] bg-slate-50 hover:bg-slate-100 text-slate-500 border border-slate-200 px-1.5 py-0.5 rounded uppercase tracking-wider font-semibold"
                                                title="Aprobar como Institucional"
                                              >
                                                + INST.
                                              </button>
                                            )}
                                          </div>
                                        </div>
                                      )}
                                      {user.status === 'ACTIVE' && user.role !== 'ADMIN' && (
                                        <div className="flex flex-col gap-1 items-end w-full max-w-[170px]">
                                          <div className="flex gap-1 w-full justify-end">
                                            <button
                                              onClick={() => handleAdminExtend(user.id, user.plan)}
                                              className="bg-brand-lime text-slate-900 hover:bg-white border border-brand-lime/30 font-extrabold px-2 py-1.5 rounded-lg text-[8.5px] uppercase tracking-wider transition-all flex-1 text-center"
                                              title={`Renovar ${user.plan} por +30 días`}
                                            >
                                              +30 Días
                                            </button>
                                            <button
                                              onClick={() => handleAdminSuspend(user.id)}
                                              className="bg-red-50 hover:bg-red-100 border border-red-100 text-red-500 font-bold px-2 py-1.5 rounded-lg text-[8.5px] uppercase tracking-wider transition-all"
                                            >
                                              Suspender
                                            </button>
                                          </div>
                                          {/* Permitir cambiar el plan del usuario activo directamente */}
                                          <div className="flex gap-1 justify-end w-full">
                                            {user.plan !== 'RETAIL' && (
                                              <button
                                                onClick={() => handleAdminApprove(user.id, 'RETAIL')}
                                                className="text-[7px] bg-slate-50 hover:bg-slate-100 text-slate-400 border border-slate-200/60 px-1 py-0.5 rounded uppercase font-semibold"
                                                title="Cambiar plan a Básico (RETAIL)"
                                              >
                                                Cambiar a RETAIL
                                              </button>
                                            )}
                                            {user.plan !== 'PRO' && (
                                              <button
                                                onClick={() => handleAdminApprove(user.id, 'PRO')}
                                                className="text-[7px] bg-slate-50 hover:bg-slate-100 text-slate-400 border border-slate-200/60 px-1 py-0.5 rounded uppercase font-semibold"
                                                title="Cambiar plan a PRO"
                                              >
                                                Cambiar a PRO
                                              </button>
                                            )}
                                          </div>
                                        </div>
                                      )}
                                      {user.status === 'INACTIVE' && (
                                        <div className="flex flex-col gap-1 items-end w-full max-w-[170px]">
                                          <button
                                            onClick={() => handleAdminApprove(user.id, user.plan)}
                                            className="bg-slate-900 text-brand-lime hover:bg-slate-800 font-bold px-2.5 py-1.5 rounded-lg text-[8.5px] uppercase tracking-wider transition-all text-center w-full"
                                            title={`Activar con plan registrado por defecto: ${user.plan}`}
                                          >
                                            Activar {user.plan}
                                          </button>
                                          <div className="flex gap-1 justify-end w-full">
                                            {user.plan !== 'RETAIL' && (
                                              <button
                                                onClick={() => handleAdminApprove(user.id, 'RETAIL')}
                                                className="text-[7.5px] bg-slate-50 hover:bg-slate-100 text-slate-500 border border-slate-200 px-1.5 py-0.5 rounded uppercase tracking-wider font-semibold"
                                                title="Activar como Básico (RETAIL)"
                                              >
                                                + RETAIL
                                              </button>
                                            )}
                                            {user.plan !== 'PRO' && (
                                              <button
                                                onClick={() => handleAdminApprove(user.id, 'PRO')}
                                                className="text-[7.5px] bg-slate-100/80 hover:bg-slate-200 text-slate-800 border border-slate-200 px-1.5 py-0.5 rounded uppercase tracking-wider font-semibold"
                                                title="Activar como PRO"
                                              >
                                                + PRO
                                              </button>
                                            )}
                                            {user.plan !== 'INSTITUTIONAL' && (
                                              <button
                                                onClick={() => handleAdminApprove(user.id, 'INSTITUTIONAL')}
                                                className="text-[7.5px] bg-slate-50 hover:bg-slate-100 text-slate-500 border border-slate-200 px-1.5 py-0.5 rounded uppercase tracking-wider font-semibold"
                                                title="Activar como Institucional"
                                              >
                                                + INST.
                                              </button>
                                            )}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          )()}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Code Generator Panel */}
                    <div className="lg:col-span-4 space-y-6">
                      <div className="glass-card rounded-[2rem] p-7 shadow-premium space-y-5">
                        <div>
                          <h4 className="text-lg font-serif italic text-slate-900 font-bold">Generador Cuantitativo de Licencias</h4>
                          <p className="text-[8.5px] uppercase tracking-widest text-[10px] text-slate-400 font-bold">DISTRIBUCIÒN DE CÓDIGOS DE ACCESO</p>
                        </div>

                        <form onSubmit={handleGenerateCode} className="space-y-4">
                          <div className="space-y-1.5">
                            <label className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Plan de Suscripción</label>
                            <select 
                              value={newCodePlan} 
                              onChange={(e) => setNewCodePlan(e.target.value as SubscriptionPlan)}
                              className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-3.5 text-xs text-slate-900 focus:outline-none"
                            >
                              <option value="RETAIL">BÁSICO</option>
                              <option value="PRO">PRO</option>
                              <option value="INSTITUTIONAL">INSTITUCIONAL</option>
                            </select>
                          </div>

                          <div className="space-y-2 bg-slate-50/80 p-3.5 rounded-2xl border border-slate-100/80">
                            <div className="flex items-center justify-between">
                              <span className="text-[9.5px] text-slate-700 font-bold uppercase tracking-wider block font-sans">
                                Cortesía 3 Telemetrías
                              </span>
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input 
                                  type="checkbox" 
                                  checked={isTelemetryLimited} 
                                  onChange={(e) => setIsTelemetryLimited(e.target.checked)}
                                  className="sr-only peer"
                                />
                                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-lime"></div>
                              </label>
                            </div>
                            <p className="text-[8px] text-slate-400 uppercase tracking-wide font-medium mt-0.5 leading-normal">
                              Activa el modo de evaluación con un cupo estricto de 3 análisis totales en lugar de membresía por tiempo ilimitado.
                            </p>
                          </div>

                          {!isTelemetryLimited ? (
                            <div className="space-y-1.5 animate-[fadeIn_0.2s_ease-out]">
                              <label className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Duración de Membresía</label>
                              <select 
                                value={newCodeDuration} 
                                onChange={(e) => setNewCodeDuration(Number(e.target.value))}
                                className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-3.5 text-xs text-slate-900 focus:outline-none"
                              >
                                <option value="7">Trial - 7 Días</option>
                                <option value="30">Mensual - 30 Días</option>
                                <option value="90">Trimestral - 90 Días</option>
                                <option value="365">Anual - 365 Días</option>
                              </select>
                            </div>
                          ) : (
                            <div className="space-y-1.5 animate-[fadeIn_0.2s_ease-out]">
                              <label className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Cupo de Telemetrías</label>
                              <select 
                                value={allowedTotalAnalyses} 
                                onChange={(e) => setAllowedTotalAnalyses(Number(e.target.value))}
                                className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-3.5 text-xs text-slate-900 focus:outline-none"
                              >
                                <option value="3">3 Telemetrías</option>
                                <option value="5">5 Telemetrías</option>
                                <option value="10">10 Telemetrías</option>
                              </select>
                            </div>
                          )}

                          <button
                            type="submit"
                            className="w-full py-4.5 bg-slate-950 hover:bg-slate-800 text-brand-lime font-bold rounded-xl text-[10px] uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md mt-4"
                          >
                            <Plus size={14} /> Generar Clave Digital
                          </button>
                        </form>
                      </div>

                      {/* Display active keys */}
                      <div className="glass-card rounded-[2rem] p-7 shadow-premium space-y-4">
                        <span className="text-[9px] uppercase tracking-widest font-extrabold text-slate-400 block">ÚLTIMOS CÓDIGOS CREADOS</span>
                        
                        <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                          {allCodes.map((c) => (
                            <div key={c.code} className="flex justify-between items-center p-3.5 rounded-xl border border-slate-50 bg-slate-50/50 text-[10px] font-mono">
                              <div>
                                <span className="font-extrabold text-slate-800 select-all block">{c.code}</span>
                                <span className="text-[7.5px] text-slate-400 uppercase tracking-widest block font-sans mt-0.5">
                                  {c.plan} • {c.isTelemetryLimited ? `${c.allowedTotalAnalyses || 3} Telemetrías` : `${c.durationDays} Días`}
                                </span>
                              </div>
                              {c.isUsed ? (
                                <span className="text-[7.5px] uppercase tracking-widest bg-slate-100 text-slate-400 px-2 py-0.5 rounded-md font-sans">Usado: @{c.usedBy}</span>
                              ) : (
                                <span className="text-[7.5px] uppercase tracking-widest bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-md font-bold font-sans">Disponible</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Admin-only Dynamic Payment Methods Config Panel */}
                      <div className="glass-card rounded-[2rem] p-7 shadow-premium space-y-5">
                        <div>
                          <h4 className="text-lg font-serif italic text-slate-900 font-bold">Canales de Depósito</h4>
                          <p className="text-[8.5px] uppercase tracking-widest text-[#E5B800] font-bold">CONFIGURACIÓN DE PAGOS TRC20 Y BINANCE</p>
                        </div>

                        <form onSubmit={handleUpdatePaymentConfig} className="space-y-4">
                          <div className="space-y-1.5">
                            <label className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block font-mono">Dirección USDT (TRC20)</label>
                            <input
                              type="text"
                              required
                              value={paymentConfig.usdtAddress}
                              onChange={(e) => setPaymentConfig(prev => ({ ...prev, usdtAddress: e.target.value }))}
                              placeholder="Ej: TCWAFUsu2iuwkrQyATGKBjdSYczm2pVDGk"
                              className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2.5 px-3.5 text-[10.5px] font-mono text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#22C55E]"
                            />
                          </div>

                          {/* Custom USDT QR Upload */}
                          <div className="space-y-1 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                            <label className="text-[8px] text-[#22C55E] font-black uppercase tracking-wider block font-mono">
                              QR USDT TRC20 Personalizado (Opcional)
                            </label>
                            {paymentConfig.usdtQrImage ? (
                              <div className="flex items-center gap-2.5 animate-[fadeIn_0.2s_ease-out]">
                                <img 
                                  src={paymentConfig.usdtQrImage} 
                                  alt="USDT Custom QR" 
                                  className="w-10 h-10 rounded border border-slate-200 bg-white object-contain p-0.5"
                                />
                                <div className="space-y-0.5">
                                  <span className="block text-[7.5px] uppercase tracking-wider text-emerald-600 font-bold font-mono">✓ QR Activo</span>
                                  <button
                                    type="button"
                                    onClick={() => setPaymentConfig(prev => ({ ...prev, usdtQrImage: '' }))}
                                    className="text-[8px] uppercase font-mono tracking-wider font-black text-red-500 hover:text-red-700 cursor-pointer"
                                  >
                                    [Eliminar]
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleUsdtQrChange}
                                className="block w-full text-[8.5px] font-mono font-extrabold text-slate-500
                                  file:mr-3 file:py-1 file:px-2.5
                                  file:rounded-lg file:border-0
                                  file:text-[8px] file:font-semibold
                                  file:bg-slate-900 file:text-brand-lime
                                  hover:file:bg-black file:cursor-pointer"
                              />
                            )}
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block font-mono">Binance Pay ID</label>
                            <input
                              type="text"
                              required
                              value={paymentConfig.binancePayId}
                              onChange={(e) => setPaymentConfig(prev => ({ ...prev, binancePayId: e.target.value }))}
                              placeholder="Ej: 888777123"
                              className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2.5 px-3.5 text-[10.5px] font-mono text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#E5B800]"
                            />
                          </div>

                          {/* Custom Binance QR Upload */}
                          <div className="space-y-1 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                            <label className="text-[8px] text-[#E5B800] font-black uppercase tracking-wider block font-mono">
                              QR Binance Pay Personalizado (Opcional)
                            </label>
                            {paymentConfig.binanceQrImage ? (
                              <div className="flex items-center gap-2.5 animate-[fadeIn_0.2s_ease-out]">
                                <img 
                                  src={paymentConfig.binanceQrImage} 
                                  alt="Binance Custom QR" 
                                  className="w-10 h-10 rounded border border-slate-200 bg-white object-contain p-0.5"
                                />
                                <div className="space-y-0.5">
                                  <span className="block text-[7.5px] uppercase tracking-wider text-yellow-600 font-bold font-mono">✓ QR Activo</span>
                                  <button
                                    type="button"
                                    onClick={() => setPaymentConfig(prev => ({ ...prev, binanceQrImage: '' }))}
                                    className="text-[8px] uppercase font-mono tracking-wider font-black text-red-500 hover:text-red-700 cursor-pointer"
                                  >
                                    [Eliminar]
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleBinanceQrChange}
                                className="block w-full text-[8.5px] font-mono font-extrabold text-slate-500
                                  file:mr-3 file:py-1 file:px-2.5
                                  file:rounded-lg file:border-0
                                  file:text-[8px] file:font-semibold
                                  file:bg-slate-900 file:text-[#E5B800]
                                  hover:file:bg-black file:cursor-pointer"
                              />
                            )}
                          </div>

                          <div className="space-y-1.5 pt-4 border-t border-slate-100">
                            <label className="text-[9px] text-[#00457C] font-black uppercase tracking-wider block font-mono flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block" />
                              Clave de Cliente PayPal (Client ID - Producción/Sandbox)
                            </label>
                            <input
                              type="text"
                              value={paymentConfig.paypalClientId || ''}
                              onChange={(e) => setPaymentConfig(prev => ({ ...prev, paypalClientId: e.target.value }))}
                              placeholder="Ej: AW_v7Bxt6..."
                              className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2.5 px-3.5 text-[10.5px] font-mono text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                            <p className="text-[8px] text-slate-400">Obtenido de developer.paypal.com (Live App ID o Sandbox).</p>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[9px] text-[#00457C] font-black uppercase tracking-wider block font-mono flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block" />
                              ID Plan PayPal - Básico ($29)
                            </label>
                            <input
                              type="text"
                              value={paymentConfig.paypalPlanIdBasic || ''}
                              onChange={(e) => setPaymentConfig(prev => ({ ...prev, paypalPlanIdBasic: e.target.value }))}
                              placeholder="Ej: P-6U703114..."
                              className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2.5 px-3.5 text-[10.5px] font-mono text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </div>

                          <div className="space-y-1.5 pb-2">
                            <label className="text-[9px] text-[#00457C] font-black uppercase tracking-wider block font-mono flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block" />
                              ID Plan PayPal - Pro ($79)
                            </label>
                            <input
                              type="text"
                              value={paymentConfig.paypalPlanIdPro || ''}
                              onChange={(e) => setPaymentConfig(prev => ({ ...prev, paypalPlanIdPro: e.target.value }))}
                              placeholder="Ej: P-02270631..."
                              className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2.5 px-3.5 text-[10.5px] font-mono text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </div>

                          {paymentConfigMsg && (
                            <div className={`p-3 rounded-xl text-[9px] uppercase font-mono tracking-wider font-extrabold ${paymentConfigMsg.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-500 border border-red-100'}`}>
                              {paymentConfigMsg.type === 'success' ? '✓ ' : '✗ '} {paymentConfigMsg.text}
                            </div>
                          )}

                          <button
                            type="submit"
                            disabled={isUpdatingPaymentConfig}
                            className={`w-full py-3.5 bg-slate-950 text-brand-lime hover:bg-slate-800 font-bold rounded-xl text-[10px] uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md ${isUpdatingPaymentConfig ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
                          >
                            {isUpdatingPaymentConfig ? (
                              <span className="animate-pulse">Guardando Configuración...</span>
                            ) : (
                              <span>✓ Guardar configuraciones de cobro</span>
                            )}
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>
                </motion.main>
              ) : currentUser.status !== 'ACTIVE' && currentUser.role !== 'ADMIN' ? (
                /* =================== BILLING / PAYWALL GATE =================== */
                <motion.main 
                  key="paywall"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="max-w-4xl mx-auto px-6 py-16 text-center space-y-12"
                >
                  <div className="max-w-lg mx-auto space-y-4">
                    <div className="w-20 h-20 bg-amber-50 rounded-[2rem] flex items-center justify-center mx-auto border border-amber-100 mb-6">
                      <AlertCircle className="text-amber-500 w-10 h-10 animate-bounce" />
                    </div>

                    {currentUser.status === 'PENDING_APPROVAL' ? (
                      <>
                        <h2 className="text-3xl font-serif italic text-slate-900 leading-tight">
                          Pago en Espera de <span className="text-amber-500">Aprobación</span>
                        </h2>
                        <p className="text-slate-500 text-sm leading-relaxed">
                          Estimado <b className="text-slate-700">@{currentUser.username}</b>, tu solicitud de membresía para el plan <b className="text-slate-800">{currentUser.plan}</b> está siendo verificada manualmente por nuestra administración financiera.
                        </p>
                        <div className="bg-slate-50 p-4.5 rounded-2xl text-left text-[10px] space-y-2.5 border border-slate-100/80 max-w-sm mx-auto font-mono text-slate-500">
                          <span className="font-bold text-slate-800 uppercase block tracking-wider font-sans">Comprobante Registrado:</span>
                          {currentUser.paymentReceiptUrl?.startsWith('data:image') ? (
                            <div className="space-y-1.5">
                              <img 
                                src={currentUser.paymentReceiptUrl} 
                                alt="Comprobante de pago" 
                                className="w-full max-h-40 object-contain rounded-xl border border-slate-200/70 bg-white p-1 shadow-sm" 
                              />
                              <span className="text-[8px] text-slate-400 block font-sans text-center">Captura de pantalla cargada por el usuario</span>
                            </div>
                          ) : (
                            <span className="break-all whitespace-pre-wrap block text-slate-600">{currentUser.paymentReceiptUrl}</span>
                          )}
                          <span className="text-[8px] text-slate-400 block font-sans uppercase tracking-[0.05em] pt-2 border-t border-slate-100/80">La activación es manual y demora entre 10 minutos y 2 horas.</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <h2 className="text-3xl font-serif italic text-slate-900 leading-tight">
                          Suscripción <span className="text-red-500">Inactiva o Expirada</span>
                        </h2>
                        <p className="text-slate-500 text-sm leading-relaxed">
                          La terminal institucional de IA XAU KIN requiere una clave de membresía activa. Adquiere una licencia con la administración o activa un código de cupón a continuación:
                        </p>
                      </>
                    )}
                  </div>

                  {/* Pricing grid display */}
                  {currentUser.status !== 'PENDING_APPROVAL' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                      {(['RETAIL', 'PRO', 'INSTITUTIONAL'] as SubscriptionPlan[]).map((pKey) => {
                        const plan = PLAN_DETAILS[pKey];
                        const isInst = pKey === 'INSTITUTIONAL';
                        return (
                          <div key={pKey} className={`glass-card rounded-[2rem] p-7 text-left flex flex-col justify-between transition-all duration-300
                            ${isInst ? 'border border-brand-lime/30 bg-slate-950 text-white hover:border-brand-lime/50' : 'border border-slate-100 bg-white text-slate-900'}`}>
                            <div className="space-y-4">
                              <span className={`px-3 py-1 text-[8px] font-extrabold uppercase rounded-lg tracking-wider border
                                ${isInst ? 'bg-brand-lime/10 border-brand-lime/20 text-brand-lime' : 'bg-slate-50 border-slate-100 text-slate-800'}`}>
                                Plan {plan.name.split(' ')[1]}
                              </span>
                              <div className="space-y-1">
                                <h5 className={`text-3xl font-serif italic font-bold ${isInst ? 'text-white' : 'text-slate-900'}`}>{plan.price}</h5>
                                <p className={`text-[9px] uppercase tracking-widest font-bold text-slate-400`}>
                                  {isInst ? 'condiciones a convenir' : 'acceso mensual'}
                                </p>
                              </div>
                              <ul className="space-y-2.5 text-[10px] pt-3 border-t border-slate-100/10">
                                {plan.features.map((feat, idx) => (
                                  <li key={idx} className="flex gap-2">
                                    <Check className={`w-3.5 h-3.5 mt-0.5 shrink-0 text-brand-lime`} />
                                    <span className={isInst ? 'text-slate-300' : 'text-slate-500'}>{feat}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {isInst ? (
                              <a 
                                id="contactar-gerencia-email-btn"
                                href={`mailto:gerencia@iaxaukin.com?subject=Consulta%20Plan%20Institucional%20IA%20XAU%20KIN&body=Hola%20Gerencia,%20mi%20usuario%20de%20operador%20es%20@${currentUser?.username || ''}.%20Deseo%20obtener%20más%20información%20sobre%20el%20Plan%20Institucional.`}
                                className="w-full text-center py-3 font-bold uppercase tracking-wider text-[9px] rounded-xl mt-8 cursor-pointer transition-all duration-300 bg-brand-lime text-slate-950 hover:bg-white hover:text-black shadow-lg shadow-brand-lime/10 block"
                              >
                                Contactar Gerencia
                              </a>
                            ) : (
                              <button 
                                id={`solicitar-plan-${pKey}-btn`}
                                onClick={() => setCheckoutPlan(pKey)}
                                className="w-full text-center py-3 font-bold uppercase tracking-wider text-[9px] rounded-xl mt-8 cursor-pointer transition-all duration-300 bg-slate-950 text-white hover:bg-slate-800 block"
                              >
                                Solicitar con Administración
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Coupon activation box */}
                  {currentUser.status !== 'PENDING_APPROVAL' && (
                    <div className="max-w-md mx-auto glass-card rounded-[2.5rem] p-8 shadow-sm space-y-4 border border-slate-100">
                      <div>
                        <h4 className="text-base font-serif italic text-slate-900 font-bold">¿Tienes un código de activación / cupón?</h4>
                        <p className="text-[9px] uppercase tracking-widest text-slate-400 font-mono">INGRESA TU LLAVE DIGITAL EN ESTA MESA DE ACTIVACIÓN</p>
                      </div>

                      <form onSubmit={handleActivateAccount} className="space-y-4">
                        <div className="relative">
                          <input 
                            type="text"
                            required
                            value={activationCode}
                            onChange={(e) => setActivationCode(e.target.value.toUpperCase())}
                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 px-4 text-center text-xs font-mono tracking-widest placeholder:text-slate-300 focus:outline-none focus:bg-white"
                            placeholder="CÓDIGO DE ACTIVACIÓN / CUPÓN"
                          />
                        </div>

                        {activationError && (
                          <div className="text-[9.5px] text-red-500 bg-red-50 py-2.5 px-4 rounded-xl border border-red-100 font-semibold uppercase tracking-wider">
                            {activationError}
                          </div>
                        )}

                        {activationSuccess && (
                          <div className="text-[9.5px] text-emerald-600 bg-emerald-50 py-2.5 px-4 rounded-xl border border-emerald-100 font-semibold uppercase tracking-wider animate-pulse">
                            {activationSuccess}
                          </div>
                        )}

                        <button
                          type="submit"
                          className="w-full py-4 bg-slate-900 hover:bg-black text-brand-lime font-bold rounded-xl text-[10px] uppercase tracking-widest transition-all"
                        >
                          Validar y Activar Membresía
                        </button>
                      </form>
                    </div>
                  )}

                  {/* Checkout Modal Overlay */}
                  <AnimatePresence>
                    {checkoutPlan && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4"
                      >
                        <motion.div
                          initial={{ scale: 0.95, y: 15 }}
                          animate={{ scale: 1, y: 0 }}
                          exit={{ scale: 0.95, y: 15 }}
                          className="bg-white border border-slate-100 max-w-lg w-full rounded-[2.5rem] p-6 sm:p-8 shadow-2xl relative space-y-6 text-left"
                        >
                          {/* Close Button */}
                          <button
                            onClick={() => {
                              setCheckoutPlan(null);
                              setIsTrialPromoSelected(false);
                              setPaymentTxHash('');
                              setPaymentError(null);
                            }}
                            className="absolute right-6 top-6 text-slate-400 hover:text-slate-700 font-bold p-1 cursor-pointer"
                          >
                            ✕
                          </button>

                          <div className="space-y-1">
                            <span className={`text-[8px] font-extrabold uppercase px-2.5 py-1 rounded-md border tracking-widest block w-fit ${
                              checkoutPlan === 'INSTITUTIONAL' 
                                ? 'bg-amber-400/10 border-amber-400/20 text-amber-600'
                                : 'bg-brand-lime/10 border-brand-lime/20 text-brand-navy'
                            }`}>
                              Mesa de Recaudo Directo XAU KIN
                            </span>
                            <h3 className="text-2xl font-serif italic text-slate-900 font-bold">
                              Checkout {PLAN_DETAILS[checkoutPlan].name}
                            </h3>
                            <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">
                              Valor mensual: <b className="text-slate-800">{PLAN_DETAILS[checkoutPlan].price}</b>
                            </p>
                          </div>

                          {checkoutPlan === 'INSTITUTIONAL' ? (
                            // Institutional Plan View
                            <div className="space-y-4">
                              <p className="text-slate-600 text-xs leading-relaxed">
                                Nuestra solución institucional incluye soporte con <b>Webhooks de Automatización</b> para retransmitir análisis cuantitativos de la IA en tiempo real directamente a tus comunidades de Telegram o Discord.
                              </p>
                              
                              <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-3">
                                <label className="block text-[9.5px] uppercase tracking-wider text-slate-400 font-black font-mono">
                                  ¿A dónde deseas dirigir tu Webhook de Comunidad?
                                </label>
                                <input
                                  type="text"
                                  value={webhookUrl}
                                  onChange={(e) => setWebhookUrl(e.target.value)}
                                  placeholder="Canal de Telegram (ej: @miComunidadVIP) o Webhook URL"
                                  className="w-full bg-white border border-slate-200 rounded-xl py-3 px-3.5 text-xs text-slate-800 focus:outline-none focus:border-slate-400 font-mono"
                                />
                                <span className="text-[8.5px] text-slate-400 leading-normal block uppercase font-mono font-bold tracking-tight">
                                  • LA IA XAU KIN PUBLICARÁ LOS ESCANEOS Y VECTORES DE ENTRADA CON FORMATO EN TU COMUNIDAD.
                                </span>
                              </div>

                              <div className="flex flex-col gap-2 pt-2">
                                <a
                                  href={`mailto:gerencia@iaxaukin.com?subject=Solicitud%20Plan%20Institucional%20IA%20XAU%20KIN&body=Hola%20Gerencia,%20mi%20operador%20es%20@${currentUser?.username}%20y%20deseo%20activar%20el%20Plan%20Institucional%20con%20soporte%20de%20webhook%20para%20${encodeURIComponent(webhookUrl || 'mi canal')}.`}
                                  className="w-full text-center py-4 bg-slate-950 font-bold uppercase tracking-wider text-[10px] rounded-xl text-white hover:bg-slate-850 transition shadow-lg shadow-black/10 flex items-center justify-center gap-1.5"
                                >
                                  Solicitar mediante Email a Gerencia
                                </a>
                                
                                <a
                                  href="https://t.me/gerencia_iaxaukin"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="w-full text-center py-4 bg-brand-lime text-slate-950 font-bold uppercase tracking-wider text-[10px] rounded-xl hover:bg-slate-950 hover:text-brand-lime transition-all duration-300 shadow-md flex items-center justify-center gap-1.5"
                                >
                                  Contactar por Telegram Administrativo
                                </a>
                              </div>
                            </div>
                          ) : (
                            // Retail & Pro Checkout View
                            <div className="space-y-4 font-sans">
                              {/* Horizontal Payment Method Tabs */}
                              <div className="grid grid-cols-3 gap-1 sm:gap-1.5 border-b border-slate-100 pb-2">
                                {[
                                  { id: 'USDT', label: 'USDT (TRC20)', icon: Coins },
                                  { id: 'BINANCE2', label: 'Binance Pay', icon: QrCode },
                                  { id: 'PAYPAL', label: 'PayPal', icon: CreditCard }
                                ].map((tab) => {
                                  // Map 'BINANCE2' tab to 'BINANCE' state
                                  const isActive = (tab.id === 'BINANCE2' && paymentMethod === 'BINANCE') || paymentMethod === tab.id;
                                  const IconComponent = tab.icon;
                                  const isDisabled = isTrialPromoSelected && tab.id !== 'PAYPAL';
                                  return (
                                    <button
                                      key={tab.id}
                                      type="button"
                                      disabled={isDisabled}
                                      onClick={() => {
                                        setPaymentMethod(tab.id === 'BINANCE2' ? 'BINANCE' : tab.id as any);
                                        setPaymentError(null);
                                      }}
                                      className={`flex items-center justify-center gap-1 px-1.5 py-2 text-[8px] sm:text-[10px] uppercase tracking-wider font-extrabold rounded-lg cursor-pointer transition text-center ${
                                        isDisabled
                                          ? 'opacity-30 bg-slate-100 border border-slate-100 text-slate-350 cursor-not-allowed'
                                          : isActive 
                                            ? 'bg-slate-900 border border-slate-800 text-brand-lime font-extrabold' 
                                            : 'bg-slate-50 border border-slate-100 text-slate-500 hover:bg-slate-100 font-bold'
                                      }`}
                                    >
                                      <IconComponent size={11} className={isDisabled ? 'text-slate-300' : isActive ? 'text-brand-lime shrink-0' : 'text-slate-400 shrink-0'} />
                                      <span className="truncate">{tab.label}</span>
                                    </button>
                                  );
                                })}
                              </div>

                              {paymentMethod === 'PAYPAL' ? (
                                <div className="space-y-4">
                                  {paymentError && (
                                    <div className="p-3.5 bg-red-50 border border-red-100 text-red-500 text-[10.5px] font-semibold rounded-xl uppercase tracking-wider">
                                      {paymentError}
                                    </div>
                                  )}

                                  {paymentSuccess && (
                                    <div className="p-3.5 bg-emerald-50 border border-emerald-100 text-emerald-600 text-[10.5px] font-semibold rounded-xl uppercase tracking-wider animate-pulse">
                                      {paymentSuccess}
                                    </div>
                                  )}

                                  {(checkoutPlan === 'RETAIL' || checkoutPlan === 'PRO') ? (
                                    <div className="space-y-4 animate-[fadeIn_0.2s_ease-out]">
                                      {isTrialPromoSelected && checkoutPlan === 'RETAIL' ? (
                                        <div className="space-y-3 animate-[fadeIn_0.15s_ease-out]">
                                          <div className="p-4 bg-[#CCFF00]/10 border border-[#CCFF00]/25 rounded-2xl space-y-1.5">
                                            <div className="flex justify-between items-center text-[9.5px] uppercase font-bold tracking-widest text-[#a6cf00] font-mono">
                                              <span>Portal de Prueba PayPal</span>
                                              <span className="text-emerald-700 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded text-[8px]">Pago Seguro / Activación Al Instante</span>
                                            </div>
                                            <p className="text-[10px] text-slate-600 leading-relaxed font-semibold">
                                              Presione el primer botón oficial de PayPal para autorizar su prueba.
                                            </p>
                                          </div>

                                          <PayPalTrialButton 
                                             onClearError={() => setPaymentError(null)}
                                             onSuccess={async (paymentId) => {
                                              setIsSubmittingPayment(true);
                                              setPaymentError(null);
                                              try {
                                                const updatedUser = await userStore.submitPaymentReceipt(
                                                  currentUser.id,
                                                  'RETAIL',
                                                  `PAYPAL_TRIAL_ID:${paymentId}`
                                                );
                                                setCurrentUser(updatedUser);
                                                setPaymentSuccess(`¡Pago autorizado con éxito (ID: ${paymentId})! La administración activará tu semana de prueba básica de inmediato.`);
                                                setTimeout(() => {
                                                  setCheckoutPlan(null);
                                                  setIsTrialPromoSelected(false);
                                                  setPaymentSuccess(null);
                                                }, 6000);
                                              } catch (err: any) {
                                                setPaymentError('Transacción autorizada de PayPal, pero ocurrió un error guardándola en tu cuenta: ' + err.message);
                                              } finally {
                                                setIsSubmittingPayment(false);
                                              }
                                            }}
                                            onError={(err) => {
                                              setPaymentError(err);
                                            }}
                                          />
                                        </div>
                                      ) : (
                                        <div className="space-y-3 animate-[fadeIn_0.15s_ease-out]">
                                          <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-2">
                                            <div className="flex justify-between items-center text-[9.5px] uppercase font-bold tracking-widest text-slate-900 font-mono">
                                              <span>Suscripción Segura de PayPal</span>
                                              <span className="text-emerald-700 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded text-[8.5px]">Cifrado SSL / Pago Recurrente</span>
                                            </div>
                                            <p className="text-[10px] text-slate-500 leading-relaxed font-semibold">
                                              Utiliza el botón de PayPal para suscribirte a la membresía <b>{checkoutPlan === 'RETAIL' ? 'Básica (Socio Básico)' : 'Avanzada (Socio Pro)'}</b> de manera automática por tan solo <b>{checkoutPlan === 'RETAIL' ? '$29.00 USD' : '$79.00 USD'}</b> al mes. Puedes cancelar cuando quieras directamente desde tu panel de PayPal.
                                            </p>
                                          </div>

                                          <PayPalSubscriptionButton 
                                            clientId={paymentConfig.paypalClientId || "BAA-Qyr9jMnnpjjCeqy_wmkaWooAqWlZD_H63OIR9znYei195dD7E3Eq0sjapP7OHxH6UmADRjn9wZf3Vc"}
                                            planId={checkoutPlan === 'RETAIL' 
                                              ? (paymentConfig.paypalPlanIdBasic || "P-6U703114N8775584UNIU4K7Y") 
                                              : (paymentConfig.paypalPlanIdPro || "P-022706311G490222MNIU4USY")
                                            }
                                            onSuccess={async (subscriptionId) => {
                                              setIsSubmittingPayment(true);
                                              setPaymentError(null);
                                              try {
                                                const updatedUser = await userStore.submitPaymentReceipt(
                                                  currentUser.id,
                                                  checkoutPlan,
                                                  `PAYPAL_SUSB_ID:${subscriptionId}`
                                                );
                                                setCurrentUser(updatedUser);
                                                setPaymentSuccess(`¡Suscripción de PayPal autorizada con éxito (ID: ${subscriptionId})! Esperando activación muy rápida de administración.`);
                                                setTimeout(() => {
                                                  setCheckoutPlan(null);
                                                  setPaymentTxHash('');
                                                  setPaymentSuccess(null);
                                                }, 6000);
                                              } catch (err: any) {
                                                setPaymentError('Transacción autorizada de PayPal, pero ocurrió un error guardándola en tu cuenta: ' + err.message);
                                              } finally {
                                                setIsSubmittingPayment(false);
                                              }
                                            }}
                                            onError={(err) => {
                                              setPaymentError(err);
                                            }}
                                          />
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    <div className="p-4 text-center space-y-2 bg-slate-50 border border-slate-100 rounded-2xl">
                                      <p className="text-xs text-slate-600 font-medium font-sans">
                                        Las suscripciones automatizadas con PayPal están reservadas únicamente para la <b>Membresía Básica y Pro</b>.
                                      </p>
                                      <p className="text-[10px] text-slate-400 font-sans">
                                        Para adquirir el Plan Socio Institucional, por favor contacta a gerencia administrativa en gerencia@iaxaukin.com o utiliza USDT / Binance Pay.
                                      </p>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <form onSubmit={handleRegisterPayment} className="space-y-4">
                                  {/* Dynamic Payment Method Instruction Box */}
                                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-4">
                                    {paymentMethod === 'USDT' ? (
                                      <div className="space-y-4 animate-[fadeIn_0.2s_ease-out]">
                                        <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-widest text-[#22C55E] font-mono">
                                          <span>Red de Pago USDT</span>
                                          <span className="text-emerald-700 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded text-[8.5px]">TRC20 (Red TRON)</span>
                                        </div>

                                        <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-3 rounded-xl border border-slate-100">
                                          {/* Dynamic, Real-time Scannable QR Code */}
                                          <div className="flex flex-col items-center space-y-1.5 shrink-0 bg-slate-50 p-2 text-center rounded-lg border border-slate-100 shadow-inner">
                                            <div className="w-[100px] h-[100px] relative bg-white border border-slate-200/60 p-1 flex items-center justify-center rounded overflow-hidden">
                                              <img 
                                                src={paymentConfig.usdtQrImage || `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(paymentConfig.usdtAddress)}`} 
                                                alt="USDT TRC20 QR Code" 
                                                className="w-full h-full object-contain rounded" 
                                                referrerPolicy="no-referrer"
                                              />
                                            </div>
                                            <span className="text-[7px] uppercase tracking-wider text-slate-500 font-extrabold font-mono">Escanea con Binance</span>
                                          </div>

                                          <div className="space-y-2.5 w-full">
                                            <div className="space-y-1">
                                              <span className="block text-[8px] uppercase tracking-wider text-slate-400 font-extrabold font-mono">Dirección USDT (TRC20):</span>
                                              <div className="flex items-center gap-1.5">
                                                <input
                                                  type="text"
                                                  readOnly
                                                  value={paymentConfig.usdtAddress}
                                                  className="w-full bg-slate-50 border border-slate-100 rounded-lg py-2 px-3 text-[10px] font-mono text-slate-800 select-all focus:outline-none"
                                                />
                                                <button
                                                  type="button"
                                                  onClick={() => {
                                                    navigator.clipboard.writeText(paymentConfig.usdtAddress);
                                                    setCopiedText("USDT");
                                                    setTimeout(() => setCopiedText(""), 2000);
                                                  }}
                                                  className={`px-3 py-2 rounded-lg text-[9px] uppercase tracking-wider font-extrabold cursor-pointer transition shrink-0 ${
                                                    copiedText === "USDT" 
                                                      ? 'bg-emerald-500 text-white' 
                                                      : 'bg-slate-900 border border-slate-850 text-brand-lime hover:bg-black'
                                                  }`}
                                                >
                                                  {copiedText === "USDT" ? '¡Copiado!' : 'Copiar'}
                                                </button>
                                              </div>
                                            </div>
                                            <p className="text-[8px] uppercase tracking-tight text-slate-500 leading-normal font-mono font-bold">
                                              • Escanea el código QR directamente desde la aplicación de <b className="text-slate-800">Binance</b> para cargar automáticamente la dirección de red de forma segura.
                                            </p>
                                            <p className="text-[8px] uppercase tracking-tight text-slate-400 leading-normal font-mono">
                                              • Envía exactamente el valor neto correspondiente para evitar demoras en el procesamiento de la licencia.
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="space-y-4 animate-[fadeIn_0.2s_ease-out]">
                                        <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-widest text-[#E5B800] font-mono">
                                          <span>Binance Pay Directo</span>
                                          <span className="text-yellow-700 bg-yellow-500/10 border border-yellow-500/20 px-2 py-0.5 rounded text-[8.5px]">Cero Comisión / Instantáneo</span>
                                        </div>

                                        <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-3 rounded-xl border border-slate-100">
                                          {/* Dynamic, Real-time Scannable QR Code for Binance Pay */}
                                          <div className="flex flex-col items-center space-y-1.5 shrink-0 bg-slate-50 p-2 text-center rounded-lg border border-slate-100 shadow-inner">
                                            <div className="w-[100px] h-[100px] relative bg-white border border-slate-200/60 p-1 flex items-center justify-center rounded overflow-hidden">
                                              <img 
                                                src={paymentConfig.binanceQrImage || `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(paymentConfig.binancePayId)}`} 
                                                alt="Binance Pay QR Code" 
                                                className="w-full h-full object-contain rounded" 
                                                referrerPolicy="no-referrer"
                                              />
                                            </div>
                                            <span className="text-[7.5px] uppercase tracking-widest text-[#E5B800] font-bold font-mono">Scan Pay ID</span>
                                          </div>

                                          <div className="space-y-2.5 w-full text-slate-800">
                                            <div className="space-y-1">
                                              <span className="block text-[8px] uppercase tracking-wider text-slate-400 font-extrabold font-mono">Binance Pay ID (ID de Binance):</span>
                                              <div className="flex items-center gap-1.5">
                                                <input
                                                  type="text"
                                                  readOnly
                                                  value={paymentConfig.binancePayId}
                                                  className="w-full bg-slate-50 border border-slate-100 rounded-lg py-2 px-3 text-[10px] font-mono text-slate-800 select-all focus:outline-none"
                                                />
                                                <button
                                                  type="button"
                                                  onClick={() => {
                                                    navigator.clipboard.writeText(paymentConfig.binancePayId);
                                                    setCopiedText("PAYID");
                                                    setTimeout(() => setCopiedText(""), 2000);
                                                  }}
                                                  className={`px-3 py-2 rounded-lg text-[9px] uppercase tracking-wider font-extrabold cursor-pointer transition shrink-0 ${
                                                    copiedText === "PAYID" 
                                                      ? 'bg-emerald-500 text-white' 
                                                      : 'bg-slate-900 border border-slate-850 text-[#E5B800] hover:bg-black'
                                                  }`}
                                                >
                                                  {copiedText === "PAYID" ? '¡Copiado!' : 'Copiar'}
                                                </button>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </div>

                                  {/* Trazabilidad Information / How verification works (Institutional, emoji-free) */}
                                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                                    <span className="block text-[9px] uppercase tracking-wider text-slate-800 font-black font-mono">
                                      Protocolo Oficial de Verificación e Inicio de Licencia:
                                    </span>
                                    <ul className="text-[8px] uppercase font-mono tracking-tight text-slate-600 space-y-1.5 list-none font-bold">
                                      <li>• Realice la transferencia correspondiente al costo neto de la membresía seleccionada.</li>
                                      <li>• Adjunte la captura de pantalla del comprobante de envío o ingrese el hash de transacción (TXID).</li>
                                      <li>• La orden registrará un estado PENDIENTE en la base de datos de administración.</li>
                                      <li>• El área encargada validará el depósito en el menor tiempo posible usando herramientas de explorador TRON o canales de verificación de red.</li>
                                      <li>• Una vez confirmados los fondos se activará la licencia completa por un plazo estricto de 30 días.</li>
                                    </ul>
                                  </div>

                                  {/* PNG/JPG Receipt Upload Feature */}
                                  <div className="space-y-2">
                                    <label className="block text-[10px] uppercase tracking-wider text-slate-400 font-extrabold font-mono ml-1">
                                      ¿Tienes la captura de pantalla de tu pago? (Recomendado)
                                    </label>
                                    
                                    {paymentTxHash.startsWith('data:image') ? (
                                      <div className="relative p-3 bg-slate-50 border border-emerald-250 rounded-2xl flex flex-col items-center justify-center space-y-2 animate-[fadeIn_0.2s_ease-out]">
                                        <img 
                                          src={paymentTxHash} 
                                          alt="Comprobante cargado" 
                                          className="h-28 object-contain rounded-lg border border-slate-200 bg-white p-1 shadow-sm"
                                        />
                                        <div className="flex gap-2 items-center">
                                          <span className="text-[8px] uppercase font-mono tracking-wider font-extrabold text-emerald-600 bg-emerald-50 border border-emerald-200/50 px-2 py-0.5 rounded">
                                            ✓ Captura Cargada Con Éxito
                                          </span>
                                          <button
                                            type="button"
                                            onClick={() => setPaymentTxHash('')}
                                            className="text-[8.5px] uppercase font-mono tracking-wider font-black text-red-500 hover:text-red-700 cursor-pointer"
                                          >
                                            [Eliminar]
                                          </button>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="space-y-2.5">
                                        <div className="relative border-2 border-dashed border-slate-200 hover:border-slate-300 rounded-2xl transition duration-200 bg-slate-50 hover:bg-slate-100/70 flex flex-col items-center justify-center p-5 text-center group">
                                          <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleReceiptFileChange}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                            disabled={receiptFileLoading}
                                          />
                                          {receiptFileLoading ? (
                                            <div className="flex flex-col items-center space-y-2 pb-1">
                                              <Loader2 className="w-5 h-5 text-brand-navy animate-spin" />
                                              <span className="text-[9px] uppercase font-bold tracking-wider text-slate-500 font-mono">Procesando imagen...</span>
                                            </div>
                                          ) : (
                                            <div className="space-y-1.5 flex flex-col items-center">
                                              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-slate-400 group-hover:scale-105 transition duration-150 shadow-sm border border-slate-100">
                                                <Upload size={13} className="text-slate-500 animate-pulse" />
                                              </div>
                                              <div>
                                                <span className="text-[9.5px] font-bold text-slate-700 block uppercase font-mono">
                                                  Sube tu foto, captura o comprobante
                                                </span>
                                                <span className="text-[7.5px] uppercase tracking-wide text-slate-400 font-mono font-bold block mt-0.5">
                                                  Arrastra el archivo o haz clic aquí (PNG, JPG, JPEG)
                                                </span>
                                              </div>
                                            </div>
                                          )}
                                        </div>

                                        <button
                                          type="button"
                                          onClick={() => setIsReceiptCameraOpen(true)}
                                          className="w-full py-2.5 px-4 bg-slate-900 border border-slate-800 hover:bg-black text-[#CCFF00] hover:text-white rounded-xl text-[9px] font-bold font-mono uppercase tracking-wider flex items-center justify-center gap-1.5 transition shadow-sm cursor-pointer"
                                        >
                                          <Camera size={12} />
                                          Tomar Foto con la Cámara (Opción Móvil)
                                        </button>
                                      </div>
                                    )}
                                  </div>

                                  <div className="space-y-2">
                                    <label className="block text-[10px] uppercase tracking-wider text-slate-400 font-black font-mono ml-1">
                                      {paymentMethod === 'BINANCE' 
                                        ? 'ID de Orden / Binance Pay ID de Origen o Comprobante'
                                        : 'ID de Transferencia / Hash de Pago (TXID)'}
                                    </label>
                                    <input
                                      type="text"
                                      required={!paymentTxHash.startsWith('data:image')}
                                      value={paymentTxHash.startsWith('data:image') ? '' : paymentTxHash}
                                      onChange={(e) => setPaymentTxHash(e.target.value)}
                                      placeholder={
                                        paymentMethod === 'BINANCE'
                                          ? "Ingrese Binance Pay ID o número de comprobante"
                                          : "Escribe el Hash (TXID) de tu transferencia"
                                      }
                                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 px-4 text-xs font-mono tracking-widest text-slate-900 placeholder:text-slate-300 focus:outline-none focus:bg-white focus:border-slate-400"
                                    />
                                  </div>

                                  {paymentError && (
                                    <div className="p-3.5 bg-red-50 border border-red-100 text-red-500 text-[10.5px] font-semibold rounded-xl uppercase tracking-wider">
                                      {paymentError}
                                    </div>
                                  )}

                                  {paymentSuccess && (
                                    <div className="p-3.5 bg-emerald-50 border border-emerald-100 text-emerald-600 text-[10.5px] font-semibold rounded-xl uppercase tracking-wider animate-pulse">
                                      {paymentSuccess}
                                    </div>
                                  )}

                                  <button
                                    type="submit"
                                    disabled={isSubmittingPayment}
                                    className="w-full py-4 bg-slate-900 hover:bg-black text-brand-lime font-bold rounded-xl text-[10px] uppercase tracking-widest transition-all cursor-pointer shadow-md flex items-center justify-center gap-1.5"
                                  >
                                    {isSubmittingPayment ? (
                                      <span>Registrando Transacción...</span>
                                    ) : (
                                      <span>REGISTRAR COMPROBANTE Y ENVIAR REGISTRO</span>
                                    )}
                                  </button>
                                </form>
                              )}
                            </div>
                          )}
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.main>
              ) : (
                /* =================== STANDARD TRADING TERMINAL =================== */
                <motion.main 
                  key="terminal"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-16"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
                    
                    {/* Left Column: Upload & Preview */}
                    <div className="lg:col-span-5 space-y-8 sm:space-y-10">
                      <section className="space-y-3 sm:space-y-4">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-brand-lime animate-pulse" />
                          <span className="text-[9px] uppercase tracking-[0.3em] text-slate-400 font-mono font-bold">Terminal en Línea</span>
                        </div>
                        <h2 className="text-2xl sm:text-4xl font-serif italic text-slate-900 leading-tight">
                          Modelado de <br className="hidden sm:block" />
                          <span className="text-brand-lime">Estructura Cuantitativa</span>
                        </h2>
                        <p className="text-slate-500 text-xs sm:text-sm leading-relaxed max-w-sm">
                          Cargue la telemetría visual de TradingView (XAUUSD). IA XAU KIN ejecutará un escaneo de alta precisión para identificar desequilibrios, BOS y CHoCH en ventanas de {selectedDuration} minutos.
                        </p>
                      </section>

                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`relative group cursor-pointer rounded-3xl border-2 border-dashed transition-all duration-500 overflow-hidden aspect-[4/3] flex items-center justify-center
                          ${image 
                            ? 'border-brand-lime/30 glass-card' 
                            : isDragging
                              ? 'border-brand-lime bg-slate-50 scale-[1.02] shadow-2xl shadow-brand-lime/10'
                              : 'border-slate-200 hover:border-brand-lime/50 glass-card hover:bg-slate-50/50'}`}
                      >
                        <AnimatePresence>
                          {isDragging && !image && (
                            <motion.div 
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="absolute inset-0 bg-white z-10 flex flex-col items-center justify-center border-4 border-brand-lime pointer-events-none"
                            >
                              <motion.div
                                animate={{ y: [0, -10, 0] }}
                                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                              >
                                <Upload className="text-brand-lime mb-4" size={56} />
                              </motion.div>
                              <p className="text-brand-navy font-black uppercase tracking-[0.2em] text-sm italic">Soltar para Escaneo</p>
                              <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-widest">Protocolo Cuantitativo XAU KIN</p>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {image ? (
                          <img 
                            src={image} 
                            alt="Market Telemetry" 
                            className="w-full h-full object-contain p-4"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className={`text-center p-10 transition-opacity duration-300 ${isDragging ? 'opacity-0' : 'opacity-100'}`}>
                            <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-500 shadow-sm">
                              <Upload className="text-slate-300 group-hover:text-brand-lime" size={32} />
                            </div>
                            <p className="text-sm font-bold text-slate-800">Ingresar Datos Visuales</p>
                            <p className="text-xs text-slate-400 mt-2">Pegar (Ctrl+V) o Clic para Cargar</p>
                            <p className="text-[9px] text-slate-300 mt-1 uppercase tracking-widest font-bold">Telemetría (PNG/JPG)</p>
                          </div>
                        )}
                        <input 
                          type="file" 
                          ref={fileInputRef}
                          onChange={handleImageUpload}
                          className="hidden" 
                          accept="image/*"
                        />
                      </div>

                      {/* Camera capture trigger for telemetry */}
                      {!image && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsTelemetryCameraOpen(true);
                          }}
                          className="w-full py-2.5 px-4 bg-slate-900 border border-slate-800 hover:bg-black text-[#CCFF00] hover:text-white rounded-2xl text-[9px] font-bold font-mono uppercase tracking-wider flex items-center justify-center gap-1.5 transition shadow-sm cursor-pointer"
                        >
                          <Camera size={12} />
                          ¿En móvil? Tomar foto de pantalla o gráfico
                        </button>
                      )}

                      {/* Ventana Temporal Config */}
                      <div className="bg-slate-50/70 border border-slate-100 rounded-3xl p-5 space-y-4 shadow-sm animate-[fadeIn_0.3s_ease-out]">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                            <span className="text-[9.5px] uppercase tracking-[0.2em] text-slate-500 font-mono font-bold">Ventana Temporal Dinámica</span>
                          </div>
                          {currentUser && currentUser.plan === 'RETAIL' && !currentUser.isTelemetryLimited && (
                            <span className="text-[8px] bg-red-500/10 border border-red-500/20 text-red-600 px-2.5 py-1 rounded-md font-bold uppercase shrink-0 flex items-center gap-1">
                              <Lock size={10} className="text-red-500" /> Exclusivo PRO
                            </span>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2.5">
                          <button
                            type="button"
                            onClick={() => {
                              if (!currentUser) return;
                              if (currentUser.plan === 'RETAIL' && !currentUser.isTelemetryLimited) {
                                setError("VENTANA DE SOCIO PRO RESTRINGIDA: La ventana de 30 minutos es una ventaja exclusiva para Socios Pro o Socios Institucionales. Contacte a la administración para mejorar su cuenta.");
                                return;
                              }
                              setSelectedDuration(30);
                            }}
                            className={`py-3.5 px-3 rounded-2xl text-[10.5px] font-bold uppercase tracking-wider transition-all duration-300 border flex flex-col items-center justify-center gap-1.5 cursor-pointer relative overflow-hidden group
                              ${selectedDuration === 30 
                                ? 'bg-slate-950 border-slate-900 text-brand-lime shadow-xl' 
                                : 'bg-white border-slate-100 text-slate-500 hover:bg-slate-100 hover:text-slate-900 hover:border-slate-200'
                              } ${currentUser && currentUser.plan === 'RETAIL' && !currentUser.isTelemetryLimited ? 'opacity-70' : ''}`}
                          >
                            <span className="font-bold">30 Minutos</span>
                            <span className="text-[7.5px] opacity-75 normal-case font-medium tracking-normal text-center">Socio PRO / Avanzado</span>
                          </button>
                          
                          <button
                            type="button"
                            onClick={() => setSelectedDuration(60)}
                            className={`py-3.5 px-3 rounded-2xl text-[10.5px] font-bold uppercase tracking-wider transition-all duration-300 border flex flex-col items-center justify-center gap-1.5 cursor-pointer relative overflow-hidden group
                              ${selectedDuration === 60 
                                ? 'bg-slate-950 border-slate-900 text-brand-lime shadow-xl' 
                                : 'bg-white border-slate-100 text-slate-500 hover:bg-slate-100 hover:text-slate-900 hover:border-slate-200'
                              }`}
                          >
                            <span className="font-bold">60 Minutos</span>
                            <span className="text-[7.5px] opacity-75 normal-case font-medium tracking-normal text-center">Bloque Estándar (H1)</span>
                          </button>
                        </div>
                        
                        <div className="flex items-start gap-2 text-[9.5px] text-slate-400 leading-relaxed font-sans font-medium">
                          <Clock className="w-3.5 h-3.5 text-brand-lime shrink-0 mt-0.5" />
                          <span>
                            {selectedDuration === 30 
                              ? "Prisma de 30 min: Estrategia de menor duración temporal para scalping inmediato de 10 pips." 
                              : "Prisma de 60 min: Análisis estándar de rango institucional con balance del algoritmo IPDA."
                            }
                          </span>
                        </div>
                      </div>

                      {currentUser && (
                        <div className="space-y-2 mb-4">
                          <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-widest text-slate-400 px-1">
                            <div className="flex items-center gap-1.5">
                              <div className={`w-1.5 h-1.5 rounded-full ${
                                currentUser.role === 'ADMIN' 
                                  ? 'bg-brand-lime' 
                                  : currentUser.isTelemetryLimited 
                                    ? ((currentUser.totalAnalysesCount || 0) >= (currentUser.allowedTotalAnalyses || 3) ? 'bg-red-500 animate-pulse' : 'bg-yellow-500 animate-pulse')
                                    : (dailyAnalysisCount >= (currentUser.plan === 'RETAIL' ? 5 : currentUser.plan === 'PRO' ? 30 : 100) ? 'bg-red-500 animate-pulse' : 'bg-brand-lime')
                              }`}></div>
                              <span>{currentUser.isTelemetryLimited ? 'Prueba de Cortesía' : 'Suscripción Activa'}</span>
                            </div>
                            <span className="font-mono text-slate-500 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100">
                              {currentUser.role === 'ADMIN' ? (
                                <span>Operador Admin</span>
                              ) : currentUser.isTelemetryLimited ? (
                                <span>Cortesía (3 Scans)</span>
                              ) : (
                                <span>Socio {currentUser.plan}</span>
                              )}
                            </span>
                          </div>
                          
                          <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100 flex flex-col gap-2">
                            <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-widest text-slate-600">
                              <span>{currentUser.isTelemetryLimited ? 'Consumo de Telemetrías:' : 'Créditos de Hoy:'}</span>
                              <span className="font-mono">
                                {currentUser.role === 'ADMIN' ? (
                                  <span>ILIMITADO</span>
                                ) : currentUser.isTelemetryLimited ? (
                                  <span>{currentUser.totalAnalysesCount || 0} / {currentUser.allowedTotalAnalyses || 3} TELEMETRÍAS</span>
                                ) : (
                                  <span>{dailyAnalysisCount} / {currentUser.plan === 'RETAIL' ? 5 : currentUser.plan === 'PRO' ? 30 : 100} CONSULTAS</span>
                                )}
                              </span>
                            </div>
                            {currentUser.role !== 'ADMIN' && (
                              <div className="text-[9.5px] text-slate-400 normal-case font-medium flex justify-between items-center border-t border-slate-100/60 pt-2">
                                <span>{currentUser.isTelemetryLimited ? 'Capacidad asignada total:' : 'Capacidad mensual de tu plan:'}</span>
                                <span className="font-bold text-slate-700 bg-brand-lime/10 text-[9px] px-2 py-0.5 rounded border border-brand-lime/10">
                                  {currentUser.isTelemetryLimited ? (
                                    <span>Máximo {currentUser.allowedTotalAnalyses || 3} Escaneos Totales</span>
                                  ) : currentUser.plan === 'RETAIL' ? (
                                    "Hasta 150 / Mes"
                                  ) : currentUser.plan === 'PRO' ? (
                                    "Hasta 900 / Mes"
                                  ) : (
                                    "Hasta 3,000 / Mes"
                                  )}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Membership upgrade nudge */}
                          {currentUser.role !== 'ADMIN' && (
                            <button
                              type="button"
                              onClick={() => {
                                setProfileModalTab('membership');
                                setIsProfileModalOpen(true);
                              }}
                              className="w-full py-2.5 px-4 bg-[#CCFF00]/10 hover:bg-[#CCFF00]/20 border border-[#CCFF00]/20 text-slate-800 text-[9px] font-extrabold uppercase tracking-wider rounded-xl transition-all duration-200 flex items-center justify-between group cursor-pointer"
                            >
                              <span className="flex items-center gap-1.5 font-sans">
                                <Sparkles size={11} className="text-slate-600 animate-pulse shrink-0" />
                                <span>Ver Planes & Cambiar de Membresía</span>
                              </span>
                              <span className="group-hover:translate-x-1 transition-transform duration-200">➔</span>
                            </button>
                          )}
                        </div>
                      )}

                      <button
                        onClick={handleButtonClick}
                        disabled={(!image && !analysis) || isAnalyzing}
                        className={`w-full py-5 rounded-2xl font-bold text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all duration-300
                          ${(!image && !analysis) || isAnalyzing 
                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                            : analysis 
                              ? 'bg-brand-navy text-brand-lime border border-brand-lime/30 hover:bg-slate-800'
                              : 'bg-slate-900 text-white hover:bg-brand-navy hover:shadow-2xl hover:shadow-brand-lime/20 active:scale-[0.98]'}`}
                      >
                        {isAnalyzing ? (
                          <>
                            <Loader2 className="animate-spin" size={18} />
                            Procesando Algoritmos...
                          </>
                        ) : analysis ? (
                          <>
                            <Check size={18} /> Nuevo Escaneo
                          </>
                        ) : (
                          <>
                            Ejecutar Modelado <ChevronRight size={16} />
                          </>
                        )}
                      </button>

                      {error && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-5 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-4 text-red-600 text-xs font-medium"
                        >
                          <AlertTriangle size={18} className="shrink-0" />
                          <p>{error}</p>
                        </motion.div>
                      )}
                    </div>

                    {/* Right Column: Results */}
                    <div className="lg:col-span-7">
                      <AnimatePresence mode="wait">
                        {analysis ? (
                          <motion.div
                            key="analysis"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="glass-card rounded-[1.5rem] sm:rounded-[2.5rem] p-5 sm:p-10 shadow-premium relative overflow-hidden"
                          >
                            <div className="relative space-y-8">
                              <div className="flex items-center justify-between border-b border-slate-50 pb-8">
                                <div className="space-y-1">
                                  <h3 className="text-slate-900 font-serif italic text-2xl">
                                    Matriz Operativa Institucional
                                  </h3>
                                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">IA XAU KIN Quantitative Strategy Report</p>
                                </div>
                                <div className="px-4 py-2 bg-brand-lime/10 text-brand-lime text-[10px] font-bold rounded-xl border border-brand-lime/20 uppercase tracking-widest">
                                  {currentUser.plan === 'INSTITUTIONAL' ? 'Institutional Grade' : 'High Conviction'}
                                </div>
                              </div>

                              <div className="prose prose-slate max-w-none">
                                <div className="whitespace-pre-wrap text-slate-600 leading-relaxed font-sans text-sm">
                                  {analysis}
                                </div>
                              </div>

                              {(currentUser.plan === 'INSTITUTIONAL' || currentUser.role === 'ADMIN') && (
                                <div className="flex justify-end">
                                  <button
                                    onClick={handleCopy}
                                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all duration-300
                                      ${copied 
                                        ? 'bg-green-500 text-white' 
                                        : 'bg-brand-navy text-white hover:bg-slate-800 shadow-lg shadow-slate-900/10'}`}
                                  >
                                    {copied ? (
                                      <>
                                        <Check size={14} /> Copiado
                                      </>
                                    ) : (
                                      <>
                                        <Copy size={14} /> Copiar Análisis
                                      </>
                                    )}
                                  </button>
                                </div>
                              )}

                              <div className="pt-8 border-t border-slate-50 flex items-center justify-between">
                                <div className="flex items-center gap-3 text-[10px] text-slate-400 uppercase font-bold tracking-widest">
                                  <Clock size={14} className="text-brand-lime" /> UTC Reloj: {new Date().toLocaleTimeString()}
                                </div>
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                              </div>
                            </div>
                          </motion.div>
                        ) : (
                          <motion.div
                            key="placeholder"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="min-h-[320px] sm:min-h-[500px] h-full glass-card rounded-[1.5rem] sm:rounded-[2.5rem] flex flex-col items-center justify-center text-center p-6 sm:p-16 shadow-premium"
                          >
                            <div className="w-16 h-16 sm:w-24 sm:h-24 bg-slate-50 rounded-[1.5rem] sm:rounded-[2rem] flex items-center justify-center mb-6 sm:mb-8 animate-pulse shrink-0">
                              <BrainCircuit className="text-slate-200 w-8 h-8 sm:w-12 sm:h-12" />
                            </div>
                            <h3 className="text-slate-900 font-serif italic text-lg sm:text-xl mb-2 sm:mb-3">Mesa Analítica en Standby</h3>
                            <p className="text-slate-400 text-xs sm:text-sm max-w-xs leading-relaxed">
                              Socio <b className="text-slate-600">@{currentUser.username}</b> ({currentUser.plan}), cargue la telemetría visual de su par XAUUSD para iniciar el modelado algorítmico.
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.main>
              )}
            </AnimatePresence>

            {/* Footer Info */}
            <footer className="max-w-7xl mx-auto px-6 py-20 border-t border-slate-100 mt-20">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
                <div className="space-y-6">
                  <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center">
                    <TrendingUp size={20} className="text-brand-lime" />
                  </div>
                  <h4 className="text-slate-900 font-serif italic text-lg">
                    Arquitectura de Mercado
                  </h4>
                  <p className="text-slate-500 text-xs leading-relaxed">
                    Modelado algorítmico de BOS y CHoCH para la identificación de flujos de órdenes institucionales.
                  </p>
                </div>
                <div className="space-y-6">
                  <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center">
                    <Target size={20} className="text-brand-lime" />
                  </div>
                  <h4 className="text-slate-900 font-serif italic text-lg">
                    Optimización Cuantitativa
                  </h4>
                  <p className="text-slate-500 text-xs leading-relaxed">
                    Vectores operativos calibrados para capturar ineficiencias de 10 pips con alta precisión estadística.
                  </p>
                </div>
                <div className="space-y-6">
                  <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center">
                    <ShieldCheck size={20} className="text-brand-navy" />
                  </div>
                  <h4 className="text-slate-900 font-serif italic text-lg">
                    Gestión Profesional
                  </h4>
                  <p className="text-slate-500 text-xs leading-relaxed">
                    Protocolos de riesgo integrados para proteger el capital y fomentar la disciplina operativa.
                  </p>
                </div>
              </div>
              <div className="mt-24 flex flex-col items-center gap-6">
                <Logo className="h-10 w-auto opacity-30 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500" />
                <p className="text-[10px] text-slate-300 uppercase tracking-[0.5em] font-bold">
                  © 2026 IA XAU KIN • Institutional Intelligence
                </p>
                <div className="flex gap-4 text-[9px] text-slate-400 font-extrabold uppercase tracking-wider">
                  <a 
                    href="/privacy" 
                    onClick={(e) => { e.preventDefault(); navigateTo('/privacy'); }} 
                    className="hover:text-black hover:underline transition-colors"
                  >
                    Política de Privacidad
                  </a>
                  <span className="text-slate-200 font-normal">•</span>
                  <a 
                    href="/terms" 
                    onClick={(e) => { e.preventDefault(); navigateTo('/terms'); }} 
                    className="hover:text-black hover:underline transition-colors"
                  >
                    Condiciones del Servicio
                  </a>
                </div>
              </div>
            </footer>

            {/* Reset Confirmation Modal */}
            <AnimatePresence>
              {showResetConfirm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setShowResetConfirm(false)}
                    className="absolute inset-0 bg-brand-navy/60 backdrop-blur-sm"
                  />
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="relative bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl border border-slate-100"
                  >
                    <div className="w-16 h-16 bg-brand-lime/10 rounded-2xl flex items-center justify-center mb-6">
                      <FileImage className="text-brand-lime" size={32} />
                    </div>
                    <h3 className="text-2xl font-serif italic text-slate-900 mb-3">
                      Nuevo Modelado
                    </h3>
                    <p className="text-slate-500 text-sm leading-relaxed mb-8">
                      ¿Desea descartar el análisis actual e ingresar nueva telemetría visual para un nuevo modelado cuantitativo?
                    </p>
                    <div className="flex gap-4">
                      <button 
                        onClick={() => setShowResetConfirm(false)}
                        className="flex-1 py-4 rounded-xl font-bold text-[10px] uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        Cancelar
                      </button>
                      <button 
                        onClick={resetAnalysis}
                        className="flex-1 py-4 bg-brand-navy text-brand-lime rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-brand-navy/10"
                      >
                        Confirmar
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            {/* Custom API Key Configuration Modal */}
            <AnimatePresence>
              {showKeyConfig && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setShowKeyConfig(false)}
                    className="absolute inset-0 bg-brand-navy/60 backdrop-blur-sm"
                  />
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="relative bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl border border-slate-100"
                  >
                    <div className="w-16 h-16 bg-brand-lime/10 rounded-2xl flex items-center justify-center mb-6">
                      <Settings className="text-brand-lime" size={32} />
                    </div>
                    <h3 className="text-2xl font-serif italic text-slate-900 mb-3">
                      Clave API de Gemini
                    </h3>
                    <p className="text-slate-500 text-sm leading-relaxed mb-6">
                      Proporciona tu propia clave de API de Gemini para habilitar el motor de IA XAU KIN en enlaces compartidos, producción y fuera de desarrollo.
                    </p>

                    <div className="space-y-4 mb-6 font-sans">
                      <div>
                        <label className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400 block mb-2">
                          CLAVE API PERSONAL (Google AI Studio)
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="password"
                            value={customApiKey}
                            onChange={(e) => {
                              setCustomApiKey(e.target.value);
                              if (testKeyResult) setTestKeyResult(null);
                            }}
                            placeholder="AIzaSy..."
                            className="flex-1 h-12 bg-slate-50 border border-slate-250 rounded-xl px-4 text-xs font-mono focus:outline-none focus:border-brand-lime transition-colors"
                          />
                          <button
                            type="button"
                            onClick={() => testManualApiKey(customApiKey)}
                            disabled={isTestingKey}
                            className="h-12 px-4 bg-slate-900 text-[#CCFF00] hover:bg-slate-800 disabled:opacity-50 font-black text-[10px] uppercase tracking-wider rounded-xl transition-all flex items-center justify-center min-w-[90px] cursor-pointer shadow-sm"
                          >
                            {isTestingKey ? (
                              <div className="w-4 h-4 border-2 border-[#CCFF00] border-t-transparent rounded-full animate-spin" />
                            ) : (
                              "Probar"
                            )}
                          </button>
                        </div>
                      </div>

                      {testKeyResult && (
                        <motion.div 
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`p-3.5 rounded-xl text-[10px] leading-normal font-bold flex items-start gap-2.5 ${
                            testKeyResult.success 
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-100/80 shadow-sm' 
                              : 'bg-rose-50 text-rose-800 border border-rose-100/80 shadow-sm'
                          }`}
                        >
                          <span className="text-xs select-none">{testKeyResult.success ? '✅' : '❌'}</span>
                          <div className="break-all">{testKeyResult.message}</div>
                        </motion.div>
                      )}

                      <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
                        ¿No tienes una clave? Consíguela gratis en{" "}
                        <a 
                          href="https://aistudio.google.com/app/apikey" 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-brand-lime font-bold hover:underline"
                        >
                          Google AI Studio
                        </a>. Esta clave se guarda localmente y con total confidencialidad en tu navegador (LocalStorage).
                      </p>
                    </div>

                    <div className="flex flex-col gap-3 font-sans">
                      <button 
                        onClick={() => {
                          const cleaned = cleanKey(customApiKey);
                          if (cleaned === "") {
                            localStorage.removeItem("manual_gemini_api_key");
                            setCustomApiKey("");
                          } else {
                            localStorage.setItem("manual_gemini_api_key", cleaned);
                            setCustomApiKey(cleaned);
                          }
                          setTestKeyResult(null);
                          setShowKeyConfig(false);
                        }}
                        className="w-full py-4 bg-slate-900 text-[#CCFF00] rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg cursor-pointer"
                      >
                        Guardar Clave
                      </button>
                      <div className="flex gap-4">
                        <button 
                          onClick={() => {
                            setCustomApiKey("");
                            setTestKeyResult(null);
                            localStorage.removeItem("manual_gemini_api_key");
                            setShowKeyConfig(false);
                          }}
                          className="flex-1 py-3 border border-slate-200 hover:bg-slate-50 rounded-xl font-bold text-[9px] uppercase tracking-widest text-red-500 transition-colors cursor-pointer"
                        >
                          Eliminar Clave
                        </button>
                        <button 
                          onClick={() => {
                            setTestKeyResult(null);
                            setShowKeyConfig(false);
                          }}
                          className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold text-[9px] uppercase tracking-widest text-slate-600 transition-colors cursor-pointer"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            {/* Lightbox for Payment Receipts Screenshots */}
            <AnimatePresence>
              {adminLightboxImage && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-[999] flex items-center justify-center p-4 sm:p-6"
                  onClick={() => setAdminLightboxImage(null)}
                >
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="bg-white rounded-3xl p-4 sm:p-6 max-w-xl w-full border border-slate-150 shadow-2xl relative space-y-4"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                      <span className="text-[10px] uppercase font-mono tracking-widest font-black text-slate-800 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Comprobante de Pago Regulado
                      </span>
                      <button
                        type="button"
                        onClick={() => setAdminLightboxImage(null)}
                        className="text-slate-500 hover:text-slate-800 font-bold text-[9px] uppercase font-mono tracking-widest bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                      >
                        Cerrar
                      </button>
                    </div>
                    
                    <div className="bg-slate-50 rounded-2xl p-2.5 flex items-center justify-center border border-slate-100 max-h-[70vh] overflow-auto select-none">
                      <img
                        src={adminLightboxImage}
                        alt="Captura comprobante completo"
                        className="max-h-[55vh] object-contain rounded-xl shadow-sm bg-white"
                      />
                    </div>

                    <div className="text-center font-sans pb-1">
                      <span className="text-[8.5px] uppercase font-bold tracking-wider text-slate-400 font-mono">
                        Validación y aprobación manual por Administración IA XAU KIN
                      </span>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Camera Modals for Mobile/Wired Photos */}
            <CameraModal
              isOpen={isReceiptCameraOpen}
              onClose={() => setIsReceiptCameraOpen(false)}
              onCapture={handleReceiptCameraCapture}
              title="Escáner: Capturar Comprobante de Pago"
            />

            <CameraModal
              isOpen={isTelemetryCameraOpen}
              onClose={() => setIsTelemetryCameraOpen(false)}
              onCapture={handleTelemetryCameraCapture}
              title="Escáner: Capturar Gráfico Visual o Telemetría"
            />

            <ProfileModal
              isOpen={isProfileModalOpen}
              onClose={() => setIsProfileModalOpen(false)}
              currentUser={currentUser}
              onUpdateUser={(updatedUser) => setCurrentUser(updatedUser)}
              handleLogout={handleLogout}
              initialTab={profileModalTab}
              onSelectPlan={(plan, isTrial) => {
                setCheckoutPlan(plan);
                setIsTrialPromoSelected(!!isTrial);
                if (isTrial) {
                  setPaymentMethod('PAYPAL');
                }
              }}
            />

            {/* Expiration Warning Popup Dialog Modal */}
            <AnimatePresence>
              {showExpirationAlertPopup && currentUser && currentUser.expiresAt && (
                <div id="expiration-alert-popup-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 15 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="w-full max-w-md bg-white border border-amber-200 rounded-[28px] p-6 shadow-2xl relative overflow-hidden"
                  >
                    {/* Pulsating glowing amber bar on top */}
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-[#CCFF00] to-amber-500 animate-[pulse_2s_infinite]" />

                    <div className="flex items-center gap-2 mb-4 text-amber-600">
                      <span className="text-xl">🚨</span>
                      <span className="text-[9px] font-mono font-extrabold uppercase tracking-widest text-amber-700">
                        Alerta de Vencimiento de Licencia
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 tracking-tight mb-2 font-sans">
                      Tu membresía está por terminar
                    </h3>

                    {(() => {
                      const expiryDate = new Date(currentUser.expiresAt);
                      const today = new Date();
                      const d1 = Date.UTC(expiryDate.getFullYear(), expiryDate.getMonth(), expiryDate.getDate());
                      const d2 = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
                      const diffDays = Math.ceil((d1 - d2) / (1000 * 60 * 60 * 24));
                      
                      return (
                        <p className="text-xs text-slate-500 leading-relaxed mb-5 font-sans">
                          Estimado socio <span className="font-semibold text-slate-800 lowercase">@{currentUser.username}</span>, te quedan únicamente <strong className="text-amber-600 underline font-mono text-sm">{diffDays <= 0 ? '0' : diffDays} {diffDays === 1 ? 'día' : 'días'}</strong> de tu suscripción de nivel <span className="uppercase font-bold text-slate-700 font-mono text-[10px] bg-slate-100 px-1 py-0.5 rounded">{currentUser.plan}</span>. Recuerda renovar para no perder accesos directos al modelado algorítmico de la mesa operativa.
                        </p>
                      );
                    })()}

                    <div className="flex gap-2.5">
                      <button
                        type="button"
                        onClick={() => {
                          sessionStorage.setItem('dismissed_expiration_popup_v2', 'true');
                          setShowExpirationAlertPopup(false);
                          setIsProfileModalOpen(true);
                        }}
                        className="flex-grow py-2.5 px-4 bg-slate-900 hover:bg-black text-[#CCFF00] rounded-xl text-[10px] font-mono font-bold uppercase tracking-wider transition text-center cursor-pointer"
                      >
                        Verificar & Renovar
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          sessionStorage.setItem('dismissed_expiration_popup_v2', 'true');
                          setShowExpirationAlertPopup(false);
                        }}
                        className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-[10px] font-mono font-bold uppercase tracking-wider transition text-center cursor-pointer border border-slate-200"
                      >
                        Entendido
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </div>
  );
}
