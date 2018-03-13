var cardModule = angular.module("cardModule", ["expensesServiceModule", "CardServiceModule"]);
	
cardModule.controller("cardController", [ '$rootScope', '$scope', '$http', '$timeout', '$mdDialog', '$mdSidenav', 'expensesService', '$interval', 'CardService', function($rootScope, $scope, $http, $timeout, $mdDialog, $mdSidenav, expensesService, $interval, CardService) {

	$scope.init = function() {
		
		$rootScope.currentMenu = 'Credit Cards';
		
		$scope.getCards();
	}
	
	/**
	 * Retrieves the list of cards
	 */
	$scope.getCards = function() {
		
		CardService.getCards().success(function(data) {
			$scope.cards = data.cards;
		});
		
	}
	
	/**
	 * Adds a card
	 */
	$scope.addCard = function(ev) {
		
		function DialogController($scope, $mdDialog) {

			$scope.steps = [1, 2];
			$scope.currentStep = 1;
			$scope.card = new Object();
			
			$scope.hide = function() {$mdDialog.hide;};
			$scope.cancel = function() {$mdDialog.cancel();};
			$scope.answer = function(card) {$mdDialog.hide(card);};
			$scope.nextStep = function () {$scope.currentStep++;}
			
		}
		
	    var useFullScreen = window.matchMedia( "(max-width: 960px)" ).matches;
	    var dialog = {controller: DialogController, templateUrl: 'modules/card/dlgAddCard.html', parent: angular.element(document.body), targetEvent: ev, clickOutsideToClose: true, fullscreen: useFullScreen};
	    
	    $mdDialog.show(dialog).then(function(answer) {
	    	
	    	answer.billingType = 'SOLAR_MONTH';
	    	answer.type = 'CREDIT_CARD';
	    	
	    	$http.post(microservicesProtocol + "://" + microservicesUrl + "/card/cards", answer).success(function(data, status, header, config) {
	    		$scope.card.id = data.id;
			});
	    	
	    	$scope.card = answer;
	    	
	    	$scope.cards.push($scope.card);
	    	
	    }, function() {});
	}
	
	$scope.init();
	
} ]);

/***********************************************************************************************************************
 * CARD DETAIL
 **********************************************************************************************************************/
cardModule.controller("cardDetailController", [ '$rootScope', '$scope', '$http', '$timeout', '$mdDialog', '$mdSidenav', 'expensesService', '$interval', '$routeParams', function($rootScope, $scope, $http, $timeout, $mdDialog, $mdSidenav, expensesService, $interval, $routeParams) {

	$scope.init = function() {
		
		$rootScope.currentMenu = 'Credit Card details';
		
		$scope.currentMonth = new Date(moment().date(1));

		$scope.getCategories();
		$scope.getCard(function() {
			$scope.getPayments();
		});
		
	}
	
	$scope.previousMonth = function() {
		$scope.currentMonth = new Date(moment($scope.currentMonth).subtract(1, 'months'));
		$scope.getPayments();
	}
	
	$scope.nextMonth = function() {
		$scope.currentMonth = new Date(moment($scope.currentMonth).add(1, 'months'));
		$scope.getPayments();
	}
	
	$scope.getCategories = function() {
		expensesService.getCategories().success(function(data) {
			$scope.categories = data.categories;
		});
	}
	
	$scope.getCard = function(callback) {
		$http.get(microservicesProtocol + "://" + microservicesUrl + "/card/cards/" + $routeParams.id).success(function(data, status, header, config) {
    		$scope.card = data;
    		callback();
		});
	}
	
	/**
	 * Retrieve a single category
	 */
	$scope.getCategory = function(code) {
		
		if ($scope.categories == null) return {};
		
		var i;
		for (i = 0; i < $scope.categories.length; i++) {
			if ($scope.categories[i].code == code) return $scope.categories[i];
		}
		
		return {};
	}
	
	$scope.getPayments = function() {
		
		$http.get(microservicesProtocol + "://" + microservicesUrl + "/expenses/expenses?cardId=" + $scope.card.id + "&cardMonth=" + moment($scope.currentMonth).format('MM')).success(function(data) {
			
			$scope.expenses = new Array();
			
			if (data != null && data.expenses != null) {
				
				var i;
				for (i = 0; i < data.expenses.length; i++) {
					var exp = data.expenses[i];
					exp.category = $scope.getCategory(exp.category);
					
					$scope.expenses.push(exp);
				}
			}
			
			$scope.updateTotal();
			
		});
	}
	
	/**
	 * Aggiorna il totale del mese corrente
	 */
	$scope.updateTotal = function() {
		
		$scope.monthTotal = 0;
		
		var i;
		for (i = 0; i < $scope.expenses.length; i++) {
			$scope.monthTotal += parseFloat($scope.expenses[i].amount);
		}
	}
	
	/**
	 * Add a payment to the credit card
	 */
	$scope.addPayment = function(ev) {
		
		var insertionCallback = function(payment) {
			$scope.lastPaymentAdded = payment;
			
			if ($scope.lastPaymentAdded.cardMonth == moment($scope.currentMonth).format('MM')) {
				$scope.expenses.push($scope.lastPaymentAdded);
				$scope.updateTotal();
			}
		};
		
		var creationCallback = function(promise) {
			promise.success(function(data) {
				$scope.lastPaymentAdded.id = data.id;
			});
		};
		
		expensesService.addCreditCardExpense(ev, $scope.card.id, insertionCallback, creationCallback);
		
	}
	
	$scope.init();
	
} ]);
