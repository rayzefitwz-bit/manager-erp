
import React from 'react';
import { useApp } from '../context/AppContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Users, Wallet, Target, MapPin } from 'lucide-react';

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
  const { transactions, leads, immersiveClasses } = useApp();

  // Financeiro Geral
  const totalIncome = transactions
    .filter(t => t.type === 'INCOME')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalExpense = transactions
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
    { name: 'Financeiro', Receitas: totalIncome, Despesas: totalExpense }
  ];

  const leadStatusData = [
    { name: 'Novos', value: leads.filter(l => l.status === 'NOVO').length },
    { name: 'Negociando', value: leads.filter(l => l.status === 'NEGOCIANDO').length },
    { name: 'Ganhos', value: totalWonLeads },
    { name: 'Perdidos', value: leads.filter(l => l.status === 'PERDIDO').length },
  ];

  const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#ef4444'];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Dashboard Geral</h2>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card title="Receita Total" value={`R$ ${totalIncome.toLocaleString()}`} icon={TrendingUp} color="bg-green-500" />
        <Card title="Investimento Leads" value={`R$ ${totalLeadInvestment.toLocaleString()}`} icon={Target} color="bg-blue-600" />
        <Card title="CAC Geral" value={`R$ ${generalCAC.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} icon={Wallet} color="bg-indigo-600" subtitle="Custo por Matrícula" />
        <Card title="Taxa Conversão" value={`${conversionRate}%`} icon={Users} color="bg-purple-500" />
      </div>

      {/* CAC Analysis by Class */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
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
