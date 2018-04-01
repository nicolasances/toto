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
		link: function(scope, el) {

			var widget = el[0].parentNode;
			var component = el[0];
			var scale = 0.8;
			
			component.id = 'dietWater-' + Math.floor(Math.random() * 1000000);
			
			DietService.getWaterConsumptionGoal().success(function(data) {
				
				scope.goal = data;
				
				DietService.getWaterConsumption().success(function(data) {
					
					scope.total = [data.total];
					
					var width = widget.offsetWidth * scale;
					var height = widget.offsetHeight * scale;
					component.style.width = width + 'px';
					component.style.height = height + 'px';
					component.style.marginLeft = (widget.offsetWidth - 18 - width) / 2 + 'px';
					component.style.marginTop = (widget.offsetHeight - 18 - height) / 2 + 'px';
					
					svg = d3.select('#' + component.id).append('svg')
						.attr('width', width)
						.attr('height', height)
						.on('click', function() {
							
							DietService.showAddWaterConsumptionDialog(function(amount) {
								
								DietService.postWaterConsumption(amount).success(function() {
									scope.total[0] += amount;
									
									g.selectAll('.water').data(scope.total)
										.transition()
										.duration(500)
										.attr('fill', function(d) {if (d >= scope.goal.amount) return '#4CAF50'; return '#64B5F6';})
										.attr('y', function(d) {if (d >= scope.goal.amount) return 4; return height - (d / scope.goal.amount) * height - 4})
										.attr('height', function(d) {if (d >= scope.goal.amount) return height - 8; return (d / scope.goal.amount) * height})
										
									g.selectAll('.text').data(scope.total)
										.html(function(d) {return (d / 1000).toFixed(2) + '&#8467;'})
									
								});
							})
							
						})
					
					g = svg.append('g');
					
					g.append('rect')
						.attr('width', 48)
						.attr('height', height)
						.attr('rx', 8)
						.attr('ry', 8)
						.attr('fill', 'white')
						.attr('stroke', '#E3F2FD')
						.attr('stroke-width', 2)
					
					g.selectAll('.water').data(scope.total).enter().append('rect')
						.attr('class', 'water')
						.attr('width', 40)
						.attr('rx', 4)
						.attr('ry', 4)
						.attr('x', 4)
						.attr('y', height - 4)
						.attr('fill', function(d) {if (d >= scope.goal.amount) return '#4CAF50'; return '#64B5F6';})
						.attr('height', 0)
						.transition()
						.duration(500)
						.attr('y', function(d) {if (d >= scope.goal.amount) return 4; return height - (d / scope.goal.amount) * height - 4})
						.attr('height', function(d) {if (d >= scope.goal.amount) return height - 8; return (d / scope.goal.amount) * height})
						
					g.selectAll('.text').data(scope.total).enter().append('text')
						.attr('class', 'text')
						.attr('text-anchor', 'middle')
						.attr('x', 48 + (width - 48) / 2)
						.attr('y', height / 2)
						.attr('font-size', '1.8em')
						.attr('fill', 'rgba(0,0,0,0.7)')
						.html(function(d) {return (d / 1000).toFixed(2) + ' &#8467;'})
					
				});
			});

		}
	}
}]);

/**
 * Shows the list of foods (master data) that have been recorded
 */
dietDirectivesModule.directive('dietFoods', ['DietService', '$timeout', function(DietService, $timeout) {
	
	return {
		scope: {
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