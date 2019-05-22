require('../../../backend');
require('expect');
Promise = require('bluebird');

var mongoose = require('mongoose');
var openfisca = Promise.promisifyAll(require('.'));

var common = require('./mapping/common');

// Setup mongoose
var Situation = mongoose.model('Situation');


const benefits = [
  'rsa',
  'ppa',
  'aide_logement'
];

function extractResults({ source, response }) {
  const periods = common.getPeriods(source.dateDeValeur);
  return benefits.reduce((a, v) => {
    a[v] = response.familles._[v][periods.thisMonth];
    return a;
  }, {});
}

function main() {
    Situation.findOne({ _id: '5cdeaff798caa56428d468f3' })
    .then(s => {

      return Promise.resolve(require('./payload.json'))//openfisca.calculateAsync(s)
      .then(payload => {
        return {
          source: s,
          response: payload,
        }
      });
    })
    .then(s => {
      const results = extractResults(s)
      console.log(results)
      return s;
    })
    .catch(e => {
      console.error(e)
    })
    .finally(() => {
      process.exit();
    })
}

main();
