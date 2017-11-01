var flightModule = angular.module("flightModule", ["expensesServiceModule", "TransportServiceModule"]);
	
flightModule.controller("flightController", [ '$scope', '$http', '$timeout', '$mdDialog', '$mdSidenav', 'expensesService', 'TransportService', function($scope, $http, $timeout, $mdDialog, $mdSidenav, expensesService, TransportService) {

	$scope.init = function() {
		
		$scope.getTickets();
		
	}
	
	$scope.refresh = function() {
		$scope.getTickets();
	}
	
	$scope.getTickets = function() {
		
		TransportService.getPlaneTickets().success(function(data, status, header, config) {
			$scope.tickets = data.tickets;
			
			var i;
			for (i = 0; i < $scope.tickets.length; i++) {
				if ($scope.tickets[i].linkedPaymentId != null) $scope.fillPaymentInfo($scope.tickets[i]);
			}
		});
		
	}
	
	$scope.showDetail = function(ticket, ev) {
		
		var addFlight = $scope.addFlight;
		var deleteTicket = $scope.deleteTicket;
		var linkToExpense = $scope.linkToExpense;
		
		function DialogController($scope, $mdDialog) {
			
			$scope.ticket = ticket;
			$scope.ticket.flights = [];
			
			$scope.hide = function() {$mdDialog.hide;};
			$scope.cancel = function() {$mdDialog.cancel();};
			$scope.addFlight = addFlight;
			$scope.deleteTicket = function(ticket, ev) {deleteTicket(ticket, ev); $mdDialog.hide();};
			$scope.linkToExpense = linkToExpense;

			if ($scope.ticket.linkedFlights != null) {
				for (i = 0; i < $scope.ticket.linkedFlights.length; i++) {
					TransportService.getFlightInfo($scope.ticket.linkedFlights[i]).success(function(data) {$scope.ticket.flights.push(data);});
				}
			}
		}
		
	    var useFullScreen = window.matchMedia( "(max-width: 960px)" ).matches;
	    var dialog = {controller: DialogController, templateUrl: 'modules/flight/dlgShowTicketDetails.html', parent: angular.element(document.body), targetEvent: ev, clickOutsideToClose: true, fullscreen: useFullScreen};
	    
	    $mdDialog.show(dialog);
		
	}
	
	$scope.deleteTicket = function(ticket, ev) {
		
		TransportService.deletePlaneTicket(ticket.id);

		var i;
		for (i = 0; i < $scope.tickets.length; i++) {
			if ($scope.tickets[i].id == ticket.id) $scope.tickets.splice(i, 1);
		}
	}
	
	$scope.addFlight = function(ticket, ev) {
		
		function DialogController($scope, $mdDialog) {
			
			$scope.ticket = ticket;
			$scope.hide = function() {$mdDialog.hide;};
			$scope.cancel = function() {$mdDialog.cancel();};
			$scope.answer = function(answer) {$mdDialog.hide(answer);}
		}
		
	    var useFullScreen = window.matchMedia( "(max-width: 960px)" ).matches;
	    var dialog = {controller: DialogController, templateUrl: 'modules/flight/dlgAddFlight.html', parent: angular.element(document.body), targetEvent: ev, clickOutsideToClose: true, fullscreen: useFullScreen};
	    
	    $mdDialog.show(dialog).then(function(answer) {
	    	
	    	$scope.ticket = ticket;
	    	
	    	$http.post("https://" + microservicesUrl + "/flight/flights", answer).success(function(data, status, header, config) {
	    		
	    		if ($scope.ticket.linkedFlights == null) $scope.ticket.linkedFlights = [];
	    		
	    		$scope.ticket.linkedFlights.push(data.id);
	    		
	    		TransportService.getFlightInfo(data.id, function(flight) {
	    			
	    			if ($scope.ticket.flights == null) $scope.ticket.flights = [];
	    			
	    			$scope.ticket.flights.push(flight);
	    			
	    		});
	    		
	    		$http.put("https://" + microservicesUrl + "/flight/tickets/" + $scope.ticket.id, {linkedFlightId : data.id});
	    		
	    	});
	    	
	    	
	    }, function() {});
		
	}

	$scope.linkToExpense = function(ticket, ev) {
		
		var useFullScreen = window.matchMedia( "(max-width: 960px)" ).matches;
	    var dialog = {controller: expensesService.DialogController, templateUrl: 'modules/expenses/dlgLinkExpense.html', parent: angular.element(document.body), targetEvent: ev, clickOutsideToClose: true, fullscreen: useFullScreen};
	    
	    $mdDialog.show(dialog).then(function(answer) {
	    	
	    	ticket.linkedPaymentId = answer.id;

	    	$scope.fillPaymentInfo(ticket);
	    	
	    	$http.put("https://" + microservicesUrl + "/flight/tickets/" + ticket.id, {linkedPaymentId: answer.id});
	    	
	    }, function() {});
	}
	
	/**
	 * Complete the payment info 
	 */
	$scope.fillPaymentInfo = function(ticket) {
		
		$http.get("https://" + microservicesUrl + "/expenses/expenses/" + ticket.linkedPaymentId).success(function (data) {
			
			ticket.amount = data.amount;
			
		});
	}


	
	$scope.addTicket = function(ev) {
		
		function DialogController($scope, $mdDialog) {
			
			$scope.hide = function() {$mdDialog.hide;};
			$scope.cancel = function() {$mdDialog.cancel();};
			$scope.answer = function(ticket) {$mdDialog.hide(ticket);};
			
		}
		
	    var useFullScreen = window.matchMedia( "(max-width: 960px)" ).matches;
	    var dialog = {controller: DialogController, templateUrl: 'modules/flight/dlgAddTicket.html', parent: angular.element(document.body), targetEvent: ev, clickOutsideToClose: true, fullscreen: useFullScreen};
	    
	    $mdDialog.show(dialog).then(function(answer) {
	    	
	    	var ticket = {
	    		name: answer.name,
	    		boughtOn: answer.boughtOn,
	    		note: answer.note,
	    		tripDate: answer.tripDate
	    	};
	    	
	    	$scope.tickets.push(ticket);
	    	
	    	$http.post("https://" + microservicesUrl + "/flight/tickets", ticket).success(function(data, status, header, config) {
	    		ticket.id = data.id;
			});
	    	
	    }, function() {});

	}
	
	$scope.init();
	
} ]);

