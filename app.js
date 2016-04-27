var express = require('express'),
    bodyParser = require('body-parser'),
    winston = require('winston'),
    fs = require('fs'),
    path = require('path');


module.exports = (function() {

            var app = express();
            //this is my dataStore
            var offlineCache = {};

            app.set('port', (process.env.PORT || 5000));
            app.use(express.static(__dirname + '/public'));
            app.use(bodyParser.json({
                strict: false
            }));


            //CORS Support
            app.use('*', function(req, res, next) {
                res.header('Access-Control-Allow-Origin', '*');
                res.header('Access-Control-Allow-Credentials', true);
                res.header('Access-Control-Allow-Methods', 'POST, GET, PUT, DELTE, OPTIONS');
                res.header('Access-Control-Allow-Headers', 'Content-Type');

                // intercept OPTIONS method
                if ('OPTIONS' == req.method) {
                    res.status(200).end();
                } else {
                    next();
                }
            });

            app.post('/chatterbox/api/v1/wh/presence', function(request, response) {
                    winston.info('entering presence webhook');
                    response.json(request.body);

            });




          app.listen(app.get('port'), function() {
              console.log('Node app is running on port', app.get('port'));
          });

})()
