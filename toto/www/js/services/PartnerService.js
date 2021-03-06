var partnerModule = angular.module('PartnerServiceModule', []);

partnerModule.factory('PartnerService', [ '$http', '$rootScope', '$location', '$mdDialog', function($http, $rootScope, $location, $mdDialog) {

	return {
		
		/**
		 * Shows the approve deed dialog 
		 * 
		 * Requires: 
		 * 
		 *  - deed				:	the deed to be approved
		 * 
		 *  - approvalCallback	:	the callback to be called when the user approved or denied the deed
		 *  						function(approved) where approved can be true or false
		 */
		showApproveDeedsDialog : function(deed, approvalCallback) {

			function DialogController($scope, $mdDialog) {
				
				$scope.deed = deed;
				
				$scope.hide = function() {$mdDialog.hide;};
				$scope.cancel = function() {$mdDialog.cancel();};
				$scope.answer = function(approved) {$mdDialog.hide(approved);};
				
			}
			
			var useFullScreen = false;
			var dialog = {controller: DialogController, templateUrl: 'modules/partner/dlgApproveDeed.html', parent: angular.element(document.body), clickOutsideToClose: true, fullscreen: useFullScreen};
			
			$mdDialog.show(dialog).then(function(answer) {
				
				approvalCallback(answer);
				
			}, function() {});			
		
		}, 
		
		/**
		 * Shows the add master deed dialog 
		 * 
		 * Requires: 
		 * 
		 *  - creationCallback	:	the callback to be called when the user confirmed the creation.
		 *  						it's a function(created object)
		 */
		showAddMasterDeedDialog : function(creationCallback) {

			function DialogController($scope, $mdDialog) {
				
				$scope.hide = function() {$mdDialog.hide;};
				$scope.cancel = function() {$mdDialog.cancel();};
				$scope.answer = function(masterDeed) {$mdDialog.hide(masterDeed);};
				
			}
			
			var useFullScreen = window.matchMedia( "(max-width: 960px)" ).matches;
			var dialog = {controller: DialogController, templateUrl: 'modules/partner/dlgAddMasterDeed.html', parent: angular.element(document.body), clickOutsideToClose: true, fullscreen: useFullScreen};
			
			$mdDialog.show(dialog).then(function(answer) {
				
				creationCallback(answer);
				
			}, function() {});			
		
		}, 
		
		/**
		 * Shows the add deed dialog 
		 * 
		 * Requires: 
		 * 
		 *  - creationCallback	:	the callback to be called when the user confirmed the creation.
		 *  						it's a function(created object)
		 */
		showAddDeedDialog : function(creationCallback) {

			function DialogController($scope, $mdDialog) {
				
				$scope.hide = function() {$mdDialog.hide;};
				$scope.cancel = function() {$mdDialog.cancel();};
				$scope.answer = function(masterDeed) {$mdDialog.hide(masterDeed);};
				
			}
			
			var useFullScreen = window.matchMedia( "(max-width: 960px)" ).matches;
			var dialog = {controller: DialogController, templateUrl: 'modules/partner/dlgAddDeed.html', parent: angular.element(document.body), clickOutsideToClose: true, fullscreen: useFullScreen};
			
			$mdDialog.show(dialog).then(function(answer) {
				
				user = googleUser.getBasicProfile().getEmail();
				
				var deed = {
						userEmail : user,
						masterDeedId : answer.id
				}; 
				
				creationCallback(deed);
				
			}, function() {});			
		
		}, 
		
		/**
		 * Get my score for today
		 */
		getTodayScore : function() {
			
			user = googleUser.getBasicProfile().getEmail();
			
			return $http.get(microservicesProtocol + "://" + microservicesUrl2 + "/partner/dailyScores?date=" + moment().format('YYYYMMDD') + "&userEmail=" + user);
		},
		
		/**
		 * Get my score for the specified week
		 */
		getWeekScore : function(week, year) {
			
			user = googleUser.getBasicProfile().getEmail();
			
			return $http.get(microservicesProtocol + "://" + microservicesUrl2 + "/partner/weeklyScores?week=" + week + "&year=" + year + "&userEmail=" + user);
		},
		
		/**
		 * Retrieves the daily scores based on the specified parameters: 
		 * 
		 *  - week		: 	an object {week: integer, year: integer}
		 *  				passing a week, the function will return the scores of each day in the specified week
		 */
		getDailyScores : function(week) {
			
			user = googleUser.getBasicProfile().getEmail();
			
			return $http.get(microservicesProtocol + "://" + microservicesUrl2 + "/partner/dailyScores?week=" + week.week + "&year=" + week.year + "&userEmail=" + user);
		},
		
		/**
		 * Get my deeds for today
		 */
		getDeeds : function() {
			
			user = googleUser.getBasicProfile().getEmail();
			
			return $http.get(microservicesProtocol + "://" + microservicesUrl2 + "/partner/deeds?date=" + moment().format('YYYYMMDD') + "&userEmail=" + user);
		},
		
		/**
		 * Post a new deed
		 */
		postDeed : function(deed) {
			
			return $http.post(microservicesProtocol + "://" + microservicesUrl2 + "/partner/deeds", deed);
		},

		/**
		 * Deletes the specified deed
		 */
		deleteDeed : function(deedId) {
			
			return $http.delete(microservicesProtocol + "://" + microservicesUrl2 + "/partner/deeds/" + deedId);
		},
		
		/**
		 * Creates a master deed
		 */
		postMasterDeed : function(masterDeed) {
			
			return $http.post(microservicesProtocol + "://" + microservicesUrl2 + "/partner/masterDeeds", masterDeed);
		},
		
		/**
		 * Retrieves the master deeds
		 */
		getMasterDeeds : function() {
			
			return $http.get(microservicesProtocol + "://" + microservicesUrl2 + "/partner/masterDeeds");
		}, 
		
		/**
		 * Retrieves the current week. 
		 * It returns a {week: integer, year: integer} object
		 */
		getCurrentWeek : function() {
			
			return $http.get(microservicesProtocol + "://" + microservicesUrl2 + "/partner/week?date=" + moment().format('YYYYMMDD'));
		},
		
		/**
		 * Retrieves the winner of a number of weeks
		 */
		getWeeksWinner : function(startingWeek, maxResults) {
			
			return $http.get(microservicesProtocol + "://" + microservicesUrl2 + "/partner/winner/weeks?startingYear=" + startingWeek.year + "&startingWeek=" + startingWeek.week + "&maxResults=" + maxResults);
		}

	}

} ]);
