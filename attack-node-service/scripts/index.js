const process = require('process');

console.log('Script here.');
const options = {
    target: process.argv[2],
    duration: process.argv[3],
    rate: process.argv[4],
};
setTimeout(() => { }, +options.duration * 1000);