var accountSid = "ACea7e5a8d5790eee73beda8b5689637d1";
var authToken = "ed9d4c43baf628c539bb1f5ef7bc7a48";

var client = require("twilio")(accountSid, authToken);

client.calls.create(
  {
    url: "http://demo.twilio.com/docs/voice.xml",
    to: "+6588172025",
    from: "+12082093516",
  },
  function (err, call) {
    if (err) {
      console.log(err);
    } else {
      console.log;
    }
  }
);
