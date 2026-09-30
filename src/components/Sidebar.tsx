import React, { useState } from 'react';
import {
  FolderArchive,
  ShieldAlert,
  CalendarDays,
  FileSpreadsheet,
  ClipboardCheck,
  BookOpenCheck,
  Clock,
  Star,
  FolderPlus,
  Folder,
  ChevronRight,
  ChevronDown,
  GraduationCap,
  Layers,
  BookOpen,
  Cloud,
  Check,
  Trash2,
  Lock,
  Sparkles,
  Calendar,
  Files,
  Cake,
  FolderOpen
} from 'lucide-react';
import { SmartFolder, SmartFolderId, Course, StorageFolder } from '../types';
import { COURSES, GRADES, SECTIONS } from '../data/initialData';

interface SidebarProps {
  currentView?: 'documents' | 'schedule' | 'birthdays' | 'admin';
  onViewChange?: (view: 'documents' | 'schedule' | 'birthdays' | 'admin') => void;
  scheduleCount?: number;
  activeSmartFolder: SmartFolderId;
  onSelectSmartFolder: (id: SmartFolderId) => void;
  systemFolders: SmartFolder[];
  customFolders: SmartFolder[];
  onOpenCreateSmartFolder: () => void;
  onDeleteCustomFolder: (id: string) => void;
  folderCounts: Record<string, number>;
  selectedGrade: string;
  onSelectGrade: (g: string) => void;
  selectedSection: string;
  onSelectSection: (s: string) => void;
  selectedCourse: string;
  onSelectCourse: (c: string) => void;
  totalDocumentsCount: number;
  storageFolders?: StorageFolder[];
  selectedStorageFolderId?: string;
  onSelectStorageFolder?: (id: string | undefined) => void;
  onCreateStorageFolder?: () => void;
  storageFolderCounts?: Record<string, number>;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView = 'documents',
  onViewChange,
  scheduleCount = 0,
  activeSmartFolder,
  onSelectSmartFolder,
  systemFolders,
  customFolders,
  onOpenCreateSmartFolder,
  onDeleteCustomFolder,
  folderCounts,
  selectedGrade,
  onSelectGrade,
  selectedSection,
  onSelectSection,
  selectedCourse,
  onSelectCourse,
  totalDocumentsCount,
  storageFolders = [],
  selectedStorageFolderId,
  onSelectStorageFolder,
  onCreateStorageFolder,
  storageFolderCounts = {},
}) => {
  const [showGradesTree, setShowGradesTree] = useState(true);
  const [showCoursesTree, setShowCoursesTree] = useState(false);
  const [showStorageFolders, setShowStorageFolders] = useState(true);

  const renderIcon = (iconName: string, className: string = 'w-4 h-4') => {
    switch (iconName) {
      case 'FolderArchive':
        return <FolderArchive className={className} />;
      case 'CalendarDays':
        return <CalendarDays className={className} />;
      case 'FileSpreadsheet':
        return <FileSpreadsheet className={className} />;
      case 'ClipboardCheck':
        return <ClipboardCheck className={className} />;
      case 'BookOpenCheck':
        return <BookOpenCheck className={className} />;
      case 'Clock':
        return <Clock className={className} />;
      case 'Star':
        return <Star className={className} />;
      default:
        return <Sparkles className={className} />;
    }
  };

  return (
    <aside className="w-64 bg-slate-50/90 border-r border-sky-200/80 flex flex-col shrink-0 min-h-[calc(100vh-4rem)] p-3 shadow-xs">
      
      {/* Main Mode Navigation (Documents vs Class Schedule vs Birthdays) */}
      {onViewChange && (
        <div className="mb-3.5 pb-3 border-b border-sky-200/70">
          <div className="text-[10px] font-bold text-sky-800 uppercase tracking-wider px-2 mb-1.5 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            <span>Módulos Escolares</span>
          </div>
          <div className="space-y-1">
            <button
              id="sidebar-nav-documents"
              type="button"
              onClick={() => onViewChange('documents')}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                currentView === 'documents'
                  ? 'bg-gradient-to-r from-blue-950 to-blue-900 text-amber-300 font-bold shadow-sm border border-amber-400/40'
                  : 'text-slate-700 hover:bg-sky-100/60 hover:text-blue-950'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Files className={`w-4 h-4 ${currentView === 'documents' ? 'text-amber-400' : 'text-sky-600'}`} />
                <span>Documentos</span>
              </div>
              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                  currentView === 'documents'
                    ? 'bg-amber-400 text-blue-950 font-bold'
                    : 'bg-sky-100 text-sky-800'
                }`}
              >
                {totalDocumentsCount}
              </span>
            </button>

            <button
              id="sidebar-nav-schedule"
              type="button"
              onClick={() => onViewChange('schedule')}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                currentView === 'schedule'
                  ? 'bg-gradient-to-r from-blue-950 to-blue-900 text-amber-300 font-bold shadow-sm border border-amber-400/40'
                  : 'text-slate-700 hover:bg-sky-100/60 hover:text-blue-950'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Calendar className={`w-4 h-4 ${currentView === 'schedule' ? 'text-amber-400' : 'text-sky-600'}`} />
                <span>Horario de Clase</span>
              </div>
              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                  currentView === 'schedule'
                    ? 'bg-amber-400 text-blue-950 font-bold'
                    : 'bg-sky-100 text-sky-800'
                }`}
              >
                {scheduleCount}
              </span>
            </button>

            <button
              id="sidebar-nav-birthdays"
              type="button"
              onClick={() => onViewChange('birthdays')}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                currentView === 'birthdays'
                  ? 'bg-gradient-to-r from-blue-950 to-blue-900 text-amber-300 font-bold shadow-sm border border-amber-400/40'
                  : 'text-slate-700 hover:bg-sky-100/60 hover:text-blue-950'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Cake className={`w-4 h-4 ${currentView === 'birthdays' ? 'text-amber-400' : 'text-amber-500'}`} />
                <span>Cumpleaños</span>
              </div>
              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                  currentView === 'birthdays'
                    ? 'bg-amber-400 text-blue-950 font-bold'
                    : 'bg-amber-100 text-amber-900 font-semibold'
                }`}
              >
                Docentes
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Smart Folders / Document Categories Navigation */}
      <div className="px-2 py-1.5 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-bold text-sky-900 uppercase tracking-wider">
          <Layers className="w-3.5 h-3.5 text-sky-600" />
          <span>Categorías Escolares</span>
        </div>
      </div>

      {/* System Categories Navigation */}
      <nav className="space-y-0.5 mt-1">
        {systemFolders.map((folder) => {
          const isActive = activeSmartFolder === folder.id;
          const count = folderCounts[folder.id] || 0;

          return (
            <button
              key={folder.id}
              type="button"
              onClick={() => onSelectSmartFolder(folder.id)}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                isActive
                  ? 'bg-blue-950 text-amber-300 font-bold border border-amber-400/40 shadow-xs'
                  : 'text-slate-700 hover:bg-sky-100/60 hover:text-blue-950'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <span
                  className={`${
                    isActive
                      ? 'text-amber-400'
                      : 'text-sky-600'
                  }`}
                >
                  {renderIcon(folder.icon, 'w-4 h-4 shrink-0')}
                </span>
                <span className="truncate">{folder.title}</span>
              </div>

              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                  isActive
                    ? 'bg-amber-400 text-blue-950 font-bold'
                    : 'bg-sky-100 text-sky-800'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </nav>

      <hr className="my-3 border-sky-200/70" />

      {/* School Hierarchy Navigation: Grado & Sección */}
      <div className="space-y-1">
        <button
          type="button"
          onClick={() => setShowGradesTree(!showGradesTree)}
          className="w-full flex items-center justify-between px-2 py-1.5 text-xs font-bold text-slate-700 hover:text-blue-950 rounded-md transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-1.5">
            <GraduationCap className="w-4 h-4 text-sky-600" />
            <span>Grados y Secciones</span>
          </div>
          {showGradesTree ? (
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          )}
        </button>

        {showGradesTree && (
          <div className="pl-3 space-y-2 mt-1">
            {/* Grade Selector */}
            <div>
              <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Filtrar por Grado:
              </label>
              <div className="space-y-0.5 max-h-36 overflow-y-auto pr-1">
                <button
                  type="button"
                  onClick={() => onSelectGrade('')}
                  className={`w-full text-left px-2 py-1 rounded text-xs transition-colors flex items-center justify-between cursor-pointer ${
                    selectedGrade === ''
                      ? 'bg-sky-100 text-blue-950 font-bold'
                      : 'text-slate-600 hover:bg-sky-50'
                  }`}
                >
                  <span>Todos los grados</span>
                  {selectedGrade === '' && <Check className="w-3 h-3 text-sky-600" />}
                </button>
                {GRADES.map((grade) => (
                  <button
                    key={grade}
                    type="button"
                    onClick={() => onSelectGrade(grade)}
                    className={`w-full text-left px-2 py-1 rounded text-xs transition-colors flex items-center justify-between cursor-pointer ${
                      selectedGrade === grade
                        ? 'bg-sky-100 text-blue-950 font-bold'
                        : 'text-slate-600 hover:bg-sky-50'
                    }`}
                  >
                    <span className="truncate">{grade}</span>
                    {selectedGrade === grade && <Check className="w-3 h-3 text-sky-600" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Section Selector */}
            <div className="pt-1">
              <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Sección:
              </label>
              <div className="flex flex-wrap gap-1">
                <button
                  type="button"
                  onClick={() => onSelectSection('')}
                  className={`px-2 py-1 rounded text-xs transition-colors cursor-pointer ${
                    selectedSection === ''
                      ? 'bg-blue-900 text-amber-300 font-bold'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  Todas
                </button>
                {SECTIONS.map((sec) => (
                  <button
                    key={sec}
                    type="button"
                    onClick={() => onSelectSection(sec)}
                    className={`px-2 py-1 rounded text-xs transition-colors cursor-pointer ${
                      selectedSection === sec
                        ? 'bg-blue-900 text-amber-300 font-bold'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {sec.replace('Sección ', '')}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <hr className="my-3 border-sky-200/70" />

      {/* Course Hierarchy */}
      <div className="space-y-1">
        <button
          type="button"
          onClick={() => setShowCoursesTree(!showCoursesTree)}
          className="w-full flex items-center justify-between px-2 py-1.5 text-xs font-bold text-slate-700 hover:text-blue-950 rounded-md transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-sky-600" />
            <span>Cursos Académicos</span>
          </div>
          {showCoursesTree ? (
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          )}
        </button>

        {showCoursesTree && (
          <div className="pl-3 space-y-0.5 mt-1 max-h-40 overflow-y-auto pr-1">
            <button
              type="button"
              onClick={() => onSelectCourse('')}
              className={`w-full text-left px-2 py-1 rounded text-xs transition-colors flex items-center justify-between cursor-pointer ${
                selectedCourse === ''
                  ? 'bg-sky-100 text-blue-950 font-bold'
                  : 'text-slate-600 hover:bg-sky-50'
              }`}
            >
              <span>Todos los cursos</span>
              {selectedCourse === '' && <Check className="w-3 h-3 text-sky-600" />}
            </button>
            {COURSES.map((course) => (
              <button
                key={course.id}
                type="button"
                onClick={() => onSelectCourse(course.name)}
                className={`w-full text-left px-2 py-1 rounded text-xs transition-colors flex items-center justify-between cursor-pointer ${
                  selectedCourse === course.name
                    ? 'bg-sky-100 text-blue-950 font-bold'
                    : 'text-slate-600 hover:bg-sky-50'
                }`}
              >
                <span className="truncate">{course.name}</span>
                {selectedCourse === course.name && <Check className="w-3 h-3 text-sky-600" />}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Cloud & School Archive Status Card at bottom */}
      <div className="mt-auto pt-4 space-y-2">
        {/* School Crest Institutional Badge */}
        <div className="p-2.5 bg-gradient-to-r from-blue-950 to-blue-900 rounded-xl border border-amber-400/40 text-white shadow-xs flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full p-0.5 bg-gradient-to-tr from-amber-400 to-sky-300 shrink-0 overflow-hidden flex items-center justify-center">
            <img
              src="/insignia_colegio.jpg"
              alt="Insignia I.E. Libertador Mariscal Castilla"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover rounded-full bg-white"
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-bold text-amber-300 truncate leading-tight">
              I.E. Mariscal Castilla
            </div>
            <div className="text-[10px] text-sky-200 truncate">
              Oxapampa • Fundado 1954
            </div>
          </div>
        </div>

        <div className="p-3 bg-white rounded-xl border border-sky-200 shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
              <Cloud className="w-3.5 h-3.5 text-sky-600" />
              Nube Escolar
            </span>
            <span className="text-[10px] font-semibold text-sky-900 bg-sky-100 px-1.5 py-0.5 rounded border border-sky-300/60">
              Sincronizada
            </span>
          </div>
          <div className="text-[11px] text-slate-500 mb-2">
            {totalDocumentsCount} documentos organizados en la nube institucional.
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-900 via-sky-600 to-amber-400 h-1.5 rounded-full w-2/5"></div>
          </div>
          <div className="flex justify-between text-[10px] text-slate-400 mt-1">
            <span>2.8 MB usados</span>
            <span>15 GB disponibles</span>
          </div>
        </div>
      </div>

    </aside>
  );
};
