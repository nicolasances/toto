/*
 * This JS module provide services to manage calendars
 */
var calendarServiceModule = angular.module('calendarServiceModule', []);

calendarServiceModule.factory('calendarService', [ '$http', function($http) {

	var calendarService = {
			
		pinnedDays: [],
			
		focusedMonth: {
			month: moment().format('MMMM'),
			year: moment().format('YYYY'), 
			yearMonth: moment().format('YYYYMM')
		},
		
		/**
		 * Generate labels (mo, tu, ...) for the days of the week
		 */
		generateWeekDays : function() {

			var daysOfWeekLabels = new Array();

			cur = moment().startOf('week').add(1, 'days'); // to start on
															// monday

			do {

				daysOfWeekLabels.push(cur.format('dd'));

				cur.add(1, 'days');

			}
			while (cur.format('d') != 1);

			return daysOfWeekLabels;
		},

		/**
		 * Generates the month calendar, with all the month day and empty days
		 * for the last days of the last month that are part of the first week
		 * of this month
		 */
		generateCalendar : function() {
			
			current = moment('01/' + this.focusedMonth.month + '/' + this.focusedMonth.year, 'DD/MMMM/YYYY').startOf('week').add(1, 'days');
			
			// if sunday
			if (current.format('d') == 0 && current.format('MMMM') == this.focusedMonth.month) current = current.subtract(6, 'days');

			this.focusedMonth.days = new Array();

			while (current.format('MMMM') != this.focusedMonth.month) {

				this.focusedMonth.days.push({
					day : current.format('D'),
					month : current.format('M'),
					year : current.format('YYYY'),
					current : false
				});

				current.add(1, 'd');
			}

			do {

				this.focusedMonth.days.push({
					day : current.format('D'),
					month : current.format('M'),
					year : current.format('YYYY'),
					current : true,
					pinning : false,
					pinned : this.isPinned(current.format('DD/MM/YYYY')),
					today : current.format('D') == moment().format('D')
				});

				current.add(1, 'd');

			}
			while (current.format('MMMM') == this.focusedMonth.month);

			return this.focusedMonth;

		},
		
		/**
		 * Moves forward one month
		 */
		forwardOneMonth: function() {
			
			lastMonth = moment('01/' + this.focusedMonth.month + '/' + this.focusedMonth.year, 'DD/MMMM/YYYY').add(1, 'months');

			this.focusedMonth.month = lastMonth.format('MMMM');
			this.focusedMonth.year = lastMonth.format('YYYY');
			this.focusedMonth.yearMonth = lastMonth.format('YYYYMM');
			
		},
		
		/**
		 * Goes back one month
		 */
		backOneMonth: function() {
			
			lastMonth = moment('01/' + this.focusedMonth.month + '/' + this.focusedMonth.year, 'DD/MMMM/YYYY').subtract(1, 'months');

			this.focusedMonth.month = lastMonth.format('MMMM');
			this.focusedMonth.year = lastMonth.format('YYYY');
			this.focusedMonth.yearMonth = lastMonth.format('YYYYMM');
			
		},

		/**
		 * Indica se il giorno è pinned
		 */
		isPinned: function(day) {
			
			if (this.pinnedDays == null || this.pinnedDays.length == 0) return false;

			for (i = 0; i < this.pinnedDays.length; i++) {

				if (day == this.pinnedDays[i]) return true;

			}

			return false;

		},
		
		/**
		 * Sets the days to be pinned
		 */
		setPinnedDays: function(days) {
			
			this.pinnedDays = days;
		}, 
		
		/**
		 * Provides the list of weekends of a specified timeframe
		 * @parm numberOfWeekends to be returned
		 */
		getWeekends: function(numberOfWeekends) {
			
			var weekends = new Array();
			
			var cursor = moment();
			while (weekends.length < numberOfWeekends) {
				
				cursor = cursor.add(1, 'd');

				if (cursor.day() == 6) {
					d = new Date(cursor);
					d.setHours(0,0,0,0);
					weekends.push(d);
				}
			}
			
			return weekends;
			
		}

	};

	return calendarService;

} ]);
