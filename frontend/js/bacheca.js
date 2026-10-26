// Bacheca kanban: colonne, attività, finestra di modifica, commenti, drag and drop e filtri.

let idInModifica = null;
let idTrascinato = null;

function formattaData(data) {
  return new Date(data).toLocaleString('it-IT', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

function eScaduta(a) {
  return a.scadenza && a.stato !== 'completato' && new Date(a.scadenza) < new Date();
}

function creaElemento(tag, classe, testo) {
  const el = document.createElement(tag);
  if (classe) el.className = classe;
  if (testo) el.textContent = testo;
  return el;
}

// Ridisegna bacheca e calendario e controlla i promemoria.
function aggiorna() {
  disegnaBacheca();
  disegnaCalendario();
  controllaPromemoria(); // dopo ogni modifica, senza aspettare il controllo periodico
}

// ---------- Bacheca ----------

function attivitaFiltrate() {
  const testo = $('cerca').value.toLowerCase();
  const priorita = $('filtroPriorita').value;
  const tipo = $('filtroTipo').value;
  const ordine = { alta: 0, media: 1, bassa: 2 };

  return attivita
    .filter(a => !priorita || a.priorita === priorita)
    .filter(a => tipo !== 'con-scadenza' || a.scadenza)
    .filter(a => tipo !== 'atemporale' || !a.scadenza)
    .filter(a => (a.descrizione + ' ' + a.assegnatario).toLowerCase().includes(testo))
    // prima per priorità, poi per scadenza (le atemporali in fondo)
    .sort((a, b) => ordine[a.priorita] - ordine[b.priorita] || (a.scadenza || 'z').localeCompare(b.scadenza || 'z'));
}

function disegnaBacheca() {
  const elenco = attivitaFiltrate();
  $('vistaBacheca').innerHTML = '';

  STATI.forEach((stato, i) => {
    const colonna = creaElemento('div', 'colonna');
    const attivitaColonna = elenco.filter(a => a.stato === stato.id);
    colonna.appendChild(creaElemento('h2', '', stato.nome + ' (' + attivitaColonna.length + ')'));
    attivitaColonna.forEach(a => colonna.appendChild(disegnaAttivita(a, i)));

    // drag and drop: la colonna accetta le attività
    colonna.ondragover = e => {
      e.preventDefault();
      colonna.classList.add('sopra');
    };
    colonna.ondragleave = () => colonna.classList.remove('sopra');
    colonna.ondrop = () => spostaAttivita(idTrascinato, stato.id);

    $('vistaBacheca').appendChild(colonna);
  });
}

function disegnaAttivita(a, indiceStato) {
  const scheda = creaElemento('div', 'attivita ' + (a.scadenza ? 'con-scadenza' : 'atemporale'));
  if (eScaduta(a)) scheda.classList.add('scaduta');
  scheda.style.borderLeftColor = a.colore;
  if (a.scadenza) scheda.style.borderTopColor = a.colore;
  scheda.draggable = true;
  scheda.ondragstart = () => (idTrascinato = a.id);
  scheda.onclick = () => apriFinestra(a.id);

  scheda.appendChild(creaElemento('p', '', a.descrizione));
  scheda.appendChild(creaElemento('small', 'etichetta ' + a.priorita, NOMI_PRIORITA[a.priorita]));

  if (a.scadenza) {
    scheda.appendChild(creaElemento('small', eScaduta(a) ? 'etichetta scaduta' : '', 'Scade ' + formattaData(a.scadenza)));
  } else {
    scheda.appendChild(creaElemento('small', 'secondario', 'Atemporale'));
  }
  scheda.appendChild(creaElemento('small', 'secondario', a.assegnatario));
  if (a.commenti.length) scheda.appendChild(creaElemento('small', 'secondario', a.commenti.length + (a.commenti.length === 1 ? ' commento' : ' commenti')));

  // Su mobile il drag and drop non funziona: pulsanti per spostare l'attività
  const sposta = creaElemento('div', 'sposta');
  if (indiceStato > 0) sposta.appendChild(bottoneSposta('Indietro', a.id, STATI[indiceStato - 1].id));
  if (indiceStato < STATI.length - 1) sposta.appendChild(bottoneSposta('Avanti', a.id, STATI[indiceStato + 1].id));
  scheda.appendChild(sposta);

  return scheda;
}

function bottoneSposta(testo, idAttivita, idStato) {
  const bottone = creaElemento('button', 'bottone', testo);
  bottone.onclick = e => {
    e.stopPropagation();
    spostaAttivita(idAttivita, idStato);
  };
  return bottone;
}

function spostaAttivita(id, stato) {
  const a = trovaAttivita(id);
  if (!a) return; // ad esempio un file trascinato dall'esterno
  a.stato = stato; // un'attività ha sempre un solo stato
  salvaTutto();
  aggiorna();
}

// ---------- Finestra attività ----------

function apriFinestra(id, scadenza) {
  idInModifica = id || null;
  const a = trovaAttivita(id) || { assegnatario: utenteCorrente(), stato: 'da-fare', priorita: 'media', colore: '#4f46e5', scadenza: scadenza };

  $('titoloFinestra').textContent = id ? 'Modifica attività' : 'Nuova attività';
  $('campoDescrizione').value = a.descrizione || '';
  $('campoAssegnatario').value = a.assegnatario || '';
  $('campoStato').value = a.stato;
  $('campoPriorita').value = a.priorita;
  $('campoScadenza').value = a.scadenza || '';
  $('campoPromemoria').value = a.promemoria ?? '';
  $('campoColore').value = a.colore;
  $('erroreForm').textContent = '';

  // i commenti e l'eliminazione servono solo per attività già esistenti
  $('bottoneElimina').hidden = !id;
  $('sezioneCommenti').hidden = !id;
  disegnaCommenti();

  $('finestraAttivita').showModal();
}

$('formAttivita').onsubmit = e => {
  e.preventDefault();
  const vecchia = trovaAttivita(idInModifica);
  const promemoria = $('campoPromemoria').value === '' ? null : Number($('campoPromemoria').value);
  const scadenza = $('campoScadenza').value || null; // null = attività atemporale
  // il promemoria riparte solo se cambiano scadenza o promemoria
  const avvisato = vecchia && vecchia.scadenza === scadenza && vecchia.promemoria === promemoria ? vecchia.avvisato : false;

  const nuova = {
    id: idInModifica || Date.now().toString(),
    descrizione: $('campoDescrizione').value.trim(),
    assegnatario: $('campoAssegnatario').value.trim(),
    stato: $('campoStato').value,
    priorita: $('campoPriorita').value,
    scadenza: scadenza,
    promemoria: promemoria,
    avvisato: avvisato,
    colore: $('campoColore').value,
    commenti: vecchia ? vecchia.commenti : []
  };

  const errore = salvaAttivita(nuova);
  if (errore) {
    $('erroreForm').textContent = errore;
    return;
  }
  $('finestraAttivita').close();
  aggiorna();
};

$('bottoneElimina').onclick = () => {
  if (!confirm('Eliminare questa attività?')) return;
  eliminaAttivita(idInModifica);
  $('finestraAttivita').close();
  aggiorna();
};

$('annulla').onclick = () => $('finestraAttivita').close();
$('nuovaAttivita').onclick = () => apriFinestra();

// ---------- Commenti ----------

function disegnaCommenti() {
  const a = trovaAttivita(idInModifica);
  $('elencoCommenti').innerHTML = '';
  if (!a) return;
  a.commenti.forEach(c => {
    $('elencoCommenti').appendChild(creaElemento('li', '', c.autore + ' (' + formattaData(c.data) + '): ' + c.testo));
  });
}

// Invio nel campo commento invia il commento, non salva l'attività.
$('campoCommento').onkeydown = e => {
  if (e.key !== 'Enter') return;
  e.preventDefault();
  $('inviaCommento').click();
};

$('inviaCommento').onclick = () => {
  const testo = $('campoCommento').value.trim();
  if (!testo) return;
  trovaAttivita(idInModifica).commenti.push({ autore: utenteCorrente(), testo: testo, data: Date.now() });
  salvaTutto();
  $('campoCommento').value = '';
  disegnaCommenti();
  aggiorna();
};

// ---------- Avvio ----------

STATI.forEach(s => $('campoStato').add(new Option(s.nome, s.id)));
Object.keys(leggiUtenti()).forEach(nome => $('elencoUtenti').appendChild(new Option(nome)));

$('cerca').oninput = disegnaBacheca;
$('filtroPriorita').onchange = disegnaBacheca;
$('filtroTipo').onchange = disegnaBacheca;
