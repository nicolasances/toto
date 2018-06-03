var gymDirectivesModule = angular.module('gymDirectivesModule', ['GymServiceModule']);

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
 * This directive shows the list of muscles, highlighting the ones done during the week
 * 
 * Parameters: 
 * 
 */
gymDirectivesModule.directive('gymWeekMuscles', ['GymService', '$timeout', function(GymService, $timeout) {
	
	return {
		scope: {
		},
		templateUrl: 'modules/gym/directives/gym-week-muscles.html',
		link: function(scope) {
			
			/**
			 * Updates the list of muscles that have been worked out 
			 * with what is contained in the scope variable
			 */
			var updateMusclesList = function(impactedMuscles) {
				
				if (impactedMuscles == null) return;
				
				/**
				 * For each impacted muscle, find the muscle and set it to "worked"
				 */
				for (var j = 0; j < impactedMuscles.length; j++) {
					
					for (var x = 0; x < scope.muscles.length; x++) {
						
						if (impactedMuscles[j].muscle.name == scope.muscles[x].name) scope.muscles[x].worked = true;
					}
				}

			}
			
			// Retrieve all muscle groups
			GymService.getMuscleGroups().success(function(data) {
				
				scope.muscles = data.muscleGroups;
			});
			
			// Retrieve sessions
			GymService.getSessionsCurrentWeek().success(function(data) {
				
				scope.sessions = data.sessions;
				
				for (var i = 0; i < data.sessions.length; i++) {
					
					// 3. Retrieve impacted muscles
					GymService.getSession(data.sessions[i].id).success(function(data) {
						
						updateMusclesList(data.impactedMuscles);
						
					});
				}
				
			});
		}
	}
}]);

/**
 * This directive draws the week summary as a wheel
 * 
 * Parameters: 
 * 
 *  	-	... 		:	...
 */
gymDirectivesModule.directive('gymWeekWheel', ['GymService', '$timeout', '$rootScope', function(GymService, $timeout, $rootScope) {
	
	return {
		scope: {
		},
		link: function(scope, el) {
			
			var container = el[0];
			container.classList.add('layout-column');
			container.id = 'gymWeek-' + Math.floor(Math.random() * 1000000);
			
			scope.plans = [];
			
			// 1. Create days of week
			scope.days = [];
			var startOfWeek = moment().startOf('week');
			
			if (startOfWeek.format('YYYYMMDD') == moment().format('YYYYMMDD')) startOfWeek.subtract(7, 'days');
			
			startOfWeek.add(1, 'days');
			
			scope.days.push({date: new Date(startOfWeek)});

			for (var i = 1; i < 7; i++) {
				scope.days.push({date: new Date(moment(startOfWeek).add(i, 'days'))});
			}
			
			// 2. Retrieve sessions
			GymService.getSessionsCurrentWeek().success(function(data) {
				
				/**
				 * For each session retrieve the details with impacted muscle
				 */
				for (var i = 0; i < data.sessions.length; i++) {
					
					scope.days[i].session = data.sessions[i];
					
					// 3. Retrieve session details & impacted muscle
					GymService.getSession(data.sessions[i].id).success(function(data) {
						
						/**
						 * Update the details of the session 
						 */
						for (var i = 0; i < scope.days.length; i++) {
							
							if (scope.days[i].session.id == data.id) {
								scope.days[i].session = data;
								break;
							}
						}
						
						/**
						 * REtrieve the plan ID
						 */
						GymService.getPlan(data.planId).success(function(data) {
							scope.plans.push(data);
							
							updatePlanName();
						});
						
					});
				}
				
				updateGraphWithWorkedDays();
			});
			
			
			/**
			 * Starts or resume a session in a specified day.
			 * 
			 * The session will be started if there are no sessions ongoing for that
			 * day. The session will be resumed if there is a session ongoing for that
			 * day.
			 * 
			 * Parameters:
			 *  - session: the gym session
			 */
			scope.startOrResumeSession = function(session, date) {
				
				if (session == null) {
					
					GymService.showStartSessionUI(function(answer) {

						GymService.startSession(answer.planId, answer.planWorkoutId, moment(date).format('YYYYMMDD')).success(function(data) {
							$rootScope.go('/gym/sessions/' + data.sessionId);
						});
					});
					
				}
				else {
					
					$rootScope.go('/gym/sessions/' + session.id);
				}
			}
			
			/**
			 * Creates the basic the week wheel, without any indication of what has been done. 
			 * It's just the empty wheel, that will have to be filled.   
			 */
			var svg = d3.select(container).append('svg')
					.attr('width', container.offsetWidth)
					.attr('height', container.offsetHeight);
			
			var g = svg.append('g');
			
			var arcGutter = 0.01 * 2 * Math.PI;
			var arcRadialLength = 2 * Math.PI / 7;
			var arc = d3.arc().innerRadius(70).outerRadius(80)
						.startAngle(function(d, i) {return i * arcRadialLength;})
						.endAngle(function(d, i) {return arcRadialLength * (i + 1) - arcGutter;});
			var goodPainArc = d3.arc().innerRadius(85).outerRadius(90)
						.startAngle(function(d, i) {if (d.session != null && (d.session.postWorkoutPain == 'goodPain' || d.session.postWorkoutPain == 'extremePain')) return i * arcRadialLength; return 0;})
						.endAngle(function(d, i) {if (d.session != null && (d.session.postWorkoutPain == 'goodPain' || d.session.postWorkoutPain == 'extremePain')) return arcRadialLength * (i + 1) - arcGutter; return 0;});
			var extremePainArc = d3.arc().innerRadius(95).outerRadius(100)
						.startAngle(function(d, i) {if (d.session != null && d.session.postWorkoutPain == 'extremePain') return i * arcRadialLength; return 0;})
						.endAngle(function(d, i) {if (d.session != null && d.session.postWorkoutPain == 'extremePain') return arcRadialLength * (i + 1) - arcGutter; return 0;});
			
			/**
			 * Arc tween animation
			 */
			var arcTween = function(arc, target) {
				
				return function(d) {
					var interpolate = d3.interpolate(0, target);
					
					return function(t) {
						
						arc.endAngle(interpolate(t));
						
						return arc();
					}
				}
			}

			/** 
			 * Empty arc, without any color of workout
			 */
			g.selectAll('.emptyArc').data(scope.days).enter().append('path')
					.attr('id', function(d, i) {return 'dayArc' + i;})
					.attr('class', 'emptyArc')
					.attr('fill', graphicAreaFill)
					.attr('transform', 'translate(' + container.offsetWidth/2 + ', ' + container.offsetHeight/2 + ')')
					.attr('d', arc);
			
			/**
			 * Updates the graph with the worked days: 
			 * 
			 *   - Updates the worked day (if the days has been worked: color change)
			 *   - Updates the impact (if good pain => 1 bar, if extreme pain => 2 bars)
			 */
			var updateGraphWithWorkedDays = function() {
				
				g.selectAll('.emptyArc').data(scope.days)
					.attr('fill', function(d) {if (d.session != null) return accentColor; return graphicAreaFill;});
				
				g.selectAll('.goodPainArc').data(scope.days).enter().append('path')
					.attr('class', 'goodPainArc')
					.attr('fill', accentColor)
					.attr('transform', 'translate(' + container.offsetWidth/2 + ', ' + container.offsetHeight/2 + ')')
					.attr('d', goodPainArc);
				
				g.selectAll('.extremePainArc').data(scope.days).enter().append('path')
					.attr('class', 'extremePainArc')
					.attr('fill', accentColor)
					.attr('transform', 'translate(' + container.offsetWidth/2 + ', ' + container.offsetHeight/2 + ')')
					.attr('d', extremePainArc);
				
			}
			
			/**
			 * Updates the name of the plan and create the SVG TEXT element in the 
			 * center of the circle. 
			 */
			var updatePlanName = function() {
				
				g.selectAll('.planName').data([scope.plans[0]]).enter().append('text')
					.attr('class', function(d) {if (d.name.length < 12) return 'planName toto-s'; return 'planName toto-xs';})
					.attr('x', container.offsetWidth / 2)
					.attr('y', container.offsetHeight / 2)
					.attr('text-anchor', 'middle')
					.text(function(d) {return d.name})
				
			}
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
		templateUrl: 'modules/gym/directives/gym-week.html',
		link: function(scope, el) {
			
			el[0].classList.add('flex');
			el[0].classList.add('layout-column');
			el[0].id = 'gymWeek-' + Math.floor(Math.random() * 1000000);
			
			// 1. Create days of week
			scope.days = [];
			var startOfWeek = moment().startOf('week');
			
			if (startOfWeek.format('YYYYMMDD') == moment().format('YYYYMMDD')) startOfWeek.subtract(7, 'days');
			
			startOfWeek.add(1, 'days');
			
			scope.days.push({date: new Date(startOfWeek)});

			for (var i = 1; i < 7; i++) {
				scope.days.push({date: new Date(moment(startOfWeek).add(i, 'days'))});
			}

			// 2. Retrieve sessions
			GymService.getSessionsCurrentWeek().success(function(data) {
				
				for (var i = 0; i < data.sessions.length; i++) {
					
					scope.days[i].session = data.sessions[i];
					
					// 3. Retrieve session details & impacted muscle
					GymService.getSession(data.sessions[i].id).success(function(data) {
						
						console.log(data);
						
						for (var i = 0; i < scope.days.length; i++) {
							
							if (scope.days[i].session.id == data.id) {
								scope.days[i].session = data;
								break;
							}
						}
						
					});
				}
			});
			
			
			GymService.calculateEfficacy('goodPain', 'ok').success(function(data) {

				scope.benchmarkEfficacy = data.efficacy;
				
			});

			/**
			 * Starts or resume a session in a specified day.
			 * 
			 * The session will be started if there are no sessions ongoing for that
			 * day. The session will be resumed if there is a session ongoing for that
			 * day.
			 * 
			 * Parameters:
			 *  - session: the gym session
			 */
			scope.startOrResumeSession = function(session, date) {
				
				if (session == null) {
					
					GymService.showStartSessionUI(function(answer) {

						GymService.startSession(answer.planId, answer.planWorkoutId, moment(date).format('YYYYMMDD')).success(function(data) {
							$rootScope.go('/gym/sessions/' + data.sessionId);
						});
					});
					
				}
				else {
					
					$rootScope.go('/gym/sessions/' + session.id);
				}
			}
	      
		}
	}
}]);