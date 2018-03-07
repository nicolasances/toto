
var expensesDirectivesModule = angular.module('expensesDirectivesModule', [ 'expensesServiceModule' ]);

/**
 * Directive that shows the total expenses for the current month
 * 
 * Accepts the following parameters:
 * 
 *  - ... 	: 	... 
 *  
 */
expensesDirectivesModule.directive('expensesTotal', [ '$timeout', '$mdMedia', 'expensesService', function($timeout, $mdMedia, expensesService) {
	
	return {
		progress : {},
		scope : {
		},
		templateUrl : 'modules/expenses/directives/expenses-total.html',
		link : function(scope, el) {
			
			var scale = 0.6;
			var widgetSize = {width: el[0].parentNode.offsetWidth, height: el[0].parentNode.offsetHeight};
			var circleSize = widgetSize.width > widgetSize.height ? widgetSize.height * scale : widgetSize.width * scale;
			
			var circle = el[0];
			
			circle.style.width = circleSize + 'px';
			circle.style.height = circleSize + 'px';
			circle.style.marginLeft = (widgetSize.width - 18 - circleSize) / 2 + 'px';
			circle.classList.add('layout-column');
			
			expensesService.getMonthTotal(null, expensesService.getCurrentMonth()).success(function(data) {
				
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
 *  - ... 	: 	... 
 *  
 */
expensesDirectivesModule.directive('expensesGraph', [ '$timeout', '$mdMedia', 'expensesService', function($timeout, $mdMedia, expensesService) {
	
	return {
		progress : {},
		scope : {
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
