
var TrainingScreenDirectivesModule = angular.module('TrainingScreenDirectivesModule', [ 'GymServiceModule' ]);

/**
 * Directive that shows the Training Screen
 * 
 */
TrainingScreenDirectivesModule.directive('trainingScreen', [ '$timeout', '$mdMedia', 'GymService', '$rootScope', function($timeout, $mdMedia, GymService, $rootScope) {
	
	return {
		progress : {},
		scope : {
		},
		templateUrl : 'modules/screens/training-screen.html',
		link : function(scope, el) {
			
			el[0].classList.add('layout-column');
			el[0].classList.add('flex');
			
			scope.currentWeek = moment().format('WW');
			
			var goToArchive = function() {$rootScope.go('/gym/archive');}
			var goToSessions = function() {$rootScope.go('/gym/sessions');}
			var goToWeight = function() {$rootScope.go('/gym/weights');}
			var goToPlans = function() {$rootScope.go('/gym/plans');}
			
			/**
			 * Build the menus
			 */
			scope.menus = [{icon: 'images/svg/archived.svg', action: goToArchive},
			               {icon: 'images/svg/calendar.svg', action: goToSessions},
			               {icon: 'images/svg/clipboard.svg', action: goToPlans},
			               {icon: 'images/svg/dumbbell.svg', action: goToWeight}];
			
		}
	};
} ]);
