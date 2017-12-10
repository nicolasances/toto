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
expensesModule.controller("expensesController", [ '$rootScope', '$scope', '$http', '$timeout', '$mdDialog', '$mdSidenav', function($rootScope, $scope, $http, $timeout, $mdDialog, $mdSidenav) {

	/**
	 * Prepares the context object
	 */
	$scope.initContext = function() {
		
		$rootScope.currentMenu = 'Month payments';

		$scope.microservicesHost = microservicesHost;
		$scope.microservicesPort = microservicesPort;
		
		$scope.selectedPeriod = new Object();
		$scope.currentFilter = new Object();
		
		$scope.refresh();
		
	}

	/**
	 * Refreshes the view
	 */
	$scope.refresh = function() {
		
		$scope.getCategories();
		
		$scope.selectedPeriod.yearMonth = $scope.getCurrentPeriod();
		$scope.selectedPeriod.year = moment($scope.getCurrentPeriod() + '01', 'YYYYMMDD').format('YYYY');
		$scope.selectedPeriod.month = moment($scope.getCurrentPeriod() + '01', 'YYYYMMDD').format('MMMM');
		
		$scope.loadExpenses($scope.selectedPeriod.yearMonth);
		
		$scope.currentFilter.categoryCode = null;
	}
	
	$scope.getCategories = function() {
	
		$http.get("https://" + microservicesUrl + "/expenses/categories").success(function(data, status, header, config) {
			$scope.categories = data.categories;
		});
	}
	
	$scope.getCategory = function(code) {
		
		if ($scope.categories == null) return {};
		
		var i;
		for (i = 0; i < $scope.categories.length; i++) {
			if ($scope.categories[i].code == code) return $scope.categories[i];
		}
		
		return {};
	}
	
	/**
	 * Retrieves the current period in an yearMonth string
	 */
	$scope.getCurrentPeriod = function() {
		
		var dayOfMonth = parseInt(moment().format('DD'));
		
		if (dayOfMonth > 27) return moment().add(1, 'months').format('YYYYMM');
		
		return moment().format('YYYYMM');
		
	}
	
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
	
	$scope.clearFilters = function() {
		for (i=0; i<$scope.expenses.length; i++) {
			$scope.expenses[i].hide = false;
		}
	}
	
	/**
	 * Filter the expenses by category
	 */
	$scope.filterByCategory = function(categoryCode) {
		
		$scope.clearFilters();
		
		$scope.currentFilter.categoryCode = $scope.currentFilter.categoryCode == null ? categoryCode : null;
		
		if ($scope.currentFilter.categoryCode == null) {
			$scope.calculateTotal();
			return;
		}
		
		for (i=0; i<$scope.expenses.length; i++) {
			if ($scope.expenses[i].category != categoryCode) {
				$scope.expenses[i].hide = true;
			}
		}
		
		$scope.calculateTotal();
	}
	
	/**
	 * Load the expenses of the specified month (in format YYYYMM)
	 */
	$scope.loadExpenses = function (yearMonth) {
		
		$http.get("https://" + microservicesUrl + "/expenses/expenses?yearMonth=" + yearMonth).success(function(data, status, header, config) {
			
			$scope.expenses = new Array();
			
			if (data != null && data.expenses != null) {
				
				var i;
				for (i = 0; i < data.expenses.length; i++) {
					var exp = data.expenses[i];
					exp.category = $scope.getCategory(exp.category);
					
					$scope.expenses.push(exp);
				}
			}

			$scope.calculateTotal();
		});
	}
	
	/**
	 * Calculates the total amount of the expenses, considering filters and excluding Credits
	 */
	$scope.calculateTotal = function() {
		$scope.total = 0;
		
		if ($scope.expenses == null) return;
		
		for (i=0;i<$scope.expenses.length;i++) {
			if ($scope.currentFilter.categoryCode == null || $scope.expenses[i].category == $scope.currentFilter.categoryCode) {
				if (!$scope.expenses[i].creditMom && !$scope.expenses[i].creditOther) {
					$scope.total += parseFloat($scope.expenses[i].amount);
				}
			}
		}
		
	}
	
	$scope.changeCategory = function(expense, ev) {
		
		var categories = $scope.categories;
		
		function DialogController($scope, $mdDialog) {
			
			$scope.microservicesHost = microservicesHost;
			$scope.microservicesPort = microservicesPort;
			$scope.categories = categories;
			
			$scope.hide = function() {$mdDialog.hide;};
			$scope.cancel = function() {$mdDialog.cancel();};
			$scope.answer = function(expense) {$mdDialog.hide(expense);};
			
		}
		
	    var useFullScreen = window.matchMedia( "(max-width: 960px)" ).matches;
	    var dialog = {controller: DialogController, templateUrl: 'modules/expenses/dlgChangeCategory.html', parent: angular.element(document.body), targetEvent: ev, clickOutsideToClose: true, fullscreen: useFullScreen};
	    
	    $mdDialog.show(dialog).then(function(answer) {

	    	$http.put("https://" + microservicesUrl + "/expenses/expenses/" + expense.id, {category: answer.code}).success(function(data, status, header, config) {});

	    	var cat = $scope.getCategory(answer.code);
	    	expense.category = answer;
	    	
	    }, function() {});
	}

	/**
	 * Add a new expense
	 */
	$scope.addExpense = function(ev) {
		
		var categories = $scope.categories;
		var yearMonth = $scope.selectedPeriod.yearMonth;
		
		function DialogController($scope, $mdDialog) {

			$scope.microservicesHost = microservicesHost;
			$scope.microservicesPort = microservicesPort;
			$scope.categories = categories;
			$scope.steps = [1, 2, 3];
			$scope.currentStep = 1;
			$scope.expense = new Object();
			
			$scope.hide = function() {$mdDialog.hide;};
			$scope.cancel = function() {$mdDialog.cancel();};
			$scope.answer = function(expense) {$mdDialog.hide(expense);};
			$scope.clearCategoriesSelection = function() {for (i=0;i<$scope.categories.length; i++) $scope.categories[i].selected = false;}
			$scope.setConsolidated = function(consolidated) {
				$scope.expense.consolidated = consolidated;
				$scope.nextStep();
			} 
			$scope.selectCategory = function(category) {
				$scope.clearCategoriesSelection();
				category.selected = true;
				$scope.expense.category = category;
				
				$scope.answer($scope.expense);
			}
			$scope.nextStep = function () {$scope.currentStep++;}
			
			$scope.clearCategoriesSelection();
			
		}
		
	    var useFullScreen = window.matchMedia( "(max-width: 960px)" ).matches;
	    var dialog = {controller: DialogController, templateUrl: 'modules/expenses/dlgAddExpense.html', parent: angular.element(document.body), targetEvent: ev, clickOutsideToClose: true, fullscreen: useFullScreen};
	    
	    $mdDialog.show(dialog).then(function(answer) {

	    	$scope.expense = new Object();
	    	$scope.expense.amount = answer.amount;
	    	$scope.expense.date = answer.date;
	    	$scope.expense.category = answer.category;
	    	$scope.expense.description = answer.description;
	    	$scope.expense.creditMom = answer.creditMom;
	    	$scope.expense.creditOther = answer.creditOther;
	    	$scope.expense.yearMonth = yearMonth;
	    	$scope.expense.consolidated = answer.consolidated;
	    	
	    	var data = {
	    			amount : answer.amount,
	    			date : moment(answer.date).format('YYYYMMDD'), 
	    			category : answer.category.code,
	    			description : answer.description,
	    			creditMom : answer.creditMom,
	    			creditOther : answer.creditOther,
	    			yearMonth: yearMonth,
	    			consolidated: answer.consolidated
	    	};
	    	
	    	$http.post("https://" + microservicesUrl + "/expenses/expenses", data).success(function(data, status, header, config) {
	    		$scope.expense.id = data.id;
			});
	    	
	    	$scope.expenses.push($scope.expense);
	    	$scope.calculateTotal();
	    	
	    }, function() {});
	}
	
	$scope.consolidateExpense = function(expense) {
		
		$http.put("https://" + microservicesUrl + "/expenses/expenses/" + expense.id, {consolidated: true}).success(function(data, status, header, config) {});
		
		expense.consolidated = true;
		expense.showMenu = false;
	}
	
	/**
	 * Deletes the specified expense
	 */
	$scope.deleteExpense = function(expense) {
		
    	$http.delete("https://" + microservicesUrl + "/expenses/expenses/" + expense.id).success(function(data, status, header, config) {
		});

		for (i=0; i<$scope.expenses.length; i++) {
			if ($scope.expenses[i].id == expense.id) {
				$scope.expenses.splice(i, 1);
				return;
			}
		}
	}
	
	/**
	 * Clea all delete icons making them invisible
	 */
	$scope.clearAllDeleteIcons = function() {
		
		if ($scope.expenses == null) return;
		
		var i;
		for (i=0; i < $scope.expenses.length; i++) {
			$scope.expenses[i].deletable = false;
		}
	}
	
	/**
	 * Show the delete icon for a specific Expense
	 */
	$scope.showDeleteIcon = function(expense) {
		
		$scope.clearAllDeleteIcons();
		
		expense.deletable = true;
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

expensesModule.directive('expensesList', ['expensesService', '$timeout', function(expensesService, $timeout) {
	
	return {
		scope: {
			currency: '@'
		},
		templateUrl: 'modules/expenses/directives/expenses-list.html',
		link: function(scope) {
			
			/**
			 * Retrieve a single category
			 */
			scope.getCategory = function(code) {
				
				if (scope.categories == null) return {};
				
				for (var i = 0; i < scope.categories.length; i++) {
					if (scope.categories[i].code == code) return scope.categories[i];
				}
			}
				
			expensesService.getCategories().success(function(data) {
				
				scope.categories = data.categories;
				
				expensesService.getExpenses({maxResults: 3}).success(function(data) {
					
					scope.expenses = data.expenses;
					
					if (scope.expenses != null) {
						
						var i;
						for (i = 0; i < scope.expenses.length; i++) {
							scope.expenses[i].category = scope.getCategory(scope.expenses[i].category);
						}
					}
				});
			});
			

		}
	}
}]);












