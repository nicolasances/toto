
var CardDirectivesModule = angular.module('CardDirectivesModule', [ 'CardServiceModule', 'expensesServiceModule' ]);

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
CardDirectivesModule.directive('creditCardInfo', function(CardService, expensesService) {
	
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
			 * Get the cards
			 */
			var getCards = function() {
				
				/**
				 * Retrieve the credit cards and their total amount for the specific month
				 */
				CardService.getCardsWithTotal(yearMonth).then(function(result) {
					
					scope.cards = [];
					
					for (let card of result) {
						scope.cards.push(card);
					}
				});
			}
			
			/**
			 * Adds an expense to the card in the currently selected year Month
			 */
			var addExpense = function(item) {
				
				expensesService.addCreditCardExpense(item.id, function () {}, function() {
					
					TotoEventBus.publishEvent({name: 'cardExpenseCreated', context: {}});
					
				});
			}
			
			/**
			 * Shows the expenses for the credit card
			 */
			var showExpenses = function(item) {
				
				// Request the expenses for the credit card
				TotoEventBus.publishEvent({name: 'cardExpensesRequested', context: {cardId: item.id, yearMonth: yearMonth}});
				
				// Navigate to the section showing the credit card expenses
				TotoNavigation.slideTo(el[0], 'payCreditCardExpensesSlide');
			}
			
			/**
			 * Extracts the info to display in the toto-list related to the card
			 */
			scope.cardInfoExtractor = function(card) {
				
				return {
					id: card.card.id, 
					title: 'XXXX XXXX XXXX ' + card.card.digits,
					subtitle: 'Expires ' + moment(card.card.expiry).format('MM/YY'),
					number: {value: card.amount, scale: 2, unit: 'EUR'},
					actions: [{svg: 'images/svg/add.svg', action: addExpense},
					          {svg: 'images/svg/binoculars.svg', action: showExpenses}]
				};
			}
			
			/**
			 * React to card expense created events 
			 * by updating the total
			 */
			TotoEventBus.subscribeToEvent('cardExpenseCreated', getCards);
			TotoEventBus.subscribeToEvent('cardExpenseDeleted', getCards);
			
			getCards();
		}
	};
});

/**
 * Shows the credit card expenses. 
 * 
 * This directive will get the card Id from the cardExpensesRequested event. In particular, 
 * this information will be retrieve from the event.context.cardId param.
 * 
 * The expenses will be extracted for the specified (event.context.yearMonth) yearMonth.
 */
CardDirectivesModule.directive('creditCardExpenses', function(CardService, expensesService) {

	return {
		scope: {},
		templateUrl: 'modules/card/directives/credit-card-expenses.html',
		link: function(scope, el) {
			
			/**
			 * Waits for the required data: cardId and yearMonth
			 */
			TotoEventBus.subscribeToEvent('cardExpensesRequested', function(event) {
				
				if (event == null || event.context == null) {console.log('Received an cardExpensesRequested with no event or context.'); return;}
				if (event.context.cardId == null) {console.log('Received a cardExpensesRequested event with no cardID'); return;}
				if (event.context.yearMonth == null) {console.log('Received a cardExpensesRequested event with no yearMonth'); return;}
				
				// Save in scope variables
				scope.cardId = event.context.cardId;
				scope.yearMonth = event.context.yearMonth;
				
				getExpenses();
				
			});
			
			/**
			 * Retrieves the expenses
			 */
			var getExpenses = function() {
				
				CardService.getExpenses(scope.cardId, scope.yearMonth).success(function(data) {
					
					scope.expenses = data.expenses;
				});
			}

			/**
			 * Extracts the data to be represented in the toto-list
			 */
			scope.expensesDatasetExtractor = function(item) {
				
				var result = {
						id: item.id,
						avatar: 'images/expenses/avatars-nofill/' + getCategorySvg(item.category),
						date: item.date,
						title: item.description,
						number: {
							unit: item.currency,
							value: item.amount,
							scale: 2, 
							accent: 'false'
						}, 
						greyed: !item.consolidated,
						actions: [{svg: 'images/svg/trash.svg', action: deleteExpense}]
					};
				
				if (!item.consolidated) result.actions.unshift({svg: 'images/svg/checked.svg', action: consolidateExpense})
				
				return result;

			}
			
			/**
			 * Consolidates the expense
			 */
			var consolidateExpense = function(item) {
				
				// Consolidate expense
				expensesService.setExpenseConsolidated(item.id).success(function(data) {
					
					// Send the expenseConsolidated event
					TotoEventBus.publishEvent({name: 'cardExpenseConsolidated', context: {expenseId: item.id}});
					
				});
			}
			
			/**
			 * Deletes an expense
			 */
			var deleteExpense = function(item) {
				
				expensesService.deleteExpense(item.id);
				
				// Send the expenseDeleted event
				TotoEventBus.publishEvent({name: 'cardExpenseDeleted', context: {expenseId: item.id}});
			}
			
			/**
			 * Finds the SVG related to the specified category
			 */
			var getCategorySvg = function(cat) {
				
				for (var i = 0; i < scope.availableCategories.length; i++) {
					
					if (scope.availableCategories[i].code == cat) return scope.availableCategories[i].filename;
				}
				
			}

			/**
			 * Retrieve the categories and then the expenses
			 */
			expensesService.getCategories().success(function(data) {
				
				// Save the categories as "available categories"
				scope.availableCategories = data.categories;
				
			});
			
			// Register all the Event Reaction functions
			TotoEventBus.subscribeToEvent('cardExpenseDeleted', getExpenses);
			TotoEventBus.subscribeToEvent('cardExpenseConsolidated', getExpenses);
			
		}
	}
	
});


