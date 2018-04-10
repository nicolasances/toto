var dietServiceModule = angular.module('DietServiceModule', []);

dietServiceModule.factory('DietService', [ '$http', '$rootScope', '$location', '$mdDialog', function($http, $rootScope, $location, $mdDialog) {

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
					meal.date = moment(meal.date).format('YYYYMMDD');
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
					$scope.showAmount = true;
				}
				
				$scope.selectUnit = function(unit) {
					$scope.newFoodUnit = unit;
				}
				
				$scope.confirmAliment = function() {
					
					if ($scope.newFoodUnit == 'gr') $scope.newFood.amountGr = $scope.model.newFoodAmount;
					else if ($scope.newFoodUnit == 'ml') $scope.newFood.amountMl = $scope.model.newFoodAmount;
					else $scope.newFood.amount = $scope.model.newFoodAmount;
					
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
		getWaterConsumption : function() {
			
			return $http.get(microservicesProtocol + "://" + microservicesUrl + "/diet/water?date=" + moment().format('YYYYMMDD'));
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
