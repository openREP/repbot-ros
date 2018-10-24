module.exports = {
    devices: {
        "romi": {
            type: "romi",
            deviceConfig: {
                address: 0x14,
            },
            portMappings: {
                digital: [
                    {
                        channel: 0,
                        deviceChannel: 0,
                        direction: "out"
                    },
                    {
                        channel: 1,
                        deviceChannel: 1,
                        direction: "out"
                    },
                    {
                        channel: 2,
                        deviceChannel: 2,
                        direction: "out"
                    },
                    {
                        channel: 3,
                        deviceChannel: 3,
                        direction: "in"
                    },
                    {
                        channel: 4,
                        deviceChannel: 4,
                        direction: "in"
                    },
                    {
                        channel: 5,
                        deviceChannel: 5,
                        direction: "in"
                    }
                ],
                analog: [
                    {
                        channel: 0,
                        deviceChannel: 0
                    },
                    {
                        channel: 1,
                        deviceChannel: 1
                    },
                    {
                        channel: 2,
                        deviceChannel: 2
                    }
                ],
                pwm: [
                    {
                        channel: 0,
                        deviceChannel: 0,
                        type: "motor"
                    },
                    {
                        channel: 0,
                        deviceChannel: 0,
                        type: "motor"
                    }
                ],
                encoder: [
                    {
                        channel: 0,
                        deviceChannel: 0
                    },
                    {
                        channel: 1,
                        deviceChannel: 1
                    }
                ],
                gyro: [
                    {
                        channel: 0,
                        deviceChannel: 0
                    }
                ],
                accelerometer: [
                    {
                        channel: 0,
                        deviceChannel: 0
                    }
                ]
            }
        }
    }
}