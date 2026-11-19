# Proposta di revisione dell'interfaccia di City3D

Bozza di lavoro CNR-IMATI, aggiornata al 19/11/2026.

- **Riferimento:** release `366fdda` (17/11/2026); i riferimenti al codice sono a quella release.
- **Mockup navigabile:** `mockup-ui-v2/index.html`. Si apre con un doppio clic e non richiede installazione.
- **Modifiche ai menu nel mockup:** sono raccolte in `mockup-ui-v2/proposta.js`.

Il documento elenca cosa cambia rispetto alla release e perché. Cresce a ogni giro di revisione: finora sono stati rivisti i menu Vista, che diventa Visualizza (§4), Plugin (§6, menu e barra), Info (§7), File, che diventa Progetto (§8), e Geometria, che viene tolto (§9).

## 1. Disposizione generale

| Zona | Contenuto |
|---|---|
| Riga dei menu | I menu e, a destra, il progetto attivo con il suo CRS. Un clic sul nome seleziona il progetto nell'albero e ne mostra le proprietà; un clic sul CRS apre «Imposta CRS di progetto». |
| Pulsantiera in alto | Nuovo, Apri, Salva, **Importa ▾** ed **Esporta ▾**. Dopo una linea verticale a puntini vengono i comandi che i plugin agganciano alla barra (§6). |
| Vista 3D | Pulsantiera sovrapposta su una riga (§3). In alto a destra l'orientamento interattivo, in basso a sinistra i conteggi dell'asset selezionato (§3.3). |
| Colonna destra | Sopra l'albero dei progetti, sotto una striscia di icone con il pannello selezionato. I pannelli sono Proprietà del layer, CityObject, Annotazione, Risultati lazo, Annotazioni USAP (§11), Mappa 2D, Concetti semantici e Log. Nello stesso posto si aprono i comandi (§2). |
| Riga di log | L'ultimo messaggio e i contatori di avvisi ed errori; un clic apre il pannello Log. |

Rispetto a oggi:
- i pannelli agganciabili lasciano il posto alla striscia;
- le tre schede del pannello informativo diventano tre icone separate;
- il Log diventa un'icona della striscia.

## 2. I comandi si aprono nel pannello a destra

### 2.1 Regola

Le finestre aperte dai comandi non si aprono più sopra la vista: il loro contenuto va nel pannello della colonna destra. La vista 3D non è mai coperta e resta sempre utilizzabile per zoom, pan e rotazione.

Oggi quasi tutte le finestre sono modali, e finché sono aperte la vista non risponde. In `mainwindow.cpp` ci sono 49 `exec()`, a cui si aggiungono le chiamate statiche a `QFileDialog`, `QColorDialog`, `QInputDialog` e `QMessageBox`.

### 2.2 Comportamento

1. **Icona del comando.** All'apertura di un comando compare in cima alla striscia un'icona temporanea, in ambra, e il pannello mostra il comando.
2. **Pannello bloccato.** Le altre icone si spengono: finché il comando non si conclude (OK, Annulla o ✕) non si cambia pannello.
3. **Un comando alla volta.**
   - Menu, pulsantiere, menu contestuale dell'albero e pulsanti dei pannelli restano visibili, ma non aprono un secondo comando.
   - Un clic su un comando fa lampeggiare l'icona ambra, e la riga di log ricorda di concludere quello aperto.
   - Vale anche per le finestre mobili del §2.3.
4. **Cosa resta libero:**
   - navigazione della vista;
   - viste predefinite, «adatta alla scena» e «adatta alla selezione»;
   - modo di disegno;
   - visibilità dei layer (occhio);
   - scorrimento e lettura dell'albero.
5. **Selezione bloccata.** Mentre un comando è aperto la selezione non cambia: sono bloccati il lazo, la modalità di selezione, «Annulla selezione» e il passaggio a un'altra riga dell'albero. Se all'apertura del comando uno strumento di selezione è armato, si spegne. Il comando lavora sul layer e sugli elementi selezionati all'apertura, e il pannello indica il layer.
   - **Perché.** Verificato sulla release 366fdda: diversi comandi copiano la selezione all'apertura e la scrivono più tardi. Oggi è sicuro perché le loro finestre sono modali. In un pannello non modale, un nuovo lazo lascerebbe il comando a scrivere una selezione che l'utente non vede più.
     - «Annotazioni della selezione» e il flusso guidato di «Nuova annotazione» leggono la selezione all'apertura (`edit_selection_annotations`, `mainwindow.cpp:7017`) e la passano alla finestra (`mainwindow.cpp:7134`), che la conserva in `m_faces`.
     - Con quella copia la finestra scrive nel pacchetto USAP: «Crea dalla selezione» (`selection_annotations_dialog.cpp:678`) e l'aggiunta o la rimozione dalla membership (`modify_membership`, riga 1031).
     - Oggi la finestra è modale (`dlg.exec()`, `mainwindow.cpp:7227`). Il flusso guidato spegne apposta il lazo prima di aprirla (`mainwindow.cpp:10388`).
     - «Modifica elementi…» dell'assessment, nel pannello Annotazione, copia gli elementi selezionati (`info_panel.cpp:886`) prima della scelta modale Sostituisci / Aggiungi / Rimuovi (`info_panel.cpp:916`).
     - Cambiare riga nell'albero cambia l'asset di riferimento. `onSelectionChanged` rilegge la selezione dei pannelli proprio per non scrivere gli id sull'asset sbagliato (commento a `mainwindow.cpp:5435`). Aggiorna anche progetto attivo, mappa, legenda, istogramma e voci di menu abilitate.
   - **Eccezione: pannelli dei plugin** (confermata da CNR il 19/11/2026, perché conserva una scelta di progetto della release). Con un plugin aperto la selezione degli elementi resta libera; l'albero resta bloccato. Oggi il pannello agganciabile di un plugin (superficie «panel», §6) è già non modale e segue la selezione di proposito: si aggiorna a ogni nuova selezione (`mainwindow.cpp:14701`), tranne durante l'esecuzione (`plugin_run_widget.cpp:485`).
6. **Passi interni.** Un passo interno al comando, per esempio «Nuovo CityObject…» dentro «Annotazioni della selezione», si apre nello stesso pannello sopra il precedente. L'intestazione mostra il percorso; chiudendo il passo si torna al precedente.
7. **Conferme ed esiti.** Stanno nel pannello del comando, non in una finestra a parte. Esempio: «Rimuovere 'catania.obj' dal progetto?».
8. **Ritorno.** Alla conclusione torna il pannello che era selezionato prima del comando.

### 2.3 Eccezioni: restano finestre mobili

| Categoria | Finestre |
|---|---|
| Importa | Carica mesh, Carica nuvola di punti, Importa CityGML, Apri dataset annotato, Carica raster, Carica layer GIS, Carica immagini sferiche, Immagini sferiche…, Carica dal datalake, Carica valori (CSV, TXT) dalle Proprietà dell'asset (§10). Vi rientrano anche i loro passi successivi: CRS del file, copia nel progetto, livello di dettaglio, variabile NetCDF, colore per attributo, esito. |
| Esporta | Esporta progetto (.zip), Screenshot, Inventario di una cartella |
| Progetto | Nuovo progetto, Apri progetto, Chiudi progetto, Verifica file orfani, CRS del progetto (dal CRS in alto a destra) |
| Salvataggio | Salva progetto (Ctrl+S) |
| Applicazione | Preferenze, Gestione plugin (con la sua installazione da file) |
| Info | Licenza, Guida introduttiva |
| Visualizzatore a 360° | l'immagine sferica navigabile |

Inoltre:
- **Finestre di sistema.** Le finestre del sistema operativo per scegliere file e cartelle restano native. Esempi: «Sfoglia…», «Salva log…», nuovo pacchetto USAP e apertura di un pacchetto USAP.
- **Finestre aperte da una finestra mobile.** Restano mobili anche loro. Esempi: la scelta del colore dalle Preferenze, i passi successivi di un'importazione.

### 2.4 Comandi che passano nel pannello

| Da dove si aprono | Comandi |
|---|---|
| Pulsantiera della vista | Annotazioni della selezione… (§3.6), l'esito di Interroga (§3.7) |
| Passi interni ai comandi di annotazione | Esito della creazione, Nuovo CityObject, aggiunta o rimozione della selezione dalla membership, hash dell'asset, metadati, eliminazione, assessment, elementi, attributo generico, proprietà strutturata |
| Servizi | Ombreggiatura, Pendenza |
| Plugin | I comandi dei plugin (per esempio Statistiche dell'asset) e il loro esito. Fa eccezione «Inventario di una cartella», che sta in Esporta. |
| Proprietà del layer e menu contestuale dell'albero | Rinomina, Colore, Opacità, Imposta CRS (con la domanda di conversione), Rimuovi, Dimensione dei punti, Decimazione, Altezza, Livello di dettaglio, Colora per attributo, Salva in USAP (§10) |

### 2.5 Da rivedere

- **Tabelle grandi.** Annotazioni USAP (ora pannello fisso, §11.1) e Annotazioni della selezione per ora vanno nel pannello così come sono. Vanno rifatte; si deciderà poi se e come spostarle dal pannello.
- **Larghezza delle finestre.** Le finestre di oggi sono disegnate per 400–800 px di larghezza: nel pannello vanno ridisposte in colonna.
- **Una possibile strada in Qt.** Il contenuto di ogni `QDialog` diventa un widget non modale ospitato in un `QStackedWidget` del pannello destro.

## 3. Vista 3D

### 3.1 Lazo: due strumenti invece di tre

**Oggi.** L'utente sceglie fra tre strumenti:
- Selezione a lazo (area), `actionAdd_area_annotation`;
- Selezione a lazo (linea), `actionAdd_line_annotation`;
- Selezione a lazo (punti), `actionAdd_point_annotation`.

Si seleziona però un asset alla volta, e la scelta fra area e punti dipende solo dal tipo di asset: è una scelta superflua.

**Proposta:**
- **Selezione a lazo.** Un solo strumento: facce se l'asset selezionato è una mesh, punti se è una nuvola. È la logica che `start_new_annotation()` già usa per scegliere lo strumento (`mainwindow.cpp:10338`).
- **Selezione a lazo (spigoli).** È l'attuale «(linea)» e resta uno strumento separato: è l'unica eccezione. Serve solo sulle mesh; con una nuvola selezionata è disabilitato.
- **Annotazioni › Strumenti** esce dal menu (§11): i lazi e «Annulla selezione» restano nella pulsantiera della vista, e Interroga ne diventa l'ultimo pulsante (§3.7).

### 3.2 Modo di disegno: tre pulsanti esclusivi

**Oggi.** Solido, Wireframe e Vertice (`actionSolid`, `actionWireframe`, `actionVertex`) stanno nel menu Vista. Sono combinabili, con almeno uno acceso (`preventAllViewUnchecked`, `mainwindow.cpp:10201`).

**Proposta.** Tre pulsanti esclusivi nella pulsantiera della vista, uno solo acceso, con etichetta «Visualizza mesh come: solido / wireframe / vertici». Le tre voci escono dal menu Vista.

**Conseguenza.** Non si possono più combinare due modi, per esempio solido + wireframe.

### 3.3 Conteggi dell'asset selezionato

**Oggi.** `updateVertexCellCount()` (`mainwindow.cpp:14019`) scrive nella barra di stato i conteggi dell'asset selezionato, o dell'asset a cui appartiene la riga selezionata. Con il progetto selezionato, o nessuna riga, mostra invece il totale degli asset visibili: «Asset visibili (totale): … vertici e punti, … facce».

**Proposta.**
- I conteggi sono sempre quelli dell'asset selezionato; il totale sparisce.
- Senza un asset 3D selezionato il conteggio non compare.
- Posizione: in basso a sinistra nella vista.

### 3.4 Evidenziazione dei plugin: un'etichetta nella vista

**Oggi.** Un plugin può evidenziare oggetti o elementi nella vista 3D (API 1.3), e l'evidenziazione resta anche dopo la chiusura del comando. Si toglie da due punti:
- la voce Plugin › Togli evidenziazione dei plugin (`actionClearPluginHighlight`, `mainwindow.cpp:14283`), abilitata solo quando c'è un'evidenziazione;
- il pulsante «Togli evidenziazione» nell'esito del plugin (`plugin_run_widget.cpp:204`), che serve solo finché il modulo è aperto.

Non c'è un segno visibile che dica quale plugin ha lasciato l'evidenziazione.

**Proposta.** Un'etichetta in basso al centro della vista, visibile solo quando c'è un'evidenziazione. Per esempio: «● Evidenziati dal plugin "Statistiche asset": 29.008 facce ✕».
- Dice quale plugin l'ha lasciata e quanti oggetti o elementi ha evidenziato.
- La ✕ la toglie.
- Sostituisce sia la voce di menu sia il pulsante nell'esito del plugin.
- L'accensione e lo spegnimento si possono legare al segnale che già abilita la voce di menu (`notify_plugin_highlight`, `mainwindow.cpp:7907`). Il nome del plugin e il conteggio vanno conservati al momento dell'esecuzione.

### 3.5 Modo del lazo: non è uno strumento

**Oggi.** Accanto ai lazi ci sono «Selezione singola», «Selezione additiva» e «Selezione sottrattiva» (`actionSingle_selection`, `actionAdditive_selection`, `actionSubtractive_selection`). Non sono strumenti: dicono come il prossimo lazo cambia la selezione. «Singola» la sostituisce, «additiva» aggiunge gli elementi, «sottrattiva» li toglie (`SelectionType` in `selectiontools/selected_elements.h:25`, applicato in `LassoPointSelectionStyle.cpp:481`). Il nome «singola» e l'icona a freccia fanno pensare a uno strumento di selezione con un clic, che non esiste. Inoltre il modo attivo è evidenziato come il lazo attivo, quindi sembrano due strumenti accesi insieme.

**Proposta.**
- **Nomi.** I modi si chiamano «Sostituisci la selezione», «Aggiungi alla selezione» e «Togli dalla selezione». Il sottomenu Annotazioni › Modalità di selezione esce dal menu (§11): i modi restano solo nella pulsantiera.
- **Gruppo separato.** Nella pulsantiera della vista i tre modi formano un gruppo a parte, subito dopo i lazi. L'icona di «Sostituisci» è un quadrato pieno, non più una freccia.
- **Colori.** Il blu pieno indica solo lo strumento attivo, cioè il lazo. I modi esclusivi, sia quello del lazo sia il modo di disegno (§3.2), mostrano la scelta in grigio con una linea sotto. Il modo del lazo resta sbiadito finché un lazo non è attivo.

### 3.6 Annotare la selezione: un solo pulsante

**Oggi.** Due comandi portano alla stessa finestra, «Annotazioni della selezione» (`SelectionAnnotationsDialog`): l'elenco delle annotazioni toccate dalla selezione, «Crea dalla selezione», metadati, membership ed eliminazione.
- **Nuova annotazione** (`start_new_annotation`, `mainwindow.cpp:10290`) svuota la selezione, arma il lazo adatto all'asset e apre la finestra quando il lazo si chiude (`mainwindow.cpp:10395`).
- **Dati › Modifica le annotazioni della selezione** (`edit_selection_annotations`, `mainwindow.cpp:7011`) apre la finestra sulla selezione che c'è già, per esempio una fatta con più lazi in «Aggiungi alla selezione».

**Proposta.** Un solo pulsante nella pulsantiera della vista, «Annotazioni della selezione…»:
- **con una selezione:** apre la finestra su quella;
- **senza selezione:** arma il lazo e apre la finestra quando il lazo si chiude, come oggi Nuova annotazione.

**Conseguenza.** Oggi Nuova annotazione svuota apposta la selezione precedente, perché un lazo vecchio non passi per quello nuovo (`mainwindow.cpp:10350`). Con il pulsante unico la selezione presente viene usata. È però visibile, con il conteggio nella vista (§3.3), e «Annulla selezione» è accanto.

**Aggiungi e togli dalla membership.** Restano solo dentro la finestra, dove si sceglie l'annotazione a cui aggiungere o da cui togliere la selezione (`selection_annotations_dialog.cpp:215-220`). Non vanno nella pulsantiera della vista: lì non c'è un'annotazione scelta.

### 3.7 Interroga: ultimo pulsante della pulsantiera

**Oggi.** «Interroga/modifica con il mouse» (`actionQuery_edit_with_mouse`, `mainwindow.cpp:10020`) sta nella barra degli strumenti delle annotazioni e in Annotazioni › Strumenti. È attiva solo con un layer GIS o un set `.ant` selezionato nell'albero (`mainwindow.cpp:13211`):
- su un layer GIS, il clic su un elemento ne mostra le proprietà in una finestra (`genericvtkwidget.cpp:4393`);
- su un set `.ant`, il clic su una faccia evidenzia l'annotazione che la contiene e apre la finestra dei suoi attributi (`viewer_project.cpp:4580`).

**Proposta.**
- **Posto.** Ultimo pulsante della pulsantiera della vista, dopo le annotazioni. Esce dal menu.
- **Strumento.** Fa gruppo con i lazi: uno solo attivo alla volta, come oggi (`mainwindow.cpp:10048`), ed è blu quando è attivo (§3.5).
- **Solo layer GIS.** I set `.ant` escono dal prodotto (§11.2).
- **Spento** se nell'albero non è selezionato un layer GIS; il suggerimento lo dice.
- **Esito nel pannello** (§2). Un nuovo clic sostituisce l'esito precedente e lo strumento resta attivo. L'esito non usa la selezione, quindi non la blocca.

**Da decidere.** Oggi attivare Interroga svuota la selezione del lazo (`mainwindow.cpp:10022`). Lo strumento non la usa: si propone di non svuotarla.

## 4. Menu Visualizza (oggi Vista)

Il menu si rinomina in **Visualizza**. Escono le voci già coperte dalla pulsantiera della vista o dalla striscia dei pannelli, e il colore dello sfondo, che resta solo nelle Preferenze.

| Voce di oggi | Nel codice | Esito | Motivo |
|---|---|---|---|
| Mostra assi | `actionShow_Axes` | resta | |
| Overlay assi interattivo | `actionInteractive_Axis_Overlay` | tolta | l'orientamento interattivo è sempre visibile in alto a destra nella vista |
| Mostra barra colore | `actionShow_colorbar` | resta | |
| Mostra slider | `actionShow_Slider` | resta | |
| Vedi da… › Alto, Ovest, Sud, Nord-est | `menuView_from` | tolto | pulsanti Alto, NE, S, O della vista |
| Imposta colore di background | `actionSet_background_color`, `mainwindow.cpp:8324` | tolta | l'unico punto di accesso è Preferenze › Visualizzazione. La voce scrive gli stessi due colori delle Preferenze (in alto e in basso): per uno sfondo a tinta unita li si imposta uguali. |
| Solido, Wireframe, Vertice | `actionSolid`, `actionWireframe`, `actionVertex` | tolte | pulsanti esclusivi della vista (§3.2) |
| Mostra proprietà del layer | `toggleViewAction()` del dock, `mainwindow.cpp:14831` | tolta | icona della striscia |
| Mostra pannello informativo | `actionShow_InfoPanel`, `mainwindow.cpp:5775` | tolta | icone CityObject, Annotazione, Risultati lazo |
| Mostra istogramma (PDF) | `actionShow_PdfDock`, `mainwindow.cpp:673` | resta | da decidere (§12) |
| Mostra legenda | `actionShowLegend`, `mainwindow.cpp:788` | resta | da decidere (§12) |
| Pannelli › … | `mainwindow.cpp:921` | tolto | striscia dei pannelli |
| Adatta la vista alla scena | `mainwindow.cpp:1056` | tolta | pulsante della vista |
| Adatta la vista alla selezione | `mainwindow.cpp:1060` | tolta | pulsante della vista |
| Mostra layer raster | `mainwindow.cpp:1063` | resta | |
| Mostra immagini sferiche | `mainwindow.cpp:1071` | resta | |
| Immagini sferiche… | `mainwindow.cpp:1080` | spostata in Importa | §5 |
| Vista predefinita | `mainwindow.cpp:1093` | tolta | pulsante della vista |

Menu Visualizza risultante:

```
Mostra assi
Mostra barra colore
Mostra slider
─────────────
Mostra istogramma (PDF)
Mostra legenda
─────────────
Mostra layer raster
Mostra immagini sferiche
```

## 5. Importa

- **«Immagini sferiche…»**, l'elenco delle immagini caricate, passa dal menu Vista al menu a tendina Importa della pulsantiera in alto, subito dopo «Carica immagini sferiche (CSV)…».
- **Messaggio dopo il caricamento.** Va aggiornato, perché rimanda ancora a «View > Spherical images...». Il testo sta in `mainwindow.cpp:13779` e nella traduzione italiana in `lang_it_IT.ts`.

## 6. Plugin: menu e barra

Ogni plugin dichiara nel suo manifest dove compaiono i suoi comandi.
- **Comandi del tipo più comune («routine»).** Il posto lo scelgono le «superfici» (`docs/PLUGIN-ACCESS-POINTS.md:50-54`). Un comando può dichiararne più d'una; senza dichiarazione vale `menu`.
- **Altri tre tipi di comando.** Il posto è fisso e le superfici non contano (`mainwindow.cpp:14378-14404`).
- **Nessuna voce può scegliere il menu o il sottomenu.** La superficie `menu` mette sempre il comando nel menu Plugin.

| Superficie o tipo | Dove compare il comando oggi | Come si apre oggi |
|---|---|---|
| `menu` (predefinita) | voce del menu Plugin | finestra modale (`run_plugin_command`, `mainwindow.cpp:14721`) |
| `toolbar` | pulsante della barra Plugin | finestra modale, come sopra |
| `panel` | pannello agganciabile, acceso e spento da Plugin › Pannelli | pannello non modale, sempre aperto finché non lo si chiude |
| `export` | voce di File › Esporta › Plugin | finestra modale |
| `import` | accettata dal manifest, non compare da nessuna parte | — |
| tipo `exporter` (un formato di esportazione) | voce di File › Esporta › Plugin | scelta del file da salvare |
| tipo `connector` (una sorgente di dati esterna) | Plugin › Sorgenti dati esterne | finestra di consultazione |
| tipo `reader` (un formato in lettura) | filtro in più nella scelta del file di Carica mesh e Carica nuvola di punti | — |

Esempio: «Statistiche dell'asset» dichiara `menu`, `toolbar` e `panel`, quindi oggi compare tre volte: nel menu Plugin, nella barra Plugin e in Plugin › Pannelli.

### 6.1 Menu Plugin

Oggi il menu è ricostruito da `rebuild_plugin_surfaces()` (`mainwindow.cpp:14310`):

```
Gestione plugin...
Esegui plugin…
Aggiungi plugin…
Togli evidenziazione dei plugin
─────────────
<un comando per ogni plugin attivo con superficie «menu»>
─────────────
Sorgenti dati esterne ›     (se ci sono connettori)
─────────────
Pannelli ›                  (comandi con superficie «panel»)
```

| Voce di oggi | Nel codice | Esito | Motivo |
|---|---|---|---|
| Gestione plugin... | `mainwindow.cpp:14316` | resta | |
| Esegui plugin… | `actionRunPlugin`, `mainwindow.cpp:14271` | tolta | Apre una lista di scelta (`PluginCommandPicker`, `run_plugin_from_list`, `mainwindow.cpp:14747`) con gli stessi comandi dell'elenco qui sotto. |
| Aggiungi plugin… | `actionAddPlugin`, `mainwindow.cpp:14276` | tolta | Apre Gestione plugin e preme subito il suo «Installa da file…» (`show_plugin_manager(true)`, `install_when_shown`, `plugin_manager_dialog.cpp:339`): è lo stesso pulsante. |
| Togli evidenziazione dei plugin | `actionClearPluginHighlight`, `mainwindow.cpp:14283` | tolta | la sostituisce l'etichetta nella vista (§3.4) |
| Elenco dei comandi | `mainwindow.cpp:14406` | resta | È il punto di aggancio «menu» dell'API dei plugin: è il predefinito delle routine (`docs/PLUGIN-ACCESS-POINTS.md:50`) ed è tra quelli citati da US-PLUGIN-02. Ogni comando resta a un clic. |
| Sorgenti dati esterne › | `mainwindow.cpp:14484` | resta | |
| Pannelli › | `mainwindow.cpp:14499` | tolto | Con la regola del §2 ogni comando di plugin si apre già nel pannello a destra, resta aperto e segue la selezione (§2.2, punto 5). Il sottomenu sarebbe una terza strada verso lo stesso pannello. |

Menu Plugin risultante:

```
Gestione plugin...
─────────────
<un comando per ogni plugin attivo con superficie «menu»>
─────────────
Sorgenti dati esterne ›     (se ci sono connettori)
```

Il **pannello del plugin** resta: è richiesto da US-PLUGIN-02 («plugin-provided panel») e il piano dei plugin lo usa. Ne dipendono:
- AP-03, eventi della vista inoltrati al componente di configurazione a pannello aperto;
- AP-04, anteprima aggiornata a ogni cambio di parametro;
- AP-08, «Conferma» / «Scarta» nel pannello;
- P1, editor CityGML con superficie `panel` o `toolbar`.

Nel nuovo layout il pannello del plugin è il pannello a destra, dove si apre ogni comando: cade solo il sottomenu che lo accendeva. Perché un plugin che dichiara solo la superficie `panel` resti raggiungibile, quella superficie dà anche la voce nel menu Plugin; i plugin esistenti non vanno modificati.

### 6.2 Comandi dei plugin nella barra

La barra Plugin della release (`mainwindow.cpp:14327`) contiene «Esegui plugin…», «Aggiungi plugin…» e i comandi con superficie `toolbar`. Nel nuovo layout:
- i comandi con superficie `toolbar` vanno nella pulsantiera in alto, dopo Esporta, separati da una linea verticale a puntini;
- come oggi, hanno il testo accanto all'icona, perché un plugin può non avere un'icona propria;
- «Esegui plugin…» e «Aggiungi plugin…» non ci sono, per gli stessi motivi del §6.1.

### 6.3 File › Esporta › Plugin: resta

- **Per gli esportatori è l'unico accesso.** I comandi di tipo `exporter` (un formato di esportazione) non compaiono nel menu Plugin, e senza «Esegui plugin…» (§6.1) l'unico posto da cui si raggiungono è questo.
- **Indica che il comando esporta.** Una routine con superficie `export` ci compare perché l'autore del plugin la presenta come un'esportazione. Se dichiara anche `menu`, compare in tutti e due i posti per scelta dell'autore: è il caso di «Inventario di una cartella», che dichiara `menu` ed `export`.
- **Nel nuovo layout** lo stesso sottomenu «Plugin ›» sta anche nel menu a tendina Esporta della pulsantiera in alto.

## 7. Menu Info

Resta com'è: Licenza, Tour dell'interfaccia, Guida introduttiva...

## 8. Menu Progetto (oggi File)

Il menu si rinomina in **Progetto**.

In City3D progetto e sessione sono lo stesso file, `project.json`, nella cartella del progetto. Anche i requisiti li trattano così: US-PROJECT-01 chiede di «salvare la sessione in un file di progetto», US-PROJECT-02 di «aprire un file di progetto salvato».
- **Cosa contiene.** Il file contiene l'elenco dei dataset e, nel blocco `session`, lo stato di lavoro: vista, finestre, visibilità, colori, ordine dei layer, collegamento CityGML–USAP.
- **Apri e salva.** «Apri progetto» legge il `project.json` della cartella scelta, quindi riapre sempre l'ultima sessione salvata lì. Ctrl+S scrive proprio in quel file (`save_session_here`, `mainwindow.cpp:9605`).
- **Copie della sessione.** «Salva la sessione con nome…» scrive una copia del file altrove (`mainwindow.cpp:9430`), e «Apri un file di progetto…» apre un `.json` qualsiasi (`mainwindow.cpp:9751`).

| Voce di oggi | Nel codice | Esito | Motivo |
|---|---|---|---|
| Nuovo progetto | `actionNew_view` | resta | |
| Apri progetto | `actionLoad_project` | resta | |
| Apri un file di progetto ... | `actionOpen_project_file`, `mainwindow.cpp:9751` | tolta | Serve solo a riaprire le copie di «Salva la sessione con nome», che esce anch'essa. Un progetto che sta fuori dalla cartella di lavoro si apre cambiando la cartella di lavoro, nelle Preferenze o nella finestra di «Apri progetto». |
| Carica dal datalake | `actionLoad_Datalake` | tolta | è nel menu Importa della pulsantiera |
| Salva la sessione | `actionSave_session_here`, `mainwindow.cpp:979` | resta come **Salva progetto** (Ctrl+S) | progetto e sessione sono lo stesso file |
| Salva la sessione con nome ... | `actionSave_Project`, `mainwindow.cpp:9430` | tolta | Una sessione salvata a parte è la vecchia vista sui dati di oggi. Quando la si riapre, un file cambiato si riconosce solo dalla dimensione (`session_state.cpp:176`). Inoltre i percorsi dei dataset sono relativi alla cartella del progetto (`viewer_project.cpp:897`): una copia in un'altra cartella potrebbe non ritrovarli, ma non l'ho provato. Per una copia completa altrove, dati compresi, c'è «Esporta progetto (.zip)». Esce anche dalle azioni del progetto nell'albero. |
| Chiudi progetto | `actionClose_project`, `mainwindow.cpp:12964` | resta | |
| Esporta › Esporta progetto (.zip), Plugin › | `menuExport` | tolto | È il menu Esporta della pulsantiera, con lo stesso sottomenu Plugin (§6.3). Oggi il sottomenu dei plugin è costruito su `menuExport` (`mainwindow.cpp:14384` e `14431`): va agganciato al menu Esporta della pulsantiera, altrimenti gli esportatori dei plugin restano senza accesso. |
| Imposta cartella di lavoro | `actionSet_working_folder`, `mainwindow.cpp:10681` | tolta | scrive la stessa impostazione di Preferenze › Cartelle |
| Preferenze... | `actionPreferences`, `mainwindow.cpp:784` | resta, in una sezione a parte | |
| Imposta CRS di progetto | `actionSet_project_CRS`, `mainwindow.cpp:11163` | tolta | Si cambia dal CRS accanto al nome del progetto, in alto a destra, e dalle azioni del progetto nell'albero. In Preferenze c'è solo il CRS proposto ai nuovi progetti, che è un'altra cosa. |
| Verifica file orfani ... | `actionCheck_project_for_orphan_files`, `mainwindow.cpp:11158` | resta | Non è in nessuna user story: viene dal prototipo, ed è nel repository City3D dal primo commit (05/08/2026). Serve perché togliere un dataset dal progetto non cancella il file, che resta nella cartella del progetto (rimozione della geometria a `mainwindow.cpp:10956`, dei layer GIS a `mainwindow.cpp:15629`). |
| Screenshot ... | `actionTake_screenshot` | tolta | è nel menu Esporta della pulsantiera |

Menu Progetto risultante:

```
Nuovo progetto
Apri progetto
Salva progetto           Ctrl+S
Chiudi progetto
Verifica file orfani ...
─────────────
Preferenze...            Ctrl+,
```

Alcuni messaggi citano il percorso «File › …» e vanno aggiornati: `main.cpp:191`, `mainwindow.cpp:8338` e `10915`, `utils/menu_availability.cpp:118` e `122`.

## 9. Menu Geometria: tolto

**Criterio, valido da qui in avanti.** Ogni comando ha un solo posto visibile, il più immediato. Il tasto destro può ripeterlo come scorciatoia, ma con lo stesso nome e la stessa finestra. È la regola delle linee guida:
- Apple chiede che le voci di un menu contestuale siano disponibili anche nell'interfaccia principale;
- Nielsen Norman Group osserva che le azioni nascoste in un menu contestuale si trovano meno.

Per i comandi su un layer, il posto visibile è il pannello Proprietà del layer. Il tasto destro sull'albero mostra la stessa lista (`layerinfo::actions_for`).

| Voce di oggi | Nel codice | Esito | Dove si trova |
|---|---|---|---|
| Carica mesh | `actionLoad_mesh` | tolta | menu Importa della pulsantiera |
| Carica nuvola di punti | `actionLoad_point_cloud` | tolta | menu Importa della pulsantiera |
| Imposta colore geometria | `actionSet_geometry_color` | tolta dal menu | Proprietà del layer e tasto destro, dataset 3D |
| Imposta opacità geometria | `actionSet_geometry_opacity` | tolta dal menu | idem |
| Imposta CRS geometria | `actionSet_geometry_CRS` | tolta dal menu | idem |
| Calcola › Distanza, Superficie | `menuMeasure`: `actionDistance`, `actionSurface` | spostato | Servizi › Calcola |
| Rimuovi geometria | `actionRemove_geometry` | tolta dal menu | Proprietà del layer e tasto destro, dataset 3D |
| Decimazione della nuvola... | `actionCloudDecimation`, `mainwindow.cpp:882` | spostata | Proprietà del layer e tasto destro, solo nuvole `.las`/`.laz` (il controllo è a `mainwindow.cpp:10490`) |
| Dimensione dei punti... | `actionPointSize`, `mainwindow.cpp:888` | spostata | Proprietà del layer e tasto destro, solo nuvole (il controllo è a `mainwindow.cpp:895`) |

Il menu resta vuoto ed esce dalla barra dei menu. Note per l'implementazione:
- **Le azioni restano.** Escono solo da `menuGeometry`: il pannello e l'albero le usano già (`mainwindow.cpp:15425-15434`).
- **Nomi brevi per tutti i tipi di layer.** Nel pannello e nel tasto destro le azioni usano i nomi di `layerinfo::action_label` (`utils/layer_info.cpp:88`): «Rinomina…», «Colore…», «Opacità…», «Imposta CRS…», «Rimuovi», e per le nuvole «Dimensione dei punti…» e «Decimazione…». Oggi sui dataset 3D compaiono i nomi lunghi dei vecchi menu, perché vengono riusate le azioni dei menu con il loro testo (`mainwindow.cpp:15425-15434`).
- **Mesh e nuvola vanno separate.** Le azioni di un layer sono definite in `utils/layer_info.cpp:61-83`, dove `Kind::Dataset` vale sia per le mesh sia per le nuvole. Per aggiungere Dimensione dei punti e Decimazione solo alle nuvole va separato il tipo, oppure va filtrata la lista in base al tipo di dataset.
- **Un'etichetta da aggiornare.** Un'etichetta delle Preferenze cita il menu Geometria (`dialogs/preferences_dialog.cpp:77`).

## 10. Menu Dati: tolto

Vale il criterio del §9: un solo posto visibile, il più immediato.

| Voce di oggi | Nel codice | Esito | Dove si trova |
|---|---|---|---|
| Carica dati | `actionLoad_data_2`, `mainwindow.cpp:9258` | spostata e rinominata | «Carica valori (CSV, TXT)…» nelle Proprietà del layer di mesh e nuvole, e nel tasto destro |
| Importa CityGML… | `mainwindow.cpp:945` | tolta | menu Importa della pulsantiera |
| Apri dataset annotato (CityGML + USAP)… | `mainwindow.cpp:961` | tolta | menu Importa della pulsantiera |
| Annotazioni della selezione corrente (USAP)… | `open_selection_annotations`, `mainwindow.cpp:6881` | tolta | pannello Risultati lazo della striscia |
| Modifica le annotazioni della selezione (USAP)… | `edit_selection_annotations`, `mainwindow.cpp:7011` | tolta | pulsante «Annotazioni della selezione…» della vista (§3.6) |
| Salva campo di valori in USAP… | `save_value_field`, `mainwindow.cpp:7321` | spostata e rinominata | «Salva in USAP…» nelle Proprietà del layer del campo scalare, e nel tasto destro |
| Interroga campi di valori USAP… | `open_value_field_query`, `mainwindow.cpp:7470` | spostata | sezione «Campi di valori» del pannello Annotazioni USAP (§11.1) |
| Carica raster (GeoTIFF, NetCDF)… | `mainwindow.cpp:1041` | tolta | menu Importa della pulsantiera |
| Carica immagini sferiche (CSV)… | `mainwindow.cpp:1045` | tolta | menu Importa della pulsantiera |
| Colori originali dell'asset | `mainwindow.cpp:1105` | sostituita | controllo «Aspetto» nelle Proprietà del layer (§10.1) |
| Texture dell'asset | `mainwindow.cpp:1139` | sostituita | idem |

Il menu resta vuoto ed esce dalla barra dei menu.

### 10.1 Aspetto dell'asset

**Oggi.** Un asset ha tre aspetti che si escludono a vicenda (`viewer_project.cpp:4793-4825`):
- **colore uniforme**, scelto con «Colore…»;
- **colori del file**, cioè i colori per vertice letti dal file; valgono anche per le nuvole, per esempio i LAS con RGB;
- **texture**, solo per gli OBJ il cui `.mtl` indica un'immagine che si trova accanto al file.

Il colore sta nelle Proprietà del layer, gli altri due nel menu Dati. Se l'asset non ha colori o texture lo si scopre solo dopo il clic, con un messaggio.

**Proposta.** Nelle Proprietà del layer di mesh e nuvole, un controllo esclusivo **Aspetto: Colore uniforme | Colori del file | Texture**, grigio come gli altri modi (§3.5). «Colore…» resta accanto e sceglie il colore uniforme. Il tasto destro ripete le tre voci.
- **Opzioni spente.** Un'opzione che l'asset non ha resta visibile ma spenta, e il suggerimento dice perché. L'applicazione lo sa già prima del clic: l'asset porta con sé `original_point_colors` e `texture`.
- **Nuvole.** La texture non compare.
- **Annotazioni visibili.** Resta la domanda di oggi: le annotazioni visibili ricoprono i colori del file, quindi scegliendo «Colori del file» si chiede se nasconderle (`mainwindow.cpp:1123`).
- **Implementazione.** Le azioni del layer sono in `utils/layer_info.cpp:63-65`; vanno aggiunte le tre opzioni, per i soli dataset 3D.

### 10.2 Campi scalari

**Oggi.**
- **Carica dati** legge un file CSV o TXT. Una finestra chiede separatore, righe da saltare e colonna (`importtextdialog`). Il file diventa un campo scalare, cioè una riga figlia dell'asset selezionato nell'albero (`mainwindow.cpp:3911`). I valori devono essere tanti quante le facce o quanti i vertici dell'asset, altrimenti il file è rifiutato (`viewer_project.cpp:3776`). Con l'occhio acceso il campo colora il suo asset in scala di grigi, con la barra dei colori (`genericvtkwidget.cpp:819-860`).
- **Servizi › Ombre** produce lo stesso tipo di riga.
- **Salva campo di valori in USAP** prende un campo scalare dell'asset e lo scrive nel pacchetto USAP, come annotazione con il suo assessment e i valori, in una sola transazione. Se nell'albero è selezionato un campo, lo propone già (`numeric_fields_of`, `mainwindow.cpp:7245`).
- **Interroga campi di valori USAP** elenca i campi salvati nel pacchetto, applica un filtro (per esempio `> 0,5`) ed evidenzia gli elementi nella vista. È già una finestra non modale (`mainwindow.cpp:7487`): portarla nel pannello costa poco.

**Proposta.**
- **Asset (mesh e nuvole):** «Carica valori (CSV, TXT)…» nelle Proprietà del layer e nel tasto destro. Il campo nasce sotto l'asset che si ha in mano, senza chiedere quale. Non va in Importa: lì avrebbe comunque bisogno di un asset selezionato. Le sue finestre restano mobili come gli altri import (§2.3).
- **Campo scalare:** «Salva in USAP…» nelle Proprietà del layer e nel tasto destro. Oggi la riga ha solo Mostra/Nascondi, Inquadra e Sposta (`utils/layer_info.cpp:69-70`).
- **Pannello Annotazioni USAP:** la sezione «Campi di valori» (§11.1). In USAP un campo di valori è un'annotazione, e la sezione interroga lo stesso pacchetto.

### 10.3 Annotazioni della selezione corrente

È già il pannello Risultati lazo della striscia. Oggi però è la voce di menu a collegare il pannello al pacchetto USAP in uso e a verificare l'asset (`mainwindow.cpp:6881-6911`). Aperto dall'icona della striscia, il pannello deve fare lo stesso da solo, altrimenti resta vuoto.

### 10.4 Messaggi da aggiornare

Questi messaggi citano il menu Dati:
- `mainwindow.cpp:2502`, `mainwindow.cpp:4628`, `mainwindow.cpp:4723`, `mainwindow.cpp:7354`;
- `dialogs/info_panel.cpp:514`, `dialogs/info_panel.cpp:1073-1074`;
- `dialogs/city_object_panel.cpp:1481`, `dialogs/lasso_results_panel.cpp:401`;
- `genericvtkwidget.cpp:2308` e `myInteractorStyleSelectionPolyData.h:698`, che rimandano a «Data > Edit the annotations of the selection».

La guida introduttiva rimanda a «Data → Annotations of the current selection (USAP)…» (`dialogs/welcome_guide_dialog.cpp:127`).

Nella documentazione: `docs/DIALOGHI.md` (11 citazioni), `docs/EVIDENZE.md` (9), `docs/PANORAMICA.md` (2).

## 11. Menu Annotazioni: tolto

Vale il criterio del §9.

| Voce di oggi | Nel codice | Esito | Dove si trova |
|---|---|---|---|
| Nuova annotazione… | `start_new_annotation`, `mainwindow.cpp:10290` | unita a «Modifica le annotazioni della selezione» (§3.6) | pulsantiera della vista |
| Mostra tabella delle annotazioni | `actionView_annotations_table`, `mainwindow.cpp:5527` | tolta | esce dall'interfaccia: lavora solo sui set `.ant` (§11.2) |
| Filtra… | `actionFilter`, `mainwindow.cpp:8145` | tolta | esce dall'interfaccia: lavora solo sui set `.ant` |
| Colora la mesh in base al valore dell'attributo… | `actionColor_mesh_by_attribute_value`, `mainwindow.cpp:8342` | tolta dal menu | «Colora per attributo…» nelle Proprietà dei layer GIS; sui set `.ant` esce (§11.2) |
| Imposta colore annotazione | `actionSet_annotation_color`, `mainwindow.cpp:11209` | tolta | esce con i set `.ant` (§11.2) |
| Strumenti › Interroga/modifica con il mouse | `actionQuery_edit_with_mouse` | spostata | ultimo pulsante della pulsantiera della vista (§3.7) |
| Strumenti › Selezione a lazo, (spigoli), Annulla selezione | `menuTools` | tolte dal menu | pulsantiera della vista |
| Modalità di selezione › | `menuSelection_mode` | tolto dal menu | pulsantiera della vista (§3.5) |
| Rimuovi set di annotazioni… | `actionRemove_annotation` | tolta | esce con i set `.ant` (§11.2) |
| Carica layer GIS (drappeggiato)… | `actionLoad_GPKG_draped`, `mainwindow.cpp:13298` | tolta | menu Importa della pulsantiera |
| Annotazioni USAP… | `open_usap_dialog`, `mainwindow.cpp:7492` | diventa un pannello | pannello fisso «Annotazioni USAP» della striscia (§11.1) |

Il menu resta vuoto ed esce dalla barra dei menu, che diventa: Progetto, Visualizza, Servizi, Plugin, Info.

### 11.1 Annotazioni USAP: pannello fisso

**Oggi.** Una finestra modale (`UsapDialog`, aperta con `exec()` a `mainwindow.cpp:7541`) con:
- l'elenco di tutte le annotazioni di un pacchetto USAP; quella scelta si evidenzia nella vista;
- «Esporta annotazioni della mesh»: scrive nel pacchetto il set `.ant` selezionato nell'albero, con il CityObject e la classe semantica indicati nella finestra;
- «Importa nel progetto»: trasforma le annotazioni del pacchetto in set `.ant` del progetto.

**Proposta.** Diventa un pannello fisso della striscia, «Annotazioni USAP», disponibile come gli altri pannelli. Esce dal menu. Ha due sezioni:
- **Annotazioni:** il pacchetto (Sfoglia…, Apri/Ricarica), l'elenco delle annotazioni e i dettagli di quella scelta, che si evidenzia nella vista.
- **Campi di valori:** il contenuto di oggi di «Interroga campi di valori» (§10.2). Dopo «Salva in USAP…» la sezione si aggiorna, come oggi la finestra (`mainwindow.cpp:7461`).

Escono «Esporta annotazioni della mesh», con i campi CityObject e Classe semantica che servono solo a quella, e «Importa nel progetto»: lavorano sui set `.ant` (§11.2).

Note per l'implementazione:
- **Tabelle.** Per ora sono quelle delle finestre; vanno rifatte come le altre tabelle grandi (§2.5).
- **Non modale.** Il `QDialog` di Annotazioni USAP diventa un widget non modale; la finestra dei campi di valori lo è già (`mainwindow.cpp:7487`).
- **Sfoglia….** Oggi usa una finestra di salvataggio (`dialogs/usap_dialog.cpp:155`), perché si poteva esportare verso un pacchetto nuovo. Senza esportazione basta una finestra di apertura.

### 11.2 Set di annotazioni `.ant`: escono dal prodotto

**Oggi.** È il formato del prototipo. Nella release il caricamento diretto è nascosto (`mainwindow.cpp:997-1000`): un set nasce solo
- da un progetto vecchio che ne contiene,
- da «Importa nel progetto» di Annotazioni USAP,
- da Filtra.

**Decisione CNR (20/11/2026).** I file `.ant` non si usano più, né nel progetto né nelle esportazioni. Le annotazioni stanno solo nel pacchetto USAP. Un uso interno del formato, se serve, resta una scelta di DVISION.

**Conseguenze:**
- escono Mostra tabella delle annotazioni, Filtra…, Imposta colore annotazione e Rimuovi set di annotazioni;
- escono le azioni del set nelle Proprietà del layer (`Kind::Annotation`, `utils/layer_info.cpp:66-68`);
- escono dal pannello Annotazioni USAP «Esporta annotazioni della mesh» e «Importa nel progetto» (§11.1);
- Interroga lavora solo sui layer GIS (§3.7).

**Da decidere con DVISION:** come aprire un progetto vecchio che contiene set `.ant` (§12).

### 11.3 Testi da aggiornare

Nessun messaggio del programma cita il menu Annotazioni. Lo cita la guida introduttiva: «Annotations → New annotation…» (`dialogs/welcome_guide_dialog.cpp:115`). Nella documentazione: `docs/DIALOGHI.md` (4 citazioni), `docs/EVIDENZE.md` (2), `docs/PANORAMICA.md` (3).

## 12. Punti aperti

- **Istogramma e legenda:** diventano pannelli della striscia o restano voci di Visualizza?
- **Tabelle grandi nel pannello:** vedi §2.5.
- **Comandi che seguono la selezione:** oltre ai plugin (§2.2, punto 5) potrebbero essercene altri, da aggiungere all'eccezione uno per uno.
- **Altri menu:** si rivedono dopo questo primo giro.
- **Progetti vecchi con set `.ant`:** come aprirli, per esempio ignorandoli con un avviso o convertendoli nel pacchetto USAP? Da decidere con DVISION (§11.2).
- **Evidenziazione di «Interroga campi di valori»:** la finestra ha un suo «Togli evidenziazione». Può passare all'etichetta nella vista, come per i plugin (§3.4)?
- **Da fare a fine revisione — variante con finestre agganciabili:** una versione alternativa del mockup (in questa stessa cartella) con i comandi in finestre agganciabili invece che nel pannello fisso. Il modo di farla è da definire.
