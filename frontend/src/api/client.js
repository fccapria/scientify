export const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

export function getAuthHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Configurazione centralizzata per le chiamate API
export const apiConfig = {
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  }
};

// Helper per gestire errori API
export function handleApiError(error) {
  if (error.response) {
    // Server ha risposto con codice di errore
    const status = error.response.status;
    const message = error.response.data?.detail || error.response.data?.message || 'Errore del server';

    switch (status) {
      case 401:
        localStorage.removeItem('access_token');
        window.location.href = '/';
        throw new Error('Sessione scaduta. Effettua nuovamente il login.');
      case 403:
        throw new Error('Non hai i permessi per questa operazione.');
      case 404:
        throw new Error('Risorsa non trovata.');
      case 422:
        throw new Error('Dati non validi: ' + message);
      default:
        throw new Error(message);
    }
  } else if (error.request) {
    // Nessuna risposta dal server
    throw new Error('Impossibile contattare il server. Verifica la connessione.');
  } else {
    // Errore nella configurazione della richiesta
    throw new Error('Errore di configurazione: ' + error.message);
  }
}
