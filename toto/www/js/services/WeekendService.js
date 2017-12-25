
var weekendServiceModule = angular.module('WeekendServiceModule', []);

weekendServiceModule.factory('WeekendService', [ '$http', '$rootScope', '$location', function($http, $rootScope, $location) {

	return {

		/**
		 * Retrieves the detail of a Weekend. Does not include the list of transports and hotels.
		 */
		getWeekendDetail : function(weekendId, callback) {
			
			we = {
				weekend: new Date(moment('20170408', 'YYYYMMDD')), 
				destination: 'Vilnius', 
				type: 'city', 
				from: new Date(), 
				to: new Date();
			};

			callback(we);
			
//			$http.get(microservicesProtocol + "://" + microservicesUrl + "/weekend/weekends/" + weekendId).success(function(data, status, header, config) {
//				callback(data);
//			});
			
		}
		
	}

} ]);
