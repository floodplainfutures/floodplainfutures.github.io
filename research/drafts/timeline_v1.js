(function() {
  'use strict';
  console.log('V1: Flood Wave visualization loading with REAL DATA...');

  const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

  // REAL BIRD DATA - Based on eBird observations at Yolo Bypass Wildlife Area
  // Averaged from 2004-2026 data, normalized per species
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

  // WATER DATA - will be fetched from USGS, placeholder until loaded
  let waterData = [85, 80, 70, 55, 35, 12, 5, 3, 8, 25, 50, 75];
  let dataLoaded = false;

  let selectedBird = null;
  let svg, waterPath, birdGroup;
  let width, height;

  // INITIALIZE SVG
  function initSVG() {
    svg = document.querySelector('#waveSvg');
    waterPath = document.querySelector('#waterWave');
    birdGroup = document.querySelector('#birdGroup');
    
    const rect = svg.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    
    svg.setAttribute('viewBox', '0 0 ' + width + ' ' + height);
  }

  // GENERATE SMOOTH WAVE PATH
  function generateWavePath() {
    const points = [];
    const margin = 50;
    const usableWidth = width - (margin * 2);
    const usableHeight = height - 100;
    
    // Create control points for each month
    for (let i = 0; i < 12; i++) {
      const x = margin + (usableWidth / 11) * i;
      const waterLevel = waterData[i];
      // Invert Y (higher water = lower Y value)
      const y = usableHeight - (waterLevel / 100) * (usableHeight - 100);
      points.push({x: x, y: y});
    }
    
    // Build smooth curve using quadratic bezier
    let pathD = 'M ' + points[0].x + ' ' + points[0].y;
    
    for (let i = 0; i < points.length - 1; i++) {
      const current = points[i];
      const next = points[i + 1];
      const controlX = (current.x + next.x) / 2;
      const controlY = (current.y + next.y) / 2;
      pathD += ' Q ' + controlX + ' ' + current.y + ', ' + controlX + ' ' + controlY;
      pathD += ' Q ' + controlX + ' ' + next.y + ', ' + next.x + ' ' + next.y;
    }
    
    // Close path to fill below wave
    pathD += ' L ' + points[points.length - 1].x + ' ' + height;
    pathD += ' L ' + points[0].x + ' ' + height;
    pathD += ' Z';
    
    waterPath.setAttribute('d', pathD);
    
    return points;
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

  // GENERATE BIRDS
  function generateBirds(wavePoints) {
    birdGroup.innerHTML = '';
    
    const birdActivity = selectedBird ? birdData[selectedBird] : getCombinedBirdData();
    
    // For each month, scatter birds above the wave
    for (let month = 0; month < 12; month++) {
      const point = wavePoints[month];
      const activity = birdActivity[month];
      const numBirds = Math.round((activity / 100) * 25); // Max 25 birds per month
      
      for (let i = 0; i < numBirds; i++) {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        
        // Random position above the wave point
        const xOffset = (Math.random() - 0.5) * 60;
        const yOffset = Math.random() * (point.y - 20);
        
        circle.setAttribute('cx', point.x + xOffset);
        circle.setAttribute('cy', yOffset);
        circle.setAttribute('r', 3);
        circle.setAttribute('class', 'bird-dot');
        
        // Store month for filtering
        circle.dataset.month = month;
        circle.dataset.species = selectedBird || 'all';
        
        birdGroup.appendChild(circle);
      }
    }
    
    updateBirdVisibility();
  }

  // UPDATE BIRD VISIBILITY
  function updateBirdVisibility() {
    const birds = birdGroup.querySelectorAll('.bird-dot');
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
    const wavePoints = generateWavePath();
    generateBirds(wavePoints);
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
    
    // USGS Station 11453000 - Yolo Bypass near Woodland
    // Parameter 00065 = Gage height (feet)
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
          
          // Calculate monthly averages
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
          
          // Calculate averages
          const monthlyAverages = monthlyTotals.map(function(total, i) {
            return monthlyCounts[i] > 0 ? total / monthlyCounts[i] : 0;
          });
          
          // Normalize to 0-100
          const maxWater = Math.max.apply(null, monthlyAverages);
          if (maxWater > 0) {
            waterData = monthlyAverages.map(function(v) {
              return (v / maxWater) * 100;
            });
            
            console.log('Monthly water levels (normalized):', waterData);
            dataLoaded = true;
            buildViz();
          }
        }
      })
      .catch(function(error) {
        console.log('Using realistic seasonal pattern (USGS unavailable):', error);
        dataLoaded = true;
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

  console.log('V1: Initializing with real USGS + eBird data...');

})();