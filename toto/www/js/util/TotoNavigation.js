
var TotoNavigation = {
	
		/**
		 * Slides to another slide
		 * 
		 * Requires: 
		 * 
		 * - source			:	the DOM element firing the command 
		 * 
		 * - destination	:	the name of the destination slide
		 */
		slideTo : function(source, destination) {

			TotoEventBus.publishEvent({name: 'slideNavigationRequested', context: {source: source, destination: destination}});
		}
};