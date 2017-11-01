var jobsearchModule = angular.module("jobSearchModule", [  ]);
	
jobsearchModule.controller("jobsearchApplicationsController", [ '$scope', '$http', '$timeout', '$mdDialog', '$mdSidenav', 'JobSearchService', function($scope, $http, $timeout, $mdDialog, $mdSidenav, JobSearchService) {

	$scope.init = function() {
		
		$scope.getApplications();
		$scope.getCountries();
		
		$scope.graphHidden = false;
	}
	
	/**
	 * Toggles the visibility of the graph
	 */
	$scope.toggleGraph = function() {
		$scope.graphHidden = !$scope.graphHidden;
	}
	
	/**
	 * Retrieves countries
	 */
	$scope.getCountries = function() {
		
		JobSearchService.getCountries().success(function(data) {
			
			$scope.countries = data.countries;
			
			for (var i = 0; i < $scope.countries.length; i++) {

				var total = $scope.countries[i].ongoing + $scope.countries[i].failed + $scope.countries[i].waiting;
				
				$scope.countries[i].ongoingWidth = $scope.countries[i].ongoing * 100 / total;
				$scope.countries[i].failedWidth = $scope.countries[i].failed * 100 / total;
				$scope.countries[i].waitingWidth = $scope.countries[i].waiting * 100 / total;
			}
		});
	}
	
	/**
	 * Retrieves the list of applications
	 */
	$scope.getApplications = function() {
		
		JobSearchService.getApplications().success(function(data) {

			$scope.applications = data.applications;
			
			for (var i = 0; i < $scope.applications.length; i++) {
				
				$scope.applications[i].date = new Date(moment($scope.applications[i].sentOn, 'YYYYMMDD'));
			}
		});
	}
	
	/**
	 * Adds an application
	 */
	$scope.addApplication = function() {
		
		JobSearchService.showAddApplicationDialog(function(app) {
			
			$scope.newApplication = app;
			$scope.newApplication.date = new Date(moment($scope.newApplication.sentOn, 'YYYYMMDD'));
			$scope.applications.push($scope.newApplication);
			
			JobSearchService.postApplication(app).success(function(data) {
				
				$scope.newApplication.id = data.id;
			});
			
		});
	}
	
	$scope.init();
	
} ]);

/* ********************************************************************************************************************************************************
 * APPLICATION DETAIL
 * ********************************************************************************************************************************************************/
jobsearchModule.controller("jobsearchApplicationController", [ '$scope', '$http', '$timeout', '$mdDialog', '$mdSidenav', '$routeParams', 'JobSearchService', function($scope, $http, $timeout, $mdDialog, $mdSidenav, $routeParams, JobSearchService) {

	$scope.init = function() {
		
		$scope.getApplications();
		$scope.getApplication();
		$scope.getApplicationEvents();
	}
	
	/**
	 * Retrieves the list of applications
	 */
	$scope.getApplications = function() {
		
		JobSearchService.getApplications().success(function(data) {

			$scope.applications = data.applications;
			
			for (var i = 0; i < $scope.applications.length; i++) {
				
				$scope.applications[i].date = new Date(moment($scope.applications[i].sentOn, 'YYYYMMDD'));
			}
		});
	}
	
	/**
	 * Retrieves the application
	 */
	$scope.getApplication = function() {
		
		JobSearchService.getApplication($routeParams.id).success(function(data) {
			
			$scope.application = data;
		});
	}
	
	/**
	 * Retrieves the events of the application
	 */
	$scope.getApplicationEvents = function() {
		
		JobSearchService.getApplicationEvents($routeParams.id).success(function(data) {
			
			$scope.events = data.events;
			
			for (var i = 0; i < $scope.events.length; i++) $scope.events[i].eventDate = new Date(moment($scope.events[i].date, 'YYYYMMDD'));
		});
	}
	
	/**
	 * Adds an event tothe application
	 */
	$scope.addEvent = function() {
		
		JobSearchService.showAddApplicationEventDialog(function(evt) {
			
			$scope.addedEvent = evt;
			$scope.addedEvent.eventDate = new Date(moment($scope.addedEvent.date, 'YYYYMMDD'));
			
			$scope.events.push($scope.addedEvent);
			
			JobSearchService.postApplicationEvent($routeParams.id, evt).success(function(data) {
				
				$scope.addedEvent.id = data.id;
			});
		});
	}
	
	$scope.init();

} ]);


