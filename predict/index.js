global.fetch = require('node-fetch'); // U.S.E. requires fetch
const tf = require('@tensorflow/tfjs'); // Needed to manipulate tensors
const use = require('@tensorflow-models/universal-sentence-encoder');
const knnClassifier = require('@tensorflow-models/knn-classifier');
const fs = require('fs');
const readline = require('readline');
const _ = require('lodash');

const allStates = {
  DC: 'DC', // must be before washington so it matches washington dc first
  WA: 'Washington',
  VT: 'Vermont',
  OR: 'Oregon',
  NY: 'New York',
  UT: 'Utah',
  MA: 'Massachusetts',
  CO: 'Colorado',
  CA: 'California',
  DE: 'Delaware',
  MT: 'Montana',
  NC: 'North Carolina',
  MN: 'Minnesota',
  PA: 'Pennsylvania',
  TN: 'Tennessee',
  NH: 'New Hampshire',
  NM: 'New Mexico',
  TX: 'Texas',
  WI: 'Wisconsin',
  IL: 'Illinois',
  MO: 'Missouri',
  IA: 'Iowa',
  GA: 'Georgia',
  VA: 'Virginia',
  ID: 'Idaho',
  AZ: 'Arizona',
  OK: 'Oklahoma',
  MD: 'Maryland',
  IN: 'Indiana',
  HI: 'Hawaii',
  MI: 'Michigan',
  NJ: 'New Jersey',
  AR: 'Arkansas',
  FL: 'Florida',
  LA: 'Louisiana',
  AL: 'Alabama',
  CT: 'Connecticut',
  OH: 'Ohio',
  KY: 'Kentucky',
  SC: 'South Carolina',
  KS: 'Kansas',
  NV: 'Nevada',
};
const allStateAbbrs = _.keys(allStates);
const allLabels = [
  'X', // == "not a U.S. state"
  ...allStateAbbrs,
];

const getRegExp = (stateAbbr, full) => new RegExp(`(?:\\b${stateAbbr}\\b|\\b${full}\\b)`, 'i');
const allRegExp = _.toPairs(allStates).map(([abbr, full]) => [abbr, getRegExp(abbr, full)]);

(async () => {

  // Get sentence tokenizer and KNN classifier:
  const usaClassifier = knnClassifier.create();
  const classifier = knnClassifier.create();
  const model = await use.load();

  // Add titles to KNN classifier:
  console.log('Loading encoded USA training data...');
  require('./encoded-usa.json').forEach(([label, row]) => {
    usaClassifier.addExample(tf.tensor1d(row), label);
  });
  console.log('Loading encoded training data...');
  require('./encoded.json').forEach(([label, row]) => {
    classifier.addExample(tf.tensor1d(row), label);
  });

  const fileStream = fs.createReadStream('../training-data/user-locations.json', { encoding: 'utf8' });
  const rl = readline.createInterface({ input: fileStream });

  // Classify each raw user location string:
  for await (const line of rl) {
    try {
      const [username, rawLocation] = JSON.parse(line);
      const encoded = await model.embed(rawLocation);
      const usaPrediction = await usaClassifier.predictClass(encoded, 1);
      let prediction;
      if (usaPrediction.classIndex > 0) { // IF IN USA
        const easyMatch = allRegExp.find(([_abbr, reg]) => reg.test(rawLocation.replace(/\./g, ''))); // remove all periods so that dc will match
        if (easyMatch) { // IF MATCHED A STATE NAME OR ABBREVIATION EXACTLY
          prediction = easyMatch[0];
        } else { // FALLBACK TO U.S.E. IF NOT AN EXACT MATCH
          prediction = allLabels[(await classifier.predictClass(encoded, 1)).classIndex];
        }
      } else { // IF NOT IN USA, SKIP
        prediction = 'X'; // 'X' === 'not a US state'
      }
      fs.writeFileSync('predictions.json', JSON.stringify([username, rawLocation, prediction]) + '\n', { flag: 'a' });
      process.stdout.write('.');
    } catch (e) {
      console.warn('Warning: Could not process a user: ', e);
    }
  }

})();
