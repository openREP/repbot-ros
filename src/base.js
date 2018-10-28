#!/usr/bin/env node

const RepBot = require("@openrep/repbot");
const RosNodeJS = require("rosnodejs");
const ParamUtil = require("./utils/param-util");
const KinematicsUtil = require("./utils/kinematics-util");
const RobotConfigUtil = require("./utils/robot-config-util");

const NODE_NAME = "/repbot_base";

const REQUIRED_PARAMS = [
    { name: "wheel_diameter", defaultVal: 0 },
    { name: "wheel_to_wheel_distance", defaultVal: 0.05 },
    { name: "rpm_per_volt", defaultVal: 0 },
    { name: "max_motor_voltage", defaultVal: 0 },
    { name: "hardware", defaultVal: {} }
];

RosNodeJS.initNode(NODE_NAME)
.then(() => {
    const nh = RosNodeJS.nh;
    nh.setNamespace(NODE_NAME);

    ParamUtil.getAllParams(nh, REQUIRED_PARAMS)
    .then((params) => {
        const robotHardwareConfig = RobotConfigUtil.makeRepBotConfig(params["hardware"]);
        
        // TODO If this fails, maybe fall back to a demo robot
        const robot = new RepBot(robotHardwareConfig);

        // TODO We should constantly calculate max RPM based on battery voltage
        const maxRPM = params["rpm_per_volt"] * params["max_motor_voltage"];
        const maxLinear = KinematicsUtil.maxLinearVelocity(params["wheel_diameter"], maxRPM);
        const maxAngular = KinematicsUtil.maxAngularVelocity(params["wheel_diameter"], maxRPM, params["wheel_to_wheel_distance"]);

        // Set up publishers

        // Set up subscribers
        nh.subscribe("/cmd_vel", "geometry_msgs/Twist", (msg) => {
            
            // NOTE: The maxLinear value represents the top speed of a single wheel
            // Left wheel velocity (m/s) =
            // linear_speed + angular_speed

            // Right wheel velocity (m/s) =
            // linear_speed - angular_speed

            // We'll assume that we can just sum/subtract the linear and angular speeds
            const leftVelocity = KinematicsUtil.limitWheelVelocity(msg.linear.x + msg.angular.z, maxLinear);
            const rightVelocity = KinematicsUtil.limitWheelVelocity(msg.linear.x - msg.angular.z, maxLinear);

            // Assuming linear relationship between %-Vin and velocity
            const leftVpct = (leftVelocity / maxLinear) * 100;
            const rightVpct = (rightVelocity / maxLinear) * 100;

            // Now pass it into the robot
            // TODO Implement
        });
    });
});