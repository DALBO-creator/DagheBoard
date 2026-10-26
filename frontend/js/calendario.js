// Calendario mensile con le attività che hanno una scadenza.

const meseVisualizzato = new Date();
meseVisualizzato.setDate(1);

function chiaveData(data) {
  const mese = String(data.getMonth() + 1).padStart(2, '0');
  const giorno = String(data.getDate()).padStart(2, '0');
  return data.getFullYear() + '-' + mese + '-' + giorno;
}

function disegnaCalendario() {
  $('titoloMese').textContent = meseVisualizzato.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' });
  $('grigliaCalendario').innerHTML = '';

  ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'].forEach(nome => {
    $('grigliaCalendario').appendChild(creaElemento('div', 'giorno-settimana', nome));
  });

  // la griglia parte dal lunedì della prima settimana del mese
  const giorno = new Date(meseVisualizzato);
  giorno.setDate(1 - ((giorno.getDay() + 6) % 7));
  const oggi = chiaveData(new Date());

  for (let i = 0; i < 42; i++) {
    const chiave = chiaveData(giorno);
    const cella = creaElemento('div', 'giorno');
    if (giorno.getMonth() !== meseVisualizzato.getMonth()) cella.classList.add('altro-mese');
    if (chiave === oggi) cella.classList.add('oggi');
    cella.appendChild(creaElemento('div', '', String(giorno.getDate())));

    attivita
      .filter(a => a.scadenza && a.scadenza.startsWith(chiave))
      .forEach(a => {
        const evento = creaElemento('div', 'evento', a.scadenza.slice(11, 16) + ' ' + a.descrizione);
        evento.style.background = a.colore;
        evento.onclick = e => {
          e.stopPropagation();
          apriFinestra(a.id);
        };
        cella.appendChild(evento);
      });

    // clic su un giorno: nuova attività con quella scadenza
    cella.onclick = () => apriFinestra(null, chiave + 'T09:00');
    $('grigliaCalendario').appendChild(cella);
    giorno.setDate(giorno.getDate() + 1);
  }
}

function mostraVista(vista) {
  $('vistaBacheca').hidden = vista !== 'bacheca';
  $('vistaCalendario').hidden = vista !== 'calendario';
  $('vistaChat').hidden = vista !== 'chat';
  $('schedaBacheca').classList.toggle('attiva', vista === 'bacheca');
  $('schedaCalendario').classList.toggle('attiva', vista === 'calendario');
  $('schedaChat').classList.toggle('attiva', vista === 'chat');
  if (vista === 'chat') disegnaChat();
}

$('schedaBacheca').onclick = () => mostraVista('bacheca');
$('schedaCalendario').onclick = () => mostraVista('calendario');
$('schedaChat').onclick = () => mostraVista('chat');
$('mesePrecedente').onclick = () => {
  meseVisualizzato.setMonth(meseVisualizzato.getMonth() - 1);
  disegnaCalendario();
};
$('meseSuccessivo').onclick = () => {
  meseVisualizzato.setMonth(meseVisualizzato.getMonth() + 1);
  disegnaCalendario();
};
