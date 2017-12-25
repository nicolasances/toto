var weekendModule = angular.module("weekendModule", [ "expensesServiceModule", "TransportServiceModule", "HotelServiceModule" ]);

weekendModule.controller("weekendController", [ '$scope', '$http', '$timeout', '$mdDialog', '$mdSidenav', 'expensesService', 'calendarService', 'GoogleService', 'TransportService', 'HotelService', '$window', function($scope, $http, $timeout, $mdDialog, $mdSidenav, expensesService, calendarService, GoogleService, TransportService, HotelService, $window) {

	$scope.init = function() {
		
		$scope.buildWeekendView();

	}
	
	/**
	 * Creates an list of weekends (empty)
	 */
	$scope.buildWeekendView = function() {
		
		var wes = calendarService.getWeekends(24);
		
		$scope.weekends = [];
		for (i=0;i<wes.length;i++) {
			$scope.weekends[i] = {weekend: wes[i]};
		}
		
		$scope.getUpcomingWeekends();
		
	}

	/**
	 * Retrieves the planned weekends and fill the created view calendar 
	 * with them
	 */
	$scope.getUpcomingWeekends = function() {
		
		$http.get(microservicesProtocol + "://" + microservicesUrl + "/weekend/weekends").success(function(data) {
			
			$scope.persistedWeekends = data.weekends;
			
			var i;
			for (i=0;i<$scope.persistedWeekends.length;i++) {
				
				var index = $scope.findWeekendInView($scope.persistedWeekends[i].weekend);
				

				if (index != -1) $scope.weekends.splice(index, 1, $scope.persistedWeekends[i]);
			}

		});
	}
	
	$scope.openMaps = function(hotel) {
		$window.open('https://www.google.it/maps/place/' + hotel.address);
	}

	/**
	 * Finds the index of a weekend in the view calendar
	 */
	$scope.findWeekendInView = function(we) {
		
		var i;
		for (i=0;i<$scope.weekends.length;i++) {

			if (new Date($scope.weekends[i].weekend).toDateString() == new Date(we).toDateString()) return i;
		}
		
		return -1;
	}
	
	/**
	 * Adds a weekend
	 */
	$scope.addWeekend = function(ev) {
		
		function DialogController($scope, $mdDialog, calendarService) {
			
			$scope.weekends = calendarService.getWeekends(24);
			$scope.locations = ['beach', 'city'];
			
			$scope.we = new Object();
			$scope.steps = [1, 2, 3, 4];
			$scope.currentStep = 1;

			$scope.hide = function() {$mdDialog.hide;};
			$scope.cancel = function() {$mdDialog.cancel();};
			$scope.answer = function(we) {$mdDialog.hide(we);};
			$scope.selectDate = function(date) {
				$scope.we.weekend = date;
				$scope.we.from = date;
				$scope.we.to = date;
				$scope.currentStep++;
			}
			$scope.selectLocation = function(loc) {
				$scope.we.type = loc;
				$scope.currentStep++;
			}
			$scope.nextStep = function () {$scope.currentStep++;}
			
		}
		
	    var useFullScreen = window.matchMedia( "(max-width: 960px)" ).matches;
	    var dialog = {controller: DialogController, templateUrl: 'modules/weekend/dlgAddWeekend.html', parent: angular.element(document.body), targetEvent: ev, clickOutsideToClose: true, fullscreen: useFullScreen};
	    
	    $mdDialog.show(dialog).then(function(answer) {
	    	
	    	for (i = 0; i < $scope.weekends.length; i++) {
	    		if (new Date($scope.weekends[i].weekend).toDateString() == answer.weekend.toDateString()) {
	    			$scope.weekends[i].destination = answer.destination;
	    			$scope.weekends[i].from = answer.from;
	    			$scope.weekends[i].to = answer.to;
	    			$scope.weekends[i].type = answer.type;
	    			
	    			break;
	    		}
	    	}
	    	
	    	$scope.weekend = $scope.weekends[i];

	    	var data = {weekend: answer.weekend, destination: answer.destination, from: answer.from, to: answer.to, type: answer.type};
	    	
	    	$http.post(microservicesProtocol + "://" + microservicesUrl + "/weekend/weekends", data).success(function(data, status, header, config) {
	    		$scope.weekend.id = data.id;
			});
	    	
	    }, function() {});

	}
	
	$scope.init();

} ]);

/************************************************************************************************************************************************
 *  WEEKEND DETAIL
 ***********************************************************************************************************************************************/
weekendModule.controller("weekendDetailController", [ '$scope', '$http', '$timeout', '$mdDialog', '$mdSidenav', 'expensesService', 'calendarService', 'GoogleService', 'TransportService', 'HotelService', '$window', '$routeParams', function($scope, $http, $timeout, $mdDialog, $mdSidenav, expensesService, calendarService, GoogleService, TransportService, HotelService, $window, $routeParams) {
	
	$scope.init = function() {
		
		$scope.hotels = [];
		$scope.flights = [];
		$scope.hotelIndex = -1;
		$scope.paymentsTotal = 0;
		$scope.paymentsConsolidated = true;
		
		$scope.loadWeekend($routeParams.id);
	}
	
	$scope.loadSection = function(section) {
		
		$scope.section = section;
		
		if (section == 'we-economics') {
			$scope.loadPaymentsInfo();
		}
		else if (section == 'we-hotels') {
			$scope.loadHotelsInfo();
		}
		else {
			$scope.loadFlightsInfo();
		}
	}
	
	$scope.openMaps = function(hotel) {
		$window.open('https://www.google.it/maps/place/' + hotel.address);
	}

	$scope.nextHotel = function() {if ($scope.hotelIndex < $scope.hotels.length - 1) $scope.hotelIndex++;}
	$scope.previousHotel = function() {if ($scope.hotelIndex > 0) $scope.hotelIndex--;}

	$scope.loadWeekend = function(weekendId) {
		$http.get(microservicesProtocol + "://" + microservicesUrl + "/weekend/weekends/" + weekendId).success(function(data, status, header, config) {
			$scope.we = data;
			$scope.we.planeTickets = [];
			$scope.payments = [];
			
			$scope.loadSection('we-economics');
			
		});
	}

	$scope.linkToExpense = function(weekend, ev) {
		
		var useFullScreen = window.matchMedia( "(max-width: 960px)" ).matches;
	    var dialog = {controller: expensesService.DialogController, templateUrl: 'modules/expenses/dlgLinkExpense.html', parent: angular.element(document.body), targetEvent: ev, clickOutsideToClose: true, fullscreen: useFullScreen};
	    
	    $mdDialog.show(dialog).then(function(answer) {
	    	
	    	$http.put(microservicesProtocol + "://" + microservicesUrl + "/weekend/weekends/" + weekend.id, {linkedPaymentId: answer.id});
	    	
	    	answer.type = 'other';
	    	$scope.payments.push(answer);
	    	
	    	$scope.calcPaymentsTotal();
	    	
	    }, function() {});
	}
	
	$scope.unlinkExpense = function(expense) {
		$http.delete(microservicesProtocol + "://" + microservicesUrl + "/weekend/weekends/" + $scope.we.id + "/payments/" + expense.id);
		
		var i;
		for (i=0; i<$scope.payments.length;i++) {
			if ($scope.payments[i].id == expense.id) {
				$scope.payments.splice(i, 1);
				break;
			}
		}
		
		$scope.calcPaymentsTotal();
	}
	
	$scope.loadFlightsInfo = function() {
		
		$scope.loadWeekendInfo();
		
		$http.get(microservicesProtocol + "://" + microservicesUrl + "/weekend/weekends/" + $scope.we.id + "/flights/departures").success(function(data, status, header, config) {
			$scope.flights = data.flights;
		});
	}
	
	$scope.loadWeekendInfo = function() {
		
		$http.get(microservicesProtocol + "://" + microservicesUrl + "/weekend/weekends/" + $scope.we.id + "/departure").success(function(data, status, header, config) {
			$scope.tripDeparture = data;
		});
		
		$http.get(microservicesProtocol + "://" + microservicesUrl + "/weekend/weekends/" + $scope.we.id + "/return").success(function(data, status, header, config) {
			$scope.tripReturn = data;
		});
	}
	
	$scope.loadHotelsInfo = function() {
		
		$http.get(microservicesProtocol + "://" + microservicesUrl + "/weekend/weekends/" + $scope.we.id + "/hotels").success(function(data, status, header, config) {
			$scope.hotels = data.hotels;
			
			if ($scope.hotels.length > 0) $scope.hotelIndex = 0;
		});
	}
	
	$scope.loadPaymentsInfo = function() {
		
		$http.get(microservicesProtocol + "://" + microservicesUrl + "/weekend/weekends/" + $scope.we.id + "/payments").success(function(data, status, header, config) {
			$scope.payments = data.payments;
			
			$scope.calcPaymentsTotal();
		});
	}
	
	$scope.calcPaymentsTotal = function() {
		
		if ($scope.payments != null && $scope.payments.length > 0) {
			var i; 
			$scope.paymentsTotal = 0;
			for (i=0;i<$scope.payments.length;i++) {
				$scope.paymentsTotal += $scope.payments[i].amount;
				
				if (!$scope.payments[i].consolidated) $scope.paymentsConsolidated = false;
			}
		}
		
	}
	
	/**
	 * Sets the hotel for the weekend. If a hotel already exists it will be overriden
	 */
	$scope.addHotel = function(we, ev) {
		
		$scope.we = we;
		
		function DialogController($scope, $mdDialog, calendarService) {
			
			$scope.hide = function() {$mdDialog.hide;};
			$scope.cancel = function() {$mdDialog.cancel();};
			$scope.answer = function(hotel) {$mdDialog.hide(hotel);};
			
			$http.get(microservicesProtocol + "://" + microservicesUrl + "/hotel/hotels").success(function(data, status, header, config) {
				$scope.hotels = data.hotels;
			});
			
		}
		
	    var useFullScreen = window.matchMedia( "(max-width: 960px)" ).matches;
	    var dialog = {controller: DialogController, templateUrl: 'modules/hotel/dlgLinkHotel.html', parent: angular.element(document.body), targetEvent: ev, clickOutsideToClose: true, fullscreen: useFullScreen};
	    
	    $mdDialog.show(dialog).then(function(answer) {
	    	
	    	$scope.hotels.push(answer);
	    	
	    	if ($scope.hotelIndex == -1) $scope.hotelIndex = 0;
	    	
	    	$http.put(microservicesProtocol + "://" + microservicesUrl + "/weekend/weekends/" + we.id, {linkedHotelId: answer.id});
	    	
	    }, function() {});

	}
	
	$scope.closeWeekend = function (we, ev) {
		$http.put(microservicesProtocol + "://" + microservicesUrl + "/weekend/weekends/" + we.id, {weekendClosedAndConsolidated: true});
		$scope.go('/weekend/archive');
	}
	
	$scope.addPlaneTicket = function(we, ev) {
		
		var useFullScreen = window.matchMedia( "(max-width: 960px)" ).matches;
	    var dialog = {controller: TransportService.LinkPlaneTicketDialogController, templateUrl: 'modules/flight/dlgLinkTicket.html', parent: angular.element(document.body), targetEvent: ev, clickOutsideToClose: true, fullscreen: useFullScreen};
	    
	    $mdDialog.show(dialog).then(function(answer) {
	    	
	    	if (we.linkedPlaneTickets == null) we.linkedPlaneTickets = [];

	    	we.linkedPlaneTickets.push(answer.id);
	    	
	    	$http.put(microservicesProtocol + "://" + microservicesUrl + "/weekend/weekends/" + we.id, {linkedPlaneTicketId: answer.id});
	    	
	    }, function() {});
	}
	
	$scope.unlinkHotel = function(hotel) {
		
		$http.delete(microservicesProtocol + "://" + microservicesUrl + "/weekend/weekends/" + $scope.we.id + "/hotels/" + hotel.id);

		var i;
		for (i=0; i<$scope.hotels.length; i++) {
			if ($scope.hotels[i].id == hotel.id) {
				$scope.hotels.splice(i, 1);
				break;
			}
		}
	}
	
	$scope.deleteWeekend = function(we, ev) {
		$http.delete(microservicesProtocol + "://" + microservicesUrl + "/weekend/weekends/" + we.id).success(function() {
			$scope.go('/weekend');
		});
	}
	
	/**
	 * Removes a plane ticket from a weekend (unlinks it)
	 */
	$scope.removePlaneTicket = function(we, ticket) {
		
		var i;
		for (i = 0; i < we.linkedPlaneTickets.length; i++) {
			if (we.linkedPlaneTickets[i] == ticket.id) {
				we.linkedPlaneTickets.splice(i, 1);
				break;
			}
		}
		
		$http.delete(microservicesProtocol + "://" + microservicesUrl + "/weekend/weekends/" + we.id + "/planeTickets/" + ticket.id);
		
	}
	
	$scope.init();

} ]);

/************************************************************************************************************************************************
 *  ARCHIVE
 ***********************************************************************************************************************************************/
weekendModule.controller("weekendArchiveController", [ '$scope', '$http', '$timeout', '$mdDialog', '$mdSidenav', 'expensesService', 'calendarService', 'GoogleService', 'TransportService', 'HotelService', '$window', function($scope, $http, $timeout, $mdDialog, $mdSidenav, expensesService, calendarService, GoogleService, TransportService, HotelService, $window) {

	$scope.init = function() {
		$scope.getPastWeekends();
	}

	/**
	 * Retrieves the planned weekends and fill the created view calendar 
	 * with them
	 */
	$scope.getPastWeekends = function() {
		
		$http.get(microservicesProtocol + "://" + microservicesUrl + "/weekend/weekends?showCost=true").success(function(data) {
			
			$scope.weekends = data.weekends;
			
		});
	}
	
	$scope.init();

} ]);
