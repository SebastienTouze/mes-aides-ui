'use strict';

var textMask = require('vanilla-text-mask');
var createAutoCorrectedDatePipe = require('text-mask-addons').createAutoCorrectedDatePipe;
var Modernizr = require('modernizr');

var FORMATS = {
    'JJ/MM/AAAA': {
        acceptedFormats: ['DD/MM/YY', 'DD/MM/YYYY'],
        outputFormat: 'DD/MM/YYYY',
        isoFormat: 'YYYY-MM-DD',
        mask: [
            /\d/, /\d/,
            '/',
            /\d/, /\d/,
            '/',
            /\d/, /\d/, /\d/, /\d/
        ],
        autoCorrectedDatePipe: createAutoCorrectedDatePipe('dd/mm/yyyy'),
        inputType: 'date'
    },
    'MM/AAAA': {
        acceptedFormats: ['MM/YY', 'MM/YYYY'],
        outputFormat: 'MM/YYYY',
        isoFormat: 'YYYY-MM',
        mask: [
            /\d/, /\d/,
            '/',
            /\d/, /\d/, /\d/, /\d/
        ],
        autoCorrectedDatePipe: createAutoCorrectedDatePipe('mm/yyyy'),
        inputType: 'month'
    }
};

function fallbackLink(scope, element, attributes, ctrl) {
    var format = attributes.format;
    var maxDate = attributes.max && moment(attributes.max);
    var minDate = attributes.min && moment(attributes.min);
    element.attr('placeholder', format);
    element.attr('type', 'text');

    ctrl.$parsers.push(function(viewValue) {
        return viewValue && moment(viewValue, FORMATS[format].acceptedFormats, true);
    });

    ctrl.$formatters.push(function(date) {
        return date && moment(date).format(FORMATS[format].outputFormat);
    });

    ctrl.$validators.format = function(modelValue) {
        return ! modelValue || modelValue.isValid();
    };
    ctrl.$validators.isAfterMax = function(modelValue) {
        return ! maxDate || ! modelValue || ! modelValue.isValid() || maxDate.diff(modelValue, 'days') >= 0;
    };
    ctrl.$validators.isBeforeMin = function(modelValue) {
        return ! minDate || ! modelValue || ! modelValue.isValid() || minDate.diff(modelValue, 'days') <= 0;
    };

    var maskedInputController = textMask.maskInput({
        inputElement: element[0],
        mask: FORMATS[format].mask,
        pipe: FORMATS[format].autoCorrectedDatePipe,
        guide: true,
        keepCharPositions: true,
        placeholderChar: '\u2000',
    });

    element.on('$destroy', maskedInputController.destroy); // don't leak event listeners
}

function link(scope, element, attributes, ctrl) {
    var format = attributes.format;
    var inputType = FORMATS[format].inputType;
    element.attr('type', inputType);

    ctrl.$parsers.push(function(viewValue) {
        return viewValue && moment(viewValue, FORMATS[format].isoFormat, true);
    });

    ctrl.$formatters.push(function(date) {
        return date && moment(date).format(FORMATS[format].isoFormat);
    });

    ctrl.$validators.isAfterMax = function() {

        if (element[0].checkValidity()) {

            return true;
        }

        var validityState = element[0].validity;
        if (validityState.valueMissing || validityState.rangeOverflow) {

            return false;
        }

        return true;
    };
    ctrl.$validators.isBeforeMin = function() {

        if (element[0].checkValidity()) {

            return true;
        }

        var validityState = element[0].validity;
        if (validityState.valueMissing || validityState.rangeUnderflow) {

            return false;
        }

        return true;
    };
}

angular.module('ddsApp').directive('ddsDate', function() {
    return {
        require: 'ngModel',
        restrict: 'A',
        link: function(scope, element, attributes, ctrl) {
            if (Modernizr.inputtypes.date && Modernizr.inputtypes.month && Modernizr.formvalidation) {
                link(scope, element, attributes, ctrl);
            } else {
                fallbackLink(scope, element, attributes, ctrl);
            }
        }
    };
});
