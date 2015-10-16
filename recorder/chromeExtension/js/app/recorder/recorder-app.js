/**
* Main-directive (instead of a controller) that handles the recorder app's topmost functionality.
*/
( function() {
	'use strict';

	angular
	.module( 'jb.apiRecorder', [ 'jb.apiRecorder.recorder', 'jb.apiRecorder.recorderService', 'jb.apiRecorder.settings', 'ngMaterial' ] )
	.directive( 'recorderApp', [ function() {

		return {
			controller				: 'RecorderAppController'
			, bindToController		: true
			, controllerAs			: 'recorderApp'
			, link					: function( scope, el, attrs, ctrl ) {

				ctrl.init( el );

			}
		};


	} ] )


	.controller( 'RecorderAppController', [ 'APIRecorderService', function( APIRecorderService ) {

		var _element
			, _recording = false
			, _settingsVisible = false;



		this.init = function() {

		};



		//
		// RECORD
		//

		this.isRecording = function() {
			return _recording;
		};

		this.toggleRecord = function() {

			if( _recording ) {
				APIRecorderService.pause();
			}
			else {
				APIRecorderService.record();
			}

			_recording = !_recording;

		};




		//
		// SETTINGS
		//

		this.toggleSettings = function() {
			_settingsVisible = !_settingsVisible;
		};

		this.settingsVisible = function() {
			return _settingsVisible;
		};





	} ] );

} )();

