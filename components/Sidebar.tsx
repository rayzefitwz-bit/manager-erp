
import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, DollarSign, Award, GraduationCap, UserCog, BookOpen, BarChart3, LogOut, UserX } from 'lucide-react';
import { clsx } from 'clsx';
import { useAuth } from '../context/AuthContext';

const NavItem = ({ to, icon: Icon, label }: { to: string; icon: React.ElementType; label: string }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      clsx(
        'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium',
        isActive
          ? 'bg-blue-600 text-white shadow-md'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      )
    }
  >
    <Icon className="w-5 h-5" />
    <span>{label}</span>
  </NavLink>
);

export const Sidebar = () => {
  const { user, logout } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  return (
    <aside className="w-64 bg-white h-screen border-r border-gray-200 flex flex-col fixed left-0 top-0 z-10 hidden md:flex">
      <div className="p-6 border-b border-gray-100">
        <h1 className="text-2xl font-bold text-blue-700">Imersão<span className="text-gray-800">ERP</span></h1>
        <p className="text-xs text-gray-400 mt-1">Gestão de Escola</p>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {isAdmin && <NavItem to="/" icon={LayoutDashboard} label="Dashboard" />}
        <NavItem to="/crm" icon={Users} label="CRM & Leads" />
        {isAdmin && <NavItem to="/leads-perdidos" icon={UserX} label="Leads Perdidos" />}
        {isAdmin && <NavItem to="/analise" icon={BarChart3} label="Análise Comercial" />}
        <NavItem to="/conhecimento" icon={BookOpen} label="Conhecimento" />
        {isAdmin && <NavItem to="/financeiro" icon={DollarSign} label="Financeiro" />}
        <NavItem to="/comissoes" icon={Award} label="Comissões" />
        <NavItem to="/turmas" icon={GraduationCap} label="Turmas Ativas" />
        {isAdmin && <NavItem to="/equipe" icon={UserCog} label="Equipe" />}
      </nav>

      <div className="p-4 border-t border-gray-100 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold uppercase">
            {user?.name.substring(0, 2)}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-semibold text-gray-800 truncate">{user?.name}</p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sair do Sistema
        </button>
      </div>
    </aside>
  );
};
