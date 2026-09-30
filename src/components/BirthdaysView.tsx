import React, { useState, useMemo } from 'react';
import {
  Cake,
  Search,
  Sparkles,
  Gift,
  PartyPopper,
  Edit3,
  Check,
  X
} from 'lucide-react';
import { Teacher } from '../types';

interface BirthdaysViewProps {
  teachers: Teacher[];
  currentTeacher: Teacher | null;
  onUpdateBirthDate: (teacherId: string, birthDate: string) => void;
}

const MONTH_NAMES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Setiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

interface ParsedBirthday {
  teacher: Teacher;
  day: number;
  month: number; // 0-indexed (0 = Enero, 11 = Diciembre)
  dayAndMonthText: string;
  isToday: boolean;
  isThisMonth: boolean;
}

export const BirthdaysView: React.FC<BirthdaysViewProps> = ({
  teachers,
  currentTeacher,
  onUpdateBirthDate,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonthFilter, setSelectedMonthFilter] = useState<number | 'all'>('all');
  const [editingTeacherId, setEditingTeacherId] = useState<string | null>(null);
  const [editingDateValue, setEditingDateValue] = useState<string>('');

  const now = new Date();
  const currentMonthIndex = now.getMonth(); // 0 to 11
  const currentDay = now.getDate();

  // Parse teachers' birthDate
  const parsedBirthdays = useMemo(() => {
    const list: ParsedBirthday[] = [];

    teachers.forEach((t) => {
      // Exclude direct administrative system account if preferred or include if has birthDate
      if (t.username.toLowerCase() === 'directora' && !t.birthDate) {
        return;
      }

      if (t.birthDate && t.birthDate.trim()) {
        const parts = t.birthDate.split('-');
        if (parts.length >= 3) {
          const dayNum = parseInt(parts[2], 10);
          const monthNum = parseInt(parts[1], 10) - 1; // 0-indexed

          if (!isNaN(dayNum) && !isNaN(monthNum) && monthNum >= 0 && monthNum <= 11) {
            const isToday = monthNum === currentMonthIndex && dayNum === currentDay;
            const isThisMonth = monthNum === currentMonthIndex;
            const dayAndMonthText = `${dayNum} de ${MONTH_NAMES[monthNum]}`;

            list.push({
              teacher: t,
              day: dayNum,
              month: monthNum,
              dayAndMonthText,
              isToday,
              isThisMonth,
            });
            return;
          }
        }
      }

      // Teacher without registered birthDate
      list.push({
        teacher: t,
        day: 999,
        month: 999,
        dayAndMonthText: 'Fecha no registrada',
        isToday: false,
        isThisMonth: false,
      });
    });

    // Sort: First by month, then by day
    return list.sort((a, b) => {
      if (a.month !== b.month) return a.month - b.month;
      return a.day - b.day;
    });
  }, [teachers, currentMonthIndex, currentDay]);

  // Birthdays of the current month
  const thisMonthBirthdays = useMemo(() => {
    return parsedBirthdays.filter((b) => b.isThisMonth);
  }, [parsedBirthdays]);

  // Filtered list
  const filteredList = useMemo(() => {
    return parsedBirthdays.filter((item) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = item.teacher.name.toLowerCase().includes(q);
        const matchDate = item.dayAndMonthText.toLowerCase().includes(q);
        if (!matchName && !matchDate) return false;
      }

      if (selectedMonthFilter !== 'all') {
        if (item.month !== selectedMonthFilter) return false;
      }

      return true;
    });
  }, [parsedBirthdays, searchQuery, selectedMonthFilter]);

  const handleSaveDate = (teacherId: string) => {
    if (editingDateValue) {
      onUpdateBirthDate(teacherId, editingDateValue);
    }
    setEditingTeacherId(null);
    setEditingDateValue('');
  };

  return (
    <div id="birthdays-view" className="flex-1 bg-slate-50/70 p-4 sm:p-6 lg:p-8 overflow-y-auto">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Section Header */}
        <div className="bg-white rounded-2xl p-6 border border-sky-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-950 to-blue-900 text-amber-400 border border-amber-400/40 flex items-center justify-center shrink-0 shadow-md">
              <Cake className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-blue-950 tracking-tight flex items-center gap-2">
                <span>Calendario de Cumpleaños</span>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                  {MONTH_NAMES[currentMonthIndex]}
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-sky-800 mt-0.5 font-medium">
                fechas de docentes de la I.E. Libertador Mariscal Castilla (Oxapampa)
              </p>
            </div>
          </div>
        </div>

        {/* Current Month Highlight Banner (if any) */}
        {thisMonthBirthdays.length > 0 && (
          <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-sky-800 rounded-2xl p-5 text-white shadow-md border border-amber-400/30">
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <PartyPopper className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold tracking-wide uppercase text-amber-300">
                  Cumpleaños del Mes ({MONTH_NAMES[currentMonthIndex]})
                </h3>
              </div>
              <span className="text-xs bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2.5 py-0.5 rounded-full font-bold">
                {thisMonthBirthdays.length} {thisMonthBirthdays.length === 1 ? 'docente' : 'docentes'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {thisMonthBirthdays.map((item) => (
                <div
                  key={item.teacher.id}
                  className={`p-3.5 rounded-xl backdrop-blur-xs transition-all flex items-center gap-3 ${
                    item.isToday
                      ? 'bg-white text-slate-900 shadow-lg ring-2 ring-amber-400'
                      : 'bg-white/10 text-white hover:bg-white/20 border border-white/10'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    item.isToday ? 'bg-amber-100 text-amber-700' : 'bg-white/20 text-amber-300'
                  }`}>
                    {item.isToday ? <Sparkles className="w-5 h-5 text-amber-600" /> : <Gift className="w-4 h-4" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`text-xs font-bold truncate ${item.isToday ? 'text-blue-950 font-extrabold' : 'text-white'}`}>
                      {item.teacher.name}
                    </p>
                    <p className={`text-xs font-semibold ${item.isToday ? 'text-amber-600' : 'text-amber-300'}`}>
                      {item.dayAndMonthText} {item.isToday && '🎉 ¡HOY!'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filter & Search Bar */}
        <div className="bg-white p-4 rounded-xl border border-sky-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-sky-600 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nombre completo o mes..."
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-sky-50/50 focus:bg-white border border-sky-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500"
            />
          </div>

          {/* Month Filter Dropdown */}
          <select
            value={selectedMonthFilter}
            onChange={(e) => {
              const val = e.target.value;
              setSelectedMonthFilter(val === 'all' ? 'all' : parseInt(val, 10));
            }}
            className="px-3 py-2 text-xs bg-sky-50/70 border border-sky-200 rounded-xl text-blue-950 focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 cursor-pointer font-semibold"
          >
            <option value="all">Todos los meses</option>
            {MONTH_NAMES.map((name, idx) => (
              <option key={name} value={idx}>
                {name} {idx === currentMonthIndex ? '(Mes actual)' : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Teachers Birthdays List - strictly full name, day and month */}
        {filteredList.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <Cake className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-700">No se encontraron docentes</h3>
            <p className="text-xs text-slate-400 mt-1">
              No hay registros que coincidan con la búsqueda.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-600 uppercase tracking-wider">
              <span>Nombre Completo del Docente</span>
              <span>Día y Mes</span>
            </div>

            <div className="divide-y divide-slate-100">
              {filteredList.map((item) => {
                const isEditing = editingTeacherId === item.teacher.id;
                const isCurrentLogged = currentTeacher?.id === item.teacher.id || currentTeacher?.role === 'director';

                return (
                  <div
                    key={item.teacher.id}
                    className={`px-5 py-3.5 flex items-center justify-between gap-4 transition-colors ${
                      item.isToday
                        ? 'bg-rose-50/60 font-semibold'
                        : item.isThisMonth
                        ? 'bg-pink-50/30'
                        : 'hover:bg-slate-50/80'
                    }`}
                  >
                    {/* Nombre Completo del Docente */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        item.isToday
                          ? 'bg-rose-600 text-white'
                          : item.isThisMonth
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        <Cake className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-sm font-bold text-slate-900 block truncate">
                          {item.teacher.name}
                        </span>
                        {item.isToday && (
                          <span className="text-[10px] font-bold text-rose-600 flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            ¡Hoy está de cumpleaños!
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Día y Mes */}
                    <div className="flex items-center gap-2 shrink-0">
                      {isEditing ? (
                        <div className="flex items-center gap-1.5 animate-in fade-in duration-150">
                          <input
                            type="date"
                            value={editingDateValue}
                            onChange={(e) => setEditingDateValue(e.target.value)}
                            className="px-2 py-1 text-xs border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveDate(item.teacher.id)}
                            className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                            title="Guardar fecha"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingTeacherId(null)}
                            className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Cancelar"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-3 py-1 rounded-lg text-xs font-bold ${
                              item.isToday
                                ? 'bg-rose-600 text-white shadow-xs'
                                : item.isThisMonth
                                ? 'bg-rose-100 text-rose-800'
                                : item.day !== 999
                                ? 'bg-slate-100 text-slate-700'
                                : 'bg-slate-50 text-slate-400 italic'
                            }`}
                          >
                            {item.dayAndMonthText}
                          </span>

                          {/* Quick Edit button for current teacher or admin */}
                          {isCurrentLogged && (
                            <button
                              type="button"
                              onClick={() => {
                                setEditingTeacherId(item.teacher.id);
                                setEditingDateValue(item.teacher.birthDate || '');
                              }}
                              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                              title="Editar fecha de nacimiento"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
