import { createContext, useContext, useState, type ReactNode } from 'react';

import { iniciarSesion, registrar, cerrarSesion } from '@/data/auth';
import type { Usuario } from '@/data/types';

type AuthCtx = {
  usuario: Usuario | null;
  isAuthenticated: boolean;
  login: (correo: string, contrasena: string) => Promise<void>;
  register: (input: { nombre: string; correo: string; contrasena: string; telefono?: string }) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthCtx>({
  usuario: null,
  isAuthenticated: false,
  login: async () => {},
  register: async () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  const login = async (correo: string, contrasena: string) => {
    setUsuario(await iniciarSesion(correo, contrasena));
  };

  const register = async (input: { nombre: string; correo: string; contrasena: string; telefono?: string }) => {
    setUsuario(await registrar(input));
  };

  const logout = () => {
    cerrarSesion();
    setUsuario(null);
  };

  return (
    <AuthContext.Provider value={{ usuario, isAuthenticated: !!usuario, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
