var http = require('http');
var async = require('async');
var req = require('request');
var xml2js = require('xml2js');
var db = require('../models/tvShow');
var _ = require('lodash');
var fs = require('fs');

// API key for TVDB
var apiKey = 'B516E38BE2050EE0';
// settings for xml2js module
var parser = xml2js.Parser({
	explicitArray	: false,
	normalizeTags	: true
});


exports.findAll = function (request, response) {

	db.TvShow.find(function(err, shows) {
		if (err) {
			return next(err);
		}
		else {
			response.send(shows);
		}
	});

};

exports.findByName = function (request, response) {

	if (!request.params.query) {
		console.log('No show name provided');
		response.send('No show name provided');
	}

	// sanitise the show name for tvdb api.
	var seriesName = request.params.query
		.toLowerCase()
		.replace(/ /g, '_')
		.replace(/[^\w-]+/g, '');

	console.log('Retrieving TvShow: ' + seriesName + ' from the tvdb.com');


	// Setup thetvdb
	var getOpts = {
		host : 'thetvdb.com',
		path : '/api/GetSeries.php?seriesname=' + seriesName
	};

	getSeriesId = function(res) {
		// somewhere to store the chunks.
		var bodyChunks = [];

		res.on('data', function(chunk) {

			// Buffer the body entirely for processing as a whole.
			bodyChunks.push(chunk);

		});

		res.on('end', function() {

			var body = Buffer.concat(bodyChunks);

			console.log('Finished retrieving TvShow: ' + seriesName + ' from the tvdb.com');

			// parse the xml file.
			parser.parseString(body, function (error, result) {

				if (!result.data.series) {
					response.send(404, {
						message : request.params.query + ' was not found.'
					});
				}

				// return data
				response.send(result.data);

			});

		});

		res.on('error', function(err){
			return next(err);
		});

	};

	// Fire the request for tv show by name.
	http.request(getOpts, getSeriesId).end();

};



exports.findById = function (request, response, next) {

	var id = request.params.id,
		showInformation = {};

	console.log('Retrieving TvShow: ' + id);

	async.series([
		// first load the series information...
		function(callback) {
			db.TvShow.findById(id, function(err, show) {
				if (err) {
					return next(err);
				} else {
					showInformation.show = show;
					callback();
				}
			});
		},
		// now load all the associated episodes...
		function(callback) {
			var episodes = db.TvEpisode.find({seriesId : id});
			var promise = episodes.exec();

			promise.addBack(function (err, docs) {

				showInformation.episodes = docs;
				callback();

			});
		}

	], function(err) {
		if (err) {
			return next(err);
		} else {
			// return all the data.
			console.log('sending show data');
			console.log(showInformation);
			response.send(showInformation);
		}
	});

};


exports.addTvShow = function (request, response, next) {

	var showId = request.body.tvdbId;

	var getPaths = {
		host : 'http://thetvdb.com',
		language : '/api/' + apiKey + '/series/' + showId + '/all/en.xml',
		banner : '/banners/'
	};

	async.waterfall([
		// get the language xml
		function (callback) {
			req.get(getPaths.host + getPaths.language, function (error, res, body) {
				if (error) {
					return next(error);
				};

				parser.parseString(body, function (err, result) {
					var series = result.data.series,
						episodes = result.data.episode,
						genresArr = series.genre.split('|').filter(Boolean);

					var tvShow = new db.TvShow({
						_id : series.id,
						airs : {
							day : series.airs_dayofweek,
							time : series.airs_time
						},
						bannerPath : series.banner,
						firstAired : series.firstaired,
						genres : genresArr,
						imdbId : series.imdb_id,
						overview : series.overview,
						posterPath : series.poster,
						rating : series.rating,
						ratingCount : series.ratingcount,
						runTime : series.runtime,
						showName : series.seriesname,
						status : series.status,
						tvNetwork : series.network
					});

					_.each(episodes, function (episode) {

						var tvEpisode = new db.TvEpisode({
							_id : episode.id,
							banner : {
								path : episode.filename,
								height : episode.thumb_height,
								width : episode.thumb_width
							},
							episodeName : episode.episodename,
							episodeNumber : episode.episodenumber,
							airDate : episode.firstaired,
							overview : episode.overview,
							rating : episode.rating,
							ratingCount : episode.ratingcount,
							seasonNumber : episode.seasonnumber,
							seriesId : episode.seriesid
						});


						tvEpisode.save(function (err, model) {
							if (err) {
								if (err.code == 11000) {
									console.log(err);
									return response.send(409, { message: tvShow.showName + ' already exists.' });
								}
								console.log(err);
								return next(err);
							} else {
								console.log('"' + episode.episodename + '" episode saved to database \n');
							}
						});

					});

					callback(err, tvShow);

				});

			});
		},
		// get the banners / posters / artwork
		function (tvShow, callback) {

			req({
				url : getPaths.host + getPaths.banner + tvShow.posterPath,
				encoding : null
			},
			function (error, response, body) {
				fs.writeFile('./public/cache/artwork/' + tvShow.posterPath, body, function (err) {
					if (err) {
						return next(err);
					}

					tvShow.posterPath = '/cache/artwork/' + tvShow.posterPath;
					callback(error, tvShow);
				});
			});

		}

	], function (error, tvShow) {
		if (error) {
			return next(error);
		}
		tvShow.save(function (err, model) {
			if (err) {
				if (err.code == 11000) {
					return response.send(409, { message: tvShow.showName + ' already exists.' });
				}
				console.log(err);
				return next(err);
			} else {
				response.send(tvShow.showName + ' show added');
				console.log(tvShow.showName + ' show added \n');
			}
		});

	});

};


// TODO: Write updateTvShow and deleteTvShow
exports.updateTvShow = function (request, response) {



};

exports.deleteTvShow = function (request, response) {



};








