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