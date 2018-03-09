var dietMenus = [
	{path: '/', imageUrl: 'images/svg/home.svg', name: "Home"},
	{path: '/diet', imageUrl: 'images/svg/dashboard.svg', name: 'Dashboard', selected: true}
];

var dietModule = angular.module("dietModule", ["DietServiceModule"]);

/**
 * Diet Dashboard controller
 */
dietModule.controller("dietDashboardController", [ '$scope', '$http', '$timeout', '$mdDialog', '$mdSidenav', 'DietService', function($scope, $http, $timeout, $mdDialog, $mdSidenav, DietService) {

	$scope.init = function() {
		
		$scope.dietMenus = dietMenus;
		
		DietService.getWaterConsumption().success(function(data) {

			$scope.waterConsumption = data.total;
			$scope.waterConsumptionInL = $scope.waterConsumption / 1000;
			
			DietService.getWaterConsumptionGoal().success(function(data) {

				$scope.waterConsumptionGoal = data.amount;
				$scope.waterConsumptionGoalInL = data.amount / 1000;
				
				$scope.updateWaterConsumptionProgress();
			});
		});
	}
	
	/**
	 * Updates the water consumption progress
	 */
	$scope.updateWaterConsumptionProgress = function() {

		if ($scope.waterConsumption == null) $scope.waterConsumption = 0;
		if ($scope.waterConsumptionGoal == null) {
			$scope.waterConsumptionGoal = 1000;
			$scope.waterConsumptionGoalInL = 1;
		}

		$scope.waterConsumptionProgress = $scope.waterConsumption / $scope.waterConsumptionGoal;
	}
	
	/**
	 * Adds a water consumption by showing a dialog for the user to choose 
	 * for an amount of consumed water and then calling the service to 
	 * update the backend.
	 */
	$scope.addWaterConsumption = function() {
		
		DietService.showAddWaterConsumptionDialog(function(amount) {
			
			DietService.postWaterConsumption(amount);
			
			$scope.waterConsumption += amount;
			$scope.waterConsumptionInL += amount / 1000;
			
			$scope.updateWaterConsumptionProgress();
		}); 
	}
	
	/**
	 * Changes the goal for water consumption
	 */
	$scope.changeWaterConsumptionGoal = function() {
		
		DietService.showChangeWaterConsumptionGoalDialog(function(goal) {

			DietService.putWaterConsumptionGoal(goal);
			
			$scope.waterConsumptionGoal = goal;
			$scope.waterConsumptionGoalInL = goal / 1000;
			
			$scope.updateWaterConsumptionProgress();
			
		});
	}
	
	$scope.init();
	
} ]);

