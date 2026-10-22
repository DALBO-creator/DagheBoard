// Dati dell'app: le attività sono un array salvato in localStorage.

const STATI = [
  { id: 'da-fare', nome: 'Da fare' },
  { id: 'in-corso', nome: 'In corso' },
  { id: 'in-revisione', nome: 'In revisione' },
  { id: 'completato', nome: 'Completato' }
];
const NOMI_PRIORITA = { alta: 'Alta', media: 'Media', bassa: 'Bassa' };

let attivita = JSON.parse(localStorage.getItem('attivita') || '[]');

function $(id) {
  return document.getElementById(id);
}

function salvaTutto() {
  localStorage.setItem('attivita', JSON.stringify(attivita));
}

// Regole di dominio: restituisce un messaggio di errore, oppure null se è tutto ok.
function validaAttivita(a) {
  if (!a.descrizione) return 'La descrizione è obbligatoria';
  if (!a.assegnatario) return "L'attività deve essere assegnata a qualcuno";
  if (!STATI.some(s => s.id === a.stato)) return 'Stato non valido';
  return null;
}

// Aggiunge una nuova attività o sostituisce quella con lo stesso id.
function salvaAttivita(a) {
  const errore = validaAttivita(a);
  if (errore) return errore;

  const indice = attivita.findIndex(x => x.id === a.id);
  if (indice >= 0) attivita[indice] = a;
  else attivita.push(a);

  salvaTutto();
  return null;
}

function eliminaAttivita(id) {
  attivita = attivita.filter(a => a.id !== id);
  salvaTutto();
}

function trovaAttivita(id) {
  return attivita.find(a => a.id === id);
}
