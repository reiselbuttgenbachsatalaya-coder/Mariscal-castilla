import React, { useState, useRef } from 'react';
import {
  X,
  UploadCloud,
  FileText,
  Send,
  User,
  GraduationCap,
  BookOpen,
  CheckCircle2,
  Paperclip,
  File as FileIcon
} from 'lucide-react';
import { Teacher, SchoolDocument, DocumentFormat } from '../types';
import { GRADES, SECTIONS } from '../data/initialData';

interface SendFileModalProps {
  recipientTeacher: Teacher;
  onClose: () => void;
  onSend: (docData: Omit<SchoolDocument, 'id' | 'createdAt' | 'updatedAt' | 'syncStatus'>) => void;
}

export const SendFileModal: React.FC<SendFileModalProps> = ({
  recipientTeacher,
  onClose,
  onSend,
}) => {
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [course, setCourse] = useState(recipientTeacher.courseAssigned || recipientTeacher.specialty || 'General');
  const [grade, setGrade] = useState(GRADES[0] || '1° Secundaria');
  const [section, setSection] = useState(SECTIONS[0] || 'Sección A');
  const [selectedFile, setSelectedFile] = useState<{
    name: string;
    size: string;
    format: DocumentFormat;
    dataUrl?: string;
  } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const determineFormat = (filename: string): DocumentFormat => {
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    if (ext === 'pdf') return 'pdf';
    if (['doc', 'docx'].includes(ext)) return 'docx';
    if (['xls', 'xlsx'].includes(ext)) return 'xlsx';
    if (['ppt', 'pptx'].includes(ext)) return 'pptx';
    if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext)) return 'image';
    return 'txt';
  };

  const handleProcessFile = (file: File) => {
    const sizeKB = Math.round(file.size / 1024);
    const sizeStr = sizeKB > 1024 ? `${(sizeKB / 1024).toFixed(1)} MB` : `${sizeKB} KB`;
    const format = determineFormat(file.name);

    if (!title.trim()) {
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
      setTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
    }

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedFile({
        name: file.name,
        size: sizeStr,
        format,
        dataUrl: reader.result as string,
      });
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError('Por favor ingresa un título o asunto para el documento.');
      return;
    }

    if (!selectedFile) {
      setError('Por favor adjunta un archivo para enviar al docente.');
      return;
    }

    if (!course.trim()) {
      setError('Por favor escribe el curso o asignatura correspondiente.');
      return;
    }

    const docData: Omit<SchoolDocument, 'id' | 'createdAt' | 'updatedAt' | 'syncStatus'> = {
      title: title.trim(),
      fileName: selectedFile.name,
      format: selectedFile.format,
      fileSize: selectedFile.size,
      course: course.trim(),
      grade: grade.trim() || 'General',
      section: section.trim() || 'General',
      authorTeacherId: 'admin-directora',
      authorTeacherName: 'Directora General (Administración)',
      recipientTeacherId: recipientTeacher.id,
      recipientTeacherName: recipientTeacher.name,
      isDirectMessage: true,
      messageNotes: notes.trim() || undefined,
      tags: ['institucional', 'mensaje-directora', recipientTeacher.name.toLowerCase()],
      description: notes.trim() || `Documento institucional enviado directamente por la Directora a ${recipientTeacher.name}.`,
      contentSummary: `Archivo enviado por la Directora para ${recipientTeacher.name} (${recipientTeacher.courseAssigned || 'Docente'}). ${notes ? `Mensaje: ${notes}` : ''}`,
      previewSnippet: notes.trim() || `Archivo institucional enviado a ${recipientTeacher.name}.`,
      fileDataUrl: selectedFile.dataUrl,
      isFavorite: false,
      smartCategory: 'administrative',
    };

    onSend(docData);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-linear-to-r from-indigo-50/80 via-white to-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Enviar Archivo a Docente
              </h3>
              <p className="text-xs text-slate-500">
                Destinatario: <strong className="text-indigo-700">{recipientTeacher.name}</strong>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0"></span>
              <span>{error}</span>
            </div>
          )}

          {/* Teacher Info Card */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3">
            <img
              src={recipientTeacher.avatar}
              alt={recipientTeacher.name}
              className="w-10 h-10 rounded-lg object-cover border border-slate-200 bg-white shrink-0"
            />
            <div className="min-w-0 text-xs">
              <p className="font-bold text-slate-900 truncate">{recipientTeacher.name}</p>
              <p className="text-slate-500 font-mono text-[11px]">
                DNI: {recipientTeacher.dni || 'Sin DNI'} • Curso: {recipientTeacher.courseAssigned || 'General'}
              </p>
            </div>
          </div>

          {/* File Drag and Drop Zone */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Archivo a Enviar *
            </label>
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleProcessFile(e.target.files[0]);
                }
              }}
              className="hidden"
            />

            {!selectedFile ? (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`p-6 border-2 border-dashed rounded-xl text-center cursor-pointer transition-colors ${
                  isDragging
                    ? 'border-indigo-500 bg-indigo-50/50'
                    : 'border-slate-200 hover:border-indigo-400 bg-slate-50/50 hover:bg-slate-50'
                }`}
              >
                <UploadCloud className="w-8 h-8 text-indigo-500 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-700">
                  Haz clic para seleccionar o arrastra el archivo aquí
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Formatos soportados: PDF, Word (.docx), Excel (.xlsx), PowerPoint (.pptx), Imágenes, etc.
                </p>
              </div>
            ) : (
              <div className="p-3 bg-indigo-50/60 border border-indigo-200 rounded-xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">{selectedFile.name}</p>
                    <p className="text-[10px] text-slate-500 font-mono">
                      {selectedFile.size} • Formato {selectedFile.format.toUpperCase()}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedFile(null)}
                  className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                  title="Cambiar archivo"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Document Title */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Título o Asunto del Documento *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setError(null);
              }}
              placeholder="Ej: Registro Bimestral, Convocatoria Oficial, Material de Apoyo..."
              className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 focus:bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          {/* Course - Free text field */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Curso / Asignatura *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <BookOpen className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                value={course}
                onChange={(e) => {
                  setCourse(e.target.value);
                  setError(null);
                }}
                placeholder="Escribe el curso o área institucional"
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 focus:bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Grade & Section */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Grado
              </label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
              >
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
                className="w-full px-3 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
              >
                {SECTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Message / Notes */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Mensaje o Instrucciones para el Docente (Opcional)
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Escribe las indicaciones o detalles que acompañan al archivo..."
              className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 focus:bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
            />
          </div>

          {/* Modal Footer Buttons */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Enviar Archivo al Docente</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
