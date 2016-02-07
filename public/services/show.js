angular.module('myApp')
	.factory('Show', ['$resource', function($resource) {
		return $resource('/api/tvshows/:_id');
	}]);