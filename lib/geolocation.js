window.Locator = {
	getLocation: function(name, userID){
		var that = this;
	    navigator.geolocation.getCurrentPosition(function(position){
				that.latitude = position.coords.latitude;
				that.longitude = position.coords.longitude;
				that.loadMap(that.latitude, that.longitude, name, userID);
	    });
	},
	
	loadMap: function(latitude, longitude, name, userID){
		map = L.map('map').setView([latitude, longitude], 17);
		L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png').addTo(map);
		socket.emit('load map', userID);
		socket.emit('load marker', [latitude, longitude], name, userID);
	},
	
	loadMarker: function(coords, name){
		if (markers[userID]){
			markers[userID].setLatLng([coords[0], coords[1]]).update();
		} else {
			markers[userID] = L.marker([coords[0], coords[1]]);
			markers[userID].addTo(map).bindPopup(name);
		}
	}
	
}