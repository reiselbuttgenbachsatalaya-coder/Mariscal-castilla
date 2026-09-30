import React, { useState, useEffect } from 'react';
import {
  FileText,
  FileSpreadsheet,
  Presentation,
  Table2,
  Award,
  Image as ImageIcon,
  File,
  Download,
  Share2,
  Folder,
  FolderOpen,
  Calendar,
  GraduationCap,
  User,
  Check,
  Copy,
  ExternalLink,
  Eye,
  X,
  CheckCircle2
} from 'lucide-react';
import { SchoolDocument, StorageFolder } from '../types';
import {
  getFormatInfo,
  getCourseColor,
  formatDate,
  formatRelativeTime,
  downloadSchoolDocument,
  openSchoolDocumentInNewTab
} from '../utils/formatters';

interface PublicSharedViewerProps {
  sharedDoc: SchoolDocument | null;
  sharedFolder: StorageFolder | null;
  folderDocs: SchoolDocument[];
  onLoginClick?: () => void;
  onPreviewDoc?: (doc: SchoolDocument) => void;
  onExitToWebsite?: () => void;
}

export const PublicSharedViewer: React.FC<PublicSharedViewerProps> = ({
  sharedDoc,
  sharedFolder,
  folderDocs,
  onPreviewDoc,
}) => {
  const [copied, setCopied] = useState(false);
  const [downloadingAll, setDownloadingAll] = useState(false);

  // Auto-download when opened with ?download=true or ?download=1
  useEffect(() => {
    if (!sharedDoc) return;
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('download') === 'true' || params.get('download') === '1') {
        const timer = setTimeout(() => {
          downloadSchoolDocument(sharedDoc);
        }, 600);
        return () => clearTimeout(timer);
      }
    } catch {}
  }, [sharedDoc]);

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleShareWhatsApp = () => {
    const title = sharedDoc ? sharedDoc.title : sharedFolder?.name || 'Recursos Escolares';
    const text = `📁 *Archivo Escolar Compartido*: ${title}\nAccede y descarga aquí: ${currentUrl}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleCloseTab = () => {
    if (typeof window !== 'undefined') {
      window.close();
    }
  };

  const handleDownloadAll = () => {
    if (folderDocs.length === 0) return;
    setDownloadingAll(true);
    folderDocs.forEach((doc, idx) => {
      setTimeout(() => {
        downloadSchoolDocument(doc);
        if (idx === folderDocs.length - 1) {
          setTimeout(() => setDownloadingAll(false), 800);
        }
      }, idx * 300);
    });
  };

  const renderFormatIcon = (format: string) => {
    switch (format) {
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
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Top Header - Blue & Gold Theme */}
      <header className="bg-gradient-to-r from-blue-950 via-blue-900 to-sky-950 text-white px-4 sm:px-8 py-3.5 border-b border-amber-400/40 flex items-center justify-between shadow-lg sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full p-0.5 bg-gradient-to-tr from-amber-300 via-amber-400 to-amber-500 shadow-md flex items-center justify-center overflow-hidden shrink-0">
            <img
              src="/insignia_colegio.jpg"
              alt="Insignia I.E. Libertador Mariscal Castilla"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover rounded-full bg-white"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-extrabold text-white tracking-tight">
                I.E. Libertador Mariscal Castilla
              </h1>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40">
                Oxapampa • 1954
              </span>
            </div>
            <p className="text-[11px] text-sky-200/90">
              Visor Oficial de Archivo Escolar y Recursos Curriculares
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-2.5">
          {sharedDoc && (
            <button
              type="button"
              onClick={() => openSchoolDocumentInNewTab(sharedDoc)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-xs border border-sky-400 transition-all cursor-pointer"
              title="Abrir archivo en otra pestaña"
            >
              <ExternalLink className="w-3.5 h-3.5 text-sky-100" />
              <span className="hidden sm:inline">Abrir en otra pestaña</span>
              <span className="inline sm:hidden">Abrir</span>
            </button>
          )}

          {sharedDoc && (
            <button
              type="button"
              onClick={() => downloadSchoolDocument(sharedDoc)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 text-blue-950 font-bold text-xs shadow-sm border border-amber-200 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Descargar</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleCloseTab}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/90 hover:text-white border border-white/20 transition-all cursor-pointer shadow-xs flex items-center justify-center shrink-0"
            title="Cerrar esta pestaña"
            aria-label="Cerrar visor"
          >
            <X className="w-4 h-4 text-amber-300 hover:text-white" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* CASE 1: SHARED DOCUMENT */}
        {sharedDoc && (
          <div className="space-y-6">
            {/* Breadcrumb banner */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="font-semibold text-blue-900">Archivo Escolar Compartido</span>
                <span>/</span>
                <span className="text-slate-700 font-bold">{sharedDoc.title}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-sky-50 text-blue-950 border border-sky-200 rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">¡Enlace Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-sky-600" />
                      <span>Copiar Enlace</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleShareWhatsApp}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Compartir</span>
                </button>
              </div>
            </div>

            {/* Main Document Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden">
              {/* Card Header Banner */}
              <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-sky-950 text-white p-6 sm:p-8 border-b border-amber-400/30">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                  <div className="space-y-2 max-w-2xl">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-amber-400 text-blue-950 uppercase tracking-wide">
                        {sharedDoc.format}
                      </span>
                      <span className="text-xs font-medium px-2.5 py-0.5 rounded-md bg-blue-950/60 text-amber-200 border border-amber-400/30">
                        {sharedDoc.grade} • {sharedDoc.section}
                      </span>
                      {sharedDoc.folderName && (
                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-400/40 flex items-center gap-1">
                          <Folder className="w-3 h-3 text-amber-300" />
                          <span>Carpeta: {sharedDoc.folderName}</span>
                        </span>
                      )}
                    </div>

                    <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
                      {sharedDoc.title}
                    </h2>

                    <p className="text-xs text-sky-200">
                      Archivo: <span className="font-semibold text-white">{sharedDoc.fileName}</span> • {sharedDoc.fileSize}
                    </p>
                  </div>

                  {/* Action Buttons: Open in New Tab & Direct Download */}
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <button
                      type="button"
                      onClick={() => openSchoolDocumentInNewTab(sharedDoc)}
                      className="flex items-center gap-2 px-5 py-3.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-sky-600/30 border border-sky-400 transition-all cursor-pointer transform hover:-translate-y-0.5"
                      title="Abrir archivo en otra pestaña"
                    >
                      <ExternalLink className="w-4 h-4 text-sky-100" />
                      <span>ABRIR EN OTRA PESTAÑA</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => downloadSchoolDocument(sharedDoc)}
                      className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-300 hover:from-amber-300 hover:to-yellow-200 text-blue-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-400/30 border border-amber-200 transition-all cursor-pointer transform hover:-translate-y-0.5 active:scale-98"
                      title="Descargar archivo directamente a tu dispositivo"
                    >
                      <Download className="w-5 h-5 text-blue-950 stroke-[2.5]" />
                      <span>DESCARGAR ARCHIVO AHORA</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Status Banner */}
              <div className="bg-sky-50/90 border-b border-sky-200 px-6 py-3 flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-blue-900 text-white flex items-center justify-center shrink-0">
                    <ExternalLink className="w-3.5 h-3.5 text-amber-300" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-blue-950">
                      Visualización y Descarga Directa
                    </span>
                    <p className="text-[11px] text-slate-600">
                      Puedes abrir el archivo en otra pestaña para consultarlo o descargarlo inmediatamente a tu equipo.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openSchoolDocumentInNewTab(sharedDoc)}
                    className="px-3.5 py-1.5 rounded-lg bg-blue-900 text-amber-300 text-xs font-bold hover:bg-blue-800 transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Abrir en otra pestaña</span>
                  </button>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 space-y-6">
                {/* Meta details grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Docente Responsable
                    </span>
                    <p className="text-sm font-bold text-slate-800 mt-0.5 flex items-center gap-1.5">
                      <User className="w-4 h-4 text-sky-600" />
                      <span>{sharedDoc.authorTeacherName}</span>
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Curso y Grado
                    </span>
                    <p className="text-sm font-bold text-slate-800 mt-0.5 flex items-center gap-1.5">
                      <GraduationCap className="w-4 h-4 text-sky-600" />
                      <span>{sharedDoc.course} ({sharedDoc.grade})</span>
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Fecha de Registro
                    </span>
                    <p className="text-sm font-bold text-slate-800 mt-0.5 flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-sky-600" />
                      <span>{formatDate(sharedDoc.createdAt)}</span>
                    </p>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Descripción del Contenido
                  </h3>
                  <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200/70">
                    {sharedDoc.description || 'Sin descripción adicional proporcionada.'}
                  </p>
                </div>

                {/* Summary / Extract */}
                {sharedDoc.contentSummary && (
                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Resumen Oficial
                    </h3>
                    <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100 text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                      {sharedDoc.contentSummary}
                    </div>
                  </div>
                )}

                {/* Text Snippet / Preview */}
                {sharedDoc.previewSnippet && (
                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Vista Previa de Texto
                    </h3>
                    <div className="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs leading-relaxed overflow-x-auto max-h-60 border border-slate-800">
                      {sharedDoc.previewSnippet}
                    </div>
                  </div>
                )}
              </div>

              {/* Card Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between flex-wrap gap-3">
                <span className="text-xs text-slate-500">
                  Institución Educativa • Archivo Oficial
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openSchoolDocumentInNewTab(sharedDoc)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-xs border border-sky-400 transition-colors cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Abrir en otra pestaña</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => downloadSchoolDocument(sharedDoc)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 text-blue-950 font-bold text-xs shadow-xs border border-amber-200 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Descargar archivo</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CASE 2: SHARED FOLDER */}
        {sharedFolder && (
          <div className="space-y-6">
            {/* Breadcrumb banner */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="font-semibold text-blue-900">Carpeta Compartida</span>
                <span>/</span>
                <span className="text-slate-700 font-bold">{sharedFolder.name}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-sky-50 text-blue-950 border border-sky-200 rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">¡Enlace Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-sky-600" />
                      <span>Copiar Enlace</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleShareWhatsApp}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Compartir</span>
                </button>
              </div>
            </div>

            {/* Folder Header Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden">
              <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-sky-950 text-white p-6 sm:p-8 border-b border-amber-400/30">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                  <div className="space-y-2 max-w-2xl">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-amber-400 text-blue-950 uppercase tracking-wide flex items-center gap-1">
                        <Folder className="w-3.5 h-3.5" />
                        <span>Carpeta de Archivos</span>
                      </span>
                      <span className="text-xs font-medium px-2.5 py-0.5 rounded-md bg-blue-950/60 text-amber-200 border border-amber-400/30">
                        {folderDocs.length} archivo(s) disponibles
                      </span>
                    </div>

                    <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
                      {sharedFolder.name}
                    </h2>

                    <p className="text-xs text-sky-200">
                      {sharedFolder.description || 'Colección de recursos escolares para descarga directa.'}
                    </p>
                  </div>

                  {folderDocs.length > 0 && (
                    <button
                      type="button"
                      onClick={handleDownloadAll}
                      disabled={downloadingAll}
                      className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-300 hover:from-amber-300 hover:to-yellow-200 text-blue-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-400/30 border border-amber-200 transition-all cursor-pointer transform hover:-translate-y-0.5 active:scale-98 shrink-0 disabled:opacity-50"
                    >
                      <Download className="w-5 h-5 text-blue-950 stroke-[2.5]" />
                      <span>{downloadingAll ? 'DESCARGANDO...' : 'DESCARGAR TODOS LOS ARCHIVOS'}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Folder Documents List */}
              {folderDocs.length === 0 ? (
                <div className="p-12 text-center text-slate-400">
                  <FolderOpen className="w-12 h-12 mx-auto mb-3 opacity-40 text-sky-700" />
                  <p className="text-sm font-medium">Esta carpeta aún no tiene archivos cargados.</p>
                </div>
              ) : (
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {folderDocs.map((doc) => {
                    const formatInfo = getFormatInfo(doc.format);
                    const courseColor = getCourseColor(doc.course);
                    return (
                      <div
                        key={doc.id}
                        className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/90 hover:border-sky-300 hover:bg-white transition-all shadow-2xs hover:shadow-sm flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${formatInfo.badgeBg} border ${formatInfo.borderColor}`}>
                              {formatInfo.label}
                            </span>
                            <span className="text-[11px] font-semibold text-slate-500">
                              {doc.course}
                            </span>
                          </div>

                          <div className="flex items-start gap-2.5 mb-2">
                            <div className="p-2 rounded-lg bg-sky-50 border border-sky-100 shrink-0 mt-0.5">
                              {renderFormatIcon(doc.format)}
                            </div>
                            <div className="min-w-0">
                              <h4
                                onClick={() => openSchoolDocumentInNewTab(doc)}
                                className="text-xs sm:text-sm font-bold text-slate-900 hover:text-blue-900 cursor-pointer truncate"
                                title={doc.title}
                              >
                                {doc.title}
                              </h4>
                              <p className="text-[11px] text-slate-500 truncate mt-0.5">
                                {doc.grade} • {doc.section} • {doc.fileSize}
                              </p>
                            </div>
                          </div>

                          {doc.description && (
                            <p className="text-xs text-slate-600 line-clamp-2 mt-1 mb-2">
                              {doc.description}
                            </p>
                          )}
                        </div>

                        {/* Card bottom actions */}
                        <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2 mt-2">
                          <button
                            type="button"
                            onClick={() => openSchoolDocumentInNewTab(doc)}
                            className="text-xs font-semibold text-sky-700 hover:text-blue-950 flex items-center gap-1 cursor-pointer"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Abrir en pestaña</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => downloadSchoolDocument(doc)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-950 hover:bg-blue-900 text-amber-300 font-bold text-xs shadow-xs border border-amber-400/40 transition-colors cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5 text-amber-300" />
                            <span>Descargar</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Folder Bottom Action Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between flex-wrap gap-3">
                <span className="text-xs text-slate-500 font-medium">
                  {folderDocs.length} {folderDocs.length === 1 ? 'archivo en total' : 'archivos en total'}
                </span>

                {folderDocs.length > 0 && (
                  <button
                    type="button"
                    onClick={handleDownloadAll}
                    disabled={downloadingAll}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 text-blue-950 font-bold text-xs shadow-xs border border-amber-200 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{downloadingAll ? 'Descargando...' : 'Descargar todos los archivos'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Fallback if neither doc nor folder found */}
        {!sharedDoc && !sharedFolder && (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto space-y-4 shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
              <FolderOpen className="w-7 h-7" />
            </div>
            <h2 className="text-lg font-bold text-slate-800">
              Enlace no encontrado o no disponible
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              El archivo o carpeta compartida no está disponible. Es posible que haya sido movido o que el enlace sea incorrecto.
            </p>
            <div className="pt-2 flex justify-center">
              <button
                type="button"
                onClick={handleCloseTab}
                className="px-5 py-2.5 rounded-xl bg-blue-950 hover:bg-blue-900 text-amber-300 font-bold text-xs shadow-xs border border-amber-400/40 transition-colors cursor-pointer"
              >
                Cerrar Pestaña
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
