import React from 'react';
import {
  FileText,
  FileSpreadsheet,
  Presentation,
  Table2,
  Award,
  Image as ImageIcon,
  File,
  Download,
  Eye,
  Edit,
  Trash2,
  Star,
  Clock,
  User,
  GraduationCap,
  Share2,
  Folder,
  ExternalLink
} from 'lucide-react';
import { SchoolDocument } from '../types';
import {
  getFormatInfo,
  getCourseColor,
  formatRelativeTime,
  formatDate,
  downloadSchoolDocument,
  openSchoolDocumentInNewTab
} from '../utils/formatters';

interface DocumentCardProps {
  document: SchoolDocument;
  onPreview: (doc: SchoolDocument) => void;
  onEdit: (doc: SchoolDocument) => void;
  onDelete: (doc: SchoolDocument) => void;
  onToggleFavorite: (id: string) => void;
  onShare?: (doc: SchoolDocument) => void;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({
  document,
  onPreview,
  onEdit,
  onDelete,
  onToggleFavorite,
  onShare,
}) => {
  const courseColor = getCourseColor(document.course);

  const renderFormatIcon = () => {
    switch (document.format) {
      case 'pdf':
        return <FileText className="w-5 h-5 text-rose-600" />;
      case 'docx':
        return <FileSpreadsheet className="w-5 h-5 text-blue-600" />;
      case 'xlsx':
        return <Table2 className="w-5 h-5 text-emerald-600" />;
      case 'pptx':
        return <Presentation className="w-5 h-5 text-orange-600" />;
      case 'exam':
        return <Award className="w-5 h-5 text-purple-600" />;
      case 'image':
        return <ImageIcon className="w-5 h-5 text-teal-600" />;
      default:
        return <File className="w-5 h-5 text-slate-600" />;
    }
  };

  return (
    <div
      className="group relative bg-white rounded-xl border border-slate-200/90 hover:border-sky-300 transition-all duration-200 hover:shadow-md hover:shadow-sky-100 flex flex-col justify-between overflow-hidden"
    >
      {/* Top Card Header */}
      <div className="p-4 pb-2">
        {/* Course & Section Badge + Favorite star */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex flex-wrap items-center gap-1.5">
            {/* Course Tag */}
            <span
              className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md ${courseColor.bg} ${courseColor.text}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${courseColor.dot}`}></span>
              <span className="truncate max-w-[130px]">{document.course}</span>
            </span>

            {/* Grade and Section Tag */}
            <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
              <GraduationCap className="w-3 h-3 text-slate-400" />
              <span>{document.grade}</span>
              <span className="text-slate-400">•</span>
              <span>{document.section.replace('Sección ', '')}</span>
            </span>

            {/* Folder badge if assigned */}
            {document.folderName && (
              <span
                className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-300/70"
                title={`Guardado en carpeta: ${document.folderName}`}
              >
                <Folder className="w-3 h-3 text-amber-600 fill-amber-300/40" />
                <span className="truncate max-w-[110px]">{document.folderName}</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            {/* Share Quick Button */}
            {onShare && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onShare(document);
                }}
                className="p-1 text-sky-700 hover:text-blue-900 hover:bg-sky-50 rounded-md transition-colors cursor-pointer"
                title="Compartir link de este archivo"
              >
                <Share2 className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Favorite toggle button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(document.id);
              }}
              className={`p-1 rounded-md transition-colors cursor-pointer ${
                document.isFavorite
                  ? 'text-amber-500 hover:text-amber-600'
                  : 'text-slate-300 hover:text-slate-500 opacity-0 group-hover:opacity-100'
              }`}
              title={document.isFavorite ? 'Quitar de favoritos' : 'Marcar como favorito'}
            >
              <Star className={`w-4 h-4 ${document.isFavorite ? 'fill-amber-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Title and Icon */}
        <div className="flex items-start gap-2.5 mb-2">
          <div className="p-2 rounded-lg bg-sky-50/70 border border-sky-100 shrink-0 mt-0.5">
            {renderFormatIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <h3
              onClick={() => onPreview(document)}
              className="text-sm font-semibold text-slate-900 line-clamp-2 leading-snug hover:text-sky-700 cursor-pointer transition-colors"
              title={document.title}
            >
              {document.title}
            </h3>
            <p className="text-[11px] text-slate-400 truncate mt-0.5">
              {document.fileName} • {document.fileSize}
            </p>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-2">
          {document.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mt-1 mb-2">
          {document.tags.slice(0, 3).map((tag, idx) => (
            <span
              key={idx}
              className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-slate-100 text-slate-600"
            >
              #{tag}
            </span>
          ))}
          {document.tags.length > 3 && (
            <span className="text-[10px] text-slate-400">
              +{document.tags.length - 3}
            </span>
          )}
        </div>
      </div>

      {/* Card Footer: Metadata & Actions */}
      <div className="px-4 py-2.5 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
        
        {/* Author & Date */}
        <div className="flex items-center gap-3 truncate mr-2">
          <span className="flex items-center gap-1 truncate" title={`Subido por ${document.authorTeacherName}`}>
            <User className="w-3 h-3 text-slate-400 shrink-0" />
            <span className="truncate">{document.authorTeacherName.replace('Prof. ', '')}</span>
          </span>
          <span className="flex items-center gap-1 shrink-0 text-slate-400" title={formatDate(document.createdAt)}>
            <Clock className="w-3 h-3" />
            <span>{formatRelativeTime(document.createdAt)}</span>
          </span>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-1 shrink-0">
          {onShare && (
            <button
              type="button"
              onClick={() => onShare(document)}
              className="p-1.5 rounded-md transition-colors text-sky-700 hover:text-blue-950 hover:bg-sky-100/70 cursor-pointer"
              title="Compartir link directo"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            type="button"
            onClick={() => openSchoolDocumentInNewTab(document)}
            className="p-1.5 rounded-md transition-colors text-sky-700 hover:text-blue-950 hover:bg-sky-100/70 cursor-pointer"
            title="Abrir archivo en otra pestaña"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => downloadSchoolDocument(document)}
            className="p-1.5 rounded-md transition-colors text-slate-600 hover:text-blue-900 hover:bg-amber-100/60 cursor-pointer"
            title="Descarga local a tu dispositivo"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => onPreview(document)}
            className="p-1.5 rounded-md transition-colors text-slate-600 hover:text-sky-700 hover:bg-slate-200/60 cursor-pointer"
            title="Visualizar documento"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => onEdit(document)}
            className="p-1.5 rounded-md transition-colors text-slate-600 hover:text-sky-700 hover:bg-slate-200/60 cursor-pointer"
            title="Editar categorización y carpeta"
          >
            <Edit className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => onDelete(document)}
            className="p-1.5 rounded-md transition-colors text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
            title="Eliminar archivo"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

    </div>
  );
};
