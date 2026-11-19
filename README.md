# Mockup v2 — disposizione stile Blender / Unreal 5

Prima prova della nuova disposizione dell'interfaccia di City3D. Si apre con un doppio clic
su `index.html`. Menu e finestre partono da quelli della release attuale (`366fdda`), con le
modifiche elencate in `../PROPOSTA-UI.md` (raccolte in `proposta.js`).

## Disposizione

- **Barra del titolo:** icona, nome del programma, riduci, ingrandisci, chiudi.
- **Riga dei menu:** i menu attuali; a destra il progetto attivo e il suo CRS (un clic sul CRS
  apre la scelta del sistema di riferimento).
- **Pulsantiera in alto**, solo apertura, importazione ed esportazione: Nuovo, Apri, Salva,
  **Importa ▾** ed **Esporta ▾**; dopo una linea a puntini, i comandi che i plugin agganciano
  alla barra (qui «Statistiche dell'asset»).
- **Vista 3D**, con una pulsantiera sovrapposta su una riga:
  - lazo (facce sulle mesh, punti sulle nuvole) e lazo sugli spigoli, modalità di selezione,
    annulla selezione;
  - viste predefinite, adatta alla scena o alla selezione, vista predefinita, modo di disegno
    (tre pulsanti esclusivi);
  - nuova annotazione, aggiungi o rimuovi la selezione dalla membership, annotazioni della selezione.

  In alto a destra c'è l'orientamento (N, E, Z); in basso al centro, solo quando un plugin ha
  evidenziato qualcosa, un'etichetta che lo dice e con la ✕ lo toglie; in basso a sinistra i conteggi dell'asset
  selezionato (niente se non c'è un asset 3D selezionato).
- **Colonna destra:** l'albero dei progetti, sempre visibile (l'occhio mostra o nasconde un
  layer, il tasto destro apre le sue azioni). Sotto, una striscia di icone stile Blender con
  sette pannelli: Proprietà del layer, CityObject, Annotazione, Risultati lazo, Mappa 2D,
  Concetti semantici e, in fondo, Log.
- **Riga di log in basso:** l'ultimo messaggio e i contatori di avvisi ed errori; un clic apre
  il pannello Log. Un nuovo avviso accende un punto sull'icona del Log. A destra ci sono i
  loghi, con quello del CNR a colori invertiti.

## Comandi nel pannello a destra

Le finestre dei comandi si aprono nel pannello della colonna destra, non sopra la vista. In cima
alla striscia compare un'icona ambra; le altre icone si spengono e non si apre un secondo comando
finché quello aperto non è concluso. Un passo interno al comando si apre sopra il precedente e,
chiuso, riporta indietro. Finché il comando è aperto la selezione non cambia (lazo, modalità di
selezione e riga dell'albero sono bloccati), tranne nei pannelli dei plugin. Restano finestre mobili importa/esporta, progetto, sessione, Preferenze
e plugin, Info, il visualizzatore a 360° e le finestre di sistema per i file (elenco in
`proposta.js`, regole in `../PROPOSTA-UI.md` §2).

## Stile

- Sfondo della vista 3D in gradiente da #ffff7f (in alto) a #005500 (in basso).
- Grigi tipo VS Code; selezione ed evidenziatura in blu tenue (#264f78); comando in corso in
  ambra tenue.

## File

| File | Contenuto |
|---|---|
| `layout.js` | le parti nuove: icone SVG, pulsantiere, pannelli della striscia |
| `menus.js`, `dialogs.js` | copiati dal primo mockup: menu della release e finestre con dati fantoccio |
| `proposta.js` | le modifiche proposte ai menu e la classificazione delle finestre (pannello o mobili) |
| `app.js` | il motore |
| `style.css` | il tema |

## Link diretti

- `#panel=log`: apre un pannello (`props`, `cityobject`, `annotation`, `lasso`, `map`,
  `concepts`, `log`).
- `#dlg=preferences`: apre una finestra; `#dlg=geomColor` apre un comando nel pannello.
- `#menu=Annotazioni/Strumenti`: apre un menu; vale anche `#menu=Importa`.
- `#highlight`: mostra l'evidenziazione lasciata da un plugin, con la sua etichetta.
- `#review`: attiva le note di revisione.
- `#tour`: avvia il tour della nuova disposizione.

Si combinano con `&`.
