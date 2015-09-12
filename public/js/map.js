var playerIconStyle = new ol.style.Style({
        image: new ol.style.Circle({
            radius: 7,
            fill: new ol.style.Fill({
                color: '#00FF00'
            }),
            stroke: new ol.style.Stroke({
                color: '#000000',
                width: 2
            }),
        })
    });

var playerSource = new ol.source.Vector();
var playerLayer = new ol.layer.Vector({
    source: playerSource,
});

var survivorIconStyle = new ol.style.Style({
    image: new ol.style.Circle({
        radius: 7,
        fill: new ol.style.Fill({
            color: '#0000FF'
        }),
        stroke: new ol.style.Stroke({
            color: '#000000',
            width: 2
        }),
    })
});

var survivorSource = new ol.source.Vector();
var survivorLayer = new ol.layer.Vector({
    source: survivorSource,
});

var zombieIconStyle = new ol.style.Style({
    image: new ol.style.Circle({
        radius: 7,
        fill: new ol.style.Fill({
            color: '#FF0000'
        }),
        stroke: new ol.style.Stroke({
            color: '#000000',
            width: 2
        }),
    })
});

var zombieSource = new ol.source.Vector();
var zombieLayer = new ol.layer.Vector({
    source: zombieSource,
});

function initMap() {   
    // Initialise the map
    var map = new ol.Map({
        target: 'map',
        view: new ol.View({
            center: ol.proj.transform([151.230935,-33.918776099999995], 'EPSG:4326', 'EPSG:3857'),
            zoom: 18
        }),
        layers: [
            new ol.layer.Tile({
                source: new ol.source.OSM()
            }),
            playerLayer,
            survivorLayer,
            zombieLayer,
        ],
    });
}

function updatePlayerPosition(position) {
    playerSource.clear();

    var playerIconFeature = new ol.Feature({
        geometry: new ol.geom.Point(ol.proj.transform([position.coords.longitude, position.coords.latitude], 'EPSG:4326', 'EPSG:3857')),
    });

    playerIconFeature.setStyle(playerIconStyle);
    playerSource.addFeature(playerIconFeature);
}

function updateSurvivorPositions(positions) {
    survivorSource.clear();

    for(var i = 0; i < positions.length; i++) {
        var survivorIconFeature = new ol.Feature({
            geometry: new ol.geom.Point(ol.proj.transform([positions[i][0], positions[i][1]], 'EPSG:4326', 'EPSG:3857')),
        });

        survivorIconFeature.setStyle(survivorIconStyle);
        survivorSource.addFeature(survivorIconFeature);
    }
}

function updateZombiePositions(positions) {
    zombieSource.clear();

    for(var i = 0; i < positions.length; i++) {
        var zombieIconFeature = new ol.Feature({
            geometry: new ol.geom.Point(ol.proj.transform([positions[i][0], positions[i][1]], 'EPSG:4326', 'EPSG:3857')),
        });

        zombieIconFeature.setStyle(zombieIconStyle);
        zombieSource.addFeature(zombieIconFeature);
    }
}