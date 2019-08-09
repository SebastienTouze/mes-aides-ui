'use strict';

var alternatives = [{
    label: "J'en bénéficie déjà",
    value: "ok"
},{
    label: "J'ai déjà fait une demande",
    value: "waiting"
},{
    label: "Je n'en bénéficie pas actuellement",
    value: "ko"
}];

angular.module('ddsApp').controller('FoyerBenefitsCtrl', function($scope, droitsDescription, ResultatService) {
    $scope.alternatives = alternatives;
    $scope.benefits = ResultatService.getCache().droitsEligibles;
    $scope.benefits.forEach(function (b) {
        b.status = 'ko';
    });

    $scope.submit = function() {
        // ok
        // -> resultat jusqu'au présent

        // waiting
        // ko
        // -> 0 dans le passé


        // analytics
        // $analytics.eventTrack('show', { category: 'General', label: d.label });

    }
});
