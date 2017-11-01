var sangiorgioModule = angular.module("sangiorgioModule", ["expensesServiceModule"]);
	
sangiorgioModule.controller("sangiorgioController", [ '$scope', '$http', '$timeout', '$mdDialog', '$mdSidenav', 'expensesService', function($scope, $http, $timeout, $mdDialog, $mdSidenav, expensesService) {

	$scope.init = function() {
		
		$http.get("https://" + microservicesUrl + "/sangiorgio/taxes?unpaied=true").success(function(data, status, header, config) {

			$scope.taxesUnpaiedAmount = 0;
			
			if (data.taxes != null) {
				for (i=0;i<data.taxes.length;i++) {
					$scope.taxesUnpaiedAmount += data.taxes[i].amount;
				}
				
				$scope.taxesUnpaied = data.taxes.length;
			}
			
		});
		
		$http.get("https://" + microservicesUrl + "/sangiorgio/ebills?unpaied=true").success(function(data, status, header, config) {
			
			$scope.ebillsUnpaiedAmount = 0;
			if (data.bills != null) {
				for (i=0;i<data.bills.length;i++) {
					$scope.ebillsUnpaiedAmount += data.bills[i].amount;
				}
				
				$scope.ebillsUnpaied = data.bills.length;
			}
		});
		
		$http.get("https://" + microservicesUrl + "/sangiorgio/gbills?unpaied=true").success(function(data, status, header, config) {
			
			$scope.gbillsUnpaiedAmount = 0;
			if (data.bills != null) {
				for (i=0;i<data.bills.length;i++) {
					$scope.gbillsUnpaiedAmount += data.bills[i].amount;
				}
				
				$scope.gbillsUnpaied = data.bills.length;
			}
		});
		
	}
	
	$scope.init();
	
} ]);

/* ********************************************************************************************************************************************************
 * BUILDING TAXES 
 * ********************************************************************************************************************************************************/
sangiorgioModule.controller("sangiorgioTaxesController", [ '$scope', '$http', '$timeout', '$mdDialog', '$mdSidenav', 'expensesService', function($scope, $http, $timeout, $mdDialog, $mdSidenav, expensesService) {

	$scope.init = function() {
		
		$scope.getTaxes();
	}

	/**
	 * Retrieves the taxes
	 */
	$scope.getTaxes = function() {
		$http.get("https://" + microservicesUrl + "/sangiorgio/taxes").success(function(data, status, header, config) {
			$scope.taxes = data.taxes;
			
			if ($scope.taxes != null && $scope.taxes.length > 0) {
				for (i=0;i<$scope.taxes.length;i++) {
					if ($scope.taxes[i].linkedPaymentId != null) $scope.fillDetails($scope.taxes[i]);
				}
			}
		});
	}
	
	/**
	 * Add a new income
	 */
	$scope.addBuildingTax = function(ev) {
		
		function DialogController($scope, $mdDialog) {
			
			$scope.hide = function() {$mdDialog.hide;};
			$scope.cancel = function() {$mdDialog.cancel();};
			$scope.answer = function(tax) {$mdDialog.hide(tax);};
			
		}
		
	    var useFullScreen = window.matchMedia( "(max-width: 960px)" ).matches;
	    var dialog = {controller: DialogController, templateUrl: 'modules/sangiorgio/dlgAddBuildingTax.html', parent: angular.element(document.body), targetEvent: ev, clickOutsideToClose: true, fullscreen: useFullScreen};
	    
	    $mdDialog.show(dialog).then(function(answer) {

	    	$scope.tax = new Object();
	    	$scope.tax.amount = answer.amount;
	    	$scope.tax.period = answer.period;
	    	$scope.tax.year = answer.year;
	    	
	    	$scope.taxes.push($scope.tax);
	    	
	    	$http.post("https://" + microservicesUrl + "/sangiorgio/taxes", $scope.tax).success(function(data, status, header, config) {
	    		$scope.tax.id = data.id;
			});
	    	
	    }, function() {});
	}

	$scope.linkToExpense = function(tax, ev) {
		
		var useFullScreen = window.matchMedia( "(max-width: 960px)" ).matches;
	    var dialog = {controller: expensesService.DialogController, templateUrl: 'modules/expenses/dlgLinkExpense.html', parent: angular.element(document.body), targetEvent: ev, clickOutsideToClose: true, fullscreen: useFullScreen};
	    
	    $mdDialog.show(dialog).then(function(answer) {
	    	
	    	tax.linkedPaymentId = answer.id;

	    	$scope.fillDetails(tax);
	    	
	    	$http.put("https://" + microservicesUrl + "/sangiorgio/taxes/" + tax.id, {linkedPaymentId: answer.id});
	    	
	    }, function() {});
	}
	
	/**
	 * Show the details of the tax
	 */
	$scope.showDetails = function(tax, ev) {
		
		linkToExpense = $scope.linkToExpense;
		
		function DialogController($scope, $mdDialog) {
			
			$scope.tax = tax;
			$scope.hide = function() {$mdDialog.hide;};
			$scope.cancel = function() {$mdDialog.cancel();};
			$scope.linkToExpense = linkToExpense;
		}
		
	    var useFullScreen = window.matchMedia( "(max-width: 960px)" ).matches;
	    var dialog = {controller: DialogController, templateUrl: 'modules/sangiorgio/dlgShowTaxDetails.html', parent: angular.element(document.body), targetEvent: ev, clickOutsideToClose: true, fullscreen: useFullScreen};
	    
	    $mdDialog.show(dialog);
		
	}
	
	/**
	 * Add the tax to the paied taxes list 
	 */
	$scope.fillDetails = function(tax) {
		
		$http.get("https://" + microservicesUrl + "/expenses/expenses/" + tax.linkedPaymentId).success(function (data, status, header, config) {
			
			tax.paymentDate = data.date;
			tax.paymentDescription = data.description;
			
		});
	}
	
	$scope.init();
	
} ]);

/* ********************************************************************************************************************************************************
 * ELECTRICITY 
 * ********************************************************************************************************************************************************/
sangiorgioModule.controller("sangiorgioElectricityController", [ '$scope', '$http', '$timeout', '$mdDialog', '$mdSidenav', 'expensesService', function($scope, $http, $timeout, $mdDialog, $mdSidenav, expensesService) {
	
	$scope.init = function() {
		
		$scope.getBills();
		
	}

	/**
	 * Retrieves the bills
	 */
	$scope.getBills = function() {
		$http.get("https://" + microservicesUrl + "/sangiorgio/ebills").success(function(data, status, header, config) {
			$scope.bills = data.bills;
			
			if ($scope.bills != null && $scope.bills.length > 0) {
				for (i=0;i<$scope.bills.length;i++) {
					if ($scope.bills[i].linkedPaymentId != null) $scope.completeBillInfo($scope.bills[i]);
				}
			}
		});
	}
	
	/**
	 * Complete the bill information 
	 */
	$scope.completeBillInfo = function(bill) {
		
		$http.get("https://" + microservicesUrl + "/expenses/expenses/" + bill.linkedPaymentId).success(function (data, status, header, config) {
			
			bill.paymentDate = data.date;
			bill.paymentDescription = data.description;
			
		});
	}
	
	/**
	 * Add a new bill to pay
	 */
	$scope.addBill = function(ev) {
		
		function DialogController($scope, $mdDialog) {
			
			$scope.hide = function() {$mdDialog.hide;};
			$scope.cancel = function() {$mdDialog.cancel();};
			$scope.answer = function(bill) {$mdDialog.hide(bill);};
			
		}
		
	    var useFullScreen = window.matchMedia( "(max-width: 960px)" ).matches;
	    var dialog = {controller: DialogController, templateUrl: 'modules/sangiorgio/dlgAddElectricityBill.html', parent: angular.element(document.body), targetEvent: ev, clickOutsideToClose: true, fullscreen: useFullScreen};
	    
	    $mdDialog.show(dialog).then(function(answer) {

	    	$scope.bill = new Object();
	    	$scope.bill.amount = answer.amount;
	    	$scope.bill.reference = answer.reference;
	    	$scope.bill.periodFrom = {year: answer.periodFromYear, month: moment(answer.periodFromMonth, 'MMMM').format('MM')};
	    	$scope.bill.periodTo = {year: answer.periodToYear, month: moment(answer.periodToMonth, 'MMMM').format('MM')};
	    	$scope.bill.postalPaymentData = answer.postalPaymentData;
	    	
	    	$scope.bills.push($scope.bill);
	    	
	    	$http.post("https://" + microservicesUrl + "/sangiorgio/ebills", $scope.bill).success(function(data, status, header, config) {
	    		$scope.bill.id = data.id;
			});
	    	
	    }, function() {});
	}
	
	/**
	 * Show the details of the tax
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
	    var dialog = {controller: DialogController, templateUrl: 'modules/sangiorgio/dlgShowEBillDetails.html', parent: angular.element(document.body), targetEvent: ev, clickOutsideToClose: true, fullscreen: useFullScreen};
	    
	    $mdDialog.show(dialog);
		
	}

	/**
	 * Links the bill to a sustained expense
	 */
	$scope.linkToExpense = function(bill, ev) {
		
		var useFullScreen = window.matchMedia( "(max-width: 960px)" ).matches;
	    var dialog = {controller: expensesService.DialogController, templateUrl: 'modules/expenses/dlgLinkExpense.html', parent: angular.element(document.body), targetEvent: ev, clickOutsideToClose: true, fullscreen: useFullScreen};
	    
	    $mdDialog.show(dialog).then(function(answer) {
	    	
	    	bill.linkedPaymentId = answer.id;

	    	$scope.completeBillInfo(bill);
	    	
	    	$http.put("https://" + microservicesUrl + "/sangiorgio/ebills/" + bill.id, {linkedPaymentId: answer.id});
	    	
	    }, function() {});
	}
	
	$scope.init();
	
} ]);

/* ********************************************************************************************************************************************************
 * GAS
 * ********************************************************************************************************************************************************/
sangiorgioModule.controller("sangiorgioGasController", [ '$scope', '$http', '$timeout', '$mdDialog', '$mdSidenav', 'expensesService', function($scope, $http, $timeout, $mdDialog, $mdSidenav, expensesService) {
	
	$scope.init = function() {
		
		$scope.getBills();
		
	}

	/**
	 * Retrieves the bills
	 */
	$scope.getBills = function() {
		$http.get("https://" + microservicesUrl + "/sangiorgio/gbills").success(function(data, status, header, config) {
			$scope.bills = data.bills;
			
			if ($scope.bills != null && $scope.bills.length > 0) {
				for (i=0;i<$scope.bills.length;i++) {
					if ($scope.bills[i].linkedPaymentId != null) $scope.completeBillInfo($scope.bills[i]);
				}
			}
		});
	}
	
	/**
	 * Complete the bill information 
	 */
	$scope.completeBillInfo = function(bill) {
		
		$http.get("https://" + microservicesUrl + "/expenses/expenses/" + bill.linkedPaymentId).success(function (data, status, header, config) {
			
			bill.paymentDate = data.date;
			bill.paymentDescription = data.description;
			
		});
	}
	
	/**
	 * Add a new bill to pay
	 */
	$scope.addBill = function(ev) {
		
		function DialogController($scope, $mdDialog) {
			
			$scope.hide = function() {$mdDialog.hide;};
			$scope.cancel = function() {$mdDialog.cancel();};
			$scope.answer = function(bill) {$mdDialog.hide(bill);};
			
		}
		
	    var useFullScreen = window.matchMedia( "(max-width: 960px)" ).matches;
	    var dialog = {controller: DialogController, templateUrl: 'modules/sangiorgio/dlgAddGasBill.html', parent: angular.element(document.body), targetEvent: ev, clickOutsideToClose: true, fullscreen: useFullScreen};
	    
	    $mdDialog.show(dialog).then(function(answer) {

	    	$scope.bill = new Object();
	    	$scope.bill.amount = answer.amount;
	    	$scope.bill.reference = answer.reference;
	    	$scope.bill.periodFrom = {year: answer.periodFromYear, month: moment(answer.periodFromMonth, 'MMMM').format('MM')};
	    	$scope.bill.periodTo = {year: answer.periodToYear, month: moment(answer.periodToMonth, 'MMMM').format('MM')};
	    	$scope.bill.postalPaymentData = answer.postalPaymentData;
	    	
	    	$scope.bills.push($scope.bill);
	    	
	    	$http.post("https://" + microservicesUrl + "/sangiorgio/gbills", $scope.bill).success(function(data, status, header, config) {
	    		$scope.bill.id = data.id;
			});
	    	
	    }, function() {});
	}
	
	/**
	 * Show the details of the tax
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
	    var dialog = {controller: DialogController, templateUrl: 'modules/sangiorgio/dlgShowGBillDetails.html', parent: angular.element(document.body), targetEvent: ev, clickOutsideToClose: true, fullscreen: useFullScreen};
	    
	    $mdDialog.show(dialog);
		
	}
	
	/**
	 * Links the bill to a sustained expense
	 */
	$scope.linkToExpense = function(bill, ev) {
		
		var useFullScreen = window.matchMedia( "(max-width: 960px)" ).matches;
	    var dialog = {controller: expensesService.DialogController, templateUrl: 'modules/expenses/dlgLinkExpense.html', parent: angular.element(document.body), targetEvent: ev, clickOutsideToClose: true, fullscreen: useFullScreen};
	    
	    $mdDialog.show(dialog).then(function(answer) {
	    	
	    	bill.linkedPaymentId = answer.id;

	    	$scope.completeBillInfo(bill);
	    	
	    	$http.put("https://" + microservicesUrl + "/sangiorgio/gbills/" + bill.id, {linkedPaymentId: answer.id});
	    	
	    }, function() {});
	}
	
	$scope.init();
	

} ]);

