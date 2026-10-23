// Accesso e registrazione locali (solo dimostrativi: gli utenti stanno in localStorage).

let registrazione = false;

function leggiUtenti() {
  return JSON.parse(localStorage.getItem('utenti') || '{}');
}

function utenteCorrente() {
  return localStorage.getItem('sessione');
}

// Hash semplice per non salvare la password in chiaro (non è sicuro).
function calcolaHash(testo) {
  let h = 0;
  for (let i = 0; i < testo.length; i++) h = (h * 31 + testo.charCodeAt(i)) | 0;
  return String(h);
}

$('cambiaModalita').onclick = () => {
  registrazione = !registrazione;
  $('bottoneAccedi').textContent = registrazione ? 'Registrati' : 'Accedi';
  $('cambiaModalita').textContent = registrazione ? 'Hai già un account? Accedi' : 'Non hai un account? Registrati';
  $('erroreAccesso').textContent = '';
};

$('formAccesso').onsubmit = e => {
  e.preventDefault();
  const nome = $('nomeUtente').value.trim();
  const password = calcolaHash($('password').value);
  const utenti = leggiUtenti();

  if (registrazione) {
    if (utenti[nome]) return ($('erroreAccesso').textContent = 'Nome utente già in uso');
    utenti[nome] = password;
    localStorage.setItem('utenti', JSON.stringify(utenti));
  } else if (utenti[nome] !== password) {
    return ($('erroreAccesso').textContent = 'Credenziali non valide');
  }

  localStorage.setItem('sessione', nome);
  location.reload();
};

$('esci').onclick = () => {
  localStorage.removeItem('sessione');
  location.reload();
};

// Mostra la schermata di accesso o l'applicazione.
if (utenteCorrente()) {
  $('accesso').hidden = true;
  $('applicazione').hidden = false;
  $('nomeUtenteCorrente').textContent = utenteCorrente();
}
