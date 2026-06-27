/**
 * インサイト詳細ページ — 経営指標カード別のモックデータ
 */

const INSIGHT_PAGE_ORDER = [
  'unitPrice', 'staffSales', 'receivables',
  'visits', 'newPatients', 'appointments',
  'utilization', 'recall', 'dropout', 'webBooking',
];

const INSIGHT_PAGES = {
  unitPrice: { title: '売上内訳', shortLabel: '売上', icon: '¥', accent: '#0ea5e9', group: '売上・入金' },
  staffSales: { title: '職種別売上', shortLabel: '職種別', icon: 'Dr', accent: '#6366f1', group: '売上・入金' },
  receivables: { title: '入金実績', shortLabel: '入金', icon: '入', accent: '#64748b', group: '売上・入金' },
  visits: { title: '来院患者数', shortLabel: '来院', icon: '院', accent: '#06b6d4', group: '患者・予約' },
  newPatients: { title: '訪問患者数', shortLabel: '訪問', icon: '新', accent: '#8b5cf6', group: '患者・予約' },
  appointments: { title: '予約数', shortLabel: '予約', icon: '予', accent: '#0891b2', group: '患者・予約' },
  utilization: { title: '稼働率', shortLabel: '稼働', icon: '%', accent: '#10b981', group: '運営効率' },
  recall: { title: '定期検診', shortLabel: '検診', icon: '検', accent: '#14b8a6', group: '運営効率' },
  dropout: { title: '中断患者数', shortLabel: '中断', icon: '離', accent: '#f59e0b', group: '運営効率' },
  webBooking: { title: 'WEB予約', shortLabel: 'WEB', icon: 'W', accent: '#2563eb', group: '運営効率' },
};

const PERIOD_LABELS_INSIGHT = { '前日': '前日', '本日': '本日', '今月': '今月', '今年': '今年' };

function insightTrend(text, up) {
  return { text, up: up !== false };
}

function getInsightPageData(pageId, period = '本日') {
  const detail = MOCK_DATA.periodDetails[period] || MOCK_DATA.periodDetails['本日'];
  const b = detail.breakdown || {};
  const builders = {
    unitPrice: () => ({
      kpis: [
        { label: '売上合計', value: intelFormatYen(detail.total), sub: detail.change?.label || '前比', trend: insightTrend(detail.change?.text || '—', detail.change?.up) },
        { label: '保険', value: intelFormatYen(b.insurance || 0), sub: `${Math.round((b.insurance / detail.total) * 100) || 0}%` },
        { label: '自費', value: intelFormatYen(b.selfPay || 0), sub: `${Math.round((b.selfPay / detail.total) * 100) || 0}%` },
        { label: '販売品', value: intelFormatYen(b.products || 0), sub: '物販・その他' },
      ],
      charts: [
        {
          title: '日別売上推移',
          subtitle: '保険・自費・販売品の内訳',
          type: 'stacked-bar',
          labels: detail.charts?.labels || ['月', '火', '水', '木', '金', '土', '日'],
          series: [
            { name: '保険', color: '#22c55e', values: detail.charts?.insurance || [] },
            { name: '自費', color: '#0ea5e9', values: detail.charts?.selfPay || [] },
            { name: '販売品', color: '#eab308', values: detail.charts?.products || [] },
          ],
        },
        {
          title: '売上構成比',
          subtitle: '当期の収益ミックス',
          type: 'donut',
          segments: [
            { label: '保険', value: b.insurance || 0, color: '#22c55e' },
            { label: '自費', value: b.selfPay || 0, color: '#0ea5e9' },
            { label: '販売品', value: b.products || 0, color: '#eab308' },
            { label: 'その他', value: b.other || 0, color: '#94a3b8' },
          ],
        },
        {
          title: '担当者別売上',
          subtitle: 'ドクター単位（経営判断用）',
          type: 'hbar',
          items: [
            { label: '田中 Dr', value: 90400, color: '#2563eb' },
            { label: '佐藤 Dr', value: 52400, color: '#3b82f6' },
            { label: 'DH合計', value: 43800, color: '#0891b2' },
            { label: '未設定', value: 8600, color: '#94a3b8' },
          ],
        },
        {
          title: '前年同曜日比較',
          subtitle: '売上の季節変動を把握',
          type: 'compare-line',
          labels: detail.charts?.labels?.slice(-5) || [],
          current: (detail.charts?.insurance || []).slice(-5).map((v, i) => v + (detail.charts?.selfPay?.[i] || 0)),
          compare: (detail.charts?.compareRevenue || []).slice(-5),
          compareLabel: detail.charts?.compareLabel || '前年',
        },
      ],
    }),
    staffSales: () => ({
      kpis: [
        { label: '合計売上', value: intelFormatYen(detail.total), sub: '職種内訳合計' },
        { label: 'Dr', value: '¥90,400', sub: '63%', trend: insightTrend('+5.4%', true) },
        { label: 'DH', value: '¥43,800', sub: '31%' },
        { label: '未設定', value: '¥8,600', sub: '要紐付け', trend: insightTrend('要確認', false) },
      ],
      charts: [
        {
          title: '職種別売上推移',
          subtitle: 'Dr / DH / 未設定',
          type: 'stacked-bar',
          labels: ['第1週', '第2週', '第3週', '第4週'],
          series: [
            { name: 'Dr', color: '#2563eb', values: [820000, 880000, 904000, 920000] },
            { name: 'DH', color: '#0891b2', values: [380000, 410000, 438000, 445000] },
            { name: '未設定', color: '#94a3b8', values: [12000, 8000, 8600, 7200] },
          ],
        },
        {
          title: 'Dr別売上ランキング',
          subtitle: '生産性の偏りを確認',
          type: 'hbar',
          items: [
            { label: '田中 健一', value: 90400, color: '#2563eb' },
            { label: '佐藤 誠', value: 52400, color: '#3b82f6' },
          ],
        },
        {
          title: '保険 vs 自費（職種別）',
          subtitle: '自費比率の差異',
          type: 'grouped-bar',
          labels: ['Dr', 'DH', '未設定'],
          groups: [
            { name: '保険', color: '#94a3b8', values: [52000, 28000, 5000] },
            { name: '自費', color: '#0ea5e9', values: [38400, 15800, 3600] },
          ],
        },
        {
          title: '前月同日比',
          subtitle: '職種ごとの伸び率',
          type: 'delta-bars',
          items: [
            { label: 'Dr', delta: 5.4, color: '#2563eb' },
            { label: 'DH', delta: 2.1, color: '#0891b2' },
            { label: '未設定', delta: -1.2, color: '#94a3b8' },
          ],
        },
      ],
    }),
    receivables: () => ({
      kpis: [
        { label: '入金額', value: '¥130,400', sub: '本日実績', trend: insightTrend('-8%', false) },
        { label: '未収金', value: '¥12,400', sub: '要フォロー', trend: insightTrend('1名', false) },
        { label: '入金率', value: '96.1%', sub: '目標 95%', trend: insightTrend('達成', true) },
        { label: '回収見込', value: '¥8,200', sub: '7日以内' },
      ],
      charts: [
        {
          title: '入金 vs 未収金',
          subtitle: '日次キャッシュフロー',
          type: 'grouped-bar',
          labels: detail.charts?.labels?.slice(-7) || [],
          groups: [
            { name: '入金', color: '#10b981', values: [118000, 125000, 130400, 128000, 132000, 126000, 130400] },
            { name: '未収', color: '#f59e0b', values: [14200, 13800, 12400, 15000, 13200, 14800, 12400] },
          ],
        },
        {
          title: '未収金エイジング',
          subtitle: '放置リスクの可視化',
          type: 'hbar',
          items: [
            { label: '30日以内', value: 8200, color: '#10b981' },
            { label: '31〜60日', value: 2800, color: '#f59e0b' },
            { label: '61日以上', value: 1400, color: '#ef4444' },
          ],
        },
        {
          title: '未収金上位',
          subtitle: '優先フォローリスト',
          type: 'table',
          columns: ['患者', '金額', '経過', '担当'],
          rows: [
            ['山田 太郎', '¥4,200', '12日', '田中 Dr'],
            ['鈴木 花子', '¥3,800', '8日', '佐藤 Dr'],
            ['高橋 一郎', '¥2,400', '45日', 'DH'],
          ],
        },
        {
          title: '入金率トレンド',
          subtitle: '経営の健全性指標',
          type: 'sparkline',
          labels: ['W1', 'W2', 'W3', 'W4'],
          values: [94.2, 95.1, 95.8, 96.1],
          goal: 95,
          unit: '%',
        },
      ],
    }),
    visits: () => ({
      kpis: [
        { label: '来院合計', value: `${detail.visits}人`, sub: detail.change?.label || '', trend: insightTrend(detail.change?.text || '', detail.change?.up) },
        { label: '純初診', value: '2人', sub: '新規獲得' },
        { label: '再診', value: '17人', sub: 'リピート基盤' },
        { label: '初診', value: '6人', sub: '初回来院' },
      ],
      charts: [
        {
          title: '来院内訳推移',
          subtitle: '純初診 / 初診 / 再診 / その他',
          type: 'stacked-bar',
          labels: detail.charts?.labels || [],
          series: [
            { name: '純初診', color: '#6366f1', values: detail.charts?.visitsFirst?.map((v) => Math.round(v * 0.25)) || [] },
            { name: '初診', color: '#8b5cf6', values: detail.charts?.visitsFirst || [] },
            { name: '再診', color: '#06b6d4', values: detail.charts?.visitsReturn || [] },
            { name: 'その他', color: '#94a3b8', values: detail.charts?.visitsReFirst || [] },
          ],
        },
        {
          title: '曜日別来院',
          subtitle: 'シフト・スタッフ配置の参考',
          type: 'bar',
          labels: ['月', '火', '水', '木', '金', '土'],
          values: [32, 28, 35, 30, 29, 18],
          color: '#06b6d4',
        },
        {
          title: '前年比較',
          subtitle: '患者数の季節変動',
          type: 'compare-line',
          labels: detail.charts?.labels?.slice(-5) || [],
          current: detail.charts?.visits?.slice(-5) || [],
          compare: detail.charts?.compareVisits?.slice(-5) || [],
          compareLabel: '前年',
        },
        {
          title: '患者単価 × 来院数',
          subtitle: '売上への寄与度',
          type: 'scatter-hint',
          items: [
            { label: '再診', x: '高頻度', y: '安定単価', color: '#06b6d4' },
            { label: '初診', x: '中頻度', y: '高単価', color: '#8b5cf6' },
            { label: '純初診', x: '低頻度', y: '最高単価', color: '#6366f1' },
          ],
        },
      ],
    }),
    newPatients: () => ({
      kpis: [
        { label: '訪問合計', value: '4人', sub: '本日', trend: insightTrend('-1名', false) },
        { label: '純初診', value: '1人', sub: '新規' },
        { label: '初診', value: '1人', sub: '初回来院' },
        { label: '再診', value: '1人', sub: 'リピート' },
      ],
      charts: [
        {
          title: '訪問タイプ推移',
          subtitle: '新規パイプラインの質',
          type: 'stacked-bar',
          labels: ['4週前', '3週前', '2週前', '先週', '今週'],
          series: [
            { name: '純初診', color: '#6366f1', values: [2, 3, 2, 4, 1] },
            { name: '初診', color: '#8b5cf6', values: [3, 2, 4, 3, 1] },
            { name: '再診', color: '#06b6d4', values: [5, 4, 6, 5, 1] },
            { name: 'その他', color: '#94a3b8', values: [1, 2, 1, 2, 1] },
          ],
        },
        {
          title: '獲得チャネル',
          subtitle: 'マーケ投資の効果測定',
          type: 'donut',
          segments: [
            { label: '紹介', value: 38, color: '#6366f1' },
            { label: 'WEB', value: 28, color: '#2563eb' },
            { label: '看板', value: 18, color: '#10b981' },
            { label: 'その他', value: 16, color: '#94a3b8' },
          ],
        },
        {
          title: '初診成約率',
          subtitle: '来院→治療開始の歩留まり',
          type: 'funnel',
          steps: [
            { label: '問合せ', value: 12 },
            { label: '予約', value: 8 },
            { label: '来院', value: 6 },
            { label: '成約', value: 4 },
          ],
        },
        {
          title: '担当別新規獲得',
          subtitle: 'チーム貢献度',
          type: 'hbar',
          items: [
            { label: '田中 Dr', value: 2, color: '#2563eb' },
            { label: '佐藤 Dr', value: 1, color: '#3b82f6' },
            { label: 'DH', value: 1, color: '#0891b2' },
          ],
        },
      ],
    }),
    appointments: () => ({
      kpis: [
        { label: '予約合計', value: '34件', sub: '本日', trend: insightTrend('±0', null) },
        { label: '来院済', value: '29件', sub: '来院率 85%' },
        { label: 'キャンセル', value: '3件', sub: '率 8.8%' },
        { label: '無断CX', value: '1件', sub: '要改善', trend: insightTrend('要注意', false) },
      ],
      charts: [
        {
          title: '予約ステータス推移',
          subtitle: '来院済 / 未来院 / CX / 無断',
          type: 'stacked-bar',
          labels: ['月', '火', '水', '木', '金'],
          series: [
            { name: '来院済', color: '#10b981', values: [28, 30, 27, 31, 29] },
            { name: '未来院', color: '#0ea5e9', values: [2, 1, 3, 2, 2] },
            { name: 'CX', color: '#f59e0b', values: [2, 3, 2, 1, 2] },
            { name: '無断', color: '#ef4444', values: [1, 0, 1, 1, 1] },
          ],
        },
        {
          title: '時間帯別予約',
          subtitle: 'ピークタイムの把握',
          type: 'bar',
          labels: ['9時', '10時', '11時', '14時', '15時', '16時'],
          values: [4, 8, 6, 5, 7, 4],
          color: '#0891b2',
        },
        {
          title: 'キャンセル率トレンド',
          subtitle: '4週移動平均',
          type: 'sparkline',
          labels: ['W1', 'W2', 'W3', 'W4'],
          values: [6.2, 5.8, 5.2, 5.2],
          goal: 5,
          unit: '%',
        },
        {
          title: 'メニュー別予約',
          subtitle: '稼働計画に活用',
          type: 'hbar',
          items: [
            { label: '定期検診', value: 12, color: '#0891b2' },
            { label: 'クリーニング', value: 9, color: '#06b6d4' },
            { label: '初診', value: 6, color: '#6366f1' },
            { label: 'その他', value: 7, color: '#94a3b8' },
          ],
        },
      ],
    }),
    utilization: () => ({
      kpis: [
        { label: '稼働率', value: '78.4%', sub: '目標 82%', trend: insightTrend('+2.1pt', true) },
        { label: 'ユニット1', value: '82%', sub: '最も高い' },
        { label: 'ユニット2', value: '76%', sub: '改善余地' },
        { label: '空き枠', value: '14枠', sub: '本日残' },
      ],
      charts: [
        {
          title: 'ユニット別稼働率',
          subtitle: '設備投資の判断材料',
          type: 'hbar',
          items: [
            { label: 'ユニット1', value: 82, color: '#10b981' },
            { label: 'ユニット2', value: 76, color: '#14b8a6' },
            { label: 'ユニット3', value: 74, color: '#06b6d4' },
            { label: '平均', value: 78, color: '#94a3b8' },
          ],
          unit: '%',
        },
        {
          title: '週別稼働推移',
          subtitle: '目標ラインとの差',
          type: 'sparkline',
          labels: ['W1', 'W2', 'W3', 'W4'],
          values: [74, 76, 77, 78.4],
          goal: 82,
          unit: '%',
        },
        {
          title: '予約枠 vs 実績',
          subtitle: '過剰・不足の検知',
          type: 'grouped-bar',
          labels: ['月', '火', '水', '木', '金'],
          groups: [
            { name: '枠', color: '#e2e8f0', values: [40, 40, 40, 40, 40] },
            { name: '実績', color: '#10b981', values: [32, 35, 31, 34, 29] },
          ],
        },
        {
          title: '曜日ヒート',
          subtitle: 'シフト最適化',
          type: 'heatmap',
          rows: ['午前', '午後'],
          cols: ['月', '火', '水', '木', '金'],
          values: [[82, 78, 85, 80, 76], [74, 72, 79, 77, 70]],
        },
      ],
    }),
    recall: () => ({
      kpis: [
        { label: 'リコール率', value: '68.2%', sub: '目標 75%', trend: insightTrend('+1.4pt', true) },
        { label: '対象者', value: '142名', sub: '今月' },
        { label: '予約済', value: '105名', sub: '消化 74%' },
        { label: '未着手', value: '37名', sub: '要アクション' },
      ],
      charts: [
        {
          title: '月別リコール率',
          subtitle: '継続治療の定着',
          type: 'sparkline',
          labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
          values: [62, 64, 65, 66, 67, 68.2],
          goal: 75,
          unit: '%',
        },
        {
          title: '対象者ステータス',
          subtitle: '今月の進捗',
          type: 'donut',
          segments: [
            { label: '予約済', value: 105, color: '#14b8a6' },
            { label: '連絡中', value: 22, color: '#f59e0b' },
            { label: '未着手', value: 15, color: '#ef4444' },
          ],
        },
        {
          title: '担当別消化率',
          subtitle: 'フォロー品質の比較',
          type: 'hbar',
          items: [
            { label: '鈴木 DH', value: 82, color: '#14b8a6' },
            { label: '山田 DH', value: 71, color: '#06b6d4' },
            { label: '伊藤 DH', value: 68, color: '#0891b2' },
          ],
          unit: '%',
        },
        {
          title: 'リコール→来院転換',
          subtitle: '売上への貢献',
          type: 'funnel',
          steps: [
            { label: '対象', value: 142 },
            { label: '連絡', value: 128 },
            { label: '予約', value: 105 },
            { label: '来院', value: 89 },
          ],
        },
      ],
    }),
    dropout: () => ({
      kpis: [
        { label: '中断患者', value: '12名', sub: '当月', trend: insightTrend('-2名', true) },
        { label: '中断予備軍', value: '8名', sub: '3ヶ月未来院' },
        { label: '復帰', value: '3名', sub: '今月' },
        { label: '新規比', value: '4.1%', sub: '流入に対する割合' },
      ],
      charts: [
        {
          title: '中断理由内訳',
          subtitle: '対策優先度の判断',
          type: 'donut',
          segments: [
            { label: '転居', value: 3, color: '#94a3b8' },
            { label: '他院', value: 4, color: '#f59e0b' },
            { label: '経済', value: 2, color: '#ef4444' },
            { label: '不明', value: 3, color: '#cbd5e1' },
          ],
        },
        {
          title: '中断→復帰ファネル',
          subtitle: 'リテンション施策の効果',
          type: 'funnel',
          steps: [
            { label: '中断', value: 12 },
            { label: 'アプローチ', value: 9 },
            { label: '反応', value: 5 },
            { label: '復帰', value: 3 },
          ],
        },
        {
          title: '月別中断数',
          subtitle: 'トレンド監視',
          type: 'bar',
          labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
          values: [18, 16, 15, 14, 14, 12],
          color: '#f59e0b',
        },
        {
          title: 'リスク患者リスト',
          subtitle: '90日以上未来院',
          type: 'table',
          columns: ['患者', '最終来院', '担当', 'LTV'],
          rows: [
            ['中村 様', '92日前', '田中 Dr', '¥186,000'],
            ['藤田 様', '105日前', '佐藤 Dr', '¥142,000'],
            ['松本 様', '98日前', 'DH', '¥98,000'],
          ],
        },
      ],
    }),
    webBooking: () => ({
      kpis: [
        { label: 'WEB比率', value: '41.2%', sub: '全予約', trend: insightTrend('+5.1pt', true) },
        { label: 'WEB件数', value: '14件', sub: '本日' },
        { label: '新規比率', value: '36%', sub: 'WEB経由' },
        { label: 'CX率', value: '4.2%', sub: 'WEBのみ' },
      ],
      charts: [
        {
          title: 'メニュー構成',
          subtitle: '集客メニューの最適化',
          type: 'donut',
          segments: [
            { label: '定期検診', value: 36, color: '#2563eb' },
            { label: 'クリーニング', value: 30, color: '#0ea5e9' },
            { label: '初診', value: 20, color: '#6366f1' },
            { label: 'その他', value: 14, color: '#94a3b8' },
          ],
        },
        {
          title: '経路別予約',
          subtitle: '広告費対効果',
          type: 'hbar',
          items: [
            { label: 'Google', value: 42, color: '#2563eb' },
            { label: '公式サイト', value: 28, color: '#0ea5e9' },
            { label: 'LINE', value: 18, color: '#10b981' },
            { label: 'その他', value: 12, color: '#94a3b8' },
          ],
        },
        {
          title: '週別WEB予約',
          subtitle: '施策前後の比較',
          type: 'bar',
          labels: ['W1', 'W2', 'W3', 'W4'],
          values: [48, 52, 58, 62],
          color: '#2563eb',
        },
        {
          title: 'WEB vs 電話予約',
          subtitle: 'デジタルシフトの進捗',
          type: 'grouped-bar',
          labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
          groups: [
            { name: 'WEB', color: '#2563eb', values: [28, 30, 32, 35, 38, 41] },
            { name: '電話', color: '#94a3b8', values: [72, 70, 68, 65, 62, 59] },
          ],
          unit: '%',
        },
      ],
    }),
  };

  const builder = builders[pageId];
  if (!builder) return null;
  return builder();
}

function getInsightPageMeta(pageId) {
  return INSIGHT_PAGES[pageId] || null;
}
