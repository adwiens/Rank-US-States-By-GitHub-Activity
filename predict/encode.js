global.fetch = require('node-fetch'); // U.S.E. requires fetch
const use = require('@tensorflow-models/universal-sentence-encoder');
const fs = require('fs');
const path = require('path');
const _ = require('lodash');

const trainingSet = require('./training-set-labeled.json');

(async () => {

  // Get U.S.E. model:
  const model = await use.load();

  // Load all training data:
  const states = [
    'X', // == "not a U.S. state"
    'DC',
    'WA',
    'VT',
    'OR',
    'NY',
    'UT',
    'MA',
    'CO',
    'CA',
    'DE',
    'MT',
    'NC',
    'MN',
    'PA',
    'TN',
    'NH',
    'NM',
    'TX',
    'WI',
    'IL',
    'MO',
    'IA',
    'GA',
    'VA',
    'ID',
    'AZ',
    'OK',
    'MD',
    'IN',
    'HI',
    'MI',
    'NJ',
    'AR',
    'FL',
    'LA',
    'AL',
    'CT',
    'OH',
    'KY',
    'SC',
    'KS',
    'NV',
  ];
  const encoded = [];
  for (let label = 0; label < states.length; label++) {
    const state = states[label];
    process.stdout.write(`Loading state ${label + 1} of ${states.length} (${state})`);
    const rows = trainingSet.filter(row => row[1] === state);
    const trainingLocations = rows.map(itm => itm[0]);
    for (let idx = 0; idx < trainingLocations.length; idx++) {
      process.stdout.write('.');
      // Embed title string as number[] with U.S.E.:
      encoded.push([ label, _.flatten(await (await model.embed(trainingLocations[idx])).array()) ]);
    }
    process.stdout.write('\n');
  }

  // Write encoded trainingLocations to file:
  console.log('Writing JSON file...');
  fs.writeFileSync(path.join(__dirname, 'encoded.json'), JSON.stringify(encoded));
  console.log('Done.');
  process.exit();

})();
