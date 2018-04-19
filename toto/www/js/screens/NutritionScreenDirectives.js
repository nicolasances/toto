
var NutritionScreenDirectivesModule = angular.module('NutritionScreenDirectivesModule', [ 'GymServiceModule' ]);

/**
 * Directive that shows the Nutrition Screen
 * 
 */
NutritionScreenDirectivesModule.directive('nutritionScreen', [ '$timeout', '$mdMedia', 'DietService', '$rootScope', function($timeout, $mdMedia, DietService, $rootScope) {
	
	return {
		progress : {},
		scope : {
		},
		templateUrl : 'modules/screens/nutrition-screen.html',
		link : function(scope, el) {
			
			el[0].classList.add('layout-column');
			el[0].classList.add('flex');
			
			var currentDay = moment();
			
			var swiperContainerH = document.querySelector('nutrition-screen .swiper-container-h');
			var swiperContainerV = document.querySelector('nutrition-screen .swiper-container-v');
			swiperContainerH.style.width = el[0].offsetWidth + 'px';
			swiperContainerV.style.width = el[0].offsetWidth + 'px';
			
			document.querySelector('nutrition-screen #day').innerHTML = currentDay.format('dddd') + ' ' + currentDay.format('DD') + ' ' + currentDay.format('MMM');
			
			var nutrSwiper;
			var waterGoal = 0;
			var slidesData = [];
			var currentSlideIndex = -1;

			/**
			 * Adds a meal
			 */
			var addMeal = function() {
				
				DietService.showAddMealDialog(function(meal) {DietService.postMeal(meal).success(function(data) {
					scope.onRefresh();
				})});
			}
			
			/**
			 * Retrieve the water consumption goal
			 */
			DietService.getWaterConsumptionGoal().success(function(data) {
				waterGoal = data.amount;
			});
			

			/**
			 * Creates a new slide for the specified day
			 */
			var createSlide = function(macronutrients) {
				
				slidesData.push(macronutrients);
				
				return '' + 
				'<div class="swiper-slide layout-column">' + 
				'	<div class="flex"></div>' +
				'	<div class="layout-column">' +
				'' +
				'		<diet-week-macronutrients> ' + 
				'			<div class="layout-column" style="outline: none;">' +
				'				<div class="line layout-row">' +
				'					<div class="flex"></div>' +
				'					<div class="nutrient-container layout-column">' +
				'						<div class="circle big layout-column">' +
				'							<div class="flex"></div>' +
				'							<div class="text">' + macronutrients.calories + '</div>' +
				'							<div class="unit flex" >cal</div>' +
				'						</div>' +
				'					</div>' +
				'					<div class="flex"></div>' +
				'				</div>' +
				'				' +
				'				<div class="line layout-row">' +
				'					<div class="flex"></div>' +
				'					<div class="nutrient-container layout-column">' +
				'						<div class="circle layout-column">' +
				'							<div class="flex"></div>' +
				'							<div class="text">' + macronutrients.carbs + '</div>' +
				'							<div class="unit flex">gr</div>' +
				'						</div>' +
				'						<div class="layout-row">' +
				'							<div class="flex"></div>' +
				'							<img src="images/svg/carbs.svg"></img>' +
				'							<div class="flex"></div>' +
				'						</div>' +
				'					</div>' +
				'					<div class="nutrient-container layout-column">' +
				'						<div class="circle layout-column">' +
				'							<div class="flex"></div>' +
				'							<div class="text">' + macronutrients.proteins + '</div>' +
				'							<div class="unit flex">gr</div>' +
				'						</div>' +
				'						<div class="layout-row">' +
				'							<div class="flex"></div>' +
				'							<img src="images/svg/proteins.svg"></img>' +
				'							<div class="flex"></div>' +
				'						</div>' +
				'					</div>' +
				'					<div class="nutrient-container layout-column">' +
				'						<div class="circle layout-column">' +
				'							<div class="flex"></div>' +
				'							<div class="text">' + macronutrients.fats + '</div>' +
				'							<div class="unit flex">gr</div>' +
				'						</div>' +
				'						<div class="layout-row">' +
				'							<div class="flex"></div>' +
				'							<img src="images/svg/body-fat.svg"></img>' +
				'							<div class="flex"></div>' +
				'						</div>' +
				'					</div>' +
				'					<div class="flex"></div>' +
				'				</div>' +
				'				<div class="line layout-row">' +
				'					<div class="flex"></div>' +
				'					<div class="nutrient-container layout-column">' +
				'						<div id="water" class="circle layout-column">' +
				'							<div class="flex"></div>' +
				'							<div class="text">' + (macronutrients.water / 1000).toFixed(2) + '</div>' +
				'							<div class="unit flex">&#8467;</div>' +
				'						</div>' +
				'						<div class="layout-row">' +
				'							<div class="flex"></div>' +
				'							<img src="images/svg/water-drop.svg"></img>' +
				'							<div class="flex"></div>' +
				'						</div>' +
				'					</div>' +
				'					<div class="flex"></div>' +
				'				</div>' +
				'			</div>' +
				' 		</diet-week-macronutrients>' +
				'	</div>' +
				'	<div class="flex"></div>' +
				'</div>';
			}
			
			/**
			 * Loads more days
			 */
			var loadMore = function(numOfDaysToLoad, startDay) {
				
				for (var i = 0; i < numOfDaysToLoad; i++) {
					
					var day = moment(startDay).subtract(i+1, 'days');

					DietService.getMeals(day.format('YYYYMMDD')).success(function(data) {
						
						var cal = 0;
						var carbs = 0;
						var proteins = 0;
						var fats = 0;
						
						if (data == null) return;
						
						for (var i = 0; i < data.meals.length; i++) {
							
							cal += data.meals[i].calories;
							carbs += data.meals[i].carbs;
							fats += data.meals[i].fat;
							proteins += data.meals[i].proteins;
						}
						
						DietService.getWaterConsumption(day.format('YYYYMMDD')).success(function(water) {
							
							nutrSwiper.prependSlide(createSlide({
								calories: cal.toFixed(0), 
								carbs: carbs.toFixed(0), 
								fats: fats.toFixed(0), 
								proteins: proteins.toFixed(0), 
								water: water.total
							}));
						});
					});
					
				}
				
			}

			/**
			 * Function to animate the arc being drawn
			 */
			var arcTween = function(waterArch, target) {
				
			    return function(d) {
			    	var interpolate = d3.interpolate(0, target);
			
			    	return function(t) {
			    		
			    		waterArch.endAngle(interpolate(t));
			    		
			    		return waterArch();
			    	}
			    }
			}
			
			/**
			 * Animates the SVG in the current slide
			 */
			var animate = function() {
				
				var waterEl = document.querySelector('nutrition-screen .swiper-slide-active #water');
				waterEl.style.border = 'none';
				
				var arcGutter = 0.01 * 2 * Math.PI;
				
				var waterArch;
				waterArch = d3.arc().innerRadius(waterEl.offsetWidth/2 - 4).outerRadius(waterEl.offsetWidth/2).startAngle(0 + arcGutter).endAngle(slidesData[currentSlideIndex].water * 2 * Math.PI / waterGoal);
				waterBaseArc = d3.arc().innerRadius(waterEl.offsetWidth/2 - 4).outerRadius(waterEl.offsetWidth/2).startAngle(arcGutter + slidesData[currentSlideIndex].water * 2 * Math.PI / waterGoal).endAngle(2 * Math.PI);
				
				svg = d3.select('nutrition-screen .swiper-slide-active #water').append('svg')
						.attr('width', waterEl.offsetWidth)
						.attr('height', waterEl.offsetHeight)
						.style('position', 'absolute')
		
				g = svg.append('g');
				
				g.append('path')
						.attr('fill', function(d) {return '#64DD17';})
						.attr('transform', 'translate(' + waterEl.offsetWidth/2 + ', ' + waterEl.offsetHeight/2 + ')')
						.attr('d', waterArch)
				
				g.append('path')
						.attr('fill', function(d) {return '#B2EBF2';})
						.attr('transform', 'translate(' + waterEl.offsetWidth/2 + ', ' + waterEl.offsetHeight/2 + ')')
						.attr('d', waterBaseArc)
			}
			
			/**
			 * Create the swiper
			 */
			$timeout(function() {
				
				nutrSwiper = new Swiper ('nutrition-screen .swiper-container-v', {
					loop: false,
					direction: 'vertical',
					initialSlide: 1
				});
				
				nutrSwiper = new Swiper ('nutrition-screen .swiper-container-h', {
					loop: false,
					on: {
						init: function() {
							
							loadMore(1, currentDay);
							
						},
						slidePrevTransitionEnd: function() {
							
							currentSlideIndex++;
							
							currentDay = moment(currentDay).subtract(1, 'days');
							
							document.querySelector('nutrition-screen #day').innerHTML = currentDay.format('dddd') + ' ' + currentDay.format('DD') + ' ' + currentDay.format('MMM');
							
							animate();

							if (this.isBeginning) loadMore(1, currentDay);
							
						},
						slideNextTransitionEnd: function() {
							
							currentSlideIndex--;
							
							currentDay = moment(currentDay).add(1, 'days');
							
							document.querySelector('nutrition-screen #day').innerHTML = currentDay.format('dddd') + ' ' + currentDay.format('DD') + ' ' + currentDay.format('MMM');
						},
						reachBeginning: function() {
						}
					}
				});
			}, 300);
			
			var goToMeals = function() {
				$rootScope.go('/diet/meals');
			}
			
			/**
			 * Build the menus
			 */
			scope.menus = [{icon: 'images/svg/served-food.svg', action: addMeal},
			               {icon: 'images/svg/eat.svg', action: goToMeals}];
		}
	};
} ]);
