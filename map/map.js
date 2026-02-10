(function() {
  'use strict';
  console.log('Map with Google Earth Engine initializing...');

  // INITIALIZE LEAFLET MAP
  const map = L.map('map').setView([38.54, -121.59], 11);

  // BASE LAYERS
  const baseLayers = {
    standard: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }),
    topo: L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenTopoMap contributors',
      maxZoom: 17
    }),
    dark: L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '© CartoDB',
      maxZoom: 19
    })
  };

  baseLayers.standard.addTo(map);

  // OVERLAY LAYERS
  const overlays = {};
  let eeInitialized = false;
  let eeLayers = {};

  // PLACEHOLDER BYPASS BOUNDARY (will be replaced with GEE data once authenticated)
  const bypassBoundary = L.rectangle([[38.2, -121.65], [38.8, -121.52]], {
    color: '#2e557c',
    weight: 2,
    opacity: 0.8,
    fillColor: '#7292cb',
    fillOpacity: 0.25
  }).bindPopup('<strong>Yolo Bypass</strong><br>Click "Initialize Earth Engine" for accurate boundary');
  overlays.bypass = bypassBoundary;

  // BIRD OBSERVATION MARKERS
  const birdsGroup = L.layerGroup();
  const birdSites = [
    { lat: 38.68, lng: -121.60, density: 'high', name: 'Cache Creek Area', obs: 782 },
    { lat: 38.535, lng: -121.595, density: 'high', name: 'Yolo Bypass Wildlife Area', obs: 1243 },
    { lat: 38.54, lng: -121.60, density: 'medium', name: 'Putah Creek Wetlands', obs: 356 },
    { lat: 38.62, lng: -121.59, density: 'medium', name: 'Mid-Bypass Wetlands', obs: 429 },
    { lat: 38.40, lng: -121.58, density: 'low', name: 'Southern Bypass', obs: 94 },
    { lat: 38.555, lng: -121.570, density: 'high', name: 'I-80 Causeway View', obs: 891 }
  ];

  birdSites.forEach(function(site) {
    let color, radius;
    if (site.density === 'high') {
      color = '#f06896';
      radius = 8;
    } else if (site.density === 'medium') {
      color = '#f1b93f';
      radius = 6;
    } else {
      color = '#bd7bcf';
      radius = 4;
    }

    const marker = L.circleMarker([site.lat, site.lng], {
      radius: radius,
      fillColor: color,
      color: '#fffdf2',
      weight: 2,
      opacity: 1,
      fillOpacity: 0.85
    }).bindPopup('<strong>' + site.name + '</strong><br>' + site.obs + ' observations/year');

    birdsGroup.addLayer(marker);
  });

  overlays.birds = birdsGroup;

  // GOOGLE EARTH ENGINE INITIALIZATION
  const eeProjectInput = document.querySelector('#ee-project-id');
  const eeAuthButton = document.querySelector('#ee-authenticate');
  const eeStatus = document.querySelector('#ee-status');

  eeAuthButton.addEventListener('click', function() {
    const projectId = eeProjectInput.value.trim();
    
    if (!projectId) {
      eeStatus.textContent = 'Please enter your Earth Engine project ID';
      eeStatus.style.color = '#ef6244';
      return;
    }

    eeStatus.textContent = 'Initializing Earth Engine...';
    eeStatus.style.color = '#2e557c';

    // Initialize Earth Engine
    ee.data.authenticateViaOauth(projectId, function() {
      ee.initialize(null, null, function() {
        eeInitialized = true;
        eeStatus.textContent = '✓ Earth Engine initialized successfully!';
        eeStatus.style.color = '#bda543';
        
        // Load Earth Engine layers
        loadEarthEngineLayers();
      }, function(error) {
        eeStatus.textContent = 'Error: ' + error;
        eeStatus.style.color = '#ef6244';
      });
    }, function(error) {
      eeStatus.textContent = 'Authentication failed. Make sure you\'re logged into Google.';
      eeStatus.style.color = '#ef6244';
      console.error('EE Auth Error:', error);
    });
  });

  // LOAD EARTH ENGINE LAYERS
  function loadEarthEngineLayers() {
    console.log('Loading Earth Engine layers...');

    // YOLO BYPASS BOUNDARY from Earth Engine Asset
    // You'll need to upload the actual Yolo Bypass shapefile to your GEE assets
    // Replace 'users/YOUR_USERNAME/yolo_bypass_boundary' with your actual asset path
    try {
      const yoloBypassAsset = ee.FeatureCollection('users/YOUR_USERNAME/yolo_bypass_boundary');
      
      yoloBypassAsset.evaluate(function(result) {
        if (result && result.features) {
          // Remove placeholder boundary
          map.removeLayer(overlays.bypass);
          
          // Add real GEE boundary as GeoJSON
          const geoJson = L.geoJSON(result, {
            style: {
              color: '#2e557c',
              weight: 2,
              opacity: 0.8,
              fillColor: '#7292cb',
              fillOpacity: 0.25
            }
          }).bindPopup('<strong>Yolo Bypass</strong><br>Actual boundary from Earth Engine');
          
          overlays.bypass = geoJson;
          
          // Re-add if checkbox is checked
          const bypassCheckbox = document.querySelector('[data-layer="bypass"]');
          if (bypassCheckbox && bypassCheckbox.checked) {
            map.addLayer(geoJson);
          }
        }
      });
    } catch(e) {
      console.log('Could not load Yolo Bypass asset. Using placeholder boundary.');
      eeStatus.textContent += ' (Using placeholder boundaries - upload shapefile to GEE assets)';
    }

    // SATELLITE IMAGERY - Recent Landsat or Sentinel
    const satellite = ee.ImageCollection('COPERNICUS/S2_SR')
      .filterBounds(ee.Geometry.Rectangle(-121.7, 38.1, -121.4, 38.9))
      .filterDate('2024-01-01', '2024-12-31')
      .sort('CLOUDY_PIXEL_PERCENTAGE')
      .first();

    const satVis = {
      min: 0,
      max: 3000,
      bands: ['B4', 'B3', 'B2']
    };

    const satMapId = satellite.getMap(satVis);
    eeLayers.satellite = L.tileLayer(satMapId.tile_fetcher.url_format);

    // WATER BODIES using JRC Global Surface Water
    const water = ee.Image('JRC/GSW1_3/GlobalSurfaceWater')
      .select('occurrence')
      .clip(ee.Geometry.Rectangle(-121.7, 38.1, -121.4, 38.9));

    const waterVis = {
      min: 0,
      max: 100,
      palette: ['ffffff', '99d9ea', '0055ff']
    };

    const waterMapId = water.getMap(waterVis);
    eeLayers.water = L.tileLayer(waterMapId.tile_fetcher.url_format);

    console.log('Earth Engine layers loaded');
  }

  // LAYER TOGGLE CONTROLS
  const checkboxes = document.querySelectorAll('.layer-checkbox');
  checkboxes.forEach(function(checkbox) {
    checkbox.addEventListener('change', function() {
      const layerName = this.getAttribute('data-layer');
      
      // Handle EE layers
      if (layerName === 'satellite' || layerName === 'water') {
        if (!eeInitialized) {
          this.checked = false;
          eeStatus.textContent = 'Please initialize Earth Engine first';
          eeStatus.style.color = '#ef6244';
          return;
        }
        
        const layer = eeLayers[layerName];
        if (layer) {
          if (this.checked) {
            map.addLayer(layer);
          } else {
            map.removeLayer(layer);
          }
        }
        return;
      }
      
      // Handle regular overlays
      const layer = overlays[layerName];
      if (layer) {
        if (this.checked) {
          map.addLayer(layer);
        } else {
          map.removeLayer(layer);
        }
      }
    });

    // Initialize checked layers
    if (checkbox.checked) {
      const layerName = checkbox.getAttribute('data-layer');
      const layer = overlays[layerName];
      if (layer) {
        map.addLayer(layer);
      }
    }
  });

  // MAP STYLE CONTROLS
  let currentBaseLayer = baseLayers.standard;
  
  const styleButtons = document.querySelectorAll('.style-btn');
  styleButtons.forEach(function(btn) {
    btn.addEventListener('click', function() {
      styleButtons.forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');
      
      const styleType = btn.getAttribute('data-style');
      
      map.removeLayer(currentBaseLayer);
      currentBaseLayer = baseLayers[styleType];
      map.addLayer(currentBaseLayer);
    });
  });

  console.log('Map initialized. Initialize Earth Engine to load accurate boundaries.');

})();