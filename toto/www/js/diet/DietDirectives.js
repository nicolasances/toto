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