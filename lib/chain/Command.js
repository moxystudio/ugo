'use strict';

const ChainedMap = require('webpack-chain/src/ChainedMap');
const Step = require('./Step');

class Command extends ChainedMap {
    constructor(parent, name) {
        super(parent);

        this.extend(['description', 'builder']);
        this.steps = new ChainedMap(this);

        this.set('name', name);
        this.set('builder', () => {});
    }

    step(name) {
        if (!this.steps.has(name)) {
            this.steps.set(name, new Step(this, name));
        }

        return this.steps.get(name);
    }
}

module.exports = Command;
