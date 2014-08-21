'use strict';

window.Locator = {
	baseMaps: {Pencil: L.tileLayer("https://a.tiles.mapbox.com/v4/examples.a4c252ab/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6IlhHVkZmaW8ifQ.hAMX5hSW-QnTeRCMAy9A8Q"),
	Comic: L.tileLayer("https://b.tiles.mapbox.com/v4/examples.bc17bb2a/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6IlhHVkZmaW8ifQ.hAMX5hSW-QnTeRCMAy9A8Q"),
	Pirate: L.tileLayer("https://b.tiles.mapbox.com/v4/examples.a3cad6da/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6IlhHVkZmaW8ifQ.hAMX5hSW-QnTeRCMAy9A8Q"),
	Zombie: L.tileLayer("https://b.tiles.mapbox.com/v4/examples.fb8f9523/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6IlhHVkZmaW8ifQ.hAMX5hSW-QnTeRCMAy9A8Q"),
	Jane: L.tileLayer("https://b.tiles.mapbox.com/v4/examples.c7d2024a/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6IlhHVkZmaW8ifQ.hAMX5hSW-QnTeRCMAy9A8Q")},
	
	getLocation: function(name, callback){
		var that = this;
		
    navigator.geolocation.getCurrentPosition(function(position){
			that.latitude = position.coords.latitude;
			that.longitude = position.coords.longitude;
			var position = [that.latitude, that.longitude];
			
			that.placeName = leafletPip.pointInLayer([that.longitude, that.latitude], geojson)[0].feature.properties.NTAName;
			$("div#chatroom").html("Chatroom: " + that.placeName);
			
			map.setView(position, 17);			
			callback(position, name);
    });
	},
	
	loadMarker: function(coords, name, userID){
		if (markers[userID]){
			markers[userID].marker.setLatLng([coords[0], coords[1]]).update();
		} else {
			markers[userID] = {coords: coords, name: name, marker: L.marker([coords[0], coords[1]])};
			
			var myUsername = "";
			if (userID === selfID) myUsername = " my-username";
			var content = "<span class='popup-header" + myUsername + "' id='popup-header-" + userID + "'>" + name +"</span>";
			
			var popup = L.popup().setContent(content);
			markers[userID].marker.bindPopup(popup);
			
			clusters.addLayer(markers[userID].marker);
		}
		
	},
	
	deleteMarker: function(userID){
		map.removeLayer(markers[userID].marker);
		delete markers[userID];
	},
	
	distance: function(coords1, coords2){
		//Haversine formula: http://andrew.hedges.name/experiments/haversine/

		var lat1 = coords1[0] * Math.PI / 180;
		var lon1 = coords1[1] * Math.PI / 180;
		var lat2 = coords2[0] * Math.PI / 180;
		var lon2 = coords2[1] * Math.PI / 180;
		
		var dlon = lon2 - lon1;
		var dlat = lat2 - lat1;
		
		var a = Math.pow((Math.sin(dlat / 2)), 2) + Math.cos(lat1) * Math.cos(lat2) * Math.pow((Math.sin(dlon / 2)), 2);
		var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
		
		return 3959 * c;
	}
}