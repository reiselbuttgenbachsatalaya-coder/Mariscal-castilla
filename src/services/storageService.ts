import {
  SchoolDocument,
  Teacher,
  AuditLog,
  CloudSyncLog,
  SmartFolder,
  ScheduleEntry,
  StorageFolder
} from '../types';
import {
  INITIAL_DOCUMENTS,
  INITIAL_TEACHERS,
  INITIAL_AUDIT_LOGS,
  SYSTEM_SMART_FOLDERS,
  INITIAL_SCHEDULES,
  INITIAL_STORAGE_FOLDERS
} from '../data/initialData';

const KEYS = {
  DOCUMENTS: 'docudocente_documents_v1',
  DELETED_DOCUMENT_IDS: 'docudocente_deleted_document_ids_v1',
  TEACHERS: 'docudocente_teachers_v2',
  TEACHERS_BACKUP: 'docudocente_teachers_backup_v2',
  DELETED_TEACHER_IDS: 'docudocente_deleted_teacher_ids_v1',
  ACTIVE_TEACHER: 'docudocente_active_teacher_v2',
  AUDIT_LOGS: 'docudocente_audit_logs_v1',
  SYNC_LOGS: 'docudocente_sync_logs_v1',
  CUSTOM_FOLDERS: 'docudocente_custom_folders_v1',
  STORAGE_FOLDERS: 'docudocente_storage_folders_v1',
  DELETED_FOLDER_IDS: 'docudocente_deleted_folder_ids_v1',
  LAST_SYNC: 'docudocente_last_sync_v1',
  IS_OFFLINE: 'docudocente_is_offline_v1',
  SCHEDULES: 'docudocente_schedules_v1',
  DELETED_SCHEDULE_IDS: 'docudocente_deleted_schedule_ids_v1',
  DISMISSED_SWITCHER_IDS: 'docudocente_dismissed_switcher_v1',
};

// Resilient in-memory fallback for sandboxed iframes (e.g. Google Apps Script / third-party iframe blocks)
const memoryStore = new Map<string, string>();
const safeLocalStorage = {
  getItem: (key: string): string | null => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const val = window.localStorage.getItem(key);
        if (val !== null) return val;
      }
    } catch {}
    return memoryStore.get(key) ?? null;
  },
  setItem: (key: string, value: string): void => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
      }
    } catch {}
    memoryStore.set(key, value);
  },
  removeItem: (key: string): void => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      }
    } catch {}
    memoryStore.delete(key);
  },
  clear: (): void => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.clear();
      }
    } catch {}
    memoryStore.clear();
  }
};
const localStorage = safeLocalStorage;

class StorageService {
  private isOfflineMode: boolean = false;

  constructor() {
    this.init();
  }

  getDeletedTeacherIds(): string[] {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(KEYS.DELETED_TEACHER_IDS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  addDeletedTeacherId(id: string): void {
    if (typeof window === 'undefined' || !id) return;
    try {
      const list = this.getDeletedTeacherIds();
      if (!list.includes(id)) {
        list.push(id);
        localStorage.setItem(KEYS.DELETED_TEACHER_IDS, JSON.stringify(list));
      }
    } catch {}
  }

  removeDeletedTeacherId(id: string): void {
    if (typeof window === 'undefined' || !id) return;
    try {
      const list = this.getDeletedTeacherIds().filter(dId => dId !== id);
      localStorage.setItem(KEYS.DELETED_TEACHER_IDS, JSON.stringify(list));
    } catch {}
  }

  getDeletedDocumentIds(): string[] {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(KEYS.DELETED_DOCUMENT_IDS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  addDeletedDocumentId(id: string): void {
    if (typeof window === 'undefined' || !id) return;
    try {
      const list = this.getDeletedDocumentIds();
      if (!list.includes(id)) {
        list.push(id);
        localStorage.setItem(KEYS.DELETED_DOCUMENT_IDS, JSON.stringify(list));
      }
    } catch {}
  }

  removeDeletedDocumentId(id: string): void {
    if (typeof window === 'undefined' || !id) return;
    try {
      const list = this.getDeletedDocumentIds().filter(dId => dId !== id);
      localStorage.setItem(KEYS.DELETED_DOCUMENT_IDS, JSON.stringify(list));
    } catch {}
  }

  getDeletedScheduleIds(): string[] {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(KEYS.DELETED_SCHEDULE_IDS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  addDeletedScheduleId(id: string): void {
    if (typeof window === 'undefined' || !id) return;
    try {
      const list = this.getDeletedScheduleIds();
      if (!list.includes(id)) {
        list.push(id);
        localStorage.setItem(KEYS.DELETED_SCHEDULE_IDS, JSON.stringify(list));
      }
    } catch {}
  }

  removeDeletedScheduleId(id: string): void {
    if (typeof window === 'undefined' || !id) return;
    try {
      const list = this.getDeletedScheduleIds().filter(dId => dId !== id);
      localStorage.setItem(KEYS.DELETED_SCHEDULE_IDS, JSON.stringify(list));
    } catch {}
  }

  getDeletedFolderIds(): string[] {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(KEYS.DELETED_FOLDER_IDS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  addDeletedFolderId(id: string): void {
    if (typeof window === 'undefined' || !id) return;
    try {
      const list = this.getDeletedFolderIds();
      if (!list.includes(id)) {
        list.push(id);
        localStorage.setItem(KEYS.DELETED_FOLDER_IDS, JSON.stringify(list));
      }
    } catch {}
  }

  removeDeletedFolderId(id: string): void {
    if (typeof window === 'undefined' || !id) return;
    try {
      const list = this.getDeletedFolderIds().filter(dId => dId !== id);
      localStorage.setItem(KEYS.DELETED_FOLDER_IDS, JSON.stringify(list));
    } catch {}
  }

  private init() {
    if (typeof window === 'undefined') return;

    // Purge legacy v1 teacher accounts and any stale backup keys
    try {
      localStorage.removeItem('docudocente_teachers_v1');
      localStorage.removeItem('docudocente_active_teacher_v1');
      localStorage.removeItem('docudocente_active_teacher_backup_v2');
    } catch {
      // Ignore
    }

    if (!localStorage.getItem(KEYS.DOCUMENTS)) {
      localStorage.setItem(KEYS.DOCUMENTS, JSON.stringify(INITIAL_DOCUMENTS));
    } else {
      // Clean any legacy sensitive flags from existing local storage
      try {
        const stored = JSON.parse(localStorage.getItem(KEYS.DOCUMENTS) || '[]');
        let modified = false;
        const cleaned = stored.map((doc: any) => {
          if (doc.isSensitive) {
            modified = true;
            return { ...doc, isSensitive: false, sensitiveReason: undefined };
          }
          return doc;
        });
        if (modified) {
          localStorage.setItem(KEYS.DOCUMENTS, JSON.stringify(cleaned));
        }
      } catch {
        // Fallback
      }
    }

    // Clean up any persistent active teacher in localStorage so every new device/session starts at the login screen
    try {
      localStorage.removeItem(KEYS.ACTIVE_TEACHER);
      localStorage.removeItem('docudocente_active_teacher_backup_v2');
      localStorage.removeItem('docudocente_active_teacher_v1');
    } catch {}

    // Recover teachers from backup if somehow cleared, always respecting deleted teacher ids
    const deletedIds = this.getDeletedTeacherIds();
    try {
      const storedTeachers = localStorage.getItem(KEYS.TEACHERS);
      const backupTeachers = localStorage.getItem(KEYS.TEACHERS_BACKUP);
      let teachersList: Teacher[] = [];

      if (storedTeachers && storedTeachers !== '[]') {
        teachersList = JSON.parse(storedTeachers);
      } else if (backupTeachers && backupTeachers !== '[]') {
        teachersList = JSON.parse(backupTeachers);
      }

      const cleaned = teachersList.filter(t => t && t.id && !deletedIds.includes(t.id));
      localStorage.setItem(KEYS.TEACHERS, JSON.stringify(cleaned));
      localStorage.setItem(KEYS.TEACHERS_BACKUP, JSON.stringify(cleaned));
    } catch {
      if (!localStorage.getItem(KEYS.TEACHERS)) {
        localStorage.setItem(KEYS.TEACHERS, JSON.stringify([]));
        localStorage.setItem(KEYS.TEACHERS_BACKUP, JSON.stringify([]));
      }
    }

    if (!localStorage.getItem(KEYS.AUDIT_LOGS)) {
      localStorage.setItem(KEYS.AUDIT_LOGS, JSON.stringify(INITIAL_AUDIT_LOGS));
    }
    if (!localStorage.getItem(KEYS.LAST_SYNC)) {
      localStorage.setItem(KEYS.LAST_SYNC, new Date().toISOString());
    }
    if (!localStorage.getItem(KEYS.SCHEDULES)) {
      localStorage.setItem(KEYS.SCHEDULES, JSON.stringify(INITIAL_SCHEDULES));
    }
    if (!localStorage.getItem(KEYS.STORAGE_FOLDERS)) {
      localStorage.setItem(KEYS.STORAGE_FOLDERS, JSON.stringify(INITIAL_STORAGE_FOLDERS));
    }
    this.isOfflineMode = localStorage.getItem(KEYS.IS_OFFLINE) === 'true';
  }

  // TEACHERS & AUTH
  getTeachers(): Teacher[] {
    try {
      const data = localStorage.getItem(KEYS.TEACHERS);
      const list: Teacher[] = data ? JSON.parse(data) : [];
      const deletedIds = this.getDeletedTeacherIds();
      if (deletedIds.length > 0) {
        return list.filter(t => t && t.id && !deletedIds.includes(t.id));
      }
      return list;
    } catch {
      return [];
    }
  }

  getActiveTeacher(): Teacher | null {
    let activeId: string | null = null;
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        activeId = sessionStorage.getItem(KEYS.ACTIVE_TEACHER);
      }
    } catch {}

    if (!activeId) return null;

    if (activeId === 'admin-directora') {
      return {
        id: 'admin-directora',
        name: 'Directora General',
        username: 'directora',
        role: 'director',
        roleLabel: 'Directora / Administradora General',
        specialty: 'Dirección Institucional',
        courseAssigned: 'Supervisión y Dirección General',
        avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Directora&backgroundColor=4338ca',
        createdAt: '2026-01-01T00:00:00Z',
      };
    }

    const teachers = this.getTeachers();
    if (teachers.length === 0) return null;
    const found = teachers.find(t => t.id === activeId);
    return found || null;
  }

  setActiveTeacher(teacherId: string | null): Teacher | null {
    if (!teacherId) {
      try {
        if (typeof window !== 'undefined' && window.sessionStorage) {
          sessionStorage.removeItem(KEYS.ACTIVE_TEACHER);
        }
        localStorage.removeItem(KEYS.ACTIVE_TEACHER);
      } catch {}
      return null;
    }

    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        sessionStorage.setItem(KEYS.ACTIVE_TEACHER, teacherId);
      }
      // Se remueve de localStorage para que cualquier otro dispositivo o sesión pida usuario y contraseña
      localStorage.removeItem(KEYS.ACTIVE_TEACHER);
    } catch {}

    if (teacherId === 'admin-directora') {
      return {
        id: 'admin-directora',
        name: 'Directora General',
        username: 'directora',
        role: 'director',
        roleLabel: 'Directora / Administradora General',
        specialty: 'Dirección Institucional',
        courseAssigned: 'Supervisión y Dirección General',
        avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Directora&backgroundColor=4338ca',
        createdAt: '2026-01-01T00:00:00Z',
      };
    }

    const teachers = this.getTeachers();
    return teachers.find(t => t.id === teacherId) || null;
  }

  createAccount(data: {
    username?: string;
    password: string;
    name: string;
    dni?: string;
    birthDate?: string;
    phone?: string;
    courseAssigned?: string;
    specialty?: string;
    roleLabel?: string;
    avatar?: string;
  }): { success: boolean; teacher?: Teacher; error?: string } {
    const displayName = data.name?.trim();
    if (!displayName) {
      return { success: false, error: 'El nombre completo del docente es obligatorio.' };
    }
    if (!data.password || data.password.length < 4) {
      return { success: false, error: 'La contraseña debe tener al menos 4 caracteres.' };
    }

    const cleanUsername = data.username?.trim() || displayName.toLowerCase().replace(/\s+/g, '_');
    const cleanDni = data.dni?.trim() || '';

    const teachers = this.getTeachers();
    const exists = teachers.some(
      t =>
        (cleanDni && t.dni && t.dni.trim() === cleanDni) ||
        t.name.trim().toLowerCase() === displayName.toLowerCase() ||
        t.username.trim().toLowerCase() === cleanUsername.toLowerCase()
    );
    if (exists) {
      return { success: false, error: `Ya existe una cuenta registrada con este nombre o DNI.` };
    }

    // Default professional avatar with user initials/seed
    const avatar =
      data.avatar ||
      `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName)}&backgroundColor=4f46e5,0284c7,0d9488,7c3aed`;

    const newTeacher: Teacher = {
      id: `teacher-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: displayName,
      username: cleanUsername,
      password: data.password,
      dni: cleanDni,
      birthDate: data.birthDate || '',
      phone: data.phone?.trim() || '',
      courseAssigned: data.courseAssigned?.trim() || data.specialty?.trim() || 'Docente de Secundaria',
      role: 'regular',
      roleLabel: data.roleLabel || `Docente de ${data.courseAssigned || data.specialty || 'Secundaria'}`,
      specialty: data.specialty || data.courseAssigned || 'General',
      avatar,
      createdAt: new Date().toISOString(),
    };

    this.removeDeletedTeacherId(newTeacher.id);
    teachers.push(newTeacher);
    localStorage.setItem(KEYS.TEACHERS, JSON.stringify(teachers));
    localStorage.setItem(KEYS.TEACHERS_BACKUP, JSON.stringify(teachers));
    this.setActiveTeacher(newTeacher.id);

    // Save to persistent server database for cross-device access and page refresh immunity
    try {
      fetch('/api/teachers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTeacher),
      }).catch((e) => console.warn('Server sync error on createAccount:', e));
    } catch {}

    this.recordAudit({
      action: 'view',
      documentId: 'auth-create',
      documentTitle: 'Registro de Cuenta',
      details: `Cuenta creada exitosamente para ${newTeacher.name} con DNI ${newTeacher.dni || 'N/A'}.`,
    });

    return { success: true, teacher: newTeacher };
  }

  deleteTeacher(id: string): { success: boolean; error?: string } {
    if (id === 'admin-directora') {
      return { success: false, error: 'No se puede eliminar la cuenta principal de Dirección.' };
    }

    const teachers = this.getTeachers();
    const deleted = teachers.find(t => t.id === id);
    const remaining = teachers.filter(t => t.id !== id);

    // 1. Update both primary and backup teacher stores immediately
    localStorage.setItem(KEYS.TEACHERS, JSON.stringify(remaining));
    localStorage.setItem(KEYS.TEACHERS_BACKUP, JSON.stringify(remaining));

    // 2. Mark this ID as permanently deleted locally to prevent sync resurrection
    this.addDeletedTeacherId(id);

    // 3. Clear active teacher if it was the deleted one
    if (localStorage.getItem(KEYS.ACTIVE_TEACHER) === id) {
      localStorage.removeItem(KEYS.ACTIVE_TEACHER);
    }

    // 4. Remove schedules assigned to this teacher
    try {
      const schedules = this.getSchedules().filter(s => s.teacherId !== id);
      localStorage.setItem(KEYS.SCHEDULES, JSON.stringify(schedules));
    } catch {}

    // 5. Remove from dismissed switcher ids list if present
    try {
      const dismissed = this.getDismissedSwitcherTeacherIds().filter(dId => dId !== id);
      localStorage.setItem(KEYS.DISMISSED_SWITCHER_IDS, JSON.stringify(dismissed));
    } catch {}

    // 6. Sync deletion with persistent server database
    try {
      fetch(`/api/teachers/${id}`, { method: 'DELETE' }).catch(() => {});
    } catch {}

    // 7. Inform server sync endpoint about deleted teacher ids
    try {
      fetch('/api/sync-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teachers: remaining,
          deletedTeacherIds: this.getDeletedTeacherIds(),
        }),
      }).catch(() => {});
    } catch {}

    if (deleted) {
      this.recordAudit({
        action: 'delete',
        documentId: 'admin-delete-teacher',
        documentTitle: 'Eliminación de Cuenta Docente',
        details: `La Dirección eliminó permanentemente la cuenta del docente ${deleted.name} (@${deleted.username}).`,
      });
    }

    return { success: true };
  }

  getDismissedSwitcherTeacherIds(): string[] {
    if (typeof window === 'undefined') return [];
    try {
      return JSON.parse(localStorage.getItem(KEYS.DISMISSED_SWITCHER_IDS) || '[]');
    } catch {
      return [];
    }
  }

  dismissTeacherFromSwitcher(id: string): { success: boolean } {
    if (typeof window === 'undefined') return { success: true };
    const dismissed = this.getDismissedSwitcherTeacherIds();
    if (!dismissed.includes(id)) {
      dismissed.push(id);
      localStorage.setItem(KEYS.DISMISSED_SWITCHER_IDS, JSON.stringify(dismissed));
    }
    return { success: true };
  }

  restoreTeacherToSwitcher(id: string): { success: boolean } {
    if (typeof window === 'undefined') return { success: true };
    const dismissed = this.getDismissedSwitcherTeacherIds().filter(d => d !== id);
    localStorage.setItem(KEYS.DISMISSED_SWITCHER_IDS, JSON.stringify(dismissed));
    return { success: true };
  }

  async login(usernameOrName: string, password: string): Promise<{ success: boolean; teacher?: Teacher; error?: string }> {
    const cleanUser = usernameOrName.trim();
    const cleanPass = password.trim();

    // 1. Directora check (credenciales: "directora" / "200710")
    if (cleanUser.toLowerCase() === 'directora') {
      if (cleanPass === '200710') {
        const directorTeacher: Teacher = {
          id: 'admin-directora',
          name: 'Directora General',
          username: 'directora',
          role: 'director',
          roleLabel: 'Directora / Administradora General',
          specialty: 'Dirección Institucional',
          courseAssigned: 'Supervisión y Dirección General',
          avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Directora&backgroundColor=4338ca',
          createdAt: '2026-01-01T00:00:00Z',
        };
        this.setActiveTeacher('admin-directora');
        return { success: true, teacher: directorTeacher };
      } else {
        return { success: false, error: 'Contraseña de Dirección incorrecta.' };
      }
    }

    // 2. Check local storage first (by name, DNI, or username)
    let teachers = this.getTeachers();
    let found = teachers.find(
      t =>
        t.name.trim().toLowerCase() === cleanUser.toLowerCase() ||
        (t.dni && t.dni.trim() === cleanUser) ||
        t.username.trim().toLowerCase() === cleanUser.toLowerCase()
    );

    // 3. If not found locally, try authenticating with backend server (cross-device sync!)
    if (!found) {
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: cleanUser, password: cleanPass }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.teacher) {
            found = data.teacher;
            // Cache locally
            teachers.push(found!);
            localStorage.setItem(KEYS.TEACHERS, JSON.stringify(teachers));
            this.setActiveTeacher(found!.id);
            return { success: true, teacher: found };
          }
        }
      } catch (e) {
        console.warn('Backend login fallback failed:', e);
      }
    }

    if (!found) {
      return { success: false, error: 'No se encontró ninguna cuenta con ese nombre o DNI.' };
    }

    if (found.password !== cleanPass) {
      return { success: false, error: 'Contraseña incorrecta. Verifica tus datos.' };
    }

    this.setActiveTeacher(found.id);
    this.restoreTeacherToSwitcher(found.id);

    this.recordAudit({
      action: 'view',
      documentId: 'auth-login',
      documentTitle: 'Inicio de Sesión',
      details: `Inicio de sesión exitoso de ${found.name}.`,
    });

    return { success: true, teacher: found };
  }

  async syncWithServer(): Promise<{
    success: boolean;
    teachers?: Teacher[];
    documents?: SchoolDocument[];
    schedules?: ScheduleEntry[];
    folders?: StorageFolder[];
  }> {
    const localTeachers = this.getTeachers();
    const localDocs = this.getDocuments();
    const localSchedules = this.getSchedules();
    const localFolders = this.getStorageFolders();

    try {
      // Send local state to server via POST so server merges any locally registered teachers/docs
      const deletedIds = this.getDeletedTeacherIds();
      const deletedDocIds = this.getDeletedDocumentIds();
      const deletedSchIds = this.getDeletedScheduleIds();
      const deletedFldIds = this.getDeletedFolderIds();

      let data: any = null;
      try {
        const postRes = await fetch('/api/sync-all', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            teachers: localTeachers,
            documents: localDocs,
            schedules: localSchedules,
            folders: localFolders,
            deletedTeacherIds: deletedIds,
            deletedDocumentIds: deletedDocIds,
            deletedScheduleIds: deletedSchIds,
            deletedFolderIds: deletedFldIds,
          }),
        });
        if (postRes.ok) {
          data = await postRes.json();
        }
      } catch {
        // Fallback to GET
      }

      if (!data) {
        const getRes = await fetch('/api/sync-all');
        if (getRes.ok) {
          data = await getRes.json();
        }
      }

      if (!data) {
        return {
          success: false,
          teachers: localTeachers,
          documents: localDocs,
          schedules: localSchedules,
          folders: localFolders,
        };
      }

      // Merge deleted teacher IDs from server
      if (Array.isArray(data.deletedTeacherIds)) {
        data.deletedTeacherIds.forEach((dId: string) => {
          if (dId && typeof dId === 'string' && !deletedIds.includes(dId)) {
            deletedIds.push(dId);
          }
        });
        localStorage.setItem(KEYS.DELETED_TEACHER_IDS, JSON.stringify(deletedIds));
      }

      // Merge deleted document IDs from server
      if (Array.isArray(data.deletedDocumentIds)) {
        data.deletedDocumentIds.forEach((docId: string) => {
          if (docId && typeof docId === 'string' && !deletedDocIds.includes(docId)) {
            deletedDocIds.push(docId);
          }
        });
        localStorage.setItem(KEYS.DELETED_DOCUMENT_IDS, JSON.stringify(deletedDocIds));
      }

      // Merge deleted schedule IDs from server
      if (Array.isArray(data.deletedScheduleIds)) {
        data.deletedScheduleIds.forEach((schId: string) => {
          if (schId && typeof schId === 'string' && !deletedSchIds.includes(schId)) {
            deletedSchIds.push(schId);
          }
        });
        localStorage.setItem(KEYS.DELETED_SCHEDULE_IDS, JSON.stringify(deletedSchIds));
      }

      // Merge deleted folder IDs from server
      if (Array.isArray(data.deletedFolderIds)) {
        data.deletedFolderIds.forEach((fId: string) => {
          if (fId && typeof fId === 'string' && !deletedFldIds.includes(fId)) {
            deletedFldIds.push(fId);
          }
        });
        localStorage.setItem(KEYS.DELETED_FOLDER_IDS, JSON.stringify(deletedFldIds));
      }

      // TEACHERS MERGE: Union by ID & username/dni (Strictly excluding any deleted teachers)
      const serverTeachers: Teacher[] = Array.isArray(data.teachers) ? data.teachers : [];
      const teacherMap = new Map<string, Teacher>();

      // 1. Put local teachers in map (authoritative for client)
      localTeachers.forEach(t => {
        if (t && t.id && !deletedIds.includes(t.id)) teacherMap.set(t.id, t);
      });

      // 2. Merge server teachers in map
      serverTeachers.forEach(st => {
        if (st && st.id && !deletedIds.includes(st.id)) {
          const existing = teacherMap.get(st.id);
          if (existing) {
            teacherMap.set(st.id, { ...existing, ...st });
          } else {
            teacherMap.set(st.id, st);
          }
        }
      });

      // Also recover any valid teachers from permanent backup (excluding deleted ones)
      try {
        const backupData = localStorage.getItem(KEYS.TEACHERS_BACKUP);
        if (backupData) {
          const backupTeachers: Teacher[] = JSON.parse(backupData);
          if (Array.isArray(backupTeachers)) {
            backupTeachers.forEach(bt => {
              if (bt && bt.id && !deletedIds.includes(bt.id) && !teacherMap.has(bt.id)) {
                teacherMap.set(bt.id, bt);
              }
            });
          }
        }
      } catch {}

      const mergedTeachers = Array.from(teacherMap.values()).filter(t => t && t.id && !deletedIds.includes(t.id));
      localStorage.setItem(KEYS.TEACHERS, JSON.stringify(mergedTeachers));
      localStorage.setItem(KEYS.TEACHERS_BACKUP, JSON.stringify(mergedTeachers));

      // DOCUMENTS MERGE: Union by ID (Strictly excluding deleted documents and preventing duplicates)
      const serverDocs: SchoolDocument[] = Array.isArray(data.documents) ? data.documents : [];
      const docMap = new Map<string, SchoolDocument>();

      // Local docs first
      localDocs.forEach(ld => {
        if (ld && ld.id && !deletedDocIds.includes(ld.id)) {
          docMap.set(ld.id, ld);
        }
      });

      // Server docs merged
      serverDocs.forEach(sd => {
        if (sd && sd.id && !deletedDocIds.includes(sd.id)) {
          if (!docMap.has(sd.id)) {
            docMap.set(sd.id, sd);
          } else {
            // Keep local version or merge
            const current = docMap.get(sd.id)!;
            docMap.set(sd.id, { ...sd, ...current });
          }
        }
      });

      const mergedDocs = Array.from(docMap.values()).filter(d => d && d.id && !deletedDocIds.includes(d.id));
      localStorage.setItem(KEYS.DOCUMENTS, JSON.stringify(mergedDocs));

      // SCHEDULES MERGE: Union by ID (Strictly excluding deleted schedules)
      const serverSchedules: ScheduleEntry[] = Array.isArray(data.schedules) ? data.schedules : [];
      const schMap = new Map<string, ScheduleEntry>();
      localSchedules.forEach(ls => {
        if (ls && ls.id && !deletedSchIds.includes(ls.id)) {
          schMap.set(ls.id, ls);
        }
      });
      serverSchedules.forEach(ss => {
        if (ss && ss.id && !deletedSchIds.includes(ss.id)) {
          if (!schMap.has(ss.id)) {
            schMap.set(ss.id, ss);
          }
        }
      });
      const mergedSchedules = Array.from(schMap.values()).filter(s => s && s.id && !deletedSchIds.includes(s.id));
      localStorage.setItem(KEYS.SCHEDULES, JSON.stringify(mergedSchedules));

      // FOLDERS MERGE: Union by ID (Strictly excluding deleted folders)
      const serverFolders: StorageFolder[] = Array.isArray(data.folders) ? data.folders : [];
      const folderMap = new Map<string, StorageFolder>();
      localFolders.forEach(lf => {
        if (lf && lf.id && !deletedFldIds.includes(lf.id)) {
          folderMap.set(lf.id, lf);
        }
      });
      serverFolders.forEach(sf => {
        if (sf && sf.id && !deletedFldIds.includes(sf.id)) {
          if (!folderMap.has(sf.id)) {
            folderMap.set(sf.id, sf);
          }
        }
      });
      const mergedFolders = Array.from(folderMap.values()).filter(f => f && f.id && !deletedFldIds.includes(f.id));
      localStorage.setItem(KEYS.STORAGE_FOLDERS, JSON.stringify(mergedFolders));

      // Remove any stale backup keys
      try {
        localStorage.removeItem('docudocente_active_teacher_backup_v2');
      } catch {}

      return {
        success: true,
        teachers: mergedTeachers,
        documents: mergedDocs,
        schedules: mergedSchedules,
        folders: mergedFolders,
      };
    } catch (err) {
      console.warn('Sync error, preserving local accounts & files:', err);
      return {
        success: false,
        teachers: localTeachers,
        documents: localDocs,
        schedules: localSchedules,
        folders: localFolders,
      };
    }
  }

  async resetPassword(fullNameOrUser: string, newPassword: string): Promise<{ success: boolean; teacherName?: string; error?: string }> {
    const clean = fullNameOrUser.trim();
    if (!clean) {
      return { success: false, error: 'Por favor ingresa tu nombre completo registrado.' };
    }
    if (!newPassword || newPassword.length < 4) {
      return { success: false, error: 'La nueva contraseña debe tener al menos 4 caracteres.' };
    }

    if (clean.toLowerCase() === 'directora' || clean.toLowerCase() === 'directora general') {
      return { success: false, error: 'La cuenta de Dirección no puede restablecerse desde este formulario.' };
    }

    // Try server first for cross-device consistency
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName: clean, newPassword }),
      });
      if (res.ok) {
        const data = await res.json();
        // Also update locally
        const teachers = this.getTeachers();
        const index = teachers.findIndex(
          t =>
            t.name.trim().toLowerCase() === clean.toLowerCase() ||
            t.username.trim().toLowerCase() === clean.toLowerCase() ||
            (t.dni && t.dni.trim() === clean)
        );
        if (index !== -1) {
          teachers[index].password = newPassword;
          localStorage.setItem(KEYS.TEACHERS, JSON.stringify(teachers));
        }
        return { success: true, teacherName: data.teacherName || clean };
      }
    } catch {
      // Fallback to local check
    }

    const teachers = this.getTeachers();
    const index = teachers.findIndex(
      t =>
        t.name.trim().toLowerCase() === clean.toLowerCase() ||
        t.username.trim().toLowerCase() === clean.toLowerCase() ||
        (t.dni && t.dni.trim() === clean)
    );
    if (index === -1) {
      return { success: false, error: `No se encontró ningún docente registrado con el nombre "${clean}". Verifica tus datos.` };
    }

    teachers[index].password = newPassword;
    localStorage.setItem(KEYS.TEACHERS, JSON.stringify(teachers));

    this.recordAudit({
      action: 'view',
      documentId: 'auth-reset',
      documentTitle: 'Restablecimiento de Contraseña',
      details: `Se restableció la contraseña del docente ${teachers[index].name}.`,
    });

    return { success: true, teacherName: teachers[index].name };
  }

  async updateTeacherBirthDate(teacherId: string, birthDate: string): Promise<{ success: boolean; teacher?: Teacher; error?: string }> {
    const teachers = this.getTeachers();
    const index = teachers.findIndex(t => t.id === teacherId);
    if (index === -1) {
      return { success: false, error: 'Docente no encontrado.' };
    }

    teachers[index].birthDate = birthDate;
    localStorage.setItem(KEYS.TEACHERS, JSON.stringify(teachers));

    if (localStorage.getItem(KEYS.ACTIVE_TEACHER) === teacherId) {
      this.setActiveTeacher(teacherId);
    }

    try {
      await fetch(`/api/teachers/${teacherId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ birthDate }),
      });
    } catch (e) {
      console.warn('Could not sync birthDate to server:', e);
    }

    return { success: true, teacher: teachers[index] };
  }

  logout(): void {
    const current = this.getActiveTeacher();
    if (current) {
      this.recordAudit({
        action: 'view',
        documentId: 'auth-logout',
        documentTitle: 'Cierre de Sesión',
        details: `El usuario @${current.username} (${current.name}) cerró su sesión.`,
      });
    }
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        sessionStorage.removeItem(KEYS.ACTIVE_TEACHER);
      }
      localStorage.removeItem(KEYS.ACTIVE_TEACHER);
      localStorage.removeItem('docudocente_active_teacher_backup_v2');
      localStorage.removeItem('docudocente_active_teacher_v1');
    } catch {}
  }

  deleteAccount(teacherId: string): boolean {
    const res = this.deleteTeacher(teacherId);
    return res.success;
  }

  // DOCUMENTS
  getDocuments(): SchoolDocument[] {
    try {
      const deletedDocIds = this.getDeletedDocumentIds();
      const data = localStorage.getItem(KEYS.DOCUMENTS);
      const docs: SchoolDocument[] = data ? JSON.parse(data) : INITIAL_DOCUMENTS;
      return docs.filter(d => d && d.id && !deletedDocIds.includes(d.id));
    } catch {
      return INITIAL_DOCUMENTS;
    }
  }

  getDocumentById(id: string): SchoolDocument | undefined {
    return this.getDocuments().find(d => d.id === id);
  }

  saveDocument(doc: Omit<SchoolDocument, 'id' | 'createdAt' | 'updatedAt' | 'syncStatus'>): SchoolDocument {
    const documents = this.getDocuments();
    const now = new Date().toISOString();

    // De-duplication check: prevent instant duplicate uploads if identical file was uploaded within 3 seconds
    const existingRecent = documents.find(
      d =>
        d.title.trim().toLowerCase() === doc.title.trim().toLowerCase() &&
        d.authorTeacherId === doc.authorTeacherId &&
        d.grade === doc.grade &&
        d.section === doc.section &&
        d.course === doc.course &&
        Math.abs(new Date(d.createdAt).getTime() - new Date(now).getTime()) < 3000
    );
    if (existingRecent) {
      return existingRecent;
    }

    const docId = `doc-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    this.removeDeletedDocumentId(docId);

    const newDoc: SchoolDocument = {
      ...doc,
      id: docId,
      createdAt: now,
      updatedAt: now,
      syncStatus: this.isOfflineMode ? 'pending' : 'synced',
    };

    const cleanDocs = documents.filter(d => d.id !== docId);
    cleanDocs.unshift(newDoc);
    localStorage.setItem(KEYS.DOCUMENTS, JSON.stringify(cleanDocs));

    // Persist to server database for cross-device access
    try {
      fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDoc),
      }).catch((e) => console.warn('Error syncing new document with server:', e));
    } catch {}

    this.recordAudit({
      action: 'edit',
      documentId: newDoc.id,
      documentTitle: newDoc.title,
      details: `Documento "${newDoc.title}" subido y categorizado en ${newDoc.course} - ${newDoc.grade} ${newDoc.section}.`,
    });

    return newDoc;
  }

  updateDocument(id: string, updates: Partial<SchoolDocument>): SchoolDocument | null {
    const documents = this.getDocuments();
    const index = documents.findIndex(d => d.id === id);
    if (index === -1) return null;

    const currentDoc = documents[index];

    const updatedDoc: SchoolDocument = {
      ...currentDoc,
      ...updates,
      updatedAt: new Date().toISOString(),
      syncStatus: this.isOfflineMode ? 'pending' : 'synced',
    };

    documents[index] = updatedDoc;
    localStorage.setItem(KEYS.DOCUMENTS, JSON.stringify(documents));

    // Persist update to server database
    try {
      fetch(`/api/documents/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedDoc),
      }).catch((e) => console.warn('Error updating document on server:', e));
    } catch {}

    this.recordAudit({
      action: 'edit',
      documentId: updatedDoc.id,
      documentTitle: updatedDoc.title,
      details: `Modificaciones guardadas en documento.`,
    });

    return updatedDoc;
  }

  deleteDocument(id: string): boolean {
    if (!id) return false;
    // 1. Immediately register tombstone ID so sync does not resurrect it
    this.addDeletedDocumentId(id);

    // 2. Remove immediately from local storage
    const rawData = localStorage.getItem(KEYS.DOCUMENTS);
    const documents: SchoolDocument[] = rawData ? JSON.parse(rawData) : INITIAL_DOCUMENTS;
    const target = documents.find(d => d.id === id);
    const filtered = documents.filter(d => d.id !== id);
    localStorage.setItem(KEYS.DOCUMENTS, JSON.stringify(filtered));

    // 3. Persist deletion to server database immediately
    try {
      fetch(`/api/documents/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      }).catch((e) => console.warn('Error deleting document on server:', e));
    } catch {}

    if (target) {
      this.recordAudit({
        action: 'delete',
        documentId: target.id,
        documentTitle: target.title,
        details: `Documento "${target.title}" eliminado del archivo escolar.`,
      });
    }

    return true;
  }

  toggleFavorite(id: string): SchoolDocument | null {
    const documents = this.getDocuments();
    const index = documents.findIndex(d => d.id === id);
    if (index === -1) return null;

    const doc = documents[index];
    doc.isFavorite = !doc.isFavorite;
    doc.updatedAt = new Date().toISOString();
    documents[index] = doc;
    localStorage.setItem(KEYS.DOCUMENTS, JSON.stringify(documents));
    return doc;
  }

  // SMART FOLDERS
  getCustomSmartFolders(): SmartFolder[] {
    try {
      const data = localStorage.getItem(KEYS.CUSTOM_FOLDERS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  saveCustomSmartFolder(folder: Omit<SmartFolder, 'id'>): SmartFolder {
    const current = this.getCustomSmartFolders();
    const newFolder: SmartFolder = {
      ...folder,
      id: `custom-folder-${Date.now()}`,
    };
    current.push(newFolder);
    localStorage.setItem(KEYS.CUSTOM_FOLDERS, JSON.stringify(current));
    return newFolder;
  }

  deleteCustomSmartFolder(id: string): boolean {
    const current = this.getCustomSmartFolders();
    const filtered = current.filter(f => f.id !== id);
    localStorage.setItem(KEYS.CUSTOM_FOLDERS, JSON.stringify(filtered));
    return true;
  }

  // STORAGE FOLDERS (Carpetas para guardar y organizar archivos)
  getStorageFolders(): StorageFolder[] {
    try {
      const deletedFldIds = this.getDeletedFolderIds();
      const data = localStorage.getItem(KEYS.STORAGE_FOLDERS);
      const list: StorageFolder[] = data ? JSON.parse(data) : INITIAL_STORAGE_FOLDERS;
      return list.filter(f => f && f.id && !deletedFldIds.includes(f.id));
    } catch {
      return INITIAL_STORAGE_FOLDERS;
    }
  }

  getStorageFolderById(id: string): StorageFolder | undefined {
    return this.getStorageFolders().find(f => f.id === id);
  }

  saveStorageFolder(folder: Omit<StorageFolder, 'id' | 'createdAt'>): StorageFolder {
    const folders = this.getStorageFolders();
    const newId = `folder-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    this.removeDeletedFolderId(newId);

    const newFolder: StorageFolder = {
      ...folder,
      id: newId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    folders.unshift(newFolder);
    localStorage.setItem(KEYS.STORAGE_FOLDERS, JSON.stringify(folders));

    try {
      fetch('/api/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newFolder),
      }).catch(e => console.warn('Error syncing new folder with server:', e));
    } catch {}

    this.recordAudit({
      action: 'edit',
      documentId: newFolder.id,
      documentTitle: `Carpeta: ${newFolder.name}`,
      details: `Se creó la carpeta "${newFolder.name}".`,
    });

    return newFolder;
  }

  updateStorageFolder(id: string, updates: Partial<StorageFolder>): StorageFolder | null {
    const folders = this.getStorageFolders();
    const idx = folders.findIndex(f => f.id === id);
    if (idx === -1) return null;

    const updated: StorageFolder = {
      ...folders[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    folders[idx] = updated;
    localStorage.setItem(KEYS.STORAGE_FOLDERS, JSON.stringify(folders));

    if (updates.name) {
      const docs = this.getDocuments();
      let changed = false;
      docs.forEach(doc => {
        if (doc.folderId === id) {
          doc.folderName = updates.name;
          changed = true;
        }
      });
      if (changed) {
        localStorage.setItem(KEYS.DOCUMENTS, JSON.stringify(docs));
      }
    }

    try {
      fetch(`/api/folders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      }).catch(e => console.warn('Error updating folder on server:', e));
    } catch {}

    return updated;
  }

  deleteStorageFolder(id: string): boolean {
    if (!id) return false;
    this.addDeletedFolderId(id);

    const raw = localStorage.getItem(KEYS.STORAGE_FOLDERS);
    const folders: StorageFolder[] = raw ? JSON.parse(raw) : INITIAL_STORAGE_FOLDERS;
    const target = folders.find(f => f.id === id);
    const filtered = folders.filter(f => f.id !== id);
    localStorage.setItem(KEYS.STORAGE_FOLDERS, JSON.stringify(filtered));

    // Unlink documents from this folder so files remain accessible
    const docs = this.getDocuments();
    let changed = false;
    docs.forEach(doc => {
      if (doc.folderId === id) {
        delete doc.folderId;
        delete doc.folderName;
        changed = true;
      }
    });
    if (changed) {
      localStorage.setItem(KEYS.DOCUMENTS, JSON.stringify(docs));
    }

    try {
      fetch(`/api/folders/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      }).catch(e => console.warn('Error deleting folder on server:', e));
    } catch {}

    if (target) {
      this.recordAudit({
        action: 'delete',
        documentId: target.id,
        documentTitle: `Carpeta: ${target.name}`,
        details: `Se eliminó la carpeta "${target.name}". Los archivos permanecen guardados en el archivo escolar.`,
      });
    }

    return true;
  }

  assignDocumentToFolder(docId: string, folderId?: string, folderName?: string): SchoolDocument | null {
    return this.updateDocument(docId, {
      folderId: folderId || undefined,
      folderName: folderName || undefined,
    });
  }

  // AUDIT LOGS
  getAuditLogs(): AuditLog[] {
    try {
      const data = localStorage.getItem(KEYS.AUDIT_LOGS);
      return data ? JSON.parse(data) : INITIAL_AUDIT_LOGS;
    } catch {
      return INITIAL_AUDIT_LOGS;
    }
  }

  recordAudit(entry: Omit<AuditLog, 'id' | 'timestamp' | 'teacherId' | 'teacherName' | 'teacherRole'>): AuditLog {
    const teacher = this.getActiveTeacher();
    const logs = this.getAuditLogs();
    const newLog: AuditLog = {
      ...entry,
      id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      teacherId: teacher ? teacher.id : 'sistema',
      teacherName: teacher ? teacher.name : 'Sistema Escolar',
      teacherRole: teacher ? teacher.role : 'regular',
    };
    logs.unshift(newLog);
    // Keep last 100 entries
    if (logs.length > 100) logs.length = 100;
    localStorage.setItem(KEYS.AUDIT_LOGS, JSON.stringify(logs));
    return newLog;
  }

  // CLOUD SYNC
  getSyncLogs(): CloudSyncLog[] {
    try {
      const data = localStorage.getItem(KEYS.SYNC_LOGS);
      return data ? JSON.parse(data) : [
        {
          id: 'sync-1',
          timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
          type: 'auto',
          status: 'success',
          documentsCount: INITIAL_DOCUMENTS.length,
          message: 'Sincronización en la nube completada exitosamente.',
          latencyMs: 38,
        }
      ];
    } catch {
      return [];
    }
  }

  getLastSyncTimestamp(): string {
    return localStorage.getItem(KEYS.LAST_SYNC) || new Date().toISOString();
  }

  isOffline(): boolean {
    return this.isOfflineMode;
  }

  setOfflineMode(offline: boolean) {
    this.isOfflineMode = offline;
    localStorage.setItem(KEYS.IS_OFFLINE, offline ? 'true' : 'false');
  }

  async triggerSync(): Promise<{ success: boolean; count: number; message: string }> {
    if (this.isOfflineMode) {
      throw new Error('No se puede sincronizar mientras el modo sin conexión esté activo.');
    }

    // Simulate realistic network cloud handshake and latency (400-800ms)
    await new Promise(r => setTimeout(r, 600));

    const docs = this.getDocuments();
    const updatedDocs = docs.map(d => ({ ...d, syncStatus: 'synced' as const }));
    localStorage.setItem(KEYS.DOCUMENTS, JSON.stringify(updatedDocs));

    const now = new Date().toISOString();
    localStorage.setItem(KEYS.LAST_SYNC, now);

    const syncLogs = this.getSyncLogs();
    const newSyncLog: CloudSyncLog = {
      id: `sync-${Date.now()}`,
      timestamp: now,
      type: 'manual',
      status: 'success',
      documentsCount: updatedDocs.length,
      message: `Sincronizados ${updatedDocs.length} documentos con el servidor de nube escolar.`,
      latencyMs: Math.floor(35 + Math.random() * 25),
    };
    syncLogs.unshift(newSyncLog);
    if (syncLogs.length > 30) syncLogs.length = 30;
    localStorage.setItem(KEYS.SYNC_LOGS, JSON.stringify(syncLogs));

    return {
      success: true,
      count: updatedDocs.length,
      message: 'Todos los archivos han sido respaldados y sincronizados.',
    };
  }

  // CLASS SCHEDULES
  getSchedules(): ScheduleEntry[] {
    try {
      const deletedSchIds = this.getDeletedScheduleIds();
      const data = localStorage.getItem(KEYS.SCHEDULES);
      const list: ScheduleEntry[] = data ? JSON.parse(data) : INITIAL_SCHEDULES;
      return list.filter(s => s && s.id && !deletedSchIds.includes(s.id));
    } catch {
      return INITIAL_SCHEDULES;
    }
  }

  saveSchedule(scheduleData: Omit<ScheduleEntry, 'id' | 'createdAt' | 'updatedAt'>): ScheduleEntry {
    const schedules = this.getSchedules();
    const newId = 'sch-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
    this.removeDeletedScheduleId(newId);

    const newSchedule: ScheduleEntry = {
      ...scheduleData,
      id: newId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    schedules.unshift(newSchedule);
    localStorage.setItem(KEYS.SCHEDULES, JSON.stringify(schedules));

    // Persist to server database
    try {
      fetch('/api/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSchedule),
      }).catch((e) => console.warn('Error syncing schedule with server:', e));
    } catch {}

    return newSchedule;
  }

  updateSchedule(id: string, updates: Partial<Omit<ScheduleEntry, 'id' | 'createdAt'>>): ScheduleEntry | null {
    const schedules = this.getSchedules();
    const index = schedules.findIndex((s) => s.id === id);
    if (index === -1) return null;

    const updated: ScheduleEntry = {
      ...schedules[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    schedules[index] = updated;
    localStorage.setItem(KEYS.SCHEDULES, JSON.stringify(schedules));

    // Persist to server database
    try {
      fetch(`/api/schedules/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      }).catch((e) => console.warn('Error updating schedule on server:', e));
    } catch {}

    return updated;
  }

  deleteSchedule(id: string): boolean {
    if (!id) return false;
    this.addDeletedScheduleId(id);

    const raw = localStorage.getItem(KEYS.SCHEDULES);
    const schedules: ScheduleEntry[] = raw ? JSON.parse(raw) : INITIAL_SCHEDULES;
    const filtered = schedules.filter((s) => s.id !== id);
    localStorage.setItem(KEYS.SCHEDULES, JSON.stringify(filtered));

    // Persist to server database
    try {
      fetch(`/api/schedules/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      }).catch((e) => console.warn('Error deleting schedule on server:', e));
    } catch {}

    return true;
  }

  exportCloudBackup(): string {
    const backup = {
      appName: 'ArchivoDocente',
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      documents: this.getDocuments(),
      customFolders: this.getCustomSmartFolders(),
      auditLogs: this.getAuditLogs(),
      schedules: this.getSchedules(),
    };
    return JSON.stringify(backup, null, 2);
  }

  importCloudBackup(jsonString: string): { count: number } {
    try {
      const data = JSON.parse(jsonString);
      if (!data.documents || !Array.isArray(data.documents)) {
        throw new Error('El archivo no contiene una estructura válida de respaldo de Archivo Docente.');
      }
      localStorage.setItem(KEYS.DOCUMENTS, JSON.stringify(data.documents));
      if (data.customFolders) {
        localStorage.setItem(KEYS.CUSTOM_FOLDERS, JSON.stringify(data.customFolders));
      }
      if (data.auditLogs) {
        localStorage.setItem(KEYS.AUDIT_LOGS, JSON.stringify(data.auditLogs));
      }
      if (data.schedules && Array.isArray(data.schedules)) {
        localStorage.setItem(KEYS.SCHEDULES, JSON.stringify(data.schedules));
      }
      this.triggerSync();
      return { count: data.documents.length };
    } catch (err: any) {
      throw new Error(err.message || 'Error al procesar el archivo de respaldo.');
    }
  }

  resetToFactory(): void {
    localStorage.setItem(KEYS.DOCUMENTS, JSON.stringify(INITIAL_DOCUMENTS));
    localStorage.setItem(KEYS.AUDIT_LOGS, JSON.stringify(INITIAL_AUDIT_LOGS));
    localStorage.setItem(KEYS.CUSTOM_FOLDERS, JSON.stringify([]));
    localStorage.setItem(KEYS.SCHEDULES, JSON.stringify(INITIAL_SCHEDULES));
    localStorage.setItem(KEYS.LAST_SYNC, new Date().toISOString());
  }
}

export const storageService = new StorageService();
