'use strict';

const createYargs = require('yargs/yargs');
const { reduce, wrap, camelCase } = require('lodash');
const Listr = require('listr');
const getOptionsCollisions = require('./util/getOptionsCollisions');
const renderError = require('./util/renderError');

function createYargsCommandBuilder(command) {
    return (yargs) => {
        const optionsCollisions = getOptionsCollisions(command);

        command.steps.forEach((step) => {
            Object.entries(step.options).forEach(([optionName, option]) => {
                if (!optionsCollisions[optionName]) {
                    option.exposeAs = optionName;
                } else if (!option.exposeAs) {
                    option.exposeAs = `${step.name}-${optionName}`;
                }

                yargs.option(option.exposeAs, option);
            });
        });

        if (command.builder) {
            command.builder(yargs);
        }
    };
}

function createYargsCommandHandler(command, options) {
    return (commandArgv) => {
        const tasks = command.steps.map((step) => ({
            ...step,
            task: wrap(step.task, (fn, ctx, task) => {
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

async function runUgo(ugo, argv, options) {
    options = {
        renderer: 'default',
        nonTTYRenderer: 'verbose',
        ...options,
    };

    // Setup base yargs
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

    // Register commands in yargs
    const commands = ugo.commands.toConfig();

    commands.forEach((command) =>
        yargs.command({
            command: command.name,
            describe: command.description,
            builder: createYargsCommandBuilder(command),
            handler: createYargsCommandHandler(command, options),
        }));

    // Execute yargs
    try {
        await new Promise((resolve, reject) => {
            yargs.parse(argv, (err, argv, output) => {
                output && process.stderr.write(`${output}\n`);

                if (err) {
                    Object.defineProperty(err, 'yargs', { value: true });
                    reject(err);
                } else {
                    resolve(argv._listrPromise);
                }
            });
        });
    } catch (err) {
        // Print non-yargs error
        if (!err.yargs) {
            process.stderr.write(`\n${renderError(err)}`);
        }

        throw err;
    }
}

module.exports = runUgo;
