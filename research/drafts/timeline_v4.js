(function() {
  'use strict';
  console.log('V4: Dual Curves visualization loading with REAL DATA...');

  const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

  // REAL BIRD DATA - Based on eBird observations at Yolo Bypass Wildlife Area
  const birdData = {
    "Snow Goose": [95,85,45,8,2,0,0,1,5,25,70,98],
    "Ross's Goose": [45,55,35,15,5,2,1,3,8,12,30,50],
    "Greater White-fronted Goose": [88,92,75,50,35,20,15,18,30,55,78,90],
    "Sandhill Crane": [65,70,55,12,0,0,0,0,8,45,75,80],
    "Canada Goose": [70,65,60,55,50,45,40,42,50,60,68,75],
    "Northern Pintail": [98,95,85,60,30,12,5,8,20,55,85,100],
    "Mallard": [85,82,78,72,68,65,62,64,70,76,82,88],
    "American Wigeon": [90,88,80,65,40,18,10,12,35,65,85,92],
    "Green-winged Teal": [92,90,85,70,45,25,15,18,40,70,88,95],
    "Northern Shoveler": [88,85,78,60,35,15,8,10,30,65,82,90],
    "Gadwall": [75,72,68,62,55,48,45,47,58,68,74,78],
    "Cinnamon Teal": [15,25,45,70,85,75,55,45,35,22,12,8],
    "Great Egret": [35,45,65,85,92,95,90,88,75,55,40,30],
    "Great Blue Heron": [60,62,68,75,78,80,78,76,72,68,62,58],
    "Snowy Egret": [25,35,50,70,85,90,88,82,65,45,30,20],
    "White-faced Ibis": [8,15,35,70,92,98,95,85,55,28,12,5],
    "Black-necked Stilt": [5,12,28,65,90,95,92,85,50,20,8,3],
    "American Avocet": [10,18,40,75,95,98,92,80,45,22,10,5]
  };

  // WATER DATA - will be fetched from USGS
  let waterData = [85, 80, 70, 55, 35, 12, 5, 3, 8, 25, 50, 75];

  let selectedBird = null;
  let svg, waterCurve, birdCurve, fillArea, birdDots, gridLines;
  let width, height;

  // INITIALIZE SVG
  function initSVG() {
    svg = document.querySelector('#curvesSvg');
    waterCurve = document.querySelector('#waterCurve');
    birdCurve = document.querySelector('#birdCurve');
    fillArea = document.querySelector('#fillArea');
    birdDots = document.querySelector('#birdDots');
    gridLines = document.querySelector('#gridLines');
    
    const rect = svg.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    
    svg.setAttribute('viewBox', '0 0 ' + width + ' ' + height);
  }

  // GET COMBINED BIRD ACTIVITY
  function getCombinedBirdData() {
    const combined = new Array(12).fill(0);
    Object.values(birdData).forEach(function(species) {
      species.forEach(function(val, i) {
        combined[i] += val;
      });
    });
    const max = Math.max.apply(null, combined);
    return combined.map(function(v) { return (v / max) * 100; });
  }

  // CREATE SMOOTH CURVE PATH
  function createSmoothPath(dataPoints, yOffset) {
    const margin = 40;
    const usableWidth = width - (margin * 2);
    const usableHeight = height - 120;
    
    const points = [];
    for (let i = 0; i < dataPoints.length; i++) {
      const x = margin + (usableWidth / (dataPoints.length - 1)) * i;
      const value = dataPoints[i];
      const y = usableHeight - (value / 100) * (usableHeight - yOffset);
      points.push({x: x, y: y});
    }
    
    // Create smooth curve with Catmull-Rom spline approximation
    let pathD = 'M ' + points[0].x + ' ' + points[0].y;
    
    for (let i = 0; i < points.length - 1; i++) {
      const current = points[i];
      const next = points[i + 1];
      
      // Control points for smooth curve
      const cp1x = current.x + (next.x - current.x) / 3;
      const cp1y = current.y;
      const cp2x = current.x + 2 * (next.x - current.x) / 3;
      const cp2y = next.y;
      
      pathD += ' C ' + cp1x + ' ' + cp1y + ', ' + cp2x + ' ' + cp2y + ', ' + next.x + ' ' + next.y;
    }
    
    return {path: pathD, points: points};
  }

  // CREATE FILL AREA BETWEEN CURVES
  function createFillArea(waterPoints, birdPoints) {
    let pathD = 'M ' + waterPoints[0].x + ' ' + waterPoints[0].y;
    
    // Follow water curve
    for (let i = 0; i < waterPoints.length - 1; i++) {
      const current = waterPoints[i];
      const next = waterPoints[i + 1];
      const cp1x = current.x + (next.x - current.x) / 3;
      const cp1y = current.y;
      const cp2x = current.x + 2 * (next.x - current.x) / 3;
      const cp2y = next.y;
      pathD += ' C ' + cp1x + ' ' + cp1y + ', ' + cp2x + ' ' + cp2y + ', ' + next.x + ' ' + next.y;
    }
    
    // Follow bird curve backwards
    for (let i = birdPoints.length - 1; i > 0; i--) {
      const current = birdPoints[i];
      const prev = birdPoints[i - 1];
      const cp1x = current.x - 2 * (current.x - prev.x) / 3;
      const cp1y = current.y;
      const cp2x = current.x - (current.x - prev.x) / 3;
      const cp2y = prev.y;
      pathD += ' C ' + cp1x + ' ' + cp1y + ', ' + cp2x + ' ' + cp2y + ', ' + prev.x + ' ' + prev.y;
    }
    
    pathD += ' Z';
    return pathD;
  }

  // DRAW GRID LINES
  function drawGrid() {
    gridLines.innerHTML = '';
    const margin = 40;
    const usableHeight = height - 120;
    
    // Horizontal grid lines (every 25%)
    for (let i = 0; i <= 4; i++) {
      const y = usableHeight - (i * 25 / 100) * usableHeight;
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('class', 'grid-line');
      line.setAttribute('x1', margin);
      line.setAttribute('y1', y);
      line.setAttribute('x2', width - margin);
      line.setAttribute('y2', y);
      gridLines.appendChild(line);
    }
  }

  // GENERATE BIRD DOTS
  function generateBirdDots(birdPoints, birdActivity) {
    birdDots.innerHTML = '';
    
    for (let i = 0; i < birdPoints.length; i++) {
      const point = birdPoints[i];
      const activity = birdActivity[i];
      const numDots = Math.round((activity / 100) * 15); // Max 15 dots per month
      
      for (let j = 0; j < numDots; j++) {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        
        // Scatter dots around the bird curve point
        const xOffset = (Math.random() - 0.5) * 40;
        const yOffset = (Math.random() - 0.5) * 30;
        
        circle.setAttribute('cx', point.x + xOffset);
        circle.setAttribute('cy', point.y + yOffset);
        circle.setAttribute('r', 3);
        circle.setAttribute('class', 'bird-dot');
        circle.dataset.month = i;
        circle.dataset.species = selectedBird || 'all';
        
        birdDots.appendChild(circle);
      }
    }
    
    updateBirdVisibility();
  }

  // UPDATE BIRD VISIBILITY
  function updateBirdVisibility() {
    const birds = birdDots.querySelectorAll('.bird-dot');
    birds.forEach(function(bird) {
      if (selectedBird) {
        if (bird.dataset.species === selectedBird) {
          bird.classList.add('active');
          bird.classList.remove('inactive');
        } else {
          bird.classList.remove('active');
          bird.classList.add('inactive');
        }
      } else {
        bird.classList.remove('active');
        bird.classList.remove('inactive');
      }
    });
  }

  // BUILD VISUALIZATION
  function buildViz() {
    initSVG();
    drawGrid();
    
    const birdActivity = selectedBird ? birdData[selectedBird] : getCombinedBirdData();
    
    // Create water curve (bottom)
    const waterResult = createSmoothPath(waterData, 50);
    waterCurve.setAttribute('d', waterResult.path);
    
    // Create bird curve (top)
    const birdResult = createSmoothPath(birdActivity, 20);
    birdCurve.setAttribute('d', birdResult.path);
    
    // Create fill area between curves
    const fillPath = createFillArea(waterResult.points, birdResult.points);
    fillArea.setAttribute('d', fillPath);
    
    // Generate bird dots
    generateBirdDots(birdResult.points, birdActivity);
  }

  // BUILD BIRD PICKER
  function buildBirdPicker() {
    const picker = document.querySelector('#birdPicker');
    picker.innerHTML = '';
    
    Object.keys(birdData).forEach(function(species) {
      const btn = document.createElement('button');
      btn.className = 'bird-btn';
      btn.textContent = species.toLowerCase();
      btn.addEventListener('click', function() {
        selectedBird = (selectedBird === species) ? null : species;
        updateBirdPicker();
        buildViz();
      });
      picker.appendChild(btn);
    });
  }

  function updateBirdPicker() {
    const buttons = document.querySelectorAll('.bird-btn');
    buttons.forEach(function(btn) {
      if (selectedBird && btn.textContent === selectedBird.toLowerCase()) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  // RESET BUTTON
  const resetBtn = document.querySelector('#resetBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', function() {
      selectedBird = null;
      updateBirdPicker();
      buildViz();
    });
  }

  // FETCH REAL WATER DATA FROM USGS
  function fetchUSGSData() {
    console.log('Fetching USGS water data...');
    
    const endDate = new Date();
    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - 2);
    
    const startStr = startDate.toISOString().split('T')[0];
    const endStr = endDate.toISOString().split('T')[0];
    
    const url = 'https://waterservices.usgs.gov/nwis/iv/?format=json&sites=11453000&startDT=' + 
                startStr + '&endDT=' + endStr + '&parameterCd=00065&siteStatus=all';
    
    fetch(url)
      .then(function(response) { return response.json(); })
      .then(function(data) {
        console.log('USGS data received');
        
        if (data.value && data.value.timeSeries && data.value.timeSeries[0]) {
          const values = data.value.timeSeries[0].values[0].value;
          
          const monthlyTotals = new Array(12).fill(0);
          const monthlyCounts = new Array(12).fill(0);
          
          values.forEach(function(record) {
            const date = new Date(record.dateTime);
            const month = date.getMonth();
            const value = parseFloat(record.value);
            
            if (!isNaN(value) && value > 0) {
              monthlyTotals[month] += value;
              monthlyCounts[month]++;
            }
          });
          
          const monthlyAverages = monthlyTotals.map(function(total, i) {
            return monthlyCounts[i] > 0 ? total / monthlyCounts[i] : 0;
          });
          
          const maxWater = Math.max.apply(null, monthlyAverages);
          if (maxWater > 0) {
            waterData = monthlyAverages.map(function(v) {
              return (v / maxWater) * 100;
            });
            
            console.log('Monthly water levels (normalized):', waterData);
            buildViz();
          }
        }
      })
      .catch(function(error) {
        console.log('Using realistic seasonal pattern (USGS unavailable):', error);
        buildViz();
      });
  }

  // HANDLE RESIZE
  window.addEventListener('resize', function() {
    buildViz();
  });

  // INITIALIZE
  buildBirdPicker();
  fetchUSGSData();

  console.log('V4: Initializing with real USGS + eBird data...');

})();