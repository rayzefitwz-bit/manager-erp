
import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { LeadStatus, Lead, Modality, ImmersiveClass } from '../types';
import { STATUS_LABELS, STATUS_COLORS } from '../constants';
import { MessageCircle, FileUp, MoreHorizontal, Plus, Users, Shuffle, UserCheck, Link, Globe, RefreshCw, Calendar, Target, UserPlus, CheckSquare, Square, XCircle, Trash2 } from 'lucide-react';
import { read, utils } from 'xlsx';

// Modal for Won Deal
const WonDealModal = ({ isOpen, onClose, onSubmit, team, immersiveClasses }: any) => {
  const [value, setValue] = useState('');
  const [modality, setModality] = useState<Modality>('PRESENCIAL');
  const [classLocation, setClassLocation] = useState(immersiveClasses[0]?.city || 'Curitiba');
  const [payment, setPayment] = useState('PIX');
  const [sellerId, setSellerId] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-96">
        <h3 className="text-lg font-bold mb-4">Registrar Venda</h3>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">Valor da Venda (R$)</label>
            <input
              type="number"
              className="w-full border p-2 rounded"
              value={value}
              onChange={e => setValue(e.target.value)}
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Vendedor</label>
            <select
              className="w-full border p-2 rounded"
              value={sellerId}
              onChange={e => setSellerId(e.target.value)}
            >
              <option value="">Selecione...</option>
              {team.map((m: any) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Turma / Localidade</label>
            <select
              className="w-full border p-2 rounded"
              value={classLocation}
              onChange={e => {
                setClassLocation(e.target.value);
                setModality(e.target.value.toLowerCase() === 'online' ? 'ONLINE' : 'PRESENCIAL');
              }}
            >
              {immersiveClasses.map((cls: ImmersiveClass) => (
                <option key={cls.id} value={cls.city}>{cls.city}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Forma Pagamento</label>
            <select
              className="w-full border p-2 rounded"
              value={payment}
              onChange={e => setPayment(e.target.value)}
            >
              <option value="PIX">Pix</option>
              <option value="CARTAO">Cartão de Crédito</option>
              <option value="BOLETO">Boleto</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancelar</button>
          <button
            onClick={() => onSubmit({ value: Number(value), modality, paymentMethod: payment, sellerId, classLocation })}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            disabled={!value || !sellerId}
          >
            Confirmar Venda
          </button>
        </div>
      </div>
    </div>
  );
};

// Modal for Reassign Lead
const ReassignModal = ({ isOpen, onClose, onSubmit, team, leadCount }: any) => {
  const [sellerId, setSellerId] = useState('');
  const sellers = team.filter((m: any) => m.role === 'VENDEDOR');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
      <div className="bg-white p-6 rounded-xl shadow-xl w-96 animate-fade-in">
        <h3 className="text-lg font-bold mb-2">Transferir Responsabilidade</h3>
        <p className="text-sm text-gray-500 mb-4">Selecionar novo vendedor para {leadCount === 1 ? 'este lead' : `${leadCount} leads selecionados`}.</p>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1 tracking-wider">Novo Responsável</label>
            <select
              className="w-full border p-2.5 rounded-lg text-sm bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none"
              value={sellerId}
              onChange={e => setSellerId(e.target.value)}
            >
              <option value="">Selecione um vendedor...</option>
              {sellers.map((m: any) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-500 hover:bg-gray-100 rounded-lg">Cancelar</button>
          <button
            onClick={() => onSubmit(sellerId)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-bold shadow-md"
            disabled={!sellerId}
          >
            Confirmar Transferência
          </button>
        </div>
      </div>
    </div>
  );
};

// Modal for Delete Confirmation
const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, count }: any) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
      <div className="bg-white p-6 rounded-xl shadow-xl w-96 animate-fade-in">
        <h3 className="text-lg font-bold mb-2 text-red-600">⚠️ Confirmar Deleção</h3>
        <p className="text-sm text-gray-600 mb-4">
          Tem certeza que deseja deletar <strong>{count} lead{count > 1 ? 's' : ''}</strong>?
          Esta ação não pode ser desfeita.
        </p>
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-500 hover:bg-gray-100 rounded-lg">
            Cancelar
          </button>
          <button onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-bold">
            Deletar
          </button>
        </div>
      </div>
    </div>
  );
};

// Import Modal with Google Sheets Support
const ImportModal = ({ isOpen, onClose, onImport, team, immersiveClasses }: any) => {
  const [importMethod, setImportMethod] = useState<'FILE' | 'SHEETS'>('FILE');
  const [file, setFile] = useState<File | null>(null);
  const [sheetsUrl, setSheetsUrl] = useState('');
  const [cost, setCost] = useState('');
  const [preview, setPreview] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [assignmentType, setAssignmentType] = useState<'NONE' | 'SINGLE' | 'EQUAL'>('NONE');
  const [selectedSellerId, setSelectedSellerId] = useState('');
  const [investmentClassLocation, setInvestmentClassLocation] = useState('');

  const sellers = team.filter((m: any) => m.role === 'VENDEDOR');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      setFile(f);
      setIsLoading(true);

      try {
        if (f.name.endsWith('.xlsx') || f.name.endsWith('.xls')) {
          const data = await f.arrayBuffer();
          const workbook = read(data);
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const rows = utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
          processRows(rows, false);
        } else {
          const reader = new FileReader();
          reader.onload = (event) => {
            const text = event.target?.result as string;
            const lines = text.split('\n');
            const rows = lines.map(line => line.split(','));
            processRows(rows, false);
          };
          reader.readAsText(f);
        }
      } catch (error) {
        alert("Erro ao ler o arquivo.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const processRows = (rows: any[][], isGSheets: boolean) => {
    const parsed = rows
      .map((row, index) => {
        const firstCol = String(row[0] || '').toLowerCase();
        if (index === 0 && (firstCol.includes('nome') || firstCol.includes('identificação'))) return null;

        if (isGSheets) {
          return {
            name: row[0] ? String(row[0]).trim() : '',
            classLocation: row[1] ? String(row[1]).trim() : '',
            phone: row[2] ? String(row[2]).trim() : '',
            createdAt: row[3] ? String(row[3]).trim() : undefined,
            role: 'Google Sheets'
          };
        } else {
          return {
            name: row[0] ? String(row[0]).trim() : '',
            phone: row[1] ? String(row[1]).trim() : '',
            role: row[2] ? String(row[2]).trim() : ''
          };
        }
      })
      .filter(item => item && item.name && item.phone);
    setPreview(parsed);
  };

  const fetchGoogleSheets = async () => {
    if (!sheetsUrl) return;

    setIsLoading(true);
    try {
      let url = sheetsUrl;
      if (url.includes('/edit')) {
        url = url.split('/edit')[0] + '/export?format=csv';
      } else if (!url.includes('format=csv')) {
        url = url.includes('?') ? `${url}&format=csv` : `${url}?format=csv`;
      }

      const response = await fetch(url);
      const text = await response.text();
      const rows = text.split('\n').map(line => {
        return line.split(',').map(c => c.replace(/"/g, ''));
      });
      processRows(rows, true);
      // Mantém SINGLE como padrão inicial ao buscar, mas permite trocar para EQUAL
      if (assignmentType === 'NONE') {
        setAssignmentType('SINGLE');
      }
    } catch (error) {
      alert("Erro ao sincronizar Google Sheets. Verifique se a planilha está aberta para 'Qualquer pessoa com o link' ou 'Publicada na Web'.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmImport = () => {
    const config: any = { type: assignmentType };
    if (assignmentType === 'SINGLE') {
      config.sellerId = selectedSellerId;
    }
    onImport(preview, Number(cost), config, importMethod === 'SHEETS' ? sheetsUrl : undefined, investmentClassLocation);
    setFile(null);
    setPreview([]);
    setCost('');
    setSheetsUrl('');
    setAssignmentType('NONE');
    setSelectedSellerId('');
    setInvestmentClassLocation('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-[550px] max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <FileUp className="w-6 h-6 text-blue-600" />
          Importar Leads
        </h3>

        <div className="flex border-b mb-6">
          <button
            onClick={() => { setImportMethod('FILE'); setPreview([]); setAssignmentType('NONE'); }}
            className={`flex-1 py-2 text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-colors ${importMethod === 'FILE' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
          >
            <FileUp className="w-4 h-4" /> Arquivo Local
          </button>
          <button
            onClick={() => { setImportMethod('SHEETS'); setPreview([]); }}
            className={`flex-1 py-2 text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-colors ${importMethod === 'SHEETS' ? 'border-green-600 text-green-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
          >
            <Globe className="w-4 h-4" /> Google Sheets
          </button>
        </div>

        {importMethod === 'FILE' ? (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2 font-bold">Arquivo (CSV ou Excel)</label>
            <input
              type="file"
              accept=".csv, .xlsx, .xls"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <p className="text-[10px] text-gray-400 mt-1">Colunas padrão: Nome (A), Telefone (B), Cargo (C)</p>
          </div>
        ) : (
          <div className="mb-6 space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 font-bold">Link da Planilha Google</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Link className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={sheetsUrl}
                    onChange={e => setSheetsUrl(e.target.value)}
                    className="w-full pl-9 border p-2 rounded text-sm"
                    placeholder="https://docs.google.com/spreadsheets/d/..."
                  />
                </div>
                <button
                  onClick={fetchGoogleSheets}
                  disabled={!sheetsUrl || isLoading}
                  className="bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>
            <div className="p-3 bg-indigo-50 border border-indigo-100 rounded text-[11px] text-indigo-800">
              <p className="font-bold flex items-center gap-1">ℹ️ Importação Contínua:</p>
              <p>Ao importar via Sheets, você pode atribuir os novos leads a um único consultor ou distribuí-los igualmente entre toda a equipe de vendas.</p>
            </div>
          </div>
        )}

        {preview.length > 0 && (
          <div className="mb-6 p-3 bg-blue-50 border border-blue-100 rounded-lg flex items-center justify-between animate-fade-in">
            <span className="text-sm font-medium text-blue-800">{preview.length} leads prontos para importar</span>
            <button onClick={() => setPreview([])} className="text-xs text-blue-600 hover:underline">Limpar</button>
          </div>
        )}

        <div className="space-y-4 mb-6">
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
            <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
              <Users className="w-4 h-4" /> Estratégia de Distribuição
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setAssignmentType('NONE')}
                className={`flex flex-col items-center justify-center p-3 rounded-lg border text-xs font-medium transition-all ${assignmentType === 'NONE' ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
              >
                Sem Consultor
              </button>
              <button
                onClick={() => setAssignmentType('SINGLE')}
                className={`flex flex-col items-center justify-center p-3 rounded-lg border text-xs font-medium transition-all ${assignmentType === 'SINGLE' ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
              >
                <UserCheck className="w-4 h-4 mb-1" /> Um Consultor
              </button>
              <button
                onClick={() => setAssignmentType('EQUAL')}
                className={`flex flex-col items-center justify-center p-3 rounded-lg border text-xs font-medium transition-all ${assignmentType === 'EQUAL' ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
              >
                <Shuffle className="w-4 h-4 mb-1" /> Dividir Todos
              </button>
            </div>

            {assignmentType === 'SINGLE' && (
              <div className="mt-4 animate-fade-in">
                <label className="block text-xs font-medium text-gray-500 mb-1">Selecione o Consultor <span className="text-red-500 font-bold">*</span></label>
                <select
                  className="w-full border p-2 rounded text-sm"
                  value={selectedSellerId}
                  onChange={e => setSelectedSellerId(e.target.value)}
                  required
                >
                  <option value="">Selecione...</option>
                  {sellers.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            )}
          </div>

          <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
            <label className="block text-sm font-bold text-indigo-700 mb-3 flex items-center gap-2">
              <Target className="w-4 h-4" /> Investimento & CAC
            </label>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Custo Total da Importação (R$)</label>
                <input
                  type="number"
                  value={cost}
                  onChange={e => setCost(e.target.value)}
                  className="w-full border p-2 rounded text-sm"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Associar Investimento à Turma <span className="text-[10px] text-indigo-400 font-bold">(Para Cálculo de CAC)</span></label>
                <select
                  className="w-full border p-2 rounded text-sm"
                  value={investmentClassLocation}
                  onChange={e => setInvestmentClassLocation(e.target.value)}
                >
                  <option value="">Selecionar Turma...</option>
                  {immersiveClasses.map((cls: any) => <option key={cls.id} value={cls.city}>{cls.city}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <button onClick={onClose} className="px-5 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium">Cancelar</button>
          <button
            onClick={handleConfirmImport}
            disabled={preview.length === 0 || (assignmentType === 'SINGLE' && !selectedSellerId) || isLoading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-bold shadow-sm"
          >
            {isLoading ? 'Aguarde...' : 'Importar Leads'}
          </button>
        </div>
      </div>
    </div>
  );
};

export const CRM = () => {
  const { leads, updateLeadStatus, reassignLeads, importLeads, deleteLeads, team, addLead, lastSyncConfig, immersiveClasses } = useApp();
  const { user } = useAuth();

  const [isWonModalOpen, setIsWonModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isReassignModalOpen, setIsReassignModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [activeLeadId, setActiveLeadId] = useState<string | null>(null);
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<LeadStatus | 'ALL'>('ALL');
  const [filterSeller, setFilterSeller] = useState<string>('ALL');
  const [filterDate, setFilterDate] = useState('');

  const [showNewLeadForm, setShowNewLeadForm] = useState(false);
  const [newLeadName, setNewLeadName] = useState('');
  const [newLeadPhone, setNewLeadPhone] = useState('');
  const [newLeadRole, setNewLeadRole] = useState('');

  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);

  const isAdmin = user?.role === 'ADMIN';

  const statuses: LeadStatus[] = ['NOVO', 'CONTATADO', 'NEGOCIANDO', 'GANHO', 'PERDIDO'];

  // Filter leads logic
  const filteredLeads = leads.filter(lead => {
    // Visibility Check (Admin sees all, Seller sees only theirs)
    if (!isAdmin && lead.assignedToId !== user?.id) {
      return false;
    }

    // 7-day rule for lost leads
    if (lead.status === 'PERDIDO' && lead.lostAt) {
      const lostDate = new Date(lead.lostAt);
      const diffTime = Math.abs(new Date().getTime() - lostDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays > 7) return false;
    }

    // Search filter
    const matchesSearch =
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.phone.includes(searchTerm) ||
      (lead.email && lead.email.toLowerCase().includes(searchTerm.toLowerCase()));

    // Advanced filters
    const matchesStatus = filterStatus === 'ALL' || lead.status === filterStatus;
    const matchesSeller = filterSeller === 'ALL' || lead.assignedToId === filterSeller;
    const matchesDate = !filterDate ? true : lead.createdAt.startsWith(filterDate);

    return matchesSearch && matchesStatus && matchesSeller && matchesDate;
  });
  const getWhatsAppLink = (lead: Lead, sellerName: string = 'Consultor') => {
    const cleanPhone = lead.phone.replace(/\D/g, '');
    const city = lead.classLocation || '';

    const immersiveClass = immersiveClasses.find(c => c.city === city);
    const immersionDate = immersiveClass?.date;

    let message = `Olá *${lead.name}*, tudo bem?
Me chamo *${sellerName}* da imersão de Google Ads + IA.`;

    if (city.toLowerCase() === 'online') {
      message += `\nEDIÇÃO AO VIVO E ONLINE`;
    } else {
      if (immersionDate) {
        message += `\nDIAS ${immersionDate.toUpperCase()} - EDIÇÃO PRESENCIAL EM ${city.toUpperCase()}`;
      } else {
        message += `\nEDIÇÃO PRESENCIAL EM ${city.toUpperCase()}`;
      }
    }

    message += `\n\nJá recebeu as informações?`;

    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  };

  const handleStatusChange = (leadId: string, newStatus: string) => {
    if (newStatus === 'GANHO') {
      setActiveLeadId(leadId);
      setIsWonModalOpen(true);
    } else {
      updateLeadStatus(leadId, newStatus as LeadStatus);
    }
  };

  const handleWonSubmit = (data: any) => {
    if (activeLeadId) {
      updateLeadStatus(activeLeadId, 'GANHO', data);
      setIsWonModalOpen(false);
      setActiveLeadId(null);
    }
  };

  const handleReassignSubmit = (sellerId: string) => {
    const targets = activeLeadId ? [activeLeadId] : selectedLeads;
    reassignLeads(targets, sellerId);
    setIsReassignModalOpen(false);
    setActiveLeadId(null);
    setSelectedLeads([]);
  };

  const handleDeleteLeads = () => {
    deleteLeads(selectedLeads);
    setIsDeleteModalOpen(false);
    setSelectedLeads([]);
  };

  const handleImport = (data: any[], cost: number, assignmentConfig: any, sheetsUrl?: string, investmentClassLocation?: string) => {
    importLeads(data, cost, assignmentConfig, sheetsUrl, investmentClassLocation);
    setIsImportModalOpen(false);
  };

  const handleSync = async () => {
    if (!lastSyncConfig) return;
    setIsSyncing(true);
    try {
      let url = lastSyncConfig.url;
      if (url.includes('/edit')) url = url.split('/edit')[0] + '/export?format=csv';
      const response = await fetch(url);
      const text = await response.text();
      const rows = text.split('\n').map(line => line.split(',').map(c => c.replace(/"/g, '')));
      const parsed = rows
        .map((row, index) => {
          const firstCol = String(row[0] || '').toLowerCase();
          if (index === 0 && (firstCol.includes('nome') || firstCol.includes('identificação'))) return null;
          return {
            name: row[0] ? String(row[0]).trim() : '',
            phone: row[2] ? String(row[2]).trim() : '',
            classLocation: row[1] ? String(row[1]).trim() : undefined,
            createdAt: row[3] ? String(row[3]).trim() : undefined,
            role: 'Sincronizado'
          };
        })
        .filter(item => item !== null && item.name !== '' && item.phone !== '') as Array<{ name: string; phone: string; role?: string; classLocation?: string; createdAt?: string }>;
      importLeads(parsed, 0, { type: 'SINGLE', sellerId: lastSyncConfig.sellerId }, lastSyncConfig.url);
    } catch (error) { alert("Erro na sincronização."); } finally { setIsSyncing(false); }
  };

  const toggleLeadSelection = (leadId: string) => {
    setSelectedLeads(prev =>
      prev.includes(leadId) ? prev.filter(id => id !== leadId) : [...prev, leadId]
    );
  };

  const handleCreateLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (newLeadName && newLeadPhone) {
      addLead({
        name: newLeadName,
        phone: newLeadPhone,
        role: newLeadRole,
        assignedToId: !isAdmin ? user?.id : undefined
      });
      setNewLeadName(''); setNewLeadPhone(''); setNewLeadRole(''); setShowNewLeadForm(false);
    }
  }

  const onDragStart = (e: React.DragEvent, leadId: string) => {
    if (selectedLeads.length > 0) {
      e.preventDefault(); // Impede drag se estiver selecionando múltiplos para evitar confusão
      return;
    }
    e.dataTransfer.setData('leadId', leadId);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedLeadId(leadId);
  };

  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; };

  const onDrop = (e: React.DragEvent, newStatus: LeadStatus) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData('leadId');
    setDraggedLeadId(null);
    if (leadId) {
      const currentLead = filteredLeads.find(l => l.id === leadId);
      if (currentLead && currentLead.status !== newStatus) handleStatusChange(leadId, newStatus);
    }
  };

  return (
    <div className="h-full flex flex-col relative">
      {/* Bulk Actions Bar */}
      {isAdmin && selectedLeads.length > 0 && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-40 bg-blue-700 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-6 animate-fade-in border border-blue-600">
          <div className="flex items-center gap-3 border-r border-blue-500 pr-6">
            <CheckSquare className="w-5 h-5 text-blue-200" />
            <span className="font-bold text-sm">{selectedLeads.length} leads selecionados</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => { setActiveLeadId(null); setIsReassignModalOpen(true); }}
              className="flex items-center gap-2 bg-white text-blue-700 px-4 py-1.5 rounded-lg font-bold text-xs hover:bg-blue-50 transition-colors"
            >
              <UserPlus className="w-4 h-4" /> Transferir Vendedor
            </button>
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="flex items-center gap-2 bg-red-600 text-white px-4 py-1.5 rounded-lg font-bold text-xs hover:bg-red-700 transition-colors"
            >
              <Trash2 className="w-4 h-4" /> Deletar
            </button>
            <button
              onClick={() => setSelectedLeads([])}
              className="flex items-center gap-2 bg-blue-600/50 text-white px-4 py-1.5 rounded-lg font-bold text-xs hover:bg-blue-600 transition-colors"
            >
              <XCircle className="w-4 h-4" /> Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">CRM & Leads</h2>
          {isAdmin && <p className="text-xs text-gray-400 font-medium">Administrador: Controle total de atribuição e fluxo.</p>}
        </div>
        <div className="flex gap-2">
          {isAdmin && lastSyncConfig && (
            <button
              onClick={handleSync} disabled={isSyncing}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 shadow-sm transition-all text-sm font-bold"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Sincronizando...' : 'Sincronizar'}
            </button>
          )}
          <button onClick={() => setShowNewLeadForm(!showNewLeadForm)} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 shadow-sm transition-all text-sm font-bold">
            <Plus className="w-4 h-4" /> Novo Lead
          </button>
          {isAdmin && (
            <button onClick={() => setIsImportModalOpen(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 shadow-sm transition-all text-sm font-bold">
              <FileUp className="w-4 h-4" /> Importar
            </button>
          )}
        </div>
      </div>

      {showNewLeadForm && (
        <form onSubmit={handleCreateLead} className="bg-white p-4 rounded-lg shadow mb-6 flex gap-4 items-end flex-wrap border border-green-100 animate-fade-in">
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Nome</label>
            <input className="border p-2 rounded text-sm w-48" value={newLeadName} onChange={e => setNewLeadName(e.target.value)} required />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Telefone</label>
            <input className="border p-2 rounded text-sm w-40" value={newLeadPhone} onChange={e => setNewLeadPhone(e.target.value)} required />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Cargo</label>
            <input className="border p-2 rounded text-sm w-40" value={newLeadRole} onChange={e => setNewLeadRole(e.target.value)} />
          </div>
          <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded font-bold h-10 hover:bg-green-700 transition-colors">Salvar</button>
        </form>
      )}

      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <div className="flex gap-4 min-w-[1200px] h-full pb-4">
          {statuses.map(status => {
            const columnLeads = filteredLeads
              .filter(l => l.status === status)
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

            return (
              <div
                key={status}
                className="flex-1 min-w-[280px] flex flex-col bg-gray-100 rounded-xl max-h-full transition-colors border border-transparent hover:border-gray-300"
                onDragOver={onDragOver}
                onDrop={(e) => onDrop(e, status)}
              >
                <div className={`p-3 border-b-2 font-semibold text-sm uppercase tracking-wide flex justify-between items-center ${STATUS_COLORS[status].split(' ')[2].replace('border', 'border-b')}`}>
                  {STATUS_LABELS[status]}
                  <span className="bg-white px-2 py-0.5 rounded-full text-[10px] text-gray-500 shadow-sm border font-bold">
                    {columnLeads.length}
                  </span>
                </div>

                <div className="p-2 space-y-3 overflow-y-auto flex-1 custom-scrollbar">
                  {columnLeads.map(lead => {
                    const assignedTo = team.find(t => t.id === lead.assignedToId);
                    const isSelected = selectedLeads.includes(lead.id);

                    return (
                      <div
                        key={lead.id}
                        draggable={selectedLeads.length === 0}
                        onDragStart={(e) => onDragStart(e, lead.id)}
                        className={`bg-white p-4 rounded-lg shadow-sm border-2 transition-all cursor-grab active:cursor-grabbing relative ${draggedLeadId === lead.id ? 'opacity-50' : 'opacity-100'} ${isSelected ? 'border-blue-500 bg-blue-50 shadow-md scale-[0.98]' : 'border-transparent hover:shadow-md'}`}
                      >
                        {isAdmin && (
                          <button
                            onClick={() => toggleLeadSelection(lead.id)}
                            className={`absolute -top-2 -left-2 p-1 rounded-full shadow-md z-10 transition-colors ${isSelected ? 'bg-blue-600 text-white' : 'bg-white text-gray-300 hover:text-gray-400 border border-gray-100'}`}
                          >
                            {isSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                          </button>
                        )}

                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-gray-800 text-sm leading-tight">{lead.name}</h4>
                          <div className="relative group">
                            <button className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100 transition-colors"><MoreHorizontal className="w-4 h-4" /></button>
                            <div className="absolute right-0 top-full mt-1 w-48 bg-white border rounded shadow-2xl hidden group-hover:block z-20 py-1.5 animate-fade-in">
                              <p className="px-3 py-1 text-[9px] text-gray-400 font-bold uppercase border-b mb-1">Mover Etapa:</p>
                              {statuses.map(s => (
                                <button key={s} onClick={() => handleStatusChange(lead.id, s)} className="block w-full text-left px-3 py-1.5 text-xs hover:bg-blue-50 hover:text-blue-700 transition-colors font-medium">
                                  {STATUS_LABELS[s]}
                                </button>
                              ))}
                              {isAdmin && (
                                <>
                                  <div className="border-t my-1"></div>
                                  <button
                                    onClick={() => { setActiveLeadId(lead.id); setIsReassignModalOpen(true); }}
                                    className="block w-full text-left px-3 py-1.5 text-xs hover:bg-indigo-50 text-indigo-600 font-bold transition-colors flex items-center gap-2"
                                  >
                                    <UserPlus className="w-3.5 h-3.5" /> Transferir Lead
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <p className="text-xs text-gray-600 mb-1 font-medium">{lead.role}</p>
                        <p className="text-[11px] text-gray-400 mb-2">{lead.phone}</p>

                        <div className="flex flex-wrap gap-2 mb-3">
                          {lead.classLocation && (
                            <div className="text-[10px] text-gray-500 flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
                              <Globe className="w-3 h-3" /> {lead.classLocation}
                            </div>
                          )}
                          <div className="text-[10px] text-gray-400 flex items-center gap-1 bg-gray-50 px-2 py-1 rounded">
                            <Calendar className="w-3 h-3" /> {new Date(lead.createdAt).toLocaleDateString()}
                          </div>
                        </div>

                        {assignedTo && (
                          <div className={`mb-3 flex items-center gap-1.5 text-[10px] px-2 py-1 rounded-full border font-semibold w-fit ${isAdmin ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                            <UserCheck className="w-3 h-3" /> {assignedTo.name}
                          </div>
                        )}

                        <div className="flex gap-2">
                          <a
                            href={getWhatsAppLink(lead, isAdmin ? (assignedTo?.name || user?.name) : user?.name)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 flex items-center justify-center gap-1.5 bg-green-500 hover:bg-green-600 text-white text-[11px] font-bold py-1.5 rounded transition-colors shadow-sm"
                          >
                            <MessageCircle className="w-3 h-3" /> WhatsApp
                          </a>
                        </div>
                        {lead.saleValue && (
                          <div className="mt-3 pt-3 border-t text-[10px] text-gray-500 flex flex-col gap-1">
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-green-600 text-sm">R$ {lead.saleValue.toLocaleString()}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <WonDealModal isOpen={isWonModalOpen} onClose={() => setIsWonModalOpen(false)} onSubmit={handleWonSubmit} team={team} immersiveClasses={immersiveClasses} />
      <ImportModal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} onImport={handleImport} team={team} immersiveClasses={immersiveClasses} />
      <ReassignModal
        isOpen={isReassignModalOpen}
        onClose={() => { setIsReassignModalOpen(false); setActiveLeadId(null); }}
        onSubmit={handleReassignSubmit}
        team={team}
        leadCount={activeLeadId ? 1 : selectedLeads.length}
      />
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteLeads}
        count={selectedLeads.length}
      />
    </div>
  );
};


// End of component
