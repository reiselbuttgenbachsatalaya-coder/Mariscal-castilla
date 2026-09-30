import React, { useState } from 'react';
import {
  Search,
  SlidersHorizontal,
  Cloud,
  CloudOff,
  RefreshCw,
  UploadCloud,
  ChevronDown,
  Building2,
  CheckCircle2,
  LogOut,
  UserPlus,
  User,
  Calendar,
  FolderArchive,
  Plus,
  ShieldCheck,
  Cake,
  Trash2,
  UserMinus
} from 'lucide-react';
import { Teacher } from '../types';

interface NavbarProps {
  currentView: 'documents' | 'schedule' | 'birthdays' | 'admin';
  onViewChange: (view: 'documents' | 'schedule' | 'birthdays' | 'admin') => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenAdvancedSearch: () => void;
  hasActiveFilters: boolean;
  onOpenUpload: () => void;
  onOpenScheduleModal: () => void;
  onOpenCloudSync: () => void;
  currentTeacher: Teacher | null;
  allTeachers: Teacher[];
  dismissedSwitcherIds?: string[];
  onOpenSwitchAccount: (t: Teacher) => void;
  onDismissTeacherFromSwitcher: (teacherId: string) => void;
  onDeleteTeacher?: (teacherId: string) => void;
  onLogout: () => void;
  onOpenCreateAccount: () => void;
  isSyncing: boolean;
  onTriggerSync: () => void;
  isOffline: boolean;
  lastSyncedAt: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onViewChange,
  searchQuery,
  onSearchChange,
  onOpenAdvancedSearch,
  hasActiveFilters,
  onOpenUpload,
  onOpenScheduleModal,
  onOpenCloudSync,
  currentTeacher,
  allTeachers,
  dismissedSwitcherIds = [],
  onOpenSwitchAccount,
  onDismissTeacherFromSwitcher,
  onDeleteTeacher,
  onLogout,
  onOpenCreateAccount,
  isSyncing,
  onTriggerSync,
  isOffline,
  lastSyncedAt,
}) => {
  const [showTeacherMenu, setShowTeacherMenu] = useState(false);
  const isDirector =
    currentTeacher?.role === 'director' ||
    currentTeacher?.username.toLowerCase() === 'directora';

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-sky-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="relative group cursor-pointer" onClick={() => onViewChange('documents')} title="I.E. Libertador Mariscal Castilla - Oxapampa (1954)">
              <div className="w-11 h-11 rounded-full p-0.5 bg-gradient-to-tr from-amber-400 via-sky-400 to-blue-900 shadow-md flex items-center justify-center overflow-hidden">
                <img
                  src="/insignia_colegio.jpg"
                  alt="Insignia I.E. Libertador Mariscal Castilla - Oxapampa"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover rounded-full bg-white"
                  onError={(e) => {
                    // Fallback to Building icon if image fails
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-blue-950 text-sm sm:text-base tracking-tight leading-tight">
                  I.E. Libertador Mariscal Castilla
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300/80 shrink-0">
                  Oxapampa • 1954
                </span>
              </div>
              <p className="text-[11px] text-sky-800 hidden sm:block font-medium">
                Archivo Docente Oficial (Secundaria 1° a 5° • Secciones A - D)
              </p>
            </div>
          </div>

          {/* Navigation Section Tabs */}
          <div className="flex items-center bg-sky-50 p-1 rounded-xl border border-sky-200 shrink-0">
            <button
              id="nav-tab-documents"
              type="button"
              onClick={() => onViewChange('documents')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                currentView === 'documents'
                  ? 'bg-gradient-to-r from-blue-950 to-blue-900 text-amber-300 shadow-sm font-bold border border-amber-400/40'
                  : 'text-slate-700 hover:text-blue-950 hover:bg-sky-100/70'
              }`}
            >
              <FolderArchive className="w-3.5 h-3.5" />
              <span>Archivos</span>
            </button>

            <button
              id="nav-tab-schedule"
              type="button"
              onClick={() => onViewChange('schedule')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                currentView === 'schedule'
                  ? 'bg-gradient-to-r from-blue-950 to-blue-900 text-amber-300 shadow-sm font-bold border border-amber-400/40'
                  : 'text-slate-700 hover:text-blue-950 hover:bg-sky-100/70'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Horario de Clase</span>
            </button>

            <button
              id="nav-tab-birthdays"
              type="button"
              onClick={() => onViewChange('birthdays')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                currentView === 'birthdays'
                  ? 'bg-gradient-to-r from-blue-950 to-blue-900 text-amber-300 shadow-sm font-bold border border-amber-400/40'
                  : 'text-slate-700 hover:text-blue-950 hover:bg-sky-100/70'
              }`}
            >
              <Cake className="w-3.5 h-3.5 text-amber-500" />
              <span>Cumpleaños</span>
            </button>

            {isDirector && (
              <button
                id="nav-tab-admin"
                type="button"
                onClick={() => onViewChange('admin')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  currentView === 'admin'
                    ? 'bg-blue-950 text-amber-300 shadow-sm font-bold border border-amber-400/60'
                    : 'text-amber-800 hover:text-blue-950 hover:bg-amber-100/60'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                <span>Panel Dirección</span>
              </button>
            )}
          </div>

          {/* Quick Search Bar (When in documents view) */}
          {currentView === 'documents' && (
            <div className="flex-1 max-w-md mx-1 hidden sm:block">
              <div className="relative flex items-center">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-sky-600">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Buscar archivos por título, tema, curso o profesor..."
                  className="w-full pl-9 pr-24 py-1.5 text-xs sm:text-sm bg-sky-50/60 hover:bg-sky-50 focus:bg-white border border-sky-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition-all text-slate-800 placeholder-slate-400"
                />
                <div className="absolute right-1.5 flex items-center gap-1">
                  <button
                    type="button"
                    onClick={onOpenAdvancedSearch}
                    className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md transition-colors ${
                      hasActiveFilters
                        ? 'bg-sky-100 text-blue-950 hover:bg-sky-200 font-bold border border-sky-300'
                        : 'text-slate-500 hover:text-blue-950 hover:bg-sky-100/60'
                    }`}
                    title="Filtros avanzados y búsqueda por campos"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5 text-sky-600" />
                    <span className="hidden md:inline">Filtros</span>
                    {hasActiveFilters && (
                      <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
          {currentView === 'schedule' && <div className="flex-1"></div>}

          {/* Right Action Tools: Sync, Teacher Selector, Upload */}
          <div className="flex items-center gap-2 shrink-0">
            
            {/* Cloud Sync Quick Pill */}
            <div className="relative">
              <button
                type="button"
                onClick={onOpenCloudSync}
                className={`inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  isOffline
                    ? 'bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100'
                    : isSyncing
                    ? 'bg-sky-50 border-sky-300 text-blue-950 animate-pulse'
                    : 'bg-sky-50 border-sky-200 text-sky-900 hover:bg-sky-100'
                }`}
                title="Estado de sincronización en la nube"
              >
                {isOffline ? (
                  <CloudOff className="w-3.5 h-3.5 text-amber-600" />
                ) : isSyncing ? (
                  <RefreshCw className="w-3.5 h-3.5 text-sky-600 animate-spin" />
                ) : (
                  <Cloud className="w-3.5 h-3.5 text-sky-600" />
                )}
                <span className="hidden lg:inline font-semibold">
                  {isOffline ? 'Sin Conexión' : isSyncing ? 'Sincronizando...' : 'Nube Activa'}
                </span>
              </button>
            </div>

            {/* Quick sync action button */}
            <button
              type="button"
              onClick={onTriggerSync}
              disabled={isSyncing || isOffline}
              className="p-2 text-slate-500 hover:text-blue-950 hover:bg-sky-50 rounded-lg transition-colors disabled:opacity-40 cursor-pointer"
              title="Sincronizar cambios ahora"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-sky-600' : ''}`} />
            </button>

            {/* Teacher Profile Switcher / Account Controls */}
            {currentTeacher ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowTeacherMenu(!showTeacherMenu)}
                  className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-sky-200 bg-white hover:bg-sky-50 text-slate-700 text-xs font-medium transition-all cursor-pointer shadow-xs"
                  title="Opciones de cuenta y usuario"
                >
                  <img
                    src={currentTeacher.avatar}
                    alt={currentTeacher.name}
                    className="w-6 h-6 rounded-full object-cover ring-2 ring-sky-300"
                  />
                  <div className="text-left hidden md:block">
                    <div className="font-bold leading-tight text-blue-950">
                      {currentTeacher.name}
                    </div>
                    <div className="text-[10px] text-sky-700 font-medium">
                      {currentTeacher.username}
                    </div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-sky-700" />
                </button>

                {/* Teacher Dropdown Menu */}
                {showTeacherMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowTeacherMenu(false)}
                    ></div>
                    <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-sky-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                      {/* Active Account Info Card */}
                      <div className="px-3.5 py-2.5 border-b border-sky-100 bg-gradient-to-r from-blue-950 to-blue-900 text-white rounded-t-xl -mt-2">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={currentTeacher.avatar}
                            alt={currentTeacher.name}
                            className="w-10 h-10 rounded-full object-cover ring-2 ring-amber-400"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-white truncate">
                              {currentTeacher.name}
                            </p>
                            <p className="text-[11px] text-amber-300 font-semibold truncate">
                              Usuario: {currentTeacher.username}
                            </p>
                            <p className="text-[10px] text-sky-200 truncate">
                              {currentTeacher.roleLabel}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Switch Account (Visible solo para la Directora/Administración) */}
                      {isDirector && (() => {
                        const switchableTeachers = allTeachers.filter((t) => t.id !== currentTeacher.id);
                        if (switchableTeachers.length === 0) return null;

                        return (
                          <div className="py-1 border-b border-slate-100">
                            <div className="px-3.5 pt-1.5 pb-1 flex items-center justify-between">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                Supervisar cuenta
                              </span>
                              <span className="text-[10px] text-slate-400">
                                (Pide contraseña)
                              </span>
                            </div>
                            {switchableTeachers.map((teacher) => (
                              <div
                                key={teacher.id}
                                className="w-full px-3.5 py-1.5 flex items-center justify-between gap-2 hover:bg-sky-50 transition-colors group"
                              >
                                <button
                                  type="button"
                                  onClick={() => {
                                    setShowTeacherMenu(false);
                                    onOpenSwitchAccount(teacher);
                                  }}
                                  className="flex items-center gap-2.5 flex-1 min-w-0 text-left cursor-pointer"
                                >
                                  <img
                                    src={teacher.avatar}
                                    alt={teacher.name}
                                    className="w-7 h-7 rounded-full object-cover shrink-0 ring-1 ring-sky-200"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <div className="text-xs font-semibold truncate text-slate-800 group-hover:text-blue-900 transition-colors">
                                      {teacher.name}
                                    </div>
                                    <div className="text-[10px] text-slate-400 truncate">
                                      {teacher.roleLabel || 'Docente'}
                                    </div>
                                  </div>
                                </button>
                              </div>
                            ))}
                          </div>
                        );
                      })()}

                      {/* Create New Account Button */}
                      <div className="py-1">
                        <button
                          type="button"
                          onClick={() => {
                            setShowTeacherMenu(false);
                            onOpenCreateAccount();
                          }}
                          className="w-full text-left px-3.5 py-2 flex items-center gap-2.5 text-xs font-medium text-slate-700 hover:bg-sky-50 hover:text-blue-950 transition-colors cursor-pointer"
                        >
                          <UserPlus className="w-4 h-4 text-sky-600 shrink-0" />
                          <span>Crear otra cuenta docente</span>
                        </button>
                      </div>

                      <div className="border-t border-slate-100 mt-1 pt-1">
                        {/* Logout Button */}
                        <button
                          type="button"
                          onClick={() => {
                            setShowTeacherMenu(false);
                            onLogout();
                          }}
                          className="w-full text-left px-3.5 py-2 flex items-center gap-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors cursor-pointer"
                        >
                          <LogOut className="w-4 h-4 text-rose-500 shrink-0" />
                          <span>Cerrar Sesión</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={onLogout}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-blue-950 border border-sky-300 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                <User className="w-3.5 h-3.5 text-sky-600" />
                <span>Iniciar Sesión</span>
              </button>
            )}

            {/* Context Action Button (Upload vs Publish Schedule vs Admin) */}
            {currentView === 'admin' ? (
              <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-300 text-amber-900 rounded-xl text-xs font-bold shadow-2xs">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                <span>Supervisión y Descargas</span>
              </span>
            ) : currentView === 'schedule' ? (
              <button
                id="navbar-publish-schedule-button"
                type="button"
                onClick={onOpenScheduleModal}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-blue-950 to-blue-900 hover:from-blue-900 hover:to-blue-800 text-amber-300 rounded-xl text-xs font-bold shadow-md shadow-blue-950/20 border border-amber-400/40 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">Publicar Horario</span>
              </button>
            ) : (
              <button
                id="navbar-upload-doc-button"
                type="button"
                onClick={onOpenUpload}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-blue-950 to-blue-900 hover:from-blue-900 hover:to-blue-800 text-amber-300 rounded-xl text-xs font-bold shadow-md shadow-blue-950/20 border border-amber-400/40 transition-all cursor-pointer"
              >
                <UploadCloud className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">Subir Documento</span>
              </button>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
