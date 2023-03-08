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