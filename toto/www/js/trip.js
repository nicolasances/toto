var tripModule = angular.module("tripModule", []);

tripModule.controller("tripsController", [ '$scope', '$http', '$timeout', '$mdDialog', function($scope, $http, $timeout, $mdDialog) {

	/**
	 * Prepares the context object
	 */
	$scope.initContext = function() {

		$scope.imagesServerHost = microservicesHost;
		$scope.imagesServerPort = imagesServerPort;

		$scope.refresh();
	}

	/**
	 * Refreshes the view
	 */
	$scope.refresh = function() {
		
		$scope.getTrips();
	}
	
	$scope.setGrid = function() {
		$scope.columnsGtSm = $scope.trips.length >= 4 ? 12 : ($scope.trips.length * 3);
	}
	
	$scope.getTrips = function() {
		
		$http.get(microservicesProtocol + "://" + microservicesUrl + "/trip/trips").success(function(data, status, header, config) {
			$scope.trips = data.trips;
			$scope.setGrid();
		});
	}
	
	$scope.adjustThumbnailSize = function(img) {
		
		$timeout(function() {
			
			// 1. Resize the img to fit the container
			var imgWidth = img.naturalWidth;
			var imgHeight = img.naturalHeight;
			
			var containerWidth = img.parentNode.offsetWidth;
			var containerHeight = img.parentNode.offsetHeight;
			
			var imgScale = imgHeight / imgWidth;

			var newImgHeight = imgHeight;
			var newImgWidth = imgWidth; 
			
			if (imgWidth > imgHeight) {
				newImgWidth = containerWidth;
				newImgHeight = imgScale * newImgWidth;
			}
			else {
				newImgHeight = containerHeight;
				newImgWidth = newImgHeight / imgScale;
			}
			
			img.style.width = newImgWidth + 'px';
			img.style.height = newImgHeight + 'px';
			
			// 2. Position the img centering it vertically
			var top = 0;
			
			if (newImgHeight > containerHeight) {
				top = (newImgHeight - containerHeight) / 2;
			}
			
			img.style.top = '-' + top + 'px';
			
		}, 50);
	}
	
	$scope.addTrip = function() {
		var dlg = $mdDialog.prompt().title('New Trip').placeholder('Trip\'s name').ok('Ok').cancel('Cancel');
		
		$mdDialog.show(dlg).then(function(result) {
			
			var data = {name: result};
			
			$http.post(microservicesProtocol + "://" + microservicesUrl + "/trip/trips/", data).success(function(data, status, header, config) {
				$scope.go('/trip/' + data.id);
			});
			
		});
	}
	
	$scope.initContext();

} ]);

tripModule.controller("tripController", [ '$scope', '$http', '$timeout', '$mdDialog', '$mdMedia', 'thumbnailService', '$routeParams', '$window', function($scope, $http, $timeout, $mdDialog, $mdMedia, thumbnailService, $routeParams, $window) {
	/**
	 * Prepares the context object
	 */
	$scope.initContext = function() {

		$scope.imagesServerHost = microservicesHost;
		$scope.imagesServerPort = imagesServerPort;
		$scope.selectedTab = 'itinerary';
		
		$scope.getTrip();
		$scope.getItinerary();
		$scope.getTransports();
		
		$scope.alphabet = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
		
		$scope.ideas = [];

		$scope.loadGoogleMap();
	}

	/**
	 * Refreshes the view
	 */
	$scope.refresh = function() {
		
	}
	
	/**
	 * Retrieves the persisted itinerary, if any
	 */
	$scope.getItinerary = function() {
		
		$http.get(microservicesProtocol + "://" + microservicesUrl + "/trip/trips/" + $routeParams.id + "/steps").success(function(data, status, header, config) {
    		
			$scope.intinerary = data.steps;

			if ($scope.intinerary != null) {
				for (i = 0; i < $scope.intinerary.length; i++) {
					$scope.getInterestPoints($scope.intinerary[i]);
					$scope.getHotelOfStep($scope.intinerary[i]);
				}
			}
    		
		});
	}
	
	/**
	 * Get hotel of the passed step
	 */
	$scope.getHotelOfStep = function(step) {
		
		$http.get(microservicesProtocol + "://" + microservicesUrl + "/trip/trips/" + $routeParams.id + "/steps/" + step.id + "/hotels").success(function(data, status, header, config) {

			if (data.hotels.length > 0) {
				var hotel = data.hotels[0];
				
				step.hotel = {id: hotel.id, name: hotel.name, address: hotel.address, geo: {lat: hotel.lat, lng: hotel.lng}};
				
				if ($scope.hotels == null) $scope.hotels = new Array();
				
				$scope.hotels.push({name: hotel.name, address: hotel.address, geo: {lat: hotel.lat, lng: hotel.lng}, price: hotel.price, stars: hotel.stars});
			}
			
		});
		
	}
	
	/**
	 * Loads from API the interest points associated to the provided step
	 */
	$scope.getInterestPoints = function(step) {
		
		$http.get(microservicesProtocol + "://" + microservicesUrl + "/trip/trips/" + $routeParams.id + "/steps/" + step.id + "/interestPoints").success(function(data, status, header, config) {
			
			step.interestPoints = new Array();

			for (p = 0; p < data.interestPoints.length; p++) {
				
				var interestPoint = data.interestPoints[p];
				
				// Add a marker on the map
				var marker = $scope.addMarker(interestPoint.lat, interestPoint.lng, '' + p);
				
				// Add the marker to the interest Point
				interestPoint.marker = marker;
				interestPoint.seq = p;
				
				// Add the interest point to the itinerary
				step.interestPoints.push(interestPoint);
			}
			
		});
	}
	
	/**
	 * Retrieves the transports from the backend
	 */
	$scope.getTransports = function() {
		
		$http.get(microservicesProtocol + "://" + microservicesUrl + "/trip/trips/" + $routeParams.id + "/transports").success(function(data, status, header, config) {
			
			$scope.transports = new Array();
			
			for (i = 0; i < data.transports.length; i++) {
				
				var transport = data.transports[i];
				
				$scope.transports.push({id: transport.id, way: {departure: {airport: transport.wayDepartureAirport, time: transport.wayDepartureTime}, landing: {airport: transport.wayLandingAirport, time: transport.wayLandingTime}}, returnTrip: {departure: {airport: transport.returnDepartureAirport, time: transport.returnDepartureTime}, landing: {airport: transport.returnLandingAirport, time: transport.returnLandingTime}}, price: transport.price});
			}
		});
		
	}
	
	/**
	 * Loads the trip from the backend API
	 */
	$scope.getTrip = function() {
		
		$http.get(microservicesProtocol + "://" + microservicesUrl + "/trip/trips/" + $routeParams.id).success(function(data, status, header, config) {
			$scope.trip = data;
		});
	}
	
	/**
	 * Posts the trip thumbail
	 */
	$scope.postTripThumbnail = function(inputEl) {
		
		var uploadUrl = microservicesProtocol + "://" + microservicesUrl + "/trip/trips/" + $routeParams.id + "/thumbnail";

		thumbnailService.sendThumbnail(inputEl.files[0], uploadUrl, null, function() {
			$scope.getRecipe();
		});
	}
	
	/**
	 * Creates the map when google maps is ready and downloaded
	 */
	$scope.loadGoogleMap = function() {

		$timeout(function() {
			
			if (googleMaps.ready) {
				
				if (window.matchMedia( "(min-width: 960px)" ).matches) {
					var mapdiv = document.getElementById('mapdiv');
					var mapHeight = mapdiv.parentNode.offsetHeight;
					mapdiv.style.height = mapHeight + 'px';
				}
				
				var styles = [{"featureType": "administrative.country", "elementType": "labels", "stylers": [{ "color": "#EEEEEE" }, { "visibility": "off" }]},
				        	  {"featureType": "administrative.province", "elementType": "labels", "stylers": [{ "color": "#EEEEEE" }, { "visibility": "off" }]},
				        	  {"featureType": "administrative.country", "elementType": "geometry.stroke", "stylers": [{ "color": "#9b9b9b" }]}, 
				        	  {"elementType": "labels.text.fill", stylers: [{"color": "#606060"}]}, 
				        	  {"featureType": "road", "elementType": "labels.icon", "stylers": [{"visibility": "off"}]}];
				
	        	$scope.map = new google.maps.Map(document.getElementById('mapdiv'), {
	        	    center: {lat: 45.475757, lng: 9.168083},
	        	    scrollwheel: false,
	        	    zoom: 3,
	        	    streetViewControl: false,
	        	    mapTypeControl: false
	        	});
	        	
	        	$scope.map.setOptions({styles: styles});
	        	
	        	$scope.directionsDisplay = new google.maps.DirectionsRenderer();
	        	$scope.directionsDisplay.setMap($scope.map);
	        	
	        	$scope.refreshItinerary();
	        	
	        	// Refresh markers
	        	if ($scope.intinerary != null) {
	        		for (s = 0; s < $scope.intinerary.length; s++) {
	        			var step = $scope.intinerary[s];
	        			
	        			if (step.interestPoints != null) {
	        				for (p = 0; p < step.interestPoints.length; p++) {
	        					step.interestPoints[p].marker.setMap($scope.map);
	        				}
	        			}
	        		}
	        	}
			}
			
		}, 300);
	}
	
	/**
	 * Displays the itinerary on the map
	 */
	$scope.refreshItinerary = function() {
		
		if ($scope.intinerary == null || $scope.intinerary.length == 0) return;
		
    	var waypoints = new Array();

    	for (i=0; i<$scope.intinerary.length; i++) {
    		
    		if (i != 0 && i < $scope.intinerary.length - 1) waypoints.push({location: {lat: $scope.intinerary[i].lat, lng: $scope.intinerary[i].lng}, stopover: true});
    		
    		$scope.intinerary[i].seq = $scope.getNextLetterForStep(i);
    	}

    	var request = {
    			origin: {lat: $scope.intinerary[0].lat, lng: $scope.intinerary[0].lng}, 
    			destination: {lat: $scope.intinerary[$scope.intinerary.length-1].lat, lng: $scope.intinerary[$scope.intinerary.length-1].lng},
    			waypoints: waypoints,
    			travelMode: 'DRIVING'
    	}
    	
    	var directionsService = new google.maps.DirectionsService();
    	
    	directionsService.route(request, function(result, status) {
    		if (status == "OK") {
    			$scope.directionsDisplay.setDirections(result);
    		}
    	});
	}
	
	/**
	 * Add a marker to the map
	 */
	$scope.addMarker = function(lat, lng, label) {
		return new google.maps.Marker({position: {lat: parseFloat(lat), lng:parseFloat(lng) }, map: $scope.map, label: label, animation: google.maps.Animation.DROP});
	} 
	
	/**
	 * Select the tab to open the detail. 
	 */
	$scope.toggleTabSelection = function(el) {
		
		var selected = el.classList.contains('selected');
		var sections = document.querySelectorAll('.trip .content .section');
		
		for (t=0; t<sections.length; t++) {
			
			sections[t].classList.remove('selected');
			sections[t].classList.add('unselected');
		}
		
		el.classList.add('selected');
		el.classList.remove('unselected');
		
		// Set height of section-content
		var sectionTitle = el.querySelector('.title');
		var sectionContent = el.querySelector('.section-content');
		
		var sectionTitleHeight = sectionTitle.offsetHeight;
		var sectionHeight = el.offsetHeight;
		
		var sectionContentHeight = sectionHeight - sectionTitleHeight;
		
		sectionContent.style.height = sectionContentHeight + 'px';
	}

	/**
	 * Opens the dialog to get Google location
	 */
	$scope.openGoogleSearchDlg = function(ev, step) {
		
	    var useFullScreen = window.matchMedia( "(max-width: 960px)" ).matches;
	    var dialog = {controller: DialogController, templateUrl: 'modules/util/googleMapSearchDlg.html', parent: angular.element(document.body), targetEvent: ev, clickOutsideToClose: true, fullscreen: useFullScreen};
	    
	    $mdDialog.show(dialog).then(function(answer) {
			
	    	step.name = answer.shortName;
			step.lat = answer.geo.lat;
			step.lng = answer.geo.lng;
			
			$scope.refreshItinerary();
			
	    }, function() {});
	    
	};
	
	/**
	 * Opens the dialog for editing the step
	 */
	$scope.openEditStepDlg = function(ev, step) {
		
		function DialogController($scope, $mdDialog) {
			
			$scope.step = step;
			$scope.step.dateFrom = new Date(step.dateFrom);
			$scope.step.dateTo = new Date(step.dateTo);
			
			$scope.hide = function() {$mdDialog.hide;};
			$scope.cancel = function() {$mdDialog.cancel();};
			$scope.answer = function(step) {$mdDialog.hide(step);};
			
		}
		
	    var useFullScreen = window.matchMedia( "(max-width: 960px)" ).matches;
	    var dialog = {controller: DialogController, templateUrl: 'modules/trip/editTripStepDetails.html', parent: angular.element(document.body), targetEvent: ev, clickOutsideToClose: true, fullscreen: useFullScreen};
	    
	    $mdDialog.show(dialog).then(function(answer) {

	    	step.dateFrom = answer.dateFrom;
	    	step.dateTo = answer.dateTo;
	    	step.notes = answer.notes;
	    	
	    	var update = {dateFrom: answer.dateFrom.getTime(), dateTo: answer.dateTo.getTime(), notes: answer.notes};
	    	
	    	console.log(update);
	    	
	    	$http.put(microservicesProtocol + "://" + microservicesUrl + "/trip/trips/" + $routeParams.id + "/steps/" + step.id, update).success(function(data, status, header, config) {
			});
	    	
	    }, function() {});
	}
	
	/**
	 * Calculates the total budget for the trip
	 */
	$scope.calculateTotalBudget = function() {
		
		var total = 0;

		if ($scope.hotels != null) {
			for (i = 0; i < $scope.hotels.length; i++) {
				total += parseFloat($scope.hotels[i].price);
			}
		}
		
		if ($scope.transports != null) {
			for (i = 0; i < $scope.transports.length; i++) {
				total += parseFloat($scope.transports[i].price);
			}
		}
		
		return total;
	}
	
	/**
	 * Adds a transport to the trip
	 */
	$scope.addTransport = function() {
		
		function DialogController($scope, $mdDialog) {
			
			$scope.transport = {}
			
			$scope.hide = function() {$mdDialog.hide;};
			$scope.cancel = function() {$mdDialog.cancel();};
			$scope.answer = function(transport) {$mdDialog.hide(transport);};
			
		}
		
	    var useFullScreen = window.matchMedia( "(max-width: 960px)" ).matches;
	    var dialog = {controller: DialogController, templateUrl: 'modules/trip/addTransport.html', parent: angular.element(document.body), clickOutsideToClose: true, fullscreen: useFullScreen};
	    
	    $mdDialog.show(dialog).then(function(answer) {
	    	
	    	// Add to list
	    	if ($scope.transports == null) $scope.transports = new Array();
	    	
	    	$scope.transports.push(answer);
	    	
	    	// Align backend
	    	var postData = {wayDepartureAirport: answer.way.departure.airport, wayDepartureTime: answer.way.departure.time, wayLandingAirport: answer.way.landing.airport, wayLandingTime: answer.way.landing.time, 
	    					returnDepartureAirport: answer.returnTrip.departure.airport, returnDepartureTime: answer.returnTrip.departure.time, returnLandingAirport: answer.returnTrip.landing.airport, returnLandingTime: answer.returnTrip.landing.time, 
	    					price: answer.price};
	    	
	    	$http.post(microservicesProtocol + "://" + microservicesUrl + "/trip/trips/" + $routeParams.id + "/transports", postData).success(function (data, status, header, config) {
	    		answer.id = data.id;
	    	});
	    	
	    }, function() {});
		
	}
	
	/**
	 * Opens a window to show it on google maps
	 */
	$scope.showOnGoogleMaps = function(hotel) {
		
		 $window.open('https://www.google.it/maps/place/' + hotel.address);
		
	}
	
	/**
	 * Opens the dialog for adding a hotel
	 */
	$scope.addHotel = function(ev, itinerary) {
		
		var itinerary = $scope.intinerary;
		
		function DialogController($scope, $mdDialog) {
			
			$scope.steps = itinerary;
			$scope.hotel = {};
			
			$scope.hide = function() {$mdDialog.hide;};
			$scope.cancel = function() {$mdDialog.cancel();};
			$scope.answer = function(hotel) {$mdDialog.hide(hotel);};
			
			$scope.selectStep = function(step) {$scope.hotel.selectedStep = step;}
			$scope.selectStar = function(stars) {$scope.hotel.stars = stars;}
			
		}
		
	    var useFullScreen = window.matchMedia( "(max-width: 960px)" ).matches;
	    var dialog = {controller: DialogController, templateUrl: 'modules/trip/addHotel.html', parent: angular.element(document.body), targetEvent: ev, clickOutsideToClose: true, fullscreen: useFullScreen};
	    
	    $mdDialog.show(dialog).then(function(answer) {
	    	
	    	if ($scope.hotels == null) $scope.hotels = new Array();

	    	// Add the hotel
	    	var hotel = {name: answer.name, address: answer.address, stars: answer.stars, step: answer.selectedStep, price: answer.price};
	    	hotel.step.hotel = {name: hotel.name, address: hotel.address};
	    	
	    	$scope.hotels.push(hotel);
	    	
	    	// Get geo location for hotel
	    	if (answer.address != null) {
				
				$http.get("https://maps.googleapis.com/maps/api/geocode/json?address=" + answer.address + "&key=AIzaSyA4KA2WAZ2BKf4qrAWPWvfYKen0A0p9gx4").success(function(data, status, header, config) {
					
					if (data != null && data.results != null) {
						
						hotel.geo = data.results[0].geometry.location;
						hotel.step.hotel.geo = hotel.geo;
						
						// Update backend
						var postData = {name: hotel.name, address: hotel.address, lat: hotel.geo.lat, lng: hotel.geo.lng, price: hotel.price, stars: hotel.stars};
						
						$http.post(microservicesProtocol + "://" + microservicesUrl + "/trip/trips/" + $routeParams.id + "/steps/" + hotel.step.id + "/hotels", postData).success(function(data, status, header, config) {
							hotel.id = data.id;
							hotel.step.hotel.id = data.id;
						});
						
						
					}
				});
				
	    	}
			
	    }, function() {});
	}
	
	/**
	 * Deletes a hotel from a step
	 */
	$scope.deleteHotel = function(step) {

		$http.delete(microservicesProtocol + "://" + microservicesUrl + "/trip/trips/" + $routeParams.id + "/steps/" + step.id + "/hotels/" + step.hotel.id);

		step.hotel = null;
	}
	
	/**
	 * Shows a marker on the map for the provided hotel
	 */
	$scope.showHotelOnMap = function(hotel) {
		
		if (hotel != null && hotel.marker != null) {
			$scope.hideHotelOnMap(hotel);
			return;
		}
		
		var marker = $scope.addMarker(hotel.geo.lat, hotel.geo.lng);
		
		hotel.marker = marker;
		
	}
	
	/**
	 * Hides the hotel marker on the map
	 */
	$scope.hideHotelOnMap = function(hotel) {
		hotel.marker.setMap(null);
		hotel.marker = null;
	}
	
	/**
	 * Opens the dialog for adding an idea
	 */
	$scope.addIdea = function(ev, itinerary) {
		
		var itinerary = $scope.intinerary;
		
		function DialogController($scope, $mdDialog) {
			
			$scope.steps = itinerary;
			$scope.idea = {};
			
			$scope.hide = function() {$mdDialog.hide;};
			$scope.cancel = function() {$mdDialog.cancel();};
			$scope.answer = function(idea) {$mdDialog.hide(idea);};
			
			$scope.setIdeaType = function(type) {$scope.idea.type = type;}
			
		}
		
	    var useFullScreen = window.matchMedia( "(max-width: 960px)" ).matches;
	    var dialog = {controller: DialogController, templateUrl: 'modules/trip/addIdea.html', parent: angular.element(document.body), targetEvent: ev, clickOutsideToClose: true, fullscreen: useFullScreen};
	    
	    $mdDialog.show(dialog).then(function(answer) {

	    	// TODO backend service call
	    	
	    	answer.id = '123';
	    	$scope.ideas.push(answer);
	    	
	    }, function() {});
	}
	
	/**
	 * Adds an interest point. 
	 * The interest point is associated to an itinerary step.
	 */
	$scope.addInterestPoint = function(itineraryStep) {
		
	    var useFullScreen = window.matchMedia( "(max-width: 960px)" ).matches;
	    var dialog = {controller: DialogController, templateUrl: 'modules/util/googleMapSearchDlg.html', parent: angular.element(document.body), targetEvent: null, clickOutsideToClose: true, fullscreen: useFullScreen};
	    
	    $mdDialog.show(dialog).then(function(answer) {
	    	
	    	if (itineraryStep.interestPoints == null) itineraryStep.interestPoints = new Array();
	    	
	    	// Adds a marker to the map
	    	var marker = $scope.addMarker(answer.geo.lat, answer.geo.lng, '' + itineraryStep.interestPoints.length + 1);
	    	
	    	// Adds the interst point to the step
	    	var interestPoint = {seq: itineraryStep.interestPoints.length + 1, name: answer.name, lat: answer.geo.lat, lng: answer.geo.lng, marker: marker};
	    	
	    	itineraryStep.interestPoints.push(interestPoint);
	    	
	    	// Aligns the backend
	    	var postData = {name: answer.name, lat: answer.geo.lat, lng: answer.geo.lng};
	    	
	    	$http.post(microservicesProtocol + "://" + microservicesUrl + "/trip/trips/" + $routeParams.id + "/steps/" + itineraryStep.id + "/interestPoints", postData).success(function(data, status, header, config) {
	    		interestPoint.id = data.id;
	    	});
	    	
	    }, function() {});
		
	}
	
	/**
	 * Delete an interest point from a specific step
	 */
	$scope.deleteInterestPoint = function(step, point) {
		
		for (i=0;i<step.interestPoints.length;i++) {
			if (step.interestPoints[i].name == point.name) {
				step.interestPoints.splice(i, 1);
			}
		}
		
		point.marker.setMap(null);

		$http.delete(microservicesProtocol + "://" + microservicesUrl + "/trip/trips/" + $routeParams.id + "/steps/" + step.id + "/interestPoints/" + point.id);
	}
	
	/**
	 * Deletes a specific waypoint (step)
	 */
	$scope.deleteWaypoint = function(step) {
		
		// Remove interest points and their marker
		if (step.interestPoints != null) {
			for (p = 0; p < step.interestPoints.length; p++) {
				step.interestPoints[p].marker.setMap(null);
			}
			step.interestPoints = null;
		}
		
		// Remove the hotel
		step.hotel = null;
		
		// Remove the step from the itineraryy
		for (i = 0; i < $scope.intinerary.length; i++) {
			if ($scope.intinerary[i].id == step.id) {
				$scope.intinerary.splice(i, 1);
				break;
			}
		}
		
		$scope.refreshItinerary();
		
		// Align backend
		$http.delete(microservicesProtocol + "://" + microservicesUrl + "/trip/trips/" + $routeParams.id + "/steps/" + step.id);
		
	}
	
	/**
	 * Adds a waypoint to the trip. 
	 * The waypoint is a key step of the trip and usually there's a hotel associated to it. 
	 */
	$scope.addWaypoint = function() {
		
	    var useFullScreen = window.matchMedia( "(max-width: 960px)" ).matches;
	    var dialog = {controller: DialogController, templateUrl: 'modules/util/googleMapSearchDlg.html', parent: angular.element(document.body), targetEvent: null, clickOutsideToClose: true, fullscreen: useFullScreen};
	    
	    $mdDialog.show(dialog).then(function(answer) {
	    	
	    	var step = {name: answer.name, dateFrom: new Date(), dateTo: new Date(), lat: answer.geo.lat, lng: answer.geo.lng};
	    	var postData = {name: answer.name, dateFrom: new Date(), dateTo: new Date(), lat: answer.geo.lat, lng: answer.geo.lng};

	    	$http.post(microservicesProtocol + "://" + microservicesUrl + "/trip/trips/" + $routeParams.id + "/steps", postData).success(function(data, status, header, config) {
	    		
	    		step.id = data.id;
	    		
			});
			
	    	$scope.intinerary.push(step);
	    	$scope.refreshItinerary();
	    	
	    }, function() {});
		
	}
	
	$scope.getNextLetterForStep = function(i) {
		
		return $scope.alphabet[i];
		
	}
	
	function DialogController($scope, $mdDialog) {
		$scope.cities = new Array();
		$scope.showGoogleResults = false;
		$scope.searching = false;
		$scope.hide = function() {$mdDialog.hide;};
		$scope.cancel = function() {$mdDialog.cancel();};
		$scope.answer = function(chosenLocation) {$mdDialog.hide(chosenLocation);};
		$scope.googleMapSearch = function() {

			var locationName = document.getElementById('googleSearchField').value;
			
			$scope.showGoogleResults = true;
			$scope.searching = true;
			
			$http.get("https://maps.googleapis.com/maps/api/geocode/json?address=" + locationName + "&key=AIzaSyA4KA2WAZ2BKf4qrAWPWvfYKen0A0p9gx4").success(function(data, status, header, config) {
				
				$scope.searching = false;

				if (data != null && data.results != null) {
					
					$scope.cities.splice(0, $scope.cities.length);
					
					for (i=0; i<data.results.length; i++) {
						$scope.cities.push({shortName: data.results[i].address_components[0].long_name, name: data.results[i].formatted_address, geo: data.results[i].geometry.location});
					}
				}
			});
		}
	}
		
	$scope.initContext();
	
} ]);
