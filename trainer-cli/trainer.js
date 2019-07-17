const fs = require('fs');
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});
const question = q => new Promise(resolve => readline.question(q, res => resolve(res)));

const trainingData = fs.readFileSync('../training-data/training-set.json', 'utf8');
const lines = trainingData.split('\n');

(async () => {
  let iterNum = 0;
  for (let line of lines) {
    const rawLoc = JSON.parse(line)[1];
    let state = await question(`#${++iterNum}: "${rawLoc}"  ? `);
    if (state === '') {
      state = 'X';
    }
    fs.writeFileSync('training-set-labeled.json', JSON.stringify([rawLoc, state.toUpperCase()]) + '\n', { flag: 'a' });
  }
  readline.close();
  process.exit(0);
})();

