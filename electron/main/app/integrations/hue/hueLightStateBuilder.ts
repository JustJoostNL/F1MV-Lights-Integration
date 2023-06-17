const {
  LightState,
  GroupLightState,
} = require("node-hue-api").v3.lightStates;



export default async function hueLightStateBuilder(data){
  // data = {
  //   "on": true,
  //   "groupMode": false,
  //   "brightness": 100,
  //   "x": 0,
  //   "y": 0,
  //   "rgb": {
  //     r: 255,
  //     g: 255,
  //     b: 255
  //   },
  //   "transition": "instant/fade",
  //   "thirdPartyCompatibility": false,
  // }

  if (data.groupMode){
    const groupLightState = new GroupLightState();
    if (data.on){
      groupLightState.on();
    } else {
      groupLightState.off();
    }

    if (data.brightness){
      groupLightState.bri(data.brightness);
    }

    if (data.x && data.y){
      groupLightState.xy(data.x, data.y);
    }

    if (data.transition){
      if (data.transition === "instant"){
        groupLightState.transitionInstant();
      } else if (data.transition === "fade"){
        // we do nothing, since this is default
      }
    }

    return groupLightState;
  } else {
    const lightState = new LightState();
    if (data.on){
      lightState.on();
    } else {
      lightState.off();
    }

    if (data.brightness){
      lightState.bri(data.brightness);
    }

    if (data.rgb && !data.thirdPartyCompatibility){
      lightState.rgb(data.rgb.r, data.rgb.g, data.rgb.b);
    } else if (data.x && data.y && data.thirdPartyCompatibility){
      lightState.xy(data.x, data.y);
    }

    if (data.transition){
      if (data.transition === "instant"){
        lightState.transitionInstant();
      } else if (data.transition === "fade"){
        // we do nothing, since this is default
      }
    }

    return lightState;
  }
}