# Mockup City3D

Prova della nuova disposizione dell'interfaccia di City3D, con dati sintetici. Si apre con un doppio clic su `index.html`, senza installazione. Menù e finestre partono da quelli della release `366fdda` (17/11/2026); le modifiche sono descritte sotto, da «La proposta in sintesi» in poi.

## Nuova disposizione

- **Barra del titolo:** icona, nome del programma, riduci, ingrandisci, chiudi.
- **Riga dei menu:** Progetto, Visualizza, Servizi, Plugin, Info; a destra il progetto attivo e il suo CRS, solo da leggere, come nella barra di stato della release.
- **Pulsantiera in alto:** Nuovo progetto, Apri progetto, Salva progetto, poi **Importa ▾** ed **Esporta ▾** per le risorse del progetto; dopo una linea a puntini, i comandi che i plugin agganciano alla barra (qui «Statistiche dell'asset»).
- **Vista 3D**, con una pulsantiera sovrapposta su una riga:
  - lazo (facce sulle mesh, punti sulle nuvole) e lazo sugli spigoli, modi del lazo, annulla selezione;
  - viste predefinite, adatta alla scena o alla selezione, vista predefinita, modo di disegno (tre pulsanti combinabili, come oggi);
  - nuova annotazione: con una selezione apre il pannello per crearla, senza arma il lazo e lo apre quando il lazo si chiude;
  - in fondo, Interroga: con un layer GIS selezionato, il clic su un elemento ne mostra le proprietà.

  In alto a destra c'è l'orientamento (N, E, Z); in basso al centro, solo quando un plugin ha evidenziato qualcosa, un'etichetta che lo dice e con la ✕ lo toglie; in basso a sinistra i conteggi dell'asset selezionato (niente se non c'è un asset 3D selezionato).
- **Colonna destra:** l'albero dei progetti, sempre visibile; l'occhio mostra o nasconde un layer, il tasto destro apre le sue azioni di gestione, mentre quelle sull'aspetto stanno nel pannello Proprietà del layer. Sotto, una striscia di icone stile Blender con otto pannelli: Proprietà del layer, CityObject, Annotazione, Risultati lazo, Annotazioni USAP, Mappa 2D, Concetti semantici e, in fondo, Log.
- **Riga di log in basso:** l'ultimo messaggio e i contatori di avvisi ed errori; un clic apre il pannello Log. Un nuovo avviso accende un punto sull'icona del Log. A destra ci sono i loghi, con quello del CNR a colori invertiti.

**Comandi nel pannello a destra.** Le finestre dei comandi si aprono nel pannello della colonna destra, non sopra la vista. In cima alla striscia compare un'icona ambra; le altre icone si spengono e non si apre un secondo comando finché quello aperto non è concluso. Un passo interno al comando si apre sopra il precedente e, chiuso, riporta indietro. Finché il comando è aperto la selezione non cambia (lazo, modi del lazo e riga dell'albero sono bloccati), tranne nei pannelli dei plugin. Restano finestre mobili importa/esporta, progetto, Preferenze e plugin, Info, il visualizzatore a 360° e le finestre di sistema per i file.

**Stile.**
- Sfondo della vista 3D in gradiente da #ffff7f (in alto) a #005500 (in basso), personalizzabile come oggi in City3D.
- Grigi di VS Code, da #1e1e1e a #323233; selezione ed evidenziazione in blu tenue (#264f78); comando in corso in ambra tenue (#c8963e).

## File

| File | Contenuto |
|---|---|
| `index.html` | la pagina: barre, vista, colonna destra e pannelli fissi |
| `layout.js` | le parti nuove: icone SVG, pulsantiere, striscia dei pannelli |
| `menus.js`, `dialogs.js` | la fotografia della release: menu, azioni dei layer e finestre, con dati sintetici |
| `proposta.js` | le modifiche della proposta applicate alla fotografia: menu, azioni dei layer, finestre rifatte, finestre che restano mobili |
| `app.js` | il motore |
| `style.css` | il tema |
| `assets/logos/` | i loghi in basso a destra (stessi di City3D, con quello CNR a colori invertiti) |

## Link diretti

- `#panel=log`: apre un pannello (`props`, `cityobject`, `annotation`, `lasso`, `usap`, `map`, `concepts`, `log`).
- `#dlg=preferences`: apre una finestra; `#dlg=geomColor` apre un comando nel pannello.
- `#menu=Servizi/Calcola`: apre un menu; vale anche `#menu=Importa`.
- `#highlight`: mostra l'evidenziazione lasciata da un plugin, con la sua etichetta.
- `#tour`: avvia il tour della nuova disposizione.

Si combinano con `&`.

## La proposta in sintesi

Riferimento: release `366fdda` (17/11/2026). I rimandi al codice (`file:riga`) sono a quella release.

La proposta riorganizza l'interfaccia senza aggiungere funzioni: tutto ciò che il mockup mostra esiste già in City3D. Dove cambia anche il comportamento, la sezione lo dice. Questo non dovrebbe includere lo sviluppo di nuove funzioni. In caso sia così, va concordato quanto è fattibili nei termini del contratto.

| Oggi | Proposta |
|---|---|
| Otto menu: File, Geometria, Dati, Annotazioni, Vista, Servizi, Plugin, Info | Cinque menu: Progetto, Visualizza, Servizi, Plugin, Info. I comandi di Geometria, Dati e Annotazioni vanno altrove (vedi «Menu tolti»). |
| Finestre modali sopra la vista | Le finestre dei comandi si aprono nel pannello a destra e la vista resta libera |
| Lazi, modi di selezione e viste sparsi fra barre e menu | Una pulsantiera sulla vista 3D |
| Pannelli agganciabili; il pannello informativo ha tre schede | Una striscia di icone sotto l'albero, un pannello per icona |
| Le stesse azioni dei layer nel pannello Proprietà e nel tasto destro | Aspetto e azioni importanti nel pannello, gestione nel tasto destro |
| Set di annotazioni `.ant` accanto al pacchetto USAP | Solo il pacchetto USAP |

**Criterio.** Ogni comando ha un solo posto, il più immediato. Le strade doppie verso lo stesso comando escono.

## Comandi nel pannello a destra

**Oggi.** Quasi tutte le finestre sono modali: finché sono aperte la vista non risponde. In `mainwindow.cpp` ci sono 49 `exec()`, più le chiamate statiche a `QFileDialog`, `QColorDialog`, `QInputDialog` e `QMessageBox`.

**Proposta.** Il contenuto delle finestre dei comandi va nel pannello della colonna destra. La vista 3D non è mai coperta e resta utilizzabile per zoom, pan e rotazione.

1. **Icona del comando.** All'apertura di un comando compare in cima alla striscia un'icona temporanea, in ambra, e il pannello mostra il comando.
2. **Pannello bloccato.** Le altre icone si spengono: finché il comando non si conclude (OK, Annulla o ✕) non si cambia pannello.
3. **Un comando alla volta.** Menu, pulsantiere, tasto destro sull'albero e pulsanti dei pannelli restano visibili, ma non aprono un secondo comando. Un clic su un comando fa lampeggiare l'icona ambra, e la riga di log ricorda di concludere quello aperto. Vale anche per le finestre mobili.
4. **Cosa resta libero:** navigazione della vista, viste predefinite, «Adatta alla scena» e «Adatta alla selezione», modo di disegno, visibilità dei layer (occhio), scorrimento e lettura dell'albero.
5. **Selezione bloccata.** Mentre un comando è aperto la selezione non cambia: sono bloccati il lazo, il modo del lazo, «Annulla selezione» e il passaggio a un'altra riga dell'albero. Uno strumento di selezione armato all'apertura si spegne. Il comando lavora sul layer e sugli elementi selezionati all'apertura, e il pannello indica il layer.
   - **Perché.** Diversi comandi copiano la selezione all'apertura e la scrivono più tardi: oggi è sicuro solo perché le loro finestre sono modali. In un pannello non modale, un nuovo lazo lascerebbe il comando a scrivere una selezione che l'utente non vede più.
     - Nuova annotazione legge la selezione all'apertura (`edit_selection_annotations`, `mainwindow.cpp:7017`) e la passa alla finestra (`mainwindow.cpp:7134`), che la conserva in `m_faces` e la scrive con «Crea dalla selezione» (`selection_annotations_dialog.cpp:678`). Oggi la finestra è modale (`mainwindow.cpp:7227`), e il flusso guidato spegne apposta il lazo prima di aprirla (`mainwindow.cpp:10388`).
     - «Modifica elementi…» dell'assessment, nel pannello Annotazione, copia gli elementi selezionati (`info_panel.cpp:886`) prima della scelta Sostituisci / Aggiungi / Rimuovi (`info_panel.cpp:916`).
     - Cambiare riga nell'albero cambia l'asset di riferimento. `onSelectionChanged` rilegge la selezione dei pannelli proprio per non scrivere gli id sull'asset sbagliato (`mainwindow.cpp:5435`), e aggiorna progetto attivo, mappa, legenda, istogramma e voci di menu abilitate.
   - **Eccezione: pannelli dei plugin.** Con un plugin aperto la selezione degli elementi resta libera; l'albero resta bloccato. È una scelta della release che si conserva: il pannello di un plugin è già non modale e segue la selezione di proposito (`mainwindow.cpp:14701`), tranne durante l'esecuzione (`plugin_run_widget.cpp:485`).
6. **Passi interni.** Un passo interno al comando, per esempio «Nuovo CityObject…» dentro «Nuova annotazione», si apre nello stesso pannello sopra il precedente. L'intestazione mostra il percorso; chiudendo il passo si torna al precedente.
7. **Conferme ed esiti.** Stanno nel pannello del comando, non in una finestra a parte. Esempio: «Rimuovere 'catania.obj' dal progetto?».
8. **Ritorno.** Alla conclusione torna il pannello che era selezionato prima del comando.

**Restano finestre mobili:**

| Categoria | Finestre |
|---|---|
| Importa | Carica mesh, Carica nuvola di punti, Importa CityGML, Apri dataset annotato, Carica raster, Carica layer GIS, Carica immagini sferiche, Immagini sferiche…, Carica dal datalake, e Carica valori (CSV, TXT) dalle Proprietà dell'asset. Anche i loro passi successivi: CRS del file, copia nel progetto, livello di dettaglio, variabile NetCDF, colore per attributo, esito. |
| Esporta | Esporta progetto (.zip), Screenshot, Inventario di una cartella |
| Progetto | Nuovo progetto, Apri progetto, Chiudi progetto, Verifica file orfani |
| Applicazione | Preferenze, Gestione plugin (con la sua installazione da file) |
| Info | Licenza, Guida introduttiva |
| Visualizzatore a 360° | l'immagine sferica navigabile |

Restano native le finestre del sistema operativo per scegliere file e cartelle («Sfoglia…», «Salva log…», nuovo pacchetto USAP, apertura di un pacchetto USAP). Una finestra aperta da una finestra mobile resta mobile: per esempio la scelta del colore dalle Preferenze, o i passi successivi di un'importazione.

**Passano nel pannello:**

| Da dove si aprono | Comandi |
|---|---|
| Pulsantiera della vista | Nuova annotazione…, l'esito di Interroga |
| Passi interni ai comandi di annotazione | Esito della creazione, Nuovo CityObject, metadati, eliminazione, assessment, elementi, attributo generico, proprietà strutturata |
| Servizi | Ombreggiatura, Pendenza |
| Plugin | I comandi dei plugin (per esempio Statistiche dell'asset) e il loro esito; «Inventario di una cartella» sta in Esporta |
| Proprietà del layer e tasto destro sull'albero | Colore uniforme (da Aspetto), Opacità, Imposta CRS, Rimuovi, Dimensione dei punti, Decimazione, Altezza, Livello di dettaglio, Colora per attributo, Salva in USAP |

**Implementazione.**
- Il contenuto di ogni `QDialog` diventa un widget non modale, ospitato in un `QStackedWidget` del pannello destro.
- Le finestre di oggi sono disegnate per 400–800 px di larghezza: nel pannello vanno ridisposte in colonna. Nel mockup è rifatta solo Nuova annotazione; le altre sono ancora quelle della release (vedi «Punti aperti»).

## Pulsantiera in alto

**Oggi.** La barra degli strumenti ha Carica dal datalake, Apri progetto, Carica mesh, Carica nuvola di punti e Salva la sessione con nome. La barra Plugin (`mainwindow.cpp:14327`) ha «Esegui plugin…», «Aggiungi plugin…» e i comandi dei plugin con superficie `toolbar`.

**Proposta.**
- **Progetto:** Nuovo progetto, Apri progetto, Salva progetto. Sono i nomi completi delle voci del menu Progetto: così si distinguono da Importa ed Esporta, che riguardano le risorse del progetto.
- **Importa ▾:** Carica mesh, Carica nuvola di punti, Importa CityGML, Apri dataset annotato (CityGML + USAP), Carica raster (GeoTIFF, NetCDF), Carica layer GIS, Carica immagini sferiche (CSV), Immagini sferiche…, e dopo una linea Carica dal datalake. Raccoglie i caricamenti oggi sparsi fra File, Geometria, Dati e Annotazioni. «Immagini sferiche…», l'elenco delle immagini caricate, arriva dal menu Vista e sta subito dopo il caricamento delle immagini sferiche.
- **Esporta ▾:** Esporta progetto (.zip), Screenshot, e il sottomenu Plugin › di File › Esporta.
- **Comandi dei plugin:** dopo Esporta, separati da una linea verticale a puntini, i comandi con superficie `toolbar`. Come oggi hanno il testo accanto all'icona, perché un plugin può non avere un'icona propria. «Esegui plugin…» e «Aggiungi plugin…» non ci sono (vedi «Menu Plugin»).

**Perché Esporta › Plugin resta.**
- Per i comandi di tipo `exporter` (un formato di esportazione) è l'unico accesso: non compaiono nel menu Plugin.
- Una routine con superficie `export` ci compare perché l'autore la presenta come un'esportazione. Se dichiara anche `menu`, compare in tutti e due i posti per scelta dell'autore: è il caso di «Inventario di una cartella».

**Implementazione.** Oggi il sottomenu dei plugin è costruito su `menuExport` (`mainwindow.cpp:14384` e `14431`): va agganciato al menu Esporta della pulsantiera, altrimenti gli esportatori dei plugin restano senza accesso.

## Vista 3D

**Pulsantiera della vista**, su una riga, da sinistra:
- Selezione a lazo e Selezione a lazo (spigoli); i modi del lazo (Sostituisci, Aggiungi, Togli); Annulla selezione;
- viste predefinite (Alto, NE, S, O), Adatta alla scena, Adatta alla selezione, Vista predefinita; Solido, Wireframe, Vertice;
- Nuova annotazione…;
- Interroga.

Sopra la vista: in alto a destra l'orientamento interattivo, sempre visibile; in basso a sinistra i conteggi dell'asset selezionato; in basso al centro, solo quando serve, l'etichetta dell'evidenziazione dei plugin.

**Lazo: due strumenti invece di tre.**
- **Oggi.** Tre strumenti: Selezione a lazo (area), (linea) e (punti) (`actionAdd_area_annotation`, `actionAdd_line_annotation`, `actionAdd_point_annotation`). Si seleziona però un asset alla volta, e la scelta fra area e punti dipende solo dal tipo di asset.
- **Proposta.** «Selezione a lazo» seleziona facce su una mesh e punti su una nuvola: è la logica che `start_new_annotation()` già usa per scegliere lo strumento (`mainwindow.cpp:10338`). «Selezione a lazo (spigoli)» è l'attuale «(linea)» e resta a parte, solo per le mesh: con una nuvola selezionata è disabilitato.

**Modo del lazo: non è uno strumento.**
- **Oggi.** «Selezione singola», «additiva» e «sottrattiva» (`actionSingle_selection`, `actionAdditive_selection`, `actionSubtractive_selection`) dicono come il prossimo lazo cambia la selezione: la sostituisce, aggiunge gli elementi o li toglie (`SelectionType`, `selectiontools/selected_elements.h:25`, applicato in `LassoPointSelectionStyle.cpp:481`). Il nome «singola» e l'icona a freccia fanno pensare a una selezione con un clic, che non esiste; e il modo attivo è evidenziato come il lazo attivo, quindi sembrano due strumenti accesi insieme.
- **Proposta.** I modi si chiamano «Sostituisci la selezione», «Aggiungi alla selezione» e «Togli dalla selezione», e formano un gruppo a parte subito dopo i lazi. L'icona di «Sostituisci» è un quadrato pieno. Il blu pieno indica solo lo strumento attivo; il modo del lazo e il modo di disegno mostrano la scelta in grigio con una linea sotto. Il modo del lazo resta sbiadito finché un lazo non è attivo.

**Modo di disegno.** Solido, Wireframe e Vertice (`actionSolid`, `actionWireframe`, `actionVertex`) passano dal menu Vista alla pulsantiera. 

**Nuova annotazione: un solo pulsante.** *Da valutare*. Idea di base: il pulsante è usato per creare una _nuova_ annotazione, mentre la modifica di annotazioni esistenti passa dai pannelli del lazo.
- **Oggi.** Due comandi portano alla stessa finestra, «Annotazioni della selezione» (`SelectionAnnotationsDialog`). «Nuova annotazione» (`start_new_annotation`, `mainwindow.cpp:10290`) svuota la selezione, arma il lazo adatto all'asset e apre la finestra quando il lazo si chiude (`mainwindow.cpp:10395`). «Dati › Modifica le annotazioni della selezione» (`edit_selection_annotations`, `mainwindow.cpp:7011`) apre la finestra sulla selezione che c'è già, per esempio una fatta con più lazi in «Aggiungi alla selezione».
- **Proposta.** Un solo pulsante, «Nuova annotazione…»: con una selezione apre il pannello su quella; senza, arma il lazo e apre il pannello quando il lazo si chiude. La finestra è descritta in «Finestra Nuova annotazione».
- **Conseguenza.** Oggi Nuova annotazione svuota apposta la selezione precedente, perché un lazo vecchio non passi per quello nuovo (`mainwindow.cpp:10350`). Con il pulsante unico la selezione presente viene usata; è però visibile, con il conteggio nella vista, e «Annulla selezione» è accanto.

**Interroga.**
- **Oggi.** «Interroga/modifica con il mouse» (`actionQuery_edit_with_mouse`, `mainwindow.cpp:10020`) sta nella barra delle annotazioni e in Annotazioni › Strumenti. È attiva solo con un layer GIS o un set `.ant` selezionato nell'albero (`mainwindow.cpp:13211`). Su un layer GIS il clic su un elemento ne mostra le proprietà in una finestra (`genericvtkwidget.cpp:4393`).
- **Proposta.** È l'ultimo pulsante della pulsantiera ed esce dal menu. Fa gruppo con i lazi: uno solo attivo alla volta, come oggi (`mainwindow.cpp:10048`), ed è blu quando è attivo. Lavora solo sui layer GIS, perché i set `.ant` escono dal prodotto; è spento se nell'albero non è selezionato un layer GIS, e il suggerimento lo dice. L'esito va nel pannello: un nuovo clic lo sostituisce e lo strumento resta attivo. L'esito non usa la selezione, quindi non la blocca. Come oggi, attivare o spegnere Interroga svuota la selezione del lazo (`mainwindow.cpp:10022`).

**Conteggi dell'asset selezionato.**
- **Oggi.** `updateVertexCellCount()` (`mainwindow.cpp:14019`) scrive nella barra di stato i conteggi dell'asset selezionato, o dell'asset della riga selezionata. Con il progetto selezionato, o nessuna riga, mostra il totale degli asset visibili: «Asset visibili (totale): … vertici e punti, … facce».
- **Proposta.** L'etichetta va in basso a sinistra nella vista e mostra sempre i conteggi dell'asset selezionato; senza un asset 3D selezionato non compare. Togliere il totale è un cambio di comportamento: il totale somma in un solo numero vertici delle mesh e punti delle nuvole, e non riguarda l'oggetto su cui si lavora.

**Evidenziazione dei plugin: un'etichetta nella vista.**
- **Oggi.** Un plugin può evidenziare oggetti o elementi nella vista 3D (API 1.3), e l'evidenziazione resta dopo la chiusura del comando. Si toglie con Plugin › Togli evidenziazione dei plugin (`actionClearPluginHighlight`, `mainwindow.cpp:14283`), abilitata solo quando c'è un'evidenziazione, o con «Togli evidenziazione» nell'esito del plugin (`plugin_run_widget.cpp:204`), che serve solo finché il modulo è aperto.
- **Proposta.** Un'etichetta in basso al centro della vista, «● Evidenziazione dei plugin ✕», visibile solo quando c'è un'evidenziazione; la ✕ la toglie. Sostituisce sia la voce di menu sia il pulsante nell'esito. Si accende e si spegne con il segnale che oggi abilita la voce di menu (`notify_plugin_highlight`, `mainwindow.cpp:7907`). Il segnale dice solo se c'è un'evidenziazione: l'etichetta non dice di quale plugin né quanti elementi, perché la release non lo registra.

## Proprietà del layer e tasto destro

**Oggi.** Il pannello Proprietà del layer e il tasto destro sull'albero mostrano la stessa lista di azioni (`MainWindow::layer_actions`, `mainwindow.cpp:15400`). Sui dataset 3D compaiono i nomi lunghi dei vecchi menu («Imposta colore geometria»), perché vengono riusate le azioni dei menu con il loro testo (`mainwindow.cpp:15425-15434`).

**Proposta.** Ogni azione sta in un solo posto. Nel pannello stanno le azioni sull'aspetto e quelle importanti, sempre a vista; nel tasto destro quelle di gestione: mostra/nascondi, inquadra, rinomina, CRS, sposta su/giù, rimuovi, chiudi. Sotto le azioni, il pannello ricorda che le altre sono nel tasto destro.

| Tipo di layer | Pannello Proprietà del layer | Tasto destro sull'albero |
|---|---|---|
| Progetto | — | Nascondi, Imposta CRS…, Chiudi progetto |
| Mesh | Aspetto, Opacità…, Carica valori (CSV, TXT)… | Nascondi, Inquadra questo layer, Rinomina…, Imposta CRS…, Sposta su, Sposta giù, Rimuovi |
| Nuvola di punti | Aspetto, Opacità…, Dimensione dei punti…, Decimazione…, Carica valori (CSV, TXT)… | come la mesh |
| Campo scalare | Salva in USAP… | Nascondi, Inquadra questo layer, Sposta su, Sposta giù |
| Layer GIS | Colora per attributo… | Nascondi, Inquadra questo layer, Rinomina…, Sposta su, Sposta giù, Rimuovi |
| CityGML | Opacità…, Livello di dettaglio…, Oggetti e attributi… | Nascondi, Inquadra questo layer, Rimuovi |
| Raster | Opacità…, Altezza… | Nascondi, Inquadra questo layer, Sposta su, Sposta giù, Rimuovi |
| Immagini sferiche | — | Nascondi, Inquadra questo layer, Sposta su, Sposta giù, Rimuovi |

Tutti i tipi di layer usano i nomi brevi di `layerinfo::action_label` (`utils/layer_info.cpp:88`). Decimazione vale solo per le nuvole `.las`/`.laz` (il controllo è a `mainwindow.cpp:10490`).

**Aspetto dell'asset.**
- **Oggi.** Un asset ha tre aspetti che si escludono a vicenda (`viewer_project.cpp:4793-4825`): colore uniforme, scelto con «Colore…»; colori del file, cioè i colori per vertice letti dal file (valgono anche per le nuvole, per esempio i LAS con RGB); texture, solo per gli OBJ il cui `.mtl` indica un'immagine accanto al file. Il colore sta nelle Proprietà del layer, gli altri due nel menu Dati; se l'asset non ha colori o texture lo si scopre solo dopo il clic, con un messaggio.
- **Proposta.** Nelle Proprietà di mesh e nuvole, un controllo esclusivo **Aspetto: Colore uniforme… | Colori del file | Texture**, grigio come gli altri modi, che prende il posto di «Colore…».
  - «Colore uniforme…» è il «Colore…» di oggi: apre la scelta del colore, e il colore scelto rende uniforme l'aspetto (`changeMeshColor`, `viewer_project.cpp:4793`). Come oggi, non c'è un ritorno al colore uniforme senza sceglierlo.
  - Un'opzione che l'asset non ha resta visibile ma spenta, e il suggerimento dice perché. L'applicazione lo sa prima del clic: l'asset porta con sé `original_point_colors` e `texture`.
  - Sulle nuvole la texture non compare.
  - Resta la domanda di oggi: le annotazioni visibili ricoprono i colori del file, quindi scegliendo «Colori del file» si chiede se nasconderle (`mainwindow.cpp:1123`).

**Campi scalari.**
- **Oggi.** «Carica dati» legge un file CSV o TXT: una finestra chiede separatore, righe da saltare e colonna (`importtextdialog`). Il file diventa un campo scalare, una riga figlia dell'asset selezionato nell'albero (`mainwindow.cpp:3911`). I valori devono essere tanti quante le facce o i vertici dell'asset, altrimenti il file è rifiutato (`viewer_project.cpp:3776`). Con l'occhio acceso il campo colora il suo asset in scala di grigi, con la barra dei colori (`genericvtkwidget.cpp:819-860`). Anche Servizi › Ombreggiatura produce questo tipo di riga. «Salva campo di valori in USAP» scrive un campo nel pacchetto USAP come annotazione, con il suo assessment e i valori, in una sola transazione; se nell'albero è selezionato un campo, lo propone già (`numeric_fields_of`, `mainwindow.cpp:7245`).
- **Proposta.**
  - «Carica valori (CSV, TXT)…» è un'azione di mesh e nuvole nelle Proprietà del layer: il campo nasce sotto l'asset che si ha in mano, senza chiedere quale. Non va in Importa, dove avrebbe comunque bisogno di un asset selezionato; le sue finestre restano mobili come gli altri import.
  - «Salva in USAP…» è un'azione del campo scalare. Oggi la riga ha solo Mostra/Nascondi, Inquadra e Sposta (`utils/layer_info.cpp:69-70`).
  - «Interroga campi di valori» diventa una sezione del pannello Annotazioni USAP (vedi «Pannelli della striscia»): in USAP un campo di valori è un'annotazione.

**Implementazione.**
- Le azioni dei layer sono in `utils/layer_info.cpp:57-83`: la lista di `layerinfo::actions_for` va divisa in due, pannello e tasto destro, e le tre opzioni di Aspetto vanno aggiunte per i soli dataset 3D (`utils/layer_info.cpp:63-65`).
- `Kind::Dataset` vale sia per le mesh sia per le nuvole: per dare Dimensione dei punti e Decimazione solo alle nuvole va separato il tipo, oppure va filtrata la lista in base al tipo di dataset.
- Le azioni del menu Geometria restano: escono solo da `menuGeometry`, perché il pannello e l'albero le usano già (`mainwindow.cpp:15425-15434`).

## Pannelli della striscia

**Oggi.** Pannelli agganciabili; il pannello informativo raccoglie in tre schede CityObject, Annotazione e Risultati lazo; Annotazioni USAP è una finestra del menu Annotazioni.

**Proposta.** Sotto l'albero dei progetti, una striscia di icone (stile Blender); un clic mostra il pannello. Gli otto pannelli sono Proprietà del layer, CityObject, Annotazione, Risultati lazo, Annotazioni USAP, Mappa 2D, Concetti semantici e, in fondo, Log.
- Le tre schede del pannello informativo diventano tre icone separate.
- Il Log è l'ultima icona; un nuovo avviso accende un punto sull'icona. La riga di log in basso mostra l'ultimo messaggio con i contatori di avvisi ed errori, come oggi la barra di stato; un clic apre il pannello Log.
- Nello stesso posto si aprono i comandi (vedi «Comandi nel pannello a destra»).

CityObject, Annotazione, Mappa 2D, Concetti semantici e Log hanno il contenuto di oggi; Proprietà del layer cambia solo nelle azioni (vedi «Proprietà del layer e tasto destro»).

**Risultati lazo.**
- **Esce «Cerca in USAP».** Rifà la ricerca sulla selezione di adesso (`LassoResultsPanel::refresh`, `dialogs/lasso_results_panel.cpp:285`), ma la ricerca parte già da sola: quando cambiano la selezione, l'asset o il pacchetto (`set_shared_selection`, `set_asset_filter`, `set_package`), e dopo ogni scrittura di City3D nel pacchetto: creazione, modifiche dal pannello Annotazione, «Salva in USAP…», plugin (`refresh_usap_views`, `mainwindow.cpp:6121`; `info_panel.cpp:1113`). Ogni ricerca riapre il pacchetto dal disco (`run_query`, riga 440), quindi una modifica fatta da un altro programma si vede al lazo successivo.
- **Si collega da solo.** Oggi è la voce Dati › Annotazioni della selezione corrente a collegare il pannello al pacchetto USAP in uso e a verificare l'asset (`mainwindow.cpp:6881-6911`). Aperto dall'icona della striscia, il pannello deve farlo da solo, altrimenti resta vuoto.

**Annotazioni USAP.**
- **Oggi.** Una finestra modale (`UsapDialog`, aperta con `exec()` a `mainwindow.cpp:7541`) con la riga del pacchetto (percorso, Sfoglia…, Apri/Ricarica), l'elenco delle annotazioni del pacchetto (quella scelta si evidenzia nella vista), «Esporta annotazioni della mesh», che scrive nel pacchetto il set `.ant` selezionato con il CityObject e la classe semantica indicati, e «Importa nel progetto», che trasforma le annotazioni del pacchetto in set `.ant`.
- **Proposta.** Un pannello fisso con due sezioni:
  - **Annotazioni:** l'elenco delle annotazioni del pacchetto in uso nel progetto e i dettagli di quella scelta, che si evidenzia nella vista;
  - **Campi di valori:** il contenuto di oggi di «Interroga campi di valori USAP» (`open_value_field_query`, `mainwindow.cpp:7470`). Dopo «Salva in USAP…» la sezione si aggiorna, come oggi la finestra (`mainwindow.cpp:7461`).
- **Escono** «Esporta annotazioni della mesh», con i campi CityObject e Classe semantica che servono solo a quella, e «Importa nel progetto»: lavorano sui set `.ant`. Esce anche la riga del pacchetto: il pannello mostra il pacchetto in uso nel progetto, cioè quello su cui la release apre già la finestra (`mainwindow.cpp:7515`): ripreso da `project.json` all'apertura, quello del dataset annotato, o creato con la prima annotazione. Non si possono più sfogliare pacchetti che non sono del progetto.
- **Implementazione.** Il `QDialog` diventa un widget non modale; la finestra dei campi di valori lo è già (`mainwindow.cpp:7487`). Senza Apri/Ricarica il pannello segue da solo il pacchetto in uso e lo rilegge dopo ogni scrittura: va aggiunto a `refresh_usap_views` (`mainwindow.cpp:6121`), che oggi aggiorna Risultati lazo e la tabella delle annotazioni ma non questa finestra, perché è modale.

## Finestra Nuova annotazione

**Oggi.** `SelectionAnnotationsDialog` (`dialogs/selection_annotations_dialog.cpp`), 760×560:
- tabella a cinque colonne (Uid, Etichetta, Classe, Stato, Confidenza) e riquadro dei dettagli della riga scelta;
- una riga per creare: Concetto, Etichetta, «Crea dalla selezione»; sotto, la riga CityObject: gml:id e «Nuovo CityObject…»;
- pulsanti sulla riga scelta: Modifica metadati…, Aggiungi selezione alla membership, Rimuovi selezione dalla membership, Elimina….

**Proposta.** La finestra serve solo a creare un'annotazione dalla selezione e si chiama **Nuova annotazione**. Contiene, nell'ordine:
- in alto, la selezione su cui si lavora («Selezione lazo su 'catania.obj': …»);
- **CityObject:** il gml:id, facoltativo. All'apertura è proposto l'oggetto scelto nel pannello CityObject, come oggi (`mainwindow.cpp:7226`); si può scrivere a mano, o creare con «Nuovo CityObject…»;
- **Concetto:** proposto dalla classe del CityObject e sempre modificabile, come oggi (`set_city_object`, riga 522; per un oggetto nuovo, riga 495). Senza CityObject si sceglie dall'elenco;
- **Etichetta**, facoltativa;
- **«Crea dalla selezione»**.

Restano i messaggi di oggi: la nota sulla nuvola decimata, la nota sul CityObject nuovo, l'avanzamento.

**Escono la tabella e i suoi comandi.** Ripetevano un percorso che la release ha già: nel pannello Risultati lazo la riga scelta aggiorna il pannello Annotazione, e un doppio clic lo apre (`info_panel.cpp:1096-1112`). Lì ci sono Modifica metadati…, Elimina…, Nuovo assessment…, Modifica assessment…, Modifica elementi… (che sostituisce, aggiunge o toglie gli elementi della selezione) e Mostra CityObject (`info_panel.cpp:150-281`).

**È l'unico punto di creazione da una selezione.** Nell'interfaccia nessun altro comando crea un'annotazione da una selezione (`bridge.annotate`, `selection_annotations_dialog.cpp:875`). Le annotazioni dei campi di valori nascono invece da «Salva in USAP…» e dai plugin che salvano valori (`plugins/plugin_managed_apply.cpp:234`).

## Menu Progetto (oggi File)

In City3D progetto e sessione sono lo stesso file, `project.json`, nella cartella del progetto; anche i requisiti li trattano così (US-PROJECT-01, US-PROJECT-02). Il file contiene l'elenco dei dataset e, nel blocco `session`, lo stato di lavoro: vista, finestre, visibilità, colori, ordine dei layer, collegamento CityGML–USAP. «Apri progetto» legge il `project.json` della cartella scelta; Ctrl+S scrive proprio in quel file (`save_session_here`, `mainwindow.cpp:9605`). Per questo il menu si chiama **Progetto** e la sessione non compare più come concetto a parte.

| Voce di oggi | Nel codice | Esito | Motivo |
|---|---|---|---|
| Nuovo progetto | `actionNew_view` | resta | |
| Apri progetto | `actionLoad_project` | resta | |
| Apri un file di progetto ... | `actionOpen_project_file`, `mainwindow.cpp:9751` | tolta | Serve solo a riaprire le copie di «Salva la sessione con nome», che esce. Un progetto fuori dalla cartella di lavoro si apre cambiando la cartella di lavoro, nelle Preferenze o nella finestra di «Apri progetto». |
| Carica dal datalake | `actionLoad_Datalake` | spostata | menu Importa della pulsantiera |
| Salva la sessione | `actionSave_session_here`, `mainwindow.cpp:979` | resta come **Salva progetto** (Ctrl+S) | progetto e sessione sono lo stesso file |
| Salva la sessione con nome ... | `actionSave_Project`, `mainwindow.cpp:9430` | tolta | Una sessione salvata a parte è la vecchia vista sui dati di oggi: quando la si riapre, un file cambiato si riconosce solo dalla dimensione (`session_state.cpp:176`). I percorsi dei dataset sono relativi alla cartella del progetto (`viewer_project.cpp:897`), quindi una copia altrove potrebbe non ritrovarli (non verificato). Per una copia completa, dati compresi, c'è «Esporta progetto (.zip)». Esce anche dal tasto destro sul progetto. |
| Chiudi progetto | `actionClose_project`, `mainwindow.cpp:12964` | resta | |
| Esporta › Esporta progetto (.zip), Plugin › | `menuExport` | spostato | menu Esporta della pulsantiera, con lo stesso sottomenu Plugin (vedi «Pulsantiera in alto») |
| Imposta cartella di lavoro | `actionSet_working_folder`, `mainwindow.cpp:10681` | tolta | scrive la stessa impostazione di Preferenze › Cartelle |
| Preferenze... | `actionPreferences`, `mainwindow.cpp:784` | resta, in una sezione a parte | |
| Imposta CRS di progetto | `actionSet_project_CRS`, `mainwindow.cpp:11163` | tolta | Si cambia con «Imposta CRS…» nel tasto destro sulla riga del progetto (`layerinfo::actions_for`, `Kind::Project`). Il CRS in alto a destra è solo da leggere. Le Preferenze hanno solo il CRS proposto ai nuovi progetti, che è un'altra cosa. |
| Verifica file orfani ... | `actionCheck_project_for_orphan_files`, `mainwindow.cpp:11158` | resta | Serve perché togliere un dataset dal progetto non cancella il file, che resta nella cartella del progetto (`mainwindow.cpp:10956` per le geometrie, `mainwindow.cpp:15629` per i layer GIS). Oggi elenca anche file in uso: da correggere (ticket 05). |
| Screenshot ... | `actionTake_screenshot` | spostata | menu Esporta della pulsantiera |

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

**Messaggi del salvataggio.** Parlano del progetto, non della sessione né di `project.json`, che è solo un pezzo del progetto. Come oggi, Ctrl+S non apre finestre: scrive una riga nel log.

| Dove | Oggi | Proposta |
|---|---|---|
| Ctrl+S, riga del log (`mainwindow.cpp:9627`) | «Sessione salvata in C:\…\catania_demo\project.json: la sessione registra dove sono i dati, non li copia di nuovo.» | «Progetto 'catania_demo' salvato in C:\…\catania_demo.» |
| Errore (`mainwindow.cpp:9622` e `9594`) | titolo «Salva la sessione»; «La sessione NON è stata salvata in: …» | titolo «Salva progetto»; «Il progetto NON è stato salvato in: …» |
| Chiusura con modifiche non salvate (`mainwindow.cpp:9556-9561`) | titolo «Salva la sessione»; «La sessione di '…' è cambiata dall'ultimo salvataggio.» (al plurale «Le sessioni di … sono cambiate…»); «Salvarla prima di chiudere? La sessione registra dove sono i dati e come sono mostrati; non li copia.» | titolo «Salva progetto»; «Il progetto '…' è cambiato dall'ultimo salvataggio.» (al plurale «I progetti … sono cambiati…»); «Salvarlo prima di chiudere?» |

Anche le righe del log all'apertura che iniziano con «Sessione:» (`mainwindow.cpp:2177-2505`) diventano «Progetto:». I messaggi di «Salva la sessione con nome» (`mainwindow.cpp:9465-9476`) escono con il comando.

## Menu Visualizza (oggi Vista)

Il menu si rinomina in **Visualizza**. Escono le voci già coperte dalla pulsantiera della vista o dalla striscia dei pannelli.

| Voce di oggi | Nel codice | Esito | Motivo |
|---|---|---|---|
| Mostra assi | `actionShow_Axes` | resta | |
| Overlay assi interattivo | `actionInteractive_Axis_Overlay` | tolta | l'orientamento interattivo è sempre visibile in alto a destra nella vista |
| Mostra barra colore | `actionShow_colorbar` | resta | |
| Mostra slider | `actionShow_Slider` | resta | |
| Vedi da… › Alto, Ovest, Sud, Nord-est | `menuView_from` | tolto | pulsanti Alto, NE, S, O della vista |
| Imposta colore di background | `actionSet_background_color`, `mainwindow.cpp:8324` | tolta | Scrive gli stessi due colori di Preferenze › Visualizzazione (in alto e in basso), che resta l'unico posto; per uno sfondo a tinta unita li si imposta uguali. |
| Solido, Wireframe, Vertice | `actionSolid`, `actionWireframe`, `actionVertex` | tolte | pulsanti della vista |
| Mostra proprietà del layer | `toggleViewAction()` del dock, `mainwindow.cpp:14831` | tolta | icona della striscia |
| Mostra pannello informativo | `actionShow_InfoPanel`, `mainwindow.cpp:5775` | tolta | icone CityObject, Annotazione, Risultati lazo |
| Mostra istogramma (PDF) | `actionShow_PdfDock`, `mainwindow.cpp:673` | resta | da decidere (vedi «Punti aperti») |
| Mostra legenda | `actionShowLegend`, `mainwindow.cpp:788` | resta | da decidere (vedi «Punti aperti») |
| Pannelli › … | `mainwindow.cpp:921` | tolto | striscia dei pannelli |
| Adatta la vista alla scena | `mainwindow.cpp:1056` | tolta | pulsante della vista |
| Adatta la vista alla selezione | `mainwindow.cpp:1060` | tolta | pulsante della vista |
| Mostra layer raster | `mainwindow.cpp:1063` | resta | |
| Mostra immagini sferiche | `mainwindow.cpp:1071` | resta | |
| Immagini sferiche… | `mainwindow.cpp:1080` | spostata | menu Importa della pulsantiera |
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

## Menu Servizi

Restano Ombreggiatura e Pendenza; si aggiunge **Calcola › Distanza, Superficie**, che arriva dal menu Geometria (`menuMeasure`: `actionDistance`, `actionSurface`). Le finestre di Ombreggiatura e Pendenza si aprono nel pannello. Il loro futuro è un punto aperto (vedi «Punti aperti»).

```
Ombreggiatura
Pendenza
─────────────
Calcola ›   Distanza
            Superficie
```

## Menu Plugin

Ogni plugin dichiara nel suo manifest dove compaiono i suoi comandi. Per le routine, il tipo più comune, il posto lo scelgono le «superfici» (`docs/PLUGIN-ACCESS-POINTS.md:50-54`): un comando può dichiararne più d'una, e senza dichiarazione vale `menu`. Per gli altri tre tipi il posto è fisso (`mainwindow.cpp:14378-14404`). Nessuna voce può scegliere il menu o il sottomenu: la superficie `menu` mette sempre il comando nel menu Plugin.

| Superficie o tipo | Dove compare il comando oggi | Come si apre oggi |
|---|---|---|
| `menu` (predefinita) | voce del menu Plugin | finestra modale (`run_plugin_command`, `mainwindow.cpp:14721`) |
| `toolbar` | pulsante della barra Plugin | finestra modale |
| `panel` | pannello agganciabile, acceso e spento da Plugin › Pannelli | pannello non modale, aperto finché non lo si chiude |
| `export` | voce di File › Esporta › Plugin | finestra modale |
| `import` | accettata dal manifest, non compare da nessuna parte | — |
| tipo `exporter` (un formato di esportazione) | voce di File › Esporta › Plugin | scelta del file da salvare |
| tipo `connector` (una sorgente di dati esterna) | Plugin › Sorgenti dati esterne | finestra di consultazione |
| tipo `reader` (un formato in lettura) | filtro in più nella scelta del file di Carica mesh e Carica nuvola di punti | — |

Esempio: «Statistiche dell'asset» dichiara `menu`, `toolbar` e `panel`, quindi oggi compare tre volte: nel menu Plugin, nella barra Plugin e in Plugin › Pannelli.

Oggi il menu è ricostruito da `rebuild_plugin_surfaces()` (`mainwindow.cpp:14310`):

| Voce di oggi | Nel codice | Esito | Motivo |
|---|---|---|---|
| Gestione plugin... | `mainwindow.cpp:14316` | resta | |
| Esegui plugin… | `actionRunPlugin`, `mainwindow.cpp:14271` | tolta | Apre una lista di scelta (`PluginCommandPicker`, `run_plugin_from_list`, `mainwindow.cpp:14747`) con gli stessi comandi dell'elenco del menu. |
| Aggiungi plugin… | `actionAddPlugin`, `mainwindow.cpp:14276` | tolta | Apre Gestione plugin e preme subito il suo «Installa da file…» (`show_plugin_manager(true)`, `install_when_shown`, `plugin_manager_dialog.cpp:339`): è lo stesso pulsante. |
| Togli evidenziazione dei plugin | `actionClearPluginHighlight`, `mainwindow.cpp:14283` | tolta | la sostituisce l'etichetta nella vista (vedi «Vista 3D») |
| Elenco dei comandi | `mainwindow.cpp:14406` | resta | È il punto di aggancio `menu` dell'API dei plugin, predefinito per le routine (`docs/PLUGIN-ACCESS-POINTS.md:50`) e citato da US-PLUGIN-02. Ogni comando resta a un clic. |
| Sorgenti dati esterne › | `mainwindow.cpp:14484` | resta | |
| Pannelli › | `mainwindow.cpp:14499` | tolto | Ogni comando di plugin si apre già nel pannello a destra, resta aperto e segue la selezione: il sottomenu sarebbe una seconda strada verso lo stesso pannello. |

Menu Plugin risultante:

```
Gestione plugin...
─────────────
<un comando per ogni plugin attivo con superficie «menu»>
─────────────
Sorgenti dati esterne ›     (se ci sono connettori)
```

**Il pannello del plugin resta.** È richiesto da US-PLUGIN-02 («plugin-provided panel») e il piano dei plugin lo usa: AP-03 (eventi della vista inoltrati al componente di configurazione a pannello aperto), AP-04 (anteprima aggiornata a ogni cambio di parametro), AP-08 («Conferma» / «Scarta» nel pannello), P1 (editor CityGML con superficie `panel` o `toolbar`). Nel nuovo layout è il pannello a destra, dove si apre ogni comando: cade solo il sottomenu che lo accendeva. Perché un plugin che dichiara solo la superficie `panel` resti raggiungibile, quella superficie dà anche la voce nel menu Plugin; i plugin esistenti non vanno modificati.

## Menu Info

Resta com'è: Licenza, Tour dell'interfaccia, Guida introduttiva.

## Menu tolti: Geometria, Dati e Annotazioni

I tre menu restano vuoti ed escono dalla barra. Ogni voce va nel suo posto più immediato.

**Geometria.**

| Voce di oggi | Nel codice | Dove si trova |
|---|---|---|
| Carica mesh | `actionLoad_mesh` | menu Importa della pulsantiera |
| Carica nuvola di punti | `actionLoad_point_cloud` | menu Importa della pulsantiera |
| Imposta colore geometria | `actionSet_geometry_color` | Proprietà del layer, Aspetto › Colore uniforme… |
| Imposta opacità geometria | `actionSet_geometry_opacity` | Proprietà del layer, Opacità… |
| Imposta CRS geometria | `actionSet_geometry_CRS` | tasto destro sull'albero, Imposta CRS… |
| Calcola › Distanza, Superficie | `menuMeasure`: `actionDistance`, `actionSurface` | Servizi › Calcola |
| Rimuovi geometria | `actionRemove_geometry` | tasto destro sull'albero, Rimuovi |
| Decimazione della nuvola... | `actionCloudDecimation`, `mainwindow.cpp:882` | Proprietà del layer, solo nuvole `.las`/`.laz` |
| Dimensione dei punti... | `actionPointSize`, `mainwindow.cpp:888` | Proprietà del layer, solo nuvole (il controllo è a `mainwindow.cpp:895`) |

**Dati.**

| Voce di oggi | Nel codice | Dove si trova |
|---|---|---|
| Carica dati | `actionLoad_data_2`, `mainwindow.cpp:9258` | «Carica valori (CSV, TXT)…» nelle Proprietà di mesh e nuvole |
| Importa CityGML… | `mainwindow.cpp:945` | menu Importa della pulsantiera |
| Apri dataset annotato (CityGML + USAP)… | `mainwindow.cpp:961` | menu Importa della pulsantiera |
| Annotazioni della selezione corrente (USAP)… | `open_selection_annotations`, `mainwindow.cpp:6881` | pannello Risultati lazo della striscia |
| Modifica le annotazioni della selezione (USAP)… | `edit_selection_annotations`, `mainwindow.cpp:7011` | pulsante «Nuova annotazione…» della vista |
| Salva campo di valori in USAP… | `save_value_field`, `mainwindow.cpp:7321` | «Salva in USAP…» nelle Proprietà del campo scalare |
| Interroga campi di valori USAP… | `open_value_field_query`, `mainwindow.cpp:7470` | sezione «Campi di valori» del pannello Annotazioni USAP |
| Carica raster (GeoTIFF, NetCDF)… | `mainwindow.cpp:1041` | menu Importa della pulsantiera |
| Carica immagini sferiche (CSV)… | `mainwindow.cpp:1045` | menu Importa della pulsantiera |
| Colori originali dell'asset | `mainwindow.cpp:1105` | Proprietà del layer, Aspetto › Colori del file |
| Texture dell'asset | `mainwindow.cpp:1139` | Proprietà del layer, Aspetto › Texture |

**Annotazioni.**

| Voce di oggi | Nel codice | Dove si trova |
|---|---|---|
| Nuova annotazione… | `start_new_annotation`, `mainwindow.cpp:10290` | pulsante «Nuova annotazione…» della vista, unito a «Modifica le annotazioni della selezione» |
| Mostra tabella delle annotazioni | `actionView_annotations_table`, `mainwindow.cpp:5527` | esce: lavora solo sui set `.ant` |
| Filtra… | `actionFilter`, `mainwindow.cpp:8145` | esce: lavora solo sui set `.ant` |
| Colora la mesh in base al valore dell'attributo… | `actionColor_mesh_by_attribute_value`, `mainwindow.cpp:8342` | «Colora per attributo…» nelle Proprietà dei layer GIS; sui set `.ant` esce |
| Imposta colore annotazione | `actionSet_annotation_color`, `mainwindow.cpp:11209` | esce con i set `.ant` |
| Strumenti › Interroga/modifica con il mouse | `actionQuery_edit_with_mouse` | pulsante Interroga, l'ultimo della pulsantiera della vista |
| Strumenti › Selezione a lazo, (spigoli), Annulla selezione | `menuTools` | pulsantiera della vista |
| Modalità di selezione › | `menuSelection_mode` | pulsantiera della vista |
| Rimuovi set di annotazioni… | `actionRemove_annotation` | esce con i set `.ant` |
| Carica layer GIS (drappeggiato)… | `actionLoad_GPKG_draped`, `mainwindow.cpp:13298` | menu Importa della pulsantiera |
| Annotazioni USAP… | `open_usap_dialog`, `mainwindow.cpp:7492` | pannello fisso «Annotazioni USAP» della striscia |

## Voci rimosse per la rimozione di `.ant` come input
_(da validare che le funzionalità rimosse non fossero usate per altri scopi non riguardanti `.ant`)_
- escono Mostra tabella delle annotazioni, Filtra…, Imposta colore annotazione e Rimuovi set di annotazioni;
- escono le azioni del set nelle Proprietà del layer (`Kind::Annotation`, `utils/layer_info.cpp:66-68`);
- escono dal pannello Annotazioni USAP «Esporta annotazioni della mesh» e «Importa nel progetto»;
- Interroga lavora solo sui layer GIS;
- Servizi › Pendenza lavora oggi solo su un'annotazione a linea di un set `.ant` e scrive il risultato in un nuovo set (`mainwindow.cpp:9811-9884`): resta senza ingresso né uscita (vedi «Punti aperti»).

## Punti aperti

- **Evidenziazione di «Interroga campi di valori»:** la sezione ha un suo «Togli evidenziazione». Può passare all'etichetta nella vista, come per i plugin?
- **Servizi › Pendenza e Ombreggiatura:** probabilmente da convertire in plugin (vedi mail); per ora il menu Servizi resta com'è.
- **Pulsante unico per le annotazioni:** da decidere con DVISION, in base al loro riscontro (vedi «Vista 3D»).
- **Variante con finestre agganciabili:** una versione alternativa del mockup con i comandi in finestre agganciabili invece che nel pannello fisso. 
