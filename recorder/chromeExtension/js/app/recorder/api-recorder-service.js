( function() {

	angular
	.module( 'jb.apiRecorder.recorderService', [ 'jb.apiRecorder.settingsService' ] )
	.factory( 'APIRecorderService', [ '$rootScope', 'SettingsService', function( $rootScope, SettingsService ) {
		

		var _calls = []
			,_self; // Needed in handler for onRequestFinished

		var APIRecorder = function() {
			_self = this; 
		};




		APIRecorder.prototype.getCalls = function() {
			return _calls;
		};



		/**
		* Starts recording calls
		*/
		APIRecorder.prototype.record = function() {

			console.log( 'APIRecorder: Record' );
			chrome.devtools.network.onRequestFinished.addListener( this.requestHandler );

		};


		/**
		* Handler for calls
		*/
		APIRecorder.prototype.requestHandler = function( request ) {
			console.log( 'APIRecorder: Request %o finished.', request );
			$rootScope.$apply( function() {
				_self.processRequest( request );
			} );
		};


		/**
		* Stops recording calls
		*/
		APIRecorder.prototype.pause = function() {

			console.log( 'APIRecorder: Pause' );
			chrome.devtools.network.onRequestFinished.removeListener( this.requestHandler );

		};



		APIRecorder.prototype.removeCall = function( call ) {

			var index = _calls.indexOf( call );

			if( index === -1 ) {
				throw new Error( 'APIRecorder: Call not found in calls, cannot be removed.' );
			}

			_calls.splice( index, 1 );

		};



		/**
		* Returns false if response's content-type is in settings.requestHeadersToDiscard
		* and should therefore not be processed; else true.
		*/
		APIRecorder.prototype.checkRequestContentType = function( request ) {

			return SettingsService.getSettings()
				.then( function( settings ) {
			
					var contentTypesToIgnore = settings.requestHeadersToDiscard;

					// Settings not set: Process all requests
					if( !contentTypesToIgnore ) {
						return true;
					}

					contentTypesToIgnore = contentTypesToIgnore.split( ' ' );
					
					var contentType;

					// header contains a long string like text/css; charset=UTF-8
					// Removing the charset part gives us the content type we're looking for.
					request.response.headers.forEach( function( header ) {
						if( header.name === 'content-type' || header.name === 'Content-Type' ) {

							var hasCharset = header.value.indexOf( ' ' ) > -1;

							if( hasCharset ) {
								contentType = header.value.substring( 0, header.value.indexOf( ';' ) );
							}
							else {
								contentType = header.value;
							}

						}
					} );


					if( !contentType ) {
						return true;
					}

					if( contentTypesToIgnore.indexOf( contentType ) > -1 ) {
						return false;
					}

					return true;

				} );

		};



		APIRecorder.prototype.processRequest = function( req ) {

			var self = this;

			// content-type of response belongs to settings.requestHeadersToDiscard:
			// Don't process response
			this.checkRequestContentType( req )

				.then( function( process ) {

					if( !process ) {
						return false;
					}
					
					var call = new Call( self );
			
					var shortUrl = req.request.url.substr( req.request.url.lastIndexOf( '/' ) + 1 );

					call.name = req.request.method.toLowerCase() + '-' + shortUrl;

					var requestHeaders = self.processHeaders( req.request.headers );
					var request 		= new Request();
					request.url 		= shortUrl;
					request.completeUrl	= req.request.url;
					request.headers 	= requestHeaders;
					request.method 		= req.request.method;
					call.request 		= request;

					var response 		= new Response();
					response.headers 	= self.processHeaders( req.response.headers );

					call.response 		= response;

					console.log( 'APIRecorder: Processed call %o', call );
					_calls.push( call );

	
				} );
			
	
		};



		APIRecorder.prototype.processHeaders = function( headers ) {
	
			var ret = []
				, self = this;

			headers.forEach( function( header ) {

				var retHeader			= new Header();
				retHeader.name 			= header.name;
				retHeader.value = header.value;
				retHeader.optional 		= true;
				retHeader.nullable 		= true;
				retHeader.type 			= self.recognizeType( header.value );

				ret.push( retHeader );

			} );

			return ret;

		};


		/**
		* Tries to recognize type of value passed, returns best guess: 
		* - date
		* - number
		* - string
		* Very primitive (but quick) implementation.
		*/
		APIRecorder.prototype.recognizeType = function( value ) {
	
			if( parseInt( value, 10 ) == value ) {
				return 'number';
			}

			if( parseFloat( value ) == value ) {
				return 'number';
			}

			// Date recognizes numbers as dates – move 
			// below number
			var date = new Date( value );
			if( !isNaN( date.getTime() ) /*&& date.toString() === value*/ ) {
				return 'date';
			}

			return 'string';

		};


		return new APIRecorder();

	} ] );
















	// Define call object
	// Inject APIRecorder to remove call
	var Call = function( APIRecorder ) {

		this._apiRecorder = APIRecorder;

		Object.defineProperty( this, 'response', {
			enumerable: true
			, writable: true
		} );

		Object.defineProperty( this, 'request', {
			enumerable: true
			, writable: true
		} );

		Object.defineProperty( this, 'name', {
			enumerable: true
			, writable: true
		} );

	};

	Call.prototype.remove = function( ev ) {
		ev.preventDefault();
		ev.stopPropagation();
		this._apiRecorder.removeCall( this );
	};



	// Define request object
	var Request = function() {

		Object.defineProperty( this, 'url', {
			enumerable: true
			, writable: true
		} );

		Object.defineProperty( this, 'completeUrl', {
			enumerable: true
			, writable: true
		} );

		Object.defineProperty( this, 'method', {
			enumerable: true
			, writable: true
		} );

		Object.defineProperty( this, 'headers', {
			enumerable: true
			, writable: true
		} );

	};

	Request.prototype.removeHeader = function( header ) {
		this.headers.splice( this.headers.indexOf( header ), 1 );
	};

	Request.prototype.createHeader = function( name ) {
		var header = new Header();
		header.name = name;
		this.headers.push( header );
	};



	// Define response object
	var Response = function() {

		Object.defineProperty( this, 'body', {
			enumerable: true
			, writable: true
		} );

		Object.defineProperty( this, 'headers', {
			enumerable: true
			, writable: true
		} );

	};

	Response.prototype.removeHeader = function( header ) {
		this.headers.splice( this.headers.indexOf( header ), 1 );
	};

	Response.prototype.createHeader = function( name ) {
		var header = new Header();
		header.name = name;
		this.headers.push( header );
	};






	// Define header object
	var Header = function() {

		Object.defineProperty( this, 'name', {
			enumerable: true
			, writable: true
		} );

		Object.defineProperty( this, 'type', {
			enumerable: true
			, writable: true
		} );

		Object.defineProperty( this, 'optional', {
			enumerable: true
			, writable: true
		} );

		Object.defineProperty( this, 'nullable', {
			enumerable: true
			, writable: true
		} );

		Object.defineProperty( this, 'value', {
			enumerable: true
			, writable: true
		} );

	};




} )();









