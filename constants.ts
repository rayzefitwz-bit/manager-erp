import { LeadStatus } from "./types";

export const STATUS_LABELS: Record<LeadStatus, string> = {
  NOVO: 'Novo Lead',
  LIGACAO: 'Falei por ligação',
  WHATSAPP: 'Falei pelo whatsapp',
  SEM_RESPOSTA: 'Não me Responde',
  NEGOCIANDO: 'Em negociação',
  SINAL: 'Sinal de Venda',
  GANHO: 'Fechados',
};

export const STATUS_COLORS: Record<LeadStatus, string> = {
  NOVO: 'bg-blue-100 text-blue-800 border-blue-200',
  LIGACAO: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  WHATSAPP: 'bg-green-100 text-green-800 border-green-200',
  SEM_RESPOSTA: 'bg-red-100 text-red-800 border-red-200',
  NEGOCIANDO: 'bg-purple-100 text-purple-800 border-purple-200',
  SINAL: 'bg-amber-100 text-amber-800 border-amber-200',
  GANHO: 'bg-emerald-100 text-emerald-800 border-emerald-200',
};

export const MOCK_TEAM = [
  { id: '1', name: 'Admin User', email: 'admin@school.com', role: 'ADMIN' },
  { id: '2', name: 'João Vendedor', email: 'joao@school.com', role: 'VENDEDOR' },
  { id: '3', name: 'Maria Vendedora', email: 'maria@school.com', role: 'VENDEDOR' },
];
