import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

const MapComponent = forwardRef(({ provinces = [] }, ref) => {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const [highlightedProvinces, setHighlightedProvinces] = useState(new Map());
  const [mapLoaded, setMapLoaded] = useState(false);
  const [layersReady, setLayersReady] = useState(false);

  // Define colors for different highlight types
  const highlightColors = {
    start: '#28a745',    // Green for start province
    end: '#dc3545',      // Red for end province
    path: '#007bff',     // Blue for path provinces
    default: '#ffe8d6'   // Original beige color
  };

  // Expose functions to parent component
  useImperativeHandle(ref, () => ({
    highlightProvince: (provinceName, highlightType = 'path') => {
      highlightProvinceByName(provinceName, highlightType);
    },
    resetHighlight: () => {
      resetAllHighlights();
    },
    getProvinceNames: () => {
      return provinces.map(p => p.name);
    },
    isReady: () => {
      return mapLoaded && layersReady;
    }
  }));

  const highlightProvinceByName = (provinceName, highlightType = 'path') => {
    const map = mapRef.current;
    if (!map) return;

    // Find the province (case-insensitive search)
    const province = provinces.find(p => 
      p.name.toLowerCase().includes(provinceName.toLowerCase()) ||
      provinceName.toLowerCase().includes(p.name.toLowerCase())
    );

    if (province) {
      const layerId = `province-layer-${province.name}`;
      
      // Highlight the province with appropriate color
      if (map.getLayer(layerId)) {
        const color = highlightColors[highlightType] || highlightColors.path;
        map.setPaintProperty(layerId, 'fill-color', color);
        map.setPaintProperty(layerId, 'fill-opacity', 0.8);
        
        // Store the highlighted province with its type
        setHighlightedProvinces(prev => {
          const newMap = new Map(prev);
          newMap.set(province.name, highlightType);
          return newMap;
        });
        
        // Optional: Zoom to the province only for start/end provinces
        if (highlightType === 'start' || highlightType === 'end') {
          const bounds = new maplibregl.LngLatBounds();
          if (province.geometry && province.geometry.coordinates) {
            // Handle different geometry types
            const coords = province.geometry.type === 'Polygon' 
              ? province.geometry.coordinates[0] 
              : province.geometry.coordinates.flat();
            
            coords.forEach(coord => bounds.extend(coord));
            map.fitBounds(bounds, { padding: 100, maxZoom: 8 });
          }
        }
        
        console.log(`Highlighted province: ${province.name} as ${highlightType}`);
        return true; // Success
      }
    } else {
      console.log(`Province not found: ${provinceName}`);
      return false; // Not found
    }
  };

  const resetAllHighlights = () => {
    const map = mapRef.current;
    if (!map) return;

    // Reset all highlighted provinces to default color
    highlightedProvinces.forEach((highlightType, provinceName) => {
      const layerId = `province-layer-${provinceName}`;
      if (map.getLayer(layerId)) {
        map.setPaintProperty(layerId, 'fill-color', highlightColors.default);
        map.setPaintProperty(layerId, 'fill-opacity', 1);
      }
    });
    
    setHighlightedProvinces(new Map());
  };

  // Initialize map once
  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = new maplibregl.Map({
        container: mapContainer.current,
        style: './src/assets/map-style.json',
        center: [108, 15],
        zoom: 4,
      });

      // Set map loaded state when ready
      mapRef.current.on('load', () => {
        setMapLoaded(true);
      });
    }
  }, []);

  // Add layers when provinces data is available
  useEffect(() => {
    const map = mapRef.current;
    if (!map || provinces.length === 0 || !mapLoaded) return;

    const addLayers = () => {
      let layersAdded = 0;
      const totalLayers = provinces.length;

      provinces.forEach((province) => {
        const sourceId = `province-${province.name}`;
        const layerId = `province-layer-${province.name}`;
        
        // Check if source already exists to avoid duplicates
        if (!map.getSource(sourceId)) {
          map.addSource(sourceId, {
            type: 'geojson',
            data: province
          });
          
          map.addLayer({
            id: layerId,
            type: 'fill',
            source: sourceId,
            layout: {},
            paint: {
              'fill-color': highlightColors.default,
              'fill-outline-color': '#6b705c',
              'fill-opacity': 1,
            },
          });

          // Click handler
          map.on('click', layerId, (e) => {
            // Get the highlight type for styling the popup
            const highlightType = highlightedProvinces.get(province.name);
            const popupColor = highlightType ? highlightColors[highlightType] : '#000';
            
            new maplibregl.Popup()
              .setLngLat(e.lngLat)
              .setHTML(`
                <div style="color: black; text-align: center;">
                  <h3 style="margin: 0; color: ${popupColor};">${province.name}</h3>
                  ${highlightType ? `<small style="color: #666;">${highlightType.charAt(0).toUpperCase() + highlightType.slice(1)} Province</small>` : ''}
                </div>
              `)
              .addTo(map);
          });

          // Mouse events for better UX
          map.on('mouseenter', layerId, () => {
            map.getCanvas().style.cursor = 'pointer';
            
            // Add slight hover effect
            const currentColor = map.getPaintProperty(layerId, 'fill-color');
            if (currentColor === highlightColors.default) {
              map.setPaintProperty(layerId, 'fill-opacity', 0.7);
            }
          });

          map.on('mouseleave', layerId, () => {
            map.getCanvas().style.cursor = '';
            
            // Reset hover effect
            const highlightType = highlightedProvinces.get(province.name);
            if (!highlightType) {
              map.setPaintProperty(layerId, 'fill-opacity', 1);
            }
          });

          layersAdded++;
          
          // Check if all layers are added
          if (layersAdded === totalLayers) {
            setLayersReady(true);
          }
        }
      });
    };

    addLayers();
  }, [provinces, mapLoaded, highlightedProvinces]);
  
  return (
    <div id="map-container">
      <div id="map" ref={mapContainer} />
      
      {/* Map Legend */}
      <div style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        background: 'rgba(255, 255, 255, 0.9)',
        padding: '10px',
        borderRadius: '5px',
        fontSize: '12px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Legend</div>
        <div><span style={{ color: highlightColors.start, fontSize: '16px' }}>■</span> Start Province</div>
        <div><span style={{ color: highlightColors.end, fontSize: '16px' }}>■</span> End Province</div>
        <div><span style={{ color: highlightColors.path, fontSize: '16px' }}>■</span> Your Path</div>
      </div>
    </div>
  );
});

MapComponent.displayName = 'MapComponent';

export default MapComponent;