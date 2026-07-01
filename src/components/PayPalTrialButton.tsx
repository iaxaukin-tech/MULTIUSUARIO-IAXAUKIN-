import React, { useEffect, useState, useRef } from 'react';
import { Loader2 } from 'lucide-react';

interface PayPalTrialButtonProps {
  onSuccess: (paymentId: string) => void;
  onError: (error: string) => void;
  onClearError?: () => void;
}

export const PayPalTrialButton: React.FC<PayPalTrialButtonProps> = ({
  onSuccess,
  onError,
  onClearError,
}) => {
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const containerId = "paypal-container-T9L2CL2KT2S4A";
  const buttonRef = useRef<any>(null);

  useEffect(() => {
    // Clear any previous error upon starting initialization
    if (onClearError) {
      onClearError();
    }

    const expectedSrc = "https://www.paypal.com/sdk/js?client-id=BAArwClXhD1W1f54pSBziGecpGWCL5V3cpo5dUyZoKHiV4ntwMbFBQ7HIvMzDL3sx9F-GJ-khZW5J4sqsA&components=hosted-buttons&disable-funding=card,venmo,paylater&currency=USD&namespace=paypal_trial";
    
    // Check if script is already present
    const existingScript = document.getElementById('paypal-hosted-trial-script') as HTMLScriptElement | null;
    
    const initializeButtons = () => {
      setIsScriptLoaded(true);
      setIsInitializing(false);
    };

    // Safety timeout to prevent getting stuck in loading state (e.g. if script is blocked by an AdBlocker or connection fails silently)
    const timeoutId = setTimeout(() => {
      const isLoaded = (window as any).paypal_trial && (window as any).paypal_trial.HostedButtons;
      if (!isLoaded) {
        setIsInitializing(false);
        onError('No se pudo establecer conexión con los servidores promocionales de PayPal. Por favor deshabilita AdBlock u otras extensiones de privacidad y recarga la página.');
      }
    }, 6000);

    if (existingScript) {
      const currentSrc = existingScript.src;
      const isStale = currentSrc !== expectedSrc;
      const isFailedOrNotLoaded = !(window as any).paypal_trial || !(window as any).paypal_trial.HostedButtons;
      
      if (isStale || isFailedOrNotLoaded) {
        existingScript.remove();
        if (isStale) {
          delete (window as any).paypal_trial;
        }
      } else {
        clearTimeout(timeoutId);
        initializeButtons();
        return;
      }
    }

    // Load PayPal SDK Script for Hosted Buttons with isolated namespace
    const script = document.createElement('script');
    script.id = 'paypal-hosted-trial-script';
    script.src = expectedSrc;
    script.async = true;

    script.onload = () => {
      clearTimeout(timeoutId);
      if ((window as any).paypal_trial && (window as any).paypal_trial.HostedButtons) {
        initializeButtons();
      } else {
        setIsInitializing(false);
        onError('El portal promocional de PayPal se cargó pero no inicializó correctamente. Por favor recarga la página o desactiva bloqueadores de scripts.');
      }
    };

    script.onerror = () => {
      clearTimeout(timeoutId);
      setIsInitializing(false);
      onError('No se pudo cargar la pasarela de la promoción de PayPal. Por favor, verifica tu conexión a Internet o intenta de nuevo.');
    };

    document.body.appendChild(script);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [onError, onClearError]);

  useEffect(() => {
    if (!isScriptLoaded || !(window as any).paypal_trial) return;

    // Remove any previous buttons from the container before rendering new ones
    const container = document.getElementById(containerId);
    if (container) {
      container.innerHTML = '';
    }

    let isMounted = true;
    let checkInterval: NodeJS.Timeout;
    let timeoutTimer: NodeJS.Timeout;

    const tryRender = () => {
      if (!isMounted) return false;
      const paypalTrial = (window as any).paypal_trial;
      if (paypalTrial && paypalTrial.HostedButtons) {
        clearInterval(checkInterval);
        clearTimeout(timeoutTimer);
        
        // Clear previous error because we are successfully loading the PayPal component
        if (onClearError) {
          onClearError();
        }

        try {
          buttonRef.current = paypalTrial.HostedButtons({
            hostedButtonId: "T9L2CL2KT2S4A",
            onApprove: (data: any) => {
              // Callback when payment/subscription is approved
              const id = data.subscriptionID || data.orderID || data.paymentID || 'TRIAL_PAYMENT';
              onSuccess(id);
            },
            onError: (err: any) => {
              console.error('PayPal trial button error:', err);
              onError('Ocurrió un problema de procesamiento en el portal de PayPal. Intente nuevamente en unos minutos.');
            }
          });

          if (buttonRef.current && document.getElementById(containerId)) {
            buttonRef.current.render(`#${containerId}`);
          }
          return true;
        } catch (err: any) {
          console.error('Error rendering PayPal trial buttons:', err);
          onError('Error al inicializar la pasarela promocional de PayPal: ' + err.message);
          return true;
        }
      }
      return false;
    };

    // Try immediately
    const rendered = tryRender();
    if (!rendered) {
      // Poll every 150ms for HostedButtons constructor
      checkInterval = setInterval(() => {
        if (tryRender()) {
          clearInterval(checkInterval);
        }
      }, 150);

      // Only show error after full 10-second timeout
      timeoutTimer = setTimeout(() => {
        clearInterval(checkInterval);
        const paypalTrial = (window as any).paypal_trial;
        if (isMounted && !(paypalTrial && paypalTrial.HostedButtons)) {
          onError('Las funciones de botones hospedados de PayPal no están disponibles actualmente en tu navegador. Por favor verifica si tienes extensiones que bloqueen scripts.');
        }
      }, 10000);
    }

    return () => {
      isMounted = false;
      clearInterval(checkInterval);
      clearTimeout(timeoutTimer);
      if (buttonRef.current && typeof buttonRef.current.close === 'function') {
        try {
          buttonRef.current.close();
        } catch (e) {
          // ignore
        }
      }
    };
  }, [isScriptLoaded, containerId, onSuccess, onError, onClearError]);

  return (
    <div className="space-y-4">
      {isInitializing && (
        <div className="flex flex-col items-center justify-center py-6 space-y-2 bg-[#CCFF00]/5 border border-[#CCFF00]/10 rounded-2xl">
          <Loader2 className="w-5 h-5 text-slate-700 animate-spin" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-650 font-mono">
            Cargando Promo de Locura...
          </span>
        </div>
      )}
      
      <div 
        id={containerId} 
        className={`w-full transition-opacity duration-300 ${isScriptLoaded ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`} 
      />
    </div>
  );
};
