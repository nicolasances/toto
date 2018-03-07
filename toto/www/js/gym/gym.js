var gymModule = angular.module("gymModule", ['calendarServiceModule', 'GymServiceModule', 'BodyWeightServiceModule']);
var gymMenus = [
	{path: '/gym', imageUrl: 'images/svg/dashboard.svg', name: 'Dashboard', selected: true},
	{path: '/gym/plans', imageUrl: 'images/svg/clipboard.svg', name: 'Workout plans'},
	{path: '/gym/archive', imageUrl: 'images/svg/archived.svg', name: 'Archive'},
	{path: '/gym/sessions', imageUrl: 'images/svg/calendar.svg', name: 'Workout sessions'},
	{path: '/gym/weights', imageUrl: 'images/svg/dumbbell.svg', name: 'Weight measurements'},
	{path: '/gym/settings', imageUrl: 'images/svg/settings.svg', name: 'Settings'}
];
var painLevels = [
    {id: 'noPain', imageUrl: 'images/gym/pain/none.svg'}, 
    {id: 'somePain', imageUrl: 'images/gym/pain/some.svg'}, 
    {id: 'goodPain', imageUrl: 'images/gym/pain/good.svg'}, 
    {id: 'extremePain', imageUrl: 'images/gym/pain/extreme.svg'} 
];

var fatigueLevels = [
     {id: 'ok', imageUrl: 'images/gym/fatigue/ok.svg'}, 
     {id: 'tired', imageUrl: 'images/gym/fatigue/tired.svg'}, 
     {id: 'exhausted', imageUrl: 'images/gym/fatigue/exhausted.svg'} 
];

var getPostWorkoutPainImageUrl = function (painLevelId) {
	var i;
	for (i = 0; i < painLevels.length; i++) {
		if (painLevels[i].id == painLevelId) return painLevels[i].imageUrl; 
	} 
}

var getPostWorkoutFatigueImageUrl = function (id) {
	var i;
	for (i = 0; i < fatigueLevels.length; i++) {
		if (fatigueLevels[i].id == id) return fatigueLevels[i].imageUrl; 
	} 
}

var gymScoringAlgorithms = [
	{id: 'base', name: 'Linear', description: 'Based on the sum of reps, sets and weights', equation: 's = r(s + R) + Ww'},
	{id: 'evolved', name: 'Weighted', description: 'Based on the weight as multiplication factor', equation: 's = w(s + Rr + w/W)'}
];

/*******************************************************************************
 * DASHBOARD
 ******************************************************************************/
gymModule.controller("gymController", [ '$rootScope', '$scope', '$http', '$timeout', 'calendarService', '$mdDialog', 'GymService', 'BodyWeightService', function($rootScope, $scope, $http, $timeout, calendarService, $mdDialog, GymService, BodyWeightService) {
	
	$scope.initContext = function() {
		
		$rootScope.currentMenu = 'Gym dashboard';
		$scope.gymMenus = gymMenus;	
		$scope.showMuscles = false;
		$scope.painLevels = painLevels;
		
		$scope.loadCurrentWeek();
		$scope.getMuscleGroups();
		$scope.getGoals();
		$scope.getEfficacy('goodPain', 'ok');
		
	}
	
	/**
	 * Retrieves the efficacy for the specified pain and fatigue and puts it in
	 * $scope.benchmarkEfficacy
	 */
	$scope.getEfficacy = function(pain, fatigue) {
		
		GymService.calculateEfficacy(pain, fatigue).success(function(data) {
			
			$scope.benchmarkEfficacy = data.efficacy;
		});
	}
	
	/**
	 * Retrieves the week goals
	 */
	$scope.getGoals = function() {
		
		GymService.getMuscleWeekGoals('goodPain').success(function(data) {
			$scope.goals = data.goals;

			for (var i = 0; i < $scope.goals.length; i++) {
				$scope.goals[i].percentageOfGoalReached = $scope.goals[i].actual / $scope.goals[i].goal;
			}
		});
		
	}
	
	/**
	 * Retrieves the list of muscle groups (ex. Chest, Biceps, etc..)
	 */
	$scope.getMuscleGroups = function() {
		
		GymService.getMuscleGroups().success(function(data) {
			$scope.muscles = data.muscleGroups;
			
			$scope.selectedMuscle = $scope.muscles[0];
			$scope.getScoresForMuscle($scope.selectedMuscle.id);
			
		});
	}
	
	/**
	 * Toggles the muscle selection menu
	 */
	$scope.toggleMuscleSelection = function() {$scope.showMuscles = !$scope.showMuscles;}
	
	/**
	 * Selects a muscle. 
	 */
	$scope.muscleSelection = function(muscle) {
		$scope.selectedMuscle = muscle;
		$scope.showMuscles = false;
		$scope.getScoresForMuscle($scope.selectedMuscle.id);
	}
	
	/**
	 * Reacts to the click of the current week stats' muscle selection.
	 */
	$scope.weekMuscleSelected = function(muscleId) {
		
		var muscle = $scope.getMuscle(muscleId);
		
		$scope.muscleSelection(muscle);
	}
	
	/**
	 * Finds and returns the muscle from $scope.muscles that matches the provided muscleId
	 */
	$scope.getMuscle = function(muscleId) {
		
		var i;
		for (i = 0; i < $scope.muscles.length; i++) {
			if ($scope.muscles[i].id == muscleId) return $scope.muscles[i];
		}
		
	}
	
	/**
	 * Retrieves the scores for the specified muscle. Scores are grouped by week
	 */
	$scope.getScoresForMuscle = function(muscle) {
		
		GymService.getScoresForMuscle(muscle).success(function(data) {
			$scope.muscleScoreWeeks = data.weeks;
			$scope.scoreDeltas = GymService.calculateScoreDeltas($scope.muscleScoreWeeks);
			$timeout(function() {GymService.createMuscleScoreGraph($scope.muscleScoreWeeks);}, 500);
		});
		
	}
	
	/**
	 * Load the current week days. This function creates an array in $scope
	 * currentWeek[] made of days of the current week. Each day is a { date:
	 * Date, completed: true/false, score: double, today: true/false, sessionId:
	 * string (hex hash) - if any ongoing: true/false - specifies if there's an
	 * ongoing session (not completed) that day }
	 * 
	 * This function retrieves then the list of sessions from the Gym API and
	 * updates the currentWeek[] with the additional data
	 */
	$scope.loadCurrentWeek = function() {
		
		$scope.currentWeek = [];
		
		var day = moment().subtract(1, 'days').startOf('week').add(1, 'days');
		
		var i;
		for (i = 0; i < 7; i++) {
			var date = {date: new Date(day), completed: false, score: 0, ongoing: false};
			if (day.format('YYYYMMDD') == moment().format('YYYYMMDD')) date.today = true;
			
			$scope.currentWeek.push(date);
			day = day.add(1, 'days');
		}
		
		$http.get(microservicesProtocol + "://" + microservicesUrl + "/gym/sessions?currentWeek=true").success(function(data) {
			
			var i;
			for (i = 0; i < $scope.currentWeek.length; i++) {
				var j;
				for (j = 0; j < data.sessions.length; j++) {
					if (moment($scope.currentWeek[i].date).format('YYYYMMDD') == data.sessions[j].date) {
						$scope.currentWeek[i].sessionId = data.sessions[j].id;
						$scope.currentWeek[i].completed = data.sessions[j].completed;
						$scope.currentWeek[i].ongoing = !data.sessions[j].completed;
						$scope.currentWeek[i].score = data.sessions[j].score;

						if ($scope.currentWeek[i].ongoing) {
							$scope.currentWeek[i].imageUrl = 'images/svg/play.svg';
						}
						
						if ($scope.currentWeek[i].completed) {
							$scope.currentWeek[i].imageUrl = 'images/svg/checked.svg';
						}
						
						break;
					}
				}
			}
		});
	}
	
	/**
	 * Starts or resume a session in a specified day.
	 * 
	 * The session will be started if there are no sessions ongoing for that
	 * day. The session will be resumed if there is a session ongoing for that
	 * day.
	 * 
	 * Parameters:
	 *  - day: the day object (see $scope.loadCurrentWeek()) for which the
	 * session has to be started or resumed
	 */
	$scope.startOrResumeSession = function(day) {
		
		if (!day.ongoing && !day.completed) {
			
			GymService.showStartSessionUI(function(answer) {

				GymService.startSession(answer.planId, answer.planWorkoutId, moment(day.date).format('YYYYMMDD')).success(function(data) {
					$scope.loadCurrentWeek();
				});
			});
			
		}
		else {
			$scope.go('/gym/sessions/' + day.sessionId);
		}
	}

	$scope.initContext();

} ]);

/*******************************************************************************
 * ARCHIVE
 ******************************************************************************/
gymModule.controller("gymArchiveController", [ '$rootScope', '$scope', '$http', '$timeout', 'calendarService', '$mdDialog', function($rootScope, $scope, $http, $timeout, calendarService, $mdDialog) {
	
	$scope.initContext = function() {
		
		$rootScope.currentMenu = 'Gym exercises archive';
		$scope.getMuscleGroups();
		$scope.gymMenus = gymMenus;
		
	}
	
	/**
	 * Retrieves the list of muscle groups (ex. Chest, Biceps, etc..)
	 */
	$scope.getMuscleGroups = function() {
		
		$http.get(microservicesProtocol + "://" + microservicesUrl + "/gym/archive").success(function(data) {
			$scope.muscleGroups = data.muscleGroups;
		});
	}

	$scope.initContext();

} ]);

/*******************************************************************************
 * ARCHIVE OF EXERCISES OF A SINGLE MUSCLE GROUP
 ******************************************************************************/
gymModule.controller("gymArchiveMuscleGroupController", [ '$rootScope', '$scope', '$http', '$timeout', 'calendarService', '$mdDialog', '$routeParams', function($rootScope, $scope, $http, $timeout, calendarService, $mdDialog, $routeParams) {
	
	$scope.initContext = function() {
		
		$rootScope.currentMenu = 'Gym muscle exercises archive';
		$scope.getExcercicesOfMuscleGroup($routeParams.id);
		$scope.gymMenus = gymMenus;
	}
	
	/**
	 * Retrieves the exercices bound to the specified group id
	 */
	$scope.getExcercicesOfMuscleGroup = function(muscleGroupId) {
		
		$http.get(microservicesProtocol + "://" + microservicesUrl + "/gym/archive/" + muscleGroupId + "/exercices").success(function(data) {
			$scope.exercices = data.exercices;
		});
	}
	
	/**
	 * Adds an exercice to the list
	 */
	$scope.addExercice = function(ev) {
		
		function DialogController($scope, $mdDialog) {

			$scope.exercice = {sets: 4, reps: 8, weight: 20, benchmark: false, tool: 'dumbbell'};
			$scope.step = 1;
			
			$scope.answer = function(exercice) {$mdDialog.hide(exercice);};
			$scope.nextStep = function() {$scope.step++;}
			
			$scope.changeSeries = function(dir) {
				if (dir == 1) {$scope.exercice.sets++;}
				if (dir == -1) {$scope.exercice.sets--;}
			}
			
			$scope.changeReps = function(dir) {
				if (dir == 1) {$scope.exercice.reps++;}
				if (dir == -1) {$scope.exercice.reps--;}
			}
			
			$scope.changeWeight = function(dir, amount) {
				if (dir == 1) {$scope.exercice.weight += amount;}
				if (dir == -1) {$scope.exercice.weight -= amount;}
			}
			
			$scope.setBenchmark = function(benchmark) {
				$scope.exercice.benchmark = benchmark;
			}
			
		}
		
	    var useFullScreen = false;
	    var dialog = {controller: DialogController, templateUrl: 'modules/gym/dlgAddExercice.html', parent: angular.element(document.body), targetEvent: ev, clickOutsideToClose: true, fullscreen: useFullScreen};
	    
	    $mdDialog.show(dialog).then(function(answer) {
	    	
	    	$http.post(microservicesProtocol + "://" + microservicesUrl + "/gym/archive/" + $routeParams.id + "/exercices", answer).success(function(data, status, header, config) {
	    		$scope.exercice.id = data.id;
		    	$scope.exercice.tool = data.tool != null ? data.tool : 'dumbbell';
		    	$scope.exercice.difficultyFactor = data.difficultyFactor;
			});
	    	
	    	$scope.exercice = answer;
	    	$scope.exercices.push($scope.exercice);
	    	
	    }, function() {});
	}
	
	/**
	 * Change the benchmark data of the exercice (reps, series, weight)
	 */
	$scope.changeBenchmark = function(exercice, ev) {
		
		$scope.exercice = exercice;
		
		function DialogController($scope, $mdDialog) {

			$scope.benchmark = new Object();
			$scope.benchmark.sets = exercice.sets;
			$scope.benchmark.reps = exercice.reps;
			$scope.benchmark.weight = exercice.weight;
			
			$scope.answer = function(answer) {$mdDialog.hide(answer);}
			
			$scope.changeSeries = function(dir) {
				if (dir == 1) {$scope.benchmark.sets++;}
				if (dir == -1) {$scope.benchmark.sets--;}
			}
			
			$scope.changeReps = function(dir) {
				if (dir == 1) {$scope.benchmark.reps++;}
				if (dir == -1) {$scope.benchmark.reps--;}
			}

			$scope.changeWeight = function(dir, amount) {
				if (dir == 1) {$scope.benchmark.weight += amount;}
				if (dir == -1) {$scope.benchmark.weight -= amount;}
			}
			
		}
		
	    var useFullScreen = false;
	    var dialog = {controller: DialogController, templateUrl: 'modules/gym/dlgChangeBenchmark.html', parent: angular.element(document.body), targetEvent: ev, clickOutsideToClose: true, fullscreen: useFullScreen};
	    
	    $mdDialog.show(dialog).then(function(answer) {
	    	
	    	$http.put(microservicesProtocol + "://" + microservicesUrl + "/gym/archive/" + $routeParams.id + "/exercices/" + exercice.id, answer).success(function(data, status, header, config) {
		    	$scope.exercice.difficultyFactor = data.difficultyFactor;
			});
	    	
	    	exercice.sets = answer.sets;
	    	exercice.reps = answer.reps;
	    	exercice.weight = answer.weight;
	    	
	    }, function() {});
	}
	
	$scope.initContext();

} ]);

/*******************************************************************************
 * WORKOUT PLANS
 ******************************************************************************/
gymModule.controller("gymPlansController", [ '$rootScope', '$scope', '$http', '$timeout', 'calendarService', '$mdDialog', function($rootScope, $scope, $http, $timeout, calendarService, $mdDialog) {
	
	$scope.initContext = function() {
		
		$rootScope.currentMenu = 'Gym workout plans';
		$scope.loadWorkoutPlans();
		$scope.gymMenus = gymMenus;
		
	}
	
	/**
	 * Load the workout plans
	 */
	$scope.loadWorkoutPlans = function() {

		$http.get(microservicesProtocol + "://" + microservicesUrl + "/gym/plans").success(function(data, status, header, config) {
			$scope.plans = data.plans;
		});
		
	}
	
	/**
	 * Starts the execution of a plan <=> starts a session
	 */
	$scope.executePlan = function(plan) {
		
		// TODO: first check if a session has already been started.
		$scope.go('/gym/plans/' + plan.id + '/start');
	}
	
	/**
	 * Add a new plan
	 */
	$scope.addPlan = function(ev) {
		
		function DialogController($scope, $mdDialog) {
			
			$scope.steps = [1];
			$scope.currentStep = 1;

			$scope.answer = function(answer) {$mdDialog.hide(answer);}
			
		}

	    var useFullScreen = window.matchMedia( "(max-width: 960px)" ).matches;
	    var dialog = {controller: DialogController, templateUrl: 'modules/gym/dlgNewPlan.html', parent: angular.element(document.body), targetEvent: ev, clickOutsideToClose: true, fullscreen: useFullScreen};
	    
	    $mdDialog.show(dialog).then(function(answer) {
	    	
	    	$scope.plan = answer;

	    	$scope.plans.push($scope.plan);
	    	
	    	$http.post(microservicesProtocol + "://" + microservicesUrl + "/gym/plans", answer).success(function(data, status, header, config) {
	    		$scope.plan.id = data.id;
	    		$scope.plan.end = data.end;
			});
	    	
	    }, function() {});
	}
	
	$scope.initContext();

} ]);

/*******************************************************************************
 * WORKOUT PLAN DETAIL
 ******************************************************************************/
gymModule.controller("gymPlanController", [ '$rootScope', '$scope', '$http', '$timeout', 'calendarService', '$mdDialog', '$routeParams', 'GymService', function($rootScope, $scope, $http, $timeout, calendarService, $mdDialog, $routeParams, GymService) {
	
	$scope.initContext = function() {
		
		$rootScope.currentMenu = 'Gym workout plan';
		$scope.loadPlan($routeParams.id);
		$scope.gymMenus = gymMenus;
		
	}
	
	/**
	 * Loads the plan from API into the $scope
	 * 
	 * @param planId
	 *            the id of the plan to load
	 */
	$scope.loadPlan = function(planId) {
		
		$http.get(microservicesProtocol + "://" + microservicesUrl + "/gym/plans/" + planId).success(function(data, status, header, config) {
			$scope.plan = data;
			
			$scope.loadWorkouts();
		});
		
	}
	
	/**
	 * Loads the workouts of the plan
	 */
	$scope.loadWorkouts = function() {
		
		$http.get(microservicesProtocol + "://" + microservicesUrl + "/gym/plans/" + $scope.plan.id + "/workouts").success(function(data, status, header, config) {
			$scope.workouts = data.workouts;
			
			var i;
			for (i = 0; i < $scope.workouts.length; i++) {
				$scope.loadWorkoutExercises($scope.workouts[i].id);
			}
		});
	}
	
	/**
	 * Loads the exercises of the specified workout
	 */
	$scope.loadWorkoutExercises = function(wid) {
		
		$http.get(microservicesProtocol + "://" + microservicesUrl + "/gym/plans/" + $scope.plan.id + "/workouts/" + wid + "/exercises").success(function(data, status, header, config) {
			
			if ($scope.workouts == null) return;

			var i;
			for (i = 0; i < $scope.workouts.length; i++) {
				
				if ($scope.workouts[i].id == data.workoutId) {
					$scope.workouts[i].exercises = data.exercises;
					break;
				}
			}
			
		});
	}
	
	/**
	 * Starts a session for that workout
	 */
	$scope.startSession = function(workout) {
		
	}
	
	
	/**
	 * Adds a workout to the specified plan
	 */
	$scope.addWorkout = function(ev) {
		
		function DialogController($scope, $mdDialog) {
			
			$scope.steps = [1];
			$scope.currentStep = 1;

			$scope.answer = function(answer) {$mdDialog.hide(answer);}
			$scope.cancel = function() {$mdDialog.cancel();}
		}

	    var useFullScreen = window.matchMedia( "(max-width: 960px)" ).matches;
	    var dialog = {controller: DialogController, templateUrl: 'modules/gym/dlgNewPlanWorkout.html', parent: angular.element(document.body), targetEvent: ev, clickOutsideToClose: true, fullscreen: useFullScreen};
	    
	    $mdDialog.show(dialog).then(function(answer) {
	    	
	    	$scope.workout = answer;

	    	$scope.workouts.push($scope.workout);
	    	
	    	$http.post(microservicesProtocol + "://" + microservicesUrl + "/gym/plans/" + $scope.plan.id + "/workouts", answer).success(function(data, status, header, config) {
	    		$scope.workout.id = data.id;
	    		$scope.workout.score = data.score;
	    		$scope.workout.exercisesCount = data.exercisesCount;
			});
	    	
	    }, function() {});
	}
	
	/**
	 * Adds an exercise to the specified workout
	 */
	$scope.addExercise = function(workout, ev) {
		
		$scope.workout = workout;
		
		function DialogController($scope, $mdDialog) {
			
			$scope.steps = [1,2,3];
			$scope.currentStep = 1;
			
			$scope.ex = new Object();
			
			$scope.selections = [];
			$scope.selections.push({value: 'single', svgPath: 'images/gym/type/single.svg'});
			$scope.selections.push({value: 'superset', svgPath: 'images/gym/type/superset.svg'});
			$scope.selections.push({value: 'dropset', svgPath: 'images/gym/type/dropset.svg'});
			$scope.selections.push({value: 'striping', svgPath: 'images/gym/type/striping.svg'});
			$scope.selections.push({value: 'hourglass', svgPath: 'images/gym/type/hourglass.svg'});
			
			$http.get(microservicesProtocol + "://" + microservicesUrl + "/gym/archive").success(function(data) {
				$scope.muscleGroups = data.muscleGroups;
			});
			
			/**
			 * Retrieves the exercices bound to the specified group id
			 */
			$scope.getExcercicesOfMuscleGroup = function(muscleGroupId) {
				
				$http.get(microservicesProtocol + "://" + microservicesUrl + "/gym/archive/" + muscleGroupId + "/exercices").success(function(data) {
					$scope.exercices = data.exercices;
				});
			}

			$scope.answer = function(answer) {$mdDialog.hide(answer);}
			$scope.cancel = function() {$mdDialog.cancel();}
			$scope.nextStep = function() {$scope.currentStep++;}
			
			$scope.selectType = function(selection) {
				$scope.ex.type = selection.value;
				$scope.nextStep();
			}
			
			$scope.selectMuscleGroup = function(muscle) {
				$scope.muscle = muscle;
				$scope.getExcercicesOfMuscleGroup(muscle.id);
				$scope.nextStep();
			}
			
			$scope.selectExercise = function(ex) {
				if ($scope.ex.exercises == null) $scope.ex.exercises = [];
				
				$scope.ex.exercises.push({
					benchmarkExerciseId: ex.id,
					name: ex.name,
					weight1: ex.weight,
					weight2: ex.weight,
					weight3: ex.weight,
					sets: ex.sets,
					reps1: ex.reps,
					reps2: ex.reps,
					reps3: ex.reps
				});
				
				if ($scope.ex.type == 'superset' && $scope.ex.exercises.length == 1) {
					$scope.currentStep = 2;
				}
				else $scope.answer($scope.ex);
			}
			
		}

	    var useFullScreen = window.matchMedia( "(max-width: 960px)" ).matches;
	    var dialog = {controller: DialogController, templateUrl: 'modules/gym/dlgNewPlanWorkoutEx.html', parent: angular.element(document.body), targetEvent: ev, clickOutsideToClose: true, fullscreen: useFullScreen};
	    
	    $mdDialog.show(dialog).then(function(answer) {
	    	
	    	$scope.exercise = answer;
	    	
	    	$http.post(microservicesProtocol + "://" + microservicesUrl + "/gym/plans/" + $scope.plan.id + "/workouts/" + $scope.workout.id + "/exercises", answer).success(function(data, status, header, config) {
	    		$scope.exercise.id = data.id;
	    		$scope.exercise.score = data.score;
	    		
	    		$scope.workout.score += data.score;
	    		$scope.workout.exerciseCount++;
	    		$scope.plan.score += data.score;
			});
	    	
	    	if ($scope.workout.exercises == null) $scope.workout.exercises = [];
	    	
	    	$scope.workout.exercises.push($scope.exercise);
	    	
	    }, function() {});
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
	$scope.changeSettings = function(workout, singleExercise, exercise) {
		
		$scope.exercise = exercise;
		$scope.workout = workout;
		$scope.singleExercise = singleExercise;
		
		GymService.showChangeExerciseSettingsUI(exercise.type, singleExercise, function(settings) {
			
			$scope.workout.score -= $scope.exercise.score;
			$scope.plan.score -= $scope.exercise.score;
			
			$scope.singleExercise.sets = settings.sets;
			$scope.singleExercise.reps1 = settings.reps1;
			$scope.singleExercise.reps2 = settings.reps2;
			$scope.singleExercise.reps3 = settings.reps3;
			$scope.singleExercise.weight1 = settings.weight1;
			$scope.singleExercise.weight2 = settings.weight2;
			$scope.singleExercise.weight3 = settings.weight3;
			
			$scope.exercise.showMenu = false;
			
			GymService.changePlanExerciseSettings($scope.plan.id, $scope.workout.id, $scope.exercise).success(function(data) {
				$scope.exercise.score = data.score;
	    		$scope.workout.score += data.score;
	    		$scope.plan.score += data.score;
			});
			
		});
	}

	/**
	 * Deletes the specified exercise
	 */
	$scope.deleteExercise = function(exercise, workout) {
		
		$scope.workout = workout;

		$scope.workout.score -= exercise.score;
		$scope.plan.score -= exercise.score;
		
		var i;
		for (i = 0; i < $scope.workout.exercises.length; i++) {
			if ($scope.workout.exercises[i].id == exercise.id) {
				$scope.workout.exercises.splice(i, 1);
				break;
			}
		}
		
		$scope.workout.exerciseCount--;
		
		$http.delete(microservicesProtocol + "://" + microservicesUrl + "/gym/plans/" + $scope.plan.id + "/workouts/" + $scope.workout.id + "/exercises/" + exercise.id);
	}
	
	$scope.initContext();

} ]);

/*******************************************************************************
 * SESSIONS
 ******************************************************************************/
gymModule.controller("gymSessionsController", [ '$rootScope', '$scope', '$http', '$timeout', 'calendarService', '$mdDialog', '$routeParams', 'GymService', function($rootScope, $scope, $http, $timeout, calendarService, $mdDialog, $routeParams, GymService) {
	
	$scope.initContext = function() {
		
		$rootScope.currentMenu = 'Gym sessions calendar';
		$scope.gymMenus = gymMenus;
		$scope.painLevels = painLevels;
		
		$scope.focusedMonth = calendarService.generateCalendar();
		$scope.daysOfWeekLabels = calendarService.generateWeekDays();
		
		$scope.loadSessions(calendarService.focusedMonth.yearMonth);
	}
	
	$scope.backOneMonth = function() {
		calendarService.backOneMonth();
		$scope.loadSessions(calendarService.focusedMonth.yearMonth);
	}
	$scope.forwardOneMonth = function() {
		calendarService.forwardOneMonth();
		$scope.loadSessions(calendarService.focusedMonth.yearMonth);
	}
	
	/**
	 * Loads the gym sessions of the specified month Parameters: - yearMonth: a
	 * string formatted YYYYMM
	 */
	$scope.loadSessions = function(yearMonth) {
		
		$http.get(microservicesProtocol + "://" + microservicesUrl + "/gym/sessions?yearMonth=" + yearMonth).success(function(data) {
			
			$scope.sessions = data.sessions;
			
			var i;
			var pinnedDays = [];
			for (i = 0; i < $scope.sessions.length; i++) {
				
				var calendarDay = moment($scope.sessions[i].date, 'YYYYMMDD').format('DD/MM/YYYY');
				
				pinnedDays.push(calendarDay);
			}
			
			calendarService.setPinnedDays(pinnedDays);
			$scope.focusedMonth = calendarService.generateCalendar();
		});
		
	}
	
	/**
	 * Starts or resume a session in a specified day.
	 * 
	 * The session will be started if there are no sessions ongoing for that
	 * day. The session will be resumed if there is a session ongoing for that
	 * day.
	 * 
	 * Parameters:
	 *  - day: the day as returned by the calendar service
	 */
	$scope.startOrResumeSession = function(day) {
		
		if (!day.pinned) {
			
			GymService.showStartSessionUI(function(answer) {

				GymService.startSession(answer.planId, answer.planWorkoutId, moment(day.day + "/" + day.month + "/" + day.year, 'D/M/YYYY').format('YYYYMMDD')).success(function(data) {
					$scope.go('/gym/sessions/' + data.sessionId);
				});
			});
			
		}
		else {
			var i;
			var sessionId;
			for (i = 0; i < $scope.sessions.length; i++) {
				if ($scope.sessions[i].date == moment(day.day + "/" + day.month + "/" + day.year, 'D/M/YYYY').format('YYYYMMDD')) {
					sessionId = $scope.sessions[i].id;
					break;
				}
			}
			
			$scope.go('/gym/sessions/' + sessionId);
		}
	}
	
	$scope.initContext();
	
} ]);

/*******************************************************************************
 * SESSION
 ******************************************************************************/
gymModule.controller("gymSessionController", [ '$rootScope', '$scope', '$http', '$timeout', 'calendarService', '$mdDialog', '$routeParams', 'GymService', function($rootScope, $scope, $http, $timeout, calendarService, $mdDialog, $routeParams, GymService) {

	$scope.initContext = function() {

		$rootScope.currentMenu = 'Gym session';
		$scope.gymMenus = gymMenus;
		$scope.painLevels = painLevels;
		$scope.fatigueLevels = fatigueLevels;
		
		$scope.loadSession();
		
	}
	
	/**
	 * Sets the pain level of the session
	 */
	$scope.setPainLevel = function() {
		
		GymService.showPainLevelSelectionUI($scope.painLevels, function (painLevel) {
			
			GymService.setSessionPainLevel($scope.session.id, painLevel);
			
			$scope.session.postWorkoutPain = painLevel.id;
			$scope.session.postWorkoutPainImageUrl = painLevel.imageUrl;
			
		});
	}
	
	/**
	 * Sets the fatigue level of the session
	 */
	$scope.setFatigueLevel = function(fatigueLevel) {
		
		GymService.showFatigueLevelSelectionUI($scope.fatigueLevels, function (fatigueLevel) {
			
			GymService.setSessionFatigueLevel($scope.session.id, fatigueLevel);
			
			$scope.session.postWorkoutFatigue = fatigueLevel.id;
			$scope.session.postWorkoutFatigueImageUrl = fatigueLevel.imageUrl;
			
		});
	}
	
	/**
	 * Loads the session data. Loads the workout data: workout name, etc.
	 */
	$scope.loadSession = function() {
		
		$http.get(microservicesProtocol + "://" + microservicesUrl + "/gym/sessions/" + $routeParams.id).success(function (data) {
			$scope.session = data;
			$scope.session.date = new Date(moment(data.date, 'YYYYMMDD'));
			
			if ($scope.session.postWorkoutPain != null) {
				$scope.session.postWorkoutPainImageUrl = getPostWorkoutPainImageUrl($scope.session.postWorkoutPain);
			}
			
			if ($scope.session.postWorkoutFatigue != null) {
				$scope.session.postWorkoutFatigueImageUrl = getPostWorkoutFatigueImageUrl($scope.session.postWorkoutFatigue);
			}
			
			$scope.loadWorkout();
			$scope.loadExercises();
			
		});
		
	}
	
	/**
	 * Loads the related plan workout
	 */
	$scope.loadWorkout = function() {
		
		if ($scope.session == null || $scope.session.workoutId == null) return;
		
		$http.get(microservicesProtocol + "://" + microservicesUrl + "/gym/plans/" + $scope.session.planId + "/workouts/" + $scope.session.workoutId).success(function (data) {
			$scope.workout = data;
		});
	}
	
	/**
	 * Loads the session exercises
	 */
	$scope.loadExercises = function() {
		
		$http.get(microservicesProtocol + "://" + microservicesUrl + "/gym/sessions/" + $routeParams.id + "/exercises").success(function (data) {
		
			$scope.exercises = data.exercises;

			$scope.updateScorePerMuscle();
		});
	}
	
	/**
	 * Updates the total score for each muscle
	 */
	$scope.updateScorePerMuscle = function() {
		
		// 1. Reset actual score of each muscle
		var j;
		for (j = 0; j < $scope.session.impactedMuscles.length; j++) {
			
			$scope.session.impactedMuscles[j].actualScore = 0;
		}

		// 2. Recalculate score for each muscle
		var i;
		for (i = 0; i < $scope.exercises.length; i++) {
			
			if (!$scope.exercises[i].completed) continue;
			
			var impactedMuscle = $scope.exercises[i].exercises[0].muscleGroupId;
			var exerciseScore = $scope.exercises[i].score;
			
			var x;
			for (x = 0; x < $scope.session.impactedMuscles.length; x++) {
				
				if ($scope.session.impactedMuscles[x].muscle.id == impactedMuscle) {
					$scope.session.impactedMuscles[x].actualScore += exerciseScore;
				}
			}
		}
		
		// 3. Calculate muscle goal (in terms of total score) and completion level 
		for (j = 0; j < $scope.session.impactedMuscles.length; j++) {
			
			$scope.session.impactedMuscles[j].goal = $scope.session.impactedMuscles[j].previousScore + $scope.session.impactedMuscles[j].scoreDeltaGoal;
			$scope.session.impactedMuscles[j].goalCompletionLevel = $scope.session.impactedMuscles[j].actualScore / $scope.session.impactedMuscles[j].goal;
		}

		// 4. Calculate height of muscle level bar
		var goalContainerWidth = document.querySelector('.goal-container').offsetWidth - 4; // 4 is the border size
		
		for (j = 0; j < $scope.session.impactedMuscles.length; j++) {
			
			var goalLevelWidth = goalContainerWidth * $scope.session.impactedMuscles[j].goalCompletionLevel;
			
			$scope.session.impactedMuscles[j].goalLevelWidth = goalLevelWidth;
			$scope.session.impactedMuscles[j].remainingPointsToGoal = $scope.session.impactedMuscles[j].goal - $scope.session.impactedMuscles[j].actualScore;
			if ($scope.session.impactedMuscles[j].remainingPointsToGoal < 0) $scope.session.impactedMuscles[j].remainingPointsToGoal = 0;
			
		}
		
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
	$scope.changeSettings = function(singleExercise, exercise) {
		
		$scope.exercise = exercise;
		$scope.singleExercise = singleExercise;
		
		GymService.showChangeExerciseSettingsUI(exercise.type, singleExercise, function(settings) {
			
			$scope.singleExercise.sets = settings.sets;
			$scope.singleExercise.reps1 = settings.reps1;
			$scope.singleExercise.reps2 = settings.reps2;
			$scope.singleExercise.reps3 = settings.reps3;
			$scope.singleExercise.weight1 = settings.weight1;
			$scope.singleExercise.weight2 = settings.weight2;
			$scope.singleExercise.weight3 = settings.weight3;
			
			GymService.changeSessionExerciseSettings($scope.session.id, $scope.exercise).success(function(data) {
				$scope.exercise.score = data.score;
				$scope.updateScorePerMuscle();
			});
			
		});
	}
	
	/**
	 * Changes the mood of the provided exercise
	 */
	$scope.changeMood = function(ex) {
		
		GymService.showChangeMoodUI(function(mood) {
			
			GymService.changeSessionExerciseMood($scope.session.id, ex.id, mood);
			
			ex.mood = mood;
		});
	}
	
	/**
	 * Toggles the completion of the exercise
	 */
	$scope.toggleCompletion = function(ex) {
		
		if (ex.completed == null) ex.completed = false;
		
		ex.completed = !ex.completed; 
		
		$scope.exercise = ex;
		
		GymService.changeSessionExerciseCompletion($scope.session.id, ex.id, ex.completed).success(function (data) {
			$scope.exercise.score = data.score;
			$scope.updateScorePerMuscle();
		});
	}
	
	/**
	 * Completes the session
	 */
	$scope.completeSession = function() {
		
		GymService.completeSession($scope.session.id).success(function(data) {
			$scope.session.completed = true;
			$scope.session.score = data.score;
		});
	}
	
	$scope.initContext();
} ]);

/*******************************************************************************
 * SETTINGS
 ******************************************************************************/
gymModule.controller("gymSettingsController", [ '$rootScope', '$scope', '$http', '$timeout', 'calendarService', '$mdDialog', 'GymService', function($rootScope, $scope, $http, $timeout, calendarService, $mdDialog, GymService) {

	$scope.initContext = function() {
		
		$rootScope.currentMenu = 'Gym settings';
		$scope.algorithms = gymScoringAlgorithms;

		$scope.gymMenus = gymMenus;
		$scope.getSettings();
	}
	
	/**
	 * Retrieves the gym settings
	 */
	$scope.getSettings = function() {
		
		GymService.getSettings().success(function(data) {
			
			$scope.settings = data;
		});
	}
	
	/**
	 * Changes the score algorithm to the one provided
	 */
	$scope.changeScoreAlgorithm = function(algorithm) {
		
		$scope.settings.scoreAlgorithmId = algorithm.id;
		$scope.changingScoreAlgorithm = true;
		
		GymService.changeScoreAlgorithm(algorithm.id).success(function() {
			$scope.changingScoreAlgorithm = false;
		});
	}
	
	$scope.initContext();
	
} ]);


/*******************************************************************************
 * WEIGHTS
 ******************************************************************************/
gymModule.controller("weightController", [ '$rootScope', '$scope', '$http', '$timeout', 'calendarService', '$mdDialog', 'BodyWeightService', function($rootScope, $scope, $http, $timeout, calendarService, $mdDialog, BodyWeightService) {
	
	$scope.init = function() {

		$rootScope.currentMenu = 'Weight';
		$scope.gymMenus = gymMenus;
		$scope.getWeights();
	}
	
	/**
	 * Retrieves the weights from the API
	 */
	$scope.getWeights = function() {
		
		BodyWeightService.getWeights().success(function (data) {
			$scope.weights = data.weights;
		});
	}
	
	/**
	 * Adds a new weight measurement
	 */
	$scope.addWeight = function() {
		
		BodyWeightService.showAddWeightUI(function (weight) {
			
			$scope.weight = weight;
			if ($scope.weights == null) $scope.weights = [];
			$scope.weights.push($scope.weight);
			
			BodyWeightService.postWeight($scope.weight).success(function(data) {
				$scope.weight.id = data.id;
			});
			
		});
	}
	
	$scope.init();

} ]);



