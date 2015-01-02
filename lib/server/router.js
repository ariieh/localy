var server = projRequire('/index.js');
var app = server.app;
var DBHelper = server.DBHelper;

//Root
app.get('/', function(req, res) { res.sendfile('index.html'); });

//Vendor
app.get('/vendor/:file', function(req, res) { res.sendfile('vendor/' + req.params.file); });
app.get('/vendor/images/:image', function(req, res) { res.sendfile('vendor/images/' + req.params.image); });
app.get('/vendor/leaflet.markercluster/dist/:file', function(req, res) {
  res.sendfile('vendor/leaflet.markercluster/dist/' + req.params.file);
});
app.get('/vendor/fontello/css/:file', function(req, res) { res.sendfile('vendor/fontello/css/' + req.params.file); });
app.get('/vendor/fontello/font/:file', function(req, res) { res.sendfile('vendor/fontello/font/' + req.params.file); });

app.get('/stylesheets/images/:image', function(req, res) { res.sendfile('vendor/images/' + req.params.image); });

//JavaScript library
app.get('/lib/client/build/:file', function(req, res) { res.sendfile('lib/client/build/' + req.params.file); });

//Stylesheets
app.get('/stylesheets/:file', function(req, res) { res.sendfile('stylesheets/' + req.params.file); });

//API
app.get('/api/users', function(req, res) {
  DBHelper.findActiveUsersInRadius(req.query.lat, req.query.lon, function(users) {
    console.log(users);
  });
});

app.post('/api/users', function(req, res) {

});
