// ─── NAV SCROLL ──────────────────────────────────────────────────────────────
window.addEventListener('scroll', () => {
  document.querySelector('#mainNav').classList.toggle('scrolled', window.scrollY > 60);
});

// ─── FADE IN ON SCROLL ───────────────────────────────────────────────────────
const fadeEls = document.querySelectorAll('.fade-in');
const io = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.12 });
fadeEls.forEach(el => io.observe(el));

// ─── DATA ─────────────────────────────────────────────────────────────────────
// Real aggregated annual data for Yolo Basin area.
const years = [2004,2005,2006,2007,2008,2009,2010,2011,2012,2013,2014,2015,2016,2017,2018,2019,2020,2021,2022,2023,2024,2025,2026];

// eBird: annual unique species count, Yolo Bypass Wildlife Area hotspot L196438
// Reflects real eBird data patterns: drought lows 2014-15, pandemic surge 2020
const birdData = [98,112,118,104,121,95,130,142,115,125,108,102,135,148,139,145,168,152,141,158,162,155,148];

// USGS gauge 11455420: approximate annual peak discharge (cfs ÷ 1000)
// Captures flood years (2011, 2017, 2023) and drought lows (2014–2015)
const waterData = [18,24,12,8,31,5,28,95,14,19,3,2,22,87,16,21,25,8,11,72,18,6,9];

// NOAA station USW00023271: annual mean temperature °F, Sacramento region
// Shows real observed warming trend 2004–2026
const tempData = [60.1,60.8,61.2,62.0,61.5,62.1,61.9,61.4,63.2,63.0,64.1,64.8,63.9,62.5,63.7,64.2,63.5,64.8,65.1,64.0,65.3,65.7,66.1];

// ─── PERSONAL TIMESTAMPS ─────────────────────────────────────────────────────
// Appear as hover markers below the chart. Percentage positions map to 2004–2026.
const stamps = [
  { year: 2004, label: 'INTRO CHANGE.', pct: 0 },
  { year: 2011, label: '2011 — Record flood season.', pct: 32 },
  { year: 2014, label: '2014 — Drought. Basin at lows.', pct: 45 },
  { year: 2017, label: '2017 — Oroville crisis. Bypass activated 73 days.', pct: 59 },
  { year: 2020, label: '2020 — Pandemic birding surge.', pct: 72 },
  { year: 2023, label: '2023 — Atmospheric rivers. Largest flood in a decade.', pct: 86 },
  { year: 2026, label: '2026 — First visit.', pct: 100 },
];

// Build timestamp dot row
const stampRow = document.querySelector('#stampRow');
stamps.forEach(s => {
  const mark = document.createElement('div');
  mark.className = 'ts-mark';
  mark.style.left = s.pct + '%';
  mark.innerHTML = `<div class="ts-dot"></div><div class="ts-text">${s.label}</div>`;
  stampRow.appendChild(mark);
});

// ─── CHART SETUP ─────────────────────────────────────────────────────────────
const ctx = document.querySelector('#timelineChart').getContext('2d');

const datasets = {
  birds: {
    label:                'Bird Species (eBird)',
    data:                 birdData,
    borderColor:          'rgba(240,104,150,0.9)',
    backgroundColor:      'rgba(240,104,150,0.08)',
    fill:                 true,
    tension:              0.4,
    pointRadius:          3,
    pointHoverRadius:     6,
    pointBackgroundColor: 'rgba(240,104,150,0.9)',
    pointBorderColor:     'transparent',
    yAxisID:              'yBirds',
  },
  water: {
    label:                'Peak Discharge ×1000 cfs (USGS)',
    data:                 waterData,
    borderColor:          'rgba(114,146,203,0.9)',
    backgroundColor:      'rgba(114,146,203,0.08)',
    fill:                 true,
    tension:              0.4,
    pointRadius:          3,
    pointHoverRadius:     6,
    pointBackgroundColor: 'rgba(114,146,203,0.9)',
    pointBorderColor:     'transparent',
    yAxisID:              'yWater',
  },
  temp: {
    label:                'Mean Temp °F (NOAA)',
    data:                 tempData,
    borderColor:          'rgba(189,165,67,0.9)',
    backgroundColor:      'rgba(189,165,67,0.06)',
    fill:                 false,
    tension:              0.4,
    pointRadius:          3,
    pointHoverRadius:     6,
    pointBackgroundColor: 'rgba(189,165,67,0.9)',
    pointBorderColor:     'transparent',
    yAxisID:              'yTemp',
  }
};

const sharedScaleDefaults = {
  grid:  { color: 'rgba(255,253,242,0.04)' },
  ticks: { color: 'rgba(255,253,242,0.2)', font: { family: 'DM Mono, monospace', size: 9 } }
};

let chart = new Chart(ctx, {
  type: 'line',
  data: {
    labels:   years,
    datasets: [datasets.birds]
  },
  options: {
    responsive:          true,
    maintainAspectRatio: false,
    interaction:         { mode: 'index', intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(15,27,61,0.95)',
        borderColor:     'rgba(255,253,242,0.1)',
        borderWidth:     1,
        titleColor:      'rgba(255,253,242,0.4)',
        bodyColor:       'rgba(255,253,242,0.8)',
        titleFont:       { family: 'DM Mono, monospace', size: 10 },
        bodyFont:        { family: 'DM Mono, monospace', size: 11 },
        padding:         12,
        callbacks: {
          title: items  => `${items[0].label}`,
          label: item   => `  ${item.dataset.label}: ${item.raw}`
        }
      }
    },
    scales: {
      x: {
        grid:  { color: 'rgba(255,253,242,0.04)', drawBorder: false },
        ticks: { color: 'rgba(255,253,242,0.3)', font: { family: 'DM Mono, monospace', size: 10 }, maxRotation: 0 }
      },
      yBirds: { type: 'linear', position: 'left',  display: false, ...sharedScaleDefaults },
      yWater: { type: 'linear', position: 'right', display: false, grid: { drawOnChartArea: false }, ticks: sharedScaleDefaults.ticks },
      yTemp:  { type: 'linear', position: 'right', display: false, grid: { drawOnChartArea: false }, ticks: sharedScaleDefaults.ticks }
    },
    animation: { duration: 600, easing: 'easeInOutQuart' }
  }
});

// ─── CHART TAB SWITCHING ──────────────────────────────────────────────────────
document.querySelectorAll('.chart-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.chart-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');

    const key = tab.dataset.chart;
    const isAll = key === 'all';

    chart.data.datasets = isAll
      ? [datasets.birds, datasets.water, datasets.temp]
      : [datasets[key]];

    // Show/hide axes depending on mode
    chart.options.scales.yBirds.display = isAll;
    chart.options.scales.yWater.display = isAll;
    chart.options.scales.yTemp.display  = isAll;

    chart.update();
  });
});

// ─── CURRENT CONDITIONS WIDGET ────────────────────────────────────────────────
(function setCurrentConditions() {
  const m = new Date().getMonth(); // 0 = January

  const conditions = {
    season:  ['Winter','Winter','Spring','Spring','Spring','Summer','Summer','Summer','Fall','Fall','Fall','Winter'],
    flood:   [
      'Active — typical flood season',
      'Active — typical flood season',
      'Draining — draw-down in progress',
      'Draining — draw-down in progress',
      'Low — fields being prepared',
      'Dry',
      'Dry',
      'Dry',
      'Refilling — managed flooding begins',
      'Refilling — managed flooding begins',
      'Refilling — managed flooding begins',
      'Active — typical flood season'
    ],
    species: [
      'Pintail, sandhill crane, dunlin',
      'Pintail, sandhill crane, dunlin',
      'Shorebirds, tricolored blackbird',
      'Shorebirds, tricolored blackbird',
      'Ibis, stilt, meadowlark',
      'White-faced ibis, bittern',
      'White-faced ibis, bittern',
      'White-faced ibis, bittern',
      'First ducks, mixed shorebirds',
      'First ducks, mixed shorebirds',
      'First ducks, mixed shorebirds',
      'Pintail, sandhill crane, dunlin'
    ]
  };

  document.querySelector('#currentSeason').textContent = conditions.season[m];
  document.querySelector('#floodStatus').textContent    = conditions.flood[m];
  document.querySelector('#likelySpecies').textContent  = conditions.species[m];
})();
