
var transportServiceModule = angular.module('TransportServiceModule', []);

transportServiceModule.factory('TransportService', [ '$http', '$rootScope', '$location', function($http, $rootScope, $location) {

	return {

		getPlaneTickets : function() {
			return $http.get("https://" + microservicesUrl + "/flight/tickets");
		},
		
		getPlaneTicket : function(id) {
			return $http.get("https://" + microservicesUrl + "/flight/tickets/" + id);
		},

		/**
		 * Retrieves the next transport (plane or train) for the passed list of tickets
		 */
		getNextTransport : function(ticketIds, callback) {
			
			if (ticketIds == null || ticketIds.length == 0)  {callback(null); return;}
			
			var filter = "";
			var i;
			for (i = 0; i < ticketIds.length; i++) {
				if (i == 0) filter = 'ticketId=' + ticketIds[i];
				else filter += '&ticketId=' + ticketIds[i];
			}
			
			$http.get("https://" + microservicesUrl + "/flight/tickets?" + filter).success(function (data) {
				
				if (data == null || data.tickets == null) {callback(null); return;}
				
				var i;
				var today = moment(moment().format('YYYYMMDD'), 'YYYYMMDD');
				var nextTicket = null;
				for (i = 0; i < data.tickets.length; i++) {
					if (moment(data.tickets[i].tripDate).isSameOrAfter(today)) {
						if (nextTicket == null || moment(data.tickets[i].tripDate).isBefore(nextTicket.tripDate)) nextTicket = data.tickets[i];
					}
				}
				
				if (nextTicket == null) {callback(null); return;}
				
				$http.get("https://" + microservicesUrl + "/flight/tickets/" + nextTicket.id + "/flights?first=true").success(function(data) {
					
					console.log("Next Flight:")
					console.log(data);
					
					callback(data.flights);
					return;
				});
			});
			
		},
		
		deletePlaneTicket : function(id) {
			$http.delete("https://" + microservicesUrl + "/flight/tickets/" + id);
		},
		
		/**
		 * Returns the next upcoming flight for a specific plane ticket, 
		 * or null if there are no future flights
		 */
		getNextFlight: function(planeTicket) {
			
			$http.get("https://" + microservicesUrl + "/flight/tickets/" + id + "/flights?first=true");
			
		},
		
		getFlightInfo: function(id) {
			
			return $http.get("https://" + microservicesUrl + "/flight/flights/" + id);
		},
		
		getTrainRideInfo: function(id, callback) {
			
			callback({
				departure: {station: 'Milano Centrale', date: new Date(), time: '7:30'}, 
				arrival: {station: 'Roma Termini', date: new Date(), time: '10:30'}
			});
			
			// TODO CAll service
			
		},
		
		LinkPlaneTicketDialogController: function ($scope, $mdDialog) {
			
			$scope.hide = function() {$mdDialog.hide;};
			$scope.cancel = function() {$mdDialog.cancel();};
			$scope.answer = function(ticket) {$mdDialog.hide(ticket);};
			$scope.selectTicket = function(ticket) {$scope.answer(ticket);};
			
			$scope.fillPaymentInfo = function(ticket) {
				$http.get("https://" + microservicesUrl + "/expenses/expenses/" + ticket.linkedPaymentId).success(function (data) {
					ticket.amount = data.amount;
				});
			}
			
			$http.get("https://" + microservicesUrl + "/flight/tickets").success(function (data) {

				$scope.tickets = data.tickets;
				
				var i;
				for (i = 0; i < $scope.tickets.length; i++) {
					if ($scope.tickets[i].linkedPaymentId != null) $scope.fillPaymentInfo($scope.tickets[i]);
				}
				
			});
			
		}
	}

} ]);
