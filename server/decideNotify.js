msg.payload = {};

let homeNormalAlerted = context.get("homeNormalAlerted") || false;
let homeSmokeAlerted = context.get("homeSmokeAlerted") || false;
let homeInactivityAlerted = context.get("homeInactivityAlerted") || false;

if (
  (msg.dataHomeNormal.homeAlert.inactivityAlert ||
    msg.dataHomeNormal.homeAlert.smokeAlert) &&
  !homeNormalAlerted
) {
  msg.payload["dataHomeNormal"] = msg.dataHomeNormal.homeAlert;
  homeNormalAlerted = true;
  context.set("homeNormalAlerted", homeNormalAlerted);
}

if (
  (msg.dataHomeSmoke.homeAlert.inactivityAlert ||
    msg.dataHomeSmoke.homeAlert.smokeAlert) &&
  !homeSmokeAlerted
) {
  msg.payload["dataHomeSmoke"] = msg.dataHomeSmoke.homeAlert;
  homeSmokeAlerted = true;
  context.set("homeSmokeAlerted", homeSmokeAlerted);
}

if (
  (msg.dataHomeInactivity.homeAlert.inactivityAlert ||
    msg.dataHomeInactivity.homeAlert.smokeAlert) &&
  !homeInactivityAlerted
) {
  msg.payload["dataHomeInactivity"] = msg.dataHomeInactivity.homeAlert;
  homeInactivityAlerted = true;
  context.set("homeInactivityAlerted", homeInactivityAlerted);
}

msg.alerted = {
  homeNormalAlerted: homeNormalAlerted,
  homeSmokeAlerted: homeSmokeAlerted,
  homeInactivityAlerted: homeInactivityAlerted,
};

return msg;
