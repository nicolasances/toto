var healthModule = angular.module("healthModule", []);
	
healthModule.controller("healthController", [ '$scope', '$http', '$timeout', '$mdDialog', '$mdSidenav', function($scope, $http, $timeout, $mdDialog, $mdSidenav) {

	$scope.init = function() {
		
		$scope.selectedPeriod = {year: parseInt(moment().format('YYYY'))};
		$scope.updateTotal();
		$scope.getExpenses();
	}
	
	$scope.getExpenses = function() {
		
		$http.get(microservicesProtocol + "://" + microservicesUrl + "/health/expenses").success(function(data, status, header, config) {
			
			if (data == null || data.expenses == null) return;
			
			$scope.expenses = new Array();
			
			for (i=0;i<data.expenses.length;i++) {
				$http.get(microservicesProtocol + "://" + microservicesUrl + "/expenses/expenses/" + data.expenses[i].linkedExpenseId).success(function(data, status, header, config) {
					$scope.expenses.push({date: data.date, amount: data.amount, description: data.description});
					$scope.updateTotal();
				});
			}
			
		});
	}
	
	$scope.updateTotal = function() {
		
		$scope.total = 0;

		if ($scope.expenses == null) return;
		
		for (i=0;i<$scope.expenses.length;i++) {
			$scope.total += $scope.expenses[i].amount;
		}
	}

	/**
	 * Adds a new medical expense. Opens a dialog for inserting the data of the new expense
	 */
	$scope.addExpense = function(ev) {
		
		function DialogController($scope, $mdDialog) {
			
			$scope.hide = function() {$mdDialog.hide;};
			$scope.cancel = function() {$mdDialog.cancel();};
			$scope.answer = function(expense) {$mdDialog.hide(expense);};
			$scope.selectExpense = function(expense) {$scope.answer(expense);};
			
			/**
			 * Retrieves the current period in an yearMonth string
			 */
			$scope.getCurrentPeriod = function() {
				
				var dayOfMonth = parseInt(moment().format('DD'));
				
				if (dayOfMonth > 27) return moment().add(1, 'months').format('YYYYMM');
				
				return moment().format('YYYYMM');
				
			}
			
			$scope.selectedPeriod = new Object();
			$scope.selectedPeriod.yearMonth = $scope.getCurrentPeriod();
			$scope.selectedPeriod.year = moment($scope.getCurrentPeriod() + '01', 'YYYYMMDD').format('YYYY');
			$scope.selectedPeriod.month = moment($scope.getCurrentPeriod() + '01', 'YYYYMMDD').format('MMMM');
			
			/**
			 * Loads previous month's expenses
			 */
			$scope.loadPreviousMonth = function() {
				$scope.selectedPeriod.yearMonth = moment($scope.selectedPeriod.yearMonth + '01', 'YYYYMMDD').subtract(1, 'months').format('YYYYMM');
				$scope.selectedPeriod.year = moment($scope.selectedPeriod.yearMonth + '01', 'YYYYMMDD').format('YYYY');
				$scope.selectedPeriod.month = moment($scope.selectedPeriod.yearMonth + '01', 'YYYYMMDD').format('MMMM');
				$scope.loadExpenses($scope.selectedPeriod.yearMonth);
			}
			
			/**
			 * Loads next month's expenses
			 */
			$scope.loadNextMonth = function() {
				$scope.selectedPeriod.yearMonth = moment($scope.selectedPeriod.yearMonth + '01', 'YYYYMMDD').add(1, 'months').format('YYYYMM');
				$scope.selectedPeriod.year = moment($scope.selectedPeriod.yearMonth + '01', 'YYYYMMDD').format('YYYY');
				$scope.selectedPeriod.month = moment($scope.selectedPeriod.yearMonth + '01', 'YYYYMMDD').format('MMMM');
				$scope.loadExpenses($scope.selectedPeriod.yearMonth);
			}
			
			/**
			 * Load the expenses of the specified month (in format YYYYMM)
			 */
			$scope.loadExpenses = function (yearMonth) {
				
				$http.get(microservicesProtocol + "://" + microservicesUrl + "/expenses/expenses?yearMonth=" + yearMonth).success(function(data, status, header, config) {
					$scope.expenses = data.expenses;
				});
			}
			
			$scope.loadExpenses($scope.selectedPeriod.yearMonth);
			
		}
		
		var useFullScreen = window.matchMedia( "(max-width: 960px)" ).matches;
	    var dialog = {controller: DialogController, templateUrl: 'modules/health/dlgAddExpense.html', parent: angular.element(document.body), targetEvent: ev, clickOutsideToClose: true, fullscreen: useFullScreen};
	    
	    $mdDialog.show(dialog).then(function(answer) {
	    	
	    	if ($scope.expenses == null) $scope.expenses = new Array();

	    	$scope.expense = new Object();
	    	$scope.expense.date = answer.date;
	    	$scope.expense.amount = answer.amount;
	    	$scope.expense.description = answer.description;
	    	$scope.expense.linkedExpenseId = answer.id;
	    	
	    	$scope.expenses.push($scope.expense);
	    	$scope.updateTotal();
	    	
	    	var data = {linkedExpenseId: $scope.expense.linkedExpenseId, year: moment($scope.expense.date, 'DD/MM/YYYY').format('YYYY')};
	    	
	    	$http.post(microservicesProtocol + "://" + microservicesUrl + "/health/expenses", data).success(function(data, status, header, config) {
	    		$scope.expense.id = data.id;
			});
	    	
	    }, function() {});
	}
	
	$scope.init();
	
} ]);