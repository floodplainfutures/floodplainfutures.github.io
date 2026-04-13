'use strict';

(function () {

// ════════════════════════════════════════════════════════════════
// DATA — all Yolo County or Yolo Basin sources only
// ════════════════════════════════════════════════════════════════

/*
 FLOOD — days Fremont Weir overtopped into Yolo Basin per water year (Nov–Mar)
 Source: CA Dept. of Water Resources / Delta Stewardship Council
 URL: viewperformance.deltacouncil.ca.gov/pm/yolo-bypass-inundation
 The weir overtops when Sacramento River flow reaches the crest (~33.5 ft).
 The 6,000 cfs threshold is the point where wildlife managers consider
 the basin meaningfully flooded for bird habitat purposes.
*/
var FLOOD = {
    2018: 42,
    2019: 31,
    2020: 18,
    2021: 0,    // drought — weir did not overtop
    2022: 0,    // extreme drought
    2023: 73    // nine atmospheric rivers
};

/*
 BIRDS — eBird checklists submitted per year
 Source: Cornell Lab of Ornithology, eBird Hotspot L443535 (Vic Fazio Yolo Wildlife Area)
 URL: ebird.org/hotspot/L443535
 Checklists are a direct count of birding trips recorded at this location.
 The 2020 increase reflects a national jump in birding during the pandemic.
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
 All figures are Yolo County only. 2022 drought caused many farmers to fallow fields.
 Commissioner's 2023 report noted water supply "reliable" and rice acreage "significantly increased."
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

/*
 RICE TABLE ROWS — with plain-language context notes
*/
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
 Frequency = approximate % of eBird checklists at this hotspot the species appears on.
 Image naming convention: bird-[slug].png — place in systems/images/
*/
var BIRDS_DATA = [
    {
        num: '01',
        name: 'northern pintail',
        sci: 'Anas acuta',
        slug: 'northern-pintail',
        season: 'winter',
        seasonLabel: 'Oct–Mar',
        freq: 78,
        peak: 'Nov–Jan: flocks of 10,000–50,000',
        connection: 'Pintails show up right after rice harvest when farmers flood the fields. They eat leftover grain and small bugs in the shallow water. In a wet year you can see tens of thousands of them at once.',
        color: 'var(--lightblue)'
    },
    {
        num: '02',
        name: 'sandhill crane',
        sci: 'Antigone canadensis',
        slug: 'sandhill-crane',
        season: 'winter',
        seasonLabel: 'Oct–Mar',
        freq: 62,
        peak: 'Nov–Feb: roosts of 2,000–8,000',
        connection: 'Cranes eat in the rice stubble during the day and fly to the wetlands at dusk to sleep. They come back year after year. When the fields are dry, the numbers drop.',
        color: 'var(--lightblue)'
    },
    {
        num: '03',
        name: 'american coot',
        sci: 'Fulica americana',
        slug: 'american-coot',
        season: 'yearround',
        seasonLabel: 'Year-round',
        freq: 85,
        peak: 'Year-round; winter counts up to 5,000',
        connection: 'The most commonly seen waterbird on the site. They stay year-round in the permanent wetlands and pack in by the thousands when the seasonal fields flood. If you see one bird at the Yolo Basin, it is probably this one.',
        color: 'rgba(255,255,255,.4)'
    },
    {
        num: '04',
        name: 'white-faced ibis',
        sci: 'Plegadis chihi',
        slug: 'white-faced-ibis',
        season: 'summer',
        seasonLabel: 'Mar–Oct',
        freq: 70,
        peak: 'Apr–Sep: breeding colonies of 500–3,000',
        connection: 'Ibis nest in the tule reeds and feed in wet farm fields through spring and summer. Spring flooding of rice paddies is part of why they breed here. You can spot them by the way they walk — probing the mud with that curved bill.',
        color: 'var(--yellow)'
    },
    {
        num: '05',
        name: 'great blue heron',
        sci: 'Ardea herodias',
        slug: 'great-blue-heron',
        season: 'yearround',
        seasonLabel: 'Year-round',
        freq: 88,
        peak: 'Year-round; nests in willows along levees',
        connection: 'Lives here permanently. Nests in the willows along the levee roads. Hunts in flooded fields and permanent ponds. One of the most reported birds on eBird at this site, all year.',
        color: 'rgba(255,255,255,.4)'
    },
    {
        num: '06',
        name: 'northern harrier',
        sci: 'Circus hudsonius',
        slug: 'northern-harrier',
        season: 'winter',
        seasonLabel: 'Oct–Apr',
        freq: 74,
        peak: 'Nov–Mar: several birds hunting at once',
        connection: 'Harriers fly low and slow over flooded fields looking for voles and frogs. You get more of them when there is more water — more water concentrates more prey in a smaller area. Easy to spot flying over rice stubble in winter.',
        color: 'var(--lightblue)'
    },
    {
        num: '07',
        name: 'dunlin',
        sci: 'Calidris alpina',
        slug: 'dunlin',
        season: 'winter',
        seasonLabel: 'Nov–Apr',
        freq: 58,
        peak: 'Dec–Feb: flocks of 1,000–20,000',
        connection: 'Dunlin come down from the Arctic to spend winter here. They need very shallow water — just a few centimeters — to pick bugs off the mud. The Yolo Basin is one of the better wintering spots for them on the West Coast.',
        color: 'var(--lightblue)'
    },
    {
        num: '08',
        name: 'great egret',
        sci: 'Ardea alba',
        slug: 'great-egret',
        season: 'yearround',
        seasonLabel: 'Year-round',
        freq: 81,
        peak: 'Year-round; large communal roosts in winter',
        connection: 'Second-most common wading bird at the site after the heron. Stands still in flooded fields waiting for fish or frogs. Often the first white bird you see from the auto tour road.',
        color: 'rgba(255,255,255,.4)'
    },
    {
        num: '09',
        name: 'snow goose',
        sci: 'Anser caerulescens',
        slug: 'snow-goose',
        season: 'winter',
        seasonLabel: 'Nov–Mar',
        freq: 52,
        peak: 'Dec–Feb: flocks occasionally over 50,000',
        connection: 'Snow geese come from the Arctic and graze on the legume fields at Tule Ranch and the rice stubble. Big flocks show up in wet years when there is more flooded area to spread out across.',
        color: 'var(--lightblue)'
    },
    {
        num: '10',
        name: 'tricolored blackbird',
        sci: 'Agelaius tricolor',
        slug: 'tricolored-blackbird',
        season: 'spring',
        seasonLabel: 'Mar–Jul',
        freq: 44,
        peak: 'Apr–Jun: colonies of 500–5,000',
        connection: 'Almost the entire world population of this bird breeds in California. The Yolo Bypass is one of their main nesting sites. They build nests in the tule reeds and feed in the rice fields next door. Listed as threatened. Losing the basin would hurt this species badly.',
        color: 'var(--olivegreen)'
    }
];

/*
 MONTHLY SEASONAL DATA
 Source: Napa Solano Audubon Society field accounts, YBWA Land Management Plan (CDFW 2008)
*/
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

var activeFilters  = { flood: true, birds: true, rice: true };
var selectedMonth  = null;

// ════════════════════════════════════════════════════════════════
// PROGRESS BAR
// ════════════════════════════════════════════════════════════════

var progressEl = document.getElementById('sysProgress');

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
    var chart = document.getElementById('annualChart');
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

var tooltip = document.getElementById('sysTooltip');

function showTooltip(e, year) {
    var rows = '';
    if (activeFilters.flood) {
        rows += '<div class="sys-tooltip-row"><span class="sys-tooltip-label" style="color:var(--lightblue)">flood days</span><span class="sys-tooltip-val">' + FLOOD[year] + ' days</span></div>';
    }
    if (activeFilters.birds) {
        rows += '<div class="sys-tooltip-row"><span class="sys-tooltip-label" style="color:var(--pink)">checklists</span><span class="sys-tooltip-val">' + BIRDS[year].toLocaleString() + '</span></div>';
    }
    if (activeFilters.rice) {
        rows += '<div class="sys-tooltip-row"><span class="sys-tooltip-label" style="color:var(--olivegreen)">rice acres</span><span class="sys-tooltip-val">' + parseInt(RICE[year].acres).toLocaleString() + '</span></div>';
    }
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
    var container = document.getElementById('sysWheel');
    var size = 400;
    var cx = size / 2, cy = size / 2;
    var outerR = 162, innerR = 56;
    var ns = 'http://www.w3.org/2000/svg';

    // Activity levels per month — 0 (none) to 4 (peak)
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
        var s2 = polar(startDeg, r2), e2 = polar(endDeg, r2);
        var lg = (endDeg - startDeg) > 180 ? 1 : 0;
        return ['M',s1.x,s1.y,'A',r1,r1,0,lg,1,e1.x,e1.y,'L',e2.x,e2.y,'A',r2,r2,0,lg,0,s2.x,s2.y,'Z'].join(' ');
    }

    MONTH_LABELS.forEach(function (mon, i) {
        var start = i * 30, end = start + 29.4;

        // Three ring layers per month
        [
            { level: floodAct[i], color: '#7292cb', ro: outerR,    ri: outerR - 26 },
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

        // Month label
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

        // Invisible click/hover hit area
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
            document.querySelectorAll('.month-slice').forEach(function (s) {
                s.style.opacity = '';
            });
            if (selectedMonth === null) clearWheelDetail();
        });
        hit.addEventListener('click', function () {
            selectedMonth = parseInt(this.dataset.month);
        });
        svg.appendChild(hit);
    });

    // Center circle
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
    document.getElementById('wdMonth').textContent = MONTH_FULL[idx].toLowerCase();

    var rows = [
        { sys: 'flood', color: '#7292cb', desc: data.flood },
        { sys: 'flight', color: '#f06896', desc: data.birds },
        { sys: 'food',  color: '#bda543', desc: data.rice }
    ];

    document.getElementById('wdRows').innerHTML = rows.map(function (r) {
        return '<div class="wheel-detail-row">' +
            '<div class="wdr-dot" style="background:' + r.color + '"></div>' +
            '<div><span class="wdr-system">' + r.sys + '</span><span class="wdr-desc">' + r.desc + '</span></div>' +
            '</div>';
    }).join('');
}

function clearWheelDetail() {
    document.getElementById('wdMonth').textContent = '';
    document.getElementById('wdRows').innerHTML = '';
    var prompt = document.querySelector('.wheel-prompt');
    if (prompt) prompt.style.display = '';
}

// ════════════════════════════════════════════════════════════════
// BIRD CARDS
// Image naming: bird-[slug].png in systems/images/
// ════════════════════════════════════════════════════════════════

function renderBirdGrid() {
    var grid = document.getElementById('birdGrid');
    grid.innerHTML = '';

    BIRDS_DATA.forEach(function (b) {
        var imgSrc = 'images/bird-' + b.slug + '.png';
        var altText = 'Illustration of a ' + b.name + ' at the Yolo Bypass Wildlife Area';

        var card = document.createElement('div');
        card.className = 'bird-card';
        card.dataset.season = b.season;

        card.innerHTML =
            // Image slot — top of card
            '<div class="bird-card-img-slot" id="imgslot-' + b.slug + '">' +
            '<img src="' + imgSrc + '" alt="' + altText + '" class="bird-card-img" ' +
            'onload="this.parentElement.classList.remove(\'bird-img-missing\')" ' +
            'onerror="this.parentElement.classList.add(\'bird-img-missing\')">' +
            '<span class="bird-img-label">bird-' + b.slug + '.png</span>' +
            '</div>' +
            // Card content
            '<div class="bird-card-content">' +
            '<div class="bird-card-header">' +
            '<span class="bird-card-num">' + b.num + '</span>' +
            '<span class="bird-card-season season-' + b.season + '">' + b.seasonLabel + '</span>' +
            '</div>' +
            '<div class="bird-card-name">' + b.name + '</div>' +
            '<div class="bird-card-sci">' + b.sci + '</div>' +
            '<div class="bird-card-bar">' +
            '<div class="bird-card-bar-fill" style="width:' + b.freq + '%;background:' + b.color + ';opacity:.65"></div>' +
            '</div>' +
            '<div class="bird-card-stat">On <strong>' + b.freq + '%</strong> of checklists  ·  ' + b.peak + '</div>' +
            '<div class="bird-card-connection">' + b.connection + '</div>' +
            '</div>';

        // Start image slots as missing until image proves it loads
        card.querySelector('.bird-card-img-slot').classList.add('bird-img-missing');

        grid.appendChild(card);
    });
}

// Bird filter buttons
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
// RICE TABLE
// ════════════════════════════════════════════════════════════════

function renderRiceTable() {
    var tbody = document.getElementById('riceTableBody');
    tbody.innerHTML = '';
    RICE_TABLE.forEach(function (row) {
        var tr = document.createElement('tr');
        tr.innerHTML =
            '<td class="year-col">' + row.year + '</td>' +
            '<td class="acres-col"><strong>' + row.acres + '</strong></td>' +
            '<td>' + row.prod + '</td>' +
            '<td>' + row.value + '</td>' +
            '<td>' + (row.flood
                ? '<span class="flood-badge">Wet Year</span>'
                : '<span class="drought-badge">Dry Year</span>') + '</td>' +
            '<td>' + row.context + '</td>';
        tbody.appendChild(tr);
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