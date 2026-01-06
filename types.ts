
export type UserRole = 'ADMIN' | 'VENDEDOR' | 'PROFESSOR';

export type LeadStatus = 'NOVO' | 'LIGACAO' | 'WHATSAPP' | 'SEM_RESPOSTA' | 'NEGOCIANDO' | 'GANHO';

export type Modality = 'ONLINE' | 'PRESENCIAL' | null;

export interface Lead {
  id: string;
  name: string;
  phone: string;
  role: string;
  email?: string;
  status: LeadStatus;
  createdAt: string;
  assignedToId?: string;
  saleValue?: number;
  modality?: Modality;
  paymentMethod?: string;
  classLocation?: string;
  lostAt?: string;
  observation?: string;
  commissionPaymentId?: string;
  updatedAt: string;
}

export interface LeadHistoryEntry {
  id: string;
  leadId: string;
  leadName: string;
  oldStatus?: LeadStatus;
  newStatus: LeadStatus;
  observation?: string;
  changedById: string;
  changedByName: string;
  createdAt: string;
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
  role: UserRole;
  password?: string;
  commissionRate?: number; // Valor fixo ou % 
  city?: string; // Para professor
  date?: string; // Para professor
}

export interface CommissionPaymentRecord {
  id: string;
  memberId: string;
  memberName: string;
  amount: number;
  date: string;
  type: 'SELLER' | 'TEACHER';
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

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  category: string;
  price?: number;
  updatedAt: string;
}
