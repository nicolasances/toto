
var hotelServiceModule = angular.module('HotelServiceModule', []);

hotelServiceModule.factory('HotelService', [ '$http', '$rootScope', '$location', function($http, $rootScope, $location) {

	return {
		
		getHotelInfo: function(id, callback) {
			
			callback({
				name: 'Ramada Hotel & Suites Vilnius',
				address: 'Subaciaus g. 2, Città Vecchia di Vilnius, LT-01127 Vilnius, Lituania', 
				lat: 54.682439, 
				lng: 25.289269
			});
			
			// TODO CAll service
			
		}
		
	}

} ]);
