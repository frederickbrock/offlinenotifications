"use strict";
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

    find(username) {
        var idx = this._findIdx(username);
        if (idx > -1) {
            return this.userprofiles[idx];
        }
        return null;
    }

    findAll(){
      return this.userprofiles;
    }

    put(profile) {
        var profile = this.userprofiles[profile.username];
        if(profile == null){
          this.userprofiles[profile.username] = profile;
        }
    }

    toggleStatus(uuid) {
        profile = this.find(uuid);
        if(profile == null){
          winston.info("the profile being asked");
        }
        profile.status = (profile.status === "online") ? "offline" : "online";
        this.put(profile);
    }
}

exports.Repository =  profileRepository;
exports.UserProfile = UserProfile;
