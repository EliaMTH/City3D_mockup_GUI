/* City3D — mockup v2: modifiche proposte rispetto alla release 366fdda.
 * menus.js resta la fotografia della release; qui c'è solo ciò che cambia.
 * Ogni blocco rimanda alla voce di PROPOSTA-UI.md (nella cartella del workspace). */

/* ---------- §3.1 Lazo: due strumenti invece di tre ---------- */
// Il tipo (facce o punti) segue l'asset selezionato; resta a parte solo il lazo sugli spigoli.
ACTIONS.lasso = { t: "Selezione a lazo", icon: "lasso-selection-icon.png", chk: false, group: "lasso" };
ACTIONS.lasso_line.t = "Selezione a lazo (spigoli)";
ACTIONS.lasso_line.log = "Lazo sugli spigoli: clic sinistro sui vertici della polilinea, doppio clic per chiudere.";
delete ACTIONS.lasso_area;
delete ACTIONS.lasso_points;

/* ---------- §3.5 Modo del lazo: non è uno strumento ---------- */
// SINGLE / ADD / REMOVE = il prossimo lazo sostituisce, aggiunge o toglie (LassoPointSelectionStyle.cpp:481).
Object.assign(ACTIONS.sel_single, { t: "Sostituisci la selezione", tip: "Modo del lazo: il prossimo lazo sostituisce la selezione" });
Object.assign(ACTIONS.sel_additive, { t: "Aggiungi alla selezione", tip: "Modo del lazo: il prossimo lazo si aggiunge alla selezione" });
Object.assign(ACTIONS.sel_subtractive, { t: "Togli dalla selezione", tip: "Modo del lazo: il prossimo lazo si toglie dalla selezione" });
MENUS.find((m) => m.t === "Annotazioni").items.find((i) => i.t === "Modalità di selezione").t = "Modo del lazo";

/* ---------- §3.2 Modo di disegno: tre pulsanti esclusivi, solo nella vista ---------- */
for (const [id, t] of [["draw_solid", "Solido"], ["draw_wire", "Wireframe"], ["draw_vertex", "Vertici"]]) {
  Object.assign(ACTIONS[id], { t: "Visualizza mesh come: " + t.toLowerCase(), group: "draw" });
}

/* ---------- §4 Menu Visualizza (oggi Vista) ---------- */
Object.assign(MENUS.find((m) => m.t === "Vista"), { t: "Visualizza", items: [
  "show_axes", "show_colorbar", "show_slider", SEP,
  "show_histogram", "show_legend", SEP,
  "show_rasters", "show_spherical",
]});
// Tolte: Overlay assi interattivo, Vedi da…, Imposta colore di background (resta solo in Preferenze),
// Solido/Wireframe/Vertice, Mostra proprietà del layer, Mostra pannello informativo, Pannelli,
// Adatta alla scena/selezione, Vista predefinita. Spostata: Immagini sferiche… (in Importa, vedi layout.js).

/* ---------- §6 Menu Plugin ---------- */
// Tolte: Esegui plugin… (stessi comandi dell'elenco) e Aggiungi plugin… (= «Installa da file…» di Gestione plugin).
// Tolto: Pannelli › (i comandi dei plugin si aprono già nel pannello a destra).
// Tolta anche Togli evidenziazione dei plugin: la sostituisce l'etichetta nella vista (§3.4).
MENUS.find((m) => m.t === "Plugin").items = ["plugin_manager", SEP, "plugin_inventory", "plugin_assetstats"];

/* ---------- §8 Menu Progetto (oggi File) ---------- */
// Progetto e sessione sono lo stesso file (project.json): «Salva la sessione» diventa «Salva progetto» (Ctrl+S).
ACTIONS.save_session.t = "Salva progetto";
delete ACTIONS.save_session.note;
Object.assign(MENUS.find((m) => m.t === "File"), { t: "Progetto", items: [
  "new_project", "open_project", "save_session", "close_project", "orphan_files", SEP,
  "preferences",
]});
// Tolte: Apri un file di progetto, Carica dal datalake (è in Importa), Salva la sessione con nome,
// Esporta › (è il menu Esporta della pulsantiera, con il suo Plugin ›), Imposta cartella di lavoro
// (Preferenze), Imposta CRS di progetto (CRS in alto a destra), Screenshot (è in Esporta).
// «Salva la sessione con nome» esce anche dalle azioni del progetto nell'albero.
LAYER_ACTIONS.project = LAYER_ACTIONS.project.filter(([label]) => label !== "Salva la sessione con nome");

/* ---------- §9 Nomi brevi per le azioni dei layer, uguali per tutti i tipi ---------- */
// Oggi i dataset 3D usano i nomi dei vecchi menu («Imposta colore geometria»), gli altri layer quelli
// brevi di utils/layer_info.cpp («Opacità...»): ora tutti usano quelli brevi.
{
  const SHORT = { "Imposta colore geometria": "Colore...", "Imposta opacità geometria": "Opacità...", "Imposta CRS geometria": "Imposta CRS...",
    "Imposta CRS di progetto": "Imposta CRS...", "Rimuovi geometria": "Rimuovi", "Rinomina": "Rinomina...", "Opacità...": "Opacità..." };
  for (const list of Object.values(LAYER_ACTIONS)) list.forEach((a) => { if (SHORT[a[0]]) a[0] = SHORT[a[0]]; });
}
LAYER_ACTIONS_NOTE = "";

/* ---------- §9 Menu Geometria: tolto ---------- */
// Carica mesh / nuvola: sono in Importa. Imposta colore, opacità e CRS geometria, Rimuovi geometria:
// sono nel pannello Proprietà del layer (e nel tasto destro, identici). Calcola: va in Servizi.
// Decimazione e Dimensione dei punti: azioni della nuvola di punti nel pannello Proprietà del layer.
MENUS.splice(MENUS.findIndex((m) => m.t === "Geometria"), 1);
MENUS.find((m) => m.t === "Servizi").items = ["shadows", "slope", SEP, { t: "Calcola", items: ["measure_distance", "measure_surface"] }];
delete ACTIONS.measure_surface.note;
{
  const d = LAYER_ACTIONS.dataset;
  const afterCrs = d.findIndex(([label]) => label === "Imposta CRS...") + 1;
  // la decimazione vale solo per le nuvole .las/.laz (mainwindow.cpp:10490)
  LAYER_ACTIONS.cloud = [...d.slice(0, afterCrs), ["Dimensione dei punti...", "pointSize"], ["Decimazione...", "cloudDecimation"], ...d.slice(afterCrs)];
}

/* ---------- §3.4 Evidenziazione dei plugin: etichetta nella vista ---------- */
// L'esito di un plugin non ha più il pulsante «Togli evidenziazione»: l'evidenziazione che lascia
// nella vista è segnalata (e si toglie) dall'etichetta in basso nella vista 3D.
{
  const original = DIALOGS.pluginResult;
  DIALOGS.pluginResult = (ctx) => {
    const spec = original(ctx);
    spec.foot = spec.foot.filter((b) => b.t !== "Togli evidenziazione");
    spec.body += `<div class="muted">Evidenziati nella vista 3D: 29.008 facce (la selezione analizzata).</div>`;
    spec.highlight = { plugin: "Statistiche asset", what: "29.008 facce" };
    return spec;
  };
}
delete ACTIONS.plugin_inventory.note;
delete ACTIONS.plugin_assetstats.note;

/* ---------- Menu Annotazioni › Strumenti, conseguenza del §3.1 ---------- */
MENUS.find((m) => m.t === "Annotazioni").items.find((i) => i.t === "Strumenti").items =
  ["query_mouse", SEP, "lasso", "lasso_line", SEP, "clear_selection"];

/* Note di revisione superate dalle modifiche. */
for (const id of ["view_top", "view_west", "view_south", "view_ne", "default_view", "show_axes", "load_spherical", "spherical_list",
  "show_histogram", "show_legend"]) delete ACTIONS[id].note;
ACTIONS.show_histogram.note = ACTIONS.show_legend.note = "Da decidere: pannello della striscia o voce di Visualizza (PROPOSTA-UI.md §10).";

/* ---------- §2 I comandi si aprono nel pannello a destra ---------- */
/* Eccezioni: finestre che restano mobili (§2.3). Una finestra aperta da una finestra mobile
 * resta mobile (es. i passi successivi di un'importazione). */
const FLOATING = {
  importa:      ["datalake", "datalakeSettings", "loadMesh", "meshEpsg", "meshCopy", "loadCloud", "cloudEpsg", "cloudQuestion",
                 "importCityGml", "citygmlLod", "openAnnotated", "openAnnotatedUsap", "annotatedResult", "loadRaster", "netcdf",
                 "loadSpherical", "sphericalLoaded", "sphericalImages", "loadGis"],
  esporta:      ["exportZip", "exportDone", "screenshot", "plugin_inventory"],
  progetto:     ["newProject", "openProject", "closeProject", "projectCrs", "orphanFiles"],
  sessione:     ["saveSession"],
  applicazione: ["preferences", "pluginManager", "addPlugin", "pluginInstalled"],
  info:         ["licence", "welcome"],
  vista360:     ["sphericalViewer"],
  // finestre del sistema operativo (scelta di file e cartelle): restano native
  sistema:      ["fileGeneric", "saveLog", "newPackage", "openPackage"],
};
const FLOATING_KIND = {};
for (const [kind, ids] of Object.entries(FLOATING)) ids.forEach((id) => (FLOATING_KIND[id] = kind));

/* Selezione bloccata durante un comando (§2.2 punto 5), tranne nei comandi progettati per
 * seguirla: oggi i pannelli dei plugin (PluginRunWidget, che si aggiorna a ogni nuova selezione). */
const FOLLOWS_SELECTION = new Set(["runPlugin", "plugin_assetstats", "pluginResult"]);

/* Comandi che lavorano sul layer selezionato: il pannello lo indica e il bersaglio resta
 * quello dell'apertura anche se nell'albero si seleziona un'altra riga (§2.2). */
const LAYER_COMMANDS = new Set(["geomColor", "geomOpacity", "geomCrs", "crsConvert", "removeGeometry", "cloudDecimation", "pointSize",
  "lod", "originalColors", "assetTexture", "gpkgColor", "rename", "layerOpacity", "rasterHeight", "removeLayer"]);
