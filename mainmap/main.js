// Kartenhintergründe der basemap.at definieren
let baselayers = {
    standard: L.tileLayer.provider("BasemapAT.basemap"),
    grau: L.tileLayer.provider("BasemapAT.grau"),
    terrain: L.tileLayer.provider("BasemapAT.terrain"),
    surface: L.tileLayer.provider("BasemapAT.surface"),
    highdpi: L.tileLayer.provider("BasemapAT.highdpi"),
    ortho_overlay: L.layerGroup([
        L.tileLayer.provider("BasemapAT.orthofoto"),
        L.tileLayer.provider("BasemapAT.overlay")
    ]),
};

// Overlays für die Themen zum Ein- und Ausschalten definieren
let overlays = {
    routes24: L.featureGroup(),
    routes9: L.featureGroup(),
    routes24full: L.featureGroup(),
    routes9full: L.featureGroup(),
    HAG: L.featureGroup(),
    HAGS: L.featureGroup(),
    E: L.featureGroup(),
};



// Karte initialisieren
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
    "Adlerweg Tirol-Etappen": overlays.routes24,
    "Adlerweg Osttirol-Etappen": overlays.routes9,
    "Adlerweg Tirol": overlays.routes24full,
    "Adlerweg Osttirol": overlays.routes9full,
    "Hütte, Alm, Gasthof": overlays.HAG,
    "Hütte, Alm, Gasthof (Stempelstelle)": overlays.HAGS,
    "Einkehrmöglichkeit": overlays.E,
}).addTo(map);
overlays.routes24full.addTo(map);
overlays.routes9full.addTo(map);

//Maßstab hizufügen
L.control.scale({
    imperial: false,
    maxWidth: 400,
}).addTo(map);

// Profile Control 
const elevationControl = L.control.elevation({
    elevationDiv: '#profile',
    followMarker: false, // Kartenausschnitt geht nicht mit 
    theme: 'gold-theme',
});
const ausklappen = () => {
    elevationControl.addTo(map)
};

// Funktion um Etappe/track zu zeichnen
const drawTrack = (Layer, etappe, col, op, wei) => {
    overlays.routes24.clearLayers();
    overlays.routes9.clearLayers();
    elevationControl.clear();
    let gpxTrack = new L.GPX(`${Layer}/${etappe}.gpx`, {
        async: true,
        marker_options: {
            startIconUrl: `${Layer}/icons/${etappe}.png`,
            endIconUrl: `${Layer}/icons/999.png`,
            shadowUrl: null,
        },
        polyline_options: {
            color: col,
            opacity: op,
            weight: wei,
        }
    });
    if (Layer === "routes9" && etappe != 999) {
        gpxTrack.addTo(overlays.routes9)
    };
    if (Layer === "routes24" && etappe != 999) {
        gpxTrack.addTo(overlays.routes24)
    };
    if (Layer === "routes24" && etappe == 999) {
        gpxTrack.addTo(overlays.routes24full)
    };

    if (Layer === "routes9" && etappe == 999) {
        gpxTrack.addTo(overlays.routes9full)
    };
    gpxTrack.on('loaded', () => {

        document.getElementById("ausklappButton").disabled = false;
        if (etappe != 999) {
            elevationControl.load(`${Layer}/${etappe}.gpx`);
            map.fitBounds(gpxTrack.getBounds());
        };

        // Pop-up
        for (let track of ADLERWEG) {
            if (track.Etappennummer === etappe) {
                stop
                let url_adlerweg = 'https://www.tirol.at/reisefuehrer/sport/wandern/wandertouren/1?form=hiketours&theme%5B0%5D=1'

                if (etappe === '5') {
                    url_adlerweg = 'https://www.tirol.at/reisefuehrer/sport/wandern/wandertouren/a-adlerweg-etappe-5-gasthof-buchacker-pinegg'
                };
                if (etappe === '6') {
                    url_adlerweg = 'https://www.tirol.at/reisefuehrer/sport/wandern/wandertouren/a-adlerweg-etappe-6-pinegg-steinberg-am-rofan'
                };
                if (etappe === '7') {
                    url_adlerweg = 'https://www.tirol.at/reisefuehrer/sport/wandern/wandertouren/a-adlerweg-etappe-7-jausenstation-waldhaeusl-erfurter-huette'
                } else {
                    let url_name = track.Titel.split(':')[1].toLowerCase().replaceAll('.', '').replaceAll('– ', '').replaceAll('ü', 'ue').replaceAll('ö', 'oe').replaceAll(' ', '-')
                    url_adlerweg = `https://www.tirol.at/reisefuehrer/sport/wandern/wandertouren/a-adlerweg-etappe-${etappe}${url_name}`
                };

                gpxTrack.bindPopup(`
                <h4>${track.Titel}</h4>
                <ul>
                    <li>Ausgangspunkt: ${track.Ausgangspunkt}</li>
                    <li>Endpunkt ${track.Endpunkt}</li>
                    <li>Aufstieg: ${track["Höhenmeter bergauf"]} hm </li>
                    <li>Abstieg: ${track["Höhenmeter bergauf"]} hm</li>
                    <li>Höchster Punkt: ${Math.round(gpxTrack.get_elevation_max())} m</li>
                    <li>Niedrigster Punkt: ${Math.round(gpxTrack.get_elevation_min())} m</li>
                    <li>Strecke: ${track["Streckenlänge (in km)"]} km</li>
                    <li>Gehzeit: ${track["Gehzeit (in Stunden)"]} h</li>
                    <li><a href=${url_adlerweg} target="_blank">Link Tirol-Seite</a></li>
                </ul>
                `)
            };
        };
    });

};


drawTrack("routes24", 999, 'red', 0.50, 10)
drawTrack("routes9", 999, 'orange', 0.50, 10)


// Funktion für Pulldown 24
const pulldown24 = () => {
    pulldown.innerHTML += `<optgroup label="Adlerweg Tirol - 24 Tagesetappen">`
    for (let track of ADLERWEG) {
        if (track.Etappennummer.startsWith("O")) {
            continue
        } else {
            pulldown.innerHTML += `<option value="${track.Etappennummer}">${track.Titel}</option>`; // value um draufzugreifen können (je Tracknummer)
        }
    }
};

// Funktion für Pulldown 9
const pulldown9 = () => {
    pulldown.innerHTML += `<optgroup label="Adlerweg Osttirol - 9 Tagesetappen">`
    for (let track of ADLERWEG) {
        if (track.Etappennummer.startsWith("O") === false) {
            continue
        } else {
            pulldown.innerHTML += `<option value="${track.Etappennummer}">${track.Titel}</option>`; // value um draufzugreifen können (je Tracknummer)
        }
    }
}




// Pulldown Menü befüllen
let pulldown = document.querySelector("#pulldown");

map.on('overlayadd', function () {
    pulldown.innerHTML = ''
    if (map.hasLayer(overlays.routes24) == true && map.hasLayer(overlays.routes9) == false) {
        pulldown24();
        drawTrack('routes24', '1', 'black', 0.9, 3)
    };
    if (map.hasLayer(overlays.routes24) == false && map.hasLayer(overlays.routes9) == true) {
        pulldown9()
        drawTrack('routes9', 'O1', 'black', 0.9, 3)
    }
    if (map.hasLayer(overlays.routes24) == true && map.hasLayer(overlays.routes9) == true) {
        pulldown24();
        pulldown9();
        drawTrack('routes24', '1', 'black', 0.9, 3);
        drawTrack('routes9', 'O1', 'black', 0.9, 3)
    };
});
map.on('overlayremove', function () {
    pulldown.innerHTML = ''
    if (map.hasLayer(overlays.routes24) == true && map.hasLayer(overlays.routes9) == false) {
        pulldown24()
        drawTrack('routes24', '1', 'black', 0.9, 3)
    };
    if (map.hasLayer(overlays.routes24) == false && map.hasLayer(overlays.routes9) == true) {
        pulldown9()
        drawTrack('routes9', 'O1', 'black', 0.9, 3)
    }
    if (map.hasLayer(overlays.routes24) == true && map.hasLayer(overlays.routes9) == true) {
        pulldown24()
        pulldown9()
        drawTrack('routes24', '1', 'black', 0.9, 3);
        drawTrack('routes9', 'O1', 'black', 0.9, 3)
    };
});




// Wenn anders Element ausgewählt wird: event (Funktion)
pulldown.onchange = () => {
    if (pulldown.value.startsWith("O")) {
        drawTrack('routes9', pulldown.value, 'black', 0.9, 3)
    } else {
        drawTrack('routes24', pulldown.value, 'black', 0.9, 3)
    };
};



// Lodging zeichnen
let popuptext = (m) => {
    let res = m.bindPopup(
        `<h3>${LODGING[object].properties.Name}</h3>
        <i class="fas fa-phone"> ${LODGING[object].properties.Tel || ''}</i>
        <br>
        <i class="fas fa-external-link-alt"></i><a href="https://${LODGING[object].properties.Web}" target="_blank"> Homepage<\a>
        <br>
        <address>
        <a href="mailto:${LODGING[object].properties.Mail || ''}"><i class="fas fa-envelope-square mr-3"></i> E-Mail</a>
       </address>
        `
    )
    return res

};

for (object in LODGING) {
    let marker = L.marker([
        LODGING[object].geometry.coordinates[1],
        LODGING[object].geometry.coordinates[0],
    ], {
        icon: L.icon({
            iconUrl: `icons/${LODGING[object].properties.KAT}.png`,
        })
    });
    if (LODGING[object].properties.KAT === 'E') {
        marker.addTo(overlays.E);
        popuptext(marker)

    };
    if (LODGING[object].properties.KAT === 'HAG') {
        marker.addTo(overlays.HAG);
        popuptext(marker)

    };
    if (LODGING[object].properties.KAT === 'HAGS') {
        marker.addTo(overlays.HAGS);
        popuptext(marker)
    };

}
