var dashboardLastSelectedScreen = null;

var dashboardModule = angular.module("dashboardModule", []);
var dashboardModuleInitialized = false;

dashboardModule.controller("dashboardController", [ '$rootScope', '$scope', '$http', '$timeout', '$interval', '$mdMedia', function($rootScope, $scope, $http, $timeout, $interval, $mdMedia) {
	
	$scope.init = function() {

		$scope.selectedScreen = dashboardLastSelectedScreen == null ? 'spending' : dashboardLastSelectedScreen;
		
	}
	
	$scope.selectScreen = function(screen) {
		dashboardLastSelectedScreen = screen;
		$scope.selectedScreen = screen;
	}
	
	$scope.init();
	
}]);
