"use strict"
var express = require('express'),
    bodyParser = require('body-parser'),
    winston = require('winston'),
    events = require("events");



module.exports = (function() {

    var repository = require("./repository/UserProfileRepository");
    var profileRepository = new repository.Repository();


    var app = express();
    
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


    app.get("/chatterbox/api/v1/presence", (request, response) => {
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

        if ((!event) || (!event.action)) {
            winston.info("could not process event: "  + JSON.stringify(event));
            response.status(200).end();
            return;
        }
        //use a channel with the same name as the uuid to determine
        //if you need to update the status of the profile.
      if (event.channel === event.uuid) {
            winston.info("found personal channel: " + event.channel);
            profile = profileRepository.find(event.uiid);
            if (profile === null) {
                winston.log("profile for uuid not found: " + event.uuid);
                response.status(200).end();
                return;
            }

            if (event.action === "join") {
                if (profile === null) {
                    profile = new UserProfile(event.uuid);
                    profile.status = "loggingOn";
                }
            }

            if (event.action === "state-change") {
                //if the user sends lat/latlong
                if (event.data.latlong) {
                    profile.latlong = data.latlong;
                }

                if (event.data.status) {
                    profile.status = data.status;
                }
            }

            if ((event.action === "leave") || (event.action === "timeout")) {
                profile.status = "offline";
            }

            profileRepository.put(profile);
      }

      res.status(200).end();

    });




    app.listen(app.get('port'), function() {
        console.log('Node app is running on port', app.get('port'));
    });

})()
