/* global describe, beforeEach, afterEach, jb, it, expect */
( function() {

	'use strict';

	describe( 'BodyParserService', function() {

		var service;

		beforeEach( angular.mock.module( 'jb.apiBody.parser' ) );

		beforeEach( angular.mock.inject( function( BodyParserService ) {
			service = BodyParserService;
		} ) );

		afterEach( function() {
		} );


		it( 'Has a parse method.', function() {

			expect( typeof( service.parse ) ).toBe( 'function' );

		} );



		// Simple object
		var cases = [ {
			json 				: {
				name			: 'test'
			}
			, parsed			: {
				type			: 'object'
				, properties	: [ {
					key			: 'name'
					, type		: 'string'
					, value		: 'test'
					, comparator: '='
				} ]
			}

		}




		// String
		, {
			json: 'jegenstorf'
			, parsed			: {
				type			: 'string'
				, value			: 'jegenstorf'
				, comparator: '='
			}
		}




		// Nested objects
		// Properties: number, date, string
		, {
			json						: {
				profile					: {
					name				: 'felix'
					, mail				: {
						identifier		: 'felix'
					}
					, age				: 0
					, registrationDate	: '2015-05-02'
				}
			}
			, parsed					: {
				type					: 'object'
				, properties			: [ {
					key					: 'profile'
					, type				: 'object'
					, properties		: [ {
							key			: 'name'
							, type		: 'string'
							, comparator: '='
							, value		: 'felix'
						}, {
							key			: 'mail'
							, type		: 'object'
							, properties	: [ {
								key			: 'identifier'
								, type		: 'string'
								, comparator: '='
								, value		: 'felix'
							} ]
						}, {
							key			: 'age'
							, type		: 'number'
							, comparator: '='
							, value		: 0
						}, {
							key			: 'registrationDate'
							, type		: 'date'
							, comparator: '='
							, value		: '2015-05-02'
						} ]
				} ]

			}

		}





		// Array in object
		, {
			json: {
				profile			: [ {
					name		: 'felix'
					, score		: 5
				} ]
			}
			, parsed: {
				type			: 'object'
				, properties	: [ {
					type		: 'array'
					, length	: {
						comparator	: '='
						, value		: 1
					}
					, key		: 'profile'
					, values	: {
						type			: 'object'
						, properties	: [ {
							type		: 'string'
							, key		: 'name'
							, comparator: '='
							, value		: 'felix' // will not be displayed in frontend
						}, {
							type		: 'number'
							, comparator: '='
							, key		: 'score'
							, value		: 5
						} ]
					}
				} ]
			}
		}





		// Array with strings
		, {
			json					: [
				'pinot', 'syrah', 'riesling'
			]
			, parsed				: {
				type				: 'array'
				, length			: {
					comparator		: '='
					, value			: 3
				}
				, values			: {
					type			: 'string'
				}
			}
		}



		// Super nested array




		// Nested arrays
		, {
			json					: [ [ 'pinot', 'syrah' ], [ 'viognier', 'chardonnay' ] ]

			, parsed				: {
				type				: 'array'
				, length			: {
					value			: 2
					, comparator	: '='
				}
				, values			: {
					type			: 'array'
					, length		: {
						value		: 2
						, comparator: '='
					}
					, values		: {
						type		: 'string'
					}
				}
			}
		}





		// Empty array

		, {
			json				: []
			, parsed			: {
				type			: 'array'
				, length		: {
					comparator	: '='
					, value		: 0
				}
				, values		: {}
			}
		}









		// Array with numbers
		, {
			json					: [ 5, 4 ]
			, parsed				: {
				type				: 'array'
				, length			: {
					comparator		: '='
					, value			: 2
				}
				, values			: {
					type			: 'number'
				}
			}
		}





		// Array with objects
		, {

			json					: [ {
					name			: 'pinot'
					, size			: 0.05
				}, {
					name			: 'riesling'
				} ]

			, parsed				: {
				type				: 'array'
				, length			: {
					value			: 2
					, comparator	: '='
				}
				, values			: {
					type			: 'object'
					, properties	: [ {
							type		: 'string'
							, value		: 'pinot'
							, key		: 'name'
							, comparator: '='
						}, {
							type		: 'number'
							, value		: 0.05
							, key		: 'size'
							, comparator: '='
					} ]
					
				}
			}

		}

		];





		describe( 'When parsing a  JSON', function() {

			it( 'returns the correct value for all cases.', function() {

				cases.forEach( function( testCase ) {

					console.log( '-----' );
					//console.log( JSON.stringify( service.parse( JSON.stringify( testCase.parsed ) ) ) );
					//console.log( JSON.stringify( testCase.json ) );

					expect( service.parse( JSON.stringify( testCase.json ) ) ).toEqual( testCase.parsed );

				} );


			} );


		} );


	} );

} )();