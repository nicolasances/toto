
var SpendingScreenDirectivesModule = angular.module('SpendingScreenDirectivesModule', [ 'expensesServiceModule', 'CardServiceModule' ]);

/**
 * Directive that shows the Spending Screen
 * 
 * Accepts the following parameters:
 * 
 *  - currency 	: 	(optional) the currency code to be used. EUR, DKK, ..
 *  
 */
SpendingScreenDirectivesModule.directive('spendingScreen', [ '$timeout', '$mdMedia', 'expensesService', 'CardService', function($timeout, $mdMedia, expensesService, CardService) {
	
	return {
		progress : {},
		scope : {
		},
		templateUrl : 'modules/screens/spending-screen.html',
		link : function(scope, el) {
			
			el[0].classList.add('layout-column');
			el[0].classList.add('flex');
			
			var currentYearMonth = expensesService.getCurrentMonth();
			
			var currentMonth = moment(currentYearMonth + '01', 'YYYYMMDD').format('MMMM');
			var currentYear = moment(currentYearMonth + '01', 'YYYYMMDD').format('YY');
			
			document.querySelector('spending-screen #month').innerHTML = currentMonth + ' \'' + currentYear;
			
			var swiperContainer = document.querySelector('spending-screen .swiper-container');
			swiperContainer.style.width = el[0].offsetWidth + 'px';
			
			var mySwiper;
			
			/**
			 * Creates a new slide with the specified amount
			 */
			var createSlide = function(amount, cardAmount) {
				
				return '' + 
				'<div class="swiper-slide layout-column">' + 
				'	<div class="flex"></div>' + 
				'	<div class="layout-row">' + 
				'		<div class="flex"></div>' + 
				'		<expenses-total class="layout-column">' +
				'			<div class="flex"></div>' +
				'			<div class="text layout-row">' +
				'				<div class="flex"></div>' +
				'				<div class="currency layout-column">' +
				'					<div class="flex"></div>' +
				'					<span>&euro;</span>' +
				'					<div class="flex"></div>' +
				'				</div>' +
				'				<div class="amount">' + amount + '</div>' +
				'				<div class="flex"></div>' +
				'			</div>' +
				'			<div class="flex"></div>' +
				'		</expenses-total>' + 
				'		<div class="flex"></div>' + 
				'	</div>' + 
				'	<div class="flex"></div>' + 
				'	<div class="layout-row">' + 
				'		<div class="flex"></div>' + 
				'		<card-total class="layout-column">' +
				'			<div class="flex"></div>' +
				'			<div class="text layout-row">' +
				'				<div class="flex"></div>' +
				'				<div class="currency layout-column">' +
				'					<div class="flex"></div>' +
				'					<span>&euro;</span>' +
				'					<div class="flex"></div>' +
				'				</div>' +
				'				<div class="amount">' + cardAmount + '</div>' +
				'				<div class="flex"></div>' +
				'			</div>' +
				'			<div class="flex"></div>' +
				'		</card-total>' + 
				'		<div class="flex"></div>' + 
				'	</div>' + 
				'	<div class="flex"></div>' + 
				'</div>';
			}
			
			/**
			 * Loads more months
			 */
			var loadMore = function(numOfMonthsToLoad, startYearMonth) {
				
				for (var i = 0; i < numOfMonthsToLoad; i++) {
					
					var ym = moment(startYearMonth + '01', 'YYYYMMDD').subtract(i+1, 'months').format('YYYYMM');
					
					expensesService.getMonthTotal(scope.currency, ym).success(function(data) {
						
						var amount = parseFloat(data.total.toFixed(1)).toLocaleString('en');
						
						CardService.getCards().success(function(data) {
							
							if (data.cards == null) return;
							
							CardService.getExpensesTotal(data.cards[0].id, ym).then(function(total) {
								
								var cardAmount = parseFloat(total.toFixed(1)).toLocaleString('en');
								
								mySwiper.prependSlide(createSlide(amount, cardAmount));
							});
						});
					});
					
				}
				
			}
			
			$timeout(function() {
				
				mySwiper = new Swiper ('spending-screen .swiper-container', {
					loop: false,
					on: {
						init: function() {
							
							loadMore(1, currentYearMonth);
							
						},
						slidePrevTransitionEnd: function() {
							
							currentYearMonth = moment(currentYearMonth + '01', 'YYYYMMDD').subtract(1, 'months').format('YYYYMM');
							
							currentMonth = moment(currentYearMonth + '01', 'YYYYMMDD').format('MMMM');
							currentYear = moment(currentYearMonth + '01', 'YYYYMMDD').format('YY');
							
							document.querySelector('spending-screen #month').innerHTML = currentMonth + ' \'' + currentYear;

							if (this.isBeginning) loadMore(1, currentYearMonth);
							
						},
						slideNextTransitionEnd: function() {
							
							currentYearMonth = moment(currentYearMonth + '01', 'YYYYMMDD').add(1, 'months').format('YYYYMM');
							
							currentMonth = moment(currentYearMonth + '01', 'YYYYMMDD').format('MMMM');
							currentYear = moment(currentYearMonth + '01', 'YYYYMMDD').format('YY');
							
							document.querySelector('spending-screen #month').innerHTML = currentMonth + ' \'' + currentYear;
						},
						reachBeginning: function() {
						}
					}
				});
			}, 500);
			
		}
	};
} ]);
