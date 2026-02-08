(function() {
  'use strict';
  console.log('timeline.js loaded');

  // ELEMENTS
  var svg = document.querySelector('.wave-svg'); // main SVG
  var speciesList = document.querySelector('.species-list'); // sidebar list
  var zoomSlider = document.querySelector('.zoom-slider'); // zoom input
  var zoomReadout = document.querySelector('.zoom-readout'); // zoom text
  var axis = document.querySelector('.timeline-axis'); // months axis
  var visual = document.querySelector('.timeline-layer'); // SVG container

  // CONSTANTS
  var WIDTH = 1200;
  var HEIGHT = 500;
  var MONTHS = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'];

  // STATE
  var floodByMonth = [];
  var focusedSpecies = null;
  var zoomMonths = 12;
  var startMonth = 0;
  var hoverViz = false;

  // DATA
  var birdsBySpecies = {
    "snow-goose": [60,39,24,6,3,1,1,4,10,15,40,63],
    "ross's-goose": [14,12,20,13,10,6,6,8,6,5,8,2],
    "greater-white-fronted": [62,65,68,61,50,57,53,57,45,48,47,51],
    "sandhill-crane": [8,13,12,0,0,0,0,0,7,22,15,9],
    "canada-goose": [55,52,48,40,30,22,20,25,35,45,50,58],
    "northern-pintail": [70,68,60,45,30,15,10,12,25,50,65,72],
    "mallard": [65,60,55,50,45,40,38,42,48,55,60,66],
    "american-wigeon": [62,58,52,44,35,25,20,22,33,50,58,64],
    "green-winged-teal": [66,62,58,50,38,28,22,26,40,55,62,68],
    "great-egret": [12,18,30,45,55,60,58,55,40,25,15,10],
    "great-blue-heron": [30,35,40,45,48,50,48,46,44,38,34,32],
    "white-faced-ibis": [5,8,15,35,55,60,58,50,30,15,8,5]
  };

  var speciesColors = {
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

  // HELPERS
  function clearChildren(parent) { 
    while(parent.firstChild) parent.removeChild(parent.firstChild); 
  }
  
  function normalize(data) { 
    var max = Math.max.apply(null, data);
    var result = [];
    for(var i=0;i<data.length;i++) result.push(max ? data[i]/max : 0);
    return result;
  }

  function wavePath(data, yScale, baselineY, fill) {
    var step = WIDTH / (data.length-1);
    var d = 'M 0 ' + (baselineY - data[0]*yScale);
    for(var i=1;i<data.length;i++){
      var x0 = (i-1)*step;
      var y0 = baselineY - data[i-1]*yScale;
      var x1 = i*step;
      var y1 = baselineY - data[i]*yScale;
      var cx = (x0+x1)/2;
      var cy = (y0+y1)/2;
      d += ' Q ' + x0 + ' ' + y0 + ' ' + cx + ' ' + cy;
    }
    d += ' T ' + WIDTH + ' ' + (baselineY - data[data.length-1]*yScale);
    if(fill) d += ' L ' + WIDTH + ' ' + baselineY + ' L 0 ' + baselineY + ' Z';
    return d;
  }

  function renderAxis() {
    clearChildren(axis);
    axis.style.gridTemplateColumns = 'repeat(' + zoomMonths + ',1fr)';
    for(var i=startMonth;i<startMonth+zoomMonths;i++){
      var span = document.createElement('span');
      span.appendChild(document.createTextNode(MONTHS[i]));
      axis.appendChild(span);
    }
  }

  function fetchFloodData() {
  // USGS Station 11453000: Yolo Bypass near Woodland, CA
  // Parameter 00065: Gage height (ft)
  // Date range: Jan 1 2025 → Jan 1 2026 (IV data, RDB format)

  var url =
    "https://nwis.waterservices.usgs.gov/nwis/iv/?sites=11453000&agencyCd=USGS&startDT=2025-01-01T00:00:00.000-08:00&endDT=2026-01-01T23:59:59.999-08:00&parameterCd=00065&format=rdb";

  return fetch(url)
    .then(function (res) {
      return res.text(); // RDB is plain text, not JSON
    })
    .then(function (text) {
      var lines = text.split("\n");

      // Initialize monthly totals
      var totals = new Array(12).fill(0);
      var counts = new Array(12).fill(0);

      for (var i = 0; i < lines.length; i++) {
        var line = lines[i];

        // Skip comments and headers
        if (!line || line[0] === "#" || line.indexOf("agency_cd") === 0) continue;

        var cols = line.split("\t");

        // RDB columns (relevant):
        // [2] = datetime
        // [4] = value
        var date = new Date(cols[2]);
        var value = parseFloat(cols[4]);

        if (!isNaN(value)) {
          var month = date.getMonth();
          totals[month] += value;
          counts[month]++;
        }
      }

      // Monthly averages
      var result = [];
      for (var m = 0; m < 12; m++) {
        result[m] = counts[m] ? totals[m] / counts[m] : 0;
      }

      console.log(
        "Monthly average gage height (ft), 2025–2026:",
        result
      );

      return result;
    })
    .catch(function (error) {
      console.error("Error fetching flood data:", error);
      return [0,0,0,0,0,0,0,0,0,0,0,0];
    });
}


  function updateSidebarStyles(){
    var items = speciesList.querySelectorAll('li');
    for(var i=0;i<items.length;i++){
      var item = items[i];
      var nameSpan = item.querySelectorAll('span')[1];
      if(item.getAttribute('data-species')===focusedSpecies){
        nameSpan.innerHTML = '<strong style="text-decoration: underline;">'+nameSpan.textContent+'</strong>';
      } else {
        nameSpan.innerHTML = nameSpan.textContent;
      }
      if(item.getAttribute('data-species')===focusedSpecies){
        item.className = 'active';
      } else {
        item.className = '';
      }
    }
  }

  function render() {
    clearChildren(svg);
    var baselineFlood = HEIGHT*0.95;  // Move baseline to bottom (95% down)
    var baselineBirds = HEIGHT*0.95;  // Move baseline to bottom (95% down)

    // FLOOD
    var floodNorm = normalize(floodByMonth);
    var floodPathEl = document.createElementNS('http://www.w3.org/2000/svg','path');
    var step = WIDTH / (floodNorm.length-1);
    var d = 'M 0 ' + (baselineFlood - floodNorm[0]*HEIGHT*0.85);  // Use 85% of height for scaling
    for(var i=1;i<floodNorm.length;i++){
      var x0 = (i-1)*step;
      var y0 = baselineFlood - floodNorm[i-1]*HEIGHT*0.85;
      var x1 = i*step;
      var y1 = baselineFlood - floodNorm[i]*HEIGHT*0.85;
      var cx = (x0+x1)/2;
      var cy = (y0+y1)/2;
      d += ' Q '+x0+' '+y0+' '+cx+' '+cy;
    }
    d += ' T '+WIDTH+' '+(baselineFlood - floodNorm[floodNorm.length-1]*HEIGHT*0.85);
    d += ' L '+WIDTH+' '+baselineFlood+' L 0 '+baselineFlood+' Z';
    floodPathEl.setAttribute('d',d);
    floodPathEl.setAttribute('fill','var(--blackblue)');
    floodPathEl.setAttribute('opacity','1');
    svg.appendChild(floodPathEl);

    // BIRDS
    for(var key in birdsBySpecies){
      if(focusedSpecies && focusedSpecies!==key) continue;
      var birdData = birdsBySpecies[key];
      var birdNorm = [];
      for(var i=0;i<birdData.length;i++) birdNorm.push(birdData[i]/100);
      var path = document.createElementNS('http://www.w3.org/2000/svg','path');
      path.setAttribute('d', wavePath(birdNorm, HEIGHT*0.85, baselineBirds, false));  // Use 85% of height
      path.setAttribute('fill','none');
      path.setAttribute('stroke', speciesColors[key]);
      path.setAttribute('stroke-width', focusedSpecies?3:2);
      path.setAttribute('opacity', focusedSpecies?0.95:0.45);
      path.setAttribute('data-species', key);
      path.style.cursor = 'pointer';

      (function(k, p){
        p.addEventListener('click', function(e){ e.stopPropagation(); focusedSpecies = (focusedSpecies===k)? null : k; updateSidebarStyles(); render(); });
        p.addEventListener('mouseenter', function(){ p.setAttribute('opacity',1); });
        p.addEventListener('mouseleave', function(){ 
          var op = focusedSpecies ? (focusedSpecies===k?0.95:0) : 0.45; 
          p.setAttribute('opacity', op); 
        });
      })(key, path);

      svg.appendChild(path);
    }

    applyView();
  }

  

  function applyView(){
    var visibleWidth = (WIDTH/12)*zoomMonths;
    var offsetX = (WIDTH/12)*startMonth;
    svg.setAttribute('viewBox', offsetX+' 0 '+visibleWidth+' '+HEIGHT);
    renderAxis();
    zoomReadout.innerHTML = 'showing '+MONTHS[startMonth]+'–'+MONTHS[startMonth+zoomMonths-1]+' ('+zoomMonths+' months)<br><span>drag slider to zoom in, scroll up and down to pan</span>';
  }

  // INTERACTIONS
  zoomSlider.addEventListener('input', function(e){ zoomMonths=+e.target.value; startMonth=Math.min(startMonth,12-zoomMonths); applyView(); });
  visual.addEventListener('mouseenter', function(){ hoverViz=true; });
  visual.addEventListener('mouseleave', function(){ hoverViz=false; });
  window.addEventListener('wheel', function(e){
    if(!hoverViz) return;
    e.preventDefault();
    startMonth += e.deltaY>0?1:-1;
    if(startMonth<0) startMonth=0;
    if(startMonth>12-zoomMonths) startMonth=12-zoomMonths;
    applyView();
  }, {passive: false});

  // SIDEBAR
  for(var key in birdsBySpecies){
    var li = document.createElement('li');
    li.setAttribute('data-species', key);
    li.style.color = speciesColors[key];
    var icon = document.createElement('span');
    icon.className='species-icon';
    icon.style.backgroundImage='url("images/birds/'+key+'.jpg")';
    var name = document.createElement('span');
    name.appendChild(document.createTextNode(key.replace(/-/g,' ')));
    li.appendChild(icon);
    li.appendChild(name);
    speciesList.appendChild(li);

    (function(k, l){
      l.addEventListener('click', function(){ focusedSpecies = (focusedSpecies===k)? null:k; updateSidebarStyles(); render(); });
    })(key, li);
  }

  // CLICK OUTSIDE LINE RESET
  svg.addEventListener('click', function(e){
    if(!e.target.getAttribute('data-species')){ focusedSpecies=null; updateSidebarStyles(); render(); }
  });

  // INIT
  fetchFloodData().then(function(data){ 
    floodByMonth = data; 
    render(); 
    
    // Hide loading message
    var loadingMsg = document.querySelector('#dataLoadingMessage');
    if (loadingMsg) {
      loadingMsg.style.opacity = '0';
      setTimeout(function() {
        loadingMsg.style.display = 'none';
      }, 500);
    }
  });

})();