const tradfriLib = require("node-tradfri-client");
const tradfriClient = tradfriLib.TradfriClient;
const discoverGateway = tradfriLib.discoverGateway;
const securityCode = "bbdhMPNnRYPIVWCI";

const discovered = discoverGateway(timout = 5000);

// discover the gateway and save the ip address
discovered.then( (gateway)=> {
    console.log("Found gateway at " + gateway.addresses[0]);
    const tradfri = new tradfriClient(gateway.addresses[0]);

    try {
        console.log("Connecting to gateway...");
        const {identity, psk} = tradfri.authenticate(securityCode);
        // convert the identity and psk to arrays
        const identityArray = new Buffer(identity, "utf8");
        const pskArray = new Buffer(psk, "utf8");
        tradfri.connect(identityArray, pskArray).then(r => {
            console.log("Connected to gateway");
        });
        //console.log("Connected to gateway");

    } catch (e) {
        // handle error
    }
});
