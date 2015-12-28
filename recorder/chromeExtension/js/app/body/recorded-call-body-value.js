/**
* Directive to display the headers of a request or response
*/

( function() {
	'use strict';

	angular
	.module( 'jb.apiBody.component' )
	.directive( 'recordedCallBodyValue', [ function() {

		return {
			controller			: 'RecordedCallBodyValueController'
			, controllerAs		: 'recordedCallBodyValue'
			, bindToController	: true
			, link				: function( scope, el, attrs, ctrl ) {

				ctrl.init( el );

			}
			, templateUrl		: '/js/app/body/recorded-call-body-value-template.html'
			, scope				: {
				data			: '='
			}
		};


	} ] )

	.controller( 'RecordedCallBodyValueController', [ function() {

		var _element
			, _stringTypeRecognizer = new jb.StringTypeRecognizer();

		this.init = function( el ) {
			_element = el;
		};

		this.getComparatorsForDataType = function() {
			var types = _stringTypeRecognizer.getComparatorsForType( this.data.type );
			return types;
		};

		// Make types accessible in frontend
		this.types = _stringTypeRecognizer.types;


	} ] );

} )();

