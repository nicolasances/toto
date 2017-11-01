/*
 * This JS module provide services to manage file upload
 */
var fileServiceModule = angular.module('fileService', []);

fileServiceModule.factory('thumbnailService', [ '$http', function($http) {
	
	var thumbnailService = {
			
		uploading : false,
		
		success : function() {},
			
		/**
		 * Sends the thumbnail to the specified URL. 
		 * 
		 * @param file the File object to be sent
		 * @param url the URL to which the file has to be sent
		 * @param scale the optional scale factor that has to be used for resizing the picture
		 * @param successCallback the mandatory callback for the successfull upload of the thumbnail
		 */
		sendThumbnail : function(file, url, scale, successCallback) {
			
			var self = this;
			
			this.success = successCallback;
			
			if (!window.File || !window.FileReader || !window.FormData) {
				alert('File upload not supported!');
				return;
			}

			var reader = new FileReader();
			reader.readAsDataURL(file);
			reader.onloadend = function() {
				if (scale != null) self.resizeAndSend(reader.result, file.type, url, scale);
				else self.send(reader.result, file.type, url);
			}
			
		}, 
		
		/**
		 * Sends the photo it to the API
		 */
		send : function(dataURL, fileType, url) {
			
			var self = this;
			
			self.sendFile(self.dataURItoBlob(dataURL), url);

		},
		
		/**
		 * Resizes the picture to create the thumbnail and sends it to the API
		 */
		resizeAndSend : function(dataURL, fileType, url, scale) {
			
			var self = this;

			var image = new Image();
			image.src = dataURL;

			image.onload = function() {
				var width = image.width;
				var height = image.height;

				var newWidth = scale * width;
				var newHeight = scale * height;

				var canvas = document.createElement('canvas');

				canvas.width = newWidth;
				canvas.height = newHeight;

				var context = canvas.getContext('2d');

				context.drawImage(this, 0, 0, newWidth, newHeight);

				var dataURL = canvas.toDataURL(fileType);
				
				self.sendFile(self.dataURItoBlob(dataURL), url);
			};

			image.onerror = function() {
				alert('There was an error processing your file!');
			};
		},
		
		/**
		 * Converts the provided dataURL into a Blob that can be sent as a Multipart
		 * file. convert base64/URLEncoded data component to raw binary data held in
		 * a string
		 */
		dataURItoBlob : function(dataURI) {
			// convert base64/URLEncoded data component to raw binary data held in a
			// string
			var byteString;
			if (dataURI.split(',')[0].indexOf('base64') >= 0) byteString = atob(dataURI.split(',')[1]);
			else byteString = unescape(dataURI.split(',')[1]);

			// separate out the mime component
			var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

			// write the bytes of the string to a typed array
			var ia = new Uint8Array(byteString.length);
			for (var i = 0; i < byteString.length; i++) {
				ia[i] = byteString.charCodeAt(i);
			}

			return new Blob([ ia ], {
				type : mimeString
			});
		},
		
		/**
		 * Sends the file to the API
		 */
		sendFile : function(dataURL, url) {
			
			var self = this;

			var data = new FormData();
			data.append('file', dataURL);
			
			self.uploading = true;

			$http.post(url, data, {
				transformRequest : angular.identity,
				headers : {
					'Content-Type' : undefined
				}
			}).success(function() {
				
				self.uploading = false;
				
				self.success();

			}).error(function(data, status, header, config) {

				this.uploading = false;

				alert("An error occured. Data: " + data)

			});
		}
		
	};

	return thumbnailService;

} ]);

fileServiceModule.factory('photoService', [ '$http', function($http) {
	
	var photoService = {
			
		uploading : false,
		
		success : function() {},
			
		/**
		 * Sends the photo to the specified URL. 
		 * 
		 * @param file the File object to be sent
		 * @param url the URL to which the file has to be sent
		 * @param scale the optional scale factor that has to be used for resizing the picture
		 * @param successCallback the mandatory callback for the successfull upload of the thumbnail
		 */
		sendPhoto : function(file, url, scale, successCallback) {
			
			var self = this;
			
			this.success = successCallback;
			
			if (!window.File || !window.FileReader || !window.FormData) {
				alert('File upload not supported!');
				return;
			}

			var reader = new FileReader();
			reader.readAsDataURL(file);
			reader.onloadend = function() {
				if (scale != null) self.resizeAndSend(reader.result, file.type, url, scale);
				else self.send(reader.result, file.type, url);
			}
			
		}, 
		
		/**
		 * Sends the photo it to the API
		 */
		send : function(dataURL, fileType, url) {
			
			var self = this;
			
			self.sendFile(self.dataURItoBlob(dataURL), url);

		},
		
		/**
		 * Resizes the picture to create the thumbnail and sends it to the API
		 */
		resizeAndSend : function(dataURL, fileType, url, scale) {
			
			var self = this;

			var image = new Image();
			image.src = dataURL;

			image.onload = function() {
				var width = image.width;
				var height = image.height;

				var newWidth = scale * width;
				var newHeight = scale * height;

				var canvas = document.createElement('canvas');

				canvas.width = newWidth;
				canvas.height = newHeight;

				var context = canvas.getContext('2d');

				context.drawImage(this, 0, 0, newWidth, newHeight);

				var dataURL = canvas.toDataURL(fileType);

				self.sendFile(dataURL, url, image.src);
			};

			image.onerror = function() {
				alert('There was an error processing your file!');
			};
		},
		
		/**
		 * Converts the provided dataURL into a Blob that can be sent as a Multipart
		 * file. convert base64/URLEncoded data component to raw binary data held in
		 * a string
		 */
		dataURItoBlob : function(dataURI) {
			// convert base64/URLEncoded data component to raw binary data held in a
			// string
			var byteString;
			if (dataURI.split(',')[0].indexOf('base64') >= 0) byteString = atob(dataURI.split(',')[1]);
			else byteString = unescape(dataURI.split(',')[1]);

			// separate out the mime component
			var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

			// write the bytes of the string to a typed array
			var ia = new Uint8Array(byteString.length);
			for (var i = 0; i < byteString.length; i++) {
				ia[i] = byteString.charCodeAt(i);
			}

			return new Blob([ ia ], {
				type : mimeString
			});
		},
		
		/**
		 * Sends the file to the API
		 */
		sendFile : function(dataURL, url, originalDataURL) {
			
			var self = this;

//			alert(dataURL);
			// from http://stackoverflow.com/questions/18297120/html5-resize-image-and-keep-exif-in-resized-image
			dataURL = 'data:image/jpeg;base64,' + ExifRestorer.restore(originalDataURL, dataURL);
			
			var data = new FormData();
			data.append('file', self.dataURItoBlob(dataURL));

			self.uploading = true;

			$http.post(url, data, {
				transformRequest : angular.identity,
				headers : {
					'Content-Type' : undefined
				}
			}).success(function(responseData, status, header, config) {
				
				self.uploading = false;
				
				self.success(responseData, status, header, config);

			}).error(function(data, status, header, config) {

				this.uploading = false;

				alert("An error occured. Data: " + data)

			});
		}
		
	};

	return photoService;

} ]);