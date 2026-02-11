(function() {
  'use strict';
  console.log('The Basin Breathes - Initializing...');

  // CANVAS SETUP
  const canvas = document.getElementById('basinCanvas');
  const ctx = canvas.getContext('2d');
  let width, height;

  function resizeCanvas() {
    width = canvas.width = canvas.offsetWidth;
    height = canvas.height = canvas.offsetHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  // BIRD SPECIES DATA (monthly observation frequency 0-100)
  const SPECIES = {
    'Snow Goose': { data: [60,39,24,6,3,1,1,4,10,15,40,63], color: '#f1b93fff', type: 'waterfowl' },
    'Greater White-fronted Goose': { data: [62,65,68,61,50,57,53,57,45,48,47,51], color: '#7292cbff', type: 'waterfowl' },
    'Canada Goose': { data: [55,52,48,40,30,22,20,25,35,45,50,58], color: '#bd7bcfff', type: 'waterfowl' },
    'Northern Pintail': { data: [70,68,60,45,30,15,10,12,25,50,65,72], color: '#f06896ff', type: 'waterfowl' },
    'Mallard': { data: [65,60,55,50,45,40,38,42,48,55,60,66], color: '#0f1b3d', type: 'waterfowl' },
    'American Wigeon': { data: [62,58,52,44,35,25,20,22,33,50,58,64], color: '#bd7bcfff', type: 'waterfowl' },
    'Green-winged Teal': { data: [66,62,58,50,38,28,22,26,40,55,62,68], color: '#0f1b3d', type: 'waterfowl' },
    'Sandhill Crane': { data: [8,13,12,0,0,0,0,0,7,22,15,9], color: '#ef6244ff', type: 'crane' },
    'Black-necked Stilt': { data: [5,10,25,45,60,55,48,42,35,20,8,4], color: '#f06896ff', type: 'shorebird' },
    'American Avocet': { data: [8,15,30,50,65,58,50,45,38,25,12,6], color: '#ef6244ff', type: 'shorebird' },
    'Great Egret': { data: [12,18,30,45,55,60,58,55,40,25,15,10], color: '#bd7bcfff', type: 'heron' },
    'Great Blue Heron': { data: [30,35,40,45,48,50,48,46,44,38,34,32], color: '#7292cbff', type: 'heron' }
  };

  const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 
                   'july', 'august', 'september', 'october', 'november', 'december'];

  // WATER DATA (will fetch from USGS)
  let waterData = [75, 70, 60, 50, 35, 15, 5, 5, 10, 20, 45, 70];

  // STATE
  let currentMonth = 0;
  let targetMonth = 0;
  let monthProgress = 0;
  let particles = [];
  let waterParticles = [];
  let selectedSpecies = 'all';
  let isDragging = false;

  // BIRD PARTICLE CLASS
  class Bird {
    constructor(species, month) {
      this.species = species;
      this.color = SPECIES[species].color;
      this.type = SPECIES[species].type;
      this.month = month;
      
      // Random position
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.targetY = this.y;
      
      // Flocking behavior
      this.vx = (Math.random() - 0.5) * 0.5;
      this.vy = (Math.random() - 0.5) * 0.5;
      
      // Visual properties
      this.size = this.type === 'crane' ? 4 : this.type === 'heron' ? 3 : 2;
      this.opacity = 0;
      this.targetOpacity = 1;
      
      // Lifespan based on observation frequency
      this.active = true;
    }

    update() {
      // Fade in/out based on month
      const monthData = SPECIES[this.species].data[Math.floor(currentMonth)];
      this.targetOpacity = (selectedSpecies === 'all' || selectedSpecies === this.species) 
        ? monthData / 100 
        : 0.1;
      
      this.opacity += (this.targetOpacity - this.opacity) * 0.05;

      // Flocking behavior - birds move together
      this.vx += (Math.random() - 0.5) * 0.1;
      this.vy += (Math.random() - 0.5) * 0.1;
      
      // Speed limit
      const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
      if (speed > 2) {
        this.vx = (this.vx / speed) * 2;
        this.vy = (this.vy / speed) * 2;
      }

      this.x += this.vx;
      this.y += this.vy;

      // Wrap around edges
      if (this.x < 0) this.x = width;
      if (this.x > width) this.x = 0;
      if (this.y < 0) this.y = height;
      if (this.y > height) this.y = 0;
    }

    draw() {
      if (this.opacity < 0.05) return;
      
      ctx.save();
      ctx.globalAlpha = this.opacity;
      
      // Draw bird as simple shape
      ctx.fillStyle = this.color;
      
      if (this.type === 'crane') {
        // Crane as tall vertical mark
        ctx.fillRect(this.x - 0.5, this.y - 3, 1, 6);
      } else if (this.type === 'heron') {
        // Heron as angular mark
        ctx.beginPath();
        ctx.moveTo(this.x, this.y - 2);
        ctx.lineTo(this.x - 2, this.y + 2);
        ctx.lineTo(this.x + 2, this.y + 2);
        ctx.fill();
      } else {
        // Waterfowl/shorebird as simple dot or v-shape
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
      
      ctx.restore();
    }
  }

  // WATER PARTICLE CLASS
  class WaterDrop {
    constructor() {
      this.x = Math.random() * width;
      this.y = height;
      this.vx = (Math.random() - 0.5) * 0.3;
      this.vy = -Math.random() * 2 - 1;
      this.life = 1;
      this.size = Math.random() * 3 + 1;
    }

    update() {
      this.vy += 0.1; // Gravity
      this.x += this.vx;
      this.y += this.vy;
      this.life -= 0.01;
      
      // Pool at bottom when water level is high
      const waterLevel = waterData[Math.floor(currentMonth)] / 100;
      const targetY = height - (height * waterLevel * 0.7);
      if (this.y > targetY) {
        this.vy *= -0.3;
        this.vx *= 0.95;
      }
    }

    draw() {
      ctx.fillStyle = `rgba(114, 146, 203, ${this.life * 0.3})`;
      ctx.fillRect(this.x, this.y, this.size, this.size);
    }
  }

  // INITIALIZE BIRDS
  function initializeBirds() {
    particles = [];
    Object.keys(SPECIES).forEach(species => {
      // Create multiple birds per species based on peak observation
      const maxCount = Math.max(...SPECIES[species].data);
      const count = Math.floor(maxCount / 2); // Scale down for performance
      
      for (let i = 0; i < count; i++) {
        particles.push(new Bird(species, 0));
      }
    });
    console.log(`Initialized ${particles.length} birds`);
  }

  // FETCH USGS WATER DATA
  async function fetchWaterData() {
    try {
      const url = "https://nwis.waterservices.usgs.gov/nwis/iv/?sites=11453000&startDT=2024-01-01&endDT=2024-12-31&parameterCd=00065&format=rdb";
      const res = await fetch(url);
      const text = await res.text();
      
      const lines = text.split('\n');
      const monthlyTotals = new Array(12).fill(0);
      const monthlyCounts = new Array(12).fill(0);
      
      lines.forEach(line => {
        if (!line || line[0] === '#' || line.includes('agency_cd')) return;
        
        const cols = line.split('\t');
        const date = new Date(cols[2]);
        const value = parseFloat(cols[4]);
        
        if (!isNaN(value)) {
          const month = date.getMonth();
          monthlyTotals[month] += value;
          monthlyCounts[month]++;
        }
      });
      
      const averages = monthlyTotals.map((total, i) => 
        monthlyCounts[i] ? total / monthlyCounts[i] : 0
      );
      
      const max = Math.max(...averages);
      waterData = averages.map(v => (v / max) * 100);
      
      console.log('USGS water data loaded:', waterData);
      updateAnnotations();
    } catch (err) {
      console.log('Using placeholder water data');
    }
  }

  // UPDATE INFO PANEL
  function updateInfoPanel() {
    document.getElementById('currentMonth').textContent = MONTHS[Math.floor(currentMonth)];
    
    const waterLevel = waterData[Math.floor(currentMonth)];
    document.getElementById('waterLevel').textContent = Math.round(waterLevel / 10);
    
    // Count active birds
    const activeBirds = particles.filter(p => p.opacity > 0.1).length;
    document.getElementById('birdCount').textContent = activeBirds;
    
    // Dominant species
    const speciesHTML = Object.entries(SPECIES)
      .map(([name, data]) => ({
        name,
        count: data.data[Math.floor(currentMonth)]
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)
      .map(s => `<div>${s.name.toLowerCase()}: ${s.count}%</div>`)
      .join('');
    
    document.getElementById('dominantSpecies').innerHTML = 
      '<strong>dominant species:</strong>' + speciesHTML;
  }

  // UPDATE STORY ANNOTATIONS
  function updateAnnotations() {
    const peakFlow = Math.max(...waterData);
    document.getElementById('peakFlow').textContent = Math.round(peakFlow * 500);
    
    const springSpecies = Object.keys(SPECIES).filter(s => 
      SPECIES[s].data[3] > 30
    ).length;
    document.getElementById('speciesPeak').textContent = springSpecies;
    
    const summerWater = waterData[6];
    document.getElementById('summerCoverage').textContent = Math.round((summerWater / peakFlow) * 100);
    
    const fallMigrants = Object.keys(SPECIES).filter(s => 
      SPECIES[s].data[10] > 20
    ).length;
    document.getElementById('fallMigrants').textContent = fallMigrants;
  }

  // ANIMATION LOOP
  function animate() {
    ctx.fillStyle = '#f8f6ed';
    ctx.fillRect(0, 0, width, height);

    // Draw water level as gradient
    const waterLevel = waterData[Math.floor(currentMonth)] / 100;
    const waterHeight = height * waterLevel * 0.7;
    const gradient = ctx.createLinearGradient(0, height - waterHeight, 0, height);
    gradient.addColorStop(0, 'rgba(114, 146, 203, 0.2)');
    gradient.addColorStop(1, 'rgba(114, 146, 203, 0.4)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, height - waterHeight, width, waterHeight);

    // Update and draw water particles
    if (waterLevel > 0.2 && waterParticles.length < waterLevel * 50) {
      waterParticles.push(new WaterDrop());
    }
    
    waterParticles = waterParticles.filter(p => p.life > 0);
    waterParticles.forEach(p => {
      p.update();
      p.draw();
    });

    // Update and draw birds
    particles.forEach(p => {
      p.update();
      p.draw();
    });

    // Smooth month transition
    if (Math.abs(targetMonth - currentMonth) > 0.01) {
      currentMonth += (targetMonth - currentMonth) * 0.05;
    }

    updateInfoPanel();
    requestAnimationFrame(animate);
  }

  // SCRUBBER CONTROLS
  const scrubberTrack = document.querySelector('.scrubber-track');
  const scrubberHandle = document.querySelector('.scrubber-handle');
  const scrubberProgress = document.querySelector('.scrubber-progress');

  function updateScrubber(x) {
    const rect = scrubberTrack.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (x - rect.left) / rect.width));
    targetMonth = percent * 11;
    
    scrubberHandle.style.left = (percent * 100) + '%';
    scrubberProgress.style.width = (percent * 100) + '%';
  }

  scrubberTrack.addEventListener('click', (e) => {
    updateScrubber(e.clientX);
  });

  scrubberHandle.addEventListener('mousedown', () => {
    isDragging = true;
  });

  document.addEventListener('mousemove', (e) => {
    if (isDragging) {
      updateScrubber(e.clientX);
    }
  });

  document.addEventListener('mouseup', () => {
    isDragging = false;
  });

  // SPECIES FILTER
  const filterToggle = document.getElementById('filterToggle');
  const filterDropdown = document.getElementById('filterDropdown');

  filterToggle.addEventListener('click', () => {
    filterDropdown.classList.toggle('active');
  });

  // Populate filter options
  const filterHTML = Object.keys(SPECIES).map(species => 
    `<button class="filter-option" data-species="${species}">${species.toLowerCase()}</button>`
  ).join('');
  filterDropdown.innerHTML = 
    '<button class="filter-option active" data-species="all">show all birds</button>' + filterHTML;

  filterDropdown.addEventListener('click', (e) => {
    if (e.target.classList.contains('filter-option')) {
      selectedSpecies = e.target.dataset.species;
      document.querySelectorAll('.filter-option').forEach(btn => btn.classList.remove('active'));
      e.target.classList.add('active');
      filterDropdown.classList.remove('active');
    }
  });

  // SCROLL ANIMATIONS FOR ANNOTATIONS
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.3 });

  document.querySelectorAll('.annotation').forEach(el => observer.observe(el));

  // DATA DOWNLOADS
  function downloadCSV(content, filename) {
    const blob = new Blob([content], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  document.getElementById('downloadWater').addEventListener('click', () => {
    const csv = 'Month,Water Level (%)\n' + 
      waterData.map((v, i) => `${MONTHS[i]},${v.toFixed(2)}`).join('\n');
    downloadCSV(csv, 'yolo_bypass_water_data.csv');
  });

  document.getElementById('downloadBirds').addEventListener('click', () => {
    let csv = 'Species,' + MONTHS.join(',') + '\n';
    Object.entries(SPECIES).forEach(([name, data]) => {
      csv += name + ',' + data.data.join(',') + '\n';
    });
    downloadCSV(csv, 'yolo_bypass_bird_data.csv');
  });

  document.getElementById('downloadCombined').addEventListener('click', () => {
    let csv = 'Month,Water Level (%),' + Object.keys(SPECIES).join(',') + '\n';
    for (let i = 0; i < 12; i++) {
      const row = [
        MONTHS[i],
        waterData[i].toFixed(2),
        ...Object.values(SPECIES).map(s => s.data[i])
      ];
      csv += row.join(',') + '\n';
    }
    downloadCSV(csv, 'yolo_bypass_combined_data.csv');
  });

  // INITIALIZE
  fetchWaterData();
  initializeBirds();
  updateAnnotations();
  animate();

  console.log('The Basin Breathes - Ready!');

})();