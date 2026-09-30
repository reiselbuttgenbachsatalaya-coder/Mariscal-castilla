import React, { useState, useEffect, useMemo } from 'react';
import {
  SchoolDocument,
  Teacher,
  SmartFolder,
  FilterCriteria,
  SmartFolderId,
  CloudSyncLog,
  ScheduleEntry,
  StorageFolder
} from './types';
import { SYSTEM_SMART_FOLDERS } from './data/initialData';
import { storageService } from './services/storageService';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { FilterBar } from './components/FilterBar';
import { DocumentCard } from './components/DocumentCard';
import { DocumentListItem } from './components/DocumentListItem';
import { DocumentPreviewModal } from './components/DocumentPreviewModal';
import { DocumentUploadModal } from './components/DocumentUploadModal';
import { AdvancedSearchModal } from './components/AdvancedSearchModal';
import { CloudSyncModal } from './components/CloudSyncModal';
import { CreateSmartFolderModal } from './components/CreateSmartFolderModal';
import { AuthScreen } from './components/AuthScreen';
import { CreateAccountModal } from './components/CreateAccountModal';
import { ClassScheduleView } from './components/ClassScheduleView';
import { ScheduleModal } from './components/ScheduleModal';
import { AdminPanel } from './components/AdminPanel';
import { BirthdaysView } from './components/BirthdaysView';
import { SwitchAccountModal } from './components/SwitchAccountModal';
import { ResetPasswordModal } from './components/ResetPasswordModal';
import { FolderSection } from './components/FolderSection';
import { CreateFolderModal } from './components/CreateFolderModal';
import { ShareModal } from './components/ShareModal';
import { PublicSharedViewer } from './components/PublicSharedViewer';
import { downloadSchoolDocument } from './utils/formatters';
import {
  UploadCloud,
  FileQuestion,
  CheckCircle2,
  Menu,
  X as CloseIcon,
  Folder,
  FolderOpen,
  FolderPlus,
  Share2,
  Download,
  ArrowLeft,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

export default function App() {
  // --- Current View Tab ---
  const [currentView, setCurrentView] = useState<'documents' | 'schedule' | 'birthdays' | 'admin'>('documents');

  // --- Persistent Storage State ---
  const [documents, setDocuments] = useState<SchoolDocument[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [currentTeacher, setCurrentTeacher] = useState<Teacher | null>(null);
  const [customFolders, setCustomFolders] = useState<SmartFolder[]>([]);
  const [syncLogs, setSyncLogs] = useState<CloudSyncLog[]>([]);
  const [schedules, setSchedules] = useState<ScheduleEntry[]>([]);
  const [lastSyncedAt, setLastSyncedAt] = useState<string>('');
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // --- UI Controls State ---
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // --- Modal Open States ---
  const [previewDoc, setPreviewDoc] = useState<SchoolDocument | null>(null);
  const [editingDoc, setEditingDoc] = useState<SchoolDocument | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isAdvancedSearchOpen, setIsAdvancedSearchOpen] = useState(false);
  const [isCloudSyncOpen, setIsCloudSyncOpen] = useState(false);
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [isCreateAccountOpen, setIsCreateAccountOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ScheduleEntry | null>(null);
  const [switchTargetTeacher, setSwitchTargetTeacher] = useState<Teacher | null>(null);
  const [isSwitchAccountOpen, setIsSwitchAccountOpen] = useState(false);
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);
  const [resetPasswordTeacherName, setResetPasswordTeacherName] = useState('');
  const [dismissedSwitcherIds, setDismissedSwitcherIds] = useState<string[]>(() =>
    storageService.getDismissedSwitcherTeacherIds()
  );

  // --- Storage Folders & Sharing State ---
  const [storageFolders, setStorageFolders] = useState<StorageFolder[]>([]);
  const [activeStorageFolderId, setActiveStorageFolderId] = useState<string | undefined>(undefined);
  const [isCreateStorageFolderOpen, setIsCreateStorageFolderOpen] = useState(false);
  const [editingStorageFolder, setEditingStorageFolder] = useState<StorageFolder | null>(null);
  const [shareDoc, setShareDoc] = useState<SchoolDocument | null>(null);
  const [shareFolder, setShareFolder] = useState<StorageFolder | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [bypassPublicShare, setBypassPublicShare] = useState(false);

  // --- Filters State ---
  const [filters, setFilters] = useState<FilterCriteria>({
    searchQuery: '',
    course: '',
    grade: '',
    section: '',
    format: '',
    dateRange: 'all',
    startDate: undefined,
    endDate: undefined,
    smartFolderId: 'all',
    onlyFavorites: false,
    authorTeacherId: '',
  });

  // Load initial data from storageService
  useEffect(() => {
    const loadedDocs = storageService.getDocuments();
    const loadedTeachers = storageService.getTeachers();
    const activeT = storageService.getActiveTeacher();
    const customF = storageService.getCustomSmartFolders();
    const sLogs = storageService.getSyncLogs();
    const loadedSchedules = storageService.getSchedules();
    const lastSync = storageService.getLastSyncTimestamp();
    const offlineMode = storageService.isOffline();
    const loadedFolders = storageService.getStorageFolders();

    setDocuments(loadedDocs);
    setTeachers(loadedTeachers);
    setCurrentTeacher(activeT);
    setCustomFolders(customF);
    setSyncLogs(sLogs);
    setSchedules(loadedSchedules);
    setLastSyncedAt(lastSync);
    setIsOffline(offlineMode);
    setStorageFolders(loadedFolders);

    // Handle shared links in URL (?doc=... or ?folder=...)
    const urlParams = new URLSearchParams(window.location.search);
    const sharedDocId = urlParams.get('doc');
    const sharedFolderId = urlParams.get('folder');

    if (sharedDocId) {
      const targetDoc = loadedDocs.find(d => d.id === sharedDocId) || storageService.getDocumentById(sharedDocId);
      if (targetDoc) {
        const shouldDownload = urlParams.get('download') === '1' || urlParams.get('download') === 'true';
        if (shouldDownload) {
          downloadSchoolDocument(targetDoc);
        }
        if (activeT) {
          setCurrentView('documents');
          setPreviewDoc(targetDoc);
          showToast(shouldDownload ? `Descargando: "${targetDoc.title}"` : `Archivo compartido: "${targetDoc.title}"`);
        }
      }
    } else if (sharedFolderId) {
      const targetFolder = loadedFolders.find(f => f.id === sharedFolderId) || storageService.getStorageFolderById(sharedFolderId);
      if (targetFolder) {
        if (activeT) {
          setCurrentView('documents');
          setActiveStorageFolderId(targetFolder.id);
          showToast(`Carpeta compartida cargada: "${targetFolder.name}"`);
        }
      }
    }

    if (activeT?.role === 'director' || activeT?.username.toLowerCase() === 'directora') {
      setCurrentView('admin');
    }

    // Auto-sync with cross-device backend server
    const runServerSync = () => {
      storageService.syncWithServer().then((res) => {
        if (res && res.success) {
          setDocuments(storageService.getDocuments());
          setTeachers(storageService.getTeachers());
          setSchedules(storageService.getSchedules());
          setStorageFolders(storageService.getStorageFolders());
          const refreshedActive = storageService.getActiveTeacher();
          if (refreshedActive) {
            setCurrentTeacher(refreshedActive);
          } else {
            setCurrentTeacher(null);
          }
        }
      }).catch((err) => {
        console.warn('Cross-device server sync note:', err);
      });
    };

    runServerSync();

    // Poll every 4 seconds to sync any edits/deletions/uploads across devices
    const syncInterval = setInterval(runServerSync, 4000);

    const handleFocusSync = () => {
      if (document.visibilityState === 'visible') {
        runServerSync();
      }
    };
    window.addEventListener('visibilitychange', handleFocusSync);
    window.addEventListener('focus', runServerSync);

    return () => {
      clearInterval(syncInterval);
      window.removeEventListener('visibilitychange', handleFocusSync);
      window.removeEventListener('focus', runServerSync);
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Dismiss Teacher from Quick Switcher on this device (For regular teachers to not accumulate accounts)
  const handleDismissTeacherFromSwitcher = (teacherId: string) => {
    storageService.dismissTeacherFromSwitcher(teacherId);
    setDismissedSwitcherIds(storageService.getDismissedSwitcherTeacherIds());
    showToast('Cuenta quitada de la lista rápida en este dispositivo.');
  };

  // Delete Teacher Account Permanently (Strictly reserved for Director / Admin)
  const handleDeleteTeacher = (teacherId: string) => {
    const isDirector =
      currentTeacher?.role === 'director' || currentTeacher?.username.toLowerCase() === 'directora';

    if (!isDirector) {
      // Regular teachers can only remove/dismiss accounts from their device list
      handleDismissTeacherFromSwitcher(teacherId);
      return;
    }

    const res = storageService.deleteTeacher(teacherId);
    if (res.success) {
      const remainingTeachers = storageService.getTeachers();
      setTeachers(remainingTeachers);
      setSchedules(storageService.getSchedules());
      setDismissedSwitcherIds(storageService.getDismissedSwitcherTeacherIds());
      
      // If deleted teacher was active, switch to next teacher or logout
      if (currentTeacher?.id === teacherId) {
        if (remainingTeachers.length > 0) {
          const nextTeacher = remainingTeachers[0];
          storageService.setActiveTeacher(nextTeacher.id);
          setCurrentTeacher(nextTeacher);
        } else {
          storageService.logout();
          setCurrentTeacher(null);
        }
      }
      showToast('Cuenta de docente eliminada permanentemente por Dirección.');
    } else {
      showToast(res.error || 'No se pudo eliminar la cuenta.');
    }
  };

  // Update Teacher Birth Date (For Birthday Section)
  const handleUpdateTeacherBirthDate = (teacherId: string, birthDate: string) => {
    const updated = storageService.updateTeacherBirthDate(teacherId, birthDate);
    if (updated) {
      setTeachers(storageService.getTeachers());
      if (currentTeacher?.id === teacherId) {
        setCurrentTeacher(updated);
      }
      showToast('Fecha de cumpleaños actualizada con éxito.');
    }
  };

  // Open Switch Account Modal (Requires Password)
  const handleOpenSwitchAccount = (targetTeacher: Teacher) => {
    setSwitchTargetTeacher(targetTeacher);
    setIsSwitchAccountOpen(true);
  };

  // Confirm Switch Account with Password
  const handleConfirmSwitchAccount = async (targetTeacher: Teacher, password: string) => {
    const res = await storageService.login(targetTeacher.username, password);
    if (res.success && res.teacher) {
      setCurrentTeacher(res.teacher);
      setTeachers(storageService.getTeachers());
      setDismissedSwitcherIds(storageService.getDismissedSwitcherTeacherIds());
      if (res.teacher.role === 'director' || res.teacher.username.toLowerCase() === 'directora') {
        setCurrentView('admin');
      } else {
        setCurrentView('documents');
      }
      showToast(`¡Sesión iniciada como ${res.teacher.name}!`);
      return { success: true };
    }
    return { success: false, error: res.error || 'Contraseña incorrecta.' };
  };

  // Open Reset Password Modal
  const handleOpenResetPassword = (teacherName: string = '') => {
    setResetPasswordTeacherName(teacherName);
    setIsResetPasswordOpen(true);
  };

  // --- Storage Folders Handlers ---
  const handleCreateOrUpdateStorageFolder = (data: {
    name: string;
    description: string;
    color: string;
    selectedDocIds: string[];
  }) => {
    let targetFolderId = '';
    if (editingStorageFolder) {
      storageService.updateStorageFolder(editingStorageFolder.id, {
        name: data.name,
        description: data.description,
        color: data.color,
      });
      targetFolderId = editingStorageFolder.id;
      showToast(`Carpeta "${data.name}" actualizada con éxito.`);
    } else {
      const created = storageService.saveStorageFolder({
        name: data.name,
        description: data.description,
        color: data.color,
        creatorTeacherId: currentTeacher?.id || 'admin',
        creatorTeacherName: currentTeacher?.name || 'Directora',
      });
      targetFolderId = created.id;
      showToast(`Carpeta "${data.name}" creada con éxito.`);
    }

    // Assign documents to this folder
    const allDocs = storageService.getDocuments();
    let docsChanged = false;
    allDocs.forEach((doc) => {
      if (data.selectedDocIds.includes(doc.id)) {
        doc.folderId = targetFolderId;
        doc.folderName = data.name;
        docsChanged = true;
      } else if (editingStorageFolder && doc.folderId === targetFolderId) {
        delete doc.folderId;
        delete doc.folderName;
        docsChanged = true;
      }
    });

    if (docsChanged) {
      try {
        localStorage.setItem('docudocente_documents_v1', JSON.stringify(allDocs));
      } catch {}
      setDocuments([...allDocs]);
    }

    setStorageFolders(storageService.getStorageFolders());
    setIsCreateStorageFolderOpen(false);
    setEditingStorageFolder(null);
  };

  const handleDeleteStorageFolder = (folder: StorageFolder) => {
    const ok = window.confirm(
      `¿Deseas eliminar la carpeta "${folder.name}"? Los archivos que contiene no se borrarán, solo se retirarán de la carpeta.`
    );
    if (!ok) return;
    storageService.deleteStorageFolder(folder.id);
    if (activeStorageFolderId === folder.id) {
      setActiveStorageFolderId(undefined);
    }
    setStorageFolders(storageService.getStorageFolders());
    setDocuments(storageService.getDocuments());
    showToast(`Carpeta "${folder.name}" eliminada.`);
  };

  const handleDownloadStorageFolder = (folder: StorageFolder) => {
    const folderDocs = documents.filter((d) => d.folderId === folder.id);
    if (folderDocs.length === 0) {
      showToast(`La carpeta "${folder.name}" no contiene archivos todavía.`);
      return;
    }
    showToast(`Descargando ${folderDocs.length} archivo(s) de "${folder.name}"...`);
    folderDocs.forEach((d, idx) => {
      setTimeout(() => {
        downloadSchoolDocument(d);
      }, idx * 250);
    });
  };

  const handleOpenShareDoc = (doc: SchoolDocument) => {
    setShareDoc(doc);
    setShareFolder(null);
    setIsShareModalOpen(true);
  };

  const handleOpenShareFolder = (folder: StorageFolder) => {
    setShareFolder(folder);
    setShareDoc(null);
    setIsShareModalOpen(true);
  };

  // Schedule Management Handlers
  const handleSaveSchedule = (scheduleData: Omit<ScheduleEntry, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingSchedule) {
      const updated = storageService.updateSchedule(editingSchedule.id, scheduleData);
      if (updated) {
        setSchedules(storageService.getSchedules());
        showToast(`Horario de "${updated.course}" actualizado con éxito.`);
      }
    } else {
      const created = storageService.saveSchedule(scheduleData);
      setSchedules(storageService.getSchedules());
      showToast(`Horario de "${created.course}" publicado con éxito.`);
    }
    setEditingSchedule(null);
  };

  const handleDeleteSchedule = (id: string) => {
    storageService.deleteSchedule(id);
    setSchedules(storageService.getSchedules());
    showToast('Clase eliminada del horario.');
  };

  // Handle teacher switch
  const handleSelectTeacher = (teacher: Teacher) => {
    handleOpenSwitchAccount(teacher);
  };

  // Handle Login
  const handleLoginSuccess = (teacher: Teacher) => {
    setTeachers(storageService.getTeachers());
    setCurrentTeacher(teacher);
    if (teacher.role === 'director' || teacher.username.toLowerCase() === 'directora') {
      setCurrentView('admin');
    } else {
      setCurrentView('documents');
    }
    showToast(`¡Bienvenido/a, ${teacher.name}! Sesión iniciada.`);
  };

  // Handle Logout
  const handleLogout = () => {
    storageService.logout();
    setCurrentTeacher(null);
    setTeachers(storageService.getTeachers());
    showToast('Has cerrado sesión correctamente.');
  };

  // Handle Account Created from inside app
  const handleAccountCreated = (teacher: Teacher) => {
    setTeachers(storageService.getTeachers());
    setCurrentTeacher(teacher);
    showToast(`Cuenta "${teacher.username}" creada con éxito.`);
  };

  // Handle manual sync
  const handleTriggerSync = async () => {
    if (isOffline) {
      showToast('No se puede sincronizar en Modo Sin Conexión.');
      return;
    }
    setIsSyncing(true);
    try {
      const res = await storageService.triggerSync();
      setLastSyncedAt(new Date().toISOString());
      setSyncLogs(storageService.getSyncLogs());
      setDocuments(storageService.getDocuments());
      showToast(res.message);
    } catch (err: any) {
      showToast(err.message || 'Error al sincronizar.');
    } finally {
      setIsSyncing(false);
    }
  };

  // Handle toggle offline
  const handleToggleOnlineMode = (online: boolean) => {
    storageService.setOfflineMode(!online);
    setIsOffline(!online);
    showToast(!online ? 'Modo sin conexión activado (los cambios se guardarán localmente).' : 'Conexión restablecida con la nube escolar.');
    if (online) {
      handleTriggerSync();
    }
  };

  // Document Operations
  const handleSaveDocument = (docData: Omit<SchoolDocument, 'id' | 'createdAt' | 'updatedAt' | 'syncStatus'>) => {
    if (editingDoc) {
      const updated = storageService.updateDocument(editingDoc.id, docData);
      if (updated) {
        setDocuments(storageService.getDocuments());
        showToast(`Documento "${updated.title}" actualizado con éxito.`);
      }
      setEditingDoc(null);
    } else {
      const created = storageService.saveDocument(docData);
      setDocuments(storageService.getDocuments());
      showToast(`Documento "${created.title}" subido y sincronizado en la nube.`);
    }
  };

  const handleDeleteDocument = (doc: SchoolDocument) => {
    if (confirm(`¿Está seguro de eliminar el archivo "${doc.title}"?`)) {
      try {
        storageService.deleteDocument(doc.id);
        setDocuments(storageService.getDocuments());
        showToast(`Documento eliminado.`);
      } catch (err: any) {
        showToast(err.message || 'Error al eliminar.');
      }
    }
  };

  const handleToggleFavorite = (id: string) => {
    const updated = storageService.toggleFavorite(id);
    if (updated) {
      setDocuments(storageService.getDocuments());
    }
  };

  // Smart Folder Creation
  const handleCreateCustomFolder = (folder: Omit<SmartFolder, 'id'>) => {
    const created = storageService.saveCustomSmartFolder(folder);
    setCustomFolders(storageService.getCustomSmartFolders());
    setFilters((prev) => ({ ...prev, smartFolderId: created.id }));
    showToast(`Carpeta inteligente "${created.title}" creada.`);
  };

  const handleDeleteCustomFolder = (id: string) => {
    storageService.deleteCustomSmartFolder(id);
    setCustomFolders(storageService.getCustomSmartFolders());
    if (filters.smartFolderId === id) {
      setFilters((prev) => ({ ...prev, smartFolderId: 'all' }));
    }
    showToast('Carpeta inteligente eliminada.');
  };

  // Cloud Backup Export & Import
  const handleExportBackup = () => {
    const jsonStr = storageService.exportCloudBackup();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Respaldo_Cloud_ArchivoDocente_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    showToast('Copia de seguridad en la nube descargada.');
  };

  const handleImportBackup = (jsonContent: string) => {
    const res = storageService.importCloudBackup(jsonContent);
    setDocuments(storageService.getDocuments());
    setCustomFolders(storageService.getCustomSmartFolders());
    setSyncLogs(storageService.getSyncLogs());
    showToast(`Respaldo restaurado con éxito (${res.count} documentos).`);
  };

  // --- Scope Visible Documents ---
  // A regular teacher only sees documents they uploaded OR documents specifically sent to them by Admin
  // Admin (Directora) sees all institutional documents
  const visibleDocuments = useMemo(() => {
    if (!currentTeacher) return [];
    if (currentTeacher.role === 'director' || currentTeacher.username.toLowerCase() === 'directora') {
      return documents;
    }
    return documents.filter((doc) => {
      // If user navigated directly into a shared folder or previewDoc via link
      if (activeStorageFolderId && doc.folderId === activeStorageFolderId) return true;
      if (previewDoc && previewDoc.id === doc.id) return true;

      const isAuthor =
        doc.authorTeacherId === currentTeacher.id ||
        (doc.authorTeacherName && doc.authorTeacherName.trim().toLowerCase() === currentTeacher.name.trim().toLowerCase());
      const isRecipient =
        doc.recipientTeacherId === currentTeacher.id ||
        (doc.recipientTeacherName && doc.recipientTeacherName.trim().toLowerCase() === currentTeacher.name.trim().toLowerCase());
      return isAuthor || isRecipient;
    });
  }, [documents, currentTeacher, activeStorageFolderId, previewDoc]);

  // --- Compute Smart Folder Counts ---
  const folderCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    const now = new Date().getTime();
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;

    counts['all'] = visibleDocuments.length;
    counts['curriculum'] = visibleDocuments.filter(
      (d) => d.smartCategory === 'curriculum' || d.tags.some((t) => t.includes('curricul') || t.includes('planea'))
    ).length;
    counts['exams'] = visibleDocuments.filter(
      (d) => d.smartCategory === 'exam' || d.format === 'exam' || d.tags.some((t) => t.includes('examen') || t.includes('evalua'))
    ).length;
    counts['records'] = visibleDocuments.filter(
      (d) => d.smartCategory === 'record' || d.tags.some((t) => t.includes('acta') || t.includes('califica') || t.includes('nota'))
    ).length;
    counts['materials'] = visibleDocuments.filter(
      (d) => d.smartCategory === 'material' || d.format === 'pptx' || d.tags.some((t) => t.includes('guia') || t.includes('material'))
    ).length;
    counts['recent'] = visibleDocuments.filter((d) => new Date(d.createdAt).getTime() >= sevenDaysAgo).length;
    counts['favorites'] = visibleDocuments.filter((d) => d.isFavorite).length;

    // Custom folders
    customFolders.forEach((f) => {
      let matching = visibleDocuments;
      if (f.customFilter?.course) matching = matching.filter((d) => d.course === f.customFilter?.course);
      if (f.customFilter?.grade) matching = matching.filter((d) => d.grade === f.customFilter?.grade);
      if (f.customFilter?.section) matching = matching.filter((d) => d.section === f.customFilter?.section);
      if (f.customFilter?.format) matching = matching.filter((d) => d.format === f.customFilter?.format);
      counts[f.id] = matching.length;
    });

    return counts;
  }, [visibleDocuments, customFolders]);

  // --- Filtering Pipeline ---
  const filteredDocuments = useMemo(() => {
    return visibleDocuments.filter((doc) => {
      // 0. Active Storage Folder Rule (Carpetas creadas por docentes)
      if (activeStorageFolderId && doc.folderId !== activeStorageFolderId) {
        return false;
      }

      // 1. Smart Folder Rule
      const sf = filters.smartFolderId;
      if (sf === 'curriculum') {
        if (doc.smartCategory !== 'curriculum' && !doc.tags.some((t) => t.includes('curricul') || t.includes('planea'))) return false;
      } else if (sf === 'exams') {
        if (doc.smartCategory !== 'exam' && doc.format !== 'exam' && !doc.tags.some((t) => t.includes('examen') || t.includes('evalua'))) return false;
      } else if (sf === 'records') {
        if (doc.smartCategory !== 'record' && !doc.tags.some((t) => t.includes('acta') || t.includes('califica') || t.includes('nota'))) return false;
      } else if (sf === 'materials') {
        if (doc.smartCategory !== 'material' && doc.format !== 'pptx' && !doc.tags.some((t) => t.includes('guia') || t.includes('material'))) return false;
      } else if (sf === 'recent') {
        const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        if (new Date(doc.createdAt).getTime() < sevenDaysAgo) return false;
      } else if (sf === 'favorites') {
        if (!doc.isFavorite) return false;
      } else if (sf !== 'all') {
        // Custom folder
        const custom = customFolders.find((c) => c.id === sf);
        if (custom) {
          if (custom.customFilter?.course && doc.course !== custom.customFilter.course) return false;
          if (custom.customFilter?.grade && doc.grade !== custom.customFilter.grade) return false;
          if (custom.customFilter?.section && doc.section !== custom.customFilter.section) return false;
          if (custom.customFilter?.format && doc.format !== custom.customFilter.format) return false;
        }
      }

      // 2. Search Query
      if (filters.searchQuery) {
        const q = filters.searchQuery.toLowerCase().trim();
        const matchTitle = doc.title.toLowerCase().includes(q);
        const matchDesc = doc.description.toLowerCase().includes(q);
        const matchSummary = doc.contentSummary.toLowerCase().includes(q);
        const matchSnippet = doc.previewSnippet.toLowerCase().includes(q);
        const matchAuthor = doc.authorTeacherName.toLowerCase().includes(q);
        const matchCourse = doc.course.toLowerCase().includes(q);
        const matchTags = doc.tags.some((t) => t.toLowerCase().includes(q));

        if (!matchTitle && !matchDesc && !matchSummary && !matchSnippet && !matchAuthor && !matchCourse && !matchTags) {
          return false;
        }
      }

      // 3. Course Filter
      if (filters.course && doc.course !== filters.course) {
        return false;
      }

      // 4. Grade Filter
      if (filters.grade && doc.grade !== filters.grade) {
        return false;
      }

      // 5. Section Filter
      if (filters.section && doc.section !== filters.section) {
        return false;
      }

      // 6. Format Filter
      if (filters.format && doc.format !== filters.format) {
        return false;
      }

      // 7. Favorites Only
      if (filters.onlyFavorites && !doc.isFavorite) return false;

      // 8. Author Teacher Filter
      if (filters.authorTeacherId && doc.authorTeacherId !== filters.authorTeacherId) return false;

      // 9. Date Range Filter
      if (filters.dateRange !== 'all') {
        const docDate = new Date(doc.createdAt);
        const now = new Date();

        if (filters.dateRange === 'today') {
          if (docDate.toDateString() !== now.toDateString()) return false;
        } else if (filters.dateRange === 'week') {
          const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          if (docDate < oneWeekAgo) return false;
        } else if (filters.dateRange === 'month') {
          const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          if (docDate < oneMonthAgo) return false;
        } else if (filters.dateRange === 'quarter') {
          const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          if (docDate < threeMonthsAgo) return false;
        } else if (filters.dateRange === 'custom') {
          if (filters.startDate) {
            const start = new Date(filters.startDate);
            if (docDate < start) return false;
          }
          if (filters.endDate) {
            const end = new Date(filters.endDate);
            end.setHours(23, 59, 59, 999);
            if (docDate > end) return false;
          }
        }
      }

      return true;
    });
  }, [visibleDocuments, filters, customFolders, activeStorageFolderId]);

  // Current Smart Folder Object
  const currentSmartFolder = useMemo(() => {
    const sys = SYSTEM_SMART_FOLDERS.find((f) => f.id === filters.smartFolderId);
    if (sys) return sys;
    return customFolders.find((f) => f.id === filters.smartFolderId) || SYSTEM_SMART_FOLDERS[0];
  }, [filters.smartFolderId, customFolders]);

  const handleResetFilters = () => {
    setFilters({
      searchQuery: '',
      course: '',
      grade: '',
      section: '',
      format: '',
      dateRange: 'all',
      startDate: undefined,
      endDate: undefined,
      smartFolderId: 'all',
      onlyFavorites: false,
      authorTeacherId: '',
    });
    showToast('Filtros restablecidos.');
  };

  // State to track shared URL parameters so exiting immediately triggers re-render
  const [sharedUrlDocId, setSharedUrlDocId] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    return new URLSearchParams(window.location.search).get('doc');
  });
  const [sharedUrlFolderId, setSharedUrlFolderId] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    return new URLSearchParams(window.location.search).get('folder');
  });

  const handleExitSharedView = () => {
    setSharedUrlDocId(null);
    setSharedUrlFolderId(null);
    setBypassPublicShare(true);
    setPreviewDoc(null);
    setIsShareModalOpen(false);
    setShareDoc(null);
    setShareFolder(null);
    if (typeof window !== 'undefined') {
      try {
        const url = new URL(window.location.href);
        url.searchParams.delete('doc');
        url.searchParams.delete('folder');
        url.searchParams.delete('share');
        window.history.replaceState({}, '', url.pathname + (url.search ? `?${url.searchParams.toString()}` : ''));
      } catch {}
    }
  };

  // Global keydown listener for Escape and X keys to close any open modal or exit public share view
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const isTyping = ['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName);
      if (e.key === 'Escape' || (!isTyping && (e.key === 'x' || e.key === 'X'))) {
        if (isShareModalOpen) {
          setIsShareModalOpen(false);
          setShareDoc(null);
          setShareFolder(null);
          return;
        }
        if (previewDoc) {
          setPreviewDoc(null);
          return;
        }
        if (isUploadOpen) {
          setIsUploadOpen(false);
          setEditingDoc(null);
          return;
        }
        if (isAdvancedSearchOpen) {
          setIsAdvancedSearchOpen(false);
          return;
        }
        if (isCloudSyncOpen) {
          setIsCloudSyncOpen(false);
          return;
        }
        if (isScheduleModalOpen) {
          setIsScheduleModalOpen(false);
          setEditingSchedule(null);
          return;
        }
        if (isCreateAccountOpen) {
          setIsCreateAccountOpen(false);
          return;
        }
        if (isSwitchAccountOpen) {
          setIsSwitchAccountOpen(false);
          setSwitchTargetTeacher(null);
          return;
        }
        if (isResetPasswordOpen) {
          setIsResetPasswordOpen(false);
          setResetPasswordTeacherName('');
          return;
        }
        if (sharedUrlDocId || sharedUrlFolderId) {
          handleExitSharedView();
          return;
        }
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [
    isShareModalOpen,
    previewDoc,
    isUploadOpen,
    isAdvancedSearchOpen,
    isCloudSyncOpen,
    isScheduleModalOpen,
    isCreateAccountOpen,
    isSwitchAccountOpen,
    isResetPasswordOpen,
    sharedUrlDocId,
    sharedUrlFolderId
  ]);

  if (!currentTeacher && (sharedUrlDocId || sharedUrlFolderId) && !bypassPublicShare) {
    const sharedDoc = sharedUrlDocId ? (documents.find((d) => d.id === sharedUrlDocId) || storageService.getDocumentById(sharedUrlDocId) || null) : null;
    const sharedFolder = sharedUrlFolderId ? (storageFolders.find((f) => f.id === sharedUrlFolderId) || storageService.getStorageFolderById(sharedUrlFolderId) || null) : null;
    const folderDocs = sharedFolder ? documents.filter((d) => d.folderId === sharedFolder.id) : [];

    return (
      <>
        {toastMessage && (
          <div className="fixed bottom-5 right-5 z-50 bg-blue-950 text-amber-300 px-4 py-2.5 rounded-xl shadow-lg border border-amber-400/40 text-xs flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-3 duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}
        <PublicSharedViewer
          sharedDoc={sharedDoc}
          sharedFolder={sharedFolder}
          folderDocs={folderDocs}
          onLoginClick={handleExitSharedView}
          onExitToWebsite={handleExitSharedView}
          onPreviewDoc={(doc) => setPreviewDoc(doc)}
        />
        {previewDoc && (
          <DocumentPreviewModal
            document={previewDoc}
            onClose={() => setPreviewDoc(null)}
            currentTeacher={null}
            onEdit={() => {}}
            onDelete={() => {}}
            onShare={handleOpenShareDoc}
          />
        )}
        {isShareModalOpen && (
          <ShareModal
            isOpen={isShareModalOpen}
            onClose={() => {
              setIsShareModalOpen(false);
              setShareDoc(null);
              setShareFolder(null);
            }}
            onExitToWebsite={handleExitSharedView}
            doc={shareDoc}
            document={shareDoc}
            folder={shareFolder}
            folderDocuments={shareFolder ? documents.filter((d) => d.folderId === shareFolder.id) : []}
          />
        )}
      </>
    );
  }

  if (!currentTeacher) {
    return (
      <>
        {toastMessage && (
          <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-lg border border-slate-700 text-xs flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-3 duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}
        <AuthScreen
          onLoginSuccess={handleLoginSuccess}
          registeredTeachers={teachers}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 flex flex-col font-sans antialiased">
      
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-lg border border-slate-700 text-xs flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        onViewChange={setCurrentView}
        searchQuery={filters.searchQuery}
        onSearchChange={(q) => setFilters((prev) => ({ ...prev, searchQuery: q }))}
        onOpenAdvancedSearch={() => setIsAdvancedSearchOpen(true)}
        hasActiveFilters={
          Boolean(filters.course) ||
          Boolean(filters.grade) ||
          Boolean(filters.section) ||
          Boolean(filters.format) ||
          filters.dateRange !== 'all' ||
          filters.onlyFavorites
        }
        onOpenUpload={() => {
          setEditingDoc(null);
          setIsUploadOpen(true);
        }}
        onOpenScheduleModal={() => {
          setEditingSchedule(null);
          setIsScheduleModalOpen(true);
        }}
        onOpenCloudSync={() => setIsCloudSyncOpen(true)}
        currentTeacher={currentTeacher}
        allTeachers={teachers}
        dismissedSwitcherIds={dismissedSwitcherIds}
        onOpenSwitchAccount={handleOpenSwitchAccount}
        onDismissTeacherFromSwitcher={handleDismissTeacherFromSwitcher}
        onDeleteTeacher={handleDeleteTeacher}
        onLogout={handleLogout}
        onOpenCreateAccount={() => setIsCreateAccountOpen(true)}
        isSyncing={isSyncing}
        onTriggerSync={handleTriggerSync}
        isOffline={isOffline}
        lastSyncedAt={lastSyncedAt}
      />

      {/* Main Workspace Layout */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        
        {/* Desktop Sidebar (Visible only in documents view) */}
        {currentView === 'documents' && (
          <div className="hidden md:block">
            <Sidebar
              currentView={currentView}
              onViewChange={setCurrentView}
              scheduleCount={schedules.length}
              activeSmartFolder={filters.smartFolderId}
              onSelectSmartFolder={(id) => {
                setCurrentView('documents');
                setFilters((prev) => ({ ...prev, smartFolderId: id }));
              }}
              systemFolders={SYSTEM_SMART_FOLDERS}
              customFolders={customFolders}
              onOpenCreateSmartFolder={() => setIsCreateFolderOpen(true)}
              onDeleteCustomFolder={handleDeleteCustomFolder}
              folderCounts={folderCounts}
              selectedGrade={filters.grade}
              onSelectGrade={(grade) => {
                setCurrentView('documents');
                setFilters((prev) => ({ ...prev, grade }));
              }}
              selectedSection={filters.section}
              onSelectSection={(section) => {
                setCurrentView('documents');
                setFilters((prev) => ({ ...prev, section }));
              }}
              selectedCourse={filters.course}
              onSelectCourse={(course) => {
                setCurrentView('documents');
                setFilters((prev) => ({ ...prev, course }));
              }}
              totalDocumentsCount={visibleDocuments.length}
            />
          </div>
        )}

        {/* Mobile Sidebar Modal Drawer */}
        {isMobileSidebarOpen && (
          <div className="fixed inset-0 z-40 md:hidden flex">
            <div className="fixed inset-0 bg-slate-900/50" onClick={() => setIsMobileSidebarOpen(false)}></div>
            <div className="relative bg-white w-72 max-w-[85vw] h-full shadow-2xl flex flex-col z-50">
              <div className="p-3 border-b border-slate-200 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">Menú de Navegación</span>
                <button
                  type="button"
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-600"
                >
                  <CloseIcon className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <Sidebar
                  currentView={currentView}
                  onViewChange={(view) => {
                    setCurrentView(view);
                    setIsMobileSidebarOpen(false);
                  }}
                  scheduleCount={schedules.length}
                  activeSmartFolder={filters.smartFolderId}
                  onSelectSmartFolder={(id) => {
                    setCurrentView('documents');
                    setFilters((prev) => ({ ...prev, smartFolderId: id }));
                    setIsMobileSidebarOpen(false);
                  }}
                  systemFolders={SYSTEM_SMART_FOLDERS}
                  customFolders={customFolders}
                  onOpenCreateSmartFolder={() => {
                    setIsMobileSidebarOpen(false);
                    setIsCreateFolderOpen(true);
                  }}
                  onDeleteCustomFolder={handleDeleteCustomFolder}
                  folderCounts={folderCounts}
                  selectedGrade={filters.grade}
                  onSelectGrade={(grade) => {
                    setCurrentView('documents');
                    setFilters((prev) => ({ ...prev, grade }));
                    setIsMobileSidebarOpen(false);
                  }}
                  selectedSection={filters.section}
                  onSelectSection={(section) => {
                    setCurrentView('documents');
                    setFilters((prev) => ({ ...prev, section }));
                    setIsMobileSidebarOpen(false);
                  }}
                  selectedCourse={filters.course}
                  onSelectCourse={(course) => {
                    setCurrentView('documents');
                    setFilters((prev) => ({ ...prev, course }));
                    setIsMobileSidebarOpen(false);
                  }}
                  totalDocumentsCount={visibleDocuments.length}
                />
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area: Admin View vs Class Schedule View vs Birthdays View vs Documents View */}
        {currentView === 'admin' ? (
          <main className="flex-1 min-w-0 bg-slate-100/70 overflow-y-auto">
            <AdminPanel
              teachers={teachers}
              documents={documents}
              schedules={schedules}
              onDeleteTeacher={handleDeleteTeacher}
              onPreviewDocument={(doc) => setPreviewDoc(doc)}
              onDeleteSchedule={handleDeleteSchedule}
              onEditSchedule={(sch) => {
                setEditingSchedule(sch);
                setIsScheduleModalOpen(true);
              }}
              onAddSchedule={() => {
                setEditingSchedule(null);
                setIsScheduleModalOpen(true);
              }}
              onSendFileToTeacher={(docData) => {
                const saved = storageService.saveDocument(docData);
                setDocuments(storageService.getDocuments());
                showToast(`Archivo enviado a ${docData.recipientTeacherName || 'docente'} con éxito.`);
              }}
            />
          </main>
        ) : currentView === 'schedule' ? (
          <ClassScheduleView
            schedules={schedules}
            currentTeacher={currentTeacher}
            allTeachers={teachers}
            onOpenAddSchedule={() => {
              setEditingSchedule(null);
              setIsScheduleModalOpen(true);
            }}
            onEditSchedule={(sch) => {
              setEditingSchedule(sch);
              setIsScheduleModalOpen(true);
            }}
            onDeleteSchedule={handleDeleteSchedule}
          />
        ) : currentView === 'birthdays' ? (
          <BirthdaysView
            teachers={teachers}
            currentTeacher={currentTeacher}
            onUpdateBirthDate={handleUpdateTeacherBirthDate}
          />
        ) : (
          <main className="flex-1 flex flex-col min-w-0 bg-white border-r border-slate-200">
          
          {/* Mobile Folder Header Trigger */}
          <div className="md:hidden flex items-center justify-between px-4 py-2.5 bg-slate-50 border-b border-slate-200 text-xs">
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(true)}
              className="flex items-center gap-1.5 font-semibold text-slate-700 hover:text-indigo-600"
            >
              <Menu className="w-4 h-4" />
              <span>{currentSmartFolder.title}</span>
            </button>
            <span className="text-[11px] bg-slate-200 px-2 py-0.5 rounded-full font-bold text-slate-700">
              {filteredDocuments.length}
            </span>
          </div>

          {/* Active Folder Context Hero Banner */}
          <div className="px-4 sm:px-6 pt-5 pb-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                    {currentSmartFolder.title}
                  </h1>
                </div>
                <p className="text-xs text-slate-500 mt-0.5 max-w-2xl leading-relaxed">
                  {currentSmartFolder.description}
                </p>
              </div>
            </div>
          </div>

          {/* Quick File Sharing by Link Banner */}
          <div className="mx-4 sm:mx-6 mt-3 px-4 py-2.5 rounded-xl bg-sky-50/80 border border-sky-200/80 flex flex-wrap items-center justify-between gap-2 shadow-2xs">
            <div className="flex items-center gap-2 text-xs font-medium text-blue-950">
              <Share2 className="w-4 h-4 text-sky-600 shrink-0" />
              <span>
                <strong className="font-bold text-blue-900">Compartir Archivos por Enlace:</strong> Puedes hacer clic en el botón <span className="font-semibold text-sky-800">"Compartir Link"</span> de cualquier documento para enviarlo por WhatsApp, correo o copiar el enlace directo.
              </span>
            </div>
            <span className="text-[11px] font-semibold text-slate-500 bg-white/80 px-2.5 py-0.5 rounded-md border border-slate-200">
              {filteredDocuments.length} documento(s) disponible(s)
            </span>
          </div>

          {/* Filter Bar (Date, Format, Course, Grade, Section) */}
          <FilterBar
            filters={filters}
            onFilterChange={(updates) => setFilters((prev) => ({ ...prev, ...updates }))}
            onResetFilters={handleResetFilters}
            totalFilteredCount={filteredDocuments.length}
            totalDocumentsCount={visibleDocuments.length}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onOpenAdvancedSearch={() => setIsAdvancedSearchOpen(true)}
          />

          {/* Document Content List / Grid */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
            {filteredDocuments.length === 0 ? (
              /* Clean Empty State */
              <div className="py-16 text-center max-w-md mx-auto space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <FileQuestion className="w-7 h-7" />
                </div>
                <h3 className="text-base font-bold text-slate-800">
                  No se encontraron documentos
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  No hay archivos que coincidan con la combinación de filtros seleccionados (curso, grado, sección, formato o fecha).
                </p>
                <div className="pt-2 flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                  >
                    Restablecer Filtros
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingDoc(null);
                      setIsUploadOpen(true);
                    }}
                    className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors flex items-center gap-1"
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    Subir Archivo
                  </button>
                </div>
              </div>
            ) : viewMode === 'grid' ? (
              /* Grid Cards View */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredDocuments.map((doc) => (
                  <DocumentCard
                    key={doc.id}
                    document={doc}
                    onPreview={(d) => {
                      setPreviewDoc(d);
                    }}
                    onEdit={(d) => {
                      setEditingDoc(d);
                      setIsUploadOpen(true);
                    }}
                    onDelete={handleDeleteDocument}
                    onToggleFavorite={handleToggleFavorite}
                    onShare={handleOpenShareDoc}
                  />
                ))}
              </div>
            ) : (
              /* Table List View */
              <div className="border border-slate-200 rounded-xl overflow-x-auto shadow-2xs">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <tr>
                      <th className="py-2.5 pl-4 pr-1 w-8"></th>
                      <th className="py-2.5 px-3">Título & Archivo</th>
                      <th className="py-2.5 px-3">Curso</th>
                      <th className="py-2.5 px-3">Grado y Sección</th>
                      <th className="py-2.5 px-3">Docente</th>
                      <th className="py-2.5 px-3">Fecha</th>
                      <th className="py-2.5 pr-4 pl-2 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {filteredDocuments.map((doc) => (
                      <DocumentListItem
                        key={doc.id}
                        document={doc}
                        onPreview={(d) => {
                          setPreviewDoc(d);
                        }}
                        onEdit={(d) => {
                          setEditingDoc(d);
                          setIsUploadOpen(true);
                        }}
                        onDelete={handleDeleteDocument}
                        onToggleFavorite={handleToggleFavorite}
                        onShare={handleOpenShareDoc}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </main>
        )}
      </div>

      {/* MODALS */}

      {/* 1. Document Preview Modal */}
      {previewDoc && (
        <DocumentPreviewModal
          document={previewDoc}
          onClose={() => setPreviewDoc(null)}
          currentTeacher={currentTeacher}
          onEdit={(d) => {
            setPreviewDoc(null);
            setEditingDoc(d);
            setIsUploadOpen(true);
          }}
          onDelete={(d) => {
            setPreviewDoc(null);
            handleDeleteDocument(d);
          }}
          onShare={handleOpenShareDoc}
        />
      )}

      {/* 2. Upload / Edit Document Modal */}
      {isUploadOpen && (
        <DocumentUploadModal
          onClose={() => {
            setIsUploadOpen(false);
            setEditingDoc(null);
          }}
          onSave={handleSaveDocument}
          currentTeacher={currentTeacher}
          initialDocument={editingDoc}
          folders={storageFolders}
          defaultFolderId={activeStorageFolderId}
          onRequestCreateFolder={() => {
            setEditingStorageFolder(null);
            setIsCreateStorageFolderOpen(true);
          }}
        />
      )}

      {/* 3. Advanced Search Modal */}
      {isAdvancedSearchOpen && (
        <AdvancedSearchModal
          onClose={() => setIsAdvancedSearchOpen(false)}
          filters={filters}
          onApplyFilters={(updated) => setFilters((prev) => ({ ...prev, ...updated }))}
          onResetFilters={handleResetFilters}
          onSaveAsSmartFolder={(title, criteria) => {
            handleCreateCustomFolder({
              title,
              description: `Carpeta inteligente basada en búsqueda avanzada.`,
              icon: 'Sparkles',
              color: 'indigo',
              customFilter: {
                course: criteria.course || undefined,
                grade: criteria.grade || undefined,
                section: criteria.section || undefined,
                format: criteria.format ? (criteria.format as any) : undefined,
              },
            });
          }}
          allTeachers={teachers}
        />
      )}

      {/* 4. Cloud Sync Modal */}
      {isCloudSyncOpen && (
        <CloudSyncModal
          onClose={() => setIsCloudSyncOpen(false)}
          isOnline={!isOffline}
          onToggleOnlineMode={handleToggleOnlineMode}
          isSyncing={isSyncing}
          onTriggerSync={handleTriggerSync}
          lastSyncedAt={lastSyncedAt}
          syncLogs={syncLogs}
          onExportBackup={handleExportBackup}
          onImportBackup={handleImportBackup}
          totalDocsCount={documents.length}
        />
      )}

      {/* 5. Create Account Modal */}
      {isCreateAccountOpen && (
        <CreateAccountModal
          onClose={() => setIsCreateAccountOpen(false)}
          onAccountCreated={handleAccountCreated}
        />
      )}

      {/* 6. Class Schedule Modal */}
      {isScheduleModalOpen && (
        <ScheduleModal
          onClose={() => {
            setIsScheduleModalOpen(false);
            setEditingSchedule(null);
          }}
          onSave={handleSaveSchedule}
          onDelete={handleDeleteSchedule}
          initialSchedule={editingSchedule}
          currentTeacher={currentTeacher}
        />
      )}

      {/* 7. Switch Account Modal (Requires Password) */}
      <SwitchAccountModal
        isOpen={isSwitchAccountOpen}
        targetTeacher={switchTargetTeacher}
        onClose={() => {
          setIsSwitchAccountOpen(false);
          setSwitchTargetTeacher(null);
        }}
        onConfirmSwitch={handleConfirmSwitchAccount}
        onOpenResetPassword={handleOpenResetPassword}
        onDismissTeacher={handleDismissTeacherFromSwitcher}
      />

      {/* 8. Reset Password Modal */}
      <ResetPasswordModal
        isOpen={isResetPasswordOpen}
        initialTeacherName={resetPasswordTeacherName}
        onClose={() => {
          setIsResetPasswordOpen(false);
          setResetPasswordTeacherName('');
        }}
        onPasswordResetSuccess={(teacherName) => {
          showToast(`Contraseña actualizada para ${teacherName}. Ya puedes iniciar sesión.`);
        }}
      />

      {/* 9. Share Modal (File Sharing by Link) */}
      {isShareModalOpen && (
        <ShareModal
          isOpen={isShareModalOpen}
          onClose={() => {
            setIsShareModalOpen(false);
            setShareDoc(null);
            setShareFolder(null);
          }}
          onExitToWebsite={() => {
            setIsShareModalOpen(false);
            setShareDoc(null);
            setShareFolder(null);
            setPreviewDoc(null);
          }}
          doc={shareDoc}
          document={shareDoc}
          folder={shareFolder}
          folderDocuments={shareFolder ? documents.filter((d) => d.folderId === shareFolder.id) : []}
        />
      )}

    </div>
  );
}
