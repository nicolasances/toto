/*
 * This JS module provide services to manage expenses
 */
var taskServiceModule = angular.module('taskServiceModule', []);

taskServiceModule.factory('taskService', [ '$http', '$mdDialog', function($http, $mdDialog) {
	
	var getScheduleCategories = function(callback) {

		$http.get(microservicesProtocol + "://" + microservicesUrl + "/tasks/categories").success(function(data, status, header, config) {
			
			if (data == null || data.categories == null) callback();
			
			var categories = [];
			var inbox = null;
			
			var i;
			for (i = 0; i < data.categories.length; i++) {
				if (data.categories[i].name != 'inbox') categories.push(data.categories[i]);
				else inbox = data.categories[i];
			}
			
			callback(categories, inbox);
		});
	};

	var taskService = {
			
		/**
		 * Retrieves the scheduling categories. 
		 * The callback will receive (categories[], inbox)
		 */
		getScheduleCategories : function(callback) {
			getScheduleCategories(callback);
		},
		
		/**
		 * This method supports task search. 
		 * 
		 * The possible search values are the following: 
		 * 
		 * 	-	scheduleCategory		: 	Retrieves the tasks for a specified schedule category 
		 * 									(es. inbox, today, tomorrow, ...)
		 * 
		 * 	-	projectFilter			:	Retrieves the tasks bound to a project with the provided filter. 
		 *									The filter is an object with the search criteria 
		 *									{projectId: mandatory string, eventId: optional string} 
		 * 
		 * returns a promise object
		 */
		getTasks : function(scheduleCategory, projectFilter) {
			
			if (projectFilter != null) {
				
				var projectId = projectFilter.projectId;
				var eventId = projectFilter.eventId;
				
				if (eventId == null || eventId === undefined)
					return $http.get(microservicesProtocol + "://" + microservicesUrl + "/tasks/tasks?projectId=" + projectFilter.projectId);
				
				return $http.get(microservicesProtocol + "://" + microservicesUrl + "/tasks/tasks?projectId=" + projectFilter.projectId + "&projectEventId=" + projectFilter.eventId);
			}
			
			return $http.get(microservicesProtocol + "://" + microservicesUrl + "/tasks/tasks?scheduling=" + scheduleCategory);
		},
		
		/**
		 * Retrieves the specified task. 
		 * 
		 * returns a promise
		 */
		getTask : function(taskId) {
			
			return $http.get(microservicesProtocol + "://" + microservicesUrl + "/tasks/tasks/" + taskId);
		},
		
		/**
		 * Sets a task category
		 */
		setTaskCategory : function(task, category, callback) {
			
			$http.put(microservicesProtocol + "://" + microservicesUrl + "/tasks/tasks/" + task.id, {category: category.name}).success(function(data, status, header, config) {
				if (callback != null) callback();
			});
			
		},
		
		/**
		 * Toggle the completion of the task
		 */
		toggleCompleteTask : function(task, callback) {
			
			var data = new Object();
			data.completed = !task.completed;
			
			$http.put(microservicesProtocol + "://" + microservicesUrl + "/tasks/tasks/" + task.id, data).success(function(data, status, header, config) {});
			
			callback();
		},
		
		/**
		 * Opens a dialog to postpone a task 
		 */
		postponeTask : function(ev, task, callback) {
			
			function DialogController($scope, $mdDialog) {
				
				$scope.hide = function() {$mdDialog.hide;};
				$scope.cancel = function() {$mdDialog.cancel();};
				$scope.answer = function() {$mdDialog.hide};
				
				$scope.reschedule = function(cat) {
					$http.put(microservicesProtocol + "://" + microservicesUrl + "/tasks/tasks/" + task.id, {scheduling: cat.name});
					$mdDialog.hide(cat);
				}
				
				getScheduleCategories(function(categories, inbox) {
					$scope.categories = categories;
				});
				
			}
			
			var useFullScreen = false;
		    var dialog = {controller: DialogController, templateUrl: 'modules/tasks/dlgPostponeTask.html', parent: angular.element(document.body), targetEvent: ev, clickOutsideToClose: true, fullscreen: useFullScreen};
		    
		    $mdDialog.show(dialog).then(function(cat) {callback(cat);}, function() {});
		
			
		},

		/**
		 * Adds a new tasks. Opens a dialog for inserting the data of the new task
		 * 
		 * Requires: 
		 * 
		 * 	-	ev			:	a DOM event
		 * 
		 *  -	callback	:	a callback to be called when the task has been created and posted on the backend. 
		 *  					this callback will be provided with the created task ID
		 *  
		 *  -	context		:	a OPTIONAL context object that contains information over the context of the task
		 *  					it's an object that supports the following contexts: 
		 *  						-	project	: {contextInfo: string, projectId: string, blockId: string, eventId: opt string}
		 *  					
		 *  					the contextInfo field is always there and can be used to give a textual description of the context
		 *  					of the task. 
		 *  
		 */
		addTask : function(ev, callback, context) {
			
			function DialogController($scope, $mdDialog) {
				
				$scope.hide = function() {$mdDialog.hide;};
				$scope.cancel = function() {$mdDialog.cancel();};
				$scope.answer = function(task) {$mdDialog.hide(task);};
				
			}
			
			var useFullScreen = false;
		    var dialog = {controller: DialogController, templateUrl: 'modules/tasks/dlgAddTask.html', parent: angular.element(document.body), targetEvent: ev, clickOutsideToClose: true, fullscreen: useFullScreen};
		    
		    $mdDialog.show(dialog).then(function(answer) {
		    	
		    	var task = new Object();
		    	task.title = answer.title;
		    	task.due = answer.due != null ? new Date(moment(answer.due)) : null;

		    	if (context != null) {
		    		task.projectId = context.projectId;
		    		task.projectBlockId = context.blockId;
		    		task.projectEventId = context.eventId;
		    		task.contextInfo = context.contextInfo;
		    	}
		    	
		    	$http.post(microservicesProtocol + "://" + microservicesUrl + "/tasks/tasks", task).success(function(data, status, header, config) {
		    		callback(data.id);
		    	});
		    	
		    	
		    }, function() {});
		}, 
		
		/**
		 * Deletes the specified task
		 */
		deleteTask : function(taskId) {
			
			$http.delete(microservicesProtocol + "://" + microservicesUrl + "/tasks/tasks/" + taskId);
		},
		
		/**
		 * Saves a note for the specified task. 
		 * taskId: the task
		 * note: the note to add to the task. Must be a {text: '', date: Date}
		 */
		saveNote : function(taskId, note) {
			
			$http.post(microservicesProtocol + "://" + microservicesUrl + "/tasks/tasks/" + taskId + "/notes", note);
		}, 

		/**
		 * Retrieves the notes of the specified task. 
		 * @returns: a promise that will have in data.notes an darray[] of note {id: '', text: '', date: Date}
		 */
		getNotes : function(taskId) {
			
			return $http.get(microservicesProtocol + "://" + microservicesUrl + "/tasks/tasks/" + taskId + "/notes");
		}
		
	};
	
	return taskService;

} ]);
