
import React from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { CommissionReport } from '../types';
import { Trophy } from 'lucide-react';

export const Commissions = () => {
  const { team, getSalesBySeller } = useApp();
  const { user } = useAuth();

  const isAdmin = user?.role === 'ADMIN';

  const allReports: CommissionReport[] = team
    .filter(t => t.role === 'VENDEDOR')
    .map(member => {
      const sales = getSalesBySeller(member.id);
      const count = sales.length;
      const volume = sales.reduce((acc, curr) => acc + (curr.saleValue || 0), 0);
      
      // Logic: <= 25 sales = 5%, > 25 sales = 10%
      const rate = count > 25 ? 0.10 : 0.05;
      const commission = volume * rate;

      return {
        sellerId: member.id,
        sellerName: member.name,
        totalSalesCount: count,
        totalSalesVolume: volume,
        commissionRate: rate,
        commissionValue: commission
      };
    })
    .sort((a, b) => b.totalSalesVolume - a.totalSalesVolume);

  // Filtrar se for vendedor
  const reports = isAdmin ? allReports : allReports.filter(r => r.sellerId === user?.id);

  const totalCommissionToPay = reports.reduce((acc, curr) => acc + curr.commissionValue, 0);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Comissões</h2>

      <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 rounded-xl shadow-lg text-white flex justify-between items-center">
        <div>
           <p className="text-purple-100 mb-1">{isAdmin ? "Total de Comissões a Pagar" : "Minha Comissão Prevista"}</p>
           <h3 className="text-3xl font-bold">R$ {totalCommissionToPay.toLocaleString()}</h3>
        </div>
        {isAdmin && (
            <div className="text-right">
               <p className="text-sm text-purple-200">Melhor Vendedor</p>
               <div className="flex items-center gap-2 justify-end">
                 <Trophy className="w-5 h-5 text-yellow-300" />
                 <span className="font-bold text-lg">{allReports[0]?.sellerName || 'N/A'}</span>
               </div>
            </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b">
           <h3 className="font-bold text-gray-800">{isAdmin ? "Detalhamento por Colaborador" : "Meu Desempenho"}</h3>
           <p className="text-sm text-gray-400 mt-1">Regra: Até 25 matrículas (5%), Acima de 26 (10%)</p>
        </div>
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-600 text-sm">
            <tr>
              <th className="p-4">Colaborador</th>
              <th className="p-4 text-center">Matrículas</th>
              <th className="p-4 text-right">Volume de Vendas</th>
              <th className="p-4 text-center">Taxa Aplicada</th>
              <th className="p-4 text-right">Comissão</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {reports.map(report => (
              <tr key={report.sellerId} className="hover:bg-gray-50">
                <td className="p-4 font-medium text-gray-800">{report.sellerName}</td>
                <td className="p-4 text-center">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-bold">
                    {report.totalSalesCount}
                  </span>
                </td>
                <td className="p-4 text-right text-gray-600">R$ {report.totalSalesVolume.toLocaleString()}</td>
                <td className="p-4 text-center">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${report.commissionRate > 0.05 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                    {(report.commissionRate * 100).toFixed(0)}%
                  </span>
                </td>
                <td className="p-4 text-right font-bold text-green-600">
                  R$ {report.commissionValue.toLocaleString()}
                </td>
              </tr>
            ))}
            {reports.length === 0 && (
                <tr><td colSpan={5} className="p-8 text-center text-gray-400">Nenhum registro de venda disponível.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
