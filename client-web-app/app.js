
// All api keys here
const tokenForOneMap = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjQ5OTIsInVzZXJfaWQiOjQ5OTIsImVtYWlsIjoid2QxMGpwdnQrb25lbWFwQGdtYWlsLmNvbSIsImZvcmV2ZXIiOmZhbHNlLCJpc3MiOiJodHRwOlwvXC9vbTIuZGZlLm9uZW1hcC5zZ1wvYXBpXC92MlwvdXNlclwvc2Vzc2lvbiIsImlhdCI6MTU5MjAxMjkwMiwiZXhwIjoxNTkyNDQ0OTAyLCJuYmYiOjE1OTIwMTI5MDIsImp0aSI6IjI5MDg3OTBlNjQ3ZWQ0NjJjYTUxMmI1MmM5OTcyMzRmIn0.G2RoACJNBYBoyMgw2BtVljA59Io4LCHsLs9I7Ir0-fA"
const oneMapURL = "https://developers.onemap.sg/privateapi/routingsvc/route?"
const postUpdateURL = "https://node-red-tuecs.mybluemix.net/community/update?"
const mymap = L.map('mapid').setView([1.3521, 103.8198], 13);
const apiKeyRefreshed =  getApiKey();


// HTML DOMs
const currentCard = document.getElementById("currentCard");
const currentCardTitle = document.getElementById("cardTitle");
const currentCardContent = document.getElementById("cardContent");
const cardMinimiser = document.getElementById("minimiseCard");
const acceptButton = document.getElementById('acceptCase');
const rejectButton = document.getElementById('rejectCase');
const footerElement = document.querySelector('.card-footer')

// All socket declarations and listeners here
const clientSendSocket = new WebSocket('wss://node-red-tuecs.mybluemix.net/ws/usercoods')
const clientRecSocket = new WebSocket('wss://node-red-tuecs.mybluemix.net/datastream')

// Shared variables because lazy
var currentCoordinates;
var userAppear;
var incidentGroup = L.layerGroup().addTo(mymap);
var polyLineUser;
var routing_mode;

// Adding a tile in Leaflet
L.tileLayer('https://maps-{s}.onemap.sg/v3/Night/{z}/{x}/{y}.png', {
    detectRetina: true,
    maxZoom: 18,
    attribution: '<img src="https://docs.onemap.sg/maps/images/oneMap64-01.png" style="height:20px;width:20px;"/> New OneMap | Map data &copy; contributors, <a href="http://SLA.gov.sg">Singapore Land Authority</a>',
}).addTo(mymap);



// Custom icons
const ambulanceIcon = L.divIcon({
    html: '<i class="fa fa-truck" style="color: red"></i>',
    iconSize: [20, 20],
    className: 'myDivIcon'
})

const userIcon = L.divIcon({
    html: '<i class="fa fa-walking" style="color: red; font-size: 3em"></i>',
    iconSize: [20, 20],
    className:'myDivIcon2'
})

// Custom Markers
customMarker = L.Marker.extend({
    options: {
        name: '',
        address: '',
        issue:''
    }
});

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
        // TODO: check status first, if attended, display the otherCidAttending
        let tempMarker = new customMarker([singleCase.latitude, singleCase.longitude], {
            clickable: true,
            name: singleCase.caseId,
            address: singleCase.address,
            issue: singleCase.possibleEmergency,
            status: singleCase.attended,
            otherCidAttending: singleCase.otherCidAttending
        }).on('click', onClickMarker).addTo(incidentGroup);
    })

}

clientRecSocket.addEventListener('message', (event) => handlerForStream(event.data)
);

cardMinimiser.addEventListener("click", () => currentCard.style.display="none");
acceptButton.addEventListener("click", async () => {
    routing_mode = true
    let caseSelected = acceptButton.dataset.id;
    let caseAddress = acceptButton.dataset.addr;
    // console.log(caseSelected);
    // TODO: close socket connection
    clientRecSocket.close();
    //TODO: remove all markers
    incidentGroup.clearLayers();
    // status = attending for attending, done, needHelp
    //TODO: POST REQUEST
    let response = await fetch (postUpdateURL + new URLSearchParams({
            cid: 1,
            caseId: caseSelected,
            status: 'attending'
        }
    ), {
            method: 'POST',
        }
    );
    //TODO: UI update
    acceptButton.style.display = "none";
    rejectButton.style.display = "none";
    currentCardTitle.innerHTML= `${caseSelected} <span style="display:inline-block; width: 1em;"></span> <span class="tag is-primary">In Progress</span> <span style="display:inline-block; width: 1em;"> </span> <span id="timeupdate"></span>` ;
    currentCardContent.innerHTML =`
        <strong>${caseAddress}</strong>`
    footerElement.innerHTML = `
        <button id="needHelpCase" data-id="${caseSelected}" data-addr="" onclick="handleEscalation()" class="button is-danger card-footer-item ">Request SCDF</button>
        <button id="doneCase" data-id="${caseSelected}" onclick="handleDone()" class="button is-primary card-footer-item">Attended</button>
    `
    // TODO: Re-add Marker
    new customMarker([acceptButton.dataset.lat, acceptButton.dataset.lng]).addTo(mymap);

    // TODO: Routing
    let destCoods = [acceptButton.dataset.lat, acceptButton.dataset.lng]
    routingState(destCoods);


})

// Specify a popup, behavior is such that will display coordinates upon clicking
var popup = L.popup();

// Custom Handlers
function onMapClick(e) {
    popup
        .setLatLng(e.latlng)
        .setContent("You clicked the map at " + e.latlng.toString())
        .openOn(mymap);
}

// redraws the location of the accessing device
function onLocationFound(e) {
    let radius = e.accuracy;

    try{
        mymap.removeLayer(userAppear);
    }
    catch(err){
       console.error(err);
    }

    userAppear = L.marker(e.latlng, {icon: userIcon}).addTo(mymap)

    clientSendSocket.send(JSON.stringify({
        cid: 1,
        status: "available",
        latitude: e.latlng.lat,
        longitude: e.latlng.lng

    }));
    currentCoordinates = [e.latlng.lat, e.latlng.lng]
}
// error message if gps location not parseable
function onLocationError(e) {
    console.error(e.message);
}
// fetches the current GPS location from Alex's Api
// async function getVehicleLocation() {
//     let response = await fetch("https://node-red-tuecs.mybluemix.net/gps1")
//     let data =  await response.json();
//     console.log(data);
//     return [data.latitude, data.longitude]
//
// }

$('#closeBtn').click(() => {
    $('#popup-greeting').fadeOut();
});

function handleReject(){
    $('#currentCard').fadeOut();
    $('#popup-greeting').fadeIn();
    $('#notification-text').html(`Thank you for taking your effort to let us know that you are busy.`);
}

function handleDone(){
    // Getting data stored within buttons
    let caseSelected = document.getElementById("doneCase").dataset.id;
    // console.log(caseSelected);
    // console.log("Done flow is being intiated");
    let response =  fetch (postUpdateURL + new URLSearchParams({
            cid: 1,
            caseId: caseSelected,
            status: 'ok'
        }
    ), {
            method: 'POST',
        }
    );
    // TODO: Jiayi, DO the popup thing at the end here (for when user finished the case :))
    routing_mode = false
    mymap.removeLayer(polyLineUser);
    incidentGroup.clearLayers();
    $('#currentCard').fadeOut();
    $('#popup-greeting').fadeIn();
    $('#notification-text').html(`Thank you for helping out.
    Have a great day!`);$('#currentCard').fadeOut();
    $('#popup-greeting').fadeIn();
    $('#notification-text').html(`Thank you for helping out.
    Have a great day!`);
}

function handleEscalation(){
    let caseSelected = document.getElementById('needHelpCase').dataset.id;
    console.log("SCDF Escalation flow is being intiated");

    let response =  fetch (postUpdateURL + new URLSearchParams({
            cid: 1,
            caseId: caseSelected,
            status: 'help'
        }
    ), {
            method: 'POST',
        }
    );

    // TODO: Proceed to cause alert
    $('#currentCard').fadeOut();
    $('#popup-greeting').fadeIn();
    $('#notification-text').html(`Thank you for helping out.
    Help from SCDF is on its way!`);

    //TODO: Procced to update UI
    currentCard.style.display = "none";
}

function getUserLocation(){
    // called every 3 seconds
    userAppear?mymap.locate({setView: false}):mymap.locate({setView: true, maxZoom: 16});
    // console.log('running');
}

// draws the routing on the map via encoded Geometry
function drawGeometry(encodedGeometry){
    // try-catch blocks handles the removal of the polyline
    let result = L.Polyline.fromEncoded(encodedGeometry).getLatLngs()
    // console.log(result)
    try{
        mymap.removeLayer(polyLineUser);
    }
    catch (err) {
        console.error(err);
        // console.log("Drawing first line");
    }
    polyLineUser = L.polyline(result, {color: 'red'}).addTo(mymap);

}

async function getApiKey(){
    let response = await fetch('https://developers.onemap.sg/privateapi/auth/post/getToken', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email: 'wd10jpvt+onemap@gmail.com',
            password: 'aiLZmw3N75B2TYN'
        })
    })
    let data = await response.json()
    return data.access_token;

}
// the params are in coordinate (lat, lng) format
async function updateRouting (currentLocation, staticDestination, routingMode){
    let response = await fetch (oneMapURL + new URLSearchParams({
            start: currentLocation,
            end: staticDestination,
            routeType: routingMode,
            token: apiKeyRefreshed,
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

function displayUserIcon(currentLocation){
    // try-catch blocks handles the removal of the icon
    try{
        mymap.removeLayer(userAppear);
    }
    catch(err){
        console.error(err);
    }
    userAppear = L.marker(currentLocation, {icon: userIcon}).addTo(mymap)

}

 function routingState(destination) {
    setInterval(async ()=> {
        if (routing_mode === true) {
            let latestUpdate = await updateRouting(currentCoordinates, destination, 'walk')
            let expectedTime = latestUpdate.summary.total_time
            // data from the routing is then used to draw the pathline and show ambulance logo

            drawGeometry(latestUpdate.geo);
            displayUserIcon(currentCoordinates);
            document.getElementById('timeupdate').innerText = `Expected Time: ${(Math.round(expectedTime / 60))} minutes`
        }
    }, 3000);

}



function onClickMarker(e) {
    currentCardTitle.innerHTML= `${this.options.name} <span style="display:inline-block; width: 1em;"></span> <span class="tag is-danger">Unattended</span>`;
    // currentCardContent.innerHTML="<p><strong>Name:</strong> "+this.options.name+"</p><p><strong>Issue:</strong> "+this.options.issue+"</p>";
    currentCardContent.innerHTML = `
    <p><strong>Name</strong>: ${this.options.name}</p>
    <p><strong>Issue</strong>: ${this.options.issue}</p>
    <p ><strong>Full Address</strong>: ${this.options.address}</p>
    <p><strong>Other Responders Attending</strong>: None</p>
 
    `
    currentCard.style.display = "block";
    acceptButton.dataset.id = this.options.name;
    acceptButton.dataset.addr = this.options.address;
    acceptButton.dataset.lat = e.latlng.lat;
    acceptButton.dataset.lng = e.latlng.lng;


}


// My other handlers, probably potential to do other things with these
mymap.on('click', onMapClick);
mymap.on('locationfound', onLocationFound);
mymap.on('locationerror', onLocationError);


setInterval(async () => {
    // TODO: gets the coordinates of the user first
    getUserLocation();
    // console.log("wow")


}, 3000);