var dietServiceModule = angular.module('DietServiceModule', []);

dietServiceModule.factory('DietService', [ '$http', '$rootScope', '$location', '$mdDialog', '$timeout', function($http, $rootScope, $location, $mdDialog, $timeout) {

	return {

		/**
		 * Shows the water consumption dialog 
		 * 
		 * Requires: 
		 * 
		 *  - creationCallback	:	the callback to be called when the user picked a choice.
		 *  						it's a function(amount)
		 *  						amount will be an integer (250, 500, 750, ...)
		 */
		showAddWaterConsumptionDialog : function(creationCallback) {

			function DialogController($scope, $mdDialog) {
				
				$scope.hide = function() {$mdDialog.hide;};
				$scope.cancel = function() {$mdDialog.cancel();};
				$scope.answer = function(amount) {$mdDialog.hide(amount);};
				
				$scope.types = [
				                {amount: 250, svg: 'images/svg/water-glass.svg'},
				                {amount: 500, svg: 'images/svg/small-water-bottle.svg'},
				                {amount: 750, svg: 'images/svg/big-water-bottle.svg'}
				                ];
				
			}
			
			var useFullScreen = false;
			var dialog = {controller: DialogController, templateUrl: 'modules/diet/dlgAddWaterConsumption.html', parent: angular.element(document.body), clickOutsideToClose: true, fullscreen: useFullScreen};
			
			$mdDialog.show(dialog).then(function(answer) {
				
				creationCallback(answer);
				
			}, function() {});			
		
		}, 

		/**
		 * Shows the water consumption goal dialog 
		 * 
		 * Requires: 
		 * 
		 *  - confirmationCallback	:	the callback to be called when the user changed the goal
		 *  							it's a function(amount)
		 *  							amount will be an integer (250, 500, 750, ...)
		 */
		showChangeWaterConsumptionGoalDialog : function(confirmationCallback) {

			function DialogController($scope, $mdDialog) {
				
				$scope.hide = function() {$mdDialog.hide;};
				$scope.cancel = function() {$mdDialog.cancel();};
				$scope.answer = function(goal) {$mdDialog.hide(goal);};
				
			}
			
			var useFullScreen = false;
			var dialog = {controller: DialogController, templateUrl: 'modules/diet/dlgChangeWaterConsumptionGoal.html', parent: angular.element(document.body), clickOutsideToClose: true, fullscreen: useFullScreen};
			
			$mdDialog.show(dialog).then(function(answer) {
				
				confirmationCallback(answer);
				
			}, function() {});			
		
		}, 

		/**
		 * Shows the create food dialog 
		 * 
		 * Requires: 
		 * 
		 *  - creationCallback	:	the callback to be called when the user created the object
		 *  						it's a function(food)
		 *  						food will be an object 
		 *  						{name: string, calories: float, fat: float, carbs: float, sugars: float, proteins: float}
		 */
		showAddFoodDialog : function(creationCallback) {

			function DialogController($scope, $mdDialog) {
				
				$scope.food = {};
				
				$scope.hide = function() {$mdDialog.hide;};
				$scope.cancel = function() {$mdDialog.cancel();};
				$scope.answer = function(food) {$mdDialog.hide(food);};
				
				$scope.steps = [1,2];
				$scope.currentStep = 1;
				$scope.nextStep = function () {$scope.currentStep++;}
				
				$scope.categories = [
				                     {id: 'meat', description: 'Meat', selected: false},
				                     {id: 'fish', description: 'Fish', selected: false},
				                     {id: 'vegetables', description: 'Vegetables', selected: false},
				                     {id: 'fruits', description: 'Fruits', selected: false},
				                     {id: 'dairy', description: 'Dairy', selected: false},
				                     {id: 'smoothie', description: 'Smoothie', selected: false},
				                     {id: 'drinks', description: 'Drinks', selected: false},
				                     {id: 'fastfood', description: 'Fast Food', selected: false}
				                     ];

				$scope.selectCategory = function(category) {
					$scope.clearCategoriesSelection();
					category.selected = true;
					$scope.food.category = category.id;
					
					$scope.answer($scope.food);
				}
				$scope.clearCategoriesSelection = function() {for (i=0;i<$scope.categories.length; i++) $scope.categories[i].selected = false;}
				
			}
			
			var useFullScreen = window.matchMedia( "(max-width: 960px)" ).matches;
			var dialog = {controller: DialogController, templateUrl: 'modules/diet/dlgAddFood.html', parent: angular.element(document.body), clickOutsideToClose: true, fullscreen: useFullScreen};
			
			$mdDialog.show(dialog).then(function(answer) {
				
				creationCallback(answer);
				
			}, function() {});			
		
		}, 

		/**
		 * Shows the create meal dialog 
		 * 
		 * Requires: 
		 * 
		 *  - creationCallback	:	the callback to be called when the user created the object
		 *  						it's a function(meal)
		 *  						meal will be an object as required by the postMeal method 
		 */
		showAddMealDialog : function(creationCallback) {

			function DialogController($scope, $mdDialog) {
				
				$scope.meal = {proteins: 0, sugars: 0, calories: 0, fat: 0, carbs: 0, aliments: []};
				$scope.model = {};
				$scope.hideAll = false;
				$scope.showAliments = false;
				$scope.showAmount = false;
				
				$scope.hide = function() {$mdDialog.hide;};
				$scope.cancel = function() {$mdDialog.cancel();};
				$scope.answer = function(meal) {
					
					meal.time = $scope.selectedHour + ':' + $scope.selectedMinute;
					
					if (meal.date == null) meal.date = moment().format('YYYYMMDD');
					else meal.date = moment(meal.date).format('YYYYMMDD');
					
					console.log(meal);
					$mdDialog.hide(meal);
				};
				
				$scope.steps = [1,2];
				$scope.currentStep = 1;
				$scope.nextStep = function () {$scope.currentStep++;}
				
				$scope.addAliment = function() {
					$scope.showAliments = true;
					$scope.hideAll = true;
					$scope.newFoodUnit = null;
					$scope.model = {};
				}
				
				$scope.selectFood = function(food) {
					$scope.newFood = food;
					$scope.showAliments = false;
					$scope.showAmountUnit = true;
				}
				
				$scope.selectUnit = function(unit) {
					$scope.newFoodUnit = unit;
					$scope.showAmountUnit = false;
					$scope.showAmount = true;
				}
				
				$scope.selectAmount = function(amount) {
					
					if ($scope.newFoodUnit == 'gr') $scope.newFood.amountGr = parseFloat(amount);
					else if ($scope.newFoodUnit == 'ml') $scope.newFood.amountMl = parseFloat(amount);
					else $scope.newFood.amount = parseFloat(amount);
					
					$scope.confirmAliment();
					
				}
				
				$scope.confirmAliment = function() {
					
					$scope.hideAll = false;
					$scope.showAmount = false;
					
					// Add aliment
					$scope.meal.aliments.push($scope.newFood);
					
					// Recalculate totals
					var prot = 0;
					var cal = 0;
					var fat = 0; 
					var carbs = 0;
					var sugars = 0;
					
					if ($scope.newFoodUnit == 'gr') {
						prot = $scope.newFood.proteins * $scope.newFood.amountGr / 100;
						cal = $scope.newFood.calories * $scope.newFood.amountGr / 100;
						fat = $scope.newFood.fat * $scope.newFood.amountGr / 100;
						carbs = $scope.newFood.carbs * $scope.newFood.amountGr / 100;
						sugars = $scope.newFood.sugars * $scope.newFood.amountGr / 100;
					}
					else if ($scope.newFoodUnit == 'ml') {
						prot = $scope.newFood.proteins * $scope.newFood.amountMl / 100;
						cal = $scope.newFood.calories * $scope.newFood.amountMl / 100;
						fat = $scope.newFood.fat * $scope.newFood.amountMl / 100;
						carbs = $scope.newFood.carbs * $scope.newFood.amountMl / 100;
						sugars = $scope.newFood.sugars * $scope.newFood.amountMl / 100;
					}
					else {
						prot = $scope.newFood.proteins * $scope.newFood.amount;
						cal = $scope.newFood.calories * $scope.newFood.amount;
						fat = $scope.newFood.fat * $scope.newFood.amount;
						carbs = $scope.newFood.carbs * $scope.newFood.amount;
						sugars = $scope.newFood.sugars * $scope.newFood.amount;
					}
					
					$scope.meal.proteins += prot;
					$scope.meal.calories += cal;
					$scope.meal.fat += fat;
					$scope.meal.carbs += carbs;
					$scope.meal.sugars += sugars;
					
				}
				
				$scope.clearCategoriesSelection = function() {for (i=0;i<$scope.categories.length; i++) $scope.categories[i].selected = false;}
				
				/**
				 * Build the clock
				 */
				$timeout(function() {
					
					var clockContainer = document.querySelector('#clock');
					var dialogContainer = document.querySelector('md-dialog');
					var clockR = clockContainer.offsetWidth / 2 - 24
					var selectedTimeDisplay = document.querySelector('.toto-form #selectedTimeDisplay');
					
					selectedTimeDisplay.style.textAlign = 'center';
					
					svg = d3.select('#clock').append('svg')
								.attr('height', 2 * clockR + 72)
								.attr('width', clockContainer.offsetWidth);
					
					g = svg.append('g');
					
					g.append('circle')
						.attr('cx', clockContainer.offsetWidth / 2)
						.attr('cy', clockR + 40)
						.attr('r', clockR)
						.attr('fill', 'transparent')
						.attr('stroke-width', '6')
						.attr('stroke', '#B2EBF2');
					
					g.append('circle')
						.attr('cx', clockContainer.offsetWidth / 2)
						.attr('cy', clockR + 40)
						.attr('r', 12)
						.attr('fill', '#B2EBF2');
					
					var smallAngles = [];
					for (var i = 0; i < 360; i++) {
						if (i % 5 == 0) smallAngles.push(i);
					}
					
					var selectedTimes = [];
					var angles = [];
					var v = parseInt(moment().format('H')) > 12 ? 15 : 3;
					var m = 15;
					for (var i = 0; i < 360; i+=30) {
						angles.push({
							angle: i,
							time: v,
							hour: v++,
							minute: m,
							cardinal: i == 0 || i == 90 || i == 180 || i == 270
						});
						
						if (v > 23) v = 12;
						m += 5;
						if (m > 55) m = 0;
					}
					
					$scope.selectedHour = null;
					$scope.selectedMinute = null;
					
					/**
					 * Select a time. 
					 * Can be the selection of the hour or the selection of the minute.
					 */
					var selectTime = function(time) {
						
						/**
						 * Switch the clock labels from hour to minutes or vice-versa
						 */
						switchClock();
						
						/**
						 * If both hour and minute have been selected, reset because 
						 * it's a new selection
						 */
						if (selectedTimes.length == 2) {
							selectedTimes = [];
							
							$scope.selectedHour = null;
							$scope.selectedMinute = null;
						}
						
						g.selectAll('.selectedTimes').data(selectedTimes).exit().remove();
						g.selectAll('.selectedTimeDisplay').data(selectedTimes).exit().remove();
						
						/**
						 * Add the time to the selected times
						 */
						selectedTimes.push(time);
						
						/**
						 * Create the bars for selected hour and select minute
						 */
						g.selectAll('.selectedTimes').data(selectedTimes).enter().append('line')
							.attr('class', 'selectedTimes')
							.attr('x1', function(d) {
								if (d.selection == 'hour') return clockContainer.offsetWidth / 2 + (clockR / 2) * Math.cos(d.angle * Math.PI / 180);
								return clockContainer.offsetWidth / 2 + clockR * Math.cos(d.angle * Math.PI / 180);
							})
							.attr('y1', function(d) {
								if (d.selection == 'hour') return clockR + 40 + (clockR / 2) * Math.sin(d.angle * Math.PI / 180); 
								return clockR + 40 + clockR * Math.sin(d.angle * Math.PI / 180);
							})
							.attr('x2', function(d) {
								if (d.selection == 'hour') return clockContainer.offsetWidth / 2 - 20 * Math.cos(d.angle * Math.PI / 180);
								return clockContainer.offsetWidth / 2 - 30 * Math.cos(d.angle * Math.PI / 180);;
							})
							.attr('y2', function(d) {
								if (d.selection == 'hour') return clockR + 40 - 20 * Math.sin(d.angle * Math.PI / 180);
								return clockR + 40 - 30 * Math.sin(d.angle * Math.PI / 180);
							})
							.attr('stroke-width', function(d) {return (d.selection == 'hour') ? 3 : 1;})
							.attr('stroke', '#B2EBF2');
						
						/**
						 * Set the currently selected time
						 */
						if ($scope.selectedHour == null) $scope.selectedHour = time.hour;
						else $scope.selectedMinute = time.minute;
						
						/**
						 * Display the time
						 */
						if ($scope.selectedHour == null) selectedTimeDisplay.innerHTML = '00:00';
						else if ($scope.selectedHour != null && $scope.selectedMinute == null) selectedTimeDisplay.innerHTML = $scope.selectedHour + ':00';
						else selectedTimeDisplay.innerHTML = $scope.selectedHour + ':' + ($scope.selectedMinute < 10 ? '0' + $scope.selectedMinute : $scope.selectedMinute);
						
						/**
						 * Go to the next step
						 */
						if ($scope.selectedHour != null && $scope.selectedMinute != null) $timeout($scope.nextStep, 800);
						
					}

					/**
					 * Switches the clock labels from hours to minutes and vice-versa
					 */
					var switchClock = function() {
						
						for (var i = 0; i < angles.length; i++) {
							if (angles[i].selection == null || angles[i].selection == 'minute') angles[i].selection = 'hour';
							else angles[i].selection = 'minute';
							
							angles[i].time = angles[i].selection == 'hour' ? angles[i].minute : angles[i].hour;
						}
						
						g.selectAll('.clockTickText').data(angles).text(function(d) {return d.time;});
					}
					
					/**
					 * Main clock ticks (the four cardinal points)
					 */
					g.selectAll('.clockTick').data(angles).enter().append('line')
						.attr('class', 'clockTick')
						.attr('x1', function(d) {return clockContainer.offsetWidth / 2 + clockR * Math.cos(d.angle * Math.PI / 180);})
						.attr('y1', function(d) {return clockR + 40 + clockR * Math.sin(d.angle * Math.PI / 180);})
						.attr('x2', function(d) {return clockContainer.offsetWidth / 2 + (clockR - (d.cardinal ? 30 : 20)) * Math.cos(d.angle * Math.PI / 180);})
						.attr('y2', function(d) {return clockR + 40 + (clockR - (d.cardinal ? 30 : 20)) * Math.sin(d.angle * Math.PI / 180);})
						.attr('stroke-width', function(d) {return d.cardinal ? 4 : 2;})
						.attr('stroke', '#B2EBF2')
						.on('click', selectTime);
					
					/**
					 * Smallest tickes for the "every min" kinda tick
					 */
					g.selectAll('.clockTickSm').data(smallAngles).enter().append('line')
						.attr('class', 'clockTickSm')
						.attr('x1', function(d) {return clockContainer.offsetWidth / 2 + clockR * Math.cos(d * Math.PI / 180);})
						.attr('y1', function(d) {return clockR + 40 + clockR * Math.sin(d * Math.PI / 180);})
						.attr('x2', function(d) {return clockContainer.offsetWidth / 2 + (clockR - 15) * Math.cos(d * Math.PI / 180);})
						.attr('y2', function(d) {return clockR + 40 + (clockR - 15) * Math.sin(d * Math.PI / 180);})
						.attr('stroke-width', function(d) {return 1;})
						.attr('stroke', '#B2EBF2');
					
					/**
					 * Text for each hour or 5 min
					 */
					g.selectAll('.clockTickText').data(angles).enter().append('text')
						.attr('class', 'clockTickText')	
						.attr('x', function(d) {return clockContainer.offsetWidth / 2 + (clockR - (d.cardinal ? 50 : 40)) * Math.cos(d.angle * Math.PI / 180);})
						.attr('y', function(d) {return clockR + 40 + (clockR - (d.cardinal ? 50 : 40)) * Math.sin(d.angle * Math.PI / 180);})
						.attr('fill', '#B2EBF2')
						.attr('text-anchor', 'middle')
						.attr('alignment-baseline', 'mathematical')
						.text(function(d) {return d.time;})
						.on('click', selectTime);
					
					g.selectAll('.selectedTimes').data(selectedTimes).enter().append('line')
						.attr('class', 'selectedTimes')
						.attr('x1', function(d) {return clockContainer.offsetWidth / 2 + clockR * Math.cos(d * Math.PI / 180);})
						.attr('y1', function(d) {return clockR + 40 + clockR * Math.sin(d * Math.PI / 180);})
						.attr('x2', function(d) {return clockContainer.offsetWidth / 2;})
						.attr('y2', function(d) {return clockR + 40;})
						.attr('stroke-width', function(d) {return 1;})
						.attr('stroke', '#B2EBF2');
					
					
				}, 100);
				
			}
			
			var useFullScreen = window.matchMedia( "(max-width: 960px)" ).matches;
			var dialog = {controller: DialogController, templateUrl: 'modules/diet/dlgAddMeal.html', parent: angular.element(document.body), clickOutsideToClose: true, fullscreen: useFullScreen};
			
			$mdDialog.show(dialog).then(function(answer) {
				
				creationCallback(answer);
				
			}, function() {});			
		
		}, 

		
		/**
		 * Posts a water consumption amount. Use this when you want to notify Toto that you consumed some water.
		 */
		postWaterConsumption : function(amount) {
			
			return $http.post(microservicesProtocol + "://" + microservicesUrl + "/diet/water", {amount: amount});
		}, 
		
		/**
		 * Retrieves the water consumption of the day
		 */
		getWaterConsumption : function(date) {
			
			var d = date == null ? moment().format('YYYYMMDD') : date;
			
			return $http.get(microservicesProtocol + "://" + microservicesUrl + "/diet/water?date=" + d);
		},
		
		/**
		 * Gets the water consumption of the specified week of the year
		 */
		getWaterConsumptionOfWeek : function(week, year) {
			
			return $http.get(microservicesProtocol + "://" + microservicesUrl + "/diet/water?week=" + week + "&year=" + year);
		},
		
		/**
		 * Updates the water consumption goal. 
		 * 
		 * The provided amount must be in milliliters.
		 */
		putWaterConsumptionGoal : function(amountInMl) {
			
			return $http.put(microservicesProtocol + "://" + microservicesUrl + "/diet/water/goal", {amount: amountInMl});
		}, 
		
		/**
		 * Retrieves the water consuption goal.
		 * 
		 * Returns a promise function(data) where data: {amount: integer}
		 */
		getWaterConsumptionGoal : function() {
			
			return $http.get(microservicesProtocol + "://" + microservicesUrl + "/diet/water/goal");
		}, 
		
		/**
		 * Retrieves the list of foods
		 */
		getFoods : function() {
			
			return $http.get(microservicesProtocol + "://" + microservicesUrl + "/diet/foods");
		}, 
		
		/**
		 * Posts a new food. 
		 * 
		 * Requires: 
		 * 
		 * 	- food : an object {name: string, calories: float, fat: float, carbs: float, sugars: float, proteins: float}	
		 */
		postFood : function(food) {
			
			return $http.post(microservicesProtocol + "://" + microservicesUrl + "/diet/foods", food);
		}, 
		
		/**
		 * Delete the specified food 
		 * @param id
		 */
		deleteFood : function(id) {
			
			return $http.delete(microservicesProtocol + "://" + microservicesUrl + "/diet/foods/" + id);
		}, 
		
		/**
		 * Retrieves the meals for a specified date (yyyyMMdd string)
		 */
		getMeals : function(date) {
			
			return $http.get(microservicesProtocol + "://" + microservicesUrl + "/diet/meals?date=" + date);
		}, 
		
		/**
		 * Posts a meal. 
		 * Requires an object: 
		 * {time: HH:mm, date: yyyyMMdd string, calories: number, fat: number, carbs: number, sugars: number, proteins: number, 
		 * 	aliments: [{id: foodId, name: food name, amount: number, amountGr: number, amountMl: number}]}
		 */
		postMeal : function(meal) {
			
			return $http.post(microservicesProtocol + "://" + microservicesUrl + "/diet/meals", meal);
		}
		
	}

} ]);
