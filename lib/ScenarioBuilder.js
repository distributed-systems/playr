(function() {
    'use strict';

    var   Class                  = require('ee-class')
        , type                   = require('ee-types')
        , EventEmitter           = require('ee-event-emitter')
        , log                    = require('ee-log')
        ;







    let ScenarioBuilder = module.exports = new Class({




        /**
         * creates storage for the sets, sets up
         * the first set and adds the scenario to
         * that set. stores the parent as reference
         * so the user can us the up mehtod
         *
         * @param {object} scenarion the first scenarion of the set
         * @param {object} references to the parent builder
         */
        init: function(scenario, parent) {


            // storage for all sets of scenarios
            this.sets = [];



            // add the sceario to a ne scenarioset
            this.thereAfter(scenario);


            // we need the parent for the up mehod
            // it returns the parent builder
            this.parent = parent;
        }




            
        



        /**
         * add a sccenario to the current set
         *
         * @param {object} scenario
         *
         * @returns {this}
         */
        , and: function(scenario) {
            this.currentSet.push(scenario);
            
            return this;
        }










        /**
         * creaate a new scenario set, add the scenario
         * creates a new builder, returns it
         *
         * @param {object} scenario
         *
         * @returns {builder}
         *
         */
        , then: function(scenario) {
            let builder = new ScenarioBuilder(scenario); 


            // set the sets of the new builder as children 
            // of the last added scenario
            if (!this.currentSet.length) throw new Error('Cannot add scenario as child, there was no parent defined!');
            else this.currentSet[this.currentSet.length-1].children = builder.sets;


            // return the new scope
            return builder;
        }




        





        /**
         * creates a new scenario set, adds the scenario
         *
         * @param {object} scenario
         *
         * @returns {this}         
         */
        , thereAfter: function(scenario) {

            // create a new set  
            this.currentSet = [];
            this.sets.push(this.currentSet);


            // add the inital scenario to the set
            this.currentSet.push(scenario);

            // return the current scope
            return this;
        }











        /**
         * returns a reference to the parent
         * scenario builder
         *
         * @returns {object} parent scenario builder
         */
        , up: function() {
            if (!this.parent) throw new Error('Cannot go up, you are already at the root level!');
            else return this;
        }
    });
})();
