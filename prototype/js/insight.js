/**
 * インサイト詳細ページ — 経営指標カード別の深掘りビュー
 */

const insightState = {
  page: 'unitPrice',
  period: '本日',
  level: 'clinic',
  clinicId: 'clinic-sakura',
  role: null,
  staffId: null,
};

const INSIGHT_PERIODS = ['前日', '本日', '今月', '今年'];

function parseInsightParams() {
  const params = new URLSearchParams(window.location.search);
  insightState.page = params.get('page') || 'unitPrice';
  insightState.period = params.get('period') || '本日';
  insightState.level = params.get('level') || 'clinic';
  insightState.clinicId = params.get('clinicId') || 'clinic-sakura';
  insightState.role = params.get('role') || null;
  insightState.staffId = params.get('staffId') || null;
  if (!INSIGHT_PAGES[insightState.page]) insightState.page = 'unitPrice';
  if (!INSIGHT_PERIODS.includes(insightState.period)) insightState.period = '本日';
}

function buildInsightUrl(overrides = {}) {
  const s = { ...insightState, ...overrides };
  const params = new URLSearchParams({ page: s.page, period: s.period, level: s.level });
  if (s.level !== 'all' && s.clinicId) params.set('clinicId', s.clinicId);
  if (s.role) params.set('role', s.role);
  if (s.staffId) params.set('staffId', s.staffId);
  return `insight.html?${params.toString()}`;
}

function syncAppStateFromInsight() {
  state.level = insightState.level;
  if (insightState.level === 'all') {
    state.clinicId = null;
    state.role = null;
    state.staffId = null;
  } else {
    state.clinicId = insightState.clinicId || 'clinic-sakura';
    state.role = insightState.role || null;
    state.staffId = insightState.staffId || null;
  }
  state.selectedPeriod = insightState.period;
}

function syncInsightFromAppState() {
  insightState.level = state.level;
  insightState.clinicId = state.clinicId;
  insightState.role = state.role;
  insightState.staffId = state.staffId;
  insightState.period = state.selectedPeriod;
}

function updateInsightUrl() {
  history.replaceState(null, '', buildInsightUrl());
}

function getContextLabel() {
  if (insightState.level === 'all') return '全院';
  const clinic = MOCK_DATA.clinics?.find((c) => c.id === insightState.clinicId);
  const clinicName = clinic?.name || '医院';
  if (insightState.level === 'staff' && insightState.staffId && clinic?.roles) {
    for (const members of Object.values(clinic.roles)) {
      const staff = members.find((s) => s.id === insightState.staffId);
      if (staff) return `${clinicName} · ${staff.name}`;
    }
  }
  if (insightState.level === 'role' && insightState.role) {
    return `${clinicName} · ${insightState.role}`;
  }
  return clinicName;
}

function renderInsightKpis(kpis) {
  if (!kpis?.length) return '';
  return `
    <div class="insight-kpi-row">
      ${kpis.map((k) => `
        <div class="insight-kpi">
          <span class="insight-kpi-label">${k.label}</span>
          <span class="insight-kpi-value">${k.value}</span>
          <span class="insight-kpi-sub">
            ${k.sub || ''}
            ${k.trend ? `<span class="insight-kpi-trend ${k.trend.up === false ? 'insight-kpi-trend--down' : k.trend.up === true ? 'insight-kpi-trend--up' : ''}">${k.trend.text}</span>` : ''}
          </span>
        </div>
      `).join('')}
    </div>`;
}

function renderStackedBar(chart) {
  const labels = chart.labels || [];
  const series = chart.series || [];
  const totals = labels.map((_, i) => series.reduce((sum, s) => sum + (s.values?.[i] || 0), 0));
  const max = Math.max(...totals, 1);

  return `
    <div class="insight-chart-bars insight-chart-bars--stacked">
      ${labels.map((label, i) => {
        const total = totals[i];
        const h = (total / max) * 100;
        const segs = series.map((s) => {
          const v = s.values?.[i] || 0;
          const w = total > 0 ? (v / total) * 100 : 0;
          return `<span class="insight-bar-seg" style="height:${w}%;background:${s.color}" title="${s.name}: ${v.toLocaleString()}"></span>`;
        }).join('');
        return `
          <div class="insight-bar-col">
            <div class="insight-bar-stack" style="height:${h}%">${segs}</div>
            <span class="insight-bar-label">${label}</span>
          </div>`;
      }).join('')}
    </div>
    <div class="insight-chart-legend">
      ${series.map((s) => `<span class="insight-legend-item"><i style="background:${s.color}"></i>${s.name}</span>`).join('')}
    </div>`;
}

function renderGroupedBar(chart) {
  const labels = chart.labels || [];
  const groups = chart.groups || [];
  const max = Math.max(...labels.map((_, i) => groups.reduce((s, g) => s + (g.values?.[i] || 0), 0)), 1);
  const unit = chart.unit || '';

  return `
    <div class="insight-chart-bars insight-chart-bars--grouped">
      ${labels.map((label, i) => `
        <div class="insight-bar-col insight-bar-col--grouped">
          <div class="insight-bar-group">
            ${groups.map((g) => {
              const v = g.values?.[i] || 0;
              const h = (v / max) * 100;
              return `<div class="insight-bar-single" style="height:${h}%;background:${g.color}" title="${g.name}: ${v}${unit}"></div>`;
            }).join('')}
          </div>
          <span class="insight-bar-label">${label}</span>
        </div>
      `).join('')}
    </div>
    <div class="insight-chart-legend">
      ${groups.map((g) => `<span class="insight-legend-item"><i style="background:${g.color}"></i>${g.name}</span>`).join('')}
    </div>`;
}

function renderSimpleBar(chart) {
  const values = chart.values || [];
  const max = Math.max(...values, 1);
  const labels = chart.labels || [];

  return `
    <div class="insight-chart-bars">
      ${values.map((v, i) => {
        const h = (v / max) * 100;
        return `
          <div class="insight-bar-col">
            <div class="insight-bar-single" style="height:${h}%;background:${chart.color || '#0ea5e9'}" title="${v}"></div>
            <span class="insight-bar-label">${labels[i] || ''}</span>
          </div>`;
      }).join('')}
    </div>`;
}

function renderDonut(chart) {
  const segments = chart.segments || [];
  const total = segments.reduce((s, seg) => s + Math.max(0, seg.value || 0), 0) || 1;
  let acc = 0;
  const stops = segments.map((seg) => {
    const pct = (Math.max(0, seg.value || 0) / total) * 100;
    const start = acc;
    acc += pct;
    return `${seg.color} ${start}% ${acc}%`;
  }).join(', ');

  return `
    <div class="insight-donut-wrap">
      <div class="insight-donut" style="background:conic-gradient(${stops})">
        <div class="insight-donut-hole"></div>
      </div>
      <ul class="insight-donut-legend">
        ${segments.map((seg) => {
          const pct = Math.round((seg.value / total) * 100);
          return `<li><i style="background:${seg.color}"></i><span>${seg.label}</span><strong>${pct}%</strong></li>`;
        }).join('')}
      </ul>
    </div>`;
}

function renderHbar(chart) {
  const items = chart.items || [];
  const max = Math.max(...items.map((it) => it.value), 1);
  const unit = chart.unit || '';

  return `
    <div class="insight-hbar-list">
      ${items.map((it) => {
        const w = (it.value / max) * 100;
        const display = typeof it.value === 'number' && it.value > 1000
          ? it.value.toLocaleString()
          : `${it.value}${unit}`;
        return `
          <div class="insight-hbar-row">
            <span class="insight-hbar-label">${it.label}</span>
            <div class="insight-hbar-track"><div class="insight-hbar-fill" style="width:${w}%;background:${it.color}"></div></div>
            <span class="insight-hbar-val">${display}</span>
          </div>`;
      }).join('')}
    </div>`;
}

function renderCompareLine(chart) {
  const labels = chart.labels || [];
  const current = chart.current || [];
  const compare = chart.compare || [];
  const max = Math.max(...current, ...compare, 1);
  const h = 120;

  const toPoints = (vals) => vals.map((v, i) => {
    const x = labels.length > 1 ? (i / (labels.length - 1)) * 100 : 50;
    const y = h - (v / max) * (h - 8);
    return `${x},${y}`;
  }).join(' ');

  return `
    <div class="insight-line-chart">
      <svg viewBox="0 0 100 ${h}" preserveAspectRatio="none" class="insight-line-svg">
        <polyline class="insight-line insight-line--compare" points="${toPoints(compare)}" />
        <polyline class="insight-line insight-line--current" points="${toPoints(current)}" />
      </svg>
      <div class="insight-line-labels">
        ${labels.map((l) => `<span>${l}</span>`).join('')}
      </div>
      <div class="insight-chart-legend">
        <span class="insight-legend-item"><i style="background:#0ea5e9"></i>当期</span>
        <span class="insight-legend-item"><i style="background:#cbd5e1"></i>${chart.compareLabel || '比較'}</span>
      </div>
    </div>`;
}

function renderSparkline(chart) {
  const values = chart.values || [];
  const max = Math.max(...values, chart.goal || 0, 1);
  const min = Math.min(...values, chart.goal || values[0] || 0);
  const range = max - min || 1;
  const h = 80;
  const labels = chart.labels || [];

  const points = values.map((v, i) => {
    const x = values.length > 1 ? (i / (values.length - 1)) * 100 : 50;
    const y = h - ((v - min) / range) * (h - 12) - 6;
    return `${x},${y}`;
  }).join(' ');

  const goalY = chart.goal != null ? h - ((chart.goal - min) / range) * (h - 12) - 6 : null;

  return `
    <div class="insight-sparkline">
      <div class="insight-sparkline-value">${values[values.length - 1]}${chart.unit || ''}</div>
      <svg viewBox="0 0 100 ${h}" preserveAspectRatio="none" class="insight-line-svg">
        ${goalY != null ? `<line x1="0" y1="${goalY}" x2="100" y2="${goalY}" class="insight-goal-line" />` : ''}
        <polyline class="insight-line insight-line--current" points="${points}" />
      </svg>
      <div class="insight-line-labels">
        ${labels.map((l) => `<span>${l}</span>`).join('')}
      </div>
      ${chart.goal != null ? `<div class="insight-sparkline-goal">目標 ${chart.goal}${chart.unit || ''}</div>` : ''}
    </div>`;
}

function renderDeltaBars(chart) {
  const items = chart.items || [];
  const max = Math.max(...items.map((it) => Math.abs(it.delta)), 1);

  return `
    <div class="insight-delta-bars">
      ${items.map((it) => {
        const w = (Math.abs(it.delta) / max) * 50;
        const isPos = it.delta >= 0;
        return `
          <div class="insight-delta-row">
            <span class="insight-delta-label">${it.label}</span>
            <div class="insight-delta-track">
              <div class="insight-delta-fill ${isPos ? 'insight-delta-fill--pos' : 'insight-delta-fill--neg'}" style="width:${w}%;background:${it.color}"></div>
            </div>
            <span class="insight-delta-val ${isPos ? 'insight-kpi-trend--up' : 'insight-kpi-trend--down'}">${it.delta > 0 ? '+' : ''}${it.delta}%</span>
          </div>`;
      }).join('')}
    </div>`;
}

function renderFunnel(chart) {
  const steps = chart.steps || [];
  const max = steps[0]?.value || 1;

  return `
    <div class="insight-funnel">
      ${steps.map((step, i) => {
        const w = Math.max(30, (step.value / max) * 100);
        const rate = i > 0 ? Math.round((step.value / steps[i - 1].value) * 100) : 100;
        return `
          <div class="insight-funnel-step" style="width:${w}%">
            <span class="insight-funnel-label">${step.label}</span>
            <span class="insight-funnel-value">${step.value.toLocaleString()}</span>
            ${i > 0 ? `<span class="insight-funnel-rate">${rate}%</span>` : ''}
          </div>`;
      }).join('')}
    </div>`;
}

function renderTable(chart) {
  return `
    <div class="insight-table-wrap">
      <table class="insight-table">
        <thead><tr>${chart.columns.map((c) => `<th>${c}</th>`).join('')}</tr></thead>
        <tbody>
          ${chart.rows.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join('')}</tr>`).join('')}
        </tbody>
      </table>
    </div>`;
}

function renderHeatmap(chart) {
  const flat = chart.values.flat();
  const max = Math.max(...flat, 1);
  const min = Math.min(...flat, 0);

  return `
    <div class="insight-heatmap">
      <div class="insight-heatmap-cols">
        <span></span>
        ${chart.cols.map((c) => `<span>${c}</span>`).join('')}
      </div>
      ${chart.rows.map((row, ri) => `
        <div class="insight-heatmap-row">
          <span class="insight-heatmap-row-label">${row}</span>
          ${chart.cols.map((_, ci) => {
            const v = chart.values[ri][ci];
            const t = max > min ? (v - min) / (max - min) : 0;
            const bg = `color-mix(in srgb, #10b981 ${Math.round(t * 100)}%, #f1f5f9)`;
            return `<span class="insight-heatmap-cell" style="background:${bg}" title="${v}%">${v}</span>`;
          }).join('')}
        </div>
      `).join('')}
    </div>`;
}

function renderScatterHint(chart) {
  return `
    <div class="insight-scatter-hint">
      ${chart.items.map((it) => `
        <div class="insight-scatter-card" style="--card-accent:${it.color}">
          <span class="insight-scatter-title">${it.label}</span>
          <span class="insight-scatter-axis">頻度 <strong>${it.x}</strong></span>
          <span class="insight-scatter-axis">単価 <strong>${it.y}</strong></span>
        </div>
      `).join('')}
    </div>`;
}

function renderChart(chart) {
  const renderers = {
    'stacked-bar': renderStackedBar,
    'grouped-bar': renderGroupedBar,
    bar: renderSimpleBar,
    donut: renderDonut,
    hbar: renderHbar,
    'compare-line': renderCompareLine,
    sparkline: renderSparkline,
    'delta-bars': renderDeltaBars,
    funnel: renderFunnel,
    table: renderTable,
    heatmap: renderHeatmap,
    'scatter-hint': renderScatterHint,
  };
  const fn = renderers[chart.type];
  return fn ? fn(chart) : '';
}

function renderInsightTopNav() {
  return `
    <nav class="insight-top-nav" aria-label="インサイト切替">
      ${INSIGHT_PAGE_ORDER.map((id) => {
        const meta = INSIGHT_PAGES[id];
        const active = id === insightState.page;
        const label = meta.shortLabel || meta.title;
        return `
          <a href="${buildInsightUrl({ page: id })}" 
             class="insight-top-nav-item ${active ? 'insight-top-nav-item--active' : ''}"
             style="--nav-accent:${meta.accent}"
             title="${meta.title}"
             aria-current="${active ? 'page' : 'false'}">${label}</a>`;
      }).join('')}
    </nav>`;
}

function renderInsightPeriodTabs() {
  return `
    <div class="insight-period-tabs" role="tablist" aria-label="表示期間">
      ${INSIGHT_PERIODS.map((p) => {
        const active = p === insightState.period;
        return `
          <a href="${buildInsightUrl({ period: p })}" 
             class="insight-period-tab ${active ? 'insight-period-tab--active' : ''}"
             role="tab"
             aria-selected="${active}">${p}</a>`;
      }).join('')}
    </div>`;
}

function renderInsightPage() {
  const meta = getInsightPageMeta(insightState.page);
  const data = getInsightPageData(insightState.page, insightState.period);
  if (!meta || !data) return;

  document.title = `${meta.title} | Dental Analytics`;

  const root = document.getElementById('insight-main');
  root.innerHTML = `
    <header class="insight-header" style="--page-accent:${meta.accent}">
      <div class="insight-toolbar">
        ${renderInsightPeriodTabs()}
        <span class="insight-toolbar-divider" aria-hidden="true"></span>
        ${renderInsightTopNav()}
      </div>
    </header>
    <main class="insight-content">
      ${renderInsightKpis(data.kpis)}
      <div class="insight-chart-grid">
        ${(data.charts || []).map((chart) => `
          <section class="insight-chart-card">
            <header class="insight-chart-header">
              <h2 class="insight-chart-title">${chart.title}</h2>
              ${chart.subtitle ? `<p class="insight-chart-subtitle">${chart.subtitle}</p>` : ''}
            </header>
            <div class="insight-chart-body">${renderChart(chart)}</div>
          </section>
        `).join('')}
      </div>
    </main>`;
}

function initInsightPage() {
  parseInsightParams();
  syncAppStateFromInsight();
  renderNav();
  renderMeta();
  setupNavDragDrop();
  renderInsightPage();
}

window.onInsightNavChange = function onInsightNavChange() {
  syncInsightFromAppState();
  updateInsightUrl();
  renderNav();
  setupNavDragDrop();
  renderInsightPage();
};

initInsightPage();
