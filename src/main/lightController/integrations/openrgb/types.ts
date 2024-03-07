import Device from "openrgb-sdk/types/device";

export interface IOpenRGBClient {
  name: string;
  port: number;
  host: string;
  isConnected: boolean;
  resolver: any[];
  settings: any;
  /**
   * connect to the OpenRGB-SDK-server
   */
  connect(timeout?: number): Promise<void>;
  socket: any;
  socketQueue: any;
  protocolVersion: any;
  /**
   * disconnect from the OpenRGB-SDK-server
   */
  disconnect(): void;
  /**
   * get the amount of devices
   * @returns {Promise<number>}
   */
  getControllerCount(): Promise<number>;
  /**
   * get the protocol version
   * @returns {Promise<number>}
   */
  getProtocolVersion(): Promise<number>;
  /**
   * get the properties of a device
   * @param {number} deviceId the id of the requested device
   * @returns {Promise<Device>}
   */
  getControllerData(deviceId: number): Promise<Device>;
  /**
   * get the properties of all devices
   * @returns {Promise<Device>[]}
   */
  getAllControllerData(): Promise<Device>[];
  /**
   * get a list of all profiles
   * @returns {Promise<String>[]}
   */
  getProfileList(): Promise<string>[];
  /**
   * set the name of the client
   * @param {string} name the name displayed in openrgb
   */
  setClientName(name: string): void;
  /**
   * update all leds of a device
   * @param {number} deviceId the id of the device
   * @param {Object[]} colors the colors the device should be set to
   */
  updateLeds(deviceId: number, colors: any[]): void;
  /**
   * update all leds of a zone
   * @param {number} deviceId the id of the device
   * @param {number} zoneId the id of the zone
   * @param {Object[]} colors the colors the zone should be set to
   */
  updateZoneLeds(deviceId: number, zoneId: number, colors: any[]): void;
  /**
   * update one led of a device
   * @param {number} deviceId the id of the device
   * @param {number} ledId the id of the led
   * @param {Object} colors the color the led should be set to
   */
  updateSingleLed(deviceId: number, ledId: number, color: any): void;
  /**
   * sets the device to its mode for individual led control
   * @param {number} deviceId the id of the requested device
   * @returns {Promise<Device>}
   */
  setCustomMode(deviceId: number): Promise<Device>;
  /**
   * update the mode of a device
   * @param {number} deviceId the id of the device
   * @param {number|string} mode either the id or name of a mode
   * @param {Object} custom the settings of this mode e.g. speed, color etc.
   */
  updateMode(
    deviceId: number,
    mode: number | string,
    custom: any,
  ): Promise<void>;
  /**
   * update the mode of a device and save it to the device
   * @param {number} deviceId the id of the device
   * @param {number|string} mode either the id or name of a mode
   * @param {Object} custom the settings of this mode e.g. speed, color etc.
   */
  saveMode(deviceId: number, mode: number | string, custom: any): Promise<void>;
  /**
   * resize a zone
   * @param {number} deviceId the id of the device
   * @param {number} zoneId the id of the zone
   * @param {number} zoneLength the length the zone should be set to
   */
  resizeZone(deviceId: number, zoneId: number, zoneLength: number): void;
  /**
   * create a new profile with the current state of the devices in openrgb
   * @param {string} name the name of the new profile
   */
  saveProfile(name: string): void;
  /**
   * load a profile out of the storage
   * @param {string} name the name of the profile that should be loaded
   */
  loadProfile(name: string): void;
  /**
   * delete a profile out of the storage
   * @param {string} name the name of the profile that should be deleted
   */
  deleteProfile(name: string): void;
}
