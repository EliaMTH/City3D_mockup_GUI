/* City3D — mockup dell'interfaccia attuale (release 17/11/2026, commit 366fdda).
 *
 * Struttura ricostruita da mainwindow.ui, dalle voci aggiunte/nascoste a runtime
 * in mainwindow.cpp (costruttore, setup_plugins_menu, build_*_dock) e dalle
 * traduzioni di lang_it_IT.ts. L'ordine è quello che l'utente vede.
 *
 * Campi di un'azione:
 *   t     etichetta              icon  file in assets/icons
 *   dlg   finestra da aprire     log   messaggio scritto nel Log (azioni senza finestra)
 *   chk   checkable (true/false = stato iniziale)
 *   group gruppo esclusivo       dis   disabilitata (con tip = suggerimento)
 *   sc    scorciatoia            dock  pannello acceso/spento dalla voce
 *   note  nota di revisione (visibile con «Note di revisione»)
 */

const NOTE = {
  sfondo: "Due comandi per lo sfondo con comportamenti diversi: qui un colore unico; Preferenze › Visualizzazione imposta un gradiente (colore in alto / in basso).",
  aspetto: "L'aspetto di un asset è diviso fra due menu: Geometria (colore, opacità) e Dati (colori originali, texture).",
  ant: "Funzione dei set di annotazioni .ant del prototipo: resta nel menu ma è disabilitata sui dati USAP.",
  usapAccessi: "Le annotazioni USAP si raggiungono da cinque punti: Annotazioni › Annotazioni USAP…, Dati › Annotazioni della selezione…, Dati › Modifica le annotazioni…, Pannello informativo, banda Annotazioni.",
  pannelli: "Doppio comando: lo stesso pannello si accende anche da Vista › Pannelli.",
  viste: "Viste predefinite in tre posti: Vista › Vedi da, pulsanti sopra la vista 3D, Vista › Vista predefinita.",
  salva: "Tre comandi per salvare: Salva la sessione (Ctrl+S), Salva la sessione con nome, pulsante nelle proprietà del progetto.",
};

const ACTIONS = {
  // ---- File
  new_project:      { t: "Nuovo progetto", dlg: "newProject" },
  open_project:     { t: "Apri progetto", icon: "reshot-icon-open-envelope-974LYAFGWP.png", dlg: "openProject" },
  open_project_file:{ t: "Apri un file di progetto ...", dlg: "openProjectFile" },
  datalake:         { t: "Carica dal datalake", icon: "cloud-network-icon.png", dlg: "datalake",
                      note: "Indirizzo predefinito del datalake: matera-rest-api.na.icar.cnr.it (Preferenze › Rete)." },
  save_session:     { t: "Salva la sessione", sc: "Ctrl+S", dlg: "saveSession", note: NOTE.salva },
  save_session_as:  { t: "Salva la sessione con nome ...", icon: "reshot-icon-save-button-Y2ZUPHGVQ8.png", dlg: "saveSessionAs", note: NOTE.salva },
  close_project:    { t: "Chiudi progetto", dlg: "closeProject" },
  export_zip:       { t: "Esporta progetto (.zip)", dlg: "exportZip" },
  working_folder:   { t: "Imposta cartella di lavoro", dlg: "workingFolder", note: "Duplicato di Preferenze › Cartelle › Cartella di lavoro." },
  preferences:      { t: "Preferenze...", sc: "Ctrl+,", dlg: "preferences" },
  project_crs:      { t: "Imposta CRS di progetto", dlg: "projectCrs",
                      note: "Anche dalle proprietà del progetto; il CRS proposto ai nuovi progetti è in Preferenze › Sistemi di riferimento." },
  orphan_files:     { t: "Verifica file orfani ...", dlg: "orphanFiles" },
  screenshot:       { t: "Screenshot ...", dlg: "screenshot" },

  // ---- Geometria
  load_mesh:        { t: "Carica mesh", icon: "reshot-icon-file-photo-LAU4RFJNMP.png", dlg: "loadMesh" },
  load_cloud:       { t: "Carica nuvola di punti", icon: "reshot-icon-file-editing-MA3S46PGR9.png", dlg: "loadCloud" },
  geom_color:       { t: "Imposta colore geometria ...", dlg: "geomColor", note: NOTE.aspetto },
  geom_opacity:     { t: "Imposta opacità geometria ...", dlg: "geomOpacity" },
  geom_crs:         { t: "Imposta CRS geometria ...", dlg: "geomCrs" },
  measure_distance: { t: "Distanza", chk: false, group: "measure", log: "Misura: clic su due punti della scena." },
  measure_surface:  { t: "Superficie", chk: false, group: "measure", log: "Misura area: clic destro sul primo vertice, poi chiudi il poligono.",
                      note: "Le misure sono in Geometria › Calcola, i calcoli sulla scena in Servizi." },
  remove_geometry:  { t: "Rimuovi geometria", dlg: "removeGeometry" },
  cloud_decimation: { t: "Decimazione della nuvola...", dlg: "cloudDecimation" },
  point_size:       { t: "Dimensione dei punti...", dlg: "pointSize" },

  // ---- Dati
  load_data:        { t: "Carica dati", dlg: "loadData",
                      note: "Il nome non dice cosa carica: un file CSV o TXT di valori (uno per faccia o per vertice) che diventa un campo scalare sotto l'asset selezionato. Attiva solo con una mesh o una nuvola selezionata." },
  import_citygml:   { t: "Importa CityGML...", dlg: "importCityGml" },
  open_annotated:   { t: "Apri dataset annotato (CityGML + USAP)...", dlg: "openAnnotated" },
  // apre il pannello informativo sulla scheda Risultati del lazo (mainwindow.cpp:6881)
  sel_annotations:  { t: "Annotazioni della selezione corrente (USAP)...", tabGo: "info-lasso", note: NOTE.usapAccessi },
  sel_annotations_edit: { t: "Modifica le annotazioni della selezione (USAP)...", dlg: "selectionAnnotations",
                      note: "Apre la finestra «Annotazioni della selezione», la stessa che compare alla fine di Nuova annotazione; la voce precedente apre invece il pannello informativo sui Risultati del lazo." },
  save_value_field: { t: "Salva campo di valori in USAP...", dlg: "saveValueField" },
  query_value_fields:{ t: "Interroga campi di valori USAP...", dlg: "queryValueFields" },
  load_raster:      { t: "Carica raster (GeoTIFF, NetCDF)...", dlg: "loadRaster" },
  load_spherical:   { t: "Carica immagini sferiche (CSV)...", dlg: "loadSpherical",
                      note: "Il caricamento è in Dati, l'elenco delle immagini in Vista › Immagini sferiche…" },
  original_colors:  { t: "Colori originali dell'asset", dlg: "originalColors", note: NOTE.aspetto },
  asset_texture:    { t: "Texture dell'asset", dlg: "assetTexture", note: NOTE.aspetto },

  // ---- Annotazioni
  new_annotation:   { t: "Nuova annotazione...", icon: "edit-annotation-icon.png", dlg: "newAnnotation",
                      tip: "Disegna un lazo sull'asset attivo e annota la selezione nel suo pacchetto USAP" },
  ann_table:        { t: "Mostra tabella delle annotazioni", dis: true, tip: "Non disponibile: seleziona un set di annotazioni.", note: NOTE.ant },
  ann_filter:       { t: "Filtra ...", dis: true, tip: "Non disponibile: seleziona un set di annotazioni.", note: NOTE.ant },
  color_by_attr:    { t: "Colora la mesh in base al valore dell'attributo...", dis: true, tip: "Non disponibile: seleziona un set di annotazioni.", note: NOTE.ant },
  ann_color:        { t: "Imposta colore annotazione", dis: true, tip: "Non disponibile: seleziona un'annotazione.", note: NOTE.ant },
  query_mouse:      { t: "Interroga/modifica con il mouse", icon: "query-annotation-icon.png", chk: false, dis: true,
                      tip: "Non disponibile: funziona sui set di annotazioni .ant.", note: NOTE.ant },
  lasso_area:       { t: "Selezione a lazo (area)", icon: "lasso-selection-icon.png", chk: false, group: "lasso",
                      log: "Lazo d'area: clic destro sul primo vertice, clic sinistro per gli altri, doppio clic per chiudere." },
  lasso_line:       { t: "Selezione a lazo (linea)", icon: "polyline-selection-icon.png", chk: false, group: "lasso",
                      log: "Lazo a linea attivo." },
  lasso_points:     { t: "Selezione a lazo (punti)", icon: "noun_cube_corners_2294464.png", chk: false, group: "lasso", dis: true,
                      tip: "Non disponibile: seleziona una nuvola di punti nell'albero dei progetti." },
  clear_selection:  { t: "Annulla selezione", textOnly: true, log: "Selezione annullata." },
  sel_single:       { t: "Selezione singola", icon: "noun_319823_cc.png", chk: true, group: "selmode" },
  sel_additive:     { t: "Selezione additiva", icon: "noun_320139_cc.png", chk: false, group: "selmode" },
  sel_subtractive:  { t: "Selezione sottrattiva", icon: "noun_320133_cc.png", chk: false, group: "selmode" },
  remove_ann_set:   { t: "Rimuovi set di annotazioni ...", dis: true, tip: "Non disponibile: seleziona un set di annotazioni.", note: NOTE.ant },
  load_gis:         { t: "Carica layer GIS (drappeggiato)...", dlg: "loadGis",
                      note: "Il caricamento dei layer GIS sta nel menu Annotazioni; gli altri caricamenti sono in Geometria e Dati." },
  usap_annotations: { t: "Annotazioni USAP...", dlg: "usapAnnotations", note: NOTE.usapAccessi },

  // ---- Vista
  show_axes:        { t: "Mostra assi", chk: true, dis: true, note: "Due comandi per gli assi: «Mostra assi» (disabilitato) e «Overlay assi interattivo»." },
  axis_overlay:     { t: "Overlay assi interattivo", chk: false },
  show_colorbar:    { t: "Mostra barra colore", chk: false, dis: true, tip: "Non disponibile: nessun campo scalare visibile." },
  show_slider:      { t: "Mostra slider", chk: false, dis: true, tip: "Non disponibile: nessun campo scalare visibile." },
  view_top:         { t: "Alto", icon: "top.png", log: "Vista dall'alto.", note: NOTE.viste },
  view_west:        { t: "Ovest", icon: "west.png", log: "Vista da ovest.", note: NOTE.viste },
  view_south:       { t: "Sud", icon: "south.png", log: "Vista da sud.", note: NOTE.viste },
  view_ne:          { t: "Nord-est", icon: "north-east.png", log: "Vista da nord-est.", note: NOTE.viste },
  bg_color:         { t: "Imposta colore di background", dlg: "bgColor", note: NOTE.sfondo },
  draw_solid:       { t: "Solido", chk: true },
  draw_wire:        { t: "Wireframe", chk: false },
  draw_vertex:      { t: "Vertice", chk: false },
  show_props:       { t: "Mostra proprietà del layer", chk: true, dock: "dock-props", note: NOTE.pannelli },
  show_info:        { t: "Mostra pannello informativo", chk: true, dock: "dock-info",
                      note: NOTE.pannelli + " Questa voce accende anche la banda Annotazioni." },
  show_histogram:   { t: "Mostra istogramma (PDF)", chk: false, dock: "dock-histogram", note: NOTE.pannelli },
  show_legend:      { t: "Mostra legenda", chk: false, dock: "dock-legend", note: NOTE.pannelli },
  fit_scene:        { t: "Adatta la vista alla scena", log: "Vista adattata alla scena." },
  fit_selection:    { t: "Adatta la vista alla selezione", log: "Vista adattata alla selezione." },
  show_rasters:     { t: "Mostra layer raster", chk: true,
                      note: "Visibilità globale per tipo, in aggiunta alla casella di ogni riga dell'albero." },
  show_spherical:   { t: "Mostra immagini sferiche", chk: true,
                      note: "Visibilità globale per tipo, in aggiunta alla casella di ogni riga dell'albero." },
  spherical_list:   { t: "Immagini sferiche...", dlg: "sphericalImages",
                      note: "L'elenco è in Vista, il caricamento in Dati." },
  default_view:     { t: "Vista predefinita", log: "Vista predefinita.", note: NOTE.viste },

  // ---- Servizi
  shadows:          { t: "Ombreggiatura", icon: "reshot-icon-real-estate-VWNJU3EGPY.png", dlg: "shadows" },
  slope:            { t: "Pendenza", icon: "reshot-icon-road-K48V5E6TJ7.png", dlg: "slope",
                      note: "Richiede un'annotazione a linea dei set .ant del prototipo: sui dati USAP risponde «Selezione non valida»." },

  // ---- Plugin
  plugin_manager:   { t: "Gestione plugin...", dlg: "pluginManager" },
  run_plugin:       { t: "Esegui plugin…", dlg: "runPlugin", textOnly: true },
  add_plugin:       { t: "Aggiungi plugin…", dlg: "addPlugin", textOnly: true },
  clear_plugin_hl:  { t: "Togli evidenziazione dei plugin", dis: true, tip: "Nessun elemento evidenziato da un plugin." },
  plugin_inventory: { t: "Inventario di una cartella...", dlg: "plugin_inventory",
                      note: "Lo stesso comando compare anche in File › Esporta › Plugin." },
  plugin_assetstats:{ t: "Statistiche dell'asset...", dlg: "plugin_assetstats",
                      note: "Comando di plugin presente in tre punti: menu Plugin, barra Plugin, pannello del plugin." },
  plugin_assetstats_tb: { t: "Statistiche dell'asset", dlg: "plugin_assetstats", textOnly: true },
  plugin_assetstats_panel: { t: "Statistiche dell'asset", chk: false,
                      log: "Pannello «Statistiche dell'asset» acceso: lo stesso modulo della finestra, agganciato a destra.",
                      note: "Plugin › Pannelli accende il pannello agganciato dei comandi con superficie «panel»: terzo accesso allo stesso comando (menu, barra, pannello)." },

  // ---- Info
  licence:          { t: "Licenza", dlg: "licence" },
  tour:             { t: "Tour dell'interfaccia", icon: "reshot-icon-bubble-information-XKYB4QZUR5.png", run: "tour" },
  welcome:          { t: "Guida introduttiva...", dlg: "welcome" },
};

const SEP = "---";

/* Menu: stringa = id di ACTIONS, SEP = separatore, { t, items } = sottomenu,
 * { panels: true } = sottomenu «Pannelli» costruito all'apertura. */
const MENUS = [
  { t: "File", items: [
    "new_project", "open_project", "open_project_file", "datalake", "save_session", "save_session_as", SEP,
    "close_project", SEP,
    { t: "Esporta", items: ["export_zip", SEP, { t: "Plugin", items: ["plugin_inventory"] }] }, SEP,
    "working_folder", "preferences", "project_crs", "orphan_files", SEP,
    "screenshot",
  ]},
  { t: "Geometria", items: [
    "load_mesh", "load_cloud", SEP,
    "geom_color", "geom_opacity", "geom_crs", SEP,
    { t: "Calcola", items: ["measure_distance", "measure_surface"] }, SEP,
    "remove_geometry", "cloud_decimation", "point_size",
  ]},
  { t: "Dati", items: [
    "load_data", "import_citygml", "open_annotated", "sel_annotations", "sel_annotations_edit",
    "save_value_field", "query_value_fields", "load_raster", "load_spherical", "original_colors", "asset_texture",
  ]},
  { t: "Annotazioni", items: [
    "new_annotation", SEP,
    "ann_table", "ann_filter", SEP,
    "color_by_attr", "ann_color", SEP,
    { t: "Strumenti", items: ["query_mouse", SEP, "lasso_area", "lasso_line", "lasso_points", SEP, "clear_selection"] },
    { t: "Modalità di selezione", items: ["sel_single", "sel_additive", "sel_subtractive"] }, SEP,
    "remove_ann_set", SEP,
    "load_gis", "usap_annotations",
  ]},
  { t: "Vista", items: [
    "show_axes", "axis_overlay", "show_colorbar", "show_slider", SEP,
    { t: "Vedi da ...", items: ["view_top", "view_west", "view_south", "view_ne"] }, SEP,
    "bg_color", "draw_solid", "draw_wire", "draw_vertex",
    "show_props", "show_info", "show_histogram", "show_legend",
    { t: "Pannelli", panels: true, note: NOTE.pannelli },
    SEP,
    "fit_scene", "fit_selection", "show_rasters", "show_spherical", "spherical_list", "default_view",
  ]},
  { t: "Servizi", items: ["shadows", "slope"] },
  { t: "Plugin", items: [
    "plugin_manager", "run_plugin", "add_plugin", "clear_plugin_hl", SEP,
    "plugin_inventory", "plugin_assetstats", SEP,
    { t: "Pannelli", items: ["plugin_assetstats_panel"] },
  ]},
  { t: "Info", items: ["licence", "tour", "welcome"] },
];

/* Barre degli strumenti, nell'ordine e con i separatori reali. */
const TOOLBARS = [
  ["datalake", "open_project", "load_mesh", "load_cloud", SEP, "save_session_as"],
  ["shadows", "slope"],
  ["new_annotation", SEP, "query_mouse", SEP, "lasso_area", "lasso_line", "lasso_points", SEP,
   "sel_single", "sel_additive", "sel_subtractive", "clear_selection"],
  ["tour"],
];
const PLUGIN_TOOLBAR = ["run_plugin", "add_plugin", "plugin_assetstats_tb"];
const VIEW_BUTTONS = ["view_top", "view_ne", "view_south", "view_west"];

/* Pannelli agganciabili (Vista › Pannelli, in ordine alfabetico come nel codice). */
const DOCKS = [
  { id: "dock-annotations", t: "Annotazioni" },
  { id: "dock-histogram",   t: "Istogramma (PDF)" },
  { id: "dock-legend",      t: "Legenda" },
  { id: "dock-log",         t: "Log" },
  { id: "dock-info",        t: "Pannello informativo" },
  { id: "dock-projects",    t: "Progetti" },
  { id: "dock-props",       t: "Proprietà del layer" },
  { id: "dock-map",         t: "Vista mappa" },
];

/* Azioni del pannello «Proprietà del layer» e del menu contestuale dell'albero,
 * per tipo di riga (utils/layer_info.cpp; i dataset 3D usano i nomi del menu). */
const LAYER_ACTIONS = {
  project:   [["Nascondi"], ["Imposta CRS di progetto", "projectCrs"], ["Salva la sessione con nome", "saveSessionAs"], ["Chiudi progetto", "closeProject"]],
  dataset:   [["Nascondi"], ["Inquadra questo layer"], ["Rinomina", "rename"], ["Imposta colore geometria", "geomColor"],
              ["Imposta opacità geometria", "geomOpacity"], ["Imposta CRS geometria", "geomCrs"], ["Sposta su"], ["Sposta giù"], ["Rimuovi geometria", "removeGeometry"]],
  gis:       [["Nascondi"], ["Inquadra questo layer"], ["Rinomina...", "rename"], ["Colora per attributo...", "gpkgColor"],
              ["Sposta su"], ["Sposta giù"], ["Rimuovi", "removeLayer"]],
  citygml:   [["Nascondi"], ["Inquadra questo layer"], ["Oggetti e attributi...", "@info-cityobject"], ["Opacità...", "layerOpacity"],
              ["Livello di dettaglio...", "lod"], ["Rimuovi", "removeLayer"]],
  raster:    [["Nascondi"], ["Inquadra questo layer"], ["Opacità...", "layerOpacity"], ["Altezza...", "rasterHeight"], ["Sposta su"], ["Sposta giù"], ["Rimuovi", "removeLayer"]],
  spherical: [["Nascondi"], ["Inquadra questo layer"], ["Sposta su"], ["Sposta giù"], ["Rimuovi", "removeLayer"]],
  scalar:    [["Nascondi"], ["Inquadra questo layer"], ["Sposta su"], ["Sposta giù"]], // Kind::ScalarField, layer_info.cpp:69
};
let LAYER_ACTIONS_NOTE = "I dataset 3D usano i nomi del menu («Imposta colore geometria»), gli altri layer nomi brevi («Colore...»): stessa azione, etichette diverse.";
