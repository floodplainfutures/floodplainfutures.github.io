(function () {
    'use strict';
    console.log('systems.js loaded');

// ════════════════════════════════════════════════════════════════
// DATA — all Yolo County or Yolo Basin sources only
// ════════════════════════════════════════════════════════════════

/*
 FLOOD — days Fremont Weir overtopped into Yolo Basin per water year (Nov–Mar)
 Source: CA Dept. of Water Resources / Delta Stewardship Council
 URL: viewperformance.deltacouncil.ca.gov/pm/yolo-bypass-inundation
*/
var FLOOD = {
    2018: 42,
    2019: 31,
    2020: 18,
    2021: 0,
    2022: 0,
    2023: 73,
    2024: 0,
    2025: 20
};

/*
 BIRDS — eBird checklists submitted per year
 Source: Cornell Lab of Ornithology, eBird Hotspot L443535 (Vic Fazio Yolo Wildlife Area)
 URL: ebird.org/hotspot/L443535
*/
var BIRDS = {
    2018: 812,
    2019: 894,
    2020: 1240,
    2021: 1098,
    2022: 876,
    2023: 1187,
    2024: 1043,
    2025: 1198
};

/*
 RICE — Yolo County harvested acres, tons, and value
 Source: Yolo County Dept. of Agriculture, Weights & Measures
         Annual Crop & Livestock Reports 2018–2023
 URL: yolocounty.gov/government/general-government-departments/agriculture/crop-statistics
*/
var RICE = {
    2018: { acres: 22800,  tons: 67400,  value: 18.4 },
    2019: { acres: 23393,  tons: 77800,  value: 16.4 },
    2020: { acres: 36000,  tons: 60100,  value: 13.9 },
    2021: { acres: 17800,  tons: 60100,  value: 20.1 },
    2022: { acres:  9507,  tons: 30200,  value: 23.2 },
    2023: { acres: 29974,  tons: 128000, value: 54.3 },
    2024: { acres: 27394,  tons: 128000, value: 44.7 },
    2025: { acres: 26000,  tons: 120000, value: 40.0 }
};

var YEARS = [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025];

var RICE_TABLE = [
    { year: 2025, acres: '~26,000', prod: '~120,000 tons', value: '~$40M', flood: true,
      context: 'Late December storms pushed the Sacramento River over the Fremont Weir for 20 days — also the first overtopping with the new Big Notch fish passage gates in operation. Rice acreage held steady from 2024. Full crop figures publish in the 2025 Yolo County Crop Report (expected Oct 2026).' },
    { year: 2024, acres: '27,394', prod: '128,000 tons', value: '$44.7M', flood: false,
      context: 'A dry year. The Fremont Weir did not overtop. Rice acreage settled back from the 2023 rebound to about 27,400 acres — a solid mid-range year. Almonds overtook rice as the top-value crop in Yolo County for the first time.' },
    { year: 2023, acres: '29,974', prod: '128,000 tons', value: '$54.3M', flood: true,
      context: 'The rains came back and so did the rice. After the 2022 drought stripped planting down to almost nothing, farmers came back strong. Acreage jumped more than 200% in a single year.' },
    { year: 2022, acres: '9,507',  prod: '30,200 tons',  value: '$23.2M', flood: false,
      context: 'The worst drought year in the dataset. Farmers could not get enough water to plant, so most of the fields sat dry. Acreage fell 59% from the year before and bird numbers at the wildlife area fell with it.' },
    { year: 2021, acres: '17,800', prod: '60,100 tons',  value: '$20.1M', flood: false,
      context: 'A second dry year in a row. The Fremont Weir did not overtop at all. Planting was down from 2020 but the real crash was still coming.' },
    { year: 2020, acres: '36,000', prod: '60,100 tons',  value: '$13.9M', flood: true,
      context: 'The best planting year in the dataset. Post-harvest flooding supported strong bird numbers, and with people stuck at home, birding activity jumped nationally too. Checklist submissions spiked.' },
    { year: 2019, acres: '23,393', prod: '77,800 tons',  value: '$16.4M', flood: true,
      context: 'A solid but unremarkable water year. Some winter storms pushed the Fremont Weir over for about 31 days. Steady conditions for birds and rice alike.' },
    { year: 2018, acres: '22,800', prod: '67,400 tons',  value: '$18.4M', flood: true,
      context: 'A wet winter with 42 days of flooding. Normal rice acreage for the county. Overall ag value hit $676M that year.' }
];

/*
 BIRDS DATA — top 10 species at Yolo Bypass Wildlife Area
 Sources: eBird L443535, Napa Solano Audubon, Yolo Bird Alliance (2018)
 Bird call recordings: Xeno-Canto (xeno-canto.org) — Creative Commons licensed
 Frequency = approximate % of eBird checklists at this hotspot the species appears on.
*/
var BIRDS_DATA = [
    {
        num: '01', name: 'northern pintail', sci: 'Anas acuta', slug: 'northern-pintail',
        season: 'winter', seasonLabel: 'Oct–Mar', freq: 78,
        peak: 'Nov–Jan: flocks of 10,000–50,000',
        connection: 'Pintails arrive right after rice harvest, when the fields start to flood. They pick through leftover grain and small invertebrates in the shallow water. In a wet year you can see tens of thousands of them from the levee road.',
        color: 'var(--lightblue)', callNo: 'XC621202', recordist: 'Paul Marvin'
    },
    {
        num: '02', name: 'sandhill crane', sci: 'Antigone canadensis', slug: 'sandhill-crane',
        season: 'winter', seasonLabel: 'Oct–Mar', freq: 62,
        peak: 'Nov–Feb: roosts of 2,000–8,000',
        connection: 'Cranes feed in the rice stubble all day, then fly in formation to the wetlands at dusk to roost. They return to the same spots year after year, which makes watching them feel like running into old friends.',
        color: 'var(--lightblue)', callNo: 'XC539728', recordist: 'Thomas Magarian'
    },
    {
        num: '03', name: 'american coot', sci: 'Fulica americana', slug: 'american-coot',
        season: 'yearround', seasonLabel: 'Year-round', freq: 85,
        peak: 'Year-round; winter counts up to 5,000',
        connection: 'One of the most reliably spotted waterbirds at the basin. They live year-round in the permanent wetlands and pack in by the thousands once the seasonal fields flood.',
        color: 'rgba(255,255,255,.4)', callNo: 'XC452164', recordist: 'Paul Marvin'
    },
    {
        num: '04', name: 'white-faced ibis', sci: 'Plegadis chihi', slug: 'white-faced-ibis',
        season: 'summer', seasonLabel: 'Mar–Oct', freq: 70,
        peak: 'Apr–Sep: breeding colonies of 500–3,000',
        connection: 'Ibis nest in the tule reeds and spend spring and summer feeding in the wet fields. The flooded rice paddies are a big reason they breed here. You can pick them out by the way they walk, working the mud with their curved bills.',
        color: 'var(--yellow)', callNo: 'XC452112', recordist: 'Paul Marvin'
    },
    {
        num: '05', name: 'great blue heron', sci: 'Ardea herodias', slug: 'great-blue-heron',
        season: 'yearround', seasonLabel: 'Year-round', freq: 88,
        peak: 'Year-round; nests in willows along levees',
        connection: 'Great blue herons live here year-round. They nest in the willows along the levee roads and hunt in both the flooded fields and the permanent ponds. Probably the bird most people see first when they visit.',
        color: 'rgba(255,255,255,.4)', callNo: 'XC143575', recordist: 'Paul Marvin'
    },
    {
        num: '06', name: 'northern harrier', sci: 'Circus hudsonius', slug: 'northern-harrier',
        season: 'winter', seasonLabel: 'Oct–Apr', freq: 74,
        peak: 'Nov–Mar: several birds hunting at once',
        connection: 'Harriers fly low and slow over flooded fields, hunting for voles and frogs. More water means denser clusters of prey, so the more the basin floods, the more harriers you tend to see.',
        color: 'var(--lightblue)', callNo: 'XC776694', recordist: 'Phoebe Barnes'
    },
    {
        num: '07', name: 'dunlin', sci: 'Calidris alpina', slug: 'dunlin',
        season: 'winter', seasonLabel: 'Nov–Apr', freq: 58,
        peak: 'Dec–Feb: flocks of 1,000–20,000',
        connection: 'Dunlin travel all the way from the Arctic to spend winter in the basin. They need very shallow water to work the mud for invertebrates, and the Yolo Basin gives them exactly that. It is one of the better spots on the entire West Coast for them.',
        color: 'var(--lightblue)', callNo: 'XC169170', recordist: 'Paul Marvin'
    },
    {
        num: '08', name: 'great egret', sci: 'Ardea alba', slug: 'great-egret',
        season: 'yearround', seasonLabel: 'Year-round', freq: 81,
        peak: 'Year-round; large communal roosts in winter',
        connection: 'Great egrets stand perfectly still in flooded fields, waiting for fish or frogs to come within range. They are easy to find and you can usually see several from the auto tour route.',
        color: 'rgba(255,255,255,.4)', callNo: 'XC452101', recordist: 'Paul Marvin'
    },
    {
        num: '09', name: 'snow goose', sci: 'Anser caerulescens', slug: 'snow-goose',
        season: 'winter', seasonLabel: 'Nov–Mar', freq: 52,
        peak: 'Dec–Feb: flocks occasionally over 50,000',
        connection: 'Snow geese fly in from the Arctic and graze on the legume fields at Tule Ranch alongside the rice stubble. Big flocks show up in wet years when there is more space to spread out. They are extremely loud and hard to miss.',
        color: 'var(--lightblue)', callNo: 'XC452581', recordist: 'Paul Marvin'
    },
    {
        num: '10', name: 'tricolored blackbird', sci: 'Agelaius tricolor', slug: 'tricolored-blackbird',
        season: 'spring', seasonLabel: 'Mar–Jul', freq: 44,
        peak: 'Apr–Jun: colonies of 500–5,000',
        connection: 'Nearly the entire world population of tricolored blackbirds breeds in California, and the Yolo Bypass is one of their main nesting sites. They build colonies in the tule reeds and commute to the rice fields to feed. The species is listed as threatened. What happens to this basin matters directly to their survival.',
        color: 'var(--olivegreen)', callNo: 'XC344799', recordist: 'Paul Marvin'
    }
];

var MONTHLY = [
    { m: 'jan', flood: 'Peak flood time. Fremont Weir usually overtopping. Managed wetlands at full water.',
      birds: 'Most birds of the year here. Pintails, cranes, dunlin, snow geese. Biggest eBird submission month.',
      rice:  'Fields still flooded after harvest. Rice straw breaking down. Ducks feeding in the standing water.' },
    { m: 'feb', flood: 'Still flooding. Sacramento River running high from winter storms.',
      birds: 'Winter numbers hold. First early shorebirds start passing through.',
      rice:  'Fields stay flooded. Last month of the main waterfowl season.' },
    { m: 'mar', flood: 'Water starts going down. Managed ponds drained to help native grass seed germinate.',
      birds: 'Waterfowl heading north. Early shorebirds land on the mudflats left behind.',
      rice:  'Fields drying out. Farmers start getting ready to plant.' },
    { m: 'apr', flood: 'Low water. Fields drained by April 1 as part of managed schedule. Mudflats show.',
      birds: 'Good shorebird month on the mudflats. Tricolored blackbirds start nesting.',
      rice:  'Planting season begins. Fields leveled and flooded for germination.' },
    { m: 'may', flood: 'Dry season starts. Only the permanent ponds hold water.',
      birds: 'White-faced ibis nesting. Blackbird colonies active in the tules. Wading birds in the paddies.',
      rice:  'Rice in the ground and growing. Fields sitting 4–6 inches deep. Herons wade the paddies.' },
    { m: 'jun', flood: 'Driest period of the year. Little flooding except the permanent wetlands.',
      birds: 'Summer residents are here: ibis, bitterns, stilts. Almost no ducks.',
      rice:  'Rice growing fast. You can see the green from I-80. Hot and dry.' },
    { m: 'jul', flood: 'Dry. A few areas get a short summer irrigation for shorebird management.',
      birds: 'Shorebird management areas flooded on purpose. First birds coming back south.',
      rice:  'Midsummer rice. Some fallow fields flooded to give shorebirds somewhere to land.' },
    { m: 'aug', flood: 'Managed shorebird flooding continues.',
      birds: 'Best month for small shorebirds heading south. 20+ species possible on the mudflats.',
      rice:  'Rice close to ready. Grain forming on the stalks. Herons and egrets very active.' },
    { m: 'sep', flood: 'First fall rains possible. Managed wetlands start refilling around October 1.',
      birds: 'First pintails and teal arrive. Shorebirds still passing through.',
      rice:  'Harvest starts September 15 through mid-October. Combines working the fields.' },
    { m: 'oct', flood: 'Managed flooding underway. Fields going back under water for the birds.',
      birds: 'Duck numbers building. Sandhill cranes return. Hunting season opens.',
      rice:  'Harvest finishing up. Post-harvest flooding begins. Fields look like mirrors.' },
    { m: 'nov', flood: 'Winter flood season starting. Fremont Weir may overtop if storms arrive.',
      birds: 'Best diversity of the year. Early and late species overlap. Crane roosts form at dusk.',
      rice:  'Flooded fields with rice left in the stubble. Good food for pintails and cranes.' },
    { m: 'dec', flood: 'Full winter flooding. Multiple flood events in a wet year.',
      birds: 'Peak waterfowl. Duck hunting season open. Harriers and eagles hunting.',
      rice:  'Fields fully flooded. Post-harvest wetland at its biggest for the year.' }
];

var MONTH_LABELS = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'];
var MONTH_FULL   = ['January','February','March','April','May','June','July','August','September','October','November','December'];

// ════════════════════════════════════════════════════════════════
// STATE
// ════════════════════════════════════════════════════════════════

var activeFilters = { flood: true, birds: true, rice: true };
var selectedMonth = null;

// ════════════════════════════════════════════════════════════════
// PROGRESS BAR
// ════════════════════════════════════════════════════════════════

var progressEl = document.querySelector('#sysProgress');

window.addEventListener('scroll', function () {
    var h = document.documentElement.scrollHeight - window.innerHeight;
    progressEl.style.width = (h > 0 ? (window.scrollY / h * 100) : 0) + '%';
}, { passive: true });

// ════════════════════════════════════════════════════════════════
// TOGGLES
// ════════════════════════════════════════════════════════════════

document.querySelectorAll('.sys-toggle').forEach(function (btn) {
    btn.addEventListener('click', function () {
        var sys = btn.dataset.system;
        activeFilters[sys] = !activeFilters[sys];
        btn.classList.toggle('inactive', !activeFilters[sys]);
        btn.setAttribute('aria-pressed', String(activeFilters[sys]));
        renderChart();
        renderLegend();
    });
});

// ════════════════════════════════════════════════════════════════
// CHART — animated SVG line chart
// ════════════════════════════════════════════════════════════════

function renderChart() {
    var wrap = document.querySelector('#annualChartWrap');
    var chart = document.querySelector('#annualChart');
    chart.innerHTML = '';

    // SR table
    var existingTable = document.querySelector('#annualChartTable');
    if (existingTable) existingTable.remove();
    var srTable = document.createElement('table');
    srTable.id = 'annualChartTable';
    srTable.className = 'sr-only';
    srTable.setAttribute('aria-label', 'Annual data table: flood days, bird checklists, and rice acres 2018–2025');
    srTable.innerHTML = '<thead><tr><th>Year</th>' +
        (activeFilters.flood ? '<th>Flood days</th>' : '') +
        (activeFilters.birds ? '<th>Bird checklists</th>' : '') +
        (activeFilters.rice  ? '<th>Rice acres</th>' : '') +
        '</tr></thead>';
    var tbody = document.createElement('tbody');
    YEARS.forEach(function (y) {
        var tr = document.createElement('tr');
        tr.innerHTML = '<td>' + y + '</td>' +
            (activeFilters.flood ? '<td>' + FLOOD[y] + ' days</td>' : '') +
            (activeFilters.birds ? '<td>' + BIRDS[y].toLocaleString() + '</td>' : '') +
            (activeFilters.rice  ? '<td>' + RICE[y].acres.toLocaleString() + ' acres</td>' : '');
        tbody.appendChild(tr);
    });
    srTable.appendChild(tbody);
    chart.parentNode.insertBefore(srTable, chart.nextSibling);

    // Reset old bar-chart container styles so SVG can size freely
    chart.style.display   = 'block';
    chart.style.height    = 'auto';
    chart.style.minHeight = '0';
    chart.style.gridTemplateColumns = '';
    chart.style.alignItems = '';
    chart.removeAttribute('role');
    chart.removeAttribute('aria-label');

    // Chart dimensions — adjusted for mobile
    var isMobileChart = window.innerWidth <= 600;
    var W = 900, H = 340;
    var padL = isMobileChart ? 8  : 60;
    var padR = isMobileChart ? 8  : 28;
    var padT = 36;
    var padB = isMobileChart ? 40 : 48;
    var chartW = W - padL - padR;
    var chartH = H - padT - padB;

    var maxFlood = Math.max.apply(null, YEARS.map(function(y){ return FLOOD[y]; }));
    var maxBirds = Math.max.apply(null, YEARS.map(function(y){ return BIRDS[y]; }));
    var maxRice  = Math.max.apply(null, YEARS.map(function(y){ return RICE[y].acres; }));

    var ns = 'http://www.w3.org/2000/svg';

    var svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.style.display = 'block';
    svg.style.width   = '100%';
    svg.style.minHeight = isMobileChart ? '200px' : '260px';
    svg.classList.add('sys-line-chart-svg');
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', 'Line chart: flood days, bird checklists, and rice acres 2018–2025. The accessible table below contains the same data.');

    // Defs for gradient fills
    var defs = document.createElementNS(ns, 'defs');

    function makeGrad(id, color) {
        var g = document.createElementNS(ns, 'linearGradient');
        g.setAttribute('id', id);
        g.setAttribute('x1', '0'); g.setAttribute('y1', '0');
        g.setAttribute('x2', '0'); g.setAttribute('y2', '1');
        var s1 = document.createElementNS(ns, 'stop');
        s1.setAttribute('offset', '0%');
        s1.setAttribute('stop-color', color);
        s1.setAttribute('stop-opacity', '0.28');
        var s2 = document.createElementNS(ns, 'stop');
        s2.setAttribute('offset', '100%');
        s2.setAttribute('stop-color', color);
        s2.setAttribute('stop-opacity', '0.02');
        g.appendChild(s1); g.appendChild(s2);
        defs.appendChild(g);
    }
    makeGrad('areaFlood', '#7292cb');
    makeGrad('areaBirds', '#f06896');
    makeGrad('areaRice',  '#bda543');
    svg.appendChild(defs);

    // Grid lines (horizontal, 4 lines)
    var gridG = document.createElementNS(ns, 'g');
    for (var gi = 0; gi <= 4; gi++) {
        var gy = padT + (chartH / 4) * gi;
        var gl = document.createElementNS(ns, 'line');
        gl.setAttribute('x1', padL); gl.setAttribute('x2', W - padR);
        gl.setAttribute('y1', gy);   gl.setAttribute('y2', gy);
        gl.setAttribute('class', 'chart-grid-line');
        gridG.appendChild(gl);
    }
    svg.appendChild(gridG);

    // X positions for years
    function xPos(i) { return padL + (i / (YEARS.length - 1)) * chartW; }

    // Y position normalised per dataset
    function yNorm(val, max) {
        if (!max) return padT + chartH;
        return padT + chartH - (val / max) * chartH;
    }

    // Build points for each dataset
    var datasets = [
        { key: 'flood', cls: 'flood', color: '#7292cb', vals: YEARS.map(function(y){ return FLOOD[y]; }),      max: maxFlood, active: activeFilters.flood },
        { key: 'birds', cls: 'birds', color: '#f06896', vals: YEARS.map(function(y){ return BIRDS[y]; }),      max: maxBirds, active: activeFilters.birds },
        { key: 'rice',  cls: 'rice',  color: '#bda543', vals: YEARS.map(function(y){ return RICE[y].acres; }), max: maxRice,  active: activeFilters.rice }
    ];

    // Draw areas + lines
    datasets.forEach(function (ds) {
        var pts = ds.vals.map(function(v, i){ return { x: xPos(i), y: yNorm(v, ds.max) }; });
        var baseY = padT + chartH;

        // Area path
        // Smooth area path — control points clamped at baseY
        var areaD = (function(pts, baseY) {
            if (pts.length < 2) return '';
            var d = 'M ' + pts[0].x + ' ' + baseY + ' L ' + pts[0].x + ' ' + pts[0].y;
            for (var i = 0; i < pts.length - 1; i++) {
                var p0 = pts[i - 1] || pts[i];
                var p1 = pts[i];
                var p2 = pts[i + 1];
                var p3 = pts[i + 2] || p2;
                var cp1x = p1.x + (p2.x - p0.x) / 6;
                var cp1y = Math.min(p1.y + (p2.y - p0.y) / 6, baseY);
                var cp2x = p2.x - (p3.x - p1.x) / 6;
                var cp2y = Math.min(p2.y - (p3.y - p1.y) / 6, baseY);
                d += ' C ' + cp1x + ' ' + cp1y + ' ' + cp2x + ' ' + cp2y + ' ' + p2.x + ' ' + p2.y;
            }
            d += ' L ' + pts[pts.length-1].x + ' ' + baseY + ' Z';
            return d;
        })(pts, baseY);
        var area = document.createElementNS(ns, 'path');
        area.setAttribute('d', areaD);
        area.setAttribute('fill', 'url(#area' + (ds.key.charAt(0).toUpperCase() + ds.key.slice(1)) + ')');
        area.classList.add('chart-area-path', ds.cls + '-area');
        if (!ds.active) area.classList.add('hidden-area');
        svg.appendChild(area);

        // Line path (smooth with linear segments)
        // Smooth catmull-rom curve — control points clamped so curve never dips below baseline
        var lineD = (function(pts, maxY) {
            if (pts.length < 2) return '';
            var d = 'M ' + pts[0].x + ' ' + pts[0].y;
            for (var i = 0; i < pts.length - 1; i++) {
                var p0 = pts[i - 1] || pts[i];
                var p1 = pts[i];
                var p2 = pts[i + 1];
                var p3 = pts[i + 2] || p2;
                var cp1x = p1.x + (p2.x - p0.x) / 6;
                var cp1y = Math.min(p1.y + (p2.y - p0.y) / 6, maxY);
                var cp2x = p2.x - (p3.x - p1.x) / 6;
                var cp2y = Math.min(p2.y - (p3.y - p1.y) / 6, maxY);
                d += ' C ' + cp1x + ' ' + cp1y + ' ' + cp2x + ' ' + cp2y + ' ' + p2.x + ' ' + p2.y;
            }
            return d;
        })(pts, baseY);
        var line = document.createElementNS(ns, 'path');
        line.setAttribute('d', lineD);
        line.classList.add('chart-line-path', ds.cls + '-line');
        if (!ds.active) line.classList.add('hidden-line');
        svg.appendChild(line);

        // Dots
        pts.forEach(function(p, i) {
            var dot = document.createElementNS(ns, 'circle');
            dot.setAttribute('cx', p.x);
            dot.setAttribute('cy', p.y);
            dot.setAttribute('r', '4');
            dot.classList.add('chart-dot', ds.cls + '-dot');
            if (!ds.active) dot.classList.add('hidden-dot');
            dot.dataset.year  = YEARS[i];
            dot.dataset.ds    = ds.key;
            dot.setAttribute('aria-label', YEARS[i] + ' ' + ds.key + ': ' + ds.vals[i].toLocaleString());
            svg.appendChild(dot);
        });
    });

// Crosshair line
    var crosshair = document.createElementNS(ns, 'line');
    crosshair.setAttribute('y1', padT);
    crosshair.setAttribute('y2', padT + chartH);
    crosshair.classList.add('chart-crosshair');
    svg.appendChild(crosshair);

    // Year labels — every other year on mobile to prevent overlap
    var labelsG = document.createElementNS(ns, 'g');
    YEARS.forEach(function(y, i) {
        // On mobile only show even-indexed years (2018, 2020, 2022, 2024)
        if (isMobileChart && i % 2 !== 0) { return; }
        var t = document.createElementNS(ns, 'text');
        t.setAttribute('x', xPos(i));
        t.setAttribute('y', padT + chartH + 22);
        t.classList.add('chart-year-label');
        t.dataset.year = y;
        t.textContent = y;
        labelsG.appendChild(t);
    });
    svg.appendChild(labelsG);

    // Hover hit zones
    YEARS.forEach(function(year, i) {
        var hitW = chartW / (YEARS.length);
        var hitX = xPos(i) - hitW / 2;
        var hit = document.createElementNS(ns, 'rect');
        hit.setAttribute('x', hitX);
        hit.setAttribute('y', padT);
        hit.setAttribute('width', hitW);
        hit.setAttribute('height', chartH);
        hit.setAttribute('fill', 'transparent');
        hit.setAttribute('cursor', 'pointer');
        hit.dataset.year = year;
        hit.dataset.xi   = xPos(i);

        hit.addEventListener('mouseenter', function(e) {
            crosshair.setAttribute('x1', xPos(i));
            crosshair.setAttribute('x2', xPos(i));
            crosshair.classList.add('visible');
            svg.querySelectorAll('.chart-year-label').forEach(function(t){ t.classList.remove('active-label'); });
            var lbl = svg.querySelector('.chart-year-label[data-year="' + year + '"]');
            if (lbl) lbl.classList.add('active-label');
            showTooltip(e, year);
        });
        hit.addEventListener('mousemove', function(e) { moveTooltip(e); });
        hit.addEventListener('mouseleave', function() {
            crosshair.classList.remove('visible');
            svg.querySelectorAll('.chart-year-label').forEach(function(t){ t.classList.remove('active-label'); });
            hideTooltip();
        });
        svg.appendChild(hit);
    });

    chart.appendChild(svg);
}

// ════════════════════════════════════════════════════════════════
// TOOLTIP — pill style
// ════════════════════════════════════════════════════════════════

// Create pill tooltip element once
var tooltip = document.createElement('div');
tooltip.className = 'sys-chart-tooltip-pill';
tooltip.id = 'sysTooltipPill';
document.body.appendChild(tooltip);

// Keep old #sysTooltip hidden (still in DOM for compatibility)
var oldTooltip = document.querySelector('#sysTooltip');
if (oldTooltip) oldTooltip.style.display = 'none';

function showTooltip(e, year) {
    var rows = '';
    if (activeFilters.flood) rows +=
        '<div class="sys-chart-tooltip-pill-row">' +
        '<span class="sys-chart-tooltip-pill-label" style="color:#7292cb">flood days</span>' +
        '<span class="sys-chart-tooltip-pill-val">' + FLOOD[year] + '</span></div>';
    if (activeFilters.birds) rows +=
        '<div class="sys-chart-tooltip-pill-row">' +
        '<span class="sys-chart-tooltip-pill-label" style="color:#f06896">checklists</span>' +
        '<span class="sys-chart-tooltip-pill-val">' + BIRDS[year].toLocaleString() + '</span></div>';
    if (activeFilters.rice)  rows +=
        '<div class="sys-chart-tooltip-pill-row">' +
        '<span class="sys-chart-tooltip-pill-label" style="color:#bda543">rice acres</span>' +
        '<span class="sys-chart-tooltip-pill-val">' + parseInt(RICE[year].acres).toLocaleString() + '</span></div>';
    tooltip.innerHTML = '<div class="sys-chart-tooltip-pill-year">' + year + '</div>' + rows;
    tooltip.classList.add('visible');
    moveTooltip(e);
}

function moveTooltip(e) {
    var x = e.clientX + 18;
    var w = tooltip.offsetWidth;
    if (x + w > window.innerWidth - 20) x = e.clientX - w - 18;
    tooltip.style.left = x + 'px';
    tooltip.style.top  = (e.clientY - 10) + 'px';
}

function hideTooltip() { tooltip.classList.remove('visible'); }

// ════════════════════════════════════════════════════════════════
// LEGEND
// ════════════════════════════════════════════════════════════════

function renderLegend() {
    document.querySelectorAll('.sys-legend-item').forEach(function (item) {
        item.style.opacity = activeFilters[item.dataset.system] ? '1' : '0.28';
    });
}

// ════════════════════════════════════════════════════════════════
// WHEEL
// ════════════════════════════════════════════════════════════════

function renderWheel() {
    // Make the detail panel a live region so screen readers announce updates
    var detailPanel = document.querySelector('#wheelDetail');
    if (detailPanel) {
        detailPanel.setAttribute('aria-live', 'polite');
        detailPanel.setAttribute('aria-atomic', 'true');
    }

    var container = document.querySelector('#sysWheel');
    var size = 400;
    var cx = size / 2, cy = size / 2;
    var outerR = 162, innerR = 56;
    var ns = 'http://www.w3.org/2000/svg';

    var floodAct = [4,3,2,1,0,0,0,0,1,2,3,4];
    var birdsAct = [4,4,3,3,2,1,2,3,3,4,4,4];
    var riceAct  = [0,0,0,2,3,4,4,4,4,3,1,0];

    // Visually-hidden accessible table for the wheel data
    var srTable = document.createElement('table');
    srTable.className = 'sr-only';
    srTable.setAttribute('aria-label', 'Monthly activity by system');
    var thead = document.createElement('thead');
    thead.innerHTML = '<tr><th>Month</th><th>Flood</th><th>Birds</th><th>Rice</th></tr>';
    srTable.appendChild(thead);
    var tbody = document.createElement('tbody');
    MONTHLY.forEach(function (d, i) {
        var tr = document.createElement('tr');
        tr.innerHTML = '<td>' + MONTH_FULL[i] + '</td>' +
            '<td>' + d.flood + '</td>' +
            '<td>' + d.birds + '</td>' +
            '<td>' + d.rice  + '</td>';
        tbody.appendChild(tr);
    });
    srTable.appendChild(tbody);
    container.appendChild(srTable);

    var svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 ' + size + ' ' + size);
    svg.setAttribute('xmlns', ns);
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', 'Seasonal activity wheel — hover or press Enter on a month to explore. The table below contains the same information.');
    svg.setAttribute('focusable', 'false');

    function polar(deg, r) {
        var rad = (deg - 90) * Math.PI / 180;
        return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
    }

    function arc(startDeg, endDeg, r1, r2) {
        var s1 = polar(startDeg, r1), e1 = polar(endDeg, r1);
        var s2 = polar(startDeg, r2);
        var lg = (endDeg - startDeg) > 180 ? 1 : 0;
        return ['M',s1.x,s1.y,'A',r1,r1,0,lg,1,e1.x,e1.y,'L',
                polar(endDeg,r2).x,polar(endDeg,r2).y,
                'A',r2,r2,0,lg,0,s2.x,s2.y,'Z'].join(' ');
    }

    MONTH_LABELS.forEach(function (mon, i) {
        var start = i * 30, end = start + 29.4;

        [
            { level: floodAct[i], color: '#7292cb', ro: outerR,      ri: outerR - 26 },
            { level: birdsAct[i], color: '#f06896', ro: outerR - 28, ri: outerR - 54 },
            { level: riceAct[i],  color: '#bda543', ro: outerR - 56, ri: innerR }
        ].forEach(function (ring) {
            var el = document.createElementNS(ns, 'path');
            el.setAttribute('d', arc(start, end, ring.ro, ring.ri));
            el.setAttribute('fill', ring.color);
            el.setAttribute('fill-opacity', 0.05 + (ring.level / 4) * 0.55);
            el.setAttribute('class', 'month-slice');
            el.dataset.month = i;
            svg.appendChild(el);
        });

        var lp = polar(start + 15, outerR + 18);
        var text = document.createElementNS(ns, 'text');
        text.setAttribute('x', lp.x);
        text.setAttribute('y', lp.y);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('dominant-baseline', 'middle');
        text.setAttribute('fill', 'rgba(255,255,255,.3)');
        text.setAttribute('font-family', 'DM Mono, monospace');
        text.setAttribute('font-size', '7.5');
        text.setAttribute('letter-spacing', '1');
        text.textContent = mon.toUpperCase();
        svg.appendChild(text);

        var hit = document.createElementNS(ns, 'path');
        hit.setAttribute('d', arc(start, end, outerR + 22, innerR));
        hit.setAttribute('fill', 'transparent');
        hit.setAttribute('cursor', 'pointer');
        hit.setAttribute('role', 'button');
        hit.setAttribute('tabindex', '0');
        hit.setAttribute('aria-label', MONTH_FULL[i] + ' — click to read activity details');
        hit.dataset.month = i;
        hit.addEventListener('mouseenter', function () {
            var idx = parseInt(this.dataset.month);
            document.querySelectorAll('.month-slice').forEach(function (s) {
                s.style.opacity = (parseInt(s.dataset.month) === idx) ? '1' : '0.45';
            });
            updateWheelDetail(idx);
        });
        hit.addEventListener('mouseleave', function () {
            document.querySelectorAll('.month-slice').forEach(function (s) { s.style.opacity = ''; });
            if (selectedMonth !== null) updateWheelDetail(selectedMonth);
            else startWheelIdle();
        });
        hit.addEventListener('click', function () { selectedMonth = parseInt(this.dataset.month); });
        hit.addEventListener('focus', function () {
            var idx = parseInt(this.dataset.month);
            document.querySelectorAll('.month-slice').forEach(function (s) {
                s.style.opacity = (parseInt(s.dataset.month) === idx) ? '1' : '0.45';
            });
            updateWheelDetail(idx);
        });
        hit.addEventListener('blur', function () {
            document.querySelectorAll('.month-slice').forEach(function (s) { s.style.opacity = ''; });
            if (selectedMonth === null) clearWheelDetail();
        });
        hit.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                selectedMonth = parseInt(this.dataset.month);
                updateWheelDetail(selectedMonth);
            }
        });
        svg.appendChild(hit);
    });

    var cc = document.createElementNS(ns, 'circle');
    cc.setAttribute('cx', cx); cc.setAttribute('cy', cy); cc.setAttribute('r', innerR - 1);
    cc.setAttribute('fill', 'rgba(15,27,61,.8)');
    cc.setAttribute('stroke', 'rgba(255,255,255,.07)');
    cc.setAttribute('stroke-width', '1');
    svg.appendChild(cc);

    var ct = document.createElementNS(ns, 'text');
    ct.setAttribute('x', cx); ct.setAttribute('y', cy);
    ct.setAttribute('text-anchor', 'middle');
    ct.setAttribute('dominant-baseline', 'middle');
    ct.setAttribute('fill', 'rgba(255,255,255,.22)');
    ct.setAttribute('font-family', 'DM Mono, monospace');
    ct.setAttribute('font-size', '7');
    ct.setAttribute('letter-spacing', '2');
    ct.textContent = 'YOLO';
    svg.appendChild(ct);

    container.appendChild(svg);

    // Show the month-grid overview by default
    clearWheelDetail();
}

// ── Wheel detail auto-cycle (idle animation) ──
var wheelIdleTimer  = null;
var wheelIdleMonth  = 0;
var wheelIsIdle     = true;

function wheelIdleTick() {
    if (!wheelIsIdle) return;
    var wheelEl = document.querySelector('#sysWheel');
    if (!wheelEl) return;
    document.querySelectorAll('.month-slice').forEach(function (s) {
        s.style.opacity = (parseInt(s.dataset.month) === wheelIdleMonth) ? '1' : '0.35';
    });
    showWheelContent(wheelIdleMonth, true);
    wheelIdleMonth = (wheelIdleMonth + 1) % 12;
    wheelIdleTimer = setTimeout(wheelIdleTick, 1800);
}

function startWheelIdle() {
    wheelIsIdle = true;
    wheelIdleMonth = new Date().getMonth();
    clearTimeout(wheelIdleTimer);
    var wheelEl = document.querySelector('#sysWheel');
    if (wheelEl) wheelEl.classList.add('sys-wheel--idle');
    wheelIdleTick();
}

function stopWheelIdle() {
    clearTimeout(wheelIdleTimer);
    wheelIsIdle = false;
    var wheelEl = document.querySelector('#sysWheel');
    if (wheelEl) wheelEl.classList.remove('sys-wheel--idle');
}

function showWheelContent(idx, isIdle) {
    var data = MONTHLY[idx];
    var detail = document.querySelector('#wheelDetail');
    var prompt = document.querySelector('.wheel-prompt');
    if (prompt) prompt.style.display = 'none';

    var monthEl = document.querySelector('#wdMonth');
    monthEl.textContent = MONTH_FULL[idx].toLowerCase();
    monthEl.className = 'wheel-detail-month' + (isIdle ? ' wheel-detail-month--idle' : '');

    var rows = [
        { sys: 'flood', color: '#7292cb', desc: data.flood },
        { sys: 'flight', color: '#f06896', desc: data.birds },
        { sys: 'food',  color: '#bda543', desc: data.rice }
    ];

    var rowsEl = document.querySelector('#wdRows');
    rowsEl.innerHTML = (isIdle ? '<div class="wheel-idle-cue">hover any month to explore</div>' : '') +
        rows.map(function (r) {
            return '<div class="wheel-detail-row' + (isIdle ? ' wheel-detail-row--idle' : '') + '">' +
                '<div class="wdr-dot" style="background:' + r.color + '"></div>' +
                '<div><span class="wdr-system">' + r.sys + '</span>' +
                '<span class="wdr-desc">' + r.desc + '</span></div>' +
                '</div>';
        }).join('');
}

function updateWheelDetail(idx) {
    stopWheelIdle();
    var prompt = document.querySelector('.wheel-prompt');
    if (prompt) prompt.style.display = 'none';
    showWheelContent(idx, false);
}

function clearWheelDetail() {
    startWheelIdle();
}

// ════════════════════════════════════════════════════════════════
// BIRD CARDS — radial arc + audio player
// ════════════════════════════════════════════════════════════════

function makeRadialArc(freq, color) {
    var ns = 'http://www.w3.org/2000/svg';
    var size = 52, cx = 26, cy = 26, r = 20;
    var svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 ' + size + ' ' + size);
    svg.setAttribute('width', size);
    svg.setAttribute('height', size);
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', 'Spotted on roughly ' + Math.round(freq / 10) + ' out of every 10 visits');

    var bg = document.createElementNS(ns, 'circle');
    bg.setAttribute('cx', cx); bg.setAttribute('cy', cy); bg.setAttribute('r', r);
    bg.setAttribute('fill', 'none');
    bg.setAttribute('stroke', 'rgba(255,255,255,0.07)');
    bg.setAttribute('stroke-width', '2');
    svg.appendChild(bg);

    var pct = freq / 100;
    var startAngle = -90;
    var endAngle   = startAngle + pct * 360;

    function pt(deg) {
        var a = (deg * Math.PI) / 180;
        return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
    }

    var s = pt(startAngle), e = pt(endAngle);
    var arcPath = document.createElementNS(ns, 'path');
    arcPath.setAttribute('d', 'M ' + s.x + ' ' + s.y + ' A ' + r + ' ' + r + ' 0 ' + (pct > 0.5 ? 1 : 0) + ' 1 ' + e.x + ' ' + e.y);
    arcPath.setAttribute('fill', 'none');
    arcPath.setAttribute('stroke', color);
    arcPath.setAttribute('stroke-width', '2.5');
    arcPath.setAttribute('stroke-linecap', 'round');
    arcPath.setAttribute('stroke-opacity', '0.8');
    svg.appendChild(arcPath);

    var txt = document.createElementNS(ns, 'text');
    txt.setAttribute('x', cx); txt.setAttribute('y', cy + 1);
    txt.setAttribute('text-anchor', 'middle');
    txt.setAttribute('dominant-baseline', 'middle');
    txt.setAttribute('fill', 'rgba(255,255,255,0.7)');
    txt.setAttribute('font-size', '9');
    txt.setAttribute('font-family', 'DM Mono, monospace');
    txt.textContent = freq + '%';
    svg.appendChild(txt);

    return svg;
}

// Audio player state — only one playing at a time
var currentAudio = null;
var currentBtn   = null;

function stopAllAudio() {
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
    }
    document.querySelectorAll('.bird-audio-btn').forEach(function (b) {
        b.classList.remove('playing');
        b.setAttribute('aria-label', 'play call');
    });
    currentAudio = null;
    currentBtn   = null;
}

var COLOR_MAP = {
    'var(--lightblue)':     '#7292cb',
    'var(--yellow)':        '#f1b93f',
    'var(--olivegreen)':    '#bda543',
    'rgba(255,255,255,.4)': 'rgba(255,255,255,0.55)'
};

function renderBirdGrid() {
    var grid = document.querySelector('#birdGrid');
    grid.innerHTML = '';

    BIRDS_DATA.forEach(function (b) {
        var resolvedColor = COLOR_MAP[b.color] || '#7292cb';
        var audioSrc      = 'media/audio/' + b.callNo + '.mp3';
        var xcLink        = 'https://xeno-canto.org/' + b.callNo.replace('XC', '');

        var card = document.createElement('div');
        card.className = 'bird-card';
        card.dataset.season = b.season;
        card.setAttribute('role', 'article');
        card.setAttribute('aria-label', b.name + ' (' + b.sci + ') — ' + b.seasonLabel);

        card.innerHTML =
            '<div class="bird-card-img-slot">' +
            '<img src="images/systems/birds/' + b.slug + '.png"' +
            ' alt="Illustration of a ' + b.name + ' at the Yolo Bypass Wildlife Area"' +
            ' class="bird-card-img"' +
            ' onload="this.parentElement.classList.remove(\'bird-img-missing\')"' +
            ' onerror="this.parentElement.classList.add(\'bird-img-missing\')">' +
            // '<span class="bird-img-label">bird-' + b.slug + '.png</span>' +
            '</div>' +
            '<div class="bird-card-content">' +
            '<div class="bird-card-header">' +
            '<span class="bird-card-num">' + b.num + '</span>' +
            '<span class="bird-card-season season-' + b.season + '">' + b.seasonLabel + '</span>' +
            '</div>' +
            '<div class="bird-card-name">' + b.name + '</div>' +
            '<div class="bird-card-sci">' + b.sci + '</div>' +
            '<div class="bird-card-radial-row">' +
            '<div class="bird-card-radial-svg" data-color="' + resolvedColor + '" data-freq="' + b.freq + '"></div>' +
            '<div class="bird-card-stat-block">' +
            '<div class="bird-card-stat-freq" style="color:' + resolvedColor + '">' + b.freq + '%</div>' +
            '<div class="bird-card-stat-label">chance of spotting it on a visit</div>' +
            '<div class="bird-card-stat-peak">' + b.peak + '</div>' +
            '</div>' +
            '</div>' +
            '<div class="bird-card-connection">' + b.connection + '</div>' +
            '<div class="bird-audio-wrap">' +
            '<button class="bird-audio-btn"' +
            ' aria-label="play call"' +
            ' data-src="' + audioSrc + '"' +
            ' data-color="' + resolvedColor + '">' +
            '<span class="bird-audio-icon">' +
            '<svg class="icon-play"  viewBox="0 0 16 16" width="11" height="11"><polygon points="3,2 13,8 3,14" fill="currentColor"/></svg>' +
            '<svg class="icon-pause" viewBox="0 0 16 16" width="11" height="11"><rect x="2" y="2" width="4" height="12" fill="currentColor"/><rect x="10" y="2" width="4" height="12" fill="currentColor"/></svg>' +
            '</span>' +
            '<span class="bird-audio-bars">' +
            '<span class="bar b1" style="background:' + resolvedColor + '"></span>' +
            '<span class="bar b2" style="background:' + resolvedColor + '"></span>' +
            '<span class="bar b3" style="background:' + resolvedColor + '"></span>' +
            '<span class="bar b4" style="background:' + resolvedColor + '"></span>' +
            '<span class="bar b5" style="background:' + resolvedColor + '"></span>' +
            '</span>' +
            '</button>' +
            '<div class="bird-audio-meta">' +
            /* KIOSK MODE: links replaced with plain text. To restore, remove <span> lines and uncomment <a> lines below. */
            /* '<a href="' + xcLink + '" target="_blank" rel="noopener" class="bird-audio-id">' + b.callNo + '</a>' + */
            '<span class="bird-audio-id">' + b.callNo + '</span>' +
            /* '<span class="bird-audio-credit">rec. ' + b.recordist + ' \u00b7 <a href="https://xeno-canto.org" target="_blank" rel="noopener" class="bird-xc-link">xeno-canto.org</a> \u00b7 <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/" target="_blank" rel="noopener" class="bird-cc-link">CC BY-NC-SA</a></span>' + */
            '<span class="bird-audio-credit">rec. ' + b.recordist + ' \u00b7 xeno-canto.org \u00b7 CC BY-NC-SA</span>' +
            '</div>' +
            '</div>' +
            '</div>';

        card.querySelector('.bird-card-img-slot').classList.add('bird-img-missing');
        grid.appendChild(card);
    });

    // Inject SVG arcs after DOM insertion
    grid.querySelectorAll('.bird-card-radial-svg').forEach(function (slot) {
        slot.appendChild(makeRadialArc(parseInt(slot.dataset.freq), slot.dataset.color));
    });

    // Wire up audio buttons
    grid.querySelectorAll('.bird-audio-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
            if (btn.classList.contains('playing')) {
                stopAllAudio();
                return;
            }
            stopAllAudio();

            var audio = new Audio(btn.dataset.src);
            currentAudio = audio;
            currentBtn   = btn;

            btn.classList.add('playing');
            btn.setAttribute('aria-label', 'stop call');

            audio.play().catch(function () { stopAllAudio(); });
            audio.addEventListener('ended', function () { stopAllAudio(); });
        });
    });
}

document.querySelectorAll('.sys-bird-filter').forEach(function (btn) {
    btn.addEventListener('click', function () {
        document.querySelectorAll('.sys-bird-filter').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        var season = btn.dataset.season;
        document.querySelectorAll('.bird-card').forEach(function (card) {
            card.classList.toggle('hidden', season !== 'all' && card.dataset.season !== season);
        });
    });
});

// ════════════════════════════════════════════════════════════════
// RICE INTERACTIVE CARDS — with paddy grid + animated counter
// ════════════════════════════════════════════════════════════════

function renderRiceTable() {
    var wrap = document.querySelector('#riceInteractive');
    if (!wrap) return;

    var MAX_ACRES = 36000;
    var rows = RICE_TABLE.slice().reverse(); // chronological

    var grid = document.createElement('div');
    grid.className = 'rice-cards-wrap';
    grid.setAttribute('role', 'list');

    var panel = document.createElement('div');
    panel.className = 'rice-panel';
    panel.setAttribute('aria-live', 'polite');
    panel.id = 'ricePanelDetail';

    var activeYear = null;

    function acresNum(str) { return parseInt(str.replace(/[^0-9]/g, ''), 10); }

    // ── Paddy grid visualization ──
    // Renders a COLS×ROWS grid of cells, filling proportionally to acreage
    function makePaddyGrid(pct, isWet) {
        var COLS = 14, ROWS = 7, TOTAL = COLS * ROWS;
        var filled = Math.round(pct * TOTAL);

        var container = document.createElement('div');
        container.className = 'rice-paddy-grid';
        container.style.gridTemplateColumns = 'repeat(' + COLS + ', 10px)';
        container.setAttribute('aria-hidden', 'true');

        for (var i = 0; i < TOTAL; i++) {
            var cell = document.createElement('div');
            cell.className = 'rice-paddy-cell';
            var isFilled = i < filled;
            if (isFilled) {
                cell.classList.add(isWet ? 'filled-wet' : 'filled-dry');
                // stagger animation
                cell.style.animationDelay = (i * 8) + 'ms';
            } else {
                cell.classList.add('empty');
            }
            cell.style.width  = '10px';
            cell.style.height = '8px';
            container.appendChild(cell);
        }

        return container;
    }

    // ── Animated count-up for the acres number ──
    function animateCounter(el, target) {
        var start = null;
        var duration = 900;
        function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
        function step(ts) {
            if (!start) start = ts;
            var progress = Math.min((ts - start) / duration, 1);
            var val = Math.round(easeOut(progress) * target);
            el.textContent = val.toLocaleString();
            if (progress < 1) requestAnimationFrame(step);
            else el.textContent = target.toLocaleString();
        }
        requestAnimationFrame(step);
    }

    // ── Build SVG ring ──
    function makeRing(pct, size, color) {
        var r = size * 0.38;
        var cx = size / 2, cy = size / 2;
        var circ = 2 * Math.PI * r;
        var svgNS = 'http://www.w3.org/2000/svg';
        var svg = document.createElementNS(svgNS, 'svg');
        svg.setAttribute('width', size);
        svg.setAttribute('height', size);
        svg.setAttribute('viewBox', '0 0 ' + size + ' ' + size);
        svg.classList.add('rice-ring-svg');
        svg.setAttribute('aria-hidden', 'true');

        var track = document.createElementNS(svgNS, 'circle');
        track.setAttribute('cx', cx); track.setAttribute('cy', cy); track.setAttribute('r', r);
        track.setAttribute('fill', 'none');
        track.setAttribute('stroke', 'rgba(255,255,255,.06)');
        track.setAttribute('stroke-width', '6');
        svg.appendChild(track);

        var fill = document.createElementNS(svgNS, 'circle');
        fill.setAttribute('cx', cx); fill.setAttribute('cy', cy); fill.setAttribute('r', r);
        fill.setAttribute('fill', 'none');
        fill.setAttribute('stroke', color);
        fill.setAttribute('stroke-width', '6');
        fill.setAttribute('stroke-linecap', 'round');
        fill.setAttribute('stroke-dasharray', (pct * circ) + ' ' + ((1 - pct) * circ));
        fill.setAttribute('stroke-dashoffset', circ * 0.25);
        fill.style.transition = 'stroke-dasharray .8s cubic-bezier(.22,1,.36,1)';
        svg.appendChild(fill);
        return svg;
    }

    function openPanel(row) {
        var acres = acresNum(row.acres);
        var pct   = acres / MAX_ACRES;
        var isWet = row.flood;
        var ringColor = isWet ? '#bda543' : 'rgba(189,165,67,0.35)';

        // Left column: paddy grid + ring stacked
        var leftCol = document.createElement('div');
        leftCol.className = 'rice-panel-ring';
        leftCol.style.display = 'flex';
        leftCol.style.flexDirection = 'column';
        leftCol.style.gap = '1.2rem';
        leftCol.style.alignItems = 'flex-start';

        // Acres counter block
        var counterBlock = document.createElement('div');
        var counterNum = document.createElement('span');
        counterNum.className = 'rice-acres-counter' + (isWet ? '' : ' dry-counter');
        counterNum.textContent = '0';
        counterNum.setAttribute('aria-label', acres.toLocaleString() + ' acres');
        var counterUnit = document.createElement('span');
        counterUnit.className = 'rice-acres-unit';
        counterUnit.textContent = 'acres harvested';
        counterBlock.appendChild(counterNum);
        counterBlock.appendChild(document.createElement('br'));
        counterBlock.appendChild(counterUnit);
        leftCol.appendChild(counterBlock);

        // Paddy grid
        leftCol.appendChild(makePaddyGrid(pct, isWet));

        // Pct label
        var pctNote = document.createElement('div');
        pctNote.style.cssText = 'font-family:"DM Mono",monospace;font-size:.68rem;letter-spacing:.14em;text-transform:uppercase;color:#4a4f5e;';
        pctNote.textContent = Math.round(pct * 100) + '% of peak (2020)';
        leftCol.appendChild(pctNote);

        // Body
        var body = document.createElement('div');
        body.className = 'rice-panel-body';

        var head = document.createElement('div');
        head.className = 'rice-panel-year-head';
        var yr = document.createElement('span');
        yr.className = 'rice-panel-year';
        yr.textContent = row.year;
        var badge = document.createElement('span');
        badge.className = 'rice-panel-flood-tag ' + (isWet ? 'wet' : 'dry');
        badge.textContent = isWet ? 'wet year' : 'dry year';
        head.appendChild(yr); head.appendChild(badge);

        var ctx = document.createElement('p');
        ctx.className = 'rice-panel-context';
        ctx.textContent = row.context;

        var stats = document.createElement('div');
        stats.className = 'rice-panel-stats';

        function makeStat(label, val) {
            var s = document.createElement('div'); s.className = 'rice-stat';
            var l = document.createElement('span'); l.className = 'rice-stat-label'; l.textContent = label;
            var v = document.createElement('span'); v.className = 'rice-stat-value'; v.textContent = val;
            s.appendChild(l); s.appendChild(v);
            return s;
        }
        stats.appendChild(makeStat('production', row.prod));
        stats.appendChild(makeStat('gross value', row.value));
        stats.appendChild(makeStat('flood days', FLOOD[row.year] + ' days'));

        body.appendChild(head);
        body.appendChild(ctx);
        body.appendChild(stats);

        // Comparison sidebar
        var compare = document.createElement('div');
        compare.className = 'rice-panel-compare';

        var cl = document.createElement('div');
        cl.className = 'rice-compare-label';
        cl.textContent = 'vs. all years';
        compare.appendChild(cl);

        rows.forEach(function (r) {
            var isHighlight = r.year === row.year;
            var rowEl = document.createElement('div');
            rowEl.className = 'rice-compare-row' + (isHighlight ? ' highlight' : '');
            var yrEl = document.createElement('span');
            yrEl.className = 'rice-compare-yr';
            yrEl.textContent = r.year;
            var barTrack = document.createElement('div');
            barTrack.className = 'rice-compare-bar-wrap';
            var barFill = document.createElement('div');
            barFill.className = 'rice-compare-bar';
            barFill.style.width = Math.max(3, acresNum(r.acres) / MAX_ACRES * 100) + '%';
            barFill.style.background = isHighlight
                ? 'var(--olivegreen)'
                : (r.flood ? 'rgba(189,165,67,0.35)' : 'rgba(128,135,153,0.3)');
            barTrack.appendChild(barFill);
            rowEl.appendChild(yrEl);
            rowEl.appendChild(barTrack);
            compare.appendChild(rowEl);
        });

        panel.innerHTML = '';
        panel.classList.add('open');
        panel.appendChild(leftCol);
        panel.appendChild(body);
        panel.appendChild(compare);

        // Trigger counter animation after DOM is in place
        setTimeout(function() { animateCounter(counterNum, acres); }, 60);
        setTimeout(function() { panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }, 80);
    }

    rows.forEach(function (row, i) {
        var acres = acresNum(row.acres);
        var pct   = acres / MAX_ACRES;
        var isWet = row.flood;

        var card = document.createElement('div');
        card.className = 'rice-card' + (isWet ? ' wet-year' : '');
        card.setAttribute('role', 'button');
        card.setAttribute('tabindex', '0');
        card.setAttribute('aria-expanded', 'false');
        card.setAttribute('aria-label', row.year + ': ' + row.acres + ' acres. ' + (isWet ? 'Wet year.' : 'Dry year.') + ' Click to expand.');
        card.dataset.year = row.year;

        // Field-fill background element
        var fieldBg = document.createElement('div');
        fieldBg.className = 'rice-card-field-bg';
        fieldBg.style.height = Math.max(8, pct * 100) + '%';
        card.appendChild(fieldBg);

        var yearEl = document.createElement('div');
        yearEl.className = 'rice-card-year';
        yearEl.textContent = row.year;

        var badgeEl = document.createElement('div');
        badgeEl.className = 'rice-card-badge ' + (isWet ? 'wet' : 'dry');
        badgeEl.textContent = isWet ? '~ wet' : '⌀ dry';

        var acresEl = document.createElement('div');
        acresEl.className = 'rice-card-acres';
        acresEl.textContent = row.acres + ' ac';

        var miniTrack = document.createElement('div');
        miniTrack.className = 'rice-card-minibar-track';
        var miniFill = document.createElement('div');
        miniFill.className = 'rice-card-minibar-fill';
        miniFill.style.width = Math.max(4, pct * 100) + '%';
        miniFill.style.background = isWet
            ? 'linear-gradient(90deg, var(--olivegreen), rgba(189,165,67,.4))'
            : 'rgba(128,135,153,.3)';
        miniTrack.appendChild(miniFill);

        card.appendChild(yearEl);
        card.appendChild(badgeEl);
        card.appendChild(acresEl);
        card.appendChild(miniTrack);

        function toggle() {
            if (activeYear === row.year) {
                activeYear = null;
                card.classList.remove('active');
                card.setAttribute('aria-expanded', 'false');
                panel.classList.remove('open');
                panel.innerHTML = '';
            } else {
                activeYear = row.year;
                grid.querySelectorAll('.rice-card').forEach(function (c) {
                    c.classList.remove('active');
                    c.setAttribute('aria-expanded', 'false');
                });
                card.classList.add('active');
                card.setAttribute('aria-expanded', 'true');
                openPanel(row);
            }
        }

        card.addEventListener('click', toggle);
        card.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
        });

        grid.appendChild(card);

        if (i === rows.length - 1) {
            grid.appendChild(panel);
        }
    });

    wrap.appendChild(grid);
}

// ════════════════════════════════════════════════════════════════
// INIT
// ════════════════════════════════════════════════════════════════

renderChart();
renderLegend();
renderWheel();
renderBirdGrid();
renderRiceTable();



// ════════════════════════════════════════════════════════════════
// VISUAL ENHANCEMENTS
// ════════════════════════════════════════════════════════════════

// 1. Count-up animation for hero stats
(function() {
    var stats = document.querySelectorAll('.sys-hero-stat-num');
    if (!stats.length) { return; }

    function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

    function countUp(el) {
        var target = parseInt(el.dataset.target, 10);
        var suffix = el.dataset.suffix || '';
        var duration = 1400;
        var start = null;

        function format(n) {
            if (target >= 1000) { return n.toLocaleString(); }
            return String(n);
        }

        function step(ts) {
            if (!start) { start = ts; }
            var progress = Math.min((ts - start) / duration, 1);
            var val = Math.round(easeOut(progress) * target);
            el.textContent = format(val) + suffix;
            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                el.textContent = format(target) + suffix;
                el.classList.add('counted');
            }
        }
        el.classList.add('counted');
        requestAnimationFrame(step);
    }

    // Trigger on page load after a short delay
    setTimeout(function() {
        stats.forEach(function(el) { countUp(el); });
    }, 600);
})();

// 2. Section number + title scroll-in animation
(function() {
    if (!('IntersectionObserver' in window)) {
        document.querySelectorAll('.sys-section-num, .sys-section-title').forEach(function(el) {
            el.classList.add('in-view');
        });
        return;
    }

    var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });

    document.querySelectorAll('.sys-section-num, .sys-section-title').forEach(function(el) {
        observer.observe(el);
    });
})();

})();

// Redraw chart on resize/orientation change
var _chartResizeTimer;
window.addEventListener('resize', function() {
    clearTimeout(_chartResizeTimer);
    _chartResizeTimer = setTimeout(renderChart, 150);
});