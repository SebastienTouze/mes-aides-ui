'use strict';

angular.module('ddsApp').controller('FoyerRessourcesMontantsModalCtrl', function($scope, $uibModalInstance, individu, ressourceType, situation, MonthService) {

    var momentDebutAnnee = moment(situation.dateDeValeur).subtract(1, 'years');
    var recentMonths = MonthService.getMonths(situation.dateDeValeur, 2, -1);

    $scope.debutAnneeGlissante = momentDebutAnnee.format('MMMM YYYY');
    $scope.threePreviousMonths = MonthService.getMonths(situation.dateDeValeur);
    $scope.lastMonth = recentMonths[0];

    console.log('lastMonth', $scope.lastMonth);
    console.log('threePreviousMonths', $scope.threePreviousMonths);
    console.log('individu', individu)

    $scope.step = 1;

    // var last12Months = MonthService.getMonths(scope.dateDeValeur, 12);
    // var previous9Months = last12Months.slice(0,9);

    // var recentMonths = MonthService.getMonths(scope.dateDeValeur, 2, -1);
    // var lastMonth = recentMonths[0];
    // var currentMonth = recentMonths[1];
    // var isoMonths = last12Months;

    setTimeout(function() {
        document.getElementById('last-month').focus();
    }, 500);

    $scope.next = function() {
        $scope.step = $scope.step + 1;
    }

    $scope.cancel = function() {
        $uibModalInstance.dismiss('cancel');
    }

    $scope.complete = function() {
        $uibModalInstance.dismiss('cancel');
    }

    $scope.ressourceType = ressourceType;
    $scope.individu = individu;

});
