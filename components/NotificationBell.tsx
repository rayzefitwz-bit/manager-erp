
import React, { useState, useEffect } from 'react';
import { Bell, Clock, AlertTriangle, UserPlus } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { clsx } from 'clsx';

export const NotificationBell = () => {
    const { leads, team } = useApp();
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);

    if (user?.role !== 'VENDEDOR') return null;

    const myLeads = leads.filter(l => l.assignedToId === user.id && l.status !== 'GANHO');
    const now = new Date();

    const notifications = myLeads.map(lead => {
        const lastUpdate = new Date(lead.updatedAt || lead.createdAt);
        const diffHours = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60);

        if (diffHours > 48 && diffHours <= 72) {
            return {
                id: `urgent-${lead.id}`,
                type: 'URGENT',
                title: 'URGÊNCIA: Retorno Pendente',
                message: `O lead ${lead.name} precisa de retorno imediato (parado há ${Math.floor(diffHours)}h).`,
                time: lastUpdate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                leadId: lead.id
            };
        } else if (diffHours > 24 && diffHours <= 48 && (lead.status === 'WHATSAPP' || lead.status === 'LIGACAO')) {
            return {
                id: `feedback-${lead.id}`,
                type: 'FEEDBACK',
                title: 'Solicitação de Retorno',
                message: `Já obteve retorno do lead ${lead.name}? (Parado há ${Math.floor(diffHours)}h).`,
                time: lastUpdate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                leadId: lead.id
            };
        }
        return null;
    }).filter(Boolean);

    // Notificações de realocação recente (leads que entraram no meu nome na última 1h via sistema)
    const recentReassignments = myLeads.filter(lead => {
        if (!lead.observation?.includes('[Sistema] Realocado')) return false;
        const lastUpdate = new Date(lead.updatedAt);
        const diffHours = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60);
        return diffHours < 1; // Notificar na primeira hora
    }).map(lead => ({
        id: `new-${lead.id}`,
        type: 'NEW',
        title: 'Novo Lead Realocado',
        message: `Você recebeu o lead ${lead.name} por inatividade do vendedor anterior!`,
        time: 'Agora',
        leadId: lead.id
    }));

    const allNotifications = [...recentReassignments, ...notifications];

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors relative"
            >
                <Bell className="w-6 h-6" />
                {allNotifications.length > 0 && (
                    <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
                        {allNotifications.length}
                    </span>
                )}
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                        <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
                            <h4 className="font-bold text-gray-800">Notificações</h4>
                            <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-black uppercase">
                                {allNotifications.length} Pendentes
                            </span>
                        </div>

                        <div className="max-h-96 overflow-y-auto divide-y divide-gray-50">
                            {allNotifications.length === 0 ? (
                                <div className="p-8 text-center">
                                    <Bell className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                                    <p className="text-sm text-gray-400">Nenhuma notificação por enquanto.</p>
                                </div>
                            ) : (
                                allNotifications.map((notif: any) => (
                                    <div key={notif.id} className="p-4 hover:bg-gray-50 transition-colors">
                                        <div className="flex gap-3">
                                            <div className={clsx(
                                                "p-2 rounded-lg h-fit",
                                                notif.type === 'URGENT' ? "bg-red-50 text-red-600" :
                                                    notif.type === 'NEW' ? "bg-green-50 text-green-600" : "bg-blue-50 text-blue-600"
                                            )}>
                                                {notif.type === 'URGENT' ? <AlertTriangle className="w-4 h-4" /> :
                                                    notif.type === 'NEW' ? <UserPlus className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-bold text-gray-800 leading-tight mb-1">{notif.title}</p>
                                                <p className="text-xs text-gray-500 leading-relaxed">{notif.message}</p>
                                                <p className="text-[10px] text-gray-400 mt-2 uppercase font-black">{notif.time}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="p-3 bg-gray-50 border-top text-center">
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-xs font-bold text-gray-400 hover:text-gray-600 uppercase tracking-widest"
                            >
                                Fechar
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
