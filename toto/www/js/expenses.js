var expensesModule = angular.module("expensesModule", []);

expensesModule.controller("expensesDashboardController", [ '$rootScope', '$scope', '$http', '$timeout', '$mdDialog', '$mdSidenav', '$mdMedia', '$interval', 'expensesService', function($rootScope, $scope, $http, $timeout, $mdDialog, $mdSidenav, $mdMedia, $interval, expensesService) {
	
	var categoryWidgetOriginalTop;
	var categoryReportItemOriginalTop;
	
	$scope.initContext = function() {
		
		$scope.gtsm = $mdMedia('gt-sm');
		$rootScope.currentMenu = 'Payments dashboard';
		
		$scope.selectedPeriod = new Object();
		$scope.selectedPeriod.yearMonth = $scope.getCurrentPeriod();
		$scope.selectedPeriod.year = moment($scope.getCurrentPeriod() + '01', 'YYYYMMDD').format('YYYY');
		$scope.selectedPeriod.month = moment($scope.getCurrentPeriod() + '01', 'YYYYMMDD').format('MMMM');
		$scope.currentMonth = $scope.getCurrentMonth();
		$scope.categoriesWidgetDetailVisible = false;
		
		$scope.getCategories();
		$scope.loadExpenses($scope.selectedPeriod.yearMonth);
		$scope.getExpensesTotal();
		$scope.getAverageByCategoryReport();
		
	}
	
	$scope.toggleCategoriesWidgetDetail = function() {
		
		var categoryWidget = document.querySelector('.categories-widget');
		var originalTop = categoryWidget.offsetTop;
		var originalLeft = categoryWidget.offsetLeft;
		var originalWidth = categoryWidget.offsetWidth;
		
		$scope.categoriesWidgetDetailVisible = !$scope.categoriesWidgetDetailVisible;
		
		if ($scope.categoriesWidgetDetailVisible) {
			
			categoryWidgetOriginalTop = originalTop - 15;
			
			document.getElementById('totals-row').classList.add('hidden');
			document.getElementById('expenses').classList.add('hidden');

			$timeout(function () {
				categoryWidget.style.position = 'absolute';
				categoryWidget.style.left = originalLeft + 'px';
				categoryWidget.style.width = originalWidth - 24 + 'px';
				categoryWidget.style.top = originalTop - 15 + 'px';
				
				var timer = $interval(function() {
					
					var newTop = categoryWidget.offsetTop - 15 - 5;
					
					if (newTop <= 0) {
						newTop = 0;
						$interval.cancel(timer);
						
						categoryWidget.style.position = 'initial';
						
						document.querySelector('.categories-report-detail').style.display = 'block';
						
						$scope.getCompleteTopSpendingReport(function(report) {
							if (report.rows != null) {
								var i;
								for (i = 0; i < report.rows.length; i++) {
									$timeout(function () {
										var i;
										for (i = 0; i < $scope.completeTopSpendingReport.rows.length; i++) {
											if ($scope.completeTopSpendingReport.rows[i].visible == null || !$scope.completeTopSpendingReport.rows[i].visible) {
												var item = document.querySelector('#categories-report-detail-' + $scope.completeTopSpendingReport.rows[i].categoryCode);
												$scope.completeTopSpendingReport.rows[i].visible = true;
												item.classList.add('visible');
												break;
											}
										}
									}, (50 * i));
								}
							}
						});
					}
					
					categoryWidget.style.top = newTop + 'px';
					
				}, 5);
			}, 400);
			
			$timeout(function() {document.getElementById('totals-row').style.display = 'none';}, 400);
			$timeout(function() {document.getElementById('expenses').style.display = 'none';}, 400);
		}
		else {
			// 1. Hide detail report rows
			var i;
			for (i = 0; i < $scope.completeTopSpendingReport.rows.length; i++) {
				var item = document.querySelector('#categories-report-detail-' + $scope.completeTopSpendingReport.rows[i].categoryCode);
				item.classList.remove('visible');
			}
			
			var expensesDiv = document.querySelector('#expenses-of-category');
			expensesDiv.style.display = 'none';
			
			// 2. Hide detail report
			document.querySelector('.categories-report-detail').style.display = 'none';
			
			// 3. Reposition report widget
			categoryWidget.style.position = 'absolute';
			
			var timer = $interval(function() {
				
				var newTop = categoryWidget.offsetTop + 5;
				
				if (newTop >= categoryWidgetOriginalTop) {
					newTop = categoryWidgetOriginalTop;
					$interval.cancel(timer);
					
					$timeout(function() {
						document.getElementById('totals-row').style.display = 'flex';
						categoryWidget.style.position = 'initial';
						document.getElementById('expenses').style.display = 'block';
						document.getElementById('totals-row').classList.remove('hidden');
						document.getElementById('expenses').classList.remove('hidden');
					}, 100);
					
				}
				
				categoryWidget.style.top = newTop + 'px';
				
			}, 20);
		}
		
		
	}
	
	/**
	 * This function toggles the detail of a report item: 
	 * that is the list of payments that has made that item
	 */
	$scope.toggleDetailReportItem = function(item) {
		
		if (item.selected == null || !item.selected) {
			
			item.selected = true;
			
			// 1. Hide all other items
			var i;
			for (i = 0; i < $scope.completeTopSpendingReport.rows.length; i++) {
				if ($scope.completeTopSpendingReport.rows[i].categoryCode != item.categoryCode) {
					var el = document.querySelector('#categories-report-detail-' + $scope.completeTopSpendingReport.rows[i].categoryCode);
					el.classList.remove('visible');
				}
			}
			
			$timeout(function() {
				var i;
				for (i = 0; i < $scope.completeTopSpendingReport.rows.length; i++) {
					if ($scope.completeTopSpendingReport.rows[i].categoryCode != item.categoryCode) {
						var el = document.querySelector('#categories-report-detail-' + $scope.completeTopSpendingReport.rows[i].categoryCode);
						el.style.display = 'none';
					}
				}
			}, 500);
			
			// 2. Move element to top
			var el = document.querySelector('#categories-report-detail-' + item.categoryCode);

			el.style.top = el.offsetTop - 4 + 'px';
			el.style.left = el.offsetLeft - 4 + 'px';
			el.style.width = el.offsetWidth + 'px';
			el.style.position = 'absolute';
			
			$scope.categoryReportItemOriginalTop = el.offsetTop;
			
			$timeout(function() {
				var timer = $interval(function () {
					var categoriesWidget = document.querySelector('.categories-widget');
					var categoriesWidgetBottom = categoriesWidget.offsetTop + categoriesWidget.offsetHeight;
					var newTop = el.offsetTop - 4 - 5;
					
					if (newTop <= categoriesWidgetBottom + 12) {
						newTop = categoriesWidgetBottom + 12;
						$interval.cancel(timer);
						
						el.style.position = 'initial';
						
						// 3. Get expenses of that category
						$scope.getExpensesOfCategory(item.categoryCode, function() {
							var expensesDiv = document.querySelector('#expenses-of-category');
							expensesDiv.style.display = 'block';
							expensesDiv.classList.add('visible');
							
						});
					}
					
					el.style.top = newTop + 'px';
				}, 5);
			}, 500);
		}
		else {
			item.selected = false;
			
			// 1. Hide expenses
			var expensesDiv = document.querySelector('#expenses-of-category');
			expensesDiv.classList.remove('visible');
			
			$timeout(function() {
				expensesDiv.style.display = 'none';
				
				// 2. Move item back in position
				var el = document.querySelector('#categories-report-detail-' + item.categoryCode);
				
				el.style.position = 'absolute';
				
				var timer = $interval(function () {
					var newTop = el.offsetTop - 4 + 5;
					
					if (newTop >= $scope.categoryReportItemOriginalTop) {
						newTop = $scope.categoryReportItemOriginalTop;
						$interval.cancel(timer);
						
						el.style.position = 'initial';
						
						// 3. Show hidden elements
						var i;
						for (i = 0; i < $scope.completeTopSpendingReport.rows.length; i++) {
							if ($scope.completeTopSpendingReport.rows[i].categoryCode != item.categoryCode) {
								var hiddenEl = document.querySelector('#categories-report-detail-' + $scope.completeTopSpendingReport.rows[i].categoryCode);
								hiddenEl.style.display = 'flex';
								hiddenEl.classList.add('visible');
							}
						}
					}
					
					el.style.top = newTop + 'px';
				}, 5);
			}, 300);
		}
		
	}
	
	$scope.addQuickExpense = function(ev) {
		
		var insertionCallback = function(expense) {
			$scope.currentMonthTotal += parseFloat(expense.amount);
		};
		
		var creationCallback = function(promise) {};
		
		expensesService.addQuickPayment(ev, insertionCallback, creationCallback, $scope.selectedPeriod.yearMonth); 
	}
	
	/**
	 * Retrieve the complete report of spending categories
	 */
	$scope.getCompleteTopSpendingReport = function(callback) {
		
		$http.get("https://" + microservicesUrl + "/expenses/reports/averageByCategory").success(function(data, status, header, config) {
			$scope.completeTopSpendingReport = data;
			callback(data);
		});
	}
	
	/**
	 * Retrieve the top spending report 
	 */
	$scope.getAverageByCategoryReport = function() {
		
		$http.get("https://" + microservicesUrl + "/expenses/reports/averageByCategory?maxResults=4").success(function(data, status, header, config) {
			$scope.averageByCategoryReport = data;
			
			var i; 
			$scope.averageByCategoryReport.totalPercentage = 0; 
			for (i=0; i<$scope.averageByCategoryReport.rows.length; i++) {
				if (i == 0) $scope.averageByCategoryReport.rows[i].color = '#0097A7';
				else if (i == 1) $scope.averageByCategoryReport.rows[i].color = '#00BCD4';
				else if (i == 2) $scope.averageByCategoryReport.rows[i].color = '#4DD0E1';
				else if (i == 3) $scope.averageByCategoryReport.rows[i].color = '#B2EBF2';
				
				$scope.averageByCategoryReport.totalPercentage += $scope.averageByCategoryReport.rows[i].percentage;
			}
		});
	}
	
	/**
	 * Retrieve the totals of expenses per month
	 */
	$scope.getExpensesTotal = function() {
	
		// 1. Current Month
		var currentYearMonth = $scope.selectedPeriod.yearMonth;
		
		$http.get("https://" + microservicesUrl + "/expenses/expenses/" + currentYearMonth + "/total").success(function(data, status, header, config) {
			$scope.currentMonthTotal = data.total;
		});
		
		if ($scope.gtsm) {
			// 2. Last Month
			var dayOfMonth = parseInt(moment().subtract(1, 'months').format('DD'));
			var lastMonth = moment().subtract(1, 'months').format('YYYYMM');
			if (dayOfMonth > 27) lastMonth = moment().add(1, 'months').format('YYYYMM');
			
			$http.get("https://" + microservicesUrl + "/expenses/expenses/" + lastMonth + "/total").success(function(data, status, header, config) {
				$scope.lastMonthTotal = data.total;
			});
			
			// 3. Two Monthes ago
			var twoMonthesAgo = moment().subtract(2, 'months').format('YYYYMM');
			if (dayOfMonth > 27) twoMonthesAgo = moment().add(1, 'months').format('YYYYMM');
			
			$http.get("https://" + microservicesUrl + "/expenses/expenses/" + twoMonthesAgo + "/total").success(function(data, status, header, config) {
				$scope.twoMonthesAgoTotal = data.total;
			});
			
			// 4. Three Monthes ago
			var threeMonthesAgo = moment().subtract(3, 'months').format('YYYYMM');
			if (dayOfMonth > 27) threeMonthesAgo = moment().add(1, 'months').format('YYYYMM');
			
			$http.get("https://" + microservicesUrl + "/expenses/expenses/" + threeMonthesAgo + "/total").success(function(data, status, header, config) {
				$scope.threeMonthesAgoTotal = data.total;
			});
		}
	}
	
	/**
	 * Retrieves the categories
	 */
	$scope.getCategories = function() {
	
		$http.get("https://" + microservicesUrl + "/expenses/categories").success(function(data, status, header, config) {
			$scope.categories = data.categories;
		});
	}
	
	/**
	 * Retrieve a single category
	 */
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
		
		var maxResults = $mdMedia('gt-sm') ? 8 : 3;
		
		$http.get("https://" + microservicesUrl + "/expenses/expenses?yearMonth=" + yearMonth + "&maxResults=" + maxResults).success(function(data, status, header, config) {
			
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
	 * Retrieves the current period in an yearMonth string
	 */
	$scope.getCurrentPeriod = function() {
		
		var dayOfMonth = parseInt(moment().format('DD'));
		
		if (dayOfMonth > 27) return moment().add(1, 'months').format('YYYYMM');
		
		return moment().format('YYYYMM');
		
	}
	
	/**
	 * Retrieves the expenses of a specific category. 
	 * Puts them in $scope.expensesOfCategory
	 */
	$scope.getExpensesOfCategory = function(category, callback) {
		
		$http.get("https://" + microservicesUrl + "/expenses/expenses?sortYearMonth=true&category=" + category).success(function(data, status, header, config) {
			$scope.expensesOfCategory = data.expenses;
			
			if ($scope.expensesOfCategory != null) {
				var i;
				for (i=0; i<$scope.expensesOfCategory.length; i++) {
					$scope.expensesOfCategory[i].category = $scope.getCategory($scope.expensesOfCategory[i].category);
				}
			}
			
			$scope.groupExpensesPerMonth();
			callback();
		});
	}
	
	/**
	 * Groups a list of expenses per month. 
	 * Returns a [] of month object and each month object has an [] of expenses
	 * [{month: Date, expenses: []}]
	 */
	$scope.groupExpensesPerMonth = function() {
		$scope.monthes = [];

		var monthIndex = -1;
		var i;
		var lastMonth = null;
		for (i = 0; i < $scope.expensesOfCategory.length; i++) {

			if (lastMonth == null || lastMonth != $scope.expensesOfCategory[i].yearMonth) {
				lastMonth = $scope.expensesOfCategory[i].yearMonth;
				$scope.monthes.push({month: new Date(moment(lastMonth + '01', 'YYYYMMDD'))});
				monthIndex++;
			}
			
			if ($scope.expensesOfCategory[i].yearMonth == lastMonth) {
				if ($scope.monthes[monthIndex].expenses == null) $scope.monthes[monthIndex].expenses = [];
				$scope.monthes[monthIndex].expenses.push($scope.expensesOfCategory[i]);
			}
		}
		
	}
	
	/**
	 * Change the category of an expense
	 */
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














