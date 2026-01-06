import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { utils, writeFile } from 'xlsx';
import { Trash2, Download, Search, AlertCircle, CheckSquare, Square, Inbox } from 'lucide-react';
import { Lead } from '../types';

export const LostLeads = () => {
    const { leads, deleteLeads, team } = useApp();
    const { user } = useAuth();

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    // Filter only lost leads
    const lostLeads = leads.filter(l => l.status === 'PERDIDO').sort((a, b) => {
        return new Date(b.lostAt || b.createdAt).getTime() - new Date(a.lostAt || a.createdAt).getTime();
    });

    const filteredLeads = lostLeads.filter(lead =>
        lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.phone.includes(searchTerm)
    );

    const handleExport = () => {
        const data = filteredLeads.map(lead => ({
            Nome: lead.name,
            Telefone: lead.phone,
            'Data Perda': lead.lostAt ? new Date(lead.lostAt).toLocaleDateString() : 'N/A',
            'Data Criação': new Date(lead.createdAt).toLocaleDateString(),
            'Vendedor Responsável': team.find(t => t.id === lead.assignedToId)?.name || 'N/A',
            Motivo: 'Lead Perdido' // Futuramente pode ser dinâmico
        }));

        const ws = utils.json_to_sheet(data);
        const wb = utils.book_new();
        utils.book_append_sheet(wb, ws, "Leads Perdidos");
        writeFile(wb, "leads_perdidos.xlsx");
    };

    const toggleSelectAll = () => {
        if (selectedLeads.length === filteredLeads.length) {
            setSelectedLeads([]);
        } else {
            setSelectedLeads(filteredLeads.map(l => l.id));
        }
    };

    const toggleSelect = (id: string) => {
        if (selectedLeads.includes(id)) {
            setSelectedLeads(prev => prev.filter(l => l !== id));
        } else {
            setSelectedLeads(prev => [...prev, id]);
        }
    };

    const handleDelete = () => {
        deleteLeads(selectedLeads);
        setIsDeleteModalOpen(false);
        setSelectedLeads([]);
    };

    if (user?.role !== 'ADMIN') {
        return (
            <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                    <AlertCircle className="w-12 h-12 mx-auto mb-2 text-red-500" />
                    <h2 className="text-xl font-bold text-gray-800">Acesso Negado</h2>
                    <p>Esta página é restrita para administradores.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <Inbox className="text-red-500" /> Leads Perdidos
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Gerencie e exporte leads que não converteram</p>
                </div>

                <div className="flex gap-2 w-full md:w-auto">
                    {selectedLeads.length > 0 && (
                        <button
                            onClick={() => setIsDeleteModalOpen(true)}
                            className="flex items-center gap-2 bg-red-100 text-red-700 px-4 py-2 rounded-lg hover:bg-red-200 transition-colors font-medium text-sm"
                        >
                            <Trash2 className="w-4 h-4" /> Deletar ({selectedLeads.length})
                        </button>
                    )}

                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium text-sm ml-auto"
                    >
                        <Download className="w-4 h-4" /> Exportar Excel
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Toolbar */}
                <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Buscar por nome ou telefone..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        />
                    </div>
                    <div className="text-sm text-gray-500 font-medium">
                        Total: {filteredLeads.length} leads
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase text-gray-500 font-semibold">
                                <th className="px-6 py-4 w-12">
                                    <button onClick={toggleSelectAll} className="flex items-center justify-center text-gray-400 hover:text-gray-600">
                                        {selectedLeads.length === filteredLeads.length && filteredLeads.length > 0 ? (
                                            <CheckSquare className="w-5 h-5 text-blue-600" />
                                        ) : (
                                            <Square className="w-5 h-5" />
                                        )}
                                    </button>
                                </th>
                                <th className="px-6 py-4">Lead</th>
                                <th className="px-6 py-4">Data Perda</th>
                                <th className="px-6 py-4">Vendedor Anterior</th>
                                <th className="px-6 py-4 text-center">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredLeads.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                                        <Inbox className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                        Nenhum lead perdido encontrado.
                                    </td>
                                </tr>
                            ) : (
                                filteredLeads.map((lead) => {
                                    const seller = team.find(t => t.id === lead.assignedToId);
                                    const isSelected = selectedLeads.includes(lead.id);

                                    return (
                                        <tr key={lead.id} className={`hover:bg-gray-50 transition-colors group ${isSelected ? 'bg-blue-50/30' : ''}`}>
                                            <td className="px-6 py-4">
                                                <button onClick={() => toggleSelect(lead.id)} className="flex items-center justify-center text-gray-400 hover:text-gray-600">
                                                    {isSelected ? <CheckSquare className="w-5 h-5 text-blue-600" /> : <Square className="w-5 h-5" />}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-semibold text-gray-800">{lead.name}</div>
                                                <div className="text-xs text-gray-500">{lead.phone}</div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {lead.lostAt ? new Date(lead.lostAt).toLocaleDateString() : 'Desconhecida'}
                                                <div className="text-[10px] text-gray-400">Criado em: {new Date(lead.createdAt).toLocaleDateString()}</div>
                                            </td>
                                            <td className="px-6 py-4 text-sm">
                                                {seller ? (
                                                    <span className="flex items-center gap-1.5 text-gray-600 bg-gray-100 px-2 py-1 rounded-full w-fit text-xs font-medium">
                                                        <span className="w-5 h-5 rounded-full bg-white flex items-center justify-center text-[10px] font-bold text-gray-500">
                                                            {seller.name.substring(0, 2).toUpperCase()}
                                                        </span>
                                                        {seller.name}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400 italic text-xs">Sem vendedor</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <button
                                                    onClick={() => {
                                                        if (window.confirm('Deletar este lead permanentemente?')) {
                                                            deleteLeads([lead.id]);
                                                        }
                                                    }}
                                                    className="text-gray-400 hover:text-red-600 transition-colors p-2 rounded-full hover:bg-red-50"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal de Confirmação em Massa */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
                    <div className="bg-white p-6 rounded-xl shadow-xl w-96 animate-fade-in">
                        <h3 className="text-lg font-bold mb-2 text-red-600">⚠️ Confirmar Deleção</h3>
                        <p className="text-sm text-gray-600 mb-4">
                            Tem certeza que deseja deletar <strong>{selectedLeads.length} leads</strong> permanentemente?
                        </p>
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setIsDeleteModalOpen(false)}
                                className="px-4 py-2 text-sm text-gray-500 hover:bg-gray-100 rounded-lg"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleDelete}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-bold"
                            >
                                Deletar Tudo
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
