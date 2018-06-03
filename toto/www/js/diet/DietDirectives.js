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
 * Shows the stats of the day in terms of meals and nutrients
 * 
 * diet-daily-meal-graph
 * 
 * Params: 
 * 
 */
dietDirectivesModule.directive('dietDailyMealGraph', ['DietService', '$timeout', function(DietService, $timeout) {
	
	return {
		scope: {
		},
		link: function(scope, el) {

			var widget = el[0].parentNode;
			var component = el[0];
			var scale = 0.8;
			var circleScale = 0.8;
			
			component.id = 'dietDailyMealGraph-' + Math.floor(Math.random() * 1000000);
			
			DietService.getMeals(moment().format('YYYYMMDD')).success(function(data) {
				
				scope.goal = data;
				
				var width = widget.offsetWidth * scale;
				var height = widget.offsetHeight * scale;
				var circleR = (width > height ? height / 2 : width / 2) * circleScale - 6;
				var mealsCircleR = (width > height ? height / 2 : width / 2) * circleScale / 2.5 - 6;
				component.style.width = width + 'px';
				component.style.height = height + 'px';
				component.style.marginLeft = (widget.offsetWidth - 18 - width) / 2 + 'px';
				component.style.marginTop = (widget.offsetHeight - 18 - height) / 2 + 'px';
				
				svg = d3.select('#' + component.id).append('svg')
					.attr('width', width)
					.attr('height', height)
				
				g = svg.append('g');
				
				// Outer circle
//				g.append('circle')
//					.attr('cx', width / 2)
//					.attr('cy', height / 2)
//					.attr('r', circleR)
//					.attr('fill', 'white')
//					.attr('stroke', '#efefef')
//					.attr('stroke-width', 2);
					
				// Put the different times in a 0-360 scale where 0:00 is 0 and 24:00 is 360
//				var spotsData = [];
//				for (var i = 0; i < data.meals.length; i++) {
//					spotsData.push({angle: parseInt(data.meals[i].time.substring(0, data.meals[i].time.indexOf(':'))) * 360 / 24, calories: data.meals[i].calories}); 
//				}
				
				var alimentCircleR = width / 6;
				var alimentCircleStroke = 12;
				
				g.append('circle')
					.attr('cx', alimentCircleR + alimentCircleStroke)
					.attr('cy', height / 2)
					.attr('r', alimentCircleR)
					.attr('fill', 'white')
					.attr('stroke', '#26C6DA')
					.attr('stroke-width', alimentCircleStroke);
				
				g.append('circle')
					.attr('cx', alimentCircleR + alimentCircleStroke + width / 6)
					.attr('cy', height / 2)
					.attr('r', alimentCircleR)
					.attr('fill', 'white')
					.attr('stroke', '#009688')
					.attr('stroke-width', alimentCircleStroke);
				
				g.append('circle')
					.attr('cx', alimentCircleR + alimentCircleStroke + width / 3)
					.attr('cy', height / 2)
					.attr('r', alimentCircleR)
					.attr('fill', 'white')
					.attr('stroke', '#EF5350')
					.attr('stroke-width', alimentCircleStroke);
				
			});

		}
	}
}]);

/**
 * Shows the stats for the week macro nutrients
 * 
 * diet-week-macronutrients
 * 
 * Params: 
 * 
 */
dietDirectivesModule.directive('dietWeekMacronutrients', ['DietService', '$timeout', '$rootScope', function(DietService, $timeout, $rootScope) {
	
	return {
		scope: {
			onRefresh: '='
		},
		templateUrl: 'modules/diet/directives/diet-week-macronutrients.html',
		link: function(scope, el) {
			
			scope.onRefresh = function() {
				console.log('asd');
				scope.getMeals();
			}
			
			scope.go = $rootScope.go;
			
			var widget = el[0].parentNode;
			var component = el[0];
			
			component.classList.add('layout-column');
			component.classList.add('flex');
			component.id = 'dietWeekMacronutrients-' + Math.floor(Math.random() * 1000000);
			
			scope.showMenu = false;
			
			scope.cal = 0;
			scope.carbs = 0;
			scope.proteins = 0;
			scope.fats = 0;
			
			/**
			 * Retrieves the meals 
			 */
			scope.getMeals = function() {
				
				DietService.getMeals(moment().format('YYYYMMDD')).success(function(data) {
					
					scope.cal = 0;
					scope.carbs = 0;
					scope.proteins = 0;
					scope.fats = 0;
					
					if (data == null) return;
					
					for (var i = 0; i < data.meals.length; i++) {
						
						scope.cal += data.meals[i].calories;
						scope.carbs += data.meals[i].carbs;
						scope.fats += data.meals[i].fat;
						scope.proteins += data.meals[i].proteins;
					}
					
				});
			}
			
			/**
			 * Add a new meal
			 */
			scope.addMeal = function() {
				
				DietService.showAddMealDialog(function(meal) {DietService.postMeal(meal).success(scope.getMeals)});
			}
			
			scope.getMeals();
		}
	}
}]);

/**
 *
 * Shows the stats for the week macro nutrients
 * 
 * diet-week-macronutrients
 * 
 * Params: 
 * 
 */
dietDirectivesModule.directive('dietWeekMacronutrients', ['DietService', '$timeout', '$rootScope', function(DietService, $timeout, $rootScope) {
	
	return {
		scope: {
			onRefresh: '='
		},
		templateUrl: 'modules/diet/directives/diet-week-macronutrients.html',
		link: function(scope, el) {
			
			scope.onRefresh = function() {
				console.log('asd');
				scope.getMeals();
			}
			
			scope.go = $rootScope.go;
			
			var widget = el[0].parentNode;
			var component = el[0];
			
			component.classList.add('layout-column');
			component.classList.add('flex');
			component.id = 'dietWeekMacronutrients-' + Math.floor(Math.random() * 1000000);
			
			scope.showMenu = false;
			
			scope.cal = 0;
			scope.carbs = 0;
			scope.proteins = 0;
			scope.fats = 0;
			
			/**
			 * Retrieves the meals 
			 */
			scope.getMeals = function() {
				
				DietService.getMeals(moment().format('YYYYMMDD')).success(function(data) {
					
					scope.cal = 0;
					scope.carbs = 0;
					scope.proteins = 0;
					scope.fats = 0;
					
					if (data == null) return;
					
					for (var i = 0; i < data.meals.length; i++) {
						
						scope.cal += data.meals[i].calories;
						scope.carbs += data.meals[i].carbs;
						scope.fats += data.meals[i].fat;
						scope.proteins += data.meals[i].proteins;
					}
					
				});
			}
			
			/**
			 * Add a new meal
			 */
			scope.addMeal = function() {
				
				DietService.showAddMealDialog(function(meal) {DietService.postMeal(meal).success(scope.getMeals)});
			}
			
			scope.getMeals();
		}
	}
}]);

/**
 * Daily Macros
 * Shows the macros consumed so far during the day
 * 
 * diet-daily-macros
 * 
 * Params: 
 * 
 */
dietDirectivesModule.directive('dietDailyMacros', ['DietService', '$timeout', '$rootScope', function(DietService, $timeout, $rootScope) {
	
	return {
		scope: {
		},
		templateUrl: 'modules/diet/directives/diet-daily-macros.html',
		link: function(scope, el) {

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
dietDirectivesModule.directive('dietMacrosStats', ['DietService', '$timeout', '$rootScope', function(DietService, $timeout, $rootScope) {
	
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
			
			$timeout(function() {
				
				containerWidth = el[0].offsetWidth;
				containerHeight = el[0].offsetHeight;
				
				svg = d3.select(el[0]).append('svg')
						.attr('width', containerWidth)
						.attr('height', containerHeight);
				
				g = svg.append('g');
				
			}, 500);
			
			/**
			 * Retrieves the meals for the specified period of time
			 */
			DietService.getMeals(null, dateFrom).success(function(data) {
				
				// Get the data in the right format
				for (var i = 0; i < data.meals.length; i++) {

					var stat = mealsStats.get(data.meals[i].date);
					
					if (stat == null) mealsStats.set(data.meals[i].date, {date: data.meals[i].date, calories: data.meals[i].calories, proteins: data.meals[i].proteins, carbs: data.meals[i].carbs, fats: data.meals[i].fat});
					else {
						stat.calories += data.meals[i].calories;
						stat.proteins += data.meals[i].proteins;
						stat.carbs += data.meals[i].carbs;
						stat.fats += data.meals[i].fat;
					}
				}
				
				// Draw the graph
				createNutritionGraph(mealsStats);
				
			});
			
			/**
			 * Creates the graph
			 */
			var createNutritionGraph = function(stats) {
				
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
				var y = d3.scaleLinear().range([containerHeight / 2, containerHeight]);
				
				x.domain(data.map(function(d) {return d.date;}));
				y.domain([0, d3.max(data, function(d) {return d.calories;})]);
				
				g.selectAll('.calBars').data(data).enter().append('rect')
						.style('fill', graphicAreaFill)
						.attr('class', 'calBars')
						.attr('x', function(d) {return x(d.date);})
						.attr('width', x.bandwidth())
						.attr('y', function(d) {return containerHeight - y(d.calories);})
						.attr('height', function(d) {return y(d.calories); });
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
							.attr('d', area);
				
				g.append('path').datum(data)
							.style('fill', 'none')
							.attr('stroke', '#00BCD4')
							.attr('d', line);
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
							.attr('d', area);
				
				g.append('path').datum(data)
							.style('fill', 'none')
							.attr('stroke', '#F44336')
							.attr('d', line);
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
							.attr('d', area);
				
				g.append('path').datum(data)
							.style('fill', 'none')
							.attr('stroke', accentColor)
							.attr('d', line);
			}
			
		}
	}
}]);