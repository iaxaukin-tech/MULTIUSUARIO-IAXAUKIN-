import React, { useEffect, useState, useRef } from 'react';
import { Loader2 } from 'lucide-react';

interface PayPalSubscriptionButtonProps {
  planId: string;
  clientId: string;
  onSuccess: (subscriptionId: string) => void;
  onError: (error: string) => void;
}

export const PayPalSubscriptionButton: React.FC<PayPalSubscriptionButtonProps> = ({
  planId,
  clientId,
  onSuccess,
  onError,
}) => {
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const containerId = `paypal-button-container-${planId}`;
  const buttonRef = useRef<any>(null);

  useEffect(() => {
    // Check if script is already present
    const existingScript = document.getElementById('paypal-sdk-script');
    
    const initializeButtons = () => {
      setIsScriptLoaded(true);
      setIsInitializing(false);
    };

    if (existingScript) {
      if ((window as any).paypal) {
        initializeButtons();
      } else {
        existingScript.addEventListener('load', initializeButtons);
      }
      return;
    }

    // Load PayPal SDK Script
    const script = document.createElement('script');
    script.id = 'paypal-sdk-script';
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&vault=true&intent=subscription`;
    script.setAttribute('data-sdk-integration-source', 'button-factory');
    script.async = true;

    script.onload = () => {
      initializeButtons();
    };

    script.onerror = () => {
      setIsInitializing(false);
      onError('No se pudo cargar el SDK de PayPal. Por favor, verifica tu conexión a Internet o intenta nuevamente.');
    };

    document.body.appendChild(script);

    return () => {
      script.removeEventListener('load', initializeButtons);
    };
  }, [clientId, onError]);

  useEffect(() => {
    if (!isScriptLoaded || !(window as any).paypal) return;

    // Remove any previous buttons from the container before rendering new ones
    const container = document.getElementById(containerId);
    if (container) {
      container.innerHTML = '';
    }

    try {
      buttonRef.current = (window as any).paypal.Buttons({
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
    } catch (err: any) {
      console.error('Error rendering PayPal buttons:', err);
      onError('Error al inicializar la pasarela de PayPal: ' + err.message);
    }

    return () => {
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
