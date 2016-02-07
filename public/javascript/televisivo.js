angular.module('myApp', [
	'ngRoute',
	'ngResource'
]).config( function ($locationProvider, $routeProvider) {

	$locationProvider.html5Mode(true);

	$routeProvider.when('/', {
		templateUrl : '/views/home.html',
		controller : 'HomeCtrl'
	})
	.when('/tv-shows', {
		templateUrl : '/views/showList.html'
	})
	.when('/tv-shows/add' , {
		templateUrl : '/views/showAdd.html',
		controller : 'AddCtrl'
	})
	.when('/tv-shows/:id', {
		templateUrl : '/views/showDetail.html',
		controller : 'DetailCtrl'
	})
	.otherwise({
		redirectTo: '/'
	});

});