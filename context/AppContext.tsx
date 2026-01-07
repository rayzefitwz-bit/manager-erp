
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Lead, Transaction, TeamMember, LeadStatus, SaleRecord, Modality, KnowledgeItem, ImmersiveClass, LeadHistoryEntry, CommissionPaymentRecord, Supplier } from '../types';
import { MOCK_TEAM } from '../constants';
import { supabase } from '../supabase';

interface SyncConfig {
  url: string;
  sellerId?: string;
  assignmentType: 'SINGLE' | 'EQUAL' | 'NONE';
}

interface AppContextType {
  leads: Lead[];
  transactions: Transaction[];
  team: TeamMember[];
  knowledgeItems: KnowledgeItem[];
  immersiveClasses: ImmersiveClass[];
  leadHistory: LeadHistoryEntry[];
  commissionPayments: CommissionPaymentRecord[];
  suppliers: Supplier[];
  suppliersSyncUrl: string | null;
  lastSyncConfig: SyncConfig | null;
  isLoading: boolean;
  addLead: (lead: Omit<Lead, 'id' | 'createdAt' | 'status' | 'updatedAt'>) => void;
  updateLeadStatus: (leadId: string, status: LeadStatus, saleData?: { value: number; modality: Modality; paymentMethod: string; sellerId: string; classLocation: string; hasDownPayment?: boolean; downPaymentValue?: number; remainingBalance?: number }, observation?: string, changedBy?: { id: string; name: string }) => void;
  reassignLeads: (leadIds: string[], sellerId: string) => void;
  importLeads: (leadsData: Array<{ name: string; phone: string; role?: string; classLocation?: string; createdAt?: string }>, totalImportCost: number, assignmentConfig?: { type: 'SINGLE' | 'EQUAL', sellerId?: string }, sheetsUrl?: string, investmentClassLocation?: string) => void;
  deleteLeads: (leadIds: string[]) => void;
  clearLeads: () => void;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  payCommission: (memberId: string, amount: number, type: 'SELLER' | 'TEACHER', memberName: string) => Promise<void>;
  addSupplier: (supplier: Omit<Supplier, 'id' | 'updatedAt'>) => void;
  removeSupplier: (id: string) => void;
  syncSuppliers: (url: string) => Promise<void>;
  addTeamMember: (member: Omit<TeamMember, 'id'>) => void;
  removeTeamMember: (id: string) => void;
  getSalesBySeller: (sellerId: string) => Lead[];
  addKnowledgeItem: (item: Omit<KnowledgeItem, 'id' | 'updatedAt'>) => void;
  removeKnowledgeItem: (id: string) => void;
  syncKnowledgeItem: (id: string) => Promise<void>;
  addClass: (cls: Omit<ImmersiveClass, 'id'>) => void;
  updateClass: (id: string, cls: Omit<ImmersiveClass, 'id'>) => void;
  removeClass: (id: string) => void;
  settleDownPayment: (leadId: string, amount: number, paymentMethod: string, observation?: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const DEFAULT_CLASSES: ImmersiveClass[] = [
  { id: '11111111-1111-4111-a111-111111111111', city: 'Manaus', date: '20, 21 e 22 de Fevereiro', immersion: 'Google Ads + IA' },
  { id: '22222222-2222-4222-a222-222222222222', city: 'Curitiba', date: '27, 28 e 1 de Março', immersion: 'Google Ads + IA' },
  { id: '33333333-3333-4333-a333-333333333333', city: 'Florianopolis', date: '27, 28 e 1 de Março', immersion: 'Google Ads + IA' },
  { id: '44444444-4444-4444-a444-444444444444', city: 'Online', date: 'Ao Vivo', immersion: 'Google Ads + IA' }
];

export const AppProvider = ({ children }: { children?: ReactNode }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [team, setTeam] = useState<TeamMember[]>(MOCK_TEAM as TeamMember[]);
  const [immersiveClasses, setImmersiveClasses] = useState<ImmersiveClass[]>(DEFAULT_CLASSES);
  const [knowledgeItems, setKnowledgeItems] = useState<KnowledgeItem[]>([]);
  const [leadHistory, setLeadHistory] = useState<LeadHistoryEntry[]>([]);
  const [commissionPayments, setCommissionPayments] = useState<CommissionPaymentRecord[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [suppliersSyncUrl, setSuppliersSyncUrl] = useState<string | null>(null);
  const [lastSyncConfig, setLastSyncConfig] = useState<SyncConfig | null>(null);

  // Initial Data Load
  useEffect(() => {
    const initData = async () => {
      setIsLoading(true);
      try {
        const { data: dbLeads } = await supabase.from('leads').select('*');
        const { data: dbTransactions } = await supabase.from('transactions').select('*');
        const { data: dbTeam } = await supabase.from('team').select('*');
        const { data: dbClasses } = await supabase.from('immersive_classes').select('*');
        const { data: dbKnowledge } = await supabase.from('knowledge_items').select('*');
        const { data: dbHistory } = await supabase.from('lead_history').select('*');

        if (dbLeads) setLeads(dbLeads);
        else {
          const saved = localStorage.getItem('leads');
          if (saved) setLeads(JSON.parse(saved));
        }

        if (dbTransactions) setTransactions(dbTransactions);
        else {
          const saved = localStorage.getItem('transactions');
          if (saved) setTransactions(JSON.parse(saved));
        }

        if (dbTeam && dbTeam.length > 0) setTeam(dbTeam);
        else {
          const saved = localStorage.getItem('team');
          if (saved) setTeam(JSON.parse(saved));
        }

        if (dbClasses && dbClasses.length > 0) setImmersiveClasses(dbClasses);
        else {
          const saved = localStorage.getItem('immersiveClasses');
          if (saved) setImmersiveClasses(JSON.parse(saved));
        }

        if (dbKnowledge) setKnowledgeItems(dbKnowledge);
        else {
          const saved = localStorage.getItem('knowledgeItems');
          if (saved) setKnowledgeItems(JSON.parse(saved));
        }

        if (dbHistory) setLeadHistory(dbHistory);
        else {
          const saved = localStorage.getItem('leadHistory');
          if (saved) setLeadHistory(JSON.parse(saved));
        }

        const { data: dbCommPayments } = await supabase.from('commission_payments').select('*');
        if (dbCommPayments) setCommissionPayments(dbCommPayments);
        else {
          const saved = localStorage.getItem('commissionPayments');
          if (saved) setCommissionPayments(JSON.parse(saved));
        }

        const { data: dbSuppliers } = await supabase.from('suppliers').select('*');
        if (dbSuppliers) setSuppliers(dbSuppliers);
        else {
          const saved = localStorage.getItem('suppliers');
          if (saved) setSuppliers(JSON.parse(saved));
        }

        const savedSuppliersUrl = localStorage.getItem('suppliersSyncUrl');
        if (savedSuppliersUrl) setSuppliersSyncUrl(savedSuppliersUrl);

        const savedSync = localStorage.getItem('lastSyncConfig');
        if (savedSync) setLastSyncConfig(JSON.parse(savedSync));

      } catch (error) {
        console.error("Erro ao sincronizar com Supabase:", error);
        const savedLeads = localStorage.getItem('leads');
        if (savedLeads) setLeads(JSON.parse(savedLeads));
      } finally {
        setIsLoading(false);
      }
    };

    initData();

    // Realtime Subscriptions
    const leadsSubscription = supabase
      .channel('public:leads')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setLeads(prev => [payload.new as Lead, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          setLeads(prev => prev.map(l => l.id === payload.new.id ? payload.new as Lead : l));
        } else if (payload.eventType === 'DELETE') {
          setLeads(prev => prev.filter(l => l.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(leadsSubscription);
    };
  }, []);

  // --- Sistema de Realocação Automática (72h) ---
  useEffect(() => {
    const checkLeadsForReallocation = async () => {
      const now = new Date();
      const reallocationThreshold = 72 * 60 * 60 * 1000; // 72 Horas em ms

      const sellers = team.filter(m => m.role === 'VENDEDOR');
      if (sellers.length < 2) return; // Precisa de pelo menos 2 vendedores para rodar a fila

      const leadsToReassign = leads.filter(lead => {
        if (lead.status === 'GANHO' || !lead.assignedToId) return false;

        const lastUpdate = new Date(lead.updatedAt || lead.createdAt);
        const diff = now.getTime() - lastUpdate.getTime();

        return diff > reallocationThreshold;
      });

      if (leadsToReassign.length === 0) return;

      console.log(`Sistema: Realocando ${leadsToReassign.length} leads por inatividade.`);

      const updatedLeads = leads.map(lead => {
        const toReassign = leadsToReassign.find(l => l.id === lead.id);
        if (toReassign) {
          // Lógica de Rotação Simples: Encontrar o próximo vendedor na lista
          const currentIndex = sellers.findIndex(s => s.id === lead.assignedToId);
          const nextSeller = sellers[(currentIndex + 1) % sellers.length];

          return {
            ...lead,
            assignedToId: nextSeller.id,
            updatedAt: now.toISOString(),
            observation: (lead.observation || '') + `\n[Sistema] Realocado automaticamente por inatividade (>72h). Antigo: ${sellers[currentIndex]?.name}`
          };
        }
        return lead;
      });

      setLeads(updatedLeads);

      // Update DB batch (idealmente um hook de sincronização)
      for (const lead of leadsToReassign) {
        const currentIndex = sellers.findIndex(s => s.id === lead.assignedToId);
        const nextSeller = sellers[(currentIndex + 1) % sellers.length];

        await supabase.from('leads').update({
          assignedToId: nextSeller.id,
          updatedAt: now.toISOString(),
          observation: (lead.observation || '') + `\n[Sistema] Realocado automaticamente por inatividade (>72h).`
        }).eq('id', lead.id);
      }
    };

    // Rodar a cada 1 hora
    const interval = setInterval(checkLeadsForReallocation, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [leads, team]);

  useEffect(() => { localStorage.setItem('leads', JSON.stringify(leads)); }, [leads]);
  useEffect(() => { localStorage.setItem('transactions', JSON.stringify(transactions)); }, [transactions]);
  useEffect(() => { localStorage.setItem('team', JSON.stringify(team)); }, [team]);
  useEffect(() => { localStorage.setItem('immersiveClasses', JSON.stringify(immersiveClasses)); }, [immersiveClasses]);
  useEffect(() => { localStorage.setItem('knowledgeItems', JSON.stringify(knowledgeItems)); }, [knowledgeItems]);
  useEffect(() => { localStorage.setItem('leadHistory', JSON.stringify(leadHistory)); }, [leadHistory]);
  useEffect(() => { localStorage.setItem('commissionPayments', JSON.stringify(commissionPayments)); }, [commissionPayments]);
  useEffect(() => { localStorage.setItem('suppliers', JSON.stringify(suppliers)); }, [suppliers]);
  useEffect(() => { if (suppliersSyncUrl) localStorage.setItem('suppliersSyncUrl', suppliersSyncUrl); }, [suppliersSyncUrl]);
  useEffect(() => { if (lastSyncConfig) localStorage.setItem('lastSyncConfig', JSON.stringify(lastSyncConfig)); }, [lastSyncConfig]);

  const addLead = async (leadData: Omit<Lead, 'id' | 'createdAt' | 'status' | 'updatedAt'>) => {
    const newLead: Lead = {
      ...leadData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'NOVO',
    };
    setLeads((prev) => [newLead, ...prev]);
    await supabase.from('leads').insert(newLead);
  };

  const addTransaction = async (transactionData: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...transactionData,
      id: crypto.randomUUID(),
    };
    setTransactions((prev) => [newTransaction, ...prev]);
    await supabase.from('transactions').insert(newTransaction);
  };

  const updateLeadStatus = async (leadId: string, status: LeadStatus, saleData?: { value: number; modality: Modality; paymentMethod: string; sellerId: string; classLocation: string; hasDownPayment?: boolean; downPaymentValue?: number; remainingBalance?: number }, observation?: string, changedBy?: { id: string; name: string }) => {
    let updatedLeadFinal: Lead | null = null;
    let oldStatus: LeadStatus | undefined;

    setLeads((prev) =>
      prev.map((lead) => {
        if (lead.id !== leadId) return lead;
        oldStatus = lead.status;
        const updatedLead: Lead = {
          ...lead,
          status,
          observation: observation || lead.observation,
          updatedAt: new Date().toISOString(),
          lostAt: status === 'SEM_RESPOSTA' ? new Date().toISOString() : undefined
        };
        if (status === 'GANHO' && saleData) {
          updatedLead.saleValue = saleData.value;
          updatedLead.modality = saleData.modality;
          updatedLead.paymentMethod = saleData.paymentMethod;
          updatedLead.assignedToId = saleData.sellerId;
          updatedLead.classLocation = saleData.classLocation;

          // Down Payment Logic
          if (saleData.hasDownPayment) {
            updatedLead.hasDownPayment = true;
            updatedLead.downPaymentValue = saleData.downPaymentValue;
            updatedLead.remainingBalance = saleData.remainingBalance;
          } else {
            updatedLead.hasDownPayment = false;
            updatedLead.downPaymentValue = undefined;
            updatedLead.remainingBalance = undefined;
          }

          addTransaction({
            type: 'INCOME',
            amount: saleData.hasDownPayment ? (saleData.downPaymentValue || 0) : saleData.value, // Registra apenas o que foi pago
            description: saleData.hasDownPayment
              ? `Sinal Imersão - ${lead.name} (${saleData.classLocation})`
              : `Venda Imersão - ${lead.name} (${saleData.classLocation})`,
            date: new Date().toISOString(),
            category: 'Vendas',
          });
        }
        updatedLeadFinal = updatedLead;
        return updatedLead;
      })
    );

    if (updatedLeadFinal) {
      await supabase.from('leads').update(updatedLeadFinal).eq('id', leadId);

      // Record History
      const historyEntry: LeadHistoryEntry = {
        id: crypto.randomUUID(),
        leadId,
        leadName: (updatedLeadFinal as Lead).name,
        oldStatus,
        newStatus: status,
        observation,
        changedById: changedBy?.id || '00000000-0000-0000-0000-000000000000',
        changedByName: changedBy?.name || 'Sistema',
        createdAt: new Date().toISOString()
      };

      setLeadHistory(prev => [historyEntry, ...prev]);
      await supabase.from('lead_history').insert(historyEntry);
    }
  }
  const settleDownPayment = async (leadId: string, amount: number, paymentMethod: string, observation?: string) => {
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return;

    const notes = observation || `[Sistema] Matrícula quitada. Sinal anterior: R$ ${(lead.downPaymentValue || 0).toLocaleString()} + Pagamento Final: R$ ${amount.toLocaleString()}`;

    // 1. Add Transaction for the remaining amount
    await addTransaction({
      type: 'INCOME',
      amount: amount,
      description: `Quit. Matrícula - ${lead.name} (${lead.classLocation})`,
      date: new Date().toISOString(),
      category: 'Vendas',
      paymentMethod: paymentMethod
    });

    // 2. Update Lead to remove down payment flags (converting to full enrollment)
    const updatedLead = {
      ...lead,
      hasDownPayment: false,
      downPaymentValue: undefined,
      remainingBalance: undefined, // Cleared
      updatedAt: new Date().toISOString(),
      observation: (lead.observation || '') + '\n' + notes
    };

    setLeads(prev => prev.map(l => l.id === leadId ? updatedLead : l));

    // 3. Persist to DB
    // We explicitly set them to null/false in DB
    await supabase.from('leads').update({
      hasDownPayment: false,
      downPaymentValue: null,
      remainingBalance: null,
      updatedAt: new Date().toISOString(),
      observation: updatedLead.observation
    }).eq('id', leadId);

    // 4. Record History
    const historyEntry: LeadHistoryEntry = {
      id: crypto.randomUUID(),
      leadId,
      leadName: lead.name,
      oldStatus: 'GANHO',
      newStatus: 'GANHO',
      observation: `Matrícula Completada: ${notes}`,
      changedById: '00000000-0000-0000-0000-000000000000',
      changedByName: 'Sistema',
      createdAt: new Date().toISOString()
    };
    setLeadHistory(prev => [historyEntry, ...prev]);
    await supabase.from('lead_history').insert(historyEntry);
  };

  const reassignLeads = async (leadIds: string[], sellerId: string) => {
    const now = new Date().toISOString();
    setLeads(prev => prev.map(lead =>
      leadIds.includes(lead.id) ? { ...lead, assignedToId: sellerId, updatedAt: now } : lead
    ));
    await supabase.from('leads').update({ assignedToId: sellerId, updatedAt: now }).in('id', leadIds);
  };

  const deleteLeads = async (leadIds: string[]) => {
    setLeads(prev => prev.filter(lead => !leadIds.includes(lead.id)));
    await supabase.from('leads').delete().in('id', leadIds);
  };

  const clearLeads = async () => {
    if (window.confirm("Tem certeza que deseja excluir TODOS os leads? Esta ação não pode ser desfeita.")) {
      setLeads([]);
      localStorage.removeItem('leads');
      await supabase.from('leads').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    }
  };

  const importLeads = async (
    leadsData: Array<{ name: string; phone: string; role?: string; classLocation?: string; createdAt?: string }>,
    totalImportCost: number,
    assignmentConfig?: { type: 'SINGLE' | 'EQUAL', sellerId?: string },
    sheetsUrl?: string,
    investmentClassLocation?: string
  ) => {
    const sellers = team.filter(m => m.role === 'VENDEDOR');
    const existingPhones = new Set(leads.map(l => l.phone.replace(/\D/g, '')));
    const newLeadsData = leadsData.filter(l => {
      const cleanPhone = l.phone.replace(/\D/g, '');
      return !existingPhones.has(cleanPhone);
    });

    if (newLeadsData.length === 0 && leadsData.length > 0) {
      alert("Nenhum lead novo encontrado.");
      return;
    }

    const newLeads: Lead[] = newLeadsData.map((l, index) => {
      let assignedToId = undefined;
      if (assignmentConfig?.type === 'SINGLE') {
        assignedToId = assignmentConfig.sellerId;
      } else if (assignmentConfig?.type === 'EQUAL' && sellers.length > 0) {
        assignedToId = sellers[index % sellers.length].id;
      }

      let leadDate = new Date().toISOString();
      if (l.createdAt) {
        const parsed = new Date(l.createdAt);
        if (!isNaN(parsed.getTime())) leadDate = parsed.toISOString();
      }

      return {
        id: crypto.randomUUID(),
        name: l.name,
        phone: l.phone,
        role: l.role || 'Importado',
        classLocation: l.classLocation,
        status: 'NOVO',
        createdAt: leadDate,
        updatedAt: new Date().toISOString(),
        assignedToId: assignedToId
      };
    });

    setLeads((prev) => [...newLeads, ...prev]);
    await supabase.from('leads').insert(newLeads);

    if (sheetsUrl && assignmentConfig) {
      setLastSyncConfig({
        url: sheetsUrl,
        sellerId: assignmentConfig.sellerId,
        assignmentType: assignmentConfig.type
      });
    }

    if (totalImportCost > 0) {
      addTransaction({
        type: 'EXPENSE',
        amount: totalImportCost,
        description: `Importação de Leads (${newLeads.length} novos leads)`,
        date: new Date().toISOString(),
        category: 'Leads',
        classLocation: investmentClassLocation
      });
    }
  };

  const payCommission = async (memberId: string, amount: number, type: 'SELLER' | 'TEACHER', memberName: string) => {
    const paymentId = crypto.randomUUID();
    const date = new Date().toISOString();

    const paymentEntry: CommissionPaymentRecord = {
      id: paymentId,
      memberId,
      memberName,
      amount,
      date,
      type
    };

    // 1. Record the payment
    setCommissionPayments(prev => [paymentEntry, ...prev]);
    await supabase.from('commission_payments').insert(paymentEntry);

    // 2. Add as expense to finance
    await addTransaction({
      type: 'EXPENSE',
      amount,
      description: `Pagamento de Comissão - ${memberName} (${type === 'SELLER' ? 'Vendedor' : 'Professor'})`,
      date,
      category: 'Comissões',
    });

    // 3. Mark leads related to this member as paid if Seller
    if (type === 'SELLER') {
      const updatedLeads = leads.map(l =>
        (l.assignedToId === memberId && l.status === 'GANHO' && !l.commissionPaymentId)
          ? { ...l, commissionPaymentId: paymentId }
          : l
      );
      setLeads(updatedLeads);

      const leadIdsToUpdate = leads
        .filter(l => l.assignedToId === memberId && l.status === 'GANHO' && !l.commissionPaymentId)
        .map(l => l.id);

      if (leadIdsToUpdate.length > 0) {
        await supabase.from('leads').update({ commissionPaymentId: paymentId }).in('id', leadIdsToUpdate);
      }
    }
  };

  const addSupplier = async (supplier: Omit<Supplier, 'id' | 'updatedAt'>) => {
    const newSupplier: Supplier = {
      ...supplier,
      id: crypto.randomUUID(),
      updatedAt: new Date().toISOString()
    };
    setSuppliers(prev => [newSupplier, ...prev]);
    await supabase.from('suppliers').insert(newSupplier);
  };

  const removeSupplier = async (id: string) => {
    if (window.confirm("Remover este fornecedor?")) {
      setSuppliers(prev => prev.filter(s => s.id !== id));
      await supabase.from('suppliers').delete().eq('id', id);
    }
  };

  const syncSuppliers = async (url: string) => {
    try {
      let fetchUrl = url;
      if (fetchUrl.includes('/edit')) {
        fetchUrl = fetchUrl.split('/edit')[0] + '/export?format=csv';
      }

      const response = await fetch(fetchUrl);
      const csvText = await response.text();

      // Parse CSV
      const rows = csvText.split('\n').map(row => row.split(','));
      const newSuppliers: Supplier[] = rows
        .filter(row => row.length >= 3 && row[0].trim() !== '' && row[0] !== 'Nome') // Skip header or empty
        .map(row => ({
          id: crypto.randomUUID(),
          name: row[0].trim().replace(/^"|"$/g, ''),
          phone: row[1].trim().replace(/^"|"$/g, ''),
          category: row[2].trim().replace(/^"|"$/g, ''),
          price: row[3] ? Number(row[3].trim().replace(/[^\d.]/g, '')) : undefined,
          updatedAt: new Date().toISOString()
        }));

      if (newSuppliers.length > 0) {
        setSuppliers(newSuppliers);
        setSuppliersSyncUrl(url);
        await supabase.from('suppliers').delete().neq('id', '0'); // Clear old
        await supabase.from('suppliers').insert(newSuppliers);
      }
    } catch (error) {
      alert("Erro ao sincronizar fornecedores. Verifique se o link está público.");
    }
  };

  const addTeamMember = async (member: Omit<TeamMember, 'id'>) => {
    const newMember = { ...member, id: crypto.randomUUID() };
    setTeam((prev) => [...prev, newMember]);
    await supabase.from('team').insert(newMember);
  };

  const removeTeamMember = async (id: string) => {
    if (window.confirm("Deseja realmente remover este membro da equipe?")) {
      setTeam((prev) => prev.filter(m => m.id !== id));
      await supabase.from('team').delete().eq('id', id);
    }
  };

  const getSalesBySeller = (sellerId: string) => {
    return leads.filter((l) => l.status === 'GANHO' && l.assignedToId === sellerId);
  };

  const addKnowledgeItem = async (item: Omit<KnowledgeItem, 'id' | 'updatedAt'>) => {
    const newItem: KnowledgeItem = {
      ...item,
      id: crypto.randomUUID(),
      updatedAt: new Date().toISOString()
    };
    setKnowledgeItems(prev => [newItem, ...prev]);
    await supabase.from('knowledge_items').insert(newItem);
  };

  const removeKnowledgeItem = async (id: string) => {
    if (window.confirm("Remover este item?")) {
      setKnowledgeItems(prev => prev.filter(i => i.id !== id));
      await supabase.from('knowledge_items').delete().eq('id', id);
    }
  };

  const syncKnowledgeItem = async (id: string) => {
    const item = knowledgeItems.find(i => i.id === id);
    if (!item || !item.syncUrl) return;

    try {
      let fetchUrl = item.syncUrl;
      const isDoc = fetchUrl.includes('/document/d/');
      const isSheet = fetchUrl.includes('/spreadsheets/d/');

      if (isDoc) fetchUrl = fetchUrl.split('/edit')[0] + '/export?format=txt';
      else if (isSheet) fetchUrl = fetchUrl.split('/edit')[0] + '/export?format=csv';

      const response = await fetch(fetchUrl);
      const text = await response.text();

      const updatedAt = new Date().toISOString();
      setKnowledgeItems(prev => prev.map(i => i.id === id ? { ...i, content: text, updatedAt } : i));
      await supabase.from('knowledge_items').update({ content: text, updatedAt }).eq('id', id);
    } catch (error) {
      alert("Erro ao sincronizar com Google. Verifique as permissões.");
    }
  };

  const addClass = async (cls: Omit<ImmersiveClass, 'id'>) => {
    const newClass = { ...cls, id: crypto.randomUUID() };
    setImmersiveClasses(prev => [...prev, newClass]);
    await supabase.from('immersive_classes').insert(newClass);
  };

  const updateClass = async (id: string, cls: Omit<ImmersiveClass, 'id'>) => {
    setImmersiveClasses(prev => prev.map(c => c.id === id ? { ...cls, id } : c));
    await supabase.from('immersive_classes').update(cls).eq('id', id);
  };

  const removeClass = async (id: string) => {
    if (window.confirm("Remover esta turma?")) {
      setImmersiveClasses(prev => prev.filter(c => c.id !== id));
      await supabase.from('immersive_classes').delete().eq('id', id);
    }
  };

  return (
    <AppContext.Provider
      value={{
        leads, transactions, team, knowledgeItems, immersiveClasses, leadHistory, commissionPayments, suppliers, suppliersSyncUrl, lastSyncConfig, isLoading,
        addLead, updateLeadStatus, reassignLeads, importLeads, deleteLeads, clearLeads, addTransaction, payCommission,
        addSupplier, removeSupplier, syncSuppliers,
        addTeamMember, removeTeamMember, getSalesBySeller, addKnowledgeItem, removeKnowledgeItem,
        syncKnowledgeItem, addClass, updateClass, removeClass, settleDownPayment
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
