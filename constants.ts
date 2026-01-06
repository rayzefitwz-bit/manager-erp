import { LeadStatus } from "./types";

export const STATUS_LABELS: Record<LeadStatus, string> = {
  NOVO: 'Novo Lead',
  CONTATADO: 'Contatado',
  NEGOCIANDO: 'Negociando',
  GANHO: 'Venda Ganha',
  PERDIDO: 'Perdido',
};

export const STATUS_COLORS: Record<LeadStatus, string> = {
  NOVO: 'bg-blue-100 text-blue-800 border-blue-200',
  CONTATADO: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  NEGOCIANDO: 'bg-purple-100 text-purple-800 border-purple-200',
  GANHO: 'bg-green-100 text-green-800 border-green-200',
  PERDIDO: 'bg-red-100 text-red-800 border-red-200',
};

export const MOCK_TEAM = [
  { id: '1', name: 'Admin User', email: 'admin@school.com', role: 'ADMIN' },
  { id: '2', name: 'João Vendedor', email: 'joao@school.com', role: 'VENDEDOR' },
  { id: '3', name: 'Maria Vendedora', email: 'maria@school.com', role: 'VENDEDOR' },
];
