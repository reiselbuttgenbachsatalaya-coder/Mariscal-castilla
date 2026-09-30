import React from 'react';
import {
  FileText,
  FileSpreadsheet,
  Presentation,
  Table2,
  Award,
  Image as ImageIcon,
  File,
  Eye,
  Edit,
  Trash2,
  Star,
  Download,
  GraduationCap,
  Share2,
  Folder,
  ExternalLink
} from 'lucide-react';
import { SchoolDocument } from '../types';
import {
  getFormatInfo,
  getCourseColor,
  formatDate,
  formatRelativeTime,
  downloadSchoolDocument,
  openSchoolDocumentInNewTab
} from '../utils/formatters';

interface DocumentListItemProps {
  document: SchoolDocument;
  onPreview: (doc: SchoolDocument) => void;
  onEdit: (doc: SchoolDocument) => void;
  onDelete: (doc: SchoolDocument) => void;
  onToggleFavorite: (id: string) => void;
  onShare?: (doc: SchoolDocument) => void;
}

export const DocumentListItem: React.FC<DocumentListItemProps> = ({
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
        return <FileText className="w-4 h-4 text-rose-600" />;
      case 'docx':
        return <FileSpreadsheet className="w-4 h-4 text-blue-600" />;
      case 'xlsx':
        return <Table2 className="w-4 h-4 text-emerald-600" />;
      case 'pptx':
        return <Presentation className="w-4 h-4 text-orange-600" />;
      case 'exam':
        return <Award className="w-4 h-4 text-purple-600" />;
      case 'image':
        return <ImageIcon className="w-4 h-4 text-teal-600" />;
      default:
        return <File className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <tr className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors text-xs">
      {/* Favorite Star */}
      <td className="py-3 pl-4 pr-1 w-8">
        <button
          type="button"
          onClick={() => onToggleFavorite(document.id)}
          className={`p-1 rounded transition-colors ${
            document.isFavorite ? 'text-amber-500' : 'text-slate-300 hover:text-slate-500'
          }`}
          title={document.isFavorite ? 'Quitar de favoritos' : 'Marcar favorito'}
        >
          <Star className={`w-3.5 h-3.5 ${document.isFavorite ? 'fill-amber-400' : ''}`} />
        </button>
      </td>

      {/* Document Title & File Info */}
      <td className="py-3 px-3 max-w-sm">
        <div className="flex items-start gap-2.5">
          <div className="p-1.5 rounded bg-slate-100 shrink-0 mt-0.5">
            {renderFormatIcon()}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => onPreview(document)}
                className="font-semibold text-slate-900 text-left hover:text-sky-700 truncate max-w-md block"
                title={document.title}
              >
                {document.title}
              </button>
              {document.folderName && (
                <span
                  className="inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.2 rounded bg-amber-50 text-amber-800 border border-amber-300 shrink-0"
                  title={`Carpeta: ${document.folderName}`}
                >
                  <Folder className="w-2.5 h-2.5 text-amber-600 fill-amber-300/40" />
                  <span className="truncate max-w-[90px]">{document.folderName}</span>
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
              <span className="uppercase font-semibold text-slate-500">{document.format}</span>
              <span>•</span>
              <span>{document.fileSize}</span>
              <span>•</span>
              <span className="truncate">{document.fileName}</span>
            </div>
          </div>
        </div>
      </td>

      {/* Course */}
      <td className="py-3 px-3">
        <span
          className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md ${courseColor.bg} ${courseColor.text}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${courseColor.dot}`}></span>
          <span className="truncate max-w-[120px]">{document.course}</span>
        </span>
      </td>

      {/* Grade & Section */}
      <td className="py-3 px-3">
        <div className="flex items-center gap-1 text-slate-700 font-medium whitespace-nowrap">
          <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
          <span>{document.grade}</span>
          <span className="px-1 py-0.2 bg-slate-100 rounded text-[10px] text-slate-600 font-semibold">
            {document.section.replace('Sección ', '')}
          </span>
        </div>
      </td>

      {/* Author Teacher */}
      <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
        {document.authorTeacherName.replace('Prof. ', '')}
      </td>

      {/* Date */}
      <td className="py-3 px-3 text-slate-500 whitespace-nowrap" title={formatDate(document.createdAt)}>
        {formatRelativeTime(document.createdAt)}
      </td>

      {/* Format badge */}
      <td className="py-3 px-3 whitespace-nowrap">
        <span className="inline-flex items-center px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-semibold uppercase">
          {document.format}
        </span>
      </td>

      {/* Actions */}
      <td className="py-3 pr-4 pl-2 text-right whitespace-nowrap">
        <div className="flex items-center justify-end gap-1">
          {onShare && (
            <button
              type="button"
              onClick={() => onShare(document)}
              className="p-1.5 rounded transition-colors text-slate-600 hover:text-sky-700 hover:bg-sky-50 cursor-pointer"
              title="Compartir enlace de este archivo"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={() => openSchoolDocumentInNewTab(document)}
            className="p-1.5 rounded transition-colors text-sky-700 hover:text-blue-950 hover:bg-sky-50 cursor-pointer"
            title="Abrir archivo en otra pestaña"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => downloadSchoolDocument(document)}
            className="p-1.5 rounded transition-colors text-slate-600 hover:text-amber-700 hover:bg-amber-50 cursor-pointer"
            title="Descarga local a tu dispositivo"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onPreview(document)}
            className="p-1.5 rounded transition-colors text-slate-600 hover:text-indigo-600 hover:bg-slate-100"
            title="Visualizar"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onEdit(document)}
            className="p-1.5 rounded transition-colors text-slate-600 hover:text-indigo-600 hover:bg-slate-100"
            title="Editar categorización"
          >
            <Edit className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(document)}
            className="p-1.5 rounded transition-colors text-slate-400 hover:text-rose-600 hover:bg-rose-50"
            title="Eliminar"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );
};
