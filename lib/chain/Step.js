'use strict';

const { ChainedMap } = require('chained-config');

class Step extends ChainedMap {
    constructor(parent, name) {
        super(parent);

        this.shorthands(['title', 'options', 'task', 'skip', 'enabled']);

        this.set('name', name);
    }
}

module.exports = Step;
