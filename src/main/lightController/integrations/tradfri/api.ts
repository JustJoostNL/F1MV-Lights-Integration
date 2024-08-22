import log from "electron-log";
import {
  discoverGateway,
  DiscoveredGateway,
  TradfriClient,
} from "node-tradfri-client";
import { globalConfig, patchConfig } from "../../../ipc/config";
import { ControlType } from "../../controlAllLights";
import { integrationStates } from "../states";
import { rgbToHueSat } from "../rgbToHueSat";
import { EventType } from "../../../../shared/config/config_types";
import { getColorTempFromEvent } from "./getColorTempFromEvent";

export async function tradfriInitialize() {
  log.debug("Initializing IKEA Tradfri...");
  await tradfriOnlineCheck();
}

export async function discoverTradfriGateway(): Promise<DiscoveredGateway | null> {
  const result = await discoverGateway();
  return result;
}

async function getTradfriClient() {
  const gatewayIp = globalConfig.ikeaGatewayIp;
  const securityCode = globalConfig.ikeaSecurityCode;
  const identity = globalConfig.ikeaIdentity;
  const preSharedKey = globalConfig.ikeaPreSharedKey;

  if (!gatewayIp) {
    log.error("Error creating tradfri client: no IKEA Tradfri gateway IP set");
    return null;
  }

  if (!securityCode) {
    log.error(
      "Error creating tradfri client: no IKEA Tradfri security code set",
    );
    return null;
  }

  const tradfriClient = new TradfriClient(gatewayIp, {
    watchConnection: true,
  });

  if (!identity || !preSharedKey) {
    try {
      const { identity, psk } = await tradfriClient.authenticate(securityCode);
      if (!identity || !psk) {
        log.error("Error authenticating with IKEA Tradfri gateway");
        return null;
      }
      await patchConfig({
        ikeaIdentity: identity,
        ikeaPreSharedKey: psk,
      });
    } catch (error) {
      log.error("Error authenticating with IKEA Tradfri gateway", error);
      return null;
    }
  }

  const newIdentity = globalConfig.ikeaIdentity;
  const newPreSharedKey = globalConfig.ikeaPreSharedKey;
  if (!newIdentity || !newPreSharedKey) {
    log.error("Error creating tradfri client: no IKEA Tradfri identity or PSK");
    return null;
  }

  tradfriClient.connect(newIdentity, newPreSharedKey);

  return tradfriClient;
}

export async function tradfriOnlineCheck(): Promise<"online" | "offline"> {
  const client = await getTradfriClient();
  if (!client) {
    integrationStates.tradfri = false;
    return "offline";
  }

  const ping = await client.ping();
  integrationStates.tradfri = ping;
  return ping ? "online" : "offline";
}

export async function getTradfriDevices() {
  const client = await getTradfriClient();
  if (!client) return;

  await client.observeDevices();

  const deviceList = Object.values(client.devices)
    .filter((device) => device.type === 2)
    .map((device) => ({
      id: device.instanceId,
      name: device.name,
      type: device.type,
      state: device.lightList[0].onOff,
      spectrum: device.lightList[0].spectrum,
    }));

  return {
    devices: deviceList,
    selectedDevices: globalConfig.ikeaDeviceIds,
  };
}

export interface IkeaControlArgs {
  controlType: ControlType;
  color: {
    r: number;
    g: number;
    b: number;
  };
  brightness: number;
  event: EventType;
}

export async function tradfriControl({
  controlType,
  color,
  brightness,
  event,
}: IkeaControlArgs) {
  const client = await getTradfriClient();
  if (!client) return;

  await client.observeDevices();
  const devices = Object.values(client.devices).filter(
    (device) =>
      device.type === 2 &&
      globalConfig.ikeaDeviceIds.includes(device.instanceId),
  );

  for (const device of devices) {
    const light = device.lightList[0];
    //@ts-ignore
    light.link(client);
    if (!light) continue;

    const { hue: hueValue, sat: satValue } = rgbToHueSat(
      color.r,
      color.g,
      color.b,
    );

    switch (controlType) {
      case ControlType.On:
        if (light.spectrum === "rgb") {
          light.toggle(true);
          light.setHue(hueValue);
          light.setSaturation(satValue);
          light.setBrightness(brightness);
        } else {
          const temp = getColorTempFromEvent(event);
          light.toggle(true);
          light.setColorTemperature(temp ?? 370);
        }
        break;
      case ControlType.Off:
        light.toggle(false);
        break;
    }
  }
}
