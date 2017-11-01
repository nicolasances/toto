var totoChimpInfoDirectivesModule = angular.module('totoChimpInfoDirectivesModule', [ ]);

/**
 * Directive that manages links displayed by the toto chimp
 * 
 * It requires the following parameters: 
 * 
 *  - link		:	an object {text: string, url: string}
 *  				it's mandatory and the url is used with the $rootScope.go() function
 */
totoChimpInfoDirectivesModule.directive('totoChimpInfoLink', [ '$timeout', '$rootScope', function($timeout, $rootScope) {

	return {
		scope : {
			link: '='
		},
		templateUrl : 'directives/toto-chimp-info-link.html',
		link : function(scope) {
			
			scope.go = $rootScope.go;

		}
	};
} ]);

/**
 * Directive that manages the display of a single task
 * 
 * It requires the following parameters: 
 * 
 *  - task		:	an object {id: string, title: string, completed: boolean }
 *  				it's mandatory 
 */
totoChimpInfoDirectivesModule.directive('totoChimpInfoTask', [ '$timeout', '$rootScope', function($timeout, $rootScope) {

	return {
		scope : {
			task: '='
		},
		templateUrl : 'directives/toto-chimp-info-task.html',
		link : function(scope) {
			
			scope.go = $rootScope.go;

		}
	};
} ]);

/**
 * Directive that manages the display of a single expense
 * 
 * It requires the following parameters: 
 * 
 *  - expense	:	an object {}
 */
totoChimpInfoDirectivesModule.directive('totoChimpInfoExpense', [ '$timeout', '$rootScope', function($timeout, $rootScope) {

	return {
		scope : {
			expense: '='
		},
		templateUrl : 'directives/toto-chimp-info-expense.html',
		link : function(scope) {
			
			scope.go = $rootScope.go;

		}
	};
} ]);


/**
 * Directive that manages a list of generic strings
 * 
 * It requires the following parameters: 
 * 
 *  - list		:	an list of strings ["", "", ""]
 *  				it's mandatory
 */
totoChimpInfoDirectivesModule.directive('totoChimpInfoList', [ '$timeout', '$rootScope', function($timeout, $rootScope) {

	return {
		scope : {
			list: '='
		},
		templateUrl : 'directives/toto-chimp-info-list.html',
		link : function(scope) {

		}
	};
} ]);

