
var partnerMenus = [
	{path: '/partner', imageUrl: 'images/svg/dashboard.svg', name: 'Dashboard', selected: true},
	{path: '/partner/masterDeeds', imageUrl: 'images/svg/archived.svg', name: 'Types of deeds'}
];

var partnerModule = angular.module("partnerModule", ["PartnerServiceModule"]);

/*******************************************************************************
 * DASHBOARD
 ******************************************************************************/
partnerModule.controller("partnerController", [ '$rootScope', '$scope', '$http', 'PartnerService', function($rootScope, $scope, $http, PartnerService) {

	$scope.init = function() {
		
		$rootScope.currentMenu = "Partner dashboard";
		$scope.partnerMenus = partnerMenus;
		
		$scope.loadTodayScore();
	}
	
	/**
	 * Loads today's score
	 */
	$scope.loadTodayScore = function() {
		
		$scope.today = {score: 0};
		
		PartnerService.getTodayScore().success(function(data) {

			if (data.scores.length > 0) $scope.today = data.scores[0];
		});
	}
	
	/**
	 * A new deed has been done!
	 */
	$scope.newDeed = function() {
		
		PartnerService.showAddDeedDialog(function(deed) {
			
			PartnerService.postDeed(deed).success(function(data) {
				
				if ($scope.deedModelListeners != null) {
					
					for (var i = 0; i < $scope.deedModelListeners.length; i++) {
						
						$scope.deedModelListeners[i](data.id);
					}
				}
			});
		});
	}

	/**
	 * Registers a listener on deed model changes. 
	 * 
	 *  - onDeedAdded	:	a callback function to be called whenever a deed is added
	 *  					function(deedId)
	 */
	$scope.registerDeedModelListener = function(onDeedAdded) {
		
		if ($scope.deedModelListeners == null) $scope.deedModelListeners = [];
		
		$scope.deedModelListeners.push(onDeedAdded);
	}
	
	$scope.init();
	
} ]);

/*******************************************************************************
 * MASTER DEEDS
 ******************************************************************************/
partnerModule.controller("partnerMasterDeedsController", [ '$rootScope', '$scope', '$http', function($rootScope, $scope, $http) {
	
	$scope.init = function() {
		
		$rootScope.currentMenu = "Deed types";
		$scope.partnerMenus = partnerMenus;
	}
	
	$scope.init();
	
} ]);

/*******************************************************************************
 * DIRECTIVES
 ******************************************************************************/
/**
 * Master deeds list
 * 
 * Input: 
 * 	-	onSelect	:	a fuction(deed) to react to the selection of a deed
 */
partnerModule.directive('partnerMasterDeeds', function($http, $mdDialog, taskService, $rootScope, PartnerService) {
	return {
		scope : {
			title: '@',
			onSelect: '='
		},
		templateUrl : 'modules/partner/directives/partner-master-deeds.html',
		link : function(scope) {
			
			scope.init = function() {
				
				scope.loadMasterDeeds();
			}

			/**
			 * Loads master deeds
			 */
			scope.loadMasterDeeds = function() {
				
				PartnerService.getMasterDeeds().success(function(data) {
					
					scope.masterDeeds = data.masterDeeds;
				});
			}
			
			/**
			 * Creates a new Master Deed
			 */
			scope.newMasterDeed = function() {
			
				PartnerService.showAddMasterDeedDialog(function(deed) {
					
					if (scope.masterDeeds == null) scope.masterDeeds = [];

					scope.createdMasterDeed = deed;
					scope.masterDeeds.push(scope.createdMasterDeed);
					
					PartnerService.postMasterDeed(deed).success(function(data) {
						
						scope.createdMasterDeed.id = data.id;
					});
				});
			}
			
			scope.init();
		}
	}
});

/**
 * Deeds. Shows the list of deeds. 
 * 
 * Accepts a few parameters: 
 * 
 * 	-	title			:	title of the toto card
 * 	-	register		:	a function to call to register itself for deed model changes (e.g. added a new deed)
 * 							this function must take as input param a callback function(deedId) to be called when a deed is added.
 * 
 */
partnerModule.directive('partnerDeeds', function($http, $mdDialog, taskService, $rootScope, PartnerService) {
	return {
		scope : {
			title: '@',
			register : '='
		},
		templateUrl : 'modules/partner/directives/partner-deeds.html',
		link : function(scope) {
			
			scope.init = function() {
				
				scope.loadDeeds();
				scope.register(function(deedId) {
					
					scope.loadDeeds();
				});
			}
			
			scope.loadDeeds = function() {
				
				PartnerService.getDeeds().success(function(data) {
					
					scope.deeds = data.deeds;
				});
			}
			
			scope.init();
		}
	}
});

/**
 * Shows a graph of the weekly scores
 */
partnerModule.directive('partnerWeekScores', function($http, $mdDialog, taskService, $rootScope, PartnerService) {
	return {
		scope : {
			title: '@'
		},
		templateUrl : 'modules/partner/directives/partner-week-scores.html',
		link : function(scope) {
			
			scope.init = function() {
				
				scope.id = 'partner-week-scores-graph';
				
				PartnerService.getCurrentWeek().success(function(week) {
					
					// 1. Retrieve the daily scores of the week to build the graph
					PartnerService.getDailyScores(week).success(function(data) {
						
						var bars = [];
						
						for (var i = 0; i < data.scores.length; i++) {
							
							bars.push({
								value : data.scores[i].score,
								label : moment(data.scores[i].date, 'YYYYMMDD').format('dd')
							});
						}
						
						scope.bars = bars;
					});
					
					// 2. Retrieve the week score to build the bubble
					PartnerService.getWeekScore(week.week, week.year).success(function(data) {
						
						if (data.scores.length == 0) return;
						
						scope.weekScore = data.scores[0].score;
					});
				});
			}
			
			scope.init();
		}
	}
});

/**
 * Shows the winner of evert week
 */
partnerModule.directive('partnerWeeksWinner', function($http, $mdDialog, $mdMedia, taskService, $rootScope, PartnerService) {
	return {
		scope : {
			title: '@'
		},
		templateUrl : 'modules/partner/directives/partner-weeks-winner.html',
		link : function(scope) {
			
			scope.init = function() {
				
				PartnerService.getCurrentWeek().success(function(currentWeek) {
					
					var maxResults = 4; 
					if ($mdMedia('gt-md')) maxResults = 4;
					else if ($mdMedia('gt-xs')) maxResults = 6;
					
					PartnerService.getWeeksWinner(currentWeek, maxResults).success(function(data) {

						for (var i = 0; i < data.weeks.length; i++) {
							
							data.weeks[i].date = new Date(moment(data.weeks[i].startOfWeek, 'YYYYMMDD'));
							data.weeks[i].won = data.weeks[i].winner == googleUser.getBasicProfile().getEmail();
						}
						
						scope.weeks = data.weeks;
					});
					
				});
				
			}
			
			scope.init();
		}
	}
});
