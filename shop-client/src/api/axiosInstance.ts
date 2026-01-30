import axios from 'axios';

export const api = axios.create({
    baseURL: import.meta.env.VITE_API,
});

// Intercepteur de réponse
api.interceptors.response.use(
    (response) => response,
    (error) => {
        let message = "Une erreur inattendue est survenue";

        // Si le backend renvoie une erreur gérée
        if (error.response && error.response.data) {
            message = typeof error.response.data === 'string'
                ? error.response.data
                : JSON.stringify(error.response.data);
        } else if (error.message) {
            message = error.message;
        }
        const event = new CustomEvent('show-toast', {
            detail: {
                severity: 'error',
                message: message
            }
        });
        window.dispatchEvent(event);

        return Promise.reject(error);
    }
);