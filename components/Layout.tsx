
import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Menu, X } from 'lucide-react';
import { NotificationBell } from './NotificationBell';
import { clsx } from 'clsx';

export const Layout = ({ children }: { children?: React.ReactNode }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 w-full bg-white border-b z-20 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-gray-600">
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
          <h1 className="text-xl font-bold text-blue-700">Imersão<span className="text-gray-800">ERP</span></h1>
        </div>
        <NotificationBell />
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-white z-30 pt-16 px-4 md:hidden">
          <nav className="space-y-4">
            {/* Simplified mobile nav, ideally reuse Sidebar links */}
            <a href="#/" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 text-lg font-medium text-gray-700">Dashboard</a>
            <a href="#/crm" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 text-lg font-medium text-gray-700">CRM & Leads</a>
            <a href="#/financeiro" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 text-lg font-medium text-gray-700">Financeiro</a>
            <a href="#/comissoes" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 text-lg font-medium text-gray-700">Comissões</a>
            <a href="#/turmas" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 text-lg font-medium text-gray-700">Turmas Ativas</a>
            <a href="#/historico" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 text-lg font-medium text-gray-700">Histórico de Leads</a>
            <a href="#/equipe" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 text-lg font-medium text-gray-700">Equipe</a>
            <a href="#/fornecedores" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 text-lg font-medium text-gray-700">Fornecedores</a>
          </nav>
        </div>
      )}

      <main className={clsx(
        "flex-1 p-4 md:p-8 overflow-x-hidden transition-all duration-300",
        "md:ml-64", // Offset for sidebar on desktop
        "mt-14 md:mt-0" // Offset for mobile header
      )}>
        {/* Desktop Top Right Actions */}
        <div className="hidden md:flex justify-end mb-4">
          <NotificationBell />
        </div>
        {children}
      </main>
    </div>
  );
};