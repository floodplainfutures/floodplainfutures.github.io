(function () {
  'use strict';
  console.log('timeline.js loaded');

  const svg = document.querySelector('.wave-svg');
  const speciesList = document.querySelector('.species-list');
  const zoomSlider = document.querySelector('.zoom-slider');
  const zoomReadout = document.querySelector('.zoom-readout');
  const axis = document.querySelector('.timeline-axis');
  const visual = document.querySelector('.timeline-layer');

  const WIDTH = 1200;
  const HEIGHT = 500;

  const MONTHS = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'];

  /* =========================
     STATE
  ========================= */

  let floodByMonth = [];
  let focusedSpecies = null;
  let zoomMonths = 12;
  let startMonth = 0;
  let hoverViz = false;

  /* =========================
     DATA
  ========================= */

  const birdsBySpecies = {
    "snow-goose":            [60,39,24,6,3,1,1,4,10,15,40,63],
    "ross's-goose":          [14,12,20,13,10,6,6,8,6,5,8,2],
    "greater-white-fronted": [62,65,68,61,50,57,53,57,45,48,47,51],
    "sandhill-crane":        [8,13,12,0,0,0,0,0,7,22,15,9],
    "canada-goose":          [55,52,48,40,30,22,20,25,35,45,50,58],
    "northern-pintail":      [70,68,60,45,30,15,10,12,25,50,65,72],
    "mallard":               [65,60,55,50,45,40,38,42,48,55,60,66],
    "american-wigeon":       [62,58,52,44,35,25,20,22,33,50,58,64],
    "green-winged-teal":     [66,62,58,50,38,28,22,26,40,55,62,68],
    "great-egret":           [12,18,30,45,55,60,58,55,40,25,15,10],
    "great-blue-heron":      [30,35,40,45,48,50,48,46,44,38,34,32],
    "white-faced-ibis":      [5,8,15,35,55,60,58,50,30,15,8,5]
  };

  const speciesColors = {
    "snow-goose": "var(--yellow)",
    "ross's-goose": "#9fd3c7",
    "greater-white-fronted": "#5fa8d3",
    "sandhill-crane": "var(--pink)",
    "canada-goose": "var(--olivegreen)",
    "northern-pintail": "var(--purple)",
    "mallard": "#6a994e",
    "american-wigeon": "#bc6c25",
    "green-winged-teal": "#2a9d8f",
    "great-egret": "#FF1717",
    "great-blue-heron": "#457b9d",
    "white-faced-ibis": "var(--red)"
  };

  /* =========================
     HELPERS
  ========================= */

  function clearSVG() {
    svg.innerHTML = '';
  }

  function normalize(data) {
    const max = Math.max(...data);
    return data.map(v => max ? v / max : 0);
  }

  function wavePath(data, yScale, baselineY, fill) {
    const step = WIDTH / (data.length - 1);
    let d = `M 0 ${baselineY}`;

    data.forEach((v, i) => {
      const x = i * step;
      const y = baselineY - v * yScale;
      d += ` L ${x} ${y}`;
    });

    if (fill) {
      d += ` L ${WIDTH} ${baselineY} Z`;
    }

    return d;
  }

  /* =========================
     AXIS
  ========================= */

  function renderAxis() {
    axis.innerHTML = '';
    axis.style.gridTemplateColumns = `repeat(${zoomMonths}, 1fr)`;

    MONTHS.slice(startMonth, startMonth + zoomMonths).forEach(m => {
      const span = document.createElement('span');
      span.textContent = m;
      axis.appendChild(span);
    });
  }

  /* =========================
     FLOOD DATA (USGS)
  ========================= */

  function fetchFloodData() {
    const url =
      "https://waterservices.usgs.gov/nwis/dv/?" +
      "format=json" +
      "&sites=11453000" +
      "&parameterCd=00060" +
      "&startDT=2002-01-01" +
      "&endDT=2026-12-31";

    return fetch(url)
      .then(res => res.json())
      .then(json => {
        const values = json.value.timeSeries[0].values[0].value;
        const totals = Array(12).fill(0);
        const counts = Array(12).fill(0);

        values.forEach(d => {
          const m = new Date(d.dateTime).getMonth();
          const v = parseFloat(d.value);
          if (!isNaN(v)) {
            totals[m] += v;
            counts[m]++;
          }
        });

        return totals.map((t, i) => counts[i] ? t / counts[i] : 0);
      });
  }

  /* =========================
     RENDER
  ========================= */

  function render() {
    clearSVG();

    const baselineFlood = HEIGHT * 0.75;
    const baselineBirds = HEIGHT * 0.75;

    /* FLOOD */
    const floodNorm = normalize(floodByMonth);
    const floodPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    floodPath.setAttribute(
      'd',
      wavePath(floodNorm, HEIGHT * 0.45, baselineFlood, true)
    );
    floodPath.setAttribute('fill', 'var(--blackblue)');
    floodPath.setAttribute('opacity', '1');
    svg.appendChild(floodPath);

    /* BIRDS */
    Object.keys(birdsBySpecies).forEach(key => {
      if (focusedSpecies && focusedSpecies !== key) return;

      const birdNorm = birdsBySpecies[key].map(v => v / 100);
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

      path.setAttribute(
        'd',
        wavePath(birdNorm, HEIGHT * 0.55, baselineBirds, false)
      );
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke', speciesColors[key]);
      path.setAttribute('stroke-width', focusedSpecies ? 3 : 2);
      path.setAttribute('opacity', focusedSpecies ? 0.95 : 0.45);

      svg.appendChild(path);
    });

    applyView();
  }

  function applyView() {
    const visibleWidth = (WIDTH / 12) * zoomMonths;
    const offsetX = (WIDTH / 12) * startMonth;

    svg.setAttribute('viewBox', `${offsetX} 0 ${visibleWidth} ${HEIGHT}`);

    renderAxis();

    zoomReadout.textContent =
      `showing ${MONTHS[startMonth]}–${MONTHS[startMonth + zoomMonths - 1]} (${zoomMonths} months)`;
  }

  /* =========================
     INTERACTION
  ========================= */

  zoomSlider.addEventListener('input', e => {
    zoomMonths = +e.target.value;
    startMonth = Math.min(startMonth, 12 - zoomMonths);
    applyView();
  });

  visual.addEventListener('mouseenter', () => hoverViz = true);
  visual.addEventListener('mouseleave', () => hoverViz = false);

  window.addEventListener('wheel', e => {
    if (!hoverViz) return;
    e.preventDefault();

    startMonth += e.deltaY > 0 ? 1 : -1;
    startMonth = Math.max(0, Math.min(12 - zoomMonths, startMonth));

    applyView();
  }, { passive: false });

  /* =========================
     SIDEBAR
  ========================= */

  speciesList.innerHTML = '';

  Object.keys(birdsBySpecies).forEach(key => {
    const li = document.createElement('li');
    li.dataset.species = key;
    li.style.color = speciesColors[key];

    const icon = document.createElement('span');
    icon.className = 'species-icon';
    icon.style.backgroundImage = `url("images/birds/${key}.jpg")`;

    const name = document.createElement('span');
    name.textContent = key.replace(/-/g, ' ');

    li.append(icon, name);
    speciesList.appendChild(li);

    li.addEventListener('click', () => {
      focusedSpecies = focusedSpecies === key ? null : key;
      document.querySelectorAll('.species-list li')
        .forEach(el => el.classList.toggle('active', el === li && focusedSpecies));
      render();
    });
  });

  /* =========================
     INIT
  ========================= */

  fetchFloodData().then(data => {
    floodByMonth = data;
    render();
  });

})();
