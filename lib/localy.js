'use strict';

var socket = io();
var map = L.map('map');
	Locator.baseMaps["Pencil"].addTo(map);
	L.control.layers(Locator.baseMaps).addTo(map);
	L.control.scale().addTo(map);

  var geojson = L.geoJson(neighborhoods, {
    style: style,
    onEachFeature: onEachFeature
  }).addTo(map);
	
var name, selfID;
var markers = {};
var markerData = {};
var clusters = L.markerClusterGroup();

$(document).ready(function(){
	
	/* Page listeners */
	$("#name-input").keyup(function(event){
	    if(event.keyCode == 13){
				name = $("#name-input").val();
	  	  Locator.getLocation(name, function(position, name){
					selfID = socket.io.engine.id;
					
					socket.emit('load marker', position, name, selfID);
					socket.emit('load map', selfID);
	  	  });
		    $("#page-modal").fadeOut("slow");
	    }
	});

  $('form#chat-form').submit(function(e){
			e.preventDefault();
    	socket.emit('chat message', $('input#chat-input').val(), socket.io.engine.id);
			$('input#chat-input').val('');
  });
	
	/* Socket listeners */
	socket.on('load map', function(serverMarkerData){		
		Object.keys(serverMarkerData).forEach(function(userID){
			if (userID !== selfID){
				Locator.loadMarker(serverMarkerData[userID].coords, serverMarkerData[userID].name, userID);				
			}
		});
		
		map.addLayer(clusters);		
	});

  socket.on('user count', function(size){ 
		$("div#user-count").html("Users: " + size);
	});
	
  socket.on('chat message', function(msg, userID){
		var marker = markers[userID].marker;
		var userName = markers[userID].name;
		var myUsername = "";
		var popup = marker.getPopup();
		
		popup.setContent(popup._content + "<br>" + msg);
		
		if (userID === selfID) myUsername = " my-username";
		
		$("div#chatbox ul").append("<li><span class='username" + myUsername + "'>" + userName + "</span>: <span class='message'>" + msg + "</span></li>");
		
		var contentBody = $("span[id='popup-header-" + userID + "']").parent();
		var heightToScroll = contentBody.height();
		var contentWrapper = contentBody.parent();
		
		marker.openPopup();
	  contentWrapper.animate({ scrollTop: heightToScroll }, "fast");
	  $("div#chatbox").animate({ scrollTop: $("ul#chatbody").height() }, "fast");
	});
	
  socket.on('load marker', Locator.loadMarker);
  socket.on('delete marker', Locator.deleteMarker);
	
});