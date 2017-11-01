var supermarketServiceModule = angular.module('SupermarketServiceModule', []);

supermarketServiceModule.factory('SupermarketService', [ '$http', '$rootScope', '$location', '$mdDialog', function($http, $rootScope, $location, $mdDialog) {

	return {

		/**
		 * Retrieves the list of missing goods
		 */
		getMissingGoods : function() {
			
			return $http.get("https://" + microservicesUrl + "/supermarket/missingGoods");
			
		},
		
		/**
		 * Shows the missing good UI and gather the user's input 
		 */
		showMissingGoodUI : function(insertionCallback) {

			function DialogController($scope, $mdDialog) {
				
				$scope.hide = function() {$mdDialog.hide;};
				$scope.cancel = function() {$mdDialog.cancel();};
				$scope.answer = function(good) {$mdDialog.hide(good);};
				
			}
			
			var useFullScreen = window.matchMedia( "(max-width: 960px)" ).matches;
			var dialog = {controller: DialogController, templateUrl: 'modules/supermarket/dlgAddMissingGood.html', parent: angular.element(document.body), clickOutsideToClose: true, fullscreen: useFullScreen};
			
			$mdDialog.show(dialog).then(function(answer) {
				
				var good = new Object();
				good.amount = answer.amount;
				good.name = answer.name;
				
				insertionCallback(good);
				
			}, function() {});
			
		},

		/**
		 * Posts a missing good adding it to the list of missing stuff to be bought
		 * at the supermarket.
		 * 
		 * Requires: 
		 * 
		 *  - good		:	a JSON object {name: string, amount: integer} describing the good
		 */
		postMissingGood : function(good) {
			
			return $http.post("https://" + microservicesUrl + "/supermarket/missingGoods", good);
		}, 

		/**
		 * Sets the provided missing good as "bought"
		 * 
		 * Requires: 
		 * 
		 * 	-	goodId		:	the id of the good
		 * 
		 *  -	bought		:	true/false to set it as bought or not
		 */
		setMissingGoodAsBought : function(goodId, bought) {
			
			return $http.put("https://" + microservicesUrl + "/supermarket/missingGoods/" + goodId, {bought: bought});
		},
		
		/**
		 * Deletes the provided missing good
		 */
		deleteMissingGood : function(goodId) {
			
			return $http.delete("https://" + microservicesUrl + "/supermarket/missingGoods/" + goodId);
		}, 
		
		/**
		 * Deletes all the missing goods that have been bought
		 */
		deleteAllBoughtGoods : function() {
			
			return $http.delete("https://" + microservicesUrl + "/supermarket/missingGoods?bought=true");
		}
		
	}

} ]);
