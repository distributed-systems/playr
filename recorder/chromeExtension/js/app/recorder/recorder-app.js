/**
* Main-directive (instead of a controller) that handles the recorder app's topmost functionality.
*/
( function() {
	'use strict';

	angular
	.module( 'jb.apiRecorder', [ 'jb.apiRecorder.recorder', 'jb.apiRecorder.recorderService', 'jb.apiRecorder.settings', 'jb.apiBody.component', 'ngMaterial' ] )
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

		var _recording = false
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




		//
		// EXPORT / CLEAR
		//

		/**
		* Returns true if data was recorded and not all calls were deleted
		*/
		this.hasData = function() {
			if( APIRecorderService.getCalls() && APIRecorderService.getCalls().length ) {
				return true;
			}
			return false;
		};

		this.clearData = function() {
			APIRecorderService.clearCalls();
		};

		this.exportData = function() {
			alert( JSON.stringify( APIRecorderService.exportCalls() ) );
		};



	} ] );

} )();

