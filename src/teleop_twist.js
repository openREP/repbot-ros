#!/usr/bin/env node

const RosNodeJS = require("rosnodejs");

// TODO This node will take in sensor_msgs/Joy messages and convert
// to geometry_msgs/Twist messages
RosNodeJS.initNode("/repbot_teleop_twist")
.then(() => {

});