import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Search, Plus, FileText, MessageSquare, ExternalLink, Trash2, Copy, Check, BookOpen, RefreshCw, Globe, Link as LinkIcon, Image as ImageIcon, Video, Upload, X, Eye } from 'lucide-react';
import { clsx } from 'clsx';
import { KnowledgeItem } from '../types';

export const KnowledgeBase = () => {
  const { knowledgeItems, addKnowledgeItem, removeKnowledgeItem, syncKnowledgeItem, uploadFile, showToast } = useApp();
  const [activeTab, setActiveTab] = useState<'SCRIPT' | 'DOCUMENTO'>('SCRIPT');
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [viewingItem, setViewingItem] = useState<KnowledgeItem | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [link, setLink] = useState('');
  const [syncUrl, setSyncUrl] = useState('');
  const [isSyncEnabled, setIsSyncEnabled] = useState(false);
  const [attachments, setAttachments] = useState<{ name: string; url: string; type: 'image' | 'video' }[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredItems = knowledgeItems.filter(item =>
    item.type === activeTab &&
    (item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title && (content || isSyncEnabled)) {
      addKnowledgeItem({
        title,
        content: isSyncEnabled ? 'Sincronizando pela primeira vez...' : content,
        type: activeTab,
        category,
        link: activeTab === 'DOCUMENTO' ? link : undefined,
        syncUrl: isSyncEnabled ? syncUrl : undefined,
        attachments: attachments.length > 0 ? attachments : undefined
      });

      resetForm();
    }
  };

  const resetForm = () => {
    setTitle('');
    setContent('');
    setCategory('');
    setLink('');
    setSyncUrl('');
    setIsSyncEnabled(false);
    setAttachments([]);
    setShowForm(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const url = await uploadFile(file);
      const type = file.type.startsWith('image/') ? 'image' : 'video';
      setAttachments(prev => [...prev, { name: file.name, url, type }]);
      showToast("Arquivo enviado com sucesso!", "success");
    } catch (error) {
      showToast("Erro ao fazer upload.", "error");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const addExternalLink = () => {
    const url = prompt("Cole o link da imagem ou vídeo:");
    if (url) {
      const name = prompt("Dê um nome para este anexo (opcional):") || "Link Externo";
      const type = (url.includes('youtube.com') || url.includes('vimeo.com') || url.endsWith('.mp4')) ? 'video' : 'image';
      setAttachments(prev => [...prev, { name, url, type }]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
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

          {/* Attachments Section */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Anexos (Imagens, Vídeos ou Arquivos)</label>
            <div className="flex flex-wrap gap-2">
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileUpload}
                accept="image/*,video/*,.pdf"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-bold transition-all"
              >
                {isUploading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                Upload do PC
              </button>
              <button
                type="button"
                onClick={addExternalLink}
                className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-bold transition-all"
              >
                <LinkIcon className="w-3.5 h-3.5" /> Link Externo
              </button>
            </div>

            {attachments.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                {attachments.map((file, idx) => (
                  <div key={idx} className="relative group bg-white border border-gray-200 p-2 rounded-lg flex items-center gap-2">
                    {file.type === 'image' ? <ImageIcon className="w-4 h-4 text-blue-500 shrink-0" /> : <Video className="w-4 h-4 text-red-500 shrink-0" />}
                    <span className="text-[10px] font-bold truncate flex-1">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => removeAttachment(idx)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
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
            <button type="button" onClick={resetForm} className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg font-bold">Descartar</button>
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
                    {(item.syncUrl || item.link?.includes('docs.google.com')) && (
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
                <p className="text-sm text-gray-600 mb-4 line-clamp-4 whitespace-pre-wrap">
                  {item.content}
                </p>
                {item.content.length > 200 && <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-white to-transparent pointer-events-none" />}

                {item.attachments && item.attachments.length > 0 && (
                  <div className="flex gap-2 mb-4 overflow-hidden">
                    {item.attachments.slice(0, 3).map((att, idx) => (
                      <div key={idx} className="bg-gray-50 border border-gray-200 p-1.5 rounded-lg flex items-center gap-1.5 text-[10px] font-bold text-gray-500 max-w-[120px]">
                        {att.type === 'image' ? <ImageIcon className="w-3 h-3 text-blue-500" /> : <Video className="w-3 h-3 text-red-500" />}
                        <span className="truncate">{att.name}</span>
                      </div>
                    ))}
                    {item.attachments.length > 3 && <span className="text-[10px] text-gray-400 flex items-center italic">+{item.attachments.length - 3}</span>}
                  </div>
                )}
              </div>

              <div className="flex gap-2 mt-auto pt-4 border-t border-gray-50">
                <button
                  onClick={() => setViewingItem(item)}
                  className="flex-1 flex items-center justify-center gap-2 py-2 bg-gray-50 text-gray-700 rounded-lg text-xs font-bold hover:bg-gray-100 transition-all shadow-sm"
                >
                  <Eye className="w-3.5 h-3.5" /> Ver Completo
                </button>
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

      {/* Full View Modal */}
      {viewingItem && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[70] p-4 animate-fade-in">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full uppercase">
                    {viewingItem.category || viewingItem.type}
                  </span>
                  <span className="text-[10px] text-gray-400">Atualizado em {new Date(viewingItem.updatedAt).toLocaleDateString()}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-800">{viewingItem.title}</h3>
              </div>
              <div className="flex items-center gap-2">
                {(viewingItem.syncUrl || viewingItem.link) && (
                  <a
                    href={viewingItem.syncUrl || viewingItem.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-md"
                  >
                    <ExternalLink className="w-4 h-4" /> Abrir Original
                  </a>
                )}
                <button
                  onClick={() => setViewingItem(null)}
                  className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              <div className="prose prose-indigo max-w-none">
                <div className="whitespace-pre-wrap text-gray-700 font-medium leading-relaxed bg-gray-50 p-6 rounded-xl border border-gray-100">
                  {viewingItem.content}
                </div>
              </div>

              {viewingItem.attachments && viewingItem.attachments.length > 0 && (
                <div className="mt-8">
                  <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Plus className="w-4 h-4 text-indigo-600" />
                    Anexos e Mídias
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {viewingItem.attachments.map((att, idx) => (
                      <div key={idx} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                        {att.type === 'image' ? (
                          <div className="group relative">
                            <img src={att.url} alt={att.name} className="w-full h-48 object-cover" />
                            <a href={att.url} target="_blank" rel="noreferrer" className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <ExternalLink className="text-white w-8 h-8" />
                            </a>
                          </div>
                        ) : (
                          <div className="bg-gray-900 h-48 flex items-center justify-center relative group">
                            <Video className="w-12 h-12 text-white/50" />
                            <a href={att.url} target="_blank" rel="noreferrer" className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold gap-2">
                              <Video className="w-6 h-6" /> Play Vídeo
                            </a>
                          </div>
                        )}
                        <div className="p-3 flex justify-between items-center bg-gray-50">
                          <span className="text-xs font-bold text-gray-700 truncate mr-2">{att.name}</span>
                          <a href={att.url} target="_blank" rel="noreferrer" className="text-indigo-600 font-bold text-[10px] uppercase hover:underline shrink-0">Baixar/Ver</a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-between items-center">
              <button
                onClick={() => handleCopy(viewingItem.content, viewingItem.id)}
                className={clsx(
                  "px-10 py-3 rounded-xl text-sm font-bold transition-all shadow-md flex items-center gap-3",
                  copiedId === viewingItem.id ? "bg-green-600 text-white" : "bg-indigo-600 text-white hover:bg-indigo-700"
                )}
              >
                {copiedId === viewingItem.id ? <><Check className="w-5 h-5" /> Copiado com Sucesso</> : <><Copy className="w-5 h-5" /> Copiar Script Inteiro</>}
              </button>
              <button
                onClick={() => setViewingItem(null)}
                className="px-6 py-3 text-gray-500 hover:bg-gray-200 rounded-xl font-bold transition-colors"
              >
                Fechar Visualização
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};