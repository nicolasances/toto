var bodyWeightServiceModule = angular.module('BodyWeightServiceModule', []);

bodyWeightServiceModule.factory('BodyWeightService', [ '$http', '$rootScope', '$location', '$mdDialog', function($http, $rootScope, $location, $mdDialog) {

	return {

		/**
		 * Retrieves the list of weights
		 * 
		 * Returns a promise with the weights in the following format:
		 *  
		 * {	weekOfYear:		integer (week of the year)
		 * 		year:			integer
		 * 		weight: 		double
		 * 		id:				string
		 * }
		 * 
		 */
		getWeights : function() {
			
			return $http.get(microservicesProtocol + "://" + microservicesUrl + "/weight/weights");
			
		}, 
		
		/**
		 * Retrieves the current weight
		 * 
		 * Requires a callback function(weight) to which it will return the current weight:
		 *  
		 * {	weekOfYear:		integer (week of the year)
		 * 		year:			integer
		 * 		weight: 		double
		 * 		id:				string
		 * }
		 * 
		 */
		getCurrentWeight : function(callback) {
			
			$http.get(microservicesProtocol + "://" + microservicesUrl + "/weight/weights?current=true").success(function(data) {
				
				
				if (data.weights.length > 0) callback(data.weights[0]);
				else callback({weight: 0});
			});
		},
		
		/**
		 * Shows the UI for adding a new weight. 
		 * 
		 * Requires: 
		 * 
		 * 	-	onWeightCreated : 	a callback function that is going to be called when the weight is created (but not persisted).
		 * 							the callback is a function(data) where data is 
		 * 							{weekOfYear: integer, year: integer, weight: double}
		 * 
		 */
		showAddWeightUI : function(onWeightCreated) {

			function DialogController($scope, $mdDialog) {

				$scope.cancel = function() {$mdDialog.cancel();}
				
				$scope.answer = function(answer) {
					
					var selectedDate = moment($scope.pickedDate);
					var weekOfYear = selectedDate.format('w');
					var year = selectedDate.format('YYYY');
					
					$scope.w = {
						weight: $scope.weight,
						weekOfYear: weekOfYear,
						year: year
					};
					
					
					$mdDialog.hide($scope.w);
				}

			}

			var useFullScreen = false;
			var dialog = {controller : DialogController, templateUrl : 'modules/gym/dlgAddWeight.html', parent : angular.element(document.body), clickOutsideToClose : true, fullscreen : useFullScreen};

			$mdDialog.show(dialog).then(onWeightCreated, function() {});
			
		}, 
		
		/**
		 * Post the provided weight calling the appropriate API.
		 * 
		 * Requires: 
		 * 
		 * 	-	weight :	an JSON object {weekOfYear: integer, year: integer, weight: double}
		 * 
		 * Returns a promise that will return the id of the created weight as a {id: string}
		 */
		postWeight : function(weight) {
			
			return $http.post(microservicesProtocol + "://" + microservicesUrl + "/weight/weights", weight);
		},
		
		/**
		 * Creates the graph showing the weight curve. 
		 * 
		 * Requires: 
		 * 
		 * 	-	weights	:	an array of weight objects. 
		 * 					Each weight object is a {weekOfYear: integer, year: integer, weight: double}
		 * 
		 * This function directly modifies the DOM. 
		 * It modifies elements with the id convention = 'weight-[year]-[weekOfYear]'
		 */
		createWeightGraph : function(weights) {
			
			var minYPos = 24;
			var minXPos = 12;
			var spotWidth = 8;
			var margin = 3;
			var yFactor = 20;
			
			var i;
			
			// 1. Find lowest value
			var lowestValue = -1;
			for (i = 0; i < weights.length; i++) {
				if (lowestValue == -1 || weights[i].weight < lowestValue) lowestValue = weights[i].weight;
			}
			
			// 2. Set x y coordinates
			for (i = 0; i < weights.length; i++) {
				var left = minXPos + i * (spotWidth + margin);
				var height = minYPos + (weights[i].weight - lowestValue) * yFactor;
				
				var id = 'weight-' + weights[i].year + '-' + weights[i].weekOfYear + '';
				var el = document.getElementById(id);
				el.style.left = left + "px";
				el.style.top = 8 + "px";
				el.style.height = height + "px";
			}
		}
		
	}

} ]);
