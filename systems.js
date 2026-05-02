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
    2023: 73
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
    2023: 1187
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
    2023: { acres: 29974,  tons: 128000, value: 54.3 }
};

var YEARS = [2018, 2019, 2020, 2021, 2022, 2023];

var RICE_TABLE = [
    { year: 2023, acres: '29,974', prod: '128,000 tons', value: '$54.3M', flood: true,
      context: 'A wet winter brought water back. The Ag Commissioner called it a reliable water year. Rice acreage went up more than 200% from 2022.' },
    { year: 2022, acres: '9,507',  prod: '30,200 tons',  value: '$23.2M', flood: false,
      context: 'Worst drought in years. Farmers could not get enough water to plant. Acreage fell 59% from the year before. Many fields sat empty.' },
    { year: 2021, acres: '17,800', prod: '60,100 tons',  value: '$20.1M', flood: false,
      context: 'Another dry year. The Fremont Weir did not overtop at all. Lower planting than 2020.' },
    { year: 2020, acres: '36,000', prod: '60,100 tons',  value: '$13.9M', flood: true,
      context: 'Good planting year. Post-harvest flooding supported strong bird numbers. Birding activity spiked nationally during COVID.' },
    { year: 2019, acres: '23,393', prod: '77,800 tons',  value: '$16.4M', flood: true,
      context: 'Normal water year with some winter storms. Fremont Weir overtopped for about 31 days.' },
    { year: 2018, acres: '22,800', prod: '67,400 tons',  value: '$18.4M', flood: true,
      context: 'Wet winter — 42 days of flooding. Normal rice acreage for the county. Overall ag value was $676M that year.' }
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
        connection: 'Pintails show up right after rice harvest when the fields begin to flood. They will eat leftover grain and small bugs in the shallow water. In a wet year you can see tens of thousands of them at once.',
        color: 'var(--lightblue)', callNo: 'XC621202', recordist: 'Paul Marvin'
    },
    {
        num: '02', name: 'sandhill crane', sci: 'Antigone canadensis', slug: 'sandhill-crane',
        season: 'winter', seasonLabel: 'Oct–Mar', freq: 62,
        peak: 'Nov–Feb: roosts of 2,000–8,000',
        connection: 'Cranes eat in the rice stubble during the day and fly to the wetlands at dusk to sleep. They come back year after year.',
        color: 'var(--lightblue)', callNo: 'XC539728', recordist: 'Thomas Magarian'
    },
    {
        num: '03', name: 'american coot', sci: 'Fulica americana', slug: 'american-coot',
        season: 'yearround', seasonLabel: 'Year-round', freq: 85,
        peak: 'Year-round; winter counts up to 5,000',
        connection: 'ONe of the most commonly seen waterbirds at the basin. They stay year-round in the permanent wetlands and pack in by the thousands when the seasonal fields flood.',
        color: 'rgba(255,255,255,.4)', callNo: 'XC452164', recordist: 'Paul Marvin'
    },
    {
        num: '04', name: 'white-faced ibis', sci: 'Plegadis chihi', slug: 'white-faced-ibis',
        season: 'summer', seasonLabel: 'Mar–Oct', freq: 70,
        peak: 'Apr–Sep: breeding colonies of 500–3,000',
        connection: 'Ibis nest in the tule reeds and feed in wet farm fields through spring and summer. Spring flooding of rice paddies is part of why they breed here. You can spot them by the way they walk, probing the mud with their curved bills.',
        color: 'var(--yellow)', callNo: 'XC452112', recordist: 'Paul Marvin'
    },
    {
        num: '05', name: 'great blue heron', sci: 'Ardea herodias', slug: 'great-blue-heron',
        season: 'yearround', seasonLabel: 'Year-round', freq: 88,
        peak: 'Year-round; nests in willows along levees',
        connection: 'Great blue herons live here permanently. Nests in the willows along the levee roads. They tend to hunt in the flooded fields and permanent ponds. They are also one of the most popular birds spotted at the basin.',
        color: 'rgba(255,255,255,.4)', callNo: 'XC143575', recordist: 'Paul Marvin'
    },
    {
        num: '06', name: 'northern harrier', sci: 'Circus hudsonius', slug: 'northern-harrier',
        season: 'winter', seasonLabel: 'Oct–Apr', freq: 74,
        peak: 'Nov–Mar: several birds hunting at once',
        connection: 'Harriers fly low and slow over flooded fields looking for voles and frogs. You can see more of them when there is more water, as more water means denser culsters of prey.',
        color: 'var(--lightblue)', callNo: 'XC776694', recordist: 'Phoebe Barnes'
    },
    {
        num: '07', name: 'dunlin', sci: 'Calidris alpina', slug: 'dunlin',
        season: 'winter', seasonLabel: 'Nov–Apr', freq: 58,
        peak: 'Dec–Feb: flocks of 1,000–20,000',
        connection: 'Dunlin come down from the Arctic to spend winter here. They need very shallow water to pick bugs off the mud. The Yolo Basin is one of the better wintering spots for them on the West Coast.',
        color: 'var(--lightblue)', callNo: 'XC169170', recordist: 'Paul Marvin'
    },
    {
        num: '08', name: 'great egret', sci: 'Ardea alba', slug: 'great-egret',
        season: 'yearround', seasonLabel: 'Year-round', freq: 81,
        peak: 'Year-round; large communal roosts in winter',
        connection: 'You will find great egrets standing still in flooded fields waiting for fish or frogs. They are easy to spot and you can see them from the auto tour route at the Yolo Bypass Wildlife Area.',
        color: 'rgba(255,255,255,.4)', callNo: 'XC452101', recordist: 'Paul Marvin'
    },
    {
        num: '09', name: 'snow goose', sci: 'Anser caerulescens', slug: 'snow-goose',
        season: 'winter', seasonLabel: 'Nov–Mar', freq: 52,
        peak: 'Dec–Feb: flocks occasionally over 50,000',
        connection: 'Snow geese come from the Arctic and graze on the legume fields at Tule Ranch and the rice stubble. Big flocks show up in wet years when there is more flooded area to spread out across. They are very loud!',
        color: 'var(--lightblue)', callNo: 'XC452581', recordist: 'Paul Marvin'
    },
    {
        num: '10', name: 'tricolored blackbird', sci: 'Agelaius tricolor', slug: 'tricolored-blackbird',
        season: 'spring', seasonLabel: 'Mar–Jul', freq: 44,
        peak: 'Apr–Jun: colonies of 500–5,000',
        connection: 'Almost the entire world population of this bird breeds in California. The Yolo Bypass is one of their main nesting sites. They build nests in the tule reeds and feed in the rice fields next door. Listed as threatened. Losing the basin would hurt this species badly.',
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
      birds: 'Summer residents — ibis, bittern, stilts. Almost no ducks.',
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
      birds: 'Best diversity of the year — early and late species overlap. Crane roosts forming at dusk.',
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
// CHART
// ════════════════════════════════════════════════════════════════

function renderChart() {
    var chart = document.querySelector('#annualChart');
    chart.innerHTML = '';

    var maxFlood = Math.max.apply(null, YEARS.map(function(y){ return FLOOD[y]; }));
    var maxBirds = Math.max.apply(null, YEARS.map(function(y){ return BIRDS[y]; }));
    var maxRice  = Math.max.apply(null, YEARS.map(function(y){ return RICE[y].acres; }));

    YEARS.forEach(function (year) {
        var wrap = document.createElement('div');
        wrap.className = 'sys-chart-year';
        wrap.setAttribute('data-year', year);

        var group = document.createElement('div');
        group.className = 'sys-bar-group';

        function makeBar(cls, val, max, active) {
            var el = document.createElement('div');
            el.className = 'sys-bar ' + cls + (active ? '' : ' dim');
            el.style.height = (active && max > 0 ? Math.max(2, (val / max) * 280) : 2) + 'px';
            return el;
        }

        group.appendChild(makeBar('flood-bar', FLOOD[year], maxFlood, activeFilters.flood));
        group.appendChild(makeBar('birds-bar', BIRDS[year], maxBirds, activeFilters.birds));
        group.appendChild(makeBar('rice-bar',  RICE[year].acres, maxRice, activeFilters.rice));

        wrap.appendChild(group);
        chart.appendChild(wrap);

        wrap.addEventListener('mouseenter', function (e) { showTooltip(e, year); });
        wrap.addEventListener('mousemove',  function (e) { moveTooltip(e); });
        wrap.addEventListener('mouseleave', hideTooltip);
    });
}

// ════════════════════════════════════════════════════════════════
// TOOLTIP
// ════════════════════════════════════════════════════════════════

var tooltip = document.querySelector('#sysTooltip');

function showTooltip(e, year) {
    var rows = '';
    if (activeFilters.flood) rows += '<div class="sys-tooltip-row"><span class="sys-tooltip-label" style="color:var(--lightblue)">flood days</span><span class="sys-tooltip-val">' + FLOOD[year] + ' days</span></div>';
    if (activeFilters.birds) rows += '<div class="sys-tooltip-row"><span class="sys-tooltip-label" style="color:var(--pink)">checklists</span><span class="sys-tooltip-val">' + BIRDS[year].toLocaleString() + '</span></div>';
    if (activeFilters.rice)  rows += '<div class="sys-tooltip-row"><span class="sys-tooltip-label" style="color:var(--olivegreen)">rice acres</span><span class="sys-tooltip-val">' + parseInt(RICE[year].acres).toLocaleString() + '</span></div>';
    tooltip.innerHTML = '<span class="sys-tooltip-year">' + year + '</span>' + rows;
    tooltip.classList.add('visible');
    moveTooltip(e);
}

function moveTooltip(e) {
    var x = e.clientX + 16;
    var w = tooltip.offsetWidth;
    if (x + w > window.innerWidth - 20) x = e.clientX - w - 16;
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
    var container = document.querySelector('#sysWheel');
    var size = 400;
    var cx = size / 2, cy = size / 2;
    var outerR = 162, innerR = 56;
    var ns = 'http://www.w3.org/2000/svg';

    var floodAct = [4,3,2,1,0,0,0,0,1,2,3,4];
    var birdsAct = [4,4,3,3,2,1,2,3,3,4,4,4];
    var riceAct  = [0,0,0,2,3,4,4,4,4,3,1,0];

    var svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 ' + size + ' ' + size);
    svg.setAttribute('xmlns', ns);

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
            if (selectedMonth === null) clearWheelDetail();
        });
        hit.addEventListener('click', function () { selectedMonth = parseInt(this.dataset.month); });
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
}

function updateWheelDetail(idx) {
    var data = MONTHLY[idx];
    var prompt = document.querySelector('.wheel-prompt');
    if (prompt) prompt.style.display = 'none';
    document.querySelector('#wdMonth').textContent = MONTH_FULL[idx].toLowerCase();

    var rows = [
        { sys: 'flood', color: '#7292cb', desc: data.flood },
        { sys: 'flight', color: '#f06896', desc: data.birds },
        { sys: 'food',  color: '#bda543', desc: data.rice }
    ];

    document.querySelector('#wdRows').innerHTML = rows.map(function (r) {
        return '<div class="wheel-detail-row">' +
            '<div class="wdr-dot" style="background:' + r.color + '"></div>' +
            '<div><span class="wdr-system">' + r.sys + '</span><span class="wdr-desc">' + r.desc + '</span></div>' +
            '</div>';
    }).join('');
}

function clearWheelDetail() {
    document.querySelector('#wdMonth').textContent = '';
    document.querySelector('#wdRows').innerHTML = '';
    var prompt = document.querySelector('.wheel-prompt');
    if (prompt) prompt.style.display = '';
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

        card.innerHTML =
            '<div class="bird-card-img-slot">' +
            '<img src="images/systems/birds/' + b.slug + '.png"' +
            ' alt="Illustration of a ' + b.name + ' at the Yolo Bypass Wildlife Area"' +
            ' class="bird-card-img"' +
            ' onload="this.parentElement.classList.remove(\'bird-img-missing\')"' +
            ' onerror="this.parentElement.classList.add(\'bird-img-missing\')">' +
            '<span class="bird-img-label">bird-' + b.slug + '.png</span>' +
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
            '<div class="bird-card-stat-label">of checklists</div>' +
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
            '<a href="' + xcLink + '" target="_blank" rel="noopener" class="bird-audio-id">' + b.callNo + '</a>' +
            '<span class="bird-audio-credit">rec. ' + b.recordist + ' · <a href="https://xeno-canto.org" target="_blank" rel="noopener" class="bird-xc-link">xeno-canto.org</a> · <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/" target="_blank" rel="noopener" class="bird-cc-link">CC BY-NC-SA</a></span>' +
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
// RICE VISUAL TIMELINE
// ════════════════════════════════════════════════════════════════

function renderRiceTable() {
    var tableWrap = document.querySelector('#riceTable');
    if (!tableWrap) return;

    tableWrap.style.display = 'none';

    var container = document.createElement('div');
    container.className = 'rice-timeline';
    tableWrap.parentNode.insertBefore(container, tableWrap);

    var maxAcres = 36000;
    var rows = RICE_TABLE.slice().reverse();

    rows.forEach(function (row) {
        var acresNum = parseInt(row.acres.replace(/,/g, ''));
        var pct      = acresNum / maxAcres;
        var isFlood  = row.flood;

        var entry = document.createElement('div');
        entry.className = 'rice-entry';

        var yearBadge = document.createElement('div');
        yearBadge.className = 'rice-year';
        yearBadge.textContent = row.year;
        entry.appendChild(yearBadge);

        var waterTag = document.createElement('div');
        waterTag.className = 'rice-water-tag ' + (isFlood ? 'rice-wet' : 'rice-dry');
        waterTag.textContent = isFlood ? '~ wet' : '⌀ dry';
        entry.appendChild(waterTag);

        var content = document.createElement('div');
        content.className = 'rice-content';

        var barWrap = document.createElement('div');
        barWrap.className = 'rice-bar-wrap';

        var bar = document.createElement('div');
        bar.className = 'rice-bar-fill';
        bar.style.width = Math.max(4, pct * 100) + '%';
        bar.style.background = isFlood
            ? 'linear-gradient(90deg, var(--olivegreen) 0%, rgba(189,165,67,0.4) 100%)'
            : 'linear-gradient(90deg, rgba(189,165,67,0.3) 0%, rgba(189,165,67,0.08) 100%)';

        var dot = document.createElement('div');
        dot.className = 'rice-bar-dot';
        dot.style.background = isFlood ? 'var(--olivegreen)' : 'rgba(189,165,67,0.4)';
        bar.appendChild(dot);
        barWrap.appendChild(bar);

        var nums = document.createElement('div');
        nums.className = 'rice-nums';
        nums.innerHTML =
            '<span class="rice-acres">' + row.acres + ' ac</span>' +
            '<span class="rice-divider">·</span>' +
            '<span class="rice-tons">' + row.prod + '</span>' +
            '<span class="rice-divider">·</span>' +
            '<span class="rice-value">' + row.value + '</span>';

        var ctx = document.createElement('div');
        ctx.className = 'rice-context';
        ctx.textContent = row.context;

        content.appendChild(barWrap);
        content.appendChild(nums);
        content.appendChild(ctx);
        entry.appendChild(content);
        container.appendChild(entry);
    });
}

// ════════════════════════════════════════════════════════════════
// INIT
// ════════════════════════════════════════════════════════════════

renderChart();
renderLegend();
renderWheel();
renderBirdGrid();
renderRiceTable();

})();