const RECENT_DAYS = 60;
const PAGE_SIZE    = 20;

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

/* ── Search ── */
document.getElementById('book-search').addEventListener('input', e => {
  currentSearch = e.target.value.trim().toLowerCase();
  currentPage   = 1;
  renderTable(allBooks);
});

function activateFilter(cat) {
  document.querySelectorAll('.filter-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.filter === cat)
  );
  document.querySelectorAll('.cat-item').forEach(c =>
    c.classList.toggle('active', c.dataset.cat === cat)
  );
  currentFilter = cat;
  currentPage   = 1;
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

/* ── State ── */
let allBooks      = [];
let currentFilter = 'all';
let currentSearch = '';
let currentPage   = 1;

/* ── Table rendering with pagination ── */
function renderTable(books) {
  const tbody = document.getElementById('books-tbody');

  let rows = currentFilter === 'all'
    ? books
    : books.filter(b => (b.subject || '').toLowerCase() === currentFilter);

  if (currentSearch) {
    rows = rows.filter(b =>
      Object.values(b).some(v => String(v).toLowerCase().includes(currentSearch))
    );
  }

  const totalRows  = rows.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / PAGE_SIZE));
  if (currentPage > totalPages) currentPage = totalPages;

  if (!totalRows) {
    const msg = currentSearch
      ? `<tr><td colspan="9" class="no-results">No books match &ldquo;<span style="color:var(--text);font-style:italic">${esc(currentSearch)}</span>&rdquo;.</td></tr>`
      : `<tr><td colspan="9" class="no-results">No books in this category at the moment.</td></tr>`;
    tbody.innerHTML = msg;
    renderPagination(0, 1, 0);
    return;
  }

  const start    = (currentPage - 1) * PAGE_SIZE;
  const pageRows = rows.slice(start, start + PAGE_SIZE);

  tbody.innerHTML = pageRows.map(book => {
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

  renderPagination(totalPages, currentPage, totalRows);
}

/* ── Pagination ── */
function getPageNumbers(current, total) {
  if (total <= 9) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const pages = [];
  if (current <= 5) {
    for (let i = 1; i <= 6; i++) pages.push(i);
    pages.push('…');
    pages.push(total);
  } else if (current >= total - 4) {
    pages.push(1);
    pages.push('…');
    for (let i = total - 5; i <= total; i++) pages.push(i);
  } else {
    pages.push(1);
    pages.push('…');
    for (let i = current - 1; i <= current + 1; i++) pages.push(i);
    pages.push('…');
    pages.push(total);
  }
  return pages;
}

function renderPagination(totalPages, current, totalRows) {
  const el = document.getElementById('books-pagination');
  if (!el) return;

  if (totalPages <= 1) { el.innerHTML = ''; return; }

  const info = `<span class="page-info">${totalRows} book${totalRows !== 1 ? 's' : ''} &mdash; page ${current} of ${totalPages}</span>`;

  const prev = `<button class="page-btn page-prev" data-page="${current - 1}" ${current === 1 ? 'disabled' : ''}>&#8592;</button>`;
  const next = `<button class="page-btn page-next" data-page="${current + 1}" ${current === totalPages ? 'disabled' : ''}>&#8594;</button>`;

  const nums = getPageNumbers(current, totalPages).map(p =>
    p === '…'
      ? `<span class="page-ellipsis">&hellip;</span>`
      : `<button class="page-btn${p === current ? ' active' : ''}" data-page="${p}">${p}</button>`
  ).join('');

  el.innerHTML = `<div class="pagination-inner">${info}<div class="page-buttons">${prev}${nums}${next}</div></div>`;

  el.querySelectorAll('.page-btn:not([disabled])').forEach(btn => {
    btn.addEventListener('click', () => {
      currentPage = parseInt(btn.dataset.page);
      renderTable(allBooks);
      document.getElementById('books-table').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

/* ── Load CSV via PapaParse (requires HTTP server, not file://) ── */
Papa.parse(`books.csv?v=${Date.now()}`, {
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
