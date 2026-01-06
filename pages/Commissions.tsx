
import React from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { CommissionReport } from '../types';
import { Trophy, GraduationCap, Calendar, Filter } from 'lucide-react';
import { useState } from 'react';

export const Commissions = () => {
  const { team, leads, payCommission, commissionPayments } = useApp();
  const { user } = useAuth();

  const isAdmin = user?.role === 'ADMIN';

  // State for Month Filter (YYYY-MM)
  const now = new Date();
  const currentMonthValue = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const [selectedMonth, setSelectedMonth] = useState(currentMonthValue);

  const filterBySelectedMonth = (dateStr: string | undefined) => {
    if (!dateStr) return false;
    return dateStr.startsWith(selectedMonth);
  };

  // SELLERS Report (Filtered by unpaid leads AND selected month)
  const sellerReports = team
    .filter(t => t.role === 'VENDEDOR')
    .map(member => {
      const sales = leads.filter(l =>
        l.assignedToId === member.id &&
        l.status === 'GANHO' &&
        !l.commissionPaymentId &&
        filterBySelectedMonth(l.createdAt)
      );
      const count = sales.length;
      const volume = sales.reduce((acc, curr) => acc + (curr.saleValue || 0), 0);

      const rate = count > 25 ? 0.10 : 0.05;
      const commission = volume * rate;

      return {
        memberId: member.id,
        name: member.name,
        count,
        volume,
        rate,
        commission
      };
    })
    .filter(r => isAdmin || r.memberId === user?.id)
    .sort((a, b) => b.volume - a.volume);

  // TEACHERS Report (Filtered by selected month)
  const teacherReports = team
    .filter(t => t.role === 'PROFESSOR')
    .map(member => {
      const isPaid = commissionPayments.some(p => p.memberId === member.id && p.type === 'TEACHER');
      return {
        memberId: member.id,
        name: member.name,
        city: member.city,
        date: member.date,
        amount: member.commissionRate || 0,
        isPaid
      };
    })
    .filter(r => isAdmin && filterBySelectedMonth(r.date));

  const totalSellersToPay = sellerReports.reduce((acc, curr) => acc + curr.commission, 0);
  const totalTeachersToPay = teacherReports.filter(r => !r.isPaid).reduce((acc, curr) => acc + curr.amount, 0);

  const handlePaySeller = async (report: any) => {
    if (window.confirm(`Confirmar pagamento de R$ ${report.commission.toLocaleString()} para ${report.name}?`)) {
      await payCommission(report.memberId, report.commission, 'SELLER', report.name);
    }
  };

  const handlePayTeacher = async (report: any) => {
    if (window.confirm(`Confirmar pagamento de R$ ${report.amount.toLocaleString()} para o professor ${report.name}?`)) {
      await payCommission(report.memberId, report.amount, 'TEACHER', report.name);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Comissões</h2>
          <p className="text-sm text-gray-500">Gestão de pagamentos e bonificações</p>
        </div>

        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-gray-100 shadow-sm">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-700">Mês de Referência:</span>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="text-sm font-bold text-blue-600 bg-transparent border-none focus:ring-0 cursor-pointer"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 rounded-xl shadow-lg text-white flex justify-between items-center">
          <div>
            <p className="text-blue-100 mb-1">Comissões Vendedores (Aberto)</p>
            <h3 className="text-3xl font-bold">R$ {totalSellersToPay.toLocaleString()}</h3>
          </div>
          <Trophy className="w-10 h-10 text-blue-200/50" />
        </div>

        {isAdmin && (
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 rounded-xl shadow-lg text-white flex justify-between items-center">
            <div>
              <p className="text-purple-100 mb-1">Comissões Professores (Aberto)</p>
              <h3 className="text-3xl font-bold">R$ {totalTeachersToPay.toLocaleString()}</h3>
            </div>
            <GraduationCap className="w-10 h-10 text-purple-200/50" />
          </div>
        )}
      </div>

      {/* Vendedores */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b flex justify-between items-center">
          <div>
            <h3 className="font-bold text-gray-800">Desempenho Vendedores</h3>
            <p className="text-sm text-gray-400 mt-1">Regra: Até 25 matrículas (5%), Acima de 26 (10%)</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-600 text-sm">
              <tr>
                <th className="p-4">Vendedor</th>
                <th className="p-4 text-center">Matrículas</th>
                <th className="p-4 text-right">Volume</th>
                <th className="p-4 text-center">Taxa</th>
                <th className="p-4 text-right">Comissão</th>
                {isAdmin && <th className="p-4 text-center">Ações</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sellerReports.map(report => (
                <tr key={report.memberId} className="hover:bg-gray-50">
                  <td className="p-4 font-medium text-gray-800">{report.name}</td>
                  <td className="p-4 text-center">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-bold">
                      {report.count}
                    </span>
                  </td>
                  <td className="p-4 text-right text-gray-600 font-medium">R$ {report.volume.toLocaleString()}</td>
                  <td className="p-4 text-center font-bold text-xs text-gray-500">{(report.rate * 100).toFixed(0)}%</td>
                  <td className="p-4 text-right font-black text-green-600">R$ {report.commission.toLocaleString()}</td>
                  {isAdmin && (
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handlePaySeller(report)}
                        disabled={report.commission === 0}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
                      >
                        Pagar
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Professores - Somente Admin */}
      {isAdmin && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b">
            <h3 className="font-bold text-gray-800">Comissões Professores</h3>
            <p className="text-sm text-gray-400 mt-1">Pagamentos devidos por turma/aula.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-600 text-sm">
                <tr>
                  <th className="p-4">Professor</th>
                  <th className="p-4">Turma/Cidade</th>
                  <th className="p-4">Data</th>
                  <th className="p-4 text-right">Comissão</th>
                  <th className="p-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {teacherReports.map(report => (
                  <tr key={report.memberId} className="hover:bg-gray-50">
                    <td className="p-4 font-medium text-gray-800">
                      <div className="flex flex-col">
                        <span>{report.name}</span>
                        {report.isPaid && (
                          <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-black uppercase w-fit mt-1">
                            Pago
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-600">{report.city || 'N/A'}</td>
                    <td className="p-4 text-sm text-gray-600">{report.date || 'N/A'}</td>
                    <td className="p-4 text-right font-black text-purple-600">R$ {report.amount.toLocaleString()}</td>
                    <td className="p-4 text-center">
                      {!report.isPaid ? (
                        <button
                          onClick={() => handlePayTeacher(report)}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded-lg text-xs font-bold transition-colors"
                        >
                          Baixar
                        </button>
                      ) : (
                        <span className="text-gray-400 text-xs font-medium">Lançado</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
