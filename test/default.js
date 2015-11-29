(function() {
    'use strict';

	var   Class 		= require('ee-class')
		, log 			= require('ee-log')
		, assert 		= require('assert');



	var   Playr = require('../')
        , TestScenario = require('./TestScenario')







	describe('Playr', function(){
		it('should not crash when instantiated', function() {
            new Playr();
		});


        it('should accept a new threadcount', function() {
            let playbook = new Playr();

            playbook.threads(100);
        });


        it('should accept a new request timeout', function() {
            let playbook = new Playr();

            playbook.setRequestTimeout(5);
        });


        it('should accept a new repeat value', function() {
            let playbook = new Playr();

            playbook.repeat(99);
        });
	});









    describe('Scenarios', function(){
        it('adding a single scenario', function() {
            let playbook = new Playr();

            playbook.run(new TestScenario(1));
        });


        /*it('running a single scenario', function(done) {
            let playbook = new Playr();

            playbook.run(new TestScenario(1));


            playbook.play().then((stats) => { //log(stats);
                done();
            }).catch(done);
        });*/


        it('running a single scenario and get stats', function(done) {
            this.timeout(15000);

            let playbook = new Playr();

            playbook.run(new TestScenario(1));


            playbook.play().then((stats) => { log(stats.getLiveAggregateData(10, 1));
                done();
            }).catch(done);
        });
    });
})();
