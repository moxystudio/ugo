'use strict';

const ChainedMap = require('webpack-chain/src/ChainedMap');
const Command = require('./Command');
const Config = require('./Config');

class Ugo extends ChainedMap {
    constructor() {
        super();

        this.commands = new ChainedMap(this);
        this.configs = new ChainedMap(this);
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
