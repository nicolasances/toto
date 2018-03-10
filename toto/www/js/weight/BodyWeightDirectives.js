var BodyWeightDirectivesModule = angular.module('BodyWeightDirectivesModule', ['GymServiceModule']);

/**
 * This directive displays the weight graphic
 * 
 * Parameters: 
 * 
 * 	-	...			:	...
 */
BodyWeightDirectivesModule.directive('weightGraph', ['BodyWeightService', '$timeout', '$rootScope', function(BodyWeightService, $timeout, $rootScope) {
	
	return {
		scope: {
		},
		link: function(scope, el) {
			
			var container = el[0].parentNode;
			var component = el[0];
			var scale = 0.9;
			var width, height;
			var svg, g;
			var textFontSize = 14;

			component.id = 'bodyWeightGraph-' + Math.floor(Math.random() * 1000000);
			component.classList.add('layout-column');
			
			/**
			 * Initializes the SVG path
			 */
			var init = function() {
				
				width = container.offsetWidth * scale;
				height = container.offsetHeight * scale;
				
				component.style.width = width + 'px';
				component.style.height = height + 'px';
				component.style.marginLeft = (container.offsetWidth - 18 - container.offsetWidth * scale) / 2 + 'px';
				
				x = d3.scaleLinear().domain([0, scope.weights.length]).range([0, width]);
				y = d3.scaleLinear().domain([d3.min(scope.weights, function(d) {return d.weight;}), d3.max(scope.weights, function(d) {return d.weight;})]).range([height - 8, 0 + height / 2]);
				
				line = d3.line()
						.x(function(d, i) { return x(i); })
						.y(function(d) { return y(d.weight); })
						.curve(d3.curveCardinal)
				
				svg = d3.select('#' + component.id).append('svg')
						.attr('width', width)
						.attr('height', height)
				
				g = svg.append('g');
				
				g.append('path').datum(scope.weights)
					.attr('stroke', '#00ACC1')
					.attr('fill', 'none')
					.attr('d', line)
				
				g.append('text').datum(scope.weights[scope.weights.length - 1])
					.attr('x', width - 12)
					.attr('y', height / 4)
					.attr('text-anchor', 'end')
					.attr('alignment-baseline', 'middle')
					.style('font-size', '1.5em')
					.attr('fill', 'rgba(0,0,0,0.7)')
					.text(function(d) {return d.weight + ' kg'})

			}
			
			BodyWeightService.getWeights().success(function(data) {
				
				scope.weights = data.weights.reverse();
				
				if (svg == null) init();
				
			});
			
		}
	};
}]);

