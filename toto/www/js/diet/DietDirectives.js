var dietDirectivesModule = angular.module('dietDirectivesModule', ['DietServiceModule']);

var dietFoodCategories = [{id: 'meat', name: 'Meat'},
                          {id: 'fish', name: 'Fish'},
                          {id: 'vegetables', name: 'Veggies'},
                          {id: 'fruits', name: 'Fruits'},
                          {id: 'smoothie', name: 'Smoothie'},
                          {id: 'dairy', name: 'Dairy'},
                          {id: 'fastfood', name: 'Fast food'},
                          {id: 'drinks', name: 'Drinks'}];

/**
 * This directive draws the week summary
 * 
 * Parameters: 
 * 
 *  	-	... 		:	...
 */
dietDirectivesModule.directive('dietWater', ['DietService', '$timeout', function(DietService, $timeout) {
	
	return {
		scope: {
		},
		templateUrl: 'modules/diet/directives/diet-water.html',
		link: function(scope, el) {
			
			var component = el[0];
			var scale = 0.8;

			component.classList.add('layout-row');
			component.id = 'dietWater-' + Math.floor(Math.random() * 1000000);
			
			var waterEl = document.querySelector('#' + component.id + ' .circle');

			scope.totalAmount = 0;
			
			var arcGutter = 0.01 * 2 * Math.PI;
			var waterArch = d3.arc().innerRadius(waterEl.offsetWidth/2 - 4).outerRadius(waterEl.offsetWidth/2).startAngle(0 + arcGutter).endAngle(0 + arcGutter);
			var waterBaseArc = d3.arc().innerRadius(waterEl.offsetWidth/2 - 4).outerRadius(waterEl.offsetWidth/2).startAngle(2 * Math.PI).endAngle(0);

			/**
			 * Arc tween animation
			 */
			var arcTween = function(arc, target) {
				
				return function(d) {
					var interpolate = d3.interpolate(0, target);
					
					return function(t) {
						
						arc.endAngle(interpolate(t));
						
						return arc();
					}
				}
			}
			
			svg = d3.select('#' + component.id + ' .circle').append('svg')
					.attr('width', waterEl.offsetWidth)
					.attr('height', waterEl.offsetHeight)
					.style('position', 'absolute')
		
			g = svg.append('g');
			
			g.append('path')
					.attr('id', 'waterBasePath')
					.attr('fill', function(d) {return '#B2EBF2';})
					.attr('transform', 'translate(' + waterEl.offsetWidth/2 + ', ' + waterEl.offsetHeight/2 + ')')
					.attr('d', waterBaseArc)
			
			g.append('path')
					.attr('id', 'waterPath')
					.attr('fill', function(d) {return '#64DD17';})
					.attr('transform', 'translate(' + waterEl.offsetWidth/2 + ', ' + waterEl.offsetHeight/2 + ')')
					.attr('d', waterArch)
					
			
			/**
			 * Retrieve the water consumption goal
			 */
			DietService.getWaterConsumptionGoal().success(function(data) {
				
				scope.goal = data;
				
				/**
				 * Retrieve the water consumption 
				 */
				DietService.getWaterConsumption().success(function(data) {
					
					scope.totalAmount = data.total / 1000;
					
					var endAngle = data.total * 2 * Math.PI / scope.goal.amount;
					if (endAngle > 2 * Math.PI) endAngle = 2 * Math.PI;
					
					d3.select('#' + component.id + ' #waterPath')
						.transition()
						.duration(500)
						.attrTween('d', arcTween(waterArch, endAngle - arcGutter));
					
					d3.select('#' + component.id + ' #waterBasePath')
						.transition()
						.duration(500)
						.attrTween('d', arcTween(waterBaseArc, endAngle));
					
				});
			});
			
			/**
			 * Allow the user to add water to the daily consumption
			 */
			scope.addWater = function() {
				
				DietService.showAddWaterConsumptionDialog(function(amount) {
					
					DietService.postWaterConsumption(amount).success(function() {
						
						scope.totalAmount += amount / 1000;
						
						var endAngle = scope.totalAmount * 1000 * 2 * Math.PI / scope.goal.amount;
						if (endAngle > 2 * Math.PI) endAngle = 2 * Math.PI;
						
						d3.select('#' + component.id + ' #waterPath')
							.transition()
							.duration(500)
							.attrTween('d', arcTween(waterArch, endAngle - arcGutter));
						
						d3.select('#' + component.id + ' #waterBasePath')
							.transition()
							.duration(500)
							.attrTween('d', arcTween(waterBaseArc, endAngle));
						
					});
				})
			}

		}
	}
}]);

/**
 * Shows the list of foods (master data) that have been recorded
 * 
 * Params: 
 * 
 *  - onSelect	:	optional, default null, a callback function to be called when selecting an aliment
 *  - hideAdd	:	optional, default false, hides the add button
 *  - background:	optional, default 'light', accepted values: 'dark', 'light'
 */
dietDirectivesModule.directive('dietFoods', ['DietService', '$timeout', function(DietService, $timeout) {
	
	return {
		scope: {
			onSelect: '=', 
			hideAdd: '@', 
			background: '@',
			addFood: '='
		},
		templateUrl: 'modules/diet/directives/diet-foods.html',
		link: function(scope, el) {
			
			var dietFoodsSwiper;
			
			scope.categories = dietFoodCategories;
			scope.foods = [];
			scope.categoryFilter = null;
			if (scope.background == null) scope.background = 'light';

			/**
			 * Retrieves the list of foods
			 */
			scope.getFoods = function() {
				
				DietService.getFoods(scope.categoryFilter).success(function(data) {
					
					scope.foods = data.foods;
					
					for (var i = 0; i < scope.foods.length; i++) {
						scope.foods.showOptions = false;
					}
					
				});
			}
			
			/**
			 * Returns the data that has to be displayed with the structure required by the toto-list Directive.
			 */
			scope.foodDataExtractor = function(food) {
				
				return {
					avatar: 'images/diet/cat/' + food.category + '.svg',
					title: food.name,
					subtitle: 'Calories: ' + food.calories + ' cal, Carbs: ' + food.carbs + ' gr, Proteins: ' + food.proteins + ' gr, Fats: ' + food.fat + ' gr.' 
				};
			}
			
			/**
			 * Switch to the foods list slide and filters by category
			 */
			scope.filterByCategory = function(categoryId) {
				
				scope.categoryFilter = categoryId;
				
				scope.getFoods();
			
				dietFoodsSwiper.slideNext();
				
			}
			
			scope.deleteFood = function(id) {
				
				DietService.deleteFood(id).success(function() {
					
					for (var i = 0; i < scope.foods.length; i++) {
						if (scope.foods[i].id == id) scope.foods.splice(i, 1);
					}
				});
			}
			
			scope.onClick = function(food) {
				
				if (scope.onSelect == null) food.showOptions = !food.showOptions;
				else scope.onSelect(food);
			}
			
			scope.addFood = function() {
				
				DietService.showAddFoodDialog(function(food) {
					
					scope.food = food;
					scope.foods.push(scope.food);
					
					DietService.postFood(food).success(function(data) {scope.food.id = data.id;});
				});
			}
			
			$timeout(function() {
				
				dietFoodsSwiper = new Swiper ('diet-foods .swiper-container-h', {
					loop: false,
					direction: 'horizontal', 
					on: {
						slideNextTransitionEnd: function() {
							document.querySelector('diet-foods #addFoodButton').style.display = 'inline-block';
						},
						slidePrevTransitionEnd: function() {
							document.querySelector('diet-foods #addFoodButton').style.display = 'none';
						}
					}
				});
			}, 200);
		}
	}
}]);

/**
 * Daily Info
 * Shows the info consumed so far during the day
 * 
 * diet-daily-info
 * 
 * Params: 
 * 
 */
dietDirectivesModule.directive('dietDailyInfo', ['DietService', '$timeout', '$rootScope', function(DietService, $timeout, $rootScope) {
	
	return {
		scope: true,
		templateUrl: 'modules/diet/directives/diet-daily-info.html',
		link: function(scope, el) {
			
			el[0].classList.add('layout-column');
			el[0].classList.add('flex');

			/**
			 * Subscribe to 'dietMealAdded' event and update the data when received
			 */
			TotoEventBus.subscribeToEvent('dietMealAdded', function(event) {
				
				scope.getMeals();
			});
			
			/**
			 * Retrieves the meals 
			 */
			scope.getMeals = function() {
				
				DietService.getMeals(moment().format('YYYYMMDD')).success(function(data) {
					
					scope.calories = 0;
					scope.carbs = 0;
					scope.proteins = 0;
					scope.fats = 0;

					if (data == null) return;
					
					for (var i = 0; i < data.meals.length; i++) {
						
						scope.calories += data.meals[i].calories;
						scope.carbs += data.meals[i].carbs;
						scope.fats += data.meals[i].fat;
						scope.proteins += data.meals[i].proteins;
					}
					
				});
			}
			
			/**
			 * Function to add a new meal
			 */
			scope.addMeal = function() {
				
				DietService.showAddMealDialog(function(meal) {
					DietService.postMeal(meal).success(function(data) {
						
						TotoEventBus.publishEvent({name: 'dietMealAdded'});
					});
				});
				
			}
			
			scope.getMeals();
		}
	}
}]);

/**
 * Weekly Info
 * Shows the averages of the calories and macronutrients consumed during the week
 * 
 * diet-weekly-info
 * 
 * Params: 
 * 
 */
dietDirectivesModule.directive('dietWeeklyInfo', ['DietService', '$timeout', '$rootScope', function(DietService, $timeout, $rootScope) {
	
	return {
		scope: true,
		templateUrl: 'modules/diet/directives/diet-weekly-info.html',
		link: function(scope, el) {
			
			el[0].classList.add('layout-column');
			el[0].classList.add('flex');

			/**
			 * Subscribe to 'dietMealAdded' event and update the data when received
			 */
			TotoEventBus.subscribeToEvent('dietMealAdded', function(event) {
				
				scope.getMeals();
			});
			
			/**
			 * Retrieves the meals 
			 */
			scope.getMeals = function() {
				
				var startOfWeek = moment().startOf('week');
				if (startOfWeek.day() == 0) startOfWeek = startOfWeek.add(1, 'days');
				
				DietService.getMeals(null, startOfWeek.format('YYYYMMDD')).success(function(data) {
					
					// Get the data in the right format
					scope.mealsStats = new Map();
					
					for (var i = 0; i < data.meals.length; i++) {
						
						var stat = scope.mealsStats.get(data.meals[i].date);
						
						if (stat == null) scope.mealsStats.set(data.meals[i].date, {date: data.meals[i].date, calories: data.meals[i].calories, proteins: data.meals[i].proteins, carbs: data.meals[i].carbs, fats: data.meals[i].fat});
						else {
							stat.calories += data.meals[i].calories;
							stat.proteins += data.meals[i].proteins;
							stat.carbs += data.meals[i].carbs;
							stat.fats += data.meals[i].fat;
						}
					}
					
					calculateAverages();
				});
				
			}
			
			/**
			 * Calculates the average calories and macro of the week (so far)
			 */
			var calculateAverages = function() {

				scope.avgCal = 0;
				scope.avgProt = 0;
				scope.avgCarb = 0;
				scope.avgFat = 0;
				
				for (let entry of scope.mealsStats) {
					
					scope.avgCal += entry[1].calories;
					scope.avgProt += entry[1].proteins;
					scope.avgCarb += entry[1].carbs;
					scope.avgFat += entry[1].fats;
				}
				
				scope.avgCal /= scope.mealsStats.size;
				scope.avgProt /= scope.mealsStats.size;
				scope.avgCarb /= scope.mealsStats.size;
				scope.avgFat /= scope.mealsStats.size;
				
			}
			
			/**
			 * Function to add a new meal
			 */
			scope.addMeal = function() {
				
				DietService.showAddMealDialog(function(meal) {
					DietService.postMeal(meal).success(function(data) {
						
						TotoEventBus.publishEvent({name: 'dietMealAdded'});
					});
				});
				
			}
			
			scope.getMeals();
		}
	}
}]);


/**
 * Macros Stats
 * Shows the statistics of the macros: a graph showing calories, carbs, proteins and fats over a period of time 
 * 
 * diet-macros-stats
 * 
 * Params: 
 * 
 *  - weeks : 	shows the specified amount of weeks
 *  			default is 4 weeks
 * 
 */
dietDirectivesModule.directive('dietMacrosStats', function(DietService, $timeout, $rootScope, $interval) {
	
	return {
		scope: {
			
			weeks: '@'
		},
		link: function(scope, el) {
			
			el[0].classList.add('flex');
			el[0].classList.add('layout-column');
			
			// Get the data
			var weeks = scope.weeks == null ? 4 : scope.weeks;
			var dateFrom = moment().subtract(weeks, 'weeks').format('YYYYMMDD');
			var mealsStats = new Map();
			
			// The drawing base variables
			var containerWidth = el[0].offsetWidth;
			var containerHeight = el[0].offsetHeight;
			
			var svg;
			var g;
			
			// Some global variables
			var maxProtein, minProtein;
			var maxCarb, minCarb;
			var maxFat, minFat;
			var maxCalorie, minCalorie;
			
			/**
			 * Watch for height change and re-render the graph when the height changes
			 */
			scope.$watch(function() {return el[0].offsetHeight;}, function(newValue, oldValue) {

				containerWidth = el[0].offsetWidth;
				containerHeight = newValue;
				
				// Draw the graph
				createNutritionGraph();
				
			});

			/**
			 * Subscribe to 'dietMealAdded' event and update the data when received
			 */
			TotoEventBus.subscribeToEvent('dietMealAdded', function(event) {
				
				scope.getMeals();
			});

			
			/**
			 * Retrieves the meals for the specified period of time
			 */
			scope.getMeals = function() {
				
				DietService.getMeals(null, dateFrom).success(function(data) {
					
					// Get the data in the right format
					scope.mealsStats = new Map();
					
					for (var i = 0; i < data.meals.length; i++) {
						
						var stat = scope.mealsStats.get(data.meals[i].date);
						
						if (stat == null) scope.mealsStats.set(data.meals[i].date, {date: data.meals[i].date, calories: data.meals[i].calories, proteins: data.meals[i].proteins, carbs: data.meals[i].carbs, fats: data.meals[i].fat});
						else {
							stat.calories += data.meals[i].calories;
							stat.proteins += data.meals[i].proteins;
							stat.carbs += data.meals[i].carbs;
							stat.fats += data.meals[i].fat;
						}
					}
					
					// Draw the graph
					createNutritionGraph();
					
				});
			}
			
			/**
			 * Creates the graph
			 */
			var createNutritionGraph = function() {
				
				if (scope.mealsStats == null) return;
				
				if (svg != null) svg.remove();
				
				svg = d3.select(el[0]).append('svg')
						.attr('width', containerWidth)
						.attr('height', containerHeight);
				
				g = svg.append('g');
				
				var stats = scope.mealsStats;
				
				var data = [];
				for (let item of stats.values()) {
					data.push(item);
				}
				
				// 1. Create the calories graph
				createCaloriesGraph(data);
				
				// 2. Create the proteins graph
				createProteinsGraph(data);
				
				// 3. Create the carbs graph
				createCarbsGraph(data);
				
				// 4. Create the fats graph
				createFatsGraph(data);
			}
			
			/**
			 * Creates the bar chart showing the calories
			 */
			var createCaloriesGraph = function(data) {
				
				var x = d3.scaleBand().range([0, containerWidth]).padding(0.1);
				var y = d3.scaleLinear().range([containerHeight / 2, containerHeight - 24]);
				
				x.domain(data.map(function(d) {return d.date;}));
				y.domain([0, d3.max(data, function(d) {return d.calories;})]);
				
				maxCalorie = d3.max(data, function(d, i) {if (i != data.length - 1) return d.calories});
				minCalorie = d3.min(data, function(d, i) {if (i != data.length - 1) return d.calories});
				
				g.selectAll('.calBars').data(data).enter().append('rect')
						.style('fill', graphicAreaFill)
						.attr('class', 'calBars')
						.attr('x', function(d) {return x(d.date);})
						.attr('width', x.bandwidth())
						.attr('y', function(d) {return containerHeight - y(d.calories);})
						.attr('height', function(d) {return y(d.calories); })
						.on('click', showCaloriesValues);
				
				g.selectAll('.caloriesValue').data(data).enter().append('text')
							.style('font-size', fontTotoS)
							.attr('class', 'caloriesValue')
							.attr('fill', 'none')
							.attr('text-anchor', function(d, i) {if (i == 0) return 'left'; return 'middle';})
							.attr('x', function(d, i) {return x(d.date) + (i == 0 ? 12 : 0)})
							.attr('y', function(d, i) {return containerHeight - y(d.calories) + (i > 0 ? fontTotoS + 8: 0);})
							.text(function(d) {if (d.calories == maxCalorie|| d.calories == minCalorie) return d3.format(',')(d.calories.toFixed(0));});
				
				g.selectAll('.calDates').data(data).enter().append('text')
							.style('font-size', fontTotoXS)
							.attr('class', 'calDates')
							.attr('fill', 'none')
							.attr('text-anchor', function(d, i) {if (i == 0) return 'left'; return 'right';})
							.attr('x', function(d, i) {return x(d.date) + (i == 0 ? 6 : -18)})
							.attr('y', containerHeight - 6)
							.text(function(d, i) {if (i == 0 || i == data.length - 1) return moment(d.date, 'YYYYMMDD').format('DD.MM');})
			}
			
			/**
			 * Creates the area graph showing the proteins
			 */
			var createProteinsGraph = function(data) {
				
				var maxGraphHeight = 3 * containerHeight / 4;
				
				var x = d3.scaleLinear().range([0, containerWidth]);
				var y = d3.scaleLinear().range([0, maxGraphHeight]);
				
				x.domain([0, data.length - 1]);
				y.domain([0, d3.max(data, function(d) {return d3.max([d.proteins, d.carbs, d.fats]);})]);
				
				maxProtein = d3.max(data, function(d, i) {if (i != data.length - 1) return d.proteins});
				minProtein = d3.min(data, function(d, i) {if (i != data.length - 1) return d.proteins});

				var area = d3.area()
							.x(function(d, i) {return x(i);})
							.y0(containerHeight)
							.y1(function(d) {return containerHeight - y(d.proteins);})
							.curve(d3.curveCardinal);
				
				var line = d3.line()
							.x(function(d, i) { return x(i);})
							.y(function(d) { return containerHeight - y(d.proteins); })
							.curve(d3.curveCardinal);
				
				g.append('path').datum(data)
							.style('fill', graphicAreaFill)
							.attr('d', area)
							.on('click', showProteinValues);
				
				g.append('path').datum(data)
							.style('fill', 'none')
							.attr('stroke', themeColor)
							.attr('d', line);
				
				g.selectAll('.proteinsKeyPoint').data(data).enter().append('circle')
							.attr('class', 'proteinsKeyPoint')
							.attr('cx', function(d, i) {return x(i)})
							.attr('cy', function(d) {return containerHeight - y(d.proteins);})
							.attr('r', 4)
							.attr('fill', 'none');
							
				g.selectAll('.proteinsValue').data(data).enter().append('text')
							.style('font-size', fontTotoS)
							.attr('class', 'proteinsValue')
							.attr('fill', 'none')
							.attr('text-anchor', function(d, i) {if (i == 0) return 'left'; return 'middle';})
							.attr('x', function(d, i) {return x(i) + (i == 0 ? 12 : 0)})
							.attr('y', function(d, i) {return containerHeight - y(d.proteins) + (i > 0 ? fontTotoS + 8: 0);})
							.text(function(d) {if (d.proteins == maxProtein || d.proteins == minProtein) return d3.format(',')(d.proteins.toFixed(0));})
			}
			
			/**
			 * Creates the area graph showing the carbs
			 */
			var createCarbsGraph = function(data) {

				var maxGraphHeight = 3 * containerHeight / 4;
				
				var x = d3.scaleLinear().range([0, containerWidth]);
				var y = d3.scaleLinear().range([0, maxGraphHeight]);
				
				x.domain([0, data.length - 1]);
				y.domain([0, d3.max(data, function(d) {return d3.max([d.proteins, d.carbs, d.fats]);})]);
				
				maxCarb = d3.max(data, function(d, i) {if (i != data.length - 1) return d.carbs});
				minCarb = d3.min(data, function(d, i) {if (i != data.length - 1) return d.carbs});
				
				var area = d3.area()
							.x(function(d, i) {return x(i);})
							.y0(containerHeight)
							.y1(function(d) {return containerHeight - y(d.carbs);})
							.curve(d3.curveCardinal);
				
				var line = d3.line()
							.x(function(d, i) { return x(i);})
							.y(function(d) { return containerHeight - y(d.carbs); })
							.curve(d3.curveCardinal);
				
				g.append('path').datum(data)
							.style('fill', graphicAreaFill)
							.attr('d', area)
							.on('click', showCarbsValues);
				
				g.append('path').datum(data)
							.style('fill', 'none')
							.attr('stroke', accentColor2)
							.attr('d', line);
				
				g.selectAll('.carbsKeyPoint').data(data).enter().append('circle')
							.attr('class', 'carbsKeyPoint')
							.attr('cx', function(d, i) {return x(i)})
							.attr('cy', function(d) {return containerHeight - y(d.carbs);})
							.attr('r', 4)
							.attr('fill', 'none');
							
				g.selectAll('.carbsValue').data(data).enter().append('text')
							.style('font-size', fontTotoS)
							.attr('class', 'carbsValue')
							.attr('fill', 'none')
							.attr('text-anchor', function(d, i) {if (i == 0) return 'left'; return 'middle';})
							.attr('x', function(d, i) {return x(i) + (i == 0 ? 12 : 0)})
							.attr('y', function(d, i) {return containerHeight - y(d.carbs) + (i > 0 ? fontTotoS + 8: 0);})
							.text(function(d) {if (d.carbs == maxCarb || d.carbs == minCarb) return d3.format(',')(d.carbs.toFixed(0));})
			}
			
			/**
			 * Creates the area graph showing the fats
			 */
			var createFatsGraph = function(data) {

				var maxGraphHeight = 3 * containerHeight / 4;
				
				var x = d3.scaleLinear().range([0, containerWidth]);
				var y = d3.scaleLinear().range([0, maxGraphHeight]);
				
				x.domain([0, data.length - 1]);
				y.domain([0, d3.max(data, function(d) {return d3.max([d.proteins, d.carbs, d.fats]);})]);
				
				maxFat = d3.max(data, function(d, i) {if (i != data.length - 1) return d.fats});
				minFat = d3.min(data, function(d, i) {if (i != data.length - 1) return d.fats});
				
				var area = d3.area()
							.x(function(d, i) {return x(i);})
							.y0(containerHeight)
							.y1(function(d) {return containerHeight - y(d.fats);})
							.curve(d3.curveCardinal);
				
				var line = d3.line()
							.x(function(d, i) { return x(i);})
							.y(function(d) { return containerHeight - y(d.fats); })
							.curve(d3.curveCardinal);
				
				g.append('path').datum(data)
							.style('fill', graphicAreaFill)
							.attr('d', area)
							.on('click', showFatsValues);
				
				g.append('path').datum(data)
							.style('fill', 'none')
							.attr('stroke', accentColor)
							.attr('d', line);
				
				g.selectAll('.fatsKeyPoint').data(data).enter().append('circle')
							.attr('class', 'fatsKeyPoint')
							.attr('cx', function(d, i) {return x(i)})
							.attr('cy', function(d) {return containerHeight - y(d.fats);})
							.attr('r', 4)
							.attr('fill', 'none');
							
				g.selectAll('.fatsValue').data(data).enter().append('text')
							.style('font-size', fontTotoS)
							.attr('class', 'fatsValue')
							.attr('fill', 'none')
							.attr('text-anchor', function(d, i) {if (i == 0) return 'left'; return 'middle';})
							.attr('x', function(d, i) {return x(i) + (i == 0 ? 12 : 0)})
							.attr('y', function(d, i) {return containerHeight - y(d.fats) + (i > 0 ? fontTotoS + 8: 0);})
							.text(function(d) {if (d.fats == maxFat || d.fats == minFat) return d3.format(',')(d.fats.toFixed(0));})
			}
			
			/**
			 * Hide all macros values
			 */
			var hideAllValues = function() {
				
				g.selectAll('.proteinsKeyPoint').attr('fill', 'none');
				g.selectAll('.proteinsValue').attr('fill', 'none');
				
				g.selectAll('.carbsKeyPoint').attr('fill', 'none');
				g.selectAll('.carbsValue').attr('fill', 'none');
				
				g.selectAll('.fatsKeyPoint').attr('fill', 'none');
				g.selectAll('.fatsValue').attr('fill', 'none');
				
				g.selectAll('.caloriesValue').attr('fill', 'none');
				g.selectAll('.calDates').attr('fill', 'none');
			}
			
			/**
			 * Show the values for the protein intake
			 */
			var showProteinValues = function() {
				
				hideAllValues();
				
				g.selectAll('.proteinsKeyPoint').attr('fill', function(d) {if (d.proteins == maxProtein || d.proteins == minProtein) return accentColor; return 'none'});
				g.selectAll('.proteinsValue').attr('fill', function(d) {if (d.proteins == maxProtein || d.proteins == minProtein) return accentColor; return 'none'});
				
			}
			
			/**
			 * Show the values for the Carbs intake
			 */
			var showCarbsValues = function() {

				hideAllValues();
				
				g.selectAll('.carbsKeyPoint').attr('fill', function(d) {if (d.carbs == maxCarb || d.carbs == minCarb) return accentColor; return 'none'});
				g.selectAll('.carbsValue').attr('fill', function(d) {if (d.carbs == maxCarb || d.carbs == minCarb) return accentColor; return 'none'});
				
			}
			
			/**
			 * Show the values for the Carbs intake
			 */
			var showFatsValues = function() {
				
				hideAllValues();
				
				g.selectAll('.fatsKeyPoint').attr('fill', function(d) {if (d.fats == maxFat || d.fats == minFat) return accentColor; return 'none'});
				g.selectAll('.fatsValue').attr('fill', function(d) {if (d.fats == maxFat || d.fats == minFat) return accentColor; return 'none'});
				
			}
			
			/**
			 * Show the values for the Carbs intake
			 */
			var showCaloriesValues = function() {
				
				hideAllValues();
				
				g.selectAll('.caloriesValue').attr('fill', function(d) {if (d.calories == maxCalorie || d.calories == minCalorie) return accentColor; return 'none'});
				g.selectAll('.calDates').attr('fill', accentColor);
				
			}
			
			scope.getMeals();
			
		}
	}
});

/**
 * Daily Meals graphic 
 * 
 * Shows the meals of the day as a GRAPH with the timeline on the x axis and bars. 
 * Each bar represent a meal on a specific time of the day. 
 * Each bar divides the different macronutrients of the meal.
 * 
 * diet-daily-meals
 * 
 * Params: 
 * 
 */
dietDirectivesModule.directive('dietDailyMeals', ['DietService', '$timeout', '$rootScope', function(DietService, $timeout, $rootScope) {
	
	return {
		scope: {
			
		},
		link: function(scope, el) {
			
			el[0].classList.add('layout-column');
			el[0].classList.add('flex');
			
			// Some configuration
			var minRangeLowestHour = 9;
			var minRangeHighestHour = 21;
			
			/**
			 * Retrieves the meals 
			 */
			scope.getMeals = function() {
				
				DietService.getMeals(moment().format('YYYYMMDD')).success(function(data) {
					
					scope.meals = data.meals;
					
					updateGraph();
					
				});
			}

			/**
			 * Generates the X Labels based on the data available in scope.meals
			 * 
			 * If no data is available it will return an array of hours going from minRangeLowestHour to minRangeHighestHour, 
			 * otherwise it will return an array of each hour going from the first meal to the last, 
			 * but the minimum range always present will be (minRangeLowestHour - minRangeHighestHour)
			 */
			var generateXLabels = function() {
				
				if (scope.meals == null || scope.meals.length == 0) return [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21];
				
				var minTime = d3.min(scope.meals, function(d) {return getTime(d.time);});
				var maxTime = d3.max(scope.meals, function(d) {return getTime(d.time);});

				var result = [];
				var x = d3.min([minRangeLowestHour, Math.floor(minTime)]);
				
				do {
					
					result.push(x);
					
					x++;
					
				} while (x <= d3.max([minRangeHighestHour, Math.ceil(maxTime)]));
				
				return result;
			}
			
			/**
			 * Build the basic graph
			 */
			var width, height;
			var svg, g;
			var x, y;
			
			scope.$watch(function() {return el[0].offsetHeight}, function(newValue, oldValue) {
				
				if (svg != null) svg.remove();
				
				width = el[0].offsetWidth;
				height = el[0].offsetHeight;
				
				svg = d3.select(el[0]).append('svg')
						.attr('width', width)
						.attr('height', height);
				
				g = svg.append('g');
				
				x = d3.scaleLinear().range([16, width - 16]);
				y = d3.scaleLinear().range([0, height - 24 - fontTotoS]);
				
				x.domain([9, 21]);
				
				g.selectAll('.hour').data(generateXLabels()).enter().append('text')
						.attr('class', 'hour')
						.attr('text-anchor', 'middle')
						.attr('x', function(d) {return x(d);})
						.attr('y', height - 9)
						.attr('font-size', fontTotoXS)
						.text(function(d) {if (d % 3 == 0) return d + ' h'; return ''});
				
				updateGraph();
			});
			
			/**
			 * Subscribe to 'dietMealAdded' event and update the graph when received
			 */
			TotoEventBus.subscribeToEvent('dietMealAdded', function(event) {
				
				scope.getMeals();
			});
			
			/**
			 * Updates the graph with the meals of the day
			 */
			var updateGraph = function() {
				
				if (scope.meals == null || scope.meals.length == 0) return;
				
				var minTime = d3.min([minRangeLowestHour, Math.floor(d3.min(scope.meals, function(d) {return getTime(d.time);}))]);
				var maxTime = d3.max([minRangeHighestHour, Math.ceil(d3.max(scope.meals, function(d) {return getTime(d.time);}))]);
				
				var circleR = 8;
				var circleStrokeWidth = 2;
				
				/**
				 * Setting the right Y domain values
				 */
				y.domain([0, d3.max([d3.max(scope.meals, function(d) {return d.calories;}), d3.max(scope.meals, function(d) {return d.fat*9 + d.proteins*4 + d.carbs*4;}) + 6 * (circleR + circleStrokeWidth)])]);
				x.domain([minTime, maxTime]);
				
				/**
				 * X labels
				 */
				var xLabels = generateXLabels();
				
				g.selectAll('.hour').remove();
				
				g.selectAll('.hour').data(xLabels).enter().append('text')
					.attr('class', 'hour')
					.attr('text-anchor', 'middle')
					.attr('x', function(d) {return x(d);})
					.attr('y', height - 9)
					.attr('font-size', fontTotoXS)
					.text(function(d) {if (d % 3 == 0) return d + ' h'; return ''});
				
				/**
				 * Calories bar
				 * and Calories text
				 */
				g.selectAll('.mealCal').data(scope.meals).enter().append('line')
					.attr('class', 'mealCal')
					.attr('x1', function(d) { timeValue = getTime(d.time); return x(timeValue); })
					.attr('x2', function(d) { timeValue = getTime(d.time); return x(timeValue); })
					.attr('y1', height)
					.attr('stroke-width', 3)
					.attr('stroke', graphicAreaFill)
					.attr('fill', graphicAreaFill)
					.attr('y2', height)
					.transition(300)
					.attr('y2', function(d) {return height - y(d.carbs * 4) - y(d.fat * 9) - y(d.proteins * 4) - 4*(circleR+circleStrokeWidth);});
				
				g.selectAll('.mealCal').data(scope.meals)
					.transition(300)
					.attr('x1', function(d) { timeValue = getTime(d.time); return x(timeValue);})
					.attr('x2', function(d) { timeValue = getTime(d.time); return x(timeValue);})
					.attr('y2', function(d) {return height - y(d.carbs * 4) - y(d.fat * 9) - y(d.proteins * 4) - 4*(circleR+circleStrokeWidth);});
				
				g.selectAll('.mealText').data(scope.meals).enter().append('text')
					.attr('class', 'mealText')
					.attr('text-anchor', 'middle')
					.attr('x', function(d) { timeValue = getTime(d.time); return x(timeValue); })
					.attr('fill', accentColor)
					.text(function(d) {return d3.format(',')(d.calories.toFixed(0));})
					.attr('y', height)
					.transition(300)
					.attr('y', function(d) {return height - y(d.carbs * 4) - y(d.fat * 9) - y(d.proteins * 4) - 4*(circleR+circleStrokeWidth) - 16;});
				
				g.selectAll('.mealText').data(scope.meals)
					.transition(300)
					.attr('x', function(d) { timeValue = getTime(d.time); return x(timeValue); })
					.attr('y', function(d) {return height - y(d.carbs * 4) - y(d.fat * 9) - y(d.proteins * 4) - 4*(circleR+circleStrokeWidth) - 16;});
				
				/**
				 * Proteins circle
				 */
				g.selectAll('.mealProt').data(scope.meals).enter().append('circle')
					.attr('class', 'mealProt')
					.attr('cx', function(d) { timeValue = getTime(d.time); return x(timeValue);})
					.attr('r', circleR)
					.attr('stroke-width', circleStrokeWidth)
					.attr('stroke', graphicAreaFill)
					.attr('fill', themeColor)
					.attr('cy', height)
					.transition(300)
					.attr('cy', function(d) {return height - y(d.proteins * 4);});
				
				g.selectAll('.mealProt').data(scope.meals)
					.transition(300)
					.attr('height', function(d) {return y(d.fat * 9);})
					.attr('cx', function(d) { timeValue = getTime(d.time); return x(timeValue); })
					.attr('cy', function(d) {return height - y(d.proteins * 4);});
				
				
				/**
				 * Fats circle
				 */
				g.selectAll('.mealFat').data(scope.meals).enter().append('circle')
					.attr('class', 'mealFat')
					.attr('cx', function(d) { timeValue = getTime(d.time); return x(timeValue);})
					.attr('r', circleR)
					.attr('stroke-width', circleStrokeWidth)
					.attr('stroke', accentColor)
					.attr('fill', themeColor)
					.attr('cy', height)
					.transition(300)
					.attr('cy', function(d) {return height - y(d.fat * 9) - y(d.proteins * 4) - 2*(circleR+circleStrokeWidth);});
				
				g.selectAll('.mealFat').data(scope.meals)
					.transition(300)
					.attr('height', function(d) {return y(d.fat * 9);})
					.attr('cx', function(d) { timeValue = getTime(d.time); return x(timeValue);})
					.attr('cy', function(d) {return height - y(d.fat * 9) - y(d.proteins * 4) - 2*(circleR+circleStrokeWidth);});
				
				
				/**
				 * Fats bar
				 */
				g.selectAll('.mealCarb').data(scope.meals).enter().append('circle')
					.attr('class', 'mealCarb')
					.attr('cx', function(d) { timeValue = getTime(d.time); return x(timeValue);})
					.attr('r', circleR)
					.attr('stroke-width', circleStrokeWidth)
					.attr('stroke', accentColor2)
					.attr('fill', themeColor)
					.attr('cy', height)
					.transition(300)
					.attr('cy', function(d) {return height - y(d.carbs * 4) - y(d.fat * 9) - y(d.proteins * 4) - 4*(circleR+circleStrokeWidth);});
				
				g.selectAll('.mealCarb').data(scope.meals)
					.attr('height', function(d) {return y(d.carbs * 4);})
					.transition(300)
					.attr('cx', function(d) { timeValue = getTime(d.time); return x(timeValue);})
					.attr('cy', function(d) {return height - y(d.carbs * 4) - y(d.fat * 9) - y(d.proteins * 4) - 4*(circleR+circleStrokeWidth);});
					
			}
			
			/**
			 * Returns the time as a float (e.g. 13:30 => 13,5) on the scale from 0 to 24
			 * 
			 * - time : the time as a string (e.g. "13:30")
			 */
			var getTime = function(time) {
				
				var hour = time.substring(0, time.indexOf(':'));
				var minutes = time.substring(time.indexOf(':') + 1);
				
				var fractionMinutes = parseInt(minutes) / 60;
				
				return parseInt(hour) + fractionMinutes;
			}
			
			scope.getMeals();
		}
	}
}]);

/**
 * Daily Meals Info
 * Shows the info about the meals of the day
 * 
 * diet-daily-meals-info
 * 
 * Params: 
 * 
 */
dietDirectivesModule.directive('dietDailyMealsInfo', ['DietService', '$timeout', '$rootScope', function(DietService, $timeout, $rootScope) {
	
	return {
		scope: {
			
		},
		templateUrl: 'modules/diet/directives/diet-daily-meals-info.html',
		link: function(scope, el) {
			
			/**
			 * Subscribe to 'dietMealAdded' event and update the data when received
			 */
			TotoEventBus.subscribeToEvent('dietMealAdded', function(event) {
				
				scope.getMeals();
			});
			
			/**
			 * Retrieves the meals 
			 */
			scope.getMeals = function() {
				
				DietService.getMeals(moment().format('YYYYMMDD')).success(function(data) {
					
					scope.meals = data.meals;
					scope.lastMeal = null;
					scope.calories = 0;
					
					if (data.meals.length == 0) return;
					
					/**
					 * Get the last meal info
					 */
					for (var i = 0; i < data.meals.length; i++) {

						if (scope.lastMeal == null) scope.lastMeal = data.meals[i];
						else if (getTime(scope.meals[i].time) >= getTime(scope.lastMeal.time)) scope.lastMeal = data.meals[i];
					}
					
					if (scope.lastMeal.time.substring(scope.lastMeal.time.indexOf(':') + 1).length == 1) scope.lastMeal.time += '0';
					
					/**
					 * Get the total calories 
					 */
					for (var i = 0; i < data.meals.length; i++) {
						scope.calories += data.meals[i].calories;
					}
					
				});
			}
			
			/**
			 * Function to add a new meal
			 */
			scope.addMeal = function() {
				
				DietService.showAddMealDialog(function(meal) {
					DietService.postMeal(meal).success(function(data) {
						
						TotoEventBus.publishEvent({name: 'dietMealAdded'});
					});
				});
				
			}
			
			/**
			 * Returns the time as a float (e.g. 13:30 => 13,5) on the scale from 0 to 24
			 * 
			 * - time : the time as a string (e.g. "13:30")
			 */
			var getTime = function(time) {
				
				var hour = time.substring(0, time.indexOf(':'));
				var minutes = time.substring(time.indexOf(':') + 1);
				
				var fractionMinutes = parseInt(minutes) / 60;
				
				return parseInt(hour) + fractionMinutes;
			}
			
			scope.getMeals();
		}
	}
}]);
