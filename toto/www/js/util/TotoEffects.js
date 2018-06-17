
var TotoSlideOut = {
		
		/**
		 * Slides the provided elements out of the user's view. 
		 * 
		 * - elements	:	an [] of elements to slide out of the view
		 * 
		 * - onComplete	:	(optional) a callback to be called when the animation is completed.
		 */
		slideOut : function(elements, onComplete) {
			
			// If a complete callback has been passed assign it
			var onCompleteCallback = onComplete == null ? function() {} : onComplete;
			
			// Calculate the actual offset of a specific element 
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
			
			// Get the offset (especially the height and margin) of the elements to slide out 
			var elementsOffsets = [];
			for (var i = 0; i < elements.length; i++) {
				elementsOffsets.push(cumulativeOffset(elements[i]));
			}

			// Slide out the elements
			for (var i = 0; i < elements.length; i++) {
				
				var el = elements[i];
				var elOffset = elementsOffsets[i];
				
				// Calculate the actual height that the element has to be moved on
				// This depends on the "position" attribute of the parent of the element: 
				//  - In case of position relative, the element has to be slid out of the height of the parent
				//  - In case of position <> relative, the element has to be slide out of the entire body height 
				var targetTop = document.querySelector('body').offsetHeight;
				
				if (el.parentNode.style.position == 'relative') {
					targetTop = el.parentNode.offsetHeight;
				}
				
				// Again, the 'top' position of the element depends from the 'position' style of its parent
				//  - If the parent is position 'relative' then the top is 0
				//  - Otherwise, the top position if the current top minus any margin
				el.style.top = (elOffset.top - elOffset.marginTop) + 'px';
				
				if (el.parentNode.style.position == 'relative') el.style.top = '0px';
				
				// Fix the width of the element
				el.style.width = el.offsetWidth + 'px';
				
				// Finally set the position to absolute, so that the element can be moved
				el.style.position = 'absolute';
				
				TweenLite.to(el, 0.5, {top: targetTop + 'px'}).eventCallback('onComplete', onCompleteCallback);
			}
			
		},

		/**
		 * Slides the provided element in the user's view.
		 * The assumption is that the element is absolutely positioned and with top = document.body.offsetHeight; 
		 * 
		 * - element		:	an element to slide in the view
		 * 
		 * - parentElement	: 	the parent element, to decide where to stop the sliding
		 * 
		 * - onComplete	:	(optional) a callback to be called when the animation is completed.
		 * 
		 */
		slideIn : function(element, parentElement, onComplete) {
			
			// If a complete callback has been passed assign it
			var onCompleteCallback = onComplete == null ? function() {} : onComplete;
			
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

			var el = element;
			
			var parentOffset = cumulativeOffset(parentElement);
			
			// The target top depends from the "position" style property of the parent element 
			//  - If the parent has "position" relative, then target top will be 0
			// 	- Otherwise it will be the parent offset top
			var targetTop = parentOffset.top;
			
			if (el.parentNode.style.position == 'relative') targetTop = 0;
			
			TweenLite.to(el, 0.5, {top: targetTop + 'px'}).eventCallback('onComplete', onCompleteCallback);
			
		} 
		
}; 