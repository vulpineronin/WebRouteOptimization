var tsp; // The BpTspSolver object which handles the TSP computation.
var dirRenderer;  //!!!remove? Need pointer to path to clean up.

function formatTime(seconds) {
    var days;
    var hours;
    var minutes;
    days = parseInt(seconds / (24*3600));
    seconds -= days * 24 * 3600;
    hours = parseInt(seconds / 3600);
    seconds -= hours * 3600;
    minutes = parseInt(seconds / 60);
    seconds -= minutes * 60;
    var ret = "";
    if (days > 0) 
	ret += days + " days ";
    if (days > 0 || hours > 0) 
	ret += hours + " hrs ";
    if (days > 0 || hours > 0 || minutes > 0) 
	ret += minutes + " min ";
    if (days == 0 && hours == 0)
	ret += seconds + " sec";
    return(ret);
}

function formatLength(meters) {
    var km = parseInt(meters / 1000);
    meters -= km * 1000;
    var ret = "";
    if (km > 0) 
	ret += km + " km ";
    if (km < 10)
	ret += meters + " m";
    return(ret);
}

function formatLengthMiles(meters) {
  var sMeters = meters * 0.621371192;
  var miles = parseInt(sMeters / 1000);
  var commaMiles = parseInt((sMeters - miles * 1000 + 50) / 100);
  var ret = miles + "." + commaMiles + " miles";
  return(ret);
}

function formatDirections(gdir, mode) {
    var addr = tsp.getAddresses();
    var labels = tsp.getLabels();
    var order = tsp.getOrder();
    var retStr = "\nAll times calculate in 15 min. for each stop to collect and process samples.<br>\r\nDrag to re-order stops.<br>\r\nClick stop to expand directions to next stop:<ul id='routeListDir'>";
    var dragStr = "<b><u>Drag to re-order stops: </u><br>";
    var retArr = new Array();
    var clitime = new Date($( "#timeSpinner" ).timespinner( "value" ));

    retStr += "<li><ul><li style='display:inline-block;width:10em;'>Departure Time</li><li style='display:inline-block;'>Location</li></ul></li>"
    //headers
    for (var i = 0; i < gdir.legs.length; ++i) {
        var route = gdir.legs[i];
        var colour = "g";
        var number = i+1;
        var legdur = gdir.legs[i].duration.value
        retStr += ( i ? "\t<li id='" + i + "' type='sortable'>" : "<li>" );

            retStr += "<ul>"
                        + "<li style='display:inline-block;width:10em;'>" 
                        + ( i ? "<div class=\"ui-icon ui-icon-arrowthick-2-n-s\" style='display:inline-block'></div>" : "" ) 
                        + ( i ? clitime.toLocaleTimeString('en-US', {hour12: false, hour: "numeric", minute: "numeric"}) : "<div style='width:16px;display:inline-block;'></div>" + clitime.toLocaleTimeString('en-US', {hour12: false, hour: "numeric", minute: "numeric"}) ) 
                        + "</li><li style='display:inline-block;' onclick=\"dircolapse('drop" + i + "');\">";
                                var headerStr;
                                var lilbl;
                                if (labels[order[i]] != null && labels[order[i]] != "") {
                                    headerStr = labels[order[i]];
                                    lilbl = gdir.legs[i].start_location.toString().replace(/<(?:.|\n)*?>/gm,"");
                                } else if (addr[order[i]] != null) {
                                    headerStr = addr[order[i]];
                                    gdir.legs[i].start_location.toString().replace(/<(?:.|\n)*?>/gm,"");
                                } else {
                                    var prevI = (i == 0) ? gdir.legs.length - 1 : i-1;
                                    var latLng = gdir.legs[prevI].end_location;
                                    headerStr = gdir.legs[i].start_location.toString().replace(/<(?:.|\n)*?>/gm,"");
                                    gdir.legs[i].start_location.toString();
                                }
            //legs text
            retStr += headerStr + "\n<table id='drop" + i + "' class='routedir' style='display:none;' padding=2px>";
            for (var j = 0; j < route.steps.length; ++j) {
                retStr += "<tr><td class='dirleg'>" 
                + route.steps[j].instructions.replace(/<(?:.|\n)*?>/gm,"") + "</td><td class='dirlegdist'>"
                + route.steps[j].distance.text.replace(/<(?:.|\n)*?>/gm,"") + "</td></tr>";
            }
        retStr += "</table></div></li></ul></li>"
        clitime.setSeconds(clitime.getDate() + legdur);
        if(i){clitime.setSeconds(clitime.getDate() + (15 * 60));}
    }
    retStr += "</ul>";
    retArr[0] = dragStr;
    retArr[1] = retStr;
    return(retArr);
}

function createGoogleLink(gdir) {
    var addr = tsp.getAddresses();
    var order = tsp.getOrder();
    var ret = "http://maps.google.com/maps?saddr=";
    for (var i = 0; i < order.length; ++i) {
	if (i == 1) {
	    ret += "&daddr=";
	} else if (i >= 2) {
	    ret += " to:";
	}
	if (addr[order[i]] != null && addr[order[i]] != "") {
	    ret += addr[order[i]];
	} else {
	    if (i == 0) {
		ret += gdir.legs[0].start_location.toString();
	    } else {
		ret += gdir.legs[i-1].end_location.toString();
	    }
	}
    }
    return ret;
}

function getWindowHeight() {
    if (typeof(window.innerHeight) == 'number')
	return window.innerHeight;
    if (document.documentElement && document.documentElement.clientHeight)
	return document.documentElement.clientHeight;
    if (document.body && document.body.clientHeight)
	return document.body.clientHeight;
    return 800;
}

function getWindowWidth() {
    if (typeof(window.innerWidth) == 'number')
	return window.innerWidth;
    if (document.documentElement && document.documentElement.clientWidth)
	return document.documentElement.clientWidth;
    if (document.body && document.body.clientWidth)
	return document.body.clientWidth;
    return 1200;
}

function onProgressCallback(tsp) {
    var computed = tsp.getNumDirectionsComputed();
    var needed = tsp.getNumDirectionsNeeded();
  $('#progressBar').progressbar('value', 100 * (computed / needed));
}

//!!!!remove function
function setViewportToCover(waypoints) {
    var bounds = new google.maps.LatLngBounds();
    for (var i = 0; i < waypoints.length; ++i) {
	bounds.extend(waypoints[i]);
    }
    gebMap.fitBounds(bounds);
}

//!!!!remove function
function initMap(center, zoom, div) {
    var myOptions = {
	zoom: zoom,
	center: center,
	mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    gebMap = new google.maps.Map(div, myOptions);
    google.maps.event.addListener(gebMap, "click", function(event) {
	tsp.addWaypoint(event.latLng, addWaypointSuccessCallback);
    });
}

//!!!!remove map items
function loadAtStart(lat, lng, zoom) {
    var center = new google.maps.LatLng(lat, lng);
    initMap(center, zoom, document.getElementById("map"));
    directionsPanel = document.getElementById("my_textual_div");
    
    tsp = new BpTspSolver(gebMap, directionsPanel);
    google.maps.event.addListener(tsp.getGDirectionsService(), "error", function() {
	alert("Request failed: " + reasons[tsp.getGDirectionsService().getStatus().code]);
    });
}

function addWaypointWithLabel(latLng, label) {
    tsp.addWaypointWithLabel(latLng, label, addWaypointSuccessCallbackZoom);
}

function addWaypoint(latLng) {
    addWaypointWithLabel(latLng, null, addWaypointSuccessCallbackZoom);
}

function addAddressAndLabel(addr, label) {
    tsp.addAddressWithLabel(addr, label, addAddressSuccessCallbackZoom);
}

function addAddress(addr) {
    addAddressAndLabel(addr, null);
}

function clickedAddAddress() {
    addAddress(document.address.addressStr.value);
}

function startOver() {
    document.getElementById("my_textual_div").innerHTML = "";
    document.getElementById("path").innerHTML = "";
    var center = gebMap.getCenter();
    var zoom = gebMap.getZoom();
    var mapDiv = gebMap.getDiv();
    initMap(center, zoom, mapDiv);
    tsp.startOver(); // doesn't clearOverlays or clear the directionsPanel
}

function directions(m, walking, avoid) {
    $('#dialogProgress').dialog('open');
    tsp.setAvoidHighways(avoid);
    if (walking)
	tsp.setTravelMode(google.maps.DirectionsTravelMode.WALKING);
    else
	tsp.setTravelMode(google.maps.DirectionsTravelMode.DRIVING);
    tsp.setOnProgressCallback(onProgressCallback);
    if (m == 0)
	tsp.solveRoundTrip(onSolveCallback);
    else
	tsp.solveAtoZ(onSolveCallback);
}

function getTotalDuration(dir) {
    var sum = 0;
    for (var i = 0; i < dir.legs.length; i++) {
	sum += dir.legs[i].duration.value;
    }
    sum += ((dir.legs.length -1) * 15 * 60);
    return sum;
}

function getTotalDistance(dir) {
    var sum = 0;
    for (var i = 0; i < dir.legs.length; i++) {
	sum += dir.legs[i].distance.value;
    }
    return sum;
}

function return_value(x){
return x;
}

function onSolveCallback(myTsp) {
    var dirRes = tsp.getGDirections();
    var dir = dirRes.routes[0];
    // Print shortest roundtrip data:
    var pathStr = "";
    var endTime = new Date($( "#timeSpinner" ).timespinner( "value" ) + (getTotalDuration(dir)*1000));
    pathStr="<div class='ui-state-highlight ui-corner-all' style='display:inline-block; padding-right:15px; padding-left:5px'><p><span class='ui-icon ui-icon-info' style='float: left; margin-right: .1em;'></span>";
    if(getTotalDuration(dir)>28800){pathStr="<div class='ui-state-error ui-corner-all' style='display:inline-block; padding-right:15px; padding-left:5px'><span class='ui-icon ui-icon-alert' style='float: left; margin-right: .1em;'></span>";}
    pathStr += formatLengthMiles(getTotalDistance(dir)) + " - " + formatTime(getTotalDuration(dir)) + " ( " + endTime.toLocaleTimeString('en-US', {hour12: false, hour: "numeric", minute: "numeric"}) + " )";
    pathStr += "</p></div>";
    document.getElementById("path").innerHTML = pathStr;

    var formattedDirections = formatDirections(dir);
    document.getElementById("my_textual_div").innerHTML = formattedDirections[1];
    document.getElementById("exportGoogle").innerHTML = "<input id='googleButton' value='View in Google Maps' type='button' class='ui-button' onClick='window.open(\"" + createGoogleLink(dir) + "\",\"_blank\");' />";
    document.getElementById("reverseRoute").innerHTML = "<input id='reverseButton' value='Reverse Route' type='button' class='ui-button' onClick='reverseRoute()' />";

    // Clean up old path.
    if (dirRenderer != null) {
	dirRenderer.setMap(null);
    }

  	var my_waypoints = tsp.getWaypoints();
  	var my_array_waypoints = new Array();

	//build waypoints array for the direction.service request
	var chunck_size = 3; 
	var slices = Math.round((my_waypoints.length)/chunck_size);
        //var slices = 3;
        var directionsService = new google.maps.DirectionsService();
        var directionDisplay_array = new Array();
  
	var mapOptions = { center: new google.maps.LatLng(38.55818644,-7.910561953), zoom: 3,
        mapTypeId: google.maps.MapTypeId.ROADMAP };
        map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);	
	
        
	for(var it_slices = 0 ; it_slices < slices ; ++it_slices){
	var my_start='';
	var my_end='';
	var previous_waypoint = new Array();
		/*build waypoints*/
		temp_my_array_waypoints = new Array();
		for(var i = (chunck_size*it_slices); i < (chunck_size*(it_slices+1));++i){
  				var listLine = my_waypoints[i];
  				listLine = listLine+'';
  				var cleanStr = listLine.replace(/[^\d.,-]/g, "");
  				var latLngArr = cleanStr.split(",");
 				var lat = parseFloat(latLngArr[0]);
				var lng = parseFloat(latLngArr[1]);
  				temp_my_array_waypoints.push({ location: new google.maps.LatLng(lat,lng) , stopover:true });
  				if(previous_waypoint.length == 0){
  					my_start = new google.maps.LatLng(lat,lng);
  				}
  				previous_waypoint.push({ location: new google.maps.LatLng(lat,lng) , stopover:true });
  				my_end = new google.maps.LatLng(lat,lng); 	
  				 
  			}
  			
  		directionDisplay_array.push(
		new google.maps.DirectionsRenderer({suppressInfoWindows: false,	suppressMarkers: false })
		);
		
		(directionDisplay_array[(directionDisplay_array.length)-1]).setMap(map);
			
  		/*build request*/
		var request = {
    			origin:my_start,
    			waypoints:temp_my_array_waypoints,
    			destination:my_end,
    			travelMode: google.maps.TravelMode.DRIVING
  			};
  			
  	 		directionsService.route(request, function(response, status) {
   	 			if (status == google.maps.DirectionsStatus.OK) {
      					(directionDisplay_array[(directionDisplay_array.length)-1]).setDirections(response);
    					}
  			});
	}
	
	var bestPathLatLngStr = dir.legs[0].start_location.toString() + "\n";
    for (var i = 0; i < dir.legs.length; ++i) {
	bestPathLatLngStr += dir.legs[i].end_location.toString() + "\n";
    }
    var durationsMatrixStr = "";
    var dur = tsp.getDurations();
    for (var i = 0; i < dur.length; ++i) {
	   for (var j = 0; j < dur[i].length; ++j) {
	       durationsMatrixStr += dur[i][j];
	       if (j == dur[i].length - 1) {
		      durationsMatrixStr += "\n";
	       } else {
		      durationsMatrixStr += ", ";
	       }
	    }
    }
}

function reverseRoute() {
    tsp.reverseSolution();
}
