
var chai = require('chai'),
    mocha = require('mocha'),
    request = require('request'),
    minimist = require('minimalist');

var assert = chai.assert;

describe('auth a user for chatterbox api access calls', function() {

  var config = {

    'development': {
      'api':{
        host: 'localhost'
        ,port: 5000
      }
    }
  };

  var environment = config["development"];
  var baseURL = 'http://' + environment.api.host + ":" + environment.api.port + "/chatterbox/api/v1/wh/presence";

  before(function(){

  });

  it('should return change the status to loggingIn',function(done) {

      var options = {
        url: baseURL
        ,method: 'POST',
        body: {
          "uuid": "frederickbrock",
          "timestamp": 1461791583,
          "occupancy": 1,
          "action": "join",
          "sub_key": "dmo",
          "channel": "frederickbrock"
      },
        json: true
      };

      request(options, function(err, response, body) {
        console.log(JSON.stringify(response));
        assert.isTrue(response.statusCode == 200, "statusCode should have been 200 but was not");
        assert.isTrue((body.status == "loggingIn"), "body should contain a property called 'status'");
        done();
      });
  });

  it("should transistion from loggingIn to online",function(done) {

      var options = {
        url: baseURL
        ,method: 'POST',
        body: {
          "uuid": "frederickbrock",
          "timestamp": 1461791583,
          "occupancy": 1,
          "action": "state-change",
          "sub_key": "dmo",
          "channel": "frederickbrock"
          "data": {
            status: "online"
            ,firstName: "Frederick"
            ,lastName: "Brock"
            ,username: "frederickbrock"
          }
      },
        json: true
      };

      request(options, function(err, response, body) {
        assert.isTrue(response.statusCode == 200, "statusCode should have been 200 but was not");
        assert.isTrue((body.status == "online"), "body should contain a property called 'status'");
        done();
      });
  });


});
