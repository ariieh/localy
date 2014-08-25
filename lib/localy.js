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

window.Localy = {
	pageLoaderShow: function(){
		var opts = {
		  lines: 13, // The number of lines to draw
		  length: 100, // The length of each line
		  width: 25, // The line thickness
		  radius: 70, // The radius of the inner circle
		  corners: 1, // Corner roundness (0..1)
		  rotate: 0, // The rotation offset
		  direction: 1, // 1: clockwise, -1: counterclockwise
		  color: '#ffffff', // #rgb or #rrggbb or array of colors
		  speed: 1, // Rounds per second
		  trail: 52, // Afterglow percentage
		  shadow: false, // Whether to render a shadow
		  hwaccel: false, // Whether to use hardware acceleration
		  className: 'spinner', // The CSS class to assign to the spinner
		  zIndex: 2e9, // The z-index (defaults to 2000000000)
		  top: '50%', // Top position relative to parent
		  left: '50%' // Left position relative to parent
		};
		
		$("#page-modal .modal-text").fadeOut();
		new Spinner(opts).spin(document.getElementById('page-modal'));
	},
	
	swapChatTitle: function(name){
		$("div#chatroom").html("Chatroom: " + name);
		$("div#chatroom").stop().animate({backgroundColor:'#e67e22'}, 400, function(){
		    $("div#chatroom").animate({backgroundColor:'rgba(32, 32, 32, 0.8)'}, 400);
		});
	}
}

$(document).ready(function(){
	
	/* Page listeners */
	$("#name-input").keyup(function(event){
		
    if(event.keyCode == 13){
			Localy.pageLoaderShow();
			name = $("#name-input").val();
  	  Locator.getLocation(name, function(position, name, placeName){
				selfID = socket.io.engine.id;
				
				socket.emit('load marker', position, name, selfID, placeName);
				socket.emit('load map', selfID);
  	  });
			
    }
	});

  $('form#chat-form').submit(function(e){
			e.preventDefault();
    	socket.emit('chat message', $('input#chat-input').val(), socket.io.engine.id);
			$('input#chat-input').val('');
  });
	
	/* Socket listeners */
	socket.on('load map', function(users){
		for (var i = 0; i < users.length; i++){
			var user = users[i];
			if (user.socket_id !== selfID) Locator.loadMarker(user);
		}

    $("#page-modal").fadeOut("slow");
		map.addLayer(clusters);
	});

  socket.on('user count', function(size){
		$("div#user-count").html("Users: " + size);
	});
	
  socket.on('chat message', function(msg, userID){
		var marker = markers[userID].marker;
		var userName = markers[userID].name;
		var myUsername = "";
		var content;
		var popup = marker.getPopup();
				
		if (userID === selfID) myUsername = " my-username";
		content = "<li><span class='username"+myUsername+"'>"+userName+"</span>: <span class='message'>"+msg+"</span></li>";
		
		popup.setContent(popup._content + "<br>" + msg);
		
		var contentBody = $("span[id='popup-header-" + userID + "']").parent();
		var heightToScroll = contentBody.height();
		var contentWrapper = contentBody.parent();
		
		marker.openPopup();
	  contentWrapper.animate({ scrollTop: heightToScroll }, "fast");
		
		$("div#chatbox ul").append(content);
	  $("div#chatbox").animate({ scrollTop: $("ul#chatbody").height() }, "fast");
	});
	
  socket.on('load marker', Locator.loadMarker);
  socket.on('delete marker', Locator.deleteMarker);
	
});