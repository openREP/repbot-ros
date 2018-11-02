function makeDebugConfig(actualConfig) {
    if (actualConfig.devices) {
        Object.keys(actualConfig.devices).forEach((deviceId) => {
            if (actualConfig.devices[deviceId].type) {
                actualConfig.devices[deviceId].type = "debug";
            }
        });
    }

    return actualConfig;
}

function makeRepBotConfig(robotConfigYaml) {
    const configObj = {
        devices: {}
    };
    if (!robotConfigYaml.devices) {
        return configObj;
    }

    robotConfigYaml.devices.forEach((deviceConfig) => {
        // Build the device object first, and then assign it to "name"
        const deviceObj = {
            type: deviceConfig.type,
            deviceConfig: deviceConfig.device_config,
        };

        if (deviceConfig.port_mapping) {
            deviceObj.portMappings = {};
            const portTypes = ["digital", "analog", "pwm", "encoder", "gyro", "accelerometer"];

            portTypes.forEach((portType) => {
                if (deviceConfig.port_mapping[portType]) {

                    const portConfigs = deviceConfig.port_mapping[portType];
                    deviceObj.portMappings[portType] = portConfigs.map((portConfig) => {
                        const ret = {};
                        if (portConfig.channel !== undefined) {
                            ret.channel = portConfig.channel;
                        }
                        if (portConfig.device_channel !== undefined) {
                            ret.deviceChannel = portConfig.device_channel;
                        }
                        if (portConfig.direction !== undefined) {
                            ret.direction = portConfig.direction;
                        }
                        if (portConfig.type !== undefined) {
                            ret.type = portConfig.type;
                        }
                        return ret;
                    });
                }

            });
        }

        configObj.devices[deviceConfig.name] = deviceObj;
    });

    return configObj;
}

module.exports = {
    makeRepBotConfig,
    makeDebugConfig,
}