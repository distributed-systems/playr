(function() {
	'use strict';

	var   Class 		         = require('ee-class')
        , type                   = require('ee-types')
        , EventEmitter           = require('ee-event-emitter')
		, log 			         = require('ee-log')
        , ScenarioBuilder        = require('./ScenarioBuilder')
        , Statistics             = require('./Statistics')
        , ThreadedRequester      = require('./ThreadedRequester')
        , Dashboard              = require('./Dashboard')
        ;







	let Playr = module.exports = new Class({



        // indicates if the process is running
        running: false

        // global request timeout value
        , requestTimout: 10


        // if set, the playbook must run for this
        // amount of seconds
        , runningTime: null

        // how many times to repeat the playbook
        , iterations: 1

        // the request timeout in ms
        , requestTimeout: 60000

        // the user may define a factor for the 
        // playback speed of the requests. this
        // does not affect the runnigTime
        , speed: 1

        // the user may define how many threads to
        // run of this scenario
        , threadCount: 1




        // display the dashboard
        , enableDashboard: false




        // the computed duration for executing 
        // the scenario set on time (seconds)
        , duration: 0


        // the time the current iteration has started
        // in ms
        , startTime: 0


        // the number of finished iterations
        , iterationsDone: 0


        // current progress into the current 
        // iteration of the playbook in percent
        , progress: {
            get: function() {
                let iterationProgress = (Math.round((Date.now()-this.startTime)/1000)/(this.duration || 1))*100;
                let progress = this.iterationsDone/this.iterations*100;

                return Math.round(iterationProgress/100*progress*100)/100;
            }
        }




        // valid middleware types
        , validMiddleware: new Set(['request', 'response', 'strategy'])


        // references the root builder
        , rootBuilder: null








        /**
         * set up the class
         */
		, init: function(options) {


            // currently there are three types of middlewares
            // supported: the ones that modify the requests,
            // the ones that work on the respnses and the ones
            // that can modiy the pattern and pace of the requests
            // sent to the server. 

            this.requestMiddleware = [];
            this.responseMiddleware = [];
            this.strategyMiddleware = [];


            // check if the dashboard shoul be displayed
            this.enableDashboard = options && options.dashboard;
		}










        /**
         * starts the playbook. analyzes the scenarios
         * that were added, computes the duration of the
         * scenarios and initializes the middlewares
         *
         * @returns {Promise} a promise
         */
        , play: function() {

            // there must be something to work on?
            if (!this.rootBuilder) return Promise.reject(new Error('Cannot play playbook, it doesn\'t contain any scenarios!'));

            // dont execute in parallel 
            if (this.running) return Promise.reject(new Error('Cannot play playbook, it is already beeing executed!'));



            // make sure the user startsnot twice
            this.running = true;

            // reset values
            this.iterationsDone = 0;

            // the statistics
            this.statistics = new Statistics(this);



            // display the dashboard?
            if (this.enableDashboard) {
                this.dashboard = new Dashboard(this);
            }



            // prepare the scenarios
            return this._prepareScenarios(this.rootBuilder.sets).then(() => {

                // get the duration of one iteration
                // of this playbook
                this.duration = this._computeDuration(this.rootBuilder.sets)*this.speed || 1;



                // execute the playbook
                let exec = () => {
                     return this._execute(this.rootBuilder.sets).then(() => {

                        // keep track of stuff
                        this.iterationsDone++;


                        // one iteration is done, do we have to do another one?
                        if (this._isFinished()) return Promise.resolve();
                        else return exec();
                    });
                }

                // execute
                return exec();
            }).then(() => {
                
                // nice, the playbook has finished
                this.running = false;

                // return the statistics to the user
                return Promise.resolve(this.statistics);
            });
        }










        /**
         * checks uf the playbook should execute another iteration
         * or if we're finished
         *
         * @returns {boolean} true if the playbook has finishe
         */
        , _isFinished: function() {
            if (this.runningTime) {
                if (this.progress >= this.runningTime) return true;
                else return false;
            } 
            else if (this.iterationsDone >= this.iterations) return true;
            else return false;
        }










        /**
         * executes the scenarios
         *
         * @returns {Promise} a promise
         */
        , _execute: function(setCollection) {

            // execute one set after another
            let exec = (index) => {
                if (setCollection[index]) {
                    return this._executeSet(setCollection[index]).then(() => {
                        return exec(index+1);
                    });
                }
                else return Promise.resolve();
            }

            // return as soon as we're done
            return exec(0);
        }









        /**
         * executes the scenarios of one set
         *
         * @param {scenarios[]} set the set containing scenarions
         *
         * @returns {Promise} a promise
         */
        , _executeSet: function(set) {

            return Promise.all(set.map((scenario) => {

                // execute the scenario
                return this._executeScenario(scenario).then(() => {

                    // execute children if they exist
                    if (scenario.children) return this._execute(scenario.children);
                    else return Promise.resolve();
                })
            }));
        }









        /**
         * execute the requests of one scenario
         *
         * @param {scenario} scenario
         *
         * @returns {Promise} a promise
         */
        , _executeScenario: function(scenario) {

            // get the current load factor to run with
            // the load is normally at 100%, but it can be 
            // modified by middlewares
            let progress = this.progress;


            return Promise.all(this.strategyMiddleware.map((middleware) => {
                return middleware.getThreadMultiplier(progress);
            })).then((multipliers) => {

                // the factor defines how many threads should be 
                // executed in parallel
                let threadFactor = multipliers.reduce((previous, current) => previous*current, 1);

                // this can be a huge number, global threads times
                // the scenario threads (usually 1). cannot be less
                // than one thread
                let scenarioThreadCount = Math.max(1, scenario.threadCount*this.threadCount*threadFactor);
                

                // create a new threaded requester
                return new ThreadedRequester(this).threads(scenarioThreadCount).run(scenario);
            });
        }












        /**
         * collect the scenario duration which may
         * be used to compute the the required load
         * on any given time for not time based tests
         *
         * @param {set[]} sets
         *
         * @returns {number} the duration of the set
         */
        , _computeDuration: function(sets) {
            let duration = 0;

            // we need the max duration for each set
            sets.forEach((set) => {
                let maxDuration = 0;

                set.forEach((scenario) => {
                    let scenarioDuration = scenario.duration * scenario.repetitions;

                    // get the duration of all children
                    if (scenario.children) scenarioDuration += this._computeDuration(scenario.children);

                    // only count our duration if its bigger than 
                    // all others before
                    if (scenarioDuration > maxDuration) maxDuration = scenarioDuration;
                });

                duration += maxDuration;
            });


            return duration;
        }











        /**
         * calls the prepare method on all scenarios
         * which will cause the to prepare themself
         *
         * @returns {Promise} a promise
         */
        , _prepareScenarios: function(sets) {
            let duration = 0;

            // the set of of a builder contain more sets
            // which contain the scenarios.
            return Promise.all(sets.map((set) => {
                return Promise.all(set.map((scenario) => {

                    return scenario.prepare().then(() => {

                        // add my duration to the total duration
                        duration += scenario.duration;

                        if (scenario.children) return this._prepareScenarios(scenario.children);
                        else return Promise.resolve();
                    });                    
                }));
            })).then(() => {

                // return the duration of the set
                return Promise.resolve(duration);
            });
        }










        /**
         * this is the entrypoint for scenarios. returned
         * is a scenario builder that lets you compose the 
         * requests that should be executed
         *
         * @param {object} scenario
         *
         * @returns the root scenario builder
         */
        , run: function(scenario) {
            this.rootBuilder = new ScenarioBuilder(scenario); 

            return this.rootBuilder;
        }











        /**
         * defines how many times the playbook shoud be 
         * repeated. this is overruled by the value
         * provided to the runFor metod
         *
         * @param {number} repetitions the number of repetitoins
         *
         * @raturns {this}
         */
        , repeat: function(iterations) {
            this.iterations = iterations;

            return this;
        }








        /**
         * tell the playbook how long it must run
         * this will override the reperat and request
         * count rules
         *
         * @param {number} seconds the number of seconds to run for
         *
         * @raturns {this}
         */
        , runFor: function(seconds) {
            this.runningTime = seconds;

            return this;
        }










        /**
         * the user may define how many threads he likes
         * to run in parallel
         *
         * @param {number} threads the number of threads that
         *                 are executed in paralell
         *
         * @returns {this}
         */
        , threads: function(threads) {
            this.threadCount = threads;

            return this;
        }










        /**
         * set the global request timeout
         *
         * @param {number} requestTimout
         *
         * @returns {this}
         */
        , setRequestTimeout: function(requestTimout) {
            this.requestTimout = requestTimout;

            return this;
        }









        /**
         * the user may add middleware for modifying
         * requests or define how requests should be
         * executed
         *
         * @paam {object} middleware the middleware to use
         */
        , use: function(middleware) {

            if (this.validMiddleware.has(middleware.type)) {
                this[`${middleware.type}Middleware`].add(middleware);
            }
            else throw new Error('Cannot add middleware, middleware type not supported!');

            return this;
        }
	});
})();
