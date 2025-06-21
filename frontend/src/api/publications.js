import { API_URL, getAuthHeaders } from "./client";

export async function fetchPublications({ queryKey }) {
  const [_key, { search, orderBy, token }] = queryKey;
  let url = `${API_URL}/publications?`;
  if (search) url += `search=${encodeURIComponent(search)}&`;
  if (orderBy) url += `order_by=${orderBy}&`;

  const res = await fetch(url, {
    headers: getAuthHeaders(token),
  });
  if (!res.ok) throw new Error("Errore nel caricamento pubblicazioni");
  return res.json();
}

export async function uploadPublication({ file, token }) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_URL}/publications`, {
    method: "POST",
    headers: getAuthHeaders(token),
                          body: formData,
  });
  if (!res.ok) throw new Error("Errore durante l'upload");
  return res.json();
}

export async function fetchUserPublications({ queryKey }) {
  const [_key, { token, orderBy }] = queryKey;
  let url = `${API_URL}/users/me/publications`;
  if (orderBy) url += `?order_by=${orderBy}`;

  const res = await fetch(url, {
    headers: getAuthHeaders(token),
  });
  if (!res.ok) throw new Error("Errore nel caricamento delle tue pubblicazioni");
  return res.json();
}

// NUOVA: Funzione per eliminare una pubblicazione
export async function deletePublication({ publicationId, token }) {
  const res = await fetch(`${API_URL}/publications/${publicationId}`, {
    method: "DELETE",
    headers: getAuthHeaders(token),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || "Errore durante l'eliminazione della pubblicazione");
  }

  return res.json();
}
