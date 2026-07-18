const process = require('process');

const options = {
  target: process.argv[2],
  port: process.argv[3],
  duration: process.argv[4],
  pps: process.argv[5],
};

console.log('Demo LAYER 4 TCP')
const durationMs = Math.max(0, Number(options.duration || 0) * 1000);
setTimeout(() => {
  console.log(options.target, options.port, options.duration, options.pps);
  console.log('Done');
}, durationMs);
