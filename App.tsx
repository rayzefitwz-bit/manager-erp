
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { CRM } from './pages/CRM';
import { Finance } from './pages/Finance';
import { Commissions } from './pages/Commissions';
import { Classes } from './pages/Classes';
import { Team } from './pages/Team';
import { KnowledgeBase } from './pages/KnowledgeBase';
import { SalesAnalysis } from './pages/SalesAnalysis';
import { Login } from './pages/Login';

const ProtectedRoutes = () => {
  const { isAuthenticated, user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Layout>
      <Routes>
        {/* Vendedores são redirecionados para o CRM se tentarem acessar a raiz */}
        <Route path="/" element={isAdmin ? <Dashboard /> : <Navigate to="/crm" replace />} />
        
        <Route path="/crm" element={<CRM />} />
        
        {/* Rotas restritas apenas para ADMIN */}
        <Route path="/analise" element={isAdmin ? <SalesAnalysis /> : <Navigate to="/crm" replace />} />
        <Route path="/financeiro" element={isAdmin ? <Finance /> : <Navigate to="/crm" replace />} />
        <Route path="/equipe" element={isAdmin ? <Team /> : <Navigate to="/crm" replace />} />
        
        {/* Rotas abertas para Vendedor e Admin */}
        <Route path="/conhecimento" element={<KnowledgeBase />} />
        <Route path="/comissoes" element={<Commissions />} />
        <Route path="/turmas" element={<Classes />} />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
};

const LoginRoute = () => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/" replace /> : <Login />;
};

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <HashRouter>
          <Routes>
            <Route path="/login" element={<LoginRoute />} />
            <Route path="/*" element={<ProtectedRoutes />} />
          </Routes>
        </HashRouter>
      </AppProvider>
    </AuthProvider>
  );
}

export default App;
