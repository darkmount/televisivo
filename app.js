var path = require('path');
var express = require('express');
var favicon = require('static-favicon');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var logger = require('morgan');

var tvShow = require('./routes/tvShow');

var app = express();

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/tvshows', tvShow.findAll);
app.get('/api/search/:query', tvShow.findByName);
app.get('/api/tvshows/:id', tvShow.findById);
app.post('/api/tvshows', tvShow.addTvShow);
app.put('/api/tvshows/:id', tvShow.updateTvShow);
app.delete('/api/tvshows/:id', tvShow.deleteTvShow);

// redirect for all routes otherwise will 404.
app.get('*', function(req, res) {
	res.redirect('/#' + req.originalUrl);
});


// error handler
app.use(function(err, req, res, next) {
  console.error(err.stack);
  res.send(500, { message: err.message });
});


module.exports = app;