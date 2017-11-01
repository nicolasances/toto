var monrealeModule = angular.module("monrealeModule", ["expensesServiceModule"]);
	
monrealeModule.controller("monrealeController", [ '$scope', '$http', '$timeout', '$mdDialog', '$mdSidenav', 'expensesService', function($scope, $http, $timeout, $mdDialog, $mdSidenav, expensesService) {

	$scope.init = function() {
		
		$http.get("https://" + microservicesUrl + "/monreale/incomes/sum").success(function(data, status, header, config) {
			$scope.sumOfIncomes = data.sum;
			
			$http.get("https://" + microservicesUrl + "/monreale/charges/sum").success(function(data, status, header, config) {
				$scope.sumOfCharges = data.sum;
				
				$scope.safeAmount = $scope.sumOfIncomes - $scope.sumOfCharges;
			});
		});
		
		$http.get("https://" + microservicesUrl + "/monreale/incomes?maxResults=1").success(function(data, status, header, config) {
			
			if (data.incomes != null && data.incomes.length > 0) $scope.lastIncome = data.incomes[0];
			
		});
		
		$http.get("https://" + microservicesUrl + "/monreale/taxes?unpaied=true").success(function(data, status, header, config) {

			$scope.taxesUnpaiedAmount = 0;
			
			if (data.taxes != null) {
				for (i=0;i<data.taxes.length;i++) {
					$scope.taxesUnpaiedAmount += data.taxes[i].amount;
				}
				
				$scope.taxesUnpaied = data.taxes.length;
			}
			
		});
		
		$http.get("https://" + microservicesUrl + "/monreale/ebills?unpaied=true").success(function(data, status, header, config) {
			
			$scope.ebillsUnpaiedAmount = 0;
			if (data.bills != null) {
				for (i=0;i<data.bills.length;i++) {
					$scope.ebillsUnpaiedAmount += data.bills[i].amount;
				}
				
				$scope.ebillsUnpaied = data.bills.length;
			}
		});
		
		$http.get("https://" + microservicesUrl + "/monreale/gbills?unpaied=true").success(function(data, status, header, config) {
			
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
 * INCOMES 
 * ********************************************************************************************************************************************************/
monrealeModule.controller("monrealeIncomesController", [ '$scope', '$http', '$timeout', '$mdDialog', '$mdSidenav', function($scope, $http, $timeout, $mdDialog, $mdSidenav) {

	$scope.init = function() {
		
		$scope.incomes = [];
		
		$scope.generateCalendar();
		$scope.getIncomes();
	}
	
	/**
	 * Retrieves the incomes and updates the calendar of received payments 
	 */
	$scope.getIncomes = function() {

		var curYear = moment().format('YYYY');
		var lastYear = parseInt(moment().format('YYYY')) - 1;
		
    	$http.get("https://" + microservicesUrl + "/monreale/incomes?year=" + curYear + "," + lastYear).success(function(data, status, header, config) {
    		$scope.incomes = data.incomes;
    		
    		for (i=0; i<$scope.incomes.length; i++) {
    			var year = parseInt(moment($scope.incomes[i].periodTo).format('YYYY'));
    			var month = moment($scope.incomes[i].periodTo).format('MMMM');
    			
    			$scope.markMonthAsPaied(year, month);
    		}
		});
	}
	
	/**
	 * Marks the provided month as paied (income received)
	 */
	$scope.markMonthAsPaied = function(year, month) {
		
		for (y=0;y<$scope.years.length;y++) {
			if ($scope.years[y].year == year) {
				for (m=0;m<$scope.years[y].monthes.length;m++) {
					if ($scope.years[y].monthes[m].month == month) {
						$scope.years[y].monthes[m].paied = true;
						return;
					}
				}
			}
		}
	}
	
	/**
	 * Mark an income as paied on the calendar
	 */
	$scope.markIncomeOnCalendar = function(income) {
		var year = parseInt(moment(income.periodTo).format('YYYY'));
		var month = moment(income.periodTo).format('MMMM');
		
		$scope.markMonthAsPaied(year, month);
	}
	
	/**
	 * Generate a calendar with the last two years
	 */
	$scope.generateCalendar = function() {
		
		var currentYear = {year: parseInt(moment().format('YYYY')), monthes: []};
		var lastYear = {year: currentYear.year - 1, monthes: []};
		
		for (i = 1; i <= 12; i++) {
			currentYear.monthes.push({month: moment(i, 'M').format('MMMM'), paied: false});
			lastYear.monthes.push({month: moment(i, 'M').format('MMMM'), paied: false});
		}
		
		$scope.years = [currentYear, lastYear];
		
	}
	
	/**
	 * Add a new income
	 */
	$scope.addIncome = function(ev) {
		
		function DialogController($scope, $mdDialog) {
			
			$scope.hide = function() {$mdDialog.hide;};
			$scope.cancel = function() {$mdDialog.cancel();};
			$scope.answer = function(income) {$mdDialog.hide(income);};
			
		}
		
	    var useFullScreen = window.matchMedia( "(max-width: 960px)" ).matches;
	    var dialog = {controller: DialogController, templateUrl: 'modules/monreale/dlgAddIncome.html', parent: angular.element(document.body), targetEvent: ev, clickOutsideToClose: true, fullscreen: useFullScreen};
	    
	    $mdDialog.show(dialog).then(function(answer) {
	    	

	    	$scope.income = new Object();
	    	$scope.income.amount = 600.00;
	    	$scope.income.date = new Date();
	    	$scope.income.periodFrom = new Date(moment(answer.year + '' + moment(answer.month, 'MMMM').format('MM') + '23', 'YYYYMMDD').subtract(1, 'months'));
	    	$scope.income.periodTo = new Date(moment(answer.year + '' + moment(answer.month, 'MMMM').format('MM') + '23', 'YYYYMMDD'));
	    	
	    	$scope.incomes.push($scope.income);
	    	$scope.markIncomeOnCalendar($scope.income);
	    	
	    	$http.post("https://" + microservicesUrl + "/monreale/incomes", $scope.income).success(function(data, status, header, config) {
	    		$scope.income.id = data.id;
			});
	    	
	    }, function() {});
	}
	
	$scope.init();

} ]);


/* ********************************************************************************************************************************************************
 * BUILDING TAXES 
 * ********************************************************************************************************************************************************/
monrealeModule.controller("monrealeTaxesController", [ '$scope', '$http', '$timeout', '$mdDialog', '$mdSidenav', 'expensesService', function($scope, $http, $timeout, $mdDialog, $mdSidenav, expensesService) {

	$scope.init = function() {
		
		$scope.getTaxes();
	}

	/**
	 * Retrieves the taxes
	 */
	$scope.getTaxes = function() {
		$http.get("https://" + microservicesUrl + "/monreale/taxes").success(function(data, status, header, config) {
			$scope.taxes = data.taxes;
			
			if ($scope.taxes != null && $scope.taxes.length > 0) {
				for (i=0;i<$scope.taxes.length;i++) {
					$scope.taxes[i].paied = false;

					if ($scope.taxes[i].linkedPaymentId != null) $scope.taxes[i].paied = true;
					if ($scope.taxes[i].paiedOn != null) $scope.taxes[i].paied = true;
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
	    var dialog = {controller: DialogController, templateUrl: 'modules/monreale/dlgAddBuildingTax.html', parent: angular.element(document.body), targetEvent: ev, clickOutsideToClose: true, fullscreen: useFullScreen};
	    
	    $mdDialog.show(dialog).then(function(answer) {

	    	$scope.tax = new Object();
	    	$scope.tax.amount = answer.amount;
	    	$scope.tax.period = answer.period;
	    	$scope.tax.year = answer.year;
	    	
	    	$scope.taxes.push($scope.tax);
	    	
	    	$http.post("https://" + microservicesUrl + "/monreale/taxes", $scope.tax).success(function(data, status, header, config) {
	    		$scope.tax.id = data.id;
	    		$scope.tax.paied = false;
			});
	    	
	    }, function() {});
	}

	/**
	 * Charges the tax of an amount that's going to be taken from the safe
	 */
	$scope.charge = function(tax) {
		
		var dlg = $mdDialog.prompt().title('Amount to be charged on the Safe').placeholder('Amount').ok('Done').cancel('Cancel');
		
		$mdDialog.show(dlg).then(function(result) {
			
			tax.chargedAmount = result;
			
			$http.put("https://" + microservicesUrl + "/monreale/taxes/" + tax.id, {chargedAmount: result});

		});
    	
	}
	
	/**
	 * Links the bill to a sustained expense
	 */
	$scope.payTax = function(tax) {
		
    	$http.put("https://" + microservicesUrl + "/monreale/taxes/" + tax.id, {paied: true});
    	
    	tax.paied = true;
    	tax.paiedOn = new Date();
	}
	
	$scope.init();
	
} ]);

/* ********************************************************************************************************************************************************
 * ELECTRICITY 
 * ********************************************************************************************************************************************************/
monrealeModule.controller("monrealeElectricityController", [ '$scope', '$http', '$timeout', '$mdDialog', '$mdSidenav', 'expensesService', function($scope, $http, $timeout, $mdDialog, $mdSidenav, expensesService) {
	
	$scope.init = function() {
		
		$scope.getBills();
		
	}

	/**
	 * Retrieves the bills
	 */
	$scope.getBills = function() {
		$http.get("https://" + microservicesUrl + "/monreale/ebills").success(function(data, status, header, config) {
			$scope.bills = data.bills;
			
			if ($scope.bills != null && $scope.bills.length > 0) {
				for (i=0;i<$scope.bills.length;i++) {
					$scope.bills[i].paied = false;

					if ($scope.bills[i].linkedPaymentId != null) $scope.bills[i].paied = true;
					if ($scope.bills[i].paiedOn != null) $scope.bills[i].paied = true;
				}
			}
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
	    var dialog = {controller: DialogController, templateUrl: 'modules/monreale/dlgAddElectricityBill.html', parent: angular.element(document.body), targetEvent: ev, clickOutsideToClose: true, fullscreen: useFullScreen};
	    
	    $mdDialog.show(dialog).then(function(answer) {

	    	$scope.bill = new Object();
	    	$scope.bill.amount = answer.amount;
	    	$scope.bill.reference = answer.reference;
	    	$scope.bill.periodFrom = {year: answer.periodFromYear, month: moment(answer.periodFromMonth, 'MMMM').format('MM')};
	    	$scope.bill.periodTo = {year: answer.periodToYear, month: moment(answer.periodToMonth, 'MMMM').format('MM')};
	    	
	    	$scope.bills.push($scope.bill);
	    	
	    	$http.post("https://" + microservicesUrl + "/monreale/ebills", $scope.bill).success(function(data, status, header, config) {
	    		$scope.bill.id = data.id;
	    		$scope.bill.paied = false;
			});
	    	
	    }, function() {});
	}

	/**
	 * Charges the bill of an amount that's going to be taken from the safe
	 */
	$scope.charge = function(bill) {
		
		var dlg = $mdDialog.prompt().title('Amount to be charged on the Safe').placeholder('Amount').ok('Done').cancel('Cancel');
		
		$mdDialog.show(dlg).then(function(result) {
			
			bill.chargedAmount = result;
			
			$http.put("https://" + microservicesUrl + "/monreale/ebills/" + bill.id, {chargedAmount: result});

		});
    	
	}
	
	/**
	 * Links the bill to a sustained expense
	 */
	$scope.payBill = function(bill) {
		
    	$http.put("https://" + microservicesUrl + "/monreale/ebills/" + bill.id, {paied: true});
    	
    	bill.paied = true;
    	bill.paiedOn = new Date();
	}
	
	$scope.init();
	
} ]);

/* ********************************************************************************************************************************************************
 * GAS
 * ********************************************************************************************************************************************************/
monrealeModule.controller("monrealeGasController", [ '$scope', '$http', '$timeout', '$mdDialog', '$mdSidenav', 'expensesService', function($scope, $http, $timeout, $mdDialog, $mdSidenav, expensesService) {
	
	$scope.init = function() {
		
		$scope.getBills();
		
	}

	/**
	 * Retrieves the bills
	 */
	$scope.getBills = function() {
		$http.get("https://" + microservicesUrl + "/monreale/gbills").success(function(data, status, header, config) {
			$scope.bills = data.bills;
			
			if ($scope.bills != null && $scope.bills.length > 0) {
				for (i=0;i<$scope.bills.length;i++) {
					$scope.bills[i].paied = false;

					if ($scope.bills[i].linkedPaymentId != null) $scope.bills[i].paied = true;
					if ($scope.bills[i].paiedOn != null) $scope.bills[i].paied = true;
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
	    var dialog = {controller: DialogController, templateUrl: 'modules/monreale/dlgAddGasBill.html', parent: angular.element(document.body), targetEvent: ev, clickOutsideToClose: true, fullscreen: useFullScreen};
	    
	    $mdDialog.show(dialog).then(function(answer) {

	    	$scope.bill = new Object();
	    	$scope.bill.amount = answer.amount;
	    	$scope.bill.reference = answer.reference;
	    	$scope.bill.periodFrom = {year: answer.periodFromYear, month: moment(answer.periodFromMonth, 'MMMM').format('MM')};
	    	$scope.bill.periodTo = {year: answer.periodToYear, month: moment(answer.periodToMonth, 'MMMM').format('MM')};
	    	
	    	$scope.bills.push($scope.bill);
	    	
	    	$http.post("https://" + microservicesUrl + "/monreale/gbills", $scope.bill).success(function(data, status, header, config) {
	    		$scope.bill.id = data.id;
	    		$scope.bill.paied = false;
			});
	    	
	    }, function() {});
	}

	/**
	 * Charges the bill of an amount that's going to be taken from the safe
	 */
	$scope.charge = function(bill) {
		
		var dlg = $mdDialog.prompt().title('Amount to be charged on the Safe').placeholder('Amount').ok('Done').cancel('Cancel');
		
		$mdDialog.show(dlg).then(function(result) {
			
			bill.chargedAmount = result;
			
			$http.put("https://" + microservicesUrl + "/monreale/gbills/" + bill.id, {chargedAmount: result});

		});
    	
	}
	
	/**
	 * Links the bill to a sustained expense
	 */
	$scope.payBill = function(bill) {
		
    	$http.put("https://" + microservicesUrl + "/monreale/gbills/" + bill.id, {paied: true});
    	
    	bill.paied = true;
    	bill.paiedOn = new Date();
	}
	
	$scope.init();
	

} ]);

/* ********************************************************************************************************************************************************
 * CHARGES ON SAFE
 * ********************************************************************************************************************************************************/
monrealeModule.controller("monrealeChargesController", [ '$scope', '$http', '$timeout', '$mdDialog', '$mdSidenav', 'expensesService', function($scope, $http, $timeout, $mdDialog, $mdSidenav, expensesService) {
	
	$scope.init = function() {
		
		$scope.getCharges();
	}
	
	$scope.getCharges = function() {
		
		$http.get("https://" + microservicesUrl + "/monreale/charges").success(function (data, status, header, config) {
			$scope.charges = data.charges;
		});
		
	}
	
	/**
	 * Add a charge
	 */
	$scope.addCharge = function(ev) {
		
		function DialogController($scope, $mdDialog) {
			
			$scope.hide = function() {$mdDialog.hide;};
			$scope.cancel = function() {$mdDialog.cancel();};
			$scope.answer = function(charge) {$mdDialog.hide(charge);};
			
		}
		
	    var useFullScreen = window.matchMedia( "(max-width: 960px)" ).matches;
	    var dialog = {controller: DialogController, templateUrl: 'modules/monreale/dlgAddCharge.html', parent: angular.element(document.body), targetEvent: ev, clickOutsideToClose: true, fullscreen: useFullScreen};
	    
	    $mdDialog.show(dialog).then(function(answer) {

	    	$scope.charge = new Object();
	    	$scope.charge.amount = answer.amount;
	    	$scope.charge.description = answer.description;
	    	$scope.charge.date = answer.date;
	    	$scope.charge.type = answer.loan ? 'loan' : 'reimbursement';
	    	
	    	if ($scope.charges == null) $scope.charges = new Array();
	    	$scope.charges.push($scope.charge);
	    	
	    	$http.post("https://" + microservicesUrl + "/monreale/charges", $scope.charge).success(function(data, status, header, config) {
	    		$scope.charge.id = data.id;
			});
	    	
	    }, function() {});
	}
	
	
	$scope.init();
} ]);
