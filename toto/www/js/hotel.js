var hotelModule = angular.module("hotelModule", ["expensesServiceModule"]);
	
hotelModule.controller("hotelController", [ '$scope', '$http', '$timeout', '$mdDialog', '$mdSidenav', 'expensesService', '$window', function($scope, $http, $timeout, $mdDialog, $mdSidenav, expensesService, $window) {

	$scope.init = function() {
		
		$scope.hotels = [];
		
		$scope.getHotels();
	}
	
	$scope.refresh = function() {}
	
	$scope.getHotels = function() {
	
		$http.get(microservicesProtocol + "://" + microservicesUrl + "/hotel/hotels?retrievePayment=true").success(function(data, status, header, config) {
			$scope.hotels = data.hotels;
		});
	}
	
	$scope.openMaps = function(hotel) {
		$window.open('https://www.google.it/maps/place/' + hotel.address);
	}
	
	$scope.showDetail = function(hotel, ev) {}
	
	$scope.deleteHotel = function(hotel, ev) {
		
		$http.delete(microservicesProtocol + "://" + microservicesUrl + "/hotel/hotels/" + hotel.id);

		var i;
		for (i = 0; i < $scope.hotels.length; i++) {
			if ($scope.hotels[i].id == hotel.id) {
				$scope.hotels.splice(i, 1);
				break;
			}
		}
	}
	
	$scope.addHotel = function(hotel, ev) {
		
		function DialogController($scope, $mdDialog) {
			
			$scope.steps = [1, 2, 3];
			$scope.currentStep = 1;
			$scope.hotel = new Object();
			
			$scope.hide = function() {$mdDialog.hide;};
			$scope.cancel = function() {$mdDialog.cancel();};
			$scope.answer = function(hotel) {$mdDialog.hide(hotel);};
			$scope.nextStep = function () {$scope.currentStep++;};
			
		}
		
	    var useFullScreen = window.matchMedia( "(max-width: 960px)" ).matches;
	    var dialog = {controller: DialogController, templateUrl: 'modules/hotel/dlgAddHotel.html', parent: angular.element(document.body), targetEvent: ev, clickOutsideToClose: true, fullscreen: useFullScreen};
	    
	    $mdDialog.show(dialog).then(function(answer) {
	    	
			$http.get("https://maps.googleapis.com/maps/api/geocode/json?address=" + answer.address + "&key=AIzaSyA4KA2WAZ2BKf4qrAWPWvfYKen0A0p9gx4").success(function(data, status, header, config) {
				
				if (data != null && data.results != null) {
					
					answer.geo = data.results[0].geometry.location;
					
				}

				$scope.hotel = answer;
				$scope.hotels.push(answer);
				
		    	$http.post(microservicesProtocol + "://" + microservicesUrl + "/hotel/hotels", answer).success(function(data, status, header, config) {
		    		$scope.hotel.id = data.id;
				});
			});

	    	
	    	
	    }, function() {});

	}

	$scope.linkToExpense = function(hotel, ev) {
		
		var useFullScreen = window.matchMedia( "(max-width: 960px)" ).matches;
	    var dialog = {controller: expensesService.DialogController, templateUrl: 'modules/expenses/dlgLinkExpense.html', parent: angular.element(document.body), targetEvent: ev, clickOutsideToClose: true, fullscreen: useFullScreen};
	    
	    $mdDialog.show(dialog).then(function(answer) {
	    	
	    	hotel.linkedPaymentId = answer.id;
	    	
	    	$http.put(microservicesProtocol + "://" + microservicesUrl + "/hotel/hotels/" + hotel.id, {linkedPaymentId: answer.id});
	    	
	    }, function() {});
	}

	$scope.init();
	
} ]);

