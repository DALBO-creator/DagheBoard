// Promemoria: ogni 30 secondi controlla le scadenze e mostra un avviso.

function mostraAvviso(testo) {
  const avviso = creaElemento('div', 'avviso', testo);
  $('avvisi').appendChild(avviso);
  setTimeout(() => avviso.remove(), 8000);
}

function controllaPromemoria() {
  const adesso = Date.now();
  attivita.forEach(a => {
    if (!a.scadenza || a.promemoria === null || a.avvisato || a.stato === 'completato') return;

    const momentoAvviso = new Date(a.scadenza).getTime() - a.promemoria * 60000;
    if (adesso >= momentoAvviso) {
      a.avvisato = true; // ogni attività avvisa una sola volta
      salvaTutto();
      mostraAvviso('Promemoria: ' + a.descrizione + ' scade ' + formattaData(a.scadenza));
      if (window.Notification && Notification.permission === 'granted') {
        try {
          new Notification('Promemoria', { body: a.descrizione });
        } catch (errore) {
          // alcuni browser (ad esempio su telefono) non permettono questo tipo di notifica
        }
      }
    }
  });
}

// Il permesso per le notifiche di sistema si chiede con un pulsante.
function aggiornaBottoneNotifiche() {
  const bottone = $('attivaNotifiche');
  if (!window.Notification || Notification.permission === 'granted') {
    bottone.hidden = true;
  } else if (Notification.permission === 'denied') {
    bottone.hidden = false;
    bottone.disabled = true;
    bottone.textContent = 'Notifiche bloccate dal browser';
  } else {
    bottone.hidden = false;
  }
}

$('attivaNotifiche').onclick = () => Notification.requestPermission().then(aggiornaBottoneNotifiche);

// Avvio dell'applicazione (questo è l'ultimo script caricato).
if (utenteCorrente()) {
  aggiornaBottoneNotifiche();
  aggiorna(); // controlla anche i promemoria
  setInterval(controllaPromemoria, 30000);
}
