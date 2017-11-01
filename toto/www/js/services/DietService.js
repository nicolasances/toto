var dietServiceModule = angular.module('DietServiceModule', []);

dietServiceModule.factory('DietService', [ '$http', '$rootScope', '$location', '$mdDialog', function($http, $rootScope, $location, $mdDialog) {

	return {

		/**
		 * Shows the water consumption dialog 
		 * 
		 * Requires: 
		 * 
		 *  - creationCallback	:	the callback to be called when the user picked a choice.
		 *  						it's a function(amount)
		 *  						amount will be an integer (250, 500, 750, ...)
		 */
		showAddWaterConsumptionDialog : function(creationCallback) {

			function DialogController($scope, $mdDialog) {
				
				$scope.hide = function() {$mdDialog.hide;};
				$scope.cancel = function() {$mdDialog.cancel();};
				$scope.answer = function(amount) {$mdDialog.hide(amount);};
				
				$scope.types = [
				                {amount: 250, svg: 'images/svg/water-glass.svg'},
				                {amount: 500, svg: 'images/svg/small-water-bottle.svg'},
				                {amount: 750, svg: 'images/svg/big-water-bottle.svg'}
				                ];
				
			}
			
			var useFullScreen = false;
			var dialog = {controller: DialogController, templateUrl: 'modules/diet/dlgAddWaterConsumption.html', parent: angular.element(document.body), clickOutsideToClose: true, fullscreen: useFullScreen};
			
			$mdDialog.show(dialog).then(function(answer) {
				
				creationCallback(answer);
				
			}, function() {});			
		
		}, 

		/**
		 * Shows the water consumption goal dialog 
		 * 
		 * Requires: 
		 * 
		 *  - confirmationCallback	:	the callback to be called when the user changed the goal
		 *  							it's a function(amount)
		 *  							amount will be an integer (250, 500, 750, ...)
		 */
		showChangeWaterConsumptionGoalDialog : function(confirmationCallback) {

			function DialogController($scope, $mdDialog) {
				
				$scope.hide = function() {$mdDialog.hide;};
				$scope.cancel = function() {$mdDialog.cancel();};
				$scope.answer = function(goal) {$mdDialog.hide(goal);};
				
			}
			
			var useFullScreen = false;
			var dialog = {controller: DialogController, templateUrl: 'modules/diet/dlgChangeWaterConsumptionGoal.html', parent: angular.element(document.body), clickOutsideToClose: true, fullscreen: useFullScreen};
			
			$mdDialog.show(dialog).then(function(answer) {
				
				confirmationCallback(answer);
				
			}, function() {});			
		
		}, 
		
		/**
		 * Posts a water consumption amount. Use this when you want to notify Toto that you consumed some water.
		 */
		postWaterConsumption : function(amount) {
			
			return $http.post("https://" + microservicesUrl + "/diet/water", {amount: amount});
		}, 
		
		/**
		 * Retrieves the water consumption of the day
		 */
		getWaterConsumption : function() {
			
			return $http.get("https://" + microservicesUrl + "/diet/water?date=" + moment().format('YYYYMMDD'));
		},
		
		/**
		 * Gets the water consumption of the specified week of the year
		 */
		getWaterConsumptionOfWeek : function(week, year) {
			
			return $http.get("https://" + microservicesUrl + "/diet/water?week=" + week + "&year=" + year);
		},
		
		/**
		 * Updates the water consumption goal. 
		 * 
		 * The provided amount must be in milliliters.
		 */
		putWaterConsumptionGoal : function(amountInMl) {
			
			return $http.put("https://" + microservicesUrl + "/diet/water/goal", {amount: amountInMl});
		}, 
		
		/**
		 * Retrieves the water consuption goal.
		 * 
		 * Returns a promise function(data) where data: {amount: integer}
		 */
		getWaterConsumptionGoal : function() {
			
			return $http.get("https://" + microservicesUrl + "/diet/water/goal");
		}
		
	}

} ]);
