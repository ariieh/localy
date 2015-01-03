var degToRad = exports.degToRad = function(deg) {
  return deg * (Math.PI / 180);
}

var radToDeg = exports.radToDeg = function(rad) {
  return rad * (180 / Math.PI);
}

var radiusBounds = exports.radiusBounds = function(degLat, degLon) {
  var radLat = degToRad(degLat);
  var radLon = degToRad(degLon);
  
  var earthRadius = 3959;
  var localRadius = 0.02;
  
  var latDelta = localRadius / earthRadius;
  var lonDelta = Math.asin(Math.sin(latDelta) / Math.cos(radLat));
  
  var minLat = radLat - latDelta;
  var maxLat = radLat + latDelta;
  
  var minLon = radLon - lonDelta;
  var maxLon = radLon + lonDelta;
  
  return {
    radian: 
      {
        lat: radLat,
        lon: radLon,
        minLat: minLat,
        maxLat: maxLat,
        minLon: minLon,
        maxLon: maxLon,
        latDelta: latDelta
      },
    degree:
      {
        lat: degLat,
        lon: degLon
      }
  };
}
