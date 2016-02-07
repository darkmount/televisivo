angular.module('myApp').controller('AddCtrl', [
	'$scope',
	'$http',
	'$location',
	function($scope, $http, $location) {
		$scope.tvshows = [];
		$scope.error = false;

		$scope.search = function($event) {

			$event.preventDefault();
			$scope.tvshows = [];

			var query = document.getElementById('search').value;

			$http.get('/api/search/' + query).then(function(result) {

				console.log(result);

				if (result.data.series && result.data.series instanceof Array) {

					result.data.series.forEach(function(val, i) {
						$scope.tvshows.push(val);
					});

				} else {

					$scope.tvshows.push(result.data.series);

				}

				if ($scope.error) {
					$scope.error = false;
				};

			}, function(error) {

				$scope.error = error.data;

			});
		};

		$scope.addShow = function($event) {

			$event.preventDefault();
			var id = document.querySelector('input[name="tvdbId"]:checked').value;

			$http({
				method : 'POST',
				url : '/api/tvshows',
				data : {tvdbId : id}
			}).success(function (data, status, headers, config) {

				$location.path('/');

			}).error(function (error, status, headers, config) {

				$scope.error = error;

			});
		}
	}
]);