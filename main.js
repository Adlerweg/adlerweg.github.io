let baselayers = {
    standard: L.tileLayer.provider("BasemapAT.basemap"),
    grau: L.tileLayer.provider("BasemapAT.grau"),
    terrain: L.tileLayer.provider("BasemapAT.terrain"),
    surface: L.tileLayer.provider("BasemapAT.surface"),
    highdpi: L.tileLayer.provider("BasemapAT.highdpi"),
    wms: L.tileLayer.wms('https://maps.tirol.gv.at/externalcall.jsp?user=guest&project=tmap_master&view=sport_wintersport', {
        layers: 'PVECT\PLA_RO\SKJ_PL'
    }),
    ortho_overlay: L.layerGroup([
        L.tileLayer.provider("BasemapAT.orthofoto"),
        L.tileLayer.provider("BasemapAT.overlay")
    ]),
};

// Overlays für die Themen zum Ein- und Ausschalten definieren
let overlays = {
    routes: L.featureGroup()
};

// Karte initialisieren und auf Innsbrucks Wikipedia Koordinate blicken
let map = L.map("map", {
    center: [47.267222, 11.392778],
    zoom: 9,
    layers: [
        baselayers.highdpi
    ]
})

// Kartenhintergründe und Overlays zur Layer-Control hinzufügen
let layerControl = L.control.layers({
    "basemap.at Standard": baselayers.standard,
    "basemap.at grau": baselayers.grau,
    "basemap.at Relief": baselayers.terrain,
    "basemap.at Oberfläche": baselayers.surface,
    "basemap.at hochauflösend": baselayers.highdpi,
    "basemap.at Orthofoto beschriftet": baselayers.ortho_overlay,
}, {
    "GPX-Routen": overlays.routes,
    "Wetter": baselayers.wms,
    "Hütten": baselayers.wms,
}).addTo(map);

console.log(baselayers.wms);

// Overlay mit GPX-Track anzeigen
overlays.routes.addTo(map);

// Elevation initialisiert
const elevationControl = L.control.elevation({
    elevationDiv: "#profile",
    followMarker: false,
    theme: "gold-theme",
}).addTo(map);



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