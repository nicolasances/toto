var tasksModule = angular.module("tasksModule", ["taskServiceModule"]);

tasksModule.controller("tasksTodayController", [ '$rootScope', '$scope', '$http', '$timeout', '$mdDialog', '$mdSidenav', 'taskService', '$routeParams', function($rootScope, $scope, $http, $timeout, $mdDialog, $mdSidenav, taskService, $routeParams) {

	/**
	 * Prepares the context object
	 */
	$scope.initContext = function() {
		
		$rootScope.currentMenu = 'Tasks';
		$scope.getScheduleCategories();
		
		if ($routeParams.schedule != null) $scope.selectSchedule($routeParams.schedule);
		else $scope.selectSchedule('inbox');
		
	}
	
	/**
	 * Selects a particular schedule category (es. inbox, today, ...)
	 */
	$scope.selectSchedule = function(schedule) {
		
		$scope.loadTasks(schedule);
		
		$scope.selectedSchedule = schedule;
		
		if ($scope.categories != null && $scope.inbox != null) {
			if ($scope.selectedSchedule == 'inbox') $scope.selectedScheduleDescription = $scope.inbox.description;
			else {
				
				var i;
				for (i = 0; i < $scope.categories.length; i++) {
					if ($scope.categories[i].name == $scope.selectedSchedule) $scope.selectedScheduleDescription = $scope.categories[i].description;
				}
			}
		}
	}
	
	/**
	 * Loads the tasks of a specified schedule
	 */
	$scope.loadTasks = function(schedule) {
		taskService.getTasks(schedule).success(function (data) {
			$scope.tasks = data.tasks;
		});
	}
	
	/**
	 * Opens the task postpone dialog
	 */
	$scope.postponeTask = function(ev, task) {

		taskService.postponeTask(ev, task, function(newScheduleCategory) {
			
			// 1. Update categories counters
			var i;
			for (i = 0; i < $scope.categories.length; i++) {
				if ($scope.categories[i].name == newScheduleCategory.name) $scope.categories[i].counter++;
				if ($scope.categories[i].name == $scope.selectedSchedule) $scope.categories[i].counter--;
			}
			
			if ($scope.selectedSchedule == 'inbox') $scope.inbox.counter--;
			
			// 2. Remove task from list
			for (i = 0; i < $scope.tasks.length; i++) {
				if ($scope.tasks[i].id == task.id) {
					$scope.tasks.splice(i, 1);
					break;
				}
			}
			
		});
	}
	
	/**
	 * Retrieves the list of schedule categories (today, tomorrow, etc..)
	 */
	$scope.getScheduleCategories = function() {
		
		taskService.getScheduleCategories(function(categories, inbox) {
			$scope.categories = categories;
			$scope.inbox = inbox;
			
			if ($scope.selectedSchedule == 'inbox') $scope.selectedScheduleDescription = $scope.inbox.description;
			else {
				
				var i;
				for (i = 0; i < $scope.categories.length; i++) {
					if ($scope.categories[i].name == $scope.selectedSchedule) $scope.selectedScheduleDescription = $scope.categories[i].description;
				}
			}
		});
	}
	
	/**
	 * Adds a task to INBOX
	 */
	$scope.addTask = function(ev) {
		
		taskService.addTask(ev, function() {
			
			// 1. If I'm on inbox, refresh
			if ($scope.selectedSchedule == 'inbox') {
				$scope.loadTasks($scope.selectedSchedule);
			}
			
			// 2. Update inbox counter
			$scope.inbox.counter++;
			
		});
	}
	
	/**
	 * Completes a task and updates the current category counter
	 */
	$scope.toggleCompleteTask = function(task) {
		
		taskService.toggleCompleteTask(task, function() {
			// 1. Update the task
			task.completed = !task.completed;

			// 2. Udpate categories counter
			var i;
			for (i = 0; i < $scope.categories.length; i++) {
				if ($scope.categories[i].name == $scope.selectedSchedule) {
					if (task.completed) $scope.categories[i].counter--;
					else $scope.categories[i].counter++;
				}
			}
			
			if ($scope.selectedSchedule == 'inbox') {
				if (task.completed) $scope.inbox.counter--;
				else $scope.inbox.counter++;
			}
			
		});
	}
	
	$scope.initContext();

} ]);

/* ********************************************************************************************************************************************************
 * TASK DETAIL
 * ********************************************************************************************************************************************************/
tasksModule.controller("taskDetailController", [ '$rootScope', '$scope', '$http', '$timeout', '$mdDialog', '$mdSidenav', 'taskService', '$routeParams', function($rootScope, $scope, $http, $timeout, $mdDialog, $mdSidenav, taskService, $routeParams) {

	/**
	 * Prepares the context object
	 */
	$scope.initContext = function() {
		
		$rootScope.currentMenu = 'Task detail';
		$scope.notes = [];
		$scope.showInsertNote = false;
		
		$scope.sourceSchedule = $routeParams.schedule == null ? 'inbox' : $routeParams.schedule;
		
		$scope.loadTask($routeParams.id);
	}
	
	/**
	 * Retrieves the specified task
	 */
	$scope.loadTask = function(taskId) {
		
		taskService.getTask(taskId).success(function (data) {
			$scope.task = data;
			
			taskService.getNotes(taskId).success(function (data) {
				$scope.notes = data.notes;
			});
		});
	}
	
	/**
	 * Completes a task and updates the current category counter
	 */
	$scope.toggleCompleteTask = function(task) {
		
		taskService.toggleCompleteTask(task, function() {
			task.completed = !task.completed;
		});
	}
	
	/**
	 * Deletes the specified task
	 */
	$scope.deleteTask = function() {
		
		taskService.deleteTask($scope.task.id);
		
		$scope.go('/tasks/' + $scope.sourceSchedule);
	}
	
	/**
	 * Opens the task postpone dialog
	 */
	$scope.postponeTask = function(ev, task) {

		taskService.postponeTask(ev, task, function(newScheduleCategory) {});
	}
	
	/**
	 * Related to the click of the pen or save note icon.
	 * In case of click to the pen, it only shows the box for note insertion.
	 * In case of click on the save, it saves the note.
	 */
	$scope.insertNote = function() {
		
		if ($scope.showInsertNote) {
			
			var text = document.querySelector('#newNote').value;
			
			var note = {
					text: text,
					date: new Date()
			};
			
			if (text != '') {
				$scope.notes.unshift(note);
				
				taskService.saveNote($scope.task.id, note);
			}
		}

		$scope.showInsertNote = !$scope.showInsertNote;
		
	}
	
	$scope.initContext();



}]);
