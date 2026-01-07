
import React from 'react';
import { useApp } from '../context/AppContext';
import { Users, MessageSquare, Briefcase, TrendingUp, UserCheck, DollarSign } from 'lucide-react';
import { STATUS_LABELS } from '../constants';

const StatCard = ({ title, value, icon: Icon, color }: any) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
    <div className={`p-3 rounded-lg ${color}`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
    <div>
      <p className="text-sm text-gray-500 font-medium">{title}</p>
      <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
    </div>
  </div>
);

export const SalesAnalysis = () => {
  const { leads, team } = useApp();
  const sellers = team.filter(m => m.role === 'VENDEDOR');

  // Métricas Gerais
  const totalContacted = leads.filter(l => l.status === 'LIGACAO' || l.status === 'WHATSAPP').length;
  const totalNegotiating = leads.filter(l => l.status === 'NEGOCIANDO').length;
  const totalWon = leads.filter(l => l.status === 'GANHO').length;
  const totalDownPayments = leads.filter(l => l.status === 'SINAL').length;
  const totalLeads = leads.length;

  // Breakdown por Vendedor
  const sellerPerformance = sellers.map(seller => {
    const sellerLeads = leads.filter(l => l.assignedToId === seller.id);
    return {
      id: seller.id,
      name: seller.name,
      contacted: sellerLeads.filter(l => l.status === 'LIGACAO' || l.status === 'WHATSAPP').length,
      negotiating: sellerLeads.filter(l => l.status === 'NEGOCIANDO').length,
      won: sellerLeads.filter(l => l.status === 'GANHO').length,
      downPayments: sellerLeads.filter(l => l.status === 'SINAL').length,
      total: sellerLeads.length
    };
  }).sort((a, b) => (b.contacted + b.negotiating) - (a.contacted + a.negotiating));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Análise Comercial</h2>
          <p className="text-gray-500">Métricas de produtividade e negociações em andamento</p>
        </div>
      </div>

      {/* Resumo Geral */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard
          title="Geral: Contatados"
          value={totalContacted}
          icon={MessageSquare}
          color="bg-yellow-500"
        />
        <StatCard
          title="Geral: Negociando"
          value={totalNegotiating}
          icon={Briefcase}
          color="bg-purple-600"
        />
        <StatCard
          title="Sinais de Matrícula"
          value={totalDownPayments}
          icon={DollarSign}
          color="bg-amber-500"
        />
        <StatCard
          title="Matrículas Completas"
          value={totalWon}
          icon={UserCheck}
          color="bg-green-600"
        />
        <StatCard
          title="Total de Leads"
          value={totalLeads}
          icon={Users}
          color="bg-blue-600"
        />
      </div>

      {/* Desempenho por Vendedor */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Produtividade por Vendedor
          </h3>
          <p className="text-sm text-gray-400 mt-1">Acompanhamento individual de status ativos</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-600 text-xs font-bold uppercase tracking-wider">
              <tr>
                <th className="p-4">Vendedor</th>
                <th className="p-4 text-center">Status: Contatado</th>
                <th className="p-4 text-center">Status: Negociando</th>
                <th className="p-4 text-center">Sinais</th>
                <th className="p-4 text-center">Matrículas</th>
                <th className="p-4 text-center">Total de Leads</th>
                <th className="p-4 text-right">Eficiência (Matrículas/Total)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sellerPerformance.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-400 italic">
                    Nenhum vendedor cadastrado no sistema.
                  </td>
                </tr>
              )}
              {sellerPerformance.map(perf => (
                <tr key={perf.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                        {perf.name.substring(0, 2).toUpperCase()}
                      </div>
                      <span className="font-semibold text-gray-800">{perf.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 font-bold text-sm">
                      {perf.contacted}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-700 font-bold text-sm">
                      {perf.negotiating}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-700 font-bold text-sm">
                      {perf.downPayments}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 font-bold text-sm">
                      {perf.won}
                    </span>
                  </td>
                  <td className="p-4 text-center text-gray-500 font-medium">
                    {perf.total}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-16 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-green-500 h-full"
                          style={{ width: `${perf.total > 0 ? (perf.won / perf.total) * 100 : 0}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-gray-600">
                        {perf.total > 0 ? ((perf.won / perf.total) * 100).toFixed(1) : '0'}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Metas e Alertas (Visual) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h4 className="font-bold text-gray-800 mb-4">Insights de Negociação</h4>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 flex items-center justify-between">
              <span className="text-sm text-blue-800 font-medium">Aproveitamento Médio</span>
              <span className="text-lg font-bold text-blue-900">
                {totalLeads > 0 ? ((totalWon / totalLeads) * 100).toFixed(1) : '0'}%
              </span>
            </div>
            <p className="text-xs text-gray-400">
              * Baseado no volume total de leads importados versus matrículas confirmadas.
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h4 className="font-bold text-gray-800 mb-4">Status Atuais do Funil</h4>
          <div className="space-y-3">
            {Object.entries(STATUS_LABELS).map(([key, label]) => {
              const count = leads.filter(l => l.status === key).length;
              const percent = totalLeads > 0 ? (count / totalLeads) * 100 : 0;
              return (
                <div key={key}>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-gray-600 uppercase tracking-tighter">{label}</span>
                    <span className="text-gray-900">{count}</span>
                  </div>
                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-blue-600 h-full" style={{ width: `${percent}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
