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
    var emitter = new events.EventEmitter();

    var pubnub = require("pubnub").init({
        subscribe_key: "sub-c-856ccee2-ca2d-11e5-8a35-0619f8945a4f",
        publish_key: "pub-c-ab9467c4-ec29-4a0b-81bc-c52bb310da8d",
        ssl: true
    });

    var atmention = require("./procs/atmention")(emitter,profileRepository, pubnub);
    //others email, sms, smoke signals, launch pigeons
    emitter.on("process-at-mention", atmention);

    //TODO::Fancy implement advanced javascript
    //            channel groups code here!!
    pubnub.subscribe({
      channel: "AWG-global"
      ,message: function(message,e,ch){
          var r = /(\S*)@(\S+)/g
          if(r.match(message.content)){
            while(null != (value = r.exec(message.content))){
                winston.info(value);
                emitter.emit("process-at-mention",message, value);
            }
          }
      }
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
        var event = request.body;
        winston.info('entering presence webhook for uuid/user: ' + event.uuid);

        pubnub.publish({
            channel: "wh-raw",
            message: event,
            callback: function(result) {
                winston.info("published status to wh-raw channel{" + result[2] + "}");
            }
        });


        if ((!event) || (!event.action)) {
            winston.info("could not process event: " + JSON.stringify(event));
            response.status(200).end();
            return;
        }
        //use a channel with the same name as the uuid to determine
        //if you need to update the status of the profile.
        if (event.channel === event.uuid) {
            winston.info("user-status-change-event captured: " + event.channel);
            var profile = profileRepository.find(event.channel);
            if (profile === null) {
                winston.log("profile for uuid not found: " + event.uuid);
                response.status(200).end();
                return;
            }

            if (event.action === "join") {
                profile = new repository.Profile(event.uuid);
                winston.info("user-status-change-event: changed status for" + profile.userName +  " from " + profile.status + "to loggingIn" );
                profile.status = "loggingIn";
                profileRepository.put(profile);
            }

            if (event.action === "state-change") {
                //if the user sends lat/latlong
                winston.info("status-change with data");
                winston.info(event.data);

                if (event.data.status) {
                    profile.status = event.data.status;
                }

                profile.firstName = event.data.firstName;
                profile.lastName = event.data.lastName;
                profile.email = event.data.email;
                profile.userName = event.data.userName;

            }

            if ((event.action === "leave") || (event.action === "timeout")) {

                /*SAMPLE...use whereNow to capture a list of offline
                 channels to monitor*/
                pubnub.where_now({
                    uuid: event.uuid,
                    callback: function(results) {
                        winston.info(results);
                        var lp = profileRepository.find(event.uuid);
                        if (lp != null) {
                            lp.offlineChannels = results.channels;
                            //make sure they are on the global channel
                            //this is only for DEMO...
                            lp.offlineChannels.push("AWG-global");
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
