import React from 'react';
import {
  Calendar,
  FileType,
  GraduationCap,
  BookOpen,
  Grid,
  List,
  X,
  RotateCcw,
  SlidersHorizontal
} from 'lucide-react';
import { FilterCriteria } from '../types';
import { COURSES, GRADES, SECTIONS } from '../data/initialData';

interface FilterBarProps {
  filters: FilterCriteria;
  onFilterChange: (updates: Partial<FilterCriteria>) => void;
  onResetFilters: () => void;
  totalFilteredCount: number;
  totalDocumentsCount: number;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  onOpenAdvancedSearch: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  totalFilteredCount,
  totalDocumentsCount,
  viewMode,
  onViewModeChange,
  onOpenAdvancedSearch,
}) => {
  const formats: { value: string; label: string }[] = [
    { value: '', label: 'Todos los formatos' },
    { value: 'pdf', label: 'PDF (.pdf)' },
    { value: 'docx', label: 'Word (.docx)' },
    { value: 'xlsx', label: 'Excel (.xlsx)' },
    { value: 'pptx', label: 'PowerPoint (.pptx)' },
    { value: 'exam', label: 'Examen / Clave (.exam)' },
    { value: 'image', label: 'Imágenes (.png, .jpg)' },
  ];

  const dateRanges: { value: FilterCriteria['dateRange']; label: string }[] = [
    { value: 'all', label: 'Cualquier fecha' },
    { value: 'today', label: 'Hoy' },
    { value: 'week', label: 'Últimos 7 días' },
    { value: 'month', label: 'Este mes' },
    { value: 'quarter', label: 'Este bimestre' },
    { value: 'custom', label: 'Rango personalizado...' },
  ];

  const hasActiveFilters =
    Boolean(filters.searchQuery) ||
    Boolean(filters.course) ||
    Boolean(filters.grade) ||
    Boolean(filters.section) ||
    Boolean(filters.format) ||
    filters.dateRange !== 'all' ||
    filters.onlyFavorites;

  return (
    <div className="bg-white border-b border-slate-200 py-3 px-4 sm:px-6 space-y-3">
      {/* Primary Filters Row */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        
        {/* Left: Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Format Filter */}
          <div className="relative inline-flex items-center">
            <span className="absolute left-2.5 text-slate-400 pointer-events-none">
              <FileType className="w-3.5 h-3.5" />
            </span>
            <select
              value={filters.format}
              onChange={(e) => onFilterChange({ format: e.target.value })}
              className={`pl-8 pr-7 py-1.5 text-xs font-medium rounded-lg border appearance-none transition-colors cursor-pointer ${
                filters.format
                  ? 'bg-indigo-50 border-indigo-300 text-indigo-800'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {formats.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>

          {/* Date Filter */}
          <div className="relative inline-flex items-center">
            <span className="absolute left-2.5 text-slate-400 pointer-events-none">
              <Calendar className="w-3.5 h-3.5" />
            </span>
            <select
              value={filters.dateRange}
              onChange={(e) => onFilterChange({ dateRange: e.target.value as any })}
              className={`pl-8 pr-7 py-1.5 text-xs font-medium rounded-lg border appearance-none transition-colors cursor-pointer ${
                filters.dateRange !== 'all'
                  ? 'bg-indigo-50 border-indigo-300 text-indigo-800'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {dateRanges.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>

          {/* Custom Date Inputs when 'custom' is selected */}
          {filters.dateRange === 'custom' && (
            <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-lg border border-slate-200 text-xs">
              <input
                type="date"
                value={filters.startDate || ''}
                onChange={(e) => onFilterChange({ startDate: e.target.value })}
                className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-slate-700 text-xs"
              />
              <span className="text-slate-400">a</span>
              <input
                type="date"
                value={filters.endDate || ''}
                onChange={(e) => onFilterChange({ endDate: e.target.value })}
                className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-slate-700 text-xs"
              />
            </div>
          )}

          {/* Course Filter */}
          <div className="relative inline-flex items-center">
            <span className="absolute left-2.5 text-slate-400 pointer-events-none">
              <BookOpen className="w-3.5 h-3.5" />
            </span>
            <select
              value={filters.course}
              onChange={(e) => onFilterChange({ course: e.target.value })}
              className={`pl-8 pr-7 py-1.5 text-xs font-medium rounded-lg border appearance-none transition-colors cursor-pointer ${
                filters.course
                  ? 'bg-indigo-50 border-indigo-300 text-indigo-800'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <option value="">Todos los Cursos</option>
              {COURSES.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Grade & Section Filter */}
          <div className="relative inline-flex items-center">
            <span className="absolute left-2.5 text-slate-400 pointer-events-none">
              <GraduationCap className="w-3.5 h-3.5" />
            </span>
            <select
              value={filters.grade}
              onChange={(e) => onFilterChange({ grade: e.target.value })}
              className={`pl-8 pr-7 py-1.5 text-xs font-medium rounded-lg border appearance-none transition-colors cursor-pointer ${
                filters.grade
                  ? 'bg-indigo-50 border-indigo-300 text-indigo-800'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <option value="">Todos los Grados</option>
              {GRADES.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          {/* Section Filter */}
          <select
            value={filters.section}
            onChange={(e) => onFilterChange({ section: e.target.value })}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border appearance-none transition-colors cursor-pointer ${
              filters.section
                ? 'bg-indigo-50 border-indigo-300 text-indigo-800'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <option value="">Sección: Todas</option>
            {SECTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          {/* Advanced Search Link */}
          <button
            type="button"
            onClick={onOpenAdvancedSearch}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100/80 rounded-lg transition-colors border border-indigo-200"
          >
            <SlidersHorizontal className="w-3 h-3" />
            <span>Búsqueda avanzada</span>
          </button>
        </div>

        {/* Right: Results Count & View Mode Switch */}
        <div className="flex items-center gap-3">
          <div className="text-xs text-slate-500 font-medium">
            <span className="text-slate-900 font-bold">{totalFilteredCount}</span> de{' '}
            <span className="text-slate-600">{totalDocumentsCount}</span> archivos
          </div>

          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              type="button"
              onClick={() => onViewModeChange('grid')}
              className={`p-1.5 rounded-md text-xs transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white text-indigo-700 shadow-2xs font-semibold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Vista en cuadrícula"
            >
              <Grid className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange('list')}
              className={`p-1.5 rounded-md text-xs transition-colors ${
                viewMode === 'list'
                  ? 'bg-white text-indigo-700 shadow-2xs font-semibold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Vista en lista detallada"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

      {/* Active Filter Badges Row */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
          <span className="text-slate-400 text-[11px] font-medium mr-1">Filtros activos:</span>

          {filters.searchQuery && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200">
              Texto: "{filters.searchQuery}"
              <button
                type="button"
                onClick={() => onFilterChange({ searchQuery: '' })}
                className="hover:text-rose-600"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filters.format && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              Formato: {filters.format.toUpperCase()}
              <button
                type="button"
                onClick={() => onFilterChange({ format: '' })}
                className="hover:text-rose-600"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filters.dateRange !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              Fecha: {dateRanges.find((d) => d.value === filters.dateRange)?.label}
              <button
                type="button"
                onClick={() => onFilterChange({ dateRange: 'all', startDate: undefined, endDate: undefined })}
                className="hover:text-rose-600"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filters.course && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              Curso: {filters.course}
              <button
                type="button"
                onClick={() => onFilterChange({ course: '' })}
                className="hover:text-rose-600"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filters.grade && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
              Grado: {filters.grade}
              <button
                type="button"
                onClick={() => onFilterChange({ grade: '' })}
                className="hover:text-rose-600"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filters.section && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              {filters.section}
              <button
                type="button"
                onClick={() => onFilterChange({ section: '' })}
                className="hover:text-rose-600"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filters.onlyFavorites && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-50 text-yellow-800 border border-yellow-200">
              Solo Favoritos
              <button
                type="button"
                onClick={() => onFilterChange({ onlyFavorites: false })}
                className="hover:text-rose-600"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          <button
            type="button"
            onClick={onResetFilters}
            className="inline-flex items-center gap-1 text-[11px] text-rose-600 hover:text-rose-700 hover:underline font-medium ml-2"
          >
            <RotateCcw className="w-2.5 h-2.5" />
            Limpiar filtros
          </button>
        </div>
      )}
    </div>
  );
};

