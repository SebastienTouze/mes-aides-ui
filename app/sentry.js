var angular = require('angular');
var Raven = require('raven-js');

Raven
    .config('https://fde1d4c9741e4ef3a3416e4e88b61392@sentry.data.gouv.fr/17', {
        ignoreUrls: [
            /^file:\/\//i
        ]
    })
    .addPlugin(require('raven-js/plugins/angular'), angular)
    .install();
