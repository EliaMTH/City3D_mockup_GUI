/* City3D — mockup: modifiche proposte rispetto alla release 366fdda.
 * menus.js resta la fotografia della release; qui c'è solo ciò che cambia.
 * Ogni blocco rimanda alla sezione del README che lo descrive. */

/* ---------- Lazo: due strumenti invece di tre (README › Vista 3D) ---------- */
// Il tipo (facce o punti) segue l'asset selezionato; resta a parte solo il lazo sugli spigoli.
ACTIONS.lasso = { t: "Selezione a lazo", icon: "lasso-selection-icon.png", chk: false, group: "lasso" };
ACTIONS.lasso_line.t = "Selezione a lazo (spigoli)";
ACTIONS.lasso_line.log = "Lazo sugli spigoli: clic sinistro sui vertici della polilinea, doppio clic per chiudere.";
delete ACTIONS.lasso_area;
delete ACTIONS.lasso_points;

/* ---------- Modo del lazo: non è uno strumento (README › Vista 3D) ---------- */
// SINGLE / ADD / REMOVE = il prossimo lazo sostituisce, aggiunge o toglie (LassoPointSelectionStyle.cpp:481).
Object.assign(ACTIONS.sel_single, { t: "Sostituisci la selezione", tip: "Modo del lazo: il prossimo lazo sostituisce la selezione" });
Object.assign(ACTIONS.sel_additive, { t: "Aggiungi alla selezione", tip: "Modo del lazo: il prossimo lazo si aggiunge alla selezione" });
Object.assign(ACTIONS.sel_subtractive, { t: "Togli dalla selezione", tip: "Modo del lazo: il prossimo lazo si toglie dalla selezione" });

/* ---------- Modo di disegno: tre pulsanti nella vista, combinabili come oggi (README › Vista 3D) ---------- */
// Solido, Wireframe e Vertice si sommano, con almeno uno acceso (preventAllViewUnchecked, mainwindow.cpp:10201).

/* ---------- Menu Visualizza (oggi Vista) (README › Menu Visualizza) ---------- */
Object.assign(MENUS.find((m) => m.t === "Vista"), { t: "Visualizza", items: [
  "show_axes", "show_colorbar", "show_slider", SEP,
  "show_histogram", "show_legend", SEP,
  "show_rasters", "show_spherical",
]});
// Tolte: Overlay assi interattivo, Vedi da…, Imposta colore di background (resta solo in Preferenze),
// Solido/Wireframe/Vertice, Mostra proprietà del layer, Mostra pannello informativo, Pannelli,
// Adatta alla scena/selezione, Vista predefinita. Spostata: Immagini sferiche… (in Importa, vedi layout.js).

/* ---------- Menu Plugin (README › Menu Plugin) ---------- */
// Tolte: Esegui plugin… (stessi comandi dell'elenco) e Aggiungi plugin… (= «Installa da file…» di Gestione plugin).
// Tolto: Pannelli › (i comandi dei plugin si aprono già nel pannello a destra).
// Tolta anche Togli evidenziazione dei plugin: la sostituisce l'etichetta nella vista (README › Vista 3D).
MENUS.find((m) => m.t === "Plugin").items = ["plugin_manager", SEP, "plugin_inventory", "plugin_assetstats"];

/* ---------- Menu Progetto (oggi File) (README › Menu Progetto) ---------- */
// Progetto e sessione sono lo stesso file (project.json): «Salva la sessione» diventa «Salva progetto» (Ctrl+S).
ACTIONS.save_session.t = "Salva progetto";
// I messaggi del salvataggio parlano del progetto: project.json ne è solo un pezzo. Come nella release
// (save_session_here, mainwindow.cpp:9605) Ctrl+S non apre finestre: scrive una riga nel log.
{
  const SAVED = `Progetto 'catania_demo' salvato in ${WORK}/catania_demo.`;
  delete ACTIONS.save_session.dlg;
  ACTIONS.save_session.log = SAVED;
  DIALOGS.closeProject = () => msg("question", "Salva progetto", "Il progetto «catania_demo» è cambiato dall'ultimo salvataggio.<br>Salvarlo prima di chiudere?<br><span class='muted'>Le modifiche ai file CityGML sono già scritte nei file.</span>",
    [{ t: "Salva", primary: true, log: SAVED, close: true }, { t: "Non salvare", close: true }, { t: "Annulla", close: true }]);
}
Object.assign(MENUS.find((m) => m.t === "File"), { t: "Progetto", items: [
  "new_project", "open_project", "save_session", "close_project", SEP,
  "preferences",
]});
// Tolte: Apri un file di progetto, Carica dal datalake (è in Importa), Salva la sessione con nome,
// Esporta › (è il menu Esporta della pulsantiera, con il suo Plugin ›), Imposta cartella di lavoro
// (Preferenze), Imposta CRS di progetto (tasto destro sulla riga del progetto), Screenshot (è in Esporta),
// Verifica file orfani (non è nei requisiti: viene dal prototipo).
// «Salva la sessione con nome» esce anche dalle azioni del progetto nell'albero.
LAYER_ACTIONS.project = LAYER_ACTIONS.project.filter(([label]) => label !== "Salva la sessione con nome");

/* ---------- Nomi brevi per le azioni dei layer, uguali per tutti i tipi (README › Proprietà del layer e tasto destro) ---------- */
// Oggi i dataset 3D usano i nomi dei vecchi menu («Imposta colore geometria»), gli altri layer quelli
// brevi di utils/layer_info.cpp («Opacità...»): ora tutti usano quelli brevi.
{
  const SHORT = { "Imposta colore geometria": "Colore...", "Imposta opacità geometria": "Opacità...", "Imposta CRS geometria": "Imposta CRS...",
    "Imposta CRS di progetto": "Imposta CRS...", "Rimuovi geometria": "Rimuovi", "Rinomina": "Rinomina...", "Opacità...": "Opacità..." };
  for (const list of Object.values(LAYER_ACTIONS)) list.forEach((a) => { if (SHORT[a[0]]) a[0] = SHORT[a[0]]; });
}

/* ---------- Menu Geometria: tolto (README › Menu tolti) ---------- */
// Carica mesh / nuvola: sono in Importa. Colore e opacità: Aspetto e Opacità nelle Proprietà del layer.
// Imposta CRS e Rimuovi: tasto destro sull'albero. Calcola: va in Servizi.
// Decimazione e Dimensione dei punti: azioni della nuvola di punti nel pannello Proprietà del layer.
MENUS.splice(MENUS.findIndex((m) => m.t === "Geometria"), 1);
MENUS.find((m) => m.t === "Servizi").items = ["shadows", "slope", SEP, { t: "Calcola", items: ["measure_distance", "measure_surface"] }];
{
  const d = LAYER_ACTIONS.dataset;
  const afterCrs = d.findIndex(([label]) => label === "Imposta CRS...") + 1;
  // la decimazione vale solo per le nuvole .las/.laz (mainwindow.cpp:10490)
  LAYER_ACTIONS.cloud = [...d.slice(0, afterCrs), ["Dimensione dei punti...", "pointSize"], ["Decimazione...", "cloudDecimation"], ...d.slice(afterCrs)];
}

/* ---------- Evidenziazione dei plugin: etichetta nella vista (README › Vista 3D) ---------- */
// L'esito di un plugin non ha più il pulsante «Togli evidenziazione»: l'evidenziazione che lascia
// nella vista è segnalata (e si toglie) dall'etichetta in basso nella vista 3D.
{
  const original = DIALOGS.pluginResult;
  DIALOGS.pluginResult = (ctx) => {
    const spec = original(ctx);
    spec.foot = spec.foot.filter((b) => b.t !== "Togli evidenziazione");
    spec.highlight = true; // la release sa solo se c'è un'evidenziazione, non di chi né quanti elementi
    return spec;
  };
}

/* ---------- Menu Dati: tolto (README › Menu tolti) ---------- */
// Importa CityGML, Apri dataset annotato, Carica raster, Carica immagini sferiche: sono già in Importa.
// Annotazioni della selezione corrente: è il pannello Risultati lazo della striscia.
// Modifica le annotazioni della selezione: è il pulsante «Nuova annotazione…» della vista (README › Vista 3D).
// Colori originali e Texture: con Colore… diventano l'Aspetto dell'asset nelle Proprietà del layer.
// Carica dati: diventa «Carica valori (CSV, TXT)…», azione dell'asset. Salva campo di valori: azione del
// campo scalare. Interroga campi di valori: sezione del pannello Annotazioni USAP (README › Pannelli della striscia).
MENUS.splice(MENUS.findIndex((m) => m.t === "Dati"), 1);
for (const key of ["dataset", "cloud"]) {
  const list = LAYER_ACTIONS[key];
  list.splice(list.findIndex(([label]) => label === "Colore..."), 1, ["Aspetto", "@appearance"]); // «Colore uniforme…» è il Colore… di oggi
  list.splice(list.findIndex(([label]) => label === "Sposta su"), 0, ["Carica valori (CSV, TXT)...", "loadData"]);
}
{
  const original = DIALOGS.loadData;
  DIALOGS.loadData = (ctx) => Object.assign(original(ctx), { title: "Carica valori (CSV, TXT)" });
}
LAYER_ACTIONS.scalar.splice(2, 0, ["Salva in USAP...", "saveValueField"]);
{
  const original = DIALOGS.geomColor;
  DIALOGS.geomColor = (ctx) => {
    const spec = original(ctx);
    if (ctx && ctx.onOk) spec.foot = spec.foot.map((b) => (b.primary ? { ...b, run: ctx.onOk } : b));
    return spec;
  };
}

/* ---------- Annotare la selezione: un solo pulsante (README › Vista 3D) ---------- */
// Nuova annotazione e Modifica le annotazioni della selezione aprono la stessa finestra: si uniscono.
// Con una selezione la finestra si apre su quella; senza, si arma il lazo e la finestra si apre alla chiusura.
ACTIONS.sel_annotations_edit.t = "Nuova annotazione..."; // stessa finestra del pulsante unico
Object.assign(ACTIONS.new_annotation, {
  tip: "Con una selezione apre il pannello per creare l'annotazione.\nSenza selezione arma il lazo: il pannello si apre quando lo chiudi." });

/* ---------- Interroga: ultimo pulsante della pulsantiera della vista (README › Vista 3D) ---------- */
// Legge le proprietà degli elementi del layer GIS selezionato (nella release anche dei set .ant, che escono: README › Set di annotazioni .ant).
// Fa gruppo con i lazi: uno solo attivo alla volta, come nella release (mainwindow.cpp:10048).
Object.assign(ACTIONS.query_mouse, { dis: false, group: "lasso",
  tip: "Clic su un elemento del layer GIS selezionato per leggerne le proprietà." });

/* ---------- Menu Annotazioni: tolto (README › Menu tolti) ---------- */
// Nuova annotazione: è il pulsante «Nuova annotazione…» della vista (README › Vista 3D).
// Mostra tabella delle annotazioni, Filtra…, Imposta colore annotazione, Rimuovi set di annotazioni: lavorano
// solo sui set .ant, che escono dal prodotto (README › Set di annotazioni .ant). Colora per attributo: resta nelle Proprietà dei layer GIS.
// Strumenti › e Modalità di selezione ›: sono nella pulsantiera della vista. Carica layer GIS: è in Importa.
// Annotazioni USAP…: pannello fisso della striscia (layout.js, PANELS), con la sezione Campi di valori.
MENUS.splice(MENUS.findIndex((m) => m.t === "Annotazioni"), 1);

/* Pannello Annotazioni USAP (README › Pannelli della striscia): le annotazioni del pacchetto in uso, poi i campi di valori (ex Interroga
 * campi di valori). Escono «Esporta annotazioni della mesh», con i campi CityObject e Classe semantica che
 * servivano solo a quella, e «Importa nel progetto»: lavoravano sui set .ant (README › Set di annotazioni .ant). Esce anche la riga del
 * pacchetto (percorso, Sfoglia…, Apri/Ricarica): il pannello mostra il pacchetto in uso nel progetto, quello su
 * cui la release apre già la finestra (mainwindow.cpp:7515), e si aggiorna dopo ogni scrittura (refresh_usap_views). */
DIALOGS.usapPanel = () => ({
  body: `<div class="section-title">Annotazioni (47.666 nel pacchetto)</div>
    ${H.table(["Id", "Uid", "Classe", "Etichetta", "Stato", "Elementi"], [
      ["1", "ann_bldg_w234077276", "Building", "ann_bldg_w234077276", "draft", "412"],
      ["2", "ann_bldg_w130301360", "Building", "ann_bldg_w130301360", "draft", "96"],
      ["3", "ann_bldg_w129791254_Roof_1", "RoofSurface", "ann_bldg_w129791254_Roof_1", "draft", "38"],
      ["33718", "ann_bldg_w29315736", "Building", "Teatro Greco Romano", "draft", "3401"],
      ["33719", "ann_bldg_w29315736_Roof_1", "RoofSurface", "ann_bldg_w29315736_Roof_1", "draft", "214"]], { h: 150, sel: 4 })}
    <div class="code" style="height:118px">Uid: ann_bldg_w29315736
Classe: Building (http://www.opengis.net/citygml/building/3.0#Building)
Confidenza: 0,90
Elementi su catania.obj, parte 1 (facce): 3401
Attributi:
{ "derivation": "catania-pipeline-v1" }</div>
    <div class="section-title">Campi di valori (2)</div>
    ${DIALOGS.queryValueFields().body}`,
});

/* ---------- Azioni dei layer: pannello o tasto destro, senza ripetizioni (README › Proprietà del layer e tasto destro) ---------- */
// Nel pannello Proprietà del layer le azioni sull'aspetto e quelle importanti; nel tasto destro sull'albero
// quelle di gestione: mostra/nascondi, inquadra, rinomina, CRS, sposta, rimuovi, chiudi (decisione CNR 20/11/2026).
const PANEL_ACTIONS = new Set(["@appearance", "geomOpacity", "layerOpacity", "pointSize", "cloudDecimation", "loadData",
  "gpkgColor", "lod", "@info-cityobject", "rasterHeight", "saveValueField"]);

/* ---------- Nuova annotazione (oggi «Annotazioni della selezione»), rifatta per il pannello (README › Finestra Nuova annotazione) ---------- */
// Resta solo la creazione. Le annotazioni esistenti si raggiungono dal pannello Risultati lazo, che porta al pannello
// Annotazione (Modifica metadati…, Elimina…, assessment, Modifica elementi…): tabella e comandi escono da qui.
{
  const CONCEPTS = ["Scegli il concetto", "Building", "BuildingPart", "RoofSurface", "WallSurface", "GroundSurface", "… (66 classi)"];
  DIALOGS.selectionAnnotations = () => ({
    title: "Nuova annotazione", w: 560,
    body: `<div class="muted">Selezione lazo su 'catania.obj': 29.008 facce, 15.551 vertici/punti</div>
      ${H.form(
        H.row("CityObject:", `<div class="pathrow"><input type="text" value="bldg_w29315736" placeholder="gml:id dell'oggetto CityGML (facoltativo)" style="flex:1"><button class="btn sm" data-dlg="newCityObject">Nuovo CityObject...</button></div>`),
        H.row("Concetto:", `<select>${CONCEPTS.map((c) => `<option${c === "Building" ? " selected" : ""}>${c}</option>`).join("")}</select>`),
        H.row("Etichetta:", H.input("", "Etichetta (facoltativa)")))}
      <div class="btnrow left"><button class="btn primary" data-dlg="annotationCreated">Crea dalla selezione</button></div>`,
    foot: CLOSE,
  });
}

/* ---------- I comandi si aprono nel pannello a destra (README › Comandi nel pannello a destra) ---------- */
/* Eccezioni: finestre che restano mobili (README › Comandi nel pannello a destra). Una finestra aperta da una finestra mobile
 * resta mobile (es. i passi successivi di un'importazione). */
const FLOATING = {
  importa:      ["datalake", "datalakeSettings", "loadMesh", "meshEpsg", "meshCopy", "loadCloud", "cloudEpsg", "cloudQuestion",
                 "importCityGml", "citygmlLod", "openAnnotated", "openAnnotatedUsap", "annotatedResult", "loadRaster", "netcdf",
                 "loadSpherical", "sphericalLoaded", "sphericalImages", "loadGis",
                 "loadData", "importText"], // Carica valori (CSV, TXT): azione dell'asset, ma è un import (README › Proprietà del layer e tasto destro)
  esporta:      ["exportZip", "exportDone", "screenshot", "plugin_inventory"],
  progetto:     ["newProject", "openProject", "closeProject", "projectCrs"],
  applicazione: ["preferences", "pluginManager", "addPlugin", "pluginInstalled"],
  info:         ["licence", "welcome"],
  vista360:     ["sphericalViewer"],
  // finestre del sistema operativo (scelta di file e cartelle): restano native
  sistema:      ["fileGeneric", "saveLog", "newPackage", "openPackage"],
};
const FLOATING_KIND = {};
for (const [kind, ids] of Object.entries(FLOATING)) ids.forEach((id) => (FLOATING_KIND[id] = kind));

/* Selezione bloccata durante un comando (README › Comandi nel pannello a destra), tranne nei comandi progettati per
 * seguirla: oggi i pannelli dei plugin (PluginRunWidget, che si aggiorna a ogni nuova selezione). */
const FOLLOWS_SELECTION = new Set(["runPlugin", "plugin_assetstats", "pluginResult",
  "gisFeature"]); // l'esito di Interroga (README › Vista 3D) non usa la selezione: la lascia libera

/* Comandi che lavorano sul layer selezionato: il pannello lo indica e il bersaglio resta
 * quello dell'apertura anche se nell'albero si seleziona un'altra riga (README › Comandi nel pannello a destra). */
const LAYER_COMMANDS = new Set(["geomColor", "geomOpacity", "geomCrs", "removeGeometry", "cloudDecimation", "pointSize",
  "lod", "originalColors", "assetTexture", "gpkgColor", "layerOpacity", "rasterHeight", "removeLayer", "saveValueField"]);
