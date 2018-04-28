
var NutritionScreenDirectivesModule = angular.module('NutritionScreenDirectivesModule', [ 'GymServiceModule' ]);

/**
 * Directive that shows the Nutrition Screen. 
 * 
 * Params: 
 * 
 *  - theme 		: can be 'light' or 'dark' - default is light
 *  - showPoints	: shows the line points. Can be 'true' or 'false' - default 'false' 
 * 
 */
NutritionScreenDirectivesModule.directive('nutritionScreen', [ '$timeout', '$mdMedia', 'DietService', '$rootScope', '$compile', function($timeout, $mdMedia, DietService, $rootScope, $compile) {
	
	return {
		progress : {},
		scope : {
			theme: '@',
			showPoints: '@'
		},
		templateUrl : 'modules/screens/nutrition-screen.html',
		link : function(scope, el) {
			
			el[0].classList.add('layout-column');
			el[0].classList.add('flex');
			
			// Set defaults
			if (scope.theme == null) scope.theme = 'light';
			if (scope.showPoints == null) scope.showPoints = 'false';
			
			scope.carbsFilter = true;
			scope.proteinsFilter = true;
			scope.fatsFilter = true;

			// Main variables
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
			
			// Colors and sizes of graph
			var proteinColor = scope.theme == 'dark' ? '#64DD17' : '#00796B';
			var carbColor = scope.theme == 'dark' ? '#EF5350' : '#D32F2F';
			var fatColor = scope.theme == 'dark' ? '#DCE775' : '#AFB42B';
			var caloriesColorRange = scope.theme == 'dark' ? ['#00737d', '#006064'] : ['#B2EBF2', '#18d5ec'];
			var macroLineStrokeWidth = 2;
			
			scope.ngraphFilter = null;

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
			
			scope.filterNutritionGraph = function(filter) {
				
				if (filter == 'carbs') scope.carbsFilter = !scope.carbsFilter;
				if (filter == 'proteins') scope.proteinsFilter = !scope.proteinsFilter;
				if (filter == 'fats') scope.fatsFilter = !scope.fatsFilter;
				
				var proteinPoints = document.querySelectorAll('.proteinPoint');
				var carbPoints = document.querySelectorAll('.carbPoint');
				var fatPoints = document.querySelectorAll('.fatPoint');
				
				if (!scope.proteinsFilter) {
					document.querySelector('path#proteinLine').style.stroke = 'none';
					for (var i = 0; i < proteinPoints.length; i++) {
						proteinPoints[i].style.fill = 'none';
					}
				}
				else {
					document.querySelector('path#proteinLine').style.stroke = proteinColor;
					if (scope.showPoints == 'true') {
						for (var i = 0; i < proteinPoints.length; i++) {
							proteinPoints[i].style.fill = proteinColor;
						}
					}
				}
				
				if (!scope.carbsFilter) {
					document.querySelector('path#carbsLine').style.stroke = 'none';
					for (var i = 0; i < carbPoints.length; i++) {
						carbPoints[i].style.fill = 'none';
					}
				}
				else {
					document.querySelector('path#carbsLine').style.stroke = carbColor;
					if (scope.showPoints == 'true') {
						for (var i = 0; i < carbPoints.length; i++) {
							carbPoints[i].style.fill = carbColor;
						}
					}
				}
				
				if (!scope.fatsFilter) {
					document.querySelector('path#fatsLine').style.stroke = 'none';
					for (var i = 0; i < fatPoints.length; i++) {
						fatPoints[i].style.fill = 'none';
					}
				}
				else {
					document.querySelector('path#fatsLine').style.stroke = fatColor;
					if (scope.showPoints == 'true') {
						for (var i = 0; i < fatPoints.length; i++) {
							fatPoints[i].style.fill = fatColor;
						}
					}
				}

			}
			
			/**
			 * Create the nutrition graph slide
			 */
			var createNutritionGraphSlide = function() {
				
				// Create the slide
				var slide = '' + 
				'<div class="swiper-slide layout-column">' + 
				'	<div class="flex"></div>' + 
				'	<div class="nutrition-graph-container"></div> ' +
				'	<div class="filters-container layout-row"> ' +
				'		<div class="flex"></div>' +
				'		<div ng-class="[\'filter-container\', carbsFilter ? \'selected\' : \'\', \'layout-column\']" ng-click="filterNutritionGraph(\'carbs\')"> ' +
				'			<div flex></div>' + 			
				'			<md-icon md-svg-src="images/svg/carbs.svg"></md-icon>' + 
				'			<div flex></div>' + 			
				'		</div>' +
				'		<div ng-class="[\'filter-container\', proteinsFilter ? \'selected\' : \'\', \'layout-column\']" ng-click="filterNutritionGraph(\'proteins\')"> ' +
				'			<div flex></div>' + 			
				'			<md-icon md-svg-src="images/svg/proteins.svg"></md-icon>' + 
				'			<div flex></div>' + 			
				'		</div>' +
				'		<div ng-class="[\'filter-container\', fatsFilter ? \'selected\' : \'\', \'layout-column\']" ng-click="filterNutritionGraph(\'fats\')"> ' +
				'			<div flex></div>' + 			
				'			<md-icon md-svg-src="images/svg/body-fat.svg"></md-icon>' + 
				'			<div flex></div>' + 			
				'		</div>' +
				'		<div class="flex"></div>' +
				'	</div>' + 
				' 	<div class="flex"></div>' + 
				'</div>'
				;
				
				var compiledSlide = $compile(slide)(scope);

				// Get the data
				var weeks = 4;
				var dateFrom = moment().subtract(weeks, 'weeks').format('YYYYMMDD');
				var mealsStats = new Map();
				
				DietService.getMeals(null, dateFrom).success(function(data) {
					
					// Get the data in the right format
					for (var i = 0; i < data.meals.length; i++) {

						var stat = mealsStats.get(data.meals[i].date);
						
						if (stat == null) mealsStats.set(data.meals[i].date, {date: data.meals[i].date, calories: data.meals[i].calories, proteins: data.meals[i].proteins, carbs: data.meals[i].carbs, fats: data.meals[i].fat});
						else {
							stat.calories += data.meals[i].calories;
							stat.proteins += data.meals[i].proteins;
							stat.carbs += data.meals[i].carbs;
							stat.fats += data.meals[i].fat;
						}
					}
					
					// Draw the graph
					createNutritionGraph(mealsStats);
					
				});
				
				nutrSwiperV.prependSlide(compiledSlide);
			}
			
			/**
			 * Creates the nutrition graph
			 */
			var createNutritionGraph = function(mealsStats) {

				var data = [];
				for (let item of mealsStats.values()) {
					data.push(item);
				}
				
				var container = document.querySelector('nutrition-screen .swiper-slide .nutrition-graph-container');
				container.style.height = '340px';
				
				var height = container.offsetHeight;
				var width = container.offsetWidth;
				
				var macroCircleR = 2;
				
				x = d3.scaleBand().range([24, width - 24]).padding(0.1);
				y = d3.scaleLinear().range([0, height]);
				proteinY = d3.scaleLinear().range([0 + macroCircleR, height - macroCircleR]);
				carbsY = d3.scaleLinear().range([0 + macroCircleR, height - macroCircleR]);
				fatsY = d3.scaleLinear().range([0 + macroCircleR, height - macroCircleR]);
				colorScale = d3.scaleLinear().domain([0, data.length]).range(caloriesColorRange);
				
				x.domain(data.map(function(d) { return d.date; }));
				y.domain([0, d3.max(data, function(d) { return d.calories; })]);
				proteinY.domain([0, d3.max(data, function(d) { return d.proteins; })]);
				carbsY.domain([0, d3.max(data, function(d) { return d.carbs; })]);
				fatsY.domain([0, d3.max(data, function(d) { return d.carbs; })]);
				
				proteinLine = d3.line()
						.x(function(d, i) { return x(d.date) + x.bandwidth() / 2; })
						.y(function(d) { return height - proteinY(d.proteins); })
						.curve(d3.curveCardinal);
				
				carbsLine = d3.line()
						.x(function(d, i) { return x(d.date) + x.bandwidth() / 2; })
						.y(function(d) { return height - proteinY(d.carbs); })
						.curve(d3.curveCardinal);
				
				fatsLine = d3.line()
						.x(function(d, i) { return x(d.date) + x.bandwidth() / 2; })
						.y(function(d) { return height - proteinY(d.fats); })
						.curve(d3.curveCardinal);


				svg = d3.select('nutrition-screen .swiper-slide .nutrition-graph-container').append('svg')
						.attr('width', container.offsetWidth)
						.attr('height', container.offsetHeight);
		
				g = svg.append('g');
				
				g.selectAll('.bar').data(data).enter().append('rect')
						.style('fill', function(d, i) {return colorScale(i);})
						.attr('class', 'bar')
						.attr('x', function(d) {return x(d.date);})
						.attr('width', x.bandwidth())
						.attr('y', function(d) {return height - y(d.calories);})
						.attr('height', function(d) {return y(d.calories); });
				
				g.selectAll('.proteinPoint').data(data).enter().append('circle')
						.style('fill', scope.showPoints == 'true' ? proteinColor : 'transparent')
						.attr('class', 'proteinPoint')
						.attr('cx', function(d) {return x(d.date) + x.bandwidth() / 2;})
						.attr('cy', function(d) {return height - proteinY(d.proteins);})
						.attr('r', macroCircleR);
				
				g.selectAll('.carbPoint').data(data).enter().append('circle')
						.style('fill', scope.showPoints == 'true' ? carbColor : 'transparent')
						.attr('class', 'carbPoint')
						.attr('cx', function(d) {return x(d.date) + x.bandwidth() / 2;})
						.attr('cy', function(d) {return height - proteinY(d.carbs);})
						.attr('r', macroCircleR);
				
				g.selectAll('.fatPoint').data(data).enter().append('circle')
						.style('fill', scope.showPoints == 'true' ? fatColor : 'transparent')
						.attr('class', 'fatPoint')
						.attr('cx', function(d) {return x(d.date) + x.bandwidth() / 2;})
						.attr('cy', function(d) {return height - proteinY(d.fats);})
						.attr('r', macroCircleR);
				
				g.append('path').datum(data)
						.style('fill', 'none')
						.style('stroke', proteinColor)
						.style('stroke-width', macroLineStrokeWidth)
						.attr('id', 'proteinLine')
						.attr('d', proteinLine);
				
				g.append('path').datum(data)
						.style('fill', 'none')
						.style('stroke', carbColor)
						.style('stroke-width', macroLineStrokeWidth)
						.attr('id', 'carbsLine')
						.attr('d', carbsLine);
				
				g.append('path').datum(data)
						.style('fill', 'none')
						.style('stroke', fatColor)
						.style('stroke-width', macroLineStrokeWidth)
						.attr('id', 'fatsLine')
						.attr('d', fatsLine);
		
			}
			

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
				
				nutrSwiperV = new Swiper ('nutrition-screen .swiper-container-v', {
					loop: false,
					direction: 'vertical',
					initialSlide: 1
				});
				
				nutrSwiper = new Swiper ('nutrition-screen .swiper-container-h', {
					loop: false,
					on: {
						init: function() {
							
							loadMore(1, currentDay);
							createNutritionGraphSlide();
							
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
			
			var goToFoods = function() {
				$rootScope.go('/diet/foods');
			}
			
			/**
			 * Build the menus
			 */
			scope.menus = [{icon: 'images/svg/served-food.svg', action: addMeal},
			               {icon: 'images/svg/eat.svg', action: goToMeals},
			               {icon: 'images/svg/groceries-bag.svg', action: goToFoods}];
		}
	};
} ]);
