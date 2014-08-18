var socket = io();
var map, name;
var markers = {};
var selfID = Math.floor(Math.random() * (999999999999999 - 100000000000000 + 1) + 100000000000000);

$(document).ready(function(){
	
/* Page listeners */
	$("#name-input").keyup(function(event){
	    if(event.keyCode == 13){
			name = $("#name-input").val();
	  	    Locator.getLocation(name);
		    $("#page-modal").fadeOut("slow");
	    }
	});

  $('form#chat-form').submit(function(e){
			e.preventDefault();
    	socket.emit('chat message', $('input#chat-input').val(), selfID);
			$('input#chat-input').val('');
  });
	
/* Socket listeners */
	socket.on('load map', function(serverMarkerData){
		Object.keys(serverMarkerData).forEach(function(userID){
			if (userID !== selfID){
				var coords = serverMarkerData[userID][0];
				var name = serverMarkerData[userID][1];
			
				Locator.loadMarker(coords, name, userID);
			}
		})
	});

  socket.on('user count', function(size){ 
		$("span#user-count").html("Users: " + size);
	});
	
  socket.on('chat message', function(msg, userID){
		var marker = markers[userID];
		var popup = marker.getPopup();

		popup.setContent(popup._content + "<br>" + msg);
		
		var contentBody = $("span[id='popup-header-" + userID + "']").parent();
		var heightToScroll = contentBody.height();
		var contentWrapper = contentBody.parent();
		
		marker.openPopup();
	  contentWrapper.animate({ scrollTop: heightToScroll }, "slow");
	});
	
  socket.on('load marker', Locator.loadMarker);
  socket.on('delete marker', Locator.deleteMarker);
	
});