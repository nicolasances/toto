var loginModule = angular.module("loginModule", []);
	
loginModule.controller("loginController", [ '$scope', '$http', '$interval', '$location', function($scope, $http, $interval, $location) {
	
	var checkAuthTimer;

	$scope.init = function() {
		
		checkAuthTimer = $interval($scope.registerClickHandlerToGoogle, 500);
	}
	
	$scope.registerClickHandlerToGoogle = function() {
		
		if (auth2 != null) {
			
			$interval.cancel(checkAuthTimer);
			
			var el = document.querySelector('#google-login');
			
			auth2.attachClickHandler(el, {}, $scope.loginSuccess);
		}
	}
	
	$scope.loginSuccess = function(user) {
		
		googleUser = user;

		document.location = window.location.pathname;
	}
	
	$scope.init();
	
} ]);

