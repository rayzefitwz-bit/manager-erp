
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { STATUS_LABELS, STATUS_COLORS } from '../constants';
import { Calendar, User, ArrowRight, MessageSquare, Search, Filter, History } from 'lucide-react';

export const LeadHistory = () => {
    const { leadHistory, team } = useApp();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterSeller, setFilterSeller] = useState('ALL');

    const filteredHistory = leadHistory.filter(entry => {
        const matchesSearch = entry.leadName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (entry.observation && entry.observation.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesSeller = filterSeller === 'ALL' || entry.changedById === filterSeller;
        return matchesSearch && matchesSeller;
    });

    const sellers = team.filter(m => m.role === 'VENDEDOR' || m.role === 'ADMIN');

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                        <History className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Histórico de Leads</h2>
                        <p className="text-sm text-gray-500">Acompanhe todas as mudanças de status e observações da equipe.</p>
                    </div>
                </div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4 items-center flex-wrap">
                <div className="relative flex-1 min-w-[300px]">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar por lead ou observação..."
                        className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                        <Filter className="w-4 h-4" />
                        Vendedor:
                    </div>
                    <select
                        className="border p-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 font-medium cursor-pointer"
                        value={filterSeller}
                        onChange={e => setFilterSeller(e.target.value)}
                    >
                        <option value="ALL">Todos os Vendedores</option>
                        {sellers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Data/Hora</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Lead</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Mudança de Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Vendedor</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Observação</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredHistory.length > 0 ? (
                                filteredHistory.map(entry => (
                                    <tr key={entry.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-gray-400" />
                                                {new Date(entry.createdAt).toLocaleString('pt-BR')}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-bold text-gray-900">{entry.leadName}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                {entry.oldStatus && (
                                                    <>
                                                        <span className={`px-2 py-1 rounded text-[10px] font-bold ${STATUS_COLORS[entry.oldStatus]}`}>
                                                            {STATUS_LABELS[entry.oldStatus]}
                                                        </span>
                                                        <ArrowRight className="w-3 h-3 text-gray-400" />
                                                    </>
                                                )}
                                                <span className={`px-2 py-1 rounded text-[10px] font-bold ${STATUS_COLORS[entry.newStatus]}`}>
                                                    {STATUS_LABELS[entry.newStatus]}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 bg-indigo-50 rounded-full flex items-center justify-center text-[10px] font-bold text-indigo-600 border border-indigo-100">
                                                    {entry.changedByName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                                                </div>
                                                <span className="text-sm text-gray-600 font-medium">{entry.changedByName}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {entry.observation ? (
                                                <div className="flex items-start gap-2 max-w-md">
                                                    <MessageSquare className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                                                    <p className="text-sm text-gray-600 italic bg-blue-50/50 p-2.5 rounded-lg border border-blue-100 leading-relaxed shadow-sm">
                                                        "{entry.observation}"
                                                    </p>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-gray-400 italic font-medium">Nenhuma observação registrada</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <History className="w-12 h-12 text-gray-200" />
                                            <p className="text-gray-500 font-medium">Nenhum registro de histórico encontrado.</p>
                                            <p className="text-gray-400 text-xs text-center max-w-xs">Mude o status de um lead no CRM para começar a registrar o histórico.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
