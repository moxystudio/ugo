/* eslint-disable indent */

'use strict';

module.exports = [
    // Code bellow will actually be a plugin like:
    // require('ugo-plugin-babel')(),
    (ugo) => {
        ugo.command('build')
            .step('babel')
                .title('Building with Babel')
                .options({
                    'output-dir': { type: 'string', default: 'dist', description: 'foo' },
                    cache: { type: 'boolean', default: true },
                })
                .task(({ argv, data }, task) => {
                    task.output = 'Hello';

                    return new Promise((resolve) => setTimeout(resolve, 2000));
                });
    },
    // Code bellow will actually be a plugin like:
    // require('ugo-plugin-postcss')(),
    (ugo) => {
        ugo.command('build')
            .step('postcss')
                .title('Building with PostCSS')
                .options({
                    'output-dir': { type: 'string', default: 'dist', description: 'foo' },
                    cache: { type: 'boolean', default: true },
                })
                .task(({ argv, data }, task) => {
                    task.output = 'Hello';

                    return new Promise((resolve) => setTimeout(resolve, 2000));
                });
    },
    (ugo) => {
        ugo.command('build', 'foo')
            .description('Builds the project')
            .builder((yargs) => yargs.strict());
    },
];
