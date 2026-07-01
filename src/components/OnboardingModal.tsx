import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Compass, 
  Coins, 
  Sparkles, 
  ChevronRight, 
  Check, 
  TrendingUp, 
  ShieldCheck, 
  Users 
} from 'lucide-react';
import { User } from '../types';
import { userStore } from '../utils/userStore';

interface OnboardingModalProps {
  user: User;
  onComplete: (updatedUser: User) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ user, onComplete }) => {
  const [step, setStep] = useState(1);
  const [source, setSource] = useState('');
  const [goldExperience, setGoldExperience] = useState('');
  const [primaryGoal, setPrimaryGoal] = useState('');
  const [retentionPreference, setRetentionPreference] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sources = [
    { id: 'Facebook Ads', label: 'Anuncios de Facebook / Instagram', desc: 'Publicidad pagada o posts recomendados' },
    { id: 'TikTok Ads', label: 'TikTok Ads', desc: 'Videos cortos, análisis virales o lives' },
    { id: 'Canal de Telegram', label: 'Canales de Telegram', desc: 'Comunidades de trading, alertas o señales' },
    { id: 'Recomendación de amigo', label: 'Recomendación de un Amigo', desc: 'Boca a boca de otro operador socio' },
    { id: 'YouTube', label: 'Búsqueda de Google / SEO / YouTube', desc: 'Videos, artículos de blog o foros' },
    { id: 'Otro', label: 'Otro Medio', desc: 'Plataformas alternativas o menciones' }
  ];

  const experiences = [
    { 
      id: 'Novato / Sin experiencia', 
      label: 'Sin Experiencia Previa', 
      desc: 'Es mi primera vez operando en mercados financieros o forex, quiero aprender desde cero.' 
    },
    { 
      id: 'Intermedio', 
      label: 'Operador Básico / Intermedio', 
      desc: 'Conozco qué es el Oro (XAUUSD), pips, lotes y estructura de mercado básica.' 
    },
    { 
      id: 'Avanzado', 
      label: 'Operador Avanzado', 
      desc: 'Comprendo la estructura de mercado institucional (BOS, CHoCH y vacíos de liquidez).' 
    },
    { 
      id: 'Profesional / Institucional', 
      label: 'Operador Profesional / Institucional', 
      desc: 'Opero Oro diariamente utilizando conceptos cuantitativos o gestiono cuentas de fondeo.' 
    }
  ];

  const goals = [
    { id: 'Lograr consistencia operando Oro (XAUUSD)', label: 'Estudiar y modelar estructura de mercado', desc: 'Quiero ver cómo la IA identifica zonas óptimas para perfeccionar mi propio análisis' },
    { id: 'Pasar o gestionar cuentas de fondeo', label: 'Pasar o gestionar cuentas de fondeo', desc: 'Usarlo como un segundo filtro técnico ultra preciso antes de operar mi cuenta de fondeo' },
    { id: 'Diversificar mi portafolio de inversión', label: 'Diversificar mi portafolio de inversión', desc: 'Incorporar el análisis algorítmico de alta probabilidad del Oro a mi operativa existente' },
    { id: 'Recibir señales y reportes automáticos', label: 'Recibir señales y reportes de la IA', desc: 'Enfocarme puramente en las coordenadas sugeridas por los modelos cuánticos' }
  ];

  const retentions = [
    { id: 'Soporte técnico preferencial 24/7', label: 'Soporte personalizado y acompañamiento constante', desc: 'Queremos asegurarnos de que tengas un canal directo para resolver cualquier duda al instante.' },
    { id: 'Alertas móviles instantáneas en vivo', label: 'Alertas móviles e información en tiempo real', desc: 'Recibir notificaciones instantáneas cómodamente en tu dispositivo móvil.' },
    { id: 'Webinars educativos de trading de Oro', label: 'Recursos educativos y webinars de trading', desc: 'Sesiones online para comprender a fondo la lógica cuantitativa de la IA.' },
    { id: 'Descuentos especiales por renovaciones consecutivas', label: 'Incentivos de lealtad y beneficios especiales', desc: 'Premiar tu permanencia en el club con accesos o tarifas de renovación preferenciales.' }
  ];

  const handleNext = () => {
    setError(null);
    if (step === 1 && !source) {
      setError('Por favor, selecciona una opción para continuar.');
      return;
    }
    if (step === 2 && !goldExperience) {
      setError('Por favor, selecciona tu nivel de experiencia en XAUUSD.');
      return;
    }
    if (step === 3 && !primaryGoal) {
      setError('Por favor, dinos cuál es tu objetivo principal.');
      return;
    }
    if (step === 4 && !retentionPreference) {
      setError('Por favor, selecciona qué es lo más importante para ti.');
      return;
    }

    if (step < 4) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      // Map goldKnowledge based on selected experience level
      let goldKnowledge = 'Conozco lo básico';
      if (goldExperience === 'Novato / Sin experiencia') {
        goldKnowledge = 'No conozco el activo, me asusta su volatilidad';
      } else if (goldExperience === 'Avanzado' || goldExperience === 'Profesional / Institucional') {
        goldKnowledge = 'Sí, domino el spread y volatilidad del oro';
      }

      const updated = await userStore.submitOnboarding(user.id, {
        source,
        goldExperience,
        primaryGoal,
        retentionPreference,
        experience: goldExperience,
        goldKnowledge,
        goals: [primaryGoal],
        retentionFactors: [retentionPreference]
      });
      onComplete(updated);
    } catch (err: any) {
      setError(err.message || 'Error al guardar los datos de onboarding.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl relative text-slate-100 my-8"
      >
        {/* Progress header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-brand-lime animate-pulse" />
            <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400">
              Perfil de Operador XAUUSD
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4].map((num) => (
              <div 
                key={num} 
                className={`h-1 rounded-full transition-all duration-300 ${
                  num === step 
                    ? 'w-6 bg-brand-lime' 
                    : num < step 
                      ? 'w-3 bg-brand-lime/50' 
                      : 'w-2 bg-slate-800'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Form sections with slide animations */}
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-brand-lime/10 text-brand-lime rounded-2xl">
                  <Compass size={22} />
                </div>
                <h2 className="font-sans font-bold text-xl md:text-2xl tracking-tight text-white">
                  ¿De dónde conociste a IA XAU KIN?
                </h2>
              </div>
              <p className="text-sm text-slate-400 mb-6">
                Ayúdanos a identificar de qué canal o campaña de pauta vienes. Esto nos permite optimizar nuestras audiencias para atraer a más traders serios como tú.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                {sources.map((item) => {
                  const isSelected = source === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => { setSource(item.id); setError(null); }}
                      className={`text-left p-4 rounded-2xl border transition-all cursor-pointer ${
                        isSelected 
                          ? 'bg-brand-lime/10 border-brand-lime text-white' 
                          : 'bg-slate-950/50 border-slate-800/80 hover:border-slate-700 hover:bg-slate-950 text-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="font-sans font-semibold text-sm">{item.label}</div>
                        {isSelected && <Check size={14} className="text-brand-lime mt-0.5" />}
                      </div>
                      <div className="text-xs text-slate-400 mt-1">{item.desc}</div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-brand-lime/10 text-brand-lime rounded-2xl">
                  <Coins size={22} />
                </div>
                <h2 className="font-sans font-bold text-xl md:text-2xl tracking-tight text-white">
                  Tu experiencia operando Oro (XAUUSD)
                </h2>
              </div>
              <p className="text-sm text-slate-400 mb-6">
                El Oro es un activo altamente volátil con un comportamiento y liquidez únicos. Cuéntanos cuál es tu nivel para adaptar la precisión de tus modelados.
              </p>

              <div className="flex flex-col gap-3 mb-6">
                {experiences.map((item) => {
                  const isSelected = goldExperience === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => { setGoldExperience(item.id); setError(null); }}
                      className={`text-left p-4 rounded-2xl border transition-all cursor-pointer ${
                        isSelected 
                          ? 'bg-brand-lime/10 border-brand-lime text-white' 
                          : 'bg-slate-950/50 border-slate-800/80 hover:border-slate-700 hover:bg-slate-950 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-sans font-semibold text-sm">{item.label}</div>
                        {isSelected && <Check size={14} className="text-brand-lime" />}
                      </div>
                      <div className="text-xs text-slate-400 mt-1">{item.desc}</div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-brand-lime/10 text-brand-lime rounded-2xl">
                  <TrendingUp size={22} />
                </div>
                <h2 className="font-sans font-bold text-xl md:text-2xl tracking-tight text-white">
                  ¿Cuál es tu objetivo principal con el software?
                </h2>
              </div>
              <p className="text-sm text-slate-400 mb-6">
                Queremos entender el uso real que le darás a los reportes de IA para priorizar el desarrollo de las herramientas que más necesitas.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                {goals.map((item) => {
                  const isSelected = primaryGoal === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => { setPrimaryGoal(item.id); setError(null); }}
                      className={`text-left p-4 rounded-2xl border transition-all cursor-pointer ${
                        isSelected 
                          ? 'bg-brand-lime/10 border-brand-lime text-white' 
                          : 'bg-slate-950/50 border-slate-800/80 hover:border-slate-700 hover:bg-slate-950 text-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="font-sans font-semibold text-sm">{item.label}</div>
                        {isSelected && <Check size={14} className="text-brand-lime mt-0.5" />}
                      </div>
                      <div className="text-xs text-slate-400 mt-1">{item.desc}</div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-brand-lime/10 text-brand-lime rounded-2xl">
                  <Sparkles size={22} />
                </div>
                <h2 className="font-sans font-bold text-xl md:text-2xl tracking-tight text-white">
                  ¿Cómo podemos hacerte sentir más cómodo en la plataforma?
                </h2>
              </div>
              <p className="text-sm text-slate-400 mb-6">
                Tu comodidad y crecimiento como trader es lo más importante para nosotros. ¿En qué aspecto te gustaría que nos enfoquemos más para brindarte la mejor experiencia operativa?
              </p>

              <div className="flex flex-col gap-3 mb-6">
                {retentions.map((item) => {
                  const isSelected = retentionPreference === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => { setRetentionPreference(item.id); setError(null); }}
                      className={`text-left p-4 rounded-2xl border transition-all cursor-pointer ${
                        isSelected 
                          ? 'bg-brand-lime/10 border-brand-lime text-white' 
                          : 'bg-slate-950/50 border-slate-800/80 hover:border-slate-700 hover:bg-slate-950 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-sans font-semibold text-sm">{item.label}</div>
                        {isSelected && <Check size={14} className="text-brand-lime" />}
                      </div>
                      <div className="text-xs text-slate-400 mt-1">{item.desc}</div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error notice */}
        {error && (
          <div className="mb-6 p-4 bg-red-950/30 border border-red-900/50 rounded-2xl text-red-400 text-xs font-sans">
            ⚠️ {error}
          </div>
        )}

        {/* Footer controls */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-800/80 mt-4">
          <button
            type="button"
            onClick={() => step > 1 && setStep(step - 1)}
            disabled={step === 1 || isSubmitting}
            className={`px-5 py-3 font-mono text-[10px] uppercase tracking-wider rounded-xl border transition-all ${
              step === 1 
                ? 'opacity-30 border-slate-800 text-slate-600 cursor-not-allowed' 
                : 'border-slate-800 hover:bg-slate-800 text-slate-400 cursor-pointer'
            }`}
          >
            Atrás
          </button>

          <button
            type="button"
            onClick={handleNext}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-3 bg-brand-lime hover:bg-[#b0dc00] text-black font-mono text-[10px] uppercase tracking-wider font-bold rounded-xl transition-all shadow-lg shadow-brand-lime/10 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Procesando...</span>
            ) : (
              <>
                <span>{step === 4 ? 'Iniciar Sesión' : 'Siguiente'}</span>
                {step < 4 && <ChevronRight size={14} />}
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
