export type TeacherRole = 'regular' | 'authorized' | 'director';

export interface Teacher {
  id: string;
  name: string;
  username: string;
  password?: string;
  email?: string;
  dni?: string;
  birthDate?: string;
  phone?: string;
  courseAssigned?: string;
  role: TeacherRole;
  roleLabel: string;
  specialty: string;
  avatar: string;
  pin?: string;
  createdAt?: string;
}

export type DocumentFormat = 'pdf' | 'docx' | 'xlsx' | 'pptx' | 'image' | 'exam' | 'txt';

export interface Course {
  id: string;
  name: string;
  code: string;
  color: string;
}

export type SmartFolderId = 
  | 'all' 
  | 'curriculum' 
  | 'exams' 
  | 'records' 
  | 'materials' 
  | 'recent' 
  | 'favorites'
  | string;

export interface StorageFolder {
  id: string;
  name: string;
  description?: string;
  color?: 'blue' | 'sky' | 'gold' | 'indigo' | 'emerald' | string;
  icon?: string;
  creatorTeacherId: string;
  creatorTeacherName: string;
  createdAt: string;
  updatedAt?: string;
}

export interface SmartFolder {
  id: SmartFolderId;
  title: string;
  description: string;
  icon: string;
  color: string;
  customFilter?: {
    course?: string;
    grade?: string;
    section?: string;
    format?: DocumentFormat;
  };
}

export interface SchoolDocument {
  id: string;
  title: string;
  fileName: string;
  format: DocumentFormat;
  fileSize: string;
  course: string;
  grade: string;
  section: string;
  authorTeacherId: string;
  authorTeacherName: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  description: string;
  contentSummary: string;
  previewSnippet: string;
  fileDataUrl?: string;
  isFavorite?: boolean;
  smartCategory: 'curriculum' | 'exam' | 'record' | 'material' | 'administrative' | 'other';
  syncStatus: 'synced' | 'pending' | 'syncing';
  folderId?: string;
  folderName?: string;
  isSensitive?: boolean;
  sensitiveReason?: string;
  recipientTeacherId?: string;
  recipientTeacherName?: string;
  isDirectMessage?: boolean;
  messageNotes?: string;
}

export interface FilterCriteria {
  searchQuery: string;
  course: string;
  grade: string;
  section: string;
  format: string;
  dateRange: 'all' | 'today' | 'week' | 'month' | 'quarter' | 'custom';
  startDate?: string;
  endDate?: string;
  smartFolderId: SmartFolderId;
  storageFolderId?: string;
  onlyFavorites: boolean;
  authorTeacherId: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  teacherId: string;
  teacherName: string;
  teacherRole: TeacherRole;
  action: 'view' | 'edit' | 'delete' | 'toggle_sensitive' | 'download' | 'denied_view' | 'denied_edit';
  documentId: string;
  documentTitle: string;
  details: string;
}

export interface CloudSyncLog {
  id: string;
  timestamp: string;
  type: 'auto' | 'manual' | 'restore';
  status: 'success' | 'error' | 'pending';
  documentsCount: number;
  message: string;
  latencyMs: number;
}

export type DayOfWeek = 'Lunes' | 'Martes' | 'Miércoles' | 'Jueves' | 'Viernes' | 'Sábado';

export interface ScheduleEntry {
  id: string;
  teacherId: string;
  teacherName: string;
  course: string;
  dayOfWeek: DayOfWeek;
  startTime: string; // ej: "08:00 AM"
  endTime: string;   // ej: "09:30 AM"
  grade?: string;    // ej: "1° Secundaria"
  section?: string;  // ej: "Sección A"
  notes?: string;    // Observaciones o notas adicionales
  color?: string;    // Color distintivo
  createdAt: string;
  updatedAt: string;
}
