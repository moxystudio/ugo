'use strict';

const { ChainedMap, OrderableChainedMap } = require('chained-config');
const Step = require('./Step');

class Command extends ChainedMap {
    constructor(parent, name) {
        super(parent);

        this.shorthands(['description', 'builder']);

        this.set('name', name);
        this.set('description', '');
        this.set('steps', new OrderableChainedMap(this, { asArray: true }));
    }

    step(name) {
        if (!this.steps.has(name)) {
            this.steps.set(name, new Step(this, name));
        }

        return this.steps.get(name);
    }
}

module.exports = Command;
