function getParamOrDefault(nh, param, defaultVal, logger) {
    return nh.hasParam(param)
        .then((hasParam) => {
            if (hasParam) {
                return nh.getParam(param);
            }
            else {
                if (logger) {
                    logger.warn(`Param '${param}' not found. Using default value ${defaultVal}`);
                }
                else {
                    console.warn(`Param '${param}' not found. Using default value ${defaultVal}`);
                }
                return defaultVal;
            }
        });
}

function getAllParams(nh, paramList, logger) {
    // Build the array of promises
    const paramPromises = paramList.map((paramInfo) => {
        return getParamOrDefault(nh, paramInfo.name, paramInfo.defaultVal, logger);
    });

    return Promise.all(paramPromises)
    .then((values) => {
        const paramValues = {};
        paramList.forEach((paramInfo, i) => {
            paramValues[paramInfo.name] = values[i]
        });

        return paramValues;
    });
}

module.exports = {
    getParamOrDefault,
    getAllParams,
}