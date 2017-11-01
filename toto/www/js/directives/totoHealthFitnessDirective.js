var totoHealthFitnessDirectiveModule = angular.module('totoHealthFitnessDirectiveModule', [ "GymServiceModule", "DietServiceModule" ]);

/**
 * Directive that shows the general health & fitness of the week
 * 
 * Accepts the following parameters:
 */
totoHealthFitnessDirectiveModule.directive('totoHealthFitness', [ '$timeout', 'GymService', 'DietService', '$interval', '$mdMedia', function($timeout, GymService, DietService, $interval, $mdMedia) {

	return {
		progress : {},
		scope : {
		},
		templateUrl : 'directives/toto-health-fitness.html',
		link : function(scope) {
			
			/**
			 * Loads the gym data
			 */
			scope.loadGymData = function() {
				
				GymService.calculateEfficacy('goodPain', 'ok').success(function(data) {

					scope.benchmarkEfficacy = data.efficacy;
					
					GymService.getWeekSummary(moment().format('W'), moment().format('YYYY'), scope.benchmarkEfficacy).success(function(data) {

						scope.gymDays = data.days;
						
						$timeout(scope.buildGymGraph, 500);
					});
				});
				
			}
			
			/**
			 * Creates the bars related to the gym info that has been loaded
			 */
			scope.buildGymGraph = function() {
				
				var containerWidth = document.querySelector('.gym-graph-container').offsetWidth;
				
				var maxBarHeight = document.querySelector('toto-health-fitness').offsetHeight / 1.7;
				var maxScore = scope.getMaxScore(scope.gymDays);
				var heightRatio = maxBarHeight / maxScore;
				var delay = 6;
				
				for (var i = 0; i < scope.gymDays.length; i++) {
					
					var day = scope.gymDays[i];
					var element = document.getElementById('gym-day-' + day.date);
					var elementPrev = document.getElementById('gym-day-prev-' + day.date);
					var elementDayLabel = document.getElementById('label-day-' + day.date);
					
					var barWidth = element.offsetWidth;
					var barGutter = (containerWidth - scope.gymDays.length * barWidth) / (scope.gymDays.length * 2);
					
					element.style.left = barGutter + (i * (barWidth + 2 * barGutter)) + 'px';
					elementPrev.style.left = barGutter + (i * (barWidth + 2 * barGutter)) - delay + 'px';
					
					scope.animateBar(element, day.score * heightRatio);
					scope.animateBar(elementPrev, (day.score - day.delta) * heightRatio);
					
					elementDayLabel.style.width = barWidth + 'px';
					elementDayLabel.style.left = barGutter + (i * (barWidth + 2 * barGutter)) + 'px';
					elementDayLabel.innerHTML = moment(day.date, 'YYYYMMDD').format('dd');
				}
			}
			
			/**
			 * Retrieves the max score in the provided days
			 */
			scope.getMaxScore = function(days) {
				
				var maxScore = 1;
				for (var i = 0; i < scope.gymDays.length; i++) {
					
					if (scope.gymDays[i].score > maxScore) {
						
						maxScore = scope.gymDays[i].score;
					}
				}
				
				return maxScore;
			}
			
			/**
			 * Loads the water consumption
			 */
			scope.loadWaterData = function() {
				
				DietService.getWaterConsumptionOfWeek(moment().format('W'), moment().format('YYYY')).success(function(data) {
					
					scope.waterDays = []; 
					
					for (var i = 0; i < data.consumption.length; i++) {
						
						var dayIndex = -1;
						for (var j = 0; j < scope.waterDays.length; j++) {
							
							if (scope.waterDays[j] != null && scope.waterDays[j].date == data.consumption[i].date) {
								dayIndex = j;
								break;
							}
						}
						
						if (dayIndex == -1) scope.waterDays.push({date: data.consumption[i].date, amount: data.consumption[i].amount});
						else scope.waterDays[dayIndex].amount += data.consumption[i].amount;
					}

					DietService.getWaterConsumptionGoal().success(function(data) {
						
						scope.waterConsumptionGoal = data.amount;
						
						$timeout(scope.buildWaterGraph, 500);
					});
					
				});
				
			}
			
			/**
			 * Retrieves the max water consumption in the provided days
			 */
			scope.getMaxWaterConsumption = function(days) {
				
				var maxWC = 1;
				for (var i = 0; i < days.length; i++) {
					
					if (days[i].amount > maxWC) {
						
						maxWC = days[i].amount;
					}
				}
				
				return maxWC;
			}
			
			/**
			 * Creates the bars related to the water info that has been loaded
			 */
			scope.buildWaterGraph = function() {
				
				var containerWidth = document.querySelector('.water-graph-container').offsetWidth;
				
				var barGutter = 2;
				var waterBarWidth = $mdMedia('gt-md') ? '24px' : '12px';
				
				var maxBarHeight = document.querySelector('toto-health-fitness').offsetHeight / 3.5;
				var maxWC = scope.getMaxWaterConsumption(scope.waterDays);
				var heightRatio = maxBarHeight / scope.waterConsumptionGoal;
				var barWidth = containerWidth / 7 - barGutter * 2;
				
				for (var i = 0; i < scope.waterDays.length; i++) {
					
					var day = scope.waterDays[i];
					var element = document.getElementById('water-day-' + day.date);
					var elementWaterGoal = document.getElementById('water-goal-' + day.date);
					
					element.style.left = barGutter + (i * (barWidth + 2 * barGutter)) + 'px';
					element.style.width = waterBarWidth;
					
					elementWaterGoal.style.width = waterBarWidth;
					elementWaterGoal.style.display = 'none';
					elementWaterGoal.style.height = scope.waterConsumptionGoal * heightRatio + 'px';
					elementWaterGoal.style.left = barGutter + (i * (barWidth + 2 * barGutter)) + 'px';
					
					scope.animateBar(element, day.amount * heightRatio);
					scope.delayAppear(elementWaterGoal, 800);
				}
			}
			
			/**
			 * Creates the animation that makes the bar go from height 0 to the target height.
			 */
			scope.animateBar = function(element, targetHeight) {
				
				if (targetHeight == 0) return;
				
				if (scope.intervals == null) scope.intervals = {};
				
				scope.intervals[element.id] = $interval(function() {
					
					var currentHeight = element.offsetHeight;
					
					currentHeight += 2; 
					
					element.style.height= currentHeight + 'px';
					
					if (currentHeight >= targetHeight) {
						currentHeight = targetHeight;
						$interval.cancel(scope.intervals[element.id]);
					}
					
				}, 10);
				
			}
			
			/**
			 * Delays the appearance of the given element. The element must be in display: none and will be turned
			 * after the specified delay into display: block
			 */
			scope.delayAppear = function(element, delayInMs) {
				
				$timeout(function() {element.style.display = 'block';}, delayInMs);
				
			}
			
			scope.init = function() {

				if (googleIdToken == null) {
					$timeout(scope.init, 100);
					return;
				}
				
				scope.loadGymData();
				scope.loadWaterData();
			}
			
			scope.init();
		}
	};
} ]);


