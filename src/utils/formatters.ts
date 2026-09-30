import { DocumentFormat, SchoolDocument } from '../types';

export function formatFileSize(sizeStr: string): string {
  return sizeStr || '0 KB';
}

export function formatDate(isoString: string): string {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return 'Fecha desconocida';
    return d.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return 'Fecha inválida';
  }
}

export function formatDateTime(isoString: string): string {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return 'Fecha desconocida';
    return d.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return 'Fecha inválida';
  }
}

export function formatRelativeTime(isoString: string): string {
  try {
    const now = new Date();
    const date = new Date(isoString);
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHours = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMin < 1) return 'Hace un momento';
    if (diffMin < 60) return `Hace ${diffMin} min`;
    if (diffHours < 24) return `Hace ${diffHours} h`;
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    return formatDate(isoString);
  } catch {
    return formatDate(isoString);
  }
}

export function getFormatInfo(format: DocumentFormat): {
  label: string;
  badgeBg: string;
  badgeText: string;
  borderColor: string;
  iconType: string;
} {
  switch (format) {
    case 'pdf':
      return {
        label: 'PDF',
        badgeBg: 'bg-rose-50 text-rose-700',
        badgeText: 'text-rose-700',
        borderColor: 'border-rose-200',
        iconType: 'FileText',
      };
    case 'docx':
      return {
        label: 'Word',
        badgeBg: 'bg-blue-50 text-blue-700',
        badgeText: 'text-blue-700',
        borderColor: 'border-blue-200',
        iconType: 'FileSpreadsheet',
      };
    case 'xlsx':
      return {
        label: 'Excel',
        badgeBg: 'bg-emerald-50 text-emerald-700',
        badgeText: 'text-emerald-700',
        borderColor: 'border-emerald-200',
        iconType: 'Table2',
      };
    case 'pptx':
      return {
        label: 'PowerPoint',
        badgeBg: 'bg-orange-50 text-orange-700',
        badgeText: 'text-orange-700',
        borderColor: 'border-orange-200',
        iconType: 'Presentation',
      };
    case 'exam':
      return {
        label: 'Examen / Clave',
        badgeBg: 'bg-purple-50 text-purple-700',
        badgeText: 'text-purple-700',
        borderColor: 'border-purple-200',
        iconType: 'Award',
      };
    case 'image':
      return {
        label: 'Imagen',
        badgeBg: 'bg-teal-50 text-teal-700',
        badgeText: 'text-teal-700',
        borderColor: 'border-teal-200',
        iconType: 'Image',
      };
    case 'txt':
    default:
      return {
        label: 'Texto / Nota',
        badgeBg: 'bg-slate-50 text-slate-700',
        badgeText: 'text-slate-700',
        borderColor: 'border-slate-200',
        iconType: 'File',
      };
  }
}

export function getCourseColor(courseName: string): { bg: string; text: string; dot: string } {
  const norm = courseName.toLowerCase();
  if (norm.includes('matemát') || norm.includes('algebra')) {
    return { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' };
  }
  if (norm.includes('comunic') || norm.includes('literatura') || norm.includes('lengu')) {
    return { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' };
  }
  if (norm.includes('cienc') || norm.includes('biolog')) {
    return { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' };
  }
  if (norm.includes('historia') || norm.includes('social') || norm.includes('geograf')) {
    return { bg: 'bg-orange-50', text: 'text-orange-700', dot: 'bg-orange-500' };
  }
  if (norm.includes('inglés') || norm.includes('ingles') || norm.includes('idioma')) {
    return { bg: 'bg-indigo-50', text: 'text-indigo-700', dot: 'bg-indigo-500' };
  }
  if (norm.includes('comput') || norm.includes('tecnol') || norm.includes('robot')) {
    return { bg: 'bg-cyan-50', text: 'text-cyan-700', dot: 'bg-cyan-500' };
  }
  if (norm.includes('arte') || norm.includes('músic') || norm.includes('music')) {
    return { bg: 'bg-pink-50', text: 'text-pink-700', dot: 'bg-pink-500' };
  }
  if (norm.includes('físic') || norm.includes('depor')) {
    return { bg: 'bg-teal-50', text: 'text-teal-700', dot: 'bg-teal-500' };
  }
  return { bg: 'bg-slate-100', text: 'text-slate-700', dot: 'bg-slate-500' };
}

/**
 * Normaliza cualquier formato de hora (ej: "14:30" o "08:00 AM") a formato 12 horas con AM/PM
 */
export function formatTime12h(timeStr: string): string {
  if (!timeStr) return '';
  const trimmed = timeStr.trim();
  if (trimmed.toUpperCase().includes('AM') || trimmed.toUpperCase().includes('PM')) {
    return trimmed;
  }
  const parts = trimmed.split(':');
  if (parts.length < 2) return trimmed;
  let hours = parseInt(parts[0], 10);
  const minutes = parts[1].padStart(2, '0');
  if (isNaN(hours)) return trimmed;
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  if (hours === 0) hours = 12;
  const formattedHours = hours.toString().padStart(2, '0');
  return `${formattedHours}:${minutes} ${ampm}`;
}

/**
 * Formatea la fecha y hora completa en formato legible con AM/PM
 * Ej: "07 de sep. de 2026, 11:15 AM"
 */
export function formatFullDateTime12h(isoString: string): string {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return 'Fecha desconocida';
    
    const datePart = d.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    let hours = d.getHours();
    const minutes = d.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    if (hours === 0) hours = 12;
    const formattedHours = hours.toString().padStart(2, '0');

    return `${datePart} a las ${formattedHours}:${minutes} ${ampm}`;
  } catch {
    return 'Fecha inválida';
  }
}

/**
 * Descarga directamente un documento docente al dispositivo
 */
export function downloadSchoolDocument(doc: SchoolDocument) {
  const fileName = doc.fileName || `${doc.title.replace(/\s+/g, '_')}.${doc.format === 'exam' ? 'pdf' : doc.format}`;
  
  if (doc.fileDataUrl) {
    const link = document.createElement('a');
    link.href = doc.fileDataUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return;
  }

  // Generar contenido de descarga simulado estructurado si no hay dataUrl
  const fileContent = `=====================================================
INSTITUCIÓN EDUCATIVA - ARCHIVO DOCENTE
=====================================================
DOCUMENTO: ${doc.title}
ARCHIVO: ${fileName}
FORMATO: ${doc.format.toUpperCase()}
FECHA DE SUBIDA: ${formatFullDateTime12h(doc.createdAt)}
DOCENTE RESPONSABLE: ${doc.authorTeacherName}
CURSO / ASIGNATURA: ${doc.course}
GRADO Y SECCIÓN: ${doc.grade} - ${doc.section}
CATEGORÍA: ${doc.smartCategory || 'General'}
-----------------------------------------------------
RESUMEN DEL CONTENIDO:
${doc.description || ''}

${doc.contentSummary || ''}
-----------------------------------------------------
FRAGMENTO DEL DOCUMENTO:
${doc.previewSnippet || ''}
=====================================================
`;

  const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName.endsWith('.pdf') || fileName.endsWith('.docx') || fileName.endsWith('.xlsx')
    ? fileName
    : `${fileName}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Abre el archivo directamente en otra pestaña del navegador.
 * Si contiene archivo cargado (base64 dataUrl), lo abre en blob en nueva pestaña.
 * Si es un documento registrado, genera una vista limpia e imprimible en nueva pestaña
 * sin requerir acceso al portal docente ni cuenta externa.
 */
export function openSchoolDocumentInNewTab(doc: SchoolDocument): void {
  if (doc.fileDataUrl) {
    try {
      const parts = doc.fileDataUrl.split(',');
      const mime = parts[0].match(/:(.*?);/)?.[1] || 'application/pdf';
      const b64 = atob(parts[1]);
      let len = b64.length;
      const u8 = new Uint8Array(len);
      while (len--) {
        u8[len] = b64.charCodeAt(len);
      }
      const blob = new Blob([u8], { type: mime });
      const blobUrl = URL.createObjectURL(blob);
      const newTab = window.open(blobUrl, '_blank', 'noopener,noreferrer');
      if (!newTab) {
        downloadSchoolDocument(doc);
      }
      return;
    } catch {
      window.open(doc.fileDataUrl, '_blank', 'noopener,noreferrer');
      return;
    }
  }

  // Si no tiene dataUrl binario cargado, abrimos la ficha y contenido del archivo en pestaña limpia
  const fileName = doc.fileName || `${doc.title.replace(/\s+/g, '_')}.${doc.format === 'exam' ? 'pdf' : doc.format}`;
  const escapeStr = (s?: string) => (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeStr(doc.title)} - Archivo Escolar</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 24px; background: #f1f5f9; color: #1e293b; }
    .card { max-width: 820px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #cbd5e1; box-shadow: 0 4px 20px rgba(0,0,0,0.08); overflow: hidden; }
    .header { background: #0f172a; color: #ffffff; padding: 28px 32px; border-bottom: 4px solid #f59e0b; }
    .badge { display: inline-block; background: #f59e0b; color: #0f172a; font-weight: 800; font-size: 11px; padding: 4px 10px; border-radius: 6px; text-transform: uppercase; margin-bottom: 12px; }
    h1 { font-size: 22px; font-weight: 800; margin: 0 0 8px 0; color: #ffffff; line-height: 1.3; }
    .file-meta { font-size: 13px; color: #94a3b8; }
    .body { padding: 28px 32px; }
    .meta-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 14px; margin-bottom: 24px; }
    .meta-box { background: #f8fafc; border: 1px solid #e2e8f0; padding: 14px; border-radius: 10px; }
    .meta-label { font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; display: block; margin-bottom: 4px; }
    .meta-value { font-size: 14px; font-weight: 700; color: #0f172a; }
    .section-title { font-size: 13px; font-weight: 800; color: #475569; text-transform: uppercase; margin: 24px 0 8px 0; letter-spacing: 0.5px; }
    .desc-box { background: #f8fafc; border: 1px solid #e2e8f0; padding: 16px; border-radius: 10px; font-size: 14px; line-height: 1.6; color: #334155; }
    .snippet-box { background: #f8fafc; border: 1px solid #cbd5e1; border-left: 4px solid #0284c7; padding: 18px; border-radius: 8px; font-size: 13px; line-height: 1.6; font-family: ui-monospace, monospace; white-space: pre-wrap; color: #1e293b; }
    .footer { padding: 18px 32px; background: #f8fafc; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; }
    .brand { font-size: 12px; color: #64748b; font-weight: 600; }
    .btn { background: #f59e0b; color: #0f172a; font-weight: 800; font-size: 13px; padding: 10px 20px; border-radius: 8px; text-decoration: none; border: none; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; }
    .btn:hover { background: #d97706; }
    .btn-print { background: #0f172a; color: #ffffff; }
    .btn-print:hover { background: #1e293b; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <span class="badge">${escapeStr(doc.format)}</span>
      <h1>${escapeStr(doc.title)}</h1>
      <div class="file-meta">Archivo: <strong>${escapeStr(fileName)}</strong> • ${escapeStr(doc.fileSize)}</div>
    </div>
    <div class="body">
      <div class="meta-grid">
        <div class="meta-box">
          <span class="meta-label">Docente Responsable</span>
          <div class="meta-value">${escapeStr(doc.authorTeacherName)}</div>
        </div>
        <div class="meta-box">
          <span class="meta-label">Curso / Asignatura</span>
          <div class="meta-value">${escapeStr(doc.course)}</div>
        </div>
        <div class="meta-box">
          <span class="meta-label">Grado y Sección</span>
          <div class="meta-value">${escapeStr(doc.grade)} - ${escapeStr(doc.section)}</div>
        </div>
      </div>

      <div class="section-title">Descripción del Archivo</div>
      <div class="desc-box">${escapeStr(doc.description || 'Sin descripción detallada.')}</div>

      ${doc.contentSummary ? `
        <div class="section-title">Resumen Oficial de Contenido</div>
        <div class="desc-box">${escapeStr(doc.contentSummary)}</div>
      ` : ''}

      ${doc.previewSnippet ? `
        <div class="section-title">Texto / Extracto del Documento</div>
        <div class="snippet-box">${escapeStr(doc.previewSnippet)}</div>
      ` : ''}
    </div>
    <div class="footer">
      <span class="brand">Institución Educativa • Archivo Docente</span>
      <div style="display: flex; gap: 10px;">
        <button class="btn btn-print" onclick="window.print()">Imprimir / Guardar</button>
        <button class="btn" onclick="window.close()">Cerrar Pestaña</button>
      </div>
    </div>
  </div>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const blobUrl = URL.createObjectURL(blob);
  window.open(blobUrl, '_blank', 'noopener,noreferrer');
}

