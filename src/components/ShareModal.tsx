import React, { useState, useEffect } from 'react';
import {
  X,
  Share2,
  Copy,
  Check,
  Download,
  Folder,
  FileText,
  MessageCircle,
  Mail,
  Send,
  ExternalLink,
  ArrowLeft
} from 'lucide-react';
import { SchoolDocument, StorageFolder } from '../types';
import {
  getFormatInfo,
  downloadSchoolDocument,
  openSchoolDocumentInNewTab
} from '../utils/formatters';

interface ShareModalProps {
  isOpen?: boolean;
  onClose: () => void;
  onExitToWebsite?: () => void;
  document?: SchoolDocument | null;
  doc?: SchoolDocument | null;
  folder?: StorageFolder | null;
  folderDocuments?: SchoolDocument[];
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen = true,
  onClose,
  onExitToWebsite,
  document: docProp,
  doc: docAlias,
  folder,
  folderDocuments = [],
}) => {
  const [copied, setCopied] = useState(false);

  // Close on Escape or 'x'/'X' key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      const isTyping = ['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName);
      if (e.key === 'Escape' || (!isTyping && (e.key === 'x' || e.key === 'X'))) {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const doc = docProp || docAlias || null;

  // Build the direct web shareable link to the file/folder
  const baseUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}`
    : '';

  const directFileLink = doc
    ? `${baseUrl}?doc=${encodeURIComponent(doc.id)}`
    : folder
    ? `${baseUrl}?folder=${encodeURIComponent(folder.id)}`
    : baseUrl;

  const title = doc ? doc.title : folder ? folder.name : 'Archivo Escolar';
  const description = doc
    ? `${doc.fileName} (${doc.course} - ${doc.grade})`
    : folder
    ? `${folder.description || 'Carpeta de archivos escolares'} • ${folderDocuments.length} archivo(s)`
    : '';

  const shareText = doc
    ? `📁 Te comparto el archivo escolar "${doc.title}" (${doc.course}, ${doc.grade}):\n${directFileLink}`
    : `📂 Te comparto la carpeta "${folder?.name}" con ${folderDocuments.length} archivo(s) escolares:\n${directFileLink}`;

  const handleCopy = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(directFileLink);
      } else {
        const input = document.createElement('input');
        input.value = directFileLink;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleOpenInNewTab = () => {
    if (doc) {
      openSchoolDocumentInNewTab(doc);
    } else {
      window.open(directFileLink, '_blank', 'noopener,noreferrer');
    }
  };

  const handleShareWhatsApp = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  const handleShareEmail = () => {
    const subject = encodeURIComponent(`Archivo Escolar: ${title}`);
    const body = encodeURIComponent(
      `Hola,\n\nTe comparto el enlace al archivo escolar:\n\n${title}\n${description}\n\nEnlace directo:\n${directFileLink}\n\nSaludos.`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
  };

  const handleShareTelegram = () => {
    const url = `https://t.me/share/url?url=${encodeURIComponent(directFileLink)}&text=${encodeURIComponent(
      `Archivo Escolar: ${title}`
    )}`;
    window.open(url, '_blank');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Archivo Escolar: ${title}`,
          text: description,
          url: directFileLink,
        });
      } catch {
        // User canceled or ignored
      }
    }
  };

  const handleDownloadAllFolderDocs = () => {
    if (!folderDocuments || folderDocuments.length === 0) return;
    folderDocuments.forEach((d, idx) => {
      setTimeout(() => {
        downloadSchoolDocument(d);
      }, idx * 250);
    });
  };

  const formatInfo = doc ? getFormatInfo(doc.format) : null;

  return (
    <div
      className="fixed inset-0 z-[70] overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="relative bg-white rounded-2xl shadow-2xl border border-sky-200/80 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150 cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Navy & Gold Elegance */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-950 via-blue-900 to-sky-900 text-white flex items-center justify-between border-b border-amber-400/30">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-400 text-blue-950 flex items-center justify-center font-bold shadow-md shadow-amber-400/20">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-1.5">
                <span>{doc ? 'Compartir Archivo' : 'Compartir Carpeta'}</span>
              </h2>
              <p className="text-xs text-sky-200">
                Enlace directo para abrir el archivo en otra pestaña o descargarlo
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="p-1.5 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-xl transition-colors cursor-pointer border border-white/20 flex items-center justify-center"
            title="Cerrar ventana de compartir (Esc o X)"
            aria-label="Cerrar modal de compartir"
          >
            <X className="w-5 h-5 text-amber-300 hover:text-white" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-5">
          {/* Item Preview Card */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-sky-50/80 to-blue-50/50 border border-sky-200 flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-white shadow-xs border border-sky-100 shrink-0 text-blue-700">
              {doc ? (
                <FileText className="w-6 h-6 text-sky-600" />
              ) : (
                <Folder className="w-6 h-6 text-amber-500 fill-amber-400/30" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                {doc && formatInfo && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${formatInfo.badgeBg} border ${formatInfo.borderColor}`}>
                    {formatInfo.label}
                  </span>
                )}
                {folder && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                    <Folder className="w-3 h-3 text-amber-600" />
                    <span>Carpeta</span>
                  </span>
                )}
                <span className="text-[11px] font-medium text-slate-500">
                  {doc ? `${doc.course} • ${doc.grade}` : `${folderDocuments.length} archivos`}
                </span>
              </div>

              <h3 className="text-sm font-bold text-slate-900 leading-snug truncate">
                {title}
              </h3>

              <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                {description}
              </p>
            </div>
          </div>

          {/* Direct Actions: Open in new tab & Download */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={handleOpenInNewTab}
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer border border-sky-500"
              title="Abre el archivo en una pestaña nueva del navegador"
            >
              <ExternalLink className="w-4 h-4 text-sky-200" />
              <span>Abrir en otra pestaña</span>
            </button>

            {doc ? (
              <button
                type="button"
                onClick={() => downloadSchoolDocument(doc)}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-gradient-to-r from-blue-950 to-blue-900 hover:from-blue-900 hover:to-blue-850 text-amber-300 text-xs font-bold transition-all shadow-xs cursor-pointer border border-amber-400/40"
                title="Descargar archivo a tu equipo"
              >
                <Download className="w-4 h-4 text-amber-300" />
                <span>Descargar archivo</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleDownloadAllFolderDocs}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-gradient-to-r from-blue-950 to-blue-900 hover:from-blue-900 hover:to-blue-850 text-amber-300 text-xs font-bold transition-all shadow-xs cursor-pointer border border-amber-400/40"
              >
                <Download className="w-4 h-4 text-amber-300" />
                <span>Descargar todos ({folderDocuments.length})</span>
              </button>
            )}
          </div>

          {/* Link Box */}
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5 flex items-center justify-between">
              <span>Enlace directo al archivo</span>
              {copied && (
                <span className="text-emerald-600 font-bold flex items-center gap-1 text-[11px]">
                  <Check className="w-3.5 h-3.5" />
                  ¡Enlace copiado!
                </span>
              )}
            </label>

            <div className="flex items-center gap-2">
              <div className="flex-1 min-w-0 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-700 select-all truncate">
                {directFileLink}
              </div>

              <button
                type="button"
                onClick={handleCopy}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  copied
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-blue-900 hover:bg-blue-800 text-white shadow-sm'
                }`}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4 text-amber-300" />}
                <span>{copied ? 'Copiado' : 'Copiar Link'}</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5">
              Este enlace lleva directamente al visor del archivo y permite su descarga sin dar acceso a cuentas privadas de docentes.
            </p>
          </div>

          {/* Share on Social Platforms */}
          <div>
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
              Compartir enlace por redes
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {/* WhatsApp */}
              <button
                type="button"
                onClick={handleShareWhatsApp}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold transition-colors cursor-pointer"
                title="Compartir enlace por WhatsApp"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span>WhatsApp</span>
              </button>

              {/* Email */}
              <button
                type="button"
                onClick={handleShareEmail}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 text-xs font-semibold transition-colors cursor-pointer"
                title="Enviar enlace por correo electrónico"
              >
                <Mail className="w-4 h-4 text-sky-600" />
                <span>Correo</span>
              </button>

              {/* Telegram */}
              <button
                type="button"
                onClick={handleShareTelegram}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 text-xs font-semibold transition-colors cursor-pointer"
                title="Compartir enlace por Telegram"
              >
                <Send className="w-4 h-4 text-blue-600" />
                <span>Telegram</span>
              </button>
            </div>

            {typeof navigator !== 'undefined' && typeof navigator.share === 'function' && (
              <button
                type="button"
                onClick={handleNativeShare}
                className="w-full mt-2 flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                <span>Más opciones de compartir del sistema</span>
              </button>
            )}
          </div>

          {/* Bottom Action Section */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => {
                if (onExitToWebsite) {
                  onExitToWebsite();
                } else {
                  onClose();
                }
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer border border-slate-200"
            >
              <ArrowLeft className="w-4 h-4 text-slate-500" />
              <span>Volver a la web</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-blue-950 hover:bg-blue-900 text-amber-300 text-xs font-bold transition-colors cursor-pointer border border-amber-400/40"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
