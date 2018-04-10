var dietDirectivesModule = angular.module('dietDirectivesModule', ['DietServiceModule']);

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
			
			var widget = el[0].parentNode;
			var component = el[0];
			var scale = 0.8;

			component.classList.add('layout-row');
			component.id = 'dietWater-' + Math.floor(Math.random() * 1000000);

			var barContainer = document.querySelector('#' + component.id + ' .bar-container');
			
			scope.totalAmount = 0;
			
			DietService.getWaterConsumptionGoal().success(function(data) {
				
				scope.goal = data;
				
				DietService.getWaterConsumption().success(function(data) {
					
					scope.total = [data.total];
					scope.totalAmount = data.total / 1000;
					scope.goalReached = data.total >= scope.goal.amount;
					
					var width = barContainer.offsetWidth;
					var height = barContainer.offsetHeight;
					
					svg = d3.select('#' + component.id + ' .bar-container').append('svg')
						.attr('width', width)
						.attr('height', height)
						.on('click', function() {
							
							DietService.showAddWaterConsumptionDialog(function(amount) {
								
								DietService.postWaterConsumption(amount).success(function() {
									scope.total[0] += amount;
									scope.totalAmount += amount / 1000;
									scope.goalReached = total[0] >= scope.goal.amount;
									
									g.selectAll('.water').data(scope.total)
										.transition()
										.duration(500)
										.attr('fill', function(d) {if (d >= scope.goal.amount) return '#9CCC65'; return '#B2EBF2';})
										.attr('width', function(d) {if (d >= scope.goal.amount) return width - 6; return (d / scope.goal.amount) * width})
										
									
								});
							})
							
						})
					
					g = svg.append('g');
					
					g.selectAll('.water').data(scope.total).enter().append('rect')
						.attr('class', 'water')
						.attr('height', 26)
						.attr('rx', 2)
						.attr('ry', 2)
						.attr('x', 1)
						.attr('y', 1)
						.attr('fill', function(d) {if (d >= scope.goal.amount) return '#9CCC65'; return '#B2EBF2';})
						.attr('width', 0)
						.transition()
						.duration(500)
						.attr('width', function(d) {if (d >= scope.goal.amount) return width - 6; return (d / scope.goal.amount) * width})
						
				});
			});

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
 */
dietDirectivesModule.directive('dietFoods', ['DietService', '$timeout', function(DietService, $timeout) {
	
	return {
		scope: {
			onSelect: '=', 
			hideAdd: '@'
		},
		templateUrl: 'modules/diet/directives/diet-foods.html',
		link: function(scope, el) {
			
			scope.foods = [];
			
			DietService.getFoods().success(function(data) {
				
				scope.foods = data.foods;
				
				for (var i = 0; i < scope.foods.length; i++) {
					scope.foods.showOptions = false;
				}
				
			});
			
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
		},
		templateUrl: 'modules/diet/directives/diet-week-macronutrients.html',
		link: function(scope, el) {
			
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