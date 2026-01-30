import { createContext, type JSX, useContext, useState, useEffect } from 'react';
import { Toaster } from '../components';
import { type Toast } from '../types';

interface ToastContextInterface {
    setToast: (toast: Toast) => void;
}

const ToastContext = createContext<ToastContextInterface>({
    setToast: () => {},
});

type Props = {
    children: JSX.Element;
};

export function ToastProvider({ children }: Props) {
    const [toast, setToast] = useState<Toast>({
        severity: 'success', // Valeur par défaut, peu importe
        message: '',
    });

    // --- AJOUT : Écouteur d'événements global ---
    useEffect(() => {
        const handleGlobalToast = (e: Event) => {
            // On force le type car CustomEvent est générique
            const customEvent = e as CustomEvent<Toast>;
            setToast({
                severity: customEvent.detail.severity,
                message: customEvent.detail.message
            });
        };

        window.addEventListener('show-toast', handleGlobalToast);

        // Nettoyage à la destruction du composant
        return () => {
            window.removeEventListener('show-toast', handleGlobalToast);
        };
    }, []);
    // ---------------------------------------------

    return (
        <ToastContext.Provider value={{ setToast }}>
            {children}
            {/* Le composant Toaster s'affichera dès que 'toast' change */}
            <Toaster toast={toast} />
        </ToastContext.Provider>
    );
}

export const useToastContext = () => useContext(ToastContext);