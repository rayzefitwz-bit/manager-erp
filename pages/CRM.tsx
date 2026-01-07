
import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { LeadStatus, Lead, Modality, ImmersiveClass } from '../types';
import { STATUS_LABELS, STATUS_COLORS } from '../constants';
import { MessageCircle, FileUp, MoreHorizontal, Plus, Users, Shuffle, UserCheck, Link, Globe, RefreshCw, Calendar, Target, UserPlus, CheckSquare, Square, XCircle, Trash2, DollarSign, CheckCircle } from 'lucide-react';
import { read, utils } from 'xlsx';
import confetti from 'canvas-confetti';


// Modal for Won Deal
const WonDealModal = ({ isOpen, onClose, onSubmit, team, immersiveClasses }: any) => {
  const [value, setValue] = useState('');
  const [modality, setModality] = useState<Modality>('PRESENCIAL');
  const [classLocation, setClassLocation] = useState(immersiveClasses[0]?.city || 'Curitiba');
  const [payment, setPayment] = useState('PIX');
  const [sellerId, setSellerId] = useState('');

  if (!isOpen) return null;

  const handleSubmit = () => {
    onSubmit({
      value: Number(value) || 0,
      modality,
      paymentMethod: payment,
      sellerId,
      classLocation
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-96 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-bold mb-4">Registrar Venda Completa</h3>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">Valor Total da Venda (R$) <span className="text-red-500">*</span></label>
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
            onClick={handleSubmit}
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

// Modal for Sinal de Venda (New)
const SinalDealModal = ({ isOpen, onClose, onSubmit, team, immersiveClasses }: any) => {
  const [totalValue, setTotalValue] = useState('');
  const [sinalValue, setSinalValue] = useState('');
  const [modality, setModality] = useState<Modality>('PRESENCIAL');
  const [classLocation, setClassLocation] = useState(immersiveClasses[0]?.city || 'Curitiba');
  const [payment, setPayment] = useState('PIX');
  const [sellerId, setSellerId] = useState('');

  if (!isOpen) return null;

  const total = Number(totalValue) || 0;
  const sinal = Number(sinalValue) || 0;
  const remaining = total - sinal;

  const handleSubmit = () => {
    onSubmit({
      value: total,
      downPaymentValue: sinal,
      remainingBalance: remaining,
      modality,
      paymentMethod: payment,
      sellerId,
      classLocation,
      hasDownPayment: true
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-96 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-bold mb-4">Registrar Sinal de Venda</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Valor Total da Venda (R$)</label>
            <input
              type="number"
              className="w-full border p-2 rounded"
              value={totalValue}
              onChange={e => setTotalValue(e.target.value)}
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-amber-700 mb-1">Valor do Sinal (R$)</label>
            <input
              type="number"
              className="w-full border-2 border-amber-300 p-2 rounded bg-amber-50"
              value={sinalValue}
              onChange={e => setSinalValue(e.target.value)}
              placeholder="0.00"
            />
          </div>

          {total > 0 && sinal > 0 && (
            <div className="p-3 bg-gray-50 rounded border border-dashed border-gray-300 text-xs font-bold text-gray-500">
              Saldo Restante: <span className="text-amber-600">R$ {remaining.toLocaleString()}</span>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">Vendedor</label>
            <select className="w-full border p-2 rounded" value={sellerId} onChange={e => setSellerId(e.target.value)}>
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
            <label className="block text-sm font-medium text-gray-700">Forma Pagamento (do Sinal)</label>
            <select className="w-full border p-2 rounded" value={payment} onChange={e => setPayment(e.target.value)}>
              <option value="PIX">Pix</option>
              <option value="CARTAO">Cartão de Crédito</option>
              <option value="BOLETO">Boleto</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded font-medium">Cancelar</button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-amber-500 text-white rounded hover:bg-amber-600 font-bold shadow-md shadow-amber-200"
            disabled={!totalValue || !sinalValue || !sellerId || sinal >= total}
          >
            Registrar Sinal
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

// Modal for Observation
const ObservationModal = ({ isOpen, onClose, onSubmit }: any) => {
  const [observation, setObservation] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!observation.trim()) {
      setError('O campo não pode ficar em branco');
      return;
    }
    onSubmit(observation);
    setObservation('');
    setError('');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[70]">
      <div className="bg-white p-6 rounded-xl shadow-xl w-96 animate-fade-in">
        <h3 className="text-lg font-bold mb-2">Observação Obrigatória</h3>
        <p className="text-sm text-gray-500 mb-4">O que você falou com o cliente?</p>

        <div className="space-y-4">
          <div>
            <textarea
              className={`w-full border p-2.5 rounded-lg text-sm bg-gray-50 focus:ring-2 outline-none h-32 resize-none ${error ? 'border-red-500 ring-red-500' : 'focus:ring-blue-500'}`}
              placeholder="Digite os detalhes da negociação..."
              value={observation}
              onChange={e => {
                setObservation(e.target.value);
                if (error) setError('');
              }}
            />
            {error && <p className="text-xs text-red-500 mt-1 font-bold">{error}</p>}
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button onClick={() => { onClose(); setObservation(''); setError(''); }} className="px-4 py-2 text-sm text-gray-500 hover:bg-gray-100 rounded-lg">Cancelar</button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-bold shadow-md"
          >
            Salvar
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

// Modal for Sync Configuration
const SyncConfigModal = ({ isOpen, onClose, onConfirm, team }: any) => {
  const [sheetsUrl, setSheetsUrl] = useState('');
  const [assignmentType, setAssignmentType] = useState<'SINGLE' | 'EQUAL'>('SINGLE');
  const [selectedSellerId, setSelectedSellerId] = useState('');
  const sellers = team.filter((m: any) => m.role === 'VENDEDOR');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
      <div className="bg-white p-6 rounded-xl shadow-xl w-[500px] animate-fade-in">
        <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
          <RefreshCw className="w-5 h-5 text-indigo-600" />
          Configurar Sincronização Automática
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Insira o link da planilha do Google Sheets para ativar a sincronização.
          Esta configuração ficará salva neste dispositivo.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Link do Google Sheets (Público)</label>
            <div className="relative">
              <Link className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={sheetsUrl}
                onChange={e => setSheetsUrl(e.target.value)}
                className="w-full pl-9 border p-2.5 rounded-lg text-sm bg-gray-50 focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="https://docs.google.com/spreadsheets/d/..."
              />
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
            <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
              <Users className="w-4 h-4" /> Distribuição Automática
            </label>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <button
                onClick={() => setAssignmentType('SINGLE')}
                className={`flex flex-col items-center justify-center p-3 rounded-lg border text-xs font-medium transition-all ${assignmentType === 'SINGLE' ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
              >
                <UserCheck className="w-4 h-4 mb-1" /> Um Consultor
              </button>
              <button
                onClick={() => setAssignmentType('EQUAL')}
                className={`flex flex-col items-center justify-center p-3 rounded-lg border text-xs font-medium transition-all ${assignmentType === 'EQUAL' ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
              >
                <Shuffle className="w-4 h-4 mb-1" /> Dividir Todos
              </button>
            </div>

            {assignmentType === 'SINGLE' && (
              <div className="animate-fade-in">
                <label className="block text-xs font-medium text-gray-500 mb-1">Consultor Responsável</label>
                <select
                  className="w-full border p-2 rounded text-sm"
                  value={selectedSellerId}
                  onChange={e => setSelectedSellerId(e.target.value)}
                >
                  <option value="">Selecione...</option>
                  {sellers.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-500 hover:bg-gray-100 rounded-lg">Cancelar</button>
          <button
            onClick={() => onConfirm(sheetsUrl, assignmentType, selectedSellerId)}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 text-sm font-bold shadow-md"
            disabled={!sheetsUrl || (assignmentType === 'SINGLE' && !selectedSellerId)}
          >
            Salvar e Sincronizar
          </button>
        </div>
      </div>
    </div>
  );
};

// Modal for settling down payment
const SettlePaymentModal = ({ isOpen, onClose, onSubmit, lead }: any) => {
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [observation, setObservation] = useState('');

  useEffect(() => {
    if (isOpen && lead) {
      setAmount(lead.remainingBalance ? String(lead.remainingBalance) : '');
      setPaymentMethod('');
      setObservation('');
    }
  }, [isOpen, lead]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount && paymentMethod) {
      onSubmit({ amount: parseFloat(amount), paymentMethod, observation });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
      <div className="bg-white p-6 rounded-xl shadow-xl w-[450px] animate-fade-in">
        <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-green-600" />
          Receber Pagamento Restante
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Registre o pagamento restante para o lead: <span className="font-bold text-gray-700">{lead?.name}</span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Valor (R$)</label>
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="w-full border p-2.5 rounded-lg text-sm bg-gray-50 focus:ring-2 focus:ring-green-500 outline-none"
              placeholder="0.00"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Método de Pagamento</label>
            <select
              value={paymentMethod}
              onChange={e => setPaymentMethod(e.target.value)}
              className="w-full border p-2.5 rounded-lg text-sm bg-gray-50 focus:ring-2 focus:ring-green-500 outline-none"
              required
            >
              <option value="">Selecione...</option>
              <option value="PIX">PIX</option>
              <option value="Cartão de Crédito">Cartão de Crédito</option>
              <option value="Boleto">Boleto</option>
              <option value="Transferência">Transferência Bancária</option>
              <option value="Dinheiro">Dinheiro</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Observação (Opcional)</label>
            <textarea
              value={observation}
              onChange={e => setObservation(e.target.value)}
              className="w-full border p-2.5 rounded-lg text-sm bg-gray-50 focus:ring-2 focus:ring-green-500 outline-none"
              rows={3}
            ></textarea>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-500 hover:bg-gray-100 rounded-lg">Cancelar</button>
            <button
              type="submit"
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm font-bold shadow-md"
              disabled={!amount || !paymentMethod}
            >
              Confirmar Pagamento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const CRM = () => {
  const { leads, team, isLoading, updateLeadStatus, addLead, reassignLeads, importLeads, deleteLeads, clearLeads, lastSyncConfig, settleDownPayment, immersiveClasses } = useApp();
  const { user } = useAuth();

  // States
  const [isWonModalOpen, setIsWonModalOpen] = useState(false);
  const [isSinalModalOpen, setIsSinalModalOpen] = useState(false);
  const [activeLeadId, setActiveLeadId] = useState<string | null>(null);
  const [isObservationModalOpen, setIsObservationModalOpen] = useState(false);
  const [pendingLeadId, setPendingLeadId] = useState<string | null>(null);
  const [pendingStatus, setPendingStatus] = useState<LeadStatus | null>(null);
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);
  const [isSyncConfigModalOpen, setIsSyncConfigModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isReassignModalOpen, setIsReassignModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Board Drag to Scroll States
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isDraggingBoard, setIsDraggingBoard] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    // Só inicia drag se clicar no fundo do container (não em cards ou botões)
    if (e.target !== e.currentTarget && !(e.target as HTMLElement).classList.contains('kanban-scroll-content')) return;

    setIsDraggingBoard(true);
    setStartX(e.pageX - (scrollContainerRef.current?.offsetLeft || 0));
    setScrollLeft(scrollContainerRef.current?.scrollLeft || 0);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingBoard || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Velocidade de scroll
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDraggingBoard(false);
  };

  // Settle States
  const [isSettleModalOpen, setIsSettleModalOpen] = useState(false);
  const [leadToSettle, setLeadToSettle] = useState<Lead | null>(null);

  const [storedObservation, setStoredObservation] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<LeadStatus | 'ALL'>('ALL');
  const [filterSeller, setFilterSeller] = useState<string>('ALL');
  const [filterDate, setFilterDate] = useState('');

  const [showNewLeadForm, setShowNewLeadForm] = useState(false);
  const [newLeadName, setNewLeadName] = useState('');
  const [newLeadPhone, setNewLeadPhone] = useState('');
  const [newLeadRole, setNewLeadRole] = useState('');

  const isAdmin = user?.role === 'ADMIN';

  const statuses: LeadStatus[] = ['NOVO', 'LIGACAO', 'WHATSAPP', 'SEM_RESPOSTA', 'NEGOCIANDO', 'SINAL', 'GANHO'];

  // Filter leads logic
  const filteredLeads = leads.filter(lead => {
    // Visibility Check (Admin sees all, Seller sees only theirs)
    if (!isAdmin && lead.assignedToId !== user?.id) {
      return false;
    }

    // 7-day rule for lost leads
    if (lead.status === 'SEM_RESPOSTA' && lead.lostAt) {
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

  // Calculate notifications for stale leads from previous day
  const getStaleLeadNotifications = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get leads visible to current user
    const userLeads = leads.filter(lead => {
      if (!isAdmin && lead.assignedToId !== user?.id) {
        return false;
      }
      return true;
    });

    // Group stale leads by status
    const staleByStatus: Record<LeadStatus, number> = {
      'NOVO': 0,
      'LIGACAO': 0,
      'WHATSAPP': 0,
      'SEM_RESPOSTA': 0,
      'NEGOCIANDO': 0,
      'SINAL': 0,
      'GANHO': 0
    };

    userLeads.forEach(lead => {
      // Skip NEGOCIANDO and GANHO statuses
      if (lead.status === 'NEGOCIANDO' || lead.status === 'GANHO') {
        return;
      }

      const updatedAt = new Date(lead.updatedAt);
      updatedAt.setHours(0, 0, 0, 0);

      // Check if lead was last updated before today (yesterday or earlier)
      if (updatedAt < today) {
        staleByStatus[lead.status]++;
      }
    });

    // Convert to array of notifications
    return Object.entries(staleByStatus)
      .filter(([status, count]) => count > 0)
      .map(([status, count]) => ({
        status: status as LeadStatus,
        count
      }));
  };

  const staleNotifications = getStaleLeadNotifications();

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
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return;

    if (lead.status === 'NOVO' && newStatus !== 'NOVO') {
      setPendingLeadId(leadId);
      setPendingStatus(newStatus as LeadStatus);
      setIsObservationModalOpen(true);
    } else {
      finalizeStatusChange(leadId, newStatus as LeadStatus);
    }
  };

  const finalizeStatusChange = (leadId: string, status: LeadStatus, observation?: string) => {
    const lead = leads.find(l => l.id === leadId);

    if (status === 'GANHO') {
      if (lead?.status === 'SINAL') {
        // Se já era SINAL, move direto para GANHO (quita o sinal)
        updateLeadStatus(leadId, 'GANHO', undefined, observation, user ? { id: user.id, name: user.name } : undefined);

        // Efeito de Confete ao quitar sinal
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#26ccff', '#a25afd', '#ff5e7e', '#88ff5a', '#fcff42', '#ffa62d', '#ff36ff']
        });
      } else {
        setActiveLeadId(leadId);
        if (observation) setStoredObservation(observation);
        setIsWonModalOpen(true);
      }
    } else if (status === 'SINAL') {
      setActiveLeadId(leadId);
      if (observation) setStoredObservation(observation);
      setIsSinalModalOpen(true);
    } else {
      updateLeadStatus(leadId, status, undefined, observation, user ? { id: user.id, name: user.name } : undefined);
    }
  };

  const handleObservationSubmit = (observation: string) => {
    if (pendingLeadId && pendingStatus) {
      finalizeStatusChange(pendingLeadId, pendingStatus, observation);
      setIsObservationModalOpen(false);
      setPendingLeadId(null);
      setPendingStatus(null);
    }
  };

  const handleWonSubmit = (data: any) => {
    if (activeLeadId) {
      updateLeadStatus(activeLeadId, 'GANHO', data, storedObservation || undefined, user ? { id: user.id, name: user.name } : undefined);
      setIsWonModalOpen(false);
      setActiveLeadId(null);
      setStoredObservation(null);
    }
  };

  const handleSinalSubmit = (data: any) => {
    if (activeLeadId) {
      updateLeadStatus(activeLeadId, 'SINAL', data, storedObservation || undefined, user ? { id: user.id, name: user.name } : undefined);
      setIsSinalModalOpen(false);
      setActiveLeadId(null);
      setStoredObservation(null);
    }
  };

  const handleSettleClick = (lead: Lead) => {
    setLeadToSettle(lead);
    setIsSettleModalOpen(true);
  };

  const handleSettleSubmit = async (data: { amount: number, paymentMethod: string, observation: string }) => {
    if (leadToSettle) {
      await settleDownPayment(leadToSettle.id, data.amount, data.paymentMethod, data.observation);

      // Trigger Confetti
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#26ccff', '#a25afd', '#ff5e7e', '#88ff5a', '#fcff42', '#ffa62d', '#ff36ff']
      });

      setIsSettleModalOpen(false);
      setLeadToSettle(null);
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

  const handleSyncClick = () => {
    if (lastSyncConfig) {
      handleSync(lastSyncConfig.url, { type: lastSyncConfig.assignmentType || 'SINGLE', sellerId: lastSyncConfig.sellerId });
    } else {
      setIsSyncConfigModalOpen(true);
    }
  };

  const handleSyncConfigSubmit = (url: string, type: 'SINGLE' | 'EQUAL', sellerId: string) => {
    handleSync(url, { type, sellerId });
    setIsSyncConfigModalOpen(false);
  };

  const handleSync = async (url: string, assignmentConfig: any) => {
    setIsSyncing(true);
    try {
      let fetchUrl = url;
      if (fetchUrl.includes('/edit')) fetchUrl = fetchUrl.split('/edit')[0] + '/export?format=csv';
      const response = await fetch(fetchUrl);
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

      importLeads(parsed, 0, assignmentConfig, url);
    } catch (error) {
      alert("Erro na sincronização. Verifique o link e tente novamente.");
    } finally {
      setIsSyncing(false);
    }
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
      <SyncConfigModal
        isOpen={isSyncConfigModalOpen}
        onClose={() => setIsSyncConfigModalOpen(false)}
        onConfirm={handleSyncConfigSubmit}
        team={team}
      />

      {/* Notification Banner for Stale Leads */}
      {staleNotifications.length > 0 && (
        <div className="mb-4 space-y-2">
          {staleNotifications.map(notification => (
            <div
              key={notification.status}
              className="bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-500 p-4 rounded-lg shadow-sm flex items-center gap-3 animate-fade-in"
            >
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-amber-600" />
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-amber-900">
                  Você tem {notification.count} Lead{notification.count > 1 ? 's' : ''} que ainda {notification.count > 1 ? 'estão' : 'está'} no estágio{' '}
                  <span className="text-amber-700 underline decoration-2">
                    {STATUS_LABELS[notification.status]}
                  </span>
                </p>
                <p className="text-xs text-amber-700 mt-0.5">
                  {notification.count > 1 ? 'Estes leads não foram movidos' : 'Este lead não foi movido'} desde ontem. Que tal dar atenção a {notification.count > 1 ? 'eles' : 'ele'}?
                </p>
              </div>
              <button
                onClick={() => setFilterStatus(notification.status)}
                className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-xs font-bold shadow-sm flex items-center gap-1"
              >
                <Target className="w-3 h-3" />
                Ver Leads
              </button>
            </div>
          ))}
        </div>
      )}

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
          <button
            onClick={handleSyncClick}
            disabled={isSyncing}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow-sm transition-all text-sm font-bold ${lastSyncConfig ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-300'}`}
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Sincronizando...' : (lastSyncConfig ? 'Sincronizar' : 'Configurar Sync')}
          </button>
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

      <div className="flex-1 kanban-container min-h-0">
        <div
          ref={scrollContainerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className={`kanban-scroll-wrapper h-full pb-4 scroll-smooth ${isDraggingBoard ? 'cursor-grabbing select-none' : 'cursor-default'}`}
        >
          <div className="kanban-scroll-content flex gap-4 min-w-[1200px] h-full pointer-events-none *:pointer-events-auto">
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
                      const hasDownPayment = lead.hasDownPayment || false;

                      return (
                        <div
                          key={lead.id}
                          draggable={selectedLeads.length === 0}
                          onDragStart={(e) => onDragStart(e, lead.id)}
                          className={`p-4 rounded-lg shadow-sm border-2 transition-all cursor-grab active:cursor-grabbing relative group ${hasDownPayment
                            ? 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-300'
                            : 'bg-white'
                            } ${draggedLeadId === lead.id ? 'opacity-50' : 'opacity-100'} ${isSelected ? 'border-blue-500 bg-blue-50 shadow-md scale-[0.98]' : hasDownPayment ? 'border-amber-300 hover:shadow-md' : 'border-transparent hover:shadow-md'}`}
                        >
                          {isAdmin && (
                            <button
                              onClick={() => toggleLeadSelection(lead.id)}
                              className={`absolute -top-2 -left-2 p-1 rounded-full shadow-md z-10 transition-colors ${isSelected ? 'bg-blue-600 text-white' : 'bg-white text-gray-300 hover:text-gray-400 border border-gray-100'}`}
                            >
                              {isSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                            </button>
                          )}

                          {/* Badge de Sinal Pendente */}
                          {hasDownPayment && (
                            <div className="absolute -top-2 -right-2 bg-amber-500 text-white text-[9px] font-bold px-2 py-1 rounded-full shadow-md z-10 flex items-center gap-1">
                              <span>⚠</span> Sinal Pendente
                            </div>
                          )}

                          {/* Barra de Ações (Fica no Topo e aparece no Hover) */}
                          <div className="absolute top-2 left-1/2 -translate-x-1/2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 z-20 scale-90 group-hover:scale-100 pointer-events-none group-hover:pointer-events-auto">
                            <a
                              href={getWhatsAppLink(lead, isAdmin ? (assignedTo?.name || user?.name) : user?.name)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-green-500 hover:bg-green-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black shadow-lg flex items-center gap-2 transition-transform hover:scale-110 active:scale-95 whitespace-nowrap"
                            >
                              <MessageCircle className="w-3.5 h-3.5" /> Falar no WhatsApp
                            </a>
                          </div>

                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-bold text-gray-800 text-sm leading-tight">{lead.name}</h4>
                            <div className="relative group/menu">
                              <button className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100 transition-colors"><MoreHorizontal className="w-4 h-4" /></button>
                              <div className="absolute right-0 top-full mt-1 w-48 bg-white border rounded shadow-2xl hidden group-hover/menu:block z-30 py-1.5 animate-fade-in">
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

                          {/* Exibição de Valores - Diferente para sinal vs pagamento completo */}
                          {lead.saleValue && (
                            <div className={`mt-3 pt-3 border-t text-[10px] flex flex-col gap-1.5 ${hasDownPayment ? 'border-amber-200' : 'border-gray-200'}`}>
                              {hasDownPayment ? (
                                <>
                                  <div className="flex justify-between items-center">
                                    <span className="text-amber-700 font-medium">Valor Total:</span>
                                    <span className="font-bold text-gray-800">R$ {lead.saleValue.toLocaleString()}</span>
                                  </div>
                                  <div className="flex justify-between items-center bg-amber-100 px-2 py-1 rounded">
                                    <span className="text-amber-800 font-bold">Sinal Pago:</span>
                                    <span className="font-bold text-amber-900">R$ {(lead.downPaymentValue || 0).toLocaleString()}</span>
                                  </div>
                                  <div className="flex justify-between items-center bg-white px-2 py-1 rounded border border-amber-200">
                                    <span className="text-red-700 font-bold">Saldo Restante:</span>
                                    <span className="font-black text-red-600">R$ {(lead.remainingBalance || 0).toLocaleString()}</span>
                                  </div>
                                  <div className="text-[9px] text-amber-600 font-bold text-center mt-1 animate-pulse italic">
                                    Arraste para "Fechados" para quitar
                                  </div>
                                </>
                              ) : (
                                <div className="flex justify-between items-center">
                                  <span className="font-bold text-green-600 text-sm">R$ {lead.saleValue.toLocaleString()}</span>
                                </div>
                              )}
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
      </div>

      <WonDealModal
        isOpen={isWonModalOpen}
        onClose={() => setIsWonModalOpen(false)}
        onSubmit={handleWonSubmit}
        team={team}
        immersiveClasses={immersiveClasses}
      />

      <SinalDealModal
        isOpen={isSinalModalOpen}
        onClose={() => setIsSinalModalOpen(false)}
        onSubmit={handleSinalSubmit}
        team={team}
        immersiveClasses={immersiveClasses}
      />

      <SettlePaymentModal
        isOpen={isSettleModalOpen}
        onClose={() => setIsSettleModalOpen(false)}
        onSubmit={handleSettleSubmit}
        lead={leadToSettle}
      />

      <ImportModal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} onImport={handleImport} team={team} immersiveClasses={immersiveClasses} />
      <ObservationModal isOpen={isObservationModalOpen} onClose={() => setIsObservationModalOpen(false)} onSubmit={handleObservationSubmit} />
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
