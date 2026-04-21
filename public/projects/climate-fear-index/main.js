import Chart from 'chart.js/auto';
import 'chartjs-adapter-luxon';
import annotationPlugin from 'chartjs-plugin-annotation';
import { DateTime } from 'luxon';

// Datasets
import historicalTrends from './historical_data.json';
import mediaData from './media_data.json';
import sentimentData from './sentiment_data.json';
import physicalData from './physical_data.json';
import consequenceData from './consequence_data.json';
import marketData from './market_data.json';
import solutionsData from './solutions_data.json';
import baselineData from './baseline_data.json';
import institutionalData from './institutional_data.json';
import humanImpactData from './human_impact_data.json';
import climateIndices from './climate_indices.json';
import meiData from './mei_data.json';

// This file drives the live dashboard at the repo root.
// The app is organized in five chunks:
// 1. Constants / plugins
// 2. Data processing helpers
// 3. Scatter helpers
// 4. updateDashboard() data assembly
// 5. Chart rendering + UI wiring

Chart.register(annotationPlugin);
Chart.defaults.elements.point.radius = 0;
Chart.defaults.elements.point.hitRadius = 14;
Chart.defaults.elements.point.hoverRadius = 6;

const ARTICLES = [
  { title: 'Climate_change', weight: 1.0 }, { title: 'Global_warming', weight: 1.0 },
  { title: 'Tipping_points_in_the_climate_system', weight: 2.5 }, { title: 'Climate_crisis', weight: 1.8 },
  { title: 'Eco-anxiety', weight: 2.2 }, { title: 'Extinction_Rebellion', weight: 1.5 },
  { title: 'Greta_Thunberg', weight: 1.5 }, { title: 'Holocene_extinction', weight: 2.5 },
  { title: 'Climate_apocalypse', weight: 3.5 }
];

const API_BASE = 'https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/en.wikipedia/all-access/all-agents';
const AGGREGATE_API_BASE = 'https://wikimedia.org/api/rest_v1/metrics/pageviews/aggregate/en.wikipedia/all-access/all-agents';
let discourseChartInstance = null;
let temperatureChartInstance = null;
let scatterChartInstance = null;
let sharedHoverXValue = null;
const FIXED_AXIS_WIDTH = 85;
const KEY_EVENTS = [
  { id: 'ar4', date: '2007-11-17', label: 'IPCC AR4', color: 'rgba(0, 151, 183, 0.45)' },
  { id: 'copenhagen', date: '2009-12-18', label: 'COP15', color: 'rgba(34, 34, 34, 0.28)' },
  { id: 'ar5wg1', date: '2013-09-27', label: 'IPCC AR5', color: 'rgba(0, 151, 183, 0.45)' },
  { id: 'paris', date: '2015-12-12', label: 'Paris', color: 'rgba(34, 34, 34, 0.35)' },
  { id: 'sr15', date: '2018-10-08', label: 'IPCC 1.5C', color: 'rgba(0, 151, 183, 0.45)' },
  { id: 'covid', date: '2020-03-16', label: 'COVID Crash', color: 'rgba(204, 34, 51, 0.45)' },
  { id: 'glasgow', date: '2021-11-13', label: 'COP26', color: 'rgba(34, 34, 34, 0.35)' },
  { id: 'ar6', date: '2023-03-20', label: 'IPCC AR6', color: 'rgba(0, 151, 183, 0.45)' }
];
const HIGHLIGHT_PERIODS = [
  '2007-01-01',
  '2010-01-01',
  '2016-01-01',
  '2020-01-01',
  '2024-01-01'
];

const sharedCrosshairPlugin = {
  id: 'sharedCrosshair',
  afterDraw(chart) {
    if (sharedHoverXValue === null) return;
    const xScale = chart.scales.x;
    const chartArea = chart.chartArea;
    if (!xScale || !chartArea) return;

    const xPixel = xScale.getPixelForValue(sharedHoverXValue);
    if (!Number.isFinite(xPixel)) return;

    const { ctx } = chart;
    ctx.save();
    ctx.beginPath();
    ctx.setLineDash([5, 5]);
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(107, 114, 128, 0.85)';
    ctx.moveTo(xPixel, chartArea.top);
    ctx.lineTo(xPixel, chartArea.bottom);
    ctx.stroke();
    ctx.restore();
  }
};

Chart.register(sharedCrosshairPlugin);

async function fetchPageviews(article, start, end) {
  const url = `${API_BASE}/${article}/daily/${start}/${end}`;
  try {
    const response = await fetch(url, { headers: { 'User-Agent': 'ClimateIntelligence/5.2' } });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    return data.items.map(item => ({
      x: DateTime.fromFormat(item.timestamp, 'yyyyMMddHH').toJSDate(),
      y: item.views
    }));
  } catch (error) { return []; }
}

async function fetchTotalWikipediaViews(start, end) {
  const url = `${AGGREGATE_API_BASE}/daily/${start}/${end}`;
  try {
    const response = await fetch(url, { headers: { 'User-Agent': 'ClimateIntelligence/5.2' } });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    return data.items.map(item => ({
      x: DateTime.fromFormat(item.timestamp, 'yyyyMMdd00').toJSDate(),
      y: item.views
    }));
  } catch (error) { return []; }
}

function calculateIndex(allData) {
  const dateMap = new Map();
  const articleAverages = ARTICLES.map((art, idx) => {
    const views = (allData[idx] || []).map(d => d.y);
    const avg = views.reduce((a, b) => a + b, 0) / (views.length || 1);
    return avg || 1;
  });
  allData.forEach((articleData, idx) => {
    const weight = ARTICLES[idx].weight;
    const avg = articleAverages[idx];
    (articleData || []).forEach(point => {
      const dateStr = point.x.toISOString().split('T')[0];
      if (!dateMap.has(dateStr)) dateMap.set(dateStr, { date: point.x, totalWeight: 0, weightedSum: 0 });
      const dayData = dateMap.get(dateStr);
      dayData.weightedSum += (point.y / avg) * weight;
      dayData.totalWeight += weight;
    });
  });
  return Array.from(dateMap.values())
    .map(d => ({ x: d.date, y: (d.weightedSum / d.totalWeight) * 100 }))
    .sort((a, b) => a.x - b.x);
}

function calculateWikiShareSeries(allData, totalViewsSeries) {
  const articleDayTotals = new Map();
  allData.forEach((articleData) => {
    (articleData || []).forEach(point => {
      const dateStr = point.x.toISOString().split('T')[0];
      articleDayTotals.set(dateStr, (articleDayTotals.get(dateStr) || 0) + point.y);
    });
  });

  return totalViewsSeries
    .map(point => {
      const dateStr = point.x.toISOString().split('T')[0];
      const articleViews = articleDayTotals.get(dateStr) || 0;
      return {
        x: point.x,
        y: point.y > 0 ? (articleViews / point.y) * 100 : 0
      };
    })
    .filter(point => point.y > 0)
    .sort((a, b) => a.x - b.x);
}

// v5.2 Statistical Engine Logic — Log-Linear Detrending
// Fits a straight line to log(y), then returns residuals (log-scale anomalies).
// This correctly models exponential growers (CO2, EV, Solar) and avoids
// the "ends pulled down" artifact from linear detrending on curved data.
function detrendSeries(data) {
  if (data.length < 2) return data;

  // Filter to only positive values for log transform (keep indices aligned)
  const valid = data.map((d, i) => ({ ...d, i })).filter(d => d.y > 0);
  if (valid.length < 2) return data;

  const logVals = valid.map(d => Math.log(d.y));
  const n = logVals.length;
  let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
  for (let k = 0; k < n; k++) {
    const x = valid[k].i;
    sumX += x; sumY += logVals[k];
    sumXY += x * logVals[k]; sumXX += x * x;
  }
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  // Return log-residuals: log(y) - fitted_log_trend
  // These are dimensionless anomalies (like % deviation from exponential trend)
  return data.map((d, i) => {
    if (d.y <= 0) return { x: d.x, y: 0 };
    return { x: d.x, y: Math.log(d.y) - (slope * i + intercept) };
  });
}

function normalizeSeries(data) {
  if (data.length === 0) return data;
  const vals = data.map(d => d.y);
  const min = Math.min(...vals), max = Math.max(...vals);
  const range = (max - min) || 1;
  return data.map(d => ({ x: d.x, y: ((d.y - min) / range) * 100 }));
}

function smoothSeries(data, windowSize) {
  if (windowSize <= 1 || data.length < windowSize) return data;
  const result = [];
  for (let i = 0; i < data.length; i++) {
    let sum = 0, count = 0;
    for (let j = Math.max(0, i - windowSize + 1); j <= i; j++) {
      sum += data[j].y; count++;
    }
    result.push({ x: data[i].x, y: sum / count });
  }
  return result;
}

function rollingMaximum(data, windowSize) {
  if (windowSize <= 1 || data.length < windowSize) return data;
  const result = [];
  for (let i = 0; i < data.length; i++) {
    let max = -Infinity;
    for (let j = Math.max(0, i - windowSize + 1); j <= i; j++) {
      if (data[j].y > max) max = data[j].y;
    }
    result.push({ x: data[i].x, y: max });
  }
  return result;
}

function rateOfChange(data) {
  // Computes year-on-year rate of change (°C/yr or equivalent units/yr)
  if (data.length < 2) return data;
  const result = [];
  for (let i = 1; i < data.length; i++) {
    const dtMs = data[i].x - data[i - 1].x;
    const dtYears = dtMs / (1000 * 60 * 60 * 24 * 365.25);
    const dy = data[i].y - data[i - 1].y;
    result.push({ x: data[i].x, y: dtYears > 0 ? dy / dtYears : 0 });
  }
  return result;
}

function getUnifiedDiscourseSeries(fearIndex, minDate, smoothingWindow) {
  // The unified discourse line is built from the four discourse components
  // after detrending/normalizing, then smoothed into a slower composite index.
  const unifiedOffset = parseInt(document.getElementById('offset-unified')?.value) || 0;
  const components = [
    fearIndex,
    filterData(mediaData, minDate),
    filterData(sentimentData, minDate),
    filterKey(baselineData, minDate, 'climate')
  ];
  const processedComponents = components.map(c => normalizeSeries(detrendSeries(c)));
  const dateMap = new Map();

  processedComponents.forEach(series => {
    series.forEach(point => {
      const time = point.x.getTime();
      if (!dateMap.has(time)) dateMap.set(time, { x: point.x, sum: 0, count: 0 });
      const entry = dateMap.get(time);
      entry.sum += point.y;
      entry.count++;
    });
  });

  const unifiedRaw = Array.from(dateMap.values())
    .map(entry => ({ x: entry.x, y: entry.sum / entry.count }))
    .sort((a, b) => a.x - b.x);

  const maxedRaw = rollingMaximum(unifiedRaw, 30);
  return smoothSeries(maxedRaw, smoothingWindow).map(point => ({ x: point.x, y: point.y + unifiedOffset }));
}

function getProcessedSeries(rawData, axis, toggleId) {
  const isDetrended = document.getElementById(`d-${toggleId}`)?.checked;
  const offsetEl = document.getElementById(`offset-${toggleId}`);
  const seriesOffset = offsetEl ? (parseInt(offsetEl.value) || 0) : 0;
  let processed = [...rawData];

  if (isDetrended) {
    processed = detrendSeries(processed);
    if (axis === 'y') {
      processed = normalizeSeries(processed);
      processed = processed.map(point => ({ x: point.x, y: point.y + seriesOffset }));
    }
    if (axis === 'yTrends') processed = normalizeSeries(processed);
  } else if (axis === 'y') {
    processed = normalizeSeries(processed);
    processed = processed.map(point => ({ x: point.x, y: point.y + seriesOffset }));
  }

  return processed;
}

function registerScatterSeries(store, key, label, data) {
  store[key] = { label, data };
}

function buildScatterPoints(ySeries, xSeries) {
  const xByDate = new Map(xSeries.map(point => [point.x.toISOString().split('T')[0], point]));
  return ySeries
    .map(point => {
      const dateKey = point.x.toISOString().split('T')[0];
      const xPoint = xByDate.get(dateKey);
      if (!xPoint) return null;
      return {
        x: xPoint.y,
        y: point.y,
        date: dateKey
      };
    })
    .filter(Boolean);
}

function renderScatterChart(points, xLabel, yLabel) {
  const ctx = document.getElementById('correlationScatterChart').getContext('2d');
  if (scatterChartInstance) scatterChartInstance.destroy();

  scatterChartInstance = new Chart(ctx, {
    type: 'scatter',
    data: {
      datasets: [{
        label: `${yLabel} vs ${xLabel}`,
        data: points,
        pointRadius: 4,
        pointHoverRadius: 5,
        pointBackgroundColor: 'rgba(0, 151, 183, 0.72)',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#161b2a',
          titleColor: '#00d2ff',
          bodyColor: '#e2e8f0',
          callbacks: {
            title(items) {
              return items[0]?.raw?.date || '';
            },
            label(context) {
              const point = context.raw;
              return `${xLabel}: ${point.x.toFixed(2)} | ${yLabel}: ${point.y.toFixed(2)}`;
            }
          }
        }
      },
      scales: {
        x: {
          title: { display: true, text: xLabel, color: '#4a5568' },
          ticks: { color: '#4a5568' },
          grid: { color: 'rgba(0, 0, 0, 0.06)' }
        },
        y: {
          title: { display: true, text: yLabel, color: '#4a5568' },
          ticks: { color: '#4a5568' },
          grid: { color: 'rgba(0, 0, 0, 0.06)' },
          min: 0,
          max: 40
        }
      }
    }
  });
}

async function updateDashboard() {
  // This is the central render pass:
  // read UI state -> prepare series -> render both time-series charts -> render scatter.
  const mode = document.getElementById('date-range').value;
  const smoothingWindow = 80;

  const now = DateTime.now();
  let wikiStart = (mode === 'deep' || mode === 'all') ? '2015070100' : now.minus({ days: parseInt(mode) }).toFormat('yyyyMMdd00');
  let wikiEnd = now.toFormat('yyyyMMdd00');

  const [results, totalWikipediaViews] = await Promise.all([
    Promise.all(ARTICLES.map(art => fetchPageviews(art.title, wikiStart, wikiEnd))),
    fetchTotalWikipediaViews(wikiStart, wikiEnd)
  ]);
  let fearIndex = calculateIndex(results);
  const fearWikiShare = smoothSeries(calculateWikiShareSeries(results, totalWikipediaViews), 30);

  if (mode === 'deep') {
    // Pre-smooth the highly volatile daily Wikipedia data (30-day MA) to match monthly historical volatility
    fearIndex = smoothSeries(fearIndex, 30);

    const histDataRaw = historicalTrends.data.map(d => ({ x: DateTime.fromISO(d.date).toJSDate(), y: d.value }));
    const histData = [];
    
    // Interpolate the monthly historical data to a daily frequency
    for (let i = 0; i < histDataRaw.length - 1; i++) {
      const start = histDataRaw[i];
      const end = histDataRaw[i + 1];
      const days = Math.round((end.x - start.x) / (1000 * 60 * 60 * 24));
      
      for (let j = 0; j < days; j++) {
        const interpolatedY = start.y + (end.y - start.y) * (j / days);
        histData.push({
          x: new Date(start.x.getTime() + j * (1000 * 60 * 60 * 24)),
          y: interpolatedY
        });
      }
    }
    histData.push(histDataRaw[histDataRaw.length - 1]);

    const scaleFactor = (fearIndex[0]?.y || 100) / (histData[histData.length - 1].y || 1);
    fearIndex = [...histData.map(d => ({ x: d.x, y: d.y * scaleFactor })), ...fearIndex];
  }

  const minDate = fearIndex[0].x;
  const discourseDatasets = [];
  const temperatureDatasets = [];
  const scatterSeries = {};

  // Shared series registration helper used by both the discourse chart
  // and the potential-drivers chart.
  const addData = (label, rawData, color, axis, toggleId, defaultBorderWidth = 2, target = 'discourse', renderAxisID = axis) => {
    const isVisible = document.getElementById(`show-${toggleId}`)?.checked;
    if (!isVisible) return;

    // Read per-series thickness (falls back to defaultBorderWidth)
    const thicknessEl = document.getElementById(`thickness-${toggleId}`);
    const borderWidth = thicknessEl ? (parseInt(thicknessEl.value) || defaultBorderWidth) : defaultBorderWidth;
    const processed = getProcessedSeries(rawData, axis, toggleId);

    const dataset = createDataset(label, processed, color, renderAxisID, false, 0, borderWidth);
    if (target === 'temperature') {
      temperatureDatasets.push(dataset);
    } else {
      discourseDatasets.push(dataset);
    }
    registerScatterSeries(scatterSeries, toggleId, label, processed);
  };


  if (document.getElementById('show-unified-discourse').checked) {
    const unifiedThickness = parseInt(document.getElementById('thickness-unified')?.value) || 2;
    const unifiedData = getUnifiedDiscourseSeries(fearIndex, minDate, smoothingWindow);
    discourseDatasets.push(createDataset('Composite Discourse Indicator', unifiedData, '#111111', 'y', false, 0, unifiedThickness));
    registerScatterSeries(scatterSeries, 'unified', 'Composite Discourse Indicator', unifiedData);
  } else {
    registerScatterSeries(scatterSeries, 'unified', 'Composite Discourse Indicator', getUnifiedDiscourseSeries(fearIndex, minDate, smoothingWindow));
  }

  registerScatterSeries(scatterSeries, 'fear', 'Public Anxiety Share (% en.wiki)', fearWikiShare);
  registerScatterSeries(scatterSeries, 'media', 'News Media Volume', getProcessedSeries(filterData(mediaData, minDate), 'y', 'media'));
  registerScatterSeries(scatterSeries, 'pulse', 'Social Media Sentiment', getProcessedSeries(filterData(sentimentData, minDate), 'y', 'pulse'));
  registerScatterSeries(scatterSeries, 'climateBase', 'Web Search Volume (Climate)', getProcessedSeries(filterKey(baselineData, minDate, 'climate'), 'y', 'climateBase'));

  const tempSeries = getProcessedSeries(filterKey(physicalData, minDate, 'temp'), 'yTemp', 'temp');
  const tempRateRaw = rateOfChange(filterKey(physicalData, minDate, 'temp'));
  const co2Series = getProcessedSeries(filterKey(physicalData, minDate, 'co2'), 'yCO2', 'co2');
  const ensoSeries = getProcessedSeries(filterData(climateIndices, minDate), 'yENSO', 'enso');
  const meiSeries = getProcessedSeries(filterData(meiData, minDate), 'yENSO', 'mei');
  const disasterSeries = getProcessedSeries(filterKey(consequenceData, minDate, 'frequency'), 'yDisaster', 'disaster');
  const shiftedCostData = filterKey(consequenceData, minDate, 'cost_billions').map(d => {
    let newDate = new Date(d.x);
    newDate.setMonth(newDate.getMonth() + 6);
    return { x: newDate, y: d.y };
  });
  const costSeries = getProcessedSeries(shiftedCostData, 'yCost', 'cost');
  const displacementSeries = getProcessedSeries(filterData(humanImpactData, minDate), 'yImpact', 'displacement');
  const coalSeries = getProcessedSeries(filterKey(institutionalData, minDate, 'coal_share'), 'yCoal', 'coal');
  const litigationSeries = getProcessedSeries(filterKey(institutionalData, minDate, 'litigation_cases'), 'yLitigation', 'litigation');
  const carbonSeries = getProcessedSeries(filterData(marketData, minDate), 'yCarbon', 'carbon');
  const evSeries = getProcessedSeries(filterKey(solutionsData, minDate, 'ev_sales'), 'yEV', 'ev');
  const solarSeries = getProcessedSeries(filterKey(solutionsData, minDate, 'solar_gw'), 'ySolar', 'solar');

  registerScatterSeries(scatterSeries, 'temp', 'Global Surface Temp Anomaly (°C)', tempSeries);
  registerScatterSeries(scatterSeries, 'tempRate', 'Derivative Temp Change (°C/yr)', getProcessedSeries(tempRateRaw, 'yTemp', 'tempRate'));
  registerScatterSeries(scatterSeries, 'co2', 'Atmospheric CO2 (ppm)', co2Series);
  registerScatterSeries(scatterSeries, 'enso', 'ENSO (ONI)', ensoSeries);
  registerScatterSeries(scatterSeries, 'mei', 'Multivariate ENSO Index (MEI)', meiSeries);
  registerScatterSeries(scatterSeries, 'disaster', 'Extreme Event Frequency', disasterSeries);
  registerScatterSeries(scatterSeries, 'cost', 'Economic Damages ($B)', costSeries);
  registerScatterSeries(scatterSeries, 'displacement', 'Climate-Driven Displacement (M)', displacementSeries);
  registerScatterSeries(scatterSeries, 'coal', 'Global Coal Generation Share (%)', coalSeries);
  registerScatterSeries(scatterSeries, 'litigation', 'Climate Litigation Cases', litigationSeries);
  registerScatterSeries(scatterSeries, 'carbon', 'EUA Carbon Price (€)', carbonSeries);
  registerScatterSeries(scatterSeries, 'ev', 'Electric Vehicle Sales', evSeries);
  registerScatterSeries(scatterSeries, 'solar', 'Solar PV Capacity', solarSeries);

  // Categories 1-5
  if (document.getElementById('show-fear')?.checked) {
    const fearThickness = parseInt(document.getElementById('thickness-fear')?.value) || 1;
    discourseDatasets.push(
      createDataset('Public Anxiety Share (% en.wiki)', fearWikiShare, '#0097b7', 'yWikiShare', false, 0, fearThickness)
    );
  }
  addData('News Media Volume', filterData(mediaData, minDate), '#e07b00', 'y', 'media', 1, 'discourse', 'y');
  addData('Social Media Sentiment', filterData(sentimentData, minDate), '#9b00cc', 'y', 'pulse', 1, 'discourse', 'y');
  addData('Web Search Volume (Climate)', filterKey(baselineData, minDate, 'climate'), '#00a85a', 'y', 'climateBase', 1, 'discourse', 'y');

  addData('Global Surface Temp Anomaly (°C)', filterKey(physicalData, minDate, 'temp'), '#cc2233', 'yTemp', 'temp', 1, 'temperature', 'yTempLeft');
  // Rate of change of temp — computed from raw data before filtering
  addData('Derivative Temp Change (°C/yr)', tempRateRaw, '#ff7f50', 'yTemp', 'tempRate', 1, 'temperature', 'yTempLeft');
  addData('Atmospheric CO2 (ppm)', filterKey(physicalData, minDate, 'co2'), '#5a6370', 'yCO2', 'co2', 1, 'temperature', 'yTempRight');
  
  addData('ENSO (ONI)', filterData(climateIndices, minDate), '#ff4d4d', 'yENSO', 'enso', 1, 'temperature', 'yTempRight');
  addData('Multivariate ENSO Index (MEI)', filterData(meiData, minDate), '#ffda79', 'yENSO', 'mei', 1, 'temperature', 'yTempRight');

  addData('Extreme Event Frequency', filterKey(consequenceData, minDate, 'frequency'), '#eccc68', 'yDisaster', 'disaster', 1, 'temperature', 'yTempRight');
  
  // Shift cost data by 6 months to peak in the middle of the year
  addData('Economic Damages ($B)', shiftedCostData, '#ffb8b8', 'yCost', 'cost', 1, 'temperature', 'yTempRight');
  
  addData('Climate-Driven Displacement (M)', filterData(humanImpactData, minDate), '#ff5722', 'yImpact', 'displacement', 1, 'temperature', 'yTempRight');

  addData('Global Coal Generation Share (%)', filterKey(institutionalData, minDate, 'coal_share'), '#212121', 'yCoal', 'coal', 1, 'temperature', 'yTempRight');
  addData('Climate Litigation Cases', filterKey(institutionalData, minDate, 'litigation_cases'), '#ffd700', 'yLitigation', 'litigation', 1, 'temperature', 'yTempRight');
  addData('EUA Carbon Price (€)', filterData(marketData, minDate), '#2ed573', 'yCarbon', 'carbon', 1, 'temperature', 'yTempRight');
  addData('Electric Vehicle Sales', filterKey(solutionsData, minDate, 'ev_sales'), '#4ef5ff', 'yEV', 'ev', 1, 'temperature', 'yTempRight');
  addData('Solar PV Capacity', filterKey(solutionsData, minDate, 'solar_gw'), '#ffd93d', 'ySolar', 'solar', 1, 'temperature', 'yTempRight');

  renderTemperatureChart(temperatureDatasets, mode === 'deep');
  renderDiscourseChart(discourseDatasets, mode === 'deep');

  const selectedDiscourse = document.getElementById('scatter-discourse-series')?.value || 'unified';
  const selectedComparison = document.getElementById('scatter-comparison-series')?.value || 'temp';
  const discourseSeries = scatterSeries[selectedDiscourse] || scatterSeries.unified || Object.values(scatterSeries)[0];
  const comparisonSeries = scatterSeries[selectedComparison] || scatterSeries.temp || Object.values(scatterSeries)[0];

  if (discourseSeries && comparisonSeries) {
    const scatterPoints = buildScatterPoints(discourseSeries.data, comparisonSeries.data);
    renderScatterChart(scatterPoints, comparisonSeries.label, discourseSeries.label);
  }
}

function filterData(source, minDate) { return source.data.map(d => ({ x: DateTime.fromISO(d.date).toJSDate(), y: d.value })).filter(d => d.x >= minDate); }
function filterKey(source, minDate, key) { return source.data.map(d => ({ x: DateTime.fromISO(d.date).toJSDate(), y: d[key] })).filter(d => d.x >= minDate); }

function createDataset(label, data, color, yAxisID, fill = false, fillAlpha = 0, borderWidth = 2) {
  return { label, data, borderColor: color, backgroundColor: fill ? hexToRgba(color, fillAlpha) : color, borderWidth, fill, pointRadius: 0, tension: 0.3, yAxisID };
}

function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
  if (hex.length > 7) return `rgba(${r}, ${g}, ${b}, ${parseInt(hex.slice(7, 9), 16) / 255})`;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function buildEventAnnotations() {
  // These annotations are reused on both time-series charts so the
  // highlighted periods and milestone lines stay visually aligned.
  const periodAnnotations = HIGHLIGHT_PERIODS.map((startDate, index) => {
    const start = DateTime.fromISO(startDate);
    const end = start.plus({ months: 6 });
    return [
      `highlight-${index}`,
      {
        type: 'box',
        xMin: start.toJSDate(),
        xMax: end.toJSDate(),
        backgroundColor: 'rgba(196, 181, 253, 0.16)',
        borderWidth: 0,
        drawTime: 'beforeDatasetsDraw'
      }
    ];
  });

  const lineAnnotations = KEY_EVENTS.map(event => [
    event.id,
    {
      type: 'line',
      xMin: DateTime.fromISO(event.date).toJSDate(),
      xMax: DateTime.fromISO(event.date).toJSDate(),
      borderColor: event.color,
      borderWidth: 1.5,
      borderDash: [4, 4],
      label: {
        display: true,
        content: event.label,
        rotation: -90,
        position: 'start',
        backgroundColor: 'rgba(255, 255, 255, 0.85)',
        color: '#334155',
        padding: 3,
        font: { size: 9, weight: '600' }
      }
    }
  ]);

  return Object.fromEntries([...periodAnnotations, ...lineAnnotations]);
}

function syncSharedHover(chart, activeElements) {
  if (activeElements?.length) {
    const active = activeElements[0];
    const point = chart.data.datasets[active.datasetIndex]?.data?.[active.index];
    sharedHoverXValue = point?.x ?? null;
  } else {
    sharedHoverXValue = null;
  }

  discourseChartInstance?.draw();
  temperatureChartInstance?.draw();
}

function fixedAxisWidth() {
  return {
    afterFit(scale) {
      scale.width = FIXED_AXIS_WIDTH;
    }
  };
}

function renderDiscourseChart(datasets, isDeep) {
  const ctx = document.getElementById('intelligenceChart').getContext('2d');
  if (discourseChartInstance) discourseChartInstance.destroy();
  discourseChartInstance = new Chart(ctx, {
    type: 'line', data: { datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { intersect: false, mode: 'index' },
      onHover: (_event, activeElements, chart) => syncSharedHover(chart, activeElements),
      plugins: {
        legend: { display: true, position: 'top', labels: { color: '#94a3b8', boxWidth: 10, font: { size: 10 } } },
        tooltip: { backgroundColor: '#161b2a', titleColor: '#00d2ff', bodyColor: '#e2e8f0' },
        annotation: {
          annotations: buildEventAnnotations()
        }
      },
      scales: {
        x: { type: 'time', time: { unit: isDeep ? 'year' : 'month' }, ticks: { color: '#4a5568' }, grid: { display: false }, max: new Date('2024-12-31').getTime() },
        y: {
          title: { display: true, text: 'Discourse Intensity' },
          ticks: { color: '#4a5568' },
          min: -40,
          max: 60,
          ...fixedAxisWidth()
        },
        yWikiShare: {
          position: 'right',
          title: { display: true, text: 'Selected climate pages (% of en.wiki)' },
          ticks: { color: '#4a5568' },
          grid: { drawOnChartArea: false },
          ...fixedAxisWidth()
        }
      }
    }
  });
  discourseChartInstance.canvas.onmouseleave = () => {
    sharedHoverXValue = null;
    discourseChartInstance?.draw();
    temperatureChartInstance?.draw();
  };
}

function renderTemperatureChart(datasets, isDeep) {
  const ctx = document.getElementById('temperatureChart').getContext('2d');
  if (temperatureChartInstance) temperatureChartInstance.destroy();
  temperatureChartInstance = new Chart(ctx, {
    type: 'line', data: { datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { intersect: false, mode: 'index' },
      onHover: (_event, activeElements, chart) => syncSharedHover(chart, activeElements),
      plugins: {
        legend: { display: true, position: 'top', labels: { color: '#94a3b8', boxWidth: 10, font: { size: 10 } } },
        tooltip: { backgroundColor: '#161b2a', titleColor: '#00d2ff', bodyColor: '#e2e8f0' },
        annotation: {
          annotations: buildEventAnnotations()
        }
      },
      scales: {
        x: { type: 'time', time: { unit: isDeep ? 'year' : 'month' }, ticks: { color: '#4a5568' }, grid: { display: false }, max: new Date('2024-12-31').getTime() },
        yTempLeft: {
          title: { display: true, text: 'Temp (°C)' },
          ticks: { color: '#4a5568' },
          ...fixedAxisWidth()
        },
        yTempRight: {
          position: 'right',
          title: { display: true, text: 'Comparison Scale' },
          ticks: { color: '#4a5568' },
          grid: { drawOnChartArea: false },
          ...fixedAxisWidth()
        }
      }
    }
  });
  temperatureChartInstance.canvas.onmouseleave = () => {
    sharedHoverXValue = null;
    discourseChartInstance?.draw();
    temperatureChartInstance?.draw();
  };
}

function init() {
  // Bootstraps the static sidebar UI, then hands ongoing updates to updateDashboard().
  const container = document.getElementById('topics-list');
  const bulkToggle = document.getElementById('toggle-all-discourse');
  const discourseToggleIds = ['show-fear', 'show-media', 'show-pulse', 'show-climateBase'];
  ARTICLES.forEach(art => {
    const el = document.createElement('div');
    el.className = 'topic-tag active';
    el.textContent = art.title.replace(/_/g, ' ');
    container.appendChild(el);
  });

  function syncBulkDiscourseToggle() {
    if (!bulkToggle) return;
    const toggles = discourseToggleIds
      .map(id => document.getElementById(id))
      .filter(Boolean);
    const checkedCount = toggles.filter(toggle => toggle.checked).length;
    bulkToggle.checked = checkedCount === toggles.length;
    bulkToggle.indeterminate = checkedCount > 0 && checkedCount < toggles.length;
  }

  // Wire all standard inputs
  document.querySelectorAll('input[type="checkbox"], select, input[type="number"]').forEach(input => input.addEventListener('input', updateDashboard));

  discourseToggleIds.forEach(id => {
    const toggle = document.getElementById(id);
    toggle?.addEventListener('input', syncBulkDiscourseToggle);
  });

  bulkToggle?.addEventListener('input', () => {
    discourseToggleIds.forEach(id => {
      const toggle = document.getElementById(id);
      if (toggle) toggle.checked = bulkToggle.checked;
    });
    bulkToggle.indeterminate = false;
    updateDashboard();
  });

  // Wire offset ↑↓ buttons
  document.querySelectorAll('.offset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const delta = parseInt(btn.dataset.delta);
      const hidden = document.getElementById(`offset-${id}`);
      const display = document.getElementById(`offset-val-${id}`);
      if (hidden) {
        const newVal = parseInt(hidden.value) + delta;
        hidden.value = newVal;
        if (display) display.textContent = newVal;
      }
      updateDashboard();
    });
  });

  syncBulkDiscourseToggle();
  updateDashboard();
}

init();
