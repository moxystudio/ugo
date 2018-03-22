'use strict';

const { run } = require('./');
//
// createUgo()
// .then((ugo) => {
//     console.log(ugo);
//
//     console.log(ugo.command('build'));
// })
// .catch((err) => {
//     console.log('ops', err);
// });

run(process.argv.slice(2))
.then(() => {
    console.log('yea!!');
})
.catch((err) => {
    console.log('ops', err);
});
