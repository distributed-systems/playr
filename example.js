(function() {
    'use strict';

    var   Class         = require('ee-class')
        , log           = require('ee-log')
        , Scenario      = require('./').Scenario
        , Playr         = require('./')
        ;





    let TestScenario = new Class({
        inherits: Scenario

        , duration: 10


        , hasRequestAt: function(index) {
            return index < 10000;
        }



        , getRequestAt: function(index, request) {
            request.url = 'http://cornercard.127.0.0.1.xip.io:8000/de/Veranstaltung/Naturally-7/e-404828';
    
            return new Promise((resolve, reject) => {
                setTimeout(resolve, Math.random()*100);
            });
        }
    });

    







    let playbook = new Playr({dashboard: true});


    playbook.threads(2).run(new TestScenario({name: 'test'}));


    playbook.play().then(() => {
        
    }).catch(log)
})();
