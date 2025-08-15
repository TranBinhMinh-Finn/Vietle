import { useEffect, useRef, useImperativeHandle, useState} from "react";
import maplibregl from 'maplibre-gl';
import './App.css';
import 'maplibre-gl/dist/maplibre-gl.css';

const GameMap = ({provinces = [], markMapReady, ref}) => {
    const mapContainer = useRef(null);
    const mapRef = useRef(null);
    const provinceState = useRef();
    const [containerWidth, setContainerWidth] = useState(800);
    const [containerHeight, setContainerHeight] = useState(null); 
    const bbox = [[102.1421, 6.953306], [116.9473, 23.3939]];

    const highlightColors = {
        start: '#61bd6c',    
        end: '#e05c56',      
        path: '#007bff',     
        default: '#e7e7e7'   
    };

    useImperativeHandle(ref, () => ({
        highlightProvince: (provinceName, highlightType = 'path') => {
          highlightProvinceByName(provinceName, highlightType);
        },
        resetHighlights: () => {
            resetHighlights();
        },
        renderChallenge: (challenge) => {
            renderChallenge(challenge);
        },
    }));
    
    const getBboxAspectRatio = () => {
        const lngDiff = bbox[1][0] - bbox[0][0];
        const latDiff = bbox[1][1] - bbox[0][1];
        
        return lngDiff / latDiff;
    };
    
    const bboxAspectRatio = getBboxAspectRatio();

    const fitToBbox = () => {
        if (mapRef.current) {
            mapRef.current.fitBounds(bbox, {
                animate: false,
                duration: 100
            });
        }
    };
    
    const calculateDimensions = (width) => {
        const numericWidth = parseInt(width) || 800;
        const height = Math.round(numericWidth / bboxAspectRatio);
        return { width: numericWidth, height };
    };

    const updateContainerDimensions = () => {
        if (mapContainer.current && mapContainer.current.parentElement) {
            const parentWidth = mapContainer.current.parentElement.offsetWidth;
            
            if (Math.abs(parentWidth - containerWidth) > 10) {
                const dimensions = calculateDimensions(parentWidth);
                setContainerWidth(dimensions.width);
                setContainerHeight(dimensions.height);
            }
        }
    };
    
    useEffect(() => {
        const timer = setTimeout(() => {
            updateContainerDimensions();
        }, 100);

        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        const dimensions = calculateDimensions(containerWidth);
        setContainerHeight(dimensions.height);
    }, [containerWidth, bboxAspectRatio]);


    useEffect(() => {
        if (!mapContainer.current || !window.ResizeObserver) return;
        
        const resizeObserver = new ResizeObserver((entries) => {
            for (let entry of entries) {
                const newWidth = entry.contentRect.width;
                if (newWidth > 0 && newWidth !== containerWidth) {
                    const dimensions = calculateDimensions(newWidth);
                    setContainerWidth(dimensions.width);
                    setContainerHeight(dimensions.height);
                }
            }
        });

        const handleWindowResize = () => {
            setTimeout(() => {
                updateContainerDimensions();
            }, 100);
        };

        resizeObserver.observe(mapContainer.current);
        window.addEventListener('resize', handleWindowResize);

        return () => {
            resizeObserver.disconnect();
            window.removeEventListener('resize', handleWindowResize);
        };
    }, [bboxAspectRatio, containerWidth]);

    useEffect(() => {
        const initializeMap = () => {
            if (!mapRef.current) {
                mapRef.current = new maplibregl.Map({
                    container: mapContainer.current,
                    style: './src/assets/style.json',
                    zoom: 5.2,
                    attributionControl: false,
                    });
                mapRef.current.on('load', () => addProvinceLayer());
                mapRef.current.on('click', () => addProvinceAnnotations());
                mapRef.current.on('load', () => markMapReady());

                mapRef.current.dragPan.disable();
                mapRef.current.scrollZoom.disable();
                mapRef.current.on('load', () => fitToBbox());
                mapRef.current.on('resize', () => {
                    setTimeout(() => {
                        fitToBbox();
                    }, 100);
                });
            }
        };

        const addProvinceLayer = () => {
            const map = mapRef.current;
            const layers = [];
            provinces.forEach((province) => {
                const sourceId = `province-${province.name}`;
                const layerId = `province-layer-${province.name}`;

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
                    'fill-outline-color': '#3b4043',
                    'fill-opacity': 1,
                    },
                });

                layers.push(layerId);
            })

            map.on('mousemove', (e) => {
                const features = map.queryRenderedFeatures(e.point, {
                    layers: layers 
                });
                
                map.getCanvas().style.cursor = features.length > 0 ? 'pointer' : '';
            });
        };

        const addProvinceAnnotations = () => {
            const map = mapRef.current;
            
            provinces.forEach((province) => {
                const layerId = `province-layer-${province.name}`;

                map.on('click', layerId, (e) => {
                    const popupColor = '#000';
                    const annotation = provinceState[province.name] == 'revealed' ? province.name : '?';

                    new maplibregl.Popup({
                        closeButton: false
                    })
                      .setLngLat(e.lngLat)
                      .setHTML(`
                        <div style="color: black; text-align: center;">
                          <h3 style="margin: 0; color: ${popupColor};">${annotation}</h3>
                        </div>
                      `)
                      .addTo(map);
                });
                

                map.on('mouseenter', layerId, () => {
                    map.setPaintProperty(layerId, 'fill-opacity', 0.7);
                });

                map.on('mouseleave', layerId, () => {
                    map.setPaintProperty(layerId, 'fill-opacity', 1);
                    
                });
            
            });
        };

        initializeMap();
        
    },[]);
    
    const highlightProvinceByName = (provinceName, highlightType = 'path') => {
        const map = mapRef.current;
        if (!map) return;
    
        const province = provinces.find(p => 
          p.name === provinceName
        );
    
        if (province) {
          const layerId = `province-layer-${province.name}`;
          
          if (map.getLayer(layerId)) {
            const color = highlightColors[highlightType] || highlightColors.path;
            map.setPaintProperty(layerId, 'fill-color', color);
            map.setPaintProperty(layerId, 'fill-opacity', 1.0);

            provinceState[province.name] = 'revealed'

            return true; 
          }
        } else {
          console.log(`Province not found: ${provinceName}`);
          return false;
        }
    };
    
    const resetHighlights = () => {
        const map = mapRef.current;
        provinces.forEach((province) => {
            const layerId = `province-layer-${province.name}`;
            if (map.getLayer(layerId)) {
                map.setPaintProperty(layerId, 'fill-color', highlightColors.default);
                map.setPaintProperty(layerId, 'fill-opacity', 1);

                provinceState[province.name] = 'hidden';
            }
        });
    };

    const renderChallenge = (challenge) => {
        resetHighlights();
        highlightProvinceByName(challenge.startName, 'start');
        highlightProvinceByName(challenge.endName, 'end');
    };

    return (
        <>
            <div 
            id="map-container" 
            ref={mapContainer} 
            className="w-full max-w-[lg]"
            style={{ 
                width: `${containerWidth}px`, 
                height: `${containerHeight}px` 
            }} 
            />
        </>
    );
}

export default GameMap;