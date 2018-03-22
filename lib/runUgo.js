'use strict';

const createYargs = require('yargs/yargs');
const { reduce, forEach, map, wrap, camelCase } = require('lodash');
const Listr = require('listr');
const getOptionsCollisions = require('./optionsCollisions');

function createYargsCommandBuilder(command) {
    return (yargs) => {
        const optionsCollisions = getOptionsCollisions(command);

        forEach(command.steps.entries(), (step, stepName) => {
            forEach(step.options, (option, optionName) => {
                if (!optionsCollisions[optionName]) {
                    option.exposeAs = optionName;
                } else if (!option.exposeAs) {
                    option.exposeAs = `${stepName}-${optionName}`;
                }

                yargs.option(option.exposeAs, option);
            });
        });

        command.get('builder')(yargs);
    };
}

function createYargsCommandHandler(command, options) {
    return (commandArgv) => {
        const tasks = map(command.steps.entries(), (step) => ({
            ...step.entries(),
            task: wrap(step.get('task'), (fn, ctx, task) => {
                const argv = reduce(step.options, (argv, option, optionName) => {
                    argv[optionName] = argv[option.exposeAs];
                    argv[camelCase(optionName)] = argv[option.exposeAs];

                    return argv;
                }, {});

                ctx.argv = argv;

                return fn(ctx, task);
            }),
        }));

        const listr = new Listr(tasks, {
            renderer: options.renderer,
            nonTTYRenderer: options.nonTTYRenderer,
        });

        const promise = listr.run({
            argv: undefined,
            commandArgv,
            data: {},
        });

        Object.defineProperty(commandArgv, '_listrPromise', { value: promise });
    };
}

function runUgo(ugo, args, options) {
    options = {
        renderer: 'default',
        nonTTYRenderer: 'verbose',
        ...options,
    };

    // Setup yargs
    const yargs =
        createYargs()
        .help()
        .version()
        .demandCommand(1)
        .check((argv) => {
            // Check if the command exists
            if (argv._[0] && !ugo.commands.has(argv._[0])) {
                throw new Error(`Unknown command: ${argv._[0]}`);
            }

            return true;
        });

    forEach(ugo.commands.entries(), (command) => {
        yargs.command({
            command: command.get('name'),
            describe: command.get('description') || '',
            builder: createYargsCommandBuilder(command),
            handler: createYargsCommandHandler(command, options),
        });
    });

    // Execute yargs
    return new Promise((resolve, reject) => {
        yargs.parse(args, (err, argv, output) => {
            output && process.stderr.write(`${output}\n`);

            if (err) {
                reject(err);
            } else {
                resolve(argv._listrPromise);
            }
        });
    });
}

module.exports = runUgo;
