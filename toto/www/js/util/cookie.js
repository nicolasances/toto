
var getCookie = function(name) {
	
	if (document.cookie == null) return null;

	startIndex = document.cookie.indexOf(name);
	record = false;
	
	var result = "";
	
	for (i=startIndex; i<document.cookie.length; i++) {

		if (document.cookie.charAt(i) == ';') {
			record = false;
			break;
		}
		
		if (record) result += document.cookie.charAt(i);
		
		if (document.cookie.charAt(i) == '=') record = true;
	}
	
	return result;
	
};