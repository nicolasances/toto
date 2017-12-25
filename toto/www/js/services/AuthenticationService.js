
var authServiceModule = angular.module('TotoAuthServiceModule', []);

authServiceModule.factory('TotoAuthenticationService', [ '$http', '$rootScope', '$location', function($http, $rootScope, $location) {

	return {
		
		login : function(user) {
			
			var data = {
				username : user.username,
				password : user.password
			};
			
			$http.post(microservicesProtocol + "://" + microservicesUrl + "/login/login", data).success(function (data, status, header, config) {
				
				$rootScope.user = user;
				$rootScope.token = data.token;
				
				document.cookie = "token=" + data.token;
				document.cookie = "username=" + user.username;
				
				$location.path('/');
				
			});
			
		}, 
		
		getCookie : function(name) {

			if (document.cookie == null) return null;

			startIndex = document.cookie.indexOf(name);
			record = false;
			
			var result = "";
			
			for (i=startIndex; i<document.cookie.length; i++) {
				
				if (record) result += document.cookie.chartAt(i);
				
				if (document.cookie.charAt(i) == '=') record = true;
				if (document.cookie.charAt(i) == ';') record = false;
			}
			
			return result;
			
		}

	}

} ]);
