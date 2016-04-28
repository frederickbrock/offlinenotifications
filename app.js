"use strict"
var express = require('express'),
    bodyParser = require('body-parser'),
    winston = require('winston'),
    events = require("events");



module.exports = (function() {

    var repository = require("./repository/UserProfileRepository");
    var userprofiles = require("./user.json");
    var profileRepository = new repository.Repository(userprofiles);
    var app = express();

    var pubnub = require("pubnub").init({
        subscribe_key: "sub-c-856ccee2-ca2d-11e5-8a35-0619f8945a4f",
        publish_key: "pub-c-ab9467c4-ec29-4a0b-81bc-c52bb310da8d",
        ssl: true
    });


    //global here now
    pubnub.here_now({
        callback: function(results) {
            //console.log("global here now results:\n " + JSON.stringify(results));
            //profileRepository.merge(results);
        }
    })

    app.set('port', (process.env.PORT || 5000));
    app.use(express.static(__dirname + '/public'));
    app.use(bodyParser.json({
        strict: false
    }));


    app.get("/chatterbox/api/v1/wh/presence", (request, response) => {
        var userProfiles = profileRepository.findAll();
        response.status(200).json(userProfiles).end();
    });

    app.post("/chatterbox/api/v1/wh/presence", (request, response) => {
        winston.info('entering presence webhook');
        var event = request.body;

        pubnub.publish({
            channel: "wh-raw",
            message: event,
            callback: function(result) {
                winston.info("published status update");
            }
        });

        winston.info(event.uuid);

        if ((!event) || (!event.action)) {
            winston.info("could not process event: " + JSON.stringify(event));
            response.status(200).end();
            return;
        }
        //use a channel with the same name as the uuid to determine
        //if you need to update the status of the profile.
        if (event.channel === event.uuid) {
            winston.info("found personal channel: " + JSON.stringify(event));

            var profile = profileRepository.find(event.channel);
            if (profile === null) {
                winston.log("profile for uuid not found: " + event.uuid);
                response.status(200).end();
                return;
            }

            if (event.action === "join") {
                profile = new repository.Profile(event.uuid);
                profile.status = "loggingIn";
                profileRepository.put(profile);
            }

            if (event.action === "state-change") {
                //if the user sends lat/latlong
                winston.info("status");
                winston.info(event);

                if (event.data.latlong) {
                    profile.latlong = data.latlong;
                }

                if (event.data.status) {
                    profile.status = data.status;
                }
            }

            if ((event.action === "leave") || (event.action === "timeout")) {
                pubnub.where_now({
                    uuid: event.uuid,
                    callback: function(results) {
                        winston.info(results);
                        var lp = profileRepository.find(event.uuid);
                        if (lp != null) {
                            //add the channels to monitor
                            lp.offlineChannels = results;
                            profileRepository.put(lp);
                        }
                    }
                })
                profile.status = "offline";
            }

            profileRepository.put(profile);
            response.status(200).json(profile).end();
            return;
        }
        response.status(200).end();
    });




    app.listen(app.get('port'), function() {
        console.log('Node app is running on port', app.get('port'));
    });

})()
