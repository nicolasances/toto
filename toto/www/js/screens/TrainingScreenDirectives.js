
var TrainingScreenDirectivesModule = angular.module('TrainingScreenDirectivesModule', [ 'GymServiceModule' ]);

/**
 * Directive that shows the Training Screen
 * 
 */
TrainingScreenDirectivesModule.directive('trainingScreen', [ '$timeout', '$mdMedia', 'GymService', function($timeout, $mdMedia, GymService) {
	
	return {
		progress : {},
		scope : {
		},
		templateUrl : 'modules/screens/training-screen.html',
		link : function(scope, el) {
			
			el[0].classList.add('layout-column');
			el[0].classList.add('flex');
			
			scope.currentWeek = moment().format('WW')
			
		}
	};
} ]);
