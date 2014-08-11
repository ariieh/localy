window.Locator = {
	getLocation: function(){
		var that = this;
	    navigator.geolocation.getCurrentPosition(function(position){
				that.latitude = position.coords.latitude;
				that.longitude = position.coords.longitude;
				that.loadMap();
				socket.emit('refresh map', [that.latitude, that.longitude]);
	    });
	},
	
	loadMap: function(){
		var map = L.map('map').setView([this.latitude, this.longitude], 17);
		L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png').addTo(map);
		
		L.marker([this.latitude, this.longitude]).addTo(map)
		    .bindPopup('Name')
		    .openPopup();
	}
	
}