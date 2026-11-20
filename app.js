/* Motore del mockup. Usa ACTIONS/MENUS/LAYER_ACTIONS (menus.js), DIALOGS (dialogs.js)
 * e TOP_TOOLBAR/VIEWPORT_TOOLBAR/PANELS/ICONS (layout.js). Nessuna dipendenza esterna. */
(() => {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");

  /* ================= stato delle azioni (condiviso fra menu e pulsantiere) ================= */
  const STATE = {};
  for (const [id, a] of Object.entries(ACTIONS)) if (a.chk !== undefined && !a.dock) STATE[id] = a.chk;
  let pendingAnnotation = false; // lazo armato da «Nuova annotazione» (README › Vista 3D)

  function setChecked(id, on) {
    const a = ACTIONS[id];
    if (a.group && on) for (const [oid, o] of Object.entries(ACTIONS)) if (o.group === a.group && oid !== id) STATE[oid] = false;
    STATE[id] = on;
    $$("[data-action]").forEach((el) => el.classList.toggle("checked", !!STATE[el.dataset.action]));
    $("#viewport").classList.toggle("lasso", !!(STATE.lasso || STATE.lasso_line));
    $("#vp-toolbar").classList.toggle("lasso-on", !!(STATE.lasso || STATE.lasso_line));
    if (!STATE.lasso) pendingAnnotation = false;
  }

  const cleanTitle = (t) => String(t).replace(/\s*(\.\.\.|…)\s*$/, "");

  function execAction(id) {
    const a = ACTIONS[id];
    if (!a || a.dis) return;
    // con un comando aperto non se ne apre un secondo (README › Comandi nel pannello a destra)
    if ((a.dlg || id === "new_annotation") && cmdStack.length) return refuseBusy();
    // la selezione non cambia mentre un comando la sta usando (README › Comandi nel pannello a destra)
    if (isSelectionAction(id) && selectionLocked()) return refuseSelection();
    if (a.dock) {
      const p = DOCK_TO_PANEL[a.dock];
      return p ? selectPanel(p) : addLog("warn", `«${a.t}»: pannello non presente in questo mockup.`);
    }
    if ((id === "lasso" || id === "lasso_line") && !STATE[id] && !lassoAllowed(id)) return;
    if (id === "query_mouse" && !STATE[id] && !queryAllowed()) return;
    // come nella release, l'ultimo modo di disegno acceso non si spegne (mainwindow.cpp:10201) (README › Vista 3D)
    const DRAW = ["draw_solid", "draw_wire", "draw_vertex"];
    if (DRAW.includes(id) && STATE[id] && !DRAW.some((o) => o !== id && STATE[o])) return;
    if (a.chk !== undefined) {
      const turnOff = a.group && STATE[id] && a.group !== "selmode";
      setChecked(id, a.group ? !turnOff : !STATE[id]);
      if (id === "query_mouse") TREE.filter((n) => SELECTION[n.id]).forEach((n) => setSelection(n, 0));
      const m = id === "lasso" ? lassoMessage() : a.log;
      if (m && STATE[id]) addLog("info", m);
      return;
    }
    if (id === "new_annotation") {
      // con una selezione apre la finestra su quella; senza, arma il lazo e la apre quando il lazo si chiude (README › Vista 3D)
      const asset = assetOf(selectedRow) || TREE.find((n) => n.id === "m1");
      if (SELECTION[asset.id].count) return openDialog("selectionAnnotations", null, { title: cleanTitle(a.t) });
      if (assetOf(selectedRow) !== asset) selectRow(asset.id);
      setChecked("lasso", true);
      pendingAnnotation = true;
      addLog("info", `Nuova annotazione su '${asset.name}': disegna il lazo nella vista; quando lo chiudi si apre il pannello.`);
      return;
    }
    if (id === "clear_selection") { setSelection(assetOf(selectedRow) || TREE.find((n) => n.id === "m1"), 0); return addLog("info", "Selezione annullata."); }
    if (a.run === "tour") return startTour();
    if (a.tabGo) return selectPanel({ "info-lasso": "lasso" }[a.tabGo] || "cityobject");
    if (a.dlg) return openDialog(a.dlg, null, { title: cleanTitle(a.t) });
    if (a.log !== undefined) addLog("info", a.log || `${a.t}.`);
  }

  /* un solo lazo, il tipo segue l'asset selezionato; a parte il lazo sugli spigoli (solo mesh) (README › Vista 3D) */
  function lassoAllowed(id) {
    const asset = assetOf(selectedRow);
    if (!asset) { hint("Seleziona nell'albero l'asset 3D su cui usare il lazo: una mesh o una nuvola di punti."); return false; }
    if (id === "lasso_line" && asset.kind !== "mesh") { hint("Il lazo sugli spigoli lavora solo sulle mesh."); return false; }
    return true;
  }
  /* Interroga legge le proprietà degli elementi di un layer GIS (nella release anche dei set .ant) (README › Vista 3D) */
  const queryAllowed = () => TREE.find((x) => x.id === selectedRow).kind === "gis" ||
    (hint("Interroga legge le proprietà degli elementi di un layer GIS: selezionane uno nell'albero."), false);
  function lassoMessage() {
    const asset = assetOf(selectedRow);
    return asset.kind === "cloud"
      ? `Lazo su '${asset.name}' (nuvola di punti): seleziona i punti. Clic sinistro sui vertici del poligono, doppio clic per chiudere.`
      : `Lazo su '${asset.name}' (mesh): seleziona le facce. Clic destro sul primo vertice, clic sinistro per gli altri, doppio clic per chiudere.`;
  }
  function updateLassoButtons() {
    const asset = assetOf(selectedRow);
    const lasso = $('[data-action="lasso"]'), line = $('[data-action="lasso_line"]');
    if (!lasso) return;
    lasso.dataset.tip = "Selezione a lazo\n" + (asset ? `Su '${asset.name}' seleziona ${asset.kind === "cloud" ? "i punti" : "le facce"}.` : "Seleziona un asset 3D nell'albero.") +
      "\nIl tipo segue l'asset selezionato: facce sulle mesh, punti sulle nuvole.";
    const lineOk = asset && asset.kind === "mesh";
    line.classList.toggle("dis", !lineOk);
    line.dataset.tip = "Selezione a lazo (spigoli)\nPolilinea sugli spigoli della mesh." + (lineOk ? "" : "\nNon disponibile: seleziona una mesh.");
    const query = $('[data-action="query_mouse"]'), gis = TREE.find((x) => x.id === selectedRow).kind === "gis";
    if (query) {
      query.classList.toggle("dis", !gis);
      query.dataset.tip = ACTIONS.query_mouse.t + "\n" + ACTIONS.query_mouse.tip + (gis ? "" : "\nNon disponibile: seleziona un layer GIS.");
    }
    if (!gis && STATE.query_mouse) setChecked("query_mouse", false);
    if (!asset && STATE.lasso) setChecked("lasso", false);
    if (!lineOk && STATE.lasso_line) setChecked("lasso_line", false);
  }

  /* ================= tooltip ================= */
  const tip = $("#tooltip");
  let tipTimer = null;
  document.addEventListener("mouseover", (e) => {
    const el = e.target.closest("[data-tip]");
    clearTimeout(tipTimer);
    tip.style.display = "none";
    if (!el) return;
    const text = el.dataset.tip || "";
    if (!text) return;
    tipTimer = setTimeout(() => {
      tip.textContent = text;
      tip.style.display = "block";
      const r = el.getBoundingClientRect();
      const x = Math.min(r.left + 8, innerWidth - tip.offsetWidth - 8);
      const y = r.bottom + 6 + tip.offsetHeight > innerHeight ? r.top - tip.offsetHeight - 6 : r.bottom + 6;
      tip.style.left = x + "px"; tip.style.top = y + "px";
    }, 420);
  });
  document.addEventListener("mousedown", () => { clearTimeout(tipTimer); tip.style.display = "none"; });

  /* ================= menu ================= */
  const popup = $("#popup-layer");
  let openOwner = null;

  function buildMenu(items) {
    const m = document.createElement("div");
    m.className = "menu";
    for (const it of items) {
      if (it === SEP) {
        if (m.lastChild && !m.lastChild.classList.contains("sep")) m.appendChild(Object.assign(document.createElement("div"), { className: "sep" }));
        continue;
      }
      const row = document.createElement("div");
      row.className = "mi";
      if (typeof it === "string") {
        const a = ACTIONS[it];
        if (!a) continue;
        row.dataset.id = it;
        if (a.dis) row.classList.add("dis");
        const checked = a.chk !== undefined && !a.dock && STATE[it];
        if (checked) row.insertAdjacentHTML("beforeend", `<span class="check">✔</span>`);
        row.insertAdjacentHTML("beforeend", `<span>${esc(a.t)}</span>`);
        if (a.sc) row.insertAdjacentHTML("beforeend", `<span class="sc">${a.sc}</span>`);
        if (a.dis && a.tip) row.dataset.tip = a.tip;
        row.addEventListener("click", (e) => { e.stopPropagation(); if (a.dis) return; closeMenus(); execAction(it); });
      } else {
        row.classList.add("sub");
        row.innerHTML = `<span>${esc(it.t)}</span>`;
        row._sub = it;
      }
      row.addEventListener("mouseenter", () => {
        $$(".mi.open", m).forEach((o) => { o.classList.remove("open"); if (o._child) closeFrom(o._child); });
        if (row._sub) openSub(row);
      });
      m.appendChild(row);
    }
    if (m.lastChild && m.lastChild.classList.contains("sep")) m.lastChild.remove();
    return m;
  }
  function closeFrom(menuEl) { $$(".mi", menuEl).forEach((r) => r._child && closeFrom(r._child)); menuEl.remove(); }
  function openSub(row) {
    const child = buildMenu(row._sub.items);
    popup.appendChild(child);
    const r = row.getBoundingClientRect();
    let left = r.right + 2, top = r.top - 5;
    if (left + child.offsetWidth > innerWidth) left = r.left - child.offsetWidth - 2;
    if (top + child.offsetHeight > innerHeight) top = innerHeight - child.offsetHeight - 4;
    child.style.left = left + "px"; child.style.top = top + "px";
    row.classList.add("open"); row._child = child;
  }
  function closeMenus() {
    popup.innerHTML = "";
    $$(".mb-item.open, .tt-btn.open").forEach((e) => e.classList.remove("open"));
    openOwner = null;
  }
  function openMenuAt(owner, items, x, y) {
    closeMenus();
    const m = buildMenu(items);
    popup.appendChild(m);
    m.style.left = Math.min(x, innerWidth - m.offsetWidth - 6) + "px"; m.style.top = y + "px";
    owner.classList.add("open");
    openOwner = owner;
  }
  function renderMenubar() {
    const bar = $("#menubar");
    for (const def of MENUS) {
      const el = document.createElement("div");
      el.className = "mb-item";
      el.textContent = def.t;
      const open = () => { const r = el.getBoundingClientRect(); openMenuAt(el, def.items, r.left, r.bottom + 2); };
      el.addEventListener("click", (e) => { e.stopPropagation(); openOwner === el ? closeMenus() : open(); });
      el.addEventListener("mouseenter", () => { if (openOwner && openOwner !== el && openOwner.classList.contains("mb-item")) open(); });
      bar.appendChild(el);
    }
  }
  document.addEventListener("click", (e) => { if (!e.target.closest(".menu")) closeMenus(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") { closeMenus(); endTour(); } });

  /* ================= pulsantiera in alto ================= */
  function renderTopToolbar() {
    const tb = $("#top-toolbar");
    for (const item of TOP_TOOLBAR) {
      if (item === SEP) { tb.insertAdjacentHTML("beforeend", `<div class="tt-sep"></div>`); continue; }
      const b = document.createElement("div");
      b.className = "tt-btn";
      if (item.drop) {
        b.innerHTML = `${icon(item.icon, 17)}<span>${item.drop}</span><span class="chev">${icon("chevron", 14)}</span>`;
        b.dataset.tip = item.drop === "Importa" ? "Importa dati: mesh, nuvole, CityGML, raster, layer GIS, immagini sferiche" : "Esporta il progetto o i suoi dati";
        b.addEventListener("click", (e) => {
          e.stopPropagation();
          if (openOwner === b) return closeMenus();
          const r = b.getBoundingClientRect(); openMenuAt(b, item.items, r.left, r.bottom + 2);
        });
      } else {
        const a = ACTIONS[item.a];
        b.innerHTML = `${icon(item.icon, 17)}<span>${item.label}</span>`;
        b.dataset.tip = a.t + (a.sc ? ` (${a.sc})` : "");
        b.addEventListener("click", () => execAction(item.a));
      }
      tb.appendChild(b);
    }
    if (!PLUGIN_TOOLBAR_CMDS.length) return;
    tb.insertAdjacentHTML("beforeend", `<div class="tt-plugin-sep" data-tip="Comandi dei plugin"></div>`);
    for (const p of PLUGIN_TOOLBAR_CMDS) {
      const b = document.createElement("div");
      b.className = "tt-btn plugin";
      b.innerHTML = `${icon("plug", 17)}<span>${esc(p.label)}</span>`;
      b.dataset.tip = `${p.label}\nPlugin «${p.plugin}»`;
      b.addEventListener("click", () => execAction(p.a));
      tb.appendChild(b);
    }
  }

  /* ================= pulsantiera della vista 3D ================= */
  function renderViewportToolbar() {
    const host = $("#vp-toolbar");
    for (const group of VIEWPORT_TOOLBAR) {
      const g = document.createElement("div");
      g.className = "vp-group";
      for (const it of group) {
        if (it === SEP) { g.insertAdjacentHTML("beforeend", `<span class="vp-sep"></span>`); continue; }
        if (it.seg) {
          const seg = document.createElement("div");
          seg.className = "vp-seg";
          it.seg.forEach(([id, label]) => {
            const s = document.createElement("span");
            s.textContent = label; s.dataset.tip = "Vista: " + ACTIONS[id].t;
            s.addEventListener("click", () => execAction(id));
            seg.appendChild(s);
          });
          g.appendChild(seg);
          continue;
        }
        if (it.radio || it.mode) {
          const box = document.createElement("div");
          box.className = it.mode ? "vp-mode" : "vp-radio";
          (it.radio || it.mode).forEach(([id, ic]) => box.appendChild(vpButton(id, ic)));
          g.appendChild(box);
          continue;
        }
        g.appendChild(vpButton(...it));
      }
      host.appendChild(g);
    }
    $$("[data-action]").forEach((el) => el.classList.toggle("checked", !!STATE[el.dataset.action]));
  }
  function vpButton(id, ic) {
    const a = ACTIONS[id];
    const b = document.createElement("div");
    b.className = "vp-btn" + (a.dis ? " dis" : "");
    b.dataset.action = id;
    b.innerHTML = icon(ic, 17);
    if (isSelectionAction(id)) b.dataset.sel = "";
    b.dataset.tip = a.t + (a.tip ? "\n" + a.tip : "");
    b.addEventListener("click", () => execAction(id));
    return b;
  }

  /* ================= striscia e pannelli ================= */
  let currentPanel = null;
  function renderStrip() {
    const strip = $("#strip");
    PANELS.filter((p) => !p.bottom).forEach((p) => strip.appendChild(stripButton(p)));
    strip.insertAdjacentHTML("beforeend", `<div class="spacer"></div>`);
    PANELS.filter((p) => p.bottom).forEach((p) => strip.appendChild(stripButton(p)));
  }
  function stripButton(p) {
    const b = document.createElement("div");
    b.className = "sbtn"; b.dataset.panelBtn = p.id; b.dataset.tip = p.t;
    b.innerHTML = icon(p.icon, 19);
    b.addEventListener("click", () => selectPanel(p.id));
    return b;
  }
  function selectPanel(id, force) {
    if (cmdStack.length && !force) return refuseBusy(); // pannello bloccato finché il comando è aperto (README › Comandi nel pannello a destra)
    currentPanel = id;
    $$("#strip .sbtn").forEach((b) => b.classList.toggle("active", b.dataset.panelBtn === id));
    $$(".panel").forEach((p) => p.classList.toggle("active", p.dataset.panel === id));
    if (id === "log") { const d = $('#strip .sbtn[data-panel-btn="log"] .dot'); if (d) d.remove(); $("#log-wrap").scrollTop = 1e9; }
  }

  /* ================= comando nel pannello a destra (README › Comandi nel pannello a destra) ================= */
  const cmdStack = []; // livelli del comando aperto: { id, ctx, spec, title, target }
  let panelBeforeCmd = null;

  function makeLevel(id, ctx, title, inheritedTarget) {
    const spec = DIALOGS[id](ctx || {});
    if (spec.highlight) showPluginHighlight(spec.highlight);
    const target = inheritedTarget || (LAYER_COMMANDS.has(id) ? TREE.find((n) => n.id === selectedRow).name : null);
    return { id, ctx, spec, title: cleanTitle(title || spec.title), target };
  }
  function startCmd(id, ctx, title) {
    panelBeforeCmd = currentPanel;
    cmdStack.push(makeLevel(id, ctx, title));
    // selezione bloccata; uno strumento di selezione armato si spegne (README › Comandi nel pannello a destra)
    const follows = FOLLOWS_SELECTION.has(id);
    document.body.classList.add("cmd-open");
    document.body.classList.toggle("sel-free", follows);
    if (!follows) ["lasso", "lasso_line"].forEach((t) => STATE[t] && setChecked(t, false));
    const strip = $("#strip");
    strip.classList.add("locked");
    strip.insertAdjacentHTML("afterbegin", `<div class="sbtn cmd" data-panel-btn="cmd">${icon("bolt", 19)}</div><div class="cmd-sep"></div>`);
    renderCmd();
  }
  function pushCmd(id, ctx, title) { cmdStack.push(makeLevel(id, ctx, title, cmdStack.at(-1).target)); renderCmd(); }
  function replaceCmd(id, ctx) { const old = cmdStack.pop(); cmdStack.push(makeLevel(id, ctx, null, old.target)); renderCmd(); }
  function popCmd() { cmdStack.pop(); cmdStack.length ? renderCmd() : endCmd(); }
  function endCmd() {
    $$("#strip .sbtn.cmd, #strip .cmd-sep").forEach((e) => e.remove());
    $("#strip").classList.remove("locked");
    document.body.classList.remove("cmd-open", "sel-free");
    $("#cmd-panel").remove();
    selectPanel(panelBeforeCmd || "props", true);
  }
  function renderCmd() {
    let p = $("#cmd-panel");
    if (!p) {
      p = Object.assign(document.createElement("div"), { id: "cmd-panel", className: "panel cmd-panel" });
      p.dataset.panel = "cmd";
      $("#panel-host").appendChild(p);
    }
    const top = cmdStack.at(-1);
    const back = cmdStack.length > 1 ? `Annulla e torna a «${cmdStack.at(-2).title}»` : "Annulla il comando";
    p.innerHTML = `<header class="ptitle cmd-title">${icon("bolt", 14)}<span class="crumbs">${cmdStack.map((l) => esc(l.title)).join(' <span class="crumb-sep">›</span> ')}</span>
        <span class="hbtns"><span class="cmd-x" data-tip="${esc(back)}">✕</span></span></header>
      ${top.target ? `<div class="cmd-target">Layer: <b>${esc(top.target)}</b> <span class="muted">· selezionato all'apertura del comando</span></div>` : ""}
      <div class="pbody cmd-body">${top.spec.body}</div><div class="cmd-foot"></div>`;
    const foot = $(".cmd-foot", p);
    const btns = top.spec.foot && top.spec.foot.length ? top.spec.foot : CLOSE;
    btns.filter((b) => b.left).forEach((b) => foot.appendChild(cmdFootButton(b)));
    foot.appendChild(Object.assign(document.createElement("span"), { className: "spacer" }));
    btns.filter((b) => !b.left).forEach((b) => foot.appendChild(cmdFootButton(b)));
    $(".cmd-x", p).addEventListener("click", popCmd);
    $("#strip .sbtn.cmd").dataset.tip = `Comando in corso: ${cmdStack[0].title}\nCompletalo o annullalo per cambiare pannello.`;
    selectPanel("cmd", true);
  }
  function cmdFootButton(b) {
    const el = document.createElement("button");
    el.className = "btn" + (b.primary ? " primary" : "");
    el.textContent = b.t;
    el.addEventListener("click", () => {
      if (b.run) b.run();
      if (b.log) addLog("info", b.log);
      if (b.next) {
        if (FLOATING_KIND[b.next]) { if (b.close) popCmd(); openFloating(b.next, b.ctx); }
        else if (b.close) replaceCmd(b.next, b.ctx);
        else pushCmd(b.next, b.ctx);
        return;
      }
      if (b.close) popCmd();
    });
    return el;
  }
  function flashCmd() {
    const b = $("#strip .sbtn.cmd");
    if (b) { b.classList.remove("flash"); void b.offsetWidth; b.classList.add("flash"); }
  }
  function refuseBusy() {
    flashCmd();
    hint(`Completa o annulla «${cmdStack[0].title}» prima di aprire un altro comando o pannello.`);
  }
  const isSelectionAction = (id) => ["lasso", "selmode"].includes(ACTIONS[id].group) || id === "clear_selection";
  const selectionLocked = () => cmdStack.length > 0 && !FOLLOWS_SELECTION.has(cmdStack[0].id);
  function refuseSelection() {
    flashCmd();
    hint(`La selezione resta quella presa all'apertura di «${cmdStack[0].title}»: concludi il comando per cambiarla.`);
  }
  function refuseTreeSelection() {
    flashCmd();
    hint(`Durante «${cmdStack[0].title}» non si cambia riga nell'albero: il comando lavora su ciò che era selezionato all'apertura.`);
  }

  /* ================= albero dei progetti ================= */
  const KIND_LABEL = { project: "Progetto", mesh: "Dataset 3D — mesh", cloud: "Dataset 3D — nuvola di punti", gis: "Layer GIS",
    citygml: "Geometria CityGML", raster: "Layer raster", field: "Layer raster — campo NetCDF", spherical: "Immagini sferiche", scalar: "Campo scalare" };
  const ACTIONS_KEY = { project: "project", mesh: "dataset", cloud: LAYER_ACTIONS.cloud ? "cloud" : "dataset", gis: "gis", citygml: "citygml", raster: "raster", field: "raster", spherical: "spherical", scalar: "scalar" };
  const TREE = [
    { id: "p", kind: "project", name: "catania_demo", depth: 0, vis: true, kids: true },
    { id: "m1", kind: "mesh", name: "catania.obj", asset: true, crs: "EPSG:25833", color: "#969696", depth: 1, vis: true, kids: true },
    { id: "g1", kind: "gis", name: "impronte_edifici_centro.geojson", crs: "EPSG:25833", color: "#e8e8e8", depth: 2, vis: true },
    { id: "g2", kind: "gis", name: "edifici_nord.shp", crs: "EPSG:25833", color: "#d62728", depth: 2, vis: false },
    { id: "f1", kind: "scalar", name: "catania_shadow_20261116_115940.txt", depth: 2, vis: false },
    { id: "m2", kind: "cloud", name: "catania.las", asset: true, crs: "EPSG:25833", color: "#7f7f7f", depth: 1, vis: true },
    { id: "c1", kind: "citygml", name: "catania.gml", crs: "EPSG:25833", depth: 1, vis: true },
    { id: "r1", kind: "raster", name: "DTM_Catania_166.tif", crs: "EPSG:25833", depth: 1, vis: true },
    { id: "r2", kind: "raster", name: "DTM_Catania_167.tif", crs: "EPSG:25833", depth: 1, vis: false },
    { id: "r3", kind: "field", name: "so2_column_mean (CAMS)", crs: "EPSG:25833", depth: 1, vis: true },
    { id: "s1", kind: "spherical", name: "sferiche_centro.csv", depth: 1, vis: true },
  ];
  const FIELDS = {
    p:  [["Cartella", WORK + "/catania_demo"], ["CRS", "EPSG:25833 — ETRS89 / UTM zone 33N"], ["Dataset 3D", "2"]],
    m1: [["File", "geometry/mesh/catania.obj"], ["CRS", "EPSG:25833"], ["Vertici", "84.133"], ["Facce", "136.733"],
         ["Estensione", "x: 505.912 – 508.324\ny: 4.150.881 – 4.152.915\nz: 0 – 61"], ["Aspetto", "colore uniforme #969696"], ["Opacità", "1,00"],
         ["Asset USAP", "riconosciuto per hash in catania.usap.gpkg (id 3)"], ["Dimensione", "7,5 MB"], ["Modificato", "16/11/26 11:36"]],
    m2: [["File", "geometry/pointcloud/catania.las"], ["CRS", "EPSG:25833"], ["Punti", "3.907.888 (1.953.944 caricati, 1 ogni 2)"],
         ["Dimensione dei punti", "5 px"], ["Aspetto", "colori del file (RGB)"], ["Dimensione", "127 MB"]],
    f1: [["File", "geometry/mesh/catania_shadow_20261116_115940.txt"], ["Dataset", "catania.obj"], ["Valori", "84.133, uno per vertice"],
         ["Intervallo dei valori", "0 – 1"], ["Mostrato come", "scala di grigi sull'asset, con la barra dei colori"]],
    g1: [["File", DATA + "/gis/impronte_edifici_centro.geojson"], ["CRS", "EPSG:25833"], ["Poligoni", "2.418"], ["Opacità", "0,90"]],
    g2: [["File", DATA + "/gis/edifici_nord.shp"], ["CRS", "EPSG:25833"], ["Poligoni", "1.102"]],
    c1: [["File", DATA + "/catania.gml"], ["CityGML", "3.0 — 51.702 city object"], ["CRS", "EPSG:25833"], ["Livello di dettaglio", "LOD1"], ["Poligoni", "73.725"], ["Opacità", "1,00"]],
    r1: [["File", DATA + "/dtm/DTM_Catania_166.tif"], ["CRS", "EPSG:25833"], ["Griglia", "2000 x 2000 pixel"], ["Dimensione pixel", "2 m"],
         ["Intervallo dei valori", "0,0 – 412,7"], ["Mostrato come", "quota (terreno)"], ["Opacità", "0,85"], ["Altezza", "0 m rispetto alla posizione di caricamento"]],
    r2: [["File", DATA + "/dtm/DTM_Catania_167.tif"], ["CRS", "EPSG:25833"]],
    r3: [["File", DATA + "/netcdf/so2_cams3d_catania_2026-10-16.nc"], ["Variabile", "so2_column_mean"], ["Istante / livello", "2026-10-16 12:00 / superficie"],
         ["Mostrato come", "campo colorato sopra la scena"], ["Unità", "DU"], ["Opacità", "0,6"]],
    s1: [["File", DATA + "/sferiche/sferiche_centro.csv"], ["Immagini", "12"], ["File immagine mancanti", "1"], ["Righe scartate", "1 (riga 7)"]],
  };
  let selectedRow = "m1";

  function renderTree() {
    const t = $("#tree");
    t.innerHTML = "";
    for (const n of TREE) {
      const row = document.createElement("div");
      row.className = `trow kind-${n.kind}` + (n.id === selectedRow ? " sel" : "");
      row.dataset.id = n.id;
      row.style.paddingLeft = 8 + n.depth * 16 + "px";
      row.innerHTML = `<span class="tw">${n.kids ? "▾" : ""}</span><span class="ticon">${icon(TREE_ICON[n.kind], 15)}</span>` +
        (n.color ? `<span class="swatch" style="background:${n.color}"></span>` : "") +
        `<span class="tname">${esc(n.name)}</span>` + (n.asset ? `<span class="badge" data-tip="Asset riconosciuto nel pacchetto USAP aperto">A</span>` : "") +
        `<span class="tcrs">${n.crs || ""}</span><span class="eye${n.vis ? "" : " off"}" data-tip="${n.vis ? "Nascondi" : "Mostra"}">${icon(n.vis ? "eye" : "eyeOff", 15)}</span>`;
      row.addEventListener("click", (e) => {
        if (e.target.closest(".eye")) { n.vis = !n.vis; renderTree(); if (n.id === selectedRow) renderProps(); return; }
        if (e.target.isContentEditable) return;
        if (cmdStack.length) return n.id === selectedRow || refuseTreeSelection(); // selezione bloccata (README › Comandi nel pannello a destra)
        selectRow(n.id);
      });
      row.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        if (cmdStack.length) return refuseTreeSelection();
        selectRow(n.id); showContextMenu(e.clientX, e.clientY, n);
      });
      t.appendChild(row);
    }
  }
  function selectRow(id) { selectedRow = id; renderTree(); renderProps(); }

  /* L'asset 3D di una riga: la riga stessa o l'asset a cui appartiene (es. un layer GIS sotto la mesh). */
  function assetOf(id) {
    const i = TREE.findIndex((n) => n.id === id);
    if (i < 0) return null;
    for (let j = i, depth = TREE[i].depth + 1; j >= 0; j--) {
      if (TREE[j].depth >= depth) continue;
      if (TREE[j].asset) return TREE[j];
      depth = TREE[j].depth;
    }
    return null;
  }

  /* aspetto dell'asset, tre modi esclusivi; spenti quelli che il file non ha (README › Proprietà del layer e tasto destro) */
  const APPEARANCE = { m1: "uniform", m2: "file" };
  const APPEAR_AVAIL = { m1: { uniform: true, file: true, texture: false }, m2: { uniform: true, file: true } };
  const APPEAR_LABEL = { uniform: "Colore uniforme…", file: "Colori del file", texture: "Texture" };
  function appearanceOptions(n) {
    return Object.keys(APPEAR_LABEL).filter((k) => k in APPEAR_AVAIL[n.id]).map((k) => {
      const why = k === "file" ? `Il file di '${n.name}' non ha colori per vertice.`
        : `'${n.name}' non ha texture: ce l'hanno solo i file OBJ il cui .mtl indica un'immagine che si trova accanto al file.`;
      return { k, label: APPEAR_LABEL[k], on: APPEARANCE[n.id] === k, ok: APPEAR_AVAIL[n.id][k], why };
    });
  }
  function setAppearance(n, o, chosen) {
    if (!o.ok) return hint(o.why);
    if (o.k === "uniform" && !chosen) return openDialog("geomColor", { onOk: () => setAppearance(n, o, true) }, { title: "Colore uniforme" });
    APPEARANCE[n.id] = o.k;
    const row = FIELDS[n.id].find(([k]) => k === "Aspetto");
    row[1] = o.k === "uniform" ? `colore uniforme ${n.color}` : o.k === "file" ? "colori del file" : "texture";
    renderProps();
  }
  /* Rinomina: come nella release, il nome si modifica direttamente nell'albero (mainwindow.cpp:14854). */
  function startRename(n, nameEl) {
    const old = n.name;
    nameEl.contentEditable = "true";
    nameEl.focus();
    document.getSelection().selectAllChildren(nameEl);
    const done = (keep) => {
      nameEl.contentEditable = "false";
      const v = nameEl.textContent.trim();
      n.name = keep && v ? v : old;
      renderTree();
      if (typeof renderProps === "function") renderProps();
    };
    nameEl.addEventListener("keydown", (e) => {
      if (e.key === "Enter") { e.preventDefault(); done(true); }
      if (e.key === "Escape") { e.preventDefault(); done(false); }
    });
    nameEl.addEventListener("blur", () => nameEl.isContentEditable && done(true), { once: true });
  }
  function layerAction(n, act) {
    const [label, target] = act;
    if (target === "rename") return startRename(n, $(`#tree .trow[data-id="${n.id}"] .tname`));
    if (label === "Nascondi" || label === "Mostra") { n.vis = !n.vis; renderTree(); renderProps(); return; }
    if (!target) return addLog("info", `${label}: ${n.name}`);
    if (target.startsWith("@")) return selectPanel("cityobject");
    openDialog(target, null, { title: label });
  }
  function renderProps() {
    const n = TREE.find((x) => x.id === selectedRow);
    const box = $("#layer-props");
    box.innerHTML = `<div class="lp-head"><span class="ticon">${icon(TREE_ICON[n.kind], 22)}</span><div><div class="lp-name">${esc(n.name)}</div>
        <div class="lp-kind">${KIND_LABEL[n.kind]}${n.crs ? " · " + n.crs : ""}</div></div></div>
      <div class="lp-actions"></div><div class="lp-more">Altre azioni: tasto destro sulla riga nell'albero.</div>
      <div class="table-wrap"><table class="grid"><thead><tr><th>Proprietà</th><th>Valore</th></tr></thead>
      <tbody>${[["Visibile", n.vis ? "sì" : "no"], ...(FIELDS[n.id] || [])].map(([k, v]) => `<tr><td>${k}</td><td style="white-space:pre">${esc(v)}</td></tr>`).join("")}</tbody></table></div>`;
    const wrap = $(".lp-actions", box);
    LAYER_ACTIONS[ACTIONS_KEY[n.kind]].filter((act) => PANEL_ACTIONS.has(act[1])).forEach((act) => { // README › Proprietà del layer e tasto destro
      if (act[1] === "@appearance") {
        const line = document.createElement("div");
        line.className = "lp-appear";
        line.innerHTML = `<span class="lp-appear-t">Aspetto</span><span class="lp-seg"></span>`;
        for (const o of appearanceOptions(n)) {
          const b = document.createElement("button");
          b.className = "btn sm" + (o.on ? " checked" : "") + (o.ok ? "" : " dis");
          b.textContent = o.label;
          if (!o.ok) b.dataset.tip = o.why;
          b.addEventListener("click", () => setAppearance(n, o));
          $(".lp-seg", line).appendChild(b);
        }
        return wrap.appendChild(line);
      }
      const b = document.createElement("button");
      b.className = "btn sm";
      b.textContent = act[0] === "Nascondi" && !n.vis ? "Mostra" : act[0];
      b.addEventListener("click", () => layerAction(n, act));
      wrap.appendChild(b);
    });
    renderStats();
    updateLassoButtons();
  }
  // conteggi del solo asset selezionato (o dell'asset della riga); nessun totale (README › Vista 3D)
  const SELECTION = { m1: { count: 29008, unit: "facce" }, m2: { count: 0, unit: "punti" } };
  const fmt = (n) => n.toLocaleString("it-IT");
  function renderStats() {
    const asset = assetOf(selectedRow);
    const base = { m1: `<b>catania.obj</b>: 84.133 vertici, 136.733 facce`, m2: `<b>catania.las</b>: 3.907.888 punti (1.953.944 caricati)` };
    const sel = asset && SELECTION[asset.id];
    $("#vp-stats").innerHTML = asset ? base[asset.id] + (sel.count ? `<br>Selezione: ${fmt(sel.count)} ${sel.unit}` : "") : "";
    const ov = $("#sel-overlay");
    if (ov) ov.style.display = SELECTION.m1.count ? "" : "none";
  }
  function setSelection(asset, count, unit) {
    SELECTION[asset.id] = { count, unit: unit || SELECTION[asset.id].unit };
    renderStats();
  }
  /* Lazo finto: con il lazo attivo, un clic nella vista chiude un lazo e applica il modo scelto. */
  $("#viewport").addEventListener("click", (e) => {
    if (e.target.closest("#vp-toolbar, #gizmo, #vp-hl, #vp-stats")) return;
    if (STATE.query_mouse) { // l'esito va nel pannello; un nuovo clic lo sostituisce (README › Vista 3D)
      const ctx = { layer: TREE.find((x) => x.id === selectedRow).name };
      if (cmdStack.length && cmdStack.at(-1).id === "gisFeature") return replaceCmd("gisFeature", ctx);
      return openDialog("gisFeature", ctx, { title: "Elemento GIS" });
    }
    if (!(STATE.lasso || STATE.lasso_line)) return;
    const asset = assetOf(selectedRow);
    if (!asset) return;
    const [n, unit] = STATE.lasso_line ? [86, "spigoli"] : asset.kind === "cloud" ? [3241, "punti"] : [12400, "facce"];
    const prev = SELECTION[asset.id];
    const same = prev.unit === unit && prev.count > 0;
    const count = STATE.sel_additive && same ? prev.count + n : STATE.sel_subtractive && same ? Math.max(0, prev.count - n) : n;
    const how = STATE.sel_additive && same ? "aggiunte" : STATE.sel_subtractive && same ? "tolte" : "nuova selezione";
    setSelection(asset, count, unit);
    addLog("info", `Lazo chiuso su '${asset.name}': ${fmt(n)} ${unit} (${how}). Selezione: ${fmt(count)} ${unit}.`);
    if (pendingAnnotation) {
      setChecked("lasso", false); // come nella release: lo strumento si posa prima della finestra (mainwindow.cpp:10388)
      openDialog("selectionAnnotations", null, { title: "Nuova annotazione" });
    }
  });
  function showContextMenu(x, y, n) {
    closeMenus();
    const m = document.createElement("div");
    m.className = "menu";
    LAYER_ACTIONS[ACTIONS_KEY[n.kind]].filter((act) => !PANEL_ACTIONS.has(act[1])).forEach((act) => { // README › Proprietà del layer e tasto destro
      if (act[1] === "@appearance") {
        if (m.lastChild && !m.lastChild.classList.contains("sep")) m.appendChild(Object.assign(document.createElement("div"), { className: "sep" }));
        for (const o of appearanceOptions(n)) {
          const r = document.createElement("div");
          r.className = "mi" + (o.ok ? "" : " dis");
          r.innerHTML = (o.on ? `<span class="check">✔</span>` : "") + `<span>Aspetto: ${esc(o.label.toLowerCase())}</span>`;
          if (!o.ok) r.dataset.tip = o.why;
          r.addEventListener("click", (e) => { e.stopPropagation(); if (!o.ok) return; closeMenus(); setAppearance(n, o); });
          m.appendChild(r);
        }
        m.appendChild(Object.assign(document.createElement("div"), { className: "sep" }));
        return;
      }
      const r = document.createElement("div");
      r.className = "mi";
      r.innerHTML = `<span>${esc(act[0] === "Nascondi" && !n.vis ? "Mostra" : act[0])}</span>`;
      r.addEventListener("click", (e) => { e.stopPropagation(); closeMenus(); layerAction(n, act); });
      m.appendChild(r);
    });
    popup.appendChild(m);
    m.style.left = Math.min(x, innerWidth - m.offsetWidth - 4) + "px";
    m.style.top = Math.min(y, innerHeight - m.offsetHeight - 4) + "px";
  }

  /* ================= finestre di dialogo ================= */
  const winLayer = $("#windows");
  let zTop = 3000, cascade = 0;

  /* Instradamento (README › Comandi nel pannello a destra): i comandi vanno nel pannello a destra; restano mobili le
   * eccezioni di FLOATING (proposta.js) e tutto ciò che si apre da una finestra mobile.
   * opts.from = elemento cliccato, opts.floating = passo successivo di una finestra mobile. */
  function openDialog(id, ctx, opts = {}) {
    if (!DIALOGS[id]) { addLog("warn", `Finestra «${id}» non definita nel mockup.`); return; }
    const from = opts.from && opts.from.closest ? opts.from : null;
    const inCmd = !!(from && from.closest("#cmd-panel"));
    if (opts.floating || (from && from.closest(".qwin"))) return openFloating(id, ctx);
    if (FLOATING_KIND[id]) return cmdStack.length && !inCmd ? refuseBusy() : openFloating(id, ctx);
    if (inCmd) return pushCmd(id, ctx, opts.title);
    if (cmdStack.length) return refuseBusy();
    // titolo: quello della voce che ha lanciato il comando; da un link diretto, la voce di menu che apre la finestra
    const byAction = Object.values(ACTIONS).find((a) => a.dlg === id && !a.textOnly);
    startCmd(id, ctx, opts.title || (!from && byAction ? byAction.t : null));
  }
  function openFloating(id, ctx) {
    const spec = DIALOGS[id](ctx || {});
    if (spec.highlight) showPluginHighlight(spec.highlight);
    const w = document.createElement("div");
    w.className = "qwin";
    w.style.width = (spec.w || 480) + "px";
    w.style.zIndex = ++zTop;
    w.innerHTML = `<div class="qt-title"><span class="tb-icon"></span><span>${esc(spec.title)}</span><span class="tb-btns"><i>_</i><i>▫</i><i class="x">✕</i></span></div>
      <div class="qt-body">${spec.body}</div><div class="qt-foot"></div>`;
    const foot = $(".qt-foot", w);
    const btns = spec.foot || [];
    btns.filter((b) => b.left).forEach((b) => foot.appendChild(footButton(b, w)));
    foot.appendChild(Object.assign(document.createElement("span"), { className: "spacer" }));
    btns.filter((b) => !b.left).forEach((b) => foot.appendChild(footButton(b, w)));
    $(".x", w).addEventListener("click", () => w.remove());
    w.addEventListener("mousedown", () => { w.style.zIndex = ++zTop; });
    makeDraggable(w, $(".qt-title", w));
    winLayer.appendChild(w);
    const off = (cascade++ % 6) * 24;
    w.style.left = Math.max(10, (innerWidth - w.offsetWidth) / 2 + off) + "px";
    w.style.top = Math.max(30, (innerHeight - w.offsetHeight) / 2 - 20 + off) + "px";
    return w;
  }
  function footButton(b, win) {
    const el = document.createElement("button");
    el.className = "btn" + (b.primary ? " primary" : "");
    el.textContent = b.t;
    el.addEventListener("click", () => { if (b.log) addLog("info", b.log); if (b.close) win.remove(); if (b.next) openDialog(b.next, b.ctx, { floating: true }); });
    return el;
  }
  function makeDraggable(win, handle) {
    handle.addEventListener("mousedown", (e) => {
      if (e.target.closest(".tb-btns")) return;
      const sx = e.clientX - win.offsetLeft, sy = e.clientY - win.offsetTop;
      const move = (ev) => { win.style.left = ev.clientX - sx + "px"; win.style.top = Math.max(0, ev.clientY - sy) + "px"; };
      const up = () => { removeEventListener("mousemove", move); removeEventListener("mouseup", up); };
      addEventListener("mousemove", move); addEventListener("mouseup", up);
      e.preventDefault();
    });
  }

  /* ================= click delegati ================= */
  function activateTab(tabs, idx) {
    const pages = [...tabs.parentElement.children].filter((c) => c.classList.contains("tab-page"));
    [...tabs.children].forEach((b, i) => b.classList.toggle("active", i === idx));
    pages.forEach((p, i) => p.classList.toggle("hidden", i !== idx));
  }
  document.addEventListener("click", (e) => {
    const tabBtn = e.target.closest(".tabs > button");
    if (tabBtn) return activateTab(tabBtn.parentElement, [...tabBtn.parentElement.children].indexOf(tabBtn));
    const go = e.target.closest("[data-panel-go]");
    if (go) {
      if (cmdStack.length) return refuseBusy();
      selectPanel(go.dataset.panelGo); if (go.dataset.level) $("#log-level").selectedIndex = +go.dataset.level; return;
    }
    const d = e.target.closest("[data-dlg]:not(tr)");
    if (d && !d.closest(".menu")) return openDialog(d.dataset.dlg, null, { from: d });
    if (e.target.closest("[data-clear-log]")) { $("#log-table tbody").innerHTML = ""; return; }
    const l = e.target.closest("[data-log]");
    if (l) return addLog("info", l.dataset.log);
    const r = e.target.closest("[data-run]");
    if (r && r.dataset.run === "tour") { $$(".qwin").forEach((w) => w.remove()); return startTour(); }
  });
  document.addEventListener("dblclick", (e) => { const d = e.target.closest("tr[data-dlg]"); if (d) openDialog(d.dataset.dlg, null, { from: d }); });

  /* ================= Log e riga di log ================= */
  let warnCount = 0, errCount = 0, lastLogHTML = "", hintTimer = null;
  /* Suggerimento temporaneo nella riga di log (non entra nel Log). */
  function hint(text) {
    const el = $("#logline-msg");
    el.classList.add("hint");
    el.innerHTML = `${icon("bolt", 14)}<span>${esc(text)}</span>`;
    clearTimeout(hintTimer);
    hintTimer = setTimeout(() => { hintTimer = null; el.classList.remove("hint"); el.innerHTML = lastLogHTML; }, 3500);
  }
  const LEVEL = { info: ["Informazione", "info"], warn: ["Avviso", "warn"], err: ["Errore", "error"] };
  const now = () => new Date().toTimeString().slice(0, 8);
  function addLog(level, text, time) {
    const tr = document.createElement("tr");
    if (level !== "info") tr.className = level;
    tr.innerHTML = `<td>${time || now()}</td><td data-tip="${LEVEL[level][0]}">${icon(LEVEL[level][1], 14)}</td><td>${esc(text)}</td>`;
    $("#log-table tbody").appendChild(tr);
    $("#log-wrap").scrollTop = 1e9;
    lastLogHTML = `${icon(LEVEL[level][1], 14)}<span>${esc(text)}</span>`;
    if (!hintTimer) $("#logline-msg").innerHTML = lastLogHTML;
    if (level === "warn") warnCount++;
    if (level === "err") errCount++;
    $("#logline-warn").innerHTML = `${icon("warn", 14)}${warnCount}`;
    $("#logline-err").innerHTML = `${icon("error", 14)}${errCount}`;
    $("#logline-warn").classList.toggle("has", warnCount > 0);
    $("#logline-err").classList.toggle("has", errCount > 0);
    if (level !== "info" && currentPanel !== "log") {
      const b = $('#strip .sbtn[data-panel-btn="log"]');
      if (b && !$(".dot", b)) b.insertAdjacentHTML("beforeend", `<span class="dot"></span>`);
    }
  }
  const INITIAL_LOG = [
    ["info", "Vocabolario semantico: 258 concetti letti da 'C:/Program Files/City3D/config/vocabulary' all'avvio, fissi per questa sessione (66 classi proposte per le annotazioni)."],
    ["info", "Progetto aperto: catania_demo (EPSG:25833)."],
    ["info", "CityGML 3.0: 51702 city object da catania.gml"],
    ["warn", "'catania.gml': l'estensione (15.07°…15.10° E, 37.49°…37.52° N) è fuori dall'area d'uso di EPSG:25833 (ETRS89 / UTM zone 33N)."],
    ["info", "Dataset annotato: 51702 oggetti collegati, 47666 annotazioni collegate, 0 problemi (catania.gml + catania.usap.gpkg)."],
    ["warn", "the layer declares no CRS (missing .prj?) — assuming EPSG:25833 for 'senza_crs.shp'"],
    ["info", "USAP: asset 'catania.obj' riconosciuto nel pacchetto 'catania.usap.gpkg'"],
  ];

  /* ================= contenuti fantoccio ================= */
  function fillPanels() {
    const ids = ["bldg_w234077276", "bldg_w130301360", "bldg_w129791254", "bldg_w304548294", "bldg_w129894441", "bldg_w129775864",
      "bldg_w972118222", "bldg_w175894049", "bldg_w29315736", "bldg_w97447205", "bldg_w57687520", "bldg_w305967843"];
    $("#co-tree tbody").innerHTML = `<tr class="grp"><td>▾ Building (4036 istanze)</td><td></td><td></td></tr>` +
      ids.map((id) => {
        const name = id === "bldg_w29315736" ? "Building — Teatro Greco Romano" : id === "bldg_w57687520" ? "Building — Tirrenia TTLines" : "Building";
        return `<tr${id === "bldg_w29315736" ? ' class="sel"' : ""}><td class="i1">▸ ${name}</td><td>${id}</td><td>1 annotazione</td></tr>`;
      }).join("") + `<tr class="grp"><td>▸ ReliefFeature (1 istanza)</td><td></td><td></td></tr>`;
    // Risultati lazo come nella release (dialogs/lasso_results_panel.cpp): Sintesi per concetto (elementi selezionati
    // coperti da ogni concetto, più Altro) e una scheda per annotazione, con i dettagli e i collegamenti al pannello CityObject.
    const CONCEPT_COLOR = { RoofSurface: "#1f77b4", WallSurface: "#d96b0a", GroundSurface: "#b88a00", Door: "#2ca02c",
      Window: "#179cb0", Building: "#9467bd", LandUse: "#8c564b" };
    const STATUS_COLOR = { accepted: "#2ca02c", rejected: "#c0392b" }; // gli altri stati: grigio
    const SELECTED = 44559; // 29.008 facce + 15.551 vertici
    // uid, concetto, stato, confidenza, etichetta, ultimo assessment, sua data, elementi nella selezione, CityObject, edificio
    const hits = [
      ["ann_bldg_w29315736", "Building", "draft", "0,90", "Teatro Greco Romano", "asm_bldg_w29315736_3", "2026-11-16", 3401, "bldg_w29315736", ""],
      ["ann_bldg_w29315736_Roof_1", "RoofSurface", "draft", "0,90", "", "asm_bldg_w29315736_Roof_1", "", 214, "bldg_w29315736_Roof_1", "bldg_w29315736"],
      ["ann_bldg_w29315736_Wall_3", "WallSurface", "accepted", "0,85", "", "asm_bldg_w29315736_Wall_3", "", 41, "bldg_w29315736_Wall_3", "bldg_w29315736"],
      ["ann_bldg_w29315736_Wall_4", "WallSurface", "draft", "", "", "asm_bldg_w29315736_Wall_4", "", 38, "bldg_w29315736_Wall_4", "bldg_w29315736"],
      ["ann_bldg_w175894049", "Building", "draft", "0,90", "", "asm_bldg_w175894049", "", 412, "bldg_w175894049", ""],
      ["ann_bldg_w175894049_Roof_1", "RoofSurface", "rejected", "0,40", "", "asm_bldg_w175894049_Roof_1", "", 60, "bldg_w175894049_Roof_1", "bldg_w175894049"],
    ];
    const fmt = (v) => String(v).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    const perConcept = {};
    hits.forEach((h) => (perConcept[h[1]] = (perConcept[h[1]] || 0) + h[7]));
    const annotated = hits.filter((h) => !h[9]).reduce((s, h) => s + h[7], 0); // le superfici stanno dentro il loro edificio
    $("#lasso-selected").textContent = `Elementi selezionati: ${fmt(SELECTED)}`;
    $("#lasso-concepts").innerHTML = Object.keys(perConcept).sort().map((c) =>
      `<tr><td style="color:${CONCEPT_COLOR[c] || "inherit"}">${c}</td><td>${fmt(perConcept[c])}</td></tr>`).join("") +
      `<tr><td style="color:#888888">Altro</td><td>${fmt(SELECTED - annotated)}</td></tr>`;
    $("#lasso-caption").textContent = `Risultati (annotazioni trovate: ${hits.length})`;
    $("#lasso-results").innerHTML = hits.map(([uid, c, st, conf, lab, asm, date, sel, co, top], i) => `<div class="lr-item${i === 0 ? " sel" : ""}">
        <div class="lr-card"><span class="lr-tw">▾</span><span class="lr-dot" style="background:${STATUS_COLOR[st] || "#888888"}"></span>
          <span class="lr-uid">${uid}</span><span class="lr-right">Stato: ${st}</span>
          <span></span><span></span><span style="color:${CONCEPT_COLOR[c] || "inherit"}">${c}</span><span class="lr-right">Confidenza: ${conf || "—"}</span></div>
        <div class="lr-kids">
          <div class="lr-detail">Etichetta: ${lab || uid}<br>Assessment: ${asm}${date ? `<br>Data: ${date}` : ""}<br>Asset 3D: catania.obj<br>Elementi nella selezione: ${fmt(sel)}</div>
          <div class="lr-link" data-panel-go="cityobject" data-tip="Mostra questo CityObject nella scheda CityObject">CityObject: ${co}</div>
          ${top ? `<div class="lr-link" data-panel-go="cityobject" data-tip="Mostra il Building nella scheda CityObject">Parte di Building: ${top}</div>` : ""}
        </div></div>`).join("");
    // Un clic sceglie la riga; un doppio clic apre il pannello Annotazione; i collegamenti aprono il pannello CityObject.
    const lr = $("#lasso-results");
    lr.addEventListener("click", (e) => {
      const item = e.target.closest(".lr-item");
      if (!item || e.target.closest(".lr-link")) return;
      if (e.target.closest(".lr-tw")) return item.classList.toggle("closed");
      $$("#lasso-results .lr-item.sel").forEach((x) => x.classList.remove("sel"));
      item.classList.add("sel");
    });
    lr.addEventListener("dblclick", (e) => {
      if (!e.target.closest(".lr-card")) return;
      if (cmdStack.length) return refuseBusy();
      selectPanel("annotation");
    });
    $("#usap-panel").innerHTML = DIALOGS.usapPanel().body; // la finestra diventa un pannello fisso (proposta.js) (README › Pannelli della striscia)
  }

  /* ================= scena 3D finta ================= */
  function drawScene() {
    let seed = 11;
    const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
    let s = `<defs><filter id="sh" x="-5%" y="-5%" width="110%" height="110%"><feDropShadow dx="0" dy="6" stdDeviation="8" flood-opacity=".35"/></filter></defs>
      <g transform="rotate(-13 500 330)"><polygon filter="url(#sh)" points="330,115 640,100 690,160 700,520 600,560 360,545 300,490 310,270" fill="#d9d9d4" stroke="#8d8d86"/>`;
    for (let i = 0; i < 900; i++) {
      const x = 320 + rnd() * 370, y = 115 + rnd() * 430, w = 4 + rnd() * 14, h = 4 + rnd() * 12, g = 95 + Math.floor(rnd() * 100);
      s += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" fill="rgb(${g},${g},${g + 4})" opacity=".9"/>`;
    }
    s += `<g id="sel-overlay"><polygon points="470,320 545,305 575,365 530,415 465,400" fill="rgba(215,40,40,.55)"/>
      <polygon points="462,316 548,300 580,366 532,420 458,404" fill="none" stroke="#fff" stroke-width="1.6" stroke-dasharray="5 3"/></g>
      <polygon points="500,340 535,336 540,370 505,376" fill="rgba(255,140,0,.95)" stroke="#ffb000"/>
      <g id="plugin-hl" style="display:none" fill="rgba(224,64,251,.35)" stroke="#e040fb" stroke-width="2">
        <rect x="478" y="330" width="22" height="16"/><rect x="508" y="314" width="18" height="14"/><rect x="540" y="350" width="20" height="18"/>
        <rect x="490" y="380" width="16" height="14"/><rect x="520" y="392" width="22" height="12"/></g></g>`;
    $("#scene").innerHTML = s;
    // gizmo di navigazione (stile Blender): E = x, N = y, Z = alto
    $("#gizmo").innerHTML = `<svg viewBox="0 0 84 84" width="84" height="84">
      <circle cx="42" cy="42" r="38" fill="rgba(30,30,30,.25)"/>
      <line x1="42" y1="42" x2="70" y2="52" stroke="#e05a5a" stroke-width="2.5"/><line x1="42" y1="42" x2="26" y2="62" stroke="#6cc070" stroke-width="2.5"/>
      <line x1="42" y1="42" x2="42" y2="12" stroke="#5f8fd8" stroke-width="2.5"/>
      <circle cx="70" cy="52" r="8" fill="#e05a5a"/><text x="70" y="55.5" text-anchor="middle" font-size="10" font-weight="bold" fill="#1e1e1e">E</text>
      <circle cx="26" cy="62" r="8" fill="#6cc070"/><text x="26" y="65.5" text-anchor="middle" font-size="10" font-weight="bold" fill="#1e1e1e">N</text>
      <circle cx="42" cy="12" r="8" fill="#5f8fd8"/><text x="42" y="15.5" text-anchor="middle" font-size="10" font-weight="bold" fill="#1e1e1e">Z</text>
      <circle cx="18" cy="34" r="5" fill="none" stroke="#e05a5a" stroke-width="1.5"/><circle cx="56" cy="24" r="5" fill="none" stroke="#6cc070" stroke-width="1.5"/></svg>`;
  }

  /* ================= evidenziazione dei plugin (README › Vista 3D) ================= */
  let pluginHighlight = null;
  function showPluginHighlight(h) {
    pluginHighlight = h;
    $("#vp-hl-text").textContent = "Evidenziazione dei plugin";
    $("#vp-hl").classList.remove("hidden");
    $("#plugin-hl").style.display = "";
  }
  $("#vp-hl .hl-x").addEventListener("click", () => {
    if (!pluginHighlight) return;
    pluginHighlight = null;
    $("#vp-hl").classList.add("hidden");
    $("#plugin-hl").style.display = "none";
  });

  /* ================= tour ================= */
  const TOUR = [
    ["#menubar", "Menu", "Tutti i comandi, raggruppati per argomento (struttura attuale, da rivedere)."],
    ["#project-chip", "Progetto e CRS", "Il progetto attivo e il suo sistema di riferimento. Il CRS si cambia con «Imposta CRS…» nel tasto destro sulla riga del progetto."],
    ["#top-toolbar", "Progetto e risorse", "Nuovo progetto, Apri progetto, Salva progetto; poi Importa ed Esporta per le risorse del progetto."],
    ["#vp-toolbar", "Strumenti della vista", "Lazo (facce sulle mesh, punti sulle nuvole) e lazo sugli spigoli, modalità di selezione; viste, modo di disegno (combinabile); annotazione della selezione."],
    ["#viewport", "Vista 3D", "La scena, sempre utilizzabile: i comandi non la coprono. In alto a destra l'orientamento, in basso a sinistra i conteggi dell'asset selezionato."],
    ["#outliner", "Progetti", "L'albero dei progetti e dei layer; l'occhio mostra o nasconde, il tasto destro apre le azioni di gestione."],
    ["#strip", "Pannelli", "Un'icona per pannello: proprietà del layer, CityObject, annotazione, risultati del lazo, mappa, concetti, Log."],
    ["#panel-host", "Pannello selezionato", "Il contenuto del pannello scelto. Anche i comandi si aprono qui: in cima alla striscia compare un'icona ambra e il pannello resta bloccato finché il comando non è concluso."],
    ["#logline", "Riga di log", "L'ultimo messaggio e i contatori di avvisi ed errori: un clic apre il pannello Log."],
  ];
  let tourEls = null;
  function startTour(i = 0) {
    endTour();
    const [sel, title, text] = TOUR[i];
    const r = $(sel).getBoundingClientRect();
    const mask = Object.assign(document.createElement("div"), { className: "tour-mask" });
    const hole = Object.assign(document.createElement("div"), { className: "tour-hole" });
    Object.assign(hole.style, { left: r.left - 3 + "px", top: r.top - 3 + "px", width: r.width + 6 + "px", height: r.height + 6 + "px" });
    const bub = Object.assign(document.createElement("div"), { className: "tour-bubble" });
    bub.innerHTML = `<b>${i + 1}. ${title}</b><br>${text}<div class="muted">Passo ${i + 1} di ${TOUR.length}</div>
      <div class="btnrow" style="justify-content:flex-end"><button class="btn">Indietro</button><button class="btn primary">${i === TOUR.length - 1 ? "Fine" : "Avanti"}</button><button class="btn">Chiudi</button></div>`;
    document.body.append(mask, hole, bub);
    const bx = Math.min(Math.max(8, r.left), innerWidth - 346);
    const by = r.bottom + 12 + bub.offsetHeight > innerHeight ? Math.max(8, r.top - bub.offsetHeight - 12) : r.bottom + 12;
    Object.assign(bub.style, { left: bx + "px", top: by + "px" });
    const [back, next, close] = $$("button", bub);
    back.onclick = () => startTour(Math.max(0, i - 1));
    next.onclick = () => (i === TOUR.length - 1 ? endTour() : startTour(i + 1));
    close.onclick = endTour;
    tourEls = [mask, hole, bub];
  }
  function endTour() { if (tourEls) tourEls.forEach((e) => e.remove()); tourEls = null; }

  /* ================= avvio ================= */
  $("#app-ico").innerHTML = icon("app", 16);
  renderMenubar();
  renderTopToolbar();
  renderViewportToolbar();
  renderStrip();
  renderTree();
  renderProps();
  fillPanels();
  drawScene();
  INITIAL_LOG.forEach(([lvl, txt], i) => addLog(lvl, txt, `11:41:${String(30 + i).padStart(2, "0")}`));
  selectPanel("props");

  /* Link diretti: #dlg=preferences · #menu=Visualizza · #panel=log · #highlight · #tour (combinabili con &) */
  const hash = new URLSearchParams(location.hash.slice(1));
  if (hash.get("panel")) selectPanel(hash.get("panel"));
  if (hash.get("dlg")) hash.get("dlg").split(",").forEach((d) => openDialog(d));
  if (hash.get("menu")) {
    const [top, ...path] = hash.get("menu").split("/");
    const el = top === "Importa" || top === "Esporta" ? $$(".tt-btn").find((x) => x.textContent.trim() === top) : $$("#menubar .mb-item").find((x) => x.textContent === top);
    if (el) {
      el.click();
      for (const name of path) { const row = $$(".menu .mi.sub").find((r) => r.textContent === name); if (row) row.dispatchEvent(new Event("mouseenter")); }
    }
  }
  if (hash.has("highlight")) showPluginHighlight({ plugin: "Statistiche asset", what: "29.008 facce" });
  if (hash.has("tour")) startTour();
})();
