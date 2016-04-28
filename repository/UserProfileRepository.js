"use strict";
var winston = require("winston");

var Profile = function(username){

        this.userName = username;
        this.firstName = "";
        this.lastName = "";
        this.email = ""
        this.status = "";
        this.offlineChannels = ["AWG-global"];
};

var ProfileRepository = function(userprofiles) {
    this.userprofiles = userprofiles;
}

ProfileRepository.prototype = {

    find: function(username) {
        console.log(username  + " is what I am looking for");
        console.log(this.userprofiles[username]);
        return this.userprofiles[username];
    }

    ,findAll: function(){
      return this.userprofiles;
    }

    ,put: function(profile) {
        this.userprofiles[profile.username] = profile;
    }


    ,merge: function(results){
        console.log(results.channels);
        for(let v of Object.keys(results.channels)){
            var channel = results.channels[v]
            for(let x of channel.uuids){
               if(this.userprofiles[x]){
                 this.userprofiles[x].offlineChannels.append(v);
               }
            }
        }
    }
};


exports.Repository =  ProfileRepository;
exports.Profile = Profile;
