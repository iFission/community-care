// speed up the time, to simulate faster time
// 60 => 60 times faster, 1 minute becomes 1 sec
// results in inactivityThreshold 60 min => 60 sec
const timeSpeedUp = 180;

const getCurrentTimeUnix = () => Date.now() / 1000; // in seconds
const getMinuteDelta = (earlierTime) =>
  ((getCurrentTimeUnix() - earlierTime) / 60) * timeSpeedUp;

const smokeThreshold = 80;
const inactivityThreshold = 60; // minutes

// initialise/retrieve variables
// context.get retrieves variable in current flow instance
let electricityLastValue = context.get("electricityLastValue") || 0;
let electricityLastUpdated = context.get("electricityLastUpdated") || 0;
let waterLastValue = context.get("waterLastValue") || 0;
let waterLastUpdated = context.get("waterLastUpdated") || 0;
let motionLastDetected = context.get("motionLastDetected") || 0;
let smokeFirstDetected = context.get("smokeFirstDetected") || 0;
let smokeNoticed = context.get("smokeNoticed") || false;
let smokeAlert = context.get("smokeAlert") || false;
let inactivityAlert = context.get("inactivityAlert") || false;

// update last usage value for electricity, water
if (msg.payload.electricity != electricityLastValue) {
  electricityLastValue = msg.payload.electricity;
  electricityLastUpdated = getCurrentTimeUnix();
}

if (msg.payload.water != waterLastValue) {
  waterLastValue = msg.payload.water;
  waterLastUpdated = getCurrentTimeUnix();
}

if (msg.payload.motion) {
  motionLastDetected = getCurrentTimeUnix();
}

// inactivity analysis
// check if electricity, water or motion has been the same for more than inactivityThreshold minutes

// getTimeDelta
let electricityTimeDelta = getMinuteDelta(electricityLastUpdated);
let waterTimeDelta = getMinuteDelta(waterLastUpdated);
let motionTimeDelta = getMinuteDelta(motionLastDetected);

if (
  electricityTimeDelta >= inactivityThreshold &&
  waterTimeDelta >= inactivityThreshold &&
  motionTimeDelta >= inactivityThreshold
) {
  inactivityAlert = true;
} else {
  inactivityAlert = false;
}

// smoke analysis
// if smoke goes above threshold, and persists for more than 5 minutes
if (msg.payload.smoke >= smokeThreshold && !smokeNoticed) {
  smokeNoticed = true;
  smokeFirstDetected = getCurrentTimeUnix();
}

let smokeTimeDelta = getMinuteDelta(smokeFirstDetected);

if (msg.payload.smoke >= smokeThreshold && smokeNoticed) {
  if (smokeTimeDelta > inactivityThreshold) {
    smokeAlert = true;
  }
} else if (msg.payload.smoke < smokeThreshold) {
  smokeNoticed = false;
}

context.set("electricityLastValue", electricityLastValue);
context.set("electricityLastUpdated", electricityLastUpdated);
context.set("waterLastValue", waterLastValue);
context.set("waterLastUpdated", waterLastUpdated);
context.set("motionLastDetected", motionLastDetected);
context.set("smokeFirstDetected", smokeFirstDetected);
context.set("smokeNoticed", smokeNoticed);
context.set("smokeAlert", smokeAlert);
context.set("inactivityAlert", inactivityAlert);

msg.timeDelta = JSON.stringify({
  electricityTimeDelta: electricityTimeDelta,
  waterTimeDelta: waterTimeDelta,
  motionTimeDelta: motionTimeDelta,
  smokeTimeDelta: smokeTimeDelta,
});

msg.alert = JSON.stringify({
  homeAlert: {
    homeId: msg.deviceId,
    smokeAlert: smokeAlert,
    inactivityAlert: inactivityAlert,
  },
});

msg.payload = JSON.stringify({
  homeAlert: {
    homeId: msg.deviceId,
    electricityLastValue: electricityLastValue,
    electricityLastUpdated: electricityLastUpdated,
    waterLastValue: waterLastValue,
    waterLastUpdated: waterLastUpdated,
    motionLastDetected: motionLastDetected,
    smokeFirstDetected: smokeFirstDetected,
    smokeNoticed: smokeNoticed,
  },
});

return msg;
