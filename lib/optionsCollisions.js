'use strict';

const { reduce, forEach } = require('lodash');

function getOptionsCollisions(command) {
    // Generate an intermediate array so that it's easier to search for collisions
    // [
    //   { stepName: 'babel', optionName: 'output-dir', optionType: 'string' },
    //   { stepName: 'babel', optionName: 'cache', optionType: 'boolean' },
    //   { stepName: 'postcss', optionName: 'output-dir', optionType: 'string' },
    //   { stepName: 'postcss', optionName: 'cache', optionType: 'string' },
    // ]
    const intermediateArray = reduce(command.steps.entries(), (intermediateArray, step, stepName) => {
        forEach(step.options, (option, optionName) =>
            intermediateArray.push({
                optionName: option.exposeAs || optionName,
                optionType: option.type,
                stepName,
            }));

        return intermediateArray;
    }, []);

    // Detect collisions using the intermediate array
    const collisions = intermediateArray.reduce((collisions, item, index) => {
        if (collisions[item.optionName]) {
            collisions[item.optionName].push(item.stepName);

            return collisions;
        }

        const itemWithSameOption = intermediateArray.find((item2, index2) =>
            index > index2 &&
            item.optionName === item2.optionName && item.optionType !== item2.optionType);

        if (itemWithSameOption) {
            collisions[item.optionName] = [item.stepName];
        }

        return collisions;
    }, {});

    // At this point, the `collisions` variable has the following shape:
    // {
    //   cache: ['babel', 'postcss'],
    // }
    return collisions;
}

module.exports = getOptionsCollisions;
