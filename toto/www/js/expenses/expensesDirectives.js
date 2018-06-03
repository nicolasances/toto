
var expensesDirectivesModule = angular.module('expensesDirectivesModule', [ 'expensesServiceModule', 'CardServiceModule' ]);

/**
 * Directive that shows the total expenses for the current month
 * 
 * Accepts the following parameters:
 * 
 *  - currency 	: 	(optional) the currency code to be used. EUR, DKK, ..
 *  - yearMonth :	(optional) the year month to load (default to current year month)
 *  
 */
expensesDirectivesModule.directive('expensesTotal', [ '$timeout', '$mdMedia', 'expensesService', '$rootScope', 'CardService', function($timeout, $mdMedia, expensesService, $rootScope, CardService) {
	
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
			
			CardService.getCards().success(function(data) {
				
				if (data.cards == null) return;
				
				scope.card = data.cards[0];
				
				CardService.getCurrentMonthExpensesTotal(data.cards[0].id).then(function(total) {
					
					scope.creditCardAmount = total;
					
				});
			})
			
		}
	};
} ]);

/**
 * Directive that shows the graph of expenses for each month. 
 * This directive shows a "liquid" view (lines with underlying area filled)
 * 
 * Accepts the following parameters:
 * 
 *  - months 	: 	(optional) number of months to extract
 *  
 */
expensesDirectivesModule.directive('expensesGraphLiquid', [ '$timeout', '$mdMedia', 'expensesService', function($timeout, $mdMedia, expensesService) {
	
	return {
		progress : {},
		scope : {
			months: '@'
		},
		link : function(scope, el) {
			
			// 1. Set widget size
			var container = el[0];
			
			container.classList.add('flex');
			container.classList.add('layout-column');
			
			// 2. Load months totals
			scope.monthExpenses = [];
			
			var maxResults = 12;
			if (scope.months != null) maxResults = scope.months;
			
			expensesService.getMonthTotals(expensesService.getCurrentMonth(), null, maxResults).success(function(data) {
				
				if (data == null || data.totals == null) return;
				
				scope.monthExpenses = [];
				
				for (var i = 0; i < data.totals.length; i++) {
				
					scope.monthExpenses.push({value: parseFloat(data.totals[i].amount.toFixed(0)), label: moment(new Date(data.totals[i].month)).format('MMM')});
					
				}
				
				createGraph(data.totals);
				
			});
			
			/**
			 * Creates the graph
			 */
			var createGraph = function(data) {
				
				var height = container.offsetHeight;
				var width = container.offsetWidth;
				
				x = d3.scaleLinear().range([0, width]);
				y = d3.scaleLinear().range([0, height - 24]);
				
				x.domain([0, data.length - 1]);
				y.domain([0, d3.max(data, function(d) { return d.amount; })]);
				
				svg = d3.select('expenses-graph-liquid').append('svg')
						.attr('width', container.offsetWidth)
						.attr('height', container.offsetHeight);
		
				g = svg.append('g');
				
				maxAmount = d3.max(data, function(d) {return d.amount;});
				minAmount = d3.min(data, function(d, i) {if (i != data.length - 1) return d.amount; return null;})

				// Expenses Line definition
				expensesLine = d3.line()
								.x(function(d, i) { return x(i);})
								.y(function(d) { return height - y(d.amount); })
								.curve(d3.curveCardinal);
				
				// Expenses filled area definition
				expensesArea = d3.area()
								.x(function(d, i) {return x(i);})
								.y0(height)
								.y1(function(d) {return height - y(d.amount);})
								.curve(d3.curveCardinal);
				
				// Expenses curve
				g.append('path').datum(data)
						.style('fill', 'none')
//						.style('stroke', graphicAreaFill)
						.style('stroke-width', 3)
						.attr('id', 'expensesLine')
						.attr('d', expensesLine);
				
				// Expenses filled area
				g.append('path').datum(data)
						.style('fill', graphicAreaFill)
						.attr('d', expensesArea);
				
				// Expenses dots for relevant months
				g.selectAll('.monthCircle').data(data).enter().append('circle')
						.style('fill', accentColor)
						.attr('class', 'monthCircle')
						.attr('cx', function(d, i) {return x(i);})
						.attr('cy', function(d, i) {return height - y(d.amount);})
						.attr('r', function(d) {if (d.amount == maxAmount || d.amount == minAmount) return 5; return 0;});
				
				// Amount for relevant months
				var fontSize = fontTotoS;
				g.selectAll('.monthText').data(data).enter().append('text')
						.style('fill', textAccentColor)
						.attr('class', 'monthText toto-s')
						.attr('text-anchor', function(d, i) {
							if (i == 0) return 'start';
							return 'middle';
						})
						.attr('x', function(d, i) {
							if (i == 0) return x(i) + 12
							return x(i);
						})
						.attr('y', function(d, i) {
							if (i == 0) return height - y(d.amount) + fontSize / 2;
							return height - y(d.amount) + fontSize + 6;
						})
						.text(function(d) {if (d.amount == maxAmount || d.amount == minAmount) return '\u20AC ' + d3.format(',')(d.amount.toFixed(0)); return null;});
						
				
			}
			
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
