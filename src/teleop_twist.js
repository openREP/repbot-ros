#!/usr/bin/env node

const RosNodeJS = require("rosnodejs");

RosNodeJS.initNode("/teleop_twist_node")
.then(() => {

});