import myMapConstant from "./constants.js";

export async function updateRouting (currentLocation, staticDestination, routingMode){
    let response = await fetch (myMapConstant.mapURL + new URLSearchParams({
            start: currentLocation,
            end: staticDestination,
            routeType: routingMode,
            token: myMapConstant.mapToken,
        }
    )
    )
    let data = await response.json()
    // console.log(data)
    // Destructuring thew messy data for what we want/need
    return {
        summary: data.route_summary,
        geo: data.route_geometry
    }
}

export function getUserLocation(mymap, userAppear){
    // called every 3 seconds
    // console.log(userAppear);
    userAppear?mymap.locate({setView: false}):mymap.locate({setView: true, maxZoom: 16});
    var latlng = userAppear.getLatLng();
    var latitude = latlng.lat;
    var longtitude = latlng.lng;
    return [latitude, longtitude];
    // console.log('running');
}

export function drawGeometry(encodedGeometry, polylineAmb, mymap){
    // try-catch blocks handles the removal of the polyline
    let result = L.Polyline.fromEncoded(encodedGeometry).getLatLngs()
    console.log(result)
    try{
        mymap.removeLayer(polylineAmb);
    }
    catch{
        console.log("Drawing first line");
    }
    polylineAmb = L.polyline(result, {color: 'red'}).addTo(mymap);
    // mymap.fitBounds(polylineInsta.getBounds());

}

// export function displayAmbIcon(currentLocation, mymap){
//     // try-catch blocks handles the removal of the icon
//     try{
//         mymap.removeLayer(ambulanceAppear);
//     }
//     catch {
//         console.log("First time making marker")
//     }
//     ambulanceAppear = L.marker(currentLocation, {icon: ambulanceIcon}).addTo(mymap)

// }