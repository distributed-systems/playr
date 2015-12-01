(function() {
    'use strict';

    var   Class         = require('ee-class')
        , log           = require('ee-log')
        , EventEmitter  = require('ee-event-emitter')
        ;





    module.exports = new Class({
        inherits: EventEmitter



        , init: function(scenario) {
            this.scenario = scenario;
        }





        /**
         * the scenario may need a response in order to 
         * create the next request
         */
        , setResponse: function(response) {

        }





        /**
         * checks if a request with the given
         * index exists
         *
         * @param {number} index the request index
         *
         * @returns {boolean} 
         */
        , hasRequestAt: function(index) {
            return this.scenario.hasRequestAt(index, this);
        }








        /** 
         * returns a request that can be executed
         *
         * @param {number} index the request index
         *
         * @returns {promise}
         */
        , getRequestAt: function(index, request) {
            return this.scenario.getRequestAt(index, request, this);
        }
    });
})();
