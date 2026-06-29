import React, { useEffect, useState, useRef } from 'react';
import { Loader2 } from 'lucide-react';

interface PayPalSubscriptionButtonProps {
  planId: string;
  clientId: string;
  onSuccess: (subscriptionId: string) => void;
  onError: (error: string) => void;
  onClearError?: () => void;
}

export const PayPalSubscriptionButton: React.FC<PayPalSubscriptionButtonProps> = ({
  planId,
  clientId,
  onSuccess,
  onError,
  onClearError,
}) => {
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const containerId = `paypal-button-container-${planId}`;
  const buttonRef = useRef<any>(null);

  useEffect(() => {
    // Clear any previous error upon starting initialization
    if (onClearError) {
      onClearError();
    }

    const expectedSrc = `https://www.paypal.com/sdk/js?client-id=${clientId}&vault=true&intent=subscription&namespace=paypal_subscription&disable-funding=card,venmo,paylater`;
    
    // Check if script is already present
    const existingScript = document.getElementById('paypal-sdk-script') as HTMLScriptElement | null;
    
    const initializeButtons = () => {
      setIsScriptLoaded(true);
      setIsInitializing(false);
    };

    if (existingScript) {
      const currentSrc = existingScript.src;
      // If the client ID or source has changed, or if the SDK namespace is missing (failed/stuck state),
      // we remove the stale/failed script and load a new one to prevent getting stuck.
      const isStale = currentSrc !== expectedSrc;
      const isFailedOrNotLoaded = !(window as any).paypal_subscription || !(window as any).paypal_subscription.Buttons;
      
      if (isStale || isFailedOrNotLoaded) {
        existingScript.remove();
        if (isStale) {
          delete (window as any).paypal_subscription;
        }
      } else {
        initializeButtons();
        return;
      }
    }

    // Load PayPal SDK Script with isolated namespace
    const script = document.createElement('script');
    script.id = 'paypal-sdk-script';
    script.src = expectedSrc;
    script.setAttribute('data-sdk-integration-source', 'button-factory');
    script.async = true;

    script.onload = () => {
      // Let's verify if the namespace actually got loaded
      if ((window as any).paypal_subscription && (window as any).paypal_subscription.Buttons) {
        initializeButtons();
      } else {
        setIsInitializing(false);
        onError('El SDK de PayPal cargó pero no inicializó el namespace de suscripciones correctamente. Por favor verifica si tienes extensiones que bloqueen scripts o recarga la página.');
      }
    };

    script.onerror = () => {
      setIsInitializing(false);
      onError('No se pudo cargar el SDK de PayPal. Por favor, verifica tu conexión a Internet o intenta nuevamente.');
    };

    document.body.appendChild(script);

    return () => {
      // Cleanup
    };
  }, [clientId, onError]);

  useEffect(() => {
    if (!isScriptLoaded || !(window as any).paypal_subscription) return;

    let isMounted = true;
    let checkInterval: NodeJS.Timeout;
    let timeoutTimer: NodeJS.Timeout;

    const tryRender = () => {
      if (!isMounted) return false;
      const paypalSub = (window as any).paypal_subscription;
      if (paypalSub && typeof paypalSub.Buttons === 'function') {
        clearInterval(checkInterval);
        clearTimeout(timeoutTimer);

        // Remove any previous buttons from the container before rendering new ones
        const container = document.getElementById(containerId);
        if (container) {
          container.innerHTML = '';
        }

        try {
          buttonRef.current = paypalSub.Buttons({
            style: {
              shape: 'rect',
              color: 'white',
              layout: 'vertical',
              label: 'subscribe',
            },
            createSubscription: (data: any, actions: any) => {
              return actions.subscription.create({
                plan_id: planId,
              });
            },
            onApprove: (data: any, actions: any) => {
              if (data.subscriptionID) {
                onSuccess(data.subscriptionID);
              } else {
                onError('Se aprobó el pago, pero no se recibió el ID de la suscripción de PayPal.');
              }
            },
            onError: (err: any) => {
              console.error('PayPal button error:', err);
              onError('Ocurrió un problema con el portal de PayPal. Por favor intenta otro método o inténtalo más tarde.');
            },
          });

          if (buttonRef.current && document.getElementById(containerId)) {
            buttonRef.current.render(`#${containerId}`);
          }
          return true;
        } catch (err: any) {
          console.error('Error rendering PayPal buttons:', err);
          onError('Error al inicializar la pasarela de PayPal: ' + err.message);
          return true;
        }
      }
      return false;
    };

    // Try rendering immediately
    const rendered = tryRender();
    if (!rendered) {
      // Poll every 150ms for Buttons constructor
      checkInterval = setInterval(() => {
        if (tryRender()) {
          clearInterval(checkInterval);
        }
      }, 150);

      // Only show error after a full 10-second timeout
      timeoutTimer = setTimeout(() => {
        clearInterval(checkInterval);
        const paypalSub = (window as any).paypal_subscription;
        if (isMounted && !(paypalSub && typeof paypalSub.Buttons === 'function')) {
          onError('No se pudieron inicializar los botones de PayPal. Por favor verifica si tienes extensiones que bloqueen scripts o recarga la página.');
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
  }, [isScriptLoaded, planId, containerId, onSuccess, onError]);

  return (
    <div className="space-y-4">
      {isInitializing && (
        <div className="flex flex-col items-center justify-center py-6 space-y-2 bg-slate-50 border border-slate-100 rounded-2xl">
          <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
            Conectando con Pasarela PayPal...
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
