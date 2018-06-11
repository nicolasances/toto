var totoDirectivesModule = angular.module('totoDirectivesModule', []);

/**
 * Directive to show a simple label & value
 * 
 * Accepts the following parameters:
 *  
 *  - label : 	the label to display
 *  
 *  - unit  : 	(optional) the unit to display
 *  
 *  - value : 	the value to display
 *  
 *  - type	: 	the type of value 
 *  			accepted values are : number, date
 *  
 *  - scale :	the scale, in case of numeric value
 *  
 *  - size  : 	(optional, default toto-s) the size of the value
 *  			Can be toto-xl, toto-l, toto-m, toto-s, toto-xs 
 *  
 *  - accent:   (optional, default false) true if the text has to be accented
 *  
 *  - bold	:	(optional, default false) true to have the text in bold
 */
totoDirectivesModule.directive('totoValue', function($rootScope, $window) {
	
	return {
		scope : {
			label: '@', 
			unit: '@',
			value: '=', 
			type: '@',
			scale: '@',
			size: '@',
			accent: '@',
			bold: '@'
		},
		templateUrl : 'directives/toto-value.html',
		link : function(scope, el) {

			el[0].classList.add('layout-column');
			
			scope.accent = (scope.accent == 'true' ? true : false);
			
			if (scope.size == null) scope.size = 'toto-s';
			
			if (scope.scale == null) scope.scale = 2;
			
			scope.bold = (scope.bold == 'true' ? true : false);
		}
	};
});

/**
 * Draws a button
 * 
 * - label	:	(optional) the label of the button (to be displayed on the bottom of the button
 * 
 * - svg	:	the svg path of the image to put in the button
 * 				e.g. images/svg/add.svg
 */
totoDirectivesModule.directive('totoButton', function($rootScope, $window) {
	
	return {
		scope : {
			label: '@', 
			svg: '@',
		},
		templateUrl : 'directives/toto-button.html',
		link : function(scope, el) {

			el[0].classList.add('layout-column');
			
		}
	};
});

/**
 * Generic form toto directive
 */
totoDirectivesModule.directive('totoForm', function($rootScope, $window) {
	
	return {
		scope : {
		},
		link : function(scope, el) {
			
			el[0].classList.add('layout-column');
			el[0].classList.add('flex');
		}
	};
});

/**
 * Models a toolbar
 * 
 * - title		:	the title to display in the header toolbar
 * 
 * - onCancel	:	the callback function to be called if the cancel button is pressed
 */
totoDirectivesModule.directive('totoToolbar', function($rootScope, $window) {
	
	return {
		scope : {
			title : '@',
			onCancel: '='
		},
		templateUrl: 'directives/toto-toolbar.html',
		link : function(scope, el) {
			
			el[0].classList.add('layout-column');
			
		}
	};
});

/**
 * Directive to show a sequence of steps to gather user input
 * Each step is going to be shown one at a time with a different screen
 * 
 * 
 */
totoDirectivesModule.directive('totoInputSteps', function($rootScope, $window) {
	
	return {
		scope : {
		},
		link : function(scope, el) {
			
			el[0].classList.add('layout-column');
			el[0].classList.add('flex');
			el[0].style.marginTop = '56px';
			el[0].id = 'totoInputSteps-' + Math.floor(Math.random() * 1000000);
			
			// Current step
			var currentStep = 1;
			
			// Clearing the steps that are not the first one
			var steps = el[0].querySelectorAll('toto-step');
			
			for (var i = 0; i < steps.length; i++) {
				if (steps[i].getAttribute('step') != 1) {
					steps[i].style.display = 'none';
				}
			}
			
			// Registering to the next step
			TotoEventBus.subscribeToEvent('formStepCompleted', function(event) {
				
				if (event == null) {
					console.log('Toto Input Steps has received a formStepCompleted with a null event.')
					return;
				}
				
				if (event.context == null) {
					console.log('Toto Input Steps has received a formStepCompleted with an event with context null. Event: ' + event);
					return;
				}
				
				var eventSource = event.context.source; 
				
				if (eventSource == null) {
					console.log('Toto Input Steps has received a formStepCompleted event with no source DOM element in the context. Event: ' + event);
					return;
				}
				
				// Check if the event belongs to this slider context
				var es = eventSource;
				do {
					es = es.parentNode;
				} while (es != null && es.id != el[0].id);
				
				if (es == null) return;
				
				// At this point we know that the source element was part of this <toto-input-steps> context
				// We can proceed in incrementing the step
				
				currentStep++;

				// And hide the previous step
				for (var i = 0; i < steps.length; i++) {

					if (steps[i].getAttribute('step') == currentStep - 1) {
						steps[i].style.display = 'none';
					}
					
					if (steps[i].getAttribute('step') == currentStep) {
						steps[i].style.display = 'flex';
					}
					
				}
				
			});
		}
	};
});

/**
 * Directive to contain a single toto input step
 * 
 * - step		:	the number of the step (mandatory), unique in the toto-input-steps container
 * 					must be an integer
 */
totoDirectivesModule.directive('totoStep', function($rootScope, $window) {
	
	return {
		scope : {
			step: '@'
		},
		link : function(scope, el) {
			
			el[0].classList.add('layout-column');
			el[0].classList.add('flex');
			
		}
	};
});

/**
 * Directive to show the next step button
 */
totoDirectivesModule.directive('totoNextStep', function($rootScope, $window) {
	
	return {
		scope : {
		},
		templateUrl: 'directives/toto-next-step.html',
		link : function(scope, el) {
			
			el[0].classList.add('layout-column');

			/**
			 * Triggers the completion of the step
			 */
			scope.confirm = function() {
				
				TotoEventBus.publishEvent({name: 'formStepCompleted', context: {source: el[0]}});
			}
			
		}
	};
});

/**
 * Directive to show a datepicker.
 * 
 * - model		:	the model variable to store the value
 * 
 * - label		:	the label for the picker 
 * 
 */
totoDirectivesModule.directive('totoDatepicker', function($rootScope, $window) {
	
	return {
		scope : {
			model : '=',
			label : '@'
		},
		templateUrl : 'directives/input/toto-datepicker.html',
		link : function(scope, el) {
			
			// Setting layout
			el[0].classList.add('layout-column');
			
			scope.model = new Date(moment());
			
		}
	};
});

/**
 * Directive to show a time picker.
 * 
 * - model		:	the model variable to store the value
 * 
 * - label		:	the label for the picker 
 * 
 */
totoDirectivesModule.directive('totoTimepicker', function($rootScope, $window) {
	
	return {
		scope : {
			model : '=',
			label : '@'
		},
		templateUrl : 'directives/input/toto-timepicker.html',
		link : function(scope, el) {
			
			// Setting layout
			el[0].classList.add('layout-column');

			// Initializing the time to the current time
			var time = moment();
			
			scope.hours = time.format('HH');
			scope.minutes = time.format('mm');
			if (scope.minutes % 5 != 0) scope.minutes -= scope.minutes % 5;
			
			/**
			 * Updates the model variable
			 */
			var updateModel = function() {
				scope.model = (scope.hours < 10 ? '0' + scope.hours : scope.hours) + ':' + (scope.minutes < 10 ? '0' + scope.minutes : scope.minutes);
			}
			
			updateModel();
			
			/**
			 * Adds an hour
			 */
			scope.addHour = function() {
				scope.hours++;
				if (scope.hours > 23) scope.hours = 0;
				
				updateModel();
			}
			
			/**
			 * Remove an hours
			 */
			scope.subtractHour = function() {
				scope.hours--;
				if (scope.hours < 0) scope.hours = 23;
				
				updateModel();
			}
			
			/**
			 * Add 5 minutes
			 */
			scope.addMinute = function() {
				scope.minutes += 5;
				if (scope.minutes > 55) scope.minutes = 0;
				
				updateModel();
			}
			
			/**
			 * Subtract 5 minutes
			 */
			scope.subtractMinute = function() {
				scope.minutes -= 5;
				if (scope.minutes < 0) scope.minutes = 55;
				
				updateModel();
			}

		}
	};
});


/**
 * Directive to encapsulate a serie of slides and provide cross slides management (e.g. navigation)
 * 
 * Accepts the following parameters:
 *  
 */
totoDirectivesModule.directive('totoSlidesContainer', function($rootScope, $window, $timeout) {
	
	return {
		scope : {
			
		},
		link : function(scope, el) {
			
			el[0].classList.add('layout-column');
			el[0].classList.add('flex');
			el[0].id = 'totoSlidesContainer-' + Math.floor(Math.random() * 1000000);
			
			/**
			 * This variable stores the slide stack. 
			 * It stores the stack of all slides that have been visited.
			 * It is used to go back to the previous navigation point in case of "slide back" command.
			 */
			var visitedSlidesStack = [];
			
			/**
			 * Utility function to calculate the correct offsets
			 */
			var cumulativeOffset = function(element) {
				
				var style = element.currentStyle || window.getComputedStyle(element);
				var marginTop = (style.marginTop != null && style.marginTop != '' || style.marginTop != '0') ? style.marginTop.substring(0, style.marginTop.indexOf('px')) : 0; 
				
				var top = 0, left = 0;
				do {
					top += element.offsetTop  || 0;
					left += element.offsetLeft || 0;
					element = element.offsetParent;
				} while(element);
				
				return {
					top: top,
					left: left,
					marginTop : parseInt(marginTop)
				};
			};
			
			/**
			 * Initialization: only the primary slide is visible
			 */
			var slides = el[0].querySelectorAll('toto-slide');
			
			// The current slide is a DOM element 
			var currentSlide = null;
			
			for (var i = 0; i < slides.length; i++) {
				
				if (slides[i].getAttribute('primary') != 'true') {
					slides[i].style.position = 'absolute';
					slides[i].style.top = document.body.offsetHeight + 'px';
				}
				else {
					currentSlide = slides[i];
				}
			}
			
			/**
			 * Registering a listener to "slide navigation events"
			 */
			TotoEventBus.subscribeToEvent('slideNavigationRequested', function(event) {
				
				if (event == null) {
					console.log('Toto Slides Container has received a slideNavigationRequested with a null event.')
					return;
				}
				
				if (event.context == null) {
					console.log('Toto Slides Container has received a slideNavigationRequested with an event with context null. Event: ' + event);
					return;
				}
				
				var eventSource = event.context.source; 
				
				if (eventSource == null) {
					console.log('Toto Slides Container has received a slideNavigationRequested event with no source DOM element in the context. Event: ' + event);
					return;
				}
				
				// Check if the event belongs to this slider context
				var es = eventSource;
				do {
					es = es.parentNode;
				} while (es != null && es.id != el[0].id);
				
				if (es == null) return;

				// At this point we are sure that the event was originated within this slide-container
				// (by a DOM element contained in this slide-container)
				
				// Do the magic navigation
				// If the event has a destination slide, go there
				if (event.context.destination != null) slideTo(event.context.destination);
				
				// If the event doesn't have a destination, it means it's a "slide back" event
				// So go back to the previous slide
				if (event.context.destination == null) slideBack();
			});
			
			/**
			 * Goes back one slide in the stack of visited slides
			 */
			var slideBack = function() {
				
				// Get the previous slide to pop back up
				var previousSlide = visitedSlidesStack.pop();
				
				// Slide out the current slide
				TotoSlideOut.slideOut([currentSlide], function() {
					
					// Slide in the previous slide
					TotoSlideOut.slideIn(previousSlide, el[0]);
					
					// Update the "current slide"
					currentSlide = previousSlide;
					
				});
			}
			
			/**
			 * Goes to the specified slide
			 * 
			 * Requires: 
			 * 
			 * - slideName	:	the name of the slide to go to
			 */
			var slideTo = function(slideName) {

				// Save the previous slide in the slide stack
				visitedSlidesStack.push(currentSlide)
				
				// Slide out the content of the current slide
				TotoSlideOut.slideOut([currentSlide], function() {
					
					// Find the new slide to present 
					for (var i = 0; i < slides.length; i++) {
						
						if (slides[i].getAttribute('name') == slideName) {
							
							// Slide in the new slide to present 
							TotoSlideOut.slideIn(slides[i], el[0]);
							
							// Update the "current slide"
							currentSlide = slides[i];
							
							break;
							
						}
					}
					
				});
				
			}
			
		}
	};
});

/**
 * Directive to encapsulate a slide
 * 
 * Accepts the following parameters:
 * 
 * - name		:	(MAND) the name of the slide. Must be unique in the whole application
 * 
 * - primary	:	(optional, default = false) true if the slide is the first (default) one to be shown
 *  
 */
totoDirectivesModule.directive('totoSlide', function($rootScope, $window, $timeout) {
	
	return {
		scope : {
			primary: '@'
		},
		link : function(scope, el) {
			
			/**
			 * Basic styles initialization
			 */
			el[0].classList.add('layout-column');
			el[0].classList.add('flex');
			el[0].style.width = document.body.offsetWidth + 'px';
			
			$timeout(function() {
				el[0].style.height = el[0].parentNode.offsetHeight + 'px';
			}, 200);
			
		}
	};
});

/**
 * Directive to show a header on any page
 * 
 * Parameters:
 * 
 *  - title			:	the title of the header
 * 
 *  - menus			:	(optional) an array of menu items
 *  					Each item is a 
 *  					{	icon: url of the svg, 
 *  						action: callback function action()
 * 						}
 */
totoDirectivesModule.directive('totoHeader', function($rootScope, $window) {
	
	return {
		scope : {
			
			title	: '@',
			menus	: '='
			
		}, 
		templateUrl : 'directives/toto-header.html',
		link : function(scope, el) {
			
			el[0].classList.add('layout-row');
			
		}
	}
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

