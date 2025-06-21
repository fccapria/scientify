import { API_URL } from "./client";

export async function login({ email, password }) {
  const res = await fetch(`${API_URL}/auth/jwt/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ username: email, password }),
  });
  if (!res.ok) throw new Error("Credenziali non valide");
  const data = await res.json();
  localStorage.setItem("access_token", data.access_token);
  return data.access_token;
}

export async function register({ email, password, first_name, last_name }) {
  const payload = {
    email,
    password,
    is_active: true,
    is_superuser: false,
    is_verified: false
  };

  // Aggiungi nome e cognome solo se forniti
  if (first_name) payload.first_name = first_name;
  if (last_name) payload.last_name = last_name;

  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorData = await res.json();
    if (res.status === 400) {
      throw new Error("Email già registrata o password non valida");
    }
    throw new Error(errorData.detail || "Errore durante la registrazione");
  }

  const data = await res.json();
  return data;
}

export async function logout() {
  localStorage.removeItem("access_token");
  return true;
}

// Funzione per aggiornare il profilo utente
export async function updateUserProfile({ first_name, last_name, token }) {
  const res = await fetch(`${API_URL}/users/me`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ first_name, last_name }),
  });

  if (!res.ok) {
    throw new Error("Errore nell'aggiornamento del profilo");
  }

  return res.json();
}
