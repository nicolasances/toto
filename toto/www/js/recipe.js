var recipeModule = angular.module("recipeModule", []);

recipeModule.directive("scroll", function ($window) {
    return function(scope, element, attrs) {
        angular.element($window).bind("scroll", function() {
        	
        	if (this.pageYOffset == 0) document.querySelector('md-toolbar').classList.remove('md-whiteframe-3dp');
        	else document.querySelector('md-toolbar').classList.add('md-whiteframe-3dp');
        	
            scope.$apply();
        });
    };
});

/************************************************************************************************************************************************
 * RECIPES
 ************************************************************************************************************************************************/
recipeModule.controller("recipesController", [ '$scope', '$http', '$mdDialog', '$rootScope', function($scope, $http, $mdDialog, $rootScope) {

	$scope.initContext = function() {
		
		$scope.imagesServerHost = microservicesHost;
		$scope.imagesServerPort = imagesServerPort;
		
		$scope.getRecipes();
		
		$rootScope.currentMenu = 'Recipes';

	}
	
	/**
	 * Retrieve the recipes list
	 */
	$scope.getRecipes = function() {
		
		$http.get(microservicesProtocol + "://" + microservicesUrl + "/recipe/recipes").success(function(data, status, header, config) {
			
			$scope.recipes = data.recipes;
			
			if ($scope.recipes == null) return; 
			
			for (i=0; i<$scope.recipes.length; i++) {
				
				$scope.buildIngredients($scope.recipes[i]);
			}
			
			$scope.selectedRecipe = $scope.recipes[0];
		});
		
	}
	
	$scope.buildIngredients = function(recipe) {
		
		$http.get(microservicesProtocol + "://" + microservicesUrl + "/recipe/recipes/" + recipe.id + "/ingredients").success(function(data, status, header, config) {

			if (data.ingredients == null) return;

			var z = 0;
			var result = "";
			for (z=0; z<data.ingredients.length; z++) {

				if (!window.matchMedia( "(min-width: 960px)" ).matches && z > 2) {
					result += ",...";
					break;
				}
				if (z > 0) result += ", ";
				
				result += data.ingredients[z].name;
			}
			
			recipe.ingredients = result;
		});
	}
	
	/**
	 * Create a new recipe
	 */
	$scope.newRecipe = function() {
		
		var dlg = $mdDialog.prompt().title('Enter the name of the Recipe').placeholder('Recipe\'s name').ok('Done').cancel('Cancel');
		
		$mdDialog.show(dlg).then(function(result) {
			
			var data = {name: result};

			$http.post(microservicesProtocol + "://" + microservicesUrl + "/recipe/recipes", data).success(function(data, status, header, config) {
				
				$scope.go('/recipe/' + data.id);
			});
			

		});
	}

	$scope.initContext();

} ]);

/************************************************************************************************************************************************
 * RECIPE DETAIL
 ************************************************************************************************************************************************/
recipeModule.controller("recipeController", [ '$scope', '$http', '$mdDialog', '$timeout', '$routeParams', 'thumbnailService', '$rootScope', function($scope, $http, $mdDialog, $timeout, $routeParams, thumbnailService, $rootScope) {

	$scope.initContext = function() {
		
		$scope.imagesServerHost = microservicesHost;
		$scope.imagesServerPort = imagesServerPort;
		
		$scope.showUpdateTitle = false;
		$scope.showIngredients = window.matchMedia( "(min-width: 960px)" ).matches ? true : false;
		$scope.showProcedure = true;
		
		$scope.getRecipe();
		$scope.getIngredients();
		$scope.getSteps();
		
	}
	
	/**
	 * Retrieve the recipe details
	 */
	$scope.getRecipe = function() {
		
		$http.get(microservicesProtocol + "://" + microservicesUrl + "/recipe/recipes/" + $routeParams.id).success(function(data, status, header, config) {
			
			$scope.recipe = data;
			
			$rootScope.currentMenu = $scope.recipe.name;

		});
		
	}
	
	/**
	 * Retrieve the recipe's ingredients
	 */
	$scope.getIngredients = function() {
		
		$http.get(microservicesProtocol + "://" + microservicesUrl + "/recipe/recipes/" + $routeParams.id + "/ingredients").success(function(data, status, header, config) {
			
			$scope.ingredients = data.ingredients;
		});
		
	}
	
	/**
	 * Retrieve the recipe's procedure's steps
	 */
	$scope.getSteps = function() {
		
		$http.get(microservicesProtocol + "://" + microservicesUrl + "/recipe/recipes/" + $routeParams.id + "/steps").success(function(data, status, header, config) {
			
			$scope.steps = data.steps;
		});
		
	}
	
	/**
	 * Posts the recipe thumbail
	 */
	$scope.postRecipeThumbnail = function(inputEl) {
		
		var uploadUrl = microservicesProtocol + "://" + microservicesUrl + "/recipe/recipes/" + $routeParams.id + "/thumbnail";

		thumbnailService.sendThumbnail(inputEl.files[0], uploadUrl, null, function() {
			$scope.getRecipe();
		});
	}
	
	/**
	 * Updates the recipe's name
	 */
	$scope.updateRecipeName = function() {
		
		var data = {name: $scope.recipe.name};
		
		$http.put(microservicesProtocol + "://" + microservicesUrl + "/recipe/recipes/" + $routeParams.id, data).success(function(data, status, header, config) {
			$scope.showUpdateTitle = false;
		});
	}
	
	/**
	 * Udpates and ingredient name
	 */
	$scope.updateIngredientName = function(ingredient) {
		var dlg = $mdDialog.prompt().title('Edit the ingredient').placeholder('Ingredient\'s name').ok('Done').cancel('Cancel');
		$mdDialog.show(dlg).then(function(result) {
			
			var data = {name: result};
			
			$http.put(microservicesProtocol + "://" + microservicesUrl + "/recipe/recipes/" + $routeParams.id + "/ingredients/" + ingredient.id, data).success(function(data, status, header, config) {});
			
			ingredient.name = result;
		});
	}
	
	/**
	 * Updates an ingredient amount
	 */
	$scope.updateIngredientAmount = function(ingredient) {
		var dlg = $mdDialog.prompt().title('Edit the ingredient').placeholder('Ingredient\'s amount').ok('Done').cancel('Cancel');
		$mdDialog.show(dlg).then(function(result) {

			var data = {amount: result};
			
			$http.put(microservicesProtocol + "://" + microservicesUrl + "/recipe/recipes/" + $routeParams.id + "/ingredients/" + ingredient.id, data).success(function(data, status, header, config) {});
			
			ingredient.amount = result;
		});
	}
	
	/**
	 * Adds an ingredient
	 */
	$scope.addIngredient = function() {
		
		var ingredient = {name: 'Ingredient', amount: '100gr'};
		
		$scope.ingredients.push(ingredient);
		
		var data = ingredient;
		
		$http.post(microservicesProtocol + "://" + microservicesUrl + "/recipe/recipes/" + $routeParams.id + "/ingredients", data).success(function(data, status, header, config) {
		
			ingredient.id = data.id;
			
		});
		
	}
	
	/**
	 * Deletes an ingredient
	 */
	$scope.deleteIngredient = function(ingredient) {
		var removeIndex = -1;
		for (i=0; i<$scope.ingredients.length; i++) {
			if ($scope.ingredients[i].name == ingredient.name) {
				removeIndex = i;
				break;
			}
		}
		
		$scope.ingredients.splice(i, 1);
		
		$http.delete(microservicesProtocol + "://" + microservicesUrl + "/recipe/recipes/" + $routeParams.id + "/ingredients/" + ingredient.id).success(function(data, status, header, config) {});
	}
	
	/**
	 * Adds a procedure step
	 */
	$scope.addProcedureStep = function() {
		
		var step = {description: 'Insert here the step description...'};
		
		$scope.steps.push(step);
		
		$http.post(microservicesProtocol + "://" + microservicesUrl + "/recipe/recipes/" + $routeParams.id + "/steps", step).success(function(data, status, header, config) {
		
			step.id = data.id;
			
		});
	}
	
	/**
	 * Updates a procedure step description
	 */
	$scope.updateStepDescription = function(step) {
		
		var dlg = $mdDialog.prompt().title('Edit the step').placeholder('Step\'s description').ok('Done').cancel('Cancel');
		$mdDialog.show(dlg).then(function(result) {

			var update = {description: result};
			
			step.description = result;
			
			$http.put(microservicesProtocol + "://" + microservicesUrl + "/recipe/recipes/" + $routeParams.id + "/steps/" + step.id, update).success(function(data, status, header, config) {});
			
		});

	}
	
	/**
	 * Toggles the delete ingredient icon
	 */
	$scope.toggleDeleteIcon = function(ingredient, show) {
		ingredient.showDelete = show;
	}
	
	$scope.initContext();

} ]);