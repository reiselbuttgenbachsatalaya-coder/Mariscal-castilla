import React from 'react';
import {
  Folder,
  FolderPlus,
  Share2,
  Download,
  MoreVertical,
  Edit2,
  Trash2,
  Layers,
  ChevronRight,
  FileText,
  Sparkles
} from 'lucide-react';
import { StorageFolder, SchoolDocument, Teacher } from '../types';

interface FolderSectionProps {
  folders: StorageFolder[];
  documents: SchoolDocument[];
  activeFolderId?: string;
  onSelectFolder: (folderId: string | undefined) => void;
  onCreateFolder: () => void;
  onEditFolder: (folder: StorageFolder) => void;
  onDeleteFolder: (folder: StorageFolder) => void;
  onShareFolder: (folder: StorageFolder) => void;
  onDownloadFolder: (folder: StorageFolder) => void;
  currentTeacher: Teacher | null;
}

export const FolderSection: React.FC<FolderSectionProps> = ({
  folders,
  documents,
  activeFolderId,
  onSelectFolder,
  onCreateFolder,
  onEditFolder,
  onDeleteFolder,
  onShareFolder,
  onDownloadFolder,
  currentTeacher,
}) => {
  const getFolderColorStyles = (color?: string, isActive?: boolean) => {
    switch (color) {
      case 'gold':
        return {
          icon: 'text-amber-500 fill-amber-300/30',
          badge: 'bg-amber-100 text-amber-900 border-amber-300',
          ring: isActive ? 'ring-2 ring-amber-500 bg-amber-50/70 border-amber-300' : 'hover:border-amber-300',
        };
      case 'blue':
        return {
          icon: 'text-blue-900 fill-blue-400/20',
          badge: 'bg-blue-100 text-blue-900 border-blue-300',
          ring: isActive ? 'ring-2 ring-blue-900 bg-blue-50/70 border-blue-300' : 'hover:border-blue-400',
        };
      case 'indigo':
        return {
          icon: 'text-indigo-600 fill-indigo-300/30',
          badge: 'bg-indigo-100 text-indigo-900 border-indigo-300',
          ring: isActive ? 'ring-2 ring-indigo-600 bg-indigo-50/70 border-indigo-300' : 'hover:border-indigo-300',
        };
      case 'emerald':
        return {
          icon: 'text-emerald-600 fill-emerald-300/30',
          badge: 'bg-emerald-100 text-emerald-900 border-emerald-300',
          ring: isActive ? 'ring-2 ring-emerald-600 bg-emerald-50/70 border-emerald-300' : 'hover:border-emerald-300',
        };
      case 'sky':
      default:
        return {
          icon: 'text-sky-600 fill-sky-300/30',
          badge: 'bg-sky-100 text-sky-900 border-sky-300',
          ring: isActive ? 'ring-2 ring-sky-500 bg-sky-50/70 border-sky-300' : 'hover:border-sky-300',
        };
    }
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-sky-100 text-blue-900 flex items-center justify-center font-bold">
            <Folder className="w-4 h-4 text-sky-600" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>Carpetas de Archivos</span>
              <span className="text-[11px] font-semibold text-slate-500 px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200">
                {folders.length}
              </span>
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {activeFolderId && (
            <button
              type="button"
              onClick={() => onSelectFolder(undefined)}
              className="text-xs font-semibold text-sky-700 hover:text-blue-950 px-2.5 py-1 rounded-lg hover:bg-sky-50 transition-colors cursor-pointer"
            >
              Ver todas las carpetas
            </button>
          )}

          <button
            type="button"
            onClick={onCreateFolder}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-950 to-blue-900 hover:from-blue-900 hover:to-blue-800 text-amber-300 font-bold text-xs shadow-xs border border-amber-400/40 transition-all cursor-pointer"
          >
            <FolderPlus className="w-3.5 h-3.5 text-amber-400" />
            <span>Crear Carpeta</span>
          </button>
        </div>
      </div>

      {/* Grid of folders */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {folders.map(folder => {
          const folderDocs = documents.filter(d => d.folderId === folder.id);
          const isActive = activeFolderId === folder.id;
          const styles = getFolderColorStyles(folder.color, isActive);
          const canManage =
            currentTeacher?.role === 'director' ||
            currentTeacher?.id === folder.creatorTeacherId;

          return (
            <div
              key={folder.id}
              onClick={() => onSelectFolder(isActive ? undefined : folder.id)}
              className={`relative group bg-white rounded-xl border p-3.5 cursor-pointer transition-all duration-150 shadow-xs flex flex-col justify-between ${
                styles.ring
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 shrink-0">
                      <Folder className={`w-5 h-5 ${styles.icon}`} />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 truncate leading-snug group-hover:text-blue-900" title={folder.name}>
                        {folder.name}
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        {folderDocs.length} {folderDocs.length === 1 ? 'archivo' : 'archivos'}
                      </p>
                    </div>
                  </div>

                  {/* Actions inside folder card */}
                  <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100" onClick={e => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => onShareFolder(folder)}
                      className="p-1 rounded-md text-sky-700 hover:text-blue-950 hover:bg-sky-100/70 transition-colors cursor-pointer"
                      title="Generar link para compartir carpeta"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>

                    {folderDocs.length > 0 && (
                      <button
                        type="button"
                        onClick={() => onDownloadFolder(folder)}
                        className="p-1 rounded-md text-slate-500 hover:text-amber-700 hover:bg-amber-100/70 transition-colors cursor-pointer"
                        title="Descargar todos los archivos de esta carpeta"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {canManage && (
                      <>
                        <button
                          type="button"
                          onClick={() => onEditFolder(folder)}
                          className="p-1 rounded-md text-slate-400 hover:text-blue-800 hover:bg-slate-100 transition-colors cursor-pointer"
                          title="Editar carpeta"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteFolder(folder)}
                          className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Eliminar carpeta"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {folder.description && (
                  <p className="text-[11px] text-slate-600 line-clamp-2 mt-1 mb-2 leading-relaxed">
                    {folder.description}
                  </p>
                )}
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 mt-2">
                <span className="truncate">
                  {folder.creatorTeacherName.replace('Prof. ', '')}
                </span>
                <span className={`font-bold flex items-center gap-0.5 ${isActive ? 'text-blue-900' : 'text-sky-600 group-hover:translate-x-0.5 transition-transform'}`}>
                  {isActive ? 'Carpeta abierta' : 'Abrir carpeta'}
                  <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
