function formatDirections(gdir, mode) {
    var addr = tsp.getAddresses();
    var labels = tsp.getLabels();
    var order = tsp.getOrder();
    var retStr = "\nAll times calculate in 15 min. for each stop to collect and process samples.<br>\r\nDrag to re-order stops.<br>\r\nClick stop to expand directions to next stop:<ul class=\"collapsibleList\">";
    var dragStr = "<b><u>Drag to re-order stops: </u><br>";
    var retArr = new Array();
    var clitime = new Date($( "#timeSpinner" ).timespinner( "value" ));

    //headers
    for (var i = 0; i < gdir.legs.length; ++i) {
    	var route = gdir.legs[i];
    	var colour = "g";
    	var number = i+1;
        var legdur = gdir.legs[i].duration.value
        retStr += ( i ? "\t<li id='" + i + "' type='sortable'><div class=\"ui-icon ui-icon-arrowthick-2-n-s\" style='display:inline-block'></div>" : "<li>" )
            + ( i ? clitime.toLocaleTimeString('en-US', {hour12: false}) + " - " : "<div style='width:16px;display:inline-block;'></div>" + clitime.toLocaleTimeString('en-US', {hour12: false}) + " - " );
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
    	retStr += headerStr + "\n<div class='clidirdrop' style='white-space: nowrap'><ul style='white-space: nowrap'>";
    	for (var j = 0; j < route.steps.length; ++j) {
    	    retStr += "<li style='white-space: nowrap'>" 
            + route.steps[j].instructions.replace(/<(?:.|\n)*?>/gm,"") + " - "
    		+ route.steps[j].distance.text.replace(/<(?:.|\n)*?>/gm,"") + "</li>";
    	}
        retStr += "</ul></div></li>"
        clitime.setSeconds(clitime.getDate() + legdur);
        if(i){clitime.setSeconds(clitime.getDate() + (15 * 60));}
    }
    retStr += "</ul>";
    retArr[0] = dragStr;
    retArr[1] = retStr;
    return(retArr);
}