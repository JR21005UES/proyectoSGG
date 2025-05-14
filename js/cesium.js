// script_cesium.js

// --- Configuración del Token de Cesium Ion ---
// ¡¡¡REEMPLAZA ESTO CON TU TOKEN REAL!!!
Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI5ODliOTMxNi1lMzVjLTQ0ZjgtODM5MS0zZmM2ZWFjYTAzOGMiLCJpZCI6MzAxNTU3LCJpYXQiOjE3NDcxODA0NjV9.qhMYBHcGi3ZCFPhW3Oe3q78qFnoH3LZLNT7frePpBpQ';

async function initializeCesiumViewer() {
    let terrainProviderInstance;
    try {
        // Crear el proveedor de terreno mundial de Cesium Ion de forma asíncrona.
        // Este es el método correcto para versiones recientes de CesiumJS.
        console.log("Intentando crear el proveedor de terreno mundial...");
        terrainProviderInstance = await Cesium.createWorldTerrainAsync({
            requestWaterMask: true,     // Opcional: para efectos de agua
            requestVertexNormals: true  // Opcional: para iluminación del terreno
        });
        console.log("Proveedor de terreno creado exitosamente.");
    } catch (error) {
        console.error("Error al crear el proveedor de terreno:", error);
        // Si falla la creación del terreno, puedes optar por usar un terreno elipsoidal por defecto
        // o simplemente no asignar ningún terrainProvider, lo que resultará en un globo liso.
        // terrainProviderInstance = new Cesium.EllipsoidTerrainProvider(); // Ejemplo de fallback
        terrainProviderInstance = undefined; // O dejarlo indefinido para un globo liso si hay error.
        alert("Error al cargar el terreno mundial. El globo podría aparecer liso. Revisa la consola para más detalles y asegúrate de que tu token de Cesium Ion sea válido y tenga permisos para 'assets:read'.");
    }

    // Inicializar el visor de CesiumJS
    try {
        const viewer = new Cesium.Viewer('cesiumContainer', {
            terrainProvider: terrainProviderInstance, // Asignar la instancia de terreno creada

            // Opciones adicionales del visor:
            animation: false,
            timeline: false,
            // geocoder: true, // Descomenta si quieres el geocodificador (usa Cesium Ion)
            homeButton: true,
            sceneModePicker: true,
            baseLayerPicker: true, // Permite elegir entre varias capas base (algunas de Cesium Ion)
            navigationHelpButton: false,
            infoBox: false,
            // Si no especificas un imageryProvider, Cesium Ion intentará cargar uno por defecto
            // (usualmente Bing Maps Aerial), lo cual también requiere un token válido.
        });

        console.log("Visor de CesiumJS inicializado.");

        // Establecer una vista inicial (por ejemplo, El Salvador)
        viewer.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(-89.2182, 13.6929, 700000), // Longitud, Latitud, Altura en metros
            orientation: {
                heading: Cesium.Math.toRadians(0.0),
                pitch: Cesium.Math.toRadians(-50.0), // Mirando hacia abajo
                roll: 0.0
            }
        });

    } catch (viewerError) {
        console.error("Error al inicializar el Cesium.Viewer:", viewerError);
        alert("Error crítico al inicializar el visor de Cesium. Revisa la consola.");
    }
}

// Llamar a la función principal para iniciar la aplicación Cesium
initializeCesiumViewer().catch(error => {
    // Captura cualquier error no manejado en la cadena de promesas de initializeCesiumViewer
    console.error("Error no manejado en la inicialización principal de Cesium:", error);
    alert("Ocurrió un error inesperado durante la inicialización. Revisa la consola.");
});