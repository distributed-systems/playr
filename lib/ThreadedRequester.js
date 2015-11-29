(function() {
    'use strict';

    var   Class         = require('ee-class')
        , log           = require('ee-log')
        , HTTPRequest   = require('request')
        , Request       = require('./Request')
        , Response      = require('./Response')
        ;





    module.exports = new Class({



        // the number of threads to execute in parallel
        threadCount: 1


        // gobal request timeout
        , requestTimout: 10



        /**
         * initialize
         *
         * @param {object} scenarion the first scenarion of the set
         * @param {object} references to the parent builder
         */
        , init: function(playbook) {
            this.playbook = playbook;

            // set the global timeout
            this.requestTimout = playbook.requestTimout;
        }








        /**
         * executes the scenario
         *
         * @returns {Promise} promise
         */
        , run: function(scenario) {

            // execute a ll threads in parallel
            return Promise.all(Array.apply(null, {length: this.threadCount}).map(() => {
                return this.runThread(scenario);
            }));
        }









        /**
         * executes the scenario
         *
         * @param {scenario} scenario 
         *
         * @returns {Promise} promise
         */
        , runThread: function(scenario) {
            let executions = 1;


            let exec = (index) => {

                if (scenario.hasRequestAt(index)) {
                    let request = new Request();

                    return scenario.getRequestAt(index, request).then(() => {

                        // appl yrequest middlewares
                        return Promise.all(this.playbook.requestMiddleware.map((middleware) => {
                            return middleware.applyTo(request);
                        })).then(() => {

                            // execute the request
                            return this.request(request);
                        }).then((response) => {

                            // apply response middlewares
                            return Promise.all(this.playbook.responseMiddleware.map((middleware) => {
                                return middleware.applyTo(response);
                            }));
                        });
                    }).then(() => {

                        // nice, the request was executed
                        return exec(index + 1);
                    });
                }
                else {

                    // check if we needd to repeat the scenario
                    if (scenario.repetitions > executions) {
                        executions++;
                        return exec(0);
                    }
                    else return Promise.resolve();
                }
            }

            return exec(0);
        }









        /**
         * executes a single request
         *
         * @param {request} request
         *
         * @returns {Promise} promise
         */
        , request: function(request) {
            

            // shit uses callbacks, i start to 
            // belive that the request module needs
            // a major overhaul. the api is oldish
            // and there is missing functionality. 
            // for example: how to abort requests?
            // yup, that's that :/
            return new Promise((resolve, reject) => {
                let response = new Response(request);
                let timedOut = false;


                // dont wait for requests too long
                let timeout = setTimeout(() => {
                    timedOut = true;

                    // set the status
                    response.hasTimeout(request.timeout || this.requestTimout);


                    // don't fail, this is a soft error
                    resolve(response);
                }, (request.timeout || this.requestTimout)*1000);



                // execute the actual http response
                HTTPRequest(request.getHTTPRequestConfig(), (err, HTTPResponse) => {

                    // dont resume here if the 
                    // timeout was triggered
                    if (!timedOut) {

                        // clear the timeout
                        clearTimeout(timeout);

                        // let the reponse process the 
                        // request results and return
                        response.processResult(err, HTTPResponse).then(resolve).catch(reject);
                    }
                });
            });            
        }






        

        /** 
         * defines how many threads must be executed
         *
         * @param {number} threadCount
         *
         * @retruns {this}
         */
        , threads: function(threadCount) {
            this.threadCount = threadCount;

            return this;
        }        
    });
})();
