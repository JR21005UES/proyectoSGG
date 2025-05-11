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

// Mapea los checkboxes con la capa WMS para leyenda
const legendMap = {
    toggleDeburga: 'SGG:deburga',
    toggleRios: 'SGG:rios',
    toggleTemperatura: 'SGG:temperatura',
    toggleVegetacion: 'SGG:vegetacion',
    toggleSuelos: 'SGG:suelos'
};

// Actualiza leyendas activas
function updateLegend() {
    legendContent.innerHTML = ''; // Limpia actual

    for (const toggleId in legendMap) {
        const checkbox = document.getElementById(toggleId);
        if (checkbox && checkbox.checked) {
            const layerName = legendMap[toggleId];

            // Crea el contenedor
            const entry = document.createElement('div');
            entry.className = 'legend-entry';

            // Crea el título
            const title = document.createElement('h3');
            title.textContent = toggleId.replace('toggle', ''); // Ej: 'Deburga'
            title.style.marginBottom = '5px';

            // Mejora el nombre visualmente
            title.textContent = title.textContent.charAt(0).toUpperCase() + title.textContent.slice(1);

            // Crea la imagen
            const img = document.createElement('img');
            img.src = `http://localhost:8080/geoserver/${workspace}/wms?REQUEST=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&LAYER=${layerName}`;
            img.alt = `Leyenda ${layerName}`;
            img.style.maxWidth = '100%';
            img.style.borderRadius = '4px';
            img.style.marginBottom = '12px';

            // Agrega al contenedor
            entry.appendChild(title);
            entry.appendChild(img);
            legendContent.appendChild(entry);
        }
    }
}

function manejarActivacionRaster() {
    const temperatura = document.getElementById('toggleTemperatura');
    const vegetacion = document.getElementById('toggleVegetacion');
    const suelos = document.getElementById('toggleSuelos');
    const superficie = document.getElementById('toggleSuperficie');

    let enProceso = false;

    function actualizarEstado(activado) {
        if (enProceso) return;
        enProceso = true;

        // Desactivar otras capas si se activa una
        if (activado === temperatura && temperatura.checked) {
            vegetacion.checked = false;
            suelos.checked = false;
        } else if (activado === vegetacion && vegetacion.checked) {
            temperatura.checked = false;
            suelos.checked = false;
        } else if (activado === suelos && suelos.checked) {
            temperatura.checked = false;
            vegetacion.checked = false;
        }

        // Activar superficie si alguna principal está activa
        const algunaActiva = temperatura.checked || vegetacion.checked || suelos.checked;
        superficie.checked = algunaActiva;

        // Primero remover todas las raster para evitar duplicados
        ['superficie', 'temperatura', 'vegetacion', 'suelos'].forEach(capa => {
            if (layers[capa]?.layer) {
                map.removeLayer(layers[capa].layer);
            }
        });

        // Agregar superficie primero
        if (superficie.checked) {
            map.addLayer(layers.superficie.layer);
        }

        // Luego la capa activa principal
        if (temperatura.checked) {
            map.addLayer(layers.temperatura.layer);
        } else if (vegetacion.checked) {
            map.addLayer(layers.vegetacion.layer);
        } else if (suelos.checked) {
            map.addLayer(layers.suelos.layer);
        }

        updateLegend();
        enProceso = false;
    }

    temperatura.addEventListener('change', () => actualizarEstado(temperatura));
    vegetacion.addEventListener('change', () => actualizarEstado(vegetacion));
    suelos.addEventListener('change', () => actualizarEstado(suelos));
}

// --- Manejo de capas ---
function updateLayerVisibility(checkbox, layerKey) {
    const layer = layers[layerKey]?.layer;
    if (!layer) return;

    if (checkbox.checked) {
        map.addLayer(layer);
    } else {
        map.removeLayer(layer);
    }
}



// --- Crear capa WMS ---
function createWMSLayer(layerName, filter = "INCLUDE") {
    return L.tileLayer.wms(geoServerUrl, {
        layers: layerName,
        format: 'image/png',
        transparent: true,
        version: '1.1.1',
        CQL_FILTER: filter
    });
}

// --- Cargar todas las capas ---
function loadLayers() {
    for (const key in layers) {
        const obj = layers[key];
        const filter = obj.selectId ? "INCLUDE" : undefined;
        obj.layer = createWMSLayer(obj.name, filter);

        // No se agrega la capa por defecto, solo se escucha el checkbox
        if (obj.toggleId) {
            const toggle = document.getElementById(obj.toggleId);
            toggle.addEventListener('change', () => {
                if (toggle.checked) {
                    map.addLayer(obj.layer);
                } else {
                    map.removeLayer(obj.layer);
                }
                updateLegend(); // Actualiza leyenda al marcar
            });
        }

        // Listener de filtro (si aplica)
        if (obj.selectId) {
            const selector = document.getElementById(obj.selectId);
            selector.addEventListener('change', () => {
                const value = selector.value;
                const filter = value ? `${obj.filterField} = '${value}'` : 'INCLUDE';
                obj.layer.setParams({
                    CQL_FILTER: filter,
                    TILE: Math.random()
                });
            });
        }
    }

    updateLegend(); // Se ejecuta una vez para limpiar si fuera necesario
}


// --- Ejecutar carga inicial ---
loadLayers();
manejarActivacionRaster(); // ← Aquí

