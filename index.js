mapboxgl.accessToken = config.MAPBOX_TOKEN

const stationURL = "https://gbfs.citibikenyc.com/gbfs/es/station_information.json"
const statusURL = "https://gbfs.citibikenyc.com/gbfs/es/station_status.json"
//custom nyc area bounding-box
const bbox = [-74.15366370862762,40.6307887808687,-73.85858253175611,40.8849532408542]


const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v10',
    center: [-73.96612, 40.68336],
    zoom: 11
})

function showData(name, data, color='#4264fb') {
    map.addSource(name, {
        'type': 'geojson',
        'data': data
        })
    if (map.getLayer(name)) {
        map.removeLayer(name)
    }
    map.addLayer({
        id: name,
        'type': 'circle',
        'source': name,
        'paint': {
            'circle-color': color,
            'circle-radius': 4,
            'circle-stroke-width': 1,
            'circle-stroke-color': '#0f0f0f'
            }
    })
}

async function getStationStatuses() {
    try {
        const resp = await fetch(statusURL, {
            method: "GET",
            mode: 'cors',
            credentials: 'same-origin',
            headers: {
                'User-Agent': 'request'
            }
        })
        const data = await resp.json()
        return data.data.stations
    } catch(e) {
        console.error(e)
    }
}

async function getCitiBikeStationData() {
    try {
        const statusInfo = await getStationStatuses()
        const resp = await fetch(stationURL, {
            method: "GET",
            mode: "cors",
            credentials: 'same-origin',
            headers: {
                'User-Agent': 'request',
            }})
        const data = await resp.json()
        const stationsData = data.data.stations
        const stationsArr = stationsData.map(({lat, lon, name, station_id}) => {
            const status = {}
            for (let st of statusInfo) {
                if (st.station_id == station_id) {
                    status.bikes = st.num_bikes_available
                    status.docks = st.num_docks_available
                }
            }
            return {
                type: 'Feature',
                "properties": {
                    "name":name,
                    "bikes": status.bikes,
                    "docks": status.docks
                },
                "geometry": {
                        type: "Point",
                        coordinates: [parseFloat(lon),parseFloat(lat)]
                    }
                }
        })
        const stations = {
            "type":"FeatureCollection",
            "features" : stationsArr
        }
        console.log(stationsData[0])
        showData('stations', stations)
    } catch(e) {
        console.error(e)
    }
}

// pop-ups
function addPopups() {
    const popup = new mapboxgl.Popup()
    map.on('mousemove', (e) => {
        const features = map.queryRenderedFeatures(e.point, {
            layers:['stations']
        })
        if (!features.length) {
            popup.remove()
            return
        }
        const feature = features[0]
        const popHtml = `
            <h2>${feature.properties.name}</h2>
            <p>Bikes Available: ${feature.properties.bikes}</p>
            <p>Docks Available: ${feature.properties.docks}</p>
            `
        popup.setLngLat(feature.geometry.coordinates)
        .setHTML(popHtml)
        .addTo(map)

        map.getCanvas().style.cursor = features.length ? 'pointer' : ''
    })
}

function addGeocoder() {
    const geocoder = new MapboxGeocoder({
        accessToken: mapboxgl.accessToken,
        mapboxgl: mapboxgl,
        marker: false,
        placeholder: 'Search an address in NYC',
        bbox: bbox
    })
    map.addControl(geocoder)

    geocoder.on('result', (e) => {
        map.getSource('search-point').setData(e.result.geometry)
        // const stations = map.querySourceFeatures('stations')
        // const nearestStation = turf.nearest(e.result.geometry.coordinates, stations)
        // console.log(nearestStation)
    })
}

function addSearchPoint() {
    const searchPoint = {
        type: 'FeatureCollection',
        features: []
    }
    showData('search-point', searchPoint, '#F9E076')
}

function setUpNearest() {
    map.addSource('nearest-station', {
        type: 'geojson',
        data: {
            type: 'FeatureCollection',
            features: []
        }
    })
}
getStationStatuses()
setTimeout(() => {
    map.on('load', getCitiBikeStationData())
    map.on('load', addSearchPoint())
    map.on('load', setUpNearest())
    addPopups()
    addGeocoder()
}, 2000)



