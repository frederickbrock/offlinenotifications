"use strict"
var express = require('express'),
    bodyParser = require('body-parser'),
    winston = require('winston'),
    events = require("events");

class Profile {

    constructor(username) {
        this.username = username;
        this.firstname = firstname;
        this.lastname = lastname;
        this.latlong = latlong;
        this.status = status;
    }

};

class ProfileRepository {

    constructor() {
        //this should be your userstore.
        this.userprofiles = require("./user.json");
    }

    _findIdx(username) {
        for (var idx = 0; idx < userprofiles.length; ++idx) {
            if (userprofiles[idx].username === username) {
                return idx;
            }
        }
        return -1;
    }

    find(username) {
        var idx = this.findIdx(username);
        if (idx > -1) {
            return userprofiles[idx];
        }
        return null;
    }

    findAll(){
      return this.userprofiles;
    }

    put(profile) {
        var userIdx = this._findIdx(profile.username);
        if (userIdx == -1) {
            userprofiles.append(profile);
        }
    }

    toggleStatus(uuid) {
        profile = this.find(uuid);
        profile.status = (profile.status === "online") ? "offline" : "online";
        this.put(profile);
    }


}


module.exports = (function() {



    var app = express();
    //this is my dataStore
    var profileRepository = new ProfileRepository();

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
        response.json(200,userProfiles).end();
    })

    app.post("/chatterbox/api/v1/wh/presence", (request, response) => {
        winston.info('entering presence webhook');

        pubnub.publish({
            channel: "wh-raw",
            message: request.body,
            callback: function(result) {
                winston.log("published status update");
            }
        });

        var event = request.body;

        if ((event != null) || (!event.hasOwnerProperty("action"))) {
            winston.log("could not process event")
            response.status(200).end();
            return;
        }
        //use a channel with the same name as the uuid to determine
        //if you need to update the status of the profile.
        if (event.channel === event.uuid) {
            winston.log("found personal channel: " + event.channel);
            profile = profileRepository.find(event.uiid);
            if (profile === null) {
                winston.log("profile for uuid not found: " + event.uuid);
                response.status(200).end();
            }

            if (event.action === "join") {
                if (profile === null) {
                    profile = new UserProfile(event.uuid);
                    profile.status = "loggingOn";
                    profileRepository.put(profile);
                }
            }

            if (event.action === "state-change") {
                //if the user sends lat/latlong
                if (event.data.hasOwnerProperty("latlong")) {
                    profile.latlong = data.latlong;
                }

                if (event.data.hasOwnerProperty("status")) {
                    profile.status = data.status;
                }
            }

            if ((event.action === "leave") || (event.action === "timeout")) {
                profileRepository.toggleStatus(event.uuid);
            }


      }

      res.status(200).end();

    });




    app.listen(app.get('port'), function() {
        console.log('Node app is running on port', app.get('port'));
    });

})()
