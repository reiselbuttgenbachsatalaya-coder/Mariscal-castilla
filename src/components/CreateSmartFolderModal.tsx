import React, { useState } from 'react';
import {
  X,
  Sparkles,
  FolderPlus,
  BookOpen,
  GraduationCap,
  FileType,
} from 'lucide-react';
import { SmartFolder, DocumentFormat } from '../types';
import { COURSES, GRADES, SECTIONS } from '../data/initialData';

interface CreateSmartFolderModalProps {
  onClose: () => void;
  onCreateFolder: (folder: Omit<SmartFolder, 'id'>) => void;
}

export const CreateSmartFolderModal: React.FC<CreateSmartFolderModalProps> = ({
  onClose,
  onCreateFolder,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [course, setCourse] = useState('');
  const [grade, setGrade] = useState('');
  const [section, setSection] = useState('');
  const [format, setFormat] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onCreateFolder({
      title: title.trim(),
      description: description.trim() || `Carpeta inteligente con reglas automáticas para ${title.trim()}.`,
      icon: 'Sparkles',
      color: 'indigo',
      customFilter: {
        course: course || undefined,
        grade: grade || undefined,
        section: section || undefined,
        format: (format as DocumentFormat) || undefined,
      },
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
              <FolderPlus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Nueva Carpeta Inteligente
              </h2>
              <p className="text-xs text-slate-500">
                Agrupa documentos automáticamente según reglas definidas
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-3.5">
          
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Nombre de la Carpeta *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Exámenes de 3° Primaria"
              className="w-full px-3 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Descripción Opcional
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Breve propósito de esta carpeta organizada..."
              className="w-full px-3 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900"
            />
          </div>

          {/* Rules: Course, Grade, Format */}
          <div className="pt-2 border-t border-slate-100 space-y-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Reglas de Inclusión Automática
            </span>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Filtrar por Curso
              </label>
              <select
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
              >
                <option value="">Cualquier curso</option>
                {COURSES.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Grado
                </label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                >
                  <option value="">Cualquier grado</option>
                  {GRADES.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Sección
                </label>
                <select
                  value={section}
                  onChange={(e) => setSection(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                >
                  <option value="">Cualquiera</option>
                  {SECTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Formato de Archivo
              </label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
              >
                <option value="">Cualquier formato</option>
                <option value="pdf">Solo PDF (.pdf)</option>
                <option value="docx">Solo Word (.docx)</option>
                <option value="xlsx">Solo Excel (.xlsx)</option>
                <option value="pptx">Solo PowerPoint (.pptx)</option>
                <option value="exam">Solo Exámenes (.exam)</option>
              </select>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
            >
              Crear Carpeta Inteligente
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
