import React, { useState } from 'react';
import {
  ShieldAlert,
  Users,
  FolderArchive,
  Download,
  Trash2,
  Eye,
  Search,
  BookOpen,
  Phone,
  Calendar,
  CreditCard,
  UserCheck,
  Building2,
  FileText,
  Clock,
  GraduationCap,
  Sparkles,
  AlertTriangle,
  X,
  CheckCircle2,
  FileSpreadsheet,
  FileDown,
  MessageSquare,
  Plus,
  Edit
} from 'lucide-react';
import { Teacher, SchoolDocument, ScheduleEntry } from '../types';
import { formatFullDateTime12h, downloadSchoolDocument, getCourseColor } from '../utils/formatters';
import { GRADES, SECTIONS } from '../data/initialData';
import { SendFileModal } from './SendFileModal';

interface AdminPanelProps {
  teachers: Teacher[];
  documents: SchoolDocument[];
  schedules: ScheduleEntry[];
  onDeleteTeacher: (teacherId: string) => void;
  onPreviewDocument: (doc: SchoolDocument) => void;
  onDeleteSchedule?: (scheduleId: string) => void;
  onEditSchedule?: (schedule: ScheduleEntry) => void;
  onAddSchedule?: () => void;
  onSendFileToTeacher?: (docData: Omit<SchoolDocument, 'id' | 'createdAt' | 'updatedAt' | 'syncStatus'>) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  teachers,
  documents,
  schedules,
  onDeleteTeacher,
  onPreviewDocument,
  onDeleteSchedule,
  onEditSchedule,
  onAddSchedule,
  onSendFileToTeacher,
}) => {
  const [activeTab, setActiveTab] = useState<'teachers' | 'files' | 'schedules'>('teachers');
  const [selectedTeacherForProfile, setSelectedTeacherForProfile] = useState<Teacher | null>(null);
  const [selectedTeacherForMessage, setSelectedTeacherForMessage] = useState<Teacher | null>(null);
  const [messageToast, setMessageToast] = useState<string | null>(null);
  const [searchTeacher, setSearchTeacher] = useState('');
  const [searchFile, setSearchFile] = useState('');
  const [selectedCourseFilter, setSelectedCourseFilter] = useState('');
  const [selectedTeacherFilter, setSelectedTeacherFilter] = useState('');
  const [searchSchedule, setSearchSchedule] = useState('');
  const [selectedDayFilter, setSelectedDayFilter] = useState('');
  const [selectedGradeFilter, setSelectedGradeFilter] = useState('');
  const [selectedSectionFilter, setSelectedSectionFilter] = useState('');

  // Filter teachers (exclude admin herself from delete list)
  const regularTeachers = teachers.filter((t) => t.id !== 'admin-directora' && t.username.toLowerCase() !== 'directora');
  const filteredTeachers = regularTeachers.filter(
    (t) =>
      t.name.toLowerCase().includes(searchTeacher.toLowerCase()) ||
      t.username.toLowerCase().includes(searchTeacher.toLowerCase()) ||
      (t.dni && t.dni.includes(searchTeacher)) ||
      (t.courseAssigned && t.courseAssigned.toLowerCase().includes(searchTeacher.toLowerCase())) ||
      (t.specialty && t.specialty.toLowerCase().includes(searchTeacher.toLowerCase()))
  );

  // Filter documents
  const filteredDocuments = documents.filter((doc) => {
    const matchSearch =
      doc.title.toLowerCase().includes(searchFile.toLowerCase()) ||
      doc.fileName.toLowerCase().includes(searchFile.toLowerCase()) ||
      doc.authorTeacherName.toLowerCase().includes(searchFile.toLowerCase()) ||
      doc.course.toLowerCase().includes(searchFile.toLowerCase());

    const matchCourse = selectedCourseFilter ? doc.course === selectedCourseFilter : true;
    const matchTeacher = selectedTeacherFilter ? doc.authorTeacherName === selectedTeacherFilter : true;

    return matchSearch && matchCourse && matchTeacher;
  });

  const uniqueCourses = Array.from(new Set(documents.map((d) => d.course).filter(Boolean)));
  const uniqueAuthors = Array.from(new Set(documents.map((d) => d.authorTeacherName).filter(Boolean)));

  // Filter schedules
  const filteredSchedules = schedules.filter((sch) => {
    const matchSearch =
      sch.course.toLowerCase().includes(searchSchedule.toLowerCase()) ||
      sch.teacherName.toLowerCase().includes(searchSchedule.toLowerCase()) ||
      (sch.notes && sch.notes.toLowerCase().includes(searchSchedule.toLowerCase()));
    const matchDay = selectedDayFilter ? sch.dayOfWeek === selectedDayFilter : true;
    const matchGrade = selectedGradeFilter ? sch.grade === selectedGradeFilter : true;
    const matchSection = selectedSectionFilter ? sch.section === selectedSectionFilter : true;
    return matchSearch && matchDay && matchGrade && matchSection;
  });

  const handleDownloadAllTeacherDocs = (teacherName: string) => {
    const teacherDocs = documents.filter(
      (d) => d.authorTeacherName.toLowerCase() === teacherName.toLowerCase()
    );
    if (teacherDocs.length === 0) {
      alert(`El docente ${teacherName} no tiene archivos para descargar.`);
      return;
    }
    teacherDocs.forEach((doc, idx) => {
      setTimeout(() => downloadSchoolDocument(doc), idx * 250);
    });
  };

  return (
    <div id="admin-panel-container" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Banner Header */}
      <div className="bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 shadow-xl border border-indigo-900/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-full p-0.5 bg-gradient-to-tr from-amber-400 via-sky-300 to-amber-200 shadow-lg shadow-indigo-950/40 shrink-0 flex items-center justify-center overflow-hidden">
              <img
                src="/insignia_colegio.jpg"
                alt="Insignia I.E. Libertador Mariscal Castilla"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover rounded-full bg-white"
              />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                  Panel de Dirección y Administración
                </h1>
                <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  I.E. Libertador Mariscal Castilla
                </span>
              </div>
              <p className="text-xs sm:text-sm text-indigo-200 mt-0.5">
                Oxapampa • Control centralizado de cuentas docentes, perfiles personales, cursos y archivos institucionales.
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3">
            <div className="px-3.5 py-2 rounded-xl bg-white/10 backdrop-blur-xs border border-white/10 text-center">
              <div className="text-lg font-bold text-white leading-none">{regularTeachers.length}</div>
              <div className="text-[10px] text-indigo-200 mt-1 uppercase tracking-wider font-semibold">Docentes</div>
            </div>
            <div className="px-3.5 py-2 rounded-xl bg-white/10 backdrop-blur-xs border border-white/10 text-center">
              <div className="text-lg font-bold text-white leading-none">{documents.length}</div>
              <div className="text-[10px] text-indigo-200 mt-1 uppercase tracking-wider font-semibold">Archivos</div>
            </div>
            <div className="px-3.5 py-2 rounded-xl bg-white/10 backdrop-blur-xs border border-white/10 text-center">
              <div className="text-lg font-bold text-white leading-none">{schedules.length}</div>
              <div className="text-[10px] text-indigo-200 mt-1 uppercase tracking-wider font-semibold">Horarios</div>
            </div>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex gap-2 mt-6 pt-4 border-t border-indigo-800/60">
          <button
            type="button"
            onClick={() => setActiveTab('teachers')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'teachers'
                ? 'bg-white text-indigo-950 shadow-md font-bold'
                : 'text-indigo-200 hover:text-white hover:bg-white/10'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Gestión de Cuentas y Perfiles Docentes ({regularTeachers.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('files')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'files'
                ? 'bg-white text-indigo-950 shadow-md font-bold'
                : 'text-indigo-200 hover:text-white hover:bg-white/10'
            }`}
          >
            <FolderArchive className="w-4 h-4" />
            <span>Repositorio de Archivos y Descargas ({documents.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('schedules')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'schedules'
                ? 'bg-white text-indigo-950 shadow-md font-bold'
                : 'text-indigo-200 hover:text-white hover:bg-white/10'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Gestión de Horarios ({schedules.length})</span>
          </button>
        </div>
      </div>

      {/* TAB 1: TEACHER MANAGEMENT & PROFILES */}
      {activeTab === 'teachers' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Search bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="relative w-full sm:max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTeacher}
                onChange={(e) => setSearchTeacher(e.target.value)}
                placeholder="Buscar docente por nombre, usuario, DNI o curso..."
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 focus:bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
            <div className="text-xs text-slate-500 font-medium">
              Mostrando {filteredTeachers.length} de {regularTeachers.length} docentes registrados
            </div>
          </div>

          {/* Teacher Cards Grid */}
          {filteredTeachers.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-700">No se encontraron docentes</h3>
              <p className="text-xs text-slate-400 mt-1">
                {regularTeachers.length === 0
                  ? 'No hay docentes registrados todavía. Los nuevos docentes pueden registrarse desde la pantalla de bienvenida.'
                  : 'Ningún docente coincide con el término de búsqueda.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTeachers.map((teacher) => {
                const teacherDocs = documents.filter(
                  (d) =>
                    d.authorTeacherId === teacher.id ||
                    d.authorTeacherName.toLowerCase() === teacher.name.toLowerCase() ||
                    d.authorTeacherName.toLowerCase() === teacher.username.toLowerCase()
                );
                const teacherSchedules = schedules.filter(
                  (s) =>
                    s.teacherId === teacher.id ||
                    s.teacherName.toLowerCase() === teacher.name.toLowerCase() ||
                    s.teacherName.toLowerCase() === teacher.username.toLowerCase()
                );

                return (
                  <div
                    key={teacher.id}
                    className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between"
                  >
                    <div>
                      {/* Header with Avatar & User */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={teacher.avatar}
                            alt={teacher.name}
                            className="w-12 h-12 rounded-xl object-cover border border-slate-200 bg-slate-100 shrink-0"
                          />
                          <div>
                            <h3 className="text-sm font-bold text-slate-900 leading-snug">
                              {teacher.name}
                            </h3>
                            <span className="text-xs text-indigo-600 font-semibold font-mono">
                              @{teacher.username}
                            </span>
                          </div>
                        </div>

                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                          {teacher.roleLabel || 'Docente'}
                        </span>
                      </div>

                      {/* Profile details */}
                      <div className="space-y-2 p-3 bg-slate-50/80 rounded-xl border border-slate-200/70 text-xs text-slate-700 mb-4">
                        {/* Course Assigned */}
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                          <span className="text-slate-500 font-medium">Curso a cargo:</span>
                          <span className="font-bold text-slate-900 truncate">
                            {teacher.courseAssigned || teacher.specialty || 'No especificado'}
                          </span>
                        </div>

                        {/* DNI */}
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                          <span className="text-slate-500 font-medium">DNI:</span>
                          <span className="font-semibold font-mono text-slate-800">
                            {teacher.dni || 'Sin registrar'}
                          </span>
                        </div>

                        {/* Birth Date */}
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                          <span className="text-slate-500 font-medium">Nacimiento:</span>
                          <span className="font-medium text-slate-800">
                            {teacher.birthDate || 'Sin registrar'}
                          </span>
                        </div>

                        {/* Phone */}
                        <div className="flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                          <span className="text-slate-500 font-medium">Celular:</span>
                          <span className="font-semibold text-slate-800">
                            {teacher.phone ? (
                              <a
                                href={`tel:${teacher.phone}`}
                                className="text-indigo-600 hover:underline"
                              >
                                {teacher.phone}
                              </a>
                            ) : (
                              'Sin registrar'
                            )}
                          </span>
                        </div>
                      </div>

                      {/* Content metrics */}
                      <div className="grid grid-cols-2 gap-2 mb-4">
                        <div className="p-2 bg-indigo-50/50 rounded-lg text-center border border-indigo-100">
                          <div className="text-base font-bold text-indigo-900 leading-tight">
                            {teacherDocs.length}
                          </div>
                          <div className="text-[10px] text-indigo-600 font-medium">Archivos subidos</div>
                        </div>
                        <div className="p-2 bg-amber-50/50 rounded-lg text-center border border-amber-100">
                          <div className="text-base font-bold text-amber-900 leading-tight">
                            {teacherSchedules.length}
                          </div>
                          <div className="text-[10px] text-amber-700 font-medium">Clases en horario</div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedTeacherForProfile(teacher)}
                        className="px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors flex items-center gap-1.5"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Ver Perfil</span>
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setSelectedTeacherForMessage(teacher)}
                          className="px-2.5 py-1.5 text-xs font-semibold text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                          title={`Enviar archivo o documento a ${teacher.name}`}
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Enviar Archivo</span>
                        </button>

                        {teacherDocs.length > 0 && (
                          <button
                            type="button"
                            onClick={() => handleDownloadAllTeacherDocs(teacher.name)}
                            className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Descargar todos los archivos de este docente"
                          >
                            <FileDown className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            if (
                              confirm(
                                `¿Está segura de que desea eliminar permanentemente la cuenta del docente "${teacher.name}" (@${teacher.username}) del sistema escolar? Esta acción solo puede realizarla la Dirección.`
                              )
                            ) {
                              onDeleteTeacher(teacher.id);
                            }
                          }}
                          className="px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-1"
                          title="Eliminar cuenta permanentemente (Solo Dirección)"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Eliminar</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ONLY FILES & DOWNLOADS REPOSITORY */}
      {activeTab === 'files' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* File filters & search */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchFile}
                onChange={(e) => setSearchFile(e.target.value)}
                placeholder="Buscar archivos institucionales..."
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 focus:bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            {/* Course Filter */}
            <select
              value={selectedCourseFilter}
              onChange={(e) => setSelectedCourseFilter(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer font-medium"
            >
              <option value="">Todos los cursos ({uniqueCourses.length})</option>
              {uniqueCourses.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            {/* Teacher Filter */}
            <select
              value={selectedTeacherFilter}
              onChange={(e) => setSelectedTeacherFilter(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer font-medium"
            >
              <option value="">Todos los docentes ({uniqueAuthors.length})</option>
              {uniqueAuthors.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>

          {/* Files List Table */}
          {filteredDocuments.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <FolderArchive className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-700">No se encontraron archivos</h3>
              <p className="text-xs text-slate-400 mt-1">
                No hay documentos que coincidan con los filtros aplicados.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between text-xs font-bold text-slate-700">
                <span>Listado Completo de Archivos ({filteredDocuments.length})</span>
                <span className="text-[11px] text-slate-500 font-normal">
                  Permite previsualizar y descargar cualquier documento institucional
                </span>
              </div>

              <div className="divide-y divide-slate-100">
                {filteredDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-4 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200/60 flex items-center justify-center shrink-0 mt-0.5">
                        <FileText className="w-5 h-5" />
                      </div>

                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-slate-900 truncate">
                          {doc.title}
                        </h4>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 mt-1">
                          <span className="font-semibold text-slate-700">{doc.authorTeacherName}</span>
                          <span>•</span>
                          <span className="text-indigo-600 font-medium">{doc.course}</span>
                          <span>•</span>
                          <span>{[doc.grade, doc.section].filter(Boolean).join(' ')}</span>
                          <span>•</span>
                          <span className="font-mono text-[11px]">{doc.fileSize}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>Subido: {formatFullDateTime12h(doc.createdAt)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      <button
                        type="button"
                        onClick={() => onPreviewDocument(doc)}
                        className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-indigo-700 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1.5 border border-slate-200"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Ver Archivo</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => downloadSchoolDocument(doc)}
                        className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Descargar</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: SCHEDULE MANAGEMENT (HORARIOS) */}
      {activeTab === 'schedules' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Controls & Filter Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchSchedule}
                onChange={(e) => setSearchSchedule(e.target.value)}
                placeholder="Buscar por curso, docente o notas..."
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 focus:bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            {/* Filter by Day */}
            <select
              value={selectedDayFilter}
              onChange={(e) => setSelectedDayFilter(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer font-medium"
            >
              <option value="">Todos los días</option>
              {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'].map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>

            {/* Filter by Grade */}
            <select
              value={selectedGradeFilter}
              onChange={(e) => setSelectedGradeFilter(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer font-medium"
            >
              <option value="">Todos los grados</option>
              {GRADES.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>

            {/* Filter by Section */}
            <select
              value={selectedSectionFilter}
              onChange={(e) => setSelectedSectionFilter(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer font-medium"
            >
              <option value="">Todas las secciones</option>
              {SECTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            {/* Add Schedule Button */}
            {onAddSchedule && (
              <button
                type="button"
                onClick={onAddSchedule}
                className="px-3.5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Nuevo Horario</span>
              </button>
            )}
          </div>

          {/* Schedules List */}
          {filteredSchedules.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-700">No se encontraron horarios</h3>
              <p className="text-xs text-slate-400 mt-1">
                No hay clases registradas que coincidan con los filtros aplicados.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSchedules.map((sch) => {
                const colorInfo = getCourseColor(sch.course);
                return (
                  <div
                    key={sch.id}
                    className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${colorInfo.bg} ${colorInfo.text}`}>
                          {sch.course}
                        </span>
                        <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
                          {sch.dayOfWeek}
                        </span>
                      </div>

                      {/* Time & Location */}
                      <div className="flex items-center gap-1.5 text-xs text-slate-700 font-semibold mb-2">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{sch.startTime} - {sch.endTime}</span>
                      </div>

                      {/* Grade & Section */}
                      <div className="flex items-center gap-1.5 text-xs text-slate-600 mb-2">
                        <GraduationCap className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{[sch.grade, sch.section].filter(Boolean).join(' • ')}</span>
                      </div>

                      {/* Teacher */}
                      <div className="flex items-center gap-1.5 text-xs text-slate-600 mb-2">
                        <UserCheck className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                        <span className="font-medium text-slate-800">{sch.teacherName}</span>
                      </div>

                      {sch.notes && (
                        <p className="text-[11px] text-slate-500 italic bg-slate-50 p-2 rounded-lg border border-slate-100 mb-3">
                          {sch.notes}
                        </p>
                      )}
                    </div>

                    {/* Admin Action Buttons */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2 mt-2">
                      {onEditSchedule && (
                        <button
                          type="button"
                          onClick={() => onEditSchedule(sch)}
                          className="px-2.5 py-1.5 text-xs font-semibold text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                          title="Editar este horario"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>Editar</span>
                        </button>
                      )}

                      {onDeleteSchedule && (
                        <button
                          type="button"
                          onClick={() => {
                            if (
                              confirm(
                                `¿Está segura de que desea eliminar la clase de "${sch.course}" (${sch.dayOfWeek} ${sch.startTime} - ${sch.endTime}) asignada a ${sch.teacherName}?`
                              )
                            ) {
                              onDeleteSchedule(sch.id);
                            }
                          }}
                          className="px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                          title="Eliminar este horario"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Eliminar</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* FULL TEACHER PROFILE MODAL */}
      {selectedTeacherForProfile && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedTeacherForProfile(null);
          }}
        >
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 bg-linear-to-r from-indigo-50/80 via-white to-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={selectedTeacherForProfile.avatar}
                  alt={selectedTeacherForProfile.name}
                  className="w-12 h-12 rounded-xl object-cover border border-slate-200 bg-slate-100"
                />
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {selectedTeacherForProfile.name}
                  </h3>
                  <p className="text-xs text-indigo-600 font-mono font-semibold">
                    @{selectedTeacherForProfile.username} • {selectedTeacherForProfile.roleLabel}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTeacherForProfile(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Personal Data Grid */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Datos Personales del Docente
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                    <span className="text-[11px] text-slate-400 block font-medium">Curso a Cargo</span>
                    <span className="text-sm font-bold text-indigo-900">
                      {selectedTeacherForProfile.courseAssigned || selectedTeacherForProfile.specialty || 'General'}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                    <span className="text-[11px] text-slate-400 block font-medium">Documento Nacional (DNI)</span>
                    <span className="text-sm font-bold text-slate-800 font-mono">
                      {selectedTeacherForProfile.dni || 'No registrado'}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                    <span className="text-[11px] text-slate-400 block font-medium">Fecha de Nacimiento</span>
                    <span className="text-sm font-bold text-slate-800">
                      {selectedTeacherForProfile.birthDate || 'No registrado'}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                    <span className="text-[11px] text-slate-400 block font-medium">Número de Celular</span>
                    <span className="text-sm font-bold text-slate-800">
                      {selectedTeacherForProfile.phone || 'No registrado'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Uploaded Documents List */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Archivos Subidos por este Docente
                  </h4>
                  {documents.filter(
                    (d) =>
                      d.authorTeacherId === selectedTeacherForProfile.id ||
                      d.authorTeacherName.toLowerCase() === selectedTeacherForProfile.name.toLowerCase()
                  ).length > 0 && (
                    <button
                      type="button"
                      onClick={() => handleDownloadAllTeacherDocs(selectedTeacherForProfile.name)}
                      className="text-xs font-semibold text-emerald-600 hover:text-emerald-800 flex items-center gap-1 hover:underline"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Descargar Todos</span>
                    </button>
                  )}
                </div>

                {documents.filter(
                  (d) =>
                    d.authorTeacherId === selectedTeacherForProfile.id ||
                    d.authorTeacherName.toLowerCase() === selectedTeacherForProfile.name.toLowerCase()
                ).length === 0 ? (
                  <div className="p-6 text-center bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-400">
                    Este docente no ha subido ningún documento escolar todavía.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {documents
                      .filter(
                        (d) =>
                          d.authorTeacherId === selectedTeacherForProfile.id ||
                          d.authorTeacherName.toLowerCase() === selectedTeacherForProfile.name.toLowerCase()
                      )
                      .map((doc) => (
                        <div
                          key={doc.id}
                          className="p-3 bg-slate-50 hover:bg-indigo-50/40 rounded-xl border border-slate-200 flex items-center justify-between gap-3 transition-colors"
                        >
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-slate-900 truncate">
                              {doc.title}
                            </div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                              <span>{doc.course}</span>
                              <span>•</span>
                              <span>{doc.fileSize}</span>
                              <span>•</span>
                              <span className="font-mono text-[10px]">
                                {formatFullDateTime12h(doc.createdAt)}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedTeacherForProfile(null);
                                onPreviewDocument(doc);
                              }}
                              className="p-1.5 text-slate-600 hover:text-indigo-600 rounded-lg hover:bg-white transition-colors"
                              title="Ver archivo"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => downloadSchoolDocument(doc)}
                              className="p-1.5 text-slate-600 hover:text-emerald-600 rounded-lg hover:bg-white transition-colors"
                              title="Descargar archivo"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => {
                  if (
                    confirm(
                      `¿Eliminar la cuenta del docente ${selectedTeacherForProfile.name}?`
                    )
                  ) {
                    onDeleteTeacher(selectedTeacherForProfile.id);
                    setSelectedTeacherForProfile(null);
                  }
                }}
                className="px-3 py-2 text-xs font-semibold text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Eliminar Cuenta</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const target = selectedTeacherForProfile;
                    setSelectedTeacherForProfile(null);
                    setSelectedTeacherForMessage(target);
                  }}
                  className="px-3 py-2 text-xs font-bold text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Enviar Archivo</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedTeacherForProfile(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  Cerrar Perfil
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SEND FILE MODAL */}
      {selectedTeacherForMessage && (
        <SendFileModal
          recipientTeacher={selectedTeacherForMessage}
          onClose={() => setSelectedTeacherForMessage(null)}
          onSend={(docData) => {
            if (onSendFileToTeacher) {
              onSendFileToTeacher(docData);
            }
            const teacherName = selectedTeacherForMessage.name;
            setSelectedTeacherForMessage(null);
            setMessageToast(`Archivo enviado con éxito a ${teacherName}`);
            setTimeout(() => setMessageToast(null), 4500);
          }}
        />
      )}

      {/* TOAST NOTIFICATION BANNER */}
      {messageToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-xs font-bold animate-in fade-in slide-in-from-bottom-5 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-200 shrink-0" />
          <span>{messageToast}</span>
          <button
            type="button"
            onClick={() => setMessageToast(null)}
            className="p-1 hover:bg-emerald-700 rounded-md text-emerald-200 hover:text-white cursor-pointer ml-2"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
