import React, { useEffect } from 'react';
import {
  X,
  Download,
  Edit,
  Trash2,
  Calendar,
  User,
  GraduationCap,
  FileText,
  Share2,
  Folder,
  ExternalLink
} from 'lucide-react';
import { SchoolDocument, Teacher } from '../types';
import {
  getFormatInfo,
  getCourseColor,
  formatDate,
  formatDateTime,
  downloadSchoolDocument,
  openSchoolDocumentInNewTab
} from '../utils/formatters';

interface DocumentPreviewModalProps {
  document: SchoolDocument;
  onClose: () => void;
  currentTeacher: Teacher | null;
  onEdit: (doc: SchoolDocument) => void;
  onDelete: (doc: SchoolDocument) => void;
  onShare?: (doc: SchoolDocument) => void;
}

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  document,
  onClose,
  currentTeacher,
  onEdit,
  onDelete,
  onShare,
}) => {
  const formatInfo = getFormatInfo(document.format);
  const courseColor = getCourseColor(document.course);

  // Close on Escape or 'x'/'X' key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isTyping = ['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName);
      if (e.key === 'Escape' || (!isTyping && (e.key === 'x' || e.key === 'X'))) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleDownload = () => {
    downloadSchoolDocument(document);
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5 min-w-0 pr-4">
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-md ${formatInfo.badgeBg} border ${formatInfo.borderColor}`}
            >
              {formatInfo.label}
            </span>
            <div className="min-w-0">
              <h2 className="text-base font-bold text-slate-900 truncate">
                {document.title}
              </h2>
              <p className="text-xs text-slate-500 truncate">
                {document.fileName} • {document.fileSize}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6">
          
          {/* Metadata Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            
            {/* Course */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Curso
              </span>
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 truncate">
                <span className={`w-2 h-2 rounded-full ${courseColor.dot}`}></span>
                <span className="truncate">{document.course}</span>
              </div>
            </div>

            {/* Grade & Section */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Grado y Sección
              </span>
              <div className="flex items-center gap-1 text-xs font-bold text-slate-800 truncate">
                <GraduationCap className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span className="truncate">{document.grade} - {document.section.replace('Sección ', '')}</span>
              </div>
            </div>

            {/* Author Teacher */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Profesor Propietario
              </span>
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 truncate">
                <User className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="truncate">{document.authorTeacherName}</span>
              </div>
            </div>

            {/* Date */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Fecha de Archivo
              </span>
              <div className="flex items-center gap-1 text-xs font-bold text-slate-800 truncate">
                <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="truncate">{formatDate(document.createdAt)}</span>
              </div>
            </div>

          </div>

          {/* DOCUMENT CONTENT VIEWER */}
          <div className="space-y-4">
            
            {/* Description */}
            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Descripción del Documento
              </h4>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed">
                {document.description}
              </div>
            </div>

            {/* Document Preview & Content Viewer */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Contenido & Visualización Previa
                </h4>
                <span className="text-[11px] text-slate-400">
                  Última sincronización: {formatDateTime(document.updatedAt)}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-inner font-mono text-xs text-slate-800 space-y-3">
                {/* Official School Seal Header */}
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 font-sans">
                  <div className="flex items-center gap-2">
                    <img
                      src="/insignia_colegio.jpg"
                      alt="Insignia I.E. Libertador Mariscal Castilla"
                      referrerPolicy="no-referrer"
                      className="w-6 h-6 rounded-full object-cover border border-amber-300"
                    />
                    <span className="text-[11px] font-bold text-slate-800">
                      I.E. Libertador Mariscal Castilla - Oxapampa (1954)
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                    Documento Oficial
                  </span>
                </div>

                <div className="flex items-center gap-2 pb-1 text-slate-500 text-[11px]">
                  <FileText className="w-3.5 h-3.5" />
                  <span>Vista previa del archivo: {document.fileName}</span>
                </div>

                {document.contentSummary && (
                  <div className="text-slate-600 bg-slate-50 p-2.5 rounded-md font-sans text-xs">
                    <strong>Resumen Estructurado:</strong> {document.contentSummary}
                  </div>
                )}

                <div className="whitespace-pre-line bg-slate-900 text-slate-100 p-4 rounded-lg text-xs leading-relaxed overflow-x-auto">
                  {document.previewSnippet || "Sin fragmento adicional de texto."}
                </div>
              </div>
            </div>

            {/* Tags */}
            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Etiquetas Clasificatorias
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {document.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="text-xs font-medium px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

          </div>

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/80 flex flex-wrap items-center justify-between gap-2">
          
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onEdit(document)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
            >
              <Edit className="w-3.5 h-3.5" />
              Editar Datos
            </button>
            <button
              type="button"
              onClick={() => onDelete(document)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-rose-50 text-rose-600 rounded-lg text-xs font-semibold transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Eliminar
            </button>
          </div>

          <div className="flex items-center gap-2">
            {onShare && (
              <button
                type="button"
                onClick={() => onShare(document)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-sky-50 border border-sky-300 hover:bg-sky-100 text-blue-950 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                title="Compartir link de este archivo"
              >
                <Share2 className="w-3.5 h-3.5 text-sky-600" />
                Compartir Link
              </button>
            )}

            <button
              type="button"
              onClick={() => openSchoolDocumentInNewTab(document)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
              title="Abrir el archivo en una pestaña nueva del navegador"
            >
              <ExternalLink className="w-3.5 h-3.5 text-sky-200" />
              Abrir en otra pestaña
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-950 to-blue-900 hover:from-blue-900 hover:to-blue-850 text-amber-300 border border-amber-400/40 rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
              title="Descarga local al dispositivo"
            >
              <Download className="w-3.5 h-3.5 text-amber-300" />
              Descarga Local
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            >
              Cerrar
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
