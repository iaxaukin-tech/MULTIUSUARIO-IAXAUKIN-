import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Lock, 
  User, 
  ShieldCheck, 
  ChevronRight, 
  Loader2, 
  Key, 
  Check, 
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Mail,
  Eye,
  EyeOff,
  UserPlus,
  LogIn,
  Activity,
  Sliders,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Terminal,
  ShieldAlert,
  Clock,
  Target,
  Briefcase,
  Calendar
} from 'lucide-react';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword 
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { userStore } from '../utils/userStore';

interface LoginProps {
  onLogin: (authenticatedUser: any) => void;
  navigateTo?: (path: string) => void;
}

// Google Brand Icon SVG Helper
const GoogleIcon = () => (
  <svg className="w-4 h-4 mr-2.5 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

export const Login = ({ onLogin, navigateTo }: LoginProps) => {
  const [currentView, setCurrentView] = useState<'LANDING' | 'AUTH'>('LANDING');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Email/Password States
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [usernameType, setUsernameType] = useState<'AUTO' | 'CUSTOM'>('AUTO');

  // Referral / Affiliate Tracking States
  const [urlReferralCode, setUrlReferralCode] = useState<string>('');
  const [manualReferralCode, setManualReferralCode] = useState<string>('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const refParam = params.get('ref');
    if (refParam) {
      const parsed = refParam.trim().toLowerCase();
      setUrlReferralCode(parsed);
      sessionStorage.setItem('xau_kin_pending_referral', parsed);
      localStorage.setItem('xau_kin_pending_referral', parsed);
      
      // Auto-focus on community registration
      setIsRegister(true);
      setCurrentView('AUTH');
    } else {
      const stored = sessionStorage.getItem('xau_kin_pending_referral') || localStorage.getItem('xau_kin_pending_referral');
      if (stored) {
        setUrlReferralCode(stored);
      }
    }
  }, []);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      
      const result = await signInWithPopup(auth, provider);
      const referralValue = urlReferralCode || manualReferralCode;
      const userPayload = await userStore.syncGoogleUser(result.user, undefined, referralValue);
      
      // Persist login state
      localStorage.setItem('xau_kin_is_logged_in', 'true');
      localStorage.setItem('xau_kin_remembered_user', userPayload.id);

      onLogin(userPayload);
    } catch (err: any) {
      const isExpectedAuthError = 
        err.code === 'auth/popup-closed-by-user' || 
        err.code === 'auth/popup-blocked' || 
        err.message?.includes('popup-blocked') ||
        err.code === 'auth/cancelled-popup-request';
        
      if (!isExpectedAuthError) {
        console.error("Login Error:", err);
      } else {
        console.warn("Google Sign-In gesture cancel/block:", err.message || err.code);
      }

      if (err.code === 'auth/popup-closed-by-user') {
        setError("El ingreso fue cancelado. Por favor complete el inicio de sesión.");
      } else if (err.code === 'auth/popup-blocked' || err.message?.includes('popup-blocked')) {
        setError("El navegador bloqueó la ventana emergente de Google. Por favor, permita las ventanas emergentes (pop-ups) en la barra de direcciones de su navegador, o utilice el formulario de 'Correo' para registrarse o ingresar de forma directa.");
      } else {
        setError(err.message || "Error al autenticar su cuenta de Google.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Por favor, ingrese correo y contraseña.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (isRegister) {
        let cleanName = '';
        if (usernameType === 'AUTO') {
          // Generate a secure, unique, and anonymous random operator ID
          const randomSuffix = Math.random().toString(36).substring(2, 7);
          cleanName = `op_${randomSuffix}`;
          
          let taken = await userStore.isUsernameTaken(cleanName);
          while (taken) {
            const anotherSuffix = Math.random().toString(36).substring(2, 7);
            cleanName = `op_${anotherSuffix}`;
            taken = await userStore.isUsernameTaken(cleanName);
          }
        } else {
          // Validation check for Custom username length
          cleanName = username.trim().toLowerCase();
          if (cleanName.length < 3 || cleanName.length > 32) {
            throw new Error("El nombre de usuario debe tener entre 3 y 32 caracteres.");
          }
          if (!/^[a-zA-Z0-9_\-]+$/.test(cleanName)) {
            throw new Error("El nombre de usuario solo debe contener letras, números, guiones y guiones bajos.");
          }
          // Check if username taken
          const taken = await userStore.isUsernameTaken(cleanName);
          if (taken) {
            throw new Error("Este nombre de usuario ya está registrado por otro operador.");
          }
        }

        const result = await createUserWithEmailAndPassword(auth, email, password);
        const referralValue = urlReferralCode || manualReferralCode;
        const userPayload = await userStore.syncGoogleUser(result.user, cleanName, referralValue);
        
        localStorage.setItem('xau_kin_is_logged_in', 'true');
        localStorage.setItem('xau_kin_remembered_user', userPayload.id);
        onLogin(userPayload);
      } else {
        const result = await signInWithEmailAndPassword(auth, email, password);
        const userPayload = await userStore.syncGoogleUser(result.user);
        
        localStorage.setItem('xau_kin_is_logged_in', 'true');
        localStorage.setItem('xau_kin_remembered_user', userPayload.id);
        onLogin(userPayload);
      }
    } catch (err: any) {
      const isExpectedEmailAuthError = [
        'auth/operation-not-allowed',
        'auth/email-already-in-use',
        'auth/invalid-credential',
        'auth/wrong-password',
        'auth/user-not-found',
        'auth/weak-password',
        'auth/invalid-email'
      ].includes(err.code) || err.message?.includes("username") || err.message?.includes("operador");

      if (!isExpectedEmailAuthError) {
        console.error("Email Auth Error:", err);
      } else {
        console.warn("Email Auth expected constraint/issue:", err.message || err.code);
      }

      let errMsg = err.message || "Error al autenticar con correo y contraseña.";
      if (err.code === 'auth/operation-not-allowed' || err.message?.includes('operation-not-allowed')) {
        errMsg = "El registro mediante correo y contraseña no se encuentra habilitado en esta terminal. Por favor contacte con soporte técnico o utilice otro método de acceso.";
      } else if (err.code === 'auth/email-already-in-use') {
        errMsg = "Este correo electrónico ya se encuentra registrado.";
      } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        errMsg = "Credenciales incorrectas o usuario no registrado.";
      } else if (err.code === 'auth/weak-password') {
        errMsg = "La contraseña debe tener al menos 6 caracteres.";
      } else if (err.code === 'auth/invalid-email') {
        errMsg = "El correo electrónico provisto no es válido.";
      }
      setError(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent relative flex flex-col overflow-y-auto">
      {/* Upper Navigation/Header Bar */}
      <header className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-5 flex items-center justify-between border-b border-slate-200/40 bg-white/40 backdrop-blur-sm z-50">
        <div 
          className="flex items-center gap-2.5 cursor-pointer selection:bg-transparent"
          onClick={() => setCurrentView('LANDING')}
        >
          <img 
            src="https://i.ibb.co/ZDmC99g/BLANCO-removebg-preview.png" 
            alt="IA XAU KIN" 
            className="h-10 sm:h-12 w-auto hover:scale-105 transition-transform duration-500"
            referrerPolicy="no-referrer"
          />
          <div className="flex flex-col">
            <span className="font-serif italic font-extrabold text-slate-900 leading-none text-base sm:text-lg">IA XAU KIN</span>
            <span className="text-[8px] sm:text-[9px] text-slate-400 font-mono tracking-widest font-black uppercase mt-0.5">Terminal Cuantitativa</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <AnimatePresence mode="wait">
            {currentView === 'LANDING' ? (
              <motion.div 
                key="landing-nav"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="flex items-center gap-3"
              >
                <button
                  id="nav-login-btn-header"
                  onClick={() => {
                    setIsRegister(false);
                    setError(null);
                    setCurrentView('AUTH');
                  }}
                  className="text-[9px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-slate-900 transition-colors cursor-pointer px-2 py-1.5 focus:outline-none"
                >
                  Iniciar Sesión
                </button>
                <button
                  id="nav-register-btn-header"
                  onClick={() => {
                    setIsRegister(true);
                    setError(null);
                    setCurrentView('AUTH');
                  }}
                  className="bg-slate-900 hover:bg-slate-950 text-white font-bold py-2.5 px-3.5 sm:px-4 rounded-xl text-[9px] sm:text-[10px] uppercase tracking-widest transition-all duration-300 shadow-sm cursor-pointer focus:outline-none"
                >
                  Registrarse
                </button>
              </motion.div>
            ) : (
              <motion.button
                key="auth-nav"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                id="nav-back-to-landing-header"
                onClick={() => {
                  setError(null);
                  setCurrentView('LANDING');
                }}
                className="inline-flex items-center gap-1.5 border border-slate-200 hover:border-slate-300 bg-white text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-600 hover:text-slate-900 transition-all cursor-pointer py-2 px-3.5 sm:px-4 rounded-xl shadow-sm focus:outline-none"
              >
                <ArrowLeft size={11} className="text-slate-400" />
                Volver al Inicio
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Main Container with dynamic fluid motion transitions */}
      <div className="flex-grow flex flex-col justify-center items-center">
        <AnimatePresence mode="wait">
          {currentView === 'LANDING' ? (
            <motion.main 
              key="landing-screen"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-16 flex-grow z-10 space-y-12 sm:space-y-16"
            >
              {/* Header Badge, Title, and Call-to-actions */}
              <div className="space-y-6 text-center max-w-3xl mx-auto">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-950 text-[8px] sm:text-[9px] font-mono font-black uppercase rounded-lg tracking-wider text-brand-lime shadow-sm">
                  <Activity size={10} className="animate-pulse text-brand-lime" />
                  Tecnología Cuantitativa Avanzada
                </div>
                
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 leading-tight tracking-tight">
                  Decodifica el mercado de <span className="font-serif italic font-bold block sm:inline text-slate-950 underline decoration-brand-lime decoration-4">Oro (XAUUSD)</span> con precisión IA.
                </h1>
                
                <p className="text-slate-500 text-sm sm:text-base leading-relaxed max-w-xl mx-auto">
                  IA XAU KIN procesa la telemetría visual de tus gráficos de TradingView para desvelar la estructura profunda del mercado institucional. Recibe matrices operativas dinámicas optimizadas bajo Smart Money Concepts en segundos.
                </p>

                {/* Primary Landing Page Call To Actions (CTAs) */}
                <div className="flex flex-wrap justify-center gap-3.5 pt-4">
                  <button 
                    id="cta-register-landing-main"
                    onClick={() => {
                      setIsRegister(false);
                      setError(null);
                      setCurrentView('AUTH');
                    }}
                    className="bg-slate-900 hover:bg-slate-950 text-white font-bold py-3.5 px-7 rounded-2xl text-[10px] sm:text-xs uppercase tracking-widest transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-[1.02] flex items-center justify-center gap-2 cursor-pointer focus:outline-none"
                  >
                    <span>Acceder a la Terminal</span>
                    <ArrowRight size={13} className="text-brand-lime" />
                  </button>
                </div>

                <div className="flex items-center justify-center gap-1.5 text-slate-400 font-mono text-[8px] sm:text-[9px] font-bold uppercase tracking-wider pt-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
                  <span className="text-slate-500">Servidores Cuánticos:</span>
                  <span className="text-slate-800 font-black">Mesa Operativa Online</span>
                </div>
              </div>

              {/* How It Works Section */}
              <div className="space-y-6 pt-2">
                <div className="text-center">
                  <h3 className="text-xs font-mono font-black uppercase tracking-widest text-slate-400">¿Cómo funciona la terminal?</h3>
                  <p className="text-xs text-slate-500 mt-1 font-medium">Tres simples pasos para acceder al flujo institucional</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {/* Step 1 */}
                  <div className="glass-card rounded-2xl p-5 border border-slate-200/50 space-y-3 bg-white/60">
                    <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center font-mono text-xs font-bold text-slate-600 leading-none">
                      01
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Carga el gráfico</h4>
                      <p className="text-[10px] text-slate-500 leading-relaxed">
                        Toma una captura de pantalla de TradingView en tu temporalidad preferida y arrástrala a la consola.
                      </p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="glass-card rounded-2xl p-5 border border-slate-200/50 space-y-3 bg-white/60">
                    <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center font-mono text-xs font-bold text-slate-600 leading-none">
                      02
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Algoritmo Quant</h4>
                      <p className="text-[10px] text-slate-500 leading-relaxed">
                        La IA evalúa BOS, CHoCH, vacíos de valor (FVG) y perfiles de volumen de manera heurística en tiempo real.
                      </p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="glass-card rounded-2xl p-5 border border-slate-200/50 space-y-3 bg-white/60">
                    <div className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center font-mono text-xs font-bold text-brand-lime leading-none">
                      03
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Ejecuta la Matriz</h4>
                      <p className="text-[10px] text-slate-500 leading-relaxed">
                        Mapea tus órdenes en una ventana estricta de 60 min, con un objetivo de +10 pips exactos por vector.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Simulated Live Matrix Outcome Mockup */}
              <div className="space-y-4 pt-2">
                <div className="text-center">
                  <h3 className="text-xs font-mono font-black uppercase tracking-widest text-slate-400">Previsualización de Resultados</h3>
                  <p className="text-xs text-slate-500 mt-1 font-medium">Ejemplo de telemetría procesada por nuestro motor computacional</p>
                </div>

                <div id="simulated-terminal-card-landing" className="bg-slate-900 text-slate-100 rounded-2xl p-5 sm:p-7 font-mono text-[10px] sm:text-xs space-y-4 border border-slate-800 shadow-xl relative overflow-hidden max-w-2xl mx-auto">
                  <div className="absolute top-0 right-0 p-4 flex gap-1.5 opacity-60">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  </div>

                  <div className="border-b border-slate-800 pb-3 flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-brand-lime animate-pulse" />
                    <span className="text-slate-400 uppercase tracking-widest font-sans font-bold text-[8px] sm:text-[9px]">DIAGNÓSTICO OPERATIVO SIMULADO — IA XAU KIN</span>
                  </div>

                  <div className="space-y-3">
                    <p className="text-emerald-400 font-bold text-[11px] sm:text-xs flex items-center gap-1.5">
                      <Clock size={13} className="text-emerald-400 shrink-0" />
                      <span>Ventana Temporal de Referencia: 08:30 AM — 09:30 AM (GMT-5)</span>
                    </p>
                    
                    <div className="text-slate-300 leading-relaxed font-sans text-xs">
                      <span className="text-white font-mono uppercase text-[9px] tracking-wider flex items-center gap-1.5 mb-1 font-extrabold text-slate-400">
                        <TrendingDown size={12} className="text-slate-400 shrink-0" />
                        <span>Tesis Algorítmica Institucional:</span>
                      </span>
                      Alineación de desequilibrios en el bloque de demanda estructural de 5 minutos. Mitigación confirmada con volumen ascendente; proyectamos expansión acelerada en la ventana de 60 minutos con un objetivo estricto de incremento.
                    </div>

                    <div className="py-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[8px] font-mono font-bold border border-emerald-500/20">
                          CONFIRMADO
                        </span>
                        <p className="font-bold text-white text-xs uppercase tracking-wider">
                          Directional Bias: <span className="text-emerald-400 font-black">LONG (BUY)</span>
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-slate-300 font-bold bg-slate-950/40 p-3.5 rounded-xl border border-slate-800/60 font-mono text-[9px] sm:text-[10px]">
                        <div className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                          <span>08:35 AM — LONG</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                          <span>08:44 AM — LONG</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                          <span>08:52 AM — LONG</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                          <span>09:08 AM — LONG</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800/60 flex flex-wrap justify-between gap-3 text-[8.5px] sm:text-[9.5px] text-slate-400 uppercase tracking-wider font-sans font-bold">
                      <span className="flex items-center gap-1">
                        <Target size={11} className="text-slate-400 shrink-0" />
                        <span>Target Objetivo: +10 pips</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <ShieldAlert size={11} className="text-slate-400 shrink-0" />
                        <span>Stop Loss: 1.5 pt</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Briefcase size={11} className="text-slate-400 shrink-0" />
                        <span>Exposición Máxima: 1.0%</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Core Features & Risk Disclaimer */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 max-w-3xl mx-auto">
                <div className="flex gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 self-start text-slate-700">
                    <ShieldCheck size={18} />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">Cero Exposición Emocional</h4>
                    <p className="text-[10px] text-slate-500 leading-relaxed">
                      Sustituye la intuición humana con métricas estructurales y vectores con base algorítmica de extrema objetividad cuantitativa.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 self-start text-slate-700">
                    <Sliders size={18} />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">Protocolo de Gestión Estricto</h4>
                    <p className="text-[10px] text-slate-500 leading-relaxed">
                      Cada análisis incluye directrices estructuradas para stop loss, asimetría estadística y preservación del capital de trabajo.
                    </p>
                  </div>
                </div>
              </div>

              {/* Pre-register interactive call-out banner */}
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 text-center space-y-3.5 max-w-xl mx-auto">
                <h4 className="text-sm font-bold text-slate-800">¿Listo para ingresar a la Mesa Operativa?</h4>
                <p className="text-[10.5px] text-slate-500 max-w-sm mx-auto leading-normal">
                  Crea tu perfil de operador de manera gratuita. Los planes detallados y costos de suscripción se presentan formalmente una vez dentro del panel administrativo.
                </p>
                <div className="flex flex-col sm:flex-row justify-center items-center gap-3 pt-1">
                  <button
                    id="cta-register-landing-footer"
                    onClick={() => {
                      setIsRegister(true);
                      setError(null);
                      setCurrentView('AUTH');
                    }}
                    className="w-full sm:w-auto bg-slate-900 hover:bg-slate-950 text-white font-bold py-2.5 px-5 rounded-xl text-[10px] uppercase tracking-widest transition-all duration-300 shadow-sm cursor-pointer inline-flex items-center justify-center gap-1.5 focus:outline-none"
                  >
                    <UserPlus size={12} className="text-[#CCFF00]" />
                    Registrar mi Cuenta
                  </button>

                  <a
                    href="https://calendar.google.com/calendar/appointments/schedules/AcZssZ1tBTLy-bQVAI8Tv9Zfu85DwRGPF4c7DrsQiuWFKZCoh-NQUA0lUzUAqB1RKxxa7zUjW24oyW5g?gv=true"
                    target="_blank"
                    rel="noreferrer noopener"
                    className="w-full sm:w-auto bg-slate-900 hover:bg-slate-950 text-white font-bold py-2.5 px-5 rounded-xl text-[10px] uppercase tracking-widest transition-all duration-300 shadow-sm cursor-pointer inline-flex items-center justify-center gap-1.5 focus:outline-none text-center"
                    id="cta-connect-team-calendar-btn"
                  >
                    <Calendar size={12} className="text-[#CCFF00]" />
                    Conectar Equipo
                  </a>
                </div>
              </div>

            </motion.main>
          ) : (
            <motion.main 
              key="auth-screen"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="max-w-md mx-auto w-full px-4 sm:px-6 py-8 sm:py-16 flex-grow z-10 flex flex-col justify-center"
            >
              {/* Centered Auth Card */}
              <div className="relative w-full glass-card rounded-[2rem] shadow-premium p-6 sm:p-8 bg-white/95 border border-slate-200/50">
                <div className="flex flex-col items-center mb-6">
                  <div className="relative group flex justify-center mb-1">
                    <div className="absolute -inset-10 bg-brand-lime/15 blur-2xl rounded-full opacity-100" />
                    <img 
                      src="https://i.ibb.co/ZDmC99g/BLANCO-removebg-preview.png" 
                      alt="IA XAU KIN" 
                      className="h-16 sm:h-20 w-auto relative z-10 hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <p className="text-[8px] text-slate-400 font-mono uppercase tracking-[0.2em] font-bold text-center">
                    Consola de Acceso Operador
                  </p>

                  <h2 className="text-xl font-serif italic text-slate-900 font-bold mt-2 text-center">
                    {isRegister ? "Buzón de Registro de Operadores" : "Puerta de Acceso a Terminal"}
                  </h2>
                  <p className="text-slate-400 text-[8px] font-bold uppercase tracking-widest text-center mt-0.5">
                    Autenticación Encriptada y Acceso de Alta Seguridad
                  </p>
                </div>

                {/* Authentication Toggle Tab inside Card */}
                <div className="grid grid-cols-2 bg-slate-100 p-1 rounded-xl mb-6">
                  <button
                    id="toggle-login-mode-card"
                    type="button"
                    onClick={() => {
                      setIsRegister(false);
                      setError(null);
                    }}
                    className={`py-2 px-3 rounded-lg text-[9px] uppercase font-bold tracking-wider transition-all cursor-pointer focus:outline-none ${!isRegister ? 'bg-white text-slate-900 shadow-sm font-extrabold' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    <span className="flex items-center justify-center gap-1.5">
                      <LogIn size={11} />
                      Ingresar
                    </span>
                  </button>
                  <button
                    id="toggle-register-mode-card"
                    type="button"
                    onClick={() => {
                      setIsRegister(true);
                      setError(null);
                    }}
                    className={`py-2 px-3 rounded-lg text-[9px] uppercase font-bold tracking-wider transition-all cursor-pointer focus:outline-none ${isRegister ? 'bg-white text-slate-900 shadow-sm font-extrabold' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    <span className="flex items-center justify-center gap-1.5">
                      <UserPlus size={11} />
                      Registrarme
                    </span>
                  </button>
                </div>

                <div className="space-y-4">
                  <form onSubmit={handleEmailAuthSubmit} className="space-y-4">
                    {isRegister && (
                      <div className="space-y-3">
                        <label className="block text-[8.5px] uppercase tracking-wider text-slate-400 font-mono font-bold ml-1">
                          Identificación de Operador
                        </label>
                        <div className="p-3 bg-slate-50/70 border border-slate-200/50 rounded-xl space-y-1">
                          <span className="text-[7.5px] font-mono uppercase bg-slate-900 text-slate-200 px-1.5 py-0.5 rounded font-black tracking-widest inline-block">
                            ANONIMATO TOTAL
                          </span>
                          <p className="text-[10px] text-slate-500 font-semibold leading-relaxed font-sans">
                            El sistema generará automáticamente un ID único y anónimo de operador (ej: <code className="font-mono bg-slate-200/50 px-1 rounded text-slate-700">@op_f28da</code>) para proteger la integridad y privacidad de tus operaciones en red.
                          </p>
                        </div>

                        {urlReferralCode ? (
                          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2.5">
                            <span className="text-emerald-500 text-sm">🤝</span>
                            <div className="text-[10px] font-sans font-medium text-emerald-800 text-left">
                              Registrándote en la comunidad de: <strong className="font-mono text-emerald-950 font-bold bg-white/70 px-1.5 py-0.5 rounded border border-emerald-200/50">@{urlReferralCode}</strong>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-1.5">
                            <label className="block text-[8.5px] uppercase tracking-wider text-slate-400 font-mono font-bold ml-1">
                              Código de Invitación / Comunidad (Opcional)
                            </label>
                            <input
                              type="text"
                              value={manualReferralCode}
                              onChange={(e) => setManualReferralCode(e.target.value)}
                              placeholder="Fórmula de Referido (p. ej. ib_trader10)"
                              className="w-full text-[11px] font-mono pl-3.5 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-brand-lime transition-all text-slate-800 lowercase placeholder:text-slate-400"
                            />
                          </div>
                        )}
                      </div>
                    )}

                    <div>
                      <label className="block text-[8.5px] uppercase tracking-wider text-slate-400 font-mono font-bold mb-1.5 ml-1">
                        Correo Electrónico
                      </label>
                      <div className="relative">
                        <Mail size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="email"
                          required
                          placeholder="ejemplo@correo.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white transition-all font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[8.5px] uppercase tracking-wider text-slate-400 font-mono font-bold mb-1.5 ml-1">
                        Contraseña (Mínimo 6 caracteres)
                      </label>
                      <div className="relative">
                        <Lock size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full pl-9 pr-10 py-3 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white transition-all font-mono"
                        />
                        <button
                          id="auth-password-toggle-card-btn"
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                        >
                          {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                        </button>
                      </div>
                    </div>

                    <button
                      id="auth-submit-card-btn"
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-slate-900 hover:bg-slate-950 text-white font-bold py-3.5 rounded-xl transition-all duration-300 flex items-center justify-center gap-1.5 shadow-md hover:shadow-lg cursor-pointer text-xs uppercase tracking-widest font-mono text-[9px] mt-2 block focus:outline-none"
                    >
                      {isLoading ? (
                        <Loader2 className="animate-spin text-brand-lime" size={14} />
                      ) : (
                        <>
                          {isRegister ? <UserPlus size={14} /> : <LogIn size={14} />}
                          <span>
                            {isRegister ? "Registrar Operador" : "Ingresar a Terminal"}
                          </span>
                        </>
                      )}
                    </button>
                  </form>

                  {/* Separator */}
                  <div className="relative my-5">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-100"></div>
                    </div>
                    <div className="relative flex justify-center text-[8px] uppercase tracking-widest text-slate-400 font-bold">
                      <span className="bg-white px-3 font-mono">o utiliza acceso social</span>
                    </div>
                  </div>

                  {/* Social Google SignIn */}
                  <button
                    id="auth-google-sso-card-btn"
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                    className="w-full bg-slate-50 hover:bg-slate-100/90 text-slate-800 font-bold py-3.5 rounded-xl transition-all duration-300 flex items-center justify-center shadow-sm cursor-pointer border border-slate-200 font-mono text-[9px] uppercase tracking-wider block focus:outline-none"
                  >
                    {isLoading ? (
                      <Loader2 className="animate-spin text-slate-400" size={14} />
                    ) : (
                      <>
                        <GoogleIcon />
                        <span>Ingresar con Google</span>
                      </>
                    )}
                  </button>

                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-2.5 text-red-500 text-[9px] font-bold uppercase tracking-wider leading-relaxed"
                    >
                      <AlertCircle size={14} className="shrink-0 mt-0.5" />
                      <span>{error}</span>
                    </motion.div>
                  )}
                </div>

                {/* Card Back To Landing option */}
                <div className="mt-5 text-center">
                  <button 
                    id="back-link-under-card"
                    onClick={() => {
                      setError(null);
                      setCurrentView('LANDING');
                    }}
                    className="text-[9px] font-mono uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors cursor-pointer focus:outline-none"
                  >
                    ← Volver a ver características
                  </button>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[7.5px] text-slate-400 font-mono uppercase tracking-widest font-black">
                  <div className="flex items-center gap-1 font-bold text-slate-400">
                    <ShieldCheck size={11} className="text-slate-300" />
                    CONEXIÓN ENCRIPTADA
                  </div>
                  <div className="font-bold">SOPORTE AL CLIENTE</div>
                </div>

                {navigateTo && (
                  <div className="mt-5 pt-3 border-t border-slate-100 flex justify-center gap-4 text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                    <a 
                      id="link-privacy-policy-auth"
                      href="/privacy" 
                      onClick={(e) => { e.preventDefault(); navigateTo('/privacy'); }} 
                      className="hover:text-black hover:underline transition-colors pointer-events-auto"
                    >
                      Privacidad
                    </a>
                    <span className="text-slate-200 font-normal select-none">•</span>
                    <a 
                      id="link-terms-conditions-auth"
                      href="/terms" 
                      onClick={(e) => { e.preventDefault(); navigateTo('/terms'); }} 
                      className="hover:text-black hover:underline transition-colors pointer-events-auto"
                    >
                      Condiciones
                    </a>
                  </div>
                )}
              </div>
            </motion.main>
          )}
        </AnimatePresence>
      </div>

      {/* Footer information */}
      <footer className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 border-t border-slate-200/40 text-center space-y-2 z-10 mt-auto">
        <p className="text-[9px] font-mono uppercase tracking-widest text-slate-400 font-bold">
          © {new Date().getFullYear()} IA XAU KIN • Terminal Computacional Cuantitativa para el XAUUSD.
        </p>
        <p className="text-[8px] text-slate-400 max-w-2xl mx-auto leading-relaxed uppercase font-semibold">
          Advertencia: El trading de CFD, divisas y metales preciosos conlleva un alto nivel de riesgo. Toda telemetría procesada por IA XAU KIN es de carácter descriptivo, basada en la recopilación masiva de datos y confluencias pasadas. No es ni debe interpretarse como una recomendación de inversión directa ni consejería financiera; cada operador elige bajo su propio criterio y entera responsabilidad si esta información le resulta útil para ejecutar sus decisiones de mercado.
        </p>
      </footer>
    </div>
  );
};
