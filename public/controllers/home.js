angular.module('myApp').controller('HomeCtrl', [
	'$scope',
	'Show',
	function($scope, Show) {
		$scope.shows = Show.query();
	}
]);