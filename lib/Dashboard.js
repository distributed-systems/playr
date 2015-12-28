(function() {
    'use strict';

    var   Class         = require('ee-class')
        , log           = require('ee-log')
        , blessed       = require('blessed')
        , contrib       = require('blessed-contrib')
        ;





    module.exports = new Class({


        styles: {
            requests: {
                  errored: 'red'
                , waiting: 'blue'
                , success: 'green'
                , failed: 'cyan'
                , timeout: 'magenta'
            }
            , percentiles: {
                  '50': 'white'
                , '90': 'blue'
                , '95': 'cyan'
                , '98': 'green'
                , '99': 'magenta'
                , '99.5': 'red'
                , '99.9': 'yellow'
            }
        }



        , init: function(playbook) {
            this.playbook = playbook;

            this.screen = blessed.screen();
            this.grid = new contrib.grid({rows: 12, cols: 12, screen: this.screen});

            // set data once a second
            setInterval(this.update.bind(this), 1000);

            this.render();
        }




        , render: function() {
            this.requests = this.grid.set(0, 0, 6, 8, contrib.line, {
                style: {
                      line: 'yellow'
                    , text: 'green'
                    , baseline: 'black'
                }
                , xLabelPadding: 3
                , xPadding: 5
                , showLegend: true
                , label: 'Requests / Second'
            });


            this.latency = this.grid.set(6, 0, 6, 8, contrib.line, {
                style: {
                      line: 'yellow'
                    , text: 'green'
                    , baseline: 'black'
                }
                , xLabelPadding: 3
                , xPadding: 5
                , showLegend: true
                , label: 'Aggreagted Response Latency per Second (ms, percentiles)'
            })


            this.screen.render();
        }





        , update: function() {
            let stats = this.playbook.statistics.getLiveAggregateData(120, 1);


            this.updateRequests(stats);
            this.updateTimings(stats);



            this.screen.render();
        }





        , updateTimings: function(stats) {
            let series = {};
            let startTime = -120;


            stats.forEach((item, index) => {
                Object.keys(item.percentiles.combined).map((serie) => {
                    if (!series[serie]) series[serie] = {x: [], y: [], title: serie+'%', style: {line: this.styles.percentiles[serie]}};

                    series[serie].x.push(startTime+index);
                    series[serie].y.push(item.percentiles.combined[serie] || 1);
                });
            });

            this.latency.setData(Object.keys(series).reverse().map((k) => series[k]));
        }







        , updateRequests: function(stats) {

            let series = {};
            let startTime = -120;


            stats.forEach((item, index) => {
                Object.keys(item.requests).map((serie) => {
                    if (!series[serie]) series[serie] = {x: [], y: [], title: serie, style: {line: this.styles.requests[serie]}};

                    series[serie].x.push(startTime+index);
                    series[serie].y.push(item.requests[serie]);
                });
            });

            this.requests.setData(Object.keys(series).map((k) => series[k]));
        }

    });
})();
