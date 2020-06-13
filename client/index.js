import { updateRouting, getUserLocation, drawGeometry } from "./utils.js"

var currentCard;
var currentCardName;
var clientSendSocket;
var clientRecSocket;
var polylineAmb;
var userAppear;
var popup;
var customMarker;
var mapInstance;
var userIcon;
var userRadiusCircle;
var ambulanceIcon;

var expectTime;
var radius;

var accepted = false;

$(document).ready(() => {

    $('#myMap').click(() => {
        currentCard.fadeOut();
    });

    $('#acceptBtn').click(() => {
        if (accepted) {
            // show pop up
        } else {
            $('#acceptBtn').html("ATTENDED");
            $('#rejectBtn').html("REQUIRE HELP");
        }
    })

    mapInstance = L.map('myMap').setView([1.3521, 103.8198], 13);
    // HTML DOMs
    // const timingOverlay = document.getElementById('expectedTime');
    currentCard = $("#currentCard");
    currentCardName = $("#name");

    // All socket declarations and listeners here
    clientSendSocket = new WebSocket('ws://node-red-tuecs.mybluemix.net/ws/usercoods')
    clientRecSocket = new WebSocket('ws://node-red-tuecs.mybluemix.net/datastream')

    clientRecSocket.addEventListener('message', (event) => handlerForStream(event.data));

    // Shared variables because lazy
    popup = L.popup();


    // Adding a tile in Leaflet
    L.tileLayer('https://maps-{s}.onemap.sg/v3/Night/{z}/{x}/{y}.png', {
        detectRetina: true,
        maxZoom: 18,
        attribution: '<img src="https://docs.onemap.sg/maps/images/oneMap64-01.png" style="height:20px;width:20px;"/> New OneMap | Map data &copy; contributors, <a href="http://SLA.gov.sg">Singapore Land Authority</a>',
    }).addTo(mapInstance);


    // Custom icons
    ambulanceIcon = L.divIcon({
        html: '<i class="fa fa-truck" style="color: red"></i>',
        iconSize: [20, 20],
        className: 'myDivIcon'
    })

    userIcon = L.divIcon({
        html: '<i class="fa fa-walking" style="color: red; font-size: 3em"></i>',
        iconSize: [20, 20],
        className:'myDivIcon2'
    })

    // custom markers

    customMarker = L.Marker.extend({
        options: {
            name: '',
            address: '',
            issue:''
        }
    });

    mapInstance.on('click', onMapClick);
    mapInstance.on('locationfound', onLocationFound);
    mapInstance.on('locationerror', onLocationError);

    setInterval(async () => {
        var currentLocation = getUserLocation(mapInstance, userAppear);
        // TODO: proceeds to scan for open cases
        let latestUpdate = await updateRouting(currentLocation, [1.3379196,103.9165601], 'drive')
        expectTime = latestUpdate.summary.total_time;
        $('#time-radius-content').html(`radius: ${radius}m | ${Math.round(expectTime/60*100)/100} mins`);
        // TODO: gets the coordinates of the user first
        
        // TODO: gets locations that are within proximity
    
        // TODO: alerts user for locations within proximity for new cases
    
        //
        // data from the routing is then used to draw the pathline and show ambulance logo
        // drawGeometry(latestUpdate.geo);
        // displayAmbIcon(currentLocation);
    
        // updates the time indicator accordingly
        // timingOverlay.innerText = `Expected Time: ${(expectedTime/60)} minutes`
    
    }, 3000);
    
})

function onClickMarker(e) {
    currentCardName.html(this.options.name);
    $('#geo-issue').html(this.options.issue);
    $('#geo-address').html(this.options.address);
    currentCard.fadeIn();
}

function onMapClick(e) {
    popup
        .setLatLng(e.latlng)
        .setContent("You clicked the map at " + e.latlng.toString())
        .openOn(mapInstance);
}

// redraws the location of the accessing device
function onLocationFound(e) {
    // console.log("Locationfound is called!")
    radius = e.accuracy;

    try{
        if (userAppear)
            mapInstance.removeLayer(userAppear);
        if (userRadiusCircle)
            mapInstance.removeLayer(userRadiusCircle);
    }
    catch {
        console.log("First time making marker")
    }

    userAppear = L.marker(e.latlng, {icon: userIcon}).addTo(mapInstance)
        .bindPopup("You are within " + radius + " meters from this point").openPopup();
    userRadiusCircle = L.circle(e.latlng, radius);

    userRadiusCircle.addTo(mapInstance);
    clientSendSocket.send(JSON.stringify({
        cid: 1,
        status: "available",
        latitude: e.latlng[0],
        longitude: e.latlng[1]

    }));
}
// error message if gps location not parseable
function onLocationError(e) {
    alert(e.message);
}

function handlerForStream (payload){
    let cases = (JSON.parse(payload)).payload.cases;
    // console.log(cases);
    /*
    address: "111111 #01-1111"
    attended: false
    caseId: 1
    latitude: 1
    longitude: 1
    otherCidAttending: 2
    possibleEmergency: "unconsious"
     */

    cases.forEach(singleCase => {
        console.log(singleCase);
        // console.log(singleCase);
        // TODO: check status first, if attended, display the otherCidAttending
        new customMarker([singleCase.latitude, singleCase.longitude], {
            clickable: true,
            name: singleCase.caseId,
            address: singleCase.address,
            issue: singleCase.possibleEmergency
        }).on('click', onClickMarker).addTo(mapInstance);
    })

}