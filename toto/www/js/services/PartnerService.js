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
			
			return $http.get("https://" + microservicesUrl2 + "/partner/dailyScores?date=" + moment().format('YYYYMMDD') + "&userEmail=" + user);
		},
		
		/**
		 * Get my deeds for today
		 */
		getDeeds : function() {
			
			user = googleUser.getBasicProfile().getEmail();
			
			return $http.get("https://" + microservicesUrl2 + "/partner/deeds?date=" + moment().format('YYYYMMDD') + "&userEmail=" + user);
		},
		
		/**
		 * Get the deeds that I have to approve
		 */
		getDeedsToApprove : function() {
			
			user = googleUser.getBasicProfile().getEmail();
			
			return $http.get("https://" + microservicesUrl2 + "/partner/deeds?partnerPendingDeeds=true&userEmail=" + user);
		},
		
		/**
		 * Post a new deed
		 */
		postDeed : function(deed) {
			
			return $http.post("https://" + microservicesUrl2 + "/partner/deeds", deed);
		},
		
		/**
		 * Approved the specified deed
		 */
		approveDeed : function(deedId) {
			
			return $http.put("https://" + microservicesUrl2 + "/partner/deeds/" + deedId, {approvedByPartner: true});
		},
		
		/**
		 * Deletes the specified deed
		 */
		deleteDeed : function(deedId) {
			
			return $http.delete("https://" + microservicesUrl2 + "/partner/deeds/" + deedId);
		},
		
		/**
		 * Creates a master deed
		 */
		postMasterDeed : function(masterDeed) {
			
			return $http.post("https://" + microservicesUrl2 + "/partner/masterDeeds", masterDeed);
		},
		
		/**
		 * Retrieves the master deeds
		 */
		getMasterDeeds : function() {
			
			return $http.get("https://" + microservicesUrl2 + "/partner/masterDeeds");
		}

	}

} ]);
