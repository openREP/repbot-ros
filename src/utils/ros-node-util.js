const RosNodeJS = require("rosnodejs");
const ArgumentUtil = require("./argument-util");
const ParamUtil = require("./param-util");

/**
 * @class NodeHandleAndParams
 * @property {NodeHandle} nodeHandle
 * @property {*} params
 * @property {*} logger
 */

/**
 * Initialize a ROS Node, including setting parameters, remaps and getting a list
 * of required parameters
 * @param {string} defaultNodeName
 * @param {string[]} cmdlineArgs Usually process.argv
 * @param {*} requiredParams
 * @return {NodeHandleAndParams}
 */
function initializeNode(defaultNodeName, cmdlineArgs, requiredParams) {
    return RosNodeJS.initNode(defaultNodeName)
    .then(ArgumentUtil.applyCommandLineParams(RosNodeJS.nh, cmdlineArgs))
    .then(() => {
        const nh = RosNodeJS.nh;
        nh.setNamespace(nh.getNodeName());

        const logger = RosNodeJS.log.generateLogger({name: nh.getNodeName()});

        return ParamUtil.getAllParams(nh, requiredParams, logger)
        .then((paramValues) => {
            return {
                nodeHandle: nh,
                params: paramValues,
                logger
            }
        });
    });
}

module.exports = {
    initializeNode
}