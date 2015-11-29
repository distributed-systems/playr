# playr

description


[![npm](https://img.shields.io/npm/dm/playr.svg?style=flat-square)](https://www.npmjs.com/package/playr)
[![Travis](https://img.shields.io/travis/eventEmitter/playr.svg?style=flat-square)](https://travis-ci.org/eventEmitter/playr)
[![node](https://img.shields.io/node/v/playr.svg?style=flat-square)](https://nodejs.org/)


## API





    // import the required modules
    let   Playr                     = new require('playr')
        , FluffyAuthenticator       = require('playr-fluffy-authenticator')
        , FluffyRequestGenerator    = require('playr-fluffy-request-generator')
        ;



    // create a test scenario
    let playbook = new Playr();


    // the request strategy to use in order to be
    // able to simululate random traffic patterns
    // this takes the available threads and runs 
    // a random number at a given time of them 
    playbook.use(new RandomBurstStrategy({
        variance: 10
    }));


    // scales the load linear or using 
    // the pattern defined in the options
    // this stratgey can be used in combination
    // with other strategies
    playbook.use(new SimpleStrategy({
          0: 1
        , 30: 60
        , 100: 100
    }));



    // you can limit the amount of requests sent 
    // in a specific time, requests that cannot 
    // be sent will be queued for n seconds and then 
    // discarded. once a request was discarded all 
    // following requests of the scenarion are omitted 
    // an the next instance is executed
    playbook.use(new RequestRateLimiter());




    // use fluffy authentication 
    playbook.use(new FlluffyAuthenticator(soa, 'roleName'));




    // add a request generator that is executed beefore all others
    playbook.run(new PlayrRequestScenario('/path/to/file').threads(1))
        .and(new FluffyAPIEnumerator('http://cornercard.127.0.0.1.xip.io:8000'))
        .then(new PlayrRequestScenario(soa).threads(100).repeat(99).limit(300))
        .then(new PlayrRequestScenario(soa))
            .and(new PlayrRequestScenario(soa))
            .and(new PlayrRequestScenario(soa))
        .then(new PlayrRequestScenario(soa))
        


    playbook.run(frontpage)
                .then(promotionDetail.dontIdle())
                .up()
            .and(cinema)
                .then(promotionDetail.dontIdle())
                .and(eventDetail.dontIdle())     
                .and(movieDetail)
                    .then(checkout)
                        .then(movieDetail)
                        .up()
                    .up()
                .and(promotionDetail.dontIdle())
                .up()
            .thereAfter(movieList)
            .thereAfter(moviesBern)


    // run 4 hours
    playbook.runFor(3600*4);


    // the scenario should be executed 10 times
    playbook.repeat(10);


    // enable scenario recording
    playbook.recordTo('/path/to/dir');


    // start the scenario
    playbook.start();




