# Dagestan Board

Bacheca kanban in HTML, CSS e JavaScript puro. Le attività sono salvate come array in `localStorage`.

Avvio: `npm start` e apri http://localhost:3000 (oppure apri direttamente `frontend/index.html`).

## Struttura

| Parte | Ambito | File |
|---|---|---|
| 1 | Accesso, dati e regole di dominio | `frontend/index.html`, `frontend/js/dati.js`, `frontend/js/accesso.js` |
| 2 | Bacheca: attività, priorità, colori, drag and drop, commenti, filtri | `frontend/js/bacheca.js`, `frontend/stile.css` |
| 3 | Calendario e promemoria | `frontend/js/calendario.js`, `frontend/js/promemoria.js` |
| 4 | Chat privata tra utenti registrati (messaggi in `localStorage`) | `frontend/js/chat.js` |

`backend/server.js` serve solo i file statici della cartella `frontend`.

## Regole di dominio (in `dati.js`)
- ogni attività ha **un solo** stato (`da-fare`, `in-corso`, `in-revisione`, `completato`);
- per creare un'attività servono **descrizione** e **assegnatario**;
- `scadenza === null` significa attività **atemporale**, altrimenti è un'attività con scadenza.
