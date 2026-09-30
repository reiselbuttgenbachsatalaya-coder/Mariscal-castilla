import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  FileUp,
  CloudCheck,
  Folder,
  FolderPlus
} from 'lucide-react';
import { SchoolDocument, Teacher, DocumentFormat, StorageFolder } from '../types';
import { COURSES, GRADES, SECTIONS } from '../data/initialData';

interface DocumentUploadModalProps {
  onClose: () => void;
  onSave: (docData: Omit<SchoolDocument, 'id' | 'createdAt' | 'updatedAt' | 'syncStatus'>) => void;
  currentTeacher: Teacher | null;
  initialDocument?: SchoolDocument | null;
  folders?: StorageFolder[];
  defaultFolderId?: string;
  onRequestCreateFolder?: () => void;
}

export const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({
  onClose,
  onSave,
  currentTeacher,
  initialDocument,
  folders = [],
  defaultFolderId,
  onRequestCreateFolder,
}) => {
  const isEditing = Boolean(initialDocument);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const [title, setTitle] = useState(initialDocument?.title || '');
  const [course, setCourse] = useState(initialDocument?.course || '');
  const [grade, setGrade] = useState(initialDocument?.grade || GRADES[0]);
  const [section, setSection] = useState(initialDocument?.section || SECTIONS[0]);
  const [format, setFormat] = useState<DocumentFormat>(initialDocument?.format || 'pdf');
  const [description, setDescription] = useState(initialDocument?.description || '');
  const [selectedFolderId, setSelectedFolderId] = useState<string>(
    initialDocument?.folderId || defaultFolderId || ''
  );
  const [selectedFile, setSelectedFile] = useState<{ name: string; size: string; dataUrl?: string } | null>(
    initialDocument
      ? { name: initialDocument.fileName, size: initialDocument.fileSize, dataUrl: initialDocument.fileDataUrl }
      : null
  );
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');

  const handleFileSelect = (file: File) => {
    // Determine format from extension
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    let detectedFormat: DocumentFormat = 'pdf';
    if (['doc', 'docx'].includes(ext)) detectedFormat = 'docx';
    else if (['xls', 'xlsx', 'csv'].includes(ext)) detectedFormat = 'xlsx';
    else if (['ppt', 'pptx'].includes(ext)) detectedFormat = 'pptx';
    else if (['png', 'jpg', 'jpeg', 'webp'].includes(ext)) detectedFormat = 'image';
    else if (['exam', 'eval'].includes(ext)) detectedFormat = 'exam';
    else if (['txt', 'md'].includes(ext)) detectedFormat = 'txt';
    setFormat(detectedFormat);

    const sizeFormatted = file.size > 1024 * 1024
      ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
      : `${Math.round(file.size / 1024)} KB`;

    // Read as Data URL
    const reader = new FileReader();
    reader.onload = () => {
      setSelectedFile({
        name: file.name,
        size: sizeFormatted,
        dataUrl: reader.result as string,
      });
      if (!title) {
        // Strip extension for title
        setTitle(file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' '));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isUploading) return;

    if (!title.trim()) {
      setErrorMsg('Por favor, ingrese un título descriptivo para el documento.');
      return;
    }
    if (!course.trim()) {
      setErrorMsg('Por favor, escriba el curso o asignatura.');
      return;
    }
    if (!selectedFile && !isEditing) {
      setErrorMsg('Por favor seleccione un archivo para subir.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(40);
    await new Promise((r) => setTimeout(r, 60));
    setUploadProgress(100);

    // Determine smart category
    let smartCategory: SchoolDocument['smartCategory'] = 'material';
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('examen') || lowerTitle.includes('evalua') || lowerTitle.includes('prueba') || format === 'exam') {
      smartCategory = 'exam';
    } else if (lowerTitle.includes('planea') || lowerTitle.includes('curricul') || lowerTitle.includes('syllabus') || lowerTitle.includes('unidad')) {
      smartCategory = 'curriculum';
    } else if (lowerTitle.includes('acta') || lowerTitle.includes('nota') || lowerTitle.includes('califica') || lowerTitle.includes('asistencia')) {
      smartCategory = 'record';
    }

    const defaultTags = initialDocument?.tags && initialDocument.tags.length > 0
      ? initialDocument.tags
      : [course.toLowerCase(), grade.toLowerCase()];

    const chosenFolder = folders.find(f => f.id === selectedFolderId);

    const docData: Omit<SchoolDocument, 'id' | 'createdAt' | 'updatedAt' | 'syncStatus'> = {
      title: title.trim(),
      fileName: selectedFile?.name || `${title.replace(/\s+/g, '_')}.${format}`,
      format,
      fileSize: selectedFile?.size || '1.2 MB',
      course,
      grade,
      section,
      authorTeacherId: initialDocument?.authorTeacherId || (currentTeacher ? currentTeacher.id : 'docente-1'),
      authorTeacherName: initialDocument?.authorTeacherName || (currentTeacher ? currentTeacher.name : 'Docente'),
      folderId: selectedFolderId || undefined,
      folderName: chosenFolder?.name || undefined,
      isSensitive: false,
      sensitiveReason: undefined,
      tags: defaultTags,
      description: description.trim() || `Documento académico de ${course} para ${grade} - ${section}.`,
      contentSummary: initialDocument?.contentSummary || `Archivo escolar de ${course} (${grade} - ${section}).`,
      previewSnippet: initialDocument?.previewSnippet || `Documento ${selectedFile?.name || title.trim()} registrado en el Archivo Docente.`,
      fileDataUrl: selectedFile?.dataUrl,
      isFavorite: initialDocument?.isFavorite || false,
      smartCategory,
    };

    onSave(docData);
    setIsUploading(false);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="relative bg-white rounded-2xl shadow-2xl border border-sky-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Modal Header - Blue + Celeste + Gold */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-950 via-blue-900 to-sky-900 text-white flex items-center justify-between border-b border-amber-400/30">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-400 text-blue-950 flex items-center justify-center font-bold shadow-md shadow-amber-400/20">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {isEditing ? 'Editar Documento Docente' : 'Subir Archivo de Profesores'}
              </h2>
              <p className="text-xs text-sky-200">
                Organización por curso, grado, sección y carpeta institucional
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
        <form onSubmit={handleSubmit} className="p-6 max-h-[80vh] overflow-y-auto space-y-4">
          
          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Drag and Drop Zone (if not editing) */}
          {!isEditing && (
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                Archivo del Profesor
              </label>
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-indigo-500 bg-indigo-50/50'
                    : selectedFile
                    ? 'border-emerald-300 bg-emerald-50/30'
                    : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      handleFileSelect(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                />

                {selectedFile ? (
                  <div className="flex items-center justify-center gap-3">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                    <div className="text-left">
                      <p className="text-xs font-bold text-slate-800 truncate max-w-sm">
                        {selectedFile.name}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {selectedFile.size} • Clic o arrastre para reemplazar
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <FileUp className="w-7 h-7 text-indigo-500 mx-auto" />
                    <p className="text-xs font-semibold text-slate-700">
                      Arrastra y suelta tu archivo aquí, o haz clic para examinar
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Soporta PDF, Word (.docx), Excel (.xlsx), PowerPoint (.pptx), Exámenes e Imágenes
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Título del Documento *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Examen Bimestral II - Trigonometría y Álgebra"
              className="w-full px-3 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-900"
            />
          </div>

          {/* Categorization: Course, Grade, Section */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            
            {/* Course */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Curso / Asignatura *
              </label>
              <input
                type="text"
                required
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                placeholder="Escribe el curso (ej: Comunicación, Biología, etc.)"
                className="w-full px-3 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-900"
              />
            </div>

            {/* Grade */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Grado Escolar *
              </label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-900 cursor-pointer"
              >
                {GRADES.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            {/* Section */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Sección *
              </label>
              <select
                value={section}
                onChange={(e) => setSection(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-900 cursor-pointer"
              >
                {SECTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

          </div>

          {/* Format */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Tipo de Formato *
            </label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value as DocumentFormat)}
              className="w-full px-3 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-900 cursor-pointer"
            >
              <option value="pdf">Documento PDF (.pdf)</option>
              <option value="docx">Documento Microsoft Word (.docx)</option>
              <option value="xlsx">Hoja de Cálculo Excel (.xlsx)</option>
              <option value="pptx">Presentación PowerPoint (.pptx)</option>
              <option value="exam">Examen / Clave de Respuestas (.exam)</option>
              <option value="image">Imagen / Diagrama (.png, .jpg)</option>
              <option value="txt">Texto Plano / Notas (.txt)</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Descripción del Documento
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Breve explicación de las competencias, objetivos pedagógicos o instrucciones..."
              className="w-full px-3 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-900 resize-none"
            ></textarea>
          </div>

          {/* Cloud Sync Progress Banner if uploading */}
          {isUploading && (
            <div className="p-3 rounded-lg bg-sky-50 border border-sky-200 space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold text-blue-950">
                <span className="flex items-center gap-1.5">
                  <CloudCheck className="w-4 h-4 text-sky-600 animate-pulse" />
                  Sincronizando con la nube escolar...
                </span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-sky-200 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-blue-900 h-1.5 rounded-full transition-all duration-150"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isUploading}
              className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-blue-950 to-blue-900 hover:from-blue-900 hover:to-blue-800 text-amber-300 rounded-xl text-xs font-bold shadow-md shadow-blue-950/20 border border-amber-400/40 transition-all disabled:opacity-50 cursor-pointer"
            >
              <UploadCloud className="w-4 h-4 text-amber-400" />
              <span>{isEditing ? 'Guardar Cambios' : 'Guardar y Sincronizar'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
