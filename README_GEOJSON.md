# Yolo Basin Interactive Map - GeoJSON Integration Guide

This map now uses **GeoJSON layers** following the Leaflet tutorial to display accurate polygon data for:

- ✅ Yolo Basin boundary (entire 59,000-acre area)
- ✅ Yolo Bypass Wildlife Area (specific public access zone)
- ✅ Hiking trails and public access points
- ✅ Nigiri Project area (experimental rice-fish habitat)
- ✅ Pacific Flyway migration corridor
- ✅ Shooting zones (designated hunting areas)

## What's New

### GeoJSON Layers
All geographic data is now stored as **GeoJSON FeatureCollections** in `map.js`, following the Leaflet GeoJSON tutorial pattern:

```javascript
const layerGeoJSON = {
  "type": "FeatureCollection",
  "features": [{
    "type": "Feature",
    "properties": {
      "name": "Area Name",
      "description": "Details..."
    },
    "geometry": {
      "type": "Polygon",
      "coordinates": [[...]]
    }
  }]
};
```

### Interactive Features
Each layer includes:
- **Custom styling** based on properties
- **Popup information** with details when clicked
- **Toggle controls** to show/hide layers
- **onEachFeature** callbacks for interactivity

## How to Add Real Polygon Data

### Option 1: Use GeoJSON.io (Easiest)
1. Go to [geojson.io](https://geojson.io)
2. Navigate to Yolo Basin area on the map
3. Use drawing tools to trace the actual boundaries
4. Copy the generated GeoJSON
5. Paste into the appropriate variable in `map.js`

### Option 2: Import from Shapefile
1. Get official shapefiles from:
   - California Department of Water Resources (DWR)
   - California Department of Fish and Wildlife
   - FEMA flood zone data
2. Convert to GeoJSON using:
   - [mapshaper.org](https://mapshaper.org) (online)
   - QGIS (desktop GIS software)
   - `ogr2ogr` command line tool
3. Copy coordinates into `map.js`

### Option 3: Use Google Earth Engine Assets
For the most accurate data from Earth Engine:

1. Upload shapefiles to your GEE assets
2. Replace placeholder asset paths in the `loadEarthEngineLayers()` function:

```javascript
const yoloBypassAsset = ee.FeatureCollection('users/YOUR_USERNAME/yolo_bypass_boundary');
```

## Customizing Each Layer

### Yolo Basin Boundary
Location in code: `yoloBasinGeoJSON` (line ~30)
- Type: Polygon
- Current: Approximate outline
- Update with: Official DWR boundary shapefile

### Wildlife Area
Location in code: `wildlifeAreaGeoJSON` (line ~66)
- Type: Polygon
- Current: Approximate 16,770-acre area
- Update with: CA Fish & Wildlife official boundaries

### Trails
Location in code: `trailsGeoJSON` (line ~100)
- Type: Mixed (LineString for trails, Point for access)
- Current: Sample trails
- Update with: GPS tracks or official trail maps

### Nigiri Project
Location in code: `nigiriProjectGeoJSON` (line ~165)
- Type: Polygon
- Current: Approximate 300-acre area
- Update with: Actual project field boundaries

### Pacific Flyway
Location in code: `pacificFlywayGeoJSON` (line ~187)
- Type: LineString
- Current: Simplified corridor through California
- Update with: More detailed migration path data

### Shooting Zones
Location in code: `shootingZonesGeoJSON` (line ~225)
- Type: Multiple Polygons (FeatureCollection)
- Current: 3 sample zones
- Update with: Official hunting zone boundaries from CA DFW

## Styling Options

Each layer supports these style properties:

```javascript
L.geoJSON(data, {
  style: {
    color: '#2e557c',        // Line color
    weight: 2,                // Line width
    opacity: 0.8,             // Line opacity
    fillColor: '#7292cb',     // Fill color
    fillOpacity: 0.25,        // Fill opacity
    dashArray: '10, 5'        // Dash pattern (optional)
  }
})
```

### Dynamic Styling
Style features based on properties:

```javascript
style: function(feature) {
  switch (feature.properties.zone_type) {
    case 'high_priority': return {color: "#ff0000"};
    case 'low_priority': return {color: "#0000ff"};
  }
}
```

## Adding New Layers

To add a new GeoJSON layer:

1. **Define the data** (around line 30-270 in map.js):
```javascript
const myNewLayerGeoJSON = {
  "type": "FeatureCollection",
  "features": [...]
};
```

2. **Create the Leaflet layer** (around line 275-370):
```javascript
const myNewLayer = L.geoJSON(myNewLayerGeoJSON, {
  style: {...},
  onEachFeature: function(feature, layer) {
    layer.bindPopup(feature.properties.name);
  }
});
overlays.myNewLayer = myNewLayer;
```

3. **Add toggle control** in map.html:
```html
<div class="toggle-item">
  <input type="checkbox" id="toggle-mynew" class="layer-checkbox" data-layer="myNewLayer">
  <label for="toggle-mynew">
    <span class="toggle-color" style="background: #color;"></span>
    My New Layer
  </label>
</div>
```

## Data Sources

### Recommended sources for accurate Yolo Basin data:

- **Boundaries**: California Department of Water Resources (DWR)
- **Wildlife Areas**: CA Department of Fish & Wildlife
- **Flood Zones**: FEMA National Flood Hazard Layer
- **Trails**: OpenStreetMap, local county parks departments
- **Wetlands**: US Fish & Wildlife Service National Wetlands Inventory
- **Bird Data**: eBird hotspot data
- **Satellite Imagery**: Google Earth Engine (already integrated)

## Current Placeholder Note

⚠️ **Important**: The current GeoJSON coordinates are approximate placeholders for demonstration. 

For production use, replace with:
1. Official shapefiles from government agencies
2. GPS-traced boundaries
3. Verified survey data

## Color Palette

Current map uses these CSS variables:
- `--darkblue`: #2e557c (borders, text)
- `--lightblue`: #7292cb (water, basin)
- `--pink`: #f06896 (highlights, flyway)
- `--yellow`: #bda543 (wildlife areas)
- `--olivegreen`: #8fbb7f (trails)
- `--orange`: #ef6244 (shooting zones)
- `--purple`: #bd7bcf (low-density markers)

## Testing

After updating GeoJSON data:
1. Open map.html in browser
2. Check JavaScript console for errors
3. Toggle each layer on/off
4. Click on polygons to verify popup content
5. Verify layers appear in correct location

## Need Help?

The GeoJSON format follows RFC 7946 specification. Key points:
- Coordinates are [longitude, latitude] (note the order!)
- Polygons must close (first point = last point)
- Multi-part features use MultiPolygon or GeometryCollection
- All coordinates use WGS84 (EPSG:4326)

For more info, see:
- [Leaflet GeoJSON Tutorial](https://leafletjs.com/examples/geojson/)
- [GeoJSON Specification](https://geojson.org/)
- [geojson.io](https://geojson.io) - Interactive editor
