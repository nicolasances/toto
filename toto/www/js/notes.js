var notesModule = angular.module("notesModule", []);

notesModule.controller("notesController", [ '$scope', '$http', '$timeout', function($scope, $http, $timeout) {

	$scope.init = function() {
		
		var toolbarOptions = [ ['bold', 'italic', 'underline', 'strike'],  [{ 'header': '1' }, {'header': '2'}]];

		$scope.quill = new Quill('#editor', {
			modules: {
				toolbar: toolbarOptions
			},
			placeholder : 'Start writing your note...',
			theme : 'snow'
		});
		
	}
	
	$scope.saveNote = function() {
		
		console.log($scope.quill.getContents());
	}
	
	$scope.init();

} ]);
