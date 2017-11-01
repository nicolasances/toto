var gymServiceModule = angular.module('GymServiceModule', []);

gymServiceModule.factory('GymService', [ '$http', '$rootScope', '$location', '$mdDialog', function($http, $rootScope, $location, $mdDialog) {

	return {

		/**
		 * Retrieves the different muscles groups. 
		 * 
		 * Returns a promise with the groups.
		 */
		getMuscleGroups : function() {
			
			return $http.get("https://" + microservicesUrl + "/gym/archive");
			
		},

		/**
		 * Retrieves a specific rest day 
		 * 
		 * Requires: 
		 * 
		 *  - date		:	the date to check in YYYYMMDD format
		 */
		getRestDay : function(date) {
			
			return $http.get("https://" + microservicesUrl + "/gym/restDays?date=" + date);
		},
		
		/**
		 * Retrieves the scores for the specified muscle. 
		 * Scores are grouped by week.
		 * 
		 * Requires: 
		 *  - muscle	:	the id of the muscle group to consider
		 *  
		 *  - maxResults:	optionally, the maximum number of weeks to retrieve
		 */
		getScoresForMuscle : function(muscle, maxResults) {
			
			if (maxResults != null) return $http.get("https://" + microservicesUrl + "/gym/stats/muscles/" + muscle + "/scores?maxResults=" + maxResults);
			
			return $http.get("https://" + microservicesUrl + "/gym/stats/muscles/" + muscle + "/scores");
			
		},
		
		/**
		 * Retrieves the scores for the specified muscle and a specific week 
		 */
		getScoresForMuscleForWeek : function(muscle, weekOfYear, year) {
			
			return $http.get("https://" + microservicesUrl + "/gym/stats/muscles/" + muscle + "/scores?week=" + weekOfYear + "&year=" + year);
			
		},
		
		
		/**
		 * Creates the graph for the scores. 
		 * 
		 * This function will generate a graph and expects a particular HTML structure to work.
		 * The HTML structure must be the following: 
		 * <div ng-class="['plot']" id="plot-{{plot.year}}-{{plot.weekOfYear}}" ng-repeat="plot in muscleScoreWeeks"></div>
		 * This means that there must be <div>s for all the plots.
		 * 
		 * This function also generates the graph with the workouts efficacy plots (per week).
		 * The HTML structure must be the following: 
		 * <div ng-class="['efficacy-plot']" id="efficacy-{{plot.year}}-{{plot.weekOfYear}}" ng-repeat="plot in muscleScoreWeeks"></div>
		 * 
		 * The plots have to be provided as input to the method. 
		 * Parameters of this function are: 
		 * 
		 *  - scores :	it's an array of JSON objects made like this: 
		 *  			{score: double, year: integer, weekOfYear: integer, efficacy: double}
		 *  
		 *  - height :	it's the height of the graph (max height of the bars)
		 *  
		 *  This function doesn't return anything, since it modifies the <div> elements specified before.
		 */
		createMuscleScoreGraph : function(scores, containerHeight) {
			
			var barWidth = document.querySelector('#muscle-graph-container .plot').offsetWidth;
			
			var marginString = window.getComputedStyle(document.querySelector('#muscle-graph-container .plot')).marginLeft;
			var margin = parseInt(marginString.substring(0, marginString.length - 2));
			
			var maxEfficacy = 28.5;
			var efficacyScale = containerHeight / maxEfficacy;
			var efficacySpotWidth = barWidth;
			var efficacySpotLeftMargin = (barWidth - efficacySpotWidth);
			
			var efficacyCanvas = document.querySelector('#muscle-graph-container #efficacy-plot-canvas');
			efficacyCanvas.height = containerHeight;
			efficacyCanvas.width = document.querySelector('#muscle-graph-container').offsetWidth;

			var efficacyDrawingCtx = efficacyCanvas.getContext('2d');
			efficacyDrawingCtx.lineCap = 'round';
			efficacyDrawingCtx.lineWidth = 3;
			efficacyDrawingCtx.lineJoin = 'round';
			efficacyDrawingCtx.strokeStyle = '#0097A7';
			efficacyDrawingCtx.fillStyle = '#0097A7';
			efficacyDrawingCtx.clearRect(0, 0, efficacyCanvas.width, efficacyCanvas.height);
			efficacyDrawingCtx.beginPath();
			
			var i;
			
			// 1. Find highest value
			var highestValue = -1;
			var firstValue = 0;
			var secondValue = 0;
			for (i = 0; i < scores.length; i++) {
				if (scores[i].score > highestValue) highestValue = scores[i].score;
				if (i == 0) firstValue = scores[i].score;
				if (i == 1) secondValue = scores[i].score;
			}
			
			var yFactor = containerHeight / highestValue;
			
			// 2. Set x y coordinates
			var efficacyDrawLine = false;
			for (i = 0; i < scores.length; i++) {
				var height = scores[i].score * yFactor;
				
				var id = 'plot-' + scores[i].year + '-' + scores[i].weekOfYear + '';
				var el = document.getElementById(id);
				el.style.height = height + "px";
				
				var efficacyPlotX = margin + i * (barWidth + 2 * margin) + barWidth / 2;
				var efficacyPlotY = containerHeight - (efficacyScale * scores[i].efficacy);
				if (efficacyPlotY == 0) efficacyPlotY = efficacyDrawingCtx.lineWidth;
				
				if (efficacyDrawLine) {
					efficacyDrawingCtx.lineTo(efficacyPlotX, efficacyPlotY);
					efficacyDrawingCtx.stroke();
				}
				
				efficacyDrawingCtx.moveTo(efficacyPlotX, efficacyPlotY);
				efficacyDrawLine = true;
			}
			
			// 3. Set muscle icon's position
			var highestValueBetween1and2 = firstValue > secondValue ? firstValue : secondValue;

			var muscleIcon = document.querySelector('#muscle-graph-container .muscle-icon');

			muscleIcon.style.bottom = (highestValueBetween1and2 * yFactor + 6) + 'px';
		},
		
		/**
		 * Gets from the provided input (scores) the scores and calculates the deltas.
		 * 
		 * Only calculates the last 3 deltas.
		 * 
		 * This function takes as paramters: 
		 * 
		 *  - scores : 	it's an array of JSON objects made like this: 
		 *  			{score: double, year: integer, weekOfYear: integer}
		 *  
		 * This function returns: 
		 * 
		 *  - deltas :	it's an array of max 3 elements containing a double value or each delta
		 *  			array of double 
		 */
		calculateScoreDeltas : function(scores) {
			
			scoreDeltas = [];
			
			var prospection = 3;
			var index = scores.length - 1;

			var i;
			for (i = 0; i < prospection; i++) {
				
				if (index - i < 0 || index - i - 1 < 0) break;

				var score = scores[index - i].score;
				var lastScore = scores[index - i -1].score;
				
				var delta = score - lastScore;
				
				scoreDeltas.push(delta);
			}
			
			return scoreDeltas;
			
		},

		/**
		 * This function is used to popup a UI to change the settings (sets,
		 * reps, weights) of an exercise.
		 * 
		 * It requires the following parameters:
		 *  - exerciseType: a string containing the type of exercise (single,
		 * superset, dropset, ...)
		 *  - exercise: the exercise for which the sets, reps and weight have to
		 * be changed. Note that the exercise must be a single exercise, so, for
		 * example, in a superset, this function can only be used to change the
		 * settings of the single exercises composing the superset (so it should
		 * be called two times if you want to change the settings of both
		 * exercises)
		 *  - onSettingsChanged: a callback function(settings) that receives the
		 * changed settings
		 */
		showChangeExerciseSettingsUI : function(exerciseType, exercise, onSettingsChanged) {

			function DialogController($scope, $mdDialog) {

				$scope.exerciseType = exerciseType;
				$scope.settings = {
					sets : exercise.sets,
					reps1 : exercise.reps1,
					reps2 : exercise.reps1,
					reps3 : exercise.reps1,
					weight1 : exercise.weight1,
					weight2 : exercise.weight1,
					weight3 : exercise.weight1
				};

				if (exerciseType == 'dropset') {
					$scope.settings.weight2 = exercise.weight2;
				}
				if (exerciseType == 'striping') {
					$scope.settings.reps1 = 7;
					$scope.settings.reps2 = 7;
					$scope.settings.reps3 = 7;
					$scope.settings.weight2 = exercise.weight2;
					$scope.settings.weight3 = exercise.weight3;
				}
				if (exerciseType == 'hourglass') {
					$scope.settings.reps1 = 12;
					$scope.settings.reps2 = 10;
					$scope.settings.reps3 = 8;
					$scope.settings.weight2 = exercise.weight2;
					$scope.settings.weight3 = exercise.weight3;
				}

				$scope.answer = function(answer) {
					$mdDialog.hide(answer);
				}
				$scope.cancel = function() {
					$mdDialog.cancel();
				}

				$scope.changeSets = function(dir) {

					if (dir == 1) {
						$scope.settings.sets++;
					}
					if (dir == -1) {
						$scope.settings.sets--;
					}
				}

				$scope.changeReps = function(dir) {

					if (dir == 1) {
						$scope.settings.reps1++;
						
						if ($scope.exerciseType == 'dropset') $scope.settings.reps2++; 
					}
					if (dir == -1) {
						$scope.settings.reps1--;
						
						if ($scope.exerciseType == 'dropset') $scope.settings.reps2--;
					}
				}

				$scope.changeWeight = function(dir, amount) {

					if (dir == 1) {
						$scope.settings.weight1 += amount;
					}
					if (dir == -1) {
						$scope.settings.weight1 -= amount;
					}
				}

				$scope.changeWeight2 = function(dir, amount) {

					if (dir == 1) {
						$scope.settings.weight2 += amount;
					}
					if (dir == -1) {
						$scope.settings.weight2 -= amount;
					}
				}

				$scope.changeWeight3 = function(dir, amount) {

					if (dir == 1) {
						$scope.settings.weight3 += amount;
					}
					if (dir == -1) {
						$scope.settings.weight3 -= amount;
					}
				}

			}

			var templateUrl = 'dlgChangeExSingleSettings.html';
			if (exerciseType == 'dropset')
				templateUrl = 'dlgChangeExDropsetSettings.html';
			if (exerciseType == 'striping')
				templateUrl = 'dlgChangeExStripingSettings.html';
			if (exerciseType == 'hourglass')
				templateUrl = 'dlgChangeExHourglassSettings.html';

			var useFullScreen = false;
			var dialog = {
				controller : DialogController,
				templateUrl : 'modules/gym/' + templateUrl,
				parent : angular.element(document.body),
				clickOutsideToClose : true,
				fullscreen : useFullScreen
			};

			$mdDialog.show(dialog).then(onSettingsChanged, function() {
			});
		},

		/**
		 * Changes the settings (sets, reps, weights) of the provided exercise.
		 * 
		 * Parameters are:
		 *  - planId: the id of the plan the exercise refers to
		 *  - workoutId: the id of the workout the exercise refers to
		 *  - exercise: the exercise to change, with the updated data. The
		 * exercise must have at least this data: {type: 'e.g. single',
		 * exercises: []} Each exercise must at least contain the settings data:
		 * {sets: integer, reps1: integer, reps2: integer, reps3: integer,
		 * weight1: double, weight2: double, weight3: double}
		 * 
		 * This function returns a promise which is a function(data) where data
		 * is {score: double} containing the new score of the exercise
		 */
		changePlanExerciseSettings : function(planId, workoutId, exercise) {

			var data = {
				type : exercise.type,
				exercises : exercise.exercises
			};

			return $http.put("https://" + microservicesUrl + "/gym/plans/" + planId + "/workouts/" + workoutId + "/exercises/" + exercise.id, data);
		},

		/**
		 * Changes the settings (sets, reps, weights) of the provided exercise.
		 * 
		 * Parameters are:
		 *  - sessionId: the id of the session the exercise refers to
		 *  - exercise: the exercise to change, with the updated data. The
		 * exercise must have at least this data: {type: 'e.g. single',
		 * exercises: []} Each exercise must at least contain the settings data:
		 * {sets: integer, reps1: integer, reps2: integer, reps3: integer,
		 * weight1: double, weight2: double, weight3: double}
		 * 
		 * This function returns a promise which is a function(data) where data
		 * is {score: double} containing the new score of the exercise
		 */
		changeSessionExerciseSettings : function(sessionId, exercise) {

			var data = {
				type : exercise.type,
				exercises : exercise.exercises, 
				completed: exercise.completed
			};

			return $http.put("https://" + microservicesUrl + "/gym/sessions/" + sessionId + "/exercises/" + exercise.id, data);
		},

		/**
		 * Changes the exercise's mood
		 * 
		 * Parameters are:
		 *  - sessionId: the id of the session the exercise refers to
		 *  - exerciseId: the id of the exercise to modify
		 * 
		 */
		changeSessionExerciseMood : function(sessionId, exerciseId, mood) {

			var data = {
				mood : mood
			};

			return $http.put("https://" + microservicesUrl + "/gym/sessions/" + sessionId + "/exercises/" + exerciseId, data);
		},

		/**
		 * Changes the completion status of the exercise
		 */
		changeSessionExerciseCompletion : function(sessionId, exerciseId, completed) {
			
			return $http.put("https://" + microservicesUrl + "/gym/sessions/" + sessionId + "/exercises/" + exerciseId, {completed: completed});
		},

		/**
		 * This function shows a UI to start a new gym Session.
		 * 
		 * This function shoes two interfaces: 1. Choice of the Workout Plan to
		 * use 2. Choice of the Workout to use
		 * 
		 * This function requires the following parameters:
		 *  - onWorkoutSelected : callback function() that will receive the
		 * returned object
		 * 
		 * This function will return in the callback an object specifying the
		 * workout plan and the workout chosen: { planId: id of the plan
		 * planWorkoutId: id of the specific workout }
		 */
		showStartSessionUI : function(onWorkoutSelected) {

			function DialogController($scope, $mdDialog) {

				$scope.answer = function(answer) {
					$mdDialog.hide(answer);
				}
				$scope.cancel = function() {
					$mdDialog.cancel();
				}

				$scope.selectPlan = function(plan) {
					$scope.selectedPlan = plan;

					$http.get("https://" + microservicesUrl + "/gym/plans/" + plan.id + "/workouts").success(function(data, status, header, config) {
						$scope.workouts = data.workouts;
					});
				}

				$scope.selectWorkout = function(workout) {

					var answer = {
						planId : $scope.selectedPlan.id,
						planWorkoutId : workout.id
					};

					$scope.answer(answer);
				}

				$http.get("https://" + microservicesUrl + "/gym/plans").success(function(data, status, header, config) {
					$scope.plans = data.plans;
				});

			}

			var useFullScreen = window.matchMedia("(max-width: 960px)").matches;
			var dialog = {
				controller : DialogController,
				templateUrl : 'modules/gym/dlgStartSession.html',
				parent : angular.element(document.body),
				clickOutsideToClose : true,
				fullscreen : useFullScreen
			};

			$mdDialog.show(dialog).then(onWorkoutSelected, function() {
			});

		},

		/**
		 * This function shows a UI to change the mood of the exercise
		 *  - onMoodSelected : callback function() that will receive the
		 * selected mood
		 * 
		 * This function will return in the callback a string object: the mood
		 * 
		 */
		showChangeMoodUI : function(onMoodSelected) {

			function DialogController($scope, $mdDialog) {

				$scope.answer = function(answer) {
					$mdDialog.hide(answer);
				}
				$scope.cancel = function() {
					$mdDialog.cancel();
				}

				$scope.moods = [ 'dead', 'tired', 'ok' ];
			}

			var useFullScreen = false
			var dialog = {
				controller : DialogController,
				templateUrl : 'modules/gym/dlgChangeMood.html',
				parent : angular.element(document.body),
				clickOutsideToClose : true,
				fullscreen : useFullScreen
			};

			$mdDialog.show(dialog).then(onMoodSelected, function() {
			});

		},

		/**
		 * This function starts a new session. 
		 * 
		 * It takes the following parameters:
		 * 
		 *  - planId: the base plan
		 *  
		 *  - workoutId: 	the base plan workout chosen
		 * 					for this session 
		 * 	
		 *  - date: 		the date for which to create the session.
		 * 					The date must be in the yyyyMMdd format
		 * 
		 * This function will return a promise on which success() can be called.
		 * The data returned to the sucess() will be a
		 * 
		 * {sessionId: id of the created session}
		 * 
		 */
		startSession : function(planId, workoutId, date) {

			var data = {
				planId : planId,
				workoutId : workoutId,
				date : date
			};

			return $http.post("https://" + microservicesUrl + "/gym/sessions", data);
		}, 
		
		/**
		 * Completes the session
		 * Parameters: 
		 * 
		 *  - sessionId:	the id of the session
		 * 
		 * Returns a promise function() that will provide the score: {score: double} 
		 */
		completeSession : function(sessionId) {
			
			return $http.put("https://" + microservicesUrl + "/gym/sessions/" + sessionId, {completed: true});
		},
		
		/**
		 * Shows the UI to change the pain level
		 * 
		 * Requires two arguments: 
		 * 
		 * - painLevels	:			the list of pain level objects
		 * 
		 * - onPainLevelSelected :	the callback function to call when a pain level is selected 
		 */
		showPainLevelSelectionUI : function(painLevels, onPainLevelSelected) {

			function DialogController($scope, $mdDialog) {
				
				$scope.painLevels = painLevels;

				$scope.answer = function(answer) {
					$mdDialog.hide(answer);
				}
				$scope.cancel = function() {
					$mdDialog.cancel();
				}
			}

			var useFullScreen = false
			var dialog = {
				controller : DialogController,
				templateUrl : 'modules/gym/dlgSetPainLevel.html',
				parent : angular.element(document.body),
				clickOutsideToClose : true,
				fullscreen : useFullScreen
			};

			$mdDialog.show(dialog).then(onPainLevelSelected, function() {
			});

		},
		
		/**
		 * Sets the post-workout pain level of the session
		 */
		setSessionPainLevel : function(sessionId, painLevel) {
			
			$http.put("https://" + microservicesUrl + "/gym/sessions/" + sessionId, {postWorkoutPain: painLevel.id});
		},
		
		/**
		 * Shows the UI to change the fatigue level
		 * 
		 * Requires two arguments: 
		 * 
		 * - fatigueLevels	:		the list of fatigue level objects
		 * 
		 * - onPainLevelSelected :	the callback function to call when a fatigue level is selected 
		 */
		showFatigueLevelSelectionUI : function(fatigueLevels, onPainLevelSelected) {

			function DialogController($scope, $mdDialog) {
				
				$scope.fatigueLevels = fatigueLevels;

				$scope.answer = function(answer) {
					$mdDialog.hide(answer);
				}
				$scope.cancel = function() {
					$mdDialog.cancel();
				}
			}

			var useFullScreen = false
			var dialog = {
				controller : DialogController,
				templateUrl : 'modules/gym/dlgSetFatigueLevel.html',
				parent : angular.element(document.body),
				clickOutsideToClose : true,
				fullscreen : useFullScreen
			};

			$mdDialog.show(dialog).then(onPainLevelSelected, function() {
			});

		},
		
		/**
		 * Sets the post-workout fatigue level of the session
		 */
		setSessionFatigueLevel : function(sessionId, fatigueLevel) {
			
			$http.put("https://" + microservicesUrl + "/gym/sessions/" + sessionId, {postWorkoutFatigue: fatigueLevel.id});
		},
		
		/**
		 * Retrieves the list of week goals for all muscles. The goals are related to the specified pain level.
		 * 
		 * This function returns a promise 
		 */
		getMuscleWeekGoals : function(painLevel) {
			
			return $http.get("https://" + microservicesUrl + "/gym/stats/muscles/goals?painLevel=" + painLevel);
		},
		
		/**
		 * Retrieves the week goal for a single muscle. The goals are related to the specified pain level.
		 * 
		 * Requires:
		 *  - muscleId : 	the id of the muscle group
		 *  - painLevel : 	the requested pain level 
		 * 
		 * This function returns a promise 
		 */
		getMuscleWeekGoal : function(muscleId, painLevel) {
			
			return $http.get("https://" + microservicesUrl + "/gym/stats/muscles/" + muscleId + "/goal?painLevel=" + painLevel);
		},
		
		/**
		 * Retrieves the efficacy for a given fatigue and pain level
		 */
		calculateEfficacy : function(painLevel, fatigueLevel) {
			
			return $http.get("https://" + microservicesUrl + "/gym/efficacy?painLevel=" + painLevel + "&fatigueLevel=" + fatigueLevel);
		}, 
		
		/**
		 * Retrieves the gym settings and returns a promise
		 */
		getSettings : function() {
			
			return $http.get("https://" + microservicesUrl + "/gym/settings");
		}, 
		
		/**
		 * Changes the score algorithm to the one provided. 
		 * 
		 *  - algorithmId : the id of the algorithm to use (base, evolved, ...)
		 *  
		 * Returns a promise, but no data is expected. 
		 */
		changeScoreAlgorithm : function(algorithmId) {
			
			return $http.put("https://" + microservicesUrl + "/gym/settings/", {scoringAlgorithmId : algorithmId});
		}, 
		
		/**
		 * Retrieves the sessions. This method can take different filters:
		 * 
		 *  - date	:	the date in yyyyMMdd format on which to look for sessions
		 *  
		 * This method returns a promise with the list of sessions in data : {sessions: []}
		 */
		getSessions : function(date) {
			
			if (date != null) return $http.get("https://" + microservicesUrl + "/gym/sessions?date=" + date);
			
			return $http.get("https://" + microservicesUrl + "/gym/sessions");
			
		}, 
		
		/**
		 * This method returns a specific session, identified by its id
		 * 
		 *  - id	:	the unique session identifier
		 *  
		 * Returns a promise that will give the session object
		 */
		getSession : function(sessionId) {
			
			return $http.get("https://" + microservicesUrl + "/gym/sessions/" + sessionId);
		}, 
		
		/**
		 * Returns the summary of the specified week 
		 * 
		 * Requires: 
		 * 
		 * - week			:	integer
		 * 
		 * - year			:	integer
		 * 
		 * - efficacyGoal	:	the goal in terms of efficacy (double)
		 */
		getWeekSummary : function(week, year, efficacyGoal) {
			
			return $http.get("https://" + microservicesUrl + "/gym/weeks?week=" + week + "&year=" + year + "&efficacyGoal=" + efficacyGoal);
		}
	}

} ]);
