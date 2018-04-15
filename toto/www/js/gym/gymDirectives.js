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