var carModule = angular.module("carModule", ["expensesServiceModule"]);
	
carModule.controller("carController", [ '$scope', '$http', '$timeout', '$mdDialog', '$mdSidenav', 'expensesService', function($scope, $http, $timeout, $mdDialog, $mdSidenav, expensesService) {

	$scope.init = function() {
		
		$http.get(microservicesProtocol + "://" + microservicesUrl + "/car/taxes/sum?unpaied=true").success(function (data, status, header, config) {
			$scope.taxesTotalAmount = data.sum;
		});
		
		$http.get(microservicesProtocol + "://" + microservicesUrl + "/car/taxes?unpaied=true").success(function (data, status, header, config) {
			
			if (data.taxes != null) $scope.taxesUnpaied = data.taxes.length;
			
			$scope.unpaiedTaxes = data.taxes;
			
		});
		
	}
	
	$scope.init();
	
} ]);

/* ********************************************************************************************************************************************************
 * FINES
 * ********************************************************************************************************************************************************/
carModule.controller("carBolloController", [ '$scope', '$http', '$timeout', '$mdDialog', '$mdSidenav', 'expensesService', function($scope, $http, $timeout, $mdDialog, $mdSidenav, expensesService) {

	$scope.init = function() {
		
		$scope.getBolli();
	}
	
	/**
	 * Retrieves the fines
	 */
	$scope.getBolli = function() {
		
		$http.get(microservicesProtocol + "://" + microservicesUrl + "/car/taxes/").success(function (data, status, header, config) {

			$scope.taxes = data.taxes;
			
			if ($scope.taxes!= null) {
				for (i=0; i<$scope.taxes.length;i++) {
					if ($scope.taxes[i].linkedPaymentId != null) $scope.fillPaymentInfo($scope.taxes[i]);
				}
			}
			
		});
	}
	
	/**
	 * Adds a bollo
	 */
	$scope.addTax = function(ev) {
		
		function DialogController($scope, $mdDialog) {
			
			$scope.hide = function() {$mdDialog.hide;};
			$scope.cancel = function() {$mdDialog.cancel();};
			$scope.answer = function(tax) {$mdDialog.hide(tax);};
			
		}
		
	    var useFullScreen = window.matchMedia( "(max-width: 960px)" ).matches;
	    var dialog = {controller: DialogController, templateUrl: 'modules/car/dlgAddBollo.html', parent: angular.element(document.body), targetEvent: ev, clickOutsideToClose: true, fullscreen: useFullScreen};
	    
	    $mdDialog.show(dialog).then(function(answer) {
	    	
	    	$scope.tax = new Object();
	    	$scope.tax.amount = answer.amount;
	    	$scope.tax.dueDate = answer.dueDate;
	    	$scope.tax.year = answer.year;
	    	$scope.tax.ingiunzione = answer.ingiunzione;
	    	
	    	$scope.taxes.push($scope.tax);
	    	
	    	$http.post(microservicesProtocol + "://" + microservicesUrl + "/car/taxes", $scope.tax).success(function(data, status, header, config) {
	    		$scope.tax.id = data.id;
			});
	    	
	    }, function() {});

	}
	
	/**
	 * Show the details of the bollo
	 */
	$scope.showDetails = function(tax, ev) {
		
		linkToExpense = $scope.linkToExpense;
		addIngiunzione = $scope.addIngiunzione;
		
		function DialogController($scope, $mdDialog) {
			
			$scope.tax = tax;
			$scope.hide = function() {$mdDialog.hide;};
			$scope.cancel = function() {$mdDialog.cancel();};
			$scope.linkToExpense = linkToExpense;
			$scope.addIngiunzione = addIngiunzione;
		}
		
	    var useFullScreen = window.matchMedia( "(max-width: 960px)" ).matches;
	    var dialog = {controller: DialogController, templateUrl: 'modules/car/dlgShowBolloDetails.html', parent: angular.element(document.body), targetEvent: ev, clickOutsideToClose: true, fullscreen: useFullScreen};
	    
	    $mdDialog.show(dialog);
		
	}
	
	/**
	 * Adds an ingiunzione to the tax
	 */
	$scope.addIngiunzione = function(tax, ev) {
		
		function DialogController($scope, $mdDialog) {
			
			$scope.hide = function() {$mdDialog.hide;};
			$scope.cancel = function() {$mdDialog.cancel();};
			$scope.answer = function(ingiunzione) {$mdDialog.hide(ingiunzione);};
			
		}
		
	    var useFullScreen = window.matchMedia( "(max-width: 960px)" ).matches;
	    var dialog = {controller: DialogController, templateUrl: 'modules/car/dlgAddIngiunzione.html', parent: angular.element(document.body), targetEvent: ev, clickOutsideToClose: true, fullscreen: useFullScreen};
	    
	    $mdDialog.show(dialog).then(function(answer) {
	    	
	    	tax.ingiunzione = answer;
	    	
	    	$http.put(microservicesProtocol + "://" + microservicesUrl + "/car/taxes/" + tax.id, {ingiunzione: tax.ingiunzione});
	    	
	    }, function() {});
	}
	
	/**
	 * Links the bollo to an expense
	 */
	$scope.linkToExpense = function(tax, ev) {
		
		var useFullScreen = window.matchMedia( "(max-width: 960px)" ).matches;
	    var dialog = {controller: expensesService.DialogController, templateUrl: 'modules/expenses/dlgLinkExpense.html', parent: angular.element(document.body), targetEvent: ev, clickOutsideToClose: true, fullscreen: useFullScreen};
	    
	    $mdDialog.show(dialog).then(function(answer) {
	    	
	    	tax.linkedPaymentId = answer.id;

	    	$scope.fillPaymentInfo(tax);
	    	
	    	$http.put(microservicesProtocol + "://" + microservicesUrl + "/car/taxes/" + tax.id, {linkedPaymentId: answer.id});
	    	
	    }, function() {});
	}
	
	/**
	 * Complete the payment info 
	 */
	$scope.fillPaymentInfo = function(tax) {
		
		$http.get(microservicesProtocol + "://" + microservicesUrl + "/expenses/expenses/" + tax.linkedPaymentId).success(function (data, status, header, config) {
			
			tax.paymentDate = data.date;
			tax.paymentDescription = data.description;
			
		});
	}

	
	$scope.init();

} ]);


