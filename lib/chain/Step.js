'use strict';

const ChainedMap = require('webpack-chain/src/ChainedMap');

class Step extends ChainedMap {
    constructor(parent, name) {
        super(parent);

        this.extend(['title', 'options', 'task', 'skip', 'enabled']);

        this.set('name', name);
    }
}

module.exports = Step;
