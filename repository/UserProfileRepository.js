"use strict";
var winston = require("winston");

var Profile = function(username){

        this.userName = username;
        this.firstName = "";
        this.lastName = "";
        this.email = ""
        this.status = "offline";
        this.offlineChannels = ["AWG-global"];
};

var ProfileRepository = function(userprofiles) {
    this.userprofiles = userprofiles;
}

ProfileRepository.prototype = {

    find: function(username) {
        return this.userprofiles[username];
    }

    ,findAll: function(){
      return this.userprofiles;
    }

    ,put: function(profile) {
        this.userprofiles[profile.userName] = profile;
    }


    ,merge: function(results){
        console.log(results.channels);
        for(let v of Object.keys(results.channels)){
            var channel = results.channels[v]
            for(let x of channel.uuids){
               if(this.userprofiles[x]){
                 this.userprofiles[x].offlineChannels.push(v);
               }
            }
        }
    }
};


exports.Repository =  ProfileRepository;
exports.Profile = Profile;
