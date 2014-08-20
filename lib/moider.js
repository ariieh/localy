'use strict';

var socket = io();
var map = L.map('map');
	Locator.baseMaps["Pencil"].addTo(map);
	L.control.layers(Locator.baseMaps).addTo(map);

  var geojson = L.geoJson(neighborhoods, {
    style: style,
    onEachFeature: onEachFeature
  }).addTo(map);
	
var name;
var markers = {};
var markerData = {};

$(document).ready(function(){
	
	/* Page listeners */
	$("#name-input").keyup(function(event){
	    if(event.keyCode == 13){
				name = $("#name-input").val();
	  	  Locator.getLocation(name, function(){
					socket.emit('load map', socket.io.engine.id);
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
		console.log('loading map...');
		Object.keys(serverMarkerData).forEach(function(userID){
			if (userID !== socket.io.engine.id){
				Locator.loadMarker(serverMarkerData[userID].coords, serverMarkerData[userID].name, userID);
			}
		})
	});

  socket.on('user count', function(size){ 
		$("div#user-count").html("Users: " + size);
	});
	
  socket.on('chat message', function(msg, userID){
		var marker = markers[userID].marker;
		var popup = marker.getPopup();

		popup.setContent(popup._content + "<br>" + msg);
		$("div#chatbox ul").append("<li>" + msg + "</li>");
		
		var contentBody = $("span[id='popup-header-" + userID + "']").parent();
		var heightToScroll = contentBody.height();
		var contentWrapper = contentBody.parent();
		
		marker.openPopup();
	  contentWrapper.animate({ scrollTop: heightToScroll }, "slow");
	});
	
  socket.on('load marker', Locator.loadMarker);
  socket.on('delete marker', Locator.deleteMarker);
	
});