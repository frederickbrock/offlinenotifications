"use strict"
var express = require('express'),
    bodyParser = require('body-parser'),
    winston = require('winston'),
    fs = require('fs'),
    path = require('path');

class UserProfile {

    constructor(username, firstname, lastname, latlong, status) {
        this.username = username;
        this.firstname = firstname;
        this.lastname = lastname;
        this.latlong = latlong;
        this.status = status;
    }

};


module.exports = (function() {



            var app = express();
            //this is my dataStore
            var offlineCache = {};

            var pubnub = require("pubnub").init({
                subscribe_key: "sub-c-856ccee2-ca2d-11e5-8a35-0619f8945a4f",
                publish_key: "pub-c-ab9467c4-ec29-4a0b-81bc-c52bb310da8d",
                ssl: true
            });

            app.set('port', (process.env.PORT || 5000));
            app.use(express.static(__dirname + '/public'));
            app.use(bodyParser.json({
                strict: false
            }));



            app.post('/chatterbox/api/v1/wh/presence', (request, response) => {
                    winston.info('entering presence webhook');
                    response.json(request.body);
                    pubnub.publish({
                        channel: "online-status",
                        message: request.body,
                        callback: function(result) {
                            winston.log("published status update");
                        }
                    });
                    var event = request.body;
                    if ((event != null) && (event.hasOwnerProperty("action")) && (event.action === "join")) {
                            if (event.hasOwnerProperty("uuid")) {
                                console.log("join event captured");
                            }
                    }
           });




                app.listen(app.get('port'), function() {
                    console.log('Node app is running on port', app.get('port'));
                });

            })()
