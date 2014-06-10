$(function() {
    $.ajax({
        url: "ChaparralLaboratoriesPlants.kml",
        dataType: "xml",
        success: function( xmlResponse ) {
            var data = $( "Placemark", xmlResponse ).map(function() {
                return {
                    value: $( "name", this ).text().replace("?",""),
                    id: $( "coordinates", this ).text()
                };
            }).get();
            data.sort(function(a, b) { 
                return a.value.localeCompare(b.value);
            });
            for(i=0; i<data.length; ++i){
                var plntfrm = document.getElementById("routeForm");
                plntfrm.innerHTML += "<input type='checkbox' name='check" + i + "' id='" + data[i].value + "' value='" + data[i].id + "' onclick=\"tsprunner('" + data[i].value + "','" + data[i].id + "')\"><label for='" + data[i].value + "'>" + data[i].value + "</label><br>\r\n";
            }
            $( "#plants" ).autocomplete({
                source: data,
                minLength: 0,
                select: function( event, ui ) {
                    if(ui.item){
                        if(document.getElementById(ui.item.value).checked){
                            document.getElementById(ui.item.value).checked=false;
                            tsprunner(ui.item.value,ui.item.id);
                        }else{
                            document.getElementById(ui.item.value).checked=true;
                            tsprunner(ui.item.value,ui.item.id);
                        }
                        this.value = "";
                        return false;
                    }
                }

            });
        }
        });
	$.widget( "ui.timespinner", $.ui.spinner, {
		options: {
			// seconds
			step: 60 * 1000 * 15,
			// hours
			page: 4
		},
		_parse: function( value ) {
			if ( typeof value === "string" ) {
			// already a timestamp
				if ( Number( value ) == value ) {
					return Number( value );
				}
				return +Globalize.parseDate( value );
			}
			return value;
		},
		_format: function( value ) {
			return Globalize.format( new Date(value), "t" );
		}
	   });
    $("#timeSpinner").timespinner({
        spin: function(event,ui){
            $("#timeSpinner").timespinner("value", ui.value);
            if(tsp.getOrder()){
                var sortedIDs = $( "#my_textual_div" ).sortable( "toArray" );
                var sortedRoute = [sortedIDs.length];
                sortedRoute[0] = tsp.getOrder()[0];
                for (j = 0; j < sortedIDs.length; ++j) {
                sortedRoute[j+1] = sortedIDs[j];
            }
                sortedRoute.push(sortedRoute[0]);
                tsp.reorderSolution(sortedRoute);
            }
        }
        });
    //setup sortable route list
    $( "#my_textual_div" ).sortable({items: 'li[type=sortable]' });
    $( "#my_textual_div" ).disableSelection();
    $( "#my_textual_div" ).sortable({
            update: function( event, ui ) {
                var sortedIDs = $( "#my_textual_div" ).sortable( "toArray" );
                var sortedRoute = [sortedIDs.length];
                sortedRoute[0] = tsp.getOrder()[0];
                for (j = 0; j < sortedIDs.length; ++j) {
                    sortedRoute[j+1] = sortedIDs[j];
                }
                sortedRoute.push(sortedRoute[0]);
                tsp.reorderSolution(sortedRoute);
            }
        });

    //pause functions setup
    calcHolder=false;
    document.getElementById("routeCalc").style.display = "none";
    holderArray = [];

    //tsp and map setup
    var myOptions = {
        zoom: 9,
        center: new google.maps.LatLng(30.734137,-95.530212), //inital center on Chaparral
        mapTypeId: google.maps.MapTypeId.ROADMAP
        };
    myMap = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
    directionsPanel = document.getElementById("my_textual_div");
    tsp = new BpTspSolver(myMap, directionsPanel);
    tsp.setTravelMode(google.maps.DirectionsTravelMode.DRIVING);
    tsp.addWaypointWithLabel(new google.maps.LatLng(30.734137,-95.530212),"Chaparral"); //always begin with Chaparral
}); 

function tsprunner(plant,cords){
    if(!calcHolder){
        //get checkbox element
        var plantchk = document.getElementById(plant);
        //overlay
        var overlay = document.getElementById("overlay");
        //progressbar setup
        var progressbar = $( "#progressBar" ),
        progressLabel = $( ".progress-label" );
        progressbar.progressbar({
            value: false,
            complete: function() {
                $( "#progressBar" ).progressbar( "destroy" );
                overlay.setAttribute("class","overlayoff");
            }
        });
        //turn on overlay before begining work
        overlay.setAttribute("class","overlayon");
        //if checkbox was checked
        if (plantchk.checked){
            //if there are already ploted plants
            if(tsp.getWaypoints().length>1){
                tsp.addWaypointAgain(new google.maps.LatLng(cords.substring(11,20),cords.substring(0,10)),plant);
                tsp.solveRoundTrip(onSolveCallback);
            //if this is the first selected plant
            }else{
                tsp.addWaypointWithLabel(new google.maps.LatLng(cords.substring(11,20),cords.substring(0,10)),plant);
                tsp.solveRoundTrip(onSolveCallback);
            }
        //if checkbox was unchecked
        }else{
            //if there are multiple plants in the list, remove selected plant (by cords) and reload the list
            if(tsp.getWaypoints().length>2){
                tsp.removeWaypoint(new google.maps.LatLng(cords.substring(11,20),cords.substring(0,10)));
                //get leftover waypoints and labels
                var tempway=tsp.getWaypoints();
                var templab=tsp.getLabels();
                //reset
                tsp.startOver();
                //add in leftover waypoints with labels again
                for(i=0; i<tempway.length; ++i){
                    tsp.addWaypointWithLabel(tempway[i],templab[i]);
                }
                tsp.solveRoundTrip(onSolveCallback);
            }else{
                overlay.setAttribute("class","overlayoff");
                tsp.startOver();
                tsp.addWaypointWithLabel(new google.maps.LatLng(30.734137,-95.530212),"Chaparral"); //always begin with Chaparral
                document.getElementById("my_textual_div").innerHTML="";
                document.getElementById("path").innerHTML="";
                document.getElementById("exportGoogle").innerHTML="";
                document.getElementById("reverseRoute").innerHTML="";
            }
        }
    }
}

function tspholder(){
    var ta = $("input:checked");
    if(ta.length>0){
        if (calcHolder){
            var overlay = document.getElementById("overlay");
            overlay.setAttribute("class","overlayon");
            //progressbar setup
            var progressbar = $( "#progressBar" ),
            progressLabel = $( ".progress-label" );
            progressbar.progressbar({
                value: false,
                complete: function() {
                    $( "#progressBar" ).progressbar( "destroy" );
                    overlay.setAttribute("class","overlayoff");
                }
            });
            
            tsp.startOver();
            tsp.addWaypointWithLabel(new google.maps.LatLng(30.734137,-95.530212),"Chaparral");
            for(i=0; i<ta.length; ++i){
                tsp.addWaypointWithLabel(new google.maps.LatLng(ta[i].value.substring(11,20),ta[i].value.substring(0,10)), ta[i].id);
            }
            tsp.solveRoundTrip(onSolveCallback);

            calcHolder=false;
            document.getElementById("routeCalc").style.display = "none";
            document.getElementById("calcHold").style.display = "inline-block";
        }else{
            calcHolder=true;
            document.getElementById("routeCalc").style.display = "inline-block";
            document.getElementById("calcHold").style.display = "none";
        }
    }else{
        if(tsp.getWaypoints.length>1){
            tsp.startOver();
            tsp.addWaypointWithLabel(new google.maps.LatLng(30.734137,-95.530212),"Chaparral"); //always begin with Chaparral
            document.getElementById("my_textual_div").innerHTML="";
            document.getElementById("path").innerHTML="";
            document.getElementById("exportGoogle").innerHTML="";
            document.getElementById("reverseRoute").innerHTML="";
        }else{
            if(calcHolder){
                calcHolder=false;
                document.getElementById("routeCalc").style.display = "none";
                document.getElementById("calcHold").style.display = "inline-block";
            }else{
                calcHolder=true;
                document.getElementById("routeCalc").style.display = "inline-block";
                document.getElementById("calcHold").style.display = "none";
            }
        }
    }
}

function dircolapse(id){
    var elem = document.getElementById(id);
    var idholder = "#" + id;
    if ($(idholder).css("display") == "none"){
        elem.style.display = "block";
    }else{
        elem.style.display = "none";
    }
}