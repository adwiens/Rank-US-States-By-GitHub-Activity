const fs = require('fs');
const _ = require('lodash');

const popByState = [
  ['CA',	39557045],
  ['TX',	28701845],
  ['FL',	21299325],
  ['NY',	19542209],
  ['PA',	12807060],
  ['IL',	12741080],
  ['OH',	11689442],
  ['GA',	10519475],
  ['NC',	10383620],
  ['MI',	9995915],
  ['NJ',	8908520],
  ['VA',	8517685],
  ['WA',	7535591],
  ['AZ',	7171646],
  ['MA',	6902149],
  ['TN',	6770010],
  ['IN',	6691878],
  ['MO',	6126452],
  ['MD',	6042718],
  ['WI',	5813568],
  ['CO',	5695564],
  ['MN',	5611179],
  ['SC',	5084127],
  ['AL',	4887871],
  ['LA',	4659978],
  ['KY',	4468402],
  ['OR',	4190713],
  ['OK',	3943079],
  ['CT',	3572665],
  ['UT',	3161105],
  ['IA',	3156145],
  ['NV',	3034392],
  ['AR',	3013825],
  ['MS',	2986530],
  ['KS',	2911505],
  ['NM',	2095428],
  ['NE',	1929268],
  ['WV',	1805832],
  ['ID',	1754208],
  ['HI',	1420491],
  ['NH',	1356458],
  ['ME',	1338404],
  ['MT',	1062305],
  ['RI',	1057315],
  ['DE',	967171],
  ['SD',	882235],
  ['ND',	760077],
  ['AK',	737438],
  ['DC',	702455],
  ['VT',	626299],
  ['WY',	577737],
];

const all = fs.readFileSync('predictions.json', 'utf8');
const lines = all.split('\n');
const countsByState = popByState.map(pair => [pair[0], 0]);
let totalCount = 0;
for (let line of lines) {
  try {
    const [_rawName, _rawLocation, state] = JSON.parse(line);
    if (state != 'X') {
      countsByState.find(countPair => countPair[0] === state)[1]++; // increment
      totalCount++;
    }
  } catch (e) {
    // console.log(e);
    // console.log(line);
  }
}

const countsPerCapita = _.zip(countsByState, popByState).map(ppair => [ppair[0][0], ppair[0][1] / ppair[1][1] * 10000000]);
countsPerCapita.sort((t1, t2) => t1[1] < t2[1] ? 1 : t1[1] > t2[1] ? -1 : 0);
const countsPerCapPairs = countsPerCapita.map(([abbr, count]) => [abbr, count / countsPerCapita.find(c => c[0] === 'WA')[1] * 100]);
console.log(JSON.stringify(_.fromPairs(countsPerCapPairs), undefined, 2));
console.log('Total count:', totalCount);

fs.writeFileSync('results.csv', countsPerCapPairs.map(pair => pair.join(',')).join('\n'));
