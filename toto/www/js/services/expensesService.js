/*
 * This JS module provide services to manage expenses
 */
var expensesServiceModule = angular.module('expensesServiceModule', []);

expensesServiceModule.factory('expensesService', [ '$http', '$mdDialog', function($http, $mdDialog) {
	
	return {

		/**
		 * Retrieves the current year month and returns it. 
		 * 
		 * Returns: 
		 * 	-	yearMonth: the year month as a 'yyyyMM' string
		 */
		getCurrentMonth : function() {
			
			var dayOfMonth = parseInt(moment().format('DD'));
			
			if (dayOfMonth > 27) return moment().add(1, 'months').format('YYYYMM');
			
			return moment().format('YYYYMM');
		},
			
		/**
		 * Retrieves the expenses. 
		 * 
		 * It is possible to pass a serie of parameters in input as a JSON object:
		 *  
		 * {	
		 * 		yearMonth: 'yyyyMM',
		 * 		currency: string (optional, default value : EUR)
		 * 		subscriptionId: 'retrieves the list of expenses linked to that subscription'
		 * 		maxResults: the max number of results to get
		 * }
		 */
		getExpenses : function(filter) {
			
			if (filter == null) return $http.get(microservicesProtocol + "://" + microservicesUrl + "/expenses/expenses?yearMonth=" + this.getCurrentMonth());
			
			var params = '';

			if (filter.currency != null) {if (params != '') params += '&'; params += 'currency=' + filter.currency}
			if (filter.maxResults != null) {if (params != '') params += '&'; params += 'maxResults=' + filter.maxResults}
			if (filter.yearMonth != null) {if (params != '') params += '&'; params += 'yearMonth=' + filter.yearMonth}
			if (filter.subscriptionId != null) {if (params != '') params += '&'; params += 'subscriptionId=' + filter.subscriptionId}
			
			
			return $http.get(microservicesProtocol + "://" + microservicesUrl + "/expenses/expenses?" + params);

		},
		
		/**
		 * Retrieves the month total
		 * 
		 * Requires: 
		 * 	
		 * -	currency : EUR, DKK, ..
		 *  
		 *  -	yearMonth : a YYYYMM string representing the month
		 *  
		 */
		getMonthTotal : function(currency, yearMonth) {
			
			return $http.get(microservicesProtocol + "://" + microservicesUrl + "/expenses/expenses/" + yearMonth + "/total?currency=" + currency);
		},
	
		/**
		 * Retrieves the categories of payments. 
		 * 
		 * Returns a promise. Success will return a data object data: {categories: []} 
		 */
		getCategories : function() {
		
			return $http.get(microservicesProtocol + "://" + microservicesUrl + "/expenses/categories");
		},
		
		/**
		 * Retrieves the top spending categories
		 * 
		 * Requires: 
		 * 
		 * 	-	maxResults	: the max number of top spending categories to retrieve
		 * 
		 * 	-	currency	: the currency to use (EUR, DKK)
		 */
		getTopSpendingCategories : function(maxResults, currency) {
			
			return $http.get(microservicesProtocol + "://" + microservicesUrl + "/expenses/reports/averageByCategory?currency=" + currency + "&maxResults=" + maxResults);
		},
		
		/**
		 * Sets the category of the specified expense
		 */
		setExpenseCategory : function(expenseId, categoryCode) {
			
			return $http.put(microservicesProtocol + "://" + microservicesUrl + "/expenses/expenses/" + expenseId, {category: categoryCode});
		},
		
		/**
		 * Sets the expense as consolidated
		 */
		setExpenseConsolidated : function(expenseId) {
			
			return $http.put(microservicesProtocol + "://" + microservicesUrl + "/expenses/expenses/" + expenseId, {consolidated: true});
		},
		
		/**
		 * Deletes the specified expense
		 */
		deleteExpense : function(expenseId) {
			
			return $http.delete(microservicesProtocol + "://" + microservicesUrl + "/expenses/expenses/" + expenseId);
		},

		/**
		 * Adds a new Payment
		 * 
		 * Requires: 
		 * 
		 * 	-	creationCallback	:	function to be called when the expense is created (but not yet inserted in the backend)
		 * 
		 * 	-	insertionCallback	:	function to be called when the expense has been successfully inserted in the backend store
		 * 
		 *  -	yearMonth			:	the yearMonth to be used
		 */
		addPayment : function(creationCallback, insertionCallback, yearMonth) {
			
			function DialogController($scope, $mdDialog, expensesService) {
				
				expensesService.getCategories().success(function(data) {
					$scope.categories = data.categories;
					$scope.clearCategoriesSelection();
				})
				
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
				
			}
			
		    var useFullScreen = window.matchMedia( "(max-width: 960px)" ).matches;
		    var dialog = {controller: DialogController, templateUrl: 'modules/expenses/dlgAddExpense.html', parent: angular.element(document.body), clickOutsideToClose: true, fullscreen: useFullScreen};
		    
		    $mdDialog.show(dialog).then(function(answer) {

		    	var data = {
		    			amount : answer.amount,
		    			date : moment(answer.date).format('YYYYMMDD'), 
		    			category : answer.category.code,
		    			description : answer.description,
		    			yearMonth: yearMonth,
		    			consolidated: answer.consolidated,
		    			currency: answer.currency
		    	};
		    	
		    	var expense = new Object();
		    	expense.amount = answer.amount;
		    	expense.date = answer.date;
		    	expense.category = answer.category;
		    	expense.description = answer.description;
		    	expense.yearMonth = yearMonth;
		    	expense.consolidated = answer.consolidated;
		    	expense.currency = answer.currency;
		    	
		    	creationCallback(expense)
		    	
		    	$http.post(microservicesProtocol + "://" + microservicesUrl + "/expenses/expenses", data).success(function(data, status, header, config) {
		    		
		    		insertionCallback(data.id);
		    		
				});
		    	
		    }, function() {});
		
		},
		
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
			
				$http.get(microservicesProtocol + "://" + microservicesUrl + "/expenses/categories").success(function(data, status, header, config) {
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
					expense.currency = answer.currency;
					
					var data = {
							amount : answer.amount,
							date : moment(expense.date).format('YYYYMMDD'), 
							category : answer.category.code,
							description : answer.description,
							yearMonth: expense.yearMonth,
							consolidated: false,
							currency : answer.currency
					};
					
					insertionCallback(expense);
					
					var promise = $http.post(microservicesProtocol + "://" + microservicesUrl + "/expenses/expenses", data);
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
			
				$http.get( microservicesProtocol + "://" + microservicesUrl + "/expenses/categories").success(function(data, status, header, config) {
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
					expense.currency = answer.currency;
					
					var data = {
							amount : answer.amount,
							date : moment(answer.date).format('YYYYMMDD'), 
							category : answer.category.code,
							description : answer.description,
							yearMonth: expense.yearMonth,
							consolidated: false,
							cardId: creditCardId,
							cardMonth: moment(answer.date).format('MM'),
							currency: answer.currency
					};
					
					insertionCallback(expense);
					
					var promise = $http.post(microservicesProtocol + "://" + microservicesUrl + "/expenses/expenses", data);
					creationCallback(promise);
					
					
				}, function() {});
			});
			
		}
			
	}
	
} ]);
