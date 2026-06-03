/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, ThinkingLevel } from "@google/genai";
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
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { Login } from './components/Login';
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
Texto profesional sobre:
- Selección de entradas de alta convicción (máximo 2-3 ejecuciones por bloque).
- Implementación estricta de Stop Loss.
- Exposición por operación (0.5% - 1.0% del AUM).
- Disciplina operativa y neutralidad emocional.

---

### 🚫 RESTRICCIONES DE PROCESAMIENTO

- Prohibido omitir el timestamp de origen del gráfico.
- Prohibido proyectar fuera de la ventana de 60 minutos.
- Prioridad absoluta a la tendencia de alta temporalidad para los 10 pips.
- **FORMATO HORARIO:** Debes utilizar EXCLUSIVAMENTE el formato de 12 horas (AM/PM). Queda terminantemente prohibido el uso de formato de 24 horas (ej: prohibido 14:00, usar 02:00 PM).
- **RESTRICCIÓN DE EXTENSIÓN:** El reporte completo debe ser altamente denso en información técnica y NO exceder las 500 palabras en total.

---

Tu output debe reflejar la precisión y el rigor de un terminal de trading institucional.`;

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  const [image, setImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>("image/png");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  
  // Custom navigation state for Admins (Mesa Admin / Terminal de Análisis)
  const [viewMode, setViewMode] = useState<'TERMINAL' | 'ADMIN_BOARD'>('TERMINAL');

  // Inactive profile activation state
  const [activationCode, setActivationCode] = useState('');
  const [activationError, setActivationError] = useState<string | null>(null);
  const [activationSuccess, setActivationSuccess] = useState<string | null>(null);

  // Admin View state references
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [allCodes, setAllCodes] = useState<ActivationCode[]>([]);
  const [newCodePlan, setNewCodePlan] = useState<SubscriptionPlan>('PRO');
  const [newCodeDuration, setNewCodeDuration] = useState(30);

  // Client-side API Key states for manual override in production/shared mode
  const [customApiKey, setCustomApiKey] = useState<string>(() => localStorage.getItem("manual_gemini_api_key") || "");
  const [showKeyConfig, setShowKeyConfig] = useState(false);

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
    if (currentUser?.role === 'ADMIN') {
      const fetchAdminData = async () => {
        try {
          // Pre-ensure default coupon KINFREE30 is created in database
          await userStore.ensureDefaultCoupon();
          
          const [fetchedUsers, fetchedCodes] = await Promise.all([
            userStore.getUsers(),
            userStore.getCodes()
          ]);
          setAllUsers(fetchedUsers);
          setAllCodes(fetchedCodes);
        } catch (err: any) {
          console.error("Error fetching datasets:", err);
        }
      };
      fetchAdminData();
    }
  }, [currentUser]);

  const handleAdminApprove = async (userId: string, plan: SubscriptionPlan) => {
    try {
      const updatedUser = await userStore.updateUserStatus(userId, plan, 'ACTIVE', 30);
      const fetchedUsers = await userStore.getUsers();
      setAllUsers(fetchedUsers);
      if (currentUser?.id === userId) {
        setCurrentUser(updatedUser);
      }
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
      await userStore.generateCode(newCodePlan, newCodeDuration);
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

    setIsAnalyzing(true);
    setError(null);

    try {
      const base64Data = image.split(',')[1];
      let useClientFallback = false;
      let text = "";

      try {
        console.log("[IA XAU KIN] Intentando análisis por servidor backend...");
        const response = await fetch('/api/analyze', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-gemini-key': customApiKey || ''
          },
          body: JSON.stringify({
            mimeType,
            base64Data,
            systemPrompt: SYSTEM_PROMPT
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
          throw new Error(errorMsg);
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
          // Re-throw genuine processing/API/quota errors
          throw serverErr;
        }
      }

      if (useClientFallback) {
        const finalKey = customApiKey.trim();
        if (!finalKey) {
          throw new Error("SERVER_STATIC_MODE_NO_KEY: El servidor de análisis no está disponible en este enlace compartido (hosting estático). Para procesar tus gráficos de forma local y 100% gratuita, haz clic en el botón 'Clave API' arriba a la derecha y configura tu clave de Gemini personal de Google AI Studio.");
        }

        console.log("[IA XAU KIN Client] Inicializando cliente Gemini directo en el navegador...");
        const genAI = new GoogleGenAI({ apiKey: finalKey });
        
        const result = await genAI.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: [
            {
              parts: [
                { text: SYSTEM_PROMPT },
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
          config: {
            thinkingConfig: { thinkingLevel: ThinkingLevel.LOW }
          }
        });

        text = result.text || "";
      }

      if (text) {
        setAnalysis(text);
        // Record timestamp asynchronously in Firestore
        await userStore.recordAnalysis(currentUser.id, mimeType, text);
        // Refresh session record locally from DB
        if (auth.currentUser) {
          const refreshed = await userStore.syncGoogleUser(auth.currentUser);
          setCurrentUser(refreshed);
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

  return (
    <div className="min-h-screen text-slate-900 font-sans selection:bg-brand-lime/20 relative overflow-x-hidden">
      <div className="relative z-10 min-h-screen">
        {!currentUser ? (
          <Login onLogin={(user) => setCurrentUser(user)} />
        ) : (
          <>
            {/* Header */}
            <header className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
              <div className="max-w-7xl mx-auto px-6 h-32 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Logo className="h-32 w-auto" />
                </div>
                
                {/* Desktop Menu */}
                <div className="flex items-center gap-6 text-xs font-bold uppercase tracking-widest text-slate-500">
                  <button 
                    onClick={() => setViewMode('TERMINAL')}
                    className={`flex items-center gap-2 transition-colors cursor-pointer group ${viewMode === 'TERMINAL' ? 'text-black font-black' : 'hover:text-slate-900'}`}
                  >
                    <TrendingUp size={14} className={viewMode === 'TERMINAL' ? 'text-brand-lime' : 'group-hover:text-brand-lime'} />
                    Terminal de Análisis
                  </button>

                  {currentUser.role === 'ADMIN' && (
                    <button 
                      onClick={() => setViewMode('ADMIN_BOARD')}
                      className={`flex items-center gap-2 transition-colors cursor-pointer group ${viewMode === 'ADMIN_BOARD' ? 'text-black font-black' : 'hover:text-slate-900'}`}
                    >
                      <Users size={14} className={viewMode === 'ADMIN_BOARD' ? 'text-brand-lime' : 'group-hover:text-brand-lime'} />
                      Mesa de Control (Admin)
                    </button>
                  )}

                  <div className="h-4 w-[1px] bg-slate-200" />

                  {/* API Key settings for shared/production manual entry */}
                  <button
                    onClick={() => setShowKeyConfig(true)}
                    className="flex items-center gap-1 text-[10px] text-slate-500 hover:text-black transition-colors cursor-pointer group uppercase tracking-wider font-extrabold"
                    title="Configurar Clave API de Gemini"
                  >
                    <Settings size={14} className="group-hover:rotate-45 transition-transform duration-300 text-brand-lime" />
                    <span className="hidden sm:inline">Clave API</span>
                  </button>

                  <div className="h-4 w-[1px] bg-slate-200" />

                  {/* Logged profile banner */}
                  <div className="hidden lg:flex flex-col items-end leading-none">
                    <span className="text-[10px] text-slate-800 font-mono font-bold lowercase">@{currentUser.username}</span>
                    <span className="text-[8px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                      {currentUser.role === 'ADMIN' ? 'MESA ADMINISTRADOR' : `SOCIO: ${currentUser.plan}`}
                    </span>
                  </div>

                  <button 
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-red-500 hover:text-red-700 transition-colors cursor-pointer group"
                    id="btn-logout"
                  >
                    <LogOut size={14} /> Salir
                  </button>
                </div>
              </div>
            </header>

            <AnimatePresence mode="wait">
              {viewMode === 'ADMIN_BOARD' && currentUser.role === 'ADMIN' ? (
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

                  {/* Columns for User DB management and Code Generator */}
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

                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="border-b border-slate-100/80 text-[10px] text-slate-400 uppercase tracking-wider font-mono">
                              <th className="pb-3 pl-2">Operador / Correo</th>
                              <th className="pb-3">Licencia</th>
                              <th className="pb-3">Estado</th>
                              <th className="pb-3">Comprobante</th>
                              <th className="pb-3 text-right">Acciones</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50">
                            {allUsers.map((user) => (
                              <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="py-4 pl-2">
                                  <div className="font-bold text-slate-800 flex items-center gap-1.5 leading-none">
                                    <span className="font-mono">@{user.username}</span>
                                    {user.role === 'ADMIN' && (
                                      <span className="bg-slate-950 text-white rounded px-1 py-0.5 text-[7px] font-bold tracking-widest scale-95 origin-left">ADMIN</span>
                                    )}
                                  </div>
                                  <span className="text-[10px] text-slate-400 block mt-1">{user.email}</span>
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
                                </td>
                                <td className="py-4 font-mono text-[9.5px]">
                                  {user.paymentReceiptUrl ? (
                                    <span className="text-brand-lime bg-slate-950 px-2 py-1 rounded-[6px] font-bold block max-w-[124px] truncate cursor-pointer hover:bg-slate-900 border border-brand-lime/20 text-center text-[8.5px]" title={user.paymentReceiptUrl}>
                                      HASH: {user.paymentReceiptUrl.substring(0, 10)}...
                                    </span>
                                  ) : (
                                    <span className="text-slate-300 italic">—</span>
                                  )}
                                </td>
                                <td className="py-4 text-right pr-2">
                                  <div className="flex justify-end gap-2">
                                    {user.status === 'PENDING_APPROVAL' && (
                                      <button
                                        onClick={() => handleAdminApprove(user.id, user.plan)}
                                        className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-2.5 py-1.5 rounded-lg text-[9px] uppercase tracking-wider shadow-sm transition-all shadow-emerald-100"
                                      >
                                        Aprobar Pago
                                      </button>
                                    )}
                                    {user.status === 'ACTIVE' && user.role !== 'ADMIN' && (
                                      <button
                                        onClick={() => handleAdminSuspend(user.id)}
                                        className="bg-red-50 hover:bg-red-100 border border-red-100 text-red-500 font-bold px-2 py-1.5 rounded-lg text-[9px] uppercase tracking-wider transition-all"
                                      >
                                        Suspender
                                      </button>
                                    )}
                                    {user.status === 'INACTIVE' && (
                                      <button
                                        onClick={() => handleAdminApprove(user.id, 'PRO')}
                                        className="bg-slate-900 text-brand-lime hover:bg-slate-800 font-bold px-2.5 py-1.5 rounded-lg text-[9px] uppercase tracking-wider transition-all"
                                      >
                                        Activar PRO
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}
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
                              <option value="RETAIL">RETAIL (Básico)</option>
                              <option value="PRO">PRO (Recomendado)</option>
                              <option value="INSTITUTIONAL">INSTITUTIONAL (Senior)</option>
                            </select>
                          </div>

                          <div className="space-y-1.5">
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
                                <span className="text-[7.5px] text-slate-400 uppercase tracking-widest block font-sans mt-0.5">{c.plan} • {c.durationDays} Días</span>
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
                        <div className="bg-slate-50 p-4.5 rounded-2xl text-left text-[10px] space-y-2 border border-slate-100/80 max-w-sm mx-auto font-mono text-slate-500">
                          <span className="font-bold text-slate-800 uppercase block tracking-wider font-sans">Comprobante Registrado:</span>
                          <span className="break-all whitespace-pre-wrap block text-slate-600">{currentUser.paymentReceiptUrl}</span>
                          <span className="text-[8px] text-slate-400 block font-sans uppercase tracking-[0.05em] pt-2 border-t border-slate-100">La activación es manual y demora entre 10 minutos y 2 horas.</span>
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
                        return (
                          <div key={pKey} className="glass-card rounded-[2rem] p-7 text-left border border-slate-100 flex flex-col justify-between">
                            <div className="space-y-4">
                              <span className={`px-3 py-1 text-[8px] font-extrabold uppercase rounded-lg tracking-wider bg-slate-50 border border-slate-100`}>
                                Plan {plan.name.split(' ')[1]}
                              </span>
                              <div className="space-y-1">
                                <h5 className="text-3xl font-serif italic font-bold text-slate-900">{plan.price}</h5>
                                <p className="text-[9px] uppercase tracking-widest text-slate-400 font-bold">acceso mensual</p>
                              </div>
                              <ul className="space-y-2.5 text-[10px] text-slate-500 pt-3 border-t border-slate-50">
                                {plan.features.map((feat, idx) => (
                                  <li key={idx} className="flex gap-2">
                                    <Check className="text-brand-lime w-3.5 h-3.5 mt-0.5 shrink-0" />
                                    <span>{feat}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <a 
                              href="https://t.me/iaxaukin_suport" // Simulated telegram support group
                              target="_blank"
                              rel="noreferrer"
                              className="w-full text-center py-3 bg-slate-950 font-bold uppercase tracking-wider text-[9px] rounded-xl text-white mt-8 hover:bg-slate-800 transition"
                            >
                              Solicitar con Administración
                            </a>
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
                            placeholder="CÓDIGO DE CUPÓN (Ej: KINFREE30)"
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

                      <div className="text-[8px] text-slate-400 font-mono">
                        CÓDIGO DE CUPÓN RECOMENDADO PARA EVALUACIÓN: <b className="text-slate-700 select-all">KINFREE30</b> (30 DÍAS)
                      </div>
                    </div>
                  )}
                </motion.main>
              ) : (
                /* =================== STANDARD TRADING TERMINAL =================== */
                <motion.main 
                  key="terminal"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="max-w-6xl mx-auto px-6 py-16"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                    
                    {/* Left Column: Upload & Preview */}
                    <div className="lg:col-span-5 space-y-10">
                      <section className="space-y-4">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-brand-lime animate-pulse" />
                          <span className="text-[9px] uppercase tracking-[0.3em] text-slate-400 font-mono font-bold">Terminal en Línea</span>
                        </div>
                        <h2 className="text-4xl font-serif italic text-slate-900 leading-tight">
                          Modelado de <br />
                          <span className="text-brand-lime">Estructura Cuantitativa</span>
                        </h2>
                        <p className="text-slate-500 text-sm leading-relaxed max-w-sm">
                          Cargue la telemetría visual de TradingView (XAUUSD). IA XAU KIN ejecutará un escaneo de alta precisión para identificar desequilibrios, BOS y CHoCH en ventanas de 60 minutos.
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
                            className="glass-card rounded-[2.5rem] p-10 shadow-premium relative overflow-hidden"
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
                            className="h-full min-h-[500px] glass-card rounded-[2.5rem] flex flex-col items-center justify-center text-center p-16 shadow-premium"
                          >
                            <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-8 animate-pulse">
                              <BrainCircuit className="text-slate-200 w-12 h-12" />
                            </div>
                            <h3 className="text-slate-900 font-serif italic text-xl mb-3">Mesa Analítica en Standby</h3>
                            <p className="text-slate-400 text-sm max-w-xs leading-relaxed">
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

                    <div className="space-y-4 mb-6">
                      <div>
                        <label className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400 block mb-2">CLAVE API PERSONAL (Google AI Studio)</label>
                        <input
                          type="password"
                          value={customApiKey}
                          onChange={(e) => setCustomApiKey(e.target.value)}
                          placeholder="AIzaSy..."
                          className="w-full h-12 bg-slate-50 border border-slate-250 rounded-xl px-4 text-xs font-mono focus:outline-none focus:border-brand-lime transition-colors"
                        />
                      </div>
                      <p className="text-[10px] text-slate-400 leading-relaxed">
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

                    <div className="flex flex-col gap-3">
                      <button 
                        onClick={() => {
                          if (customApiKey.trim() === "") {
                            localStorage.removeItem("manual_gemini_api_key");
                          } else {
                            localStorage.setItem("manual_gemini_api_key", customApiKey.trim());
                          }
                          setShowKeyConfig(false);
                        }}
                        className="w-full py-4 bg-brand-navy text-brand-lime rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg"
                      >
                        Guardar Clave
                      </button>
                      <div className="flex gap-4">
                        <button 
                          onClick={() => {
                            setCustomApiKey("");
                            localStorage.removeItem("manual_gemini_api_key");
                            setShowKeyConfig(false);
                          }}
                          className="flex-1 py-3 border border-slate-200 hover:bg-slate-50 rounded-xl font-bold text-[9px] uppercase tracking-widest text-red-500 transition-colors"
                        >
                          Eliminar Clave
                        </button>
                        <button 
                          onClick={() => setShowKeyConfig(false)}
                          className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold text-[9px] uppercase tracking-widest text-slate-600 transition-colors"
                        >
                          Cancelar
                        </button>
                      </div>
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
