const Tradfri = require("node-tradfri-client");
const express = require("express");
const app = express();
const storage = require("node-persist");
const cors = require("cors");
const port = 9898;

let tradfriClient = null;
let devices = [];
let groups = [];

// get the first arg that the user past in and define that as Scode (security code) make sure to remove -- from the arg
const sCode = process.argv[2].replace("--", "");
// if the second arg equals --debug then set debug to true otherwise set it to false
let debug;
if(process.argv[3] === "--debug") {
    debug = true;
} else {
    debug = false;
}

const getMethods = (obj) =>
    Object.getOwnPropertyNames(obj).filter(
        (item) => typeof obj[item] === "function"
    );

const connectToGateway = async () => {
    await storage.init();
    const result = await Tradfri.discoverGateway();
    let gateway;
    if (!result) {
        throw new Error("No gateways found");
    } else {
        gateway = result.addresses[0];
    }

    tradfriClient = new Tradfri.TradfriClient(result.addresses[0], {
        watchConnection: true,
    });
    let creds = await storage.getItem("credentials");
    if (!creds) {
        const { identity, psk } = await tradfriClient.authenticate(sCode);
        creds = { identity, psk };
        await storage.setItem("credentials", creds);
        console.log("[TRADFRI] Generated PSK and identity");
    }

    try {
        await tradfriClient.connect(creds.identity, creds.psk);
        console.log("[TRADFRI] Connected to gateway");
        await tradfriClient
            .on("device updated", (d) => {
                if (debug){
                    console.log("[TRADFRI] Device updated");
                }
                devices[d.instanceId] = d;
            })
            .observeDevices();
        await tradfriClient
            .on("group updated", (g) => {
                if (debug){
                    console.log("[TRADFRI] Group updated");
                }
                groups[g.instanceId] = g;
            })
            .observeGroupsAndScenes();
    } catch (e) {
        console.error(e);
    }
};

app.use(cors());

app.get("/getAll", (req, res) => {
    console.log("Request for devices received");
    res.json({
        devices: tradfriClient.devices,
        groups: tradfriClient.groups,
    });
});

app.get("/getDevices", (req, res) => {
    console.log("Request for devices received");
    // output only the device id and name
    let output = [];
    for (let i = 0; i < devices.length; i++) {
        if (devices[i] !== undefined) {
            output.push({
                id: devices[i].instanceId,
                name: devices[i].name,
            });
        }
    }
    res.json(output);
});
app.get("/getGroups", (req, res) => {
    console.log("Request for groups received");
    res.json(tradfriClient.groups);
});

app.get("/toggleDevice", (req, res) => {
    const deviceId = req.query.deviceId;
    const state = req.query.state;
    const device = devices[deviceId].lightList[0];

    let parsedState = state === "on";
    if(debug){
        console.log(`[TRADFRI] Toggling device ${deviceId} to ${parsedState}`);
    }
    device.toggle(parsedState).then((lightResult) => {
        res.json({ status: "ok", info: lightResult });
    });
});

app.get("/setBrightness", (req, res) => {
    const deviceId = req.query.deviceId;
    const state = req.query.state;
    const device = devices[deviceId].lightList[0];

    if(debug){
        console.log(`[TRADFRI] Setting brightness of device ${deviceId} to ${state}`);
    }
    device.setBrightness(state).then((lightResult) => {
        res.json({ status: "ok", info: lightResult });
    });
});

app.get("/setHue", (req, res) => {
    const deviceId = req.query.deviceId;
    const state = req.query.state;
    const device = devices[deviceId].lightList[0];
    if(debug){
        console.log(`[TRADFRI] Setting hue of device ${deviceId} to ${state}`);
    }
    device.setHue(state).then((lightResult) => {
        res.json({ status: "ok", info: lightResult });
    });
});
app.get("/quit", (req, res) => {
    res.json({ status: "exited" });
    console.log("Quitting Ikea Tradfri Server...");
    process.exit();
});

app.get("*", (req, res) => {
    res.json({ status: "not found" });
});

connectToGateway().then(() => {
    app.listen(port, () => {
        console.log(`Tradfri Server Started!`);
    });
});

