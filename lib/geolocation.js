window.Locator = {
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
		L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png').addTo(map);
		socket.emit('load map', socket.io.engine.id);
		socket.emit('load marker', [latitude, longitude], name, socket.io.engine.id);
	},
	
	loadMarker: function(coords, name, userID){
		if (markers[userID]){
			markers[userID].setLatLng([coords[0], coords[1]]).update();
		} else {
			markers[userID] = L.marker([coords[0], coords[1]]);
			markers[userID].addTo(map).bindPopup(name);
		}
	}
	
}