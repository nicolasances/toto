var totoDirectivesModule = angular.module('totoDirectivesModule', [ ]);

/**
 * Directive to draw an info circle.
 * 
 * Accepts the following parameters: 
 * - size 		: 		read-only and optional, it specifies the size of the circle. Supported values: 'sm' 
 * - amount 	: 		optional, it's the amount to display
 * - points 	: 		optional, it's the number of points (score) to display
 * - volume		:		optional, it's the volume (unit liters) to display
 * - svg 		: 		the SVG file of the image to use as thumbnail 
 * - actionSvg 	:	 	the SVG of the action button, if any
 */
totoDirectivesModule.directive('totoInfoCircle', function() {

	return {
		scope : {
			size : '@',
			amount : '=',
			volume : '=',
			points : '=',
			svg : '@',
			actionSvg : '@',
			action : '=', 
			nofill : '@'
		},
		templateUrl : 'directives/toto-info-circle.html'
	};
});

/**
 * Directive that draws a progress line, circle or semi-circle.
 * 
 * Accepts the following parameters:
 * 
 *  - id 	: 	the id of the component
 *  
 *  - type 	: 	the type of bar to draw. Can be 'line' to draw a line progress
 * 				'circle' to draw a circular progress The Default is 'circle'
 * 
 *  - svg 	: 	the path of a svg to display as background of the circle progress.
 *  
 *  - label	:	an optional label variable to put under the circle
 *  
 *  - unit	:	an optional unit of measure in which the label is represented (e.g. 'l' for liters)
 *  
 * Only works for circle progress
 */
totoDirectivesModule.directive('totoProgress', [ '$timeout', function($timeout) {

	return {
		progress : {},
		scope : {
			id : '@',
			svg : '@',
			color : '@',
			strokeWidth : '@',
			type : '@',
			progress : '=',
			showPercentage : '@', 
			label : '=', 
			unit : "@",
			click: '='
		},
		templateUrl : 'directives/toto-progress.html',
		link : function(scope) {

			var progress;

			scope.$watch("progress", function(newValue, oldValue) {
				
				var trailWidth = scope.trailWidth == null ? 1 : scope.trailWidth;
				var strokeWidth = scope.strokeWidth == null ? 6 : scope.strokeWidth;
				
				if (scope.type == null || scope.type == 'circle') {
					
					if (progress == null) {
						progress = new ProgressBar.Circle('#' + scope.id, {
							strokeWidth : strokeWidth,
							easing : 'easeInOut',
							duration : 1400,
							color : scope.color,
							trailColor : '#e0e0e0',
							trailWidth : trailWidth,
							svgStyle : null
						});
					}
				} else if (scope.type == 'line') {

					if (progress == null) {
						progress = new ProgressBar.Line('#' + scope.id, {
							strokeWidth : strokeWidth,
							easing : 'easeInOut',
							duration : 1400,
							color : scope.color,
							trailColor : '#eee',
							trailWidth : trailWidth,
							svgStyle : {
								width : '100%',
								height : '100%'
							}
						});
					}
				} else if (scope.type == 'fill') {
				}
				
				var progressValue = newValue;
				if (progressValue > 1) progressValue = 1;
				if (progressValue < 0) progressValue = 0;
				if (progressValue == 1 && (scope.type == null || scope.type == 'circle')) {
					progress.destroy();
					progress = new ProgressBar.Circle('#' + scope.id, {
						strokeWidth : strokeWidth,
						easing : 'easeInOut',
						duration : 1400,
						color : '#8BC34A',
						trailColor : '#e0e0e0',
						trailWidth : trailWidth,
						svgStyle : null
					});
					
					if (oldValue > 1) oldValue = 1;
					progress.set(oldValue);
				}

				if (newValue != null && scope.type != 'fill') progress.animate(progressValue);
				
				scope.percentage = progressValue * 100;

				var svgOffsetHeight = document.querySelector('#' + scope.id).parentNode.offsetHeight;
//				document.querySelector('#' + scope.id + ' .toto-progress-overlay').style.height = svgOffsetHeight + 'px';
			});
		}
	};
} ]);

/**
 * Directive to manage the home toto sidemenu.
 * 
 * The sidemenu shows the list of available apps
 */
totoDirectivesModule.directive('totoAppsSidemenu', [ '$timeout', '$rootScope', function($timeout, $rootScope) {

	return {
		scope : {},
		templateUrl : 'directives/toto-apps-sidemenu.html',
		link : function(scope) {
			scope.totoAppList = totoAppList;

			/**
			 * Goes to the app
			 */
			scope.go = function(app) {
				$rootScope.go('/' + app.id);
				document.querySelector('toto-apps-sidemenu').classList.remove('visible');
			}
		}
	};

} ]);

/**
 * Directive that shows an SVG and displays text inside of it
 * 
 * Accepts the following parameters:
 *  - svgPath 		: 	the path of the svg to display 
 *  
 *  - text 			: 	the text to insert 
 *  					It can be a scope var
 *  
 *  - paddingTop 	: 	the optional padding to add to the top of the text 
 *  
 *  - fill 			: 	the fill of the svg icon
 */
totoDirectivesModule.directive('totoImageText', [ '$timeout', function($timeout) {

	return {
		scope : {
			svgPath : '@',
			text : '=',
			paddingTop : '@',
			fill : '@'
		},
		templateUrl : 'directives/toto-image-text.html',
		link : function(scope) {
		}
	};
} ]);

/**
 * Directive that shows a measurement widget.
 * 
 * The measurement widget is a widget done like this: - SVG Image (e.g. a heart
 * for a heartbit measurement) - Value measured (e.g. the heart rate) - Unit of
 * measure (e.g. bpm for the heart rate)
 * 
 * 
 * Accepts the following parameters:
 *  - svgPath : the (mandatory) path of the svg to display - value : the
 * (mandatory) measured value - unit : the (optional) unit of measure of the
 * measurement - fill : the (optional) fill of the svg icon
 */
totoDirectivesModule.directive('totoMeasurementWidget', function() {

	return {
		scope : {
			svgPath : '@',
			value : '@',
			unit : '@',
			fill : '@'
		},
		templateUrl : 'directives/toto-measurement-widget.html',
		link : function(scope) {
		}
	};
});

/**
 * In app navigator that replaces menus in app
 */
totoDirectivesModule.directive('totoAppNavigator', function($rootScope) {

	return {
		scope : {
			menus : '='
		},
		templateUrl : 'toto-templates/toto-app-navigator.html',
		link : function(scope) {
			scope.go = $rootScope.go;
		}
	};
});

/**
 * App menu
 */
totoDirectivesModule.directive('totoAppMenu', function($rootScope) {

	return {
		scope : {
			menus : '='
		},
		templateUrl : 'toto-templates/toto-app-menu.html',
		link : function(scope) {
			scope.go = $rootScope.go;
		}
	};
});

/**
 * Bar Graph. 
 * Displays a bar graph with the provided values. 
 * Values are provided as an array of bars  
 * 
 * Requires: 
 * 
 *  -	widgetId	:	mandatory
 *  					a unique identifier for this widget
 * 
 * 	-	bars		:	mandatory
 * 						an [] of bars
 * 						each bar is an object {value : any number, label : any string}
 */
totoDirectivesModule.directive('totoBarGraph', function($rootScope, $timeout, $interval) {
	
	return {
		scope : {
			bars : '=',
			widgetId : '@',
			showValues : '@'
		},
		templateUrl : 'directives/toto-bar-graph.html',
		link : function(scope) {
			
			/**
			 * Creates the bars related to the gym info that has been loaded
			 */
			scope.buildGraph = function() {
				
				if (scope.bars == null) return;
				
				var containerWidth = document.querySelector('#' + scope.widgetId).offsetWidth;
				var containerHeight = 100;
				
				document.querySelector('#' + scope.widgetId).style.height = containerHeight + "px";
				document.querySelector('#' + scope.widgetId).parentNode.style.height = containerHeight + "px";
				
				var maxBarHeight = 90;
				var maxScore = scope.getMaxScore();
				var heightRatio = maxBarHeight / maxScore;
				var barGutter = 2;
				var delay = 6;
				var barWidth;
				
				for (var i = 0; i < scope.bars.length; i++) {
					
					var bar = scope.bars[i];
					var element = document.getElementById(i + '-' + scope.widgetId + '-bar');
					var elementLabel = document.getElementById(i + '-' + scope.widgetId + '-label');
					var elementValue = document.getElementById(i + '-' + scope.widgetId + '-value');
					
					if (element == null) continue;
					
					barWidth = element.offsetWidth;
					
					element.style.left = barGutter + (i * (barWidth + 2 * barGutter)) + 'px';
					
					scope.animateBar(element, bar.value * heightRatio);
					
					elementValue.style.bottom = bar.value * heightRatio + 3 + 'px';
					elementValue.style.width = barWidth + 'px';
					elementValue.style.left = element.style.left;
					
					elementLabel.style.width = barWidth + 'px';
					elementLabel.style.left = barGutter + (i * (barWidth + 2 * barGutter)) + 'px';
					elementLabel.innerHTML = bar.label;
					
				}
				
				document.querySelector('#' + scope.widgetId).style.width = scope.bars.length * barWidth + barGutter + scope.bars.length * 2 * barGutter + 'px';
			}
			
			/**
			 * Retrieves the max score in the provided days
			 */
			scope.getMaxScore = function() {
				
				var maxScore = 1;
				for (var i = 0; i < scope.bars.length; i++) {
					
					if (scope.bars[i].value > maxScore) {
						
						maxScore = scope.bars[i].value;
					}
				}
				
				return maxScore;
			}
			
			/**
			 * Creates the animation that makes the bar go from height 0 to the target height.
			 */
			scope.animateBar = function(element, targetHeight) {
				
				if (targetHeight == 0) return;
				
				if (scope.intervals == null) scope.intervals = {};
				
				scope.intervals[element.id] = $interval(function() {
					
					var currentHeight = element.offsetHeight;
					
					currentHeight += 2; 
					
					element.style.height= currentHeight + 'px';
					
					if (currentHeight >= targetHeight) {
						currentHeight = targetHeight;
						$interval.cancel(scope.intervals[element.id]);
					}
					
				}, 10);
				
			}
			
			/**
			 * Delays the appearance of the given element. The element must be in display: none and will be turned
			 * after the specified delay into display: block
			 */
			scope.delayAppear = function(element, delayInMs) {
				
				$timeout(function() {element.style.display = 'block';}, delayInMs);
				
			}
			
			$timeout(scope.buildGraph, 300);
		}
	};
});
