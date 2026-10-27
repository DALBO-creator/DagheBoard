// Chat privata tra utenti registrati: i messaggi sono un array salvato in localStorage.

let contattoScelto = null;

function leggiMessaggi() {
  return JSON.parse(localStorage.getItem('messaggi') || '[]');
}

// Messaggi scambiati tra l'utente corrente e il contatto scelto.
function messaggiConversazione() {
  const io = utenteCorrente();
  return leggiMessaggi().filter(m =>
    (m.da === io && m.a === contattoScelto) || (m.da === contattoScelto && m.a === io)
  );
}

function disegnaChat() {
  $('elencoContatti').innerHTML = '';
  Object.keys(leggiUtenti())
    .filter(nome => nome !== utenteCorrente())
    .forEach(nome => {
      const contatto = creaElemento('li', nome === contattoScelto ? 'attivo' : '', nome);
      contatto.onclick = () => {
        contattoScelto = nome;
        disegnaChat();
      };
      $('elencoContatti').appendChild(contatto);
    });

  $('titoloChat').textContent = contattoScelto || 'Scegli un utente';
  $('formChat').hidden = !contattoScelto;
  $('elencoMessaggi').innerHTML = '';

  messaggiConversazione().forEach(m => {
    const messaggio = creaElemento('li', m.da === utenteCorrente() ? 'mio' : '', m.testo);
    messaggio.appendChild(creaElemento('small', 'secondario', formattaData(m.data)));
    $('elencoMessaggi').appendChild(messaggio);
  });

  // mostra sempre l'ultimo messaggio
  $('elencoMessaggi').scrollTop = $('elencoMessaggi').scrollHeight;
}

$('formChat').onsubmit = e => {
  e.preventDefault();
  const testo = $('campoMessaggio').value.trim();
  if (!testo) return;

  const messaggi = leggiMessaggi();
  messaggi.push({ da: utenteCorrente(), a: contattoScelto, testo: testo, data: Date.now() });
  localStorage.setItem('messaggi', JSON.stringify(messaggi));

  $('campoMessaggio').value = '';
  disegnaChat();
};

// Se un'altra scheda del browser scrive un messaggio, la chat si aggiorna da sola.
window.addEventListener('storage', e => {
  if (e.key === 'messaggi') disegnaChat();
});
