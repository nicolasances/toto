var projectMenus = [
	{path: '/', imageUrl: 'images/svg/home.svg', name: "Home"},
	{path: '/gym', imageUrl: 'images/svg/dashboard.svg', name: 'Dashboard', selected: true}
];

var projectModule = angular.module("projectModule", [ "ProjectServiceModule" ]);

/*******************************************************************************
 * PROJECTS
 ******************************************************************************/
projectModule.controller("projectsController", [ '$scope', '$http', '$timeout', 'ProjectService', function($scope, $http, $timeout, ProjectService) {

	$scope.init = function() {
		
		$scope.projectMenus = projectMenus;
		$scope.projects = [];
		
		ProjectService.getProjects().success(function(data) {
			
			$scope.projects = data.projects;
		});
	}
	
	/**
	 * Creates a new project
	 */
	$scope.addProject = function() {
		
		ProjectService.showAddProjectDialog(function(project) {
			
			$scope.createdProject = project;
			$scope.projects.push($scope.createdProject);
			
			ProjectService.postProject(project).success(function(data) {
				
				$scope.createdProject.id = data.id;
			});
			
		});
	}
	
	$scope.init();

} ]);

/*******************************************************************************
 * PROJECT
 ******************************************************************************/
projectModule.controller("projectController", [ '$scope', '$http', '$timeout', '$routeParams', 'ProjectService', 'taskService', function($scope, $http, $timeout, $routeParams, ProjectService, taskService) {

	$scope.init = function() {
		
		$scope.events = [];
		
		ProjectService.getProject($routeParams.id).success(function(data) {
			
			$scope.project = data;
		});
		
		ProjectService.getProjects().success(function(data) {
			
			$scope.projects = data.projects;
		});
		
		$scope.loadProjectEvents();
		$scope.loadProjectTasks();
		
	}
	
	/**
	 * Loads all the tasks for that project
	 */
	$scope.loadProjectTasks = function() {
		
		taskService.getTasks(null, {projectId: $routeParams.id}).success(function(data) {
			
			$scope.tasks = data.tasks;
		});
	}
	
	/**
	 * Loads the project events. 
	 * 
	 * Eventually uses the filter block id in case there is any
	 */
	$scope.loadProjectEvents = function() {
		
		ProjectService.getProjectEvents($routeParams.id, $scope.filterBlock != null ? $scope.filterBlock.id : '').success(function(data) {
			
			$scope.events = data.events;
			
			for (var i = 0; i < $scope.events.length; i++) {
				$scope.events[i].date = moment($scope.events[i].date, 'YYYYMMDD').format('DD MMM');
			}
		});
	}
	
	/**
	 * Adds a new event
	 */
	$scope.addEvent = function() {
		
		ProjectService.showAddProjectEventDialog($routeParams.id, function(event) {
			
			$scope.lastAddedEvent = event;
			$scope.events.push($scope.lastAddedEvent);
			
			ProjectService.postProjectEvent($routeParams.id, event).success(function(data) {
				
				$scope.lastAddedEvent.id = data.id;
			});
		});
	}
	
	/**
	 * Selects the block to use as a filter for the project events
	 */
	$scope.selectBlockFilter = function() {
		
		ProjectService.showSelectProjectBlockDialog($routeParams.id, function(block) {
			
			$scope.filterBlock = block;
			
			$scope.loadProjectEvents();
		});
	}
	
	/**
	 * Removes the block filter
	 */
	$scope.removeBlockFilter = function() {
		
		$scope.filterBlock = null;
		
		$scope.loadProjectEvents();
	}
	
	/**
	 * Toggles the completion of the task
	 */
	$scope.toggleCompleteTask = function(task) {
		
		taskService.toggleCompleteTask(task, function() {
			
			task.completed = !task.completed;
		});
	}
	
	$scope.init();

} ]);

/*******************************************************************************
 * PROJECT BLOCKS
 ******************************************************************************/
projectModule.controller("projectBlocksController", [ '$scope', '$http', '$timeout', '$routeParams', 'ProjectService', function($scope, $http, $timeout, $routeParams, ProjectService) {

	$scope.init = function() {
		
		$scope.blocks = [];
		
		ProjectService.getProjectBlocks($routeParams.id).success(function(data) {
			
			$scope.blocks = data.blocks;
		});
		
		ProjectService.getProject($routeParams.id).success(function(data) {
			
			$scope.project = data;
		});
	}
	
	/**
	 * Adds a block to the project
	 */
	$scope.addBlock = function() {
		
		ProjectService.showAddProjectBlockDialog(function(block) {
			
			$scope.block = block;
			$scope.blocks.push(block);
			
			ProjectService.postProjectBlock($routeParams.id, block).success(function(data) {
				
				$scope.block.id = data.id;
			});
		});
	}
	
	$scope.init();

} ]);
/*******************************************************************************
 * PROJECT EVENT
 * /project/:id/events/:eventId
 ******************************************************************************/
projectModule.controller("projectEventController", [ '$scope', '$http', '$timeout', '$routeParams', 'ProjectService', 'NoteService', 'taskService', function($scope, $http, $timeout, $routeParams, ProjectService, NoteService, taskService) {

	$scope.init = function() {
		
		ProjectService.getProject($routeParams.id).success(function(data) {
			
			$scope.project = data;
		});
		
		$scope.loadEvent();
		$scope.loadDocuments();
		$scope.loadMails();
		$scope.loadTasks();
		
	}
	
	/**
	 * Loads the event's tasks
	 */
	$scope.loadTasks = function() {
		
		taskService.getTasks(null, {projectId: $routeParams.id, eventId: $routeParams.eventId}).success(function(data) {
			
			$scope.tasks = data.tasks;
			
		});
	}
	
	/**
	 * Loads the event
	 */
	$scope.loadEvent = function() {
		
		ProjectService.getProjectEvent($routeParams.id, $routeParams.eventId).success(function(data) {
			
			$scope.event = data;
			$scope.event.date = moment($scope.event.date, 'YYYYMMDD').format('DD MMM');
			
			if ($scope.event.notes != null && $scope.event.notes.length > 0) $scope.loadNote($scope.event.notes[0]);
		});
	}
	
	/**
	 * Loads the specified note
	 */
	$scope.loadNote = function(noteId) {
		
		NoteService.getNote(noteId).success(function(data) {
			
			$scope.note = data;
			
			$scope.quill = new Quill('.note-container', {
				modules: {}
			});
			
			$scope.quill.disable();
			$scope.quill.setContents($scope.note.content);
		});
	}
	
	/**
	 * Loads the event's documents
	 */
	$scope.loadDocuments = function() {
		
		ProjectService.getEventDocuments($routeParams.id, $routeParams.eventId).success(function(data) {

			$scope.documents = data.documents;
			
			if ($scope.documents != null) 
				for (var i = 0; i < $scope.documents.length; i++)
					for (var j = 0; j < $scope.documents[i].versions.length; j++) 
						$scope.documents[i].versions[j].date = moment($scope.documents[i].versions[j].date, 'YYYYMMDD').format('DD MMM YYYY');
		});
	}
	
	/**
	 * Loads the event's mails
	 */
	$scope.loadMails = function() {
		
		ProjectService.getEventMails($routeParams.id, $routeParams.eventId).success(function(data) {

			$scope.mails = data.mails;
		});
	}
	
	/**
	 * Adds a new document to the project and links it to the event
	 */
	$scope.addDocument = function() {
	
		ProjectService.showAddProjectDocumentDialog(function(doc) {
			
			ProjectService.postProjectDocument($routeParams.id, doc).success(function(data) {
				
				ProjectService.linkDocToEvent($routeParams.id, $routeParams.eventId, data.id).success(function(data) {
					
					$scope.loadDocuments();

				});
			});
		});
	}
	
	/**
	 * Adds a version to the document
	 */
	$scope.addDocumentVersion = function(doc) {
		
		ProjectService.showAddProjectDocumentVersionDialog(function(version) {
			
			ProjectService.postProjectDocumentVersion($routeParams.id, doc.id, version).success(function(data) {
				
				$scope.loadDocuments();
			});
		});
	}
	
	/**
	 * Adds a new mail to the project and links it to the event
	 */
	$scope.addMail = function() {
	
		ProjectService.showAddProjectMailDialog(function(mail) {
			
			ProjectService.postProjectMail($routeParams.id, mail).success(function(data) {
				
				ProjectService.linkMailToEvent($routeParams.id, $routeParams.eventId, data.id).success(function(data) {
					
					$scope.loadMails();

				});
			});
		});
	}
	
	/**
	 * Adds a note to the event
	 */
	$scope.addNote = function() {

		var previousContent = $scope.note != null ? $scope.note.content : null;
		
		NoteService.newNote(function(note) {
			
			if ($scope.note == null) NoteService.postNote({projectId: $routeParams.id, blockId: $scope.event.blockId, eventId: $routeParams.eventId, documentId: null}, note).success(function(data) {
				
				ProjectService.linkNoteToEvent($routeParams.id, $routeParams.eventId, data.id).success(function(data) {
					
					$scope.loadEvent();
				});
			});
			else NoteService.putNote($scope.note.id, note).success(function(data) {
				
				$scope.loadEvent();
			});
			
		}, previousContent);
	}
	
	/**
	 * Adds a task to the event
	 * 
	 * This method will popup the task insertion interface, post the task and 
	 * then post the link between the task and the event.
	 */
	$scope.addTask = function(ev) {
		
		taskService.addTask(ev, function(taskId) {
			
			ProjectService.linkTaskToEvent($routeParams.id, $scope.event.id, taskId).success(function(data) {
				
				$scope.loadTasks();
			});
			
		}, {projectId: $routeParams.id, blockId: $scope.event.blockId, eventId: $scope.event.id, contextInfo: $scope.event.title});
	}
	
	/**
	 * Toggles the completion of the task
	 */
	$scope.toggleCompleteTask = function(task) {
		
		taskService.toggleCompleteTask(task, function() {
			
			task.completed = !task.completed;
		});
	}
	
	$scope.init();

} ]);
/*******************************************************************************
 * PROJECT DOCUMENT
 * /project/:id/documents/:docId
 ******************************************************************************/
projectModule.controller("projectDocumentController", [ '$scope', '$http', '$timeout', '$routeParams', 'ProjectService', 'NoteService', 'taskService', function($scope, $http, $timeout, $routeParams, ProjectService, NoteService, taskService) {
	
	$scope.init = function() {
		
		ProjectService.getProject($routeParams.id).success(function(data) {
			
			$scope.project = data;
		});
		
		$scope.loadDoc();
	}
	
	/**
	 * Loads the document
	 */
	$scope.loadDoc = function() {
		
		ProjectService.getProjectDocument($routeParams.id, $routeParams.docId).success(function(doc) {
			
			$scope.doc = doc;
			
			if ($scope.doc.noteId != null) $scope.loadNote($scope.doc.noteId);
		});
	}
	
	/**
	 * Loads the specified note
	 */
	$scope.loadNote = function(noteId) {
		
		NoteService.getNote(noteId).success(function(data) {
			
			$scope.note = data;
			
			$scope.quill = new Quill('.note-container', {
				modules: {}
			});
			
			$scope.quill.disable();
			$scope.quill.setContents($scope.note.content);
		});
	}
	
	/**
	 * Adds a note (or updates the exising one) to the document
	 */
	$scope.writeNote = function() {

		var previousContent = $scope.note != null ? $scope.note.content : null;
		
		NoteService.newNote(function(note) {
			
			if ($scope.note == null) NoteService.postNote({projectId: $routeParams.id, documentId: $scope.doc.id}, note).success(function(data) {
				
				ProjectService.linkNoteToDocument($routeParams.id, $routeParams.docId, data.id).success(function(data) {
					
					$scope.loadDoc();
				});
			});
			else NoteService.putNote($scope.note.id, note).success(function(data) {
				
				$scope.loadDoc();
			});
			
		}, previousContent);
	}
	
	$scope.init();
}]);