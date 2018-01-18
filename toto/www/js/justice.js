var justiceModule = angular.module("justiceModule", ["expensesServiceModule"]);
	
justiceModule.controller("justiceController", [ '$scope', '$http', '$timeout', '$mdDialog', '$mdSidenav', 'expensesService', function($scope, $http, $timeout, $mdDialog, $mdSidenav, expensesService) {

	$scope.init = function() {
		
		$http.get(microservicesProtocol + "://" + microservicesUrl + "/justice/fines/sum?unpaied=true").success(function (data, status, header, config) {
			$scope.finesTotalAmount = data.sum;
		});
		
		$http.get(microservicesProtocol + "://" + microservicesUrl + "/justice/equitalia/bills/sum?unpaied=true").success(function (data, status, header, config) {
			$scope.equitaliaTotalAmount = data.sum;
		});
		
	}
	
	$scope.init();
	
} ]);

/* ********************************************************************************************************************************************************
 * FINES
 * ********************************************************************************************************************************************************/
justiceModule.controller("justiceFinesController", [ '$scope', '$http', '$timeout', '$mdDialog', '$mdSidenav', 'expensesService', function($scope, $http, $timeout, $mdDialog, $mdSidenav, expensesService) {

	$scope.init = function() {
		
		$scope.getFines();
	}
	
	/**
	 * Retrieves the fines
	 */
	$scope.getFines = function() {
		
		$http.get(microservicesProtocol + "://" + microservicesUrl + "/justice/fines/").success(function (data, status, header, config) {

			$scope.fines = data.fines;
			
			if ($scope.fines != null) {
				for (i=0; i<$scope.fines.length;i++) {
					if ($scope.fines[i].linkedPaymentId != null) $scope.fillPaymentInfo($scope.fines[i]);
				}
			}
			
		});
	}
	
	/**
	 * Adds a fine
	 */
	$scope.addFine = function(ev) {
		
		function DialogController($scope, $mdDialog) {
			
			$scope.hide = function() {$mdDialog.hide;};
			$scope.cancel = function() {$mdDialog.cancel();};
			$scope.answer = function(income) {$mdDialog.hide(income);};
			
		}
		
	    var useFullScreen = window.matchMedia( "(max-width: 960px)" ).matches;
	    var dialog = {controller: DialogController, templateUrl: 'modules/justice/dlgAddFine.html', parent: angular.element(document.body), targetEvent: ev, clickOutsideToClose: true, fullscreen: useFullScreen};
	    
	    $mdDialog.show(dialog).then(function(answer) {
	    	
	    	$scope.fine = new Object();
	    	$scope.fine.amount = answer.amount;
	    	$scope.fine.date = answer.date;
	    	$scope.fine.reference = answer.reference;
	    	$scope.fine.notificationDate = answer.notificationDate;
	    	$scope.fine.description = answer.description;
	    	$scope.fine.details = answer.details;
	    	$scope.fine.postalPaymentData = answer.postalPaymentData;
	    	
	    	$scope.fines.push($scope.fine);
	    	
	    	$http.post(microservicesProtocol + "://" + microservicesUrl + "/justice/fines", $scope.fine).success(function(data, status, header, config) {
	    		$scope.fine.id = data.id;
			});
	    	
	    }, function() {});

	}
	
	/**
	 * Show the details of the fine
	 */
	$scope.showDetails = function(fine, ev) {
		
		linkToExpense = $scope.linkToExpense;
		
		function DialogController($scope, $mdDialog) {
			
			$scope.fine = fine;
			$scope.hide = function() {$mdDialog.hide;};
			$scope.cancel = function() {$mdDialog.cancel();};
			$scope.linkToExpense = linkToExpense;
		}
		
	    var useFullScreen = window.matchMedia( "(max-width: 960px)" ).matches;
	    var dialog = {controller: DialogController, templateUrl: 'modules/justice/dlgShowFineDetails.html', parent: angular.element(document.body), targetEvent: ev, clickOutsideToClose: true, fullscreen: useFullScreen};
	    
	    $mdDialog.show(dialog);
		
	}
	
	/**
	 * Links the fine to an expense
	 */
	$scope.linkToExpense = function(fine, ev) {
		
	    expensesService.linkExpense(function(answer) {
	    	
	    	fine.linkedPaymentId = answer.id;

	    	$scope.fillPaymentInfo(fine);
	    	
	    	$http.put(microservicesProtocol + "://" + microservicesUrl + "/justice/fines/" + fine.id, {linkedPaymentId: answer.id});
	    	
	    }, function() {});
	}
	
	/**
	 * Complete the payment info 
	 */
	$scope.fillPaymentInfo = function(fine) {
		
		$http.get(microservicesProtocol + "://" + microservicesUrl + "/expenses/expenses/" + fine.linkedPaymentId).success(function (data, status, header, config) {
			
			fine.paymentDate = data.date;
			fine.paymentDescription = data.description;
			
		});
	}

	
	$scope.init();

} ]);

/* ********************************************************************************************************************************************************
 * EQUITALIA
 * ********************************************************************************************************************************************************/
justiceModule.controller("justiceEquitaliaController", [ '$scope', '$http', '$timeout', '$mdDialog', '$mdSidenav', 'expensesService', function($scope, $http, $timeout, $mdDialog, $mdSidenav, expensesService) {

	$scope.init = function() {
		
		$scope.getBills();
	}
	
	/**
	 * Retrieves the bills
	 */
	$scope.getBills = function() {
		
		$http.get(microservicesProtocol + "://" + microservicesUrl + "/justice/equitalia/bills/").success(function (data, status, header, config) {

			$scope.bills = data.bills;
			
			if ($scope.bills != null) {
				for (i=0; i<$scope.bills.length;i++) {
					if ($scope.bills[i].linkedPaymentId != null) $scope.fillPaymentInfo($scope.bills[i]);
				}
			}
			
		});
	}
	
	/**
	 * Adds a bill
	 */
	$scope.addBill = function(ev) {
		
		function DialogController($scope, $mdDialog) {
			
			$scope.hide = function() {$mdDialog.hide;};
			$scope.cancel = function() {$mdDialog.cancel();};
			$scope.answer = function(bill) {$mdDialog.hide(bill);};
			
		}
		
	    var useFullScreen = window.matchMedia( "(max-width: 960px)" ).matches;
	    var dialog = {controller: DialogController, templateUrl: 'modules/justice/dlgAddEquitaliaBill.html', parent: angular.element(document.body), targetEvent: ev, clickOutsideToClose: true, fullscreen: useFullScreen};
	    
	    $mdDialog.show(dialog).then(function(answer) {
	    	
	    	$scope.bill = new Object();
	    	$scope.bill.amount = answer.amount;
	    	$scope.bill.date = answer.date;
	    	$scope.bill.reference = answer.reference;
	    	$scope.bill.description = answer.description;
	    	$scope.bill.details = answer.details;
	    	$scope.bill.ravPaymentData = answer.ravPaymentData;
	    	
	    	$scope.bills.push($scope.bill);
	    	
	    	$http.post(microservicesProtocol + "://" + microservicesUrl + "/justice/equitalia/bills", $scope.bill).success(function(data, status, header, config) {
	    		$scope.bill.id = data.id;
			});
	    	
	    }, function() {});

	}
	
	/**
	 * Show the details of the bill
	 */
	$scope.showDetails = function(bill, ev) {
		
		linkToExpense = $scope.linkToExpense;
		
		function DialogController($scope, $mdDialog) {
			
			$scope.bill = bill;
			$scope.hide = function() {$mdDialog.hide;};
			$scope.cancel = function() {$mdDialog.cancel();};
			$scope.linkToExpense = linkToExpense;
		}
		
	    var useFullScreen = window.matchMedia( "(max-width: 960px)" ).matches;
	    var dialog = {controller: DialogController, templateUrl: 'modules/justice/dlgShowEquitaliaBillDetails.html', parent: angular.element(document.body), targetEvent: ev, clickOutsideToClose: true, fullscreen: useFullScreen};
	    
	    $mdDialog.show(dialog);
		
	}
	
	/**
	 * Links the bill to an expense
	 */
	$scope.linkToExpense = function(bill, ev) {
		
		expensesService.linkExpense(function(answer) {
	    	
	    	bill.linkedPaymentId = answer.id;

	    	$scope.fillPaymentInfo(bill);
	    	
	    	$http.put(microservicesProtocol + "://" + microservicesUrl + "/justice/equitalia/bills/" + bill.id, {linkedPaymentId: answer.id});
	    	
	    }, function() {});
	}
	
	/**
	 * Complete the payment info 
	 */
	$scope.fillPaymentInfo = function(bill) {
		
		$http.get(microservicesProtocol + "://" + microservicesUrl + "/expenses/expenses/" + bill.linkedPaymentId).success(function (data, status, header, config) {
			
			bill.paymentDate = data.date;
			bill.paymentDescription = data.description;
			
		});
	}

	
	$scope.init();

} ]);

