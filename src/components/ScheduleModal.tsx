import React, { useState } from 'react';
import {
  X,
  Calendar,
  Clock,
  BookOpen,
  User,
  GraduationCap,
  FileText,
  CheckCircle2,
  Trash2,
  Lock
} from 'lucide-react';
import { ScheduleEntry, DayOfWeek, Teacher } from '../types';
import { GRADES, SECTIONS } from '../data/initialData';

interface ScheduleModalProps {
  onClose: () => void;
  onSave: (scheduleData: Omit<ScheduleEntry, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onDelete?: (id: string) => void;
  initialSchedule?: ScheduleEntry | null;
  currentTeacher: Teacher | null;
}

const DAYS: DayOfWeek[] = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

const HOURS_12 = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
const MINUTES = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'];

const COLOR_OPTIONS = [
  { id: 'blue', name: 'Azul', bg: 'bg-blue-50', border: 'border-blue-300', text: 'text-blue-800' },
  { id: 'amber', name: 'Ámbar', bg: 'bg-amber-50', border: 'border-amber-300', text: 'text-amber-800' },
  { id: 'emerald', name: 'Esmeralda', bg: 'bg-emerald-50', border: 'border-emerald-300', text: 'text-emerald-800' },
  { id: 'purple', name: 'Púrpura', bg: 'bg-purple-50', border: 'border-purple-300', text: 'text-purple-800' },
  { id: 'orange', name: 'Naranja', bg: 'bg-orange-50', border: 'border-orange-300', text: 'text-orange-800' },
  { id: 'cyan', name: 'Cian', bg: 'bg-cyan-50', border: 'border-cyan-300', text: 'text-cyan-800' },
  { id: 'pink', name: 'Rosa', bg: 'bg-pink-50', border: 'border-pink-300', text: 'text-pink-800' },
  { id: 'indigo', name: 'Índigo', bg: 'bg-indigo-50', border: 'border-indigo-300', text: 'text-indigo-800' },
];

function parse12hTime(timeStr?: string, defaultHour = '08', defaultMin = '00', defaultAmpm = 'AM') {
  if (!timeStr) return { hour: defaultHour, minute: defaultMin, ampm: defaultAmpm };
  const trimmed = timeStr.trim();
  const isPM = trimmed.toUpperCase().includes('PM');
  const isAM = trimmed.toUpperCase().includes('AM');
  const ampm = isPM ? 'PM' : isAM ? 'AM' : 'AM';

  const cleanDigits = trimmed.replace(/[^\d:]/g, '');
  const parts = cleanDigits.split(':');
  let h = parseInt(parts[0], 10);
  const m = parts[1] ? parts[1].padStart(2, '0').slice(0, 2) : defaultMin;

  if (isNaN(h)) return { hour: defaultHour, minute: defaultMin, ampm: defaultAmpm };

  // If 24h format was provided (e.g., 14:00)
  if (!isPM && !isAM && h >= 12) {
    const period = 'PM';
    const hour12 = h === 12 ? 12 : h % 12;
    return { hour: hour12.toString().padStart(2, '0'), minute: m, ampm: period };
  }

  if (h > 12) h = h % 12;
  if (h === 0) h = 12;

  return { hour: h.toString().padStart(2, '0'), minute: m, ampm };
}

export const ScheduleModal: React.FC<ScheduleModalProps> = ({
  onClose,
  onSave,
  onDelete,
  initialSchedule,
  currentTeacher,
}) => {
  // Check authorization: only the creator of the schedule or the direct admin can modify it
  const isCreator = Boolean(
    !initialSchedule ||
    (currentTeacher &&
      (initialSchedule.teacherId === currentTeacher.id ||
        initialSchedule.teacherName.toLowerCase() === currentTeacher.name.toLowerCase() ||
        initialSchedule.teacherName.toLowerCase() === currentTeacher.username.toLowerCase() ||
        currentTeacher.role === 'director'))
  );

  const [teacherName, setTeacherName] = useState(
    initialSchedule?.teacherName || currentTeacher?.name || ''
  );
  const [course, setCourse] = useState(initialSchedule?.course || 'Matemáticas');
  const [dayOfWeek, setDayOfWeek] = useState<DayOfWeek>(initialSchedule?.dayOfWeek || 'Lunes');

  // 12-hour AM/PM start time
  const initStart = parse12hTime(initialSchedule?.startTime, '08', '00', 'AM');
  const [startHour, setStartHour] = useState(initStart.hour);
  const [startMinute, setStartMinute] = useState(initStart.minute);
  const [startPeriod, setStartPeriod] = useState(initStart.ampm);

  // 12-hour AM/PM end time
  const initEnd = parse12hTime(initialSchedule?.endTime, '09', '30', 'AM');
  const [endHour, setEndHour] = useState(initEnd.hour);
  const [endMinute, setEndMinute] = useState(initEnd.minute);
  const [endPeriod, setEndPeriod] = useState(initEnd.ampm);

  const [grade, setGrade] = useState(initialSchedule?.grade || GRADES[0] || '1° Secundaria');
  const [section, setSection] = useState(initialSchedule?.section || SECTIONS[0] || 'Sección A');
  const [notes, setNotes] = useState(initialSchedule?.notes || '');
  const [color, setColor] = useState(initialSchedule?.color || 'blue');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isCreator) {
      setError('Solo el docente que creó este horario tiene permisos para modificarlo.');
      return;
    }

    if (!teacherName.trim()) {
      setError('Por favor ingresa el nombre del docente.');
      return;
    }
    if (!course.trim()) {
      setError('Por favor escribe el nombre del curso.');
      return;
    }

    const formattedStartTime = `${startHour}:${startMinute} ${startPeriod}`;
    const formattedEndTime = `${endHour}:${endMinute} ${endPeriod}`;

    onSave({
      teacherId: initialSchedule?.teacherId || currentTeacher?.id || 't-' + Date.now(),
      teacherName: teacherName.trim(),
      course: course.trim(),
      dayOfWeek,
      startTime: formattedStartTime,
      endTime: formattedEndTime,
      grade: grade.trim() || undefined,
      section: section.trim() || undefined,
      notes: notes.trim() || undefined,
      color,
    });
    onClose();
  };

  return (
    <div
      id="schedule-modal-overlay"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="schedule-modal-content"
        className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 bg-linear-to-r from-indigo-50/70 via-white to-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {initialSchedule ? 'Editar Horario de Clase' : 'Publicar Horario de Clase'}
              </h2>
              <p className="text-xs text-slate-500">
                Solo el docente que crea el horario puede modificarlo posteriormente
              </p>
            </div>
          </div>
          <button
            id="close-schedule-modal-button"
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Warning if not creator */}
        {!isCreator && (
          <div className="px-5 py-3 bg-amber-50 border-b border-amber-200 flex items-center gap-2 text-xs text-amber-800">
            <Lock className="w-4 h-4 shrink-0 text-amber-600" />
            <span>
              Este horario pertenece al docente <strong>{initialSchedule?.teacherName}</strong>. Solo quien creó el horario puede modificarlo.
            </span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          {error && (
            <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-2">
              <span className="font-semibold">{error}</span>
            </div>
          )}

          {/* Teacher Name */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Nombre del Docente *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                id="schedule-teacher-input"
                type="text"
                required
                disabled={!isCreator}
                value={teacherName}
                onChange={(e) => {
                  setTeacherName(e.target.value);
                  setError(null);
                }}
                placeholder="Ej: Prof. Carlos Mendoza"
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 focus:bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-900 font-medium disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          {/* Course - Free text field editable by user */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Curso / Asignatura *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <BookOpen className="w-4 h-4" />
              </div>
              <input
                id="schedule-course-input"
                type="text"
                required
                disabled={!isCreator}
                value={course}
                onChange={(e) => {
                  setCourse(e.target.value);
                  setError(null);
                }}
                placeholder="Escribe el curso (ej: Matemáticas, Biología, Robótica, etc.)"
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 focus:bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-900 font-medium disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Puedes escribir y editar libremente el nombre de cualquier asignatura.
            </p>
          </div>

          {/* Day of week */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Día de la Semana *
            </label>
            <select
              id="schedule-day-select"
              disabled={!isCreator}
              value={dayOfWeek}
              onChange={(e) => setDayOfWeek(e.target.value as DayOfWeek)}
              className="w-full px-3 py-2 text-sm bg-slate-50 focus:bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-900 cursor-pointer font-medium disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {DAYS.map((day) => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
            </select>
          </div>

          {/* 12-Hour AM/PM Time pickers (Hora con formato AM y PM) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 bg-slate-50 border border-slate-200 rounded-xl">
            {/* Start Time */}
            <div>
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1 mb-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-600" />
                <span>Hora de Inicio (Formato AM/PM) *</span>
              </label>
              <div className="flex items-center gap-1.5">
                {/* Hour */}
                <select
                  disabled={!isCreator}
                  value={startHour}
                  onChange={(e) => setStartHour(e.target.value)}
                  className="flex-1 py-1.5 px-2 text-xs font-semibold bg-white border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:opacity-60 cursor-pointer"
                >
                  {HOURS_12.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
                <span className="text-slate-400 font-bold">:</span>
                {/* Minute */}
                <select
                  disabled={!isCreator}
                  value={startMinute}
                  onChange={(e) => setStartMinute(e.target.value)}
                  className="flex-1 py-1.5 px-2 text-xs font-semibold bg-white border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:opacity-60 cursor-pointer"
                >
                  {MINUTES.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
                {/* AM/PM */}
                <div className="flex rounded-lg border border-slate-200 bg-white overflow-hidden p-0.5">
                  <button
                    type="button"
                    disabled={!isCreator}
                    onClick={() => setStartPeriod('AM')}
                    className={`px-2 py-1 text-[11px] font-bold rounded transition-colors ${
                      startPeriod === 'AM'
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    AM
                  </button>
                  <button
                    type="button"
                    disabled={!isCreator}
                    onClick={() => setStartPeriod('PM')}
                    className={`px-2 py-1 text-[11px] font-bold rounded transition-colors ${
                      startPeriod === 'PM'
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    PM
                  </button>
                </div>
              </div>
            </div>

            {/* End Time */}
            <div>
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1 mb-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-600" />
                <span>Hora de Fin (Formato AM/PM) *</span>
              </label>
              <div className="flex items-center gap-1.5">
                {/* Hour */}
                <select
                  disabled={!isCreator}
                  value={endHour}
                  onChange={(e) => setEndHour(e.target.value)}
                  className="flex-1 py-1.5 px-2 text-xs font-semibold bg-white border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:opacity-60 cursor-pointer"
                >
                  {HOURS_12.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
                <span className="text-slate-400 font-bold">:</span>
                {/* Minute */}
                <select
                  disabled={!isCreator}
                  value={endMinute}
                  onChange={(e) => setEndMinute(e.target.value)}
                  className="flex-1 py-1.5 px-2 text-xs font-semibold bg-white border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:opacity-60 cursor-pointer"
                >
                  {MINUTES.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
                {/* AM/PM */}
                <div className="flex rounded-lg border border-slate-200 bg-white overflow-hidden p-0.5">
                  <button
                    type="button"
                    disabled={!isCreator}
                    onClick={() => setEndPeriod('AM')}
                    className={`px-2 py-1 text-[11px] font-bold rounded transition-colors ${
                      endPeriod === 'AM'
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    AM
                  </button>
                  <button
                    type="button"
                    disabled={!isCreator}
                    onClick={() => setEndPeriod('PM')}
                    className={`px-2 py-1 text-[11px] font-bold rounded transition-colors ${
                      endPeriod === 'PM'
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    PM
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Grade (Secundaria) and Section (A, B, C, D) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Grado (Secundaria)
              </label>
              <select
                disabled={!isCreator}
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 cursor-pointer disabled:opacity-60"
              >
                {GRADES.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Sección (Hasta letra D)
              </label>
              <select
                disabled={!isCreator}
                value={section}
                onChange={(e) => setSection(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 cursor-pointer disabled:opacity-60"
              >
                {SECTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Color tag */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">
              Color de Identificación
            </label>
            <div className="flex flex-wrap gap-2">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  disabled={!isCreator}
                  onClick={() => setColor(c.id)}
                  className={`px-2.5 py-1 text-xs rounded-md border font-medium transition-all ${c.bg} ${c.border} ${c.text} ${
                    color === c.id ? 'ring-2 ring-indigo-500 ring-offset-1 font-bold' : 'opacity-70 hover:opacity-100'
                  } disabled:opacity-50`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Notas u Observaciones (Opcional)
            </label>
            <textarea
              rows={2}
              disabled={!isCreator}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej: Traer guías de clase, materiales de laboratorio, etc."
              className="w-full px-3 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800 resize-none disabled:opacity-60"
            ></textarea>
          </div>

          {/* Footer Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
            {initialSchedule && onDelete && isCreator ? (
              <button
                id="delete-schedule-button"
                type="button"
                onClick={() => {
                  if (confirm(`¿Eliminar la clase de ${initialSchedule.course} del ${initialSchedule.dayOfWeek}?`)) {
                    onDelete(initialSchedule.id);
                    onClose();
                  }
                }}
                className="px-3 py-2 text-xs font-semibold text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Eliminar Clase</span>
              </button>
            ) : (
              <div></div>
            )}

            <div className="flex items-center gap-2">
              <button
                id="cancel-schedule-button"
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
              >
                {isCreator ? 'Cancelar' : 'Cerrar'}
              </button>
              {isCreator && (
                <button
                  id="save-schedule-button"
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{initialSchedule ? 'Guardar Cambios' : 'Publicar Horario'}</span>
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
