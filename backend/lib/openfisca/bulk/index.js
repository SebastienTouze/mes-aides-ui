var es = require('event-stream');

// Loads
require('../../../../backend');
require('expect');
var mongoose = require('mongoose');

// Setup mongoose
var Situation = mongoose.model('Situation');

var lib = require('..');

var counter = 0;
var errors = 0;
var limit = 30000;
var startDate = (new Date()).toISOString();


entityGroups = {
  individus: [],
  familles: ['parents', 'enfants'],
  foyers_fiscaux: ['declarants', 'personnes_a_charge'],
  menages: ['personne_de_reference', 'conjoint', 'enfants']
}

function reset() {
  result = Object.keys(entityGroups).reduce((accum, entityName) => {
    accum[entityName] = {};
    return accum;
  }, {})
  result['individus'] = {};

  return result;
}

function prefix(prefix, situation) {
  Object.keys(entityGroups).forEach(entityName => {
    oldKeys = Object.keys(situation[entityName]);
    oldKeys.forEach(name => {
      situation[entityName][prefix + name] = situation[entityName][name]
      delete situation[entityName][name]
    })

    entityGroups[entityName].forEach(property => {
      Object.keys(situation[entityName]).forEach(id => {
        let entity = situation[entityName][id]

        if (entity[property]) {
          entity[property] =  entity[property].map(id => prefix + id)
        }
      })
    })
  })

  return situation
}

function append(acummulator, situation) {
  Object.keys(entityGroups).forEach(entityName => {
    Object.keys(situation[entityName]).forEach(id => {
      acummulator[entityName][id] = situation[entityName][id]
    })
  })

  return acummulator
}

result = reset()
function test() {
  Situation.find().sort({ dateDeValeur: -1 }).skip(100).limit(limit).cursor()
    .pipe(es.map(function (situation, done) {
      append(result, prefix(situation._id.valueOf(), lib.buildOpenFiscaRequest(situation)))
      done()
    }))
    .on('end', function() {
      console.log(JSON.stringify(result))
      process.exit();
    })
    .on('error', function(err) {
      console.trace(err);
      process.exit();
    })
    .resume();
}

test();
