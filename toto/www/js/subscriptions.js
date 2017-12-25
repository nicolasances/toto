var subscriptionsModule = angular.module("subscriptionsModule", ["expensesServiceModule"]);

var subscriptionsPaymentTypesDesc = [{name: 'directDebit', desc: 'Direct Debit'}, {name: 'creditCard', desc: 'Credit Card'}, {name: 'manual', desc: 'Manual'}];
var subscriptionsGetPaymentTypeDesc = function(name) {
	var i;
	for (i = 0; i < subscriptionsPaymentTypesDesc.length; i++) {
		if (name == subscriptionsPaymentTypesDesc[i].name) return subscriptionsPaymentTypesDesc[i].desc;
	}
	
	return null;
}

subscriptionsModule.controller("subscriptionsController", [ '$scope', '$http', '$timeout', '$mdDialog', '$mdSidenav', 'expensesService', function($scope, $http, $timeout, $mdDialog, $mdSidenav, expensesService) {

	$scope.init = function() {
		
		$scope.getSubscriptions();
	}
	
	/**
	 * Retrieves the list of subscriptions
	 */
	$scope.getSubscriptions = function () {

		$http.get(microservicesProtocol + "://" + microservicesUrl + "/subscriptions/subscriptions?onlyActive=true").success(function(data, status, header, config) {
			$scope.subscriptions = data.subscriptions;
		});
	}
	
	/**
	 * Create a new subscription. 
	 * Opens the related dialog window.
	 */
	$scope.addSubscription = function(ev) {
		
		function DialogController($scope, $mdDialog) {

			$scope.steps = [1, 2, 3];
			$scope.currentStep = 1;
			$scope.subscription = new Object();
			
			$scope.hide = function() {$mdDialog.hide;}
			$scope.cancel = function() {$mdDialog.cancel();}
			$scope.answer = function(subscription) {$mdDialog.hide(subscription);}
			$scope.nextStep = function () {$scope.currentStep++;}
			
			$scope.setPaymentType = function (type) {$scope.subscription.payment = type; $scope.subscription.paymentDesc = subscriptionsGetPaymentTypeDesc(type);}
			$scope.setBilling = function(value) {$scope.subscription.billing = value;}
			$scope.setType = function(value) {$scope.subscription.type = value;}
			
		}
		
	    var useFullScreen = window.matchMedia( "(max-width: 960px)" ).matches;
	    var dialog = {controller: DialogController, templateUrl: 'modules/subscriptions/dlgAddSubscription.html', parent: angular.element(document.body), targetEvent: ev, clickOutsideToClose: true, fullscreen: useFullScreen};
	    
	    $mdDialog.show(dialog).then(function(answer) {
	    	
	    	$scope.subscription = answer;
	    	$scope.subscriptions.push($scope.subscription);

	    	$http.post(microservicesProtocol + "://" + microservicesUrl + "/subscriptions/subscriptions", answer).success(function(data, status, header, config) {
	    		$scope.subscription.id = data.id;
			});
	    	
	    }, function() {});
	}
	
	$scope.init();
	
} ]);

/* ********************************************************************************************************************************************************
 * SUBSCRIPTION DETAIL
 * ********************************************************************************************************************************************************/
subscriptionsModule.controller("subscriptionDetailController", [ '$scope', '$http', '$timeout', '$mdDialog', '$mdSidenav', 'expensesService', '$routeParams', function($scope, $http, $timeout, $mdDialog, $mdSidenav, expensesService, $routeParams) {

	$scope.init = function() {
		
		$scope.getSubscription($routeParams.id);
	}
	
	/**
	 * Loads the subscription's detail
	 */
	$scope.getSubscription = function(id) {
		
		$http.get(microservicesProtocol + "://" + microservicesUrl + "/subscriptions/subscriptions/" + id).success(function(data, status, header, config) {
			
			$scope.subscription = data;
			
			$scope.loadExpenses();
		});
	}
	
	/**
	 * Loads expenses related to the subscription
	 */
	$scope.loadExpenses = function() {
		
		expensesService.getExpenses({subscriptionId: $scope.subscription.id}).success(function (data) {
			
			$scope.expenses = data.expenses;
			
			expensesService.updateExpensesWithCategoryInfo($scope.expenses);
		});
	}
	
	/**
	 * Links an expense to this subscription. 
	 * Opens a dialog for choosing the expense.
	 */
	$scope.linkExpense = function(ev) {
		
		expensesService.pickExpense(ev).then(function (expense) {

			$http.put(microservicesProtocol + "://" + microservicesUrl + "/subscriptions/subscriptions/" + $scope.subscription.id, {linkedPaymentId : expense.id});

			$scope.expenses.push(expense);
			
		});
	}
	
	/**
	 * Terminates the subscription
	 */
	$scope.terminateSubscription = function() {
		
		$http.put(microservicesProtocol + "://" + microservicesUrl + "/subscriptions/subscriptions/" + $scope.subscription.id, {terminated : true});
	}
	
	/**
	 * Deletes this subscription and returns back to the list
	 */
	$scope.deleteSubscription = function() {
		
		$http.delete(microservicesProtocol + "://" + microservicesUrl + "/subscriptions/subscriptions/" + $scope.subscription.id);
		
		$scope.go('/subscriptions');
	}
	
	$scope.init();
	
} ]);


