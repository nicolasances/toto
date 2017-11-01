var projectServiceModule = angular.module('ProjectServiceModule', []);

var projectEventTypes = [
	{id: 'meeting', description: 'Meeting', svgPath: 'images/project/event/type/meeting.svg'},
	{id: 'mail', description: 'Mail', svgPath: 'images/project/event/type/mail.svg'},
	{id: 'document', description: 'Document', svgPath: 'images/project/event/type/document.svg'},
	{id: 'decision', description: 'Decision', svgPath: 'images/project/event/type/decision.svg'},
	{id: 'general', description: 'Generic', svgPath: 'images/project/event/type/general.svg'},
];

var docDrives = [
     {id: 'externalHdd', description: 'External HDD', svgPath: 'images/project/doc/drive/externalHdd.svg'},
     {id: 'hdd', description: 'Local HDD', svgPath: 'images/project/doc/drive/hdd.svg'},
     {id: 'nas', description: 'NAS', svgPath: 'images/project/doc/drive/nas.svg'}
];

var docPlaces = [
     {id: 'home', description: 'Home', svgPath: 'images/project/doc/place/home.svg'},
     {id: 'cloud', description: 'Cloud', svgPath: 'images/project/doc/place/cloud.svg'},
     {id: 'work', description: 'Work', svgPath: 'images/project/doc/place/work.svg'}
];

projectServiceModule.factory('ProjectService', [ '$http', '$rootScope', '$location', '$mdDialog', function($http, $rootScope, $location, $mdDialog) {

	return {

		/**
		 * Shows the add project dialog 
		 * 
		 * Requires: 
		 * 
		 *  - creationCallback	:	the callback to be called when the user confirmed the creation.
		 *  						it's a function(project)
		 *  						project will be an object {title: string}
		 */
		showAddProjectDialog : function(creationCallback) {

			function DialogController($scope, $mdDialog) {
				
				$scope.hide = function() {$mdDialog.hide;};
				$scope.cancel = function() {$mdDialog.cancel();};
				$scope.answer = function(project) {$mdDialog.hide(project);};
				
			}
			
			var useFullScreen = window.matchMedia( "(max-width: 960px)" ).matches;
			var dialog = {controller: DialogController, templateUrl: 'modules/project/dlgAddProject.html', parent: angular.element(document.body), clickOutsideToClose: true, fullscreen: useFullScreen};
			
			$mdDialog.show(dialog).then(function(answer) {
				
				creationCallback(answer);
				
			}, function() {});			
		
		}, 

		/**
		 * Shows the add a block to project dialog 
		 * 
		 * Requires: 
		 * 
		 *  - creationCallback	:	the callback to be called when the user confirmed the creation.
		 *  						it's a function(block)
		 *  						block will be an object {title: string}
		 */
		showAddProjectBlockDialog : function(creationCallback) {

			function DialogController($scope, $mdDialog) {
				
				$scope.hide = function() {$mdDialog.hide;};
				$scope.cancel = function() {$mdDialog.cancel();};
				$scope.answer = function(block) {$mdDialog.hide(block);};
				
			}
			
			var useFullScreen = window.matchMedia( "(max-width: 960px)" ).matches;
			var dialog = {controller: DialogController, templateUrl: 'modules/project/dlgAddProjectBlock.html', parent: angular.element(document.body), clickOutsideToClose: true, fullscreen: useFullScreen};
			
			$mdDialog.show(dialog).then(function(answer) {
				
				creationCallback(answer);
				
			}, function() {});			
		
		}, 

		/**
		 * Shows the dialog to select a project block
		 * 
		 * Requires: 
		 * 
		 *  - projectId			:	the project id as a string
		 *  
		 *  - selectionCallback	:	the callback to be called with the selected block as an object {id: string, title: string}
		 */
		showSelectProjectBlockDialog : function(projectId, selectionCallback) {

			function DialogController($scope, $mdDialog) {
				
				$scope.hide = function() {$mdDialog.hide;};
				$scope.cancel = function() {$mdDialog.cancel();};
				$scope.answer = function(block) {$mdDialog.hide(block);};
			
				$http.get("https://" + microservicesUrl + "/project/projects/" + projectId + "/blocks").success(function(data) {
					$scope.blocks = data.blocks;
				});
			}
			
			var useFullScreen = false;
			var dialog = {controller: DialogController, templateUrl: 'modules/project/dlgSelectProjectBlock.html', parent: angular.element(document.body), clickOutsideToClose: true, fullscreen: useFullScreen};
			
			$mdDialog.show(dialog).then(function(answer) {
				
				selectionCallback(answer);
				
			}, function() {});			
		
		}, 

		/**
		 * Shows the add project dialog 
		 * 
		 * Requires: 
		 * 
		 *  - projectId			:	the id of the project
		 * 
		 *  - creationCallback	:	the callback to be called when the user confirmed the creation.
		 *  						it's a function(event)
		 *  						event will be an object {type: string, date: yyyyMMdd string, title: string, blockId: string}
		 */
		showAddProjectEventDialog : function(projectId, creationCallback) {

			function DialogController($scope, $mdDialog) {
				
				$scope.steps = [1, 2];
				$scope.currentStep = 1;
				$scope.event = new Object();
				$scope.event.relevant = false;
				$scope.types = projectEventTypes;

				$scope.hide = function() {$mdDialog.hide;};
				$scope.cancel = function() {$mdDialog.cancel();};
				$scope.answer = function(event) {$mdDialog.hide(event);};
				$scope.nextStep = function () {$scope.currentStep++;}
				$scope.selectType = function(type) {$scope.event.type = type.id; $scope.nextStep();};
				$scope.selectBlock = function(block) {$scope.event.blockId = block.id; $scope.event.blockTitle = block.title; $scope.answer($scope.event);}
				$scope.toggleRelevance = function() {$scope.event.relevant = !$scope.event.relevant;}
				
				$http.get("https://" + microservicesUrl + "/project/projects/" + projectId + "/blocks").success(function(data) {
					$scope.blocks = data.blocks;
				});
				
			}
			
			var useFullScreen = window.matchMedia( "(max-width: 960px)" ).matches;
			var dialog = {controller: DialogController, templateUrl: 'modules/project/dlgAddProjectEvent.html', parent: angular.element(document.body), clickOutsideToClose: true, fullscreen: useFullScreen};
			
			$mdDialog.show(dialog).then(function(answer) {
				
				answer.date = moment(answer.date).format('YYYYMMDD');
				
				creationCallback(answer);
				
			}, function() {});			
		
		}, 

		/**
		 * Shows the add document dialog 
		 * 
		 * Requires: 
		 * 
		 *  - creationCallback	:	the callback to be called when the user confirmed the creation.
		 *  						it's a function(doc)
		 */
		showAddProjectDocumentDialog : function(creationCallback) {

			function DialogController($scope, $mdDialog) {
				
				$scope.steps = [1, 2];
				$scope.currentStep = 1;
				$scope.doc = {location : {}};
				$scope.docDrives = docDrives;
				$scope.docPlaces = docPlaces;

				$scope.hide = function() {$mdDialog.hide;};
				$scope.cancel = function() {$mdDialog.cancel();};
				$scope.answer = function(doc) {$mdDialog.hide(doc);};
				$scope.nextStep = function () {$scope.currentStep++;}
				
				$scope.selectPlace = function(place) {
					for (var i = 0; i < $scope.docPlaces.length; i++) $scope.docPlaces[i].selected = false;
					place.selected = true;
					$scope.doc.location.place = place.id;
				}
				$scope.selectDrive = function(drive) {
					for (var i = 0; i < $scope.docDrives.length; i++) $scope.docDrives[i].selected = false;
					drive.selected = true;
					$scope.doc.location.driveType = drive.id;
				}
				
			}
			
			var useFullScreen = window.matchMedia( "(max-width: 960px)" ).matches;
			var dialog = {controller: DialogController, templateUrl: 'modules/project/dlgAddProjectDocument.html', parent: angular.element(document.body), clickOutsideToClose: true, fullscreen: useFullScreen};
			
			$mdDialog.show(dialog).then(function(answer) {
				
				answer.date = moment(answer.date).format('YYYYMMDD');
				
				creationCallback(answer);
				
			}, function() {});			
		
		}, 
		
		/**
		 * Shows the dialog to add a document version
		 */
		showAddProjectDocumentVersionDialog : function(creationCallback) {

			function DialogController($scope, $mdDialog) {
				
				$scope.steps = [1];
				$scope.currentStep = 1;
				$scope.version = {};

				$scope.hide = function() {$mdDialog.hide;};
				$scope.cancel = function() {$mdDialog.cancel();};
				$scope.answer = function(version) {$mdDialog.hide(version);};
				
			}
			
			var useFullScreen = window.matchMedia( "(max-width: 960px)" ).matches;
			var dialog = {controller: DialogController, templateUrl: 'modules/project/dlgAddProjectDocumentVersion.html', parent: angular.element(document.body), clickOutsideToClose: true, fullscreen: useFullScreen};
			
			$mdDialog.show(dialog).then(function(answer) {
				
				answer.date = moment(answer.date).format('YYYYMMDD');
				
				creationCallback(answer);
				
			}, function() {});			
		
		},
		

		/**
		 * Shows the add mail dialog 
		 * 
		 * Requires: 
		 * 
		 *  - creationCallback	:	the callback to be called when the user confirmed the creation.
		 *  						it's a function(event)
		 */
		showAddProjectMailDialog : function(creationCallback) {

			function DialogController($scope, $mdDialog) {
				
				$scope.steps = [1];
				$scope.currentStep = 1;
				$scope.mail = {};

				$scope.hide = function() {$mdDialog.hide;};
				$scope.cancel = function() {$mdDialog.cancel();};
				$scope.answer = function(mail) {$mdDialog.hide(mail);};
				$scope.nextStep = function () {$scope.currentStep++;}
				
			}
			
			var useFullScreen = window.matchMedia( "(max-width: 960px)" ).matches;
			var dialog = {controller: DialogController, templateUrl: 'modules/project/dlgAddProjectMail.html', parent: angular.element(document.body), clickOutsideToClose: true, fullscreen: useFullScreen};
			
			$mdDialog.show(dialog).then(function(answer) {
				
				answer.date = moment(answer.date).format('YYYYMMDD');
				
				creationCallback(answer);
				
			}, function() {});			
		
		}, 

		/**
		 * Posts a new project
		 */
		postProject : function(project) {
			
			return $http.post("https://" + microservicesUrl + "/project/projects", {title: project.title});
		}, 
		
		/**
		 * Retrieves the list of the projects
		 */
		getProjects : function() {
			
			return $http.get("https://" + microservicesUrl + "/project/projects");
		},
		
		/**
		 * Retrieves a specific project
		 */
		getProject : function(projectId) {
			
			return $http.get("https://" + microservicesUrl + "/project/projects/" + projectId);
		},
		
		/**
		 * Retrieves all the events of 
		 */
		getProjectBlocks : function(projectId) {
			
			return $http.get("https://" + microservicesUrl + "/project/projects/" + projectId + "/blocks");
		}, 
		
		/**
		 * Retrieves all the events of a project 
		 * 
		 * Requires: 
		 * 	-	projectId		:	the id of the project
		 *  - 	blockId			:	an optional block id to use as a filter
		 */
		getProjectEvents : function(projectId, blockId) {
			
			if (blockId != null && blockId != '') return $http.get("https://" + microservicesUrl + "/project/projects/" + projectId + "/events?blockId=" + blockId);
			
			return $http.get("https://" + microservicesUrl + "/project/projects/" + projectId + "/events");
		}, 
		
		/**
		 * Retrieve a specific project event
		 */
		getProjectEvent : function(projectId, eventId) {
			
			return $http.get("https://" + microservicesUrl + "/project/projects/" + projectId + "/events/" + eventId);
		}, 
		
		/**
		 * Retrieves all the documents of a project
		 */
		getProjectDocuments : function(projectId) {
			
			return $http.get("https://" + microservicesUrl + "/project/projects/" + projectId + "/documents");
		}, 
		
		/**
		 * Retrieves the specified project document
		 */
		getProjectDocument : function(projectId, docId) {
			
			return $http.get("https://" + microservicesUrl + "/project/projects/" + projectId + "/documents/" + docId);
		},
		
		/**
		 * Retrieves the mails of a project
		 */
		getProjectMails : function(projectId) {
			
			return $http.get("https://" + microservicesUrl + "/project/projects/" + projectId + "/mails");
		}, 
		
		/**
		 * Retrieves the tasks of a project
		 */
		getProjectTasks : function(projectId) {
			
			return $http.get("https://" + microservicesUrl + "/project/projects/" + projectId + "/tasks");
		}, 
		
		/**
		 * Returns the documents of a specific event
		 */
		getEventDocuments : function(projectId, eventId) {
			
			return $http.get("https://" + microservicesUrl + "/project/projects/" + projectId + "/events/" + eventId + "/documents");
		}, 
		
		/**
		 * Returns the mails of a specific event
		 */
		getEventMails : function(projectId, eventId) {
			
			return $http.get("https://" + microservicesUrl + "/project/projects/" + projectId + "/events/" + eventId + "/mails");
		},
		
		/**
		 * Posts a new block for the project. 
		 * 
		 * Requires: 
		 * 
		 * 	-	projectId	:	the project to which the block will be posted
		 * 
		 *  -	block		:	an object {title: string}
		 */
		postProjectBlock : function(projectId, block) {
			
			return $http.post("https://" + microservicesUrl + "/project/projects/" + projectId + "/blocks", block);
		},
		
		/**
		 * Posts a new event for the project. 
		 * 
		 * Requires: 
		 * 
		 * 	-	projectId	:	the project to which the event will be posted
		 * 
		 *  -	event		:	an object {type: string, date: yyyyMMdd string, title: string, blockId: string}
		 */
		postProjectEvent : function(projectId, event) {
			
			return $http.post("https://" + microservicesUrl + "/project/projects/" + projectId + "/events", event);
		},
		
		/**
		 * Posts a new doc for the project. 
		 * 
		 * Requires: 
		 * 
		 * 	-	projectId	:	the project to which the doc will be posted
		 * 
		 *  -	doc 		:	an object representing the document
		 */
		postProjectDocument : function(projectId, doc) {
			
			return $http.post("https://" + microservicesUrl + "/project/projects/" + projectId + "/documents", doc);
		},
		
		/**
		 * Post a new version of a project document
		 * 
		 *  Requires: 
		 * 
		 * 	-	projectId	:	the project to which the doc will be posted
		 * 
		 *  -	docId 		:	the document Id 
		 *  
		 *  -	version		:	the new version
		 */
		postProjectDocumentVersion : function(projectId, docId, version) {
			
			return $http.post("https://" + microservicesUrl + "/project/projects/" + projectId + "/documents/" + docId + "/versions", version);
		},
		
		/**
		 * Posts a new mail for the project
		 */
		postProjectMail : function(projectId, mail) {
			
			return $http.post("https://" + microservicesUrl + "/project/projects/" + projectId + "/mails", mail);
		}, 
		
		/**
		 * Associates the provided document to the provided event
		 * 
		 * Requires: 
		 * 	-	projectId	:	id of the project
		 * 	-	eventId		:	id of the event
		 * 	-	docId		:	id of the document
		 */
		linkDocToEvent : function(projectId, eventId, docId) {
			
			return $http.post("https://" + microservicesUrl + "/project/projects/" + projectId + "/events/" + eventId + "/documents", {documentId : docId});
		},
		
		/**
		 * Associates the provided mail to the provided event
		 * 
		 * Requires: 
		 * 	-	projectId	:	id of the project
		 * 	-	eventId		:	id of the event
		 * 	-	mailId		:	id of the mail
		 */
		linkMailToEvent : function(projectId, eventId, mailId) {
			
			return $http.post("https://" + microservicesUrl + "/project/projects/" + projectId + "/events/" + eventId + "/mails", {mailId : mailId});
		},
		
		/**
		 * Associates the provided note to the specified event
		 */
		linkNoteToDocument : function(projectId, docId, noteId) {
			
			return $http.post("https://" + microservicesUrl + "/project/projects/" + projectId + "/documents/" + docId + "/notes", {noteId : noteId});
		},
		
		/**
		 * Associates the provided note to the specified event
		 */
		linkNoteToEvent : function(projectId, eventId, noteId) {
			
			return $http.post("https://" + microservicesUrl + "/project/projects/" + projectId + "/events/" + eventId + "/notes", {noteId : noteId});
		},
		
		/**
		 * Links the specified task to the event
		 */
		linkTaskToEvent : function(projectId, eventId, taskId) {
			
			return $http.post("https://" + microservicesUrl + "/project/projects/" + projectId + "/events/" + eventId + "/tasks", {taskId : taskId});
		}
		
	}

} ]);
