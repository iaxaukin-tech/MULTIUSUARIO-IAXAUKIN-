import React, { useState } from 'react';
import { motion } from 'motion/react';
import { MessageSquare, X, Send, Sparkles, AlertTriangle, Layers } from 'lucide-react';
import { User } from '../types';
import { userStore } from '../utils/userStore';

interface SuggestionsModalProps {
  user: User;
  onClose: () => void;
}

export const SuggestionsModal: React.FC<SuggestionsModalProps> = ({ user, onClose }) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'FEATURE' | 'BUG' | 'IMPROVEMENT' | 'OTHER'>('FEATURE');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError('Por favor completa todos los campos obligatorios.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await userStore.submitSuggestion(user.id, user.username, user.email, {
        title,
        category,
        description
      });
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2500);
    } catch (err: any) {
      setError(err.message || 'No se pudo guardar tu sugerencia. Intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = [
    { id: 'FEATURE', label: 'Nueva Función', icon: Sparkles, color: 'text-brand-lime bg-brand-lime/10' },
    { id: 'IMPROVEMENT', label: 'Mejora Técnica', icon: Layers, color: 'text-blue-400 bg-blue-400/10' },
    { id: 'BUG', label: 'Reportar Fallo', icon: AlertTriangle, color: 'text-red-400 bg-red-400/10' },
    { id: 'OTHER', label: 'Otro Aporte', icon: MessageSquare, color: 'text-slate-400 bg-slate-400/10' }
  ];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-100"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <MessageSquare size={18} className="text-brand-lime" />
            <h3 className="font-sans font-bold text-base text-white">Sugerencias y Aportes</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 transition-colors text-slate-400 hover:text-white cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        {success ? (
          <div className="p-8 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-full bg-brand-lime/10 text-brand-lime flex items-center justify-center mb-4">
              <Send size={24} />
            </div>
            <h4 className="font-sans font-bold text-lg text-white mb-2">¡Sugerencia Recibida!</h4>
            <p className="text-sm text-slate-400 max-w-sm">
              Muchas gracias por tu aporte. Guardamos tu sugerencia en nuestro sistema central. El equipo de IA XAU KIN la revisará para seguir mejorando el bot.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4 font-sans">
            <p className="text-xs text-slate-400 leading-relaxed">
              ¿Tienes una propuesta para mejorar los análisis o el comportamiento de la IA? Cuéntanos qué modificaciones te gustaría aportar al sistema.
            </p>

            {/* Title */}
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1.5">
                Título de la Sugerencia *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej: Agregar indicador de Volumen en reporte"
                maxLength={100}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-brand-lime rounded-xl text-sm text-white placeholder-slate-600 outline-none transition-colors"
                required
              />
            </div>

            {/* Category selection */}
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-2">
                Categoría
              </label>
              <div className="grid grid-cols-2 gap-2">
                {categories.map((cat) => {
                  const CatIcon = cat.icon;
                  const isSelected = category === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id as any)}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-medium transition-all text-left cursor-pointer ${
                        isSelected
                          ? 'border-brand-lime bg-brand-lime/5 text-white'
                          : 'border-slate-800 bg-slate-950/40 hover:border-slate-700 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div className={`p-1.5 rounded-lg ${cat.color}`}>
                        <CatIcon size={12} />
                      </div>
                      <span>{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1.5">
                Detalles del aporte o modificación sugerida *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe a detalle qué cambios te gustaría ver y cómo nos ayudarían a mejorar la consistencia o la interfaz..."
                rows={4}
                maxLength={1000}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-brand-lime rounded-xl text-sm text-white placeholder-slate-600 outline-none transition-colors resize-none"
                required
              />
            </div>

            {error && (
              <div className="p-3 bg-red-950/30 border border-red-900/50 rounded-xl text-red-400 text-xs">
                ⚠️ {error}
              </div>
            )}

            {/* Submit */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800/80 mt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors text-xs font-semibold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-5 py-2.5 bg-brand-lime hover:bg-[#b0dc00] disabled:opacity-50 text-black font-semibold rounded-xl transition-all text-xs cursor-pointer shadow-lg shadow-brand-lime/10"
              >
                {isSubmitting ? (
                  <span>Enviando...</span>
                ) : (
                  <>
                    <Send size={12} />
                    <span>Enviar Sugerencia</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
};
