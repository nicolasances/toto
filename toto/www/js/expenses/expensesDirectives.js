
var expensesDirectivesModule = angular.module('expensesDirectivesModule', [ 'expensesServiceModule', 'CardServiceModule' ]);

/**
 * Displays the info of this month. 
 */
expensesDirectivesModule.directive('expensesMonthInfo', function(expensesService) {
	
	return {
		scope: {},
		templateUrl: 'modules/expenses/directives/expenses-month-info.html',
		link: function(scope, el) {
			
			el[0].classList.add('layout-column');
			
			/**
			 * Create a new payment
			 */
			scope.addPayment = function() {
				
				expensesService.addPayment(onCreated, onSaved, expensesService.getCurrentMonth());
			}
			
			/**
			 * Listen to expenseCreated events and update the total
			 */
			TotoEventBus.subscribeToEvent('expenseCreated', function(event) {
				
				if (event == null || event.context == null || event.context.expenseId == null) {console.log('Received expenseCreated event without data'); return;}

				getExpenses();
				
			});
			
			/**
			 * Callback for when the expense has been created (not yet saved necessarily)
			 */
			var onCreated = function(expense) {}
			
			/**
			 * Callback for when the expense is actually saved and has an ID assigned
			 */
			var onSaved = function(expenseId) {
				
				// Throw an event for "expense created"
				TotoEventBus.publishEvent({name: 'expenseCreated', context: {expenseId: expenseId}});
				
			}
			
			/**
			 * Get the expenses of the month
			 */
			var getExpenses = function() {
				
				// Retrieve the expenses
				expensesService.getExpenses({yearMonth: expensesService.getCurrentMonth()}).success(function(data) {
					
					// Save in scope variable
					scope.expenses = data.expenses;
					
					// Calculate total
					calcTotal();
					
				});
			}
			
			/**
			 * Calculates the total amount spent in the month
			 */
			var calcTotal = function() {
				
				scope.expensesTotal = 0;
				
				for (var i = 0; i < scope.expenses.length; i++) {
					
					scope.expensesTotal += scope.expenses[i].amountInEuro;
				}
			}
			
			getExpenses();
			
		}
	};
});

/**
 * Displays the graph that shows, for this specific month, the split of expenses
 * among the different categories
 */
expensesDirectivesModule.directive('expensesMonthGraph', function(expensesService) {
	
	return {
		scope: {},
		link: function(scope, el) {
			
			el[0].classList.add('layout-column');
			el[0].classList.add('flex');
			
			// Basic graph elements 
			var containerHeight, containerWidth;
			var svg, g;
			
			/**
			 * Watch for changes in the el height and resize the graph
			 */
			scope.$watch(function() {return el[0].offsetHeight}, function(nv, ov) {
				
				if (svg != null) svg.remove();
				
				// Set new container height
				containerHeight = el[0].offsetHeight;
				containerWidth = el[0].offsetWidth;
				
				// Create svg and g
				svg = d3.select(el[0]).append('svg')
						.attr('width', containerWidth)
						.attr('height', containerHeight);
				
				g = svg.append('g');
				
				draw();
				
			});
			
			/**
			 * Listen to expenseCreated events and update the categories split
			 */
			TotoEventBus.subscribeToEvent('expenseCreated', function(event) {
				
				if (event == null || event.context == null || event.context.expenseId == null) {console.log('Received expenseCreated event without data'); return;}

				getExpenses();
				
			});
			
			/**
			 * Get the expenses of the month
			 */
			var getExpenses = function() {
				
				// Retrieve the expenses
				expensesService.getExpenses({yearMonth: expensesService.getCurrentMonth()}).success(function(data) {
					
					// Save in scope variable
					scope.expenses = data.expenses;
					
					// Calculate the split of expenses per category
					calculateSplitPerCategory()
					
					// Draw the graph
					draw();
					
				});
			}
			
			/**
			 * Calculates the split of the payments per category
			 */
			var calculateSplitPerCategory = function() {
				
				// Create a Map of the categories and for each category keep track of the sum of expenses
				var categoryMap = new Map();
				
				// Go over the expenses and categorize them
				for (var i = 0; i < scope.expenses.length; i++) {
					
					var exp = scope.expenses[i];
					
					// Look for the expense category in the map
					var cat = categoryMap.get(exp.category);
					
					if (cat == null) categoryMap.set(exp.category, {category: exp.category, amount: exp.amountInEuro});
					else cat.amount += exp.amountInEuro;
				}
				
				// Transform the category map into an array
				scope.categories = [];
				
				for (let category of categoryMap.values()) {
					scope.categories.push(category);
				}
				
				// Sort the categories
				// The categories are sorted by highest to lowest amount
				scope.categories.sort(function(a, b) {
					
					if (a.amount <= b.amount) return 1;
					
					return -1;
				});
				
			}
			
			// Draw the graph
			var draw = function() {
				
				if (scope.categories == null) return;
				
				// Gather all the categories
				var categoryScale = [];
				for (var i = 0; i < scope.categories.length; i++) {categoryScale.push(scope.categories[i].category);}
				
				// Create the x and y scales
				var x = d3.scaleBand().range([0, containerWidth]).padding(0.1);
				var y = d3.scaleLinear().range([0, containerHeight - fontTotoS - 12]);
				
				x.domain(categoryScale);
				y.domain([0, d3.max(scope.categories, function(d) {return d.amount})]);
				
				// Define the avatar image size for the categories
				// The size depends on the x band width
				// Images will be rescaled based on the width of the bars
				var imageSize = 0.5 * x.bandwidth();
				
				// Create bars
				g.selectAll('.bar').data(scope.categories).enter().append('rect')
					.attr('class', 'bar')
					.attr('fill', graphicAreaFill)
					.attr('x', function(d) {return x(d.category)})
					.attr('y', function(d) {return containerHeight - y(d.amount)})
					.attr('width', x.bandwidth())
					.attr('height', function(d) {return y(d.amount)});
				
				g.selectAll('.bar').data(scope.categories)
					.transition(300)
					.attr('x', function(d) {return x(d.category)})
					.attr('y', function(d) {return containerHeight - y(d.amount)})
					.attr('width', x.bandwidth())
					.attr('height', function(d) {return y(d.amount)});
				
				// Add the SVG image for the category
				g.selectAll('.img').data(scope.categories).enter().append('svg:image')
					.attr('class', 'img')
					.attr('xlink:href', function(d) {return 'images/expenses/avatars-nofill/' + getCategorySvg(d.category)})
					.attr('x', function(d) {return x(d.category) + x.bandwidth() / 2 - imageSize / 2})
					.attr('y', function(d) {if (y(d.amount) < (12 + imageSize + 12)) return containerHeight - y(d.amount) - 6 - imageSize; return containerHeight - 12 - imageSize;})
					.attr('width', imageSize)
					.attr('height', imageSize)
					.style('opacity', '0.6');
				
				g.selectAll('.img').data(scope.categories)
					.transition(300)
					.attr('xlink:href', function(d) {return 'images/expenses/avatars-nofill/' + getCategorySvg(d.category)})
					.attr('x', function(d) {return x(d.category) + x.bandwidth() / 2 - imageSize / 2})
					.attr('y', function(d) {if (y(d.amount) < (12 + imageSize + 12)) return containerHeight - y(d.amount) - 6 - imageSize; return containerHeight - 12 - imageSize;})
					.attr('width', imageSize)
					.attr('height', imageSize);
				
				// Add the text: amount spent for each category
				g.selectAll('.text').data(scope.categories).enter().append('text')
					.attr('class', 'text')
					.attr('text-anchor', 'middle')
					.style('fill', accentColor)
					.style('font-size', fontTotoS)
					.attr('x', function(d) {return x(d.category) + x.bandwidth() / 2})
					.attr('y', function(d) {if (y(d.amount) < (12 + imageSize + 12)) return containerHeight - y(d.amount) - 6 - imageSize - fontTotoS; return containerHeight - y(d.amount) - 12})
					.text(function(d) {return d3.format(',')(d.amount.toFixed(0))});
				
				g.selectAll('.text').data(scope.categories)
					.transition(300)
					.attr('x', function(d) {return x(d.category) + x.bandwidth() / 2})
					.attr('y', function(d) {if (y(d.amount) < (12 + imageSize + 12)) return containerHeight - y(d.amount) - 6 - imageSize - fontTotoS; return containerHeight - y(d.amount) - 12})
					.text(function(d) {return d3.format(',')(d.amount.toFixed(0))});
				
			}
			
			/**
			 * Finds the SVG related to the specified category
			 */
			var getCategorySvg = function(cat) {
				
				for (var i = 0; i < scope.availableCategories.length; i++) {
					
					if (scope.availableCategories[i].code == cat) return scope.availableCategories[i].filename;
				}
				
			}

			/**
			 * Retrieve the categories and then the expenses
			 */
			expensesService.getCategories().success(function(data) {
				
				scope.availableCategories = data.categories;
				
				// Get the expenses
				getExpenses();
				
			});
			
		}
	}
});

/**
 * Retrieves the list of expenses of the current month
 */
expensesDirectivesModule.directive('expensesList', function(expensesService) {
	
	return {
		
		scope: {},
		templateUrl: 'modules/expenses/directives/expenses-list.html',
		link: function(scope, el) {
			
			el[0].classList.add('layout-column');
			el[0].classList.add('flex');
			
			/**
			 * Get the expenses of the month
			 */
			var getExpenses = function() {
				
				// Retrieve the expenses
				expensesService.getExpenses({yearMonth: expensesService.getCurrentMonth()}).success(function(data) {
					
					// Save in scope variable
					scope.expenses = data.expenses;
					
				});
			}
			
			/**
			 * Extracts the data to be represented in the toto-list
			 */
			scope.expenseExtractor = function(item) {
				
				var result = {
					id: item.id,
					avatar: 'images/expenses/avatars-nofill/' + getCategorySvg(item.category),
					date: item.date,
					title: item.description,
					number: {
						unit: item.currency,
						value: item.amount,
						scale: 2, 
						accent: 'false'
					}, 
					greyed: !item.consolidated,
					actions: [{svg: 'images/svg/trash.svg', action: deleteExpense}]
				};
				
				if (!item.consolidated) result.actions.unshift({svg: 'images/svg/checked.svg', action: consolidateExpense})
				
				return result;
			}
			
			/**
			 * Consolidates the expense
			 */
			var consolidateExpense = function(item) {
				
				// Consolidate expense
				expensesService.setExpenseConsolidated(item.id);
				
				// Send the expenseConsolidated event
				TotoEventBus.publishEvent({name: 'expenseConsolidated', context: {expenseId: item.id}});
			}
			
			/**
			 * Deletes an expense
			 */
			var deleteExpense = function(item) {
				
				expensesService.deleteExpense(item.id);
				
				// Send the expenseDeleted event
				TotoEventBus.publishEvent({name: 'expenseDeleted', context: {expenseId: item.id}});
			}
			
			/**
			 * Finds the SVG related to the specified category
			 */
			var getCategorySvg = function(cat) {
				
				for (var i = 0; i < scope.availableCategories.length; i++) {
					
					if (scope.availableCategories[i].code == cat) return scope.availableCategories[i].filename;
				}
				
			}

			/**
			 * Retrieve the categories and then the expenses
			 */
			expensesService.getCategories().success(function(data) {
				
				// Save the categories as "available categories"
				scope.availableCategories = data.categories;
				
				// Get the expenses
				getExpenses();
				
			});
			
			// Register all the Event Reaction functions
			TotoEventBus.subscribeToEvent('expenseDeleted', function(event) {
				
				// Reload the expenses
				getExpenses();
				
			});
			
			TotoEventBus.subscribeToEvent('expenseConsolidated', function(event) {
				
				// Reload the expenses
				getExpenses();
				
			});
		}
	};
});

/**
 * Directive that shows the total expenses for the current month
 * 
 * Accepts the following parameters:
 * 
 *  - type		:	the type of total: can be month, week, day
 *  - currency 	: 	(optional) the currency code to be used. EUR, DKK, ..
 *  - yearMonth :	(optional) the year month to load (default to current year month)
 *  
 */
expensesDirectivesModule.directive('expensesTotal', [ '$timeout', '$mdMedia', 'expensesService', '$rootScope', 'CardService', function($timeout, $mdMedia, expensesService, $rootScope, CardService) {
	
	return {
		progress : {},
		scope : {
			currency: '@',
			yearMonth: '@', 
			type: '@'
		},
		templateUrl : 'modules/expenses/directives/expenses-total.html',
		link : function(scope, el) {
			
			scope.go = $rootScope.go;
			
			/**
			 * Default Values
			 */
			var yearMonth = scope.yearMonth == null ? expensesService.getCurrentMonth() : scope.yearMonth;
			
			/**
			 * Retrieve the total of the specified month
			 */
			if (scope.type == 'month') {
				
				expensesService.getMonthTotal(scope.currency, yearMonth).success(function(data) {
					
					scope.amount = data.total;
				});
			}
			
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

