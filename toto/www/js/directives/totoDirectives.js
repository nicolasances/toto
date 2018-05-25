var totoDirectivesModule = angular.module('totoDirectivesModule', [ ]);

/**
 * Directive to show the "home link"
 * 
 * Accepts the following parameters: 
 */
totoDirectivesModule.directive('homeLink', function($rootScope, $window) {
	
	return {
		scope : {
			back: '@'
		},
		templateUrl : 'directives/home-link.html',
		link : function(scope, el) {
			
			scope.go = function(url) {
				
				if (scope.back != null && scope.back == 'true') $window.history.back();
				else $rootScope.go(url);
			}
		}
	};
});

/**
 * Directive to show a numeric pad
 * 
 * Accepts the following parameters:
 *  - answer		:	mandatory, callback function that will receive the answer 
 */
totoDirectivesModule.directive('totoNumpad', function($rootScope, $window) {
	
	return {
		scope : {
			answer: '='
		},
		templateUrl : 'directives/toto-numpad.html',
		link : function(scope, el) {
			
			scope.num = '0';
			
			var init = true;
			
			/**
			 * Select a digit and add it to the overall number
			 */
			scope.digit = function(d) {
				
				if (init) scope.num = '';
				
				scope.num += '' + d;
				
				init = false;
				
			}
		}
	};
});

/**
 * Directive to show the "app-specific menu"
 * 
 * Accepts the following parameters: 
 * 
 *  - menus			:	an [] of menus 
 *  					each menu is a {icon: string svg url, action: a function()}
 */
totoDirectivesModule.directive('inAppMenu', function($rootScope, $window) {
	
	return {
		scope : {
			menus: '='
		},
		templateUrl : 'directives/in-app-menu.html',
		link : function(scope, el) {
			
			var widget = el[0];

			widget.style.width = document.querySelector('.app-link').offsetWidth + 'px';
			widget.style.position = 'absolute';
			widget.style.bottom = '22px';
			widget.style.right = '0';
			
		}
	};
});

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
 * 
 *  -	showValues	:	(optional) true to show the values above the bars
 *  -	showExtremeValues : (optional) true to show only the min and max values above the bars
 *  -	showLabel	:	(optional) true to show the labels under the bars
 *  -	showXAxis	:	(optional) true to show the x axis bar
 *  					default: true
 *  
 *  -	height		:	(optional) the max height of the bars
 *  -	barWidth	:	(optional) the width of the bars
 *  -	barGutter	:	(optional) the space (in px) between the bars
 *  -	barColor	:	(optional) the color of the bar
 *  					defaut: 'default'
 *  					values:	'default', 'dark', 'light'
 *  
 *  -	normalize	:	(optional, default = false) true to define the bars' height based on the delta 
 *  					between the max value and the min value
 */
totoDirectivesModule.directive('totoBarGraph', function($rootScope, $timeout, $interval) {
	
	return {
		scope : {
			bars : '=',
			widgetId : '@',
			showValues : '@',
			showExtremeValues : '@',
			showLabel : '@',
			showXAxis : '@',
			height : '@',
			barWidth: '@',
			barGutter: '@',
			barColor: '@',
			normalize: '@'
		},
		templateUrl : 'directives/toto-bar-graph.html',
		link : function(scope) {
			
			if (scope.barColor == null) scope.barColor = 'default';
			if (scope.showXAxis == null) scope.showXAxis = 'true';
			
			/**
			 * Creates the bars related to the gym info that has been loaded
			 */
			scope.buildGraph = function() {
				
				if (scope.bars == null || scope.bars.length == 0) return;
				
				if (document.getElementById(0 + '-' + scope.widgetId + '-bar') == null) {
					$timeout(scope.buildGraph, 100);
					return;
				}
				
				var containerWidth = document.querySelector('#' + scope.widgetId).offsetWidth;
				var containerHeight = scope.height != null ? scope.height : 100;
				
				document.querySelector('#' + scope.widgetId).style.height = containerHeight + "px";
				document.querySelector('#' + scope.widgetId).parentNode.style.height = containerHeight + "px";
				
				var maxBarHeight = containerHeight - 10;
				var maxValue = scope.getMaxValue();
				var minValue = scope.getMinValue();
				var barGutter = scope.barGutter == null ? 2 : parseInt(scope.barGutter);
				var barWidth;
				var showLabel = scope.showLabel == null ? true : scope.showLabel == 'true';
				
				var heightRatio = (scope.normalize == null || scope.normalize == 'false') ? maxBarHeight / maxValue : maxBarHeight / (maxValue - minValue);
				
				var maxValueLabelShown = false;	// used only in case of showExtremeValues
				var minValueLabelShown = false; // used only in case of showExtremeValues
				
				for (var i = 0; i < scope.bars.length; i++) {
					
					var bar = scope.bars[i];
					
					var element = document.getElementById(i + '-' + scope.widgetId + '-bar');
					var elementLabel = document.getElementById(i + '-' + scope.widgetId + '-label');
					var elementValue = document.getElementById(i + '-' + scope.widgetId + '-value');
					
					if (element == null) continue;
					
					barWidth = scope.barWidth == null ? element.offsetWidth : parseInt(scope.barWidth);
					
					element.style.width = barWidth + 'px';
					element.style.left = barGutter + (i * (barWidth + 2 * barGutter)) + 'px';
					
					var barHeight = (scope.normalize == null || scope.normalize == 'false') ? bar.value * heightRatio : (bar.value - minValue) * heightRatio;
					if (barHeight == 0) barHeight = 1;
					
					scope.animateBar(element, barHeight);
					
					if (elementValue != null) {
						
						elementValue.style.bottom = barHeight + 3 + 'px';
						elementValue.style.width = barWidth + 'px';
						elementValue.style.left = element.style.left;
						
						if (scope.showExtremeValues == 'true') {

							if (bar.value == minValue) { 
								if (!minValueLabelShown) minValueLabelShown = true;
								else elementValue.style.display = 'none';
							}
							else if (bar.value == maxValue) { 
								if (!maxValueLabelShown) maxValueLabelShown = true;
								else elementValue.style.display = 'none';
							}
							else elementValue.style.display = 'none';
						}

					}
					
					if (showLabel) {
						
						elementLabel.style.width = barWidth + 'px';
						elementLabel.style.left = barGutter + (i * (barWidth + 2 * barGutter)) + 'px';
						elementLabel.innerHTML = bar.label;
					}
					
				}
				
				document.querySelector('#' + scope.widgetId).style.width = scope.bars.length * barWidth + barGutter + scope.bars.length * 2 * barGutter + 'px';
			}
			
			/**
			 * Retrieves the min value in the provided bars
			 */
			scope.getMinValue = function() {
				
				var minValue = 10000000;
				for (var i = 0; i < scope.bars.length; i++) {
					
					if (scope.bars[i].value < minValue) {
						
						minValue = scope.bars[i].value;
					}
				}
				
				return minValue;
			}
			
			/**
			 * Retrieves the max score in the provided days
			 */
			scope.getMaxValue = function() {
				
				var maxValue = 1;
				for (var i = 0; i < scope.bars.length; i++) {
					
					if (scope.bars[i].value > maxValue) {
						
						maxValue = scope.bars[i].value;
					}
				}
				
				return maxValue;
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
			
			scope.$watch("bars", function(newValue, oldValue) {
				scope.buildGraph();
			});
		}
	};
});


totoDirectivesModule.directive('totoDrawingPad', function($rootScope, $timeout, $interval) {
	
	return {
		scope : {
			height: '@'
		},
		templateUrl : 'directives/toto-drawing-pad.html',
		link : function(scope) {
			
			var canvas = document.getElementById('canvasInAPerfectWorld');
			var totoCard = canvas.parentNode;
			
			if (scope.height != null) canvas.height = scope.height;
			
			var totoCardPaddingTop = canvas.offsetTop - totoCard.offsetTop;
			var totoCardPaddingLeft = canvas.offsetLeft - totoCard.offsetLeft;
			
			// 1. Set the height of the toto card
			totoCard.style.height = canvas.offsetHeight + totoCardPaddingTop * 2 + 'px';
			
			// 2. Set the width of the canvas to 100%
			canvas.width = totoCard.offsetWidth - totoCardPaddingLeft * 2;
			
			context = canvas.getContext("2d");

			context.strokeStyle = "#006064";
			context.lineJoin = "round";
			
			var clickX = new Array();
			var clickY = new Array();
			var clickDrag = new Array();
			var pen = new Array();
			var paint;
			
			scope.currentPen = 'pen';
			
			/**
			 * Clears the pad
			 */
			scope.clearPad = function() {
				context.clearRect(0, 0, context.canvas.width, context.canvas.height);
				
				clickX = new Array();
				clickY = new Array();
				clickDrag = new Array();
				pen = new Array();
			}
			
			/**
			 * Shows the change pen menu
			 */
			scope.showChangePen = function() {
				scope.changePenToolbarVisible = true;
			}
			
			/**
			 * Changes the pen
			 */
			scope.changePen = function(type) {
				
				scope.currentPen = type;
				
				scope.changePenToolbarVisible = false;
			}
			
			/************************
			 * MOUSE EVENT LISTENERS
			 ***********************/
			canvas.onmousedown = function(e){
				
				paint = true;
				
				addClick(e.offsetX, e.offsetY);
				
				redraw();
			}
			
			canvas.onmousemove = function(e){
				if(paint){
					addClick(e.pageX - this.offsetLeft, e.pageY - this.offsetTop, true);
					redraw();
				}
			}
			
			canvas.onmouseup = function(e){
				paint = false;
			}
			
			canvas.onmouseleave = function(e){
				paint = false;
			}

			/************************
			 * TOUCH EVENT LISTENERS
			 ***********************/
			scope.ontouchstart = function(e) {
				
				var touch = e.touches[0]; // Get the information for finger #1
                touchX=touch.pageX-touch.target.offsetLeft;
                touchY=touch.pageY-touch.target.offsetTop;
				
				paint = true;
				
				addClick(touchX, touchY);
				
				redraw();
			}
			
			scope.ontouchend = function(e) {
				paint = false;
			}
			
			scope.ontouchmove = function(e) {
				
				var touch = e.touches[0]; // Get the information for finger #1
                touchX=touch.pageX-touch.target.offsetLeft;
                touchY=touch.pageY-touch.target.offsetTop;

				if(paint){
					addClick(touchX, touchY, true);
					redraw();
				}
				
				e.preventDefault();
				
			}
			
			/**
			 * Adds a click on the pad
			 */
			function addClick(x, y, dragging) {
				clickX.push(x);
				clickY.push(y);
				clickDrag.push(dragging);
				pen.push(scope.currentPen);
			}
			
			/**
			 * Redraws the pad
			 */
			function redraw(){
				context.clearRect(0, 0, context.canvas.width, context.canvas.height); // Clears the canvas
				  
				for(var i=0; i < clickX.length; i++) {		
					context.beginPath();
					
					if (pen[i] == 'crayon') context.lineWidth = 2;
					if (pen[i] == 'pen') context.lineWidth = 4;
					if (pen[i] == 'marker') context.lineWidth = 10;
					
				    if(clickDrag[i] && i) context.moveTo(clickX[i-1], clickY[i-1]);
				    else context.moveTo(clickX[i]-1, clickY[i]);
				    
				    context.lineTo(clickX[i], clickY[i]);
				    context.closePath();
				    context.stroke();
				}
			}
			
			canvas.addEventListener('touchstart', scope.ontouchstart, false);
			canvas.addEventListener('touchmove', scope.ontouchmove, false);
			canvas.addEventListener('touchend', scope.ontouchend, false);
			
			scope.changePen('pen');
		}
	}
});