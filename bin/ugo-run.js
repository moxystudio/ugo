#!/usr/bin/env node

/* eslint-disable global-require */

'use strict';

require('update-notifier')({ pkg: require('../package.json') }).notify();

const { createUgo, runUgo } = require('..');

const ugo = createUgo();
const args = process.argv.slice(2);

runUgo(ugo, args)
.then(() => process.exit())
.catch(() => process.exit(1));
