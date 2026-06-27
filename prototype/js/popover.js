/**
 * リサイズ・ドラッグ可能な非モーダルポップオーバー
 */

const popoverState = {
  open: false,
  type: null,
  period: null,
  left: 0,
  top: 0,
  width: 0,
  height: 0,
  rowGap: 1,
};

let resizeSession = null;
let dragSession = null;
let suppressOutsideClose = false;

function getPopoverDateLabel(period) {
  const sub = MOCK_DATA.periodDetails[period]?.subtitle || '';
  const m = sub.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/);
  if (m) return `${m[1]}/${String(m[2]).padStart(2, '0')}/${String(m[3]).padStart(2, '0')}`;
  const m2 = sub.match(/(\d{4})年(\d{1,2})月/);
  if (m2) return `${m2[1]}/${String(m2[2]).padStart(2, '0')}`;
  return sub.split('（')[0] || period;
}

function getDefaultPopoverRect() {
  const margin = 20;
  const width = Math.min(POPOVER_DEFAULT_SIZE.width, window.innerWidth - margin * 2);
  const height = Math.min(POPOVER_DEFAULT_SIZE.height, window.innerHeight - margin * 2);
  return {
    width,
    height,
    left: Math.round((window.innerWidth - width) / 2),
    top: Math.round(window.innerHeight * 0.1),
  };
}

function openPopover(type, period) {
  const defaults = getDefaultPopoverRect();
  popoverState.open = true;
  popoverState.type = type;
  popoverState.period = period;
  popoverState.width = defaults.width;
  popoverState.height = defaults.height;
  popoverState.left = defaults.left;
  popoverState.top = defaults.top;
  renderPopover();
}

function closePopover() {
  popoverState.open = false;
  popoverState.type = null;
  popoverState.period = null;
  renderPopover();
}

function navigateToDetailPage(type, period) {
  const params = new URLSearchParams({
    type,
    period,
    level: state.level,
    clinicId: state.clinicId || '',
    role: state.role || '',
    staffId: state.staffId || '',
  });
  window.location.href = `detail.html?${params.toString()}`;
}

const POPOVER_DRAG_HANDLE = `
  <svg class="popover-drag-icon" width="10" height="16" viewBox="0 0 10 16" aria-hidden="true">
    <circle cx="2" cy="2" r="1.2" fill="currentColor"/>
    <circle cx="8" cy="2" r="1.2" fill="currentColor"/>
    <circle cx="2" cy="8" r="1.2" fill="currentColor"/>
    <circle cx="8" cy="8" r="1.2" fill="currentColor"/>
    <circle cx="2" cy="14" r="1.2" fill="currentColor"/>
    <circle cx="8" cy="14" r="1.2" fill="currentColor"/>
  </svg>
`;

function renderPopoverTable(type, rows) {
  const config = getPopoverConfig(type);
  if (!config) return '';

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
    <div class="popover-table-wrap">
      <table class="popover-table popover-table--gap-${popoverState.rowGap}">
        <thead><tr>${head}</tr></thead>
        <tbody>${body}</tbody>
      </table>
    </div>
  `;
}

function renderPopover() {
  const root = document.getElementById('popover-root');
  if (!root) return;

  if (!popoverState.open || !popoverState.type) {
    root.innerHTML = '';
    root.classList.remove('is-open');
    return;
  }

  const config = getPopoverConfig(popoverState.type);
  const rows = getPopoverRows(popoverState.type, popoverState.period);
  const { left, top, width, height } = popoverState;
  const dateLabel = getPopoverDateLabel(popoverState.period);

  root.classList.add('is-open');
  root.innerHTML = `
    <div class="popover-panel" style="left:${left}px;top:${top}px;width:${width}px;height:${height}px" role="dialog" aria-label="${config.title}">
      <div class="popover-resize popover-resize--n" data-resize="n" aria-hidden="true"></div>
      <div class="popover-resize popover-resize--s" data-resize="s" aria-hidden="true"></div>
      <div class="popover-resize popover-resize--e" data-resize="e" aria-hidden="true"></div>
      <div class="popover-resize popover-resize--w" data-resize="w" aria-hidden="true"></div>
      <div class="popover-resize popover-resize--nw" data-resize="nw" aria-hidden="true"></div>
      <div class="popover-resize popover-resize--ne" data-resize="ne" aria-hidden="true"></div>
      <div class="popover-resize popover-resize--sw" data-resize="sw" aria-hidden="true"></div>
      <div class="popover-resize popover-resize--se" data-resize="se" aria-hidden="true"></div>
      <div class="popover-header">
        <button type="button" class="popover-drag-handle" data-action="popover-drag" aria-label="ドラッグして移動">
          ${POPOVER_DRAG_HANDLE}
        </button>
        <div class="popover-header-text">
          <h3 class="popover-title">${config.title}（${rows.length}件）</h3>
          <span class="popover-date">${dateLabel}</span>
        </div>
        <div class="popover-header-controls">
          <label class="popover-row-gap" title="行間">
            <span class="popover-row-gap-label">行間</span>
            <input type="range" class="popover-row-gap-input" min="0" max="2" step="1" value="${popoverState.rowGap}" data-action="popover-row-gap" aria-label="行間" />
          </label>
          <button type="button" class="popover-btn popover-btn--expand" data-action="popover-expand" title="拡大表示（専用ページ）" aria-label="拡大表示">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>
          </button>
          <button type="button" class="popover-btn popover-btn--close" data-action="popover-close" title="閉じる" aria-label="閉じる">×</button>
        </div>
      </div>
      <div class="popover-body">
        ${renderPopoverTable(popoverState.type, rows)}
      </div>
    </div>
  `;
}

function clampPopoverRect(rect) {
  const minW = 640;
  const minH = 320;
  const maxW = window.innerWidth - 16;
  const maxH = window.innerHeight - 16;
  let { left, top, width, height } = rect;
  width = Math.max(minW, Math.min(width, maxW));
  height = Math.max(minH, Math.min(height, maxH));
  left = Math.max(8, Math.min(left, window.innerWidth - width - 8));
  top = Math.max(8, Math.min(top, window.innerHeight - height - 8));
  return { left, top, width, height };
}

function applyPanelRect(rect) {
  Object.assign(popoverState, rect);
  const panel = document.querySelector('.popover-panel');
  if (panel) {
    panel.style.left = `${rect.left}px`;
    panel.style.top = `${rect.top}px`;
    panel.style.width = `${rect.width}px`;
    panel.style.height = `${rect.height}px`;
  }
}

function onResizeMove(e) {
  if (!resizeSession) return;
  const dx = e.clientX - resizeSession.startX;
  const dy = e.clientY - resizeSession.startY;
  const { corner, startLeft, startTop, startWidth, startHeight } = resizeSession;
  let left = startLeft;
  let top = startTop;
  let width = startWidth;
  let height = startHeight;

  if (corner.includes('e')) width = startWidth + dx;
  if (corner.includes('w')) {
    width = startWidth - dx;
    left = startLeft + dx;
  }
  if (corner.includes('s')) height = startHeight + dy;
  if (corner.includes('n')) {
    height = startHeight - dy;
    top = startTop + dy;
  }

  applyPanelRect(clampPopoverRect({ left, top, width, height }));
}

function onDragMove(e) {
  if (!dragSession) return;
  const dx = e.clientX - dragSession.startX;
  const dy = e.clientY - dragSession.startY;
  applyPanelRect(clampPopoverRect({
    left: dragSession.startLeft + dx,
    top: dragSession.startTop + dy,
    width: dragSession.startWidth,
    height: dragSession.startHeight,
  }));
}

function onPointerEnd() {
  if (resizeSession || dragSession) {
    suppressOutsideClose = true;
    requestAnimationFrame(() => { suppressOutsideClose = false; });
  }
  resizeSession = null;
  dragSession = null;
  document.removeEventListener('mousemove', onResizeMove);
  document.removeEventListener('mousemove', onDragMove);
  document.removeEventListener('mouseup', onPointerEnd);
  document.body.classList.remove('popover-resizing', 'popover-dragging', 'popover-resize-ew', 'popover-resize-ns');
}

function startResize(corner, e) {
  e.preventDefault();
  e.stopPropagation();
  suppressOutsideClose = true;
  resizeSession = {
    corner,
    startX: e.clientX,
    startY: e.clientY,
    startLeft: popoverState.left,
    startTop: popoverState.top,
    startWidth: popoverState.width,
    startHeight: popoverState.height,
  };
  document.body.classList.add('popover-resizing');
  if (corner === 'e' || corner === 'w') document.body.classList.add('popover-resize-ew');
  if (corner === 'n' || corner === 's') document.body.classList.add('popover-resize-ns');
  document.addEventListener('mousemove', onResizeMove);
  document.addEventListener('mouseup', onPointerEnd);
}

function startDrag(e) {
  e.preventDefault();
  e.stopPropagation();
  suppressOutsideClose = true;
  dragSession = {
    startX: e.clientX,
    startY: e.clientY,
    startLeft: popoverState.left,
    startTop: popoverState.top,
    startWidth: popoverState.width,
    startHeight: popoverState.height,
  };
  document.body.classList.add('popover-dragging');
  document.addEventListener('mousemove', onDragMove);
  document.addEventListener('mouseup', onPointerEnd);
}

function initPopoverEvents() {
  const root = document.getElementById('popover-root');
  if (!root || root.dataset.bound) return;
  root.dataset.bound = '1';

  document.addEventListener('mousedown', (e) => {
    if (!popoverState.open) return;

    const handle = e.target.closest('[data-resize]');
    if (handle) {
      startResize(handle.dataset.resize, e);
      return;
    }

    const panel = e.target.closest('.popover-panel');
    if (!panel) return;

    if (e.target.closest('[data-action="popover-drag"]') || e.target.closest('.popover-header-text')) {
      if (!e.target.closest('.popover-header-controls')) startDrag(e);
    }
  });

  root.addEventListener('input', (e) => {
    if (e.target.dataset.action === 'popover-row-gap') {
      popoverState.rowGap = Number(e.target.value);
      const table = document.querySelector('.popover-table');
      if (table) {
        table.classList.remove('popover-table--gap-0', 'popover-table--gap-1', 'popover-table--gap-2');
        table.classList.add(`popover-table--gap-${popoverState.rowGap}`);
      }
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && popoverState.open) closePopover();
  });

  document.addEventListener('click', (e) => {
    const action = e.target.closest('[data-action]')?.dataset.action;
    if (action === 'popover-close') {
      closePopover();
      return;
    }
    if (action === 'popover-expand' && popoverState.type) {
      navigateToDetailPage(popoverState.type, popoverState.period);
      return;
    }

    if (!popoverState.open || suppressOutsideClose) return;
    if (e.target.closest('.popover-panel')) return;
    if (e.target.closest('[data-action="open-popover"]')) return;
    closePopover();
  });
}
