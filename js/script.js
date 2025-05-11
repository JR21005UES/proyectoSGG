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
        filterField: 'adm1_es',
        selectId: 'municipioSelect',
        toggleId: 'toggleMunicipios'
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
    }
};

// --- Función general para crear capa WMS ---
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
        map.addLayer(obj.layer);

        // Asignar funcionalidad al checkbox
        if (obj.toggleId) {
            const toggle = document.getElementById(obj.toggleId);
            toggle.addEventListener('change', () => {
                if (toggle.checked) {
                    map.addLayer(obj.layer);
                } else {
                    map.removeLayer(obj.layer);
                }
            });
        }

        // Asignar funcionalidad a los selectores de filtro
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
}

// --- Ejecutar carga inicial ---
loadLayers();
