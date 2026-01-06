import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Search, Plus, FileText, MessageSquare, ExternalLink, Trash2, Copy, Check, BookOpen, RefreshCw, Globe, Link as LinkIcon } from 'lucide-react';
import { clsx } from 'clsx';

export const KnowledgeBase = () => {
  const { knowledgeItems, addKnowledgeItem, removeKnowledgeItem, syncKnowledgeItem } = useApp();
  const [activeTab, setActiveTab] = useState<'SCRIPT' | 'DOCUMENTO'>('SCRIPT');
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [syncingId, setSyncingId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [link, setLink] = useState('');
  const [syncUrl, setSyncUrl] = useState('');
  const [isSyncEnabled, setIsSyncEnabled] = useState(false);

  const filteredItems = knowledgeItems.filter(item => 
    item.type === activeTab && 
    (item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
     item.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
     item.category?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(title && (content || isSyncEnabled)) {
      addKnowledgeItem({
        title,
        content: isSyncEnabled ? 'Sincronizando pela primeira vez...' : content,
        type: activeTab,
        category,
        link: activeTab === 'DOCUMENTO' ? link : undefined,
        syncUrl: isSyncEnabled ? syncUrl : undefined
      });
      
      // Se for síncrono, tenta a primeira sincronização após adicionar (id gerado no context, precisaria de ajuste para auto-sync aqui)
      // Para manter simples, o usuário clica em sincronizar no card.
      
      setTitle('');
      setContent('');
      setCategory('');
      setLink('');
      setSyncUrl('');
      setIsSyncEnabled(false);
      setShowForm(false);
    }
  };

  const handleSyncNow = async (id: string) => {
    setSyncingId(id);
    await syncKnowledgeItem(id);
    setSyncingId(null);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Base de Conhecimento</h2>
          <p className="text-gray-500">Scripts de vendas e documentos internos vinculados ao Google</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 shadow-sm font-bold"
        >
          {showForm ? 'Cancelar' : <><Plus className="w-4 h-4" /> Novo {activeTab === 'SCRIPT' ? 'Script' : 'Documento'}</>}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button 
          onClick={() => { setActiveTab('SCRIPT'); setShowForm(false); }}
          className={clsx(
            "px-6 py-3 font-bold text-sm transition-all flex items-center gap-2 border-b-2",
            activeTab === 'SCRIPT' ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-400 hover:text-gray-600"
          )}
        >
          <MessageSquare className="w-4 h-4" /> Scripts & Objeções
        </button>
        <button 
          onClick={() => { setActiveTab('DOCUMENTO'); setShowForm(false); }}
          className={clsx(
            "px-6 py-3 font-bold text-sm transition-all flex items-center gap-2 border-b-2",
            activeTab === 'DOCUMENTO' ? "border-blue-600 text-blue-600" : "border-transparent text-gray-400 hover:text-gray-600"
          )}
        >
          <FileText className="w-4 h-4" /> Documentos & Manuais
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input 
          type="text"
          placeholder="Buscar por título, categoria ou conteúdo..."
          className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Add Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-md border border-blue-100 animate-fade-in space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Título</label>
              <input 
                className="w-full border p-2 rounded-lg text-sm" 
                value={title} 
                onChange={e => setTitle(e.target.value)} 
                placeholder="Ex: Roteiro Objeção Preço"
                required 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Categoria</label>
              <input 
                className="w-full border p-2 rounded-lg text-sm" 
                value={category} 
                onChange={e => setCategory(e.target.value)} 
                placeholder="Ex: Objeção, Manual, Financeiro..."
              />
            </div>
          </div>

          <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
            <label className="flex items-center gap-2 cursor-pointer mb-3">
              <input 
                type="checkbox" 
                checked={isSyncEnabled} 
                onChange={e => setIsSyncEnabled(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600"
              />
              <span className="text-sm font-bold text-blue-800">Sincronizar com Google Docs/Sheets</span>
            </label>
            
            {isSyncEnabled ? (
              <div className="space-y-3 animate-fade-in">
                <div>
                  <label className="block text-[10px] font-bold text-blue-600 uppercase mb-1">Link de Sincronização</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Globe className="absolute left-3 top-2.5 w-4 h-4 text-blue-400" />
                      <input 
                        className="w-full pl-9 border p-2 rounded-lg text-sm" 
                        value={syncUrl} 
                        onChange={e => setSyncUrl(e.target.value)} 
                        placeholder="https://docs.google.com/document/d/..."
                        required={isSyncEnabled}
                      />
                    </div>
                  </div>
                  <p className="text-[10px] text-blue-500 mt-1">O ERP buscará o conteúdo deste link automaticamente.</p>
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Conteúdo Estático</label>
                <textarea 
                  className="w-full border p-2 rounded-lg text-sm h-32" 
                  value={content} 
                  onChange={e => setContent(e.target.value)} 
                  placeholder="Descreva o script ou detalhes do documento aqui..."
                  required={!isSyncEnabled}
                />
              </div>
            )}
          </div>

          {activeTab === 'DOCUMENTO' && !isSyncEnabled && (
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Link de Acesso (Botão)</label>
              <input 
                className="w-full border p-2 rounded-lg text-sm" 
                value={link} 
                onChange={e => setLink(e.target.value)} 
                placeholder="https://drive.google.com/..."
              />
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg">Descartar</button>
            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-sm">
              Criar Item
            </button>
          </div>
        </form>
      )}

      {/* List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredItems.length === 0 ? (
          <div className="col-span-full py-12 text-center text-gray-400 bg-white rounded-xl border border-dashed border-gray-300">
            <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>Nenhum item encontrado nesta categoria.</p>
          </div>
        ) : (
          filteredItems.map(item => (
            <div key={item.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col group relative">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={clsx(
                      "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter",
                      item.type === 'SCRIPT' ? "bg-indigo-100 text-indigo-700" : "bg-blue-100 text-blue-700"
                    )}>
                      {item.category || (item.type === 'SCRIPT' ? 'Roteiro' : 'Documento')}
                    </span>
                    {item.syncUrl && (
                      <span className="flex items-center gap-1 text-[10px] bg-green-50 text-green-600 px-2 py-0.5 rounded-full font-bold border border-green-100">
                        <Globe className="w-3 h-3" /> Google Sync
                      </span>
                    )}
                    <span className="text-[10px] text-gray-400">{new Date(item.updatedAt).toLocaleDateString()}</span>
                  </div>
                  <h3 className="font-bold text-gray-800 leading-tight pr-8">{item.title}</h3>
                </div>
                <div className="flex gap-1">
                  {item.syncUrl && (
                    <button 
                      onClick={() => handleSyncNow(item.id)}
                      disabled={syncingId === item.id}
                      className={clsx(
                        "p-1.5 rounded-lg transition-colors",
                        syncingId === item.id ? "bg-blue-100 text-blue-600 animate-spin" : "text-blue-500 hover:bg-blue-50"
                      )}
                      title="Sincronizar com Google"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  )}
                  <button 
                    onClick={() => removeKnowledgeItem(item.id)}
                    className="p-1.5 text-gray-300 hover:text-red-600 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="relative flex-1">
                <p className="text-sm text-gray-600 mb-4 line-clamp-6 whitespace-pre-wrap">
                  {item.content}
                </p>
                {item.content.length > 200 && <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-white to-transparent pointer-events-none" />}
              </div>
              
              <div className="flex gap-2 mt-auto pt-4 border-t border-gray-50">
                {item.type === 'SCRIPT' ? (
                  <button 
                    onClick={() => handleCopy(item.content, item.id)}
                    className={clsx(
                      "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all shadow-sm",
                      copiedId === item.id ? "bg-green-100 text-green-700" : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                    )}
                  >
                    {copiedId === item.id ? <><Check className="w-3.5 h-3.5" /> Copiado</> : <><Copy className="w-3.5 h-3.5" /> Copiar Script</>}
                  </button>
                ) : (
                  <>
                    {(item.link || item.syncUrl) && (
                      <a 
                        href={item.link || item.syncUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 py-2 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-100 transition-all shadow-sm"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> Abrir no Google
                      </a>
                    )}
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};