var express = require('express');
var app = express();
var port = process.env.PORT || 4000;
var debug = require('debug')('ffbl.ui.server');
app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
	res.sendFile(__dirname + '/views/main.html');
});

app.get('/draftroom', function (req, res) {
  res.sendFile(__dirname + '/views/draftroom.html');
});
var server = app.listen(port, function () {
	debug('Express Ui Server listening on port ' + port);
});