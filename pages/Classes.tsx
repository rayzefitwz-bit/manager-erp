
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { Monitor, MapPinned, Users, Plus, Edit2, Trash2, X, Save } from 'lucide-react';
import { ImmersiveClass } from '../types';

interface ClassFormProps {
  initialData?: ImmersiveClass;
  onSave: (data: Omit<ImmersiveClass, 'id'>) => void;
  onClose: () => void;
}

const ClassFormModal = ({ initialData, onSave, onClose }: ClassFormProps) => {
  const [city, setCity] = useState(initialData?.city || '');
  const [date, setDate] = useState(initialData?.date || '');
  const [immersion, setImmersion] = useState(initialData?.immersion || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (city && date && immersion) {
      onSave({ city, date, immersion });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md animate-fade-in overflow-hidden">
        <div className="p-6 border-b flex justify-between items-center bg-gray-50">
          <h3 className="text-lg font-bold text-gray-800">
            {initialData ? 'Editar Turma' : 'Criar Nova Turma'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Cidade / Localidade</label>
            <input 
              className="w-full border p-2.5 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" 
              value={city} 
              onChange={e => setCity(e.target.value)} 
              placeholder="Ex: Curitiba, Manaus, Online..."
              required 
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Data da Turma</label>
            <input 
              className="w-full border p-2.5 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" 
              value={date} 
              onChange={e => setDate(e.target.value)} 
              placeholder="Ex: 20, 21 e 22 de Fevereiro"
              required 
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Imersão (Nome)</label>
            <input 
              className="w-full border p-2.5 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" 
              value={immersion} 
              onChange={e => setImmersion(e.target.value)} 
              placeholder="Ex: Google Ads + IA"
              required 
            />
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg text-sm font-medium"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-sm text-sm"
            >
              <Save className="w-4 h-4" /> Salvar Turma
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const Classes = () => {
  const { leads, immersiveClasses, addClass, updateClass, removeClass } = useApp();
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ImmersiveClass | undefined>(undefined);

  const isAdmin = user?.role === 'ADMIN';

  // Filtro de alunos baseado no cargo
  const getStudentsByLocation = (city: string) => {
    return leads.filter(l => {
      const isWon = l.status === 'GANHO';
      const isCorrectCity = l.classLocation === city;
      const isAssignedToMe = isAdmin || l.assignedToId === user?.id;
      return isWon && isCorrectCity && isAssignedToMe;
    });
  };

  const totalFilteredStudents = leads.filter(l => 
    l.status === 'GANHO' && (isAdmin || l.assignedToId === user?.id)
  ).length;

  const handleCreate = () => {
    if (!isAdmin) return;
    setEditingClass(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (cls: ImmersiveClass) => {
    if (!isAdmin) return;
    setEditingClass(cls);
    setIsModalOpen(true);
  };

  const handleSave = (data: Omit<ImmersiveClass, 'id'>) => {
    if (editingClass) {
      updateClass(editingClass.id, data);
    } else {
      addClass(data);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Turmas Ativas</h2>
          <p className="text-gray-500">
            {isAdmin 
              ? "Gestão de alunos por localidade e modalidade" 
              : "Meus alunos matriculados por turma"}
          </p>
        </div>
        <div className="flex gap-3">
          {isAdmin && (
            <button 
              onClick={handleCreate}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 shadow-sm transition-all text-sm font-bold"
            >
              <Plus className="w-4 h-4" /> Nova Turma
            </button>
          )}
          <div className="bg-white px-4 py-2 rounded-lg border shadow-sm flex items-center gap-2">
            <Users className="text-blue-600 w-5 h-5" />
            <span className="font-bold">
               {totalFilteredStudents} {isAdmin ? "Alunos Totais" : "Minhas Matrículas"}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {immersiveClasses.map(cls => {
          const students = getStudentsByLocation(cls.city);
          const isOnline = cls.city.toLowerCase() === 'online';
          const Icon = isOnline ? Monitor : MapPinned;
          
          return (
            <div key={cls.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[500px] group transition-all hover:border-blue-200 hover:shadow-md">
              <div className={`p-4 border-b flex justify-between items-start transition-colors ${isOnline ? 'bg-purple-50 text-purple-900 border-purple-100' : 'bg-blue-50 text-blue-900 border-blue-100'}`}>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/50 rounded-lg shrink-0"><Icon className="w-5 h-5" /></div>
                  <div className="overflow-hidden">
                    <h3 className="font-bold truncate" title={cls.city}>{cls.city}</h3>
                    <p className="text-[10px] uppercase font-bold tracking-tight opacity-70 truncate" title={cls.immersion}>{cls.immersion}</p>
                    <p className="text-[10px] font-medium opacity-60 truncate mt-0.5">{cls.date}</p>
                  </div>
                </div>
                {isAdmin && (
                  <div className="flex flex-col gap-1">
                     <button 
                      onClick={() => handleEdit(cls)}
                      className="p-1.5 bg-white/60 hover:bg-white text-gray-600 rounded-md transition-colors"
                      title="Editar Turma"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => removeClass(cls.id)}
                      className="p-1.5 bg-white/60 hover:bg-red-50 text-red-500 rounded-md transition-colors"
                      title="Remover Turma"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
              
              <div className="p-3 flex-1 overflow-y-auto custom-scrollbar bg-gray-50/30">
                <div className="flex justify-between items-center mb-3 px-1">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Alunos ({students.length})</span>
                </div>
                {students.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full opacity-40 py-10">
                      <Users className="w-12 h-12 mb-2" />
                      <p className="text-xs text-center">Nenhum aluno encontrado</p>
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {students.map(student => (
                      <li key={student.id} className="p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-colors shadow-sm">
                        <p className="font-semibold text-gray-800 text-sm">{student.name}</p>
                        <div className="flex justify-between items-center mt-1.5">
                          <span className="text-[10px] text-gray-500 uppercase font-bold tracking-tight">{student.role}</span>
                          <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-bold">PAGO</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {isModalOpen && (
        <ClassFormModal 
          initialData={editingClass}
          onSave={handleSave}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};
