'use strict';

const cosmiconfig = require('cosmiconfig');
const Ugo = require('./chain/Ugo');
const { flattenDeep } = require('lodash');

// TODO: validate config?

function readRc(options) {
    const explorer = cosmiconfig(options.configName, {
        packageProp: false,
        rc: false,
        sync: true,
    });

    const result = explorer.load();
    const rc = result ? result.config : options.default;

    if (!rc) {
        throw new Error(`No ${options.configName} file found`);
    }

    return rc;
}

function createUgo(options) {
    options = {
        default: undefined,
        configName: 'ugo',
        ...options,
    };

    const ugo = new Ugo();
    const rc = readRc(options);

    flattenDeep(rc).forEach((fn) => fn(ugo));

    return ugo;
}

module.exports = createUgo;
