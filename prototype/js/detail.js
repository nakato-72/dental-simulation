/**
 * ポップオーバー拡大表示 — 専用ページ
 */

function renderDetailTable(type, rows) {
  const config = getPopoverConfig(type);
  if (!config) return '<p>データが見つかりません。</p>';

  const head = config.columns.map(c => `<th>${c.label}</th>`).join('');
  const body = rows.map(row => `
    <tr>
      ${config.columns.map(col => {
        const val = row[col.key] ?? '—';
        if (col.key === 'cancelType') {
          const cls = CANCEL_TYPE_CLASS[val] || '';
          return `<td><span class="cancel-type-badge ${cls}">${val}</span></td>`;
        }
        return `<td>${val}</td>`;
      }).join('')}
    </tr>
  `).join('');

  return `
    <div class="detail-page-table-wrap">
      <table class="detail-page-table popover-table">
        <thead><tr>${head}</tr></thead>
        <tbody>${body}</tbody>
      </table>
    </div>
  `;
}

function initDetailPage() {
  const params = new URLSearchParams(window.location.search);
  const type = params.get('type');
  const period = params.get('period') || '本日';
  const level = params.get('level') || 'clinic';

  const config = getPopoverConfig(type);
  if (!config) {
    document.getElementById('detail-title').textContent = '詳細が見つかりません';
    return;
  }

  const levelLabel = { all: '全院', clinic: '医院', role: '職種', staff: '担当' }[level] || '';
  const rows = getPopoverRows(type, period);

  document.title = `${config.title} | Dental Analytics`;
  document.getElementById('detail-title').textContent = config.title;
  document.getElementById('detail-meta').textContent = `${levelLabel} · ${period} · 全${rows.length}件`;
  document.getElementById('detail-content').innerHTML = renderDetailTable(type, rows);
}

initDetailPage();
