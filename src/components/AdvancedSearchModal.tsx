import React, { useState, useEffect } from 'react';
import {
  X,
  Search,
  SlidersHorizontal,
  Calendar,
  FileType,
  BookOpen,
  GraduationCap,
  User,
  Star,
  RotateCcw,
  Check
} from 'lucide-react';
import { FilterCriteria, DocumentFormat, Teacher } from '../types';
import { COURSES, GRADES, SECTIONS } from '../data/initialData';

interface AdvancedSearchModalProps {
  onClose: () => void;
  filters: FilterCriteria;
  onApplyFilters: (updated: Partial<FilterCriteria>) => void;
  onResetFilters: () => void;
  onSaveAsSmartFolder?: (title: string, criteria: Partial<FilterCriteria>) => void;
  allTeachers: Teacher[];
}

export const AdvancedSearchModal: React.FC<AdvancedSearchModalProps> = ({
  onClose,
  filters,
  onApplyFilters,
  onResetFilters,
  allTeachers,
}) => {
  const [query, setQuery] = useState(filters.searchQuery || '');
  const [selectedCourse, setSelectedCourse] = useState(filters.course || '');
  const [selectedGrade, setSelectedGrade] = useState(filters.grade || '');
  const [selectedSection, setSelectedSection] = useState(filters.section || '');
  const [selectedFormat, setSelectedFormat] = useState(filters.format || '');
  const [dateRange, setDateRange] = useState(filters.dateRange || 'all');
  const [startDate, setStartDate] = useState(filters.startDate || '');
  const [endDate, setEndDate] = useState(filters.endDate || '');
  const [selectedTeacherId, setSelectedTeacherId] = useState(filters.authorTeacherId || '');
  const [onlyFavorites, setOnlyFavorites] = useState(filters.onlyFavorites || false);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const formats: { value: string; label: string }[] = [
    { value: '', label: 'Cualquier formato' },
    { value: 'pdf', label: 'PDF (.pdf)' },
    { value: 'docx', label: 'Word (.docx)' },
    { value: 'xlsx', label: 'Excel (.xlsx)' },
    { value: 'pptx', label: 'PowerPoint (.pptx)' },
    { value: 'exam', label: 'Exámenes y Rúbricas (.exam)' },
    { value: 'image', label: 'Imágenes y Diagramas' },
    { value: 'txt', label: 'Texto plano (.txt)' },
  ];

  const handleApply = () => {
    onApplyFilters({
      searchQuery: query.trim(),
      course: selectedCourse,
      grade: selectedGrade,
      section: selectedSection,
      format: selectedFormat,
      dateRange: dateRange as any,
      startDate: dateRange === 'custom' ? startDate : undefined,
      endDate: dateRange === 'custom' ? endDate : undefined,
      authorTeacherId: selectedTeacherId,
      onlyFavorites,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Búsqueda Avanzada de Documentos
              </h2>
              <p className="text-xs text-slate-500">
                Filtre archivos docentes combinando múltiples criterios académicos
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
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-4">
          
          {/* Keyword Search */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Término de búsqueda o palabras clave
            </label>
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar en títulos, fragmentos de exámenes, syllabus, notas..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-900"
              />
            </div>
          </div>

          {/* Course & Format */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Curso Académico
              </label>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-200 rounded-lg text-slate-800 cursor-pointer"
              >
                <option value="">Todos los cursos</option>
                {COURSES.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Tipo de Formato
              </label>
              <select
                value={selectedFormat}
                onChange={(e) => setSelectedFormat(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-200 rounded-lg text-slate-800 cursor-pointer"
              >
                {formats.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Grade & Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Grado Escolar
              </label>
              <select
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-200 rounded-lg text-slate-800 cursor-pointer"
              >
                <option value="">Todos los grados (Primaria y Secundaria)</option>
                {GRADES.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Sección
              </label>
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-200 rounded-lg text-slate-800 cursor-pointer"
              >
                <option value="">Todas las secciones</option>
                {SECTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date Range Selector */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Filtrar por Fecha de Modificación o Carga
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
              {[
                { id: 'all', label: 'Cualquier fecha' },
                { id: 'today', label: 'Hoy' },
                { id: 'week', label: 'Últimos 7 días' },
                { id: 'month', label: 'Este mes' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setDateRange(item.id as any)}
                  className={`py-1.5 px-2 rounded-lg text-xs font-medium border transition-colors ${
                    dateRange === item.id
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-800 font-semibold'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Custom range button & inputs */}
            <div className="flex items-center gap-2 mt-1">
              <button
                type="button"
                onClick={() => setDateRange('custom')}
                className={`py-1.5 px-3 rounded-lg text-xs font-medium border transition-colors ${
                  dateRange === 'custom'
                    ? 'bg-indigo-50 border-indigo-300 text-indigo-800 font-semibold'
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                Rango específico de fechas:
              </button>
              {dateRange === 'custom' && (
                <div className="flex items-center gap-1.5 text-xs">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="px-2 py-1 bg-white border border-slate-200 rounded text-slate-700 text-xs"
                  />
                  <span className="text-slate-400">a</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="px-2 py-1 bg-white border border-slate-200 rounded text-slate-700 text-xs"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Teacher Author */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Profesor Propietario
            </label>
            <select
              value={selectedTeacherId}
              onChange={(e) => setSelectedTeacherId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-200 rounded-lg text-slate-800 cursor-pointer"
            >
              <option value="">Cualquier docente</option>
              {allTeachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.specialty})
                </option>
              ))}
            </select>
          </div>

          {/* Favorites checkbox */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="fav-check"
              checked={onlyFavorites}
              onChange={(e) => setOnlyFavorites(e.target.checked)}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="fav-check" className="text-xs text-slate-700 cursor-pointer flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
              Solo documentos destacados como favoritos
            </label>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setSelectedCourse('');
              setSelectedGrade('');
              setSelectedSection('');
              setSelectedFormat('');
              setDateRange('all');
              setStartDate('');
              setEndDate('');
              setSelectedTeacherId('');
              setOnlyFavorites(false);
              onResetFilters();
            }}
            className="inline-flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 font-medium"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Restablecer criterios
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
            >
              <Search className="w-3.5 h-3.5" />
              Aplicar Búsqueda
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
