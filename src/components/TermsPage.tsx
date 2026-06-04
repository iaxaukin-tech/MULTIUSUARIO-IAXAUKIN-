import React from 'react';
import { ArrowLeft, FileText, Landmark, Scale, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

interface TermsPageProps {
  navigateTo: (path: string) => void;
}

export function TermsPage({ navigateTo }: TermsPageProps) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-between selection:bg-brand-lime selection:text-brand-navy">
      {/* Upper Navigation Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 h-20 flex items-center justify-between">
          <button 
            onClick={() => navigateTo('/')}
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-black transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} /> Volver al Inicio
          </button>
          
          <div className="flex items-center gap-2">
            <img 
              src="https://i.ibb.co/ZDmC99g/BLANCO-removebg-preview.png" 
              alt="IA XAU KIN" 
              className="h-8 w-auto invert opacity-80"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-grow max-w-3xl mx-auto px-6 py-12">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-[2rem] border border-slate-200/60 p-8 md:p-12 shadow-premium"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-brand-lime/10 rounded-2xl flex items-center justify-center text-brand-navy">
              <FileText size={24} />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Marco Legal de Operación</span>
              <h1 className="text-3xl md:text-4xl font-serif italic font-bold text-slate-900 mt-0.5">
                Condiciones del Servicio
              </h1>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 font-mono mb-8">
            ÚLTIMA REVISIÓN: 4 DE JUNIO, 2026 • IA XAU KIN SYSTEMS
          </p>

          <div className="space-y-8 text-sm leading-relaxed text-slate-600">
            <section className="space-y-3">
              <h2 className="text-lg font-serif italic font-bold text-slate-900 flex items-center gap-2">
                <Scale size={16} className="text-brand-lime" />
                1. Aceptación de los Términos
              </h2>
              <p>
                Al acceder, registrarse o utilizar el software, la suite analítica, y las interfaces operativas de <strong>IA XAU KIN</strong> (en adelante, "los Servicios"), usted declara su conformidad inequívoca y voluntaria con los presentes Términos y Condiciones de Servicio. 
              </p>
              <p>
                Si usted no está de acuerdo con alguno de los preceptos estipulados en este acuerdo, le instamos a suspender de inmediato el uso del sistema y cancelar su acceso.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-serif italic font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle size={16} className="text-amber-500" />
                2. Descargo de Responsabilidad Financiera
              </h2>
              <div className="bg-amber-500/5 border-l-4 border-amber-500 p-4 rounded-r-xl space-y-2 my-2">
                <p className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                  ⚠️ ADVERTENCIA DE ALTO RIESGO EN MERCADOS FINANCIEROS (APALANCAMIENTO)
                </p>
                <p className="text-xs text-slate-700">
                  La operativa con derivados y contratos financieros de gran volatilidad, incluyendo pero no limitado al Oro (XAUUSD), conlleva un riesgo absoluto que puede derivar en pérdidas totales del capital depositado. 
                </p>
                <p className="text-xs text-slate-700">
                  <strong>IA XAU KIN</strong> no es una firma de asesoría financiera registrada ni un gestor de fondos regulado. El software actúa estrictamente como una herramienta analítica sustentada en inteligencia artificial para modelamiento estructural y cuantitativo, ofreciendo datos de soporte estadístico. Cualquier toma de decisión operativa en cuentas reales recae enteramente bajo su criterio, autonomía y exclusiva responsabilidad de riesgo.
                </p>
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-serif italic font-bold text-slate-900 flex items-center gap-2">
                <Landmark size={16} className="text-brand-lime" />
                3. Naturaleza del Servicio y Licencia de Uso
              </h2>
              <p>
                Le otorgamos una licencia exclusiva, de carácter intransferible, personal y temporal para utilizar el portal de análisis conforme a su nivel de suscripción contratado (Retail, Pro o Institucional):
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>El uso por parte de los operadores está estrictamente limitado a la evaluación individual.</li>
                <li>Queda estrictamente prohibida la copia, reventa heurística, ingeniería inversa de los parámetros algorítmicos o redistribución masiva de los reportes en canales públicos sin la debida aprobación corporativa por escrito.</li>
                <li>Los códigos de cupón y tokens de acceso son exclusivos del operador registrado y su uso fraudulento resultará en la suspensión irrecuperable de la cuenta.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-serif italic font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle2 size={16} className="text-brand-lime" />
                4. Uso Correcto y Reglas de Conducta
              </h2>
              <p>
                Los usuarios se comprometen a abstenerse de interactuar con el sistema con fines perjudiciales o abusivos. Está prohibido:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Efectuar ataques de inundación o denegación de servicios dirigidos a saturar las llamadas de análisis e infraestructura de la API.</li>
                <li>Cargar archivos maliciosos, ejecutables u otros elementos visuales que no se correspondan enteramente con capturas de gráficos financieros legítimos.</li>
                <li>Manipular firmas del token de sesión para ganar accesos de administrador u otros privilegios indebidos en la base de datos de Firestore.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-serif italic font-bold text-slate-900 flex items-center gap-2">
                <Scale size={16} className="text-brand-lime" />
                5. Limitación de Responsabilidad y Garantías
              </h2>
              <p>
                La Plataforma proporciona sus servicios bajo la fórmula "tal cual" (as is) y "según disponibilidad". No ofrecemos garantías absolutas de continuidad ininterrumpida frente a posibles caídas en servidores subordinados, fallas de la API externa del modelo Gemini o inconsistencias puntuales del feed visual debido al retardo del proveedor de mercado.
              </p>
              <p>
                Bajo ninguna circunstancia legal, <strong>IA XAU KIN</strong> responderá por lucro cesante, pérdidas monetarias operativas o detrimento patrimonial derivado del uso o la imposibilidad de uso de su plataforma.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-serif italic font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle2 size={16} className="text-brand-lime" />
                6. Jurisdicción y Resolución de Conflictos
              </h2>
              <p>
                Estos Términos de Servicio se interpretarán y regirán de conformidad con las leyes vigentes aplicables en materia de comercio tecnológico digital y propiedad intelectual. Cualquier controversia, desacuerdo o reclamación legal que surja en relación con este sitio se someterá de forma prioritaria a un mecanismo de mediación privada cordial.
              </p>
            </section>
          </div>
        </motion.div>
      </main>

      {/* Footer static overlay */}
      <footer className="bg-white border-t border-slate-200 py-8 text-center text-xs text-slate-400">
        <div className="max-w-4xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 IA XAU KIN • Terminal de Análisis Institucional</p>
          <div className="flex gap-4 font-bold uppercase tracking-wider text-[10px]">
            <button onClick={() => navigateTo('/')} className="hover:text-black">Inicio</button>
            <span>•</span>
            <button onClick={() => navigateTo('/privacy')} className="hover:text-black">Política de Privacidad</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
