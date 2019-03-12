'use strict';

angular.module('ddsApp').controller('benefitCtaCtrl', function($scope, $state, SituationService, TrampolineService) {
    $scope.getActionURL = function(droit) {
        var action = droit.teleservice || droit.form || droit.instructions;

        if (typeof action === 'object') {
            return $state.href(action.state, action.params);
        }

        return action;
    };

    $scope.onClick = function(droit) {
        var action = droit.teleservice || droit.form || droit.instructions;

        if (typeof action === 'object') {
            var situation = SituationService.restoreLocal();
            TrampolineService.set({ situationId: situation._id });
        }
    };
});

angular.module('ddsApp').directive('benefitCta', function() {
    return {
        restrict: 'E',
        templateUrl: '/partials/benefit-cta.html',
        scope: {
            droit: '=',
            explicit: '=',
            size: '=',
        },
        controller: 'benefitCtaCtrl',
    };
});

var regimes = {
    general: {
        label: 'le régime général'
    },
    msa: {
        label: 'la mutualité sociale agricole (MSA)'
    }
};

angular.module('ddsApp').component('benefitCtaModalComponent', {
    templateUrl: '/partials/benefit-cta-modal.html',
    bindings: {
        resolve: '<',
        close: '&',
        dismiss: '&'
    },
    controller: function ($scope) {
        var $ctrl = this;

        $scope.getDetails = function(key) {
            return regimes[key];
        };

        $scope.buildBenefit = function(type, value) {
            var res = {};
            res[type] = value;
            return res;
        };

        $ctrl.$onInit = function () {
            var droit = $ctrl.resolve.droit;
            $scope.droit = droit;
        };

        $ctrl.ok = function () {
            $ctrl.close({$value: 'ok'});
        };

        $ctrl.cancel = function () {
            $ctrl.dismiss({$value: 'cancel'});
        };
    }
});//*/
