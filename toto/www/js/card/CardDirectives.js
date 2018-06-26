
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
				
				CardService.getCurrentMonthExpensesTotal(data.cards[0].id).then(function(total) {
					
					scope.total = total;
					
				});
			})
		}
	};
} ]);

/**
 * Displays info about the credit cards
 */
CardDirectivesModule.directive('creditCardInfo', function(CardService) {
	
	return {
		
		scope: {},
		templateUrl: 'modules/card/directives/credit-card-info.html',
		link: function(scope, el) {
			
			el[0].classList.add('layout-column');
			
			// Define the current month
			scope.currentDate = new Date();
			scope.currentMonth = moment().format('MMMM YY');
			
			// Define the month to query
			var yearMonth = moment(scope.currentDate).format('YYYYMM');
			
			/**
			 * Retrieve the credit cards and their total amount for the specific month
			 */
			CardService.getCardsWithTotal(yearMonth).then(function(result) {
				
				scope.cards = [];
				
				for (let card of result) {
					scope.cards.push(card);
				}
			});
			
			/**
			 * Extracts the info to display in the toto-list related to the card
			 */
			scope.cardInfoExtractor = function(card) {
				
				return {
					title: 'XXXX XXXX XXXX ' + card.card.digits,
					subtitle: 'Expires ' + moment(card.card.expiry).format('MM/YY'),
					number: {value: card.amount, scale: 2, unit: 'EUR'}
				};
			}
		}
	};
});