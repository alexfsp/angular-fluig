'use strict';

var StringMask = require('string-mask');

function TimeMaskDirective($timeout) {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, element, attrs, ctrl) {

            if (attrs.fluigTimeMask === "false") return;

            var timeFormat = '00:00:00';

            if (angular.isDefined(attrs.fluigTimeMask) && attrs.fluigTimeMask === 'short') {
                timeFormat = '00:00';
            }

            var formattedValueLength = timeFormat.length;
            var unformattedValueLength = timeFormat.replace(':', '').length;
            var timeMask = new StringMask(timeFormat);

            function formatter(value) {
                if (ctrl.$isEmpty(value)) {
                    return value;
                }

                var cleanValue = value.replace(/[^0-9]/g, '').slice(0, unformattedValueLength) || '';
                return (timeMask.apply(cleanValue) || '').replace(/[^0-9]$/, '');
            }

            ctrl.$formatters.push(formatter);

            ctrl.$parsers.push(function parser(value) {
                if (ctrl.$isEmpty(value)) {
                    return value;
                }

                var viewValue = formatter(value);
                var modelValue = viewValue;

                if (ctrl.$viewValue !== viewValue) {
                    ctrl.$setViewValue(viewValue);
                    ctrl.$render();
                }

                var start = element[0].selectionStart;
                var end = element[0].selectionEnd + viewValue.length - value.length;

                $timeout(function () {
                    element[0].setSelectionRange(start, start);
                });

                return modelValue;
            });

            ctrl.$validators.time = function (modelValue) {
                if (ctrl.$isEmpty(modelValue)) {
                    return true;
                }

                var splittedValue = modelValue.toString().split(/:/).filter(function (v) {
                    return !!v;
                });

                var hours = parseInt(splittedValue[0]),
                    minutes = parseInt(splittedValue[1]),
                    seconds = parseInt(splittedValue[2] || 0);

                return modelValue.toString().length === formattedValueLength &&
                    hours < 24 && minutes < 60 && seconds < 60;
            };
        }
    };
}

TimeMaskDirective.$inject = ['$timeout'];

module.exports = TimeMaskDirective;