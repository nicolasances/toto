
var NutritionScreenDirectivesModule = angular.module('NutritionScreenDirectivesModule', [ 'GymServiceModule' ]);

/**
 * Directive that shows the Nutrition Screen
 * 
 */
NutritionScreenDirectivesModule.directive('nutritionScreen', [ '$timeout', '$mdMedia', 'GymService', function($timeout, $mdMedia, GymService) {
	
	return {
		progress : {},
		scope : {
		},
		templateUrl : 'modules/screens/nutrition-screen.html',
		link : function(scope, el) {
			
			el[0].classList.add('layout-column');
			el[0].classList.add('flex');
			
			scope.currentDay = new Date();
			
		}
	};
} ]);
