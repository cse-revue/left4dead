var playerSource = new ol.source.Vector();
var playerLayer = new ol.layer.Vector({
    source: playerSource,
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
            playerLayer
        ],
    });
}

function updatePlayerPosition(position) {
    playerSource.clear();

    var playerIconFeature = new ol.Feature({
        geometry: new ol.geom.Point(ol.proj.transform([position.coords.longitude, position.coords.latitude], 'EPSG:4326', 'EPSG:3857')),
        name: 'Player', // Insert player name
    });

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

    playerIconFeature.setStyle(playerIconStyle);
    playerSource.addFeature(playerIconFeature);
}