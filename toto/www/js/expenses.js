var expensesModule = angular.module("expensesModule", []);

expensesModule.controller("expensesDashboardController", [ '$rootScope', '$scope', '$http', '$timeout', '$mdDialog', '$mdSidenav', '$mdMedia', '$interval', 'expensesService', function($rootScope, $scope, $http, $timeout, $mdDialog, $mdSidenav, $mdMedia, $interval, expensesService) {
	
	var categoryWidgetOriginalTop;
	var categoryReportItemOriginalTop;
	
	$scope.initContext = function() {
		
		$scope.gtsm = $mdMedia('gt-sm');
		$rootScope.currentMenu = 'Payments dashboard';
		
	}
	
	/**
	 * Creates a quick payment where only the basic info is requested
	 */
	$scope.addQuickExpense = function(ev) {
		
		var insertionCallback = function(expense) {};
		var creationCallback = function(promise) {};
		
		expensesService.addQuickPayment(ev, insertionCallback, creationCallback, expensesService.getCurrentMonth()); 
	}
	
	$scope.initContext();
	
}]);

/***********************************************************************************************************************
 * EXPENSES LIST
 **********************************************************************************************************************/
expensesModule.controller("expensesController", [ '$rootScope', '$scope', '$http', '$timeout', '$mdDialog', '$mdSidenav', 'expensesService', function($rootScope, $scope, $http, $timeout, $mdDialog, $mdSidenav, expensesService) {

	/**
	 * Prepares the context object
	 */
	$scope.initContext = function() {
		
		$rootScope.currentMenu = 'Month payments';

	}

	/**
	 * Add a new expense
	 */
	$scope.addExpense = function(ev) {
		
		expensesService.addPayment(function(expense) {}, function(expenseId) {});
		
	}
	
	$scope.initContext();

} ]);

/******************************************************************************************
 * DIRECTIVES
 *****************************************************************************************/
expensesModule.directive('expensesMonthTotal', ['expensesService', '$timeout', function(expensesService, $timeout) {
	
	return {
		scope: {
			currency: '@',
			decimals : '@'
		},
		templateUrl: 'modules/expenses/directives/expenses-month-total.html',
		link: function(scope) {
			
			scope.currentYearMonth = expensesService.getCurrentMonth();
			scope.currentMonth = moment(scope.currentYearMonth + '01', 'YYYYMMDD').format('MMM');
			
			if (scope.decimals == null) scope.decimals = 2;
			
			/**
			 * Loads the total expenses of the month
			 */
			scope.loadTotal = function() {
				
				expensesService.getMonthTotal(scope.currency, scope.currentYearMonth).success(function (data) {
					
					scope.currentMonthTotal = data.total;
				});
			}
			
			scope.loadTotal();
		}
	}
}]);

expensesModule.directive('expensesTopSpendingCategories', ['expensesService', '$timeout', function(expensesService, $timeout) {
	
	return {
		scope: {
			currency: '@'
		},
		templateUrl: 'modules/expenses/directives/expenses-top-spending-categories.html',
		link: function(scope) {
			
			expensesService.getTopSpendingCategories(4, scope.currency).success(function(data) {
				
				scope.topSpendingCategories = data;
				scope.topSpendingCategories.totalPercentage = 0; 
				
				for (var i=0; i<scope.topSpendingCategories.rows.length; i++) {
					
					if (i == 0) scope.topSpendingCategories.rows[i].color = '#0097A7';
					else if (i == 1) scope.topSpendingCategories.rows[i].color = '#00BCD4';
					else if (i == 2) scope.topSpendingCategories.rows[i].color = '#4DD0E1';
					else if (i == 3) scope.topSpendingCategories.rows[i].color = '#B2EBF2';
					
					scope.topSpendingCategories.totalPercentage += scope.topSpendingCategories.rows[i].percentage;
				}
			});

		}
	}
}]);

/**
 * EXPENSES LIST DIRECTIVE
 * 
 * Shows the list of expenses 
 * 
 * Parameters: 
 * 
 * 	-	currency		:	(optional)
 * 							EUR, DKK, ...
 * 
 * 	-	maxResults		:	(optional)
 * 							the maximum number of transactions
 * 
 * 	-	showNavigator	:	(optional, default = false)
 * 							Shows the month navigator
 * 
 */
expensesModule.directive('expensesList', ['expensesService', '$timeout', '$mdDialog', function(expensesService, $timeout, $mdDialog) {
	
	return {
		scope: {
			currency: '@',
			maxResults: '@',
			showNavigator: '@'
		},
		templateUrl: 'modules/expenses/directives/expenses-list.html',
		link: function(scope) {
			
			if (scope.showNavigator == null) scope.showNavigator = false;
			
			scope.selectedPeriod = {};
			scope.selectedPeriod.yearMonth = expensesService.getCurrentMonth();
			scope.selectedPeriod.year = moment(expensesService.getCurrentMonth() + '01', 'YYYYMMDD').format('YYYY');
			scope.selectedPeriod.month = moment(expensesService.getCurrentMonth() + '01', 'YYYYMMDD').format('MMMM');
			
			/**
			 * Retrieve a single category
			 */
			scope.getCategory = function(code) {
				
				if (scope.categories == null) return {};
				
				for (var i = 0; i < scope.categories.length; i++) {
					if (scope.categories[i].code == code) return scope.categories[i];
				}
			}

			/**
			 * Loads previous month's expenses
			 */
			scope.loadPreviousMonth = function() {
				scope.selectedPeriod.yearMonth = moment(scope.selectedPeriod.yearMonth + '01', 'YYYYMMDD').subtract(1, 'months').format('YYYYMM');
				scope.selectedPeriod.year = moment(scope.selectedPeriod.yearMonth + '01', 'YYYYMMDD').format('YYYY');
				scope.selectedPeriod.month = moment(scope.selectedPeriod.yearMonth + '01', 'YYYYMMDD').format('MMMM');
				scope.loadExpenses(scope.selectedPeriod.yearMonth);
			}
			
			/**
			 * Loads next month's expenses
			 */
			scope.loadNextMonth = function() {
				scope.selectedPeriod.yearMonth = moment(scope.selectedPeriod.yearMonth + '01', 'YYYYMMDD').add(1, 'months').format('YYYYMM');
				scope.selectedPeriod.year = moment(scope.selectedPeriod.yearMonth + '01', 'YYYYMMDD').format('YYYY');
				scope.selectedPeriod.month = moment(scope.selectedPeriod.yearMonth + '01', 'YYYYMMDD').format('MMMM');
				scope.loadExpenses(scope.selectedPeriod.yearMonth);
			}
			
			/**
			 * Changes the category of the transaction
			 */
			scope.changeCategory = function(expense, ev) {
				
				var categories = scope.categories;
				
				function DialogController(scope, $mdDialog) {
					
					scope.microservicesHost = microservicesHost;
					scope.microservicesPort = microservicesPort;
					scope.categories = categories;
					
					scope.hide = function() {$mdDialog.hide;};
					scope.cancel = function() {$mdDialog.cancel();};
					scope.answer = function(expense) {$mdDialog.hide(expense);};
					
				}
				
			    var useFullScreen = window.matchMedia( "(max-width: 960px)" ).matches;
			    var dialog = {controller: DialogController, templateUrl: 'modules/expenses/dlgChangeCategory.html', parent: angular.element(document.body), targetEvent: ev, clickOutsideToClose: true, fullscreen: useFullScreen};
			    
			    $mdDialog.show(dialog).then(function(answer) {
			    	
			    	expensesService.setExpenseCategory(expense.id, answer.code);

			    	var cat = scope.getCategory(answer.code);
			    	expense.category = answer;
			    	
			    }, function() {});
			}
			
			/**
			 * Sets the expense as consolidated
			 */
			scope.consolidateExpense = function(expense) {
				
				expensesService.setExpenseConsolidated(expense.id);
				
				expense.consolidated = true;
				expense.showMenu = false;
			}
			
			/**
			 * Deletes the specified expense
			 */
			scope.deleteExpense = function(expense) {
				
		    	expensesService.deleteExpense(expense.id);

				for (i=0; i<scope.expenses.length; i++) {
					if (scope.expenses[i].id == expense.id) {
						scope.expenses.splice(i, 1);
						return;
					}
				}
			}
			
			/**
			 * Clea all delete icons making them invisible
			 */
			scope.clearAllDeleteIcons = function() {
				
				if (scope.expenses == null) return;
				
				var i;
				for (i=0; i < scope.expenses.length; i++) {
					scope.expenses[i].deletable = false;
				}
			}
			
			/**
			 * Show the delete icon for a specific Expense
			 */
			scope.showDeleteIcon = function(expense) {
				
				scope.clearAllDeleteIcons();
				
				expense.deletable = true;
			}
			
			/**
			 * Loads the expenses for the specified month
			 */
			scope.loadExpenses = function(yearMonth) {
				
				expensesService.getExpenses({maxResults: scope.maxResults, yearMonth: yearMonth, currency: scope.currency}).success(function(data) {
					
					scope.expenses = data.expenses;
					
					if (scope.expenses != null) {
						
						var i;
						for (i = 0; i < scope.expenses.length; i++) {
							scope.expenses[i].category = scope.getCategory(scope.expenses[i].category);
						}
					}
				});
			}
				
			expensesService.getCategories().success(function(data) {
				
				scope.categories = data.categories;
				
				scope.loadExpenses(expensesService.getCurrentMonth());
				
			});
			

		}
	}
}]);












