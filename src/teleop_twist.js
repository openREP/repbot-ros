#!/usr/bin/env node

/**
 * Provides a sensor_msgs/Joy -> geometry_msgs/Twist message
 */
const KinematicsUtil = require("./utils/kinematics-util");
const ROSNodeUtil = require("./utils/ros-node-util");

const REQUIRED_PARAMS = [
    { name: "axis_linear", defaultVal: 0 },
    { name: "axis_linear_scale", defaultVal: 1.0 },
    { name: "axis_angular", defaultVal: 1 },
    { name: "axis_angular_scale", defaultVal: 1.0 },
    { name: "enable_button", defaultVal: 0 },
    { name: "wheel_diameter", defaultVal: 0.01 },
    { name: "wheel_to_wheel_distance", defaultVal: 0.05 },
    { name: "rpm_per_volt", defaultVal: 0 },
    { name: "max_motor_voltage", defaultVal: 0 },
    { name: "output_topic", defaultVal: "/cmd_vel" },
];

const DEFAULT_NODE_NAME = "/repbot_teleop_twist";

ROSNodeUtil.initializeNode(DEFAULT_NODE_NAME, process.argv.slice(2), REQUIRED_PARAMS)
.then((nodeAndParams) => {
    const { nodeHandle, params, logger } = nodeAndParams;

    let linearScale = params["axis_linear_scale"];
    let angularScale = params["axis_angular_scale"];

    if (linearScale < 0 || linearScale > 1) {
        logger.warn("'axis_linear_scale' should be in range (0, 1]. Setting to 1.0");
        linearScale = 1.0;
    }

    if (angularScale < 0 || angularScale > 1) {
        logger.warn("'axis_angular_scale' should be in range (0, 1]. Setting to 1.0");
        angularScale = 1.0;
    }

    // Calculate the maximum speeds
    const maxRPM = params["rpm_per_volt"] * params["max_motor_voltage"];
    const maxLinear = KinematicsUtil.maxLinearVelocity(params["wheel_diameter"], maxRPM);
    const maxAngular = KinematicsUtil.maxAngularVelocity(params["wheel_diameter"], maxRPM, params["wheel_to_wheel_distance"]);

    const cmdVelTopicName = params["output_topic"];
    logger.info(`Publishing on topic: ${cmdVelTopicName}`);

    let disableMsgSent = false;

    // Set up the publisher and subscriber
    cmdVelPub = nodeHandle.advertise(cmdVelTopicName, "geometry_msgs/Twist");

    nodeHandle.subscribe("/joy", "sensor_msgs/Joy", (msg) => {
        // Take in the Joy message, and apply the appropriate conversions
        const twistMsg = {
            linear: {
                x: 0,
                y: 0,
                z: 0,
            },
            angular: {
                x: 0,
                y: 0,
                z: 0
            }
        };

        const scaledLinearSpeed = msg.axes[params["axis_linear"]] * maxLinear * linearScale;
        const scaledAngularSpeed = msg.axes[params["axis_angular"]] * maxAngular * angularScale;

        if (msg.buttons[params["enable_button"]]) {
            twistMsg.linear.x = scaledLinearSpeed;
            twistMsg.angular.z = scaledAngularSpeed;

            cmdVelPub.publish(twistMsg);
            disableMsgSent = false;
        }
        else {
            // When enable button is released, send a single no-motion command
            if (!disableMsgSent) {
                cmdVelPub.publish(twistMsg);
                disableMsgSent = true;
            }
        }
    });
})

