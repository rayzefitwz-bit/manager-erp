
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Lead, Transaction, TeamMember, LeadStatus, SaleRecord, Modality, KnowledgeItem, ImmersiveClass } from '../types';
import { MOCK_TEAM } from '../constants';
import { supabase } from '../supabase';

interface SyncConfig {
  url: string;
  sellerId: string;
}

interface AppContextType {
  leads: Lead[];
  transactions: Transaction[];
  team: TeamMember[];
  knowledgeItems: KnowledgeItem[];
  immersiveClasses: ImmersiveClass[];
  lastSyncConfig: SyncConfig | null;
  isLoading: boolean;
  addLead: (lead: Omit<Lead, 'id' | 'createdAt' | 'status'>) => void;
  updateLeadStatus: (leadId: string, status: LeadStatus, saleData?: { value: number; modality: Modality; paymentMethod: string; sellerId: string; classLocation: string }) => void;
  reassignLeads: (leadIds: string[], sellerId: string) => void;
  importLeads: (leadsData: Array<{ name: string; phone: string; role?: string; classLocation?: string; createdAt?: string }>, totalImportCost: number, assignmentConfig?: { type: 'SINGLE' | 'EQUAL', sellerId?: string }, sheetsUrl?: string, investmentClassLocation?: string) => void;
  deleteLeads: (leadIds: string[]) => void;
  clearLeads: () => void;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  addTeamMember: (member: Omit<TeamMember, 'id'>) => void;
  removeTeamMember: (id: string) => void;
  getSalesBySeller: (sellerId: string) => Lead[];
  addKnowledgeItem: (item: Omit<KnowledgeItem, 'id' | 'updatedAt'>) => void;
  removeKnowledgeItem: (id: string) => void;
  syncKnowledgeItem: (id: string) => Promise<void>;
  addClass: (cls: Omit<ImmersiveClass, 'id'>) => void;
  updateClass: (id: string, cls: Omit<ImmersiveClass, 'id'>) => void;
  removeClass: (id: string) => void;
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
  const [team, setTeam] = useState<TeamMember[]>(MOCK_TEAM);
  const [immersiveClasses, setImmersiveClasses] = useState<ImmersiveClass[]>(DEFAULT_CLASSES);
  const [knowledgeItems, setKnowledgeItems] = useState<KnowledgeItem[]>([]);
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
  }, []);

  useEffect(() => { localStorage.setItem('leads', JSON.stringify(leads)); }, [leads]);
  useEffect(() => { localStorage.setItem('transactions', JSON.stringify(transactions)); }, [transactions]);
  useEffect(() => { localStorage.setItem('team', JSON.stringify(team)); }, [team]);
  useEffect(() => { localStorage.setItem('immersiveClasses', JSON.stringify(immersiveClasses)); }, [immersiveClasses]);
  useEffect(() => { localStorage.setItem('knowledgeItems', JSON.stringify(knowledgeItems)); }, [knowledgeItems]);
  useEffect(() => { if (lastSyncConfig) localStorage.setItem('lastSyncConfig', JSON.stringify(lastSyncConfig)); }, [lastSyncConfig]);

  const addLead = async (leadData: Omit<Lead, 'id' | 'createdAt' | 'status'>) => {
    const newLead: Lead = {
      ...leadData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
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

  const updateLeadStatus = async (leadId: string, status: LeadStatus, saleData?: { value: number; modality: Modality; paymentMethod: string; sellerId: string; classLocation: string }) => {
    let updatedLeadFinal: Lead | null = null;

    setLeads((prev) =>
      prev.map((lead) => {
        if (lead.id !== leadId) return lead;
        const updatedLead: Lead = {
          ...lead,
          status,
          lostAt: status === 'PERDIDO' ? new Date().toISOString() : undefined
        };
        if (status === 'GANHO' && saleData) {
          updatedLead.saleValue = saleData.value;
          updatedLead.modality = saleData.modality;
          updatedLead.paymentMethod = saleData.paymentMethod;
          updatedLead.assignedToId = saleData.sellerId;
          updatedLead.classLocation = saleData.classLocation;
          addTransaction({
            type: 'INCOME',
            amount: saleData.value,
            description: `Venda Imersão - ${lead.name} (${saleData.classLocation})`,
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
    }
  };

  const reassignLeads = async (leadIds: string[], sellerId: string) => {
    setLeads(prev => prev.map(lead =>
      leadIds.includes(lead.id) ? { ...lead, assignedToId: sellerId } : lead
    ));
    await supabase.from('leads').update({ assignedToId: sellerId }).in('id', leadIds);
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
        assignedToId: assignedToId
      };
    });

    setLeads((prev) => [...newLeads, ...prev]);
    await supabase.from('leads').insert(newLeads);

    if (sheetsUrl && assignmentConfig?.sellerId) {
      setLastSyncConfig({ url: sheetsUrl, sellerId: assignmentConfig.sellerId });
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
        leads, transactions, team, knowledgeItems, immersiveClasses, lastSyncConfig, isLoading,
        addLead, updateLeadStatus, reassignLeads, importLeads, deleteLeads, clearLeads, addTransaction,
        addTeamMember, removeTeamMember, getSalesBySeller, addKnowledgeItem, removeKnowledgeItem,
        syncKnowledgeItem, addClass, updateClass, removeClass
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
