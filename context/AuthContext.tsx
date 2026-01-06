
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { TeamMember } from '../types';

interface AuthContextType {
  user: TeamMember | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children?: ReactNode }) => {
  const [user, setUser] = useState<TeamMember | null>(() => {
    const saved = localStorage.getItem('auth_user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = (email: string, password: string): boolean => {
    const normalizedEmail = email.toLowerCase().trim();

    // Admin padrão com UUID válido
    if (normalizedEmail === 'admin@imersaoerp.com' && password === '123456') {
      const adminUser: TeamMember = {
        id: '00000000-0000-4000-a000-000000000000',
        name: 'Administrador Principal',
        email: 'admin@imersaoerp.com',
        role: 'ADMIN'
      };
      setUser(adminUser);
      localStorage.setItem('auth_user', JSON.stringify(adminUser));
      return true;
    }

    // Verificar outros membros da equipe no localStorage
    const savedTeam = localStorage.getItem('team');
    if (savedTeam) {
      const team: TeamMember[] = JSON.parse(savedTeam);
      const found = team.find(m => m.email.toLowerCase().trim() === normalizedEmail && m.password === password);
      if (found) {
        setUser(found);
        localStorage.setItem('auth_user', JSON.stringify(found));
        return true;
      }
    }

    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('auth_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
