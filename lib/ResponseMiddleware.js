(function() {
    'use strict';

    var   Class         = require('ee-class')
        , log           = require('ee-log')
        ;





    module.exports = new Class({


        // the middleware type
        type: 'response'






        /**
         * this method is called for every respüonse
         *
         * @param {response} response
         *
         * @returns {promise}
         */
        , applyTo: function(response) {
            return Promise.reject(new Error('The middleware does not implement the applyTo method!'))
        }
    });
})();
