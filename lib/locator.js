'use strict';

var userMarker = L.Marker.extend({
	options: {
		userID: ""
	}
});

window.Locator = {
	baseMaps: {Pencil: L.tileLayer("https://a.tiles.mapbox.com/v4/examples.a4c252ab/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6IlhHVkZmaW8ifQ.hAMX5hSW-QnTeRCMAy9A8Q"),
	Comic: L.tileLayer("https://b.tiles.mapbox.com/v4/examples.bc17bb2a/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6IlhHVkZmaW8ifQ.hAMX5hSW-QnTeRCMAy9A8Q"),
	Pirate: L.tileLayer("https://b.tiles.mapbox.com/v4/examples.a3cad6da/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6IlhHVkZmaW8ifQ.hAMX5hSW-QnTeRCMAy9A8Q"),
	Zombie: L.tileLayer("https://b.tiles.mapbox.com/v4/examples.fb8f9523/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6IlhHVkZmaW8ifQ.hAMX5hSW-QnTeRCMAy9A8Q"),
	Jane: L.tileLayer("https://b.tiles.mapbox.com/v4/examples.c7d2024a/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6IlhHVkZmaW8ifQ.hAMX5hSW-QnTeRCMAy9A8Q")},
	
	getLocation: function(username, callback){
    navigator.geolocation.getCurrentPosition(function(position){
			var position = [position.coords.latitude, position.coords.longitude];
			var places = leafletPip.pointInLayer([position[1], position[0]], geojson);
			var placename = places.length > 0 ? places[0].feature.properties.NTAName : "";
			
			Localy.swapChatTitle(placename);
			
			map.setView(position, 17);			
			callback(position, placename);
    });
	},
	
	loadMarker: function(user){		
		var coords = {lat: Locator.radToDeg(user.latitude), lon: Locator.radToDeg(user.longitude)};
		var username = user.username;
		var userID = user.socket_id;

		if (markers[userID]){
			markers[userID].marker.setLatLng([coords.lat, coords.lon]).update();
		} else {
			markers[userID] = {
				coords: coords,
				username: username,
				marker: new userMarker([coords.lat, coords.lon], {
					userID: userID
				})
			};
			
			var content = "<span class='popup-header" + Localy._myName(userID)
																								+ "' id='popup-header-"
																								+ userID
																								+ "'>"
																								+ username
																								+ "</span>";
			
			var popup = L.popup().setContent(content);
			markers[userID].marker.bindPopup(popup);
			
			// clusters.addLayer(markers[userID].marker);
			map.addLayer(markers[userID].marker);
		}
		
	},
	
	deleteMarker: function(userID){
		map.removeLayer(markers[userID].marker);
		delete markers[userID];
	},
	
	drawCircle: function(lat, lon){
		return L.circle([lat, lon], 32.1869, {
						weight: 1,
						opacity: 0.5,
						fillOpacity: 0.4,
						color: '#3498db'
		});
	},
	
	degToRad: function(deg){
		return deg * (Math.PI / 180);
	},
	
	radToDeg: function(rad){
		return rad * (180 / Math.PI);
	},
	
	distance: function(coords1, coords2){
		//Haversine formula: http://andrew.hedges.name/experiments/haversine/

		var lat1 = Locator.degToRad(coords1[0]);
		var lon1 = Locator.degToRad(coords1[1]);
		var lat2 = Locator.degToRad(coords2[0]);
		var lon2 = Locator.degToRad(coords2[1]);
		
		var dlon = lon2 - lon1;
		var dlat = lat2 - lat1;
		
		var a = Math.pow((Math.sin(dlat / 2)), 2) + Math.cos(lat1) * Math.cos(lat2) * Math.pow((Math.sin(dlon / 2)), 2);
		var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
		
		return 3959 * c;
	}
}