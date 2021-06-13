let baselayers = {
    terrain: L.tileLayer.provider("BasemapAT.terrain"),
    highdpi: L.tileLayer.provider("BasemapAT.highdpi"),
    openstreet: L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"),
    
};

// Overlays für die Themen zum Ein- und Ausschalten definieren
let overlays = {
    routes: L.featureGroup(),
    stations: L.featureGroup(),
};

// KARTE INITIALISIERT + ZOOM CENTER
let map = L.map("map", {
    center: [47.267222, 11.392778],
    zoom: 5.4,
    fullscreenControl: true, //leaflet fullscreen
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
    //"Wetterstationen": overlays.stations,
}).addTo(map);

//LEAFLET SCALEBAR
L.control.scale({
    imperial: false,
    maxWidth: 400,
}).addTo(map);

var marker = L.marker([ 47.267222,11.392778], {
}).addTo(map).bindPopup("<h1>Adlerweg - Hard Facts</h1> <p>Der Adlerweg Rundgang befindet sich in Tirol und führt quer durch das wunderschöne Bundesland.</p> <br> <ul> <li>33 Etappen</li><br><li>413 km</li><br><li>31.000 hm</li><br><li>24 Tagesetappen in Nordtirol</li><br><li>9 Tagesetappen in der Glockner- und Venedigergruppe</li>");


    

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

// funktion für eigene route, aber als funktion damit man hier jede andere route auch eingeben kann
const drawTrack = (nr) => {
    //console.log('Track: ', nr);
    elevationControl.clear(); //löscht das gemalte davor
    overlays.routes.clearLayers();
    let gpxTrack = new L.GPX(`routes/${nr}.gpx`, { // L.GPX hinzufügen
        async: true, //lässt datei fertig laden
        marker_options: { //anfangs und endmarker wie bei L.GPX gefordert hinzufügen
            startIconUrl: `icons/number_${nr}.png`,
            endIconUrl: 'icons/finish.png',
            shadowUrl: null,
        },
        polyline_options: {
            color: 'black',
            dashArray: [2, 5],
        },
    }).addTo(overlays.routes);
    //sobald gpx geladen ist + abgefangen und immer auf geladenen track zoomen in die mitte
    gpxTrack.on("loaded", () => {
        console.log('loaded gpx');
        map.fitBounds(gpxTrack.getBounds());
        console.log('Track name: ', gpxTrack.get_name());
        gpxTrack.bindPopup(`
        <h3>${gpxTrack.get_name()}</h3>
        <ul>
            <li>Streckenlänge: ${Math.round(gpxTrack.get_distance())/1000-0.003} km</li>
            <li>tiefster Punkt: ${Math.round(gpxTrack.get_elevation_min())} m</li>
            <li>höchster Punkt: ${Math.round(gpxTrack.get_elevation_max())} m</li>
            <li>Höhenmeter bergauf: ${Math.round(gpxTrack.get_elevation_gain())} m</li>
            <li>Höhenmeter bergab: ${Math.round(gpxTrack.get_elevation_loss())} m</li>
        </ul>
        `);
    });
    elevationControl.load(`routes/${nr}.gpx`);
};

const selectedTrack = 1;
drawTrack(selectedTrack);


//console.log('biketirol json: ', BIKETIROL);
let pulldown = document.querySelector("#pulldown");
//console.log('Pulldown: ', pulldown);
let selected = '';
for (let track of BIKETIROL) {
    if (selectedTrack == track.nr) {
        selected = 'selected';
    } else {
        selected = '';
    }
    pulldown.innerHTML += `<option ${selected} value="${track.nr}">${track.nr}: ${track.etappe}</option>`;
}

pulldown.onchange = () => {
    //console.log('changed!!!!!', pulldown.value);
    drawTrack(pulldown.value);
};

//var marker = L.marker([ 47.267222,11.392778]).addTo(map);
