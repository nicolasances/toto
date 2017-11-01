
var totoAppList = [
	{id: 'gym', title: 'Gym', svg: 'images/svg/gym.svg', authorized: false},
	{id: 'expenses', title: 'Payments', svg: 'images/svg/budget.svg', authorized: false},
	{id: 'card', title: 'Credit Cards', svg: 'images/svg/credit-card.svg', authorized: false},
	{id: 'piggy', title: 'Piggy Deposit', svg: 'images/svg/piggy-bank.svg', authorized: false},
	{id: 'housekeeping', title: 'Housekeeper', svg: 'images/svg/cleaning-lady.svg', authorized: false},
	{id: 'hotel', title: 'Hotels', svg: 'images/svg/bed.svg', authorized: false},
	{id: 'flight', title: 'Flights', svg: 'images/svg/airplane.svg', authorized: false},
	{id: 'recipe', title: 'Recipes', svg: 'images/svg/cupcake.svg', authorized: false},
	{id: 'car', title: 'Car', svg: 'images/svg/car.svg', authorized: false},
	{id: 'health', title: 'health', svg: 'images/svg/heart-rate.svg', authorized: false},
	{id: 'subscriptions', title: 'Subscriptions', svg: 'images/svg/settings.svg', authorized: false},
	{id: 'tasks', title: 'Tasks', svg: 'images/svg/tasks-check.svg', authorized: false},
	{id: 'sangiorgio', title: 'Home', svg: 'images/svg/home.svg', authorized: false},
	{id: 'monreale', title: 'Monreale', svg: 'images/svg/rented-house.svg', authorized: false},
	{id: 'justice', title: 'Justice', svg: 'images/svg/police-hat.svg', authorized: false},
	{id: 'weekend', title: 'Weekends', svg: 'images/svg/palm-tree.svg', authorized: false},
	{id: 'diet', title: 'Nutrition', svg: 'images/svg/fast-food.svg', authorized: false},
	{id: 'supermarket', title: 'Supermarket', svg: 'images/svg/supermarket.svg', authorized: false},
	{id: 'project', title: 'Project', svg: 'images/svg/project.svg', authorized: false},
	{id: 'jobsearch', title: 'Job Search', svg: 'images/svg/briefcase.svg', authorized: false}
];

//navigator.geolocation.getCurrentPosition(function(position) {console.log(position);});

var totoModule = angular.module("toto", [ "ngRoute", "ngMaterial", "housekeepingModule", "healthModule", "gymModule", "travelModule", "monrealeModule", "dashboardModule", "recipeModule", "tripModule", "expensesModule", "tasksModule", "justiceModule", "carModule", "sangiorgioModule", "piggyModule", "loginModule", "TotoAuthServiceModule", "weekendModule", "GoogleServiceModule", "TransportServiceModule", "HotelServiceModule", "flightModule", "hotelModule", "mogoalsModule", "cardModule", "subscriptionsModule", "totoDirectivesModule", "gymDirectivesModule", "ChimpServiceModule", "ApiAiServiceModule", "totoChimpDirectiveModule", "totoChimpInfoDirectivesModule", "DietServiceModule", "dietModule", "totoHealthFitnessDirectiveModule", "supermarketModule", "SupermarketServiceModule", "projectModule", "ProjectServiceModule", "NoteServiceModule", "jobSearchModule", "JobSearchServiceModule" ])
.factory('totoAuthManager', [ '$rootScope', '$location', function($rootScope, $location) {
	return {
		request : function(config) {
			
			// 1. Avoid adding the google token to non sensitive resources
			var excludedUrls = ["api.api.ai", "images/", "modules/", "directives/"];
			
			for (var i = 0; i < excludedUrls.length; i++) {
				
				if (config.url.indexOf(excludedUrls[i]) != -1) return config;
			}

			// 2. Add Google Id Token
			config.headers['GoogleIdToken'] = googleIdToken;
			
			return config;
		},

		responseError : function(rejection) {

			return rejection;
		}
	};
} ])
.factory('googleSignInService', ['$rootScope', '$location', '$q', '$timeout', '$http', function($rootScope, $location, $q, $timeout, $http) {
	return {
		initGoogleSignIn : function() {
			
			if (googleIdToken != null) return;
			
			var deferred = $q.defer();
			
			// Check if sign in has occurred
			initGoogleSignIn(function() {

				deferred.resolve();
				
			}, $rootScope.go, $http);
			
			return deferred.promise;
		}
	}
}])
.controller("totoController", function($scope, $route, $location, $mdMedia, $mdSidenav, $rootScope) {
	
	$rootScope.microservicesHost = microservicesHost;
	$rootScope.microservicesPort = microservicesPort;
	
	/**
	 * Function to navigate to another page
	 */
	$rootScope.go = function(path) {
		$location.path(path);
	};
	
	/**
	 * Function to navigate to another page and select the provided menu
	 * Requires: 
	 *  
	 *   - menu	:	an object {path: the url, selected: true/false}
	 */
	$scope.goAndSelect = function(menu, menus) {

		var i;
		for (i = 0; i < menus.length; i++) {
			menus[i].selected = false;
		}
		
		$location.path(menu.path);
		menu.selected = true;
	};

	/**
	 * Function that toggles the visibility of the navbar
	 */
	$scope.toggleNavbar = function(id) {
		$mdSidenav(id).toggle();
	}
	
	$scope.$watch(function() {
		return $mdMedia('lg');
	}, function(big) {
		$scope.bigScreen = big;
	});
	
	$scope.screenIsSmall = $mdMedia('sm');
	$rootScope.screenIsDesktop = $mdMedia('gt-sm');
	
})
.config(function($httpProvider, $routeProvider, $locationProvider) {
	
	$httpProvider.interceptors.push('totoAuthManager');

	$routeProvider	.when('/', {templateUrl : 'modules/dashboard.html', controller : 'dashboardController', resolve: {auth: function(googleSignInService) {return googleSignInService.initGoogleSignIn()}}})
					.when('/login', {templateUrl : 'modules/login.html', controller : 'loginController', resolve: {auth: function(googleSignInService) {return googleSignInService.initGoogleSignIn()}}})
					.when('/housekeeping', {templateUrl : 'modules/housekeeping.html', controller : 'housekeepingController', resolve: {auth: function(googleSignInService) {return googleSignInService.initGoogleSignIn()}}})
					.when('/health', {templateUrl : 'modules/health.html', controller : 'healthController', resolve: {auth: function(googleSignInService) {return googleSignInService.initGoogleSignIn()}}})
					.when('/gym', {templateUrl : 'modules/gym/gym.html', controller : 'gymController', resolve: {auth: function(googleSignInService) {return googleSignInService.initGoogleSignIn()}}})
					.when('/gym/plans', {templateUrl : 'modules/gym/gym-plans.html', controller : 'gymPlansController', resolve: {auth: function(googleSignInService) {return googleSignInService.initGoogleSignIn()}}})
					.when('/gym/plans/:id', {templateUrl : 'modules/gym/gym-plan.html', controller : 'gymPlanController', resolve: {auth: function(googleSignInService) {return googleSignInService.initGoogleSignIn()}}})
					.when('/gym/plans/:id/start', {templateUrl : 'modules/gym/gym-plan-start.html', controller : 'gymPlanController', resolve: {auth: function(googleSignInService) {return googleSignInService.initGoogleSignIn()}}})
					.when('/gym/sessions', {templateUrl : 'modules/gym/gym-sessions.html', controller : 'gymSessionsController', resolve: {auth: function(googleSignInService) {return googleSignInService.initGoogleSignIn()}}})
					.when('/gym/sessions/:id', {templateUrl : 'modules/gym/gym-session.html', controller : 'gymSessionController', resolve: {auth: function(googleSignInService) {return googleSignInService.initGoogleSignIn()}}})
					.when('/gym/archive', {templateUrl : 'modules/gym/gym-archive.html', controller : 'gymArchiveController', resolve: {auth: function(googleSignInService) {return googleSignInService.initGoogleSignIn()}}})
					.when('/gym/archive/:id', {templateUrl : 'modules/gym/gym-archive-muscle.html', controller : 'gymArchiveMuscleGroupController', resolve: {auth: function(googleSignInService) {return googleSignInService.initGoogleSignIn()}}})
					.when('/gym/settings', {templateUrl : 'modules/gym/gym-settings.html', controller : 'gymSettingsController', resolve: {auth: function(googleSignInService) {return googleSignInService.initGoogleSignIn()}}})
					.when('/gym/weights', {templateUrl : 'modules/gym/weights.html', controller : 'weightController', resolve: {auth: function(googleSignInService) {return googleSignInService.initGoogleSignIn()}}})
					.when('/travel', {templateUrl : 'modules/travel.html', controller : 'travelController', resolve: {auth: function(googleSignInService) {return googleSignInService.initGoogleSignIn()}}})
					.when('/travel/add-cat', {templateUrl : 'modules/travel-new-cat.html', controller : 'travelCategoryController', resolve: {auth: function(googleSignInService) {return googleSignInService.initGoogleSignIn()}}})
					.when('/travel/cat/:id', {templateUrl : 'modules/travel-cat.html', controller : 'travelCategoryDetailController', resolve: {auth: function(googleSignInService) {return googleSignInService.initGoogleSignIn()}}})
					.when('/travel/add-photo', {templateUrl : 'modules/travel-new-photo.html', controller : 'travelNewPhotoController', resolve: {auth: function(googleSignInService) {return googleSignInService.initGoogleSignIn()}}})
					.when('/travel/cat/:catId/photos/:photoId', {templateUrl : 'modules/travel-photo.html', controller : 'travelPhotoController', resolve: {auth: function(googleSignInService) {return googleSignInService.initGoogleSignIn()}}})
					.when('/travel/settings', {templateUrl : 'modules/travel-settings.html', controller : 'travelSettingsController', resolve: {auth: function(googleSignInService) {return googleSignInService.initGoogleSignIn()}}})
					.when('/recipe', {templateUrl : 'modules/recipe/recipes.html', controller : 'recipesController', resolve: {auth: function(googleSignInService) {return googleSignInService.initGoogleSignIn()}}})
					.when('/recipe/:id', {templateUrl : 'modules/recipe/recipe.html', controller : 'recipeController', resolve: {auth: function(googleSignInService) {return googleSignInService.initGoogleSignIn()}}})
					.when('/trip', {templateUrl : 'modules/trip/trips.html', controller : 'tripsController', resolve: {auth: function(googleSignInService) {return googleSignInService.initGoogleSignIn()}}})
					.when('/trip/:id', {templateUrl : 'modules/trip/trip.html', controller : 'tripController', resolve: {auth: function(googleSignInService) {return googleSignInService.initGoogleSignIn()}}})
					.when('/expenses', {templateUrl : 'modules/expenses/expenses-dashboard.html', controller : 'expensesDashboardController', resolve: {auth: function(googleSignInService) {return googleSignInService.initGoogleSignIn()}}})
					.when('/expenses/payments', {templateUrl : 'modules/expenses/expenses.html', controller : 'expensesController', resolve: {auth: function(googleSignInService) {return googleSignInService.initGoogleSignIn()}}})
					.when('/tasks', {templateUrl : 'modules/tasks/today.html', controller : 'tasksTodayController', resolve: {auth: function(googleSignInService) {return googleSignInService.initGoogleSignIn()}}})
					.when('/tasks/:schedule', {templateUrl : 'modules/tasks/today.html', controller : 'tasksTodayController', resolve: {auth: function(googleSignInService) {return googleSignInService.initGoogleSignIn()}}})
					.when('/tasks/:schedule/:id', {templateUrl : 'modules/tasks/task-detail.html', controller : 'taskDetailController', resolve: {auth: function(googleSignInService) {return googleSignInService.initGoogleSignIn()}}})
					.when('/tasks/detail/:id', {templateUrl : 'modules/tasks/task-detail.html', controller : 'taskDetailController', resolve: {auth: function(googleSignInService) {return googleSignInService.initGoogleSignIn()}}})
					.when('/monreale', {templateUrl : 'modules/monreale/monreale.html', controller : 'monrealeController', resolve: {auth: function(googleSignInService) {return googleSignInService.initGoogleSignIn()}}})
					.when('/monreale/incomes', {templateUrl : 'modules/monreale/incomes.html', controller : 'monrealeIncomesController', resolve: {auth: function(googleSignInService) {return googleSignInService.initGoogleSignIn()}}})
					.when('/monreale/taxes', {templateUrl : 'modules/monreale/taxes.html', controller : 'monrealeTaxesController', resolve: {auth: function(googleSignInService) {return googleSignInService.initGoogleSignIn()}}})
					.when('/monreale/electricity', {templateUrl : 'modules/monreale/electricity.html', controller : 'monrealeElectricityController', resolve: {auth: function(googleSignInService) {return googleSignInService.initGoogleSignIn()}}})
					.when('/monreale/gas', {templateUrl : 'modules/monreale/gas.html', controller : 'monrealeGasController', resolve: {auth: function(googleSignInService) {return googleSignInService.initGoogleSignIn()}}})
					.when('/monreale/charges', {templateUrl : 'modules/monreale/charges.html', controller : 'monrealeChargesController', resolve: {auth: function(googleSignInService) {return googleSignInService.initGoogleSignIn()}}})
					.when('/sangiorgio', {templateUrl : 'modules/sangiorgio/sangiorgio.html', controller : 'sangiorgioController', resolve: {auth: function(googleSignInService) {return googleSignInService.initGoogleSignIn()}}})
					.when('/sangiorgio/taxes', {templateUrl : 'modules/sangiorgio/taxes.html', controller : 'sangiorgioTaxesController', resolve: {auth: function(googleSignInService) {return googleSignInService.initGoogleSignIn()}}})
					.when('/sangiorgio/electricity', {templateUrl : 'modules/sangiorgio/electricity.html', controller : 'sangiorgioElectricityController', resolve: {auth: function(googleSignInService) {return googleSignInService.initGoogleSignIn()}}})
					.when('/sangiorgio/gas', {templateUrl : 'modules/sangiorgio/gas.html', controller : 'sangiorgioGasController', resolve: {auth: function(googleSignInService) {return googleSignInService.initGoogleSignIn()}}})
					.when('/justice', {templateUrl : 'modules/justice/dashboard.html', controller : 'justiceController', resolve: {auth: function(googleSignInService) {return googleSignInService.initGoogleSignIn()}}})
					.when('/justice/fines', {templateUrl : 'modules/justice/fines.html', controller : 'justiceFinesController', resolve: {auth: function(googleSignInService) {return googleSignInService.initGoogleSignIn()}}})
					.when('/justice/equitalia', {templateUrl : 'modules/justice/equitalia.html', controller : 'justiceEquitaliaController', resolve: {auth: function(googleSignInService) {return googleSignInService.initGoogleSignIn()}}})
					.when('/car', {templateUrl : 'modules/car/dashboard.html', controller : 'carController', resolve: {auth: function(googleSignInService) {return googleSignInService.initGoogleSignIn()}}})
					.when('/car/taxes', {templateUrl : 'modules/car/taxes.html', controller : 'carBolloController', resolve: {auth: function(googleSignInService) {return googleSignInService.initGoogleSignIn()}}})
					.when('/piggy', {templateUrl : 'modules/piggy/piggy.html', controller : 'piggyController', resolve: {auth: function(googleSignInService) {return googleSignInService.initGoogleSignIn()}}})
					.when('/weekend', {templateUrl : 'modules/weekend/weekend.html', controller : 'weekendController', resolve: {auth: function(googleSignInService) {return googleSignInService.initGoogleSignIn()}}})
					.when('/weekend/archive', {templateUrl : 'modules/weekend/archive.html', controller : 'weekendArchiveController', resolve: {auth: function(googleSignInService) {return googleSignInService.initGoogleSignIn()}}})
					.when('/weekend/:id', {templateUrl : 'modules/weekend/weekend-detail.html', controller : 'weekendDetailController', resolve: {auth: function(googleSignInService) {return googleSignInService.initGoogleSignIn()}}})
					.when('/flight', {templateUrl : 'modules/flight/tickets.html', controller : 'flightController', resolve: {auth: function(googleSignInService) {return googleSignInService.initGoogleSignIn()}}})
					.when('/hotel', {templateUrl : 'modules/hotel/hotels.html', controller : 'hotelController', resolve: {auth: function(googleSignInService) {return googleSignInService.initGoogleSignIn()}}})
					.when('/mogoals', {templateUrl : 'modules/mogoals/mogoals-dashboard.html', controller : 'mogoalsDashboardController', resolve: {auth: function(googleSignInService) {return googleSignInService.initGoogleSignIn()}}})
					.when('/card', {templateUrl : 'modules/card/cards.html', controller : 'cardController', resolve: {auth: function(googleSignInService) {return googleSignInService.initGoogleSignIn()}}})
					.when('/card/:id', {templateUrl : 'modules/card/card-detail.html', controller : 'cardDetailController', resolve: {auth: function(googleSignInService) {return googleSignInService.initGoogleSignIn()}}})
					.when('/subscriptions', {templateUrl : 'modules/subscriptions/subscriptions.html', controller : 'subscriptionsController', resolve: {auth: function(googleSignInService) {return googleSignInService.initGoogleSignIn()}}})
					.when('/subscriptions/:id', {templateUrl : 'modules/subscriptions/subscription-detail.html', controller : 'subscriptionDetailController', resolve: {auth: function(googleSignInService) {return googleSignInService.initGoogleSignIn()}}})
					.when('/diet', {templateUrl : 'modules/diet/diet-dashboard.html', controller : 'dietDashboardController', resolve: {auth: function(googleSignInService) {return googleSignInService.initGoogleSignIn()}}})
					.when('/supermarket', {templateUrl : 'modules/supermarket/supermarket-missing-goods.html', controller : 'supermarketController', resolve: {auth: function(googleSignInService) {return googleSignInService.initGoogleSignIn()}}})
					.when('/project', {templateUrl : 'modules/project/projects.html', controller : 'projectsController', resolve: {auth: function(googleSignInService) {return googleSignInService.initGoogleSignIn()}}})
					.when('/project/:id', {templateUrl : 'modules/project/project.html', controller : 'projectController', resolve: {auth: function(googleSignInService) {return googleSignInService.initGoogleSignIn()}}})
					.when('/project/:id/blocks', {templateUrl : 'modules/project/project-blocks.html', controller : 'projectBlocksController', resolve: {auth: function(googleSignInService) {return googleSignInService.initGoogleSignIn()}}})
					.when('/project/:id/events/:eventId', {templateUrl : 'modules/project/project-event.html', controller : 'projectEventController', resolve: {auth: function(googleSignInService) {return googleSignInService.initGoogleSignIn()}}})
					.when('/project/:id/documents/:docId', {templateUrl : 'modules/project/project-document.html', controller : 'projectDocumentController', resolve: {auth: function(googleSignInService) {return googleSignInService.initGoogleSignIn()}}})
					.when('/jobsearch', {templateUrl : 'modules/jobsearch/applications.html', controller : 'jobsearchApplicationsController', resolve: {auth: function(googleSignInService) {return googleSignInService.initGoogleSignIn()}}})
					.when('/jobsearch/:id', {templateUrl : 'modules/jobsearch/application.html', controller : 'jobsearchApplicationController', resolve: {auth: function(googleSignInService) {return googleSignInService.initGoogleSignIn()}}})
					;

});

