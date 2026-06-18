import React, { useState, useEffect } from 'react';
import { 
  User as UserIcon, 
  X, 
  KeyRound, 
  Calendar, 
  Check, 
  ShieldCheck, 
  Mail, 
  ExternalLink,
  Edit2,
  Loader2,
  AlertTriangle,
  LogOut,
  Sparkles,
  CheckCircle2,
  Lock,
  CreditCard
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User, PLAN_DETAILS, SubscriptionPlan } from '../types';
import { auth, db } from '../lib/firebase';
import { updatePassword, sendPasswordResetEmail, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { userStore } from '../utils/userStore';
import { doc, updateDoc, getDoc } from 'firebase/firestore';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onUpdateUser: (updatedUser: User) => void;
  handleLogout: () => void;
  onSelectPlan?: (plan: SubscriptionPlan) => void;
  initialTab?: 'profile' | 'password' | 'calendar' | 'membership';
}

type ActiveTab = 'profile' | 'password' | 'calendar' | 'membership';

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUpdateUser,
  handleLogout,
  onSelectPlan,
  initialTab = 'profile'
}) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>(initialTab);
  
  // Username editing state
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState(currentUser.username);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [usernameSuccess, setUsernameSuccess] = useState<string | null>(null);
  const [isSavingUsername, setIsSavingUsername] = useState(false);

  // Password change states
  const [currentPassword, setCurrentPassword] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [showRecentLoginWarning, setShowRecentLoginWarning] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setNewUsername(currentUser.username);
      setUsernameError(null);
      setUsernameSuccess(null);
      setPasswordError(null);
      setPasswordSuccess(null);
      setCurrentPassword('');
      setPassword('');
      setConfirmPassword('');
      setResetEmailSent(false);
      setShowRecentLoginWarning(false);
      if (initialTab) {
        setActiveTab(initialTab);
      }
    }
  }, [isOpen, currentUser, initialTab]);

  const handleUsernameSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanProposed = newUsername.trim().toLowerCase().replace(/\s+/g, '_');
    
    if (!cleanProposed) {
      setUsernameError("El nombre de usuario no puede estar vacío.");
      return;
    }
    
    if (cleanProposed === currentUser.username) {
      setIsEditingUsername(false);
      return;
    }

    if (!/^[a-z0-9_]{3,16}$/.test(cleanProposed)) {
      setUsernameError("Debe tener entre 3 y 16 caracteres, solo letras minúsculas, números o guion bajo (_).");
      return;
    }

    setIsSavingUsername(true);
    setUsernameError(null);
    setUsernameSuccess(null);

    try {
      // Check if taken
      const isTaken = await userStore.isUsernameTaken(cleanProposed);
      if (isTaken) {
        setUsernameError("Este nombre de usuario ya está tomado por otro socio.");
        setIsSavingUsername(false);
        return;
      }

      // Update in users collection
      const userRef = doc(db, 'users', currentUser.id);
      await updateDoc(userRef, { username: cleanProposed });

      // Update username registry index
      await updateDoc(doc(db, 'usernames', cleanProposed), { uid: currentUser.id });
      
      const updatedUser: User = { ...currentUser, username: cleanProposed };
      onUpdateUser(updatedUser);
      setIsEditingUsername(false);
      setUsernameSuccess("¡Nombre de usuario actualizado con éxito!");
      setTimeout(() => setUsernameSuccess(null), 4000);
    } catch (err: any) {
      console.error("Error updating username:", err);
      setUsernameError("No se pudo actualizar el nombre de usuario. Intente nuevamente.");
    } finally {
      setIsSavingUsername(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);
    setShowRecentLoginWarning(false);

    if (password.length < 6) {
      setPasswordError("La nueva contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setPasswordError("Las contraseñas no coinciden.");
      return;
    }

    setIsUpdatingPassword(true);

    try {
      const fbUser = auth.currentUser;
      if (!fbUser) {
        throw new Error("No hay una sesión de autenticación activa.");
      }

      // If user logs in with email/password, reauthentication is recommended
      if (currentPassword) {
        try {
          const credential = EmailAuthProvider.credential(fbUser.email || '', currentPassword);
          await reauthenticateWithCredential(fbUser, credential);
        } catch (reauthErr: any) {
          console.warn("Reauthentication skipped/failed:", reauthErr);
          // Let's print out a clean warning or notify
          setPasswordError("Contraseña actual incorrecta. Ingrese su contraseña actual para validar el cambio seguro.");
          setIsUpdatingPassword(false);
          return;
        }
      }

      // Execute Password Update in Firebase
      await updatePassword(fbUser, password);
      setPasswordSuccess("¡Su contraseña ha sido actualizada exitosamente!");
      setPassword('');
      setConfirmPassword('');
      setCurrentPassword('');
    } catch (err: any) {
      console.error("Error updating password:", err);
      if (err.code === 'auth/requires-recent-login') {
        setShowRecentLoginWarning(true);
        setPasswordError("Por motivos de seguridad, esta acción requiere un inicio de sesión reciente. Puede enviar un correo de recuperación en su lugar.");
      } else {
        setPasswordError(err.message || "Error al actualizar la contraseña. Reingrese sus datos de acceso.");
      }
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleSendResetEmail = async () => {
    setResetEmailSent(false);
    setPasswordError(null);
    try {
      if (auth.currentUser?.email) {
        await sendPasswordResetEmail(auth, auth.currentUser.email);
        setResetEmailSent(true);
      } else {
        setPasswordError("No se encontró el correo electrónico del usuario.");
      }
    } catch (err: any) {
      console.error("Error sending reset password email:", err);
      setPasswordError("No se pudo enviar el correo de recuperación. Comuníquese con soporte.");
    }
  };

  const activePlanDetails = PLAN_DETAILS[currentUser.plan] || PLAN_DETAILS.RETAIL;

  const calculateDaysRemaining = () => {
    if (!currentUser.expiresAt) return null;
    const expiryDate = new Date(currentUser.expiresAt);
    const today = new Date();
    const diffTime = expiryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysRemaining = calculateDaysRemaining();

  return (
    <AnimatePresence>
      {isOpen && (
        <div id="profile-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-slate-950/80 backdrop-blur-md">
          <motion.div
            id="profile-modal-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="w-full max-w-[1020px] bg-white border border-slate-100 rounded-[32px] shadow-2xl flex flex-col md:flex-row overflow-hidden max-h-[95vh] md:max-h-[88vh]"
          >
            {/* Sidebar with Operator Info */}
            <div className="md:w-[260px] shrink-0 bg-slate-50 border-b md:border-b-0 md:border-r border-slate-100 p-6.5 flex flex-col justify-between">
              <div>
                {/* Visual Emblem matching requested design */}
                <div className="flex items-center gap-3 pl-3 border-l-4 border-fx-blue py-1 mb-6">
                  <div className="flex flex-col">
                    <span className="text-[12px] font-mono font-bold text-slate-800 lowercase">
                      @{currentUser.username}
                    </span>
                    <span className="text-[8px] font-extrabold tracking-widest text-slate-400 uppercase mt-0.5">
                      {currentUser.role === 'ADMIN' ? 'Socio Administrador' : 'Socio Operador'}
                    </span>
                  </div>
                </div>

                {/* Navigation Menus */}
                <nav className="flex flex-row md:flex-col gap-2 mt-4 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0">
                  <button
                    type="button"
                    onClick={() => setActiveTab('profile')}
                    className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl text-[9px] font-bold uppercase tracking-wider transition font-mono shrink-0 ${
                      activeTab === 'profile'
                        ? 'bg-slate-950 text-[#CCFF00] shadow-md shadow-black/10'
                        : 'text-slate-500 hover:text-black hover:bg-slate-200/60'
                    }`}
                  >
                    <UserIcon size={12} />
                    Panel de Operador
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('membership')}
                    className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl text-[9px] font-bold uppercase tracking-wider transition font-mono shrink-0 ${
                      activeTab === 'membership'
                        ? 'bg-slate-950 text-[#CCFF00] shadow-md shadow-black/10'
                        : 'text-slate-500 hover:text-black hover:bg-slate-200/60'
                    }`}
                  >
                    <CreditCard size={12} />
                    Membresías & Planes
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('password')}
                    className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl text-[9px] font-bold uppercase tracking-wider transition font-mono shrink-0 ${
                      activeTab === 'password'
                        ? 'bg-slate-950 text-[#CCFF00] shadow-md shadow-black/10'
                        : 'text-slate-500 hover:text-black hover:bg-slate-200/60'
                    }`}
                  >
                    <KeyRound size={12} />
                    Contraseña
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('calendar')}
                    className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl text-[9px] font-bold uppercase tracking-wider transition font-mono shrink-0 ${
                      activeTab === 'calendar'
                        ? 'bg-slate-950 text-[#CCFF00] shadow-md shadow-black/10'
                        : 'text-slate-500 hover:text-black hover:bg-slate-200/60'
                    }`}
                  >
                    <Calendar size={12} />
                    Agendar Soporte
                  </button>
                </nav>
              </div>

              {/* Logout inside user session section */}
              <div className="hidden md:block pt-6 border-t border-slate-200/50">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    handleLogout();
                  }}
                  className="w-full py-3 px-4 bg-red-50 hover:bg-red-100 text-red-600 rounded-2xl text-[9px] font-mono font-bold uppercase tracking-wider transition flex items-center justify-center gap-1.5 border border-red-200"
                >
                  <LogOut size={12} />
                  Cerrar Sesión Activa
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 flex flex-col min-h-0">
              {/* Header inside modal */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white sticky top-0 z-10">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="text-fx-blue" size={15} />
                  <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-slate-800">
                    Sesión de Usuario Segura
                  </span>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-black flex items-center justify-center transition cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Scrollable Stage Content */}
              <div className="p-6 overflow-y-auto flex-1 bg-white">
                
                {/* 1. OVERVIEW PROFILE TAB */}
                {activeTab === 'profile' && (
                  <div className="space-y-6">
                    {/* Welcome Box */}
                    <div className="bg-slate-50 border border-slate-100 rounded-3xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-extrabold text-slate-800 lowercase">
                            @{currentUser.username}
                          </h4>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1">Socio desde: {new Date(currentUser.joinedAt).toLocaleDateString()}</p>
                      </div>

                      {/* Plan Badge */}
                      <div className="flex flex-col items-end">
                        <span className={`px-3 py-1 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider bg-slate-900 border`} style={{ color: `var(--color-${activePlanDetails.color})`, borderColor: `var(--color-${activePlanDetails.color})` }}>
                          {activePlanDetails.name}
                        </span>
                        {currentUser.expiresAt && (
                          <span className="text-[8px] text-slate-400 mt-1 uppercase tracking-wider font-semibold">Expiración: {new Date(currentUser.expiresAt).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>

                    {/* Membership Alarm Indicator Block */}
                    {daysRemaining !== null && (
                      <div className="mt-2">
                        {daysRemaining <= 0 ? (
                          <div className={`p-4 bg-red-50 border-2 border-red-200 text-red-700 rounded-2xl text-[10.5px] font-serif font-bold tracking-wide flex items-start gap-3`}>
                            <span className="text-lg">🚨</span>
                            <div>
                              <strong className="block uppercase tracking-wider text-[9px] font-mono text-red-600 mb-0.5">Suscripción Expirada</strong>
                              Su membresía expiró hace {Math.abs(daysRemaining)} días. Por favor, comuníquese con administración o realice su renovación para reactivar la ejecución de análisis heurísticos de mercado.
                            </div>
                          </div>
                        ) : daysRemaining <= 5 ? (
                          <div className={`p-4 bg-amber-50 border-2 border-amber-300 text-amber-900 rounded-2xl text-[10.5px] font-mono font-bold flex items-start gap-3 animate-pulse`}>
                            <span className="text-lg">📢</span>
                            <div>
                              <strong className="block uppercase tracking-widest text-[9px] text-amber-700 mb-0.5 animate-[ping_2s_infinite]">ALERTA DE VENCIMIENTO</strong>
                              ¡Quedan solo <span className="bg-amber-100 text-amber-950 px-1 py-0.2 rounded font-sans font-black">{daysRemaining} días</span> para que termine su plan de membresía {activePlanDetails.name}. Recuerde renovar a tiempo para evitar interrupciones de acceso.
                            </div>
                          </div>
                        ) : (
                          <div className="p-3.5 bg-emerald-50/70 border border-emerald-100 text-emerald-800 rounded-2xl text-[10px] font-sans font-medium flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-emerald-500" />
                              <span>Membresía activa: le quedan <strong className="font-mono font-bold">{daysRemaining} días</strong> de servicio.</span>
                            </div>
                            <span className="text-[8px] uppercase tracking-wider font-bold text-emerald-600 bg-emerald-100/50 px-2 py-0.5 rounded-full font-mono">Estado Estable</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Messages */}
                    {usernameError && (
                      <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-[9px] font-mono font-bold flex items-center gap-1.5">
                        <AlertTriangle size={11} />
                        {usernameError}
                      </div>
                    )}
                    {usernameSuccess && (
                      <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-2xl text-[9px] font-mono font-bold flex items-center gap-1.5">
                        <CheckCircle2 size={11} />
                        {usernameSuccess}
                      </div>
                    )}

                    {/* Operator Stats Metrics Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Left Block */}
                      <div className="p-4 rounded-3xl border border-slate-100 bg-white space-y-3.5 shadow-sm">
                        <span className="text-[8px] font-mono font-bold uppercase tracking-widest text-slate-400 block border-b border-slate-50 pb-1.5">
                          Seguridad e Identidad
                        </span>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] text-slate-500 font-medium">Correo Electrónico:</span>
                          <span className="text-[9px] font-semibold text-slate-800 font-mono flex items-center gap-1">
                            <Mail size={10} className="text-slate-400" />
                            {currentUser.email}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-[9px] text-slate-500 font-medium">Rol del Usuario:</span>
                          <span className="text-[8px] font-mono font-bold bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 uppercase tracking-wider">
                            {currentUser.role}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-[9px] text-slate-500 font-medium">Estado Cuenta:</span>
                          <span className="flex items-center gap-1.5">
                            <span className={`w-1.5 h-1.5 rounded-full ${currentUser.status === 'ACTIVE' ? 'bg-[#CCFF00]' : 'bg-amber-400'}`} />
                            <span className="text-[9px] font-bold text-slate-800 font-mono uppercase">
                              {currentUser.status}
                            </span>
                          </span>
                        </div>
                      </div>

                      {/* Right Block - Usage analysis indicator */}
                      <div className="p-4 rounded-3xl border border-slate-100 bg-white space-y-3.5 shadow-sm">
                        <span className="text-[8px] font-mono font-bold uppercase tracking-widest text-slate-400 block border-b border-slate-50 pb-1.5">
                          Cuotas de Consumo Heurístico
                        </span>

                        <div className="flex items-center justify-between">
                          <span className="text-[9px] text-slate-500 font-medium">Límite Mensual asignado:</span>
                          <span className="text-[9.5px] font-bold text-slate-800 font-mono">
                            {currentUser.plan === 'RETAIL' ? '150' : currentUser.plan === 'PRO' ? '900' : '3,000'} Análisis
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-[9px] text-slate-500 font-medium font-sans">Análisis ejecutados:</span>
                          <span className="text-[9.5px] font-bold text-slate-700 font-mono">
                            {currentUser.totalAnalysesCount || 0} consultados
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-[9px] text-slate-500 font-medium">Cupo Diario Estimado:</span>
                          <span className="text-[9.5px] font-extrabold text-[#CCFF00] bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-wider">
                            {currentUser.plan === 'RETAIL' ? '5 diarios' : currentUser.plan === 'PRO' ? '30 diarios' : '100 diarios'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Features list */}
                    <div className="p-5 rounded-3xl bg-slate-50 border border-slate-100/70 space-y-2">
                      <span className="text-[8px] font-mono font-bold uppercase tracking-widest text-slate-400 block">
                        Beneficios de tu Sususcripción
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1.5">
                        {activePlanDetails.features.map((feature, i) => (
                          <div key={i} className="flex gap-1.5 items-start">
                            <Check className="text-fx-blue mt-0.5 shrink-0" size={11} />
                            <span className="text-[8.5px] text-slate-600 leading-snug">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 1.5 MEMBERSHIP ACTIONS & INFORMATION TAB */}
                {activeTab === 'membership' && (
                  <div className="space-y-6 animate-[fadeIn_0.2s_ease-out]">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div>
                        <h4 className="text-base font-bold text-slate-800 tracking-tight font-sans">
                          Gestión de Membresías y Licencias
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Verifica el estado de tu licencia actual, adquiere un nuevo plan o sube de nivel tu membresía.
                        </p>
                      </div>
                    </div>

                    {/* Current Plan Summary Card */}
                    <div className="bg-slate-950 text-white rounded-[2rem] p-6 border border-slate-850 shadow-xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-brand-lime opacity-10 rounded-full blur-3xl -mr-10 -mt-10" />
                      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-2">
                          <span className="px-2.5 py-0.5 rounded text-[8px] font-mono font-extrabold uppercase tracking-wider bg-brand-lime/10 border border-brand-lime/20 text-brand-lime w-fit block">
                            Tu Plan Actual
                          </span>
                          <h5 className="text-2xl font-serif italic text-white flex items-center gap-2">
                            <span>{PLAN_DETAILS[currentUser.plan]?.name || currentUser.plan}</span>
                            {currentUser.status === 'ACTIVE' && (
                              <span className="w-2.5 h-2.5 bg-brand-lime rounded-full inline-block animate-pulse" title="Licencia Activa" />
                            )}
                          </h5>
                          
                          <div className="flex flex-wrap gap-x-4 gap-y-2 text-[10px] text-slate-400 font-sans pt-1">
                            <div className="flex items-center gap-1">
                              <span className="text-slate-500">Estado:</span>
                              <strong className={`uppercase ${currentUser.status === 'ACTIVE' ? 'text-brand-lime' : 'text-amber-400'}`}>{currentUser.status}</strong>
                            </div>
                            {currentUser.expiresAt && (
                              <div className="flex items-center gap-1">
                                <span className="text-slate-500">Expira el:</span>
                                <strong className="text-slate-200">{new Date(currentUser.expiresAt).toLocaleDateString()}</strong>
                              </div>
                            )}
                            {daysRemaining !== null && (
                              <div className="flex items-center gap-1">
                                <span className="text-slate-500">Tiempo restante:</span>
                                <strong className={daysRemaining <= 0 ? "text-red-500" : daysRemaining <= 5 ? "text-amber-500 animate-pulse" : "text-brand-lime"}>
                                  {daysRemaining <= 0 ? 'Expirado' : `${daysRemaining} días`}
                                </strong>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Referral details inside membership tab */}
                        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl md:w-80 space-y-2 text-left">
                          <div className="text-[8px] font-mono font-bold uppercase tracking-widest text-slate-400">
                            Código de Afiliado & Invitación
                          </div>
                          {currentUser.referredBy && (
                            <div className="flex justify-between items-center text-[9px] border-b border-slate-850 pb-1.5 pt-0.5">
                              <span className="text-slate-500 font-sans">Referido por:</span>
                              <span className="font-mono text-brand-lime font-bold">@{currentUser.referredBy}</span>
                            </div>
                          )}
                          <div className="flex flex-col gap-1 text-[9px]">
                            <span className="text-slate-500">Tu código de referencia:</span>
                            <div className="flex items-center justify-between gap-1.5 bg-slate-950 px-2 py-1.5 rounded-lg border border-slate-850 font-mono">
                              <span className="text-slate-300 font-bold truncate select-all">{currentUser.referralCode || currentUser.username}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  const inviteLink = `https://www.iaxaukin.com?ref=${encodeURIComponent(currentUser.referralCode || currentUser.username)}`;
                                  navigator.clipboard.writeText(inviteLink);
                                  alert("Enlace de afiliado copiado al portapapeles: " + inviteLink);
                                }}
                                className="text-brand-lime hover:text-white transition-colors cursor-pointer text-[8px] font-bold uppercase shrink-0"
                              >
                                Copiar Link
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Step up/upgrade memberships container */}
                    <div className="space-y-4">
                      <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-sans">
                        Opciones de Membresía Disponibles
                      </h5>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {(['RETAIL', 'PRO', 'INSTITUTIONAL'] as SubscriptionPlan[]).map((pKey) => {
                          const plan = PLAN_DETAILS[pKey];
                          const isCurrent = currentUser.plan === pKey;
                          const isInst = pKey === 'INSTITUTIONAL';
                          
                          return (
                            <div 
                              key={pKey} 
                              className={`rounded-3xl p-5 text-left flex flex-col justify-between transition-all duration-300 border
                                ${isInst 
                                  ? 'border-brand-lime/25 bg-slate-950 text-white shadow-xl shadow-brand-lime/5' 
                                  : 'border-slate-100 bg-slate-50/50 text-slate-900 hover:bg-slate-50'
                                } ${isCurrent ? 'ring-2 ring-brand-lime ring-offset-2' : ''}`}
                            >
                              <div className="space-y-3.5">
                                <div className="flex items-center justify-between gap-2">
                                  <span className={`px-2 py-0.5 text-[8px] font-extrabold uppercase rounded tracking-wider border
                                    ${isInst 
                                      ? 'bg-brand-lime/10 border-brand-lime/20 text-brand-lime' 
                                      : 'bg-white border-slate-200 text-slate-700'}`}
                                  >
                                    PLAN {pKey}
                                  </span>
                                  {isCurrent && (
                                    <span className="text-[7.5px] font-bold text-brand-lime bg-brand-lime/10 px-1.5 py-0.5 rounded border border-brand-lime/10 uppercase tracking-widest leading-none">
                                      Actual
                                    </span>
                                  )}
                                </div>

                                <div className="space-y-0.5">
                                  <h6 className={`text-base font-serif italic font-bold ${isInst ? 'text-white' : 'text-slate-900'}`}>
                                    {plan.name}
                                  </h6>
                                  <p className={`text-xs font-black font-mono tracking-tight text-fx-blue`}>
                                    {plan.price}
                                  </p>
                                </div>

                                <ul className="space-y-1.5 text-[9px] pt-2 border-t border-slate-200/40">
                                  {plan.features.slice(0, 4).map((feat, idx) => (
                                    <li key={idx} className="flex gap-1">
                                      <Check className="w-2.5 h-2.5 mt-0.5 shrink-0 text-brand-lime" />
                                      <span className={isInst ? 'text-slate-300 truncate' : 'text-slate-500 truncate'} title={feat}>
                                        {feat}
                                      </span>
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              <div className="pt-5 mt-auto">
                                {isInst ? (
                                  <a 
                                    href={`mailto:gerencia@iaxaukin.com?subject=Consulta%20Plan%20Institucional&body=Hola%20Gerencia,%20mi%20usuario%20es%20@${currentUser.username}.%20Deseo%20más%20información.`}
                                    className="w-full text-center py-2.5 font-bold uppercase tracking-wider text-[8px] rounded-xl cursor-pointer transition-all bg-brand-lime text-slate-950 hover:bg-white hover:text-black block"
                                  >
                                    Contactar Gerencia
                                  </a>
                                ) : (
                                  <button 
                                    type="button"
                                    onClick={() => {
                                      if (onSelectPlan) {
                                        onClose(); // Close ProfileModal
                                        onSelectPlan(pKey); // Open Checkout Modal in App.tsx
                                      }
                                    }}
                                    className={`w-full text-center py-2.5 font-bold uppercase tracking-wider text-[8px] rounded-xl cursor-pointer transition-all block
                                      ${isCurrent 
                                        ? 'bg-slate-900 text-[#CCFF00] hover:bg-slate-800' 
                                        : 'bg-slate-950 text-white hover:bg-slate-800'
                                      }`}
                                  >
                                    {isCurrent ? "Renovar Suscripción" : "Suscripción / Sube Nivel"}
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 flex items-start gap-2.5 text-[10px] text-amber-800 leading-normal">
                      <span className="text-sm shrink-0 font-sans">💡</span>
                      <p className="font-sans">
                        <b>Nota de Licenciamiento:</b> Al hacer clic en un plan se abrirá el portal de checkout del sistema para que puedas subir tu comprobante de pago USDT (Red Tron), Binance Pay o realizar tu suscripción automatizada con PayPal. Una vez notificado, la mesa de administración de IA XAU KIN activará o extenderá tu licencia en pocos minutos de forma manual.
                      </p>
                    </div>
                  </div>
                )}

                {/* 2. PASSWORD CHANGE TAB */}
                {activeTab === 'password' && (
                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    <p className="text-[9.5px] text-slate-500 font-mono leading-relaxed uppercase tracking-wider mb-2">
                      Cambie su contraseña de inicio de sesión de forma segura a continuación.
                    </p>

                    {passwordError && (
                      <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-[9px] font-mono font-bold flex items-center gap-1.5">
                        <AlertTriangle size={11} />
                        {passwordError}
                      </div>
                    )}
                    {passwordSuccess && (
                      <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-2xl text-[9px] font-mono font-bold flex items-center gap-1.5">
                        <CheckCircle2 size={11} />
                        {passwordSuccess}
                      </div>
                    )}

                    <div className="space-y-3.5">
                      <div className="space-y-1">
                        <label className="text-[8.5px] font-mono font-bold uppercase tracking-widest text-slate-400 block">
                          Contraseña Actual (Para validación segura)
                        </label>
                        <input
                          type="password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-fx-blue select-all"
                          placeholder="••••••••"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[8.5px] font-mono font-bold uppercase tracking-widest text-slate-400 block">
                          Nueva Contraseña (mínimo 6 caracteres)
                        </label>
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-fx-blue select-all"
                          placeholder="••••••••"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[8.5px] font-mono font-bold uppercase tracking-widest text-slate-400 block">
                          Confirmar Nueva Contraseña
                        </label>
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-fx-blue select-all"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-3">
                      <button
                        type="submit"
                        disabled={isUpdatingPassword}
                        className="flex-1 py-3 bg-slate-900 border border-slate-800 hover:bg-black text-[#CCFF00] hover:text-white rounded-xl text-[9px] font-bold font-mono uppercase tracking-wider flex items-center justify-center gap-1.5 transition shadow-sm cursor-pointer disabled:opacity-40"
                      >
                        {isUpdatingPassword ? <Loader2 size={12} className="animate-spin" /> : <Lock size={12} />}
                        Guardar Nueva Contraseña
                      </button>

                      {showRecentLoginWarning && (
                        <button
                          type="button"
                          onClick={handleSendResetEmail}
                          className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[9px] font-bold font-mono uppercase tracking-wider transition border border-slate-200 cursor-pointer"
                        >
                          ¿Enviar correo de recuperación directo?
                        </button>
                      )}
                    </div>

                    {resetEmailSent && (
                      <div className="p-3 bg-blue-50 border border-blue-100 text-blue-600 rounded-2xl text-[9px] font-mono font-bold flex items-center gap-1.5 mt-2">
                        <Check size={11} />
                        Se ha enviado un correo a su bandeja de entrada ({currentUser.email}) para restablecer su contraseña de manera alternativa.
                      </div>
                    )}
                  </form>
                )}

                {/* 3. CALENDAR IFrame TAB */}
                {activeTab === 'calendar' && (
                  <div className="space-y-5 animate-[fadeIn_0.2s_ease-out]">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                      <div>
                        <h4 className="text-base font-bold text-[#1e293b] tracking-tight">
                          Reserva tu Reunión con Soporte
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Seleccione una fecha y hora conveniente para agendar una sesión personalizada de soporte técnico y mentoría operativa mediante Google Meet.
                        </p>
                      </div>
                      <a
                        href="https://calendar.google.com/calendar/appointments/schedules/AcZssZ1tBTLy-bQVAI8Tv9Zfu85DwRGPF4c7DrsQiuWFKZCoh-NQUA0lUzUAqB1RKxxa7zUjW24oyW5g?gv=true"
                        target="_blank"
                        rel="noreferrer noopener"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-800 transition shrink-0 border border-slate-200/50"
                      >
                        <span>Pantalla Completa</span>
                        <ExternalLink size={11} />
                      </a>
                    </div>
 
                    {/* Responsive Iframe Container */}
                    <div className="border border-slate-200 rounded-2xl overflow-hidden w-full bg-slate-50 h-[485px] md:h-[515px] relative shadow-inner">
                      <iframe 
                        src="https://calendar.google.com/calendar/appointments/schedules/AcZssZ1tBTLy-bQVAI8Tv9Zfu85DwRGPF4c7DrsQiuWFKZCoh-NQUA0lUzUAqB1RKxxa7zUjW24oyW5g?gv=true" 
                        style={{ border: 0 }} 
                        width="100%" 
                        height="100%" 
                        frameBorder="0" 
                        title="Agenda con Soporte"
                        id="embedded-support-calendar-frame"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
