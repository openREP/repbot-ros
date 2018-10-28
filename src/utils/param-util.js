function getParamOrDefault(nh, param, defaultVal) {
    return nh.hasParam(param)
        .then((hasParam) => {
            if (hasParam) {
                return nh.getParam(param);
            }
            else {
                console.warn(`Param '${param}' not found. Using default value ${defaultVal}`);
                return defaultVal;
            }
        });
}

function getAllParams(nh, paramList) {
    // Build the array of promises
    const paramPromises = paramList.map((paramInfo) => {
        return getParamOrDefault(nh, paramInfo.name, paramInfo.defaultVal);
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