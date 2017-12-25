var travelModule = angular.module("travelModule", [ 'fileService', 'ngMaterial' ]);

var map;

initMap = function() {
	var styles = [
	  {"featureType": "administrative.country", "elementType": "labels", "stylers": [{ "color": "#EEEEEE" }, { "visibility": "off" }]},
	  {"featureType": "administrative.province", "elementType": "labels", "stylers": [{ "color": "#EEEEEE" }, { "visibility": "off" }]},
	  {"featureType": "administrative.country", "elementType": "geometry.stroke", "stylers": [{ "color": "#9b9b9b" }]}, 
	  {"elementType": "labels.text.fill", stylers: [{"color": "#606060"}]}, 
	  {"featureType": "road", "elementType": "labels.icon", "stylers": [{"visibility": "off"}]}
	];
	
	map = new google.maps.Map(document.getElementById('mapdiv'), {
	    center: {lat: 45.475757, lng: 9.168083},
	    scrollwheel: false,
	    zoom: 3,
	    streetViewControl: false,
	    mapTypeControl: false
	});
	
	map.setOptions({styles: styles});
	
}

addMarker = function(lat, lng) {
	
//	var scale = 42/68;
//	var height = 35;
//	
//	var pinIcon = new google.maps.MarkerImage(
//		    "http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|FF0000",
//		    null, /* size is determined at runtime */
//		    null, /* origin is 0,0 */
//		    null, /* anchor is bottom center of the scaled image */
//		    new google.maps.Size(height * scale, height)
//		); 
	
	new google.maps.Marker({position: {lat: parseFloat(lat), lng:parseFloat(lng) }, map: map});
}

travelModule.controller("travelController", [ '$scope', '$http', '$timeout', '$routeParams', '$mdDialog', function($scope, $http, $timeout, $routeParams, $mdDialog) {

	/**
	 * Prepares the context object
	 */
	$scope.initContext = function() {

		$scope.microservicesHost = microservicesHost;
		$scope.microservicesPort = microservicesPort;
		$scope.unlockPrivateCategories = false;
		
		$scope.loadGoogleMap();
		$scope.getCategories();
		
	}
	
	/**
	 * Creates the map when google maps is ready and downloaded
	 */
	$scope.loadGoogleMap = function() {

		var timer = setInterval(function() {
			
			if (googleMaps.ready) {
				
				window.clearInterval(timer);
				
				initMap();
				
				$scope.getTravelLocations();
			}
			
		}, 300);
	}

	/**
	 * Retrieves all the locations that have been covered by the traveling
	 */
	$scope.getTravelLocations = function() {

		$http.get(microservicesProtocol + "://" + microservicesUrl + "/travel/locations").success(function(data, status, header, config) {

			for (i=0;i<data.locations.length;i++) {
				lng = data.locations[i].gpsCoordinatesE;
				lat = data.locations[i].gpsCoordinatesN;
				
				addMarker(lat, lng);
			}
			
		});
	}

	/**
	 * Retrieves the different galleries
	 */
	$scope.getCategories = function() {

		$http.get(microservicesProtocol + "://" + microservicesUrl + "/travel/categories?retrievePhotoCount=true").success(function(data, status, header, config) {

			$scope.categories = data.categories;

		});

	}
	
	/**
	 * Toggles the visibility of Private categories
	 */
	$scope.togglePrivateCategoriesVisibility = function() {
		
		if ($scope.unlockPrivateCategories) {
			$scope.unlockPrivateCategories = false;
			return;
		}
		
		var codeDialog = $mdDialog.prompt().title('Enter the code').placeholder('Code').ok('Done').cancel('Cancel');
		var fakeOKDialog = $mdDialog.alert().title('Code OK!!').ok('Ok');
		
		$mdDialog.show(codeDialog).then(function(result) {

			if (result == '0000') $mdDialog.show(fakeOKDialog).then(function(result) {});
			
			if (result == '1110') $scope.unlockPrivateCategories = true;
			
		});
		
	}
	
	/**
	 * Refreshes the view
	 */
	$scope.refresh = function() {

		$scope.initContext();

	}

	$scope.refresh();

} ]);

travelModule.controller("travelCategoryController", [ '$scope', '$http', '$timeout', '$routeParams', function($scope, $http, $timeout, $routeParams) {

	/**
	 * Prepares the context object
	 */
	$scope.initContext = function() {

		$scope.category = {
			'private' : false
		};

	}

	/**
	 * Saves the category
	 */
	$scope.postCategory = function() {

		if ($scope.category.title == null) return;

		$http.post(microservicesProtocol + "://" + microservicesUrl + "/travel/categories", $scope.category).success(function(data, status, header, config) {

			$scope.go('/travel');

		});

	}

	$scope.initContext();

} ]);

travelModule.directive('fileModel', [ '$parse', function($parse) {
	return {
		restrict : 'A',
		link : function(scope, element, attrs) {
			var model = $parse(attrs.fileModel);
			var modelSetter = model.assign;

			element.bind('change', function() {
				scope.$apply(function() {
					modelSetter(scope, element[0].files[0]);
				});
			});
		}
	};
} ]);

travelModule.controller("travelCategoryDetailController", [ '$scope', '$http', '$timeout', '$routeParams', 'thumbnailService', '$mdDialog', function($scope, $http, $timeout, $routeParams, thumbnailService, $mdDialog) {

	$scope.initContext = function() {

		$scope.microservicesHost = microservicesHost;
		$scope.microservicesPort = microservicesPort;
		$scope.showUpdateCategoryTitle = false;
		$scope.loadedImages = new Array();

		$scope.loadSettings($scope.getCategory);
	}
	
	$scope.loadSettings = function(callback) {
		
		$http.get(microservicesProtocol + "://" + microservicesUrl + "/travel/settings").success(function(data, status, header, config) {

			$scope.galleryMaxThumbnailSize = data.galleryMaxThumbnailSize;
			$scope.galleryScaleIncrementStep = data.galleryScaleIncrementStep;
			
			callback();

		});
	}

	/**
	 * Retrieves the single category
	 */
	$scope.getCategory = function() {

		$http.get(microservicesProtocol + "://" + microservicesUrl + "/travel/categories").success(function(data, status, header, config) {

			if (data.categories.length > 0) {
				for (i = 0; i < data.categories.length; i++) {
					if (data.categories[i].id == $routeParams.id) {

						$scope.category = data.categories[i];
						$scope.getPhotos();

						break;

					}
				}
			}

		});

	}

	/**
	 * Opens a dialog that will ask the user for the photo GPS Coordinates
	 */
	$scope.askForCoordinates = function(ev, photo) {
		// Appending dialog to document.body to cover sidenav in docs app
		var firstStepDialog = $mdDialog.prompt().title('Enter GPS Coordinates').placeholder('North').targetEvent(ev).ok('Ok').cancel('Nevermind');
		var secondStepDialog = $mdDialog.prompt().title('Enter GPS Coordinates').placeholder('East').targetEvent(ev).ok('Ok').cancel('Nevermind');

		$mdDialog.show(firstStepDialog).then(function(result) {

			var north = result;

			$mdDialog.show(secondStepDialog).then(function(result) {

				var east = result;
				
				var data = {gpsCoordinatesN : north, gpsCoordinatesE : east};
				
				$http.put(microservicesProtocol + "://" + microservicesUrl + "/travel/photos/" + photo.id + "/metadata", data).success(function(data, status, header, config) {

					photo.gpsCoordinatesN = north;
					photo.gpsCoordinatesE = east;

				});

			});
		});
	};

	/**
	 * Updates the title of the category
	 */
	$scope.updateCategoryTitle = function() {

		var data = {
			title : $scope.category.title
		};

		$http.put(microservicesProtocol + "://" + microservicesUrl + "/travel/categories/" + $scope.category.id, data).success(function(data, status, header, config) {

			$scope.showUpdateCategoryTitle = false;

		});

	}

	/**
	 * Switches from Private to Public or viceversa
	 */
	$scope.toggleLock = function() {

		var data = {
			'private' : !$scope.category.private
		};

		$http.put(microservicesProtocol + "://" + microservicesUrl + "/travel/categories/" + $scope.category.id, data).success(function(data, status, header, config) {

			$scope.category.private = !$scope.category.private;

		});

	}
	
	/**
	 * Deletes the category
	 */
	$scope.deleteCategory = function() {
		
		var confirm = $mdDialog.confirm().title('Sure you want to delete the category?').ariaLabel('Delete category').ok('Yes').cancel('No');
  
		$mdDialog.show(confirm).then(function() {
			
			$http.delete(microservicesProtocol + "://" + microservicesUrl + "/travel/categories/" + $scope.category.id).success(function(data, status, header, config) {
				
				$scope.go("/travel");
				
			});
		});
		
	}

	$scope.getPhotos = function() {

		$http.get(microservicesProtocol + "://" + microservicesUrl + "/travel/categories/" + $scope.category.id + "/photos?columns=4").success(function(data, status, header, config) {

			$scope.photos = data.photos;
			
		});

	}
	
	/**
	 * Optimizes the image and positions it
	 */
	$scope.optimizeAndPositionImage = function(img) {

		for (x = 0; x < $scope.loadedImages.length; x++) if ($scope.loadedImages[x] == img.id) return;
		
		$scope.loadedImages.push(img.id);
		
		var image = new Image();
		image.src = img.src;
		image.onload = function() {
			
			var targetImgSize = $scope.galleryMaxThumbnailSize * 1000;
			var initialScale = 0.9;
			var dataURL = null;
			
			// 1. Iterate in the scaling until you reach the good targetImgSize
			var newImgSize = 0;
			var scale = initialScale;
			do {
				
				if (scale < 0.1) scale = 0.1;
				
				var newWidth = scale * image.width;
				var newHeight = scale * image.height;
				
				var canvas = document.createElement('canvas');
				canvas.width = newWidth;
				canvas.height = newHeight;
				canvas.getContext('2d').drawImage(this, 0, 0, newWidth, newHeight);
				
				dataURL = canvas.toDataURL("");
				
				newImgSize = dataURL.length;
				
				scale -= $scope.galleryScaleIncrementStep;
				
			} while (newImgSize > targetImgSize && scale > 0.1); 
			
			console.log(img.id + " - new size: " + newImgSize / 1000 + "kb - scale: " + scale);
			
			img.src = dataURL;
			img.style.left = 'calc(50% - ' + img.width / 2 + 'px)';
			
		};

	}

	/**
	 * Uploads the category thumbnail
	 */
	$scope.postCategoryThumbnail = function(inputEl) {

		var uploadUrl = microservicesProtocol + "://" + microservicesUrl + "/travel/categories/" + $scope.category.id + "/thumbnail";

		var scale = 0.3;
		if (inputEl.files[0].size < 1200000) scale = null;

		thumbnailService.sendThumbnail(inputEl.files[0], uploadUrl, scale, function() {

			document.getElementById('categoryThumbnailBackground').src = 'http://' + microservicesHost + ':' + microservicesPort + '/travel/categories/' + $scope.category.id + '/thumbnail';

		});

	}

	$scope.initContext();

} ]);

travelModule.controller("travelNewPhotoController", [ '$scope', '$http', '$timeout', '$routeParams', 'photoService', function($scope, $http, $timeout, $routeParams, photoService) {

	$scope.initContext = function() {

		$scope.getCategories();
		$scope.microservicesHost = microservicesHost;
		$scope.microservicesPort = microservicesPort;

	}

	/**
	 * Reacts to the change of the picture
	 */
	$scope.fileChanged = function(el) {

		var reader = new FileReader();
		reader.readAsDataURL(el.files[0]);
		reader.onloadend = function() {

			var imgEl = document.getElementById('uploaded-image');
			imgEl.src = reader.result;

		}
	}

	/**
	 * Retrieves the categories (galleries)
	 */
	$scope.getCategories = function() {

		$http.get(microservicesProtocol + "://" + microservicesUrl + "/travel/categories").success(function(data, status, header, config) {

			$scope.categories = data.categories;

			for (i = 0; i < $scope.categories.length; i++) {

				$scope.categories[i].selected = false;

			}

		});

	}

	/**
	 * Uploads the photo and its metadata
	 */
	$scope.postPhoto = function() {

		var uploadUrl = microservicesProtocol + "://" + microservicesUrl + "/travel/photos";

		$scope.uploading = true;
		
		var scale = 1;
		if ($scope.myFile.size >= 3000000) scale = 0.3;
		else if ($scope.myFile.size >= 1000000) scale = 0.8;
		
		// Send photo
		photoService.sendPhoto($scope.myFile, uploadUrl, scale, function(data, status, header, config) {

			var metadata = new Object();
			metadata.categories = new Array();

			for (i = 0; i < $scope.categories.length; i++) {
				if ($scope.categories[i].selected) metadata.categories.push($scope.categories[i].id);
			}

			// Send photo metadata
			$http.post(microservicesProtocol + "://" + microservicesUrl + "/travel/photos/" + data.photoId + "/metadata", metadata).success(function(data, status, header, config) {

				$scope.uploading = false;

				$scope.go('/travel');

			});

		});

	}
	
	/**
	 * Centers the title of the category on the thumbnail
	 */
	$scope.positionTitle = function(img) {
		
		var titleEl = document.getElementById('title-' + img.id.substring(4));
		
		titleEl.style.top = 'calc(' + img.height / 2 + 'px - 8px)';
		
	}

	$scope.initContext();
} ]);

travelModule.controller("travelPhotoController", [ '$scope', '$http', '$timeout', '$routeParams', 'photoService', function($scope, $http, $timeout, $routeParams, photoService) {

	$scope.initContext = function() {

		$scope.microservicesHost = microservicesHost;
		$scope.microservicesPort = microservicesPort;
		
		$scope.photoId = $routeParams.photoId;
		$scope.categoryId = $routeParams.catId;

	}
	
	$scope.calcStyle = function(img) {
		
		if (img != null && img.width != 0) {

			img.style.position = 'absolute';
			img.style.left = 'calc(50% - ' + img.width / 2 + 'px)';
			img.style.top = 'calc(50% - ' + img.height/ 2 + 'px)';
		}
		
	}
	
	$scope.initContext();

} ]);
travelModule.controller("travelSettingsController", [ '$scope', '$http', '$timeout', '$routeParams', 'photoService', function($scope, $http, $timeout, $routeParams, photoService) {
	
	$scope.initContext = function() {

		$scope.microservicesHost = microservicesHost;
		$scope.microservicesPort = microservicesPort;
		
		$scope.loadSettings();
		
	}
	
	$scope.saveSettings = function() {
		
		data = new Object();
		data.galleryMaxThumbnailSize = $scope.galleryMaxThumbnailSize;
		data.galleryScaleIncrementStep = $scope.galleryScaleIncrementStep;
		
		$http.post(microservicesProtocol + "://" + microservicesUrl + "/travel/settings", data).success(function(data, status, header, config) {

			$scope.go('/travel');

		});
		
	}
	
	$scope.loadSettings = function() {
		
		$http.get(microservicesProtocol + "://" + microservicesUrl + "/travel/settings").success(function(data, status, header, config) {

			$scope.galleryMaxThumbnailSize = data.galleryMaxThumbnailSize;
			$scope.galleryScaleIncrementStep = data.galleryScaleIncrementStep;
			
		});
	}
	
	$scope.initContext();
	
} ]);


