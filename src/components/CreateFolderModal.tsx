import React, { useState } from 'react';
import {
  X,
  FolderPlus,
  Folder,
  Palette,
  FileText,
  Check,
  Sparkles
} from 'lucide-react';
import { StorageFolder, SchoolDocument, Teacher } from '../types';

interface CreateFolderModalProps {
  onClose: () => void;
  onSave: (folderData: {
    name: string;
    description: string;
    color: string;
    selectedDocIds: string[];
  }) => void;
  currentTeacher: Teacher | null;
  availableDocuments: SchoolDocument[];
  initialFolder?: StorageFolder | null;
}

const FOLDER_COLORS = [
  { id: 'sky', name: 'Celeste Escolar', bg: 'bg-sky-500', ring: 'ring-sky-400', border: 'border-sky-300' },
  { id: 'blue', name: 'Azul Marino', bg: 'bg-blue-900', ring: 'ring-blue-600', border: 'border-blue-400' },
  { id: 'gold', name: 'Dorado Institucional', bg: 'bg-amber-500', ring: 'ring-amber-400', border: 'border-amber-300' },
  { id: 'indigo', name: 'Índigo Profundo', bg: 'bg-indigo-600', ring: 'ring-indigo-400', border: 'border-indigo-300' },
  { id: 'emerald', name: 'Verde Esmeralda', bg: 'bg-emerald-600', ring: 'ring-emerald-400', border: 'border-emerald-300' },
];

export const CreateFolderModal: React.FC<CreateFolderModalProps> = ({
  onClose,
  onSave,
  currentTeacher,
  availableDocuments,
  initialFolder,
}) => {
  const [name, setName] = useState(initialFolder?.name || '');
  const [description, setDescription] = useState(initialFolder?.description || '');
  const [color, setColor] = useState(initialFolder?.color || 'sky');
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);
  const [searchDoc, setSearchDoc] = useState('');
  const [error, setError] = useState('');

  const toggleDoc = (id: string) => {
    setSelectedDocIds(prev =>
      prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) {
      setError('Por favor ingresa un nombre para la carpeta.');
      return;
    }

    onSave({
      name: cleanName,
      description: description.trim(),
      color,
      selectedDocIds,
    });
  };

  const filteredDocs = availableDocuments.filter(d =>
    d.title.toLowerCase().includes(searchDoc.toLowerCase()) ||
    d.fileName.toLowerCase().includes(searchDoc.toLowerCase()) ||
    d.course.toLowerCase().includes(searchDoc.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl shadow-2xl border border-sky-200/80 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header - Navy & Gold Elegance */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-950 via-blue-900 to-sky-900 text-white flex items-center justify-between border-b border-amber-400/30">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-400 text-blue-950 flex items-center justify-center font-bold shadow-md shadow-amber-400/20">
              <FolderPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {initialFolder ? 'Editar Carpeta' : 'Nueva Carpeta de Archivos'}
              </h2>
              <p className="text-xs text-sky-200">
                Organiza y comparte grupos de documentos pedagógicos
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-sky-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs font-medium border border-red-200">
              {error}
            </div>
          )}

          {/* Folder Name */}
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
              Nombre de la Carpeta <span className="text-amber-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={name}
                onChange={e => {
                  setName(e.target.value);
                  setError('');
                }}
                placeholder="Ej. Exámenes Bimestrales 2026, Guías de Matemáticas..."
                className="w-full pl-3.5 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-slate-800"
                autoFocus
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
              Descripción o Propósito (opcional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Ej. Recopilación de material para el segundo bimestre..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-slate-800"
            />
          </div>

          {/* Color theme selection */}
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-sky-600" />
              <span>Color distintivo</span>
            </label>
            <div className="flex items-center gap-2.5">
              {FOLDER_COLORS.map(c => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setColor(c.id)}
                  className={`group relative flex items-center justify-center w-8 h-8 rounded-full ${c.bg} transition-transform cursor-pointer ${
                    color === c.id ? 'ring-3 ring-offset-2 ring-blue-900 scale-110' : 'hover:scale-105 opacity-85 hover:opacity-100'
                  }`}
                  title={c.name}
                >
                  {color === c.id && <Check className="w-4 h-4 text-white drop-shadow" />}
                </button>
              ))}
            </div>
          </div>

          {/* Optional: Add existing documents to this folder */}
          {!initialFolder && availableDocuments.length > 0 && (
            <div className="pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-sky-600" />
                  <span>Guardar archivos en esta carpeta ({selectedDocIds.length} seleccionados)</span>
                </label>
              </div>

              {availableDocuments.length > 4 && (
                <input
                  type="text"
                  value={searchDoc}
                  onChange={e => setSearchDoc(e.target.value)}
                  placeholder="Buscar archivo para agregar..."
                  className="w-full px-3 py-1.5 mb-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              )}

              <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1 border border-slate-200 rounded-xl p-2 bg-slate-50/60">
                {filteredDocs.length === 0 ? (
                  <p className="text-xs text-slate-400 italic text-center py-2">
                    No se encontraron archivos coincidentes.
                  </p>
                ) : (
                  filteredDocs.map(doc => {
                    const isChecked = selectedDocIds.includes(doc.id);
                    return (
                      <div
                        key={doc.id}
                        onClick={() => toggleDoc(doc.id)}
                        className={`flex items-center justify-between p-2 rounded-lg text-xs cursor-pointer transition-colors ${
                          isChecked
                            ? 'bg-sky-100/90 text-blue-950 font-semibold border border-sky-300'
                            : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <FileText className={`w-3.5 h-3.5 shrink-0 ${isChecked ? 'text-blue-800' : 'text-slate-400'}`} />
                          <span className="truncate">{doc.title}</span>
                        </div>
                        <div
                          className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                            isChecked
                              ? 'bg-blue-900 border-blue-900 text-white'
                              : 'border-slate-300 bg-white'
                          }`}
                        >
                          {isChecked && <Check className="w-3 h-3" />}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-950 to-blue-900 hover:from-blue-900 hover:to-blue-800 text-amber-300 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-blue-950/20 transition-all cursor-pointer border border-amber-400/40"
            >
              <FolderPlus className="w-4 h-4 text-amber-400" />
              <span>{initialFolder ? 'Guardar Cambios' : 'Crear Carpeta'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
