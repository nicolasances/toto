
var dashboardModule = angular.module("dashboardModule", ['GymServiceModule', 'BodyWeightServiceModule']);
var dashboardModuleInitialized = false;

dashboardModule.controller("dashboardController", [ '$scope', '$http', '$timeout', '$interval', 'calendarService', 'GymService', 'BodyWeightService', function($scope, $http, $timeout, $interval, calendarService, GymService, BodyWeightService) {
	
	$scope.init = function() {
		
		$scope.imagesServerHost = microservicesHost;
		$scope.imagesServerPort = imagesServerPort;
		
		$scope.initAppsList();
		$scope.initTopAppsList();

		$scope.initGym();
//		$scope.initRecipe(dashboardModuleInitialized);
		$scope.initExpenses();
		$scope.initMonreale();
		$scope.initSangiorgio();
		$scope.initTask();
//		$scope.initPiggy(dashboardModuleInitialized);
		$scope.initWeekend();

//		dashboardModuleInitialized = true;
	}
	
	$scope.initAppsList = function() {
		$scope.apps = ['gym', 'piggy', 'housekeeping', 'hotel', 'flight', 'recipe', 'car', 'health', 'subscriptions', 'tasks', 'sangiorgio', 'monreale', 'expenses', 'justice', 'weekend', 'card'];
	}
	
	$scope.initTopAppsList = function() {
		$scope.topApps = [];
		$scope.topApps.push({id: 'expenses', imageUrl: 'images/svg/budget.svg'});
		$scope.topApps.push({id: 'body', imageUrl: 'images/svg/body.svg'});
		$scope.topApps.push({id: 'weekends', imageUrl: 'images/svg/palm-tree.svg'});
		
		$scope.selectedTopApp = $scope.topApps[0];
	}
	
	$scope.selectTopApp = function(app) {
		$scope.selectedTopApp = app;
	}

	/*************************************************************************************************************************
	 *************************************************************************************************************************
	 *
	 * CARD
	 *
	 *************************************************************************************************************************
	 *************************************************************************************************************************/
	$scope.initCard = function() {
		
		$http.get("https://" + microservicesUrl + "/card/cards").success(function(data) {
			
			if (data != null && data.cards != null && data.cards.length > 0) {
				
				$http.get("https://" + microservicesUrl + "/expenses/expenses?cardId=" + data.cards[0].id + "&cardMonth=" + moment().format('MM')).success(function(data) {
					
					if (data.expenses != null) {
						var i;
						$scope.cardTotal = 0;
						for (i = 0; i < data.expenses.length; i++) {
							$scope.cardTotal += data.expenses[i].amount;
						}
						
						$scope.relevantExpenses.push({id: 'card', imageUrl: 'images/svg/credit-card.svg', amount: $scope.cardTotal});
					}
					
				});
				
			}
			
		});
		
	}
	
	/*************************************************************************************************************************
	 *************************************************************************************************************************
	 *
	 * WEEKEND
	 *
	 *************************************************************************************************************************
	 *************************************************************************************************************************/
	$scope.initWeekend = function() {

		$scope.buildWeekendView();
		$scope.findLast2Weekends();
		$scope.findNextWeekend();
	}
	
	$scope.findNextWeekend = function() {
		$http.get("https://" + microservicesUrl + "/weekend/weekends?onlyNext=true").success(function(data) {
			
			if (data.weekends == null || data.weekends.length == 0) return;
			
			$scope.nextWeekend = data.weekends[0];
			$scope.nextWeekendDistance = moment().to($scope.nextWeekend.weekend);
			
		});
	}
	
	$scope.findLast2Weekends = function() {
		
		$http.get("https://" + microservicesUrl + "/weekend/weekends?maxResults=2&sortDescendingDate=true&showCost=true&onlyClosed=true").success(function(data) {
			$scope.lastWeekends = data.weekends;

			if ($scope.lastWeekends != null) {
				var i; 
				for (i = 0; i < $scope.lastWeekends.length; i++) {
					$scope.relevantExpenses.push({id: 'weekend', imageUrl: 'images/svg/palm-tree.svg', amount: $scope.lastWeekends[i].cost.amount, info: $scope.lastWeekends[i].destination});
				}
			}
		});
	}

	/**
	 * Creates an list of weekends (empty)
	 */
	$scope.buildWeekendView = function() {
		
		var wes = calendarService.getWeekends(12);
		
		$scope.weekends = [];
		for (i=0;i<wes.length;i++) {
			$scope.weekends[i] = {weekend: wes[i]};
		}
		
		$scope.getUpcomingWeekends();
		
	}

	/**
	 * Finds the index of a weekend in the view calendar
	 */
	$scope.findWeekendInView = function(we) {
		
		var i;
		for (i=0;i<$scope.weekends.length;i++) {

			if (new Date($scope.weekends[i].weekend).toDateString() == new Date(we).toDateString()) return i;
		}
		
		return -1;
	}

	/**
	 * Retrieves the planned weekends and fill the created view calendar 
	 * with them
	 */
	$scope.getUpcomingWeekends = function() {
		
		$http.get("https://" + microservicesUrl + "/weekend/weekends").success(function(data) {
			
			$scope.persistedWeekends = data.weekends;
			
			var i;
			for (i=0;i<$scope.persistedWeekends.length;i++) {
				
				var index = $scope.findWeekendInView($scope.persistedWeekends[i].weekend);
				

				if (index != -1) $scope.weekends.splice(index, 1, $scope.persistedWeekends[i]);
			}

		});
	}
	
	/*************************************************************************************************************************
	 *************************************************************************************************************************
	 *
	 * TASK
	 *
	 *************************************************************************************************************************
	 *************************************************************************************************************************/
	$scope.initTask = function() {
		
		$scope.tasks = [];
		$scope.currentShowingTaskIndex = 0;
		$scope.task = null;
		
		$http.get("https://" + microservicesUrl + "/tasks/tasks?scheduling=today").success(function(data, status, header, config) {
			
			if (data == null) return;
			
			$scope.todayTasksCount = 0;
			var i;
			for (i = 0; i < data.tasks.length; i++) {
				if (!data.tasks[i].completed) {
					$scope.todayTasksCount++;
					$scope.tasks.push(data.tasks[i]);
				}
			}

			// 2. Start a timer showing one task at a time
			$scope.toggleTaskShowing();
		});
	}
	
	$scope.toggleTaskShowing = function() {
		
		if ($scope.currentShowingTaskIndex == $scope.tasks.length) $scope.currentShowingTaskIndex = 0;
		
		if ($scope.tasks[$scope.currentShowingTaskIndex] != null) {
			
			document.querySelector('#widget-tasks .task').classList.remove('visible');
			
			if (!$scope.$$destroyed) $timeout(function() {

				$scope.task = $scope.tasks[$scope.currentShowingTaskIndex];
				$scope.currentShowingTaskIndex++;
				
				document.querySelector('#widget-tasks .task').classList.add('visible');
				
				if (!$scope.$$destroyed) $timeout($scope.toggleTaskShowing, 1500);
				
			}, 510);
		}
	}
	
	/*************************************************************************************************************************
	 *************************************************************************************************************************
	 *
	 * PIGGY
	 *
	 *************************************************************************************************************************
	 *************************************************************************************************************************/
	$scope.initPiggy = function(initialized) {
		
		$http.get("https://" + microservicesUrl + "/piggy/deposits").success(function(data, status, header, config) {
			
			if (data == null) return;

			for (i=0; i<data.deposits.length; i++) {
				if (data.deposits[i].status == 'deposit') {
					
					$timeout($scope.piggyToggleWarning, 500);
					
					break;
				}
			}
			
		});
		
	}
	
	$scope.piggyToggleWarning = function() {

		if (document.getElementById('tile-piggy') != null) {
			
			if (document.querySelector('#tile-piggy md-icon').classList.contains('transition'))
				document.querySelector('#tile-piggy md-icon').classList.remove('transition');
			else 
				document.querySelector('#tile-piggy md-icon').classList.add('transition');
	 	}
		
		if (!$scope.$$destroyed) $timeout($scope.piggyToggleWarning, 1100);
		
	}
	
	/*************************************************************************************************************************
	 *************************************************************************************************************************
	 *
	 * MONREALE
	 *
	 *************************************************************************************************************************
	 *************************************************************************************************************************/
	$scope.initSangiorgio = function() {
		
		$http.get("https://" + microservicesUrl + "/sangiorgio/taxes?unpaied=true").success(function(data, status, header, config) {
			
			$scope.sangiorgioTaxes = 0;

			if (data.taxes != null) {
				var i;
				for (i = 0; i < data.taxes.length; i++) $scope.sangiorgioTaxes += data.taxes[i].amount; 
			} 
			
			$http.get("https://" + microservicesUrl + "/sangiorgio/ebills?unpaied=true").success(function(data, status, header, config) {
				
				$scope.sangiorgioEBills = 0;

				if (data.bills != null) {
					var i;
					for (i = 0; i < data.bills.length; i++) $scope.sangiorgioEBills += data.bills[i].amount; 
				} 
				
				$http.get("https://" + microservicesUrl + "/sangiorgio/gbills?unpaied=true").success(function(data, status, header, config) {
					
					$scope.sangiorgioGBills = 0;

					if (data.bills != null) {
						var i;
						for (i = 0; i < data.bills.length; i++) $scope.sangiorgioGBills += data.bills[i].amount; 
					} 

					
				});
			});
			
		});
		
	}
	

	/*************************************************************************************************************************
	 *************************************************************************************************************************
	 *
	 * JUSTICE
	 *
	 *************************************************************************************************************************
	 *************************************************************************************************************************/
	$scope.initJustice = function() {
		
		$scope.justiceAmount = 0;
		
		$http.get("https://" + microservicesUrl + "/justice/equitalia/bills/sum?unpaied=true").success(function(data, status, header, config) {
			
			if (data != null && data.sum != null) $scope.justiceAmount += data.sum;
			
			$http.get("https://" + microservicesUrl + "/justice/fines/sum?unpaied=true").success(function(data, status, header, config) {
				
				if (data != null && data.sum != null) $scope.justiceAmount += data.sum;
				
				$scope.relevantExpenses.push({id: 'justice', imageUrl: 'images/svg/police-hat.svg', amount: $scope.justiceAmount});
				
			});
			
		});
		
	}
	
	/*************************************************************************************************************************
	 *************************************************************************************************************************
	 *
	 * MONREALE
	 *
	 *************************************************************************************************************************
	 *************************************************************************************************************************/
	$scope.initMonreale = function() {
		
		$http.get("https://" + microservicesUrl + "/monreale/taxes?unpaied=true").success(function(data, status, header, config) {
			
			$scope.monrealeTaxes = 0;

			if (data.taxes != null) {
				var i;
				for (i = 0; i < data.taxes.length; i++) $scope.monrealeTaxes += data.taxes[i].amount; 
			}

			$http.get("https://" + microservicesUrl + "/monreale/ebills?unpaied=true").success(function(data, status, header, config) {
				
				$scope.monrealeEBills = 0;
				
				if (data.bills != null) {
					var i;
					for (i = 0; i < data.bills.length; i++) $scope.monrealeEBills += data.bills[i].amount;
				}
				
				$http.get("https://" + microservicesUrl + "/monreale/gbills?unpaied=true").success(function(data, status, header, config) {
					
					$scope.monrealeGBills = 0;
					
					if (data.bills != null) {
						var i;
						for (i = 0; i < data.bills.length; i++) $scope.monrealeGBills += data.bills[i].amount;
					}
					
				});
			});
			
		});
		
	}
	
	/*************************************************************************************************************************
	 *************************************************************************************************************************
	 *
	 * EXPENSES
	 *
	 *************************************************************************************************************************
	 *************************************************************************************************************************/
	$scope.initExpenses = function() {
		
		var yearMonth = $scope.getCurrentPeriod();
		
		$http.get("https://" + microservicesUrl + "/expenses/expenses/" + yearMonth + "/total").success(function(data, status, header, config) {
			
			$scope.expensesTotal = data.total;
			
		});
		
		$http.get("https://" + microservicesUrl + "/expenses/expenses/totals?maxResults=10&currentYearMonth=" + yearMonth).success(function(data, status, header, config) {
			
			$scope.totals = data.totals;
			
			if (data.totals != null) {
				
				$scope.maxTotal = 0;
				
				var i;
				for (i=0; i<$scope.totals.length; i++) {
					if ($scope.totals[i].amount > $scope.maxTotal) $scope.maxTotal = $scope.totals[i].amount; 
				}
				
				var i; 
				for (i=0; i<$scope.totals.length; i++) {
					$scope.totals[i].percentage = 100 * $scope.totals[i].amount / $scope.maxTotal;
					$scope.totals[i].height = 38 * $scope.totals[i].amount / $scope.maxTotal;
					if (moment(new Date($scope.totals[i].month)).format('YYYYMM') == yearMonth) $scope.totals[i].current = true;
				}
				
			} 
			
		});
		
		$scope.relevantExpenses = [];
		$scope.initJustice();
		$scope.initCard();
	}
	
	/**
	 * Retrieves the current period in an yearMonth string
	 */
	$scope.getCurrentPeriod = function() {
		
		var dayOfMonth = parseInt(moment().format('DD'));
		
		if (dayOfMonth > 27) return moment().add(1, 'months').format('YYYYMM');
		
		return moment().format('YYYYMM');
		
	}
	
	/*************************************************************************************************************************
	 *************************************************************************************************************************
	 *
	 * RECIPE
	 *
	 *************************************************************************************************************************
	 *************************************************************************************************************************/
	$scope.initRecipe = function(initialized) {
	}
	
	/*************************************************************************************************************************
	 *************************************************************************************************************************
	 *
	 * GYM
	 *
	 *************************************************************************************************************************
	 *************************************************************************************************************************/
	$scope.initGym = function(initialized) {
		
		$scope.gymGetMuscleGroups();
		
		BodyWeightService.getWeights().success(function(data) {
			
			$scope.weights = data.weights;
			
			$timeout(function() {BodyWeightService.createWeightGraph(data.weights);}, 500);
		});
		
		BodyWeightService.getCurrentWeight(function(weight) {
			
			$scope.currentBodyWeight = weight;
		});
	}
	
	$scope.toggleMuscleSelection = function() {$scope.showMuscles = !$scope.showMuscles;}

	$scope.muscleSelection = function(muscle) {
		$scope.selectedMuscle = muscle;
		$scope.showMuscles = false;
		$scope.getScoresForMuscle($scope.selectedMuscle.id);
	}

	/**
	 * Retrieves the list of muscle groups (ex. Chest, Biceps, etc..)
	 */
	$scope.gymGetMuscleGroups = function() {
		
		GymService.getMuscleGroups().success(function(data) {
			$scope.muscles = data.muscleGroups;
			$scope.selectedMuscle = $scope.muscles[0];
			$scope.getScoresForMuscle($scope.selectedMuscle.id);
		});
	}
	
	$scope.getScoresForMuscle = function(muscle) {
		
		GymService.getScoresForMuscle(muscle).success(function(data) {
			$scope.muscleScoreWeeks = data.weeks;
			$scope.scoreDeltas = GymService.calculateScoreDeltas($scope.muscleScoreWeeks);
			$timeout($scope.createMuscleScoreGraph, 500);
		});
		
	}
	
	$scope.createMuscleScoreGraph = function() {
		
		GymService.createMuscleScoreGraph($scope.muscleScoreWeeks); 
	}
	
	$scope.init();
	
}]);