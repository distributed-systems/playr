(function() {
    'use strict';

    var   Class         = require('ee-class')
        , log           = require('ee-log')
        ;





    module.exports = new Class({


        // the number of threads to use to playback this
        // scenario
        threadCount: 1


        // name of the scenario
        , name: 'unknown'


        // the scenario may have a description
        , description: ''


        // the duration ot the scenario
        , duration: 0


        // how many times the scenario must be repeated
        , repetitions: 1




        /**
         * initialize
         *
         * @param {object} options
         */
        , init: function(config) {
            if (config) {
                if (config.name)        this.name        = config.name;
                if (config.description) this.description = config.description;
                if (config.threadCount) this.threadCount = config.threadCount;
                if (config.threads)     this.threadCount = config.threads;
                if (config.repetitions) this.repetitions = config.repetitions;
                if (config.duration)    this.duration    = config.duration;
            }
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
            throw new Error('Not implemented!');
        }








        /** 
         * returns a request that can be executed
         *
         * @param {number} index the request index
         *
         * @returns {promise}
         */
        , getRequestAt: function(index, request) {
            return Promise.reject(new Error('Not implemented!'));
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









        /** 
         * lets the user set how many times to repeat
         * this scenario
         *
         * @param {number} repetitions
         *
         * @returns {this}
         */
        , repeat: function(repetitions) {
            this.repetitions = repetitions;
        }










        /**
         * defines how many threads of this scenario
         * to execute in parallel
         *
         * @param {number} threadCount
         *
         * @returns {this}
         */
        , threads: function(threadCount) {
            this.threadCount = threadCount;
        }
    });
})();
