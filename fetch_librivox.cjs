const https = require('https');

function fetchBooks(offset, limit) {
  return new Promise((resolve) => {
    https.get(`https://librivox.org/api/feed/audiobooks/?format=json&limit=${limit}&offset=${offset}`, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data).books || []);
        } catch(e) { resolve([]); }
      });
    });
  });
}

async function main() {
  let allPtBooks = [];
  // Grab from recent 10000 books
  for(let i=0; i<10000; i+=1000) {
    const books = await fetchBooks(i, 1000);
    if (!books.length) break;
    const pt = books.filter(b => b.language === 'Portuguese' || b.language.toLowerCase().includes('portug'));
    allPtBooks.push(...pt);
  }
  
  const results = allPtBooks.map(b => ({
    id: b.id,
    title: b.title.replace(/\(.*?\)/g, '').trim(),
    author: b.authors && b.authors[0] ? `${b.authors[0].first_name} ${b.authors[0].last_name}` : 'Desconhecido',
    cover: b.url_librivox ? `https://archive.org/download/${b.url_librivox.split('/').pop()}/cover.jpg` : '',
    rss: b.url_rss
  }));
  
  const fs = require('fs');
  fs.writeFileSync('pt_books.json', JSON.stringify(results, null, 2));
  console.log(`Salvos ${results.length} livros!`);
}
main();
