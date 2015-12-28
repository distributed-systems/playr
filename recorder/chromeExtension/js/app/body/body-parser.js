/**
* Parses body data sent to or gotten from server, converts it into an object
* with the corresponding fields and best guesses.
*/
( function() {

	'use strict';

	angular
	.module( 'jb.apiBody.parser', [] )
	.factory( 'BodyParserService', [ function() {

		/**
		* Parses a primitive and returns it as
		* {
		*	type	: 'string|number|date'
		*	, name	: name
		* 	, value	: value
		* }
		*/
		function parseValue( name, value ) {

			console.log( 'BodyParserService: parse value ' + JSON.stringify( value ) + ' name ' + name );
			return {
				key			: name
				, value		: value
				, comparator: '=' // Default comparator
				, type		: new window.jb.StringTypeRecognizer().recognizeType( value )
			};

		}






		/**
		*  Parses an array and returns it as
		* {
		*	type			: 'array'
		*	, length		: int
		*	, values		: []
		* }
		*
		* Where values is an array that contains objects with
		* { value: val } for simple values (number, string, date)
		* { properties: [ { key: value } ] } for objects
		* { values: []}
		*
		* #todo: Parse all items, check for differences, set optional and throw errors if incompatible types
		* 		 were detected.
		*/
		function parseArray( name, array ) {

			console.log( 'BodyParserService: parse array ' + JSON.stringify( array ) );

			var ret = {
				type				: 'array'
				, key				: name
				, length			: {
					value			: array.length
					, comparator	: '='
				}
				, values			: {}
			};



			// Parse contents of the array
			if( array.length === 0 ) {
				// Nothing to do. ret.values stays empty.
			}

			// Get type of the items that the array consists of
			else {


				var type = new window.jb.StringTypeRecognizer().recognizeType( array[ 0 ] );
				if( angular.isArray( array[ 0 ] ) ) {
					type = 'array';
				}
				else if( angular.isObject( array[ 0 ] ) ) {
					type = 'object';
				}

				ret.values.type = type;



				// If array's children are arrays or objects, continue parsing
				if( type === 'array' ) {

					var parsed = parseArray( '', array[ 0 ] );
					console.error( 'parsed for array in array is ' + JSON.stringify( parsed ) );
					ret.values.values = parsed.values;
					ret.values.length = {
						value			: array[ 0 ].length
						, comparator	: '='
					};

				}
				else if (type === 'object' ) {

					var parsedObj = parseObject( '', array[ 0 ] );
					ret.values.properties = parsedObj.properties;

				}

			}


			return ret;

		}




		/**
		* Parses an object and returns it as
		* {
		*	type		: 'object'
		*	, name		: name
		*	, properties: [ {
		*		(property definitions)
		*	} ]
		* }
		*/
		function parseObject( name, object ) {

			console.log( 'BodyParserService: parse object ' + JSON.stringify( object ) );

			var keys = Object.keys( object );

			var ret = {
				type			: 'object'
				, key			: name
				, properties	: []
			};

			keys.forEach( function( key ) {

				ret.properties.push( parseData( key, object[ key ] ) );

			} );

			return ret;

		}





		/**
		* Parses any data (primitive type, object or array)
		*/
		function parseData( name, data ) {

			if( angular.isArray( data ) ) {
				return parseArray( name, data );
			}
			else if( angular.isObject( data ) ) {

				return parseObject( name, data );

			}
			else {
				return parseValue( name, data );
			}

		}








		var BodyParser = function() {

		};

		BodyParser.prototype.parse = function( data ) {

			// Return value
			var parsed

			// Parsed JSON data
				, parsedJSON;


			try {
				parsedJSON = JSON.parse( data );
			}
			catch( err ) {
				throw new Error( 'BodyParserService: data JSON could not be parsed.' );
			}

			parsed = parseData( 'body', parsedJSON );

			// Return name property on top-most entity (is 'body' that was previously attached).
			if( parsed && parsed.key ) {
				delete parsed.key;
			}

			console.log( 'Parsed: ' + JSON.stringify( parsed ) );
			return parsed;
			
		};




		return new BodyParser();


	} ] );



} )();
