(function() {
    'use strict';

    var   Class         = require('ee-class')
        , log           = require('ee-log')
        ;





    module.exports = new Class({






        // query string
         _query: null
        , hasQuery: false
        , query: {
            get: function() {
                if (!this._query) this._query = {};
                return this._query;
            }
            , set: function(query) {
                this._query = query;
            }
        }



        // headers
        , _headers: null
        , headers: {
            get: function() {
                if (!this._headers) this._headers = {};
                return this._headers;
            }
            , set: function(headers) {
                this._headers = headers;
            }
        }




        // form
        , _formData: null
        , formData: {
            get: function() {
                if (!this._formData) this._formData = {};
                return this._formData;
            }
            , set: function(formData) {
                this._formData = formData;
            }
        }
        , form: {
            get: function() {
                if (!this._formData) this._formData = {};
                return this._formData;
            }
            , set: function(formData) {
                this._formData = formData;
            }
        }




        // body, cuzstim format
        , body: null


        // request method
        , method: 'get'


        // path
        , url: ''




        // the time the request was sent
        , startTime: null

        
        // the id, so it can be identified
        , id: null





        /**
         * should be called to get the http config for the request.
         * set the startTime timestamp
         *
         * @returns {object} request config
         */
        , send: function() {
            this.startTime = Date.now();

            return this.getHTTPRequestConfig();
        }










        /**
         * once a request is finished its 
         * response is linkedd to it
         *
         * @param {response}
         */ 
        , setResponse: function(response) {
            this.response = response;
        }












        /**
         * returns the HTTP requeste config as used
         * by the request module
         *
         * @returns {object} config
         */
        , getHTTPRequestConfig: function() {
            let config = {};

            config.method = this.method;
            config.url = this.url;


            if (this._headers) config.headers = this.headers;
            if (this._query) config.qs = this.query;

            if (this.body) config.body = this.body;
            else if (this._formData) config.form = this.formData;

            return config;
        }
    });
})();
