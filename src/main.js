const RepBot = require("@openrep/repbot");
const RosNodeJS = require("rosnodejs");

const ROMI_ROBOT = require("./robot-configs/romi-base");

// NOTE: Remember that cmd_vel messages are in SI units (m/s, rad/s)

// === PHYSICAL CONSTANTS ===
const WHEEL_DIAMETER_M = 0.07; // 70mm
const MAX_MOTOR_VOLTAGE = 0.75 * 9; // Nominal 9 volts, but software limited to 3/4
const MAX_RPM = 225; // 33.3333... RPM per volt

// Max wheel velocity is (wheel cirumference * max rpm) / 60
const MAX_WHEEL_VELOCITY = ((Math.PI * WHEEL_DIAMETER_M) * MAX_RPM) / 60;

// Actual robot hardware
const robot = new RepBot(ROMI_ROBOT);

// TODO Do the appropriate math for max velocity, etc

RosNodeJS.initNode("/repbot_base")
.then(() => {
    const nh = RosNodeJS.nh;

    // Hook into the appropriate node events here
});