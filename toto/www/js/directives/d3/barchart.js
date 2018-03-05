var BarchartDirective = angular.module('BarchartDirective', [ ]);

/**
 * Directive to draw a bar chart
 *
 * Accepts the following parameters:
 * - data     	:	 	an [] of {value : number, label : string}
 * - color			:		(optional) the color with which to fill the bars
 * - unit				:		(optional) the unit of measure to display
 */
BarchartDirective.directive('d3Barchart', function($timeout) {

	return {
		scope : {
			data : '=',
			color : '@',
			unit : '@'
		},
    link : function(scope, element) {
    	
    		var container = element[0].parentNode;
    		
			var barchartContainer = element[0];
			barchartContainer.id = 'barchart-' + Math.floor(Math.random() * 1000000);
			barchartContainer.style.width = container.offsetWidth + 'px';
			barchartContainer.style.height = container.offsetHeight + 'px';

			var color = scope.color == null ? ' #00897B' : scope.color;
			var unit = scope.unit == null ? '' : scope.unit;

			var width = 0;
			var height = 0;
			var bars;
			var g;
			var x, y, colorScale;

      /**
       * Draws the svg
       */
      var init = function() {

				width = barchartContainer.offsetWidth;
				height = barchartContainer.offsetHeight;
				
				x = d3.scaleBand().range([0, width]).padding(0.1);
				y = d3.scaleLinear().range([0, height - 20]);
				colorScale = d3.scaleLinear().domain([0, scope.data.length]).range(['#00ACC1', '#006064'])

				var svg = d3.select('#' + barchartContainer.id).append('svg')
							.attr('width', width)
							.attr('height', height);

				g = svg.append('g');

				x.domain(scope.data.map(function(d) { return d.label; }));
				y.domain([0, d3.max(scope.data, function(d) { return d.value; })]);

				scope.$watch("data", function(newValue, oldValue) {
					
					x.domain(newValue.map(function(d) { return d.label; }));
					y.domain([0, d3.max(newValue, function(d) { return d.value; })]);
					colorScale = d3.scaleLinear().domain([0, scope.data.length]).range(['#00ACC1', '#006064'])

					g.selectAll('.bar').data(newValue).enter().append('rect')
							.style('fill', function(d, i) {return colorScale(i);})
							.attr('class', 'bar')
							.attr('x', function(d) {return x(d.label);})
							.attr('width', x.bandwidth())
							.attr('height', 0)
							.attr('y', height)
							.transition()
							.duration(500)
							.attr('y', function(d) {return height - y(d.value);})
							.attr('height', function(d) {return y(d.value); })

					g.selectAll('.bar').data(newValue)
							.transition()
							.duration(500)
							.attr('y', function(d) {return height - y(d.value);})
							.attr('height', function(d) {return y(d.value); });

					g.selectAll('.value').data(scope.data).enter().append('text')
							.style('fill', function(d) {if (y(d.value) < 25) return 'rgba(0,0,0,0.8)'; return 'white';})
							.attr('class', 'value')
							.attr('text-anchor', 'middle')
							.attr('font-size', '65%')
							.attr('x', function(d) {return x(d.label) + x.bandwidth() / 2})
							.attr('y', function(d) {if (y(d.value) < 25) return height - y(d.value) - 9; return height - 9;})
							.text(function(d) {return d.value + ' ' + unit;})

					g.selectAll('.label').data(scope.data).enter().append('text')
							.style('fill', 'rgba(0,0,0,0.7)')
							.attr('class', 'label')
							.attr('text-anchor', 'middle')
							.attr('font-size', '80%')
							.attr('x', function(d) {return x(d.label) + x.bandwidth() / 2})
							.attr('y', 12)
							.text(function(d) {return d.label;})

					g.selectAll('.value').data(newValue)
							.transition()
							.duration(500)
							.style('fill', function(d) {if (y(d.value) < 25) return 'rgba(0,0,0,0.8)'; return 'white';})
							.attr('y', function(d) {if (y(d.value) < 25) return height - y(d.value) - 9; return height - 9;})
							.text(function(d) {return d.value + ' ' + unit;})

				});

      }

      $timeout(init, 100);

    }
	};
});
