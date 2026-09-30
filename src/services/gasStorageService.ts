import { SchoolDocument, StorageFolder } from '../types';

export const GAS_API_URL = 'https://script.google.com/macros/s/AKfycbzm5y5lTxQp8UnlzgmHdCAfLzKxTyBnMviiBRaWc53dE4O8xCDECOwqoFAleZjt4xkP/exec';

export interface GasSyncState {
  isLoading: boolean;
  isSaving: boolean;
  lastSyncedAt: string | null;
  error: string | null;
  successMessage: string | null;
}

type StateListener = (state: GasSyncState) => void;

class GasStorageService {
  private url: string = GAS_API_URL;
  private state: GasSyncState = {
    isLoading: false,
    isSaving: false,
    lastSyncedAt: null,
    error: null,
    successMessage: null,
  };
  private listeners: Set<StateListener> = new Set();
  private pendingPostTimeout: any = null;

  constructor() {
    // Attempt to recover last sync timestamp
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        this.state.lastSyncedAt = window.localStorage.getItem('gas_last_sync_timestamp');
      }
    } catch {}
  }

  public subscribe(listener: StateListener): () => void {
    this.listeners.add(listener);
    listener({ ...this.state });
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    const copy = { ...this.state };
    this.listeners.forEach((listener) => {
      try {
        listener(copy);
      } catch (err) {
        console.error('GasStorageService listener error:', err);
      }
    });
  }

  public getState(): GasSyncState {
    return { ...this.state };
  }

  /**
   * Petición GET al iniciar la aplicación para obtener la lista de documentos actualizados.
   */
  public async fetchDocumentsFromGas(): Promise<{
    documents: SchoolDocument[];
    folders: StorageFolder[];
  }> {
    this.state.isLoading = true;
    this.state.error = null;
    this.notify();

    try {
      let rawData: any = null;
      let fetched = false;

      // 1. Intento directo con redirect: 'follow'
      try {
        const response = await fetch(this.url, {
          method: 'GET',
          redirect: 'follow',
        });
        if (response.ok) {
          rawData = await response.json();
          fetched = true;
        }
      } catch (directErr) {
        console.warn('Conexión directa con Google Apps Script arrojó advertencia, intentando vía proxy escolar:', directErr);
      }

      // 2. Si falló la llamada directa por políticas de iframe o navegador, intentar proxy del servidor
      if (!fetched) {
        try {
          const fallbackRes = await fetch('/api/gas-storage');
          if (fallbackRes.ok) {
            rawData = await fallbackRes.json();
            fetched = true;
          }
        } catch {}
      }

      if (!fetched && rawData === null) {
        throw new Error('No se pudo conectar con la API de Google Apps Script');
      }

      const parsed = this.parseGasResponse(rawData);

      this.state.isLoading = false;
      this.state.lastSyncedAt = new Date().toISOString();
      this.state.error = null;
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem('gas_last_sync_timestamp', this.state.lastSyncedAt);
        }
      } catch {}
      this.notify();

      return parsed;
    } catch (err: any) {
      console.error('Error fetching documents from Google Apps Script:', err);
      this.state.isLoading = false;
      this.state.error = err.message || 'No se pudo conectar con la API de Google Apps Script';
      this.notify();
      throw err;
    }
  }

  /**
   * Petición POST enviando la lista completa de datos en formato JSON cada vez que
   * un usuario crea, edita o elimina un archivo o carpeta.
   */
  public async postAllDataToGas(
    documents: SchoolDocument[],
    folders: StorageFolder[]
  ): Promise<{ success: boolean; status?: string }> {
    this.state.isSaving = true;
    this.state.error = null;
    this.notify();

    try {
      // Preparamos la lista completa de datos unificada en formato JSON
      const fullDataList = [
        ...documents.map((doc) => ({
          ...doc,
          // aseguramos campos limpios
          syncStatus: 'synced' as const,
        })),
        ...folders.map((folder) => ({
          ...folder,
          type: 'folder' as const,
          isFolder: true,
        })),
      ];

      // Usamos text/plain;charset=utf-8 para evitar preflight OPTIONS de CORS en Apps Script Web Apps
      let posted = false;
      let resJson: any = { status: 'ok' };

      // 1. Envío directo al endpoint de Google Apps Script
      try {
        const response = await fetch(this.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'text/plain;charset=utf-8',
          },
          body: JSON.stringify(fullDataList),
          redirect: 'follow',
        });
        if (response.ok) {
          posted = true;
          const resText = await response.text();
          try {
            resJson = JSON.parse(resText);
          } catch {}
        }
      } catch (directPostErr) {
        console.warn('Envío directo a Google Apps Script arrojó advertencia, intentando vía proxy escolar:', directPostErr);
      }

      // 2. Si falló la llamada directa por políticas de iframe o navegador, intentar proxy del servidor
      if (!posted) {
        try {
          const fallbackRes = await fetch('/api/gas-storage', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(fullDataList),
          });
          if (fallbackRes.ok) {
            posted = true;
            resJson = await fallbackRes.json().catch(() => ({ status: 'ok' }));
          }
        } catch {}
      }

      if (!posted) {
        throw new Error('Error al sincronizar datos con Google Apps Script');
      }

      this.state.isSaving = false;
      this.state.lastSyncedAt = new Date().toISOString();
      this.state.error = null;
      this.state.successMessage = 'Datos sincronizados exitosamente con Google Apps Script';
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem('gas_last_sync_timestamp', this.state.lastSyncedAt);
        }
      } catch {}
      this.notify();

      return { success: true, status: resJson?.status || 'ok' };
    } catch (err: any) {
      console.error('Error posting data to Google Apps Script:', err);
      this.state.isSaving = false;
      this.state.error = err.message || 'Error al guardar los datos en Google Apps Script';
      this.notify();
      throw err;
    }
  }

  /**
   * Helper para interpretar tanto listas ([]) como objetos ({ documents: [], folders: [] })
   * provenientes de Google Apps Script.
   */
  private parseGasResponse(rawData: any): {
    documents: SchoolDocument[];
    folders: StorageFolder[];
  } {
    const documents: SchoolDocument[] = [];
    const folders: StorageFolder[] = [];
    const folderIdsFound = new Set<string>();

    if (Array.isArray(rawData)) {
      rawData.forEach((item: any) => {
        if (!item || typeof item !== 'object') return;

        // Detectar si es una carpeta
        if (
          item.type === 'folder' ||
          item.isFolder === true ||
          (item.name && !item.title && !item.fileName)
        ) {
          const folderObj: StorageFolder = {
            id: item.id || `folder-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            name: item.name || item.title || 'Carpeta Institucional',
            description: item.description || '',
            color: item.color || 'sky',
            creatorTeacherId: item.creatorTeacherId || 'admin',
            creatorTeacherName: item.creatorTeacherName || 'Docente',
            createdAt: item.createdAt || new Date().toISOString(),
            updatedAt: item.updatedAt,
          };
          folders.push(folderObj);
          folderIdsFound.add(folderObj.id);
        } else {
          // Es un documento
          const docObj: SchoolDocument = {
            id: item.id || `doc-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            title: item.title || item.fileName || 'Documento sin título',
            fileName: item.fileName || item.title || 'archivo.pdf',
            format: item.format || 'pdf',
            fileSize: item.fileSize || '150 KB',
            course: item.course || 'General',
            grade: item.grade || '1°',
            section: item.section || 'A',
            authorTeacherId: item.authorTeacherId || 'admin',
            authorTeacherName: item.authorTeacherName || 'Docente Castilla',
            createdAt: item.createdAt || new Date().toISOString(),
            updatedAt: item.updatedAt || new Date().toISOString(),
            tags: Array.isArray(item.tags) ? item.tags : [],
            description: item.description || '',
            contentSummary: item.contentSummary || '',
            previewSnippet: item.previewSnippet || '',
            fileDataUrl: item.fileDataUrl || undefined,
            isFavorite: !!item.isFavorite,
            smartCategory: item.smartCategory || 'curriculum',
            syncStatus: 'synced',
            folderId: item.folderId,
            folderName: item.folderName,
            isSensitive: !!item.isSensitive,
            recipientTeacherId: item.recipientTeacherId,
            recipientTeacherName: item.recipientTeacherName,
            isDirectMessage: !!item.isDirectMessage,
            messageNotes: item.messageNotes,
          };
          documents.push(docObj);

          // Si el documento tiene folderId pero no existe aún en la lista de carpetas, lo reconstruimos
          if (docObj.folderId && docObj.folderName && !folderIdsFound.has(docObj.folderId)) {
            folders.push({
              id: docObj.folderId,
              name: docObj.folderName,
              color: 'sky',
              creatorTeacherId: docObj.authorTeacherId,
              creatorTeacherName: docObj.authorTeacherName,
              createdAt: docObj.createdAt,
            });
            folderIdsFound.add(docObj.folderId);
          }
        }
      });
    } else if (rawData && typeof rawData === 'object') {
      if (Array.isArray(rawData.documents)) {
        rawData.documents.forEach((d: any) => {
          if (d && typeof d === 'object') {
            documents.push(d as SchoolDocument);
          }
        });
      }
      if (Array.isArray(rawData.folders)) {
        rawData.folders.forEach((f: any) => {
          if (f && typeof f === 'object') {
            folders.push(f as StorageFolder);
          }
        });
      }
    }

    return { documents, folders };
  }
}

export const gasStorageService = new GasStorageService();
