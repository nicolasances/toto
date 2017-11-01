var gymDirectivesModule = angular.module('gymDirectivesModule', ['GymServiceModule']);

/**
 * This directive draws a graphic with the scores obtained for a specific muscle.
 * 
 * Parameters: 
 * 
 * 	-	muscle			:	The identifier of the muscle for which to load the scores (e.g. 'chest')
 */
gymDirectivesModule.directive('totoGymMuscleGraph', ['GymService', '$timeout', function(GymService, $timeout) {
	
	return {
		scope: {
			muscle: '@',
			height: '@',
			maxResults : '@'
		},
		templateUrl: 'modules/gym/directives/toto-gym-muscle-graph.html',
		link: function(scope) {
			
			GymService.calculateEfficacy('goodPain', 'ok').success(function(data) {

				scope.benchmarkEfficacy = data.efficacy;
			});
			
			scope.$watch('muscle', function(newValue, oldValue) {
				
				if (newValue == null || newValue == "") return;
				
				// 1. Retrieve scores for muscle
				GymService.getScoresForMuscle(newValue, scope.maxResults).success(function(data) {
					
					scope.muscleScoreWeeks = data.weeks;
					
					var i; 
					for (i = 0; i < data.weeks.length; i++) {
						var date = moment();
						date.day("Monday");
						date.week(data.weeks[i].weekOfYear);
						date.year(data.weeks[i].year);
						
						if (i % 2 == 0) scope.muscleScoreWeeks[i].date = new Date(date); 
					}
					
					$timeout(function() {GymService.createMuscleScoreGraph(scope.muscleScoreWeeks, scope.height);}, 500);
				});
			});
		}
	};
}]);

