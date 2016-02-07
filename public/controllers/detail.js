angular.module('myApp').controller('DetailCtrl', [
	'$scope',
	'$routeParams',
	'Show',
	function($scope, $routeParams, Show) {
		Show.get({_id : $routeParams.id}, function (show) {

			$scope.showInformation = show;

		});
	}
]);