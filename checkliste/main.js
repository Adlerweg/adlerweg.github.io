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
    zoom: 9,
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
//overlays.stations.addTo(map);


////////////////////////////////////////////test wetter

let awsURL = 'https://wiski.tirol.gv.at/lawine/produkte/ogd.geojson'; //haben die url mit den daten zu den wetterstationen in variabel awsURL gesopeichert

fetch(awsURL) //daten herunterladen von der datagvat bib
    .then(response => response.json()) //konvertieren in json (fehleranfällig daher nächste then clause)
    .then(json => { //weiterarbeiten mit json
        //console.log('Daten konvertiert: ', json);
        for (station of json.features) {
            //console.log('Station: ', station);
            let marker = L.marker([
                station.geometry.coordinates[1],
                station.geometry.coordinates[0]
            ]);

            let formattedDate = new Date(station.properties.date); //neues datumsobjekt erstellen, in Zeile 58 wird darauf zurückgegriffen, de als ländereinstellung 

            marker.bindPopup(`
                <h3>${station.properties.name}</h3>
                     <ul>
                <li>Datum: ${formattedDate.toLocaleString("de")}</li>
                <li>Seehöhe: ${station.geometry.coordinates[2] ||'?'} m.ü.A.</li>
                <li>Temperatur: ${station.properties.LT ||'?'} °C</li>
                <li>Luftfeuchtigkeit: ${station.properties.RH ||'?'} %</li>
                <li>Schneehöhe: ${station.properties.HS ||'?'} cm</li>
                <li>Windgeschwindigkeit: ${station.properties.WG ||'?'} km/h</li>
                <li>Windrichtung: ${station.properties.WR ||'?'} °</li>
             </ul>
            `);
            marker.addTo(overlays.stations);
        }
    });

//########################################################################################
// warten auf johannas einbindung der json ROUTEN des adlerwegs...wenn erledigt:
// ROUTEN HIER ALLE ALS LINIE EINFÜGEN (in miniveriosn ohne viel funktionen...nur damit man weiß wo man geht bzw das wetter wo wie ist)




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