/**
* Directive to display the headers of a request or response
*/

( function() {
	'use strict';

	angular
	.module( 'jb.apiBody.component' )
	.directive( 'recordedCallBodyArray', [ 'RecursionHelper', function( RecursionHelper ) {

		return {
			controller			: 'RecordedCallBodyArrayController'
			, controllerAs		: 'recordedCallBodyArray'
			, bindToController	: true
			, link				: function( scope, el, attrs, ctrl ) {

				ctrl.init( el );

			}
			, templateUrl		: '/js/app/body/recorded-call-body-array-template.html'
			, scope				: {
				data			: '='
			}
			, compile			: function( element ) {
				return RecursionHelper.compile( element );
			}
		};


	} ] )

	.controller( 'RecordedCallBodyArrayController', [ function() {

		var _element;

		this.newPropertyKey = undefined;
		this.createNewProperty = false;

		this.init = function( el ) {
			_element = el;
		};

		this.removeProperty = function( property ) {
			alert( 'rm ' + property.key );
		};

		this.createProperty = function() {
			this.data.properties.push ( {
				key				: this.newPropertyKey
				, type			: jb.StringTypeRecognizer.types.string
			} );
			this.createNewProperty = false;
		};

	} ] );

} )();

