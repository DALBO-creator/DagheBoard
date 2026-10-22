// Server statico minimale per la cartella frontend: npm start  ->  http://localhost:3000
const http = require('http');
const fs = require('fs');
const path = require('path');

const porta = process.env.PORT || 3000;
const cartella = path.join(__dirname, '..', 'frontend');
const tipi = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript' };

http.createServer((richiesta, risposta) => {
  const indirizzo = decodeURIComponent(richiesta.url.split('?')[0]);
  const file = path.join(cartella, indirizzo === '/' ? 'index.html' : indirizzo);

  // impedisce di leggere file fuori dalla cartella frontend
  if (!file.startsWith(cartella)) {
    risposta.writeHead(403);
    return risposta.end();
  }

  fs.readFile(file, (errore, contenuto) => {
    if (errore) {
      risposta.writeHead(404);
      return risposta.end('File non trovato');
    }
    risposta.writeHead(200, { 'Content-Type': tipi[path.extname(file)] || 'application/octet-stream' });
    risposta.end(contenuto);
  });
}).listen(porta, () => console.log('Dagestan Board su http://localhost:' + porta));
