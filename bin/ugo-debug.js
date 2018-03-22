#!/usr/bin/env node

/* eslint-disable global-require */

'use strict';

require('update-notifier')({ pkg: require('../package.json') }).notify();
