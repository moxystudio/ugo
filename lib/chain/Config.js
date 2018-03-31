'use strict';

const assert = require('assert');
const { ChainedMap, OrderableChainedMap } = require('chained-config');

class Config extends ChainedMap {
    constructor(parent, name) {
        super(parent);

        this.shorthands(['create']);

        this.set('name', name);
        this.set('modifiers', new OrderableChainedMap(this));
    }

    modify(name, fn) {
        this.modifiers.set(name, fn);

        return this;
    }

    resolve(...args) {
        const create = this.get('create');

        assert(create, `You must specificy a \`create\` function for the \`${this.get('name')}\``);

        let config = create(...args);

        config = this.modifiers.values().reduce((config, modifier) => modifier(config, ...args), config);

        if (config.toConfig) {
            config = config.toConfig();
        }

        return config;
    }
}

module.exports = Config;
