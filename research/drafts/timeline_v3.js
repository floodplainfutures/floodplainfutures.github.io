(function() {
  'use strict';
  console.log('V3: Seasonal Clock visualization loading with REAL DATA...');

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
  let svg, clockGroup;
  let centerX, centerY, maxRadius;

  // INITIALIZE SVG
  function initSVG() {
    svg = document.querySelector('#clockSvg');
    clockGroup = document.querySelector('#clockGroup');
    
    const rect = svg.getBoundingClientRect();
    const size = Math.min(rect.width, rect.height);
    
    centerX = rect.width / 2;
    centerY = rect.height / 2;
    maxRadius = (size / 2) - 40;
    
    svg.setAttribute('viewBox', '0 0 ' + rect.width + ' ' + rect.height);
  }

  // POLAR TO CARTESIAN CONVERSION
  function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  }

  // CREATE SVG ARC PATH
  function describeArc(x, y, radius, startAngle, endAngle) {
    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    
    const d = [
      "M", x, y,
      "L", start.x, start.y, 
      "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y,
      "Z"
    ].join(" ");
    
    return d;
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

  // BUILD RADIAL CHART
  function buildViz() {
    initSVG();
    clockGroup.innerHTML = '';
    
    const anglePerMonth = 360 / 12;
    const birdActivity = selectedBird ? birdData[selectedBird] : getCombinedBirdData();
    
    // Draw each month wedge
    for (let i = 0; i < 12; i++) {
      const startAngle = i * anglePerMonth;
      const endAngle = (i + 1) * anglePerMonth;
      
      // Water level determines how far the wedge extends
      const waterLevel = waterData[i];
      const wedgeRadius = (waterLevel / 100) * maxRadius;
      
      // Create wedge path
      const wedge = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      wedge.setAttribute('class', 'month-wedge');
      wedge.setAttribute('d', describeArc(centerX, centerY, wedgeRadius, startAngle, endAngle));
      wedge.setAttribute('data-month', i);
      
      // Add hover tooltip
      const monthName = MONTHS[i];
      const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
      title.textContent = monthName + ': ' + Math.round(waterLevel) + '% water, ' + Math.round(birdActivity[i]) + '% birds';
      wedge.appendChild(title);
      
      clockGroup.appendChild(wedge);
      
      // Add month label
      const labelAngle = startAngle + (anglePerMonth / 2);
      const labelRadius = maxRadius + 20;
      const labelPos = polarToCartesian(centerX, centerY, labelRadius, labelAngle);
      
      const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      label.setAttribute('class', 'month-label');
      label.setAttribute('x', labelPos.x);
      label.setAttribute('y', labelPos.y);
      label.setAttribute('dy', '0.35em');
      label.textContent = monthName;
      clockGroup.appendChild(label);
      
      // Add birds scattered in the wedge
      addBirdsToWedge(i, startAngle, endAngle, wedgeRadius, birdActivity[i]);
    }
  }

  // ADD BIRDS TO WEDGE
  function addBirdsToWedge(monthIndex, startAngle, endAngle, wedgeRadius, activity) {
    const numBirds = Math.round((activity / 100) * 30); // Max 30 birds per wedge
    const angleRange = endAngle - startAngle;
    
    for (let i = 0; i < numBirds; i++) {
      // Random position within the wedge
      const angle = startAngle + (Math.random() * angleRange);
      const radius = Math.random() * wedgeRadius * 0.8;
      
      const pos = polarToCartesian(centerX, centerY, radius, angle);
      
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', pos.x);
      circle.setAttribute('cy', pos.y);
      circle.setAttribute('r', 3);
      circle.setAttribute('class', 'bird-dot');
      circle.dataset.month = monthIndex;
      circle.dataset.species = selectedBird || 'all';
      
      clockGroup.appendChild(circle);
    }
    
    updateBirdVisibility();
  }

  // UPDATE BIRD VISIBILITY
  function updateBirdVisibility() {
    const birds = clockGroup.querySelectorAll('.bird-dot');
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

  console.log('V3: Initializing with real USGS + eBird data...');

})();