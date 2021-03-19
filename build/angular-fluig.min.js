/**
 * angular-fluig
 * A list of AngularJS services, directives, filters, utilities an resources for Fluig
 * @version v1.0.10
 * @link 
 * @license MIT
 */
require=(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
'use strict';

module.exports = angular.module('angular.fluig', [
    require('./global/global-masks'),
    require('./br/br-masks'),
    require('./fluig/fluig-ui'),
    require('./filters/filter')
]).name;
},{"./br/br-masks":3,"./filters/filter":12,"./fluig/fluig-ui":17,"./global/global-masks":25}],2:[function(require,module,exports){
'use strict';

var StringMask = require('string-mask');
var maskFactory = require('mask-factory');

var boletoBancarioMask = new StringMask('00000.00000 00000.000000 00000.000000 0 00000000000000');

module.exports = {
	directive: maskFactory({
		clearValue: function (rawValue) {
			return rawValue.replace(/[^0-9]/g, '').slice(0, 47);
		},
		format: function (cleanValue) {
			return format(cleanValue);
		},
		validations: {
			boletoBancario: function (value) {
				return value.length === 47;
			}
		}
	}),
	filter: BoletoBancarioFilter
}

function format (value) {
	if (!value || value.length === 0) {
		return value;
	}

	return boletoBancarioMask.apply(value).replace(/[^0-9]$/, '');
}

function BoletoBancarioFilter($filter) {
	return function (input) {
		return format(input);
	};
}
BoletoBancarioFilter.$inject = ['$filter'];
},{"mask-factory":"mask-factory","string-mask":undefined}],3:[function(require,module,exports){
'use strict';

var m = angular.module('fluig.masks.br', [
        require('../helpers'),
    ])
    .directive('fluigBoletoBancarioMask', require('./boleto-bancario/boleto-bancario').directive)
    .filter('boletoBancario', require('./boleto-bancario/boleto-bancario').filter)

    .directive('fluigCepMask', require('./cep/cep').directive)
    .filter('cep', require('./cep/cep').filter)

    .directive('fluigCnpjMask', require('./cnpj/cnpj').directive)
    .filter('cnpj', require('./cnpj/cnpj').filter)

    .directive('fluigCpfMask', require('./cpf/cpf').directive)
    .filter('cpf', require('./cpf/cpf').filter)

    .directive('fluigCpfCnpjMask', require('./cpf-cnpj/cpf-cnpj').directive)
    .filter('cpfCnpj', require('./cpf-cnpj/cpf-cnpj').filter)

    .directive('fluigIeMask', require('./inscricao-estadual/ie'))

    .directive('fluigNfeMask', require('./nfe/nfe').directive)
    .filter('nfe', require('./nfe/nfe').filter)

    .directive('fluigCarPlateMask', require('./car-plate/car-plate').directive)
    .filter('carPlate', require('./car-plate/car-plate').filter)

    .directive('fluigBrPhoneMask', require('./phone/br-phone').directive)
    .filter('brPhone', require('./phone/br-phone').filter)

    
    
    

module.exports = m.name;
},{"../helpers":34,"./boleto-bancario/boleto-bancario":2,"./car-plate/car-plate":4,"./cep/cep":5,"./cnpj/cnpj":6,"./cpf-cnpj/cpf-cnpj":7,"./cpf/cpf":8,"./inscricao-estadual/ie":9,"./nfe/nfe":10,"./phone/br-phone":11}],4:[function(require,module,exports){
'use strict';

var StringMask = require('string-mask');
var maskFactory = require('mask-factory');

var carPlateMask = new StringMask('UUU-0A00');

module.exports = {
	directive: maskFactory({
		clearValue: function (rawValue) {
			return rawValue.replace(/[^a-zA-Z0-9]/g, '').slice(0, 7);
		},
		format: function (cleanValue) {
			return format(cleanValue);
		},
		validations: {
			carPlate: function (value) {
				return value.length === 7;
			}
		}
	}),
	filter: CarPlateFilter
}

function format(value) {
	return (carPlateMask.apply(value) || '').replace(/[^a-zA-Z0-9]$/, '');
}

function CarPlateFilter($filter) {
	return function (input) {
		return format(input);
	};
}

CarPlateFilter.$inject = ['$filter'];
},{"mask-factory":"mask-factory","string-mask":undefined}],5:[function(require,module,exports){
'use strict';

var StringMask = require('string-mask');
var maskFactory = require('mask-factory');

var cepMask = new StringMask('00000-000');

module.exports = {
	directive: maskFactory({
		clearValue: function (rawValue) {
			return rawValue.toString().replace(/[^0-9]/g, '').slice(0, 8);
		},
		format: function (cleanValue) {
			return format(cleanValue);
		},
		validations: {
			cep: function (value) {
				return value.toString().length === 8;
			}
		}
	}),
	filter: CepFilter	
};

function format (value) {
	return (cepMask.apply(value) || '').replace(/[^0-9]$/, '');
}

function CepFilter($filter) {
    return function (input) {
        return format(input);
    };
}
CepFilter.$inject = ['$filter'];
},{"mask-factory":"mask-factory","string-mask":undefined}],6:[function(require,module,exports){
'use strict';

var StringMask = require('string-mask');
var BrV = require('br-validations');
var maskFactory = require('mask-factory');

var cnpjPattern = new StringMask('00.000.000\/0000-00');

module.exports = {
	directive: maskFactory({
		clearValue: function (rawValue) {
			return String(rawValue).replace(/[^\d]/g, '').slice(0, 14);
		},
		format: function (cleanValue) {
			return format(cleanValue);
		},
		validations: {
			cnpj: function (value) {
				return BrV.cnpj.validate(String(value));
			}
		}
	}),
	filter: CnpjFilter
}

function format(value) {
	return (cnpjPattern.apply(value) || '').trim().replace(/[^0-9]$/, '');
}

function CnpjFilter($filter) {
	return function (input) {
		return format(input);
	};
}
CnpjFilter.$inject = ['$filter'];
},{"br-validations":undefined,"mask-factory":"mask-factory","string-mask":undefined}],7:[function(require,module,exports){
'use strict';

var StringMask = require('string-mask');
var BrV = require('br-validations');
var maskFactory = require('mask-factory');

var cnpjPattern = new StringMask('00.000.000\/0000-00');
var cpfPattern = new StringMask('000.000.000-00');

module.exports = {
	directive: maskFactory({
		clearValue: function (rawValue) {
			return String(rawValue).replace(/[^\d]/g, '').slice(0, 14);
		},
		format: function (cleanValue) {
			return format(cleanValue);
		},
		validations: {
			cpf: function (value) {
				
				return String(value).length > 11 || BrV.cpf.validate(String(value));
			},
			cnpj: function (value) {
				
				return  String(value).length <= 11 || BrV.cnpj.validate(String(value));
			}
		}
	}),
	filter: CpfCnpjFilter
}

function format(value) {

	if (!value) return value;
	var formatedValue;

	if (value.length > 11) {
		formatedValue = cnpjPattern.apply(value);
	} else {
		formatedValue = cpfPattern.apply(value) || '';
	}

	return formatedValue.trim().replace(/[^0-9]$/, '');
}

function CpfCnpjFilter($filter) {
	return function (input) {
		return format(input);
	};
}
CpfCnpjFilter.$inject = ['$filter'];
},{"br-validations":undefined,"mask-factory":"mask-factory","string-mask":undefined}],8:[function(require,module,exports){
'use strict';

var StringMask = require('string-mask');
var BrV = require('br-validations');
var maskFactory = require('mask-factory');

var cpfPattern = new StringMask('000.000.000-00');

module.exports = {
	directive: maskFactory({
		clearValue: function (rawValue) {
			return String(rawValue).replace(/[^\d]/g, '').slice(0, 11);
		},
		format: function (cleanValue) {
			return format(String(cleanValue));
		},
		validations: {
			cpf: function (value) {
				return BrV.cpf.validate(String(value));
			}
		}
	}),
	filter: CpfFilter
}

function format(value) {
	return (cpfPattern.apply(String(value)) || '').trim().replace(/[^0-9]$/, '');
}

function CpfFilter($filter) {
	return function (input) {
		return format(input);
	};
}
CpfFilter.$inject = ['$filter'];
},{"br-validations":undefined,"mask-factory":"mask-factory","string-mask":undefined}],9:[function(require,module,exports){
'use strict';

var StringMask = require('string-mask');
var BrV = require('br-validations');

function FluigIeMaskDirective($parse) {
	var ieMasks = {
		'AC': [{mask: new StringMask('00.000.000/000-00')}],
		'AL': [{mask: new StringMask('000000000')}],
		'AM': [{mask: new StringMask('00.000.000-0')}],
		'AP': [{mask: new StringMask('000000000')}],
		'BA': [{chars: 8, mask: new StringMask('000000-00')},
			{mask: new StringMask('0000000-00')}],
		'CE': [{mask: new StringMask('00000000-0')}],
		'DF': [{mask: new StringMask('00000000000-00')}],
		'ES': [{mask: new StringMask('00000000-0')}],
		'GO': [{mask: new StringMask('00.000.000-0')}],
		'MA': [{mask: new StringMask('000000000')}],
		'MG': [{mask: new StringMask('000.000.000/0000')}],
		'MS': [{mask: new StringMask('000000000')}],
		'MT': [{mask: new StringMask('0000000000-0')}],
		'PA': [{mask: new StringMask('00-000000-0')}],
		'PB': [{mask: new StringMask('00000000-0')}],
		'PE': [{chars: 9, mask: new StringMask('0000000-00')},
			{mask: new StringMask('00.0.000.0000000-0')}],
		'PI': [{mask: new StringMask('000000000')}],
		'PR': [{mask: new StringMask('000.00000-00')}],
		'RJ': [{mask: new StringMask('00.000.00-0')}],
		'RN': [{chars: 9, mask: new StringMask('00.000.000-0')},
			{mask: new StringMask('00.0.000.000-0')}],
		'RO': [{mask: new StringMask('0000000000000-0')}],
		'RR': [{mask: new StringMask('00000000-0')}],
		'RS': [{mask: new StringMask('000/0000000')}],
		'SC': [{mask: new StringMask('000.000.000')}],
		'SE': [{mask: new StringMask('00000000-0')}],
		'SP': [{mask: new StringMask('000.000.000.000')},
			{mask: new StringMask('-00000000.0/000')}],
		'TO': [{mask: new StringMask('00000000000')}]
	};

	function clearValue(value) {
		if (!value) {
			return value;
		}

		return value.replace(/[^0-9]/g, '');
	}

	function getMask(uf, value) {
		if (!uf || !ieMasks[uf]) {
			return;
		}

		if (uf === 'SP' && /^P/i.test(value)) {
			return ieMasks.SP[1].mask;
		}

		var masks = ieMasks[uf];
		var i = 0;
		while (masks[i].chars && masks[i].chars < clearValue(value).length && i < masks.length - 1) {
			i++;
		}

		return masks[i].mask;
	}

	function applyIEMask(value, uf) {
		var mask = getMask(uf, value);

		if (!mask) {
			return value;
		}

		var processed = mask.process(clearValue(value));
		var formatedValue = processed.result || '';
		formatedValue = formatedValue.trim().replace(/[^0-9]$/, '');

		if (uf === 'SP' && /^p/i.test(value)) {
			return 'P' + formatedValue;
		}

		return formatedValue;
	}

	return {
		restrict: 'A',
		require: 'ngModel',
		link: function(scope, element, attrs, ctrl) {
			var state = ($parse(attrs.fluigIeMask)(scope) || '').toUpperCase();

			function formatter(value) {
				if (ctrl.$isEmpty(value)) {
					return value;
				}

				return applyIEMask(value, state);
			}

			function parser(value) {
				if (ctrl.$isEmpty(value)) {
					return value;
				}

				var formatedValue = applyIEMask(value, state);
				var actualValue = clearValue(formatedValue);

				if (ctrl.$viewValue !== formatedValue) {
					ctrl.$setViewValue(formatedValue);
					ctrl.$render();
				}

				if (state && state.toUpperCase() === 'SP' && /^p/i.test(value)) {
					return 'P' + actualValue;
				}

				return actualValue;
			}

			ctrl.$formatters.push(formatter);
			ctrl.$parsers.push(parser);

			ctrl.$validators.ie = function validator(modelValue) {
				return ctrl.$isEmpty(modelValue) || BrV.ie(state).validate(modelValue);
			};

			scope.$watch(attrs.fluigIeMask, function(newState) {
				state = (newState || '').toUpperCase();

				parser(ctrl.$viewValue);
				ctrl.$validate();
			});
		}
	};
}
FluigIeMaskDirective.$inject = ['$parse'];

module.exports = FluigIeMaskDirective;

},{"br-validations":undefined,"string-mask":undefined}],10:[function(require,module,exports){
'use strict';

var StringMask = require('string-mask');
var maskFactory = require('mask-factory');

var nfeAccessKeyMask = new StringMask('0000 0000 0000 0000 0000' +
	' 0000 0000 0000 0000 0000 0000');

module.exports = {
	directive: maskFactory({
		clearValue: function (rawValue) {
			return rawValue.replace(/[^0-9]/g, '').slice(0, 44);
		},
		format: function (cleanValue) {
			return format(cleanValue);
		},
		validations: {
			nfeAccessKey: function (value) {
				return value.length === 44;
			}
		}
	}),
	filter: NfeFilter
}

function format(value) {
	return (nfeAccessKeyMask.apply(value) || '').replace(/[^0-9]$/, '');
}

function NfeFilter($filter) {
	return function (input) {
		return format(input);
	};
}
NfeFilter.$inject = ['$filter'];
},{"mask-factory":"mask-factory","string-mask":undefined}],11:[function(require,module,exports){
'use strict';

var StringMask = require('string-mask');
var maskFactory = require('mask-factory');

/**
 * FIXME: all numbers will have 9 digits after 2016.
 * see http://portal.embratel.com.br/embratel/9-digito/
 */
var phoneMask8D = new StringMask('(00) 0000-0000'),
	phoneMask9D = new StringMask('(00) 00000-0000'),
	phoneMask8DSemDDD = new StringMask('0000-0000'),
	phoneMask9DSemDDD = new StringMask('00000-0000'),
	phoneMask0800 = new StringMask('0000-000-0000');

module.exports = {
	directive: maskFactory({
		clearValue: function (rawValue) {
			return rawValue.toString().replace(/[^0-9]/g, '').slice(0, 11);
		},
		format: function (cleanValue) {
			return format(cleanValue)
		},
		getModelValue: function (formattedValue, originalModelType) {
			var cleanValue = this.clearValue(formattedValue);

			return originalModelType === 'number' ? parseInt(cleanValue) : cleanValue;
		},
		validations: {
			phoneNumber: function (value) {
				var valueLength = value && value.toString().length;
				return valueLength === 8 || valueLength === 9 || valueLength === 10 || valueLength === 11;
			}
		}
	}),
	filter: BrPhoneFilter
}

function format(value) {

	if (!value) return "";

	var formatedValue;
	if (value.indexOf('0800') === 0) {
		formatedValue = phoneMask0800.apply(value);
	} else if (value.length < 9) {
		formatedValue = phoneMask8DSemDDD.apply(value) || '';
	} else if (value.length < 10) {
		formatedValue = phoneMask9DSemDDD.apply(value) || '';
	} else if (value.length < 11) {
		formatedValue = phoneMask8D.apply(value) || '';
	} else {
		formatedValue = phoneMask9D.apply(value);
	}

	return formatedValue.trim().replace(/[^0-9]$/, '');
}

function BrPhoneFilter($filter) {
	return function (input) {
		return format(input);
	};
}
BrPhoneFilter.$inject = ['$filter'];
},{"mask-factory":"mask-factory","string-mask":undefined}],12:[function(require,module,exports){
'use strict';

var m = angular.module('angular.filters', [
        require('../helpers'),
    ])
    .filter('pagination', require('./pagination/pagination'))

module.exports = m.name;
},{"../helpers":34,"./pagination/pagination":13}],13:[function(require,module,exports){
'use strict';

function PaginationFilter() {
    return function(input, start) {
        start = +start;

        if (!input) return 0;
        return input.slice(start);
    };
};


module.exports = PaginationFilter;
},{}],14:[function(require,module,exports){
'use strict';

function AutocompleteDirective($locale, $window, $timeout, $compile) {

    return {
        restrict: 'A',
        require: '?ngModel',
        scope: {
            dataset: "@",
            fluigAutocompleteLimit: "@",
            fluigAutocompleteType: "@",
            minLength: "@",
            filterFields: "=",
            resultFields: "=",
            displayKey: "@",
            searchTimeout: "@",
            values: "=",
            acSelected: "&"
        },
        link: function (scope, element, attrs, ctrl) {

            var fluigAutocomplete = attrs.fluigAutocomplete;

            if (fluigAutocomplete == 'false') return;

            if (!ctrl) {
                console.error('ngModel não informado para o elemento:', element[0]);
                return;
            }

            scope.displayKey = scope.displayKey || 'name';
            scope.fluigAutocompleteLimit = scope.fluigAutocompleteLimit || 100;
            scope.fluigAutocompleteType = scope.fluigAutocompleteType || 'autocomplete';
            scope.minLength = Number(attrs.minLength) || 0;
            scope.searchTimeout = attrs.searchTimeout || 500;

            element.on('focus', function () {

                if (!$window.getSelection().toString()) {
                    this.setSelectionRange(0, this.value.length)
                }
            });

            scope.$watch('filterFields', function (val, oldval) {

                if ((oldval || val) && val != oldval) {

                    //createAutocomplete();
                }
            });

            scope.$watch('resultFields', function (val, oldval) {

                if ((oldval || val) && val != oldval) {
                    //createAutocomplete();
                }

            });

            scope.$watch('values', function (val, oldval) {

                if ((oldval || val) && val != oldval) {
                    createAutocomplete();
                }

            })

            scope.$watch('dataset', function (val, oldval) {

                if ((oldval || val) && val != oldval) {
                    createAutocomplete();
                }

            })

            createAutocomplete()


            function loadData(arr) {

                return function (txt, fnc) {
                    var result, f, filter;
                    result = [],
                        filter = new RegExp((txt.normalize ? txt.normalize("NFD") : txt).replace(/[\u0300-\u036f]/g, ""), "i"),
                        $.each(arr,
                            function (arr, obj) {
                                var obj2;

                                if (scope.resultFields) {
                                    obj2 = {};
                                    scope.resultFields.forEach(function (f) {
                                        obj2[f] = obj[f];
                                    })
                                } else {
                                    obj2 = obj;
                                }

                                ((scope.displayKey && filter.test((String(obj2[scope.displayKey]).normalize ? String(obj2[scope.displayKey]).normalize("NFD") : String(obj2[scope.displayKey])).replace(/[\u0300-\u036f]/g, ""))) ||
                                    (!scope.displayKey && filter.test(JSON.stringify(obj2)))
                                ) && result.length < scope.fluigAutocompleteLimit && result.push(obj2)
                            }), fnc(result);
                }
            }

            function createAutocomplete() {

                if (!scope.dataset && !scope.values) return;

                if (scope.autocomplete) {
                    scope.autocomplete.destroy();
                    scope.autocomplete = null;
                }

                var filterFields = '';
                if (scope.filterFields) {
                    filterFields = scope.filterFields.join();
                }

                var resultFields = '';
                if (scope.resultFields) {
                    resultFields = scope.resultFields.join();
                }

                if (scope.dataset) {
                    var restUrl = "/api/public/ecm/dataset/search?datasetId=" + scope.dataset + "&searchField=" + scope.displayKey + "&filterFields=" + filterFields + "&resultFields=" + resultFields + "&limit=" + scope.fluigAutocompleteLimit + "&";

                    var source = {
                        url: restUrl,
                        patternKey: "searchValue",
                        root: "content"
                    };
                } else {
                    var source = loadData(scope.values);
                }

                if (!scope.autocomplete) {

                    scope.autocomplete = FLUIGC.autocomplete(element, {
                        source: source,
                        highlight: true,
                        displayKey: scope.displayKey,
                        type: scope.fluigAutocompleteType,
                        minLength: Number(scope.minLength),
                        limit: scope.fluigAutocompleteLimit,
                        searchTimeout: scope.searchTimeout
                    });

                    scope.autocomplete
                        .on('fluig.autocomplete.opened', function () {
                            //element.parent().addClass("active");
                        })
                        .on('fluig.autocomplete.closed', function () {
                            //element.parent().removeClass("active");
                        })
                        .on('fluig.autocomplete.selected', function (result) {

                            element.blur();

                            $timeout(function () {
                                if (scope.fluigAutocompleteType == 'autocomplete') {
                                    ctrl.$setViewValue(result.item);
                                } else {
                                    ctrl.$setViewValue(scope.autocomplete.items());
                                }
                                if (attrs.fluigOnSelect) {
                                    scope.$apply(function () {
                                        scope.$eval(attrs.fluigOnSelect);
                                    });
                                }

                                scope.acSelected();
                            });

                        })
                        .on('fluig.autocomplete.itemRemoved', function (result) {
                            
                            if (scope.fluigAutocompleteType == 'autocomplete') {
                                ctrl.$setViewValue();
                            } else {
                                ctrl.$setViewValue(scope.autocomplete.items());
                            }
                        })
                }
            }

            function formatter(value) {

                var ac = [];

                if (scope.fluigAutocompleteType == 'autocomplete') {
                    if (ctrl.$isEmpty(value)) {
                        return value;
                    }
                    if (scope.autocomplete) scope.autocomplete.val(value[scope.displayKey]);
                    ac.push(value[scope.displayKey]);

                } else {
                    if (scope.autocomplete) scope.autocomplete.removeAll();
                    angular.forEach(value, function (item) {
                        if (scope.autocomplete) scope.autocomplete.add(item);
                        ac.push(item[scope.displayKey]);
                    })
                    ctrl.$setViewValue(value);
                }

                return ac.join();

            }

            ctrl.$formatters.push(formatter);
            element.attr('placeholder', 'Digite para buscar...')

            // var template = $compile('<div class="input-group"><span class="input-group-addon"><i class="fluigicon fluigicon-search"></i></span></div>')(scope);

            // element.after(template);
            // template.append(element);

        }
    };
}

AutocompleteDirective.$inject = ['$locale', '$window', '$timeout', '$compile'];

module.exports = AutocompleteDirective;
},{}],15:[function(require,module,exports){
'use strict';

function ChartDirective($locale, $window) {

    return {
        restrict: 'A',
        scope: {
            chartType: "@",
            chartLabels: "=",
            chartDatasets: "="
        },
        link: function (scope, element, attrs) {

            var fluigChart = attrs.fluigChart;
            var defaultFillColor = [
                "rgba(26, 188, 156,0.2)",
                "rgba(52, 152, 219,0.2)",
                "rgba(155, 89, 182,0.2)",
                "rgba(52, 73, 94,0.2)",
                "rgba(230, 126, 34,0.2)",
                "rgba(231, 76, 60,0.2)",
                "rgba(149, 165, 166,0.2)",
                "rgba(241, 196, 15,0.2)",
                "rgba(236, 240, 241,0.2)"
            ]
            var defaultStrokeColor = [
                "rgba(26, 188, 156,1.0)",
                "rgba(52, 152, 219,1.0)",
                "rgba(155, 89, 182,1.0)",
                "rgba(52, 73, 94,1.0)",
                "rgba(230, 126, 34,1.0)",
                "rgba(231, 76, 60,1.0)",
                "rgba(149, 165, 166,1.0)",
                "rgba(241, 196, 15,1.0)",
                "rgba(236, 240, 241,1.0)"
            ]

            var defaultPointColor = defaultStrokeColor;

            var defaultPointStrokeColor = [
                "#fff", "#fff", "#fff", "#fff", "#fff", "#fff", "#fff", "#fff", "#fff"
            ]

            var defaultPointHighlightFill = defaultPointStrokeColor;
            var defaultPointHighlightStroke = defaultStrokeColor;
            
            if (fluigChart == 'false') return;

            var chart;

            scope.$watch('chartType', function (val, oldval) {
                createChart();
            })

            scope.$watch('chartLabels', function (val, oldval) {
                createChart();
            })

            scope.$watch('chartData', function (val, oldval) {
                createChart();
            })

            createChart()

            function createChart() {

                if (!scope.chartLabels || !scope.chartDatasets || !scope.chartType) return;

                if (chart) {

                    chart.destroy();
                    chart = null;
                }

                if (!chart) {

                    chart = FLUIGC.chart(element);

                    scope.chartDatasets.forEach(function (dataset, index) {
                        dataset.fillColor = dataset.fillColor || defaultFillColor[index];
                        dataset.strokeColor = dataset.strokeColor || defaultStrokeColor[index];
                        dataset.pointColor = dataset.pointColor || defaultPointColor[index];
                        dataset.pointStrokeColor = dataset.pointStrokeColor || defaultPointStrokeColor[index];
                        dataset.pointHighlightFill = dataset.pointHighlightFill || defaultPointHighlightFill[index];
                        dataset.pointHighlightStroke = dataset.pointHighlightStroke || defaultPointHighlightStroke[index];
                    })

                    var data = {
                        labels: scope.chartLabels,
                        datasets: scope.chartDatasets
                    }

                    switch (scope.chartType) {
                        case "line":
                            chart.line(data);
                            break;

                    }
                };
            }
        }
    };
}

ChartDirective.$inject = ['$locale', '$window'];

module.exports = ChartDirective;
},{}],16:[function(require,module,exports){
'use strict';

function DateMaskDirective($locale, $compile, $timeout, $parse) {
    return {
        restrict: 'A',
        require: '?ngModel',
        scope: {
            showDisabled: "@",
            defaultDate: "=",
            minDate: "=",
            maxDate: "=",
            useCurrent: '@',
            showOnStart: '@',
            disabledDates: '=',
            sideBySide: '@',
            datePattern: "@",
            dateLocale: "@"

        },
        link: function (scope, element, attrs, ctrl) {

            if (attrs.fluigDateMask === "false") return;

            var dt = FLUIGC.calendar(element, {
                pickDate: attrs.pickDate,
                pickTime: attrs.pickTime,
                disabledDates: scope.disabledDates,
                minDate: scope.minDate,
                maxDate: scope.maxDate,
                defaultDate: scope.defaultDate,
                minuteStepping: attrs.minuteStepping,
                sideBySide: scope.sideBySide,
                useCurrent: scope.useCurrent == 'false' ? false : true
            });

            if (scope.showOnStart == 'true') {
                dt.show();
            }

            if (scope.showDisabled) {

                element.prop('readonly', true);
                element.on('click', function () {
                    dt.show();
                })
            }

            element.on('change', function () {
                change()
            });

            function change() {

                if (dt.getDate()) {
                    var date = new Date(dt.getDate());
                    if (!attrs.pickTime) {
                        date.setHours(12, 0, 0);
                    }

                    ctrl.$setViewValue(date.getTime());
                    element.val(FLUIGC.calendar.formatDate(date, scope.datePattern, scope.dateLocale));
                }
            }
            function formatter(value) {

                if (ctrl.$isEmpty(value)) {
                    return value;
                }

                dt.setDate(new Date(Number(value)));

                return FLUIGC.calendar.formatDate(new Date(Number(value)), scope.datePattern, scope.dateLocale);
                // return element.val();
            }

            ctrl.$formatters.push(formatter);

            var template = $compile('<div class="input-group" ><span class="input-group-addon"><i class="fluigicon fluigicon-calendar"></i></span></div>')(scope);

            element.after(template);
            template.append(element);
        }
    }
};

DateMaskDirective.$inject = ['$locale', '$compile', '$timeout', '$parse'];

module.exports = DateMaskDirective;
},{}],17:[function(require,module,exports){
'use strict';

var m = angular.module('angular.fluig.utils', [
        require('../helpers'),
    ])

    .directive('fluigAutocomplete', require('./autocomplete/autocomplete'))
    .directive('fluigChart', require('./chart/chart'))
    .directive('fluigDateMask', require('./date/date'))
    .directive('fluigHeader', require('./header/header'))
    .directive('fluigRequired', require('./required/required'))
    
    .directive('fluigSwitch', require('./switch/switch'))
    .directive('fluigPopover', require('./popover/popover'))

module.exports = m.name;
},{"../helpers":34,"./autocomplete/autocomplete":14,"./chart/chart":15,"./date/date":16,"./header/header":18,"./popover/popover":19,"./required/required":20,"./switch/switch":21}],18:[function(require,module,exports){
'use strict';

function HeaderDirective($locale) {

    return {
        restrict: 'A',
        require: '?ngModel',
        link: function (scope, element, attrs, ctrl) {

            var title = attrs.fluigHeader || $(document).find("title").text();
            var logo = attrs.logo || '/portal/resources/images/logo.png';
            var height = attrs.height || '80';

            var html = '<div class="row">';
            var h = "h1";

            if (title.length > 54) {
                h = "h4";
            } else if (title.length > 43) {
                h = "h3";
            } else if (title.length > 34) {
                h = "h2";
            }

            html += '<div class="col-xs-6">';
            html += "<img src='" + logo + "' id='logo' class='logo' height='" + height + "' alt='Logo' title='Logo' border='0' />";
            html += '</div>';
            html += '<div class="col-xs-6">';
            html += '<' + h + ' class="text-right">' + title + '</' + h + '>';
            html += '</div>';
            html += '</div>';

            element.prepend(html);

        }
    };
}

HeaderDirective.$inject = ['$locale'];

module.exports = HeaderDirective;
},{}],19:[function(require,module,exports){
'use strict';

function PopoverDirective($compile) {

    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            
            var trigger = attrs.trigger || 'hover';
            var placement = attrs.placement || 'auto';
            var content = attrs.fluigContent || attrs.dataContent || '';

            FLUIGC.popover(element, { trigger: trigger, placement: placement, content: content });

        }
    }
}

PopoverDirective.$inject = ['$compile'];

module.exports = PopoverDirective;
},{}],20:[function(require,module,exports){
'use strict';

function RequiredDirective($compile) {

    return {
        restrict: 'A',
        require: '?ngModel',
        link: function(scope, element, attrs, ctrl) {
            if (!ctrl) {
                console.error('ngModel não informado para o elemento:', element[0]);
                return;
            }

            if (!ctrl || !attrs.fluigRequired) return;
            attrs.required = true; // force truthy in case we are on non input element

            var validator = function(value) {
                if (attrs.required && (value == '' || value === false)) {
                    ctrl.$setValidity('required', false);
                    return;
                } else {
                    ctrl.$setValidity('required', true);
                    return value;
                }
            };

            ctrl.$formatters.push(validator);
            ctrl.$parsers.unshift(validator);

            attrs.$observe('fluigRequired', function(value) {
                var label = $("label[for='" + element.attr('name') + "']");

                if (value === "true") {
                    label.addClass("required");
                } else {
                    label.removeClass("required");
                }
                validator(ctrl.$viewValue);
            });
        }
    }
}

RequiredDirective.$inject = ['$compile'];

module.exports = RequiredDirective;
},{}],21:[function(require,module,exports){
'use strict';

function SwitchDirective($compile, $timeout) {

    return {
        restrict: 'A',
        require: '?ngModel',
        scope: {
            ngReadonly: "=",
            ngDisabled: "="
        },
        link: function (scope, element, attrs, ctrl) {

            if (!ctrl) {
                console.error('ngModel não informado para o elemento:', element[0]);
                return;
            }

            var template = $compile('<div style="width: 110px"></div>')(scope);

            element.after(template);
            template.append(element);

            template.hide();

            scope.$watch('ngReadonly', function (val, oldval) {
                FLUIGC.switcher.isReadOnly(element, val);
            })
            scope.$watch('ngDisabled', function (val, oldval) {
                if (val) {
                    FLUIGC.switcher.disable(element);
                }
            })

            $timeout(function () {

                FLUIGC.switcher.init(element, {
                    "state": ctrl.$modelValue
                });

                if (ctrl.$modelValue == true || ctrl.$modelValue == 'true') {
                    $timeout(function () {
                        FLUIGC.switcher.setTrue(element);
                    })
                }

                FLUIGC.switcher.onChange(element, function (event, state) {
                    ctrl.$setViewValue(state);
                    ctrl.$render();

                });
                $timeout(function () {
                    template.fadeIn();
                }, 10);
            }, 10);
        }
    }
}

SwitchDirective.$inject = ['$compile', '$timeout'];

module.exports = SwitchDirective;
},{}],22:[function(require,module,exports){
'use strict';

var StringMask = require('string-mask');
var maskFactory = require('mask-factory');

var ccSize = 16;

var ccMask = new StringMask('0000 0000 0000 0000');

module.exports = maskFactory({
	clearValue: function(rawValue) {
		return rawValue.toString().replace(/[^0-9]/g, '').slice(0, ccSize);
	},
	format: function(cleanValue) {
		var formatedValue;

		formatedValue = ccMask.apply(cleanValue) || '';

		return formatedValue.trim().replace(/[^0-9]$/, '');
	},
	validations: {
		creditCard: function(value) {
			var valueLength = value && value.toString().length;
			return valueLength === ccSize;
		}
	}
});

},{"mask-factory":"mask-factory","string-mask":undefined}],23:[function(require,module,exports){
'use strict';

var messages = require('./messages');

function ErrorDirective($compile, $timeout) {

    return {
        restrict: 'A',
        require: '?ngModel',
        link: function (scope, element, attrs, ctrl) {
            if (!ctrl) {
                console.error('ngModel não informado para o elemento:', element[0]);
                return;
            }

            var watchAttr = attrs.fluigError;

            scope.$watchCollection(watchAttr, function (values) {

                var error = "";

                angular.forEach(values, function (value, key) {

                    if (value) {
                        if (messages[key]) error += messages[key] + "<br>";
                    }
                });

                element.popover('destroy');

                var label = $("label[for='" + element.attr('name') + "']");

                if (error != '') {

                    label.parent()
                        .addClass("has-error");

                    FLUIGC.popover(element, {
                        html: 'true',
                        trigger: 'focus',
                        placement: 'top',
                        content: error
                    });
                    //element.popover('show');
                } else {
                    label.parent()
                        .removeClass("has-error");
                }

            });
        }
    }
}

ErrorDirective.$inject = ['$compile', '$timeout'];

module.exports = ErrorDirective;
},{"./messages":24}],24:[function(require,module,exports){
var messages = {
    "required": "O campo é obrigatório",
    "minlength": "O tamanho do campo é inferior ao mínimo permitido",
    "maxlength": "O tamanho do campo é superior ao máximo permitido",
    "min": "O valor informado é inferior ao mínimo",
    "max": "O valor informado é superior ao máximo",
    "cpf": "O CPF informado é inválido",
    "time": "O horário informado é inválido",
    "cnpj": "O CNPJ informado é inválido",
    "phoneNumber": "O telefone informado é inválido",
    "cep": "O CEP informado é inválido",
    "ie": "Inscrição estadual inválida",
    "carPlate": "A placa informada é inválida",
    "creditCard": "O número de cartão de crédito informado é inválido",
    "boletoBancario": "O número do boleto bancário informado é inválido",
    "nfeAccessKey": "Chave de acesso inválida"

}

module.exports = messages;
},{}],25:[function(require,module,exports){
'use strict';

var m = angular.module('fluig.global.masks', [
        require('../helpers'),
    ])
    .directive('fluigMoneyMask', require('./money/money'))
    .directive('fluigNumberMask', require('./number/number'))
    .directive('fluigPercentageMask', require('./percentage/percentage'))
    .directive('fluigScientificNotationMask', require('./scientific-notation/scientific-notation'))
    .directive('fluigTimeMask', require('./time/time'))
    .directive('fluigCreditCard', require('./credit-card/credit-card'))
    .directive('fluigError', require('./error/error'))
    .directive('ngName', require('./name/name'))

    .filter('percentage', require('./percentage/percentage-filter'))
    .filter('time', require('./time/time-filter'))


module.exports = m.name;
},{"../helpers":34,"./credit-card/credit-card":22,"./error/error":23,"./money/money":26,"./name/name":27,"./number/number":28,"./percentage/percentage":30,"./percentage/percentage-filter":29,"./scientific-notation/scientific-notation":31,"./time/time":33,"./time/time-filter":32}],26:[function(require,module,exports){
'use strict';

var StringMask = require('string-mask');
var validators = require('validators');

function MoneyMaskDirective($locale, $parse, $compile, PreFormatters) {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, element, attrs, ctrl) {

            if (attrs.fluigMoneyMask === "false") return;

            var decimalDelimiter = $locale.NUMBER_FORMATS.DECIMAL_SEP,
                thousandsDelimiter = $locale.NUMBER_FORMATS.GROUP_SEP,
                currencySym = $locale.NUMBER_FORMATS.CURRENCY_SYM,
                symbolSeparation = ' ',
                decimals = $parse(attrs.fluigMoneyMask)(scope);


            function maskFactory(decimals) {
                var decimalsPattern = decimals > 0 ? decimalDelimiter + new Array(decimals + 1).join('0') : '';
                var maskPattern = symbolSeparation + '#' + thousandsDelimiter + '##0' + decimalsPattern;
                return new StringMask(maskPattern, { reverse: true });
            }

            if (angular.isDefined(attrs.fluigHideSpace) && attrs.fluigHideSpace != 'false') {
                symbolSeparation = '';
            }

            if (angular.isDefined(attrs.currencySymbol)) {
                currencySym = attrs.currencySymbol;
                if (attrs.currencySymbol.length === 0) {
                    symbolSeparation = '';
                }
            }

            if (isNaN(decimals)) {
                decimals = 2;
            }
            decimals = parseInt(decimals);
            var moneyMask = maskFactory(decimals);

            function formatter(value) {
                if (ctrl.$isEmpty(value)) {
                    return value;
                }
                var prefix = (angular.isDefined(attrs.fluigNegativeNumber) && value < 0) ? '-' : '';
                var valueToFormat = PreFormatters.prepareNumberToFormatter(value, decimals);
                return prefix + moneyMask.apply(valueToFormat);
            }

            function parser(value) {
                
                if (ctrl.$isEmpty(value)) {
                    return value;
                }

                var actualNumber = value.replace(/[^\d]+/g, '');
                actualNumber = actualNumber.replace(/^[0]+([1-9])/, '$1');
                actualNumber = actualNumber || '0';
                var formatedValue = moneyMask.apply(actualNumber);

                if (angular.isDefined(attrs.fluigNegativeNumber)) {
                    var isNegative = (value[0] === '-'),
                        needsToInvertSign = (value.slice(-1) === '-');

                    //only apply the minus sign if it is negative or(exclusive)
                    //needs to be negative and the number is different from zero
                    if (needsToInvertSign ^ isNegative && !!actualNumber) {
                        actualNumber *= -1;
                        formatedValue = '-' + formatedValue;
                    }
                }

                if (value !== formatedValue) {
                    ctrl.$setViewValue(formatedValue);
                    ctrl.$render();
                }

                return formatedValue ? parseInt(formatedValue.replace(/[^\d\-]+/g, '')) / Math.pow(10, decimals) : null;
            }

            ctrl.$formatters.push(formatter);
            ctrl.$parsers.push(parser);

            if (attrs.fluigMoneyMask) {
                scope.$watch(attrs.fluigMoneyMask, function(_decimals) {
                    decimals = isNaN(_decimals) ? 2 : _decimals;
                    decimals = parseInt(decimals);
                    moneyMask = maskFactory(decimals);

                    parser(ctrl.$viewValue);
                });
            }



            if (attrs.fluigHideGroupSep) {
                scope.$watch(attrs.fluigHideGroupSep, function(_hideGroupSep) {
                    
                    if (_hideGroupSep == true) {
                        thousandsDelimiter = '';
                    } else {
                        thousandsDelimiter = $locale.NUMBER_FORMATS.GROUP_SEP;
                    }
                    moneyMask = maskFactory(decimals);
                    parser(ctrl.$viewValue);

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

            var template = $compile('<div class="input-group" ><span class="input-group-addon"><b>' + currencySym + '</b></span></div>')(scope);

            element.after(template);
            template.append(element);
        }
    };
}
MoneyMaskDirective.$inject = ['$locale', '$parse', '$compile', 'PreFormatters'];

module.exports = MoneyMaskDirective;
},{"string-mask":undefined,"validators":"validators"}],27:[function(require,module,exports){
'use strict';

function NgNameDirective($compile) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs, ctrl) {
            // element.attr('name', attrs.ngName);
            attrs.$set("name", attrs.ngName);
        }
    };
}

NgNameDirective.$inject = ['$compile'];

module.exports = NgNameDirective;
},{}],28:[function(require,module,exports){
'use strict';

var validators = require('validators');

function NumberMaskDirective($locale, $parse, PreFormatters, NumberMasks) {
	return {
		restrict: 'A',
		require: 'ngModel',
		link: function (scope, element, attrs, ctrl) {
			var decimalDelimiter = $locale.NUMBER_FORMATS.DECIMAL_SEP,
				thousandsDelimiter = $locale.NUMBER_FORMATS.GROUP_SEP,
				decimals = $parse(attrs.fluigNumberMask)(scope);

			if (angular.isDefined(attrs.fluigHideGroupSep)) {
				thousandsDelimiter = '';
			}

			if (isNaN(decimals)) {
				decimals = 2;
			}

			var viewMask = NumberMasks.viewMask(decimals, decimalDelimiter, thousandsDelimiter),
				modelMask = NumberMasks.modelMask(decimals);

			function parser(value) {
				if (ctrl.$isEmpty(value)) {
					return null;
				}

				var valueToFormat = PreFormatters.clearDelimitersAndLeadingZeros(value) || '0';
				var formatedValue = viewMask.apply(valueToFormat);
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

			function formatter(value) {
				if (ctrl.$isEmpty(value)) {
					return value;
				}

				var prefix = (angular.isDefined(attrs.fluigNegativeNumber) && value < 0) ? '-' : '';
				var valueToFormat = PreFormatters.prepareNumberToFormatter(value, decimals);
				return prefix + viewMask.apply(valueToFormat);
			}

			function clearViewValueIfMinusSign() {
				if (ctrl.$viewValue === '-') {
					ctrl.$setViewValue('');
					ctrl.$render();
				}
			}

			element.on('blur', clearViewValueIfMinusSign);

			ctrl.$formatters.push(formatter);
			ctrl.$parsers.push(parser);

			if (attrs.fluigNumberMask) {
				scope.$watch(attrs.fluigNumberMask, function (_decimals) {
					decimals = isNaN(_decimals) ? 2 : _decimals;
					viewMask = NumberMasks.viewMask(decimals, decimalDelimiter, thousandsDelimiter);
					modelMask = NumberMasks.modelMask(decimals);

					parser(ctrl.$viewValue);
				});
			}

			if (attrs.min) {
				var minVal;

				ctrl.$validators.min = function (modelValue) {
					return validators.minNumber(ctrl, modelValue, minVal);
				};

				scope.$watch(attrs.min, function (value) {
					minVal = value;
					ctrl.$validate();
				});
			}

			if (attrs.max) {
				var maxVal;

				ctrl.$validators.max = function (modelValue) {
					return validators.maxNumber(ctrl, modelValue, maxVal);
				};

				scope.$watch(attrs.max, function (value) {
					maxVal = value;
					ctrl.$validate();
				});
			}
		}
	};
}
NumberMaskDirective.$inject = ['$locale', '$parse', 'PreFormatters', 'NumberMasks'];

module.exports = NumberMaskDirective;
},{"validators":"validators"}],29:[function(require,module,exports){
'use strict';


function PercentageFilter($filter) {
    return function (input, decimals) {
        return $filter('number')(input * 100, decimals) + '%';
    };
}
PercentageFilter.$inject = ['$filter'];

module.exports = PercentageFilter;
},{}],30:[function(require,module,exports){
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
},{"validators":"validators"}],31:[function(require,module,exports){
'use strict';

var StringMask = require('string-mask');

function ScientificNotationMaskDirective($locale, $parse) {
	var decimalDelimiter = $locale.NUMBER_FORMATS.DECIMAL_SEP,
		defaultPrecision = 2;

	function significandMaskBuilder(decimals) {
		var mask = '0';

		if (decimals > 0) {
			mask += decimalDelimiter;
			for (var i = 0; i < decimals; i++) {
				mask += '0';
			}
		}

		return new StringMask(mask, {
			reverse: true
		});
	}

	return {
		restrict: 'A',
		require: 'ngModel',
		link: function(scope, element, attrs, ctrl) {
			var decimals = $parse(attrs.fluigScientificNotationMask)(scope);

			if (isNaN(decimals)) {
				decimals = defaultPrecision;
			}

			var significandMask = significandMaskBuilder(decimals);

			function splitNumber(value) {
				var stringValue = value.toString(),
					splittedNumber = stringValue.match(/(-?[0-9]*)[\.]?([0-9]*)?[Ee]?([\+-]?[0-9]*)?/);

				return {
					integerPartOfSignificand: splittedNumber[1],
					decimalPartOfSignificand: splittedNumber[2],
					exponent: splittedNumber[3] | 0
				};
			}

			function formatter(value) {
				if (ctrl.$isEmpty(value)) {
					return value;
				}

				if (typeof value === 'string') {
					value = value.replace(decimalDelimiter, '.');
				} else if (typeof value === 'number') {
					value = value.toExponential(decimals);
				}

				var formattedValue, exponent;
				var splittedNumber = splitNumber(value);

				var integerPartOfSignificand = splittedNumber.integerPartOfSignificand || 0;
				var numberToFormat = integerPartOfSignificand.toString();
				if (angular.isDefined(splittedNumber.decimalPartOfSignificand)) {
					numberToFormat += splittedNumber.decimalPartOfSignificand;
				}

				var needsNormalization =
					(integerPartOfSignificand >= 1 || integerPartOfSignificand <= -1) &&
					(
						(angular.isDefined(splittedNumber.decimalPartOfSignificand) &&
						splittedNumber.decimalPartOfSignificand.length > decimals) ||
						(decimals === 0 && numberToFormat.length >= 2)
					);

				if (needsNormalization) {
					exponent = numberToFormat.slice(decimals + 1, numberToFormat.length);
					numberToFormat = numberToFormat.slice(0, decimals + 1);
				}

				formattedValue = significandMask.apply(numberToFormat);

				if (splittedNumber.exponent !== 0) {
					exponent = splittedNumber.exponent;
				}

				if (angular.isDefined(exponent)) {
					formattedValue += 'e' + exponent;
				}

				return formattedValue;
			}

			function parser(value) {
				if (ctrl.$isEmpty(value)) {
					return value;
				}

				var viewValue = formatter(value),
					modelValue = parseFloat(viewValue.replace(decimalDelimiter, '.'));

				if (ctrl.$viewValue !== viewValue) {
					ctrl.$setViewValue(viewValue);
					ctrl.$render();
				}

				return modelValue;
			}

			ctrl.$formatters.push(formatter);
			ctrl.$parsers.push(parser);

			ctrl.$validators.max = function validator(value) {
				return ctrl.$isEmpty(value) || value < Number.MAX_VALUE;
			};
		}
	};
}
ScientificNotationMaskDirective.$inject = ['$locale', '$parse'];

module.exports = ScientificNotationMaskDirective;

},{"string-mask":undefined}],32:[function(require,module,exports){
'use strict';

var StringMask = require('string-mask');
var timeFormat = '00:00';

var formattedValueLength = timeFormat.length;
var unformattedValueLength = timeFormat.replace(':', '').length;
var timeMask = new StringMask(timeFormat);

function TimeFilter($filter) {
    return function (input, decimals) {

        return (timeMask.apply(input) || '').replace(/[^0-9]$/, '');
    };
}
TimeFilter.$inject = ['$filter'];

module.exports = TimeFilter;
},{"string-mask":undefined}],33:[function(require,module,exports){
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
},{"string-mask":undefined}],34:[function(require,module,exports){
'use strict';

var StringMask = require('string-mask');

var m = angular.module('ui.utils.masks.helpers', []);

module.exports = m.name;

m.factory('PreFormatters', [function() {
	function clearDelimitersAndLeadingZeros(value) {
		if (value === '0') {
			return '0';
		}

		var cleanValue = value.replace(/^-/,'').replace(/^0*/, '');
		return cleanValue.replace(/[^0-9]/g, '');
	}

	function prepareNumberToFormatter(value, decimals) {
		return clearDelimitersAndLeadingZeros((parseFloat(value)).toFixed(decimals));
	}

	return {
		clearDelimitersAndLeadingZeros: clearDelimitersAndLeadingZeros,
		prepareNumberToFormatter: prepareNumberToFormatter
	};
}])
.factory('NumberMasks', [function() {
	return {
		viewMask: function(decimals, decimalDelimiter, thousandsDelimiter) {
			var mask = '#' + thousandsDelimiter + '##0';

			if (decimals > 0) {
				mask += decimalDelimiter;
				for (var i = 0; i < decimals; i++) {
					mask += '0';
				}
			}

			return new StringMask(mask, {
				reverse: true
			});
		},
		modelMask: function(decimals) {
			var mask = '###0';

			if (decimals > 0) {
				mask += '.';
				for (var i = 0; i < decimals; i++) {
					mask += '0';
				}
			}

			return new StringMask(mask, {
				reverse: true
			});
		}
	};
}]);

},{"string-mask":undefined}],"mask-factory":[function(require,module,exports){
'use strict';

module.exports = function maskFactory(maskDefinition) {
	return function MaskDirective() {
		return {
			restrict: 'A',
			require: 'ngModel',
			link: function(scope, element, attrs, ctrl) {
				ctrl.$formatters.push(function formatter(value) {
					if (ctrl.$isEmpty(value)) {
						return value;
					}

					var cleanValue = maskDefinition.clearValue(value);
					return maskDefinition.format(cleanValue);
				});

				ctrl.$parsers.push(function parser(value) {
					if (ctrl.$isEmpty(value)) {
						return value;
					}

					var cleanValue = maskDefinition.clearValue(value);
					var formattedValue = maskDefinition.format(cleanValue);

					if (ctrl.$viewValue !== formattedValue) {
						ctrl.$setViewValue(formattedValue);
						ctrl.$render();
					}

					if (angular.isUndefined(maskDefinition.getModelValue)) {
						return cleanValue;
					}

					var actualModelType = typeof ctrl.$modelValue;
					return maskDefinition.getModelValue(formattedValue, actualModelType);
				});

				angular.forEach(maskDefinition.validations, function(validatorFn, validationErrorKey) {
					ctrl.$validators[validationErrorKey] = function validator(modelValue, viewValue) {
						return ctrl.$isEmpty(modelValue) || validatorFn(modelValue, viewValue);
					};
				});
			}
		};
	};
};

},{}],"validators":[function(require,module,exports){
'use strict';

module.exports = {
	maxNumber: function(ctrl, value, limit) {
		var max = parseFloat(limit, 10);
		return ctrl.$isEmpty(value) || isNaN(max) || value <= max;
	},
	minNumber: function(ctrl, value, limit) {
		var min = parseFloat(limit, 10);
		return ctrl.$isEmpty(value) || isNaN(min) || value >= min;
	}
};

},{}]},{},[1]);
