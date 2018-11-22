var es = require('event-stream');

// Loads
require('../../../backend');
require('expect');
var mongoose = require('mongoose');

// Setup mongoose
var Situation = mongoose.model('Situation');

var lib = require('.');

var counter = 0;
var errors = 0;
var limit = 5;
var startDate = (new Date()).toISOString();


entityGroups = {
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

  })

  return situation
}

result = reset()
function test() {
    Situation.find().sort({ dateDeValeur: -1 }).limit(limit).cursor()
        .pipe(es.map(function (situation, done) {
            console.log(lib.buildOpenFiscaRequest(situation))
            done()
        }))
        .on('end', function() {
            process.exit();
        })
        .on('error', function(err) {
            console.trace(err);
            process.exit();
        })
        .resume();
}

test();
