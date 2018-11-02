#!/usr/bin/env node

const RepBot = require("@openrep/repbot");
const KinematicsUtil = require("./utils/kinematics-util");
const RobotConfigUtil = require("./utils/robot-config-util");
const ROSNodeUtil = require("./utils/ros-node-util");

const NODE_NAME = "/repbot_base";

const REQUIRED_PARAMS = [
    { name: "wheel_diameter", defaultVal: 0 },
    { name: "wheel_to_wheel_distance", defaultVal: 0.05 },
    { name: "rpm_per_volt", defaultVal: 0 },
    { name: "max_motor_voltage", defaultVal: 0 },
    { name: "hardware", defaultVal: {} },
    { name: "components", defaultVal: {} },
];

ROSNodeUtil.initializeNode(NODE_NAME, process.argv.slice(2), REQUIRED_PARAMS)
.then((nodeAndParams) => {
    const { nodeHandle, params, logger } = nodeAndParams;

    const componentMap = params["components"];
    const robotHardwareConfig = RobotConfigUtil.makeRepBotConfig(params["hardware"]);

    let robot;
    try {
        robot = new RepBot(robotHardwareConfig);
    }
    catch (err) {
        logger.warn("Could not instantiate actual robot hardware. Attempting to instantiate debug robot");
        try {
            let debugConfig = RobotConfigUtil.makeDebugConfig(robotHardwareConfig);
            robot = new RepBot(debugConfig);
        }
        catch (err) {
            logger.error("Could not instantiate debug robot. Game over man");
            process.exit(1);
        }
    }

    // TODO We should constantly calculate max RPM based on battery voltage
    const maxRPM = params["rpm_per_volt"] * params["max_motor_voltage"];
    const maxLinear = KinematicsUtil.maxLinearVelocity(params["wheel_diameter"], maxRPM);
    const maxAngular = KinematicsUtil.maxAngularVelocity(params["wheel_diameter"], maxRPM, params["wheel_to_wheel_distance"]);

    // Set up publishers

    // Set up subscribers
    nodeHandle.subscribe("/cmd_vel", "geometry_msgs/Twist", (msg) => {

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
        if (componentMap.motors) {
            if (componentMap.motors["left"] !== undefined) {
                robot.motorWrite(componentMap.motors["left"], leftVpct);
            }
            if (componentMap.motors["right"] !== undefined) {
                robot.motorWrite(componentMap.motors["right"], rightVpct);
            }
        }
    });

    // Set up the robot loop to poll for data and publish accordingly

});
