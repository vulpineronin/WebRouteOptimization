/*
  These are the implementation-specific parts of the OptiMap application at
  http://www.gebweb.net/optimap

  This should serve as an example on how to use the more general BpTspSolver.js
  from http://code.google.com/p/google-maps-tsp-solver/

  Author: Geir K. Engdahl
*/

var tsp; // The BpTspSolver object which handles the TSP computation.
var mode; //!!!!remove variable
var markers = new Array();  //!!!remove? Need pointers to all markers to clean up.
var dirRenderer;  //!!!remove? Need pointer to path to clean up.

/* Returns a textual representation of time in the format 
 * "N days M hrs P min Q sec". Does not include days if
 * 0 days etc. Does not include seconds if time is more than
 * 1 hour.
 */
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

/* Returns textual representation of distance in the format
 * "N km M m". Does not include km if less than 1 km. Does not
 * include meters if km >= 10.
 */
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

/* Returns textual representation of distance in the format
 * "N.M miles".
 */
function formatLengthMiles(meters) {
  var sMeters = meters * 0.621371192;
  var miles = parseInt(sMeters / 1000);
  var commaMiles = parseInt((sMeters - miles * 1000 + 50) / 100);
  var ret = miles + "." + commaMiles + " miles";
  return(ret);
}

/* Returns two HTML strings representing the driving directions.
 * Icons match the ones shown in the map. Addresses are used
 * as headers where available.
 * First string is suitable for use in reordering the directions.
 * Second string is suitable for printed directions.
 */
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
            retStr += headerStr + "\n<ul id='drop" + i + "' style='display:none;'>";
            for (var j = 0; j < route.steps.length; ++j) {
                retStr += "<li>" 
                + route.steps[j].instructions.replace(/<(?:.|\n)*?>/gm,"") + " - "
                + route.steps[j].distance.text.replace(/<(?:.|\n)*?>/gm,"") + "</li>";
            }
        retStr += "</ul></div></li></ul></li>"
        clitime.setSeconds(clitime.getDate() + legdur);
        if(i){clitime.setSeconds(clitime.getDate() + (15 * 60));}
    }
    retStr += "</ul>";
    retArr[0] = dragStr;
    retArr[1] = retStr;
    return(retArr);
}

//!!!!remove function
function createTomTomLink(gdir) {
    var addr = tsp.getAddresses();
    var labels = tsp.getLabels();
    var order = tsp.getOrder();
    var addr2 = new Array();
    var label2 = new Array();
    for (var i = 0; i < order.length; ++i) {
	addr2[i] = addr[order[i]];
	if (order[i] < labels.length && labels[order[i]] != null && labels[order[i]] != "")
	    label2[i] = labels[order[i]];
    }
    //var itn = createTomTomItineraryItn(gdir, addr2, label2);
    var retStr = "<form method='GET' action='tomtom.php'>\n";
    // retStr += "<input type='hidden' name='itn' value='" + itn + "' />\n";
    //retStr += "<input id='tomTomButton' class='calcButton' type='submit' value='Send to TomTom' />\n";
    retStr += "</form>\n";
    return retStr;
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
function setMarkerAsStart(marker) {
    marker.infoWindow.close();
    tsp.setAsStart(marker.getPosition());
    drawMarkers(false);
}

//!!!!remove function
function setMarkerAsStop(marker) {
    marker.infoWindow.close();
    tsp.setAsStop(marker.getPosition());
    drawMarkers(false);
}

//!!!!remove function
function removeMarker(marker) {
    marker.infoWindow.close();
    tsp.removeWaypoint(marker.getPosition());
    drawMarkers(false);
}

//!!!!remove function
function drawMarker(latlng, addr, label, num) {
    var icon;
    icon = new google.maps.MarkerImage("images/red" + (num + 1) + ".png");
    var marker = new google.maps.Marker({ 
        position: latlng, 
	icon: icon, 
	map: gebMap });
    google.maps.event.addListener(marker, 'click', function(event) {
	var addrStr = (addr == null) ? "" : addr + "<br>";
	var labelStr = (label == null) ? "" : "<b>" + label + "</b><br>";
	var markerInd = -1;
	for (var i = 0; i < markers.length; ++i) {
	    if (markers[i] != null && marker.getPosition().equals(markers[i].getPosition())) {
		markerInd = i;
		break;
	    }
	}
	var infoWindow = new google.maps.InfoWindow({ 
	    content: labelStr + addrStr
		+ "<a href='javascript:setMarkerAsStart(markers[" 
		+ markerInd + "]"
		+ ")'>"
		+ "Set as starting location"
		+ "</a><br>"
		+ "<a href='javascript:setMarkerAsStop(markers["
		+ markerInd + "])'>"
		+ "Set as ending location"
		+ "</a><br>"
		+ "<a href='javascript:removeMarker(markers["
		+ markerInd + "])'>"
		+ "Remove location</a>",
	    position: marker.getPosition() });
	marker.infoWindow = infoWindow;
	infoWindow.open(gebMap);
	//    tsp.removeWaypoint(marker.getPosition());
	//    marker.setMap(null);
    });
    markers.push(marker);
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

function addAddressSuccessCallback(address, latlng) {
    if (latlng) {
	drawMarkers(false);
    } else {
	alert('Failed to geocode: ' + address);
    }
}

function addAddressSuccessCallbackZoom(address, latlng) {
    if (latlng) {
	drawMarkers(true);
    } else {
	alert('Failed to geocode: ' + address);
    }
}

function addWaypointSuccessCallback(latlng) {
    if (latlng) {
	drawMarkers(false);
    }
}

function addWaypointSuccessCallbackZoom(latlng) {
    if (latlng) {
	drawMarkers(true);
    }
}

//!!!!remove function
function drawMarkers(updateViewport) {
    removeOldMarkers();
    var waypoints = tsp.getWaypoints();
    var addresses = tsp.getAddresses();
    var labels = tsp.getLabels();
    for (var i = 0; i < waypoints.length; ++i) {
	drawMarker(waypoints[i], addresses[i], labels[i], i);
    }
    if (updateViewport) {
	setViewportToCover(waypoints);
    }
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
    mode = m;
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

//!!!!remove function
function removeOldMarkers() {
    for (var i = 0; i < markers.length; ++i) {
	markers[i].setMap(null);
    }
    markers = new Array();
}

function return_value(x){
return x;
}

//!!!!remove image refs
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

    var formattedDirections = formatDirections(dir, mode);
    //document.getElementById("routeDrag").innerHTML = formattedDirections[0];
    document.getElementById("my_textual_div").innerHTML = formattedDirections[1];
    //document.getElementById("tomtom").innerHTML = createTomTomLink(dir);
    document.getElementById("exportGoogle").innerHTML = "<input id='googleButton' value='View in Google Maps' type='button' class='ui-button' onClick='window.open(\"" + createGoogleLink(dir) + "\",\"_blank\");' />";
    document.getElementById("reverseRoute").innerHTML = "<input id='reverseButton' value='Reverse Route' type='button' class='ui-button' onClick='reverseRoute()' />";
    removeOldMarkers();

    // Add nice, numbered icons.
    if (mode == 1) {
	var myPt1 = dir.legs[0].start_location;
	var myIcn1 = new google.maps.MarkerImage("images/blue.png");
	var marker = new google.maps.Marker({ 
            position: myPt1, 
	    icon: myIcn1, 
	    map: myMap });
	markers.push(marker);
    }
    for (var i = 0; i < dir.legs.length; ++i) {
	var route = dir.legs[i];
	var myPt1 = route.end_location;
	var myIcn1;
	if (i == dir.legs.length - 1 && mode == 0) {
	    myIcn1 = new google.maps.MarkerImage("images/beige.png");
	} else {
	    myIcn1 = new google.maps.MarkerImage("images/black.png"); //("images/blue" + (i+2) + ".png");
	}
	var marker = new google.maps.Marker({
            position: myPt1,
	    icon: myIcn1,
	    map: myMap });
	markers.push(marker);
    }
    // Clean up old path.
    if (dirRenderer != null) {
	dirRenderer.setMap(null);
    }

  	var my_waypoints = tsp.getWaypoints();
  	var my_array_waypoints = new Array();

	//build waypoints array for the direction.service request
    //!!!!!!!!!!!!!this does not take into account inactive waypoints
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
    //!!!!CollapsibleLists.apply();
}

//!!!!remove function???
function clickedAddList() {
  var val = document.listOfLocations.inputList.value;
  val = val.replace(/\t/g, ' ');
  addList(document.listOfLocations.inputList.value);
}

//!!!!remove function???
function addList(listStr) {
    var listArray = listStr.split("\n");
    for (var i = 0; i < listArray.length; ++i) {
	var listLine = listArray[i];
	if (listLine.match(/\(?\s*\-?\d+\s*,\s*\-?\d+/) ||
	    listLine.match(/\(?\s*\-?\d+\s*,\s*\-?\d*\.\d+/) ||
	    listLine.match(/\(?\s*\-?\d*\.\d+\s*,\s*\-?\d+/) ||
	    listLine.match(/\(?\s*\-?\d*\.\d+\s*,\s*\-?\d*\.\d+/)) {
	    // Line looks like lat, lng.
	    var cleanStr = listLine.replace(/[^\d.,-]/g, "");
	    var latLngArr = cleanStr.split(",");
	    if (latLngArr.length == 2) {
		var lat = parseFloat(latLngArr[0]);
		var lng = parseFloat(latLngArr[1]);
		var latLng = new google.maps.LatLng(lat, lng);
		tsp.addWaypoint(latLng, addWaypointSuccessCallbackZoom);
	    }
	} else if (listLine.match(/\S+/)) {
	    // Non-empty line that does not look like lat, lng. Interpret as address.
	    tsp.addAddress(listLine, addAddressSuccessCallbackZoom);
	}
    }
}

function reverseRoute() {
    tsp.reverseSolution();
}
