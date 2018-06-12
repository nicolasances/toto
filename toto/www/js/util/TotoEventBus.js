
var TotoEvents = ['slideNavigationRequested', 'formStepCompleted',
                  'dietMealAdded'];  

var TotoEventBus = {
		
	subscribers : new Map(),
	
	/**
	 * Registers a listener to a specific event
	 * 
	 * Requires: 
	 * 
	 * - 	eventName	:	the name of the event (see TotoEvents global variable for supported events)
	 * 
	 * -	callback	:	a function(event) that will receive the event
	 */
	subscribeToEvent : function(eventName, callback) {
		
		if (this.subscribers.get(eventName) == null) {
			this.subscribers.set(eventName, []);
		}
		
		this.subscribers.get(eventName).push(callback);
		
		console.log('New subscriber to ' + eventName + ' registered callback.');
	},
	
	/**
	 * Publishes an event on the bus and triggers the listeners callbacks
	 * 
	 * Requires: 
	 * 
	 * - event		:	The event to be published. It's an object that must at least contain: 
	 * 					{ name : the name of the event among those defined in the global variable TotoEvents, 
	 * 					  context : a generic {} containing whatever is needed by the event listener to process the event
	 * 					}
	 */
	publishEvent : function(event) {
		
		console.log('Event published on TotoEventBus: ' + event.name);
		
		var callbacks = this.subscribers.get(event.name);
		
		if (callbacks == null) return;
		
		for (var i = 0; i < callbacks.length; i++) {
			callbacks[i](event);
		}
	}
	
};