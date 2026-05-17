const QUOTES = [
  { text: "You must take your opponent into a deep dark forest where 2+2=5.",  author: "Mikhail Tal" },
  { text: "The blunders are all there on the board, waiting to be made.",       author: "Savielly Tartakower" },
  { text: "A good player is always lucky.",                                     author: "José Raúl Capablanca" },
  { text: "Chess is the art of analysis.",                                      author: "Mikhail Botvinnik" },
  { text: "The hardest game to win is a won game.",                             author: "Emanuel Lasker" },
  { text: "Chess is everything: art, science, and sport.",                      author: "Anatoly Karpov" },
  { text: "Even a poor plan is better than no plan at all.",                    author: "Mikhail Chigorin" },
  { text: "To avoid losing a piece, many a person has lost the game.",          author: "Savielly Tartakower" },
];

const RECENT_DAYS = 60;

/* ── Category photos → scroll to books and filter ── */
document.querySelectorAll('.cat-item').forEach(item => {
  item.addEventListener('click', () => {
    activateFilter(item.dataset.cat);
    document.getElementById('books').scrollIntoView({ behavior: 'smooth' });
  });
});

/* ── Filter buttons ── */
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => activateFilter(btn.dataset.filter));
});

function activateFilter(cat) {
  document.querySelectorAll('.filter-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.filter === cat)
  );
  document.querySelectorAll('.cat-item').forEach(c =>
    c.classList.toggle('active', c.dataset.cat === cat)
  );
  currentFilter = cat;
  renderTable(allBooks);
}

/* ── Helpers ── */
function isRecent(dateStr) {
  if (!dateStr) return false;
  return (Date.now() - new Date(dateStr)) / 86400000 <= RECENT_DAYS;
}

function fmtDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric'
  });
}

function esc(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

/* ── Table rendering ── */
let allBooks      = [];
let currentFilter = 'all';

function renderTable(books) {
  const tbody = document.getElementById('books-tbody');
  const rows  = currentFilter === 'all'
    ? books
    : books.filter(b => (b.subject || '').toLowerCase() === currentFilter);

  if (!rows.length) {
    tbody.innerHTML = `<tr><td colspan="9" class="no-results">No books in this category at the moment.</td></tr>`;
    return;
  }

  tbody.innerHTML = rows.map(book => {
    const sold   = (book.sold || '').toLowerCase() === 'true';
    const recent = isRecent(book.added) && !sold;
    const mailto = `mailto:bookzwang@proton.me?subject=Enquiry%3A%20${encodeURIComponent(book.title || '')}`;
    const action = sold
      ? `<span class="td-sold-label">Sold</span>`
      : `<a href="${mailto}" class="inquire-link">Enquire</a>`;

    return `<tr${sold ? ' class="sold"' : ''}>
      <td class="td-title">
        <div class="td-title-inner">
          <span>${esc(book.title)}</span>
          ${recent ? '<span class="badge-new">New</span>' : ''}
        </div>
      </td>
      <td class="td-muted">${esc(book.authors)}</td>
      <td class="td-muted">${esc(book.subject)}</td>
      <td class="td-muted">${esc(book.print)}</td>
      <td class="td-muted">${esc(book.year)}</td>
      <td class="td-muted">${esc(book.condition)}</td>
      <td class="td-price">&euro;&thinsp;${esc(book.price)}</td>
      <td class="td-added">${fmtDate(book.added)}</td>
      <td>${action}</td>
    </tr>`;
  }).join('');
}

/* ── Load CSV via PapaParse (requires HTTP server, not file://) ── */
Papa.parse('books.csv', {
  download: true,
  header: true,
  skipEmptyLines: true,
  complete(results) {
    allBooks = results.data;
    renderTable(allBooks);
  },
  error() {
    document.getElementById('books-tbody').innerHTML =
      `<tr><td colspan="9" class="no-results">
        Could not load book list. Open the site via <strong>start-server.bat</strong> instead of opening the HTML file directly.
      </td></tr>`;
  }
});
