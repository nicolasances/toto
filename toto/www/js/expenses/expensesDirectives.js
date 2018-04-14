
var expensesDirectivesModule = angular.module('expensesDirectivesModule', [ 'expensesServiceModule' ]);

/**
 * Directive that shows the total expenses for the current month
 * 
 * Accepts the following parameters:
 * 
 *  - currency 	: 	(optional) the currency code to be used. EUR, DKK, ..
 *  - yearMonth :	(optional) the year month to load (default to current year month)
 *  
 */
expensesDirectivesModule.directive('expensesTotal', [ '$timeout', '$mdMedia', 'expensesService', '$rootScope', function($timeout, $mdMedia, expensesService, $rootScope) {
	
	return {
		progress : {},
		scope : {
			currency: '@',
			yearMonth: '@'
		},
		templateUrl : 'modules/expenses/directives/expenses-total.html',
		link : function(scope, el) {
			
			scope.go = $rootScope.go;
			
			var circle = el[0];
			circle.classList.add('layout-column');
			
			var yearMonth = scope.yearMonth == null ? expensesService.getCurrentMonth() : scope.yearMonth;
			
			expensesService.getMonthTotal(scope.currency, yearMonth).success(function(data) {
				
				scope.amount = data.total;
			});
			
		}
	};
} ]);

/**
 * Directive that shows the graph of expenses for each month
 * 
 * Accepts the following parameters:
 * 
 *  - months 	: 	(optional) number of months to extract
 *  
 */
expensesDirectivesModule.directive('expensesGraph', [ '$timeout', '$mdMedia', 'expensesService', function($timeout, $mdMedia, expensesService) {
	
	return {
		progress : {},
		scope : {
			months: '@'
		},
		templateUrl : 'modules/expenses/directives/expenses-graph.html',
		link : function(scope, el) {
			
			// 1. Set widget size
			var container = el[0].parentNode;
			var containerWidth = container.offsetWidth;
			var containerHeight = container.offsetHeight;
			
			var comp = el[0];
			var scale = 0.8;
			comp.style.width = containerWidth * scale + 'px';
			comp.style.height = containerHeight * scale + 'px';
			comp.style.marginLeft = (containerWidth - 18 - containerWidth * scale) / 2 + 'px';
			comp.classList.add('layout-column');
			
			// 2. Load months totals
			scope.monthExpenses = [];
			
			var maxResults = containerWidth > 250 ? 6 : 5;
			if (scope.months != null) maxResults = scope.months;
			
			expensesService.getMonthTotals(expensesService.getCurrentMonth(), null, maxResults).success(function(data) {
				
				if (data == null || data.totals == null) return;
				
				scope.monthExpenses = [];
				
				for (var i = 0; i < data.totals.length; i++) {
				
					scope.monthExpenses.push({value: parseFloat(data.totals[i].amount.toFixed(0)), label: moment(new Date(data.totals[i].month)).format('MMM')});
					
				}
				
			});
			
		}
	};
} ]);
