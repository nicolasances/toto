var apiAiServiceModule = angular.module('ApiAiServiceModule', []);

apiAiServiceModule.factory('ApiAiService', [ '$http', '$rootScope', '$location', '$mdDialog', function($http, $rootScope, $location, $mdDialog) {

	return {

		/**
		 * Posts the provided text to the API AI api and 
		 * returns a response that will contain the response json from API AI.
		 * 
		 * Parameters: 
		 * 
		 * 	-	speechText	:	the text to send to API AI
		 * 
		 *  - 	contexts	:	an optional array of contexts objects following the structure
		 *  					defined by the API AI specification
		 */
		postSpeech : function(speechText, contexts) {
			
			var body = {
					query: speechText,
					lang: 'en',
					sessionId: '1234567890', 
					contexts: contexts
			};
			
			return $http.post("https://api.api.ai/v1/query?v=20150910", body, {headers: {'Authorization': 'Bearer 5158bc71b3fa41aeac99c11b66b13887'}});
			
		}
	}

} ]);
