import os
import zipfile
import base64
import glob

print("Starting package generator...")

# 1. Read dist assets
dist_dir = "dist"
assets_dir = os.path.join(dist_dir, "assets")

css_files = glob.glob(os.path.join(assets_dir, "*.css"))
js_files = glob.glob(os.path.join(assets_dir, "*.js"))

if not css_files or not js_files:
    raise Exception(f"No CSS or JS found in {assets_dir}. Run npm run build first.")

css_path = css_files[0]
js_path = js_files[0]

with open(css_path, "r", encoding="utf-8") as f:
    css_content = f.read()

with open(js_path, "r", encoding="utf-8") as f:
    js_content = f.read()

# Load image and convert to base64
insignia_path = "public/insignia_colegio.jpg"
if os.path.exists(insignia_path):
    with open(insignia_path, "rb") as f:
        img_b64 = base64.b64encode(f.read()).decode("utf-8")
        img_data_url = f"data:image/jpeg;base64,{img_b64}"
else:
    img_data_url = ""

# 2. Build lightweight Google Apps Script Index.html and full standalone HTML
apps_script_lightweight_html = """<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>I.E. Libertador Mariscal Castilla - Archivo Docente (Oxapampa 1954)</title>
  <style>
    html, body { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; background-color: #0f172a; }
    iframe { width: 100%; height: 100%; border: none; display: block; }
  </style>
</head>
<body>
  <iframe src="https://ais-pre-fx7rhak2xqwjat2x6nzq65-382427332876.us-east1.run.app" allow="camera; microphone; clipboard-read; clipboard-write; fullscreen" allowfullscreen></iframe>
</body>
</html>
"""

# Standalone offline HTML with embedded assets for PC/offline use
apps_script_html = f"""<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>I.E. Libertador Mariscal Castilla - Archivo Docente (Oxapampa 1954)</title>
    <link rel="icon" type="image/jpeg" href="{img_data_url}" />
    <meta name="description" content="Sistema oficial de archivo docente, documentos curriculares, horarios de clase y sincronización en la nube de la I.E. Integrada Libertador Mariscal Castilla - Oxapampa." />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
    <style>
{css_content}
    </style>
  </head>
  <body class="bg-slate-100 text-slate-800 antialiased font-['Plus_Jakarta_Sans',sans-serif]">
    <div id="root"></div>
    <script type="module">
{js_content}
    </script>
  </body>
</html>
"""

if img_data_url:
    apps_script_html = apps_script_html.replace("./insignia_colegio.jpg", img_data_url)
    apps_script_html = apps_script_html.replace("/insignia_colegio.jpg", img_data_url)

# Save lightweight Index.html for Google Apps Script (avoids 1MB text limit & blank screen)
with open("public/Index.html", "w", encoding="utf-8") as f:
    f.write(apps_script_lightweight_html)
with open("dist/Index.html", "w", encoding="utf-8") as f:
    f.write(apps_script_lightweight_html)

# Save full bundle for local offline browser use
with open("public/Index_offline_completo.html", "w", encoding="utf-8") as f:
    f.write(apps_script_html)
with open("dist/Index_offline_completo.html", "w", encoding="utf-8") as f:
    f.write(apps_script_html)

print("Generated public/Index.html (lightweight Apps Script HTML) & Index_offline_completo.html")

# 3. Create updated Codigo.gs for Google Apps Script
codigo_gs = '''/**
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
'''

with open("public/Codigo.gs", "w", encoding="utf-8") as f:
    f.write(codigo_gs)
with open("dist/Codigo.gs", "w", encoding="utf-8") as f:
    f.write(codigo_gs)

# 4. Instructions for Google Apps Script
appsscript_instructions = """=============================================================================
GUÍA RÁPIDA: CÓMO EJECUTAR LA PÁGINA WEB EN GOOGLE APPS SCRIPT
I.E. Libertador Mariscal Castilla - Oxapampa (1954)
=============================================================================

Google Apps Script te permite alojar esta página web GRATIS directamente en los
servidores de Google, con su propio enlace web público (URL de Web App).

PASO A PASO:
------------
1. Ve a https://script.google.com/ e inicia sesión con tu cuenta de Google.
2. Haz clic en el botón superior izquierdo: "Nuevo proyecto".
3. En el editor verás un archivo llamado 'Código.gs' (o 'Code.gs').
   - Borra lo que tenga y PEGA todo el contenido del archivo 'Codigo.gs' que viene en este ZIP.
4. En el menú de la izquierda, junto a "Archivos", haz clic en el símbolo '+' y selecciona "HTML".
   - Nómbralo exactamente: Index
   - El editor creará 'Index.html'.
   - Borra lo que tenga y PEGA todo el contenido del archivo 'Index.html' que viene en este ZIP.
5. Haz clic en el icono de guardar (el disquete) o presiona Ctrl+S.
6. En la parte superior derecha, haz clic en el botón azul "Implementar" -> "Nueva implementación".
7. Haz clic en el engranaje (⚙️) junto a "Seleccionar tipo" y elige "Aplicación web".
8. Configura:
   - Descripción: Archivo Docente Castilla 2026
   - Ejecutar como: "Yo" (tu cuenta de correo)
   - Quién tiene acceso: "Cualquier usuario" (Anyone)
9. Haz clic en "Implementar" y autoriza los permisos si Google te lo solicita.
10. ¡LISTO! Google te dará un enlace que termina en '/exec'. 
    Ese enlace es tu página web funcionando en vivo en internet.
"""

with open("public/INSTRUCCIONES_APPS_SCRIPT.txt", "w", encoding="utf-8") as f:
    f.write(appsscript_instructions)

# 5. Instructions for Web Hosting and PC
web_instructions = """=============================================================================
GUÍA RÁPIDA: CÓMO USAR LA PÁGINA WEB EN CUALQUIER COMPUTADORA O SERVIDOR
I.E. Libertador Mariscal Castilla - Oxapampa (1954)
=============================================================================

OPCIÓN A: ABRIR DIRECTAMENTE EN TU COMPUTADORA (Sin instalar nada)
-----------------------------------------------------------------
1. Descomprime este archivo .ZIP en cualquier carpeta de tu PC.
2. Haz doble clic en 'index.html'.
3. Se abrirá inmediatamente en Google Chrome, Microsoft Edge o cualquier navegador.
4. ¡Listo! Puedes guardar archivos, ver los horarios y utilizar la plataforma.

OPCIÓN B: SUBIR A UN HOSTING GRATUITO EN INTERNET
-------------------------------------------------
Puedes tener tu página web en internet en 1 minuto sin pagar nada:
1. NETLIFY (https://app.netlify.com/drop):
   - Arrastra la carpeta descomprimida a la pantalla de Netlify y te dará un link web instantáneo.
2. VERCEL (https://vercel.com/):
   - Importa o sube la carpeta y tendrás tu dominio web activo.
3. CPANEL / HOSTING ESCOLAR:
   - Sube los archivos a la carpeta 'public_html' mediante el administrador de archivos.

OPCIÓN C: SERVIDOR NODE.JS COMPLETO
-----------------------------------
Si deseas ejecutar con el backend Node.js en una laptop o servidor local:
1. Abre una terminal en la carpeta descomprimida.
2. Ejecuta:
   npm install
   npm run dev
3. Abre http://localhost:3000 en tu navegador.
"""

with open("public/LEEME_COMO_ABRIR_O_SUBIR.txt", "w", encoding="utf-8") as f:
    f.write(web_instructions)

# 6. Create ZIP 1: google-apps-script.zip
print("Creating public/google-apps-script.zip...")
with zipfile.ZipFile("public/google-apps-script.zip", "w", zipfile.ZIP_DEFLATED) as z:
    z.write("public/Codigo.gs", "Codigo.gs")
    z.write("public/Index.html", "Index.html")
    z.write("public/appsscript.json", "appsscript.json")
    z.write("public/INSTRUCCIONES_APPS_SCRIPT.txt", "INSTRUCCIONES_APPS_SCRIPT.txt")

# 7. Create ZIP 2: archivo-docente-pagina-web.zip (Ready to open or host)
print("Creating public/archivo-docente-pagina-web.zip...")
with zipfile.ZipFile("public/archivo-docente-pagina-web.zip", "w", zipfile.ZIP_DEFLATED) as z:
    z.write("dist/index.html", "index.html")
    z.write("public/Index.html", "Index_apps_script.html")
    z.write("public/LEEME_COMO_ABRIR_O_SUBIR.txt", "LEEME_COMO_ABRIR_O_SUBIR.txt")
    if os.path.exists("public/insignia_colegio.jpg"):
        z.write("public/insignia_colegio.jpg", "insignia_colegio.jpg")
    for root, dirs, files in os.walk(assets_dir):
        for file in files:
            full_path = os.path.join(root, file)
            rel_path = os.path.relpath(full_path, dist_dir)
            z.write(full_path, rel_path)

# 8. Create ZIP 3: docudocente-app-completo.zip (Source code for devs)
print("Creating public/docudocente-app-completo.zip...")
excluded_dirs = {"node_modules", ".git", "dist", ".cache"}
excluded_extensions = {".zip"}

with zipfile.ZipFile("public/docudocente-app-completo.zip", "w", zipfile.ZIP_DEFLATED) as z:
    for root, dirs, files in os.walk("."):
        dirs[:] = [d for d in dirs if d not in excluded_dirs and not d.startswith(".")]
        for file in files:
            if file.startswith(".") or any(file.endswith(ext) for ext in excluded_extensions):
                continue
            full_path = os.path.join(root, file)
            rel_path = os.path.relpath(full_path, ".")
            z.write(full_path, rel_path)

# Copy zips and txts to dist so both dev & prod serve them
for f in ["google-apps-script.zip", "archivo-docente-pagina-web.zip", "docudocente-app-completo.zip", "INSTRUCCIONES_APPS_SCRIPT.txt", "LEEME_COMO_ABRIR_O_SUBIR.txt", "Index.html", "Codigo.gs"]:
    src = os.path.join("public", f)
    dst = os.path.join("dist", f)
    if os.path.exists(src):
        with open(src, "rb") as s, open(dst, "wb") as d:
            d.write(s.read())

print("All packages built successfully!")
