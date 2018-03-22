#!/usr/bin/env node

/* eslint-disable global-require */

'use strict';

require('update-notifier')({ pkg: require('../package.json') }).notify();

const { create, run } = require('..');

const args = process.argv.slice(2);

create()
.then((ugo) => run(ugo, args))
.then(() => process.exit())
.catch((err) => {
    console.error(err.stack);
    process.exit(1);
});
