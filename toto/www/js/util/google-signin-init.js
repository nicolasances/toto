var auth2 = null;
var googleUser;
var googleIdToken = null;
var appAuthorizationLoaded = false;

var initGoogleSignIn = function(callback, go, http) {
	
	gapi.load('auth2', function() {
		
		gapi.auth2.init({client_id: '209706877536-4h516ud369nuaakag4gbtlvq4d735ag9.apps.googleusercontent.com'}).then(function() {
			
			auth2 = gapi.auth2.getAuthInstance();
			
			if (!auth2.isSignedIn.get()) {
				go('/login');
				
				callback();
			}
			else {
				googleUser = auth2.currentUser.get();
				googleIdToken = googleUser.getAuthResponse().id_token;
				
				if (!appAuthorizationLoaded) {
					
					console.log("Loading apps authorization");
					
					appAuthorizationLoaded = true;
					
					for (var i = 0; i < totoAppList.length; i++) {
						totoAppList[i].authorized = true;
					}
					
					callback();
					
//					http.get(microservicesProtocol + "://" + microservicesUrl + "/auth/apps").success(function(data) {
//						
//						appAuthorizationLoaded = true;
//						
//						// No apps = authorized on everything
//						if (data.apps.length == 0) {
//							for (var i = 0; i < totoAppList.length; i++) {
//								totoAppList[i].authorized = true;
//							}
//							
//							callback();
//							
//							return;
//						}
//						
//						for (var j = 0; j < data.apps.length; j++) {
//							
//							for (var i = 0; i < totoAppList.length; i++) {
//								
//								if (totoAppList[i].id == data.apps[j].code) {
//									
//									totoAppList[i].authorized = true;
//									
//									break;
//								}
//							}
//						}
//
//						callback();
//					});
				}
				else callback();
			}
			
		});
	});
}

