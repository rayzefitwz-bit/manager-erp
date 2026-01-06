// Dashboard - Última atualização: Janeiro 2026

import React from 'react';
import { useApp } from '../context/AppContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Users, Wallet, Target, MapPin, Award, Trophy, Star, GraduationCap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { clsx } from 'clsx';

const Card = ({ title, value, icon: Icon, color, subtitle }: any) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
    <div>
      <p className="text-sm text-gray-500 font-medium mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
      {subtitle && <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-tight">{subtitle}</p>}
    </div>
    <div className={`p-3 rounded-full ${color}`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
  </div>
);

export const Dashboard = () => {
  const { transactions, leads, immersiveClasses, team } = useApp();
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  // Filtrar dados para o mês atual
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const isCurrentMonth = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  };

  // Financeiro Geral (Mês Atual)
  const monthlyTransactions = transactions.filter(t => isCurrentMonth(t.date));
  const monthlyIncome = monthlyTransactions
    .filter(t => t.type === 'INCOME')
    .reduce((acc, curr) => acc + curr.amount, 0);

  // Matrículas Geral (Mês Atual)
  const monthlyWonLeads = leads.filter(l => l.status === 'GANHO' && isCurrentMonth(l.createdAt));

  // --- Lógica de Ranqueamento de Vendedores ---
  const sellers = team.filter(m => m.role === 'VENDEDOR');

  const sellerStats = sellers.map(seller => {
    const sellerLeads = leads.filter(l => l.assignedToId === seller.id);
    const sellerWon = sellerLeads.filter(l => l.status === 'GANHO' && isCurrentMonth(l.createdAt));
    const sellerTotalMonth = sellerLeads.filter(l => isCurrentMonth(l.createdAt)).length;

    const revenue = sellerWon.reduce((acc, curr) => acc + (curr.saleValue || 0), 0);
    const conversion = sellerTotalMonth > 0 ? (sellerWon.length / sellerTotalMonth) * 100 : 0;

    return {
      id: seller.id,
      name: seller.name,
      revenue,
      enrollments: sellerWon.length,
      conversion,
      totalLeads: sellerTotalMonth
    };
  });

  // Ranking por Faturamento (Revenue)
  const rankingByRevenue = [...sellerStats].sort((a, b) => b.revenue - a.revenue);
  const myRankIndex = rankingByRevenue.findIndex(s => s.id === user?.id);
  const myRank = myRankIndex !== -1 ? myRankIndex + 1 : '-';

  // Ranking por Conversão (Top Performer)
  const rankingByConversion = [...sellerStats].sort((a, b) => b.conversion - a.conversion);
  const topPerformer = rankingByConversion[0];

  // Financeiro Geral
  const adminTotalIncome = transactions
    .filter(t => t.type === 'INCOME')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const adminTotalExpense = transactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((acc, curr) => acc + curr.amount, 0);

  // Análise de CAC Geral
  const totalLeadInvestment = transactions
    .filter(t => t.type === 'EXPENSE' && t.category === 'Leads')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalWonLeads = leads.filter(l => l.status === 'GANHO').length;
  const generalCAC = totalWonLeads > 0 ? (totalLeadInvestment / totalWonLeads) : 0;

  // Análise de CAC por Turma
  const cacByClass = immersiveClasses.map(cls => {
    const classInvestment = transactions
      .filter(t => t.type === 'EXPENSE' && t.category === 'Leads' && t.classLocation === cls.city)
      .reduce((acc, curr) => acc + curr.amount, 0);

    const classWonLeads = leads.filter(l => l.status === 'GANHO' && l.classLocation === cls.city).length;
    const classCAC = classWonLeads > 0 ? (classInvestment / classWonLeads) : 0;

    return {
      name: cls.city,
      investment: classInvestment,
      won: classWonLeads,
      cac: classCAC
    };
  });

  const totalLeads = leads.length;
  const conversionRate = totalLeads > 0 ? ((totalWonLeads / totalLeads) * 100).toFixed(1) : '0';

  const chartData = [
    { name: 'Financeiro', Receitas: adminTotalIncome, Despesas: adminTotalExpense }
  ];

  const leadStatusData = [
    { name: 'Novos', value: leads.filter(l => l.status === 'NOVO').length },
    { name: 'Negociando', value: leads.filter(l => l.status === 'NEGOCIANDO').length },
    { name: 'Ganhos', value: totalWonLeads },
    { name: 'Não Responde', value: leads.filter(l => l.status === 'SEM_RESPOSTA').length },
  ];

  const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#ef4444'];

  if (!isAdmin) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Dashboard do Vendedor</h2>
            <p className="text-gray-500">Acompanhe seu desempenho e ranking no time</p>
          </div>
          <div className="bg-blue-50 px-4 py-2 rounded-lg border border-blue-100 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-bold text-blue-800">Meu Ranking: <span className="text-lg">{myRank}º</span> Lugar</span>
          </div>
        </div>

        {/* KPI Cards Seller */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card
            title="Matrículas no Mês"
            value={monthlyWonLeads.length}
            icon={GraduationCap}
            color="bg-green-500"
            subtitle="Total de Alunos Novos"
          />
          <Card
            title="Faturamento do Mês"
            value={`R$ ${monthlyIncome.toLocaleString()}`}
            icon={TrendingUp}
            color="bg-blue-600"
            subtitle="Receita Global"
          />
          <Card
            title="Minha Conversão"
            value={`${(sellerStats.find(s => s.id === user?.id)?.conversion || 0).toFixed(1)}%`}
            icon={Target}
            color="bg-purple-500"
            subtitle="Mês Atual"
          />
        </div>

        {/* Matrículas por Turma (Global) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4 text-indigo-800">
            <MapPin className="w-5 h-5" />
            <h3 className="text-lg font-bold">Matrículas por Turma</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {cacByClass.map(item => (
              <div key={item.name} className="p-4 bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-between">
                <div>
                  <p className="font-bold text-gray-800 text-sm">{item.name}</p>
                  <p className="text-[10px] text-gray-400 uppercase font-black">Performance Global</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-indigo-700">{item.won}</p>
                  <p className="text-[10px] text-gray-400 font-bold">Alunos</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Leaderboard */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-6 text-indigo-800">
              <Award className="w-5 h-5" />
              <h3 className="text-lg font-bold">Ranqueamento por Faturamento</h3>
            </div>
            <div className="space-y-4">
              {rankingByRevenue.map((s, idx) => (
                <div
                  key={s.id}
                  className={clsx(
                    "flex items-center justify-between p-4 rounded-xl border transition-all",
                    s.id === user?.id ? "bg-blue-50 border-blue-200 shadow-sm" : "bg-gray-50 border-gray-100"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className={clsx(
                      "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm",
                      idx === 0 ? "bg-yellow-400 text-white" :
                        idx === 1 ? "bg-gray-300 text-white" :
                          idx === 2 ? "bg-amber-600 text-white" : "bg-white text-gray-400 border border-gray-200"
                    )}>
                      {idx + 1}
                    </div>
                    <div>
                      <p className="font-bold text-gray-800">{s.name}</p>
                      <p className="text-[10px] text-gray-400 uppercase font-black">{s.enrollments} Matrículas</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-blue-700">R$ {s.revenue.toLocaleString()}</p>
                    <p className="text-[10px] text-gray-400 font-bold">{s.conversion.toFixed(1)}% Conv.</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Performance Insight */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center text-center">
            <div className="mb-6">
              <div className="w-20 h-20 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-yellow-100">
                <Star className="w-10 h-10 text-yellow-500 fill-yellow-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Destaque do Mês</h3>
              <p className="text-gray-500 text-sm">O vendedor com a melhor taxa de conversão atualmente é:</p>
            </div>
            {topPerformer ? (
              <div className="p-6 bg-gradient-to-br from-indigo-600 to-blue-700 rounded-2xl text-white shadow-lg">
                <p className="text-xs uppercase font-black tracking-widest opacity-70 mb-1">Performance Elite</p>
                <h4 className="text-2xl font-black mb-1">{topPerformer.name}</h4>
                <div className="flex justify-center gap-6 mt-4">
                  <div>
                    <p className="text-[10px] uppercase font-bold opacity-70">Taxa</p>
                    <p className="text-xl font-black">{topPerformer.conversion.toFixed(1)}%</p>
                  </div>
                  <div className="w-px h-8 bg-white/20" />
                  <div>
                    <p className="text-[10px] uppercase font-bold opacity-70">Matrículas</p>
                    <p className="text-xl font-black">{topPerformer.enrollments}</p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-400 italic">Aguardando dados de performance...</p>
            )}

            <div className="mt-8 p-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <p className="text-xs text-gray-500">Mantenha seu CRM atualizado para garantir a precisão do seu ranking!</p>
            </div>
          </div>
        </div>
      </div >
    );
  }

  // FINANCEIRO GERAL (ADMIN)
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Dashboard Geral</h2>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card title="Receita Total" value={`R$ ${adminTotalIncome.toLocaleString()}`} icon={TrendingUp} color="bg-green-500" />
        <Card title="Investimento Leads" value={`R$ ${totalLeadInvestment.toLocaleString()}`} icon={Target} color="bg-blue-600" />
        <Card title="CAC Geral" value={`R$ ${generalCAC.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} icon={Wallet} color="bg-indigo-600" subtitle="Custo por Matrícula" />
        <Card title="Taxa Conversão" value={`${conversionRate}%`} icon={Users} color="bg-purple-500" />
      </div>
      <div className="flex items-center gap-2 mb-6">
        <MapPin className="text-indigo-600 w-5 h-5" />
        <h3 className="text-lg font-bold text-gray-800">Análise de CAC por Turma</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cacByClass.map(item => (
          <div key={item.name} className="p-4 bg-gray-50 rounded-lg border border-gray-100">
            <p className="font-bold text-gray-800 mb-1">{item.name}</p>
            <div className="flex justify-between text-[11px] text-gray-500 mb-2">
              <span>Investido: R$ {item.investment.toLocaleString()}</span>
              <span>Alunos: {item.won}</span>
            </div>
            <div className="flex items-end justify-between">
              <p className="text-xs text-gray-400">CAC da Turma</p>
              <p className="font-black text-indigo-700 text-lg">R$ {item.cac.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Financial Flow */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Fluxo Financeiro</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `R$ ${value.toLocaleString()}`} />
                <Legend />
                <Bar dataKey="Receitas" fill="#10b981" />
                <Bar dataKey="Despesas" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Lead Status Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Funil de Vendas</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={leadStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {leadStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
