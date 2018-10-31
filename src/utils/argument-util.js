function applyCommandLineParams(nh, args) {
    const params = {};

    args.forEach((arg) => {
        let p = arg.indexOf(":=");
        if (p >= 0) {
            const key = arg.substring(0, p);
            const value = arg.substring(p+2);

            if (key.startsWith("_") && !key.startsWith("__")) {
                params[key.substring(1)] = value;
            }
        }
    });

    const paramPromises = [];
    const oldNamespace = nh._namespace;
    nh.setNamespace(nh.getNodeName());

    Object.keys(params).forEach((key) => {
        paramPromises.push(nh.setParam(key, params[key]));
    });

    return Promise.all(paramPromises);
}

module.exports = {
    applyCommandLineParams
}