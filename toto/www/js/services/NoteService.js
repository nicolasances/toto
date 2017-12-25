var noteServiceModule = angular.module('NoteServiceModule', []);

noteServiceModule.factory('NoteService', [ '$http', '$rootScope', '$location', '$mdDialog', function($http, $rootScope, $location, $mdDialog) {

	return {

		/**
		 * Opens a dialog to create a new note and returns the created note in 
		 * the provided creationCallback
		 * 
		 * Requires:
		 * 
		 * 	-	creationCallback		:	the callback to be called with the content of the 
		 * 									note once created.
		 * 
		 *  -	content					:	previously created content, in case it's a note edit
		 */
		newNote : function(creationCallback, content) {

			function DialogController($scope, $mdDialog, $timeout) {
				
				$scope.hide = function() {$mdDialog.hide;};
				$scope.cancel = function() {$mdDialog.cancel();};
				$scope.answer = function(note) {$mdDialog.hide(note);};
				
				$scope.saveNote = function() {
					$mdDialog.hide($scope.quill.getContents());
				}

				var toolbarOptions = [ ['bold', 'italic', 'underline', 'strike'],  [{ 'header': '1' }, {'header': '2'}]];

				$timeout(function() {
					$scope.quill = new Quill('#editor', {
						modules: {
							toolbar: toolbarOptions
						},
						placeholder : 'Start writing your note...',
						theme : 'snow'
					});
					
					if (content != null) $scope.quill.setContents(content);
					
				}, 500);
				
			}
			
//			var useFullScreen = window.matchMedia( "(max-width: 960px)" ).matches;
			var useFullScreen = true;
			var dialog = {controller: DialogController, templateUrl: 'modules/project/dlgAddNote.html', parent: angular.element(document.body), clickOutsideToClose: true, fullscreen: useFullScreen};
			
			$mdDialog.show(dialog).then(function(answer) {
				
				creationCallback(answer);
				
			}, function() {});			
		
		},
		
		/**
		 * This function pushes a note to the Notes API
		 * 
		 * Requires: 
		 * 
		 * 	-	context		:	the context defines the context in which this note has bee created. 
		 * 						it's an object that describes the context:
		 * 							for a Project context: {projecId: string, blockId: string, eventId: string, documentId: string}
		 * 
		 *  -	note		:	the note content to be saved, it's a QuillJS Delta object 
		 */
		postNote : function(context, note) {
			
			var type = 'project'; // default
			
			var body = {
				type: type,
				timestamp: moment().format('YYYYMMDDHHmmss'),
				projectId: context.projectId,
				projectBlockId: context.blockId,
				projectEventId: context.eventId,
				projectDocId: context.documentId,
				content: note
			};
			
			return $http.post(microservicesProtocol + "://" + microservicesUrl + "/notes/notes", body);
		}, 
		
		/**
		 * This function updates the specified note's content
		 */
		putNote : function(noteId, noteContent) {
			
			return $http.put(microservicesProtocol + "://" + microservicesUrl + "/notes/notes/" + noteId, {content: noteContent});
		},
		
		/**
		 * Retrieves the note for the provided id
		 */
		getNote : function(id) {
			
			return $http.get(microservicesProtocol + "://" + microservicesUrl + "/notes/notes/" + id);
		}
		
	}

} ]);
