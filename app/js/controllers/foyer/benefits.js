'use strict';

angular.module('ddsApp').controller('FoyerBenefitsCtrl', function($scope, droitsDescription) {
    $scope.benefits = [];
    for (var level in droitsDescription) {
        for (var provider in droitsDescription[level]) {
            for (var prestation in droitsDescription[level][provider].prestations) {
                $scope.benefits.push(_.assign({
                    id: prestation,
                    provider: _.assign({ id: provider, level: level }, droitsDescription[level][provider]),
                }, droitsDescription[level][provider].prestations[prestation]));
            }
        }
    }
});
