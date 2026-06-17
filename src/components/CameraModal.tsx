import React, { useEffect, useRef, useState } from 'react';
import { Camera, X, RefreshCw, AlertCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (base64Image: string) => void;
  title?: string;
}

export const CameraModal: React.FC<CameraModalProps> = ({
  isOpen,
  onClose,
  onCapture,
  title = "Escáner de Cámara Profesional"
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode]);

  const startCamera = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    
    // Stop any existing stream first
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };
      
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        // Wait till metadata loads before playing
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch(err => {
            console.error("Error playing video:", err);
          });
        };
      }
    } catch (err: any) {
      console.error("Camera access error:", err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setErrorMsg("Acceso denegado. Por favor, concede permisos de cámara en tu navegador para continuar.");
      } else if (err.name === 'OverconstrainedError') {
        // Fallback for camera constraints
        try {
          const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
          setStream(fallbackStream);
          if (videoRef.current) {
            videoRef.current.srcObject = fallbackStream;
            videoRef.current.onloadedmetadata = () => {
              videoRef.current?.play().catch(e => console.error("Error playing fallback video:", e));
            };
          }
        } catch (fbErr) {
          setErrorMsg("No se pudo iniciar la cámara en este dispositivo.");
        }
      } else {
        setErrorMsg("No se pudo acceder a la cámara. Asegúrate de que no esté siendo utilizada por otra aplicación.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => {
        track.stop();
        console.log(`Track ${track.label} stopped.`);
      });
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const handleSwitchCamera = () => {
    setFacingMode(prev => (prev === 'environment' ? 'user' : 'environment'));
  };

  const handleCapture = () => {
    if (!videoRef.current || !stream) return;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    
    // Match actual video stream size
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Handle mirroring for the user-facing camera 
      if (facingMode === 'user') {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      }
      
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const base64 = canvas.toDataURL('image/jpeg', 0.85);
      
      onCapture(base64);
      stopCamera();
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div id="camera-modal-container" className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-slate-950/80 backdrop-blur-md">
          <motion.div
            id="camera-modal-card"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
              <div className="flex items-center gap-2">
                <Camera className="text-brand-lime animate-pulse" size={16} />
                <span className="text-[10px] font-mono font-bold tracking-widest text-[#CCFF00] uppercase">
                  {title}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  stopCamera();
                  onClose();
                }}
                className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>

            {/* Viewport Stage */}
            <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
              {isLoading && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center space-y-2 bg-slate-950 text-slate-400">
                  <Loader2 className="w-8 h-8 text-[#CCFF00] animate-spin" />
                  <span className="text-[9px] uppercase tracking-wider font-mono font-bold">Iniciando protocolo de cámara...</span>
                </div>
              )}

              {errorMsg ? (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center p-6 bg-slate-950 space-y-4">
                  <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500">
                    <AlertCircle size={22} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-200 uppercase font-mono">Error de Acceso</p>
                    <p className="text-[10px] text-slate-400 max-w-xs leading-relaxed">{errorMsg}</p>
                  </div>
                  <button
                    type="button"
                    onClick={startCamera}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-[9px] font-bold text-white uppercase tracking-widest rounded-xl transition font-mono border border-slate-700"
                  >
                    Reintentar Conexión
                  </button>
                </div>
              ) : (
                <>
                  <video
                    ref={videoRef}
                    playsInline
                    muted
                    className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
                  />
                  
                  {/* Camera overlay corners design */}
                  <div className="absolute inset-4 pointer-events-none border border-white/5 rounded-2xl">
                    <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#CCFF00]" />
                    <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#CCFF00]" />
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#CCFF00]" />
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#CCFF00]" />
                    
                    {/* Futuristic scanner focal overlay */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-24 h-24 rounded-full border border-white/10 flex items-center justify-center animate-[pulse_3s_infinite]" />
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Footer controls */}
            <div className="p-6 bg-slate-950/70 border-t border-slate-800 flex flex-col items-center gap-4">
              <p className="text-[8px] text-slate-400 font-mono uppercase tracking-[0.15em] text-center">
                {facingMode === 'environment' ? "Cámara Trasera (Recomendada para documentos/comprobantes)" : "Cámara Frontal activa"}
              </p>
              
              <div className="flex items-center justify-center w-full gap-8 relative">
                {/* Secondary: Switch Camera */}
                <button
                  type="button"
                  onClick={handleSwitchCamera}
                  disabled={isLoading || !!errorMsg}
                  className="w-10 h-10 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700/50 flex items-center justify-center text-slate-300 hover:text-white transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  title="Cambiar Cámara"
                >
                  <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
                </button>

                {/* Primary: Physical Capture Button */}
                <div className="relative flex items-center justify-center">
                  <div className="absolute -inset-2.5 rounded-full border border-[#CCFF00]/20 animate-ping duration-1000 opacity-40 pointer-events-none" />
                  <button
                    type="button"
                    onClick={handleCapture}
                    disabled={isLoading || !!errorMsg}
                    className="w-14 h-14 rounded-full bg-white hover:bg-brand-lime transition duration-300 flex items-center justify-center outline-none shadow-lg shadow-black/40 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer group"
                  >
                    <div className="w-11 h-11 rounded-full border-2 border-slate-950 bg-slate-950 flex items-center justify-center group-hover:bg-brand-lime group-hover:border-brand-lime transition duration-200">
                      <Camera size={20} className="text-white group-hover:text-black transition" />
                    </div>
                  </button>
                </div>

                {/* Balance space */}
                <div className="w-10" />
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
