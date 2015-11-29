(function() {
    'use strict';

    var   Class         = require('ee-class')
        , log           = require('ee-log')
        , Scenario      = require('../').Scenario
        ;





    module.exports = new Class({
        inherits: Scenario


        , duration: 10



        , init: function init(id) {
            this.id = id;

            init.super.call(this);
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
            return index < 90;
        }








        /**
         * returns a request that can be executed
         *
         * @param {number} index the request index
         *
         * @returns {promise}
         */
        , getRequestAt: function(index, request) {
            request.url = 'http://cornercard.127.0.0.1.xip.io:8000/de/';//+this.id;
            request.headers.accept = 'application/html';
            /*request.method = 'post';
            request.query.index = index;
            request.form.name = 'anna';*/

            return new Promise((resolve, reject) => {

                setTimeout(resolve, Math.random()*200);
            });
        }









        /**
         * time to prepare the scenario if there is 
         * anything to load it should be done here
         *
         * @returns {promise}
         */
        , prepare: function() {
            return Promise.resolve();
        }
    });
})();
