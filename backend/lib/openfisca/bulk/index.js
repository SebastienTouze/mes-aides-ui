var es = require('event-stream');

// Loads
require('../../../../backend');
require('expect');
var mongoose = require('mongoose');
var moment = require('moment');
var bluebird = require('bluebird');
var fs = bluebird.promisifyAll(require('fs'));

// Setup mongoose
var Situation = mongoose.model('Situation');

var lib = require('..');

var entityGroups = {
    individus: [],
    familles: ['parents', 'enfants'],
    foyers_fiscaux: ['declarants', 'personnes_a_charge'],
    menages: ['personne_de_reference', 'conjoint', 'enfants']
};

function init() {
    result = Object.keys(entityGroups).reduce((accum, entityName) => {
        accum[entityName] = {};
        return accum;
    }, {});
    result['individus'] = {};

    return result;
}

function prefix(prefix, situation) {
    Object.keys(entityGroups).forEach(entityName => {
        var oldKeys = Object.keys(situation[entityName]);
        oldKeys.forEach(name => {
            situation[entityName][prefix + name] = situation[entityName][name];
            delete situation[entityName][name];
        });

        entityGroups[entityName].forEach(property => {
            Object.keys(situation[entityName]).forEach(id => {
                let entity = situation[entityName][id];

                if (entity[property]) {
                    entity[property] =  entity[property].map(id => prefix + id);
                }
            });
        });
    });

    return situation;
}

function append(acummulator, situation) {
    Object.keys(entityGroups).forEach(entityName => {
        Object.keys(situation[entityName]).forEach(id => {
            acummulator[entityName][id] = situation[entityName][id];
        });
    });

    return acummulator;
}

var result = init();
function generateDailyDataset(date) {
    var start = moment(date);
    var end =  start.clone().add(1, 'days');
    Situation.find({
        dateDeValeur: { $gte: start.toDate(), $lte: end.toDate() }
    })
        .cursor()
        .pipe(es.map(function (situation, done) {
            var request = lib.buildOpenFiscaRequest(situation);
            append(result, prefix(situation._id.valueOf(), request));
            done();
        }))
        .on('end', function() {
            var timestamp = new Date();
            var filename = date + timestamp.toISOString().replace(/:/g, '-') + '.json';
            console.log('Writing to ' + filename + '.');
            return fs.writeFileAsync(filename, JSON.stringify(result))
                .then(function() {
                    process.exit();
                });
        })
        .on('error', function(err) {
            console.trace(err);
            process.exit();
        })
        .resume();
}

module.exports = {
    init,
    prefix,
    append
};

//generateDailyDataset('2019-03-20');
