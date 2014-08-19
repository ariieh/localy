window.Locator = {
	baseMaps: {Pencil: L.tileLayer("https://a.tiles.mapbox.com/v4/examples.a4c252ab/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6IlhHVkZmaW8ifQ.hAMX5hSW-QnTeRCMAy9A8Q"),
	Comic: L.tileLayer("https://b.tiles.mapbox.com/v4/examples.bc17bb2a/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6IlhHVkZmaW8ifQ.hAMX5hSW-QnTeRCMAy9A8Q"),
	Pirate: L.tileLayer("https://b.tiles.mapbox.com/v4/examples.a3cad6da/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6IlhHVkZmaW8ifQ.hAMX5hSW-QnTeRCMAy9A8Q"),
	Zombie: L.tileLayer("https://b.tiles.mapbox.com/v4/examples.fb8f9523/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6IlhHVkZmaW8ifQ.hAMX5hSW-QnTeRCMAy9A8Q"),
	Jane: L.tileLayer("https://b.tiles.mapbox.com/v4/examples.c7d2024a/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6IlhHVkZmaW8ifQ.hAMX5hSW-QnTeRCMAy9A8Q")},
	
	getLocation: function(name){
		var that = this;
	    navigator.geolocation.getCurrentPosition(function(position){
				that.latitude = position.coords.latitude;
				that.longitude = position.coords.longitude;
				that.loadMap(that.latitude, that.longitude, name);
	    });
	},
	
	loadMap: function(latitude, longitude, name){
		map = L.map('map').setView([latitude, longitude], 17);
		Locator.baseMaps["Pencil"].addTo(map);
		L.control.layers(Locator.baseMaps).addTo(map);
				
		socket.emit('load map', socket.io.engine.id);
		socket.emit('load marker', [latitude, longitude], name, socket.io.engine.id);
	},
	
	loadMarker: function(coords, name, userID){
		if (markers[userID]){
			markers[userID].setLatLng([coords[0], coords[1]]).update();
		} else {
			markers[userID] = L.marker([coords[0], coords[1]]);
			
			var popup = L.popup().setContent("<span class='popup-header' id='popup-header-" + userID + "'>" + name + "</span>");
			markers[userID].addTo(map).bindPopup(popup);
		}
	},
	
	deleteMarker: function(userID){
		map.removeLayer(markers[userID]);
		delete markers[userID];
	}
	
}