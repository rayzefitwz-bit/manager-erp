import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Search, Plus, Trash2, RefreshCw, Globe, Building2, Phone, Tag, Link as LinkIcon, ExternalLink } from 'lucide-react';
import { clsx } from 'clsx';

export const Suppliers = () => {
    const { suppliers, addSupplier, removeSupplier, syncSuppliers, suppliersSyncUrl } = useApp();
    const [searchTerm, setSearchTerm] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [tempSyncUrl, setTempSyncUrl] = useState(suppliersSyncUrl || '');

    // Manual Form State
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        category: '',
        price: ''
    });

    const filteredSuppliers = suppliers.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.phone.includes(searchTerm)
    );

    const handleManualSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.name && formData.phone && formData.category) {
            addSupplier({
                ...formData,
                price: formData.price ? Number(formData.price) : undefined
            });
            setFormData({ name: '', phone: '', category: '', price: '' });
            setShowForm(false);
        }
    };

    const handleSync = async () => {
        if (!tempSyncUrl) return;
        setIsSyncing(true);
        await syncSuppliers(tempSyncUrl);
        setIsSyncing(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 uppercase tracking-tight">Fornecedores</h2>
                    <p className="text-gray-500 text-sm">Gestão manual e sincronização via Google Sheets</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 shadow-sm font-bold transition-all"
                >
                    {showForm ? 'Cancelar' : <><Plus className="w-4 h-4" /> Novo Fornecedor</>}
                </button>
            </div>

            {/* Sync Section */}
            <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-100 shadow-sm">
                <div className="flex items-center gap-2 mb-4 text-indigo-800">
                    <Globe className="w-5 h-5" />
                    <h3 className="font-bold">Sincronização Automática (Planilha)</h3>
                </div>
                <div className="flex flex-col md:flex-row gap-3">
                    <div className="relative flex-1">
                        <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400" />
                        <input
                            className="w-full pl-10 pr-4 py-2.5 rounded-lg border-2 border-indigo-200 focus:border-indigo-500 outline-none text-sm shadow-inner"
                            placeholder="Cole o link da planilha aqui (Coluna A: Nome, B: Telefone, C: Categoria, D: Preço)"
                            value={tempSyncUrl}
                            onChange={e => setTempSyncUrl(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={handleSync}
                        disabled={isSyncing || !tempSyncUrl}
                        className={clsx(
                            "px-6 py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 transition-all shadow-sm shrink-0",
                            isSyncing || !tempSyncUrl ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-indigo-600 text-white hover:bg-indigo-700"
                        )}
                    >
                        <RefreshCw className={clsx("w-4 h-4", isSyncing && "animate-spin")} />
                        {isSyncing ? 'Sincronizando...' : 'Sincronizar Agora'}
                    </button>
                </div>
                <p className="text-[10px] text-indigo-500 mt-2 font-medium">A planilha deve estar pública ou compartilhada para Visualização e seguir a ordem: Nome, Telefone, Categoria, Preço (opcional).</p>
            </div>

            {/* Search & Manual Form */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Buscar por nome, categoria ou telefone..."
                        className="w-full pl-10 pr-4 py-3 bg-white border border-gray-100 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {showForm && (
                <form onSubmit={handleManualSubmit} className="bg-white p-6 rounded-xl shadow-lg border border-blue-100 animate-fade-in">
                    <h3 className="font-bold mb-4 text-gray-800">Cadastro Manual</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nome do Fornecedor</label>
                            <input
                                className="w-full border p-2.5 rounded-lg text-sm"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Ex: Gráfica Express"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Telefone</label>
                            <input
                                className="w-full border p-2.5 rounded-lg text-sm"
                                value={formData.phone}
                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                placeholder="(00) 00000-0000"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Categoria</label>
                            <select
                                className="w-full border p-2.5 rounded-lg text-sm"
                                value={formData.category}
                                onChange={e => setFormData({ ...formData, category: e.target.value })}
                                required
                            >
                                <option value="">Selecione...</option>
                                <option value="Gráfica">Gráfica</option>
                                <option value="Hotel">Hotel</option>
                                <option value="Marketing">Marketing</option>
                                <option value="Alimentação">Alimentação</option>
                                <option value="Transporte">Transporte</option>
                                <option value="Outros">Outros</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Preço Sugerido (R$)</label>
                            <input
                                type="number"
                                className="w-full border p-2.5 rounded-lg text-sm"
                                value={formData.price}
                                onChange={e => setFormData({ ...formData, price: e.target.value })}
                                placeholder="0.00"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end mt-4">
                        <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-700 shadow-sm transition-all">Salvar Fornecedor</button>
                    </div>
                </form>
            )}

            {/* List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 text-gray-400 text-[10px] font-black uppercase tracking-widest border-b">
                            <tr>
                                <th className="p-4">Fornecedor</th>
                                <th className="p-4">Telefone</th>
                                <th className="p-4">Categoria</th>
                                <th className="p-4 text-right">Preço</th>
                                <th className="p-4">Última Atualização</th>
                                <th className="p-4 text-center">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredSuppliers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-12 text-center text-gray-400 italic">Nenhum fornecedor encontrado.</td>
                                </tr>
                            ) : (
                                filteredSuppliers.map(s => (
                                    <tr key={s.id} className="hover:bg-blue-50/30 transition-colors group">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-all">
                                                    <Building2 className="w-4 h-4" />
                                                </div>
                                                <span className="font-bold text-gray-800">{s.name}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-sm text-gray-600">
                                            <div className="flex items-center gap-2">
                                                <Phone className="w-3.5 h-3.5 text-gray-300" />
                                                {s.phone}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className="bg-gray-100 text-gray-600 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                                                {s.category}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right text-sm font-bold text-gray-700">
                                            {s.price ? `R$ ${s.price.toLocaleString()}` : '-'}
                                        </td>
                                        <td className="p-4 text-xs text-gray-400">
                                            {new Date(s.updatedAt).toLocaleString()}
                                        </td>
                                        <td className="p-4 text-center">
                                            <button
                                                onClick={() => removeSupplier(s.id)}
                                                className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                title="Remover"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
