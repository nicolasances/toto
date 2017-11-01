var supermarketModule = angular.module("supermarketModule", [ "SupermarketServiceModule" ]);

var supermarketMenus = [
	
	{path: '/', imageUrl: 'images/svg/home.svg', name: "Home"},
	{path: '/supermarket', imageUrl: 'images/svg/supermarket.svg', name: "Cart", selected : true}
	
];
	
supermarketModule.controller("supermarketController", [ '$scope', '$http', '$timeout', '$mdDialog', '$mdSidenav', 'SupermarketService', function($scope, $http, $timeout, $mdDialog, $mdSidenav, SupermarketService) {

	$scope.init = function() {
		
		if (googleIdToken == null) {
			$timeout($scope.init, 100);
			return;
		}
		
		$scope.supermarketMenus = supermarketMenus;
		$scope.anyBoughtGood = false;
		
		$scope.loadMissingGoods();
	}
	
	/**
	 * Loads the missing goods in the $scope.goods variable
	 */
	$scope.loadMissingGoods = function() {
		
		SupermarketService.getMissingGoods().success(function(data) {
			
			$scope.goods = data.goods;
			
			$scope.checkIfAnyBoughtGoods();
		});
	}
	
	/**
	 * Checks if there are bought goods
	 */
	$scope.checkIfAnyBoughtGoods = function() {
		
		$scope.anyBoughtGood = false;
		
		for (var i = 0; i < $scope.goods.length; i++) {
			
			if ($scope.goods[i].bought) {
				$scope.anyBoughtGood = true;
				break;
			}
		}
	}
	
	/**
	 * Sets the good as bought
	 */
	$scope.buyGood = function(good) {
		
		SupermarketService.setMissingGoodAsBought(good.id, true);
		
		good.bought = true;
		
		$scope.checkIfAnyBoughtGoods();
	}
	
	/**
	 * Removes the good from the list of bought goods
	 */
	$scope.unbuyGood = function(good) {
		
		SupermarketService.setMissingGoodAsBought(good.id, false); 
		
		good.bought = false;
		
		$scope.checkIfAnyBoughtGoods();
	}
	
	/**
	 * Deletes all the bought goods
	 */
	$scope.clearBoughtGoods = function() {
		
		if ($scope.goods == null || $scope.goods.length == 0) return;
		
		SupermarketService.deleteAllBoughtGoods().success(function(data) {
			
			$scope.loadMissingGoods();

		});
	}
	
	/**
	 * Adds a new missing good
	 */
	$scope.addMissingGood = function() {
		
		SupermarketService.showMissingGoodUI(function(good) {
			
			$scope.addedGood = good;
			$scope.goods.push($scope.addedGood);
			
			SupermarketService.postMissingGood(good).success(function(data) {
				
				$scope.addedGood.id = data.id;
				$scope.addedGood.bought = false;
			});
		});
	}
	
	$scope.init();
	
} ]);

