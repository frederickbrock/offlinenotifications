

module.exports = function(emitter,profileRepository, pubnub){
  return (message,mentioned) => {
      var mentionedProfile = profileRepository.find(mentioned);
      if((mentionedProfile) && (mentionedProfile.status === "offline")){
        //publish a push
        var payload = {
            pn_gcm :{
                data: {
                  conversation: message.conversation
                  ,content: message.content
                }
                ,notification: {
                  body: message.from + " mentioned you in: " + message.conversation
                  ,title: "Chatterbox Notification"
                }
            }
        };

        pubnub.publish({channel: mentioned
                        ,message: payload
                        ,callback: function(r){ console.log("message sent"); }});
      }
  };
}
