var totoChimpDirectiveModule = angular.module('totoChimpDirectiveModule', [ 'ChimpServiceModule' ]);

/**
 * Directive that manages the Toto Chimp
 */
totoChimpDirectiveModule.directive('totoChimp', [ '$timeout', 'ChimpService', 'ApiAiService', '$rootScope', function($timeout, ChimpService, ApiAiService, $rootScope) {

	return {
		scope : {
		// fill : '@'
		},
		templateUrl : 'directives/toto-chimp.html',
		link : function(scope) {
			
			scope.go = $rootScope.go;

			scope.recognition = new webkitSpeechRecognition();
			scope.recognition.continuous = true;
			scope.recognition.interimResults = true;
			scope.recognition.lang = 'en-US';
			scope.voiceRecognitionOn = false;
			scope.recognitionStatus = 'off';
			scope.keyboardOn = false;
			scope.voices = [];
			
			/**
			 * React to the "enter" key pressed on the user input keyboard, 
			 * triggering the command to toto
			 */
			document.querySelector('#user-input-keyboard').onkeyup =  function(e) {

				if (e.keyCode == 13) {
					
					scope.finalTranscript = document.querySelector('#user-input-keyboard').value;
					
					scope.sendCommandToToto();
					
					document.querySelector('#user-input-keyboard').value = '';
					
				}
				
			};
			
			window.speechSynthesis.onvoiceschanged = function() {
			    var voices = window.speechSynthesis.getVoices();
			    scope.voices = [];
				
			    for (var i = 0; i < voices.length; i++) {
			    	if (voices[i].lang == 'en-GB') scope.voices.push(voices[i].name);
			    }
			};
			
			scope.toggleKeyboard = function() {
				
				scope.keyboardOn = !scope.keyboardOn;
				
			}
			
			/**
			 * Toggle the voice recognition on and off
			 * 
			 */
			scope.toggleVoiceRecognition = function() {
				
				if (!scope.voiceRecognitionOn) {
					
					if (speechSynthesis != null && speechSynthesis.speaking) {
						$timeout(scope.toggleVoiceRecognition, 200);
						return;
					}
					scope.recognition.start();
				}
				else {
					scope.recognition.stop();
					scope.voiceRecognitionOn = false;
					scope.recognitionStatus = 'requested stop';
					document.querySelector('.microphone-container').classList.remove('active');
				}
			}
			
			/**
			 * Reacts to the start of the recognition process. 
			 */
			scope.recognition.onstart = function() {
				scope.finalTranscript = '';
				scope.voiceRecognitionOn = true;
				scope.recognitionStatus = 'started';
				
				document.querySelector('.microphone-container').classList.add('active');
			}
			
			/**
			 * Whenever a no match is found, the microphone recording will be stopped and 
			 * aborted.
			 * 
			 * From that point it will be possible to restart the recording.
			 */
			scope.recognition.onnomatch = function() {
				scope.recognitionStatus = 'no-match';
				scope.recognition.stop();
				scope.recognition.abort();
				scope.voiceRecognitionOn = false;
				document.querySelector('.microphone-container').classList.remove('active');
			}
			
			/**
			 * Manages the errors during the speech recognition
			 */
			scope.recognition.onerror = function(event) {
				scope.recognitionStatus = 'error: ' + event.error;
				scope.voiceRecognitionOn = false;
				document.querySelector('.microphone-container').classList.remove('active');
			}
			
			/**
			 * Acts on the onResult of a voice recognition event
			 */
			scope.recognition.onresult = function(event) {
				
				scope.recognitionStatus = 'partial result';
				
				for (var i = event.resultIndex; i < event.results.length; ++i) {
					if (event.results[i].isFinal) {
						scope.finalTranscript = event.results[i][0].transcript;
					} 
				}
				
			};
			
			/**
			 * On end of the voice recognition.
			 * 
			 * The end of the voice recognition starts the API AI speech process.
			 */
			scope.recognition.onend = function() {

				if (scope.finalTranscript != null && scope.finalTranscript.length > 1) scope.finalTranscript = scope.finalTranscript.substring(0,1).toUpperCase() + scope.finalTranscript.substring(1);
				if (scope.finalTranscript == null || scope.finalTranscript == '') return;
				
				scope.recognitionStatus = 'ended';
				scope.voiceRecognitionOn = false;
				document.querySelector('.microphone-container').classList.remove('active');
//				document.querySelector('.user-text').innerHTML = scope.finalTranscript;
				
				scope.sendCommandToToto();

			}
			
			/**
			 * Just says hi to Toto and start the interactions.
			 * 
			 * It's a useless method, just done for user experience.
			 */
			scope.sayHiToToto = function() {
				
				scope.finalTranscript = 'Hi';
				
				scope.sendCommandToToto();
			}
			
			/**
			 * Sends the scope.finalTranscript to Toto chimp
			 */
			scope.sendCommandToToto = function() {

				ApiAiService.postSpeech(scope.finalTranscript, scope.apiaiContexts).success(function(data) {
					
					scope.apiaiContexts = null;
					
					var speech = data.result.fulfillment.speech;
					if (speech == null && data.result.fulfillment.messages != null && data.result.fulfillment.messages.length > 0) speech = data.result.fulfillment.messages[0].speech;
					
					scope.totoSpeech = {
						text : speech,
						data : data.result.fulfillment.data
					};
					
					/**
					 * Speak
					 */
					scope.speak(speech);
					
					if (data.result.fulfillment.data != null && data.result.fulfillment.data.list != null && data.result.fulfillment.data.list.activateSpeech) {
						for (var i = 0; i < data.result.fulfillment.data.list.results.length; i++) {
							if (data.result.fulfillment.data.list.type == 'task') scope.speak(data.result.fulfillment.data.list.results[i].title);
						}
					} 

					if (scope.totoSpeech.data.question && !scope.keyboardOn) $timeout(function() {scope.toggleVoiceRecognition();}, 100);
					
				});
			}
			
			
			/**
			 * Activates Toto voice to speak the provided speech.
			 */
			scope.speak = function(speech) {
				
				var msg = new SpeechSynthesisUtterance(speech);
				msg.lang = 'en-GB';
				msg.voice = speechSynthesis.getVoices().filter(function(voice) {
					
					return voice.name == 'Google UK English Male'; 
					
				})[0];

				speechSynthesis.speak(msg);
			}
			
			/**
			 * Scrolls down the chimp dialog so that all the last pieces of the 
			 * chat can be seen.
			 * 
			 * Requires:
			 * 
			 *  - delay		:	the delay in milliseconds before starting the scroll.
			 *  				the default is 100ms
			 */
			scope.scrollDownChimpDialog = function(delay) {
				
				if (delay == null) delay = 100;
				
				$timeout(function() {
					var chimpDialog = document.querySelector('#toto-chimp-dialog');
					chimpDialog.scrollTop = chimpDialog.scrollHeight;
				}, delay);
			}
			
			/**
			 * Shows a notification bubble that notifies the user that there are Chimp conversations to read.
			 */
			scope.showNotificationBubble = function() {
				
				document.querySelector('#toto-chimp-bubble').style.display = 'block';
				$timeout(function() {document.querySelector('#toto-chimp-bubble').classList.add('visible');}, 100);
			}
			
			/**
			 * Hides the notification bubble 
			 */
			scope.hideNotificationBubble = function() {
				
				document.querySelector('#toto-chimp-bubble').classList.remove('visible');
				$timeout(function() {document.querySelector('#toto-chimp-bubble').style.display = 'block';}, 200);
			}

			/**
			 * Opens the dialog to start the toto chimp interaction
			 */
			scope.openDialog = function() {

				// 1. Show the dialog box and show the overlay
				scope.showDialog();
				scope.hideNotificationBubble();
				
				// 2. Move the chimp!
				scope.activateChimp();
			}

			/**
			 * Respond to the user selecting an action suggested by the toto
			 * chimp
			 */
			scope.selectAction = function(interaction, action) {

				// 1. Set the line as 'answered'
				interaction.closed = true;

				// 2. Insert the answer line
				scope.interactions.push({
					text : action.title,
					type : 'me'
				});

				// 3. Send the chosen action
				ChimpService.postUserAction(scope.currentConversation.id, scope.currentConversation.code, action).success(function(data) {
					
					scope.currentConversation = data.conversation;
					scope.interactions = scope.currentConversation.interactions;
					
					var lastInteraction = scope.interactions[scope.interactions.length - 1];
					
					if (lastInteraction.type == 'bye') {
						
						scope.clearInteractions(true);
					}

				});
			}
			
			/**
			 * Clears all the interactions by making them disappear one at a time. 
			 * 
			 * This function also clears the API AI context, if any.
			 * 
			 * Requires: 
			 * 	-	activateChimpOnCleared	:	a boolean parameter that says if it is necessary to activate 
			 * 									the Toto Chimp (to look for conversations) after all the interactions
			 * 									have been cleared
			 * 
			 *  - 	delay					:	the delay in ms before starting the clearing process.
			 *  								Default is 2000ms
			 */
			scope.clearInteractions = function(activateChimpOnCleared, delay) {
				
				scope.apiaiContexts = null;
				
				if (delay == null) delay = 2000;
				
				for (var i = 0; i < scope.interactions.length; i++) {
					$timeout(function() {
						var clearedAll = false;
						for (var i = 0; i < scope.interactions.length; i++) {
							if (!scope.interactions[i].cleared) {
								
								document.getElementById('dialog-line-' + scope.interactions[i].id).classList.add('hidden');
								scope.interactions[i].cleared = true;
								
								if (i == scope.interactions.length - 1) {
									clearedAll = true;
								}
								
								break;
							}
						}
						
						if (clearedAll && activateChimpOnCleared) $timeout(scope.activateChimp, 500);
						if (clearedAll) scope.interactions = [];
						
					}, delay + i * 200);
				}
			}
			
			/**
			 * Hides the interactions (doesn't clear them, just hides them).
			 * 
			 * Requires: 
			 * 
			 *  - 	delay	:	the delay in ms before starting the hiding process.
			 *  				Default is 1000ms
			 */
			scope.hideInteractions = function(delay) {
				
				if (delay == null) delay = 1000;
				
				$timeout(function () {
					
					for (var i = 0; i < scope.interactions.length; i++) {
						if (!scope.interactions[i].cleared) {
							document.getElementById('dialog-line-' + scope.interactions[i].id).classList.add('hidden');
						}
					}
					
				}, delay);
			}
			
			/**
			 * Unhides the interactions that have been hidden with scope.hideInteractions() function.
			 */
			scope.unhideInteractions = function() {
				for (var i = 0; i < scope.interactions.length; i++) {
					if (!scope.interactions[i].cleared) {
						document.getElementById('dialog-line-' + scope.interactions[i].id).classList.remove('hidden');
					}
				}
			}
			
			/**
			 * Activates the chimp.
			 * 
			 * Retrieve the notifications and show the first one.
			 */
			scope.activateChimp = function() {
				
				scope.interactions = [];
				
				ChimpService.getNextConversation().success(function(data) {
					
					if (data == null || data.conversations == null || data.conversations.length == 0)
						return;

					scope.conversations = data.conversations;
					scope.currentConversation = scope.conversations[0];
					scope.interactions = scope.currentConversation.interactions;
					
				});
			}

			/**
			 * Opens the dialog box and puts the overlay
			 */
			scope.showDialog = function() {

				var dialog = document.getElementById('toto-chimp-dialog');
				dialog.style.display = 'block';
				
				var overlay = document.querySelector('toto-chimp #overlay');
				overlay.classList.add('visible');
				
				document.querySelector('toto-chimp .toto-chimp').style.display = 'none';
				
				document.querySelector('toto-chimp #toto-chimp-dialog .info-container').style.maxHeight = dialog.offsetHeight / 2.2 + 'px';
				document.querySelector('toto-chimp #toto-chimp-dialog .info-container').style.height = dialog.offsetHeight / 2.2 + 'px';
				
				scope.sayHiToToto();

			}

			/**
			 * Closes the toto chimp dialog
			 */
			scope.hideDialog = function() {

				var dialog = document.getElementById('toto-chimp-dialog');
				dialog.style.display = 'none';

				var overlay = document.querySelector('toto-chimp #overlay');
				overlay.classList.remove('visible');
				
				document.querySelector('toto-chimp .toto-chimp').style.display = 'block';

				return;
			}
			
		}
	};
} ]);
