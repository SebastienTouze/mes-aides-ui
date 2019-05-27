require('../../../backend');
require('expect');
Promise = require('bluebird');

var mongoose = require('mongoose');
var openfisca = Promise.promisifyAll(require('.'));
var request = Promise.promisify(openfisca.sendToOpenfisca('calculate', (s) => s));


var fs = Promise.promisifyAll(require('fs'));

var common = require('./mapping/common');
var { init, prefix, append } = require('./bulk');


// Setup mongoose
var Situation = mongoose.model('Situation');


const benefits = [
  'rsa',
  'ppa',
  'aide_logement',
  'aah'
];

//const id = '5cdeaff798caa56428d468f3'; // SDS
//const id = '5ce5796705cba8696945b476'; // Locataire
//const id = '5ce80a33636cb968b6852cad'; // 2 adultes
const id = '5ce80bac598c286abed27e32'; // seul en situation de handicap

const variable = 'salaire_net';

var values = [];
var base = 30;
var steps = base + 1;
var max = base * 100;
for (var i=0; i<steps; i = i+1) {
  values.push(i * max / (steps-1));
}
const fullTimePeriodLength = 25;
const fullTimePeriod = 'month:2017-05:' + fullTimePeriodLength.toString();

function extractResults({ source, response }) {
  const periods = common.getPeriods(source.dateDeValeur);
  const entities = ['familles', 'individus'];

  return entities.reduce((groupAccum, group) => {
    const entityNames = Object.keys(response[group]);
    return entityNames.reduce((entityAccum, id) => {
      const prefix = id.split('_')[0];
      entityAccum[prefix] = entityAccum[prefix] || {};

      return benefits.reduce((benefitAccum, variable) => {
        const base = response[group][id][variable];
        if (base) {
          benefitAccum[prefix][variable] = base[periods.thisMonth];
        }

        return benefitAccum;
      }, entityAccum);
    }, groupAccum);
  }, {})
}

function dumpResults(e) {

  var ks = Object.keys(e);
  var r = ks.map(k => {
    var n = k.split('_')[0];
    return [n, n, e[k].rsa, e[k].ppa, e[k].aide_logement, e[k].aah].join(';');
  }).join('\n').replace(/\./g,',');

  var h = ['', 'SN', 'RSA', 'PPA', 'AL', 'AAH'].join(';');
  console.log(h);
  console.log(r);
}

function main() {
    Situation.findOne({ _id: id })
    .then(s => {
      const periods = common.getPeriods(s.dateDeValeur);

      return values.reduce((a, v) => {
        s.individus[0][variable] = {};
        s.individus[0][variable][fullTimePeriod] = fullTimePeriodLength * v;
        var ss = openfisca.buildOpenFiscaRequest(s);
        var prefixed = prefix(v.toString() + '_', ss);
        return append(a, prefixed);
      }, init());
    })
    .then(s => {
      //return Promise.resolve(require('./payload3.json'))//
      return request(s)
      .then(payload => {
        //  console.log(JSON.stringify(payload, null, 2))
        return {
          source: s,
          response: payload,
        }
      });
    })
    .then(s => {
      var timestamp = new Date();
      var filename = 'axe_' + id + '_' + timestamp.toISOString().replace(/:/g, '-') + '.json';

      return fs.writeFileAsync(filename, JSON.stringify(s, null, 2))
      .then(() => s)
    })
    .then(s => {
      const results = extractResults(s)
      console.log(results)
      dumpResults(results);
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
