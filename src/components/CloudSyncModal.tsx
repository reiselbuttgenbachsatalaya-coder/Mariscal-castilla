import React, { useState, useRef } from 'react';
import {
  X,
  Cloud,
  CloudOff,
  RefreshCw,
  Download,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Server,
  Database,
  History,
  Wifi,
  WifiOff,
  Check,
  FileCode,
  Package,
  Code2,
  Globe
} from 'lucide-react';
import { CloudSyncLog } from '../types';
import { formatDateTime, formatRelativeTime } from '../utils/formatters';

interface CloudSyncModalProps {
  onClose: () => void;
  isOnline: boolean;
  onToggleOnlineMode: (online: boolean) => void;
  isSyncing: boolean;
  onTriggerSync: () => Promise<any>;
  lastSyncedAt: string;
  syncLogs: CloudSyncLog[];
  onExportBackup: () => void;
  onImportBackup: (jsonContent: string) => void;
  totalDocsCount: number;
}

export const CloudSyncModal: React.FC<CloudSyncModalProps> = ({
  onClose,
  isOnline,
  onToggleOnlineMode,
  isSyncing,
  onTriggerSync,
  lastSyncedAt,
  syncLogs,
  onExportBackup,
  onImportBackup,
  totalDocsCount,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [syncStatusMsg, setSyncStatusMsg] = useState('');
  const [importError, setImportError] = useState('');

  const handleSyncNow = async () => {
    try {
      setSyncStatusMsg('Contactando el servidor de la nube escolar...');
      const res = await onTriggerSync();
      setSyncStatusMsg(res?.message || 'Sincronización completada con éxito.');
      setTimeout(() => setSyncStatusMsg(''), 4000);
    } catch (err: any) {
      setSyncStatusMsg(err.message || 'Error durante la sincronización.');
      setTimeout(() => setSyncStatusMsg(''), 4000);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        onImportBackup(text);
        setSyncStatusMsg('Copia de respaldo en la nube restaurada exitosamente.');
        setImportError('');
      } catch (err: any) {
        setImportError(err.message || 'El archivo seleccionado no es válido.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
              <Cloud className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Sincronización en la Nube Escolar
              </h2>
              <p className="text-xs text-slate-500">
                Respaldo automático, conectividad institucional y registros de sincronía
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

        {/* Content */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6">
          
          {/* Status Alert if syncing or feedback */}
          {syncStatusMsg && (
            <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200 text-xs text-indigo-900 flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>{syncStatusMsg}</span>
            </div>
          )}

          {importError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{importError}</span>
            </div>
          )}

          {/* Cloud State Overview Card */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${
                    !isOnline
                      ? 'bg-amber-500'
                      : isSyncing
                      ? 'bg-indigo-600 animate-pulse'
                      : 'bg-emerald-600'
                  }`}
                >
                  {!isOnline ? (
                    <CloudOff className="w-5 h-5" />
                  ) : isSyncing ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <Cloud className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {!isOnline
                      ? 'Modo Sin Conexión (Offline)'
                      : isSyncing
                      ? 'Sincronizando Archivos con la Nube...'
                      : 'Conectado y Sincronizado'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Última sincronización: {formatRelativeTime(lastSyncedAt)} ({formatDateTime(lastSyncedAt)})
                  </p>
                </div>
              </div>

              {/* Online/Offline Toggle button */}
              <button
                type="button"
                onClick={() => onToggleOnlineMode(!isOnline)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors flex items-center gap-1.5 ${
                  isOnline
                    ? 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
                    : 'bg-amber-100 border-amber-300 text-amber-900 font-bold'
                }`}
                title="Simular pérdida de conexión Wi-Fi escolar"
              >
                {isOnline ? (
                  <>
                    <Wifi className="w-3.5 h-3.5 text-emerald-600" />
                    Simular Modo Offline
                  </>
                ) : (
                  <>
                    <WifiOff className="w-3.5 h-3.5 text-amber-600" />
                    Restablecer Conexión
                  </>
                )}
              </button>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200/80 text-center">
              <div className="p-2 bg-white rounded-lg border border-slate-200/60">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                  Documentos en Nube
                </span>
                <span className="text-sm font-bold text-slate-900">{totalDocsCount}</span>
              </div>
              <div className="p-2 bg-white rounded-lg border border-slate-200/60">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                  Latencia de Servidor
                </span>
                <span className="text-sm font-bold text-emerald-600">38 ms</span>
              </div>
              <div className="p-2 bg-white rounded-lg border border-slate-200/60">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                  Almacenamiento Usado
                </span>
                <span className="text-sm font-bold text-indigo-600">2.8 MB / 15 GB</span>
              </div>
            </div>

            {/* Manual Sync Trigger */}
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={handleSyncNow}
                disabled={isSyncing || !isOnline}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors disabled:opacity-40"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Sincronizando ahora...' : 'Sincronizar ahora con la Nube'}</span>
              </button>
            </div>
          </div>

          {/* Cloud Snapshot Export & Restore */}
          <div>
            <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
              Respaldo & Transferencia de Datos
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              
              {/* Export backup */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800 mb-1">
                    <Download className="w-4 h-4 text-indigo-600" />
                    <span>Descargar Respaldo Cloud</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mb-3">
                    Exporta un archivo JSON consolidado con todos los documentos, carpetas y auditoría para resguardar fuera de línea.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onExportBackup}
                  className="w-full py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  Exportar Respaldo
                </button>
              </div>

              {/* Import backup */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800 mb-1">
                    <Upload className="w-4 h-4 text-indigo-600" />
                    <span>Restaurar desde Nube</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mb-3">
                    Carga un archivo de respaldo previo para sincronizarlo inmediatamente con el archivo docente.
                  </p>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".json"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Seleccionar Archivo JSON
                </button>
              </div>
            </div>
          </div>

          {/* Code Packages Ready to Send */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-indigo-600" />
                Paquetes de Código Listos para Descargar y Enviar
              </h4>
              <span className="text-[11px] text-slate-400">Descarga directa en .ZIP</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Web Page Package */}
              <div className="p-3.5 rounded-xl border border-sky-300 bg-sky-50/50 hover:bg-sky-50/80 transition-colors flex flex-col justify-between sm:col-span-2">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-bold text-sky-950 mb-1">
                      <Globe className="w-4 h-4 text-sky-600 shrink-0" />
                      <span>Página Web "Archivo Docente" Empaquetada (.ZIP) — Listo para Usar</span>
                      <span className="text-[10px] bg-sky-200/80 text-sky-900 font-semibold px-2 py-0.5 rounded-full">Recomendado</span>
                    </div>
                    <p className="text-[11px] text-slate-600 mb-3 leading-relaxed">
                      Contiene la página web completa (<strong>index.html</strong>, estilos, scripts e íconos). Solo descomprímelo y haz doble clic en <strong>index.html</strong> para abrirlo en cualquier navegador, o súbelo a Netlify, Vercel, cPanel o tu servidor escolar.
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <a
                    href="/archivo-docente-pagina-web.zip"
                    download="archivo-docente-pagina-web.zip"
                    className="flex-1 py-2 px-4 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-xs text-center"
                  >
                    <Download className="w-4 h-4" />
                    Descargar Página Web (.ZIP)
                  </a>
                  <a
                    href="/LEEME_COMO_ABRIR_O_SUBIR.txt"
                    download="LEEME_COMO_ABRIR_O_SUBIR.txt"
                    className="py-2 px-3 bg-white border border-sky-200 hover:bg-sky-100/50 text-sky-800 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                    title="Ver manual de instrucciones de uso"
                  >
                    Guía de Uso
                  </a>
                </div>
              </div>

              {/* Google Apps Script Package */}
              <div className="p-3.5 rounded-xl border border-indigo-200/80 bg-indigo-50/40 hover:bg-indigo-50/70 transition-colors flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-indigo-950 mb-1">
                    <FileCode className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>Google Apps Script (.ZIP)</span>
                    <span className="text-[10px] bg-indigo-100 text-indigo-800 font-semibold px-1.5 py-0.2 rounded">Web App</span>
                  </div>
                  <p className="text-[11px] text-slate-600 mb-3 leading-relaxed">
                    Incluye <strong>Codigo.gs</strong>, <strong>Index.html</strong> (página web completa para Google), <strong>appsscript.json</strong> y la guía paso a paso.
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <a
                    href="/google-apps-script.zip"
                    download="google-apps-script.zip"
                    className="flex-1 py-1.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-xs text-center"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Descargar ZIP
                  </a>
                  <a
                    href="/Codigo.gs"
                    download="Codigo.gs"
                    className="py-1.5 px-2 bg-white border border-indigo-200 hover:bg-indigo-50 text-indigo-700 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1"
                    title="Descargar solo Codigo.gs"
                  >
                    <Code2 className="w-3.5 h-3.5" />
                    .gs
                  </a>
                  <a
                    href="/Index.html"
                    download="Index.html"
                    className="py-1.5 px-2 bg-white border border-indigo-200 hover:bg-indigo-50 text-indigo-700 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1"
                    title="Descargar Index.html para Apps Script"
                  >
                    <FileCode className="w-3.5 h-3.5" />
                    Index.html
                  </a>
                </div>
              </div>

              {/* Complete Web App Source Package */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800 mb-1">
                    <Package className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Código Fuente Completo (.ZIP)</span>
                  </div>
                  <p className="text-[11px] text-slate-600 mb-3 leading-relaxed">
                    Todo el código fuente original (React + TypeScript + Vite + Express + Tailwind) para desarrolladores o repositorio Git.
                  </p>
                </div>
                <a
                  href="/docudocente-app-completo.zip"
                  download="docudocente-app-completo.zip"
                  className="w-full py-1.5 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 text-center shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  Descargar Código Fuente
                </a>
              </div>
            </div>
          </div>

          {/* Sync History Logs */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-slate-400" />
                Historial de Sincronización
              </h4>
              <span className="text-[11px] text-slate-400">Últimos eventos registrados</span>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500">
                  <tr>
                    <th className="py-2 px-3">Fecha y Hora</th>
                    <th className="py-2 px-3">Tipo</th>
                    <th className="py-2 px-3">Documentos</th>
                    <th className="py-2 px-3">Estado</th>
                    <th className="py-2 px-3 text-right">Latencia</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {syncLogs.slice(0, 5).map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/60">
                      <td className="py-2 px-3 text-slate-700 font-mono text-[11px]">
                        {formatDateTime(log.timestamp)}
                      </td>
                      <td className="py-2 px-3 text-slate-600 capitalize">
                        {log.type === 'manual' ? 'Manual' : log.type === 'auto' ? 'Automática' : 'Restauración'}
                      </td>
                      <td className="py-2 px-3 text-slate-700 font-medium">
                        {log.documentsCount} archivos
                      </td>
                      <td className="py-2 px-3">
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <Check className="w-2.5 h-2.5" /> Sincronizado
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right text-slate-400 font-mono text-[11px]">
                        {log.latencyMs} ms
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
          >
            Entendido
          </button>
        </div>

      </div>
    </div>
  );
};
