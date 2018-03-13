
var CardDirectivesModule = angular.module('CardDirectivesModule', [ 'CardServiceModule' ]);

/**
 * Directive that shows the total spent on the card for the current month
 * 
 * Accepts the following parameters:
 * 
 *  
 */
CardDirectivesModule.directive('cardTotal', [ '$timeout', '$mdMedia', 'CardService', function($timeout, $mdMedia, CardService) {
	
	return {
		progress : {},
		scope : {
		},
		templateUrl : 'modules/card/directives/card-total.html',
		link : function(scope, el) {
			
			/**
			 * Retrieve the card
			 */
			CardService.getCards().success(function(data) {
				
				if (data.cards == null) return;
				
				scope.card = data.cards[0];
				
				console.log(scope.card);
				
				CardService.getCurrentMonthExpensesTotal(data.cards[0].id).then(function(total) {
					
					scope.total = total;
					
				});
			})
		}
	};
} ]);

