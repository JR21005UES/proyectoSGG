// --- Inicialización del Mapa ---
var map = L.map('map').setView([13.6929, -89.2182], 9);

// --- Definición de Panes Personalizados (Según el orden de abajo hacia arriba) ---
map.createPane('pane_11_superficie');     map.getPane('pane_11_superficie').style.zIndex = 310;
map.createPane('pane_10_usoSuelo');       map.getPane('pane_10_usoSuelo').style.zIndex = 320;
map.createPane('pane_09_ndvi');           map.getPane('pane_09_ndvi').style.zIndex = 330;
map.createPane('pane_08_lst');            map.getPane('pane_08_lst').style.zIndex = 340;
map.createPane('pane_07_departamentos');  map.getPane('pane_07_departamentos').style.zIndex = 400;
map.createPane('pane_06_municipios');     map.getPane('pane_06_municipios').style.zIndex = 410;
map.createPane('pane_05_distritos');      map.getPane('pane_05_distritos').style.zIndex = 420;
map.createPane('pane_cuerposAgua');       map.getPane('pane_cuerposAgua').style.zIndex = 425; // Ejemplo para Cuerpos de Agua
map.createPane('pane_04_deburga');        map.getPane('pane_04_deburga').style.zIndex = 430;
map.createPane('pane_03_construcciones'); map.getPane('pane_03_construcciones').style.zIndex = 440;
map.createPane('pane_02_rios');           map.getPane('pane_02_rios').style.zIndex = 450;
map.createPane('pane_01_carreteras');     map.getPane('pane_01_carreteras').style.zIndex = 460;

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

const geoServerUrl = 'http://localhost:8080/geoserver/ows';
const workspace = 'SGG';

// Estructura de datos obtenida del CSV "Poblacion.csv"
const divisionesAdministrativas = {
    "Ahuachapán": {
        municipios: {
            "Ahuachapán Centro": ["Ahuachapán", "Apaneca", "Concepción de Ataco", "Tacuba"],
            "Ahuachapán Norte": ["Atiquizaya", "El Refugio", "San Lorenzo", "Turín"],
            "Ahuachapán Sur": ["Guaymango", "Jujutla", "San Francisco Menéndez", "San Pedro Puxtla"]
        }
    },
    "Santa Ana": {
        municipios: {
            "Santa Ana Centro": ["Santa Ana"],
            "Santa Ana Este": ["Coatepeque", "El Congo"],
            "Santa Ana Norte": ["Masahuat", "Metapán", "Santa Rosa Guachipilín", "Texistepeque"],
            "Santa Ana Oeste": ["Candelaria de la Frontera", "Chalchuapa", "El Porvenir", "San Antonio Pajonal", "San Sebastián Salitrillo", "Santiago de la Frontera"]
        }
    },
    "La Libertad": {
        municipios: {
            "La Libertad Centro": ["Ciudad Arce", "San Juan Opico"],
            "La Libertad Costa": ["Chiltiupán", "Jicalapa", "La Libertad", "Tamanique", "Teotepeque"],
            "La Libertad Este": ["Antiguo Cuscatlán", "Huizúcar", "Nuevo Cuscatlán", "San José Villanueva", "Zaragoza"],
            "La Libertad Norte": ["Quezaltepeque", "San Matías", "San Pablo Tacachico"],
            "La Libertad Oeste": ["Colón", "Jayaque", "Sacacoyo", "Talnique", "Tepecoyo"],
            "La Libertad Sur": ["Comasagua", "Santa Tecla"]
        }
    },
    "San Salvador": {
        municipios: {
            "San Salvador Centro": ["Ayutuxtepeque", "Delgado", "Cuscatancingo", "Mejicanos", "San Salvador"],
            "San Salvador Este": ["Ilopango", "San Martín", "Soyapango", "Tonacatepeque"],
            "San Salvador Norte": ["Aguilares", "El Paisnal", "Guazapa"],
            "San Salvador Oeste": ["Apopa", "Nejapa"],
            "San Salvador Sur": ["Panchimalco", "Rosario de Mora", "San Marcos", "Santiago Texacuangos", "Santo Tomás"]
        }
    },
    "Usulután": {
        municipios: {
            "Usulután Este": ["California", "Concepción Batres", "Ereguayquín", "Jucuarán", "Ozatlán", "San Dionisio", "Santa Elena", "Santa María", "Tecapán", "Usulután"],
            "Usulután Norte": ["Alegría", "Berlín", "El Triunfo", "Estanzuelas", "Jucuapa", "Mercedes Umaña", "Nueva Granada", "San Buenaventura", "Santiago de María"],
            "Usulután Oeste": ["Jiquilisco", "Puerto El Triunfo", "San Agustín", "San Francisco Javier"]
        }
    },
    "San Miguel": {
        municipios: {
            "San Miguel Centro": ["Chirilagua", "Comacarán", "Moncagua", "Quelepa", "San Miguel", "Uluazapa"],
            "San Miguel Norte": ["Carolina", "Chapeltique", "Ciudad Barrios", "Nuevo Edén de San Juan", "San Antonio", "San Gerardo", "San Luis de la Reina", "Sesori"],
            "San Miguel Oeste": ["Chinameca", "El Tránsito", "Lolotique", "Nueva Guadalupe", "San Jorge", "San Rafael"]
        }
    }
};

const layers = {
    superficie: { name: `${workspace}:superficie`, layer: null, toggleId: 'toggleSuperficie', paneName: 'pane_11_superficie' },
    suelos: { name: `${workspace}:suelos`, layer: null, toggleId: 'toggleSuelos', paneName: 'pane_10_usoSuelo' },
    vegetacion: { name: `${workspace}:vegetacion`, layer: null, toggleId: 'toggleVegetacion', paneName: 'pane_09_ndvi' },
    temperatura: { name: `${workspace}:temperatura`, layer: null, toggleId: 'toggleTemperatura', paneName: 'pane_08_lst' },
    departamento: { name: `${workspace}:departamento`, layer: null, filterField: 'adm1_es', toggleId: 'toggleDepartamento', paneName: 'pane_07_departamentos' }, // selectId removido
    municipios: { name: `${workspace}:municipio`, layer: null, filterField: 'adm2_es', toggleId: 'toggleMunicipios', paneName: 'pane_06_municipios' }, // selectId removido
    distrito: { name: `${workspace}:distrito`, layer: null, filterField: 'adm3_es', toggleId: 'toggleDistrito', paneName: 'pane_05_distritos' }, // selectId removido
    cuerposAgua: { name: `${workspace}:cuerposAgua`, layer: null, toggleId: 'toggleCuerpos', paneName: 'pane_cuerposAgua' },
    deburga: { name: `${workspace}:deburga`, layer: null, filterField: 'class', toggleId: 'toggleDeburga', paneName: 'pane_04_deburga' }, // selectId global
    construcciones: { name: `${workspace}:construcciones`, layer: null, toggleId: 'toggleConstrucciones', paneName: 'pane_03_construcciones' },
    rios: { name: `${workspace}:rios`, layer: null, toggleId: 'toggleRios', paneName: 'pane_02_rios' },
    carreteras: { name: `${workspace}:carreteras`, layer: null, toggleId: 'toggleCarreteras', paneName: 'pane_01_carreteras' }
};

const legendContent = document.getElementById('legend-content');
const legendMap = {
    toggleDeburga: `${workspace}:deburga`, toggleRios: `${workspace}:rios`, toggleTemperatura: `${workspace}:temperatura`,
    toggleVegetacion: `${workspace}:vegetacion`, toggleSuelos: `${workspace}:suelos`, toggleCuerpos: `${workspace}:cuerposAgua`
};

const departamentoSelectGlobal = document.getElementById('departamentoSelectGlobal');
const municipioSelectGlobal = document.getElementById('municipioSelectGlobal');
const distritoSelectGlobal = document.getElementById('distritoSelectGlobal');
const deburgaSelectGlobal = document.getElementById('deburgaSelectGlobal');
const resetFiltersButton = document.getElementById('resetFiltersButton');

function updateLegend() { /* ... (Sin cambios desde la última versión completa) ... */ }
function manejarActivacionRaster() { /* ... (Sin cambios desde la última versión completa) ... */ }
function createWMSLayer(layerName, layerPane, filter = "INCLUDE") { /* ... (Sin cambios desde la última versión completa) ... */ }


// --- COMIENZO DE FUNCIONES DE FILTRADO EN CASCADA Y LÓGICA ASOCIADA ---
function populateMunicipioSelect(departamentoNombre) {
    municipioSelectGlobal.innerHTML = '<option value="">-- Seleccione Municipio --</option>';
    // Limpiar también distritos al cambiar departamento
    distritoSelectGlobal.innerHTML = '<option value="">-- Seleccione Distrito --</option>';
    distritoSelectGlobal.disabled = true;
    distritoSelectGlobal.classList.add('bg-gray-100', 'cursor-not-allowed', 'opacity-70');
    distritoSelectGlobal.classList.remove('bg-white');


    if (departamentoNombre && divisionesAdministrativas[departamentoNombre]) {
        const dataDepartamento = divisionesAdministrativas[departamentoNombre];
        if (dataDepartamento && dataDepartamento.municipios) {
            for (const municipioNombre in dataDepartamento.municipios) {
                const option = document.createElement('option');
                option.value = municipioNombre;
                option.textContent = municipioNombre;
                municipioSelectGlobal.appendChild(option);
            }
            municipioSelectGlobal.disabled = false;
            municipioSelectGlobal.classList.remove('bg-gray-100', 'cursor-not-allowed', 'opacity-70');
            municipioSelectGlobal.classList.add('bg-white');

        } else {
             municipioSelectGlobal.disabled = true;
             municipioSelectGlobal.classList.add('bg-gray-100', 'cursor-not-allowed', 'opacity-70');
             municipioSelectGlobal.classList.remove('bg-white');
        }
    } else {
        municipioSelectGlobal.disabled = true;
        municipioSelectGlobal.classList.add('bg-gray-100', 'cursor-not-allowed', 'opacity-70');
        municipioSelectGlobal.classList.remove('bg-white');
    }
}

function populateDistritoSelect(departamentoNombre, municipioNombre) {
    distritoSelectGlobal.innerHTML = '<option value="">-- Seleccione Distrito --</option>';
    if (departamentoNombre && municipioNombre &&
        divisionesAdministrativas[departamentoNombre] &&
        divisionesAdministrativas[departamentoNombre].municipios &&
        divisionesAdministrativas[departamentoNombre].municipios[municipioNombre]) {
        
        const distritos = divisionesAdministrativas[departamentoNombre].municipios[municipioNombre];
        distritos.forEach(distritoNombre => {
            const option = document.createElement('option');
            option.value = distritoNombre;
            option.textContent = distritoNombre;
            distritoSelectGlobal.appendChild(option);
        });
        distritoSelectGlobal.disabled = false;
        distritoSelectGlobal.classList.remove('bg-gray-100', 'cursor-not-allowed', 'opacity-70');
        distritoSelectGlobal.classList.add('bg-white');
    } else {
        distritoSelectGlobal.disabled = true;
        distritoSelectGlobal.classList.add('bg-gray-100', 'cursor-not-allowed', 'opacity-70');
        distritoSelectGlobal.classList.remove('bg-white');
    }
}

function applyGlobalFilters() {
    const depSelected = departamentoSelectGlobal.value;
    const munSelected = municipioSelectGlobal.value;
    const disSelected = distritoSelectGlobal.value;

    // Capa Departamento: solo se filtra por sí misma (adm1_es)
    let cqlFilterDepartamento = depSelected ? `adm1_es = '${depSelected}'` : "INCLUDE";
    if (layers.departamento.layer) {
        layers.departamento.layer.setParams({ CQL_FILTER: cqlFilterDepartamento, _refresh: Date.now() });
    }

    // Capa Municipios: se filtra por adm1_es (departamento) Y por adm2_es (municipio) si está seleccionado
    let cqlFilterMunicipio = "INCLUDE";
    if (depSelected) {
        cqlFilterMunicipio = `adm1_es = '${depSelected}'`;
        if (munSelected) { // Aplicar filtro de municipio SOLO si un departamento está seleccionado
            cqlFilterMunicipio += ` AND adm2_es = '${munSelected}'`;
        }
    }
    if (layers.municipios.layer) {
        layers.municipios.layer.setParams({ CQL_FILTER: cqlFilterMunicipio, _refresh: Date.now() });
    }

    // Capa Distritos: se filtra por adm1_es, adm2_es Y por adm3_es si está seleccionado
    let cqlFilterDistrito = "INCLUDE";
    if (depSelected) {
        cqlFilterDistrito = `adm1_es = '${depSelected}'`;
        if (munSelected) { // Aplicar filtro de municipio SOLO si un departamento está seleccionado
             cqlFilterDistrito += ` AND adm2_es = '${munSelected}'`;
            if (disSelected) { // Aplicar filtro de distrito SOLO si un municipio está seleccionado
                cqlFilterDistrito += ` AND adm3_es = '${disSelected}'`;
            }
        }
    }
     if (layers.distrito.layer) {
        layers.distrito.layer.setParams({ CQL_FILTER: cqlFilterDistrito, _refresh: Date.now() });
    }
}

if (departamentoSelectGlobal) {
    departamentoSelectGlobal.addEventListener('change', function() {
        populateMunicipioSelect(this.value);
        applyGlobalFilters();
    });
}

if (municipioSelectGlobal) {
    municipioSelectGlobal.addEventListener('change', function() {
        populateDistritoSelect(departamentoSelectGlobal.value, this.value);
        applyGlobalFilters();
    });
}

if (distritoSelectGlobal) {
    distritoSelectGlobal.addEventListener('change', function() {
        applyGlobalFilters();
    });
}

if (deburgaSelectGlobal && layers.deburga) { // Asegurarse que layers.deburga exista
    deburgaSelectGlobal.addEventListener('change', function() {
        const value = this.value;
        const filter = value ? `${layers.deburga.filterField} = '${value}'` : 'INCLUDE';
        if (layers.deburga.layer) {
            layers.deburga.layer.setParams({ CQL_FILTER: filter, _refresh: Date.now() });
        }
    });
}

if (resetFiltersButton) {
    resetFiltersButton.addEventListener('click', function() {
        departamentoSelectGlobal.value = "";
        municipioSelectGlobal.innerHTML = '<option value="">-- Seleccione Municipio --</option>';
        municipioSelectGlobal.disabled = true;
        municipioSelectGlobal.classList.add('bg-gray-100', 'cursor-not-allowed', 'opacity-70');
        municipioSelectGlobal.classList.remove('bg-white');

        distritoSelectGlobal.innerHTML = '<option value="">-- Seleccione Distrito --</option>';
        distritoSelectGlobal.disabled = true;
        distritoSelectGlobal.classList.add('bg-gray-100', 'cursor-not-allowed', 'opacity-70');
        distritoSelectGlobal.classList.remove('bg-white');
        
        if (deburgaSelectGlobal) deburgaSelectGlobal.value = "";

        ['departamento', 'municipios', 'distrito', 'deburga'].forEach(key => {
            if (layers[key] && layers[key].layer) {
                layers[key].layer.setParams({ CQL_FILTER: 'INCLUDE', _refresh: Date.now() });
            }
        });
        map.setView([13.6929, -89.2182], 9); // Resetear zoom
    });
}

function loadLayers() {
    for (const key in layers) {
        const obj = layers[key];
        if (!obj.name || !obj.paneName) {
            console.warn(`Capa '${key}' mal configurada (falta name o paneName)`);
            continue;
        }
        const initialFilter = "INCLUDE";
        obj.layer = createWMSLayer(obj.name, obj.paneName, initialFilter);

        if (obj.toggleId) {
            const toggle = document.getElementById(obj.toggleId);
            if (toggle) {
                const isSpecialRaster = ['temperatura', 'vegetacion', 'suelos'].includes(key);
                const isSuperficie = key === 'superficie';
                // Las capas administrativas y deburga se manejan por los filtros globales en términos de CQL_FILTER
                // Sus toggles solo afectan la visibilidad y la leyenda
                toggle.addEventListener('change', () => {
                    if (toggle.checked) {
                        if (obj.layer && !map.hasLayer(obj.layer)) map.addLayer(obj.layer);
                    } else {
                        if (obj.layer && map.hasLayer(obj.layer)) map.removeLayer(obj.layer);
                    }
                    // Solo actualizar leyenda si la capa está en legendMap
                    if (legendMap[obj.toggleId] || (isSpecialRaster || isSuperficie)) {
                         updateLegend();
                    }
                });
            } else {
                // console.warn(`Toggle ID '${obj.toggleId}' no encontrado para la capa '${key}'`);
            }
        }
    }
    applyGlobalFilters(); 
    updateLegend(); 
}
// --- FIN DE FUNCIONES DE FILTRADO EN CASCADA ---


// --- PEGAR AQUÍ LAS FUNCIONES SIN CAMBIOS (updateLegend, manejarActivacionRaster, createWMSLayer) ---
// (Asegúrate de que updateLegend, manejarActivacionRaster, createWMSLayer son las versiones completas y correctas de respuestas anteriores)
function updateLegend() {
    if (!legendContent) {
        console.error("Elemento #legend-content no encontrado.");
        return;
    }
    legendContent.innerHTML = '';
    let legendHasContent = false;
    for (const toggleId in legendMap) {
        const checkbox = document.getElementById(toggleId);
        if (checkbox && checkbox.checked) {
            legendHasContent = true;
            const layerName = legendMap[toggleId];
            const entry = document.createElement('div');
            const title = document.createElement('h3');
            let titleText = toggleId.replace('toggle', '');
            titleText = titleText.charAt(0).toUpperCase() + titleText.slice(1).replace(/([A-Z])/g, ' $1').trim();
            title.textContent = titleText;
            title.className = 'text-sm font-semibold text-gray-100 mb-1';
            const img = document.createElement('img');
            const legendUrl = `${geoServerUrl.replace('/ows', '')}/${workspace}/wms?REQUEST=GetLegendGraphic&VERSION=1.1.0&FORMAT=image/png&LAYER=${layerName}&STYLE=`;
            img.src = legendUrl;
            img.alt = `Leyenda ${layerName}`;
            img.className = 'max-w-full rounded bg-white p-1 border border-gray-400 shadow-sm';
            img.onload = function() { /* console.log(`Leyenda cargada para: ${layerName}`); */ }
            img.onerror = function() {
                console.error(`Error al cargar la leyenda para: ${layerName} desde ${legendUrl}`);
                const errorText = document.createElement('p');
                errorText.textContent = `Leyenda no disponible para ${titleText}.`;
                errorText.className = 'text-xs text-red-300 italic';
                if(img.parentNode) { img.parentNode.replaceChild(errorText, img); } 
                else { entry.appendChild(errorText); }
            };
            entry.appendChild(title);
            entry.appendChild(img);
            legendContent.appendChild(entry);
        }
    }
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
    const rasterTematicosCheckboxes = [temperatura, vegetacion, suelos].filter(chk => chk);

    let enProceso = false;

    function actualizarEstadoRaster(activadoCheckbox) {
        if (enProceso || !activadoCheckbox) return;
        enProceso = true;

        rasterTematicosCheckboxes.forEach(chk => {
            if (chk !== activadoCheckbox && chk.checked) {
                chk.checked = false;
                const layerKey = Object.keys(layers).find(k => layers[k].toggleId === chk.id);
                if (layerKey && layers[layerKey].layer && map.hasLayer(layers[layerKey].layer)) {
                    map.removeLayer(layers[layerKey].layer);
                }
            }
        });
        
        const activadoKey = Object.keys(layers).find(k => layers[k].toggleId === activadoCheckbox.id);
        if (activadoCheckbox.checked) {
            if (activadoKey && layers[activadoKey].layer && !map.hasLayer(layers[activadoKey].layer)) {
                map.addLayer(layers[activadoKey].layer);
            }
        } else {
             if (activadoKey && layers[activadoKey].layer && map.hasLayer(layers[activadoKey].layer)) {
                map.removeLayer(layers[activadoKey].layer);
            }
        }

        const algunaTematicaActiva = rasterTematicosCheckboxes.some(chk => chk.checked);
        if (superficie && superficie.checked !== algunaTematicaActiva) {
            superficie.checked = algunaTematicaActiva;
        }

        if (superficie) {
            if (superficie.checked) {
                if (layers.superficie.layer && !map.hasLayer(layers.superficie.layer)) {
                    map.addLayer(layers.superficie.layer);
                }
            } else {
                if (layers.superficie.layer && map.hasLayer(layers.superficie.layer)) {
                    map.removeLayer(layers.superficie.layer);
                }
            }
        }
        
        updateLegend();
        enProceso = false;
    }

    rasterTematicosCheckboxes.forEach(chk => {
        chk.addEventListener('change', () => actualizarEstadoRaster(chk));
    });

    if(superficie) {
        superficie.addEventListener('change', () => {
            if (superficie.checked) {
                if (layers.superficie.layer && !map.hasLayer(layers.superficie.layer)) {
                    map.addLayer(layers.superficie.layer);
                }
            } else {
                const algunaTematicaActiva = rasterTematicosCheckboxes.some(chk => chk.checked);
                if (algunaTematicaActiva) { 
                    superficie.checked = true; 
                     if (layers.superficie.layer && !map.hasLayer(layers.superficie.layer)) { //Asegurar que se añada si se re-marca
                        map.addLayer(layers.superficie.layer);
                    }
                } else {
                    if (layers.superficie.layer && map.hasLayer(layers.superficie.layer)) {
                        map.removeLayer(layers.superficie.layer);
                    }
                }
            }
            updateLegend();
        });
    }
}

function createWMSLayer(layerName, layerPane, filter = "INCLUDE") {
    return L.tileLayer.wms(geoServerUrl, {
        layers: layerName,
        format: 'image/png',
        transparent: true,
        version: '1.1.1',
        CQL_FILTER: filter,
        pane: layerPane
    });
}
// --- FIN DE FUNCIONES SIN CAMBIOS ---


// --- Ejecutar carga inicial ---
loadLayers(); // Carga capas y configura listeners de visibilidad básicos
manejarActivacionRaster(); // Configura listeners para lógica de capas raster
// Los listeners para los filtros globales ya están configurados arriba.