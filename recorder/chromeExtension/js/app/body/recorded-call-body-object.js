/**
* Directive to display the headers of a request or response
*/

( function() {
	'use strict';

	angular
	.module( 'jb.apiBody.component' )
	.directive( 'recordedCallBodyObject', [ 'RecursionHelper', function( RecursionHelper ) {

		return {
			controller			: 'RecordedCallBodyObjectController'
			, controllerAs		: 'recordedCallBodyObject'
			, bindToController	: true
			, link				: function( scope, el, attrs, ctrl ) {

				ctrl.init( el );

			}
			// Manual compile: required as angular doesn't get recursive direcitves
			, compile			: function( element ) {
				return RecursionHelper.compile( element );
			}
			, templateUrl		: '/js/app/body/recorded-call-body-object-template.html'
			, scope				: {
				data			: '='
			}
		};


	} ] )

	.controller( 'RecordedCallBodyObjectController', [ function() {

		var _element;

		this.newPropertyKey = undefined;
		this.createNewProperty = false;

		this.init = function( el ) {
			_element = el;
		};

		this.removeProperty = function( property ) {
			this.data.properties.splice( this.data.properties.indexOf( property ), 1 );
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

