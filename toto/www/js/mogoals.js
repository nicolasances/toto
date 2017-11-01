var mogoalsModule = angular.module("mogoalsModule", []);

mogoalsModule.controller("mogoalsDashboardController", [ '$scope', '$http', '$timeout', '$mdDialog', '$mdSidenav', '$mdMedia', '$interval', function($scope, $http, $timeout, $mdDialog, $mdSidenav, $mdMedia, $interval) {
	
	$scope.initContext = function() {
		
		$scope.mainGoal = new Object();
		$scope.mainGoal.month = moment('01/' + $scope.getCurrentMonth() + '/' + moment().format('YYYY'), 'DD/MM/YYYY');
		$scope.mainGoal.level = 0;
		
		$scope.goals = new Object();
		$scope.goals.rows = [{categories: []}]; 
		
		$scope.loadMainGoal();
		$scope.getCategories();
	}
	
	var mainGoalAnimationLevel = 0;
	
	$scope.loadMainGoal = function() {
		
		var timer = $interval(function() {
			mainGoalAnimationLevel += 1;
			
			if (mainGoalAnimationLevel > $scope.mainGoal.level) {
				mainGoalAnimationLevel = $scope.mainGoal.level;
				$interval.cancel(timer);
			}
			
			document.querySelector('#maingoal-level').style.height = mainGoalAnimationLevel + '%';
			
		}, 10);
		
	}
	
	/**
	 * Adds a goal for a category
	 */
	$scope.addCategoryGoal = function(ev) {
		
		var categories = $scope.categories;
		
		function DialogController($scope, $mdDialog) {

			$scope.hide = function() {$mdDialog.hide;};
			$scope.cancel = function() {$mdDialog.cancel();};
			$scope.answer = function(goal) {$mdDialog.hide(goal);};
			
			$scope.steps = [1,2];
			$scope.currentStep = 1;
			$scope.categories = categories;
			
		}
		
	    var useFullScreen = window.matchMedia( "(max-width: 960px)" ).matches;
	    var dialog = {controller: DialogController, templateUrl: 'modules/mogoals/dlgAddCategoryGoal.html', parent: angular.element(document.body), targetEvent: ev, clickOutsideToClose: true, fullscreen: useFullScreen};
	    
	    $mdDialog.show(dialog).then(function(answer) {

	    	var i;
	    	for (i = 0; i < $scope.goals.rows.length; i++) {
	    		if ($scope.goals.rows[i].categories.length < 3) {
	    			$scope.goals.rows[i].categories.push(answer);
	    			break;
	    		}
	    		else {
	    			$scope.goals.rows.push({categories: []});
	    			$scope.goals.rows[i+1].categories.push(answer);
	    			break;
	    		}
	    	}
	    	
//	    	$http.post("https://" + microservicesUrl + "/mogoals/categories", data).success(function(data, status, header, config) {
//	    		$scope.expense.id = data.id;
//			});
	    	
	    }, function() {});
	}
	
	/**
	 * Sets the main goal amount
	 */
	$scope.setMainGoal = function(ev) {
		
		function DialogController($scope, $mdDialog) {

			$scope.hide = function() {$mdDialog.hide;};
			$scope.cancel = function() {$mdDialog.cancel();};
			$scope.answer = function(mainGoal) {$mdDialog.hide(mainGoal);};
			
		}
		
	    var useFullScreen = window.matchMedia( "(max-width: 960px)" ).matches;
	    var dialog = {controller: DialogController, templateUrl: 'modules/mogoals/dlgSetMainGoal.html', parent: angular.element(document.body), targetEvent: ev, clickOutsideToClose: true, fullscreen: useFullScreen};
	    
	    $mdDialog.show(dialog).then(function(answer) {

	    	$scope.mainGoal.amount = answer;
	    	
//	    	$http.post("https://" + microservicesUrl + "/mogoals/main", $scope.mainGoal).success(function(data, status, header, config) {
//	    		$scope.expense.id = data.id;
//			});
	    	
	    }, function() {});
	}
	
	/**
	 * Retrieves the current month in MMM format
	 */
	$scope.getCurrentMonth = function() {
		var dayOfMonth = parseInt(moment().format('DD'));
		
		if (dayOfMonth > 27) return moment().add(1, 'months').format('MMM');
		
		return moment().format('MMM');
	}
	
	/**
	 * Retrieves the categories
	 */
	$scope.getCategories = function() {
	
		$http.get("https://" + microservicesUrl + "/expenses/categories").success(function(data, status, header, config) {
			$scope.categories = data.categories;
		});
	}

	
	$scope.initContext();
	
}]);

