var mongoose = require('mongoose');
var config = require('./backend/config/config');
var _ = require('lodash');
var fs = require('fs');
var ObjectId = mongoose.Types.ObjectId;

require('./backend/config/mongoose')(mongoose, config);
require('ludwig-api/lib/config/mongoose').init(mongoose);

var models = mongoose.modelNames()
let writeStream = fs.createWriteStream('results.csv');

var AcceptanceTest = mongoose.model('AcceptanceTest');
var AcceptanceTestExecution = mongoose.model('AcceptanceTestExecution');

var allTests = AcceptanceTest
    .find({})
    .populate('lastExecution')
    .cursor();

var prestations = {}

allTests.on('data', function(acceptanceTest) {

    if (acceptanceTest.expectedResults.length === 0) {

        return;
    }

    if (!acceptanceTest.lastExecution) {

        return;
    }

    if (acceptanceTest.lastExecution.status === 'rejected') {

        return;
    }

    var expected = {}
    var actual = {}

    _.each(acceptanceTest.expectedResults, function(result) {
        expected[result.code] = result.expectedValue;
    });
    _.each(acceptanceTest.lastExecution.results, function(result) {
        actual[result.code] = result.result;
    });

    var keys = _.intersection(_.keys(expected), _.keys(actual));

    _.each(keys, function(name) {
        if (!prestations[name]) {
            prestations[name] = [];
        }

        var expectedValue = expected[name];
        var actualValue = actual[name];

        if (typeof expectedValue === 'boolean' || typeof expectedValue === 'string') {

            return;
        }

        var diff = actualValue - expectedValue;

        if (isNaN(diff)) {

            return;
        }

        var diffRounded = Math.floor(Math.round(diff));
        if (diffRounded === 0) {
            diffRounded = Math.abs(diffRounded);
        }

        writeStream.write(`${name},${diffRounded}\n`);

    });

});

allTests.on('close', function() {
  writeStream.end();
  mongoose.connection.close();
});
