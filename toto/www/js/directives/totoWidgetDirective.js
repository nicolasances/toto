var totoWidgetDirectiveModule = angular.module('totoWidgetDirectiveModule', [ ]);

/**
 * Directive that create a toto widget
 * 
 * Accepts the following parameters:
 * 
 *  - width 	: 	the number of horizontal cells this widget will span over 
 *  - height 	: 	the number of vertical cells this widget will span over
 *  - color		:	the color to be used (side bar)
 *  - unbounded : 	true if the widget can veritically expand 
 * 
 */
totoWidgetDirectiveModule.directive('totoWidget', [ '$timeout', '$mdMedia', function($timeout, $mdMedia) {

	return {
		progress : {},
		scope : {
			width : '@',
			height : '@',
			color: '@',
			unbounded: '@' 
		},
//		templateUrl : 'directives/toto-widget.html',
		link : function(scope, el) {
			
			var widget = el[0];
			
			widget.classList.add('flex');
			if ($mdMedia('gt-xs')) widget.classList.add('md-whiteframe-1dp');
			
			if (scope.unbounded == null || scope.unbounded == 'false') widget.classList.add('no-scroll');
			
			// Manage Widget Color			
			if (scope.color != null && scope.color != '') widget.classList.add('color-' + scope.color);
			
			// Manage Unbounded Widget
			// If it's on phone or pad, then there is no height limit, otherwise, make it as tall as the window
			if (scope.unbounded != null && scope.unbounded == 'true') {
				
				if ($mdMedia('gt-md')) {
					var dashboardHeight = document.querySelector('body').offsetHeight;
					var toolbarHeight = document.querySelector('md-toolbar').offsetHeight;
					var widgetMargin = 12;
					
					widget.style.height = (dashboardHeight - toolbarHeight - 3 * widgetMargin) + 'px';
					widget.style.minHeight = (dashboardHeight - toolbarHeight - 3 * widgetMargin) + 'px';
					
				}
				else widget.classList.add('v-unbounded');
			}
			
			
		}
	};
} ]);
