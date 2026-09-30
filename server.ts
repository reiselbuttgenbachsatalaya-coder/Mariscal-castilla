import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

interface TeacherRecord {
  id: string;
  name: string;
  username: string;
  password?: string;
  email?: string;
  dni?: string;
  birthDate?: string;
  phone?: string;
  courseAssigned?: string;
  role: 'regular' | 'authorized' | 'director';
  roleLabel: string;
  specialty: string;
  avatar: string;
  createdAt?: string;
}

interface DocumentRecord {
  id: string;
  title: string;
  fileName: string;
  format: string;
  fileSize: string;
  course: string;
  grade: string;
  section: string;
  authorTeacherId: string;
  authorTeacherName: string;
  isSensitive?: boolean;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  description: string;
  contentSummary?: string;
  previewSnippet?: string;
  fileDataUrl?: string;
  isFavorite?: boolean;
  smartCategory?: string;
  syncStatus?: string;
  folderId?: string;
  folderName?: string;
  recipientTeacherId?: string;
  recipientTeacherName?: string;
  isDirectMessage?: boolean;
  messageNotes?: string;
}

interface ScheduleRecord {
  id: string;
  teacherId: string;
  teacherName: string;
  course: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  grade?: string;
  section?: string;
  notes?: string;
  color?: string;
  createdAt: string;
  updatedAt: string;
}

interface FolderRecord {
  id: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  creatorTeacherId: string;
  creatorTeacherName: string;
  createdAt: string;
  updatedAt?: string;
}

interface SchoolDatabase {
  teachers: TeacherRecord[];
  documents: DocumentRecord[];
  schedules: ScheduleRecord[];
  folders?: FolderRecord[];
  deletedTeacherIds?: string[];
  deletedDocumentIds?: string[];
  deletedScheduleIds?: string[];
  deletedFolderIds?: string[];
}

const DB_FILE = path.join(process.cwd(), 'school_database.json');

function loadDatabase(): SchoolDatabase {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (!parsed.deletedTeacherIds) parsed.deletedTeacherIds = [];
      if (!parsed.deletedDocumentIds) parsed.deletedDocumentIds = [];
      if (!parsed.deletedScheduleIds) parsed.deletedScheduleIds = [];
      if (!parsed.deletedFolderIds) parsed.deletedFolderIds = [];

      // Purge any deleted items from memory on startup
      if (parsed.deletedDocumentIds.length > 0 && Array.isArray(parsed.documents)) {
        parsed.documents = parsed.documents.filter((d: any) => !parsed.deletedDocumentIds.includes(d.id));
      }
      if (parsed.deletedTeacherIds.length > 0 && Array.isArray(parsed.teachers)) {
        parsed.teachers = parsed.teachers.filter((t: any) => !parsed.deletedTeacherIds.includes(t.id));
      }

      return parsed;
    }
  } catch (err) {
    console.error('Error loading school database:', err);
  }

  // Initial seed
  const initialDb: SchoolDatabase = {
    teachers: [],
    deletedTeacherIds: [],
    deletedDocumentIds: [],
    deletedScheduleIds: [],
    deletedFolderIds: [],
    documents: [
      {
        id: 'doc-1',
        title: 'Examen Bimestral II - Trigonometría y Álgebra',
        fileName: 'Examen_Bimestral_II_Mat_3Sec.pdf',
        format: 'exam',
        fileSize: '1.4 MB',
        course: 'Matemáticas',
        grade: '3° Secundaria',
        section: 'Sección A',
        authorTeacherId: 't-1',
        authorTeacherName: 'Prof. Carlos Mendoza',
        createdAt: '2026-09-02T14:30:00Z',
        updatedAt: '2026-09-02T14:30:00Z',
        tags: ['examen', 'trigonometria', 'evaluacion', 'bimestre-2', 'algebra'],
        description: 'Evaluación formal con 20 preguntas teóricas y prácticas de ecuaciones trigonométricas y factorización polinómica.',
        contentSummary: 'Población: 32 alumnos. Tiempo: 90 minutos. Clave de respuestas adjunta en página 4.',
        previewSnippet: 'I. Resuelva los siguientes sistemas de ecuaciones trigonométricas. 1) sen(2x) + cos(x) = 0...',
        isFavorite: true,
        smartCategory: 'exam',
        syncStatus: 'synced',
      },
      {
        id: 'doc-2',
        title: 'Planeación Anual Curricular 2026 - Comunicación y Literatura',
        fileName: 'PAC_Comunicacion_2026_Secundaria.docx',
        format: 'docx',
        fileSize: '840 KB',
        course: 'Comunicación y Literatura',
        grade: '4° Secundaria',
        section: 'Sección B',
        authorTeacherId: 't-2',
        authorTeacherName: 'Prof. Laura Valenzuela',
        createdAt: '2026-08-28T09:15:00Z',
        updatedAt: '2026-08-30T11:20:00Z',
        tags: ['planeacion', 'curriculo', 'literatura', 'anual', 'competencias'],
        description: 'Estructura por unidades de aprendizaje, competencias comunicativas, cronograma de lecturas obligatorias.',
        contentSummary: 'Unidad 1: La novela hispanoamericana contemporánea. Unidad 2: Técnicas de redacción argumentativa.',
        previewSnippet: 'Competencia 1: Se comunica oralmente en su lengua materna. Desempeño: Expresa ideas con claridad adaptando el registro...',
        isFavorite: true,
        smartCategory: 'curriculum',
        syncStatus: 'synced',
      },
      {
        id: 'doc-3',
        title: 'Acta Oficial de Notas y Cierre de Bimestre I',
        fileName: 'Acta_Oficial_Cierre_1Bim_2Sec.xlsx',
        format: 'xlsx',
        fileSize: '2.1 MB',
        course: 'Ciencias Naturales y Biología',
        grade: '2° Secundaria',
        section: 'Sección A',
        authorTeacherId: 't-3',
        authorTeacherName: 'Prof. Roberto Morales',
        createdAt: '2026-08-15T16:45:00Z',
        updatedAt: '2026-08-25T10:00:00Z',
        tags: ['calificaciones', 'acta', 'registro-oficial', 'secundaria', 'notas'],
        description: 'Consolidado de calificaciones del primer bimestre, promedios ponderados y estudiantes en recuperación.',
        contentSummary: 'Matrícula: 28 estudiantes. Promedio general del salón: 16.4 / 20. Alumnos en apoyo: 3.',
        previewSnippet: 'Registro N° 045-2026. Alumno: Aguilar Pérez, Mateo. Promedio: 17. Observación: Destacado en laboratorio.',
        isFavorite: false,
        smartCategory: 'record',
        syncStatus: 'synced',
      },
      {
        id: 'doc-4',
        title: 'Guía Didáctica de Laboratorio: Ecosistemas y Cadenas Tróficas',
        fileName: 'Guia_Lab_Ecosistemas_3Sec.pdf',
        format: 'pdf',
        fileSize: '3.6 MB',
        course: 'Ciencias Naturales y Biología',
        grade: '3° Secundaria',
        section: 'Sección A',
        authorTeacherId: 't-3',
        authorTeacherName: 'Prof. Roberto Morales',
        createdAt: '2026-09-01T08:00:00Z',
        updatedAt: '2026-09-01T08:00:00Z',
        tags: ['laboratorio', 'guia', 'ciencias', 'fichas', 'biologia'],
        description: 'Material ilustrado con infografías para el trabajo en microscopio y elaboración de terrarios escolares.',
        contentSummary: 'Incluye cuestionario de 10 puntos, lista de materiales reciclables y rúbrica de informe científico.',
        previewSnippet: 'Objetivo de la sesión: Identificar los niveles tróficos en un microecosistema acuático simulado...',
        isFavorite: true,
        smartCategory: 'material',
        syncStatus: 'synced',
      },
      {
        id: 'doc-5',
        title: 'Informe Psicopedagógico - Adaptación Curricular',
        fileName: 'Informe_Psicopedagogico_Caso_3Sec_B.pdf',
        format: 'pdf',
        fileSize: '950 KB',
        course: 'Historia y Geografía',
        grade: '3° Secundaria',
        section: 'Sección B',
        authorTeacherId: 't-4',
        authorTeacherName: 'Directora Elena Salazar',
        createdAt: '2026-08-20T12:00:00Z',
        updatedAt: '2026-08-20T12:00:00Z',
        tags: ['psicopedagogico', 'adaptacion-curricular', 'tutoria', 'apoyo-estudiantil'],
        description: 'Evaluación psicopedagógica y pautas pedagógicas de apoyo especial para el estudiante con TDAH.',
        contentSummary: 'Estrategias recomendadas: fragmentación de consignas, tiempo adicional en pruebas escritas, refuerzo positivo.',
        previewSnippet: 'Diagnóstico escolar pedagógico: Se observa dificultad en la atención sostenida. Recomendaciones para el claustro...',
        isFavorite: false,
        smartCategory: 'record',
        syncStatus: 'synced',
      }
    ],
    schedules: [
      {
        id: 'sch-1',
        teacherId: 'docente-demo-1',
        teacherName: 'Prof. Carlos Mendoza',
        course: 'Matemáticas',
        dayOfWeek: 'Lunes',
        startTime: '08:00 AM',
        endTime: '09:30 AM',
        grade: '3° Secundaria',
        section: 'Sección A',
        notes: 'Álgebra y resolución de problemas',
        color: 'blue',
        createdAt: '2026-09-01T08:00:00.000Z',
        updatedAt: '2026-09-01T08:00:00.000Z',
      },
      {
        id: 'sch-2',
        teacherId: 'docente-demo-2',
        teacherName: 'Prof. Elena Rostova',
        course: 'Comunicación y Literatura',
        dayOfWeek: 'Lunes',
        startTime: '09:45 AM',
        endTime: '11:15 AM',
        grade: '4° Secundaria',
        section: 'Sección B',
        notes: 'Comprensión lectora y ensayo argumentativo',
        color: 'amber',
        createdAt: '2026-09-01T08:00:00.000Z',
        updatedAt: '2026-09-01T08:00:00.000Z',
      },
      {
        id: 'sch-3',
        teacherId: 'docente-demo-1',
        teacherName: 'Prof. Carlos Mendoza',
        course: 'Matemáticas',
        dayOfWeek: 'Martes',
        startTime: '10:00 AM',
        endTime: '11:30 AM',
        grade: '1° Secundaria',
        section: 'Sección A',
        notes: 'Geometría plana',
        color: 'blue',
        createdAt: '2026-09-01T08:00:00.000Z',
        updatedAt: '2026-09-01T08:00:00.000Z',
      }
    ]
  };

  saveDatabase(initialDb);
  return initialDb;
}

function saveDatabase(db: SchoolDatabase) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving school database:', err);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  let db = loadDatabase();

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Sync all data: supports GET and POST (for bidirectional merging & persistence)
  app.get('/api/sync-all', (req, res) => {
    if (!db.deletedTeacherIds) db.deletedTeacherIds = [];
    if (!db.deletedDocumentIds) db.deletedDocumentIds = [];
    if (!db.deletedScheduleIds) db.deletedScheduleIds = [];
    if (!db.deletedFolderIds) db.deletedFolderIds = [];

    // Ensure deleted items are not returned
    if (db.deletedTeacherIds.length > 0) {
      db.teachers = db.teachers.filter(t => !db.deletedTeacherIds!.includes(t.id));
    }
    if (db.deletedDocumentIds.length > 0) {
      db.documents = db.documents.filter(d => !db.deletedDocumentIds!.includes(d.id));
    }
    if (db.deletedScheduleIds.length > 0) {
      db.schedules = db.schedules.filter(s => !db.deletedScheduleIds!.includes(s.id));
    }
    if (db.deletedFolderIds.length > 0 && db.folders) {
      db.folders = db.folders.filter(f => !db.deletedFolderIds!.includes(f.id));
    }

    res.json({
      teachers: db.teachers,
      documents: db.documents,
      schedules: db.schedules,
      folders: db.folders || [],
      deletedTeacherIds: db.deletedTeacherIds,
      deletedDocumentIds: db.deletedDocumentIds,
      deletedScheduleIds: db.deletedScheduleIds,
      deletedFolderIds: db.deletedFolderIds,
    });
  });

  app.post('/api/sync-all', (req, res) => {
    const clientData = req.body || {};
    let modified = false;

    if (!db.deletedTeacherIds) db.deletedTeacherIds = [];
    if (!db.deletedDocumentIds) db.deletedDocumentIds = [];
    if (!db.deletedScheduleIds) db.deletedScheduleIds = [];
    if (!db.deletedFolderIds) db.deletedFolderIds = [];

    // Merge deletedTeacherIds from client
    if (Array.isArray(clientData.deletedTeacherIds)) {
      for (const dId of clientData.deletedTeacherIds) {
        if (dId && typeof dId === 'string' && !db.deletedTeacherIds.includes(dId)) {
          db.deletedTeacherIds.push(dId);
          modified = true;
        }
      }
    }

    // Merge deletedDocumentIds from client
    if (Array.isArray(clientData.deletedDocumentIds)) {
      for (const docId of clientData.deletedDocumentIds) {
        if (docId && typeof docId === 'string' && !db.deletedDocumentIds.includes(docId)) {
          db.deletedDocumentIds.push(docId);
          modified = true;
        }
      }
    }

    // Merge deletedScheduleIds from client
    if (Array.isArray(clientData.deletedScheduleIds)) {
      for (const schId of clientData.deletedScheduleIds) {
        if (schId && typeof schId === 'string' && !db.deletedScheduleIds.includes(schId)) {
          db.deletedScheduleIds.push(schId);
          modified = true;
        }
      }
    }

    // Merge deletedFolderIds from client
    if (Array.isArray(clientData.deletedFolderIds)) {
      for (const fId of clientData.deletedFolderIds) {
        if (fId && typeof fId === 'string' && !db.deletedFolderIds.includes(fId)) {
          db.deletedFolderIds.push(fId);
          modified = true;
        }
      }
    }

    // Purge any deleted teacher from db.teachers
    if (db.deletedTeacherIds.length > 0) {
      const beforeLen = db.teachers.length;
      db.teachers = db.teachers.filter(t => !db.deletedTeacherIds!.includes(t.id));
      if (db.teachers.length !== beforeLen) {
        modified = true;
      }
    }

    // Purge any deleted document from db.documents
    if (db.deletedDocumentIds.length > 0) {
      const beforeLen = db.documents.length;
      db.documents = db.documents.filter(d => !db.deletedDocumentIds!.includes(d.id));
      if (db.documents.length !== beforeLen) {
        modified = true;
      }
    }

    // Purge any deleted schedule from db.schedules
    if (db.deletedScheduleIds.length > 0) {
      const beforeLen = db.schedules.length;
      db.schedules = db.schedules.filter(s => !db.deletedScheduleIds!.includes(s.id));
      if (db.schedules.length !== beforeLen) {
        modified = true;
      }
    }

    // Purge any deleted folder from db.folders
    if (db.deletedFolderIds.length > 0 && db.folders) {
      const beforeLen = db.folders.length;
      db.folders = db.folders.filter(f => !db.deletedFolderIds!.includes(f.id));
      if (db.folders.length !== beforeLen) {
        modified = true;
      }
    }

    // Merge teachers: never resurrect deleted accounts
    if (Array.isArray(clientData.teachers) && clientData.teachers.length > 0) {
      for (const ct of clientData.teachers) {
        if (!ct || !ct.name || !ct.id) continue;
        if (db.deletedTeacherIds.includes(ct.id)) continue;

        const existingIdx = db.teachers.findIndex(
          t => t.id === ct.id ||
               (ct.dni && t.dni && t.dni.trim() === ct.dni.trim()) ||
               (ct.username && t.username && t.username.toLowerCase() === ct.username.toLowerCase()) ||
               (ct.name && t.name && t.name.trim().toLowerCase() === ct.name.trim().toLowerCase())
        );
        if (existingIdx === -1) {
          db.teachers.push(ct);
          modified = true;
        } else {
          db.teachers[existingIdx] = {
            ...db.teachers[existingIdx],
            ...ct,
            id: db.teachers[existingIdx].id,
          };
          modified = true;
        }
      }
    }

    // Merge documents (never resurrect deleted ones, update existing rather than duplicate)
    if (Array.isArray(clientData.documents) && clientData.documents.length > 0) {
      for (const cd of clientData.documents) {
        if (!cd || !cd.id) continue;
        if (db.deletedDocumentIds.includes(cd.id)) continue;

        const existingIdx = db.documents.findIndex(d => d.id === cd.id);
        if (existingIdx === -1) {
          db.documents.push(cd);
          modified = true;
        } else {
          db.documents[existingIdx] = {
            ...db.documents[existingIdx],
            ...cd,
            id: db.documents[existingIdx].id,
          };
          modified = true;
        }
      }
    }

    // Merge schedules
    if (Array.isArray(clientData.schedules) && clientData.schedules.length > 0) {
      for (const cs of clientData.schedules) {
        if (!cs || !cs.id) continue;
        if (db.deletedScheduleIds.includes(cs.id)) continue;

        const existingIdx = db.schedules.findIndex(s => s.id === cs.id);
        if (existingIdx === -1) {
          db.schedules.push(cs);
          modified = true;
        } else {
          db.schedules[existingIdx] = {
            ...db.schedules[existingIdx],
            ...cs,
            id: db.schedules[existingIdx].id,
          };
          modified = true;
        }
      }
    }

    // Merge folders
    if (Array.isArray(clientData.folders) && clientData.folders.length > 0) {
      if (!db.folders) db.folders = [];
      for (const cf of clientData.folders) {
        if (!cf || !cf.id) continue;
        if (db.deletedFolderIds.includes(cf.id)) continue;

        const existingIdx = db.folders.findIndex(f => f.id === cf.id);
        if (existingIdx === -1) {
          db.folders.push(cf);
          modified = true;
        } else {
          db.folders[existingIdx] = {
            ...db.folders[existingIdx],
            ...cf,
            id: db.folders[existingIdx].id,
          };
          modified = true;
        }
      }
    }

    if (modified) {
      saveDatabase(db);
    }

    res.json({
      teachers: db.teachers,
      documents: db.documents,
      schedules: db.schedules,
      folders: db.folders || [],
      deletedTeacherIds: db.deletedTeacherIds,
      deletedDocumentIds: db.deletedDocumentIds,
      deletedScheduleIds: db.deletedScheduleIds,
      deletedFolderIds: db.deletedFolderIds,
    });
  });

  // --- TEACHERS & AUTH ---
  app.get('/api/teachers', (req, res) => {
    if (!db.deletedTeacherIds) db.deletedTeacherIds = [];
    if (db.deletedTeacherIds.length > 0) {
      db.teachers = db.teachers.filter(t => !db.deletedTeacherIds!.includes(t.id));
    }
    res.json(db.teachers);
  });

  app.post('/api/teachers', (req, res) => {
    const { id, name, username, password, dni, birthDate, phone, courseAssigned, specialty, roleLabel, avatar } = req.body;
    
    if (!password) {
      return res.status(400).json({ error: 'La contraseña es requerida.' });
    }

    const cleanName = String(name || '').trim();
    const cleanUsername = String(username || cleanName.toLowerCase().replace(/\s+/g, '_') || `docente_${Date.now()}`).trim();
    const cleanDni = String(dni || '').trim();

    if (!cleanName && !cleanUsername) {
      return res.status(400).json({ error: 'El nombre del docente es requerido.' });
    }

    if (!db.deletedTeacherIds) db.deletedTeacherIds = [];
    if (id) {
      db.deletedTeacherIds = db.deletedTeacherIds.filter(dId => dId !== id);
    }

    // Check if account already exists by id, username, or dni
    const existingIdx = db.teachers.findIndex(t => 
      (id && t.id === id) ||
      (cleanUsername && t.username.toLowerCase() === cleanUsername.toLowerCase()) ||
      (cleanDni && t.dni && t.dni.trim() === cleanDni)
    );

    if (existingIdx !== -1) {
      // Upsert: update existing account rather than throwing error and losing data
      db.teachers[existingIdx] = {
        ...db.teachers[existingIdx],
        name: cleanName || db.teachers[existingIdx].name,
        password: String(password),
        dni: cleanDni || db.teachers[existingIdx].dni,
        birthDate: birthDate !== undefined ? birthDate : db.teachers[existingIdx].birthDate,
        phone: phone?.trim() || db.teachers[existingIdx].phone,
        courseAssigned: courseAssigned?.trim() || db.teachers[existingIdx].courseAssigned,
        specialty: specialty || db.teachers[existingIdx].specialty,
        roleLabel: roleLabel || db.teachers[existingIdx].roleLabel,
        avatar: avatar || db.teachers[existingIdx].avatar,
      };
      saveDatabase(db);
      return res.status(200).json(db.teachers[existingIdx]);
    }

    const newTeacher: TeacherRecord = {
      id: id || `teacher-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: cleanName || cleanUsername,
      username: cleanUsername,
      password: String(password),
      dni: cleanDni,
      birthDate: birthDate || '',
      phone: phone?.trim() || '',
      courseAssigned: courseAssigned?.trim() || specialty?.trim() || 'Docente de Secundaria',
      role: 'regular',
      roleLabel: roleLabel || `Docente de ${courseAssigned || specialty || 'Educación Secundaria'}`,
      specialty: specialty || courseAssigned || 'General',
      avatar: avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(cleanName || cleanUsername)}&backgroundColor=4f46e5,0284c7,0d9488,7c3aed`,
      createdAt: new Date().toISOString(),
    };

    db.teachers.push(newTeacher);
    saveDatabase(db);
    res.status(201).json(newTeacher);
  });

  app.put('/api/teachers/:id', (req, res) => {
    const { id } = req.params;
    const idx = db.teachers.findIndex(t => t.id === id);
    if (idx === -1) {
      return res.status(404).json({ error: 'Docente no encontrado' });
    }
    db.teachers[idx] = {
      ...db.teachers[idx],
      ...req.body,
    };
    saveDatabase(db);
    res.json(db.teachers[idx]);
  });

  app.delete('/api/teachers/:id', (req, res) => {
    const { id } = req.params;
    if (id === 'admin-directora') {
      return res.status(400).json({ error: 'No se puede eliminar la cuenta de Dirección.' });
    }

    if (!db.deletedTeacherIds) db.deletedTeacherIds = [];
    if (!db.deletedTeacherIds.includes(id)) {
      db.deletedTeacherIds.push(id);
    }

    db.teachers = db.teachers.filter(t => t.id !== id);
    db.schedules = db.schedules.filter(s => s.teacherId !== id);

    saveDatabase(db);
    res.json({ success: true, message: 'Cuenta eliminada permanentemente.' });
  });

  // Reset password endpoint: only requires full name and new password
  app.post('/api/auth/reset-password', (req, res) => {
    const { fullName, newPassword } = req.body;
    const cleanName = String(fullName || '').trim();
    const cleanPass = String(newPassword || '').trim();

    if (!cleanName) {
      return res.status(400).json({ error: 'Ingresa el nombre completo del docente.' });
    }
    if (!cleanPass || cleanPass.length < 4) {
      return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 4 caracteres.' });
    }

    if (cleanName.toLowerCase() === 'directora' || cleanName.toLowerCase() === 'directora general') {
      return res.status(400).json({ error: 'La contraseña de Dirección no puede restablecerse por este medio.' });
    }

    const teacher = db.teachers.find(t => 
      t.name.trim().toLowerCase() === cleanName.toLowerCase() ||
      (t.dni && t.dni.trim() === cleanName) ||
      t.username.trim().toLowerCase() === cleanName.toLowerCase()
    );

    if (!teacher) {
      return res.status(404).json({ error: `No se encontró ningún docente registrado con el nombre "${cleanName}".` });
    }

    teacher.password = cleanPass;
    saveDatabase(db);
    res.json({ success: true, message: `Contraseña actualizada para ${teacher.name}.`, teacherName: teacher.name });
  });

  // Login endpoint: Supports username, full name, or DNI
  app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    const cleanUser = String(username || '').trim();
    const cleanPass = String(password || '').trim();

    // Check Directora account
    if (cleanUser.toLowerCase() === 'directora') {
      if (cleanPass === '200710') {
        const directorTeacher: TeacherRecord = {
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
        return res.json({ success: true, teacher: directorTeacher });
      } else {
        return res.status(401).json({ error: 'Contraseña de dirección incorrecta.' });
      }
    }

    // Regular teacher check: match by username, full name, or DNI
    const teacher = db.teachers.find(t => 
      t.username.toLowerCase() === cleanUser.toLowerCase() ||
      t.name.toLowerCase() === cleanUser.toLowerCase() ||
      (t.dni && t.dni.trim() === cleanUser)
    );
    if (!teacher) {
      return res.status(404).json({ error: 'No se encontró ninguna cuenta docente con ese nombre o DNI.' });
    }

    if (teacher.password !== cleanPass) {
      return res.status(401).json({ error: 'Contraseña incorrecta.' });
    }

    res.json({ success: true, teacher });
  });

  // --- DOCUMENTS ---
  app.get('/api/documents', (req, res) => {
    if (!db.deletedDocumentIds) db.deletedDocumentIds = [];
    if (db.deletedDocumentIds.length > 0) {
      db.documents = db.documents.filter(d => !db.deletedDocumentIds!.includes(d.id));
    }
    res.json(db.documents);
  });

  app.post('/api/documents', (req, res) => {
    const docData = req.body;
    const docId = docData.id || `doc-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;

    if (!db.deletedDocumentIds) db.deletedDocumentIds = [];
    db.deletedDocumentIds = db.deletedDocumentIds.filter(id => id !== docId);

    const existingIdx = db.documents.findIndex(d => d.id === docId);
    if (existingIdx !== -1) {
      db.documents[existingIdx] = {
        ...db.documents[existingIdx],
        ...docData,
        id: docId,
        updatedAt: new Date().toISOString(),
      };
      saveDatabase(db);
      return res.status(200).json(db.documents[existingIdx]);
    }

    const newDoc: DocumentRecord = {
      ...docData,
      id: docId,
      createdAt: docData.createdAt || new Date().toISOString(),
      updatedAt: docData.updatedAt || new Date().toISOString(),
      syncStatus: 'synced',
    };
    db.documents.unshift(newDoc);
    saveDatabase(db);
    res.status(201).json(newDoc);
  });

  app.put('/api/documents/:id', (req, res) => {
    const { id } = req.params;
    const idx = db.documents.findIndex(d => d.id === id);
    if (idx === -1) {
      return res.status(404).json({ error: 'Documento no encontrado' });
    }
    db.documents[idx] = {
      ...db.documents[idx],
      ...req.body,
      updatedAt: new Date().toISOString(),
    };
    saveDatabase(db);
    res.json(db.documents[idx]);
  });

  app.delete('/api/documents/:id', (req, res) => {
    const { id } = req.params;
    if (!db.deletedDocumentIds) db.deletedDocumentIds = [];
    if (!db.deletedDocumentIds.includes(id)) {
      db.deletedDocumentIds.push(id);
    }
    db.documents = db.documents.filter(d => d.id !== id);
    saveDatabase(db);
    res.json({ success: true });
  });

  // --- SCHEDULES ---
  app.get('/api/schedules', (req, res) => {
    if (!db.deletedScheduleIds) db.deletedScheduleIds = [];
    if (db.deletedScheduleIds.length > 0) {
      db.schedules = db.schedules.filter(s => !db.deletedScheduleIds!.includes(s.id));
    }
    res.json(db.schedules);
  });

  app.post('/api/schedules', (req, res) => {
    const schData = req.body;
    const schId = schData.id || `sch-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;

    if (!db.deletedScheduleIds) db.deletedScheduleIds = [];
    db.deletedScheduleIds = db.deletedScheduleIds.filter(id => id !== schId);

    const existingIdx = db.schedules.findIndex(s => s.id === schId);
    if (existingIdx !== -1) {
      db.schedules[existingIdx] = {
        ...db.schedules[existingIdx],
        ...schData,
        id: schId,
        updatedAt: new Date().toISOString(),
      };
      saveDatabase(db);
      return res.status(200).json(db.schedules[existingIdx]);
    }

    const newSch: ScheduleRecord = {
      ...schData,
      id: schId,
      createdAt: schData.createdAt || new Date().toISOString(),
      updatedAt: schData.updatedAt || new Date().toISOString(),
    };
    db.schedules.unshift(newSch);
    saveDatabase(db);
    res.status(201).json(newSch);
  });

  app.put('/api/schedules/:id', (req, res) => {
    const { id } = req.params;
    const idx = db.schedules.findIndex(s => s.id === id);
    if (idx === -1) {
      return res.status(404).json({ error: 'Horario no encontrado' });
    }
    db.schedules[idx] = {
      ...db.schedules[idx],
      ...req.body,
      updatedAt: new Date().toISOString(),
    };
    saveDatabase(db);
    res.json(db.schedules[idx]);
  });

  app.delete('/api/schedules/:id', (req, res) => {
    const { id } = req.params;
    if (!db.deletedScheduleIds) db.deletedScheduleIds = [];
    if (!db.deletedScheduleIds.includes(id)) {
      db.deletedScheduleIds.push(id);
    }
    db.schedules = db.schedules.filter(s => s.id !== id);
    saveDatabase(db);
    res.json({ success: true });
  });

  // --- FOLDERS ---
  app.get('/api/folders', (req, res) => {
    if (!db.deletedFolderIds) db.deletedFolderIds = [];
    if (db.deletedFolderIds.length > 0 && db.folders) {
      db.folders = db.folders.filter(f => !db.deletedFolderIds!.includes(f.id));
    }
    res.json(db.folders || []);
  });

  app.post('/api/folders', (req, res) => {
    const folderData = req.body;
    const folderId = folderData.id || `folder-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;

    if (!db.deletedFolderIds) db.deletedFolderIds = [];
    db.deletedFolderIds = db.deletedFolderIds.filter(id => id !== folderId);

    if (!db.folders) db.folders = [];
    const existingIdx = db.folders.findIndex(f => f.id === folderId);
    if (existingIdx !== -1) {
      db.folders[existingIdx] = {
        ...db.folders[existingIdx],
        ...folderData,
        id: folderId,
        updatedAt: new Date().toISOString(),
      };
      saveDatabase(db);
      return res.status(200).json(db.folders[existingIdx]);
    }

    const newFolder: FolderRecord = {
      ...folderData,
      id: folderId,
      createdAt: folderData.createdAt || new Date().toISOString(),
      updatedAt: folderData.updatedAt || new Date().toISOString(),
    };
    db.folders.push(newFolder);
    saveDatabase(db);
    res.status(201).json(newFolder);
  });

  app.put('/api/folders/:id', (req, res) => {
    const { id } = req.params;
    if (!db.folders) db.folders = [];
    const idx = db.folders.findIndex(f => f.id === id);
    if (idx === -1) {
      return res.status(404).json({ error: 'Carpeta no encontrada' });
    }
    db.folders[idx] = {
      ...db.folders[idx],
      ...req.body,
      updatedAt: new Date().toISOString(),
    };
    if (req.body.name) {
      db.documents.forEach(doc => {
        if (doc.folderId === id) {
          doc.folderName = req.body.name;
        }
      });
    }
    saveDatabase(db);
    res.json(db.folders[idx]);
  });

  app.delete('/api/folders/:id', (req, res) => {
    const { id } = req.params;
    if (!db.deletedFolderIds) db.deletedFolderIds = [];
    if (!db.deletedFolderIds.includes(id)) {
      db.deletedFolderIds.push(id);
    }
    if (!db.folders) db.folders = [];
    db.folders = db.folders.filter(f => f.id !== id);
    db.documents.forEach(doc => {
      if (doc.folderId === id) {
        delete doc.folderId;
        delete doc.folderName;
      }
    });
    saveDatabase(db);
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`DocuDocente server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
