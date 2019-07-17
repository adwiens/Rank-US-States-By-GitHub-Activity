const fs = require('fs');
const _ = require('lodash');

console.log('READING FILE');
const wholeFile = fs.readFileSync('user-locations.json', 'utf8');
const lines = wholeFile.split('\n');
console.log('SHUFFLING');
const randomized = _.shuffle(lines);
const trainingSet = randomized.splice(0, 10000);

console.log('WRITING TRAINING SET');
fs.writeFileSync('training-set.json', trainingSet.join('\n'), 'utf8');
console.log('WRITING GEOCODE SET');
fs.writeFileSync('set-to-geocode.json', randomized.join('\n'), 'utf8');

console.log('DONE');
process.exit(0);
