var barObjs = [];   
var latlon = "";

alert = function() {}

Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

// ---------------- REQUEST DATA -----------------
function requestData(url, callBack)
{
	// Create a new XMLHttpRequest object
	var xmlhttp = new XMLHttpRequest();
	// Open the object with the filename
	xmlhttp.open("POST", url, false);
	// Send the request
	xmlhttp.send(null);
    callBack(xmlhttp);
}

function jsonInit(){
    requestData("https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=" + latlon + "&radius=5000&keyword=bar&key=AIzaSyCBdAGUQD8ythoZ1FsbwfkYpVIGHJ1bRyE", loadBars);
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
              var temp = getBarObjs();
        showBars(temp);
 
}

function showBars(objects){
    document.getElementById("panel-body").innerHTML = "";
    var wrapper = document.createElement("div");
        wrapper.id = "objectwrapper";
    
    for(var i=0; i<objects.length; i++){
        var div = document.createElement("div");
            div.style.backgroundColor = "lightblue";
        var btn = document.createElement("button");
            btn.className = "btn btn-success";
            btn.value = "yes";
            btn.onclick = (function() { 
                var div1 = div;
                return function(){
                div1.style.backgroundColor = "#5cb85c";}; })();
        div.appendChild(btn);
        
        var btn = document.createElement("button");
            btn.className = "btn btn-primary";
            btn.value = "yes";
            btn.onclick = (function() { 
                var div1 = div;
                return function(){
                div1.style.backgroundColor = "lightblue";}; })();
        div.appendChild(btn);
        
        var btn = document.createElement("button");
            btn.className = "btn btn-danger";
            btn.value = "yes";
            btn.onclick = (function() { 
                var div1 = div;
                return function(){
                div1.style.backgroundColor = "#d9534f";}; })();
        div.appendChild(btn);
        
        var name = document.createElement("div");
            name.innerHTML = objects[i].name;
            div.appendChild(name);
        if(objects[i].rating){
            var rating = document.createElement("div");
            rating.innerHTML = objects[i].rating;
            div.appendChild(rating);
        }
        wrapper.appendChild(div);
    }
    document.getElementById("panel-body").appendChild(wrapper);
    
}

function initialise(){
    getLocation();  
}

function getLocation() {
    // Check whether geolocation is available for the current browser
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(storePosition);
    } 
}

function storePosition(position) {
    // Set the value of the latlon variable then request the data from the api
    latlon = position.coords.latitude + "," + position.coords.longitude;
    jsonInit();  
}


//get bar objects
function getBarObjs(){
    var temp = barObjs.slice(0, barObjs.length);
    return temp;   
}

function sortObjs(){
    var temp = getBarObjs();
    console.log(temp);
     var numberpubs = document.getElementById("numberpubs").value;
    
    var objectwrapper = document.getElementById("objectwrapper");
    var objectdivs = objectwrapper.childNodes;
    for(var i=0; i<objectdivs.length; i++){
        switch(objectdivs[i].style.backgroundColor){
            case "lightblue":
                temp[i].option = "dontcare";
                break;
            case "red":
                temp[i].option = "no";
                break;
            case "#5cb85c":
                temp[i].option = "yes";
                break;
            default:
                temp[i].option = "dontcare";
        }
    }
    //get all yes's
    var yes = temp.filter(filterObjYes);
    //make up the numbers with dont care if needed
    if (Object.size(yes) < numberpubs){
     var difference = numberpubs - Object.size(yes);
        var temp = barObjs.slice(0, barObjs.length);
        var dontcare = temp.filter(filterObjDC);
        for(var i=0; i<difference; i++){
            yes.push(dontcare[i]);
        }
    }
    return yes; 
    
}

function filterObjYes(value){
    if(value.option == "yes"){
        return true;
    }
    else{ return false;}
    
}
function filterObjDC(value){
    if(value.option == "dontcare"){
        return true;
    }
    else{ return false;}
    
}

     if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(getMapCenter);
    } else{
        var longitude = -1.9;
        var latitude = 52.48;
        esricode();
    }
     function getMapCenter(position){
         longitude = position.coords.longitude;
         latitude = position.coords.latitude;
         esricode();
     }


//**************************** ESRI CODE ***********************\\
function esricode() {
 require([
        "esri/urlUtils",
        "esri/config",
        "esri/map",
        "esri/graphic",            
        "esri/tasks/RouteTask",            
        "esri/tasks/RouteParameters",
        "esri/SpatialReference",
        "esri/geometry/Point",

        "esri/tasks/FeatureSet",            
        "esri/symbols/SimpleMarkerSymbol",
        "esri/symbols/SimpleLineSymbol",          

        "esri/Color",
        "dojo/_base/array",
        "dojo/on",
        "dojo/dom",
        "dijit/registry",

        "dijit/layout/BorderContainer",
        "dijit/layout/ContentPane",
        "dijit/form/HorizontalSlider",
        "dijit/form/HorizontalRuleLabels"
      ], function (
        urlUtils, esriConfig, Map, Graphic, RouteTask, RouteParameters, SpatialReference, Point,
        FeatureSet, SimpleMarkerSymbol, SimpleLineSymbol,           
        Color, array, on, dom, registry
      ) {
        var map, routeTask, routeParams, routes = [];
        var stopSymbol, barrierSymbol, routeSymbols;
        var mapOnClick_addStops_connect, mapOnClick_addBarriers_connect;

        urlUtils.addProxyRule({
          urlPrefix: "route.arcgis.com",  
          proxyUrl: "_proxy/proxy.php"
        });

        map = new Map("map", {
          basemap: "dark-gray",
          center: [longitude,latitude],
          zoom: 12,
        });
        routeTask = new RouteTask("http://route.arcgis.com/arcgis/rest/services/World/Route/NAServer/Route_World");
        routeParams = new RouteParameters();
        routeParams.findBestSequence = true;
        routeParams.stops = new FeatureSet();
        routeParams.barriers = new FeatureSet();
        routeParams.outSpatialReference = {"wkid":102100};
        
        routeTask.on("solve-complete", showRoute);
        routeTask.on("error", errorHandler);
                
        stopSymbol = new SimpleMarkerSymbol().setStyle(SimpleMarkerSymbol.STYLE_CROSS).setSize(15);
        stopSymbol.outline.setWidth(3);

        barrierSymbol = new SimpleMarkerSymbol().setStyle(SimpleMarkerSymbol.STYLE_X).setSize(10);
        barrierSymbol.outline.setWidth(3).setColor(new Color([255,0,0]));

        routeSymbols = {
          "Route 1": new SimpleLineSymbol().setColor(new Color([0,0,255,0.5])).setWidth(5),
          "Route 2": new SimpleLineSymbol().setColor(new Color([0,255,0,0.5])).setWidth(5),
          "Route 3": new SimpleLineSymbol().setColor(new Color([255,0,255,0.5])).setWidth(5)
        };
            
        
        //button click event listeners can't be added directly in HTML when the code is wrapped in an AMD callback
  
       on(dom.byId("numberpubs"), "click", function() {    
            clearRoutes();
            clearStops();
            document.getElementById("panel-body").innerHTML = "";
           removeEventHandlers();
            var temp = getBarObjs();
            showBars(temp); 
       });   
      on(dom.byId("findCrawlBtn"), "click", function(){
          clearStops();
          addStops();
          solveRoute();
      });

        //Begins listening for click events to add stops
        function addStops() {
          removeEventHandlers();
            var temp = sortObjs();
            for(var i=0; i<temp.length; i++){ 
                var obj = temp[i];
                mapOnClick_addStops_connect = addOurStop(obj.longitude, obj.latitude);
            }
              
        }

        //Clears all stops
        function clearStops() {
          removeEventHandlers();
          for (var i=routeParams.stops.features.length-1; i>=0; i--) {
            map.graphics.remove(routeParams.stops.features.splice(i, 1)[0]);
          }
        }
          

        function addOurStop(x, y){
        routeParams.stops.features.push(
            map.graphics.add(
              new esri.Graphic(
                new Point(x, y),
                stopSymbol,
                { RouteName:dom.byId("routeName").innerHTML }
              )
            )
            );
          }
    
 
          
          
        //Adds a stop. The stop is associated with the route currently displayed in the dropdown
        function addStop(evt) {
          routeParams.stops.features.push(
            map.graphics.add(
              new esri.Graphic(
                evt.mapPoint,
                stopSymbol,
                { RouteName:dom.byId("routeName").innerHTML }
              )
            )
          );
        }

        //Begins listening for click events to add barriers
        function addBarriers() {
          removeEventHandlers();
          mapOnClick_addBarriers_connect = on(map, "click", addBarrier);
        }

        //Clears all barriers
        function clearBarriers() {
          removeEventHandlers();
          for (var i=routeParams.barriers.features.length-1; i>=0; i--) {
            map.graphics.remove(routeParams.barriers.features.splice(i, 1)[0]);
          }
        }

        //Adds a barrier
        function addBarrier(evt) {
          routeParams.barriers.features.push(
            map.graphics.add(
              new esri.Graphic(
                evt.mapPoint,
                barrierSymbol
              )
            )
          );
        }

        //Stops listening for click events to add barriers and stops (if they've already been wired)
        function removeEventHandlers() {        
          if (mapOnClick_addStops_connect) {
            mapOnClick_addStops_connect.remove();
          }
          if (mapOnClick_addBarriers_connect) {
            mapOnClick_addBarriers_connect.remove();
          }
        }

        //Solves the routes. Any errors will trigger the errorHandler function.
        function solveRoute() {
          removeEventHandlers();
          routeTask.solve(routeParams);
        }

        //Clears all routes
        function clearRoutes() {
          for (var i=routes.length-1; i>=0; i--) {
            map.graphics.remove(routes.splice(i, 1)[0]);
          }
          routes = [];
        }

        //Draws the resulting routes on the map
        function showRoute(evt) {
          clearRoutes();
          array.forEach(evt.result.routeResults, function(routeResult, i) {
            routes.push(
              map.graphics.add(
                routeResult.route.setSymbol(routeSymbols[routeResult.routeName])
                  
              )
            );
          });

          var msgs = ["Server messages:"];
          array.forEach(evt.result.messages, function(message) {
            msgs.push(message.type + " : " + message.description);
          });
          if (msgs.length > 1) {
            alert(msgs.join("\n - "));
          }
        }

        //Reports any errors that occurred during the solve
        function errorHandler(err) {
          alert("An error occured\n" + err.message + "\n" + err.details.join("\n"));
        }
      
     
  
      });

}

