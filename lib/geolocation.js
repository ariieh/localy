window.Locator = {
	getLocation: function(name, userId){
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
		socket.emit('refresh map', [latitude, longitude], name, userID);
	}
	
}