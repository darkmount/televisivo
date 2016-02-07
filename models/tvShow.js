// Require Mongoose
var mongoose = require('mongoose');

// Setup DB connection
mongoose.connect('mongodb://localhost/televisivo');

// Database schema for our TV Show object.
var tvShowSchema = mongoose.Schema({
	_id : Number,
	airs : {
		day : String,
		time : String
	},
	bannerPath : String,
	firstAired : Date,
	genres : [String],
	imdbId : String,
	overview : String,
	posterPath : String,
	rating : String,
	ratingCount : Number,
	runTime : String,
	showName : String,
	status : String,
	tvNetwork : String
});


// Database schema for our TV Episode object.
var tvEpisodeSchema = mongoose.Schema({
	_id : Number,
	banner : {
		path : String,
		height : Number,
		width : Number
	},
	episodeName : String,
	episodeNumber : Number,
	airDate : Date,
	overview : String,
	rating : String,
	ratingCount : Number,
	seasonNumber : Number,
	seriesId : Number
});


var db = module.exports = {
	TvShow : mongoose.model('TvShow', tvShowSchema),
	TvEpisode : mongoose.model('TvEpisode', tvEpisodeSchema)
};