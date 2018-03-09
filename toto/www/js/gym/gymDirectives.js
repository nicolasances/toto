var gymDirectivesModule = angular.module('gymDirectivesModule', ['GymServiceModule']);

/**
 * This directive draws a graphic with the scores obtained for a specific muscle.
 * 
 * Parameters: 
 * 
 * 	-	muscle			:	The identifier of the muscle for which to load the scores (e.g. 'chest')
 */
gymDirectivesModule.directive('totoGymMuscleGraph', ['GymService', '$timeout', function(GymService, $timeout) {
	
	return {
		scope: {
			muscle: '@',
			height: '@',
			maxResults : '@'
		},
		templateUrl: 'modules/gym/directives/toto-gym-muscle-graph.html',
		link: function(scope) {
			
			GymService.calculateEfficacy('goodPain', 'ok').success(function(data) {

				scope.benchmarkEfficacy = data.efficacy;
			});
			
			scope.$watch('muscle', function(newValue, oldValue) {
				
				if (newValue == null || newValue == "") return;
				
				// 1. Retrieve scores for muscle
				GymService.getScoresForMuscle(newValue, scope.maxResults).success(function(data) {
					
					scope.muscleScoreWeeks = data.weeks;
					
					var i; 
					for (i = 0; i < data.weeks.length; i++) {
						var date = moment();
						date.day("Monday");
						date.week(data.weeks[i].weekOfYear);
						date.year(data.weeks[i].year);
						
						if (i % 2 == 0) scope.muscleScoreWeeks[i].date = new Date(date); 
					}
					
					$timeout(function() {GymService.createMuscleScoreGraph(scope.muscleScoreWeeks, scope.height);}, 500);
				});
			});
		}
	};
}]);

/**
 * This directive draws a graphic with the weight
 * 
 * Parameters: 
 * 
 * 	-	muscle			:	The identifier of the muscle for which to load the scores (e.g. 'chest')
 */
gymDirectivesModule.directive('totoWeightGraph', ['BodyWeightService', '$timeout', function(BodyWeightService, $timeout) {
	
	return {
		scope: {
			muscle: '@',
			height: '@',
			maxResults : '@'
		},
		templateUrl: 'modules/gym/directives/toto-weight-graph.html',
		link: function(scope) {
			
			BodyWeightService.getWeights().success(function(data) {
				
				var bars = [];
				
				for (var i = 0; i < data.weights.length; i++) {
					
					bars.push({
						value : data.weights[i].weight,
						label : data.weights[i].weekOfYear
					});
				}
				
				scope.bars = bars;
			});
		}
	}
}]);

/**
 * This directive draws the week summary
 * 
 * Parameters: 
 * 
 *  	-	... 		:	...
 */
gymDirectivesModule.directive('gymWeek', ['GymService', '$timeout', '$rootScope', function(GymService, $timeout, $rootScope) {
	
	return {
		scope: {
		},
		link: function(scope, el) {
			
			GymService.calculateEfficacy('goodPain', 'ok').success(function(data) {

				scope.benchmarkEfficacy = data.efficacy;
				
				GymService.getWeekSummary(moment().format('W'), moment().format('YYYY'), scope.benchmarkEfficacy).success(function(data) {

					scope.gymDays = data.days;
					
					console.log(scope.gymDays);
					
					draw();
					
				});
			});
			
			var container = el[0].parentNode;
			var scale = 0.9;
			var width, height;
			var svg, g;
			var circleR = 30;
			var dayFontSize = 14;
			var gymSessionCircleWidth = 5;
			var gymSessionArc = d3.arc().innerRadius(circleR - gymSessionCircleWidth / 2).outerRadius(circleR + gymSessionCircleWidth / 2).startAngle(0).endAngle(0);
			
			var component = el[0];
			component.id = 'gymWeek-' + Math.floor(Math.random() * 1000000);

			/**
			 * Animates the green circle that specifies if the gym session has been done
			 */
			var gymSessionArcTween = function() {
				
			    return function(d) {
			    	var interpolate = d3.interpolate(0, 2 * Math.PI);
			
			    	return function(t) {

			    		if (d.muscle == null) gymSessionArc.endAngle(0);
			    		else gymSessionArc.endAngle(interpolate(t));
			    		
			    		return gymSessionArc();
			    	}
			    }
			}
			
			/**
			 * Starts or resume a session in a specified day.
			 * 
			 * The session will be started if there are no sessions ongoing for that
			 * day. The session will be resumed if there is a session ongoing for that
			 * day.
			 * 
			 * Parameters:
			 *  - day: the gym day loaded in getWeekSummary() call
			 */
			var startOrResumeSession = function(day) {
				
				console.log(day);
				
				if (day.muscle == null) {
					
					GymService.showStartSessionUI(function(answer) {

						GymService.startSession(answer.planId, answer.planWorkoutId, day.date).success(function(data) {
							$rootScope.go('/gym/sessions/' + data.sessionId);
						});
					});
					
				}
				else {
					
					GymService.getSessions(day.date).success(function(sessions) {
						$rootScope.go('/gym/sessions/' + sessions.sessions[0].id);
					})
				}
			}
	      
			/**
			 * Draws the circles
			 */
			var draw = function() {
				
				width = container.offsetWidth * scale;
				height = container.offsetHeight * scale;
				
				component.style.width = width + 'px';
				component.style.height = height + 'px';
				component.style.marginLeft = (container.offsetWidth - 18 - container.offsetWidth * scale) / 2 + 'px';
				
				svg = d3.select('#' + component.id).append('svg')
						.attr('width', width)
						.attr('height', height);
				
				g = svg.append('g');
				
				g.selectAll('.circle').data(scope.gymDays).enter().append('circle')
					.style('fill', function(d, i) {return 'white';})
					.style('stroke', '#eaeaea')
					.style('strokeWidth', '2')
					.attr('class', 'circle')
					.attr('cx', function(d, i) {return i * ((width - circleR) / 7) + circleR + gymSessionCircleWidth/2;})
					.attr('cy', function(d, i) {if (i % 2 == 0) return (height / 3); return 2 * height / 3;})
					.attr('r', circleR)
					.on('click', function(d) {startOrResumeSession(d);})
					
				g.selectAll('.day').data(scope.gymDays).enter().append('text')
					.style('fill', '#eaeaea')
					.attr('class', 'day')
					.attr('text-anchor', 'middle')
					.attr('font-size', dayFontSize + 'px')
					.attr('line-height', dayFontSize + 'px')
					.attr('x', function(d, i) {return i * ((width - circleR) / 7) + circleR + gymSessionCircleWidth/2;})
					.attr('y', function(d, i) {if (i % 2 == 0) return (height / 3) + dayFontSize/2; return 2 * height / 3 + dayFontSize/2;})
					.text(function(d) {if (d.muscle == null) return moment(d.date, 'YYYYMMDD').format('dd'); return '';})
					.on('click', function(d) {startOrResumeSession(d);})
				
				g.selectAll('.sessionArc').data(scope.gymDays).enter().append('path')
					.attr('class', 'sessionArc')
					.attr('fill', function(d) {if (d.efficacyGoalReached) return '#4CAF50'; return 'rgb(0, 151, 167)';})
					.attr('transform', function(d, i) {return 'translate(' + (i * ((width - circleR) / 7) + circleR + gymSessionCircleWidth/2) + ', ' + ((i % 2 == 0) ? (height / 3) : 2 * height / 3) + ')';})
					.attr('d', gymSessionArc)
					.transition()
					.duration(500)
					.attrTween('d', gymSessionArcTween(Math.PI))
					
				g.selectAll('.muscleImg').data(scope.gymDays).enter().append('svg:image')
					.attr('class', 'muscleImg')
					.attr('xlink:href', function(d) {return d.muscle != null ? 'images/gym/muscle-avatars-grey/' + d.muscle.id + '.svg' : '';})
					.attr('width', '20px')
					.attr('height', '20px')
					.attr('x', function(d, i) {return i * ((width - circleR) / 7) + circleR + gymSessionCircleWidth/2 - 10;})
					.attr('y', function(d, i) {if (i % 2 == 0) return (height / 3) + dayFontSize/2 - 15; return 2 * height / 3 + dayFontSize/2 - 15;})
					.on('click', function(d) {startOrResumeSession(d);})
					
			}
			
		}
	}
}]);