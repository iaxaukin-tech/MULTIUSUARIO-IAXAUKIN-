import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Users, 
  Globe, 
  Webhook, 
  Send, 
  Copy, 
  Check, 
  Settings, 
  Clock, 
  ShieldCheck, 
  AlertTriangle, 
  Loader2, 
  Share2,
  ChevronRight,
  TrendingUp,
  Mail,
  Sliders,
  ArrowLeft
} from 'lucide-react';
import { User, SubscriptionPlan, PLAN_DETAILS } from '../types';
import { userStore } from '../utils/userStore';

interface InstitutionalBoardProps {
  currentUser: User;
  onUpdateConfig: (updatedUser: User) => void;
  allUsers?: User[];
  onReloadUsers?: () => Promise<void>;
}

export const InstitutionalBoard = ({ 
  currentUser, 
  onUpdateConfig,
  allUsers = [],
  onReloadUsers
}: InstitutionalBoardProps) => {
  const isAdmin = currentUser.role === 'ADMIN';
  const [selectedPartner, setSelectedPartner] = useState<User | null>(null);
  const activeTarget: User = (isAdmin && selectedPartner) ? selectedPartner : currentUser;

  // Config States
  const [referralCode, setReferralCode] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [telegramChannelId, setTelegramChannelId] = useState('');
  const [telegramBotToken, setTelegramBotToken] = useState('');
  const [discordWebhookUrl, setDiscordWebhookUrl] = useState('');

  // Operation States
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Referred list States
  const [referredUsers, setReferredUsers] = useState<User[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [listError, setListError] = useState<string | null>(null);

  // Copy feedback states
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const referralLink = `https://www.iaxaukin.com?ref=${encodeURIComponent(referralCode || activeTarget.username)}`;

  // Sync inputs with activeTarget
  useEffect(() => {
    setReferralCode(activeTarget.referralCode || activeTarget.username || '');
    setWebhookUrl(activeTarget.webhookUrl || '');
    setTelegramChannelId(activeTarget.telegramChannelId || '');
    setTelegramBotToken(activeTarget.telegramBotToken || '');
    setDiscordWebhookUrl(activeTarget.discordWebhookUrl || '');
  }, [activeTarget]);

  // Load registered users who used this affiliate code
  useEffect(() => {
    const fetchList = async () => {
      setIsLoadingList(true);
      setListError(null);
      try {
        const codeQuery = activeTarget.referralCode || activeTarget.username;
        const list = await userStore.getReferredUsers(codeQuery || '');
        
        // Match case-insensitively against active partner's username and referralCode
        const targetUsernameLower = (activeTarget.username || '').trim().toLowerCase();
        const targetCodeLower = (activeTarget.referralCode || '').trim().toLowerCase();
        
        const localReferred = allUsers.filter(u => {
          const uRef = (u.referredBy || '').trim().toLowerCase();
          return uRef && (uRef === targetUsernameLower || uRef === targetCodeLower);
        });

        // Merge both lists, avoiding duplicates based on user id
        const mergedMap = new Map<string, User>();
        list.forEach(u => mergedMap.set(u.id, u));
        localReferred.forEach(u => mergedMap.set(u.id, u));
        
        setReferredUsers(Array.from(mergedMap.values()));
      } catch (err: any) {
        console.error("Error loading referred users:", err);
        setListError("No se pudieron cargar los registros de afiliados. Verifique su conexión.");
      } finally {
        setIsLoadingList(false);
      }
    };
    if (activeTarget) {
      fetchList();
    }
  }, [activeTarget.referralCode, activeTarget.username, allUsers]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyPartnerLink = (id: string, link: string) => {
    navigator.clipboard.writeText(link);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(null);
    setSaveError(null);

    try {
      if (!referralCode.trim()) {
        throw new Error("El código de afiliado/comunidad no puede estar vacío.");
      }
      
      const cleanCode = referralCode.trim().toLowerCase().replace(/\s+/g, '_');
      if (!/^[a-zA-Z0-9_\-]+$/.test(cleanCode)) {
        throw new Error("El código de afiliado solo debe contener letras, números, guiones y guiones bajos (sin espacios).");
      }

      const updated = await userStore.updateInstitutionalConfig(activeTarget.id, {
        referralCode: cleanCode,
        webhookUrl: webhookUrl.trim(),
        telegramChannelId: telegramChannelId.trim(),
        telegramBotToken: telegramBotToken.trim(),
        discordWebhookUrl: discordWebhookUrl.trim(),
      });

      if (isAdmin && selectedPartner) {
        setSelectedPartner(updated);
        if (onReloadUsers) {
          await onReloadUsers();
        }
      } else {
        onUpdateConfig(updated);
      }

      setSaveSuccess("¡Configuraciones e integraciones guardadas con éxito!");
      setTimeout(() => setSaveSuccess(null), 4000);
    } catch (err: any) {
      console.error("Error saving institutional settings:", err);
      setSaveError(err.message || "Error al actualizar la configuración en el servidor.");
    } finally {
      setIsSaving(false);
    }
  };

  // Stats calculation
  const totalInvited = referredUsers.length;
  const activeCount = referredUsers.filter(u => u.status === 'ACTIVE').length;
  const pendingCount = referredUsers.filter(u => u.status === 'PENDING_APPROVAL').length;
  const inactiveCount = totalInvited - activeCount - pendingCount;

  const partners = allUsers.filter(u => u.plan === 'INSTITUTIONAL');

  // Render general partner directory if admin and no partner selected
  if (isAdmin && !selectedPartner) {
    return (
      <motion.main 
        key="partners-directory"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -15 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8 text-slate-900"
      >
        {/* Title Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <span className="text-[9px] uppercase tracking-[0.2em] font-mono font-black text-slate-400 bg-slate-100 px-2 py-1 rounded">
              Panel Administrativo de Socios
            </span>
            <h1 className="text-3xl font-serif italic font-bold text-slate-900 mt-2">
              Mesa de <span className="text-brand-lime">Socios y Comunidades</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Administración global de comunidades y socios integrados. Genera enlaces de referidos y visualiza traders afiliados por cada socio.
            </p>
          </div>
          <div className="flex items-center gap-2 font-mono text-[9px] uppercase bg-slate-900 text-slate-200 px-3 py-1.5 rounded-xl font-bold tracking-wider self-start md:self-auto">
            <ShieldCheck size={11} className="text-brand-lime" /> {partners.length} Socios Registrados
          </div>
        </div>

        {/* Directory Card */}
        <div className="glass-card rounded-[2rem] p-6 sm:p-8 bg-white border border-slate-200/50 shadow-premium space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="text-lg font-serif italic font-bold text-slate-900 flex items-center gap-2">
              <Users size={16} className="text-brand-lime" />
              Directorio de Socios Comunitarios / Aliados
            </h3>
            <span className="text-[9.5px] font-mono font-bold uppercase tracking-wider text-slate-400">
              Mesa Operativa
            </span>
          </div>

          {partners.length === 0 ? (
            <div className="py-20 text-center rounded-2xl bg-slate-50/50 border border-dashed border-slate-200/80 p-8 space-y-3">
              <span className="text-2xl font-mono">👥</span>
              <p className="text-sm font-serif italic text-slate-500 font-bold">No hay Socios Institucionales registrados.</p>
              <p className="text-xs text-slate-400 font-medium max-w-sm mx-auto leading-normal">
                Puedes cambiar la licencia de cualquier operador a "Socio Institucional" en la sección de **Gestión de Acceso Global**.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600 border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 text-[8.5px] font-mono uppercase tracking-wider font-bold">
                    <th className="py-3 pl-2">Socio / Correo</th>
                    <th className="py-3">Código</th>
                    <th className="py-3">Enlace Afiliado</th>
                    <th className="py-3 text-center">Traders Referidos</th>
                    <th className="py-3">Estado</th>
                    <th className="py-3 text-right pr-2">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {partners.map((p) => {
                    const partnerCode = p.referralCode || p.username;
                    const partnerRefLink = `https://www.iaxaukin.com?ref=${encodeURIComponent(partnerCode)}`;
                    const isCopied = copiedId === p.id;
                    
                    // Count referred traders securely and case-insensitively using username & referralCode
                    const targetUsernameLower = (p.username || '').trim().toLowerCase();
                    const targetCodeLower = (p.referralCode || '').trim().toLowerCase();
                    const referredTradersCount = allUsers.filter(u => {
                      const uRef = (u.referredBy || '').trim().toLowerCase();
                      return uRef && (uRef === targetUsernameLower || uRef === targetCodeLower);
                    }).length;

                    return (
                      <tr key={p.id} className="hover:bg-slate-50/30 transition-colors">
                        <td className="py-4 pl-2">
                          <div className="font-bold text-slate-800 flex items-center gap-1.5 leading-none flex-wrap">
                            <span className="font-mono">@{p.username}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 block mt-1">{p.email}</span>
                        </td>
                        <td className="py-4 font-mono font-bold text-slate-700">
                          <span className="bg-slate-100 text-slate-900 border border-slate-200/50 rounded-md px-1.5 py-0.5 text-[10px]">
                            {partnerCode}
                          </span>
                        </td>
                        <td className="py-4">
                          <div className="flex items-center gap-1.5 max-w-[220px]">
                            <input
                              type="text"
                              readOnly
                              value={partnerRefLink}
                              className="bg-slate-55 text-[9.5px] font-mono px-2 py-1 rounded border border-slate-150 outline-none text-slate-500 select-all truncate w-full"
                            />
                            <button
                              onClick={() => handleCopyPartnerLink(p.id, partnerRefLink)}
                              className="bg-slate-900 text-white hover:bg-slate-800 p-1.5 rounded text-[8px] hover:scale-[1.03] transition-transform cursor-pointer flex items-center justify-center shrink-0"
                              title="Copiar Enlace del Socio"
                            >
                              {isCopied ? <Check size={10} className="text-brand-lime" /> : <Copy size={10} />}
                            </button>
                          </div>
                        </td>
                        <td className="py-4 text-center font-mono">
                          <span className={`px-2 py-0.5 rounded-full text-[11px] font-black leading-none ${
                            referredTradersCount > 0 
                              ? 'bg-brand-lime/10 text-slate-900 border border-brand-lime/25' 
                              : 'bg-slate-100 text-slate-400'
                          }`}>
                            {referredTradersCount}
                          </span>
                        </td>
                        <td className="py-4">
                          {p.status === 'ACTIVE' ? (
                            <span className="text-emerald-600 font-bold text-[9px] uppercase tracking-widest flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Activo
                            </span>
                          ) : p.status === 'PENDING_APPROVAL' ? (
                            <span className="text-amber-500 font-extrabold text-[9px] uppercase tracking-widest flex items-center gap-1 animate-pulse">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Pendiente
                            </span>
                          ) : (
                            <span className="text-slate-400 font-bold text-[9px] uppercase tracking-widest flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-200" /> Inactivo
                            </span>
                          )}
                        </td>
                        <td className="py-3 text-right pr-2">
                          <button
                            onClick={() => setSelectedPartner(p)}
                            className="bg-slate-900 border border-slate-900 hover:bg-brand-lime hover:text-slate-900 hover:border-brand-lime text-brand-lime font-bold px-2.5 py-1 rounded-[6px] text-[9px] uppercase tracking-wider transition-colors cursor-pointer inline-flex items-center gap-1.5"
                          >
                            <span>Ver Miembros / Configurar</span>
                            <ChevronRight size={10} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </motion.main>
    );
  }

  // Under normal flow or nested admin inspect mode:
  return (
    <motion.main 
      key="institutional"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10 text-slate-900"
    >
      {/* Admin back button bar if inspecting */}
      {isAdmin && selectedPartner && (
        <div className="flex items-center justify-between bg-slate-900 text-white rounded-2xl px-5 py-4 shadow-lg">
          <div className="flex items-center gap-3.5">
            <button
              onClick={() => setSelectedPartner(null)}
              className="bg-slate-800 hover:bg-slate-700 text-brand-lime border border-slate-700 hover:border-brand-lime/30 px-3.5 py-1.5 rounded-xl text-[10px] uppercase font-bold tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-sm"
            >
              <ArrowLeft size={12} />
              <span>Volver a Mesa de Socios</span>
            </button>
            <div className="h-4 w-[1px] bg-slate-700 hidden sm:block" />
            <div className="hidden sm:block text-[10px] font-mono whitespace-nowrap text-slate-300">
              Usted está inspeccionando al socio: <strong className="text-brand-lime">@{selectedPartner.username}</strong> ({selectedPartner.email})
            </div>
          </div>
          <span className="bg-brand-lime/10 border border-brand-lime/25 text-brand-lime px-2.5 py-1 rounded-[6px] text-[8px] font-mono font-black uppercase tracking-wider">
            Modo Administrador
          </span>
        </div>
      )}

      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <span className="text-[9px] uppercase tracking-[0.2em] font-mono font-black text-slate-400 bg-slate-100 px-2 py-1 rounded">
            {isAdmin && selectedPartner ? `Mesa de Socio: @${selectedPartner.username}` : "Panel para Comunidades y Socios Integrados"}
          </span>
          <h1 className="text-3xl font-serif italic font-bold text-slate-900 mt-2">
            Mesa de Socios e <span className="text-brand-lime">Integraciones</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            {isAdmin && selectedPartner 
              ? `Visualizando estadísticas del socio @${selectedPartner.username}, sus miembros y personalizando sus configuraciones.`
              : "Controla tu marca de afiliación, visualiza operadores referidos y configura la retransmisión por webhook para tus canales de Telegram y Discord."}
          </p>
        </div>
        <div className="flex items-center gap-2 font-mono text-[9px] uppercase bg-slate-900 text-slate-200 px-3 py-1.5 rounded-xl font-bold tracking-wider self-start md:self-auto">
          <ShieldCheck size={11} className="text-brand-lime" /> Licencia Institucional Activa
        </div>
      </div>

      {/* Stats Summary Bento Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card rounded-[1.5rem] p-5 bg-white border border-slate-200/50 shadow-sm flex flex-col justify-between">
          <span className="text-[8.5px] uppercase tracking-wider font-extrabold text-slate-400 font-mono">Total Registrados</span>
          <h4 className="text-3xl font-serif italic text-slate-900 font-black mt-2">
            {totalInvited} <span className="text-[10px] font-sans not-italic text-slate-400 font-bold">cuentas</span>
          </h4>
        </div>
        <div className="glass-card rounded-[1.5rem] p-5 bg-white border border-slate-200/50 shadow-sm flex flex-col justify-between">
          <span className="text-[8.5px] uppercase tracking-wider font-extrabold text-emerald-600 font-mono">Operadores Activos</span>
          <h4 className="text-3xl font-serif italic text-emerald-600 font-black mt-2">
            {activeCount} <span className="text-[10px] font-sans not-italic text-emerald-500 font-bold">pago verificado</span>
          </h4>
        </div>
        <div className="glass-card rounded-[1.5rem] p-5 bg-white border border-slate-200/50 shadow-sm flex flex-col justify-between">
          <span className="text-[8.5px] uppercase tracking-wider font-extrabold text-amber-500 font-mono">Solicitudes Pendientes</span>
          <h4 className="text-3xl font-serif italic text-amber-500 font-black mt-2">
            {pendingCount} <span className="text-[10px] font-sans not-italic text-amber-400 font-bold">en revisión</span>
          </h4>
        </div>
        <div className="glass-card rounded-[1.5rem] p-5 bg-white border border-slate-200/50 shadow-sm flex flex-col justify-between">
          <span className="text-[8.5px] uppercase tracking-wider font-extrabold text-slate-400 font-mono">Membresías Expiradas</span>
          <h4 className="text-3xl font-serif italic text-slate-500 font-black mt-2">
            {inactiveCount} <span className="text-[10px] font-sans not-italic text-slate-400 font-bold">inactivas</span>
          </h4>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column: Affiliation & Webhook integrations Form */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card rounded-[2rem] p-6 sm:p-8 bg-white border border-slate-200/50 shadow-sm space-y-6">
            <h3 className="text-lg font-serif italic font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Settings size={16} className="text-brand-lime" />
              Socio & Enlaces de Comunidad
            </h3>

            {/* Config & Links Box */}
            <div className="bg-slate-50 rounded-2xl p-4.5 border border-slate-100 space-y-3.5">
              <div>
                <label className="block text-[8px] uppercase tracking-widest text-slate-400 font-mono font-bold mb-1">
                  Enlace Oficial de Registro:
                </label>
                <div className="flex gap-1">
                  <input
                    type="text"
                    readOnly
                    value={referralLink}
                    className="w-full bg-slate-100 text-[10px] font-mono px-3 py-1.5 rounded-lg border border-slate-200 outline-none text-slate-500 select-all"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="bg-slate-900 text-white hover:bg-slate-800 px-2.5 rounded-lg text-[9px] hover:scale-[1.03] transition-transform cursor-pointer flex items-center justify-center"
                    title="Copiar Enlace"
                  >
                    {copiedLink ? <Check size={12} className="text-brand-lime animate-pulse" /> : <Copy size={12} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[8px] uppercase tracking-widest text-slate-400 font-mono font-bold mb-1">
                  Código de Identificación:
                </label>
                <div className="flex gap-1">
                  <span className="bg-slate-900 text-brand-lime font-mono text-[10.5px] px-3 py-1 rounded-lg border border-slate-800 font-bold flex items-center gap-1">
                    @{referralCode || currentUser.username}
                  </span>
                  <button
                    onClick={handleCopyCode}
                    className="bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 px-2 rounded-lg text-[9px] cursor-pointer flex items-center justify-center"
                    title="Copiar Código"
                  >
                    {copiedCode ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Configurations Update Form */}
            <form onSubmit={handleSaveConfig} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-[8.5px] uppercase tracking-wider text-slate-500 font-mono font-bold">
                  Personalizar Código de Comunidad
                </label>
                <p className="text-[9px] text-slate-400 font-medium leading-tight">
                  Cambiará tu invitación de registro (ej: op_xyz o forex_academy).
                </p>
                <input
                  type="text"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value.toLowerCase().replace(/\s+/g, '_'))}
                  placeholder="ej: mi_comunidad"
                  className="w-full text-xs font-mono px-3.5 py-2.5 rounded-xl bg-slate-50/70 border border-slate-200 outline-none focus:border-brand-lime transition-all text-slate-800"
                />
              </div>

              <div className="h-[1px] bg-slate-100 my-4" />

              {/* Retransmissions details */}
              <div className="space-y-3">
                <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                  <Webhook size={11} className="text-brand-lime" /> Integraciones Push (Alertas)
                </span>
                <p className="text-[9px] text-slate-400 font-medium leading-relaxed">
                  Permite retransmitir automáticamente todos los reportes de análisis de mercado hechos por tu cuenta directamente a tus grupos de Discord o bots de Telegram.
                </p>

                {/* Discord API */}
                <div className="space-y-1">
                  <label className="block text-[8px] uppercase tracking-wide text-indigo-500 font-mono font-extrabold flex items-center gap-1">
                    Discord Webhook URL
                  </label>
                  <input
                    type="url"
                    value={discordWebhookUrl}
                    onChange={(e) => setDiscordWebhookUrl(e.target.value)}
                    placeholder="https://discord.com/api/webhooks/..."
                    className="w-full text-[10.5px] font-mono px-3.5 py-2 rounded-lg bg-slate-50/70 border border-slate-200 outline-none focus:border-indigo-400 transition-all text-slate-800 placeholder:text-slate-300"
                  />
                </div>

                {/* Telegram Bot key */}
                <div className="space-y-1">
                  <label className="block text-[8px] uppercase tracking-wide text-sky-500 font-mono font-extrabold flex items-center gap-1">
                    Telegram Bot Token
                  </label>
                  <input
                    type="text"
                    value={telegramBotToken}
                    onChange={(e) => setTelegramBotToken(e.target.value)}
                    placeholder="123456789:ABCDefGhIJK..."
                    className="w-full text-[10.5px] font-mono px-3.5 py-2 rounded-lg bg-slate-50/70 border border-slate-200 outline-none focus:border-sky-400 transition-all text-slate-800 placeholder:text-slate-300"
                  />
                </div>

                {/* Telegram chat channel ID */}
                <div className="space-y-1">
                  <label className="block text-[8px] uppercase tracking-wide text-sky-500 font-mono font-extrabold flex items-center gap-1">
                    Telegram Chat / Canal ID
                  </label>
                  <input
                    type="text"
                    value={telegramChannelId}
                    onChange={(e) => setTelegramChannelId(e.target.value)}
                    placeholder="ej: -100155668899"
                    className="w-full text-[10.5px] font-mono px-3.5 py-2 rounded-lg bg-slate-50/70 border border-slate-200 outline-none focus:border-sky-400 transition-all text-slate-800 placeholder:text-slate-300"
                  />
                </div>
              </div>

              {/* Status and saving block */}
              {saveSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-150 rounded-xl text-emerald-800 text-[10px] font-semibold text-center animate-pulse">
                  {saveSuccess}
                </div>
              )}
              {saveError && (
                <div className="p-3 bg-rose-50 border border-rose-150 rounded-xl text-rose-800 text-[10px] font-semibold text-center">
                  {saveError}
                </div>
              )}

              <button
                type="submit"
                disabled={isSaving}
                className={`w-full py-3 bg-slate-900 hover:bg-slate-800 text-brand-lime font-bold rounded-xl text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-md ${isSaving ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                {isSaving ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <span>Guardar Configuraciones</span>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right columns: Affiliated users list (Mesa de Miembros) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card rounded-[2rem] p-6 sm:p-8 bg-white border border-slate-200/50 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-lg font-serif italic font-bold text-slate-900 flex items-center gap-2">
                <Users size={16} className="text-brand-lime" />
                Mesa Operativa de la Comunidad
              </h3>
              <span className="text-[8.5px] font-mono font-bold uppercase tracking-wider bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                Ref: @{currentUser.referralCode || currentUser.username}
              </span>
            </div>

            {isLoadingList ? (
              <div className="py-20 text-center flex flex-col items-center justify-center space-y-3">
                <Loader2 size={24} className="text-brand-lime animate-spin" />
                <span className="text-[10px] uppercase tracking-widest font-mono text-slate-400 font-bold">Cargando operadores afiliados...</span>
              </div>
            ) : listError ? (
              <div className="p-6 bg-rose-50 border border-rose-100 rounded-2xl text-rose-800 text-xs text-center">
                {listError}
              </div>
            ) : referredUsers.length === 0 ? (
              <div className="py-20 text-center rounded-2xl bg-slate-50/50 border border-dashed border-slate-200/80 p-8 space-y-3">
                <span className="text-2xl">👥</span>
                <p className="text-xs font-serif italic text-slate-500 font-bold">No se han registrado operadores bajo tu código aún.</p>
                <p className="text-[10px] text-slate-400 font-medium max-w-sm mx-auto leading-normal">
                  Comparte tu **Enlace de Registro** o tu código **@{referralCode || currentUser.username}** con los miembros de tu comunidad para comenzar a listarlos aquí.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600 border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 text-[8.5px] font-mono uppercase tracking-wider font-bold">
                      <th className="py-3 pl-2">Operador</th>
                      <th className="py-3">Plan Licencia</th>
                      <th className="py-3">Estado Acceso</th>
                      <th className="py-3 pr-2">Fecha Registro</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {referredUsers.map((user) => {
                      const diffDays = user.expiresAt 
                        ? Math.ceil((new Date(user.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                        : null;
                      const isExpiringSoon = user.status === 'ACTIVE' && diffDays !== null && diffDays >= 0 && diffDays <= 5;

                      return (
                        <tr key={user.id} className="hover:bg-slate-50/30 transition-colors">
                          <td className="py-4 pl-2 font-bold text-slate-800 font-mono">
                            @{user.username}
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
                              <div className="text-[7.5px] text-slate-400 font-mono font-medium mt-0.5 whitespace-nowrap">
                                Expira: {new Date(user.expiresAt).toLocaleDateString()}
                              </div>
                            )}
                            {isExpiringSoon && (
                              <span className="inline-flex items-center gap-0.5 bg-amber-100/55 text-amber-700 border border-amber-200 rounded px-1.5 py-0.5 text-[6.5px] font-black uppercase tracking-wider mt-1 font-mono">
                                ⚠️ VENCE EN {diffDays} DÍAS
                              </span>
                            )}
                          </td>
                          <td className="py-4 pr-2 text-slate-400 font-mono text-[9px] whitespace-nowrap">
                            {new Date(user.joinedAt).toLocaleDateString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.main>
  );
};
