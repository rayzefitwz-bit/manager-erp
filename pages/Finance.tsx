
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ArrowDownCircle, ArrowUpCircle, Info } from 'lucide-react';
import { clsx } from 'clsx';

const CATEGORIES = ['Vendas', 'Leads', 'Marketing', 'Aluguel', 'Operacional', 'Comissões', 'Geral'];

export const Finance = () => {
  const { transactions, addTransaction, immersiveClasses } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    type: 'INCOME',
    amount: '',
    description: '',
    category: 'Geral',
    classLocation: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.amount && formData.description) {
      // Se a categoria for leads, precisa de turma
      if (formData.category === 'Leads' && !formData.classLocation) {
        alert("Para lançamentos na categoria 'Leads', você deve selecionar a turma correspondente.");
        return;
      }

      addTransaction({
        type: formData.type as 'INCOME' | 'EXPENSE',
        amount: Number(formData.amount),
        description: formData.description,
        category: formData.category,
        date: new Date().toISOString(),
        classLocation: formData.category === 'Leads' ? formData.classLocation : undefined
      });
      setFormData({ type: 'INCOME', amount: '', description: '', category: 'Geral', classLocation: '' });
      setShowForm(false);
    }
  };

  const totalIncome = transactions
    .filter(t => t.type === 'INCOME')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Financeiro</h2>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-bold shadow-sm transition-all"
        >
          {showForm ? 'Cancelar' : 'Nova Transação'}
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500">
           <p className="text-gray-500 text-sm">Entradas Totais</p>
           <h3 className="text-2xl font-bold text-green-700">R$ {totalIncome.toLocaleString()}</h3>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-red-500">
           <p className="text-gray-500 text-sm">Saídas Totais</p>
           <h3 className="text-2xl font-bold text-red-700">R$ {totalExpense.toLocaleString()}</h3>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500">
           <p className="text-gray-500 text-sm">Saldo Atual</p>
           <h3 className={clsx("text-2xl font-bold", totalIncome - totalExpense >= 0 ? 'text-blue-700' : 'text-red-700')}>
             R$ {(totalIncome - totalExpense).toLocaleString()}
           </h3>
        </div>
      </div>

      {/* Manual Entry Form */}
      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow-md border border-blue-100 animate-fade-in">
          <h3 className="font-bold mb-4 text-gray-800">Adicionar Movimentação</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
             <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
               <div>
                 <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tipo</label>
                 <select 
                   className="w-full border p-2.5 rounded-lg text-sm"
                   value={formData.type}
                   onChange={e => setFormData({...formData, type: e.target.value})}
                 >
                   <option value="INCOME">Entrada (+)</option>
                   <option value="EXPENSE">Saída (-)</option>
                 </select>
               </div>
               <div className="md:col-span-2">
                 <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Descrição</label>
                 <input 
                   className="w-full border p-2.5 rounded-lg text-sm"
                   value={formData.description}
                   onChange={e => setFormData({...formData, description: e.target.value})}
                   placeholder="Ex: Pagamento Hotmart, Tráfego Pago Google..."
                   required
                 />
               </div>
               <div>
                 <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Valor (R$)</label>
                 <input 
                   type="number"
                   className="w-full border p-2.5 rounded-lg text-sm"
                   value={formData.amount}
                   onChange={e => setFormData({...formData, amount: e.target.value})}
                   placeholder="0.00"
                   required
                 />
               </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Categoria</label>
                  <select 
                    className="w-full border p-2.5 rounded-lg text-sm"
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value, classLocation: e.target.value === 'Leads' ? formData.classLocation : ''})}
                  >
                    {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>

                {formData.category === 'Leads' && (
                  <div className="animate-fade-in">
                    <label className="block text-xs font-bold text-blue-600 uppercase mb-1 flex items-center gap-1">
                      Turma Associada <Info className="w-3 h-3" />
                    </label>
                    <select 
                      className="w-full border-2 border-blue-200 p-2.5 rounded-lg text-sm focus:border-blue-500 outline-none"
                      value={formData.classLocation}
                      onChange={e => setFormData({...formData, classLocation: e.target.value})}
                      required
                    >
                      <option value="">Selecione a turma para cálculo de CAC...</option>
                      {immersiveClasses.map(cls => (
                        <option key={cls.id} value={cls.city}>{cls.city} ({cls.date})</option>
                      ))}
                    </select>
                  </div>
                )}
             </div>

             <div className="flex justify-end pt-2">
                <button type="submit" className="bg-green-600 text-white py-2.5 px-8 rounded-lg font-bold hover:bg-green-700 transition-colors shadow-sm">
                  Salvar Transação
                </button>
             </div>
          </form>
        </div>
      )}

      {/* Transaction History */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b flex justify-between items-center">
          <h3 className="font-bold text-gray-800">Histórico de Movimentações</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-600 text-xs font-bold uppercase tracking-wider">
              <tr>
                <th className="p-4">Data</th>
                <th className="p-4">Descrição</th>
                <th className="p-4">Categoria</th>
                <th className="p-4">Turma (CAC)</th>
                <th className="p-4 text-right">Valor</th>
                <th className="p-4 text-center">Tipo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {transactions.length === 0 && (
                <tr><td colSpan={6} className="p-8 text-center text-gray-400 italic">Nenhuma movimentação registrada.</td></tr>
              )}
              {transactions.map(t => (
                <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 text-sm text-gray-600">{new Date(t.date).toLocaleDateString()}</td>
                  <td className="p-4 font-medium text-gray-800">{t.description}</td>
                  <td className="p-4 text-sm text-gray-500">
                    <span className={clsx(
                      "px-2 py-1 rounded text-[10px] font-bold uppercase",
                      t.category === 'Leads' ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"
                    )}>{t.category}</span>
                  </td>
                  <td className="p-4 text-sm">
                    {t.classLocation ? (
                      <span className="text-indigo-600 font-bold bg-indigo-50 px-2 py-1 rounded text-[10px] uppercase border border-indigo-100">{t.classLocation}</span>
                    ) : (
                      <span className="text-gray-300">-</span>
                    )}
                  </td>
                  <td className={clsx("p-4 text-right font-bold", t.type === 'INCOME' ? 'text-green-600' : 'text-red-600')}>
                    {t.type === 'EXPENSE' ? '-' : '+'} R$ {t.amount.toLocaleString()}
                  </td>
                  <td className="p-4 text-center">
                    {t.type === 'INCOME' ? <ArrowUpCircle className="inline text-green-500 w-5 h-5"/> : <ArrowDownCircle className="inline text-red-500 w-5 h-5"/>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
