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
			
			var container = el[0].parentNode;
			var component = el[0];
			var scale = 0.9;
			var width, height;
			var svg, g;
			var dayFontSize = 12;
			var gymSessionArc;
			
			component.id = 'gymWeek-' + Math.floor(Math.random() * 1000000);
			
			GymService.calculateEfficacy('goodPain', 'ok').success(function(data) {

				scope.benchmarkEfficacy = data.efficacy;
				
				GymService.getWeekSummary(moment().format('W'), moment().format('YYYY'), scope.benchmarkEfficacy).success(function(data) {

					scope.gymDays = data.days;
					
					draw();
					
				});
			});

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
				
				var circleGutter = 10;
				var gymSessionCircleWidth = 3;
				
				/**
				 * Calculates each circle's x position
				 */
				var circleCX = function(d, i) {
					var circleWidth = circleR() * 2;
					return circleGutter / 2 + circleWidth / 2 + i * (circleWidth + circleGutter);
				}
				
				/**
				 * Calculates each circle's y position
				 */
				var circleCY = function(d, i) {
					return height / 2;
				}
				
				/**
				 * Calculates the circle's radius
				 */
				var circleR = function(d, i) {
					return (width / 7 - circleGutter) / 2;
				}
				
				gymSessionArc = d3.arc().innerRadius(circleR() - gymSessionCircleWidth / 2).outerRadius(circleR() + gymSessionCircleWidth / 2).startAngle(0).endAngle(0);
				
				svg = d3.select('#' + component.id).append('svg')
						.attr('width', width)
						.attr('height', height);
				
				g = svg.append('g');
				
				g.selectAll('.bar').data(scope.gymDays).enter().append('rect')
					.style('fill', '#4CAF50')
					.attr('class', 'bar')
					.attr('width', circleR)
					.attr('x', function(d, i) {return circleCX(d, i) - circleR() / 2})
					.attr('y', circleCY)
					.attr('height', 0)
					.transition()
					.duration(500)
					.attr('height', function(d) {if (d.efficacyGoalReached) return circleR() * 2; return 0;})
				
				g.selectAll('.circle').data(scope.gymDays).enter().append('circle')
					.style('fill', function(d, i) {if (d.muscle != null) return '#F1F8E9'; return 'white';})
					.style('stroke', 'rgb(212, 211, 211)')
					.style('strokeWidth', '2')
					.attr('class', 'circle')
					.attr('cx', circleCX)
					.attr('cy', circleCY)
					.attr('r', circleR)
					.on('click', function(d) {startOrResumeSession(d);})
					
				g.selectAll('.day').data(scope.gymDays).enter().append('text')
					.style('fill', 'rgba(0,0,0,0.5)')
					.attr('class', 'day')
					.attr('text-anchor', 'middle')
					.attr('alignment-baseline', 'baseline')
					.attr('font-size', dayFontSize + 'px')
					.attr('line-height', dayFontSize + 'px')
					.attr('x', circleCX)
					.attr('y', function(d, i) {return circleCY(d, i) - circleR(d, i) - (navigator.userAgent.indexOf('afari') >= 0 ? 18 : 6)})
					.text(function(d) {return moment(d.date, 'YYYYMMDD').format('dd');})
					.on('click', function(d) {startOrResumeSession(d);})
				
//				g.selectAll('.sessionArc').data(scope.gymDays).enter().append('path')
//					.attr('class', 'sessionArc')
//					.attr('fill', function(d) {if (d.efficacyGoalReached) return '#4CAF50'; return '#26C6DA';})
//					.attr('transform', function(d, i) {return 'translate(' + circleCX(d, i) + ', ' + circleCY(d, i) + ')';})
//					.attr('d', gymSessionArc)
//					.transition()
//					.duration(500)
//					.attrTween('d', gymSessionArcTween(Math.PI))
					
				g.selectAll('.muscleImg').data(scope.gymDays).enter().append('svg:image')
					.attr('class', 'muscleImg')
					.attr('xlink:href', function(d) {
						if (d.muscle != null && d.efficacyGoalReached) return 'images/gym/muscle-avatars-green/' + d.muscle.id + '.svg';
						else if (d.muscle != null) return 'images/gym/muscle-avatars-grey/' + d.muscle.id + '.svg';
						else return '';
					})
					.attr('width', circleR)
					.attr('height', circleR)
					.attr('x', function(d, i) {return circleCX(d, i) - circleR() / 2})
					.attr('y', function(d, i) {return circleCY(d, i) - circleR() / 2})
					.on('click', function(d) {startOrResumeSession(d);})
					
			}
			
		}
	}
}]);