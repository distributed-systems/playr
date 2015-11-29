(function() {
    'use strict';

    var   Class         = require('ee-class')
        , log           = require('ee-log')
        ;





    module.exports = new Class({


        // flags if the request has a timeout
        status: 'unknown'

        // http status code
        , statusCode: null

        // how long did we wait for the timeout
        , timeoutTime: 0






        /**
         * initialize
         *
         * @param {object} request
         */
        , init: function(request) {
            this.request = request;
        }








        /**
         * store the result of the request
         *
         * @param {error} err
         * @param {HTTPResponse} HTTPResponse
         *
         * @returns {promise}
         */
        , processResult: function(err, HTTPResponse) {

            if (err) {
                this.status = 'error';
                this.err = err;
            }
            else {
                this.status = 'success';

                // decode body
                let contentType = (HTTPResponse.headers['content-type'] || '').toLowerCase().trim();
                this.body = HTTPResponse.body;

                if (contentType === 'application/json') {
                    {
                        try {
                            this.data = JSON.parse(this.body)
                        } catch (e) {
                            
                        }
                    }
                }


                // status
                this.statusCode = HTTPResponse.statusCode;
            }


            return Promise.resolve(this);
        }






        /**
         * is called if the request encountered a timeout
         *
         * @param {number} after
         */
        , hasTimeout: function(after) {
            this.status = 'timeout';
            this.timeoutTime = after;
        }
    });
})();
