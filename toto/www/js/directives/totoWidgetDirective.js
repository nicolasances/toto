var totoWidgetDirectiveModule = angular.module('totoWidgetDirectiveModule', [ ]);

/**
 * Directive that create a toto widget
 * 
 * Accepts the following parameters:
 * 
 *  - width 	: 	the number of horizontal cells this widget will span over 
 *  
 *  - height 	: 	the number of vertical cells this widget will span over
 * 
 */
totoWidgetDirectiveModule.directive('totoWidget', [ '$timeout', '$mdMedia', function($timeout, $mdMedia) {

	return {
		progress : {},
		scope : {
			width : '@',
			height : '@',
			color: '@'
		},
//		templateUrl : 'directives/toto-widget.html',
		link : function(scope, el) {
			
			var widget = el[0];
			
			widget.classList.add('flex');
			if ($mdMedia('gt-xs')) widget.classList.add('md-whiteframe-1dp');
			
			if (scope.color != null && scope.color != '') widget.classList.add('color-' + scope.color);
			
			
		}
	};
} ]);
