var piggyModule = angular.module("piggyModule", ["expensesServiceModule"]);
	
piggyModule.controller("piggyController", [ '$scope', '$http', '$timeout', '$mdDialog', '$mdSidenav', 'expensesService', function($scope, $http, $timeout, $mdDialog, $mdSidenav, expensesService) {

	$scope.init = function() {
		
		$scope.getDeposits();
	}
	
	$scope.getDeposits = function() {

		$http.get("https://" + microservicesUrl + "/piggy/deposits").success(function(data, status, header, config) {

			$scope.deposits = data.deposits;
			
			for (i=0; i<$scope.deposits.length; i++) {
				$scope.animateDeposit($scope.deposits[i]);
			}
			
		});
	}
	
	/**
	 * Starts the animation for a deposit in case it needs a widthdrawal
	 */
	$scope.animateDeposit = function(deposit) {
		
		if (deposit.status == 'deposit') $scope.toggleAnimation(deposit);
		
	}
	
	$scope.toggleAnimation = function(deposit) {
		
		if (deposit.status != 'deposit') {
			document.querySelector('#dep' + deposit.id + ' md-icon.deposit').classList.remove('transition');
			document.querySelector('#dep' + deposit.id + ' .icon-container').classList.remove('transition');
			return;
		}
		
		if (document.getElementById('dep' + deposit.id) != null) {
			if (document.querySelector('#dep' + deposit.id + ' md-icon.deposit').classList.contains('transition')) {
				document.querySelector('#dep' + deposit.id + ' md-icon.deposit').classList.remove('transition');
				document.querySelector('#dep' + deposit.id + ' .icon-container').classList.remove('transition');
			}
			else {
				document.querySelector('#dep' + deposit.id + ' md-icon.deposit').classList.add('transition');
				document.querySelector('#dep' + deposit.id + ' .icon-container').classList.add('transition');
			}
		} 
		
		if (!$scope.$$destroyed) $timeout(function () {$scope.toggleAnimation(deposit);}, 1100);
	}
	
	$scope.showDetails = function(deposit, ev) {
		
		linkToExpense = $scope.linkToExpense;
		
		function DialogController($scope, $mdDialog) {
			
			$scope.deposit = deposit;
			$scope.hide = function() {$mdDialog.hide;};
			$scope.cancel = function() {$mdDialog.cancel();};
			$scope.linkToExpense = linkToExpense;
		}
		
	    var useFullScreen = window.matchMedia( "(max-width: 960px)" ).matches;
	    var dialog = {controller: DialogController, templateUrl: 'modules/piggy/dlgShowDepositDetails.html', parent: angular.element(document.body), targetEvent: ev, clickOutsideToClose: true, fullscreen: useFullScreen};
	    
	    $mdDialog.show(dialog);
		
	}
	
	$scope.addDeposit = function(ev) {
		
		function DialogController($scope, $mdDialog) {
			
			$scope.hide = function() {$mdDialog.hide;};
			$scope.cancel = function() {$mdDialog.cancel();};
			$scope.answer = function(deposit) {$mdDialog.hide(deposit);};
			
		}
		
	    var useFullScreen = window.matchMedia( "(max-width: 960px)" ).matches;
	    var dialog = {controller: DialogController, templateUrl: 'modules/piggy/dlgAddDeposit.html', parent: angular.element(document.body), targetEvent: ev, clickOutsideToClose: true, fullscreen: useFullScreen};
	    
	    $mdDialog.show(dialog).then(function(answer) {
	    	
	    	$scope.deposit = new Object();
	    	$scope.deposit.goalAmount = answer.goalAmount;
	    	$scope.deposit.name = answer.name;
	    	$scope.deposit.startDate = answer.startDate;
	    	$scope.deposit.endDate = answer.endDate;
	    	$scope.deposit.periodicity = answer.periodicity;
	    	
	    	$scope.deposits.push($scope.deposit);
	    	
	    	$http.post("https://" + microservicesUrl + "/piggy/deposits", $scope.deposit).success(function(data, status, header, config) {
	    		$scope.deposit.id = data.id;
	    		$scope.deposit.depositAmount = data.depositAmount;
	    		$scope.deposit.deposits = new Array();
	    		$scope.deposit.status = data.status;
	    		$scope.deposit.depositedAmount = 0;
			});
	    	
	    }, function() {});

	}
	
	$scope.linkToExpense = function(deposit, ev) {
		
		var useFullScreen = window.matchMedia( "(max-width: 960px)" ).matches;
	    var dialog = {controller: expensesService.DialogController, templateUrl: 'modules/expenses/dlgLinkExpense.html', parent: angular.element(document.body), targetEvent: ev, clickOutsideToClose: true, fullscreen: useFullScreen};
	    
	    $mdDialog.show(dialog).then(function(answer) {
	    	
	    	$http.put("https://" + microservicesUrl + "/piggy/deposits/" + deposit.id, {depositDate: deposit.nextDeposit, linkedPaymentId: answer.id});
	    	
	    	for (i=0;i<$scope.deposits.length; i++) {
	    		if ($scope.deposits[i].id == deposit.id) {
	    			for (j=0; j<$scope.deposits[i].deposits.length; j++) {
	    				if ($scope.deposits[i].deposits[j].date == deposit.nextDeposit) {
	    					$scope.deposits[i].deposits[j].linkedPaymentId = answer.id;
	    					$scope.deposits[i].status = 'ok';
	    					$scope.deposits[i].depositedAmount += $scope.deposits[i].depositAmount;
	    					document.querySelector('#dep' + deposit.id + ' md-icon.deposit').style.display = 'none';
	    					break;
	    				}
	    			}
	    		}
	    	}
	    	
	    }, function() {});
	}
	
	$scope.init();
	
} ]);


