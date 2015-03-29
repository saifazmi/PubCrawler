var barObjs = [];   
var latlon = "";

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
    requestData("https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=" + latlon + "&radius=10000&keyword=pub&key=AIzaSyCBdAGUQD8ythoZ1FsbwfkYpVIGHJ1bRyE", loadBars);
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
    showBars();
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
    return barObjs;   
}

function showBars(){
    var $list = $("<ul>");
    
    for(var i = 0; i < barObjs.length; i++){
        var $li = $("<li>");
        var $bar = $("<input>", {type: "checkbox", checked: "true"});
        
        $li.append($bar);
        $li.append(barObjs[i].name);
        
        $list.append($li);
    }
    console.log($list);
    $(".panel-body").append($list);
    $list.sortable();
}   


//**************************** ESRI CODE ***********************\\
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
          center: [-1.9,52.48],
          zoom: 13,
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
        on(dom.byId("addStopsBtn"), "click", addStops);
        //on(dom.byId("clearStopsBtn"), "click", clearStops);
       // on(dom.byId("addBarriersBtn"), "click", addBarriers);
       // on(dom.byId("clearBarriersBtn"), "click", clearBarriers);
        on(dom.byId("solveRoutesBtn"), "click", solveRoute);
       // on(dom.byId("clearRoutesBtn"), "click", clearRoutes);        

        //Begins listening for click events to add stops
        function addStops() {
          removeEventHandlers();
            var barObjs = getBarObjs();
            
            for(var i=0; i<barObjs.length; i++){ 
                var obj = barObjs[i];
                mapOnClick_addStops_connect = addOurStop(obj.longitude, obj.latitude);
            }
            //get in dans data from json, extract the lon and lat from that
            //loop for number of items in json
                //call addourstop(x,y) where x y are from json
           
            
        //mapOnClick_addStops_connect = map.on("click", addStop);
            
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
                { RouteName:dom.byId("routeName").value }
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
                { RouteName:dom.byId("routeName").value }
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