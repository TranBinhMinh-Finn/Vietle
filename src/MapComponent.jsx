import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

const MapComponent = forwardRef((props, ref) => {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const [provinces, setProvinces] = useState([]);
  const [highlightedProvince, setHighlightedProvince] = useState(null);

  // Expose functions to parent component
  useImperativeHandle(ref, () => ({
    highlightProvince: (provinceName) => {
      highlightProvinceByName(provinceName);
    },
    resetHighlight: () => {
      resetAllHighlights();
    },
    getProvinceNames: () => {
      return provinces.map(p => p.name);
    }
  }));

  const highlightProvinceByName = (provinceName) => {
    const map = mapRef.current;
    if (!map) return;

    // Find the province (case-insensitive search)
    const province = provinces.find(p => 
      p.name.toLowerCase().includes(provinceName.toLowerCase()) ||
      provinceName.toLowerCase().includes(p.name.toLowerCase())
    );

    if (province) {
      const layerId = `province-layer-${province.name}`;
      
      // Reset previous highlight
      // resetAllHighlights();
      
      // Highlight the guessed province
      if (map.getLayer(layerId)) {
        map.setPaintProperty(layerId, 'fill-color', '#ff6b6b'); // Red highlight
        map.setPaintProperty(layerId, 'fill-opacity', 0.8);
        
        // Store the highlighted province
        setHighlightedProvince(province.name);
        
        // Optional: Zoom to the province
        const bounds = new maplibregl.LngLatBounds();
        if (province.geometry && province.geometry.coordinates) {
          // Handle different geometry types
          const coords = province.geometry.type === 'Polygon' 
            ? province.geometry.coordinates[0] 
            : province.geometry.coordinates.flat();
          
          coords.forEach(coord => bounds.extend(coord));
          map.fitBounds(bounds, { padding: 50 });
        }
        
        console.log(`Highlighted province: ${province.name}`);
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

    provinces.forEach(province => {
      const layerId = `province-layer-${province.name}`;
      if (map.getLayer(layerId)) {
        map.setPaintProperty(layerId, 'fill-color', '#ffe8d6'); // Original color
        map.setPaintProperty(layerId, 'fill-opacity', 1);
      }
    });
    
    setHighlightedProvince(null);
  };

  useEffect(() => {
    const loadJsonFiles = async () => {
      const allData = [];
      const totalFiles = 63;
      for (let i = 1; i <= totalFiles; i++) {
        try {
          const jsonData = await import(`./assets/gis/${i}.json`);
          allData.push(jsonData.default); 
        } catch (error) {
          console.error(`Error loading ${i}.json`, error);
        }
      }
      setProvinces(allData);
    };
    
    loadJsonFiles();
  }, []);

  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = new maplibregl.Map({
        container: mapContainer.current,
        style: './src/assets/map-style.json',
        center: [108, 15],
        zoom: 4,
      });
    }

    const map = mapRef.current;

    if (provinces.length > 0) {
      const addLayers = () => {
        provinces.forEach((province) => {
          const sourceId = `province-${province.name}`;
          const layerId = `province-layer-${province.name}`;
          
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
                'fill-color': '#ffe8d6',
                'fill-outline-color': '#6b705c',
                'fill-opacity': 1,
              },
            });

            // Click handler with improved feedback
            map.on('click', layerId, (e) => {
              
              new maplibregl.Popup()
                .setLngLat(e.lngLat)
                .setHTML(`<h3 style="color: black">${province.name}</h3>`)
                .addTo(map);
            });

            map.on('mouseenter', layerId, () => {
              map.getCanvas().style.cursor = 'pointer';
            });

            map.on('mouseleave', layerId, () => {
              map.getCanvas().style.cursor = '';
            });
          }
        });
      };

      if (map.loaded()) {
        addLayers();
      } else {
        map.once('load', addLayers);
      }
    }
  }, [provinces]);
  
  return (
    <div id="map-container">
      <div id="map" ref={mapContainer} />
      
    </div>
  );
});

MapComponent.displayName = 'MapComponent';

export default MapComponent;