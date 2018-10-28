#!/usr/bin/env node

const RosNodeJS = require("rosnodejs");
const ParamUtil = require("./utils/param-util");
const KinematicsUtil = require("./utils/kinematics-util");
const RobotConfigUtil = require("./utils/robot-config-util");

const REQUIRED_PARAMS = [
    { name: "axis_linear", defaultVal: 0 },
    { name: "axis_angular", defaultVal: 1 },
    { name: "enable_button", defaultVal: 0 },
    { name: "wheel_diameter", defaultVal: 0.01 },
    { name: "wheel_to_wheel_distance", defaultVal: 0.05 },
    { name: "rpm_per_volt", defaultVal: 0 },
    { name: "max_motor_voltage", defaultVal: 0 },
    { name: "output_topic", defaultVal: "/cmd_vel" },
];

const NODE_NAME = "/repbot_teleop_twist";

// This node will take in sensor_msgs/Joy messages and convert
// to geometry_msgs/Twist messages
RosNodeJS.initNode(NODE_NAME)
.then(() => {
    const nh = RosNodeJS.nh;
    // Set the namespace appropriately (mainly so we can key off the param server)
    nh.setNamespace(NODE_NAME);

    let cmdVelPub;

    ParamUtil.getAllParams(nh, REQUIRED_PARAMS)
    .then((params) => {
        // Calculate the maximum speeds
        const maxRPM = params["rpm_per_volt"] * params["max_motor_voltage"];
        const maxLinear = KinematicsUtil.maxLinearVelocity(params["wheel_diameter"], maxRPM);
        const maxAngular = KinematicsUtil.maxAngularVelocity(params["wheel_diameter"], maxRPM, params["wheel_to_wheel_distance"]);
        
        const cmdVelTopicName = params["output_topic"];
        console.log("Publishing on topic: " + cmdVelTopicName);
        
        let disableMsgSent = false;

        // Set up the publisher and subscriber
        cmdVelPub = nh.advertise(cmdVelTopicName, "geometry_msgs/Twist");

        nh.subscribe("/joy", "sensor_msgs/Joy", (msg) => {
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

            const scaledLinearSpeed = msg.axes[params["axis_linear"]] * maxLinear;
            const scaledAngularSpeed = msg.axes[params["axis_angular"]] * maxAngular;

            if (msg.buttons[params["enable_button"]]) {
                twistMsg.linear.x = scaledLinearSpeed;
                twistMsg.angular.z = scaledAngularSpeed;

                cmdVelPub.publish(twistMsg);
                disableMsgSent = false;
            }
            else {
                // When enable button is releases, send a single no-motion command
                if (!disableMsgSent) {
                    cmdVelPub.publish(twistMsg);
                    disableMsgSent = true;
                }
            }
        });
    });
    
});

