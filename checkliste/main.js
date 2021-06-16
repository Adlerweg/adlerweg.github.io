let baselayers = {
    terrain: L.tileLayer.provider("BasemapAT.terrain"),
    highdpi: L.tileLayer.provider("BasemapAT.highdpi"),
    openstreet: L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"),
};

// Overlays für die Themen zum Ein- und Ausschalten definieren
let overlays = {
    routes: L.featureGroup(),
    stations: L.markerClusterGroup(), //LEAFLET MARKERCLUSTER
};

// KARTE INITIALISIERT + ZOOM CENTER + FULLSCREEN
let map = L.map("map", {
    center: [47.267222, 11.392778],
    zoom: 9,
    fullscreenControl: true, //LEAFLET FULLSCREEN
    layers: [
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png")
    ]
})

// OVERLAY: + KARTEN & DATEN
let layerControl = L.control.layers({
    "OpenStreetMap": baselayers.openstreet,
    "STANDARD (basemap.at)": baselayers.highdpi,
    "RELIEF (basemap.at)": baselayers.terrain,
}, {
    "Routen": overlays.routes,
    "Wetterstationen": overlays.stations,
}).addTo(map);

//LEAFLET SCALEBAR
L.control.scale({
    imperial: false,
    maxWidth: 400,
}).addTo(map);

//LEAFLET RAINVIEWER
L.control.rainviewer({
    position: 'topleft',
    nextButtonText: '>',
    playStopButtonText: 'Start/Stop',
    prevButtonText: '<',
    positionSliderLabelText: "Uhrzeit:",
    opacitySliderLabelText: "Deckkraft:",
    animationInterval: 450,
    opacity: 0.7,
}, {
    collapsed: false // funktioniert leider hier nicht
}).addTo(map);

// DATEN ANZEIGEN FIX
overlays.routes.addTo(map);
overlays.stations.addTo(map);


///////////////////////////////////////////////////////////////////////
//WETTERSTATIONEN MARKER//
let awsURL = 'https://wiski.tirol.gv.at/lawine/produkte/ogd.geojson';

fetch(awsURL)
    .then(response => response.json())
    .then(json => {
        //console.log('Daten konvertiert: ', json);
        for (station of json.features) {
            //console.log('Station: ', station);
            let marker = L.marker([
                station.geometry.coordinates[1],
                station.geometry.coordinates[0]
            ]);
            let formattedDate = new Date(station.properties.date);
            marker.bindPopup(`
                <h3>${station.properties.name}</h3>
                     <ul>
                <li>Datum: ${formattedDate.toLocaleString("de")}</li>
                <li>Seehöhe: ${station.geometry.coordinates[2] ||'?'} m.ü.A.</li>
                <li>Temperatur: ${station.properties.LT ||'?'} °C</li>
                <li>Luftfeuchtigkeit: ${station.properties.RH ||'?'} %</li>
                <li>Schneehöhe: ${station.properties.HS ||'?'} cm</li>
                <li>Windgeschwindigkeit: ${station.properties.WG ||'?'} km/h</li>
             </ul>
            `);
            marker.addTo(overlays.stations);
        }
    });