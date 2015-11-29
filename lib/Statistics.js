(function() {
    'use strict';

    var   Class         = require('ee-class')
        , log           = require('ee-log')
        ;





    module.exports = new Class({




        /**
         * initialize
         *
         */
        init: function(playbook) {
            this.playbook = playbook;


            // storage for the requests sent
            this.requests = [];
        }





        /**
         * get a neat statsitics object
         */
        , getLiveAggregateData: function(timeSpan, groupInterval) {
            let rows = [];
            let minDate = Date.now()-timeSpan*1000-1000;
            let index = this.requests.length-1;

            groupInterval = Math.round(groupInterval*1000);

            let nextDateOffset = Date.now()-groupInterval;

            let currentSet;


            while(nextDateOffset > minDate) {
                currentSet = {
                      errored: 0
                    , waiting: 0
                    , timeout: 0
                    , success: 0
                    , failed: 0
                    , timings: {
                          combined: []
                        , post: []
                        , get: []
                        , put: []
                        , delete: []
                        , options: []
                    }
                    , percentiles: {}
                    , average: {}
                };


                // add requests that fall inside the set
                while (index >= 0 && this.requests[index].startTime > nextDateOffset) {
                    let request = this.requests[index];

                    if (request.response) {
                        switch (request.response.status) {
                            case 'error': 
                                currentSet.errored++;
                                break;

                            case 'timeout':
                                currentSet.timeout++;
                                break;

                            case 'success':
                                currentSet.success++;

                                // only the timings for successfull requsts are 
                                // of interest ti us
                                if (request.response.endTime) {
                                    currentSet.timings[request.method].push(request.response.endTime-request.startTime);
                                    currentSet.timings.combined.push(request.response.endTime-request.startTime);
                                }
                                break;

                            case 'failed':
                                currentSet.failed++;
                                break;

                            case 'waiting':
                                currentSet.waiting++;
                                break;
                        }
                    }
                    else currentSet.waiting++;


                    index--;
                }




                // compute percentiles
                Object.keys(currentSet.timings).forEach((key) => {
                    let set = currentSet.timings[key];

                    // rpepare storage
                    currentSet.percentiles[key] = {};
                    

                    if (set.length) {

                        // bonus: average
                        currentSet.average[key] = Math.round(set.reduce((p, v) => p+v, 0)/set.length);

                        
                        set.sort((a, b) => {return a > b ? 1 : -1});

                        [50, 90, 95, 98, 99, 99.5, 99.9].forEach((percentile) => {
                            let index = percentile/100*set.length;

                            if (Number.isInteger(index)) currentSet.percentiles[key][percentile] = (set[index-1]+set[index])/2;
                            else currentSet.percentiles[key][percentile] = set[Math.round(index)-1];
                        });
                    }
                });



                // add the finished set
                rows.push(currentSet);

                // reduce offset
                nextDateOffset -= groupInterval;
            }


            return rows;
        }







        /**
         * used to add completed requests
         */
        , add: function(request) {
            this.requests.push(request);
        }
    });
})();
