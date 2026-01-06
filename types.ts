
export type LeadStatus = 'NOVO' | 'CONTATADO' | 'NEGOCIANDO' | 'GANHO' | 'PERDIDO';

export type Modality = 'ONLINE' | 'PRESENCIAL' | null;

export interface Lead {
  id: string;
  name: string;
  phone: string;
  role: string;
  status: LeadStatus;
  createdAt: string;
  assignedToId?: string;
  saleValue?: number;
  modality?: Modality;
  paymentMethod?: string;
  classLocation?: string;
  lostAt?: string;
}

export interface Transaction {
  id: string;
  type: 'INCOME' | 'EXPENSE';
  description: string;
  amount: number;
  date: string;
  category?: string;
  classLocation?: string; // Turma associada ao lançamento (especialmente para leads)
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  password?: string;
}

export interface SaleRecord {
  leadId: string;
  sellerId: string;
  amount: number;
  date: string;
}

export interface CommissionReport {
  sellerId: string;
  sellerName: string;
  totalSalesCount: number;
  totalSalesVolume: number;
  commissionRate: number;
  commissionValue: number;
}

export interface KnowledgeItem {
  id: string;
  title: string;
  content: string;
  type: 'SCRIPT' | 'DOCUMENTO';
  category?: string;
  link?: string;
  syncUrl?: string; // Novo: URL de sincronização direta (Docs/Sheets)
  updatedAt: string;
}

export interface ImmersiveClass {
  id: string;
  city: string;
  date: string;
  immersion: string;
}
