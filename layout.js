/* City3D — mockup v2: disposizione stile Blender / Unreal 5.
 * menus.js (azioni e menu attuali) e dialogs.js (finestre) sono quelli del primo mockup;
 * qui ci sono solo le parti nuove: icone, pulsantiere, pannelli. */

/* ---------- icone lineari (viewBox 24x24, tratto = colore del testo) ---------- */
const DOT = (x, y, r = 1.4) => `<circle cx="${x}" cy="${y}" r="${r}" fill="currentColor" stroke="none"/>`;
const ICONS = {
  app:        `<path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z"/><path d="M12 12l8-4.5M12 12v9M12 12L4 7.5"/>`,
  filePlus:   `<path d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8z"/><path d="M14 3v5h5"/><path d="M12 11v6M9 14h6"/>`,
  folderOpen: `<path d="M3 6.5h6l2 2h9.5V18a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/><path d="M3 11h17.5"/>`,
  save:       `<path d="M5 3h11l3 3v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1z"/><path d="M8 3v5h7V3"/><rect x="8" y="13" width="8" height="6"/>`,
  import:     `<path d="M12 3v11"/><path d="M8 10l4 4 4-4"/><path d="M4 15v4a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-4"/>`,
  export:     `<path d="M12 15V4"/><path d="M8 8l4-4 4 4"/><path d="M4 15v4a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-4"/>`,
  chevron:    `<path d="M7 10l5 5 5-5"/>`,
  lassoArea:  `<path d="M5 9c0-3 3-5 7-5s7 2 7 5-3 5-7 5c-1.5 0-3-.3-4-.8"/><path d="M8 13.2c-1.2 1-1 2.4.5 2.9s1.2 2.4-.6 3.9"/>`,
  lassoLine:  `<path d="M3 17l5-7 5 4 4-8 4 3"/>${DOT(3, 17, 1.3)}${DOT(8, 10, 1.3)}${DOT(13, 14, 1.3)}${DOT(17, 6, 1.3)}${DOT(21, 9, 1.3)}`,
  lassoPoints:`${DOT(6, 7)}${DOT(12, 5)}${DOT(18, 8)}${DOT(5, 13)}${DOT(11, 11)}${DOT(17, 14)}${DOT(8, 18)}${DOT(14, 19)}${DOT(20, 19)}`,
  selSingle:  `<path d="M6 3.5l5.5 15.5 2.3-6.4 6.4-2.3z"/>`,
  selReplace: `<rect x="5" y="5" width="14" height="14" rx="1.5" fill="currentColor" fill-opacity=".35"/>`,
  selAdd:     `<rect x="3" y="7" width="12" height="12" rx="1"/><path d="M18 3v6M15 6h6"/>`,
  selSub:     `<rect x="3" y="7" width="12" height="12" rx="1"/><path d="M15 6h6"/>`,
  clearSel:   `<rect x="4" y="4" width="16" height="16" rx="1" stroke-dasharray="3 2.2"/><path d="M9 9l6 6M15 9l-6 6"/>`,
  fitScene:   `<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/><rect x="8" y="8" width="8" height="8"/>`,
  fitSel:     `<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/><circle cx="12" cy="12" r="3"/>`,
  home:       `<path d="M4 11.5l8-7 8 7"/><path d="M6.5 10v10h11V10"/>`,
  shadeSolid: `<circle cx="12" cy="12" r="8" fill="currentColor" stroke="none" opacity=".9"/>`,
  shadeWire:  `<circle cx="12" cy="12" r="8"/><ellipse cx="12" cy="12" rx="3.5" ry="8"/><path d="M4 12h16"/>`,
  shadeVertex:`${DOT(12, 4.5, 1.2)}${DOT(12, 19.5, 1.2)}${DOT(4.5, 12, 1.2)}${DOT(19.5, 12, 1.2)}${DOT(6.7, 6.7, 1.2)}${DOT(17.3, 6.7, 1.2)}${DOT(6.7, 17.3, 1.2)}${DOT(17.3, 17.3, 1.2)}${DOT(12, 12, 1.2)}`,
  annotate:   `<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13 7l4 4"/>`,
  plusCircle: `<circle cx="12" cy="12" r="8"/><path d="M12 8v8M8 12h8"/>`,
  minusCircle:`<circle cx="12" cy="12" r="8"/><path d="M8 12h8"/>`,
  listSearch: `<path d="M4 6h11M4 11h7M4 16h5"/><circle cx="16" cy="15" r="3.5"/><path d="M18.5 17.5L21 20"/>`,
  sliders:    `<path d="M4 6h9M19 6h1M4 12h3M11 12h9M4 18h11M19 18h1"/><circle cx="16" cy="6" r="2.2"/><circle cx="9" cy="12" r="2.2"/><circle cx="17" cy="18" r="2.2"/>`,
  building:   `<path d="M4 21V8l6-4v17"/><path d="M10 21V10l10 3v8"/><path d="M3 21h18"/><path d="M6.5 10h1M6.5 13h1M6.5 16h1M13 15h1M16.5 16h1"/>`,
  tag:        `<path d="M3 12V4h8l10 10-7 7z"/><circle cx="7.5" cy="8" r="1.4"/>`,
  lassoList:  `<path d="M3 8c0-2.5 2.5-4 6-4s6 1.5 6 4-2.5 4-6 4c-1.2 0-2.3-.2-3.2-.6"/><path d="M5.8 11.4c-.9.8-.7 1.9.5 2.3"/><path d="M13 15.5h8M13 18.5h8M16 21h5"/>`,
  map:        `<path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2z"/><path d="M9 4v14M15 6v14"/>`,
  hierarchy:  `<rect x="9" y="3" width="6" height="4" rx=".5"/><rect x="3" y="17" width="6" height="4" rx=".5"/><rect x="15" y="17" width="6" height="4" rx=".5"/><path d="M12 7v5M6 17v-5h12v5"/>`,
  terminal:   `<rect x="3" y="4" width="18" height="16" rx="1.5"/><path d="M7 9l3 3-3 3M12 15h5"/>`,
  folder:     `<path d="M3 6.5h6l2 2h10V18a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/>`,
  mesh:       `<path d="M12 3l9 5v8l-9 5-9-5V8z"/><path d="M12 3v18M3 8l18 8M21 8L3 16"/>`,
  cloud:      `${DOT(5, 12, 1.1)}${DOT(8, 8, 1.1)}${DOT(9, 14, 1.1)}${DOT(12, 6, 1.1)}${DOT(13, 11, 1.1)}${DOT(12, 17, 1.1)}${DOT(16, 8, 1.1)}${DOT(17, 13, 1.1)}${DOT(19, 17, 1.1)}${DOT(6, 18, 1.1)}`,
  layers:     `<path d="M12 4l9 5-9 5-9-5z"/><path d="M3 14l9 5 9-5"/>`,
  grid:       `<rect x="4" y="4" width="16" height="16"/><path d="M4 9.3h16M4 14.6h16M9.3 4v16M14.6 4v16"/>`,
  field:      `<rect x="4" y="4" width="16" height="16"/><path d="M4 16c4-6 8 2 16-6"/>`,
  globe:      `<circle cx="12" cy="12" r="8"/><ellipse cx="12" cy="12" rx="8" ry="3"/><path d="M12 4v16"/>`,
  eye:        `<path d="M2.5 12s3.5-6.5 9.5-6.5 9.5 6.5 9.5 6.5-3.5 6.5-9.5 6.5S2.5 12 2.5 12z"/><circle cx="12" cy="12" r="2.8"/>`,
  eyeOff:     `<path d="M3 3l18 18"/><path d="M10.6 5.6A9 9 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a16 16 0 0 1-2.9 3.6M6.8 6.8C4 8.6 2.5 12 2.5 12s3.5 6.5 9.5 6.5a9 9 0 0 0 4.4-1.1"/>`,
  warn:       `<path d="M12 4l9 16H3z"/><path d="M12 10v4"/>${DOT(12, 17, 1)}`,
  error:      `<circle cx="12" cy="12" r="8"/><path d="M9 9l6 6M15 9l-6 6"/>`,
  info:       `<circle cx="12" cy="12" r="8"/><path d="M12 11v5"/>${DOT(12, 8, 1)}`,
  bolt:       `<path d="M13.5 3L5 13.5h6l-1.5 7.5L18 10.5h-6z"/>`,
  plug:       `<path d="M9 3v5M15 3v5"/><path d="M6 8h12v3a6 6 0 0 1-12 0z"/><path d="M12 17v4"/>`,
};
function icon(name, size = 16) {
  return `<svg class="ic" viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${ICONS[name] || ""}</svg>`;
}

/* ---------- azioni aggiunte dalla nuova disposizione ---------- */
ACTIONS.membership_add = { t: "Aggiungi la selezione alla membership", dlg: "membershipAdd" };
ACTIONS.membership_remove = { t: "Rimuovi la selezione dalla membership", dlg: "membershipRemove" };

/* ---------- pulsantiera in alto: solo apertura, importazione, esportazione ---------- */
const TOP_TOOLBAR = [
  { a: "new_project", icon: "filePlus", label: "Nuovo" },
  { a: "open_project", icon: "folderOpen", label: "Apri" },
  { a: "save_session", icon: "save", label: "Salva" },
  SEP,
  { drop: "Importa", icon: "import", items: ["load_mesh", "load_cloud", "import_citygml", "open_annotated", "load_raster", "load_gis", "load_spherical", "spherical_list", SEP, "datalake"] },
  // "spherical_list" (Immagini sferiche…) arriva dal menu Vista: PROPOSTA-UI.md §5
  // i comandi di esportazione dei plugin in un sottomenu, come File › Esporta › Plugin: PROPOSTA-UI.md §6.3
  { drop: "Esporta", icon: "export", items: ["export_zip", "screenshot", SEP, { t: "Plugin", items: ["plugin_inventory"] }] },
];

/* Dopo Esporta, separati da una linea a puntini: i comandi che i plugin agganciano alla barra
 * (superficie «toolbar» del manifest). Testo accanto all'icona, come nella release: un plugin
 * può non avere un'icona propria (qui l'icona generica). PROPOSTA-UI.md §6 */
const PLUGIN_TOOLBAR_CMDS = [
  { a: "plugin_assetstats_tb", label: "Statistiche dell'asset", plugin: "Statistiche asset" },
];

/* ---------- pulsantiera della vista 3D, su una riga ----------
 * { seg } = viste predefinite; { radio } e { mode } = modi esclusivi, mostrati in grigio (PROPOSTA-UI.md §3) */
const VIEWPORT_TOOLBAR = [
  // strumenti (blu quando attivi), poi il modo del lazo (grigio: non è uno strumento), poi annulla selezione
  [["lasso", "lassoArea"], ["lasso_line", "lassoLine"],
   { mode: [["sel_single", "selReplace"], ["sel_additive", "selAdd"], ["sel_subtractive", "selSub"]] }, ["clear_selection", "clearSel"]],
  [{ seg: [["view_top", "Alto"], ["view_ne", "NE"], ["view_south", "S"], ["view_west", "O"]] },
   ["fit_scene", "fitScene"], ["fit_selection", "fitSel"], ["default_view", "home"], SEP,
   { radio: [["draw_solid", "shadeSolid"], ["draw_wire", "shadeWire"], ["draw_vertex", "shadeVertex"]] }],
  [["new_annotation", "annotate"], ["membership_add", "plusCircle"], ["membership_remove", "minusCircle"], ["sel_annotations", "listSearch"]],
];

/* ---------- striscia dei pannelli (stile Blender) ---------- */
const PANELS = [
  { id: "props",      t: "Proprietà del layer", icon: "sliders" },
  { id: "cityobject", t: "CityObject",          icon: "building" },
  { id: "annotation", t: "Annotazione",         icon: "tag" },
  { id: "lasso",      t: "Risultati lazo",      icon: "lassoList" },
  { id: "map",        t: "Mappa 2D",            icon: "map" },
  { id: "concepts",   t: "Concetti semantici",  icon: "hierarchy" },
  { id: "log",        t: "Log",                 icon: "terminal", bottom: true },
];

/* Le voci di menu che oggi accendono un pannello agganciato, qui selezionano il pannello
 * della striscia; quelle senza pannello nel mockup lo dicono nel Log. */
const DOCK_TO_PANEL = { "dock-props": "props", "dock-info": "cityobject", "dock-log": "log", "dock-map": "map" };

const TREE_ICON = { project: "folder", mesh: "mesh", cloud: "cloud", gis: "layers", citygml: "building", raster: "grid", field: "field", spherical: "globe" };
