/*
 * File: iframeSizer.contentWindow.js
 * Desc: Include this file in any page being loaded into an iframe
 *       to force the iframe to resize to the content size.
 * Requires: jquery.iframeSizer.js on host page.
 * Author: David J. Bradshaw - dave@bradshaw.net
 * Contributor: Jure Mav - jure.mav@gmail.com
 * Date: 2013-06-14
 */

(function(){
	var tId = setInterval(function(){ if ( !!document.body ) onComplete(); }, 10); // min 4ms
	function onComplete(){

		clearInterval(tId);

		// On ready
		var
			myID     = '',
			target   = null,
			height   = 0,
			width    = 0,
			base     = 10,
			logging  = false,
			msgID    = '[iFrameSizer]',  //Must match host page msg ID
			firstRun = true,
			msgIdLen = msgID.length;

		try{

			function addEventListener(e,func){
				if (window.addEventListener){
					window.addEventListener(e,func, false);
				} else if (window.attachEvent){
					window.attachEvent('on'+e,func);
				}
			}

			function formatLogMsg(msg){
				return msgID + '[' + myID + ']' + ' ' + msg;
			}

			function log(msg){
				if (logging && window.console){
					console.log(formatLogMsg(msg));
				}
			}

			function warn(msg){
				if (window.console){
					console.warn(formatLogMsg(msg));
				}
			}

			function receiver(event) {
				function init(){

					function strBool(str){
						return 'true' === str ? true : false;
					}

					function setMargin(){
						document.body.style.margin = bodyMargin+'px';
						log('Body margin set to '+bodyMargin+'px');
					}

					function setHeightAuto(){
						// Bug fix for infinity resizing of iframe
						document.documentElement.style.height = 'auto';
						document.body.style.height = 'auto';
						log('html & Body height set to "auto"');
					}

					function intiWindowListener(){
						addEventListener('resize', function(){
							sendSize('Window resized');
						});
					}

					function initInterval(){
						if ( 0 !== interval ){
							log('setInterval: '+interval);
							setInterval(function(){
								sendSize('setInterval');
							},interval);
						}
					}

					var data = event.data.substr(msgIdLen).split(':');

					myID             = data[0];
					bodyMargin       = parseInt(data[1],base);
					doWidth          = strBool(data[2]);
					logging          = strBool(data[3]);
					interval         = parseInt(data[4],base);
					publicMethods    = strBool(data[5]);
					autoWindowResize = strBool(data[6]);
					target           = event.source;

					log('Initialising iframe');

					setMargin();
					setHeightAuto();
					if ( autoWindowResize ) {
						intiWindowListener();
					}
					initInterval();

					if (publicMethods){
						setupPublicMethods();
					}
				}

				function getOffset(dimension){
					return parseInt(document.body['offset'+dimension],base);
				}

				function sendSize(calleeMsg, customHeight, customWidth){

					var
						currentHeight = customHeight || getOffset('Height') + 2*bodyMargin,
						currentWidth  = customWidth || getOffset('Width')  + 2*bodyMargin,
						msg;

					if ((height !== currentHeight) || (doWidth && (width !== currentWidth))){
						height = currentHeight;
						width = currentWidth;
						log( 'Trigger event: ' + calleeMsg );

						msg = myID + ':' + height + ':' + width;
						target.postMessage( msgID + msg, '*' );
						log( 'Sending msg to host page (' + msg + ')' );
					}
				}

				function setupPublicMethods(){
					log( 'Enabling public methods' );

					window.iFrameSizer = {
						trigger: function(customHeight, customWidth){
							sendSize('window.iFrameSizer.trigger()', customHeight, customWidth);
						}
					};
				}

				var bodyMargin,doWidth;

				if (msgID === event.data.substr(0,msgIdLen) && firstRun){ //Check msg ID
					firstRun = false;
					init();
					sendSize('Init message from host page');
				}
			}

			addEventListener('message', receiver);
		}
		catch(e){
			warn(e);
		}

	}
})();

