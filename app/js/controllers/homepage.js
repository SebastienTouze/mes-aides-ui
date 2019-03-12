'use strict';

angular.module('ddsApp').controller('HomepageCtrl', function($scope, $state, $sessionStorage, droitsDescription, $timeout, phishingExpressions, $uibModal) {
    [ 'prestationsNationales', 'partenairesLocaux' ].forEach(function(type) {
        var providersWithoutPrivatePrestations = _.mapValues(droitsDescription[type], function(provider) {
            provider = _.assign({}, provider);
            provider.prestations = _.reduce(provider.prestations, function(prestations, prestation, name) {
                if (! prestation.private) {
                    prestations[name] = prestation;
                }

                return prestations;
            }, {});
            return provider;
        });

        $scope[type] = _.filter(providersWithoutPrivatePrestations, function(provider) { return _.size(provider.prestations); });

        $scope[type + 'Count'] = Object.keys($scope[type]).reduce(function(total, provider) {
            return total + _.size($scope[type][provider].prestations);
        }, 0);
    });

    var droit = droitsDescription.prestationsNationales.assurance_maladie.prestations.cmu_c;
    var modalInstance = $uibModal.open({
        animation: true,
        component: 'benefitCtaModalComponent',
        size: 'lg',
        resolve: {
            droit: function () {
              return droit;
            }
        }
    });

    modalInstance.result.then(function (result) {
        console.log(result);
    }, function () {
        console.info('Modal dismissed at: ' + new Date());
    });//*/

    var referrer = document.referrer;
    if (referrer.match(/ameli\.fr/)) {
        if (! $sessionStorage.ameliNoticationDone) {
            $sessionStorage.ameliNoticationDone = true;
            $state.go('ameli');
        }
    } else if (_.some(phishingExpressions, function(phishingExpression) { return referrer.match(phishingExpression); })) {
        if (! $sessionStorage.phishingNoticationDone) {
            $sessionStorage.phishingNoticationDone = true;
            $state.go('hameconnage');
        }
    } else {
        document.querySelector('#valueProposition a').focus();
    }
});
