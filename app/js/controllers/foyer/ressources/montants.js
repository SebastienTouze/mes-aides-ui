'use strict';

angular.module('ddsApp').controller('FoyerRessourcesMontantsCtrl', function($scope, $stateParams, $uibModal, ressourceTypes, RessourceService, IndividuService) {
    $scope.yearMoins1 = moment($scope.situation.dateDeValeur).subtract(1, 'years').format('YYYY');
    $scope.currentMonth = moment($scope.situation.dateDeValeur).format('MMMM YYYY');

    $scope.individuLabel = IndividuService.label($scope.individu);

    $scope.ressourceTypes = _.keyBy(ressourceTypes, 'id');
    $scope.isNumber = angular.isNumber;

    _.forEach($scope.selectedRessourceTypes, function(value, key) {
        RessourceService.setDefaultValueForCurrentYear($scope.situation.dateDeValeur, $scope.individu, $scope.ressourceTypes[key]);
    });

    console.log('yo')

    $scope.openModal = function(ressourceType) {
        console.log('openModal', ressourceType);

        var modalInstance = $uibModal.open({
            animation: true,
            ariaLabelledBy: 'modal-title',
            ariaDescribedBy: 'modal-body',
            templateUrl: '/partials/foyer/ressources/montants-modal.html',
            controller: 'FoyerRessourcesMontantsModalCtrl',
            // controllerAs: '$ctrl',
            // size: size,
            // appendTo: parentElem,
            resolve: {
                situation: function () {
                    return $scope.situation;
                },
                individu: function () {
                    return $scope.individu;
                },
                ressourceType: function () {
                    return ressourceType
                }
            }
        });
    }

    $scope.submit = function(form) {
        form.submitted = true;
        if (form.$valid) {
            $scope.individu.hasRessources = ! _.isEmpty($scope.selectedRessourceTypes);
            $scope.declareNextIndividuResources(parseInt($stateParams.individu));
        }
    };
});
