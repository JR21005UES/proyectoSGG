// js/script_cesium.js

// --- Configuración del Token de Cesium Ion ---
Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI5ODliOTMxNi1lMzVjLTQ0ZjgtODM5MS0zZmM2ZWFjYTAzOGMiLCJpZCI6MzAxNTU3LCJpYXQiOjE3NDcxODA0NjV9.qhMYBHcGi3ZCFPhW3Oe3q78qFnoH3LZLNT7frePpBpQ'; // ¡¡¡REEMPLAZA CON TU TOKEN!!!

// --- Constantes Globales ---
const geoServerWorkspace = 'SGG'; // Tu workspace de GeoServer
const geoServerWmsUrl = `http://localhost:8080/geoserver/${geoServerWorkspace}/wms`; // URL para WMS
// const geoServerOwsUrl = 'http://localhost:8080/geoserver/ows'; // Si necesitas la base OWS para algo más
// const geoServerWfsUrl = `http://localhost:8080/geoserver/${geoServerWorkspace}/ows`; // Para WFS

const divisionesAdministrativas = { // Tu estructura de divisiones
    "Ahuachapán": { municipios: { "Ahuachapán Centro": ["Ahuachapán", "Apaneca", "Concepción de Ataco", "Tacuba"], "Ahuachapán Norte": ["Atiquizaya", "El Refugio", "San Lorenzo", "Turín"], "Ahuachapán Sur": ["Guaymango", "Jujutla", "San Francisco Menéndez", "San Pedro Puxtla"]}},
    "Santa Ana": { municipios: { "Santa Ana Centro": ["Santa Ana"], "Santa Ana Este": ["Coatepeque", "El Congo"], "Santa Ana Norte": ["Masahuat", "Metapán", "Santa Rosa Guachipilín", "Texistepeque"], "Santa Ana Oeste": ["Candelaria de la Frontera", "Chalchuapa", "El Porvenir", "San Antonio Pajonal", "San Sebastián Salitrillo", "Santiago de la Frontera"]}},
    "La Libertad": { municipios: { "La Libertad Centro": ["Ciudad Arce", "San Juan Opico"], "La Libertad Costa": ["Chiltiupán", "Jicalapa", "La Libertad", "Tamanique", "Teotepeque"], "La Libertad Este": ["Antiguo Cuscatlán", "Huizúcar", "Nuevo Cuscatlán", "San José Villanueva", "Zaragoza"], "La Libertad Norte": ["Quezaltepeque", "San Matías", "San Pablo Tacachico"], "La Libertad Oeste": ["Colón", "Jayaque", "Sacacoyo", "Talnique", "Tepecoyo"], "La Libertad Sur": ["Comasagua", "Santa Tecla"]}},
    "San Salvador": { municipios: { "San Salvador Centro": ["Ayutuxtepeque", "Delgado", "Cuscatancingo", "Mejicanos", "San Salvador"], "San Salvador Este": ["Ilopango", "San Martín", "Soyapango", "Tonacatepeque"], "San Salvador Norte": ["Aguilares", "El Paisnal", "Guazapa"], "San Salvador Oeste": ["Apopa", "Nejapa"], "San Salvador Sur": ["Panchimalco", "Rosario de Mora", "San Marcos", "Santiago Texacuangos", "Santo Tomás"]}},
    "Usulután": { municipios: { "Usulután Este": ["California", "Concepción Batres", "Ereguayquín", "Jucuarán", "Ozatlán", "San Dionisio", "Santa Elena", "Santa María", "Tecapán", "Usulután"], "Usulután Norte": ["Alegría", "Berlín", "El Triunfo", "Estanzuelas", "Jucuapa", "Mercedes Umaña", "Nueva Granada", "San Buenaventura", "Santiago de María"], "Usulután Oeste": ["Jiquilisco", "Puerto El Triunfo", "San Agustín", "San Francisco Javier"]}},
    "San Miguel": { municipios: { "San Miguel Centro": ["Chirilagua", "Comacarán", "Moncagua", "Quelepa", "San Miguel", "Uluazapa"], "San Miguel Norte": ["Carolina", "Chapeltique", "Ciudad Barrios", "Nuevo Edén de San Juan", "San Antonio", "San Gerardo", "San Luis de la Reina", "Sesori"], "San Miguel Oeste": ["Chinameca", "El Tránsito", "Lolotique", "Nueva Guadalupe", "San Jorge", "San Rafael"]}}
};

// Referencias a Elementos del DOM
const departamentoSelectGlobal = document.getElementById('departamentoSelectGlobal');
const municipioSelectGlobal = document.getElementById('municipioSelectGlobal');
const distritoSelectGlobal = document.getElementById('distritoSelectGlobal');
const deburgaSelectGlobal = document.getElementById('deburgaSelectGlobal');
const resetFiltersButton = document.getElementById('resetFiltersButton');
const legendContentElement = document.getElementById('legend-content');
const legendPanelElement = document.getElementById('legend-panel');

// --- Definición de Capas para CesiumJS ---
// Usaremos los nombres de capa de tu GeoServer (ej. SGG:Uso de Suelo)
// Almacenaremos la instancia de Cesium.ImageryLayer y el filtro CQL actual.
const cesiumLayersConfig = {
    superficie:    { name: `${geoServerWorkspace}:superficie`,    title: 'Superficie',       imageryLayer: null, toggleId: 'toggleSuperficie',   currentFilter: "INCLUDE", type: 'raster' },
    suelos:        { name: `${geoServerWorkspace}:Uso de Suelo`,  title: 'Uso de Suelo',     imageryLayer: null, toggleId: 'toggleSuelos',       currentFilter: "INCLUDE", type: 'raster', legend: true }, // SGG:Uso de Suelo según tu captura
    vegetacion:    { name: `${geoServerWorkspace}:vegetacion`,    title: 'Vegetación (NDVI)',imageryLayer: null, toggleId: 'toggleVegetacion',   currentFilter: "INCLUDE", type: 'raster', legend: true },
    temperatura:   { name: `${geoServerWorkspace}:temperatura`,   title: 'Temperatura (LST)',imageryLayer: null, toggleId: 'toggleTemperatura',  currentFilter: "INCLUDE", type: 'raster', legend: true },
    departamento:  { name: `${geoServerWorkspace}:departamento`,  title: 'Departamentos',    imageryLayer: null, toggleId: 'toggleDepartamento', filterField: 'adm1_es', currentFilter: "INCLUDE", type: 'vector' },
    municipios:    { name: `${geoServerWorkspace}:municipio`,     title: 'Municipios',       imageryLayer: null, toggleId: 'toggleMunicipios',   filterField: 'adm2_es', currentFilter: "INCLUDE", type: 'vector' },
    distrito:      { name: `${geoServerWorkspace}:distrito`,      title: 'Distritos',        imageryLayer: null, toggleId: 'toggleDistrito',     filterField: 'adm3_es', currentFilter: "INCLUDE", type: 'vector' },
    cuerposAgua:   { name: `${geoServerWorkspace}:cuerposAgua`,   title: 'Cuerpos de Agua',  imageryLayer: null, toggleId: 'toggleCuerpos',      currentFilter: "INCLUDE", type: 'vector', legend: true },
    deburga:       { name: `${geoServerWorkspace}:deburga`,       title: 'DEGURBA',          imageryLayer: null, toggleId: 'toggleDeburga',      filterField: 'class',   currentFilter: "INCLUDE", type: 'vector', legend: true },
    construcciones:{ name: `${geoServerWorkspace}:construcciones`,title: 'Construcciones',   imageryLayer: null, toggleId: 'toggleConstrucciones',currentFilter: "INCLUDE", type: 'vector' },
    rios:          { name: `${geoServerWorkspace}:rios`,          title: 'Ríos',             imageryLayer: null, toggleId: 'toggleRios',         currentFilter: "INCLUDE", type: 'vector', legend: true },
    carreteras:    { name: `${geoServerWorkspace}:carreteras`,    title: 'Carreteras',       imageryLayer: null, toggleId: 'toggleCarreteras',   currentFilter: "INCLUDE", type: 'vector' }
};
// Mapeo para la leyenda (basado en toggleId para simplificar)
const legendMap = {};
for (const key in cesiumLayersConfig) {
    if (cesiumLayersConfig[key].legend) {
        legendMap[cesiumLayersConfig[key].toggleId] = cesiumLayersConfig[key].name;
    }
}

let viewer; // Variable global para el visor de Cesium

// --- Funciones Principales de Cesium y Lógica de la Aplicación ---

async function initializeCesiumApp() {
    let terrainProviderInstance;
    try {
        terrainProviderInstance = await Cesium.createWorldTerrainAsync({
            requestWaterMask: true,
            requestVertexNormals: true
        });
    } catch (error) {
        console.error("Error al crear el proveedor de terreno:", error);
        alert("Error al cargar el terreno mundial. Verifique su token de Cesium Ion y la conexión a internet.");
        terrainProviderInstance = undefined;
    }

    try {
        viewer = new Cesium.Viewer('cesiumContainer', {
            terrainProvider: terrainProviderInstance,
            animation: false,
            timeline: false,
            homeButton: true,
            sceneModePicker: true,
            baseLayerPicker: true,
            geocoder: false, // Puedes habilitarlo si lo deseas
            navigationHelpButton: false,
            infoBox: true, // Habilitar InfoBox para GetFeatureInfo en WMS
            // selectionIndicator: true // Muestra un indicador visual al seleccionar
        });
        console.log("Visor de CesiumJS inicializado.");

        viewer.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(-89.2182, 13.6929, 400000), // El Salvador
            orientation: { heading: Cesium.Math.toRadians(0.0), pitch: Cesium.Math.toRadians(-45.0), roll: 0.0 }
        });

        // Habilitar GetFeatureInfo para WMS
        // CesiumJS maneja esto automáticamente si 'enablePickFeatures: true' está en el WMS provider
        // y el InfoBox está visible.

    } catch (viewerError) {
        console.error("Error al inicializar el Cesium.Viewer:", viewerError);
        alert("Error crítico al inicializar el visor de Cesium. Revisa la consola.");
        return; // Salir si el visor no se puede crear
    }

    // Configurar listeners de UI y carga inicial de capas (si alguna está pre-marcada)
    setupEventListeners();
    applyInitialLayerVisibility(); // Carga las capas que estén marcadas al inicio
    updateLegend(); // Actualiza la leyenda por si hay capas visibles
}

/**
 * Crea y devuelve un ImageryProvider de WMS para Cesium.
 */
function createWMSImageryProvider(layerName, cqlFilter = "INCLUDE") {
    return new Cesium.WebMapServiceImageryProvider({
        url: geoServerWmsUrl,
        layers: layerName,
        parameters: {
            transparent: true,
            format: 'image/png',
            CQL_FILTER: cqlFilter,
            VERSION: '1.1.1', // O 1.3.0 si prefieres
            // STYLES: '', // Puedes especificar estilos aquí si los tienes en GeoServer
            // TILED: true, // Considera usarlo para mejor rendimiento con GeoServer
        },
        enablePickFeatures: true // Importante para GetFeatureInfo
    });
}

/**
 * Actualiza (añade/remueve/re-filtra) una capa WMS en el visor.
 */
function refreshCesiumWMSLayer(layerKey, isVisible, newCqlFilter) {
    const layerConfig = cesiumLayersConfig[layerKey];
    if (!layerConfig) return;

    if (layerConfig.imageryLayer) {
        viewer.imageryLayers.remove(layerConfig.imageryLayer, true); // true para destruir el proveedor
        layerConfig.imageryLayer = null;
    }

    if (newCqlFilter !== undefined) {
        layerConfig.currentFilter = newCqlFilter;
    }

    if (isVisible) {
        const provider = createWMSImageryProvider(layerConfig.name, layerConfig.currentFilter);
        layerConfig.imageryLayer = viewer.imageryLayers.addImageryProvider(provider);

        // Ajustar orden si es necesario (ejemplo básico, el último añadido está encima)
        // Si tienes un orden específico, necesitarías lógica adicional aquí.
        // viewer.imageryLayers.raiseToTop(layerConfig.imageryLayer);
    }
}

/**
 * Configura los event listeners para los controles de la UI.
 */
function setupEventListeners() {
    // Listeners para los checkboxes de las capas
    for (const key in cesiumLayersConfig) {
        const config = cesiumLayersConfig[key];
        const toggle = document.getElementById(config.toggleId);
        if (toggle) {
            toggle.addEventListener('change', (event) => {
                refreshCesiumWMSLayer(key, event.target.checked);
                if (config.type === 'raster' || config.legend) { // Actualizar leyenda si es raster o tiene leyenda definida
                     // La función manejarActivacionRaster se encargará de la lógica de exclusividad de los rásters temáticos
                    if (config.type === 'raster' && ['temperatura', 'vegetacion', 'suelos'].includes(key)) {
                         manejarActivacionRaster(key, event.target.checked);
                    } else {
                        updateLegend();
                    }
                }
                 // Si es una capa base raster como 'superficie', su visibilidad puede depender de otras
                if (key === 'superficie' && config.type === 'raster') {
                    const algunaTematicaActiva = ['temperatura', 'vegetacion', 'suelos'].some(k => {
                        const chk = document.getElementById(cesiumLayersConfig[k]?.toggleId);
                        return chk && chk.checked;
                    });
                    if (!event.target.checked && algunaTematicaActiva) {
                        // Si se desmarca 'superficie' pero hay una temática activa, forzar 'superficie' a activo.
                        // Esto es un poco complejo, la lógica de manejarActivacionRaster debe ser robusta.
                        // Por ahora, solo actualizamos leyenda. La lógica de dependencia se hará en manejarActivacionRaster.
                    }
                }
            });
        }
    }

    // Listeners para los selectores de filtro
    if (departamentoSelectGlobal) {
        departamentoSelectGlobal.addEventListener('change', function() {
            populateMunicipioSelect(this.value);
            applyAllFilters();
        });
    }
    if (municipioSelectGlobal) {
        municipioSelectGlobal.addEventListener('change', function() {
            populateDistritoSelect(departamentoSelectGlobal.value, this.value);
            applyAllFilters();
        });
    }
    if (distritoSelectGlobal) {
        distritoSelectGlobal.addEventListener('change', applyAllFilters);
    }
    if (deburgaSelectGlobal) {
        deburgaSelectGlobal.addEventListener('change', applyAllFilters);
    }
    if (resetFiltersButton) {
        resetFiltersButton.addEventListener('click', resetAllFilters);
    }
}

/**
 * Aplica la visibilidad inicial de las capas basada en los checkboxes.
 */
function applyInitialLayerVisibility() {
    for (const key in cesiumLayersConfig) {
        const config = cesiumLayersConfig[key];
        const toggle = document.getElementById(config.toggleId);
        if (toggle && toggle.checked) {
            refreshCesiumWMSLayer(key, true);
        }
    }
    manejarActivacionRaster(null, false); // Ejecutar una vez para establecer estado inicial de rasters
}

// --- Funciones de Filtro (adaptadas de tu script original) ---
function populateMunicipioSelect(departamentoNombre) {
    municipioSelectGlobal.innerHTML = '<option value="">-- Seleccione --</option>';
    distritoSelectGlobal.innerHTML = '<option value="">-- Seleccione --</option>';
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
        }
    } else {
        municipioSelectGlobal.disabled = true;
        municipioSelectGlobal.classList.add('bg-gray-100', 'cursor-not-allowed', 'opacity-70');
    }
}

function populateDistritoSelect(departamentoNombre, municipioNombre) {
    distritoSelectGlobal.innerHTML = '<option value="">-- Seleccione --</option>';
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
    }
}

function applyAllFilters() {
    const depSelected = departamentoSelectGlobal.value;
    const munSelected = municipioSelectGlobal.value;
    const disSelected = distritoSelectGlobal.value;
    const debSelected = deburgaSelectGlobal.value;

    // Filtro para Departamento
    if (cesiumLayersConfig.departamento) {
        const cqlDep = depSelected ? `${cesiumLayersConfig.departamento.filterField} = '${depSelected}'` : "INCLUDE";
        const chkDep = document.getElementById(cesiumLayersConfig.departamento.toggleId);
        refreshCesiumWMSLayer('departamento', chkDep ? chkDep.checked : false, cqlDep);
    }

    // Filtro para Municipios
    if (cesiumLayersConfig.municipios) {
        let cqlMun = "INCLUDE";
        if (depSelected) {
            cqlMun = `${cesiumLayersConfig.municipios.filterField} LIKE '${depSelected}%'`; // Asumiendo que adm2_es empieza con el depto o similar
                                                                                           // O si el campo es solo el nombre del municipio:
            cqlMun = `adm1_es = '${depSelected}'`; // Necesitas un campo de departamento en la capa municipio
            if (munSelected) {
                cqlMun += ` AND ${cesiumLayersConfig.municipios.filterField} = '${munSelected}'`;
            }
        }
        const chkMun = document.getElementById(cesiumLayersConfig.municipios.toggleId);
        refreshCesiumWMSLayer('municipios', chkMun ? chkMun.checked : false, cqlMun);
    }
    
    // Filtro para Distritos
    if (cesiumLayersConfig.distrito) {
        let cqlDis = "INCLUDE";
        if (depSelected) { // Asumiendo estructura jerárquica en los datos o campos adecuados
            cqlDis = `adm1_es = '${depSelected}'`;
            if (munSelected) {
                cqlDis += ` AND adm2_es = '${munSelected}'`;
                if (disSelected) {
                    cqlDis += ` AND ${cesiumLayersConfig.distrito.filterField} = '${disSelected}'`;
                }
            }
        }
        const chkDis = document.getElementById(cesiumLayersConfig.distrito.toggleId);
        refreshCesiumWMSLayer('distrito', chkDis ? chkDis.checked : false, cqlDis);
    }

    // Filtro para Deburga
    if (cesiumLayersConfig.deburga) {
        const cqlDeb = debSelected ? `${cesiumLayersConfig.deburga.filterField} = '${debSelected}'` : "INCLUDE";
        const chkDeb = document.getElementById(cesiumLayersConfig.deburga.toggleId);
        refreshCesiumWMSLayer('deburga', chkDeb ? chkDeb.checked : false, cqlDeb);
    }
    updateLegend(); // Actualizar leyenda después de aplicar filtros
}

function resetAllFilters() {
    if (departamentoSelectGlobal) departamentoSelectGlobal.value = "";
    populateMunicipioSelect(""); // Esto también limpia y deshabilita distritos
    if (deburgaSelectGlobal) deburgaSelectGlobal.value = "";

    ['departamento', 'municipios', 'distrito', 'deburga'].forEach(key => {
        if (cesiumLayersConfig[key]) {
            const chk = document.getElementById(cesiumLayersConfig[key].toggleId);
            refreshCesiumWMSLayer(key, chk ? chk.checked : false, "INCLUDE");
        }
    });

    // Considerar si se debe hacer zoom a la vista inicial de El Salvador
    viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(-89.2182, 13.6929, 400000),
        orientation: { heading: Cesium.Math.toRadians(0.0), pitch: Cesium.Math.toRadians(-45.0), roll: 0.0 }
    });
    updateLegend();
}


// --- Lógica de Leyenda ---
function updateLegend() {
    if (!legendContentElement || !legendPanelElement) return;
    legendContentElement.innerHTML = '';
    let legendHasContent = false;

    for (const toggleId in legendMap) {
        const checkbox = document.getElementById(toggleId);
        if (checkbox && checkbox.checked) {
            legendHasContent = true;
            const layerName = legendMap[toggleId]; // Nombre completo de la capa: SGG:nombre
            const layerConfigKey = Object.keys(cesiumLayersConfig).find(k => cesiumLayersConfig[k].toggleId === toggleId);
            const layerTitle = layerConfigKey ? cesiumLayersConfig[layerConfigKey].title : toggleId.replace('toggle','');


            const entry = document.createElement('div');
            const titleEl = document.createElement('h3');
            titleEl.textContent = layerTitle;
            titleEl.className = 'text-sm font-semibold text-gray-100 mb-1';
            
            const img = document.createElement('img');
            // Asegurar que la URL base para GetLegendGraphic es correcta
            // geoServerWmsUrl ya incluye el workspace, así que no es necesario añadirlo de nuevo
            const legendUrl = `${geoServerWmsUrl}?REQUEST=GetLegendGraphic&VERSION=1.1.0&FORMAT=image/png&LAYER=${layerName}&STYLE=`;
            
            img.src = legendUrl;
            img.alt = `Leyenda ${layerTitle}`;
            img.className = 'max-w-full rounded bg-white p-1 border border-gray-400 shadow-sm';
            img.onerror = function() {
                console.error(`Error al cargar la leyenda para: ${layerName} desde ${legendUrl}`);
                const errorText = document.createElement('p');
                errorText.textContent = `Leyenda no disponible para ${layerTitle}.`;
                errorText.className = 'text-xs text-red-300 italic';
                if(img.parentNode) { img.parentNode.replaceChild(errorText, img); } 
                else { entry.appendChild(errorText); }
            };
            entry.appendChild(titleEl);
            entry.appendChild(img);
            legendContentElement.appendChild(entry);
        }
    }
    legendPanelElement.style.display = legendHasContent ? 'block' : 'none';
}

// --- Lógica para manejo de capas Raster Temáticas ---
let activeRasterLayerKey = null; // Para rastrear la capa raster temática activa
const thematicRasterKeys = ['temperatura', 'vegetacion', 'suelos'];

function manejarActivacionRaster(changedLayerKey, isChecked) {
    const superficieChk = document.getElementById(cesiumLayersConfig.superficie.toggleId);

    if (changedLayerKey && thematicRasterKeys.includes(changedLayerKey)) {
        if (isChecked) {
            // Si se activa una capa temática, desactivar otras temáticas
            thematicRasterKeys.forEach(key => {
                if (key !== changedLayerKey) {
                    const chk = document.getElementById(cesiumLayersConfig[key].toggleId);
                    if (chk && chk.checked) {
                        chk.checked = false;
                        refreshCesiumWMSLayer(key, false);
                    }
                }
            });
            activeRasterLayerKey = changedLayerKey;
            // Activar 'superficie' si no está activa
            if (superficieChk && !superficieChk.checked) {
                superficieChk.checked = true;
                refreshCesiumWMSLayer('superficie', true);
            }
        } else { // Si se desactiva la capa temática que estaba activa
            if (activeRasterLayerKey === changedLayerKey) {
                activeRasterLayerKey = null;
                // Si no hay otra temática activa, desactivar 'superficie'
                const algunaOtraTematicaActiva = thematicRasterKeys.some(key => {
                    const chk = document.getElementById(cesiumLayersConfig[key].toggleId);
                    return chk && chk.checked;
                });
                if (!algunaOtraTematicaActiva && superficieChk && superficieChk.checked) {
                    superficieChk.checked = false;
                    refreshCesiumWMSLayer('superficie', false);
                }
            }
        }
    } else if (changedLayerKey === 'superficie') {
        // Si se intenta desactivar 'superficie' mientras una temática está activa, prevenirlo
        if (!isChecked && activeRasterLayerKey) {
            if (superficieChk) superficieChk.checked = true; // Forzar a que siga activa
            // No es necesario llamar a refreshCesiumWMSLayer para superficie porque no cambió su estado real.
            alert("La capa 'Superficie' es necesaria mientras una capa ráster temática (Temperatura, Vegetación, Uso de Suelo) esté activa.");
        }
    }
    updateLegend();
}


// --- Inicialización de la aplicación ---
document.addEventListener('DOMContentLoaded', initializeCesiumApp);