import { createContext, useContext, useState, useEffect } from "react";
import { API_URL } from "../api/client";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("access_token") || null);
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  // Funzione per recuperare info utente
  const fetchUserInfo = async (authToken) => {
    if (!authToken) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/users/me`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const userData = await response.json();
        setUserInfo(userData);
      } else {
        console.error('Errore nel recupero info utente:', response.status);
      }
    } catch (error) {
      console.error('Errore nel recupero info utente:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      localStorage.setItem("access_token", token);
      fetchUserInfo(token);
    } else {
      localStorage.removeItem("access_token");
      setUserInfo(null);
    }
  }, [token]);

  function logout() {
    setToken(null);
    setUserInfo(null);
  }

  return (
    <AuthContext.Provider value={{
      token,
      setToken,
      logout,
      userInfo,
      setUserInfo,
      loading,
      refetchUserInfo: () => fetchUserInfo(token)
    }}>
    {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
