//must come after qunit-bootstrap.js and after mwEmbedLoader.php
if( window.QUnit ){
	
	mw.setConfig( 'forceMobileHTML5', true );	
	if( window['jsCallbackReady'] ){
		window['orgJsCallbackReady'] = window['jsCallbackReady'];
	}
	jsCallbackCalled = false;
	window['jsCallbackReady'] = function( videoId ) {
		// check if the test can access the iframe
		var domainRegEx = new RegExp(/^((http[s]?):\/)?\/?([^:\/\s]+)(:([^\/]*))?((\/\w+)*\/)([\w\-\.]+[^#?\s]+)(\?([^#]*))?(#(.*))?$/);
		var match = document.URL.match( domainRegEx );
		var pageDomain = match[3];
		var scriptMatch = SCRIPT_LOADER_URL.match(domainRegEx );
		if( match && SCRIPT_LOADER_URL[2] == 'http' || SCRIPT_LOADER_URL[2] == 'https'
				&& scriptMatch[3] != pageDomain )
		{
			ok(false, "Error: trying to test across domains, no iframe inspection is possible" + match + ' != ' + pageDomain);
			stop();
		}
		// Add entry ready listener
		document.getElementById( videoId ).addJsListener("entryReady", "kalturaQunitEntryReady");

		jsCallbackCalled = true;
		if( jsKalturaPlayerTest ){
			jsKalturaPlayerTest( videoId );
		}
		
		if( window['orgJsCallbackReady'] ){
			window['orgJsCallbackReady']( videoId );
		}
	};
	window.QUnit.start();
	asyncTest( "KalturaSupport::PlayerLoaded", function(){
		var waitCount = 0;
		var interval = setInterval(function(){
			// Timeout in 20 seconds:
			if( waitCount == 2000 ){
				ok(false, "Player timed out");
				clearInterval( interval );
				start();
			}
			if( jsCallbackCalled ){
				ok(true, "Player loaded");
				clearInterval( interval );
				start();
			}
			waitCount++;
		}, 10);
	});
	var entryReadyCallbacks = [];
	var entryReadyAlreadyCalled = false;
	// Utility function for entry ready testing handler
	window['kalturaQunitEntryReady'] = function(){
		// run in async call to ensure non-blocking build out is in dom
		setTimeout(function(){
			while( entryReadyCallbacks.length ){
				entryReadyCallbacks.shift()();
			}
			entryReadyAlreadyCalled = true;
		}, 10 );
	};
	window['kalturaQunitWaitForPlayer'] = function( callback ){		
		if( entryReadyAlreadyCalled ){
			callback();
			return ;
		}
		entryReadyCallbacks.push( callback );
	};
}
