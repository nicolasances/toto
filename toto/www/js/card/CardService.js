var cardServiceModule = angular.module('CardServiceModule', ["expensesServiceModule"]);

cardServiceModule.factory('CardService', [ '$http', '$rootScope', '$location', '$mdDialog', 'expensesService', '$q', function($http, $rootScope, $location, $mdDialog, expensesService, $q) {

	return {

		/**
		 * Retrieves the list of cards
		 */
		getCards : function() {

			return $http.get(microservicesProtocol + "://" + microservicesUrl + "/card/cards");
		}, 
		
		/**
		 * Retrieves the current month's expenses total for the given card
		 */
		getExpensesTotal : function(cardId, yearMonth) {
			
			return $q(function(resolve, reject) {

				expensesService.getExpenses({cardId: cardId, cardMonth: yearMonth.substring(4), cardYear: yearMonth.substring(0, 4)}).success(function(data) {
					
					var total = 0;
					
					for (var i = 0; i < data.expenses.length; i++) {
						
						total += parseFloat(data.expenses[i].amountInEuro);
					}
					
					resolve(total);
				});
			});
		},
		
		/**
		 * Retrieves the current month's expenses total for the given card
		 */
		getCurrentMonthExpensesTotal : function(cardId) {
			
			return $q(function(resolve, reject) {

				expensesService.getExpenses({cardId: cardId, cardMonth: moment().format('MM')}).success(function(data) {
					
					var total = 0;
					
					for (var i = 0; i < data.expenses.length; i++) {
						
						total += parseFloat(data.expenses[i].amountInEuro);
					}
					
					resolve(total);
				});
			});
		}

	}

} ]);
