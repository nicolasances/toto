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
		 * Retrieves the cards with the associated total for the specified year month
		 */
		getCardsWithTotal : function(yearMonth) {
			
			// Create the get expenses function
			var getExpensesTotal = function(cardId, yearMonth) {
				
				return $q(function(resolve, reject) {

					expensesService.getExpenses({cardId: cardId, cardMonth: yearMonth.substring(4), cardYear: yearMonth.substring(0, 4)}).success(function(data) {
						
						var total = 0;
						
						for (var i = 0; i < data.expenses.length; i++) {
							
							total += parseFloat(data.expenses[i].amountInEuro);
						}
						
						resolve({cardId: cardId, yearMonth: yearMonth, amount: total});
					});
				});
			};
			
			// Return a promise
			return $q(function(resolve, reject) {
				
				// Get the cards
				$http.get(microservicesProtocol + "://" + microservicesUrl + "/card/cards").success(function(data) {
					
					// Create an [] of promises that will retrieve each card total amount for 
					// the specified yearMonth
					var promises = [];
					var promiseResults = [];
					
					// For each card stack the promises and execute them
					for (var i = 0; i < data.cards.length; i++) {
						
						// Save the card data
						promiseResults.push({card: data.cards[i]});
						
						// Get the expenses of that card
						var promise = getExpensesTotal(data.cards[i].id, yearMonth).then(function(data) {
							
							for (let pr of promiseResults) {
								if (pr.card.id == data.cardId) pr.amount = data.amount;
							}

						});
						
						promises.push(promise);
						
					}
					
					// Now wait for all the promises to finish
					$q.all(promises).then(function() {
						resolve(promiseResults);
					})
				});
				
			});
		},
		
		/**
		 * Retrieves the expenses of the specified card in the specified year and month
		 */
		getExpenses : function(cardId, yearMonth) {
			
			return expensesService.getExpenses({cardId: cardId, cardMonth: yearMonth.substring(4), cardYear: yearMonth.substring(0, 4)});
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
					
					resolve({cardId: cardId, yearMonth: yearMonth, amount: total});
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
