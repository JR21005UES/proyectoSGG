// --- Inicialización del Mapa ---
var map = L.map('map').setView([13.6929, -89.2182], 9);

// --- Capa base ---
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// --- URLs y nombres de capas WMS ---
const geoServerUrl = 'http://localhost:8080/geoserver/ows';
const workspace = 'SGG';

const layers = {
    temperatura: {
        name: `${workspace}:temperatura`,
        layer: null,
        toggleId: 'toggleTemperatura'
    },
    deburga: {
        name: `${workspace}:deburga`,
        layer: null,
        filterField: 'class',
        selectId: 'deburgaSelect',
        toggleId: 'toggleDeburga'
    },
    municipios: {
        name: `${workspace}:municipio`,
        layer: null,
        filterField: 'adm2_es',
        selectId: 'municipioSelect',
        toggleId: 'toggleMunicipios'
    },
    departamento: {
        name: `${workspace}:departamento`,
        layer: null,
        filterField: 'adm1_es',
        selectId: 'departamentoSelect',
        toggleId: 'toggleDepartamento'
    },
    distrito: {
        name: `${workspace}:distrito`,
        layer: null,
        filterField: 'adm3_es',
        selectId: 'distritoSelect',
        toggleId: 'toggleDistrito'
    },
    carreteras: {
        name: `${workspace}:carreteras`,
        layer: null,
        toggleId: 'toggleCarreteras'
    },
    vegetacion: {
        name: `${workspace}:vegetacion`,
        layer: null,
        toggleId: 'toggleVegetacion'
    },
    superficie: {
        name: `${workspace}:superficie`,
        layer: null,
        toggleId: 'toggleSuperficie'
    },
    suelos: {
        name: `${workspace}:suelos`,
        layer: null,
        toggleId: 'toggleSuelos'
    },
    rios: {
        name: `${workspace}:rios`,
        layer: null,
        toggleId: 'toggleRios'
    }, cuerpos: {
        name: `${workspace}:cuerposAgua`,
        layer: null,
        toggleId: 'toggleCuerpos'
    }, construcciones: {
        name: `${workspace}:construcciones`,
        layer: null,
        toggleId: 'toggleConstrucciones'
    }
};

// --- Leyenda dinámica ---
const legendContent = document.getElementById('legend-content');

const legendMap = {
    toggleDeburga: 'SGG:deburga',
    toggleRios: 'SGG:rios',
    toggleTemperatura: 'SGG:temperatura',
    toggleVegetacion: 'SGG:vegetacion',
    toggleSuelos: 'SGG:suelos'
};

function updateLegend() {
    if (!legendContent) {
        console.error("Elemento #legend-content no encontrado.");
        return;
    }
    legendContent.innerHTML = ''; 
    console.log('Actualizando leyenda. Capas en legendMap:', legendMap);

    let legendHasContent = false;
    for (const toggleId in legendMap) {
        const checkbox = document.getElementById(toggleId);
        console.log(`Verificando checkbox: ${toggleId}, Encontrado: ${!!checkbox}`);
        if (checkbox && checkbox.checked) {
            legendHasContent = true;
            const layerName = legendMap[toggleId];
            console.log(`Checkbox ${toggleId} está activo. Generando leyenda para: ${layerName}`);

            const entry = document.createElement('div');

            const title = document.createElement('h3');
            let titleText = toggleId.replace('toggle', '');
            titleText = titleText.charAt(0).toUpperCase() + titleText.slice(1);
            title.textContent = titleText;
            title.className = 'text-sm font-semibold text-gray-100 mb-1';

            const img = document.createElement('img');
            // Asegúrate que STYLE sea el correcto o omítelo si es el default.
            // Si el estilo por defecto no tiene leyenda, no se mostrará nada.
            const legendUrl = `${geoServerUrl.replace('/ows', '')}/${workspace}/wms?REQUEST=GetLegendGraphic&VERSION=1.1.0&FORMAT=image/png&LAYER=${layerName}&STYLE=`; 
            console.log(`URL de leyenda: ${legendUrl}`);
            img.src = legendUrl;
            img.alt = `Leyenda ${layerName}`;
            img.className = 'max-w-full rounded bg-white p-1 border border-gray-400 shadow-sm';
            
            img.onload = function() {
                console.log(`Leyenda cargada para: ${layerName}`);
            }
            img.onerror = function() {
                console.error(`Error al cargar la leyenda para: ${layerName} desde ${legendUrl}`);
                const errorText = document.createElement('p');
                errorText.textContent = `Leyenda no disponible para ${titleText}.`;
                errorText.className = 'text-xs text-red-300 italic';
                // Remueve la imagen rota y añade el texto de error.
                if(img.parentNode) {
                    img.parentNode.replaceChild(errorText, img);
                } else {
                    entry.appendChild(errorText); // Si la imagen no se añadió aún
                }
            };

            entry.appendChild(title);
            entry.appendChild(img);
            legendContent.appendChild(entry);
        } else if (checkbox && !checkbox.checked) {
            console.log(`Checkbox ${toggleId} NO está activo.`);
        }
    }
     // Ocultar o mostrar el panel de leyenda completo si no hay contenido
    const legendPanel = document.getElementById('legend-panel');
    if (legendPanel) {
        legendPanel.style.display = legendHasContent ? 'block' : 'none';
    }
}

function manejarActivacionRaster() {
    const temperatura = document.getElementById('toggleTemperatura');
    const vegetacion = document.getElementById('toggleVegetacion');
    const suelos = document.getElementById('toggleSuelos');
    const superficie = document.getElementById('toggleSuperficie');

    let enProceso = false;

    function actualizarEstadoRaster(activado) {
        if (enProceso) return;
        enProceso = true;

        const rasterCheckboxes = { temperatura, vegetacion, suelos };
        for (const key in rasterCheckboxes) {
            if (rasterCheckboxes[key] !== activado && rasterCheckboxes[key].checked) {
                rasterCheckboxes[key].checked = false;
                // Simular evento change para que el listener de loadLayers actúe si es necesario
                // o manejar directamente la remoción de la capa.
                // Por simplicidad, asumimos que el listener de loadLayers no maneja estas capas raster
                // y las gestionamos aquí directamente.
                if (layers[key] && layers[key].layer && map.hasLayer(layers[key].layer)) {
                    map.removeLayer(layers[key].layer);
                }
            }
        }
        
        const algunaActiva = temperatura.checked || vegetacion.checked || suelos.checked;
        if (superficie.checked !== algunaActiva) {
             superficie.checked = algunaActiva;
        }

        // Remover y re-agregar en orden correcto
        ['superficie', 'temperatura', 'vegetacion', 'suelos'].forEach(key => {
            if (layers[key] && layers[key].layer && map.hasLayer(layers[key].layer)) {
                map.removeLayer(layers[key].layer);
            }
        });
        
        if (superficie.checked && layers.superficie.layer) {
            map.addLayer(layers.superficie.layer);
        }

        if (temperatura.checked && layers.temperatura.layer) {
            map.addLayer(layers.temperatura.layer);
        } else if (vegetacion.checked && layers.vegetacion.layer) {
            map.addLayer(layers.vegetacion.layer);
        } else if (suelos.checked && layers.suelos.layer) {
            map.addLayer(layers.suelos.layer);
        }
        
        updateLegend();
        enProceso = false;
    }

    [temperatura, vegetacion, suelos].forEach(chk => {
        if(chk) chk.addEventListener('change', () => actualizarEstadoRaster(chk));
    });
}

function createWMSLayer(layerName, filter = "INCLUDE") {
    return L.tileLayer.wms(geoServerUrl, {
        layers: layerName,
        format: 'image/png',
        transparent: true,
        version: '1.1.1', // GeoServer prefiere 1.1.1 o 1.3.0 para GetLegendGraphic también
        CQL_FILTER: filter
    });
}

function loadLayers() {
    for (const key in layers) {
        const obj = layers[key];
        const initialFilter = obj.selectId ? "INCLUDE" : undefined;
        obj.layer = createWMSLayer(obj.name, initialFilter);

        if (obj.toggleId) {
            const toggle = document.getElementById(obj.toggleId);
            if (toggle) {
                const isSpecialRaster = ['temperatura', 'vegetacion', 'suelos', 'superficie'].includes(key);

                if (!isSpecialRaster) { // Las capas raster especiales son manejadas por manejarActivacionRaster
                    toggle.addEventListener('change', () => {
                        if (toggle.checked) {
                            if (obj.layer && !map.hasLayer(obj.layer)) map.addLayer(obj.layer);
                        } else {
                            if (obj.layer && map.hasLayer(obj.layer)) map.removeLayer(obj.layer);
                        }
                        updateLegend(); // Actualizar leyenda al cambiar cualquier capa no especial
                    });
                } else if (key === 'superficie') { // La capa superficie solo reacciona a su checkbox para la leyenda
                     toggle.addEventListener('change', () => {
                        // La visibilidad es manejada por manejarActivacionRaster, pero la leyenda se actualiza
                        updateLegend(); 
                    });
                }
            }
        }

        if (obj.selectId) {
            const selector = document.getElementById(obj.selectId);
            if (selector) {
                selector.addEventListener('change', () => {
                    const value = selector.value;
                    const filterValue = value ? `${obj.filterField} = '${value}'` : 'INCLUDE';
                    obj.layer.setParams({
                        CQL_FILTER: filterValue,
                        _refresh: new Date().getTime() 
                    });
                    // No es necesario redibujar manualmente si la capa ya está en el mapa, setParams lo hace.
                });
            }
        }
    }
    updateLegend(); // Llamada inicial para limpiar o mostrar leyendas al cargar.
}

// --- Ejecutar carga inicial ---
loadLayers();
manejarActivacionRaster();