/**
 * =========================================================================
 * I.E. INTEGRADA LIBERTADOR MARISCAL CASTILLA - OXAPAMPA (1954)
 * ARCHIVO DOCENTE & SISTEMA DE GESTIÓN ESCOLAR
 * Web App & Backend en Google Apps Script
 * =========================================================================
 * 
 * Este archivo permite ejecutar la página web completa directamente desde
 * Google Apps Script como una Aplicación Web (Web App) con 0 pantallas en blanco,
 * con soporte opcional para base de datos en Google Sheets.
 */

// 1. SERVIR LA PÁGINA WEB COMPLETA
function doGet(e) {
  var params = e ? e.parameter : {};
  
  // Si se llama como API JSON (?action=...)
  if (params && params.action) {
    return handleApiGet(e);
  }
  
  // Carga la aplicación web completa del Archivo Docente sin límites de tamaño ni pantallas en blanco
  var appUrl = "https://ais-pre-fx7rhak2xqwjat2x6nzq65-382427332876.us-east1.run.app";
  
  var html = '<!DOCTYPE html>' +
    '<html lang="es"><head>' +
    '<meta charset="UTF-8">' +
    '<meta name="viewport" content="width=device-width, initial-scale=1.0">' +
    '<title>I.E. Libertador Mariscal Castilla - Archivo Docente (Oxapampa 1954)</title>' +
    '<style>' +
    'html, body { margin:0; padding:0; width:100%; height:100%; overflow:hidden; background-color:#0f172a; }' +
    'iframe { width:100%; height:100%; border:none; display:block; }' +
    '</style>' +
    '</head><body>' +
    '<iframe src="' + appUrl + '" allow="camera; microphone; clipboard-read; clipboard-write; fullscreen" allowfullscreen></iframe>' +
    '</body></html>';

  return HtmlService.createHtmlOutput(html)
    .setTitle('I.E. Libertador Mariscal Castilla - Archivo Docente (Oxapampa 1954)')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0');
}

// 2. CONFIGURACIÓN INICIAL DE HOJAS EN GOOGLE SHEETS (OPCIONAL)
function setupDatabase() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) {
    Logger.log("Abre este script desde una Hoja de Cálculo de Google para activar la base de datos.");
    return;
  }
  
  var sheets = {
    "Docentes": [
      "ID", "Nombre", "Usuario", "Contraseña", "Rol", 
      "Especialidad", "Grado", "Teléfono", "Email", "Activo"
    ],
    "Documentos": [
      "ID", "Título", "Curso", "Grado", "Sección", 
      "Formato", "NombreArchivo", "Tamaño", "IDDocente", 
      "NombreDocente", "Descripción", "Resumen", "CarpetaID", 
      "NombreCarpeta", "FechaCreacion"
    ],
    "Carpetas": [
      "ID", "Nombre", "Descripción", "Color", 
      "IDDocenteCreador", "NombreDocenteCreador", "FechaCreacion"
    ],
    "Horarios": [
      "ID", "IDDocente", "NombreDocente", "Día", 
      "HoraInicio", "HoraFin", "Curso", "Grado", 
      "Sección", "Aula"
    ]
  };

  for (var sheetName in sheets) {
    var sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      sheet.appendRow(sheets[sheetName]);
      sheet.getRange(1, 1, 1, sheets[sheetName].length)
           .setBackground("#0f172a")
           .setFontColor("#f59e0b")
           .setFontWeight("bold");
      sheet.setFrozenRows(1);
    }
  }

  // Insertar usuario Administrador por defecto
  var sheetDocentes = ss.getSheetByName("Docentes");
  if (sheetDocentes && sheetDocentes.getLastRow() === 1) {
    sheetDocentes.appendRow([
      "admin-directora",
      "Directora / Administración",
      "admin",
      "admin2026",
      "director",
      "Dirección General",
      "Todos los Grados",
      "999888777",
      "direccion@castilla.edu.pe",
      "true"
    ]);
  }

  Logger.log("Base de datos de Google Sheets configurada con éxito.");
}

// 3. API GET PARA CONSULTA DE DATOS
function handleApiGet(e) {
  var params = e ? e.parameter : {};
  var action = params.action || "getAll";
  var result = {};

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) throw new Error("No hay hoja de cálculo vinculada.");

    if (action === "getTeachers" || action === "getAll") {
      result.teachers = getSheetDataAsJson(ss.getSheetByName("Docentes"));
    }
    if (action === "getDocuments" || action === "getAll") {
      result.documents = getSheetDataAsJson(ss.getSheetByName("Documentos"));
    }
    if (action === "getFolders" || action === "getAll") {
      result.folders = getSheetDataAsJson(ss.getSheetByName("Carpetas"));
    }
    if (action === "getSchedules" || action === "getAll") {
      result.schedules = getSheetDataAsJson(ss.getSheetByName("Horarios"));
    }

    result.status = "success";
    result.timestamp = new Date().toISOString();
  } catch (err) {
    result.status = "error";
    result.message = err.toString();
  }

  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

// 4. API POST PARA GUARDAR DATOS
function doPost(e) {
  var result = {};
  try {
    var contents = e.postData ? e.postData.contents : "{}";
    var payload = JSON.parse(contents);
    var action = payload.action;
    var data = payload.data || {};
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    if (!ss) throw new Error("No hay hoja de cálculo activa vinculada.");

    switch (action) {
      case "saveDocument":
        var sheetDoc = ss.getSheetByName("Documentos");
        var docId = data.id || "doc-" + new Date().getTime();
        sheetDoc.appendRow([
          docId,
          data.title || "",
          data.course || "",
          data.grade || "",
          data.section || "",
          data.format || "pdf",
          data.fileName || (data.title + ".pdf"),
          data.fileSize || "1.2 MB",
          data.authorTeacherId || "",
          data.authorTeacherName || "",
          data.description || "",
          data.contentSummary || "",
          data.folderId || "",
          data.folderName || "",
          data.createdAt || new Date().toISOString()
        ]);
        result = { status: "success", id: docId, message: "Documento registrado con éxito" };
        break;

      case "saveTeacher":
        var sheetTeachers = ss.getSheetByName("Docentes");
        var teacherId = data.id || "teacher-" + new Date().getTime();
        sheetTeachers.appendRow([
          teacherId,
          data.name || "",
          data.username || "",
          data.password || "123456",
          data.role || "teacher",
          data.specialty || "",
          data.grade || "",
          data.phone || "",
          data.email || "",
          "true"
        ]);
        result = { status: "success", id: teacherId, message: "Docente registrado con éxito" };
        break;

      case "saveFolder":
        var sheetFolders = ss.getSheetByName("Carpetas");
        var folderId = data.id || "folder-" + new Date().getTime();
        sheetFolders.appendRow([
          folderId,
          data.name || "",
          data.description || "",
          data.color || "blue",
          data.creatorTeacherId || "",
          data.creatorTeacherName || "",
          new Date().toISOString()
        ]);
        result = { status: "success", id: folderId, message: "Carpeta creada con éxito" };
        break;

      default:
        result = { status: "error", message: "Acción no reconocida: " + action };
    }
  } catch (err) {
    result = { status: "error", message: err.toString() };
  }

  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

// 5. FUNCIÓN AUXILIAR PARA LEER TABLAS
function getSheetDataAsJson(sheet) {
  if (!sheet) return [];
  var rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) return [];

  var headers = rows[0];
  var data = [];

  for (var i = 1; i < rows.length; i++) {
    var row = rows[i];
    var item = {};
    for (var j = 0; j < headers.length; j++) {
      var key = String(headers[j]).trim();
      item[key] = row[j];
    }
    data.push(item);
  }
  return data;
}
