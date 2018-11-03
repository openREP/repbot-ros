#!/usr/bin/env node

/**
 * Manages multiple cmd_vel inputs
 */
const ROSNodeUtil = require("./utils/ros-node-util");

const REQUIRED_PARAMS = [
    { name: "teleop_topic", defaultVal: "/teleop/cmd_vel" },
    { name: "auto_topic", defaultVal: "/move_base/cmd_vel" },
    { name: "block_duration_ms", defaultVal: 5000 }
];

const DEFAULT_NODE_NAME = "/repbot_cmd_vel_mux";

ROSNodeUtil.initializeNode(DEFAULT_NODE_NAME, process.argv.slice(2), REQUIRED_PARAMS)
.then((nodeAndParams) => {
    const { nodeHandle, params } = nodeAndParams;

    let cmdVelPub;
    const teleopTopic = params["teleop_topic"];
    const autoTopic = params["auto_topic"];
    const blockDuration = params["block_duration_ms"];

    let activeBlockDuration = 0;

    let lastTeleopTime = Date.now();

    cmdVelPub = nodeHandle.advertise("/cmd_vel", "geometry_msgs/Twist");

    // Teleop Listener
    nodeHandle.subscribe(teleopTopic, "geometry_msgs/Twist", (msg) => {
        lastTeleopTime = Date.now();
        activeBlockDuration = blockDuration;
        cmdVelPub.publish(msg);
    });

    // Autonomous Listener
    nodeHandle.subscribe(autoTopic, "geometry_msgs/Twist", (msg) => {
        const timeSinceTeleopCmd = Date.now() - lastTeleopTime;
        if (timeSinceTeleopCmd >= activeBlockDuration) {
            activeBlockDuration = 0;
            cmdVelPub.publish(msg);
        }
    });
});
