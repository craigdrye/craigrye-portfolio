// === CONSTANTS ===

const COLORS = {
  science: "#007bff",
  economics: "#28a745",
  history: "#8b5cf6",
  politics: "#f97316",
  conspiracy: "#dc3545",
  pop_culture: "#ec4899",
  religion: "#eab308",
  sports: "#14b8a6",
  music: "#06b6d4",
  ink: "#1e293b",
  grid: "rgba(30, 41, 59, 0.05)",
};

const HIERARCHY = {
  science: {
    label: "Natural Sciences",
    class: "domain-science",
    subs: {
      sci_bio: "Biology & Genetics",
      sci_phys: "Physics & Astronomy",
      sci_chem: "Chemistry",
      sci_psych: "Psychology",
      sci_math: "Mathematics",
      sci_earth: "Earth & Climate"
    }
  },
  economics: {
    label: "Economics",
    class: "domain-economics",
    subs: {
      eco_macro: "Macro & Policy",
      eco_micro: "Micro & Behavioral",
      eco_theory: "Theory & History"
    }
  },
  history: {
    label: "History",
    class: "domain-history",
    subs: {
      hist_econ: "Economic History",
      hist_geo: "Geopolitics & Eras",
      hist_theory: "Historiography"
    }
  },
  politics: {
    label: "Political Science",
    class: "domain-politics",
    subs: {
      pol_ir: "International Relations",
      pol_theory: "Political Theory",
      pol_comp: "Comparative Politics"
    }
  },
  conspiracy: {
    label: "Conspiracy & Pseudoscience",
    class: "domain-conspiracy",
    subs: {
      con_mod: "Modern Political",
      con_tech: "Techno-Theories",
      con_classic: "Belief Systems"
    }
  },
  pop_culture: {
    label: "Popular Culture",
    subs: {
      pop_film: "Film",
      pop_tv: "Television",
      pop_gaming: "Gaming"
    }
  },
  religion: {
    label: "Religion & Philosophy",
    subs: {
      rel_major: "Major Systems",
      rel_texts: "Sacred Texts",
      rel_concepts: "Concepts"
    }
  },
  sports: {
    label: "Sports",
    subs: {
      spo_global: "Global Sports",
      spo_us: "US Centric",
      spo_events: "Mega Events"
    }
  },
  music: {
    label: "Music",
    subs: {
      mus_genres: "Genres",
      mus_tech: "Tech & Industry",
      mus_theory: "Theory & Composition"
    }
  }
};

// Cycling dash patterns for differentiating lines within a category
const DASH_PATTERNS = [
  [],           // solid
  [8, 4],       // dashed  --
  [2, 3],       // dotted  ..
  [8, 4, 2, 4], // dash-dot -.-
  [12, 4],      // long dash ---
  [2, 2],       // fine dots
  [6, 3, 2, 3, 2, 3], // dash-dot-dot -..-
  [14, 4, 2, 4],      // long dash-dot
];

const SOURCES = ['wiki', 'google', 'crossref', 'gdelt'];
const SOURCE_LABELS = { wiki: 'Wikipedia', google: 'Google', crossref: 'CrossRef', gdelt: 'GDELT' };

const getGroupColor = (bucketKey) => {
  let hash = 0;
  for (let i = 0; i < bucketKey.length; i++) {
      hash = bucketKey.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash) % 360;
  return `hsl(${h}, 70%, 55%)`;
};

const sanitizeId = (id) => id.replace(/[^a-zA-Z0-9_\-]/g, '_');

function parseMonth(mStr) {
  const y = parseInt(mStr.substring(0, 4));
  const m = parseInt(mStr.substring(4, 6)) - 1;
  return new Date(Date.UTC(y, m, 1));
}

function formatMonth(date) {
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short", timeZone: "UTC" });
}

function smoothSeries(data, windowSize = 12) {
  if (windowSize <= 1) return data;
  return data.map((point, i) => {
    let sum = 0, count = 0;
    for (let j = Math.max(0, i - windowSize + 1); j <= i; j++) {
      if (data[j].y !== null) {
        sum += data[j].y;
        count++;
      }
    }
    return { x: point.x, y: count > 0 ? sum / count : null };
  });
}

function normalizeSeries(data) {
  const values = data.map(d => d.y).filter(v => v !== null);
  if (values.length === 0) return data;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  return data.map(d => ({
    x: d.x,
    y: d.y !== null ? ((d.y - min) / range) * 100 : null
  }));
}

function calculateCorrelation(d1, d2) {
  if (!d1 || !d2 || d1.length < 5 || d2.length < 5) return null;
  const map2 = new Map(d2.map(p => [p.x.getTime(), p.y]));
  const pairs = d1.map(p => ({ y1: p.y, y2: map2.get(p.x.getTime()) }))
                 .filter(p => p.y1 !== null && p.y2 !== null);
  if (pairs.length < 5) return null;
  const n = pairs.length;
  const sum1 = pairs.reduce((a, b) => a + b.y1, 0);
  const sum2 = pairs.reduce((a, b) => a + b.y2, 0);
  const sum1Sq = pairs.reduce((a, b) => a + b.y1 * b.y1, 0);
  const sum2Sq = pairs.reduce((a, b) => a + b.y2 * b.y2, 0);
  const pSum = pairs.reduce((a, b) => a + b.y1 * b.y2, 0);
  const num = pSum - (sum1 * sum2 / n);
  const den = Math.sqrt((sum1Sq - sum1 * sum1 / n) * (sum2Sq - sum2 * sum2 / n));
  return den === 0 ? 0 : num / den;
}

// === DASHBOARD STATE ===

let charts = {};
let appData = null;
let eventsData = [];
let topicDashIndex = {}; // track which dash pattern index each topic gets


// === CHART DATASET FACTORY ===

function createDataset(label, data, color, borderWidth = 1.5, dashPattern = []) {
  return {
    label,
    data,
    borderColor: color,
    borderWidth,
    borderDash: dashPattern,
    tension: 0.3,
    pointRadius: 0,
    pointHitRadius: 10,
    spanGaps: true,
  };
}

// === CORE: UPDATE ALL 4 CHARTS ===

function getGlobalMinDate() {
  const activePill = document.querySelector('.time-pill.active');
  const yearsStr = activePill ? activePill.dataset.years : 'all';
  if (yearsStr === 'all') {
    return parseMonth(appData.googleStartMonth || '200401');
  } else {
    const now = new Date();
    return new Date(Date.UTC(now.getUTCFullYear() - parseInt(yearsStr), now.getUTCMonth(), 1));
  }
}

function updateDashboard() {
  if (!appData) return;

  const minDate = getGlobalMinDate();

  // Collect datasets for each source
  const sourceDatasets = { wiki: [], google: [], crossref: [], gdelt: [] };

  // Helper to get the right data array for a source
  // For wiki and crossref, always prefer share-based (% of total) over self-normalized
  function getSourceArray(series, source) {
    if (source === 'wiki') return series.wiki_share_pct_smoothed || series.wiki_smoothed;
    if (source === 'crossref') return series.crossref_share_pct_smoothed || series.crossref_smoothed;
    return series[`${source}_smoothed`] || null;
  }

  function addDataForSource(source, label, rawData, color, id, dashIdx, defaultWidth = 1.5) {
    if (!rawData) return;
    const isVisible = document.getElementById(`show-${id}`)?.checked;
    if (!isVisible) return;

    const thickness = parseFloat(document.getElementById(`thickness-${id}`)?.value) || defaultWidth;
    const offset = parseInt(document.getElementById(`offset-${id}`)?.value) || 0;
    const dash = DASH_PATTERNS[dashIdx % DASH_PATTERNS.length];

    let processed = rawData.map((d, i) => ({ x: parseMonth(appData.months[i]), y: d }));
    processed = processed.filter(d => d.x >= minDate);
    processed = normalizeSeries(processed);
    processed = smoothSeries(processed, 12);
    processed = processed.map(d => ({ x: d.x, y: d.y !== null ? d.y + offset : null }));

    sourceDatasets[source].push(createDataset(label, processed, color, thickness, dash));
  }

  // 1. Domain master indices
  if (appData.domainIndices) {
    for (const [domainKey, domain] of Object.entries(HIERARCHY)) {
      if (appData.domainIndices[domainKey]) {
        const idxData = appData.domainIndices[domainKey];
        SOURCES.forEach(src => {
          const arr = getSourceArray(idxData, src);
          if (arr) addDataForSource(src, `${domain.label} Index`, arr, COLORS[domainKey], domainKey, 0, 2.5);
        });
      }
    }
  }

  // 2. Sub-bucket indices + individual topics
  let globalTopicIdx = 0;
  for (const [domainKey, domain] of Object.entries(HIERARCHY)) {
    const domainBuckets = Object.keys(domain.subs);
    domainBuckets.forEach(bucketKey => {
      // Bucket aggregate
      if (appData.bucketIndices[bucketKey]) {
        const bIdx = appData.bucketIndices[bucketKey];
        SOURCES.forEach(src => {
          const arr = getSourceArray(bIdx, src);
          if (arr) addDataForSource(src, `${domain.subs[bucketKey]} Index`, arr, getGroupColor(bucketKey), bucketKey, 0, 2);
        });
      }

      // Individual topics
      const topics = appData.bucketTopics[bucketKey] || [];
      topics.forEach((topic, tIdx) => {
        const topicKey = `${bucketKey}__${topic}`;
        const series = appData.topicSeries[topicKey];
        if (series) {
          const safeId = sanitizeId(topicKey);
          const dashIdx = tIdx + 1; // offset by 1 so first topic isn't solid (reserves solid for aggregates)
          SOURCES.forEach(src => {
            const arr = getSourceArray(series, src);
            if (arr) addDataForSource(src, series.topic, arr, getGroupColor(bucketKey), safeId, dashIdx, 1.5);
          });
        }
      });
    });
  }

  // Build event annotations (only for checked events)
  const annotations = {};
  eventsData.forEach((ev, i) => {
    const checkbox = document.getElementById(`event-${i}`);
    if (!checkbox || !checkbox.checked) return;
    const evDate = parseMonth(ev.month);
    if (evDate < minDate) return;
    const domainColor = COLORS[ev.domain] || '#64748b';
    annotations[`event_${i}`] = {
      type: 'line',
      xMin: evDate,
      xMax: evDate,
      borderColor: domainColor,
      borderWidth: 1,
      borderDash: [4, 4],
      label: {
        display: true,
        content: ev.title,
        position: 'start',
        rotation: -90,
        backgroundColor: 'rgba(255,255,255,0.85)',
        color: domainColor,
        font: { size: 8, weight: 'bold' },
        padding: 2,
        yAdjust: -5,
      }
    };
  });

  // Update each chart
  SOURCES.forEach(src => {
    if (charts[src]) {
      charts[src].data.datasets = sourceDatasets[src];
      charts[src].options.plugins.annotation = { annotations };
      charts[src].update();
    }
  });

  // Correlation: use wiki chart's first two datasets
  const wikiDs = sourceDatasets.wiki;
  if (wikiDs.length >= 2) {
    const corr = calculateCorrelation(wikiDs[0].data, wikiDs[1].data);
    const display = document.getElementById('correlation-value');
    if (display) {
      if (corr !== null) {
        display.textContent = corr.toFixed(3);
        display.className = 'corr-value ' + (Math.abs(corr) > 0.7 ? 'corr-high' : Math.abs(corr) > 0.4 ? 'corr-med' : 'corr-low');
      } else {
        display.textContent = "N/A";
        display.className = 'corr-value';
      }
    }
  } else {
    const display = document.getElementById('correlation-value');
    if (display) display.textContent = "N/A";
  }
}

// === SIDEBAR ===

function calculateTopicTrend(series, minDate) {
  const data = series?.merged_smoothed;
  if (!data) return 0;
  
  let validPoints = [];
  data.forEach((y, i) => {
    const x = parseMonth(appData.months[i]);
    if (x >= minDate && y !== null) validPoints.push(y);
  });
  
  if (validPoints.length < 2) return 0;
  
  const startChunk = validPoints.slice(0, Math.min(3, validPoints.length));
  const endChunk = validPoints.slice(-3);
  const startAvg = startChunk.reduce((a, b) => a + b, 0) / startChunk.length;
  const endAvg = endChunk.reduce((a, b) => a + b, 0) / endChunk.length;
  
  return endAvg - startAvg;
}

function renderTopicRow(topic, bucketKey, domainKey) {
  const keyInSeries = `${bucketKey}__${topic}`;
  const cleanId = sanitizeId(keyInSeries);
  return `
    <div class="topic-row" data-topic="${topic.toLowerCase()}" data-bucket="${bucketKey}">
      <label class="topic-label">
        <input type="checkbox" id="show-${cleanId}" />
        <span>${topic.replace(/_/g, ' ')}</span>
      </label>
      <div class="mini-toggles">
        <input type="number" id="thickness-${cleanId}" class="thickness-input" value="1.5" min="1" max="8" />
        <input type="hidden" id="offset-${cleanId}" value="0" />
        <button class="offset-btn" data-id="${cleanId}" data-delta="-5">↓</button>
        <span id="offset-val-${cleanId}" class="offset-display">0</span>
        <button class="offset-btn" data-id="${cleanId}" data-delta="5">↑</button>
      </div>
    </div>
  `;
}

function populateSidebar(data) {
  const container = document.getElementById('topic-tree');
  container.innerHTML = "";

  for (const [domainKey, domain] of Object.entries(HIERARCHY)) {
    const domainDiv = document.createElement('div');
    domainDiv.className = `domain-group ${domain.class}`;
    
    let html = `
      <div class="domain-header">
        <span>${domain.label}</span>
        <button class="select-all-btn" data-domain="${domainKey}">Select All</button>
      </div>
      <div class="domain-master">
        <label class="topic-label" style="padding: 0.2rem 0.75rem 0.4rem; font-weight: bold; border-bottom: 1px solid rgba(255,255,255,0.05);">
            <input type="checkbox" id="show-${domainKey}" />
            <span>${domain.label} Index</span>
        </label>
      </div>`;

    for (const [bucketKey, subLabel] of Object.entries(domain.subs)) {
      const topics = data.bucketTopics[bucketKey] || [];
      if (topics.length === 0) continue;

      const minDate = getGlobalMinDate();
      let trendingUp = [];
      let trendingDown = [];

      topics.forEach(t => {
        const series = data.topicSeries[`${bucketKey}__${t}`];
        if (calculateTopicTrend(series, minDate) >= 0) trendingUp.push(t);
        else trendingDown.push(t);
      });

      const groupColor = getGroupColor(bucketKey);

      let topicsHtml = '';
      if (trendingUp.length > 0) {
        topicsHtml += `
          <div class="trend-group trend-up">
            <div class="trend-group-header"><span>🔥 Trending Up</span></div>
            ${trendingUp.map(t => renderTopicRow(t, bucketKey, domainKey)).join('')}
          </div>
        `;
      }
      if (trendingDown.length > 0) {
        topicsHtml += `
          <div class="trend-group trend-down">
            <div class="trend-group-header"><span>📉 Trending Down</span></div>
            ${trendingDown.map(t => renderTopicRow(t, bucketKey, domainKey)).join('')}
          </div>
        `;
      }

      html += `
        <details class="sub-group" open>
          <summary style="border-left: 3px solid ${groupColor}; background: linear-gradient(90deg, ${groupColor.replace('55%)', '95%)')} 0%, transparent 100%);">
            ${subLabel}
          </summary>
          <div class="sub-content">
            <div class="master-row">
                <label class="topic-label">
                    <input type="checkbox" id="show-${bucketKey}" />
                    <span>Aggregate Index</span>
                </label>
                <div class="mini-toggles">
                    <input type="number" id="thickness-${bucketKey}" class="thickness-input" value="2.5" />
                    <input type="hidden" id="offset-${bucketKey}" value="0" />
                    <button class="offset-btn" data-id="${bucketKey}" data-delta="-5">↓</button>
                    <span id="offset-val-${bucketKey}" class="offset-display">0</span>
                    <button class="offset-btn" data-id="${bucketKey}" data-delta="5">↑</button>
                </div>
            </div>
            <div class="select-all-sub-row">
              <label><input type="checkbox" class="select-all-sub" data-bucket="${bucketKey}" /> Select All</label>
            </div>
            ${topicsHtml}
          </div>
        </details>
      `;
    }
    domainDiv.innerHTML = html;
    container.appendChild(domainDiv);
  }
}

// === EVENT TOGGLES IN HEADER ===

function populateEventToggles() {
  const container = document.getElementById('event-toggles');
  if (!container) return;
  container.innerHTML = eventsData.map((ev, i) => {
    const domainColor = COLORS[ev.domain] || '#64748b';
    return `<label class="event-chip" style="border-left: 2px solid ${domainColor};">
      <input type="checkbox" id="event-${i}" />
      <span>${ev.title}</span>
    </label>`;
  }).join('');
}

// === CHART INITIALIZATION ===

function initCharts() {
  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { type: 'time', time: { unit: 'year' }, grid: { display: false }, ticks: { font: { size: 9 } } },
      y: { grid: { color: COLORS.grid }, ticks: { display: false } }
    },
    plugins: {
      legend: { display: false },
      tooltip: { mode: 'nearest', intersect: false },
      annotation: {}
    }
  };

  SOURCES.forEach(src => {
    const canvas = document.getElementById(`chart-${src}`);
    if (!canvas) return;
    charts[src] = new Chart(canvas, {
      type: 'line',
      data: { datasets: [] },
      options: {
        ...commonOptions,
        scales: {
          ...commonOptions.scales,
          y: { ...commonOptions.scales.y, title: { display: false } }
        }
      }
    });
  });
}

// === INITIALIZATION ===

async function init() {
  const ts = new Date().getTime();
  const [dataRes, eventsRes] = await Promise.all([
    fetch(`./data/processed/dashboard_data.json?t=${ts}`),
    fetch(`./data/processed/events.json?t=${ts}`)
  ]);
  appData = await dataRes.json();
  eventsData = await eventsRes.json();

  initCharts();
  populateSidebar(appData);
  populateEventToggles();

  // Tooltip overlay
  const tooltipEl = document.createElement('div');
  tooltipEl.id = 'event-tooltip';
  tooltipEl.style.display = 'none';
  document.body.appendChild(tooltipEl);

  // Wire search
  const searchInput = document.getElementById('topic-search');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase();
      const rows = document.querySelectorAll('.topic-row');
      rows.forEach(row => {
        const topic = row.dataset.topic;
        const matches = topic.includes(q);
        row.style.display = matches ? 'flex' : 'none';
        if (q.length > 1 && matches) {
           const details = row.closest('details');
           if (details) details.open = true;
        }
      });
    });
  }

  // Wire checkbox/select change events
  document.addEventListener('change', (e) => {
    if (e.target.matches('input[type="checkbox"]') || e.target.matches('input[type="number"]') || e.target.tagName === 'SELECT') {
      // Handle event chip active styling
      const chip = e.target.closest('.event-chip');
      if (chip) {
        chip.classList.toggle('active', e.target.checked);
      }
      updateDashboard();
    }
  });

  // Wire offset buttons
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.offset-btn');
    if (btn) {
      const id = btn.dataset.id;
      const delta = parseInt(btn.dataset.delta);
      const hidden = document.getElementById(`offset-${id}`);
      const display = document.getElementById(`offset-val-${id}`);
      if (hidden) {
        const val = parseInt(hidden.value) + delta;
        hidden.value = val;
        if (display) display.textContent = val;
        updateDashboard();
      }
    }

    // Select All buttons
    const selectAllBtn = e.target.closest('.select-all-btn');
    if (selectAllBtn) {
      const domainKey = selectAllBtn.dataset.domain;
      const domain = HIERARCHY[domainKey];
      if (!domain) return;

      // Determine if we should check or uncheck
      const allCheckboxes = [];
      for (const bucketKey of Object.keys(domain.subs)) {
        const topics = appData.bucketTopics[bucketKey] || [];
        topics.forEach(topic => {
          const safeId = sanitizeId(`${bucketKey}__${topic}`);
          const cb = document.getElementById(`show-${safeId}`);
          if (cb) allCheckboxes.push(cb);
        });
      }

      const allChecked = allCheckboxes.every(cb => cb.checked);
      allCheckboxes.forEach(cb => { cb.checked = !allChecked; });
      selectAllBtn.classList.toggle('active', !allChecked);
      updateDashboard();
    }
  });

  // Time pill buttons
  document.querySelectorAll('.time-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.time-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      
      // Keep track of which checkboxes were checked before wiping sidebar
      const checkedIds = Array.from(document.querySelectorAll('input[type="checkbox"]:checked')).map(cb => cb.id);
      
      // Re-populate sidebar to reflect new trends
      if (appData) populateSidebar(appData);
      
      // Restore checkbox states
      checkedIds.forEach(id => {
        const cb = document.getElementById(id);
        if (cb) cb.checked = true;
      });
      
      updateDashboard();
    });
  });

  // Select All (sub-bucket) checkboxes
  document.addEventListener('change', (e) => {
    if (e.target.classList.contains('select-all-sub')) {
      const bucketKey = e.target.dataset.bucket;
      const checked = e.target.checked;
      const topics = appData.bucketTopics[bucketKey] || [];
      topics.forEach(topic => {
        const safeId = sanitizeId(`${bucketKey}__${topic}`);
        const cb = document.getElementById(`show-${safeId}`);
        if (cb) cb.checked = checked;
      });
      updateDashboard();
    }
  });

  // Set default selections requested by the user
  const defaultSelectors = [
    '#show-science',
    '.topic-row[data-topic="big_bang"] input',
    '.topic-row[data-topic="ocean_acidification"] input',
    '#show-spo_us',
    '#show-music',
    '.topic-row[data-topic="homeopathy"] input'
  ];
  defaultSelectors.forEach(sel => {
    const el = document.querySelector(sel);
    if (el) el.checked = true;
  });

  updateDashboard();
}

// Sync with parent portfolio's light/dark mode
window.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'THEME_CHANGE') {
    document.documentElement.setAttribute('data-theme', event.data.payload);
  }
});

init().catch(console.error);
