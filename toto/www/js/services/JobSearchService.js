var jobSearchServiceModule = angular.module('JobSearchServiceModule', []);

jobSearchServiceModule.factory('JobSearchService', [ '$http', '$rootScope', '$location', '$mdDialog', function($http, $rootScope, $location, $mdDialog) {

	return {
		
		/**
		 * Shows the add application dialog 
		 * 
		 * Requires: 
		 * 
		 *  - creationCallback	:	the callback to be called when the user confirmed the creation.
		 *  						it's a function(application)
		 */
		showAddApplicationDialog : function(creationCallback) {

			function DialogController($scope, $mdDialog) {
				
				$scope.hide = function() {$mdDialog.hide;};
				$scope.cancel = function() {$mdDialog.cancel();};
				$scope.answer = function(application) {$mdDialog.hide(application);};
				
			}
			
			var useFullScreen = window.matchMedia( "(max-width: 960px)" ).matches;
			var dialog = {controller: DialogController, templateUrl: 'modules/jobsearch/dlgAddApplication.html', parent: angular.element(document.body), clickOutsideToClose: true, fullscreen: useFullScreen};
			
			$mdDialog.show(dialog).then(function(answer) {
				
				creationCallback(answer);
				
			}, function() {});			
		
		}, 
		
		/**
		 * Shows the add application event dialog 
		 * 
		 * Requires: 
		 * 
		 *  - creationCallback	:	the callback to be called when the user confirmed the creation.
		 *  						it's a function(event)
		 */
		showAddApplicationEventDialog : function(creationCallback) {

			function DialogController($scope, $mdDialog) {
				
				$scope.event = {};
				
				$scope.hide = function() {$mdDialog.hide;};
				$scope.cancel = function() {$mdDialog.cancel();};
				$scope.answer = function(event) {$mdDialog.hide(event);};
				
				$scope.types = [{id: 'contact', description: 'Contacted'}, {id: 'interview', description: 'Interview'}, {id: 'offer', description: 'Offer'}, {id: 'rejected', description: 'Rejected'},{id: 'refused', description: 'Refused'}, {id: 'hired', description: 'Hired'}];
				
				$scope.selectEventType = function(type) {
					$scope.event.type = type.id;
					type.selected = true;
				}
				
			}
			
			var useFullScreen = window.matchMedia( "(max-width: 960px)" ).matches;
			var dialog = {controller: DialogController, templateUrl: 'modules/jobsearch/dlgAddApplicationEvent.html', parent: angular.element(document.body), clickOutsideToClose: true, fullscreen: useFullScreen};
			
			$mdDialog.show(dialog).then(function(answer) {
				
				creationCallback(answer);
				
			}, function() {});			
		
		}, 
		
		/**
		 * Posts a new application and returns a promise with the application id
		 */
		postApplication : function(application) {
			
			return $http.post("https://" + microservicesUrl2 + "/jobsearch/applications", application);
		}, 
		
		/**
		 * Returns the list of applications 
		 */
		getApplications : function() {
			
			return $http.get("https://" + microservicesUrl2 + "/jobsearch/applications");
		}, 
		
		/**
		 * Retrieves the application specified by the id param. 
		 * Returns a promise.
		 */
		getApplication : function(id) {
			
			return $http.get("https://" + microservicesUrl2 + "/jobsearch/applications/" + id);
		}, 
		
		/**
		 * Posts the provided event and returns a promise
		 */
		postApplicationEvent : function(id, event) {
			
			return $http.post("https://" + microservicesUrl2 + "/jobsearch/applications/" + id + "/events", event);
		}, 
		
		/**
		 * Returns the events of the specified application
		 */
		getApplicationEvents : function(id) {
			
			return $http.get("https://" + microservicesUrl2 + "/jobsearch/applications/" + id + "/events");
		}, 
		
		/**
		 * Retrieves the stats per country
		 */
		getCountries : function() {
			
			return $http.get("https://" + microservicesUrl2 + "/jobsearch/countries");
		}
		

	}

} ]);
