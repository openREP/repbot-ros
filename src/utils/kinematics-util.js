function maxLinearVelocity(wheelDiam, maxRPM) {
    return (Math.PI * wheelDiam * maxRPM) / 60.0;
}

function maxAngularVelocity(wheelDiam, maxRPM, wheelDist) {
    return (2 * maxLinearVelocity(wheelDiam, maxRPM)) / wheelDist;
}

function limitWheelVelocity(input, max) {
    if (input < -max) {
        return -max;
    }
    else if (input > max) {
        return max;
    }
    return input;
}

module.exports = {
    maxLinearVelocity,
    maxAngularVelocity,
    limitWheelVelocity
};