import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Clock,
  User,
  Plus,
  Edit2,
  Trash2,
  BookOpen,
  MapPin,
  GraduationCap,
  Filter,
  Search,
  LayoutGrid,
  Users,
  Sparkles,
  Info,
  ChevronRight,
  Lock
} from 'lucide-react';
import { ScheduleEntry, DayOfWeek, Teacher } from '../types';
import { formatTime12h } from '../utils/formatters';

interface ClassScheduleViewProps {
  schedules: ScheduleEntry[];
  currentTeacher: Teacher | null;
  allTeachers: Teacher[];
  onOpenAddSchedule: () => void;
  onEditSchedule: (schedule: ScheduleEntry) => void;
  onDeleteSchedule: (id: string) => void;
}

const DAYS: DayOfWeek[] = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

const COLOR_STYLES: Record<string, { bg: string; border: string; text: string; badge: string }> = {
  blue: { bg: 'bg-blue-50/80', border: 'border-blue-200', text: 'text-blue-900', badge: 'bg-blue-100 text-blue-700' },
  amber: { bg: 'bg-amber-50/80', border: 'border-amber-200', text: 'text-amber-900', badge: 'bg-amber-100 text-amber-700' },
  emerald: { bg: 'bg-emerald-50/80', border: 'border-emerald-200', text: 'text-emerald-900', badge: 'bg-emerald-100 text-emerald-700' },
  purple: { bg: 'bg-purple-50/80', border: 'border-purple-200', text: 'text-purple-900', badge: 'bg-purple-100 text-purple-700' },
  orange: { bg: 'bg-orange-50/80', border: 'border-orange-200', text: 'text-orange-900', badge: 'bg-orange-100 text-orange-700' },
  cyan: { bg: 'bg-cyan-50/80', border: 'border-cyan-200', text: 'text-cyan-900', badge: 'bg-cyan-100 text-cyan-700' },
  pink: { bg: 'bg-pink-50/80', border: 'border-pink-200', text: 'text-pink-900', badge: 'bg-pink-100 text-pink-700' },
  indigo: { bg: 'bg-indigo-50/80', border: 'border-indigo-200', text: 'text-indigo-900', badge: 'bg-indigo-100 text-indigo-700' },
};

export const ClassScheduleView: React.FC<ClassScheduleViewProps> = ({
  schedules,
  currentTeacher,
  allTeachers,
  onOpenAddSchedule,
  onEditSchedule,
  onDeleteSchedule,
}) => {
  const [selectedTeacherFilter, setSelectedTeacherFilter] = useState<string>('all');
  const [selectedDayFilter, setSelectedDayFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'by-teacher'>('grid');

  // Extract unique teacher names that have schedules
  const teachersWithSchedules = useMemo(() => {
    const map = new Map<string, string>();
    schedules.forEach((s) => {
      map.set(s.teacherName, s.teacherName);
    });
    return Array.from(map.values()).sort();
  }, [schedules]);

  // Filtered schedules
  const filteredSchedules = useMemo(() => {
    return schedules.filter((s) => {
      // Teacher filter
      if (selectedTeacherFilter !== 'all' && s.teacherName !== selectedTeacherFilter) {
        return false;
      }
      // Day filter
      if (selectedDayFilter !== 'all' && s.dayOfWeek !== selectedDayFilter) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          s.course.toLowerCase().includes(q) ||
          s.teacherName.toLowerCase().includes(q) ||
          (s.classroom && s.classroom.toLowerCase().includes(q)) ||
          (s.grade && s.grade.toLowerCase().includes(q)) ||
          (s.section && s.section.toLowerCase().includes(q)) ||
          (s.notes && s.notes.toLowerCase().includes(q));
        if (!match) return false;
      }
      return true;
    });
  }, [schedules, selectedTeacherFilter, selectedDayFilter, searchQuery]);

  // Group schedules by day
  const schedulesByDay = useMemo(() => {
    const grouped: Record<DayOfWeek, ScheduleEntry[]> = {
      Lunes: [],
      Martes: [],
      Miércoles: [],
      Jueves: [],
      Viernes: [],
      Sábado: [],
    };

    filteredSchedules.forEach((s) => {
      if (grouped[s.dayOfWeek]) {
        grouped[s.dayOfWeek].push(s);
      }
    });

    // Sort chronologically by startTime
    Object.keys(grouped).forEach((day) => {
      grouped[day as DayOfWeek].sort((a, b) => a.startTime.localeCompare(b.startTime));
    });

    return grouped;
  }, [filteredSchedules]);

  // Group schedules by teacher
  const schedulesByTeacher = useMemo(() => {
    const grouped = new Map<string, ScheduleEntry[]>();
    filteredSchedules.forEach((s) => {
      const list = grouped.get(s.teacherName) || [];
      list.push(s);
      grouped.set(s.teacherName, list);
    });

    // Sort by day and time within each teacher
    const dayOrder: Record<DayOfWeek, number> = {
      Lunes: 1,
      Martes: 2,
      Miércoles: 3,
      Jueves: 4,
      Viernes: 5,
      Sábado: 6,
    };

    grouped.forEach((list) => {
      list.sort((a, b) => {
        const dayDiff = dayOrder[a.dayOfWeek] - dayOrder[b.dayOfWeek];
        if (dayDiff !== 0) return dayDiff;
        return a.startTime.localeCompare(b.startTime);
      });
    });

    return Array.from(grouped.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [filteredSchedules]);

  // Check if Saturday has any classes
  const hasSaturdayClasses = useMemo(() => {
    return schedules.some((s) => s.dayOfWeek === 'Sábado');
  }, [schedules]);

  const activeDays = useMemo(() => {
    return hasSaturdayClasses ? DAYS : DAYS.slice(0, 5);
  }, [hasSaturdayClasses]);

  return (
    <div id="class-schedule-view" className="flex-1 flex flex-col min-w-0 bg-white">
      {/* Hero Header */}
      <div className="px-4 sm:px-6 pt-5 pb-4 border-b border-slate-200 bg-linear-to-r from-slate-50 via-indigo-50/30 to-white">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full p-0.5 bg-gradient-to-tr from-amber-400 via-sky-400 to-indigo-600 shadow-xs flex items-center justify-center overflow-hidden shrink-0">
                <img
                  src="/insignia_colegio.jpg"
                  alt="Insignia I.E. Libertador Mariscal Castilla"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover rounded-full bg-white"
                />
              </div>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Horario de Clase
              </h1>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                I.E. Libertador Mariscal Castilla
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
              Publica y consulta las asignaturas, horas de clase y docentes. Tu horario permanece publicado de forma permanente hasta que decidas modificarlo cuando quieras.
            </p>
          </div>

          {/* Action Button: Publish / Add Schedule */}
          <div className="flex items-center gap-2.5">
            <button
              id="publish-schedule-header-button"
              type="button"
              onClick={onOpenAddSchedule}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs hover:shadow-md transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Publicar / Modificar Mi Horario</span>
            </button>
          </div>
        </div>

        {/* Informative notification banner */}
        <div className="mt-4 p-2.5 bg-indigo-50/60 border border-indigo-200/60 rounded-xl flex items-center justify-between gap-3 text-xs text-indigo-950">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>
              <strong>Docente activo:</strong> {currentTeacher ? currentTeacher.name : 'Invitado'}. Puedes agregar tus materias o editar tus bloques horarios en cualquier momento.
            </span>
          </div>
          <span className="text-[11px] font-semibold text-indigo-700 whitespace-nowrap bg-white px-2 py-0.5 rounded-md border border-indigo-200">
            {schedules.length} {schedules.length === 1 ? 'clase registrada' : 'clases registradas'}
          </span>
        </div>
      </div>

      {/* Control Bar: Filters & Search */}
      <div className="px-4 sm:px-6 py-3 border-b border-slate-200 bg-slate-50/70 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-0">
          
          {/* Filter by Teacher */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="font-semibold text-slate-600 shrink-0">Docente:</span>
            <select
              id="filter-teacher-select"
              value={selectedTeacherFilter}
              onChange={(e) => setSelectedTeacherFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer shadow-2xs"
            >
              <option value="all">Todos los Docentes</option>
              {currentTeacher && (
                <option value={currentTeacher.name}>
                  ★ Mi Horario ({currentTeacher.name})
                </option>
              )}
              {teachersWithSchedules
                .filter((t) => !currentTeacher || t !== currentTeacher.name)
                .map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
            </select>
          </div>

          {/* Filter by Day */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="font-semibold text-slate-600 shrink-0">Día:</span>
            <select
              id="filter-day-select"
              value={selectedDayFilter}
              onChange={(e) => setSelectedDayFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer shadow-2xs"
            >
              <option value="all">Toda la Semana</option>
              {DAYS.map((day) => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
            </select>
          </div>

          {/* Search box */}
          <div className="relative flex-1 max-w-xs min-w-[160px]">
            <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-3.5 h-3.5" />
            </div>
            <input
              id="search-schedules-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar curso, aula, etc..."
              className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-2xs"
            />
          </div>

          {(selectedTeacherFilter !== 'all' || selectedDayFilter !== 'all' || searchQuery.trim() !== '') && (
            <button
              type="button"
              onClick={() => {
                setSelectedTeacherFilter('all');
                setSelectedDayFilter('all');
                setSearchQuery('');
              }}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold hover:underline"
            >
              Limpiar filtros
            </button>
          )}
        </div>

        {/* View Mode Toggle: Grid vs By-Teacher */}
        <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5 shadow-2xs">
          <button
            id="view-grid-button"
            type="button"
            onClick={() => setViewMode('grid')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              viewMode === 'grid'
                ? 'bg-indigo-600 text-white shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Cuadrícula Semanal</span>
          </button>
          <button
            id="view-by-teacher-button"
            type="button"
            onClick={() => setViewMode('by-teacher')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              viewMode === 'by-teacher'
                ? 'bg-indigo-600 text-white shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Por Docente</span>
          </button>
        </div>
      </div>

      {/* Main Schedules View Area */}
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto bg-slate-50/40">
        {filteredSchedules.length === 0 ? (
          /* Empty State */
          <div className="py-16 text-center max-w-md mx-auto space-y-3 bg-white p-8 rounded-2xl border border-slate-200 shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
              <Calendar className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-800">
              No hay horarios que coincidan
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              No se encontraron clases programadas con los filtros actuales. Puedes publicar tu horario de clases o ajustar la búsqueda.
            </p>
            <div className="pt-2 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={onOpenAddSchedule}
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Publicar Horario Ahora</span>
              </button>
            </div>
          </div>
        ) : viewMode === 'grid' ? (
          /* Weekly Grid Columns */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {activeDays.map((day) => {
              const daySchedules = schedulesByDay[day] || [];
              const isToday = false; // Could highlight current day if needed

              return (
                <div
                  key={day}
                  className="bg-white rounded-xl border border-slate-200 flex flex-col shadow-xs overflow-hidden"
                >
                  {/* Day Header */}
                  <div className="px-3.5 py-2.5 bg-slate-100/70 border-b border-slate-200 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      {day}
                    </span>
                    <span className="text-[11px] font-semibold px-2 py-0.5 bg-white rounded-full border border-slate-200 text-slate-600">
                      {daySchedules.length} {daySchedules.length === 1 ? 'clase' : 'clases'}
                    </span>
                  </div>

                  {/* Day Classes */}
                  <div className="p-2.5 space-y-2.5 flex-1 min-h-[140px] bg-slate-50/30">
                    {daySchedules.length === 0 ? (
                      <div className="h-full flex items-center justify-center py-8 text-center">
                        <span className="text-xs text-slate-400 italic">
                          Sin clases programadas
                        </span>
                      </div>
                    ) : (
                      daySchedules.map((item) => {
                        const style = COLOR_STYLES[item.color || 'blue'] || COLOR_STYLES.blue;
                        const canModify = Boolean(
                          currentTeacher &&
                            (currentTeacher.id === item.teacherId ||
                              currentTeacher.name.toLowerCase() === item.teacherName.toLowerCase() ||
                              currentTeacher.username.toLowerCase() === item.teacherName.toLowerCase() ||
                              currentTeacher.role === 'director' ||
                              currentTeacher.username.toLowerCase() === 'directora')
                        );

                        return (
                          <div
                            key={item.id}
                            className={`p-3 rounded-xl border transition-all hover:shadow-xs group ${style.bg} ${style.border}`}
                          >
                            {/* Time & Action buttons */}
                            <div className="flex items-center justify-between gap-1 mb-1.5">
                              <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-slate-700">
                                <Clock className="w-3 h-3 text-slate-500" />
                                <span>{formatTime12h(item.startTime)} - {formatTime12h(item.endTime)}</span>
                              </div>

                              {canModify ? (
                                <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                                  <button
                                    type="button"
                                    onClick={() => onEditSchedule(item)}
                                    className="p-1 text-slate-500 hover:text-indigo-600 hover:bg-white/80 rounded transition-colors"
                                    title="Editar horario"
                                  >
                                    <Edit2 className="w-3 h-3" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (confirm(`¿Eliminar la clase de ${item.course} (${item.dayOfWeek})?`)) {
                                        onDeleteSchedule(item.id);
                                      }
                                    }}
                                    className="p-1 text-slate-400 hover:text-rose-600 hover:bg-white/80 rounded transition-colors"
                                    title="Eliminar del horario"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              ) : (
                                <div className="text-slate-400 p-0.5" title={`Horario publicado por ${item.teacherName} (solo el creador puede editarlo)`}>
                                  <Lock className="w-3 h-3" />
                                </div>
                              )}
                            </div>

                            {/* Course Title */}
                            <div className={`text-xs font-bold leading-tight ${style.text} mb-1.5`}>
                              {item.course}
                            </div>

                            {/* Teacher */}
                            <div className="flex items-center gap-1 text-[11px] text-slate-700 font-medium truncate mb-1">
                              <User className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="truncate">{item.teacherName}</span>
                            </div>

                            {/* Grade / Section */}
                            {(item.grade || item.section) && (
                              <div className="flex items-center gap-1 text-[10px] text-slate-500 mb-1">
                                <GraduationCap className="w-3 h-3 text-slate-400 shrink-0" />
                                <span className="truncate">
                                  {[item.grade, item.section].filter(Boolean).join(' • ')}
                                </span>
                              </div>
                            )}

                            {/* Notes */}
                            {item.notes && (
                              <div className="mt-1.5 pt-1.5 border-t border-slate-200/60 text-[10px] text-slate-600 italic line-clamp-2">
                                {item.notes}
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Grouped by Teacher View */
          <div className="space-y-4">
            {schedulesByTeacher.map(([teacherName, list]) => (
              <div
                key={teacherName}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden"
              >
                {/* Teacher Group Header */}
                <div className="px-5 py-3.5 bg-linear-to-r from-slate-50 to-white border-b border-slate-200 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">
                      <User className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        {teacherName}
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        {list.length} {list.length === 1 ? 'clase asignada en la semana' : 'clases asignadas en la semana'}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={onOpenAddSchedule}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold inline-flex items-center gap-1 hover:underline"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Agregar clase a este horario</span>
                  </button>
                </div>

                {/* Teacher's Schedule Items Grid */}
                <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {list.map((item) => {
                    const style = COLOR_STYLES[item.color || 'blue'] || COLOR_STYLES.blue;
                    const canModify = Boolean(
                      currentTeacher &&
                        (currentTeacher.id === item.teacherId ||
                          currentTeacher.name.toLowerCase() === item.teacherName.toLowerCase() ||
                          currentTeacher.username.toLowerCase() === item.teacherName.toLowerCase() ||
                          currentTeacher.role === 'director' ||
                          currentTeacher.username.toLowerCase() === 'directora')
                    );

                    return (
                      <div
                        key={item.id}
                        className={`p-3.5 rounded-xl border transition-all hover:shadow-xs group ${style.bg} ${style.border}`}
                      >
                        <div className="flex items-center justify-between gap-1 mb-2">
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${style.badge}`}>
                            {item.dayOfWeek}
                          </span>

                          {canModify ? (
                            <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                              <button
                                type="button"
                                onClick={() => onEditSchedule(item)}
                                className="p-1 text-slate-500 hover:text-indigo-600 hover:bg-white/80 rounded transition-colors"
                                title="Editar horario"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm(`¿Eliminar la clase de ${item.course} (${item.dayOfWeek})?`)) {
                                    onDeleteSchedule(item.id);
                                  }
                                }}
                                className="p-1 text-slate-400 hover:text-rose-600 hover:bg-white/80 rounded transition-colors"
                                title="Eliminar del horario"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <div className="text-slate-400 p-0.5" title={`Horario publicado por ${item.teacherName} (solo el creador puede editarlo)`}>
                              <Lock className="w-3 h-3" />
                            </div>
                          )}
                        </div>

                        <div className={`text-xs font-bold leading-tight ${style.text} mb-1.5`}>
                          {item.course}
                        </div>

                        <div className="space-y-1 text-[11px] text-slate-600">
                          <div className="flex items-center gap-1 font-mono font-semibold text-slate-700">
                            <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{formatTime12h(item.startTime)} - {formatTime12h(item.endTime)}</span>
                          </div>

                          {(item.grade || item.section) && (
                            <div className="flex items-center gap-1">
                              <GraduationCap className="w-3 h-3 text-slate-400 shrink-0" />
                              <span>{[item.grade, item.section].filter(Boolean).join(' • ')}</span>
                            </div>
                          )}
                        </div>

                        {item.notes && (
                          <div className="mt-2 pt-2 border-t border-slate-200/60 text-[10px] text-slate-500 italic line-clamp-2">
                            {item.notes}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
