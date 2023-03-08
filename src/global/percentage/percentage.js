'use strict';

var validators = require('validators');

function PercentageMaskDirective($locale, $parse, PreFormatters, NumberMasks, $filter) {
    function preparePercentageToFormatter(value, decimals, modelMultiplier) {
        // return $filter('number')(value * modelMultiplier, decimals)
        return PreFormatters.clearDelimitersAndLeadingZeros((parseFloat(value) * modelMultiplier).toFixed(decimals));
    }

    return {
		restrict: 'A',
		require: 'ngModel',
		link: function(scope, element, attrs, ctrl) {
			var decimalDelimiter = $locale.NUMBER_FORMATS.DECIMAL_SEP;

			var backspacePressed = false;
			element.bind('keydown keypress', function(event) {
				backspacePressed = event.which === 8;
			});

			var thousandsDelimiter = $locale.NUMBER_FORMATS.GROUP_SEP;
			if (angular.isDefined(attrs.fluigHideGroupSep)) {
				thousandsDelimiter = '';
			}

			var percentageSymbol = ' %';
			if (angular.isDefined(attrs.fluigHidePercentageSign)) {
				percentageSymbol = '';
			} else if (angular.isDefined(attrs.fluigHideSpace)) {
				percentageSymbol = '%';
			}

			var decimals = parseInt(attrs.fluigPercentageMask);
			if (isNaN(decimals)) {
				decimals = 2;
			}

			var modelValue = {
				multiplier : 100,
				decimalMask: 2
			};
			if (angular.isDefined(attrs.fluigPercentageValue)) {
				modelValue.multiplier  = 1;
				modelValue.decimalMask = 0;
			}

			var numberDecimals = decimals + modelValue.decimalMask;
			var viewMask = NumberMasks.viewMask(decimals, decimalDelimiter, thousandsDelimiter),
				modelMask = NumberMasks.modelMask(numberDecimals);

			function formatter(value) {
				if (ctrl.$isEmpty(value)) {
					return value;
				}
				var prefix = (angular.isDefined(attrs.fluigNegativeNumber) && value < 0) ? '-' : '';
				var valueToFormat = preparePercentageToFormatter(value, decimals, modelValue.multiplier);
				var formatedValue = prefix + viewMask.apply(valueToFormat) + percentageSymbol;

				return formatedValue;
			}

			function parser(value) {
				if (ctrl.$isEmpty(value)) {
					return null;
				}

				var valueToFormat = PreFormatters.clearDelimitersAndLeadingZeros(value) || '0';
				if (percentageSymbol !== '' && value.length > 1 && value.indexOf('%') === -1) {
					valueToFormat = valueToFormat.slice(0, valueToFormat.length - 1);
				}

				if (backspacePressed && value.length === 1 && value !== '%') {
					valueToFormat = '0';
				}

				var formatedValue = viewMask.apply(valueToFormat) + percentageSymbol;
				var actualNumber = parseFloat(modelMask.apply(valueToFormat));

				if (angular.isDefined(attrs.fluigNegativeNumber)) {
					var isNegative = (value[0] === '-'),
						needsToInvertSign = (value.slice(-1) === '-');

					//only apply the minus sign if it is negative or(exclusive) or the first character
					//needs to be negative and the number is different from zero
					if ((needsToInvertSign ^ isNegative) || value === '-') {
						actualNumber *= -1;
						formatedValue = '-' + ((actualNumber !== 0) ? formatedValue : '');
					}
				}

				if (ctrl.$viewValue !== formatedValue) {
					ctrl.$setViewValue(formatedValue);
					ctrl.$render();
				}

				return actualNumber;
			}

			ctrl.$formatters.push(formatter);
			ctrl.$parsers.push(parser);

			if (attrs.fluigPercentageMask) {
				scope.$watch(attrs.fluigPercentageMask, function(_decimals) {
					decimals = isNaN(_decimals) ? 2 : _decimals;

					numberDecimals = decimals + modelValue.decimalMask;
					viewMask = NumberMasks.viewMask(decimals, decimalDelimiter, thousandsDelimiter);
					modelMask = NumberMasks.modelMask(numberDecimals);

					parser(formatter(ctrl.$modelValue));
				});
			}

			if (attrs.min) {
				var minVal;

				ctrl.$validators.min = function(modelValue) {
					return validators.minNumber(ctrl, modelValue, minVal);
				};

				scope.$watch(attrs.min, function(value) {
					minVal = value;
					ctrl.$validate();
				});
			}

			if (attrs.max) {
				var maxVal;

				ctrl.$validators.max = function(modelValue) {
					return validators.maxNumber(ctrl, modelValue, maxVal);
				};

				scope.$watch(attrs.max, function(value) {
					maxVal = value;
					ctrl.$validate();
				});
			}
		}
	};
}
PercentageMaskDirective.$inject = ['$locale', '$parse', 'PreFormatters', 'NumberMasks', '$filter'];

module.exports = PercentageMaskDirective;