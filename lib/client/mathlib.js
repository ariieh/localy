'use strict';

/* Math library */

window.MathLib = {
  degToRad: function(deg) {
    return deg * (Math.PI / 180);
  },
  
  radToDeg: function(rad) {
    return rad * (180 / Math.PI);
  },
    
  distance: function(coords1, coords2) {
    //Haversine formula: http://andrew.hedges.name/experiments/haversine/

    var lat1 = MathLib.degToRad(coords1[0]);
    var lon1 = MathLib.degToRad(coords1[1]);
    var lat2 = MathLib.degToRad(coords2[0]);
    var lon2 = MathLib.degToRad(coords2[1]);
    
    var dlon = lon2 - lon1;
    var dlat = lat2 - lat1;
    
    var a = Math.pow((Math.sin(dlat / 2)), 2) + Math.cos(lat1) * Math.cos(lat2) * Math.pow((Math.sin(dlon / 2)), 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    
    return 3959 * c;
  }
}
