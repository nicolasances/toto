
var SpendingScreenDirectivesModule = angular.module('SpendingScreenDirectivesModule', [ 'expensesServiceModule' ]);

/**
 * Directive that shows the Spending Screen
 * 
 * Accepts the following parameters:
 * 
 *  - currency 	: 	(optional) the currency code to be used. EUR, DKK, ..
 *  
 */
SpendingScreenDirectivesModule.directive('spendingScreen', [ '$timeout', '$mdMedia', 'expensesService', function($timeout, $mdMedia, expensesService) {
	
	return {
		progress : {},
		scope : {
		},
		templateUrl : 'modules/screens/spending-screen.html',
		link : function(scope, el) {
			
			el[0].classList.add('layout-column');
			el[0].classList.add('flex');
			
			var currentYearMonth = expensesService.getCurrentMonth();
			
			scope.currentMonth = moment(currentYearMonth + '01', 'YYYYMMDD').format('MMMM');
			scope.currentYear = moment(currentYearMonth + '01', 'YYYYMMDD').format('YY');
			
		}
	};
} ]);
