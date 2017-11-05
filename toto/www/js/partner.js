
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
		$scope.loadDeedsToApprove();
	}
	
	/**
	 * Approve the next deed
	 */
	$scope.approveDeed = function() {
		
		PartnerService.showApproveDeedsDialog($scope.deedsToApprove[0], function(approved) {

			if (approved) PartnerService.approveDeed($scope.deedsToApprove[0].id);
			else PartnerService.deleteDeed($scope.deedsToApprove[0].id);
			
			$scope.deedsToApprove.splice(0, 1);
		});
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
	 * Loads the deeds to approve
	 */
	$scope.loadDeedsToApprove = function() {
		
		PartnerService.getDeedsToApprove().success(function(data) {
			
			$scope.deedsToApprove = data.deeds;
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