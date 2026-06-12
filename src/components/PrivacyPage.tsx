import React from 'react';
import { ArrowLeft, Shield, Lock, Eye, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

interface PrivacyPageProps {
  navigateTo: (path: string) => void;
}

export function PrivacyPage({ navigateTo }: PrivacyPageProps) {
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
              <Shield size={24} />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Canal de Transparencia</span>
              <h1 className="text-3xl md:text-4xl font-serif italic font-bold text-slate-900 mt-0.5">
                Política de Privacidad
              </h1>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 font-mono mb-8">
            ÚLTIMA ACTUALIZACIÓN: 4 DE JUNIO, 2026 • IA XAU KIN INSTITUTIONAL CO.
          </p>

          <div className="space-y-8 text-sm leading-relaxed text-slate-600">
            <section className="space-y-3">
              <h2 className="text-lg font-serif italic font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle2 size={16} className="text-brand-lime" />
                1. Introducción y Compromiso
              </h2>
              <p>
                En <strong>IA XAU KIN</strong> ("nosotros", "nuestro" o "la Plataforma"), valoramos profundamente la privacidad de nuestros operadores y socios. Estamos plenamente comprometidos con la protección de los datos de carácter personal y la transparencia en su tratamiento. 
              </p>
              <p>
                Esta Política de Privacidad describe de manera clara y exhaustiva cómo recopilamos, utilizamos, almacenamos y protegemos la información cuando usted hace uso de nuestra suite de análisis cuantitativo y herramientas automatizadas para el par XAUUSD (Oro).
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-serif italic font-bold text-slate-900 flex items-center gap-2">
                <Eye size={16} className="text-brand-lime" />
                2. Información que Recopilamos
              </h2>
              <p>
                Para proporcionarle acceso al modelado cuantitativo y mantener la seguridad e integridad del ecosistema, recolectamos:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Información de Autenticación:</strong> Datos provistos de forma segura y encriptada mediante protocolos avanzados de control de acceso (incluyendo nombre, correo electrónico y parámetros de perfil opcionales).
                </li>
                <li>
                  <strong>Configuraciones y Claves Personales:</strong> Si decide configurar manualmente su clave de API de Gemini, esta información se retiene localmente en el almacenamiento persistente de su navegador (LocalStorage) y nunca se transmite a nuestros servidores centrales de forma permanente.
                </li>
                <li>
                  <strong>Telemetría de Gráficos:</strong> La información visual y capturas de pantalla de análisis técnicos cargadas voluntariamente a través del portal para su evaluación estratégica por la inteligencia artificial.
                </li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-serif italic font-bold text-slate-900 flex items-center gap-2">
                <Lock size={16} className="text-brand-lime" />
                3. Uso Seguro y Finalidad de los Datos
              </h2>
              <p>
                La información recolectada se procesa bajo el principio de minimización de datos y con las siguientes finalidades explícitas:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Sincronizar y validar el estado de su suscripción de Socio (Retail, Pro o Institucional).</li>
                <li>Alimentar el motor de análisis de IA para identificar patrones estructurales (BOS, CHoCH, Liquidez) en la ventana correspondiente.</li>
                <li>Garantizar los límites de frecuencia de consumo y seguridad técnica para prevenir abusos en la red.</li>
                <li>Brindar asistencia directa e institucional ante cualquier incidencia con sus códigos de activación.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-serif italic font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle2 size={16} className="text-brand-lime" />
                4. Conservación de Datos y Terceros
              </h2>
              <p>
                <strong>IA XAU KIN</strong> no comercializa, transfiere ni distribuye bajo ningún concepto sus datos personales a agencias publicitarias ni a intermediarios externos. Compartimos información estrictamente necesaria con proveedores tecnológicos de primer nivel para brindar el servicio:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Infraestructura Central Segura:</strong> Para el almacenamiento en base de datos cifrada y la gestión hermética de accesos y credenciales de operadores.</li>
                <li><strong>Sistemas Avanzados de Procesamiento:</strong> Para el análisis seguro, en tránsito y totalmente privado, de las imágenes de gráficos técnicos cargadas por los operadores.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-serif italic font-bold text-slate-900 flex items-center gap-2">
                <Lock size={16} className="text-brand-lime" />
                5. Derechos de los Usuarios
              </h2>
              <p>
                Usted posee plenos derechos fundamentales sobre su información. En cualquier momento puede solicitar la rectificación, limitación, portabilidad o el borrado definitivo de su registro y cuenta de nuestro sistema enviándonos una comunicación formal en los canales habilitados para Socios, o contactando con soporte de forma inmediata.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-serif italic font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle2 size={16} className="text-brand-lime" />
                6. Actualizaciones de la Política
              </h2>
              <p>
                Nos reservamos el derecho de modificar esta Política de Privacidad conforme se incorporen nuevas funciones al modelo algorítmico o varíen las disposiciones regulatorias globales. Recomendamos revisar periódicamente esta sección para mantenerse plenamente informado de los resguardos de privacidad vigentes.
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
            <button onClick={() => navigateTo('/terms')} className="hover:text-black">Condiciones del Servicio</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
