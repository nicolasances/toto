var housekeepingModule = angular.module("housekeepingModule", []);

housekeepingModule.controller("housekeepingController", [ '$rootScope', '$scope', '$http', '$timeout', 'calendarService', function($rootScope, $scope, $http, $timeout, calendarService) {

	/**
	 * Refreshes the view
	 */
	$scope.refresh = function() {

		$scope.initContext();

		$scope.getDueAmount();
		$scope.getUnpaiedDays();

	}

	/**
	 * Prepares the context object
	 */
	$scope.initContext = function() {
		
		$rootScope.currentMenu = 'Housekeeping schedule';

		$scope.focusedMonth = calendarService.generateCalendar();
		$scope.daysOfWeekLabels = calendarService.generateWeekDays();
		
		$scope.housekeepingContext = new Object();
		$scope.housekeepingContext.due = 0;
		$scope.housekeepingContext.unpaiedDays = new Array();
		$scope.housekeepingContext.month = new Array();
		$scope.housekeepingContext.week = new Object();
		$scope.housekeepingContext.showMonthBody = false;
		$scope.housekeepingContext.showCustomDate = false;

	}
	
	$scope.backOneMonth = function() {
		calendarService.backOneMonth();
		$scope.getUnpaiedDays();
	}
	$scope.forwardOneMonth = function() {
		calendarService.forwardOneMonth();
		$scope.getUnpaiedDays();
	}
	
	/**
	 * Retrieves the due amount for the housekeeping unpaied days
	 */
	$scope.getDueAmount = function() {

		$http.get("https://" + microservicesUrl + "/housekeeping/due").success(function(data, status, header, config) {

			$scope.housekeepingContext.due = data.amount;

		});

	}

	/**
	 * Recupera le giornate non pagate alla donna delle pulizie
	 */
	$scope.getUnpaiedDays = function() {

		$http.get("https://" + microservicesUrl + "/housekeeping/unpaied-days").success(function(data, status, header, config) {

			$scope.housekeepingContext.unpaiedDays = data.days;
			
			console.log($scope.housekeepingContext.unpaiedDays);
			
			var i;
			var pinnedDays = [];
			for (i = 0; i < $scope.housekeepingContext.unpaiedDays.length; i++) {
				
				var calendarDay = moment($scope.housekeepingContext.unpaiedDays[i], 'DD/MM/YYYY').format('DD/MM/YYYY');
				
				pinnedDays.push(calendarDay);
			}
			
			calendarService.setPinnedDays(pinnedDays);
			$scope.focusedMonth = calendarService.generateCalendar();

		});

	}

	/**
	 * Indica se nel giorno passato è passata la donna delle pulizie
	 */
	$scope.isPinned = function(day) {

		if ($scope.housekeepingContext.unpaiedDays == null || $scope.housekeepingContext.unpaiedDays.length == 0) return false;

		var i;
		for (i = 0; i < $scope.housekeepingContext.unpaiedDays.length; i++) {

			if (day == $scope.housekeepingContext.unpaiedDays[i]) return true;

		}

		return false;

	}

	$scope.pinDate = function(day) {
		
		day.pinning = true;
		
		if (day.pinned) {
			$scope.unpinDate(day);
			return;
		}
		
		data = new Object();
		data.date = moment(day.day + "/" + day.month + "/" + day.year, "D/M/YYYY").format("DD/MM/YYYY");
		
		$http.post("https://" + microservicesUrl + "/housekeeping/unpaied-days", data).success(function(data, status, header, config) {
			
			day.pinning = false;
			
			$scope.refresh();

		});

	}

	/**
	 * Unpins the specified day. Day is the object added to the calendar (with
	 * propeties day, month, year, etc.)
	 */
	$scope.unpinDate = function(day) {
		
		date = moment(day.day + "-" + day.month + "-" + day.year, 'D-M-YYYY').format('DD-MM-YYYY');

		$http.delete("https://" + microservicesUrl + "/housekeeping/unpaied-days/" + date).success(function(data, status, header, config) {
			
			day.pinning = false;

			$scope.refresh();

		});

		
	}
	
	/**
	 * Pins a specific date object
	 */
	$scope.pinCustomDate = function(date) {
		$scope.pinDay(moment(date).format('DD/MM/YYYY'));
	}

	/**
	 * Pin today as a day where I've been training with the personal trainer.
	 */
	$scope.pinToday = function() {

		day = new Object();
		day.day = moment().format('D');
		day.month = moment().format('M');
		day.year = moment().format('YYYY');

		$scope.pinDate(day);

	}

	/**
	 * Pin today as the day I paied the cleaning lady
	 */
	$scope.pinPayday = function() {

		data = new Object();
		data.date = moment().format('DD/MM/YYYY');

		$http.post("https://" + microservicesUrl + "/housekeeping/paydays", data).success(function(data, status, header, config) {

			$scope.refresh();

		});

	}

	$scope.toggleMonthBody = function() {
		$scope.housekeepingContext.showMonthBody = !$scope.housekeepingContext.showMonthBody;
	}

	$scope.refresh();

} ]);