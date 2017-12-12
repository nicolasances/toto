
var dashboardModule = angular.module("dashboardModule", ['GymServiceModule', 'BodyWeightServiceModule', 'DietServiceModule']);
var dashboardModuleInitialized = false;

dashboardModule.controller("dashboardController", [ '$rootScope', '$scope', '$http', '$timeout', '$interval', '$mdMedia', 'calendarService', 'expensesService', 'GymService', 'BodyWeightService', 'ChimpService', 'DietService', function($rootScope, $scope, $http, $timeout, $interval, $mdMedia, calendarService, expensesService, GymService, BodyWeightService, ChimpService, DietService) {
	
	$scope.init = function() {
		
		$rootScope.currentMenu = 'Toto Dashboard'
		
		$scope.checkAppAuthorizations();
		
		$scope.totoAppList = totoAppList;
		
		$scope.initUserInfo();
		
	}
	
	/**
	 * Initializes some dashboard scope variables related to the user
	 */
	$scope.initUserInfo = function() {
		
		var profile = googleUser.getBasicProfile();
		
		$scope.username = profile.getGivenName();
		$scope.userProfilePicture = profile.getImageUrl();
	}
	
	/**
	 * Checks all the required app authorizations to display the dashboard.
	 * 
	 * The dashboard is displayed only to someone that has all the required authorizations: 
	 *  - gym
	 *  - health
	 *  - diet
	 *  - expenses
	 *  - cards 
	 */
	$scope.checkAppAuthorizations = function() {
		
		$scope.gymAuthorized = false;
		$scope.expensesAuthorized = false;
		$scope.cardAuthorized = false;
		$scope.dietAuthorized = false;
		$scope.healthAuthorized = false;
		
		for (var i = 0; i < totoAppList.length; i++) {

			var app = totoAppList[i];
			
			if (app.id == 'gym') $scope.gymAuthorized = app.authorized;
			if (app.id == 'expenses') $scope.expensesAuthorized = app.authorized;
			if (app.id == 'card') $scope.cardAuthorized = app.authorized;
			if (app.id == 'diet') $scope.dietAuthorized = app.authorized;
			if (app.id == 'health') $scope.healthAuthorized = app.authorized;
		}
		
	}
	
	$scope.init();
	
}]);

/**
 * Directive showing the Health & Fitness data in the dashboard 
 */
dashboardModule.directive('dashboardHealthFitness', function($http, $mdDialog, $rootScope, GymService, BodyWeightService, DietService) {
	return {
		scope : {
			title: '@'
		},
		templateUrl : 'modules/dashboard/directives/dashboard-health-fitness.html',
		link : function(scope) {
			
			scope.gtXs = $rootScope.gtXs;
			
			scope.init = function() {
				
				scope.initGym();
				scope.initDiet();

			}
			
			scope.initDiet = function() {
				
				DietService.getWaterConsumption().success(function(data) {

					scope.waterConsumption = data.total;
					scope.waterConsumptionInL = scope.waterConsumption / 1000;
					
					DietService.getWaterConsumptionGoal().success(function(data) {

						scope.waterConsumptionGoal = data.amount;
						scope.waterConsumptionGoalInL = data.amount / 1000;
						
						scope.updateWaterConsumptionProgress();
					});
				});
			}
			
			/**
			 * Adds a water consumption by showing a dialog for the user to choose 
			 * for an amount of consumed water and then calling the service to 
			 * update the backend.
			 */
			scope.addWaterConsumption = function() {
				
				DietService.showAddWaterConsumptionDialog(function(amount) {
					
					DietService.postWaterConsumption(amount);
					
					scope.waterConsumption += amount;
					scope.waterConsumptionInL += amount / 1000;
					
					scope.updateWaterConsumptionProgress();
					scope.initHealth();
				}); 
			}
			
			/**
			 * Updates the water consumption progress
			 */
			scope.updateWaterConsumptionProgress = function() {

				if (scope.waterConsumption == null) scope.waterConsumption = 0;
				if (scope.waterConsumptionGoal == null) {
					scope.waterConsumptionGoal = 1000;
					scope.waterConsumptionGoalInL = 1;
				}

				scope.waterConsumptionProgress = scope.waterConsumption / scope.waterConsumptionGoal;
			}
			
			/**
			 * Initializes the gym information
			 */
			scope.initGym = function(initialized) {
				
				BodyWeightService.getCurrentWeight(function(weight) {
					
					scope.currentBodyWeight = weight;
					
				});
				
				GymService.getSessions(moment().format('YYYYMMDD')).success(function(data) {
					
					if (data != null && data.sessions != null && data.sessions[0] != null) {
						
						GymService.getSession(data.sessions[0].id).success(function(data) {

							var firstImpactedMuscle = data.impactedMuscles[0];
							
							GymService.getMuscleWeekGoal(firstImpactedMuscle.muscle.id, 'goodPain').success(function (data) {
								
								scope.gymTodayMuscle = data;
								
								var actual = data.actual == null ? 0 : data.actual;
								var goal = data.goal;
								
								scope.gymPercentageOfGoalReached = actual / goal;
								
							});
						});
					} 
					else {
						
						GymService.getRestDay(moment().format('YYYYMMDD')).success(function(data) {
							
							if (data.days != null && data.days.length > 0) {
								
								scope.gymRestDay = true;
								scope.gymPercentageOfGoalReached = 1;
								scope.gymTodayMuscle = {muscle: 'sleep'};
							}
						});
					}
				});
				
			}
			
			scope.init();
		}
	}
});

/**
 * Directive showing the Money data in the dashboard 
 */
dashboardModule.directive('dashboardMoney', function($http, $mdDialog, $rootScope, GymService, BodyWeightService, DietService, expensesService) {
	return {
		scope : {
			title: '@'
		},
		templateUrl : 'modules/dashboard/directives/dashboard-money.html',
		link : function(scope) {
			
			scope.go = $rootScope.go;
			
			scope.gtXs = $rootScope.gtXs;
			
			scope.init = function() {
				scope.initExpenses();
				scope.initCard();
			}
			
			scope.initExpenses = function() {
				
				var yearMonth = expensesService.getCurrentMonth();
				
				$http.get("https://" + microservicesUrl + "/expenses/expenses/" + yearMonth + "/total?currency=EUR").success(function(data, status, header, config) {
					
					scope.expensesTotal = data.total;
					
				});
				
				$http.get("https://" + microservicesUrl + "/expenses/expenses/totals?maxResults=5&currency=EUR&currentYearMonth=" + yearMonth).success(function(data, status, header, config) {
					
					scope.moneyBars = [];
					
					for (var i = 0; i < data.totals.length; i++) {
						
						scope.moneyBars.push({value: data.totals[i].amount, label: moment(data.totals[i].month).format('MMM').substring(0, 1)});
					}
					
					console.log(scope.moneyBars);
					
				});
				
				scope.relevantExpenses = [];
				scope.initCard();
			}
			
			scope.initCard = function() {
				
				$http.get("https://" + microservicesUrl + "/card/cards").success(function(data) {
					
					if (data != null && data.cards != null && data.cards.length > 0) {
						
						$http.get("https://" + microservicesUrl + "/expenses/expenses?cardId=" + data.cards[0].id + "&cardMonth=" + moment().format('MM')).success(function(data) {
							
							if (data.expenses != null) {
								var i;
								scope.cardTotal = 0;
								for (i = 0; i < data.expenses.length; i++) {
									scope.cardTotal += data.expenses[i].amount;
								}
								
								scope.relevantExpenses.push({id: 'card', imageUrl: 'images/svg/credit-card.svg', amount: scope.cardTotal});
							}
							
						});
						
					}
					
				});
				
			}
			
			scope.init();
		
		}
	}
});