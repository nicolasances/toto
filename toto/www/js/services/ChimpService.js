/*
 * This JS module provide services to talk to Toto Chimp
 */
var chimpServiceModule = angular.module('ChimpServiceModule', []);

chimpServiceModule.factory('ChimpService', [ '$http', '$mdDialog', function($http, $mdDialog) {

	var chimpService = {

		/**
		 * Retrieves the Toto notifications
		 */
		getConversations : function() {

			return $http.get(microservicesProtocol + "://" + microservicesUrl + "/chimp/conversations");
		},

		/**
		 * Get the next conversation to manage
		 */
		getNextConversation : function() {

			return $http.get(microservicesProtocol + "://" + microservicesUrl + "/chimp/conversations?first=true");
		},

		/**
		 * Posts a user action.
		 * 
		 * Requires in input the conversation Id and the action that the user
		 * chose (as ab object)
		 * 
		 * Returns a promise
		 */
		postUserAction : function(conversationId, conversationCode, action) {

			var body = {
				conversationCode : conversationCode,
				actionCode : action.code,
				actionTitle : action.title,
				conversationId : conversationId
			};

			return $http.post(microservicesProtocol + "://" + microservicesUrl + "/chimp/conversations/" + conversationId + "/interactions", body);
		}

	};

	return chimpService;

} ]);
