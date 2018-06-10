
var TotoSlideOut = {
		
		/**
		 * Slides the provided elements out of the user's view. 
		 * 
		 * - elements	:	an [] of elements to slide out of the view
		 * 
		 * - onComplete	:	(optional) a callback to be called when the animation is completed.
		 */
		slideOut : function(elements, onComplete) {
			
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

			var bodyHeight = document.querySelector('body').offsetHeight;

			var elementsOffsets = [];
			for (var i = 0; i < elements.length; i++) {
				elementsOffsets.push(cumulativeOffset(elements[i]));
			}

			for (var i = 0; i < elements.length; i++) {
				
				var el = elements[i];
				var elOffset = elementsOffsets[i];
				
				el.style.top = (elOffset.top - elOffset.marginTop) + 'px';
				el.style.width = el.offsetWidth + 'px';
				el.style.position = 'absolute';
				
				TweenLite.to(el, 0.5, {top: bodyHeight + 'px'}).eventCallback('onComplete', onCompleteCallback);
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
		 */
		slideIn : function(element, parentElement) {
			
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
			
//			el.style.top = (elOffset.top - elOffset.marginTop) + 'px';
//			el.style.width = el.offsetWidth + 'px';
//			el.style.position = 'absolute';
			
			var parentOffset = cumulativeOffset(parentElement);
			
			var top = parentOffset.top;
			
			TweenLite.to(el, 0.5, {top: top + 'px'});
			
		} 
		
}; 