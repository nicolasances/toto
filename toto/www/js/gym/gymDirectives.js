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
 * This directive shows details related to the training week. 
 * Those details include 
 * 	- list of muscles, highlighting the ones done during the week
 *  - possibility to start a new session
 *  - the detail of a specific training session that happened during the week
 * 
 */
gymDirectivesModule.directive('gymWeekDetails', ['GymService', '$timeout', function(GymService, $timeout) {
	
	return {
		scope: {
		},
		templateUrl: 'modules/gym/directives/gym-week-details.html',
		controller: function($scope, $element) {

			/**
			 * Initialize the current slide
			 */
			var currentSlide = document.querySelector('#gymMuscles');
			
			/**
			 * Slide out the elements that shouldn't be seen at the beginning
			 */
			TotoSlideOut.slideOut([document.querySelector('#gymStartSession')]);
			TotoSlideOut.slideOut([document.querySelector('#gymSessionDetails')]);
			
			/**
			 * Register to the gymUIDaySelected
			 * When receiving that event, only show the muscle that has been selected  
			 */
			TotoEventBus.subscribeToEvent('gymUIDaySelected', function(event) {
				
				if (event == null) {console.log('Received gymUIDaySelected but no event attached'); return;};
				if (event.context == null || event.context.data == null) {console.log('Received gymUIDaySelected but no context or data attached.'); return;}

				// Get the data from the context
				// This data should contain all the necessary info about the workout session
				var data = event.context.data;
				
				/**
				 * If there is no session on that specific day, 
				 * then present the "start session utility"
				 */
				if (data.session == null) {
					
					/**
					 * Slide out the currentSlide
					 * ... and slide in the new session utility 
					 */
					TotoSlideOut.slideOut([currentSlide], function() {
						
						TotoSlideOut.slideIn(document.querySelector('#gymStartSession'), $element[0]);
						
						// Save in scope the selected date
						$scope.selectedDate = data.date;
						
						// Update the currentSlide
						currentSlide = document.querySelector('#gymStartSession');
					});
				}
				/**
				 * If there was a session that day, present the details of that session
				 */
				else {
					
					/**
					 * Retrieve the workout that is associated with the selected session. 
					 * The session has been selected and passed as part of the event
					 */
					GymService.getWorkout(data.session.planId, data.session.workoutId).success(function(workout) {
						
						/**
						 * Slide out the muscles list 
						 * ... and slide in the session details 
						 */
						TotoSlideOut.slideOut([currentSlide], function() {
							
							// Set the scope variables
							$scope.workout = workout;
							$scope.session = data.session;
							$scope.sessionDate = data.date;
							$scope.$apply();
							
							TotoSlideOut.slideIn(document.querySelector('#gymSessionDetails'), $element[0]);
							
							// Update the currentSlide
							currentSlide = document.querySelector('#gymSessionDetails');
							
						});
					});
				}
			});
			
			/**
			 * Register to the gymUIDayUnselected event
			 * When receiving that event, hide the "start session stuff"
			 */
			TotoEventBus.subscribeToEvent('gymUIDayUnselected', function(event) {
				
				TotoSlideOut.slideOut([currentSlide], function() {
					
					TotoSlideOut.slideIn(document.querySelector('#gymMuscles'), $element[0]);
					
					// Update the currentSlide
					currentSlide = document.querySelector('#gymMuscles');
				});
			});
			
			// Retrieve all muscle groups
			GymService.getMuscleGroups().success(function(data) {
				
				$scope.muscles = data.muscleGroups;
			});
			
			// Retrieve sessions
			GymService.getSessionsCurrentWeek().success(function(data) {
				
				$scope.sessions = data.sessions;
				
				for (var i = 0; i < data.sessions.length; i++) {
					
					// 3. Retrieve impacted muscles
					GymService.getSession(data.sessions[i].id).success(function(data) {
						
						updateMusclesList(data.impactedMuscles);
						
					});
				}
				
			});
			
			/**
			 * Subscribe to 'gymSessionCompleted'
			 * React based on the scenario: 
			 * 
			 *  - If the 'start session' slide is active, hide it and load the session details one
			 *  - If the session details slide is active, activate the "post-workout" data
			 */
			TotoEventBus.subscribeToEvent('gymSessionCompleted', function(event) {
				
				if (event == null) {console.log('Received gymSessionCompleted but no event attached'); return;};
				if (event.context == null || event.context.sessionId == null) {console.log('Received gymSessionCompleted but no context or sessionId attached.'); return;}

				// Reload the session
				GymService.getSession(event.context.sessionId).success(function(data) {
					
					$scope.session = data;
					
				});
				
				// If the start session slide is active, remove id
				if (currentSlide.getAttribute('id') == 'gymStartSession') {
					
					TotoSlideOut.slideOut([currentSlide], function() {
						
						TotoSlideOut.slideIn(document.querySelector('#gymSessionDetails'), $element[0]);
						
						// Update the currentSlide
						currentSlide = document.querySelector('#gymSessionDetails');
					});
				}
			
			});
			
			/**
			 * Listen to the event 'gymSessionStarted'
			 * React based on the scenario
			 * 
			 *  - If the 'start session' slide is active, hide it and load the session details slide
			 */
			TotoEventBus.subscribeToEvent('gymSessionStarted', function(event) {
				
				if (event == null) {console.log('Received gymSessionStarted but no event attached'); return;};
				if (event.context == null || event.context.sessionId == null) {console.log('Received gymSessionStarted but no context or sessionId attached.'); return;}
				
				// If the start session slide is active, remove id
				if (currentSlide.getAttribute('id') == 'gymStartSession') {
					
					TotoSlideOut.slideOut([currentSlide], function() {
						
						TotoSlideOut.slideIn(document.querySelector('#gymSessionDetails'), $element[0]);
						
						// Update the currentSlide
						currentSlide = document.querySelector('#gymSessionDetails');
						
						// Set the session as completed
						GymService.getSession(event.context.sessionId).success(function(data) {
							
							$scope.session = data;
							$scope.sessionDate = new Date(moment($scope.session.date, 'YYYYMMDD'));
							
							// Also load the workout data
							GymService.getWorkout($scope.session.planId, $scope.session.workoutId).success(function(workout) {
								
								$scope.workout = workout;
							});
						});
					});
				}
			
			});
			
			/**
			 * Starts a session in a specified day.
			 * 
			 * The session will be started on the current selected day.
			 */
			$scope.startSession = function() {
				
				GymService.showStartSessionUI(function(answer) {

					GymService.startSession(answer.planId, answer.planWorkoutId, moment($scope.selectedDate).format('YYYYMMDD')).success(function(data) {
						
						// Send an event of "session started" with the new session id
						TotoEventBus.publishEvent({name: 'gymSessionStarted', context: {sessionId: data.sessionId}});

						// When the session has been started, slide everything out and go to the session
						TotoEventBus.publishEvent({name: 'slideNavigationRequested', context: {source: $element[0], destination: 'gymSessionExecutionSlide'}});

					});
				});
				
			}
			
			/**
			 * Resumes a session
			 * This will load the slide with the session detail
			 */
			$scope.resumeSession = function(sessionId) {
				
				// Slide everything out and go to the session
				TotoEventBus.publishEvent({name: 'slideNavigationRequested', context: {source: $element[0], destination: 'gymSessionExecutionSlide'}});
				
				// Send an event of "session resumed" with the new session id
				TotoEventBus.publishEvent({name: 'gymSessionResumed', context: {sessionId: sessionId}});
				
			}
			
			/**
			 * Deletes a session
			 */
			$scope.deleteSession = function(sessionId) {
				
				// Delete the session
				GymService.deleteSession(sessionId).success(function(data) {
					
					// Unselect the current gym day
					TotoEventBus.publishEvent({name: 'gymUIDayUnselected'});
					
					// Publish the session deleted event!
					TotoEventBus.publishEvent({name: 'gymSessionDeleted', context: {sessionId: sessionId}});
				});
			}
			
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
					
					for (var x = 0; x < $scope.muscles.length; x++) {
						
						if (impactedMuscles[j].muscle.name == $scope.muscles[x].name) $scope.muscles[x].worked = true;
					}
				}

			}
			
		},
		link: function(scope, el) {
			
			el[0].classList.add('layout-column');
			el[0].classList.add('flex');
			el[0].style.position = 'relative'; // Very important! 
			
			document.querySelector('#gymMuscles').style.top = '0px';
			document.querySelector('#gymStartSession').style.top = '0px';
			
			scope.$watch(el[0].offsetHeight, function(nv, ov) {
				document.querySelector('#gymStartSession').style.height = el[0].offsetHeight + 'px';
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
			
			/**
			 * Create the list of days of the week
			 * This list will then be filled when the sessions get loaded from the API
			 */
			scope.days = [];
			var startOfWeek = moment().startOf('week');
			
			if (startOfWeek.format('YYYYMMDD') == moment().format('YYYYMMDD')) startOfWeek.subtract(7, 'days');
			
			startOfWeek.add(1, 'days');
			
			scope.days.push({date: new Date(startOfWeek)});

			for (var i = 1; i < 7; i++) {
				scope.days.push({date: new Date(moment(startOfWeek).add(i, 'days'))});
			}
			
			/**
			 * Retrieve the list of sessions of the current week
			 * and update the graph
			 */
			var loadSessions = function() {
				
				GymService.getSessionsCurrentWeek().success(function(data) {
					
					/**
					 * For each session retrieve the details with impacted muscle
					 */
					for (var i = 0; i < data.sessions.length; i++) {
						
						for (var j = 0; j < scope.days.length; j++) {
							
							if (moment(scope.days[j].date).format('YYYYMMDD') == data.sessions[i].date) {
								
								scope.days[j].session = data.sessions[i];
								
								// 3. Retrieve session details & impacted muscle
								GymService.getSession(data.sessions[i].id).success(function(data) {
									
									/**
									 * Update the details of the session 
									 */
									for (var i = 0; i < scope.days.length; i++) {
										
										if (scope.days[i].session != null && scope.days[i].session.id == data.id) {
											scope.days[i].session = data;
											break;
										}
									}
									
									/**
									 * Retrieve the plan details
									 */
									GymService.getPlan(data.planId).success(function(data) {
										
										scope.plans.push(data);
										
										updatePlanName();
									});
									
								});
							}
							
						}
					}
					
					updateGraphWithWorkedDays();
				});
			}
			
			/**
			 * Listen to 'gymUIDayUnselected' 
			 * React by reducing the size of the arc back to normal
			 */
			TotoEventBus.subscribeToEvent('gymUIDayUnselected', function(event) {

				if (event == null) {console.log('Received gymUIDayUnselected with null event'); return; }
				
				// Unset the selected day and selected data item 
				scope.selectedDay = null;
				scope.selectedItem = null;
				
				// Tween back the arc to normal
				g.selectAll('.emptyArc').data(scope.days)
					.transition(300)
					.attr('d', arc);
				
			});
			
			/**
			 * List to 'gymSessionStarted'
			 * React by updating the graph colors
			 */
			TotoEventBus.subscribeToEvent('gymSessionStarted', function(event) {
				
				// Reload the session
				loadSessions();
				
			});
			
			/**
			 * Listen to 'gymSessionDeleted'
			 * React by removing the colouring on that specific day
			 */
			TotoEventBus.subscribeToEvent('gymSessionDeleted', function(event) {
				
				if (event == null) {console.log('Received gymSessionDeleted with null event'); return;}
				if (event.context == null || event.context.sessionId == null) {console.log('Received gymSessionDeleted with no sessionId'); return;}
				
				/**
				 * Find the session and remove the colouring
				 */
				for (var i = 0; i < scope.days.length; i++) {
					
					// If that's the session remove it from the list
					if (scope.days[i].session != null && scope.days[i].session.id == event.context.sessionId) {
						
						scope.days[i].session = null;
						
						break;
					}
				}

				updateGraphWithWorkedDays();
			});
			
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
			
			var arc = d3.arc().innerRadius(function(d, i) {if (i == scope.selectedDay) return 60; return 70;}).outerRadius(function(d, i) {if (i == scope.selectedDay) return 100; return 80;}).startAngle(function(d, i) {return i * arcRadialLength;}).endAngle(function(d, i) {return arcRadialLength * (i + 1) - arcGutter;});
			
			var goodPainArc = d3.arc().innerRadius(85).outerRadius(90)
						.startAngle(function(d, i) {if (d.session != null && (d.session.postWorkoutPain == 'goodPain' || d.session.postWorkoutPain == 'extremePain')) return i * arcRadialLength; return 0;})
						.endAngle(function(d, i) {if (d.session != null && (d.session.postWorkoutPain == 'goodPain' || d.session.postWorkoutPain == 'extremePain')) return arcRadialLength * (i + 1) - arcGutter; return 0;});
			
			var extremePainArc = d3.arc().innerRadius(95).outerRadius(100)
						.startAngle(function(d, i) {if (d.session != null && d.session.postWorkoutPain == 'extremePain') return i * arcRadialLength; return 0;})
						.endAngle(function(d, i) {if (d.session != null && d.session.postWorkoutPain == 'extremePain') return arcRadialLength * (i + 1) - arcGutter; return 0;});
			
			/**
			 * React to a click on an arc. 
			 * The reaction varies based on the scenario: 
			 * 
			 *  - if the arc corresponds to a day without training, it selects the arc and show a "play" button to start a new session on that day
			 *  
			 *  - if the arc corresponds to a day where some training has been performed it will show the details of that session
			 *  
			 * No matter what the arc will be expanded in depth to show the selection made
			 */
			var onArcClick = function(d, i) {
				
				/**
				 * If the selected day is already selected, throw a different event : 
				 * gymUIDayUnselected instead of the gymUIDaySelected event.
				 */
				if (scope.selectedDay == i) {
					
					TotoEventBus.publishEvent({name: 'gymUIDayUnselected', context: null});
					
					return;
				}
				
				// Set the selected day and selected data item 
				scope.selectedDay = i;
				scope.selectedItem = d;
				
				// Tween the arc
				g.selectAll('.emptyArc').data(scope.days)
					.transition(300)
					.attr('d', arc);
				
				// Fire an event 
				TotoEventBus.publishEvent({name: 'gymUIDaySelected', context: {data: d}});
				
			}

			/** 
			 * Empty arc, without any color of workout
			 */
			g.selectAll('.emptyArc').data(scope.days).enter().append('path')
					.attr('id', function(d, i) {return 'dayArc' + i;})
					.attr('class', 'emptyArc')
					.attr('fill', graphicAreaFill)
					.attr('transform', 'translate(' + container.offsetWidth/2 + ', ' + container.offsetHeight/2 + ')')
					.attr('d', arc)
					.on('click', onArcClick);
			
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
					.attr('d', goodPainArc)
					.on('click', onArcClick);
				
				g.selectAll('.extremePainArc').data(scope.days).enter().append('path')
					.attr('class', 'extremePainArc')
					.attr('fill', accentColor)
					.attr('transform', 'translate(' + container.offsetWidth/2 + ', ' + container.offsetHeight/2 + ')')
					.attr('d', extremePainArc)
					.on('click', onArcClick);
				
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
			
			loadSessions();
		}
	}
}]);

/**
 * Post workout impressions directive. 
 * It basically shows the post workout fatigue and post-workout pain experienced
 * 
 * This directive also supports updating the post workout data by clicking on the icons
 * 
 * - session		:	the gym session as an object
 * 						the object must contain {postWorkoutFatigue: string, postWorkoutPain: string)
 *  
 */
gymDirectivesModule.directive('gymPostWorkout', function(GymService, $timeout) {
	
	return {
		scope: {
			session : '='
		},
		templateUrl: 'modules/gym/directives/gym-post-workout.html',
		controller: function($scope) {
			
			/**
			 * Sets the pain level of the session
			 */
			$scope.setPainLevel = function() {
				
				GymService.showPainLevelSelectionUI(painLevels, function (painLevel) {
					
					GymService.setSessionPainLevel($scope.session.id, painLevel);
					
					$scope.session.postWorkoutPain = painLevel.id;
					$scope.session.postWorkoutPainImageUrl = painLevel.imageUrl;
					
				});
			}
			
			/**
			 * Sets the fatigue level of the session
			 */
			$scope.setFatigueLevel = function(fatigueLevel) {
				
				GymService.showFatigueLevelSelectionUI(fatigueLevels, function (fatigueLevel) {
					
					GymService.setSessionFatigueLevel($scope.session.id, fatigueLevel);
					
					$scope.session.postWorkoutFatigue = fatigueLevel.id;
					$scope.session.postWorkoutFatigueImageUrl = fatigueLevel.imageUrl;
					
				});
			}

		},
		link: function(scope, el) {
			
			// Set the basic element styles
			el[0].classList.add('layout-row');
			el[0].classList.add('flex');
			
			scope.$watch('session', function(newValue, oldValue) {
				
				if (scope.session == null) return;
				
				// Set the images
				if (scope.session.postWorkoutPain != null) {
					scope.session.postWorkoutPainImageUrl = getPostWorkoutPainImageUrl(scope.session.postWorkoutPain);
				}
				
				if (scope.session.postWorkoutFatigue != null) {
					scope.session.postWorkoutFatigueImageUrl = getPostWorkoutFatigueImageUrl(scope.session.postWorkoutFatigue);
				}
				
			});
		}
	}
});

gymDirectivesModule.directive('gymSessionDetail', function(GymService, $timeout) {
	
	return {
		scope: {
			sessionId : '='
		},
		templateUrl: 'modules/gym/directives/gym-session-detail.html',
		link: function(scope, el) {
			
			el[0].classList.add('layout-column');
			el[0].classList.add('flex');
			el[0].classList.add('scroll');
			
			/**
			 * Subscribe to the session started event and react by loading the session
			 */
			TotoEventBus.subscribeToEvent('gymSessionStarted', function(event) {
				
				if (event == null) {console.log('Received gymSessionStarted event with null event'); return;}
				if (event.context == null) {console.log('Received gymSessionStarted event with null context'); return;}
				if (event.context.sessionId == null) {console.log('Received gymSessionStarted event with null sessionId'); return;}

				// Load the session and the workout data
				GymService.getSession(event.context.sessionId).success(function(data) {
					
					scope.session = data;
					
					loadWorkout();
				});
				
				// Load the exercises of the session
				loadExercises(event.context.sessionId);
			});
			
			/**
			 * Subscribe to the session started event and react by loading the session
			 */
			TotoEventBus.subscribeToEvent('gymSessionResumed', function(event) {
				
				if (event == null) {console.log('Received gymSessionResumed event with null event'); return;}
				if (event.context == null) {console.log('Received gymSessionResumed event with null context'); return;}
				if (event.context.sessionId == null) {console.log('Received gymSessionResumed event with null sessionId'); return;}

				// Load the session and the workout data
				GymService.getSession(event.context.sessionId).success(function(data) {
					
					scope.session = data;
					
					loadWorkout();
				});
				
				// Load the exercises of the session
				loadExercises(event.context.sessionId);
			});
			
			/**
			 * Loads the related plan workout
			 */
			var loadWorkout = function() {
				
				GymService.getWorkout(scope.session.planId, scope.session.workoutId).success(function(data) {
					
					scope.workout = data;
				});
				
			}
			
			/**
			 * Loads the session exercises
			 */
			var loadExercises = function(sessionId) {
				 
				GymService.getSessionExercises(sessionId).success(function(data) {
					scope.exercises = data.exercises;
					 
				});
			}
			
			/**
			 * Changes the mood of the provided exercise
			 */
			scope.changeMood = function(ex) {
				
				GymService.showChangeMoodUI(function(mood) {
					
					GymService.changeSessionExerciseMood(scope.session.id, ex.id, mood);
					
					ex.mood = mood;
				});
			}
			
			/**
			 * Toggles the completion of the exercise
			 */
			scope.toggleCompletion = function(ex) {
				
				if (ex.completed == null) ex.completed = false;
				
				ex.completed = !ex.completed; 
				
				scope.exercise = ex;
				
				GymService.changeSessionExerciseCompletion(scope.session.id, ex.id, ex.completed).success(function (data) {
					scope.exercise.score = data.score;
				});
			}
			
			/**
			 * Completes the session
			 */
			scope.completeSession = function() {
				
				GymService.completeSession(scope.session.id).success(function(data) {
					scope.session.completed = true;
					scope.session.score = data.score;
					
					/**
					 * Publish the session completed event
					 */
					TotoEventBus.publishEvent({name: 'gymSessionCompleted', context: {sessionId: scope.session.id}});
				});
			}
			
			/**
			 * Changes the settings of a single exercise (so in case, for example, of
			 * superset, it will change the settings of one of the exercises of the
			 * superset)
			 * 
			 * @param singleExercise:
			 *            the single exercise for which the params must be modified
			 * @param exercise:
			 *            the overall exercise
			 */
			scope.changeSettings = function(singleExercise, exercise) {
				
				scope.exercise = exercise;
				scope.singleExercise = singleExercise;
				
				GymService.showChangeExerciseSettingsUI(exercise.type, singleExercise, function(settings) {
					
					scope.singleExercise.sets = settings.sets;
					scope.singleExercise.reps1 = settings.reps1;
					scope.singleExercise.reps2 = settings.reps2;
					scope.singleExercise.reps3 = settings.reps3;
					scope.singleExercise.weight1 = settings.weight1;
					scope.singleExercise.weight2 = settings.weight2;
					scope.singleExercise.weight3 = settings.weight3;
					
					GymService.changeSessionExerciseSettings(scope.session.id, scope.exercise).success(function(data) {
						scope.exercise.score = data.score;
					});
					
				});
			}
		}
	}
});


