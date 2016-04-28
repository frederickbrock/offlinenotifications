"use strict";
var winston = require("winston");

var Profile = function(username){

        this.username = username;
        this.firstname = "";
        this.lastname = "";
        this.latlong = "";
        this.status = "";
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
        var profile = this.userprofiles[profile.username];
        if(profile == null){
          this.userprofiles[profile.username] = profile;
        }
    }
};


exports.Repository =  ProfileRepository;
exports.Profile = Profile;
