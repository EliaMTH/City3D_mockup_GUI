/* Finestre di dialogo del mockup, con dati fantoccio.
 * Ogni voce di DIALOGS è una funzione (ctx) => { title, w, body, foot }.
 *   body  HTML del contenuto
 *   foot  pulsanti: { t, primary, next: "id", close, log, left }
 * Etichette prese da lang_it_IT.ts e dai .ui della release 366fdda.
 */

const WORK = "C:/city3d/lavoro";
const DATA = "C:/city3d/dati/catania";

/* ---------------- helper ---------------- */
const H = {
  row: (label, ctrl, hint) => `<label>${label}</label><div>${ctrl}</div>${hint ? `<div class="hint">${hint}</div>` : ""}`,
  form: (...rows) => `<div class="form">${rows.join("")}</div>`,
  input: (v = "", ph = "", w) => `<input type="text" value="${v}" placeholder="${ph}"${w ? ` style="width:${w}px"` : ""}>`,
  num: (v, min = "", max = "", step = 1, w = 90) => `<input type="number" value="${v}" min="${min}" max="${max}" step="${step}" style="width:${w}px">`,
  select: (opts, sel, w) => `<select${w ? ` style="width:${w}px"` : ""}>${opts.map(o => `<option${o === sel ? " selected" : ""}>${o}</option>`).join("")}</select>`,
  check: (t, on) => `<label class="chk"><input type="checkbox"${on ? " checked" : ""}> ${t}</label>`,
  radio: (name, t, on) => `<label class="chk"><input type="radio" name="${name}"${on ? " checked" : ""}> ${t}</label>`,
  path: (v = "", ph = "automatico") => `<div class="pathrow"><input type="text" value="${v}" placeholder="${ph}"><button class="btn sm" data-dlg="fileGeneric">Sfoglia...</button></div>`,
  table: (cols, rows, { h = 200, sel = 0 } = {}) => `<div class="table-wrap" style="height:${h}px"><table class="grid small">
      <thead><tr>${cols.map(c => `<th>${c}</th>`).join("")}</tr></thead>
      <tbody>${rows.map((r, i) => `<tr${i === sel - 1 ? ' class="sel"' : ""}>${r.map(c => `<td>${c}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`,
  tabs: (pages) => `<div class="tabs">${pages.map((p, i) => `<button${i ? "" : ' class="active"'}>${p[0]}</button>`).join("")}</div>
      ${pages.map((p, i) => `<div class="tab-page${i ? " hidden" : ""}">${p[1]}</div>`).join("")}`,
  group: (title, html) => `<fieldset><legend>${title}</legend>${html}</fieldset>`,
};
const OK_CANCEL = (next) => [{ t: "OK", primary: true, next, close: true }, { t: "Annulla", close: true }];
const CLOSE = [{ t: "Chiudi", close: true }];

function msg(kind, title, text, foot) {
  const ico = { info: "i", warn: "!", err: "✖", question: "?" }[kind];
  return { title, w: 460, body: `<div class="msg"><div class="mico ${kind}">${ico}</div><div>${text}</div></div>`,
           foot: foot || [{ t: "OK", primary: true, close: true }] };
}

function fileDlg({ title, mode = "open", folder = DATA, filter = ["Tutti i file (*)"], files = [], name = "", next, okText }) {
  const rows = files.map(f => [`${f[0].endsWith("/") ? "📁" : "📄"} ${f[0].replace(/\/$/, "")}`, f[1] || "", f[2] || "", f[3] || "16/11/26 11:36"]);
  return {
    title, w: 720,
    body: `<div class="form">${H.row("Cerca in:", `<div class="pathrow">${H.select([folder, WORK, "C:/Users/utente/Documenti"], folder)}<button class="btn sm">↑</button><button class="btn sm">⌂</button></div>`)}</div>
      <div class="two-col" style="height:240px">
        <div class="sidebar-list" style="width:150px"><div>Computer</div><div>utente</div><div class="sel">catania</div><div>lavoro</div><div>Desktop</div></div>
        <div style="flex:1">${H.table(["Nome", "Dimensione", "Tipo", "Data ultima modifica"], rows, { h: 240, sel: files.findIndex(f => f[0] === name) + 1 })}</div>
      </div>
      ${H.form(H.row("Nome file:", H.input(name, "", 460)), H.row("Tipo file:", H.select(filter, filter[0], 460)))}`,
    foot: [{ t: okText || (mode === "save" ? "Salva" : "Apri"), primary: true, next, close: true }, { t: "Annulla", close: true }],
  };
}

const EPSG_ROWS = [
  ["25833", "ETRS89 / UTM zone 33N", "Proiettato"], ["32633", "WGS 84 / UTM zone 33N", "Proiettato"],
  ["7791", "RDN2008 / UTM zone 32N", "Proiettato"], ["7792", "RDN2008 / UTM zone 33N", "Proiettato"],
  ["4326", "WGS 84", "Geografico 2D"], ["3857", "WGS 84 / Pseudo-Mercator", "Proiettato"],
  ["6708", "RDN2008 / UTM zone 33N (N-E)", "Proiettato"], ["4979", "WGS 84", "Geografico 3D"],
];
function epsgDlg(title, declared, next) {
  return {
    title: title || "Seleziona sistema di riferimento (EPSG)", w: 640,
    body: `${declared ? `<div class="panel-box">Dichiarato dal file: EPSG:${declared}</div>` : ""}
      <div class="pathrow">${H.select(["Ultimi EPSG usati...", "EPSG:25833", "EPSG:32633", "EPSG:7791"], "Ultimi EPSG usati...", 200)}<input type="text" placeholder="Cerca codice o nome EPSG..." style="flex:1"></div>
      ${H.table(["Codice", "Nome", "Tipo"], EPSG_ROWS, { h: 200, sel: 1 })}
      <div class="code">+proj=utm +zone=33 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs</div>`,
    foot: OK_CANCEL(next),
  };
}

const BASIC_COLORS = ["#ff8080","#ffff80","#80ff80","#00ff80","#80ffff","#0080ff","#ff80c0","#ff80ff",
  "#ff0000","#ffff00","#80ff00","#00ff40","#00ffff","#0080c0","#8080c0","#ff00ff",
  "#804040","#ff8040","#00ff00","#008080","#004080","#8080ff","#800040","#ff0080",
  "#800000","#ff8000","#008000","#008040","#0000ff","#0000a0","#800080","#8000ff",
  "#400000","#804000","#004000","#004040","#000080","#000040","#400040","#400080",
  "#000000","#808000","#808040","#808080","#408080","#c0c0c0","#400040","#ffffff"];
function colorDlg(title, current = "#969696") {
  return {
    title, w: 560,
    body: `<div class="colordlg">
        <div><div style="margin-bottom:4px">Colori di base</div>
          <div class="swatches">${BASIC_COLORS.map(c => `<span style="background:${c}"${c === current ? ' class="sel"' : ""}></span>`).join("")}</div>
          <div style="margin:8px 0 4px">Colori personalizzati</div>
          <div class="swatches">${Array(16).fill('<span style="background:#fff"></span>').join("")}</div>
          <button class="btn" style="margin-top:6px;width:100%">Aggiungi ai colori personalizzati</button></div>
        <div><div class="sv-box"></div><div class="hue-bar" style="margin-top:6px"></div>
          <div style="display:flex;gap:10px;margin-top:8px">
            <div class="color-preview" style="background:${current}"></div>
            ${H.form(H.row("Tonalità:", H.num(0, 0, 359, 1, 60)), H.row("Sat:", H.num(0, 0, 255, 1, 60)), H.row("Val:", H.num(150, 0, 255, 1, 60)))}
            ${H.form(H.row("Rosso:", H.num(150, 0, 255, 1, 60)), H.row("Verde:", H.num(150, 0, 255, 1, 60)), H.row("Blu:", H.num(150, 0, 255, 1, 60)))}
          </div>
          ${H.form(H.row("HTML:", H.input(current, "", 90)))}
        </div></div>`,
    foot: OK_CANCEL(),
  };
}

/* Finestra di esecuzione di un comando di plugin, generata dagli ingressi del manifest. */
function pluginRun(plugin, version, cmd, inputs) {
  const ctl = (i) => {
    switch (i.type) {
      case "folder": return H.path(i.value || WORK, "");
      case "outputFile": return H.path(i.value || "", "");
      case "boolean": return H.check("", i.value);
      case "integer": return H.num(i.value, i.min, i.max);
      case "choice": return H.select(i.options, i.options[0]);
      case "asset": return H.select(["catania.obj", "catania.las", "trackD-hires-texture-TEST.obj"], "catania.obj");
      case "selection": return `<span>catania.obj: 29.008 facce selezionate</span>`;
      default: return H.input(i.value || "");
    }
  };
  return {
    title: `${plugin} ${version} — ${cmd}`, w: 620,
    body: `${H.group("Ingressi", H.form(...inputs.map(i => H.row(i.t + (i.req ? " *" : ""), ctl(i), i.hint))))}
      ${H.group("Impostazioni del plugin", `<div class="muted">Il plugin non dichiara impostazioni proprie.</div>`)}`,
    foot: [{ t: "Ripristina i valori predefiniti", left: true }, { t: "Annulla", close: true },
           { t: "Esegui", primary: true, next: "pluginResult", close: true }],
  };
}

/* ---------------- finestre ---------------- */
const DIALOGS = {
  /* ===== File ===== */
  newProject: () => ({
    title: "Nuovo Progetto", w: 520,
    body: H.form(
      H.row("Directory di Lavoro:", `<div class="pathrow">${H.input(WORK)}<button class="btn sm" data-dlg="fileGeneric">...</button></div>`),
      H.row("Nome Progetto:", H.input("catania_demo")),
      H.row("Descrizione Progetto:", `<textarea rows="4" style="width:100%">Prova di annotazione sul centro storico</textarea>`)),
    foot: OK_CANCEL("projectCrs"),
  }),
  openProject: () => ({
    title: "Apri Progetto", w: 760,
    body: `<div class="pathrow"><button class="btn sm">Volumi</button><button class="btn sm">Directory di lavoro</button><button class="btn sm">Home</button><button class="btn sm">Su</button><button class="btn sm">Aggiorna</button>
        <input type="text" value="${WORK}" style="flex:1"></div>
      <div>Seleziona un progetto:</div>
      <div class="two-col" style="height:240px">
        <div style="flex:1">${H.table(["Nome", "Tipo"], [["📁 catania_demo", "Cartella progetto"], ["📁 catania_sessione", "Cartella progetto"], ["📁 trackD_prova", "Cartella progetto"], ["🗜 matrice-esportato.zip", "File ZIP"]], { h: 240, sel: 1 })}</div>
        <div class="panel-box" style="width:250px">${H.group("Informazioni progetto", H.form(H.row("Tipo:", "Cartella progetto"), H.row("Nome:", "catania_demo"), H.row("Descrizione:", "Prova di annotazione sul centro storico")))}</div>
      </div>`,
    foot: OK_CANCEL(),
  }),
  openProjectFile: () => fileDlg({ title: "Apri un file di progetto", folder: WORK + "/catania_demo", filter: ["Sessione City3D (*.json)", "Tutti i file (*)"],
    files: [["annotations/"], ["geometry/"], ["project.json", "12,2 kB", "File json"], ["sessione_copia.json", "12,1 kB", "File json"]], name: "project.json" }),
  // Carica dal datalake (datalake/datalake_dialog.cpp): elenco remoto con Scarica e Seleziona per riga, elenco locale con Carica.
  datalake: () => ({
    title: "Sfoglia ...", w: 700,
    body: `${H.group("Datalake", `<div class="pathrow"><input type="text" placeholder="Cerca..." style="flex:1"><button class="btn sm" data-tip="Ricarica dati da remoto">⟳</button></div>
        ${H.table(["Nome file", "Data", "Ora", "", ""], [
          ["quartiere_centro.zip", "12/11/26", "10:42", '<button class="btn sm">Scarica</button>', H.check("Seleziona", true)],
          ["quartiere_nord.zip", "12/11/26", "10:40", '<button class="btn sm">Scarica</button>', H.check("Seleziona", false)],
          ["dtm_area.zip", "11/11/26", "18:05", '<button class="btn sm">Scarica</button>', H.check("Seleziona", false)]], { h: 120 })}
        <div class="btnrow left"><button class="btn sm">Seleziona tutto</button><button class="btn sm">Deseleziona tutto</button>
          <button class="btn sm" data-tip="Scarica tutti gli elementi selezionati">Scarica</button></div>`)}
      ${H.group("Filesystem", `<input type="text" placeholder="Cerca...">
        ${H.table(["Nome file", "Ultima modifica", ""], [["quartiere_centro.zip", "12/11/26 10:44", '<button class="btn sm" data-tip="Apri/Visualizza">Carica</button>']], { h: 80 })}`)}`,
    foot: CLOSE,
  }),
  datalakeSettings: () => ({
    title: "Download dal DataLake - Impostazioni", w: 420,
    body: `${H.form(H.row("Nome dell'area selezionata", H.input("quartiere_centro")))}
      <div>Quale versione vuoi caricare?</div>
      ${H.radio("dlres", "Bassa risoluzione", false)}${H.radio("dlres", "Media risoluzione", true)}${H.radio("dlres", "Alta risoluzione", false)}`,
    foot: OK_CANCEL(),
  }),
  saveSession: () => msg("info", "Salva la sessione", `Sessione salvata in: ${WORK}/catania_demo/project.json`),
  saveSessionAs: () => fileDlg({ title: "Salva la sessione con nome", mode: "save", folder: WORK + "/catania_demo", filter: ["Sessione City3D (*.json)"],
    files: [["annotations/"], ["geometry/"], ["project.json", "12,2 kB", "File json"]], name: "project.json", next: "overwrite" }),
  overwrite: () => msg("question", "Conferma salvataggio", "project.json esiste già.<br>Sostituirlo?",
    [{ t: "Sì", primary: true, next: "saveSession", close: true }, { t: "No", close: true }]),
  closeProject: () => msg("question", "Chiudi progetto", "La sessione di «catania_demo» è cambiata dall'ultimo salvataggio.<br>Salvarla prima di chiudere?<br><span class='muted'>Le modifiche ai file CityGML sono già scritte nei file.</span>",
    [{ t: "Salva", primary: true, next: "saveSession", close: true }, { t: "Non salvare", close: true }, { t: "Annulla", close: true }]),
  exportZip: () => fileDlg({ title: "Esporta progetto (.zip)", mode: "save", folder: WORK, filter: ["Archivio ZIP (*.zip)"], files: [["catania_demo/"], ["matrice-esportato.zip", "44,1 MB", "File zip"]], name: "catania_demo.zip", next: "exportDone" }),
  exportDone: () => msg("info", "Esporta progetto", "Progetto esportato in " + WORK + "/catania_demo.zip.<br><span class='muted'>CityGML, raster e NetCDF sono riferiti dalla sessione e non entrano nell'archivio.</span>"),
  workingFolder: () => ({
    title: "Selezione Cartella di Lavoro", w: 520,
    body: `<div>Seleziona la cartella di lavoro:</div><div class="pathrow">${H.input(WORK)}<button class="btn sm" data-dlg="fileGeneric">Sfoglia...</button></div>`,
    foot: OK_CANCEL(),
  }),
  preferences: () => ({
    title: "Preferenze", w: 860,
    body: H.tabs([
      ["Cartelle", H.form(
        H.row("Cartella di lavoro", H.path(WORK), "Dove si creano i nuovi progetti e da dove partono le finestre di scelta dei file. &nbsp;Predefinito: automatico"),
        H.row("Cartella dei download dal datalake", H.path(""), "I progetti scaricati dal datalake. Vuoto: C:/Users/utente/3D_annotation_TMP/datalake_projects &nbsp;Predefinito: automatico"),
        H.row("Vocabolario semantico", H.path(""), "Il pacchetto del vocabolario: la cartella con vocabulary.json. Si legge all'avvio: vale dal prossimo avvio. &nbsp;Predefinito: automatico"))],
      ["Sistemi di riferimento", H.form(
        H.row("CRS proposto per i nuovi progetti", `<div class="pathrow">${H.input("0")}<button class="btn sm" data-dlg="projectCrs">Scegli...</button></div>`, "Proposto nella scelta del CRS di un nuovo progetto. 0: nessuno."),
        H.row("CRS assunto per i layer GIS che non lo dichiarano", `<div class="pathrow">${H.input("25833")}<button class="btn sm" data-dlg="projectCrs">Scegli...</button></div>`, "Usato, e segnalato, quando un layer non dichiara il CRS. &nbsp;Predefinito: 25833"),
        H.row("CRS di drappeggio se né la mesh né il progetto ne hanno uno", `<div class="pathrow">${H.input("32633")}<button class="btn sm" data-dlg="projectCrs">Scegli...</button></div>`, "Predefinito: 32633"))],
      ["Visualizzazione", `<div data-note="${NOTE.sfondo}">` + H.form(
        H.row("Dimensione massima della texture (px)", H.num(8192, 1024, 16384), "Le immagini più grandi vengono ridotte. Vale dalla prossima mesh caricata."),
        H.row("Colore di una nuova mesh", `<div class="pathrow"><span class="color-preview" style="width:40px;height:20px;background:#969696"></span>${H.input("#969696", "", 90)}<button class="btn sm" data-dlg="bgColor">Scegli...</button></div>`),
        H.row("Sfondo, colore in basso", `<div class="pathrow"><span class="color-preview" style="width:40px;height:20px;background:#87ceeb"></span>${H.input("#87ceeb", "", 90)}<button class="btn sm" data-dlg="bgColor">Scegli...</button></div>`),
        H.row("Sfondo, colore in alto", `<div class="pathrow"><span class="color-preview" style="width:40px;height:20px;background:#191970"></span>${H.input("#191970", "", 90)}<button class="btn sm" data-dlg="bgColor">Scegli...</button></div>`),
        H.row("Punti disegnati durante la navigazione", H.num(500000, 0, 100000000, 1000, 120), "Durante rotazione, zoom e pan una geometria troppo lenta viene disegnata con al più questi punti. 0: mai ridurre.")) + `</div>`],
      ["Nuvole di punti", H.form(
        H.row("Chiedi prima di caricare nuvole oltre (punti)", H.num(2000000, 10000, 2000000000, 1000, 120)),
        H.row("Punti mantenuti decimando una nuvola", H.num(2000000, 10000, 2000000000, 1000, 120)),
        H.row("Dimensione dei punti di una nuova nuvola (px)", H.num(5, 1, 20), "Ogni nuvola mantiene la propria dimensione: Geometria → Dimensione dei punti."))],
      ["USAP", H.form(
        H.row("Python per USAP", H.path(""), "Vuoto: il runtime accanto al programma, altrimenti python3."),
        H.row("Tempo massimo di un'operazione USAP (s)", H.num(120, 10, 7200)))],
      ["Plugin", H.form(
        H.row("Python per i plugin", H.path(""), "Vuoto: il Python per USAP."),
        H.row("Tempo massimo di un comando di plugin (s)", H.num(60, 5, 7200)))],
      ["Rete", H.form(
        H.row("Indirizzo del datalake", `<span data-note="Indirizzo del pilota Matera come valore predefinito.">${H.input("https://matera-rest-api.na.icar.cnr.it/", "", 420)}</span>`),
        H.row("Server delle tile della mappa", H.input("https://tile.openstreetmap.org/%z/%x/%y.png", "", 420), "%z, %x e %y vengono sostituiti dal livello di zoom e dalla tile."))],
      ["Avvio", H.check("Mostra la guida introduttiva all'avvio", true)],
    ]) + `<div style="display:flex;align-items:center;gap:8px;margin-top:6px"><span class="grow">File delle preferenze: C:/Users/utente/AppData/Local/City3D/preferences.json</span><button class="btn">Apri il file</button></div>`,
    foot: [{ t: "Ripristina predefiniti", left: true }, { t: "OK", primary: true, close: true, log: "Preferenze salvate." }, { t: "Annulla", close: true }],
  }),
  projectCrs: () => epsgDlg("Seleziona sistema di riferimento (EPSG)"),
  orphanFiles: () => msg("question", "Verifica file orfani", "Nella cartella del progetto ci sono 3 file non usati dalla sessione:<br><span class='code'>geometry/mesh/catania (1).obj\ngeometry/pointcloud/prova.las\nannotations/vecchio_set.ant</span><br>Eliminarli?",
    [{ t: "Elimina", primary: true, close: true, log: "3 file orfani eliminati." }, { t: "Annulla", close: true }]),
  screenshot: () => fileDlg({ title: "Screenshot", mode: "save", folder: WORK, filter: ["Immagine PNG (*.png)"], files: [["vista_teatro.png", "1,2 MB", "File png"]], name: "screenshot_20261118.png" }),

  /* ===== Geometria ===== */
  loadMesh: () => fileDlg({ title: "Carica mesh", filter: ["Mesh (*.obj *.ply *.vtk)", "OBJ (*.obj)", "PLY (*.ply)", "VTK (*.vtk)", "Tutti i file (*)"],
    files: [["catania.obj", "7,5 MB", "File obj"], ["trackD-hires-texture-TEST.obj", "2,4 GB", "File obj"], ["synthetic_city_mesh.ply", "3,1 MB", "File ply"]], name: "catania.obj", next: "meshEpsg" }),
  meshEpsg: () => epsgDlg(null, "25833 (ETRS89 / UTM zone 33N)", "meshCopy"),
  meshCopy: () => ({ title: "Copia", w: 420, body: `<div>Copia di 'catania.obj' nella cartella del progetto...</div><progress value="64" max="100" style="width:100%"></progress>`,
    foot: [{ t: "Annulla", close: true }] }),
  loadCloud: () => fileDlg({ title: "Carica nuvola di punti", filter: ["Nuvole di punti (*.las *.laz *.xyz *.txt *.csv)", "LAS (*.las)", "LAZ (*.laz)", "XYZ (*.xyz)"],
    files: [["catania.las", "127 MB", "File las"], ["Catania1.las", "33,4 GB", "File las"], ["duomo.las", "22,1 GB", "File las"]], name: "catania.las", next: "cloudEpsg" }),
  cloudEpsg: () => epsgDlg(null, "25833 (ETRS89 / UTM zone 33N)", "cloudQuestion"),
  cloudQuestion: () => ({
    title: "Nuvola di punti grande", w: 500,
    body: `<div class="msg"><div class="mico question">?</div><div>'catania.las' contiene <b>3.907.888 punti</b> (circa 160 MB in memoria).<br>Caricarla tutta, o un punto ogni N?</div></div>
      ${H.form(H.row("Un punto ogni:", H.num(2, 1, 1000)), H.row("", `<span class="muted">1.953.944 punti caricati</span>`))}`,
    foot: [{ t: "Carica tutto", close: true, log: "catania.las: 3.907.888 punti caricati." }, { t: "Decima", primary: true, close: true, log: "catania.las: 3.907.888 punti (1.953.944 caricati)." }, { t: "Annulla", close: true }],
  }),
  geomColor: () => colorDlg("Seleziona colore", "#969696"),
  // Opacità di mesh e nuvole: gestore di tutte le geometrie dei progetti aperti (opacity_dialog.cpp, mainwindow.cpp:14002)
  geomOpacity: () => ({
    title: "Gestione Opacità Layer Geometrici", w: 600,
    body: `${H.table(["Layer", "Opacità", "Valore"], [
        ["catania.obj", '<input type="range" min="0" max="100" value="100" style="width:220px">', "100 %"],
        ["catania.las", '<input type="range" min="0" max="100" value="100" style="width:220px">', "100 %"]], { h: 130 })}
      <div class="btnrow left"><button class="btn sm" data-tip="Applica l'opacità del primo layer a tutti i layer">Applica a Tutti</button>
        <button class="btn sm" data-tip="Imposta l'opacità di tutti i layer al 100%">Ripristina Predefiniti</button></div>`,
    foot: [{ t: "Applica", primary: true, log: "Opacità applicata ai layer geometrici." }, { t: "Chiudi", close: true }],
  }),
  geomCrs: () => epsgDlg(null, "25833 (ETRS89 / UTM zone 33N)"), // assegna soltanto: nessuna conversione (mainwindow.cpp:4402-4425)
  removeGeometry: () => msg("question", "Rimuovi geometria", "Rimuovere 'catania.obj' dal progetto?<br><span class='muted'>Il file resta nella cartella del progetto.</span>",
    [{ t: "Sì", primary: true, close: true, log: "Geometria rimossa: catania.obj" }, { t: "No", close: true }]),
  cloudDecimation: () => ({
    title: "Decimazione della nuvola", w: 420,
    body: `<div>Ricarica 'catania.las' mantenendo un punto ogni N.</div>${H.form(H.row("Un punto ogni:", H.num(2, 1, 1000)), H.row("", `<span class="muted">3.907.888 punti nel file, 1.953.944 caricati</span>`))}`,
    foot: OK_CANCEL(),
  }),
  pointSize: () => ({ title: "Dimensione dei punti", w: 360, body: H.form(H.row("Dimensione dei punti di 'catania.las' (px):", H.num(5, 1, 20))), foot: OK_CANCEL() }),

  /* ===== Dati ===== */
  importCityGml: () => fileDlg({ title: "Importa CityGML", filter: ["CityGML e CityJSON (*.gml *.xml *.json)", "Tutti i file (*)"],
    files: [["catania.gml", "61,9 MB", "File gml"], ["UISH_Catania.gml", "717 MB", "File gml"], ["LOD1.city.json", "9,5 MB", "File json"]], name: "catania.gml", next: "citygmlLod" }),
  // Livello di dettaglio (choose_citygml_lod, mainwindow.cpp:4687): solo i LOD del file, nessuna altra scelta
  citygmlLod: () => ({
    title: "Livello di dettaglio CityGML", w: 420,
    body: `<div>Il file ha geometria a 2 livelli di dettaglio; il viewport ne mostra uno.<br>Livello da mostrare:</div>
      ${H.select(["LOD0 (4.036 poligoni)", "LOD1 (73.725 poligoni)"], "LOD1 (73.725 poligoni)")}`,
    foot: OK_CANCEL(),
  }),
  lod: () => DIALOGS.citygmlLod(),
  openAnnotated: () => fileDlg({ title: "Apri dataset annotato — CityGML", filter: ["CityGML (*.gml)"], files: [["catania.gml", "61,9 MB", "File gml"], ["catania.usap.gpkg", "108 MB", "File gpkg"]], name: "catania.gml", next: "openAnnotatedUsap" }),
  openAnnotatedUsap: () => fileDlg({ title: "Apri dataset annotato — pacchetto USAP", filter: ["Pacchetto USAP (*.usap.gpkg)"], files: [["catania.usap.gpkg", "108 MB", "File gpkg"]], name: "catania.usap.gpkg", next: "annotatedResult" }),
  annotatedResult: () => msg("info", "Dataset annotato", "Verifica dei collegamenti fra 'catania.gml' e 'catania.usap.gpkg':<br><b>51702 oggetti collegati, 47666 annotazioni collegate, 0 problemi.</b><br>Asset del pacchetto: catania.obj (riconosciuto per hash), catania.las (non caricato)."),
  selectionAnnotations: () => ({
    title: `Annotazioni della selezione — ${DATA}/catania.usap.gpkg`, w: 780,
    body: `${H.table(["", "Uid", "Etichetta", "Classe", "Stato", "Confidenza"], [
        ["1", "ann_bldg_r11882519", "ann_bldg_r11882519", "Building", "draft", ""],
        ["2", "ann_bldg_r11882519_Roof_1", "ann_bldg_r11882519_Roof_1", "RoofSurface", "draft", ""],
        ["3", "ann_bldg_r11882519_Wall_1", "ann_bldg_r11882519_Wall_1", "WallSurface", "draft", ""],
        ["4", "ann_bldg_r11882519_Wall_2", "ann_bldg_r11882519_Wall_2", "WallSurface", "draft", ""],
        ["5", "ann_bldg_w29315736", "Teatro Greco Romano", "Building", "draft", "0,90"],
        ["6", "ann_bldg_w29315736_Roof_1", "ann_bldg_w29315736_Roof_1", "RoofSurface", "draft", ""]], { h: 190, sel: 1 })}
      <div class="code" style="height:110px">USAP — Uid: ann_bldg_r11882519
USAP — Etichetta: ann_bldg_r11882519
USAP — Classe: Building (http://www.opengis.net/citygml/building/3.0#Building)
USAP — Stato: draft
USAP — Attributi:
{ "derivation": "catania-pipeline-v1" }</div>
      <div>1919 annotazioni nella selezione.</div>
      <div class="pathrow"><label style="align-self:center">Concetto:</label>${H.select(["Scegli il concetto", "Building", "BuildingPart", "RoofSurface", "WallSurface", "GroundSurface", "Bridge", "Tunnel", "ReliefFeature", "… (66 classi)"], "Building", 230)}${H.input("", "Etichetta (facoltativa)")}<button class="btn" data-dlg="annotationCreated">Crea dalla selezione</button></div>
      <div class="pathrow"><label style="align-self:center">CityObject:</label>${H.input("bldg_w175894049", "gml:id dell'oggetto CityGML (facoltativo)")}<button class="btn" data-dlg="newCityObject">Nuovo CityObject...</button></div>
      <div class="btnrow left"><button class="btn" data-dlg="annotationMetadata">Modifica metadati...</button><button class="btn" data-dlg="membershipAdd">Aggiungi selezione alla membership</button><button class="btn" data-dlg="membershipRemove">Rimuovi selezione dalla membership</button><button class="btn" data-dlg="deleteAnnotation">Elimina...</button></div>`,
    foot: CLOSE,
  }),
  annotationCreated: () => msg("info", "Nuova annotazione", "Annotazione 47667 «Building» creata da 29.008 facce di 'catania.obj', collegata a bldg_w175894049."),
  newCityObject: () => ({
    title: "Nuovo CityObject", w: 480,
    body: `<div class="muted">Un nuovo oggetto del CityGML. Non ha una geometria propria: la sua geometria è la selezione, tramite l'annotazione collegata.</div>
      ${H.form(H.row("Genitore", H.input("bldg_w129917823", "gml:id del genitore (vuoto: oggetto di primo livello)")),
        H.row("Classe", H.select(["Building", "BuildingPart", "RoofSurface", "WallSurface", "GroundSurface", "CityFurniture", "SolitaryVegetationObject"], "BuildingPart")),
        H.row("gml:id", H.input("BuildingPart_25ed7801")))}
      <div>Attributi (facoltativi; altri si aggiungono poi nella scheda CityObject):</div>
      ${H.form(H.row("gml:name", H.input("Parte nuova")))}`,
    foot: OK_CANCEL(),
  }),
  membershipAdd: () => msg("question", "Membership", "Membership dell'annotazione: 142 -> 160 elementi. Salvare?", [{ t: "Sì", primary: true, close: true, log: "Membership aggiornata: 160 elementi." }, { t: "No", close: true }]),
  membershipRemove: () => msg("question", "Membership", "Membership dell'annotazione: 160 -> 124 elementi. Salvare?", [{ t: "Sì", primary: true, close: true, log: "Membership aggiornata: 124 elementi." }, { t: "No", close: true }]),
  gisFeature: (ctx = {}) => msg("info", "Elemento GIS", `Proprietà dell'elemento GIS (Poligono) di ${ctx.layer || "impronte_edifici_centro.geojson"}:<br><br>` +
    "id: 1182<br>building: yes<br>height: 14.5<br>name: Palazzo degli Elefanti<br>osm_id: 129894441"),
  saveValueField: () => ({
    title: "Salva campo di valori in USAP", w: 600,
    body: H.form(
      H.row("Asset 3D:", H.select(["catania.obj", "catania.las"], "catania.obj")),
      H.row("Parte dell'asset:", H.select(["vertici (84.133)", "facce (136.733)"], "vertici (84.133)")),
      H.row("Tipo di elemento:", H.select(["vertici", "facce", "punti"], "vertici")),
      H.row("Campo numerico:", H.select(["catania_shadow_20261116_115940 — per vertici (84133 valori)"], "")),
      H.row("Concetto semantico:", H.select(["ShadowFraction"], "ShadowFraction")),
      H.row("Data dell'assessment:", `<input type="date" value="2026-11-16">`),
      H.row("", H.check("Registralo (validAt)", true)),
      H.row("Istante dei valori:", `<input type="date" value="2026-11-16"> <input type="time" value="12:00">`),
      H.row("Tipo di dato numerico:", H.select(["f4 — float, 32 bit (predefinito)", "f8 — float, 64 bit", "u1 — intero senza segno, 8 bit"], "f4 — float, 32 bit (predefinito)")),
      H.row("Unità:", H.input("frazione")), H.row("Metodo:", H.input("Servizi Ombreggiatura"))),
    foot: [{ t: "Salva", primary: true, close: true, log: "Campo di valori ShadowFraction salvato: 84.133 valori." }, { t: "Annulla", close: true }],
  }),
  queryValueFields: () => ({
    title: "Campi di valori USAP", w: 800,
    body: `${H.table(["Concetto", "Etichetta", "Data", "Asset 3D", "Parte", "Elementi", "Tipo", "Min", "Max", "Unità"], [
        ["ShadowFraction", "ombre 16/11 12:00", "2026-11-16", "catania.obj", "vertici", "84133", "f4", "0,00", "1,00", "frazione"],
        ["ShadowFraction", "ombre 21/06 09:00", "2026-06-21", "catania.obj", "vertici", "84133", "f4", "0,00", "1,00", "frazione"]], { h: 120, sel: 1 })}
      ${H.group("Predicato sul campo selezionato", `
        <div class="pathrow">${H.radio("pred", "Confronto:", true)}${H.select(["<", "<=", "==", "!=", ">", ">="], ">", 60)}${H.num("0,5", "", "", 0.1)}</div>
        <div class="pathrow">${H.radio("pred", "Intervallo:", false)}${H.num("0,2", "", "", 0.1)}${H.check("includi min", true)} a ${H.num("0,8", "", "", 0.1)}${H.check("includi max", false)}</div>
        <div class="btnrow left"><button class="btn" data-log="ShadowFraction > 0,5: 47.024 su 84.133 vertici.">Esegui interrogazione</button><button class="btn" data-log="47.024 vertici evidenziati nella vista 3D.">Evidenzia nella vista 3D</button><button class="btn">Togli evidenziazione</button></div>
        <div>ShadowFraction &gt; 0,5: <b>47.024</b> su 84.133 vertici</div>`)}`,
    foot: CLOSE,
  }),
  // Dati › Carica dati: valori sull'asset selezionato (mainwindow.cpp:9258, importtextdialog)
  loadData: () => fileDlg({ title: "Carica dati", filter: ["Valori (*.csv *.txt)", "Tutti i file (*)"],
    files: [["catania_shadow_20261116_115940.txt", "1,1 MB", "File txt"], ["quote_tetti.csv", "1,4 MB", "File csv"]], name: "quote_tetti.csv", next: "importText" }),
  importText: () => ({
    title: "Importa valori da testo", w: 560,
    body: `<div class="muted">${DATA}/quote_tetti.csv</div>
      ${H.form(H.row("Separatore:", H.select([";", ",", "(spazio)", "(tab)"], ";", 120)), H.row("Salta n righe:", H.num("1")),
        H.row("Attributo:", H.select(["quota_gronda", "quota_colmo"], "quota_colmo", 200)))}
      ${H.table(["vertice", "quota_gronda", "quota_colmo"], [["1", "12,40", "15,10"], ["2", "12,40", "15,10"], ["3", "9,85", "11,20"]], { h: 90 })}
      <div class="muted">I valori devono essere tanti quante le facce o quanti i vertici dell'asset, altrimenti il file è rifiutato.</div>`,
    foot: [{ t: "OK", primary: true, close: true, log: "Campo scalare 'quote_tetti.csv' aggiunto sotto 'catania.obj': 84.133 valori, uno per vertice." }, { t: "Annulla", close: true }],
  }),
  loadRaster: () => fileDlg({ title: "Carica raster (GeoTIFF, NetCDF)", filter: ["Raster (*.tif *.tiff *.nc)", "GeoTIFF (*.tif *.tiff)", "NetCDF (*.nc)"],
    files: [["DTM_Catania_166.tif", "4,1 MB", "File tif"], ["DTM_Catania_167.tif", "26 MB", "File tif"], ["so2_cams3d_catania_2026-10-16.nc", "23 kB", "File nc"], ["so2_catania_S5P_OFFL_L2__SO2____2026…_crop.nc", "63 kB", "File nc"]],
    name: "so2_cams3d_catania_2026-10-16.nc", next: "netcdf" }),
  netcdf: () => ({
    title: "Layer NetCDF", w: 560,
    body: `<div>File: so2_cams3d_catania_2026-10-16.nc</div>
      ${H.form(H.row("Variabile:", H.select(["so2_column_mean — SO2 total column (mol m-2), 24 x 18", "so2_conc — SO2 concentration, 24 x 18 x 8"], "so2_column_mean — SO2 total column (mol m-2), 24 x 18")))}
      ${H.group("Istante e livello", H.form(H.row("Istante:", H.select(["2026-10-16 00:00", "2026-10-16 12:00"], "2026-10-16 12:00")), H.row("Livello:", H.select(["superficie", "50 m", "250 m"], "superficie"))))}
      ${H.group("Correzioni", `${H.check("Scarta i pixel con qa_value inferiore a 0,5", true)}<br>${H.check("Converti so2_column_mean in unità Dobson (DU), × 2241,15 come dichiarato dal file", true)}`)}
      ${H.form(H.row("Risoluzione della griglia:", H.select(["automatica (passo dei pixel della strisciata)", "1000 m", "500 m"], "automatica (passo dei pixel della strisciata)")))}
      <div class="muted">Griglia regolare, 24 x 18 celle.</div>`,
    foot: OK_CANCEL(),
  }),
  loadSpherical: () => fileDlg({ title: "Carica immagini sferiche (CSV)", filter: ["Metadati immagini sferiche (*.csv)"], files: [["sferiche_centro.csv", "2 kB", "File csv"], ["pano_001.png", "8,4 MB", "File png"]], name: "sferiche_centro.csv", next: "sphericalLoaded" }),
  sphericalLoaded: () => msg("warn", "Immagini sferiche", "sferiche_centro.csv: 12 immagini caricate.<br>Riga 7 scartata: coordinata X non numerica.<br>Immagine mancante: pano_011.png (tenuta e segnalata)."),
  originalColors: () => msg("question", "Colori originali dell'asset", "Le annotazioni mostrate su questo asset ricolorano le sue facce, coprendo i colori letti dal file.<br><br>Nasconderle per mostrare i colori originali?",
    [{ t: "Sì", primary: true, close: true }, { t: "No", close: true }]),
  assetTexture: () => msg("info", "Texture dell'asset", "Questo asset non ha texture: ce l'hanno solo i file OBJ i cui materiali (.mtl) nominano un'immagine, trovata accanto al file."),

  /* ===== Annotazioni ===== */
  loadGis: () => fileDlg({ title: "Carica layer GIS (drappeggiato)", filter: ["Layer GIS (*.gpkg *.shp *.geojson)", "GeoPackage (*.gpkg)", "Shapefile (*.shp)", "GeoJSON (*.geojson)"],
    files: [["edifici_catania.gpkg", "3,2 MB", "File gpkg"], ["edifici_nord.shp", "820 kB", "File shp"], ["senza_crs.shp", "12 kB", "File shp"], ["impronte_edifici_centro.geojson", "640 kB", "File geojson"]], name: "edifici_catania.gpkg", next: "gpkgColor" }),
  gpkgColor: () => ({
    title: "Colora GeoPackage", w: 640,
    body: `<div class="two-col"><div style="flex:1">${H.form(
        H.row("Geometria", H.select(["Poligoni (2.418)", "Linee (0)", "Punti (0)"], "Poligoni (2.418)")),
        H.row("Attributo", H.select(["(nessuno)", "building", "height", "levels", "name"], "building")),
        H.row("Modalità", H.select(["Continuo", "Discreto", "Categorico"], "Categorico")),
        H.row("N. classi", H.num(5, 2, 12)), H.row("Palette", H.select(["Default", "Jet", "Rainbow", "Viridis", "Plasma", "Inferno", "Cividis", "Greyscale", "Magma", "Turbo", "Category10", "Set1", "Pastel", "Energy"], "Category10")),
        H.row("", H.check("Inverti palette", false)), H.row("", H.check("Mostra barra dei colori", true)),
        H.row("Colore unico", `<button class="btn sm" data-dlg="geomColor">Scegli…</button>`),
        H.row("Opacità poligoni", H.input("0,90", "", 70)), H.row("Opacità linee", H.input("0,50", "", 70)), H.row("Opacità punti", H.input("1,00", "", 70)))}</div>
        <div style="width:220px"><div>Anteprima palette</div><div class="legend-bar" style="background:linear-gradient(90deg,#8dd3c7,#ffffb3,#bebada,#fb8072,#80b1d3)"></div>
        <div style="margin-top:8px">Legenda categorie</div>${H.table(["Valore", "Colore"], [["yes", "■"], ["house", "■"], ["church", "■"], ["ruins", "■"]], { h: 120 })}</div></div>`,
    foot: OK_CANCEL(),
  }),
  newAnnotation: () => ({
    title: "Annotazioni della selezione — nuova annotazione", w: 640,
    body: `<div class="panel-box">Selezione lazo su 'catania.obj': 29.008 facce, 15.551 vertici/punti</div>
      <div class="muted">Nessuna annotazione è associata agli elementi selezionati.</div>
      <div class="pathrow"><label style="align-self:center">Concetto:</label>${H.select(["Scegli il concetto", "Building", "BuildingPart", "RoofSurface", "WallSurface", "… (66 classi)"], "Scegli il concetto", 220)}${H.input("", "Etichetta (facoltativa)")}<button class="btn" data-dlg="annotationCreated">Crea dalla selezione</button></div>
      <div class="pathrow"><label style="align-self:center">CityObject:</label>${H.input("", "gml:id dell'oggetto CityGML (facoltativo)")}<button class="btn" data-dlg="newCityObject">Nuovo CityObject...</button></div>`,
    foot: [{ t: "Nuovo pacchetto...", left: true, next: "newPackage" }, { t: "Apri esistente...", left: true, next: "openPackage" }, { t: "Chiudi", close: true }],
  }),
  newPackage: () => fileDlg({ title: "Nuovo pacchetto USAP", mode: "save", filter: ["Pacchetto USAP (*.usap.gpkg)"], files: [["catania.obj", "7,5 MB", "File obj"]], name: "catania.usap.gpkg" }),
  openPackage: () => fileDlg({ title: "Apri pacchetto USAP", filter: ["Pacchetto USAP (*.usap.gpkg)"], files: [["catania.usap.gpkg", "108 MB", "File gpkg"]], name: "catania.usap.gpkg" }),
  usapAnnotations: () => ({
    title: "Annotazioni USAP", w: 820,
    body: `<div class="pathrow"><label style="align-self:center">Pacchetto:</label>${H.input(DATA + "/catania.usap.gpkg", "percorso di un .usap.gpkg (esistente o da creare)")}<button class="btn sm" data-dlg="openPackage">Sfoglia…</button><button class="btn sm">Apri/Ricarica</button></div>
      <div>47666 annotazioni nel pacchetto.</div>
      ${H.table(["Id", "Uid", "Classe", "Etichetta", "Stato", "Elementi"], [
        ["1", "ann_bldg_w234077276", "Building", "ann_bldg_w234077276", "draft", "412"],
        ["2", "ann_bldg_w130301360", "Building", "ann_bldg_w130301360", "draft", "96"],
        ["3", "ann_bldg_w129791254_Roof_1", "RoofSurface", "ann_bldg_w129791254_Roof_1", "draft", "38"],
        ["33718", "ann_bldg_w29315736", "Building", "Teatro Greco Romano", "draft", "3401"],
        ["33719", "ann_bldg_w29315736_Roof_1", "RoofSurface", "ann_bldg_w29315736_Roof_1", "draft", "214"]], { h: 170, sel: 4 })}
      <div class="details">Dettagli dell'annotazione selezionata</div>
      ${H.form(H.row("CityObject (GML ID):", `<div class="pathrow">${H.input("", "facoltativo — il CityObject a cui appartiene ogni annotazione che non ne indica uno proprio")}<button class="btn sm">Da CityGML…</button></div>`),
        H.row("Classe semantica:", H.select(["Building", "RoofSurface", "WallSurface"], "Building", 220)))}
      <div class="btnrow left"><button class="btn">Esporta annotazioni della mesh</button><button class="btn">Importa nel progetto</button></div>
      <div class="muted">Per esportare seleziona un nodo annotazioni nell'albero dei progetti.</div>`,
    foot: CLOSE,
  }),
  annotationMetadata: () => ({
    title: "Modifica metadati dell'annotazione", w: 480,
    body: H.form(H.row("Concetto:", H.select(["Building", "BuildingPart", "RoofSurface", "WallSurface"], "Building")),
      H.row("Etichetta:", H.input("Teatro Greco Romano")), H.row("Stato:", H.select(["draft", "accepted", "rejected", "superseded"], "draft")),
      H.row("", H.check("Registra una confidenza", true)), H.row("Confidenza:", H.num("0.90", 0, 1, 0.05)),
      H.row("Metodo:", H.input("", "es. manuale, fotogrammetria, rilievo")), H.row("Fonte:", H.input("", "es. sopralluogo 2026, archivio")),
      H.row("", `<span class="muted">Gli elementi dell'annotazione non cambiano.</span>`)),
    foot: [{ t: "Salva", primary: true, close: true, log: "Metadati dell'annotazione 33718 salvati." }, { t: "Annulla", close: true }],
  }),
  deleteAnnotation: () => msg("question", "Elimina annotazione", "Eliminare l'annotazione «Teatro Greco Romano» (ann_bldg_w29315736) e le sue membership dal pacchetto USAP?<br>L'asset 3D e il CityGML non vengono modificati.",
    [{ t: "Sì", primary: true, close: true, log: "Annotazione 33718 eliminata." }, { t: "No", close: true }]),
  newAssessment: () => ({
    title: "Nuovo assessment", w: 480,
    body: H.form(H.row("Data dell'assessment:", `<input type="date" value="2026-11-18">`), H.row("Asset 3D:", H.select(["catania.obj", "catania.las"], "catania.obj")),
      H.row("Stato:", H.select(["draft", "accepted", "rejected", "superseded"], "draft")), H.row("", H.check("Registra una confidenza", false)),
      H.row("Nota:", H.input("", "Metodo, fonte, osservazioni (facoltativo)")),
      H.row("", H.check("Usa la selezione lazo corrente come elementi di questo assessment", true)),
      H.row("", `<span class="muted">Selezione lazo su 'catania.obj': 36 facce, 41 vertici/punti</span>`)),
    foot: [{ t: "Crea", primary: true, close: true, log: "Assessment asm_1b603249… creato (36 elementi)." }, { t: "Annulla", close: true }],
  }),
  editAssessment: () => ({
    title: "Modifica assessment", w: 480,
    body: H.form(H.row("Data dell'assessment:", `<input type="date" value="2026-11-16">`), H.row("Asset 3D (non modificabile):", "catania.obj (id 3)"),
      H.row("Stato:", H.select(["draft", "accepted", "rejected", "superseded"], "draft")), H.row("Nota:", H.input("rilievo novembre, lotto 2"))),
    foot: [{ t: "Salva", primary: true, close: true }, { t: "Annulla", close: true }],
  }),
  editElements: () => msg("question", "Modifica elementi", "Assessment del 2026-11-16 su catania.obj: 142 elementi.<br>Selezione lazo corrente: 36 facce (18 in comune).<br>Che cosa fare?",
    [{ t: "Sostituisci", close: true }, { t: "Aggiungi", primary: true, next: "membershipAdd", close: true }, { t: "Rimuovi", next: "membershipRemove", close: true }, { t: "Annulla", close: true }]),
  genericAttribute: () => ({
    title: "Attributo generico", w: 420,
    body: H.form(H.row("Nome:", H.input("osm_building")), H.row("Tipo:", H.select(["StringAttribute", "IntAttribute", "DoubleAttribute", "DateAttribute", "UriAttribute", "CodeAttribute", "MeasureAttribute"], "StringAttribute")), H.row("Valore:", H.input("ruins"))),
    foot: OK_CANCEL(),
  }),
  structuredProperty: () => ({
    title: "Modifica 'con:height'", w: 440,
    body: H.form(H.row("highReference:", H.select(["highestRoofEdge", "highestPoint", "top"], "highestRoofEdge")), H.row("lowReference:", H.select(["lowestGroundPoint", "bottom"], "lowestGroundPoint")),
      H.row("status:", H.select(["estimated", "measured"], "measured")), H.row("value:", `<div class="pathrow">${H.num("25.44", "", "", 0.01)}${H.select(["m", "cm", "ft"], "m", 60)}</div>`)),
    foot: OK_CANCEL(),
  }),

  /* ===== Vista ===== */
  bgColor: () => colorDlg("Seleziona colore", "#191970"),
  sphericalImages: () => ({
    title: "Immagini sferiche", w: 720,
    body: `${H.table(["Immagine / CSV", "X", "Y", "Z", "Heading", "Stato"], [
        ["▾ sferiche_centro.csv", "", "", "", "", ""], ["pano_001.png", "506512.4", "4152110.8", "12.1", "37°", "trovata"],
        ["pano_002.png", "506540.9", "4152131.2", "12.4", "41°", "trovata"], ["pano_011.png", "506811.0", "4152402.5", "14.0", "182°", "immagine mancante"]], { h: 180, sel: 2 })}
      <div class="btnrow left"><button class="btn" data-dlg="sphericalViewer">Apri nel visualizzatore a 360°</button><button class="btn">Centra la scena qui</button><button class="btn">Rimuovi insieme</button></div>`,
    foot: CLOSE,
  }),
  sphericalViewer: () => ({
    title: "pano_001.png — visualizzatore a 360°", w: 720,
    body: `<div style="height:300px;background:linear-gradient(#9fc6e8 0 45%,#b5a58c 45% 60%,#7a6f5d 60%);border:1px solid #000;position:relative">
      <div style="position:absolute;left:30%;top:22%;width:120px;height:110px;background:#c9b48f;border:1px solid #6b5c43"></div>
      <div style="position:absolute;left:58%;top:30%;width:90px;height:80px;background:#a99674;border:1px solid #6b5c43"></div></div>
      <div class="muted">Trascina per guardarti intorno · rotella per lo zoom · heading 37°</div>`,
    foot: CLOSE,
  }),

  /* ===== Servizi ===== */
  shadows: () => ({
    title: "Impostazioni Ombre", w: 520,
    body: `${H.radio("sh", "Istante singolo", true)}
      ${H.form(H.row("Data", `<input type="date" value="2026-11-16">`), H.row("Ora", `<input type="time" value="12:00">`))}
      ${H.radio("sh", "Ripeti ogni", false)}
      <div class="pathrow">${H.num(1, 1, 999)}${H.select(["Secondo", "Minuto", "Ora", "Giorno", "Mese", "Anno"], "Ora", 120)}</div>
      ${H.group("Da... A...", H.form(H.row("A partire da... Data", `<input type="date" value="2026-06-21">`), H.row("Ora", `<input type="time" value="06:00">`),
        H.row("Fino a... Data", `<input type="date" value="2026-06-21">`), H.row("Ora", `<input type="time" value="20:00">`)))}`,
    foot: [{ t: "OK", primary: true, close: true, log: "Calcolo delle ombre… COMPLETATO (catania_shadow_20261116_115940.txt, 84.133 valori)." }, { t: "Annulla", close: true }],
  }),
  slope: () => msg("warn", "Selezione non valida", "Seleziona un'annotazione a linea per calcolare la pendenza."),

  /* ===== Plugin ===== */
  pluginManager: () => ({
    title: "Gestione plugin", w: 980,
    body: `<div>City3D cerca i plugin all'avvio nella cartella dell'applicazione (plugin inclusi) e nella cartella dei plugin dell'utente. Nessun archivio remoto viene contattato: i plugin esterni si installano da un pacchetto già presente sul disco.</div>
      <div class="two-col" style="height:380px">
        <div style="flex:1.5">${H.table(["Plugin", "Versione", "Origine", "Fornitore", "Identificatore"], [
          ["<b>▾ Attivo (2)</b>", "", "", "", ""], ["&nbsp;&nbsp;☑ Inventario cartella di lavoro", "1.2.0", "Incluso", "D/Vision Lab", "vision.city3d.inventory"],
          ["&nbsp;&nbsp;☑ Statistiche asset", "1.2.0", "Incluso", "D/Vision Lab", "vision.city3d.assetstats"],
          ["<b>Disattivato (0)</b>", "", "", "", ""], ["<b>Incompatibile (0)</b>", "", "", "", ""], ["<b>Fallito (0)</b>", "", "", "", ""]], { h: 380, sel: 3 })}</div>
        <div class="panel-box" style="flex:1"><b style="font-size:14px">Statistiche asset</b>
          <p>Legge una mesh OBJ o una nuvola XYZ e ne salva un rapporto di testo con vertici, facce ed estensione, leggendo direttamente il file.</p>
          ${H.form(H.row("<b>Identificatore</b>", "vision.city3d.assetstats"), H.row("<b>Versione</b>", "1.2.0"), H.row("<b>Fornitore</b>", "D/Vision Lab"), H.row("<b>Stato</b>", "Attivo"),
            H.row("<b>Origine</b>", "Incluso"), H.row("<b>Tipo</b>", "native"), H.row("<b>API richiesta</b>", "1.2"), H.row("<b>Caricato</b>", "sì"),
            H.row("<b>Cartella</b>", "C:/Program Files/City3D/city3d-plugins/vision.city3d.assetstats"), H.row("<b>Capacità</b>", "gui, cli"))}
          <p><b>Comandi</b></p><ul><li>Statistiche dell'asset... <i>(summary)</i></li></ul></div>
      </div>`,
    foot: [{ t: "Installa da file...", left: true, next: "addPlugin" }, { t: "Rimuovi", left: true }, { t: "Chiudi", close: true }],
  }),
  runPlugin: () => ({
    title: "Esegui plugin", w: 700,
    body: `<div>Tutti i comandi dei plugin attivi. Scegline uno: i parametri vengono chiesti subito dopo.</div>
      <div class="two-col" style="height:220px"><div style="flex:1">${H.table(["Comando", "Tipo"], [
        ["Inventario di una cartella...", "Esporta"], ["Statistiche dell'asset...", "Comando"]], { h: 220, sel: 2 })}</div>
        <div class="panel-box" style="width:240px"><b>Statistiche dell'asset...</b><p>Vertici, facce ed estensione dell'asset selezionato, in un rapporto di testo.</p>
        ${H.form(H.row("Tipo:", "Comando"), H.row("Plugin:", "Statistiche asset 1.2.0"))}</div></div>`,
    foot: [{ t: "Esegui…", primary: true, next: "plugin_assetstats", close: true }, { t: "Annulla", close: true }],
  }),
  addPlugin: () => fileDlg({ title: "Aggiungi plugin", filter: ["Pacchetti di plugin (*.c3dplugin *.zip)"], folder: "C:/Users/utente/Downloads",
    files: [["demokit-1.3.zip", "412 kB", "File zip"], ["acme-heightbands.c3dplugin", "96 kB", "File c3dplugin"]], name: "demokit-1.3.zip", next: "pluginInstalled" }),
  pluginInstalled: () => msg("info", "Plugin installato", "«Kit dimostrativo dell'SDK» 1.0.0 (vision.city3d.demokit) installato.<br>Il plugin è disponibile da subito: menu Plugin e barra Plugin."),
  plugin_inventory: () => pluginRun("Inventario cartella di lavoro", "1.2.0", "Inventario di una cartella...", [
    { t: "Cartella da inventariare", type: "folder", req: true, hint: "Predefinita: la cartella di lavoro di City3D." },
    { t: "Inventario CSV", type: "outputFile", req: true, value: WORK + "/inventario-city3d.csv" },
    { t: "Includi le sottocartelle", type: "boolean", value: true, hint: "Se spento, inventaria solo i file nella cartella scelta." },
    { t: "Dimensione minima (KB)", type: "integer", value: 0, min: 0, max: 1048576 },
    { t: "Ordinamento", type: "choice", req: true, options: ["per percorso", "dal piu' grande", "dal piu' recente"] },
    { t: "Estensioni", type: "text", hint: "Elenco separato da virgole (obj, xyz, csv). Vuoto: tutte." }]),
  plugin_assetstats: () => pluginRun("Statistiche asset", "1.2.0", "Statistiche dell'asset...", [
    { t: "Dataset da analizzare", type: "asset", req: true }, { t: "Selezione corrente", type: "selection" },
    { t: "Rapporto di testo", type: "outputFile", req: true, value: WORK + "/statistiche-asset.txt" },
    { t: "Unita' dell'estensione", type: "choice", req: true, options: ["metri", "centimetri", "piedi"] },
    { t: "Decimali", type: "integer", value: 3, min: 0, max: 9 }, { t: "Nota", type: "text" }]),
  pluginResult: () => ({
    title: "Statistiche asset 1.2.0 — Risultato", w: 600,
    body: `${H.group("Risultato", H.table(["Risorsa", "Percorso"], [["Rapporto", WORK + "/statistiche-asset.txt"]], { h: 60 }))}
      ${H.table(["Gravità", "Codice", "Messaggio"], [["Informazione", "ok", "84.133 vertici, 136.733 facce, estensione 2,41 × 2,03 km"]], { h: 60 })}`,
    foot: [{ t: "Togli evidenziazione", left: true }, { t: "Chiudi", close: true }],
  }),

  /* ===== Info ===== */
  licence: () => ({
    title: "Licenza", w: 560,
    body: `<div style="font-size:16px;font-weight:bold">City3D</div><div>Copyright (C) 2025 Simone Pittaluga, Daniela Cabiddu (CNR)</div>
      <div class="code" style="height:220px">This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation…

Componenti di terze parti: vedi licenses\\THIRD-PARTY.md</div>`,
    foot: CLOSE,
  }),
  welcome: (ctx = {}) => {
    const steps = [
      ["1. Scegli l'area e carica i dati", "Crea un progetto (File › Nuovo progetto) e carica mesh, nuvole di punti, CityGML, raster e layer GIS dai menu Geometria, Dati e Annotazioni."],
      ["2. Organizza il lavoro in progetti", "Ogni progetto ha la sua cartella e il suo CRS. La sessione si salva con File › Salva la sessione."],
      ["3. Esplora la scena 3D", "Ruota con il tasto sinistro, sposta con Maiusc, zoom con la rotella. Le viste predefinite sono sopra la vista 3D e in Vista › Vedi da."],
      ["4. Annota (l'attività centrale)", "Annotazioni › Nuova annotazione…: disegna il lazo sull'asset e scegli il concetto. Il pacchetto USAP nasce con la prima annotazione."],
      ["5. Calcola", "Servizi › Ombreggiatura calcola un campo di valori per elemento, che si salva in USAP da Dati › Salva campo di valori in USAP…"],
      ["6. Esporta e vai oltre", "File › Esporta, il menu Plugin e la riga di comando city3d-cli."]];
    const i = ctx.step || 0;
    return {
      title: "Benvenuto in City3D", w: 560,
      body: `<div class="wizard-step"><h3>${steps[i][0]}</h3>${steps[i][1]}</div><div class="muted">Passo ${i + 1} di ${steps.length}</div>
        <div style="display:flex;justify-content:space-between">${H.check("Non mostrare più all'avvio", false)}<button class="btn" data-run="tour">Avvia il tour dell'interfaccia</button></div>`,
      foot: [{ t: "Indietro", next: i > 0 ? "welcome" : null, ctx: { step: i - 1 }, close: i > 0, left: true },
             { t: "Avanti", primary: true, next: i < steps.length - 1 ? "welcome" : null, ctx: { step: i + 1 }, close: i < steps.length - 1 },
             { t: "Chiudi", close: true }],
    };
  },

  /* ===== Pannelli e albero ===== */
  layerOpacity: () => ({ title: "Opacità", w: 380, body: `<div>Opacità del layer:</div><div class="pathrow"><input type="range" min="0" max="100" value="85" style="flex:1"><span>0,85</span></div>`, foot: OK_CANCEL() }),
  rasterHeight: () => ({ title: "Altezza del raster", w: 440, body: `<div>Sposta 'DTM_Catania_166.tif' verso l'alto (valore positivo) o verso il basso (negativo) rispetto a dove è stato caricato:</div>
    <div class="pathrow">${H.num("0.0", -10000, 10000, 1)} m <button class="btn sm">Torna all'altezza di caricamento</button></div>`, foot: OK_CANCEL() }),
  removeLayer: () => msg("question", "Rimuovi", "Rimuovere il layer dalla scena e dalla sessione?<br><span class='muted'>Il file non viene cancellato.</span>",
    [{ t: "Sì", primary: true, close: true }, { t: "No", close: true }]),
  saveLog: () => fileDlg({ title: "Salva il Log", mode: "save", folder: WORK, filter: ["Testo (*.txt)", "CSV (*.csv)"], files: [], name: "city3d-log-20261118.txt" }),
  fileGeneric: () => fileDlg({ title: "Scegli una cartella", folder: WORK, files: [["catania_demo/"], ["catania_sessione/"], ["trackD_prova/"]], name: "catania_demo", okText: "Scegli cartella" }),
};
