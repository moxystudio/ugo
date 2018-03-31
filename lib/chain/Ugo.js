'use strict';

const { ChainedMap, OrderableChainedMap } = require('chained-config');
const Command = require('./Command');
const Config = require('./Config');

class Ugo extends ChainedMap {
    constructor() {
        super();

        this.set('commands', new OrderableChainedMap(this, { asArray: true }));
        this.set('configs', new ChainedMap(this));
    }

    command(name) {
        if (!this.commands.has(name)) {
            this.commands.set(name, new Command(this, name));
        }

        return this.commands.get(name);
    }

    config(name) {
        if (!this.configs.has(name)) {
            this.configs.set(name, new Config(this, name));
        }

        return this.configs.get(name);
    }
}

module.exports = Ugo;
