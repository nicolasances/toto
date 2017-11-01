/*
 * This JS module provide services to manage expenses
 */
var expensesServiceModule = angular.module('expensesServiceModule', []);

expensesServiceModule.factory('expensesService', [ '$http', '$mdDialog', function($http, $mdDialog) {
	
	// Categories cache
	var expenseCategories;

	// Initialize service
	var expensesService = {
		
		/** 
		 * Adds a quick expense. 
		 * A quick expense is
		 *  - a prospect 
		 *  - an payment made TODAY
		 * It takes as input
		 *  - insertionCallback: a callback function(expense) that will receive the created expense (without ID)
		 *  - creationCallback: a function(promise) that will receive the promise of the http call to create the expense (returning data.id)
		 *  - yearMonth: the reference year and month
		 */
		addQuickPayment : function(ev, insertionCallback, creationCallback, yearMonth) {

			var categories;
			getCategories = function(callback) {
			
				$http.get("https://" + microservicesUrl + "/expenses/categories").success(function(data, status, header, config) {
					categories = data.categories;
					callback();
				});
			}
			
			function DialogController($scope, $mdDialog) {
				
				$scope.categories = categories;
				$scope.steps = [1, 2];
				$scope.currentStep = 1;
				$scope.expense = new Object();
				
				$scope.hide = function() {$mdDialog.hide;};
				$scope.cancel = function() {$mdDialog.cancel();};
				$scope.answer = function(expense) {$mdDialog.hide(expense);};
				$scope.clearCategoriesSelection = function() {for (i=0;i<$scope.categories.length; i++) $scope.categories[i].selected = false;}
				$scope.selectCategory = function(category) {
					$scope.clearCategoriesSelection();
					category.selected = true;
					$scope.expense.category = category;
					
					$scope.answer($scope.expense);
				}
				$scope.nextStep = function () {$scope.currentStep++;}
				
				$scope.clearCategoriesSelection();
				
			}
			
			getCategories(function() {
				
				var useFullScreen = window.matchMedia( "(max-width: 960px)" ).matches;
				var dialog = {controller: DialogController, templateUrl: 'modules/expenses/dlgAddQuickExpense.html', parent: angular.element(document.body), targetEvent: ev, clickOutsideToClose: true, fullscreen: useFullScreen};
				
				$mdDialog.show(dialog).then(function(answer) {
					
					var expense = new Object();
					expense.amount = answer.amount;
					expense.date = new Date();
					expense.category = answer.category;
					expense.description = answer.description;
					expense.yearMonth = yearMonth;
					expense.consolidated = false;
					
					var data = {
							amount : answer.amount,
							date : moment(expense.date).format('YYYYMMDD'), 
							category : answer.category.code,
							description : answer.description,
							yearMonth: expense.yearMonth,
							consolidated: false
					};
					
					insertionCallback(expense);
					
					var promise = $http.post("https://" + microservicesUrl + "/expenses/expenses", data);
					creationCallback(promise);
					
					
				}, function() {});
			});
			
		},
		
		/**
		 * Adds a credit card payment.
		 * It takes as input: 
		 *  - insertionCallback: a callback function(expense) that will receive the created expense (without ID)
		 *  - creationCallback: a function(promise) that will receive the promise of the http call to create the expense (returning data.id)
		 *  - creditCardId: the identifier of the credit card on which this payment is debted
		 */
		addCreditCardExpense : function(ev, creditCardId, insertionCallback, creationCallback) {

			var categories;
			getCategories = function(callback) {
			
				$http.get("https://" + microservicesUrl + "/expenses/categories").success(function(data, status, header, config) {
					categories = data.categories;
					callback();
				});
			}
			
			function DialogController($scope, $mdDialog) {
				
				$scope.categories = categories;
				$scope.steps = [1, 2];
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
			
			getCategories(function() {
				
				var useFullScreen = window.matchMedia( "(max-width: 960px)" ).matches;
				var dialog = {controller: DialogController, templateUrl: 'modules/expenses/dlgAddCreditCardExpense.html', parent: angular.element(document.body), targetEvent: ev, clickOutsideToClose: true, fullscreen: useFullScreen};
				
				$mdDialog.show(dialog).then(function(answer) {
					
					var expense = new Object();
					expense.amount = answer.amount;
					expense.date = answer.date;
					expense.category = answer.category;
					expense.description = answer.description;
					expense.yearMonth = moment('01/' + moment(answer.date).format('MM/YYYY'), 'DD/MM/YYYY').add(2, 'months').format('YYYYMM');
					expense.consolidated = false;
					expense.cardId = creditCardId;
					expense.cardMonth = moment(answer.date).format('MM');
					
					var data = {
							amount : answer.amount,
							date : moment(answer.date).format('YYYYMMDD'), 
							category : answer.category.code,
							description : answer.description,
							yearMonth: expense.yearMonth,
							consolidated: false,
							cardId: creditCardId,
							cardMonth: moment(answer.date).format('MM')
					};
					
					insertionCallback(expense);
					
					var promise = $http.post("https://" + microservicesUrl + "/expenses/expenses", data);
					creationCallback(promise);
					
					
				}, function() {});
			});
			
		},
		
		/**
		 * Retrieves the categories of payments. 
		 * 
		 * Returns a promise. Success will return a data object data: {categories: []} 
		 */
		getCategories : function() {
		
			return $http.get("https://" + microservicesUrl + "/expenses/categories");
		},
			
		/**
		 * Retrieves the expenses. 
		 * It is possible to pass a serie of parameters in input as a JSON object: 
		 * {	yearMonth: 'yyyyMM',
		 * 		subscriptionId: 'retrieves the list of expenses linked to that subscription'
		 * }
		 */
		getExpenses : function(filter) {
			
			if (filter == null) return $http.get("https://" + microservicesUrl + "/expenses/expenses?yearMonth=" + getCurrentPeriod());
			
			var params = '';

			if (filter.yearMonth != null) {if (params != '') params += '&'; params += 'yearMonth=' + filter.yearMonth}
			if (filter.subscriptionId != null) {if (params != '') params += '&'; params += 'subscriptionId=' + filter.subscriptionId}
			
			
			return $http.get("https://" + microservicesUrl + "/expenses/expenses?" + params);

		},
		
		/**
		 * Updates the provided expenses (array[]) with the categories details
		 */
		updateExpensesWithCategoryInfo : function(expenses) {
			
			var getCategory = function(categoryCode) {
				var i;
				for (i = 0; i < expenseCategories.length; i++) {
					if (expenseCategories[i].code == categoryCode) return expenseCategories[i];
				}
				
				return null;
			};
			
			if (expenses != null) {
				
				var i;
				for (i = 0; i < expenses.length; i++) {
					expenses[i].category = getCategory(expenses[i].category);
				}
			}
		},

		/**
		 * Opens a dialog to choose an expense.
		 * Returns a promise on which to call .then() method. 
		 * The .then() method requires a function (success) that will receive the selected expense: function(expense)
		 * 
		 * Requires an $event in input
		 */
		pickExpense: function(ev) {
			
			var useFullScreen = window.matchMedia( "(max-width: 960px)" ).matches;
		    var dialog = {controller: expensesService.DialogController, templateUrl: 'modules/expenses/dlgLinkExpense.html', parent: angular.element(document.body), targetEvent: ev, clickOutsideToClose: true, fullscreen: useFullScreen};
		    
		    return $mdDialog.show(dialog);
		},

		/**
		 * Retrieves the current period in an yearMonth string
		 */
		getCurrentPeriod : function() {
			
			var dayOfMonth = parseInt(moment().format('DD'));
			
			if (dayOfMonth > 27) return moment().add(1, 'months').format('YYYYMM');
			
			return moment().format('YYYYMM');
			
		},
		
		/**
		 * Loads previous month's expenses
		 */
		loadPreviousMonth : function(selectedPeriod) {
			$scope.selectedPeriod.yearMonth = moment($scope.selectedPeriod.yearMonth + '01', 'YYYYMMDD').subtract(1, 'months').format('YYYYMM');
			$scope.selectedPeriod.year = moment($scope.selectedPeriod.yearMonth + '01', 'YYYYMMDD').format('YYYY');
			$scope.selectedPeriod.month = moment($scope.selectedPeriod.yearMonth + '01', 'YYYYMMDD').format('MMMM');
			$scope.loadExpenses($scope.selectedPeriod.yearMonth);
		},
		
		/**
		 * Loads next month's expenses
		 */
		loadNextMonth : function() {
			$scope.selectedPeriod.yearMonth = moment($scope.selectedPeriod.yearMonth + '01', 'YYYYMMDD').add(1, 'months').format('YYYYMM');
			$scope.selectedPeriod.year = moment($scope.selectedPeriod.yearMonth + '01', 'YYYYMMDD').format('YYYY');
			$scope.selectedPeriod.month = moment($scope.selectedPeriod.yearMonth + '01', 'YYYYMMDD').format('MMMM');
			$scope.loadExpenses($scope.selectedPeriod.yearMonth);
		},
		
		DialogController: function ($scope, $mdDialog) {

			$scope.microservicesHost = microservicesHost;
			$scope.microservicesPort = microservicesPort;
			
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
			
			$scope.getCategory = function(code) {
				
				if ($scope.categories == null) return {};
				
				var i;
				for (i = 0; i < $scope.categories.length; i++) {
					if ($scope.categories[i].code == code) return $scope.categories[i];
				}
				
				return {};
			}
			
			/**
			 * Load the expenses of the specified month (in format YYYYMM)
			 */
			$scope.loadExpenses = function (yearMonth) {
				
				$http.get("https://" + microservicesUrl + "/expenses/categories").success(function(data, status, header, config) {
					
					$scope.categories = data.categories;
					
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
					});
				});
			}
			
			$scope.loadExpenses($scope.selectedPeriod.yearMonth);
			
		},

	};
	
	// If user is authorized to access the Expenses App then load the categories
	for (var i = 0; i < totoAppList.length; i++) {
		
		if (totoAppList[i].id == 'expenses') {
			
			if (totoAppList[i].authorized) {

				// Load categories and put them in cache
				expensesService.getCategories().success(function (data) {
					expenseCategories = data.categories;
				});
			}
			
			break;
		}
	}
	
	return expensesService;

} ]);
