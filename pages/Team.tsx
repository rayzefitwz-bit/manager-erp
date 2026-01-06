
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserPlus, Shield, User, Trash2 } from 'lucide-react';

export const Team = () => {
  const { team, addTeamMember, removeTeamMember } = useApp();
  const [formData, setFormData] = useState({ name: '', email: '', role: 'VENDEDOR', password: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.email && formData.password) {
      addTeamMember({
        name: formData.name,
        email: formData.email,
        role: formData.role,
        password: formData.password
      });
      setFormData({ name: '', email: '', role: 'VENDEDOR', password: '' });
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Gestão de Equipe</h2>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="font-bold mb-4 flex items-center gap-2"><UserPlus className="w-5 h-5" /> Adicionar Membro</h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
           <div>
              <label className="block text-sm font-medium mb-1">Nome</label>
              <input className="w-full border p-2 rounded" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
           </div>
           <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input type="email" className="w-full border p-2 rounded" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
           </div>
           <div>
              <label className="block text-sm font-medium mb-1">Cargo</label>
              <select className="w-full border p-2 rounded" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                <option value="VENDEDOR">Vendedor</option>
                <option value="ADMIN">Administrador</option>
              </select>
           </div>
           <div>
              <label className="block text-sm font-medium mb-1">Senha</label>
              <input type="password" className="w-full border p-2 rounded" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required />
           </div>
           <button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 font-bold transition-all shadow-sm">Cadastrar</button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {team.map(member => (
          <div key={member.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 relative group">
            <div className={`p-4 rounded-full ${member.role === 'ADMIN' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
              {member.role === 'ADMIN' ? <Shield /> : <User />}
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-gray-800">{member.name}</h4>
              <p className="text-sm text-gray-500">{member.email}</p>
              <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 border border-gray-100 px-1.5 py-0.5 rounded-md">{member.role}</span>
            </div>
            
            <button 
              onClick={() => removeTeamMember(member.id)}
              className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100 absolute top-4 right-4"
              title="Excluir Usuário"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
