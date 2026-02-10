(function() {
  'use strict';
  console.log('Creative bar viz loading...');

  const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

  // BIRD DATA
  const birdData = {
    "Snow Goose": [60,39,24,6,3,1,1,4,10,15,40,63],
    "Ross's Goose": [14,12,20,13,10,6,6,8,6,5,8,2],
    "White-fronted Goose": [62,65,68,61,50,57,53,57,45,48,47,51],
    "Sandhill Crane": [8,13,12,0,0,0,0,0,7,22,15,9],
    "Canada Goose": [55,52,48,40,30,22,20,25,35,45,50,58],
    "Northern Pintail": [70,68,60,45,30,15,10,12,25,50,65,72],
    "Mallard": [65,60,55,50,45,40,38,42,48,55,60,66],
    "American Wigeon": [62,58,52,44,35,25,20,22,33,50,58,64],
    "Green-winged Teal": [66,62,58,50,38,28,22,26,40,55,62,68],
    "Great Egret": [12,18,30,45,55,60,58,55,40,25,15,10],
    "Great Blue Heron": [30,35,40,45,48,50,48,46,44,38,34,32],
    "White-faced Ibis": [5,8,15,35,55,60,58,50,30,15,8,5]
  };

  // WATER DATA (placeholder, will fetch from USGS)
  let waterData = [75, 70, 60, 50, 35, 15, 5, 5, 10, 20, 45, 70];

  let selectedBird = null;

  // CALCULATE COMBINED BIRD ACTIVITY
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

  // BUILD THE VISUALIZATION
  function buildViz() {
    const stage = document.querySelector('#vizStage');
    stage.innerHTML = '';
    
    const birdActivity = selectedBird ? birdData[selectedBird] : getCombinedBirdData();
    
    // Create 12 month columns
    for (let i = 0; i < 12; i++) {
      const column = document.createElement('div');
      column.className = 'month-column';
      
      // Tooltip
      const tooltip = document.createElement('div');
      tooltip.className = 'month-tooltip';
      tooltip.textContent = MONTHS[i] + ': ' + Math.round(waterData[i]) + '% water, ' + Math.round(birdActivity[i]) + '% birds';
      column.appendChild(tooltip);
      
      // Water bar (height based on water level)
      const waterBar = document.createElement('div');
      waterBar.className = 'water-bar';
      const waterHeight = (waterData[i] / 100) * 100; // percentage of container
      waterBar.style.height = waterHeight + '%';
      column.appendChild(waterBar);
      
      // Bird stack (sits on top of water)
      const birdStack = document.createElement('div');
      birdStack.className = 'bird-stack';
      birdStack.style.bottom = waterHeight + '%';
      
      // Number of bird icons based on activity
      const numBirds = Math.round((birdActivity[i] / 100) * 15); // max 15 birds
      for (let j = 0; j < numBirds; j++) {
        const bird = document.createElement('div');
        bird.className = 'bird-icon';
        birdStack.appendChild(bird);
      }
      
      column.appendChild(birdStack);
      stage.appendChild(column);
    }
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

  // FETCH WATER DATA FROM USGS
  function fetchWaterData() {
    const url = "https://nwis.waterservices.usgs.gov/nwis/iv/?sites=11453000&startDT=2024-01-01&endDT=2024-12-31&parameterCd=00065&format=rdb";
    
    fetch(url)
      .then(function(res) { return res.text(); })
      .then(function(text) {
        const lines = text.split('\n');
        const monthlyTotals = new Array(12).fill(0);
        const monthlyCounts = new Array(12).fill(0);
        
        lines.forEach(function(line) {
          if (!line || line[0] === '#' || line.indexOf('agency_cd') === 0) return;
          
          const cols = line.split('\t');
          const date = new Date(cols[2]);
          const value = parseFloat(cols[4]);
          
          if (!isNaN(value)) {
            const month = date.getMonth();
            monthlyTotals[month] += value;
            monthlyCounts[month]++;
          }
        });
        
        // Calculate averages and normalize
        const averages = monthlyTotals.map(function(total, i) {
          return monthlyCounts[i] ? total / monthlyCounts[i] : 0;
        });
        
        const max = Math.max.apply(null, averages);
        waterData = averages.map(function(v) { return (v / max) * 100; });
        
        console.log('Water data loaded:', waterData);
        buildViz();
      })
      .catch(function(err) {
        console.log('Using placeholder water data');
        buildViz();
      });
  }

  // INITIALIZE
  buildBirdPicker();
  fetchWaterData();

  console.log('Creative viz ready!');

})();