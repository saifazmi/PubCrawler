var barObjs = [];   
var latlon = "";

// ---------------- REQUEST DATA -----------------
function requestData(url, callBack)
{
	// Create a new XMLHttpRequest object
	var xmlhttp = new XMLHttpRequest();
    console.log(xmlhttp);
	xmlhttp.onreadystatechange = function() {
		if (xmlhttp.readyState == 4) {
			callBack(xmlhttp);
		}
	}
	// Open the object with the filename
	xmlhttp.open("POST", url, true);
	// Send the request
	xmlhttp.send(null);
}

function jsonInit(){
    requestData("https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=" + latlon + "&radius=10000&keyword=pub&key=AIzaSyDCGOsaheclgvHhKSbL4GxvUM5JOu6jpJc", loadBars);
}

// ------------------ FILL BAR ARRAY ---------------
function loadBars(jsonhttp){
    var bars = JSON.parse(jsonhttp.responseText).results;
    for(var i = 0; i < bars.length; i++){
        var bar = {
            name: bars[i].name,
            address: bars[i].vicinity,
            rating: bars[i].rating,
            longitude: bars[i].geometry.location.lng,
            latitude: bars[i].geometry.location.lat
        };
        barObjs.push(bar);
    }
}

function initialise(){
    getLocation();  
}

function getLocation() {
    // Check whether geolocation is available for the current browser
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(storePosition);
    } else {
        x.innerHTML = "Geolocation is not supported by this browser.";
    }
}

function storePosition(position) {
    // Set the value of the latlon variable then request the data from the api
    latlon = position.coords.latitude + "," + position.coords.longitude;
    jsonInit();  
}