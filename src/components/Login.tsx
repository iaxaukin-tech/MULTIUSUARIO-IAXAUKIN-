import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Lock, 
  User, 
  ShieldCheck, 
  ChevronRight, 
  Loader2, 
  Key, 
  Check, 
  Coins, 
  AlertCircle,
  TrendingUp,
  Award,
  Smartphone,
  Mail,
  Eye,
  EyeOff,
  UserPlus,
  LogIn
} from 'lucide-react';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword 
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { userStore } from '../utils/userStore';
import { PLAN_DETAILS } from '../types';

interface LoginProps {
  onLogin: (authenticatedUser: any) => void;
}

const TechnicalLogo = () => (
  <div className="relative group flex justify-center mb-4">
    <div className="absolute -inset-16 bg-brand-lime/10 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
    <motion.img 
      whileHover={{ scale: 1.05 }}
      src="https://i.ibb.co/ZDmC99g/BLANCO-removebg-preview.png" 
      alt="IA XAU KIN" 
      className="h-36 w-auto relative z-10 transition-transform duration-500"
      referrerPolicy="no-referrer"
    />
  </div>
);

// Google Brand Icon SVG
const GoogleIcon = () => (
  <svg className="w-4 h-4 mr-2.5 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

export const Login = ({ onLogin }: LoginProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Email/Password States
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedPlanPreview, setSelectedPlanPreview] = useState<'RETAIL' | 'PRO' | 'INSTITUTIONAL'>('PRO');

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      
      const result = await signInWithPopup(auth, provider);
      const userPayload = await userStore.syncGoogleUser(result.user);
      
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
        // Validation check for username length
        const cleanName = username.trim().toLowerCase();
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

        const result = await createUserWithEmailAndPassword(auth, email, password);
        const userPayload = await userStore.syncGoogleUser(result.user, cleanName);
        
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
        errMsg = "El registro de correo/contraseña está desactivado en la consola de Firebase. Por favor, actívelo en: Proyectos de Firebase > Autenticación (Authentication) > Método de inicio de sesión > Habilitar Correo electrónico/contraseña.";
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-slate-950/25 backdrop-blur-md p-4">
      <motion.div 
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md px-6 py-8 glass-card rounded-[2rem] shadow-premium my-auto bg-white/95 border border-slate-100"
      >
        <div className="flex flex-col items-center mb-5">
          <TechnicalLogo />
          <p className="text-[9px] text-slate-400 font-mono uppercase tracking-[0.3em] font-bold text-center">
            Mesa de Control • IA XAU KIN Multiusuario
          </p>

          <h2 className="text-lg font-serif italic text-slate-900 font-bold mt-2 text-center">
            {isRegister ? "Registro de Nuevo Operador" : "Acceso Directo con Base de Datos"}
          </h2>
          <p className="text-slate-400 text-[8px] font-bold uppercase tracking-widest text-center mt-0.5">
            Autenticación Encriptada SSL Real
          </p>
        </div>

        <div className="space-y-4">
          {/* Email & Password Authentication Form */}
          <form onSubmit={handleEmailAuthSubmit} className="space-y-3.5">
            {isRegister && (
              <div>
                <label className="block text-[9px] uppercase tracking-wider text-slate-400 font-bold mb-1 ml-1 font-mono">
                  Nombre de Operador (Mínimo 3 de longitud)
                </label>
                <div className="relative">
                  <User size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="ej. gold_trader"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_\-]/g, ''))}
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white transition-all font-mono"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[9px] uppercase tracking-wider text-slate-400 font-bold mb-1 ml-1 font-mono">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="ejemplo@correo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white transition-all font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-[9px] uppercase tracking-wider text-slate-400 font-bold mb-1 ml-1 font-mono">
                Contraseña (Mínimo 6 caracteres)
              </label>
              <div className="relative">
                <Lock size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-slate-900 hover:bg-slate-950 text-white font-bold py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-1.5 shadow-md hover:shadow-lg cursor-pointer text-xs"
            >
              {isLoading ? (
                <Loader2 className="animate-spin text-brand-lime" size={14} />
              ) : (
                <>
                  {isRegister ? <UserPlus size={14} /> : <LogIn size={14} />}
                  <span className="uppercase tracking-wider">
                    {isRegister ? "Registrar y Empezar" : "Ingresar con Correo"}
                  </span>
                </>
              )}
            </button>
          </form>

          {/* Separator */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100"></div>
            </div>
            <div className="relative flex justify-center text-[8px] uppercase tracking-widest text-slate-400 font-bold">
              <span className="bg-white px-3 font-mono">o utiliza acceso social</span>
            </div>
          </div>

          {/* Social Google SignIn */}
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full bg-slate-50 hover:bg-slate-100/80 text-slate-800 font-bold py-3 rounded-xl transition-all duration-300 flex items-center justify-center shadow-sm cursor-pointer border border-slate-200"
          >
            {isLoading ? (
              <Loader2 className="animate-spin text-slate-400" size={14} />
            ) : (
              <>
                <GoogleIcon />
                <span className="uppercase tracking-wider text-[10px]">Ingresar con Google</span>
              </>
            )}
          </button>

          {/* Toggle login modes */}
          <div className="text-center mt-3">
            <button
              onClick={() => {
                setIsRegister(!isRegister);
                setError(null);
              }}
              className="text-[10px] uppercase tracking-wider text-slate-500 hover:text-slate-900 font-bold transition-colors underline decoration-dotted decoration-slate-300"
            >
              {isRegister ? "¿Ya tienes una cuenta? Iniciar Sesión" : "¿No tienes cuenta? Registrate como Operador"}
            </button>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2.5 text-red-500 text-[9px] font-bold uppercase tracking-wider"
            >
              <AlertCircle size={14} className="shrink-0" />
              <span className="leading-normal">{error}</span>
            </motion.div>
          )}

          {/* Pricing tiers info */}
          <div className="p-3 bg-slate-50/85 border border-slate-100 rounded-xl space-y-2 mt-2">
            <span className="text-[8px] uppercase tracking-wider text-slate-400 font-bold block text-center">MEMBRESÍAS DISPONIBLES (Haz clic para ver detalles)</span>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => setSelectedPlanPreview('RETAIL')}
                className={`text-center p-1.5 rounded-lg transition-all duration-300 cursor-pointer ${
                  selectedPlanPreview === 'RETAIL'
                    ? 'bg-slate-900 text-white shadow-sm border border-slate-800'
                    : 'bg-white hover:bg-slate-100 border border-slate-100 text-slate-800'
                }`}
              >
                <span className={`block text-[7px] font-bold uppercase tracking-tight leading-none ${
                  selectedPlanPreview === 'RETAIL' ? 'text-emerald-400' : 'text-slate-400'
                }`}>BÁSICO</span>
                <span className={`block font-serif italic text-xs font-bold mt-0.5 ${
                  selectedPlanPreview === 'RETAIL' ? 'text-white' : 'text-slate-900'
                }`}>$29</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedPlanPreview('PRO')}
                className={`text-center p-1.5 rounded-lg transition-all duration-300 cursor-pointer ${
                  selectedPlanPreview === 'PRO'
                    ? 'bg-slate-900 text-white shadow-sm border border-slate-800'
                    : 'bg-white hover:bg-slate-100 border border-slate-100 text-slate-800'
                }`}
              >
                <span className={`block text-[7px] font-bold uppercase tracking-tight leading-none ${
                  selectedPlanPreview === 'PRO' ? 'text-brand-lime' : 'text-slate-400'
                }`}>PRO</span>
                <span className={`block font-serif italic text-xs font-bold mt-0.5 ${
                  selectedPlanPreview === 'PRO' ? 'text-white' : 'text-slate-900'
                }`}>$79</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedPlanPreview('INSTITUTIONAL')}
                className={`text-center p-1.5 rounded-lg transition-all duration-300 cursor-pointer ${
                  selectedPlanPreview === 'INSTITUTIONAL'
                    ? 'bg-slate-900 text-white shadow-sm border border-slate-800'
                    : 'bg-white hover:bg-slate-100 border border-slate-100 text-slate-800'
                }`}
              >
                <span className={`block text-[7px] font-bold uppercase tracking-tight leading-none ${
                  selectedPlanPreview === 'INSTITUTIONAL' ? 'text-gold' : 'text-slate-400'
                }`}>INSTIT.</span>
                <span className={`block font-serif italic text-xs font-bold mt-0.5 ${
                  selectedPlanPreview === 'INSTITUTIONAL' ? 'text-white' : 'text-slate-900'
                }`}>$199</span>
              </button>
            </div>

            {/* Active Plan Detail View */}
            <motion.div
              key={selectedPlanPreview}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.2 }}
              className="bg-white border border-slate-200/50 p-2.5 rounded-xl space-y-1.5 text-left overflow-hidden"
            >
              <div className="flex justify-between items-center border-b border-slate-100 pb-1 mb-1">
                <span className="text-[8px] font-mono font-bold uppercase text-slate-700">
                  Beneficios {PLAN_DETAILS[selectedPlanPreview].name}
                </span>
                <span className="text-[8px] font-bold font-mono text-slate-500 uppercase">
                  {PLAN_DETAILS[selectedPlanPreview].price}
                </span>
              </div>
              <ul className="space-y-1 text-slate-500 text-[8px] font-medium leading-tight">
                {PLAN_DETAILS[selectedPlanPreview].features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-1">
                    <Check className="text-brand-lime w-2.5 h-2.5 mt-0.5 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-[7px] text-slate-400 font-mono uppercase tracking-widest">
          <div className="flex items-center gap-1 font-bold">
            <ShieldCheck size={10} className="text-slate-300" />
            FIRESTORE INTEGRADO
          </div>
          <div className="font-bold">CUPÓN: KINFREE30</div>
        </div>
      </motion.div>
    </div>
  );
};
