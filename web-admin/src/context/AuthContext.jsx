import { createContext, useContext, useEffect, useState } from 'react';
import * as store from '../data/store';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [owner, setOwner] = useState(null);
  const [loading, setLoading] = useState(true);

  // Rehidrata la sesión guardada al cargar la página.
  useEffect(() => {
    setOwner(store.getCurrentOwner());
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    const o = await store.loginOwner(credentials);
    setOwner(o);
    return o;
  };

  const register = async (data) => {
    const o = await store.registerOwner(data);
    setOwner(o);
    return o;
  };

  const logout = () => {
    store.logout();
    setOwner(null);
  };

  return (
    <AuthContext.Provider value={{ owner, isAuthenticated: !!owner, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
