/**
 * angular-fluig
 * A list of AngularJS services, directives, filters, utilities an resources for Fluig
 * @version v1.1.0
 * @link 
 * @license MIT
 */
require=(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
/**
 * br-validations
 * A library of validations applicable to several Brazilian data like I.E., CNPJ, CPF and others
 * @version v0.2.4
 * @link http://github.com/the-darc/br-validations
 * @license MIT
 */
(function (root, factory) {
	if (typeof define === 'function' && define.amd) {
		// AMD. Register as an anonymous module.
		define([], factory);
	} else if (typeof exports === 'object') {
		// Node. Does not work with strict CommonJS, but
		// only CommonJS-like environments that support module.exports,
		// like Node.
		module.exports = factory();
	} else {
		// Browser globals (root is window)
		root.BrV = factory();
	}
}(this, function () {
var CNPJ = {};

CNPJ.validate = function(c) {
	var b = [6,5,4,3,2,9,8,7,6,5,4,3,2];
	c = c.replace(/[^\d]/g,'');

	var r = /^(0{14}|1{14}|2{14}|3{14}|4{14}|5{14}|6{14}|7{14}|8{14}|9{14})$/;
	if (!c || c.length !== 14 || r.test(c)) {
		return false;
	}
	c = c.split('');

	for (var i = 0, n = 0; i < 12; i++) {
		n += c[i] * b[i+1];
	}
	n = 11 - n%11;
	n = n >= 10 ? 0 : n;
	if (parseInt(c[12]) !== n)  {
		return false;
	}

	for (i = 0, n = 0; i <= 12; i++) {
		n += c[i] * b[i];
	}
	n = 11 - n%11;
	n = n >= 10 ? 0 : n;
	if (parseInt(c[13]) !== n)  {
		return false;
	}
	return true;
};


var CPF = {};

CPF.validate = function(cpf) {
	cpf = cpf.replace(/[^\d]+/g,'');
	var r = /^(0{11}|1{11}|2{11}|3{11}|4{11}|5{11}|6{11}|7{11}|8{11}|9{11})$/;
	if (!cpf || cpf.length !== 11 || r.test(cpf)) {
		return false;
	}
	function validateDigit(digit) {
		var add = 0;
		var init = digit - 9;
		for (var i = 0; i < 9; i ++) {
			add += parseInt(cpf.charAt(i + init)) * (i+1);
		}
		return (add%11)%10 === parseInt(cpf.charAt(digit));
	}
	return validateDigit(9) && validateDigit(10);
};

var IE = function(uf) {
	if (!(this instanceof IE)) {
		return new IE(uf);
	}

	this.rules = IErules[uf] || [];
	this.rule;
	IE.prototype._defineRule = function(value) {
		this.rule = undefined;
		for (var r = 0; r < this.rules.length && this.rule === undefined; r++) {
			var str = value.replace(/[^\d]/g,'');
			var ruleCandidate = this.rules[r];
			if (str.length === ruleCandidate.chars && (!ruleCandidate.match || ruleCandidate.match.test(value))) {
				this.rule = ruleCandidate;
			}
		}
		return !!this.rule;
	};

	IE.prototype.validate = function(value) {
		if (!value || !this._defineRule(value)) {
			return false;
		}
		return this.rule.validate(value);
	};
};

var IErules = {};

var algorithmSteps = {
	handleStr: {
		onlyNumbers: function(str) {
			return str.replace(/[^\d]/g,'').split('');
		},
		mgSpec: function(str) {
			var s = str.replace(/[^\d]/g,'');
			s = s.substr(0,3)+'0'+s.substr(3, s.length);
			return s.split('');
		}
	},
	sum: {
		normalSum: function(handledStr, pesos) {
			var nums = handledStr;
			var sum = 0;
			for (var i = 0; i < pesos.length; i++) {
				sum += parseInt(nums[i]) * pesos[i];
			}
			return sum;
		},
		individualSum: function(handledStr, pesos) {
			var nums = handledStr;
			var sum = 0;
			for (var i = 0; i < pesos.length; i++) {
				var mult = parseInt(nums[i]) * pesos[i];
				sum += mult%10 + parseInt(mult/10);
			}
			return sum;
		},
		apSpec: function(handledStr, pesos) {
			var sum = this.normalSum(handledStr, pesos);
			var ref = handledStr.join('');
			if (ref >= '030000010' && ref <= '030170009') {
				return sum + 5;
			}
			if (ref >= '030170010' && ref <= '030190229') {
				return sum + 9;
			}
			return sum;
		}
	},
	rest: {
		mod11: function(sum) {
			return sum%11;
		},
		mod10: function(sum) {
			return sum%10;
		},
		mod9: function(sum) {
			return sum%9;
		}
	},
	expectedDV: {
		minusRestOf11: function(rest) {
			return rest < 2 ? 0 : 11 - rest;
		},
		minusRestOf11v2: function(rest) {
			return rest < 2 ? 11 - rest - 10 : 11 - rest;
		},
		minusRestOf10: function(rest) {
			return rest < 1 ? 0 : 10 - rest;
		},
		mod10: function(rest) {
			return rest%10;
		},
		goSpec: function(rest, handledStr) {
			var ref = handledStr.join('');
			if (rest === 1) {
				return ref >= '101031050' && ref <= '101199979' ? 1 : 0;
			}
			return rest === 0 ? 0 : 11 - rest;
		},
		apSpec: function(rest, handledStr) {
			var ref = handledStr.join('');
			if (rest === 0) {
				return ref >= '030170010' && ref <= '030190229' ? 1 : 0;
			}
			return rest === 1 ? 0 : 11 - rest;
		},
		voidFn: function(rest) {
			return rest;
		}
	}
};


/**
 * options {
 *     pesos: Array of values used to operate in sum step
 *     dvPos: Position of the DV to validate considering the handledStr
 *     algorithmSteps: The four DV's validation algorithm steps names
 * }
 */
function validateDV(value, options) {
	var steps = options.algorithmSteps;

	// Step 01: Handle String
	var handledStr = algorithmSteps.handleStr[steps[0]](value);

	// Step 02: Sum chars
	var sum = algorithmSteps.sum[steps[1]](handledStr, options.pesos);

	// Step 03: Rest calculation
	var rest = algorithmSteps.rest[steps[2]](sum);

	// Fixed Step: Get current DV
	var currentDV = parseInt(handledStr[options.dvpos]);

	// Step 04: Expected DV calculation
	var expectedDV = algorithmSteps.expectedDV[steps[3]](rest, handledStr);

	// Fixed step: DV verification
	return currentDV === expectedDV;
}

function validateIE(value, rule) {
	if (rule.match && !rule.match.test(value)) {
		return false;
	}
	for (var i = 0; i < rule.dvs.length; i++) {
		// console.log('>> >> dv'+i);
		if (!validateDV(value, rule.dvs[i])) {
			return false;
		}
	}
	return true;
}

IErules.PE = [{
	//mask: new StringMask('0000000-00'),
	chars: 9,
	dvs: [{
		dvpos: 7,
		pesos: [8,7,6,5,4,3,2],
		algorithmSteps: ['onlyNumbers', 'normalSum', 'mod11', 'minusRestOf11']
	},{
		dvpos: 8,
		pesos: [9,8,7,6,5,4,3,2],
		algorithmSteps: ['onlyNumbers', 'normalSum', 'mod11', 'minusRestOf11']
	}],
	validate: function(value) { return validateIE(value, this); }
},{
	// mask: new StringMask('00.0.000.0000000-0'),
	chars: 14,
	pesos: [[1,2,3,4,5,9,8,7,6,5,4,3,2]],
	dvs: [{
		dvpos: 13,
		pesos: [5,4,3,2,1,9,8,7,6,5,4,3,2],
		algorithmSteps: ['onlyNumbers', 'normalSum', 'mod11', 'minusRestOf11v2']
	}],
	validate: function(value) { return validateIE(value, this); }
}];

IErules.RS = [{
	// mask: new StringMask('000/0000000'),
	chars: 10,
	dvs: [{
		dvpos: 9,
		pesos: [2,9,8,7,6,5,4,3,2],
		algorithmSteps: ['onlyNumbers', 'normalSum', 'mod11', 'minusRestOf11']
	}],
	validate: function(value) { return validateIE(value, this); }
}];

IErules.AC = [{
	// mask: new StringMask('00.000.000/000-00'),
	chars: 13,
	match: /^01/,
	dvs: [{
		dvpos: 11,
		pesos: [4,3,2,9,8,7,6,5,4,3,2],
		algorithmSteps: ['onlyNumbers', 'normalSum', 'mod11', 'minusRestOf11']
	},{
		dvpos: 12,
		pesos: [5,4,3,2,9,8,7,6,5,4,3,2],
		algorithmSteps: ['onlyNumbers', 'normalSum', 'mod11', 'minusRestOf11']
	}],
	validate: function(value) { return validateIE(value, this); }
}];

IErules.MG = [{
	// mask: new StringMask('000.000.000/0000'),
	chars: 13,
	dvs: [{
		dvpos: 12,
		pesos: [1,2,1,2,1,2,1,2,1,2,1,2],
		algorithmSteps: ['mgSpec', 'individualSum', 'mod10', 'minusRestOf10']
	},{
		dvpos: 12,
		pesos: [3,2,11,10,9,8,7,6,5,4,3,2],
		algorithmSteps: ['onlyNumbers', 'normalSum', 'mod11', 'minusRestOf11']
	}],
	validate: function(value) { return validateIE(value, this); }
}];

IErules.SP = [{
	// mask: new StringMask('000.000.000.000'),
	chars: 12,
	match: /^[0-9]/,
	dvs: [{
		dvpos: 8,
		pesos: [1,3,4,5,6,7,8,10],
		algorithmSteps: ['onlyNumbers', 'normalSum', 'mod11', 'mod10']
	},{
		dvpos: 11,
		pesos: [3,2,10,9,8,7,6,5,4,3,2],
		algorithmSteps: ['onlyNumbers', 'normalSum', 'mod11', 'mod10']
	}],
	validate: function(value) { return validateIE(value, this); }
},{
	// mask: new StringMask('P-00000000.0/000')
	chars: 12,
	match: /^P/i,
	dvs: [{
		dvpos: 8,
		pesos: [1,3,4,5,6,7,8,10],
		algorithmSteps: ['onlyNumbers', 'normalSum', 'mod11', 'mod10']
	}],
	validate: function(value) { return validateIE(value, this); }
}];

IErules.DF = [{
	// mask: new StringMask('00000000000-00'),
	chars: 13,
	dvs: [{
		dvpos: 11,
		pesos: [4,3,2,9,8,7,6,5,4,3,2],
		algorithmSteps: ['onlyNumbers', 'normalSum', 'mod11', 'minusRestOf11']
	},{
		dvpos: 12,
		pesos: [5,4,3,2,9,8,7,6,5,4,3,2],
		algorithmSteps: ['onlyNumbers', 'normalSum', 'mod11', 'minusRestOf11']
	}],
	validate: function(value) { return validateIE(value, this); }
}];

IErules.ES = [{
	// mask: new StringMask('000.000.00-0')
	chars: 9,
	dvs: [{
		dvpos: 8,
		pesos: [9,8,7,6,5,4,3,2],
		algorithmSteps: ['onlyNumbers', 'normalSum', 'mod11', 'minusRestOf11']
	}],
	validate: function(value) { return validateIE(value, this); }
}];

IErules.BA = [{
	// mask: new StringMask('000000-00')
	chars: 8,
	match: /^[0123458]/,
	dvs: [{
		dvpos: 7,
		pesos: [7,6,5,4,3,2],
		algorithmSteps: ['onlyNumbers', 'normalSum', 'mod10', 'minusRestOf10']
	},{
		dvpos: 6,
		pesos: [8,7,6,5,4,3,0,2],
		algorithmSteps: ['onlyNumbers', 'normalSum', 'mod10', 'minusRestOf10']
	}],
	validate: function(value) { return validateIE(value, this); }
},{
	chars: 8,
	match: /^[679]/,
	dvs: [{
		dvpos: 7,
		pesos: [7,6,5,4,3,2],
		algorithmSteps: ['onlyNumbers', 'normalSum', 'mod11', 'minusRestOf11']
	},{
		dvpos: 6,
		pesos: [8,7,6,5,4,3,0,2],
		algorithmSteps: ['onlyNumbers', 'normalSum', 'mod11', 'minusRestOf11']
	}],
	validate: function(value) { return validateIE(value, this); }
},{
	// mask: new StringMask('0000000-00')
	chars: 9,
	match: /^[0-9][0123458]/,
	dvs: [{
		dvpos: 8,
		pesos: [8,7,6,5,4,3,2],
		algorithmSteps: ['onlyNumbers', 'normalSum', 'mod10', 'minusRestOf10']
	},{
		dvpos: 7,
		pesos: [9,8,7,6,5,4,3,0,2],
		algorithmSteps: ['onlyNumbers', 'normalSum', 'mod10', 'minusRestOf10']
	}],
	validate: function(value) { return validateIE(value, this); }
},{
	chars: 9,
	match: /^[0-9][679]/,
	dvs: [{
		dvpos: 8,
		pesos: [8,7,6,5,4,3,2],
		algorithmSteps: ['onlyNumbers', 'normalSum', 'mod11', 'minusRestOf11']
	},{
		dvpos: 7,
		pesos: [9,8,7,6,5,4,3,0,2],
		algorithmSteps: ['onlyNumbers', 'normalSum', 'mod11', 'minusRestOf11']
	}],
	validate: function(value) { return validateIE(value, this); }
}];

IErules.AM = [{
	//mask: new StringMask('00.000.000-0')
	chars: 9,
	dvs: [{
		dvpos: 8,
		pesos: [9,8,7,6,5,4,3,2],
		algorithmSteps: ['onlyNumbers', 'normalSum', 'mod11', 'minusRestOf11']
	}],
	validate: function(value) { return validateIE(value, this); }
}];

IErules.RN = [{
	// {mask: new StringMask('00.000.000-0')
	chars: 9,
	match: /^20/,
	dvs: [{
		dvpos: 8,
		pesos: [9,8,7,6,5,4,3,2],
		algorithmSteps: ['onlyNumbers', 'normalSum', 'mod11', 'minusRestOf11']
	}],
	validate: function(value) { return validateIE(value, this); }
},{
	// {mask: new StringMask('00.0.000.000-0'), chars: 10}
	chars: 10,
	match: /^20/,
	dvs: [{
		dvpos: 8,
		pesos: [10,9,8,7,6,5,4,3,2],
		algorithmSteps: ['onlyNumbers', 'normalSum', 'mod11', 'minusRestOf11']
	}],
	validate: function(value) { return validateIE(value, this); }
}];

IErules.RO = [{
	// mask: new StringMask('0000000000000-0')
	chars: 14,
	dvs: [{
		dvpos: 13,
		pesos: [6,5,4,3,2,9,8,7,6,5,4,3,2],
		algorithmSteps: ['onlyNumbers', 'normalSum', 'mod11', 'minusRestOf11']
	}],
	validate: function(value) { return validateIE(value, this); }
}];

IErules.PR = [{
	// mask: new StringMask('00000000-00')
	chars: 10,
	dvs: [{
		dvpos: 8,
		pesos: [3,2,7,6,5,4,3,2],
		algorithmSteps: ['onlyNumbers', 'normalSum', 'mod11', 'minusRestOf11']
	},{
		dvpos: 9,
		pesos: [4,3,2,7,6,5,4,3,2],
		algorithmSteps: ['onlyNumbers', 'normalSum', 'mod11', 'minusRestOf11']
	}],
	validate: function(value) { return validateIE(value, this); }
}];

IErules.SC = [{
	// {mask: new StringMask('000.000.000'), uf: 'SANTA CATARINA'}
	chars: 9,
	dvs: [{
		dvpos: 8,
		pesos: [9,8,7,6,5,4,3,2],
		algorithmSteps: ['onlyNumbers', 'normalSum', 'mod11', 'minusRestOf11']
	}],
	validate: function(value) { return validateIE(value, this); }
}];

IErules.RJ = [{
	// {mask: new StringMask('00.000.00-0'), uf: 'RIO DE JANEIRO'}
	chars: 8,
	dvs: [{
		dvpos: 7,
		pesos: [2,7,6,5,4,3,2],
		algorithmSteps: ['onlyNumbers', 'normalSum', 'mod11', 'minusRestOf11']
	}],
	validate: function(value) { return validateIE(value, this); }
}];

IErules.PA = [{
	// {mask: new StringMask('00-000000-0')
	chars: 9,
	match: /^15/,
	dvs: [{
		dvpos: 8,
		pesos: [9,8,7,6,5,4,3,2],
		algorithmSteps: ['onlyNumbers', 'normalSum', 'mod11', 'minusRestOf11']
	}],
	validate: function(value) { return validateIE(value, this); }
}];

IErules.SE = [{
	// {mask: new StringMask('00000000-0')
	chars: 9,
	dvs: [{
		dvpos: 8,
		pesos: [9,8,7,6,5,4,3,2],
		algorithmSteps: ['onlyNumbers', 'normalSum', 'mod11', 'minusRestOf11']
	}],
	validate: function(value) { return validateIE(value, this); }
}];

IErules.PB = [{
	// {mask: new StringMask('00000000-0')
	chars: 9,
	dvs: [{
		dvpos: 8,
		pesos: [9,8,7,6,5,4,3,2],
		algorithmSteps: ['onlyNumbers', 'normalSum', 'mod11', 'minusRestOf11']
	}],
	validate: function(value) { return validateIE(value, this); }
}];

IErules.CE = [{
	// {mask: new StringMask('00000000-0')
	chars: 9,
	dvs: [{
		dvpos: 8,
		pesos: [9,8,7,6,5,4,3,2],
		algorithmSteps: ['onlyNumbers', 'normalSum', 'mod11', 'minusRestOf11']
	}],
	validate: function(value) { return validateIE(value, this); }
}];

IErules.PI = [{
	// {mask: new StringMask('000000000')
	chars: 9,
	dvs: [{
		dvpos: 8,
		pesos: [9,8,7,6,5,4,3,2],
		algorithmSteps: ['onlyNumbers', 'normalSum', 'mod11', 'minusRestOf11']
	}],
	validate: function(value) { return validateIE(value, this); }
}];

IErules.MA = [{
	// {mask: new StringMask('000000000')
	chars: 9,
	match: /^12/,
	dvs: [{
		dvpos: 8,
		pesos: [9,8,7,6,5,4,3,2],
		algorithmSteps: ['onlyNumbers', 'normalSum', 'mod11', 'minusRestOf11']
	}],
	validate: function(value) { return validateIE(value, this); }
}];

IErules.MT = [{
	// {mask: new StringMask('0000000000-0')
	chars: 11,
	dvs: [{
		dvpos: 10,
		pesos: [3,2,9,8,7,6,5,4,3,2],
		algorithmSteps: ['onlyNumbers', 'normalSum', 'mod11', 'minusRestOf11']
	}],
	validate: function(value) { return validateIE(value, this); }
}];

IErules.MS = [{
	// {mask: new StringMask('000000000')
	chars: 9,
	match: /^28/,
	dvs: [{
		dvpos: 8,
		pesos: [9,8,7,6,5,4,3,2],
		algorithmSteps: ['onlyNumbers', 'normalSum', 'mod11', 'minusRestOf11']
	}],
	validate: function(value) { return validateIE(value, this); }
}];

IErules.TO = [{
	// {mask: new StringMask('00000000000'),
	chars: 11,
	match: /^[0-9]{2}((0[123])|(99))/,
	dvs: [{
		dvpos: 10,
		pesos: [9,8,0,0,7,6,5,4,3,2],
		algorithmSteps: ['onlyNumbers', 'normalSum', 'mod11', 'minusRestOf11']
	}],
	validate: function(value) { return validateIE(value, this); }
}];

IErules.AL = [{
	// {mask: new StringMask('000000000')
	chars: 9,
	match: /^24[03578]/,
	dvs: [{
		dvpos: 8,
		pesos: [9,8,7,6,5,4,3,2],
		algorithmSteps: ['onlyNumbers', 'normalSum', 'mod11', 'minusRestOf11']
	}],
	validate: function(value) { return validateIE(value, this); }
}];

IErules.RR = [{
	// {mask: new StringMask('00000000-0')
	chars: 9,
	match: /^24/,
	dvs: [{
		dvpos: 8,
		pesos: [1,2,3,4,5,6,7,8],
		algorithmSteps: ['onlyNumbers', 'normalSum', 'mod9', 'voidFn']
	}],
	validate: function(value) { return validateIE(value, this); }
}];

IErules.GO = [{
	// {mask: new StringMask('00.000.000-0')
	chars: 9,
	match: /^1[015]/,
	dvs: [{
		dvpos: 8,
		pesos: [9,8,7,6,5,4,3,2],
		algorithmSteps: ['onlyNumbers', 'normalSum', 'mod11', 'goSpec']
	}],
	validate: function(value) { return validateIE(value, this); }
}];

IErules.AP = [{
	// {mask: new StringMask('000000000')
	chars: 9,
	match: /^03/,
	dvs: [{
		dvpos: 8,
		pesos: [9,8,7,6,5,4,3,2],
		algorithmSteps: ['onlyNumbers', 'apSpec', 'mod11', 'apSpec']
	}],
	validate: function(value) { return validateIE(value, this); }
}];

	return {
		ie: IE,
		cpf: CPF,
		cnpj: CNPJ
	};
}));
},{}],2:[function(require,module,exports){
(function(root, factory) {
    /* istanbul ignore next */
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([], factory);
    } else if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module.exports = factory();
    } else {
        // Browser globals (root is window)
        root.StringMask = factory();
    }
}(this, function() {
    var tokens = {
        '0': {pattern: /\d/, _default: '0'},
        '9': {pattern: /\d/, optional: true},
        '#': {pattern: /\d/, optional: true, recursive: true},
        'A': {pattern: /[a-zA-Z0-9]/},
        'S': {pattern: /[a-zA-Z]/},
        'U': {pattern: /[a-zA-Z]/, transform: function(c) { return c.toLocaleUpperCase(); }},
        'L': {pattern: /[a-zA-Z]/, transform: function(c) { return c.toLocaleLowerCase(); }},
        '$': {escape: true}
    };

    function isEscaped(pattern, pos) {
        var count = 0;
        var i = pos - 1;
        var token = {escape: true};
        while (i >= 0 && token && token.escape) {
            token = tokens[pattern.charAt(i)];
            count += token && token.escape ? 1 : 0;
            i--;
        }
        return count > 0 && count % 2 === 1;
    }

    function calcOptionalNumbersToUse(pattern, value) {
        var numbersInP = pattern.replace(/[^0]/g,'').length;
        var numbersInV = value.replace(/[^\d]/g,'').length;
        return numbersInV - numbersInP;
    }

    function concatChar(text, character, options, token) {
        if (token && typeof token.transform === 'function') {
            character = token.transform(character);
        }
        if (options.reverse) {
            return character + text;
        }
        return text + character;
    }

    function hasMoreTokens(pattern, pos, inc) {
        var pc = pattern.charAt(pos);
        var token = tokens[pc];
        if (pc === '') {
            return false;
        }
        return token && !token.escape ? true : hasMoreTokens(pattern, pos + inc, inc);
    }

    function hasMoreRecursiveTokens(pattern, pos, inc) {
        var pc = pattern.charAt(pos);
        var token = tokens[pc];
        if (pc === '') {
            return false;
        }
        return token && token.recursive ? true : hasMoreRecursiveTokens(pattern, pos + inc, inc);
    }

    function insertChar(text, char, position) {
        var t = text.split('');
        t.splice(position, 0, char);
        return t.join('');
    }

    function StringMask(pattern, opt) {
        this.options = opt || {};
        this.options = {
            reverse: this.options.reverse || false,
            usedefaults: this.options.usedefaults || this.options.reverse
        };
        this.pattern = pattern;
    }

    StringMask.prototype.process = function proccess(value) {
        if (!value) {
            return {result: '', valid: false};
        }
        value = value + '';
        var pattern2 = this.pattern;
        var valid = true;
        var formatted = '';
        var valuePos = this.options.reverse ? value.length - 1 : 0;
        var patternPos = 0;
        var optionalNumbersToUse = calcOptionalNumbersToUse(pattern2, value);
        var escapeNext = false;
        var recursive = [];
        var inRecursiveMode = false;

        var steps = {
            start: this.options.reverse ? pattern2.length - 1 : 0,
            end: this.options.reverse ? -1 : pattern2.length,
            inc: this.options.reverse ? -1 : 1
        };

        function continueCondition(options) {
            if (!inRecursiveMode && !recursive.length && hasMoreTokens(pattern2, patternPos, steps.inc)) {
                // continue in the normal iteration
                return true;
            } else if (!inRecursiveMode && recursive.length &&
                hasMoreRecursiveTokens(pattern2, patternPos, steps.inc)) {
                // continue looking for the recursive tokens
                // Note: all chars in the patterns after the recursive portion will be handled as static string
                return true;
            } else if (!inRecursiveMode) {
                // start to handle the recursive portion of the pattern
                inRecursiveMode = recursive.length > 0;
            }

            if (inRecursiveMode) {
                var pc = recursive.shift();
                recursive.push(pc);
                if (options.reverse && valuePos >= 0) {
                    patternPos++;
                    pattern2 = insertChar(pattern2, pc, patternPos);
                    return true;
                } else if (!options.reverse && valuePos < value.length) {
                    pattern2 = insertChar(pattern2, pc, patternPos);
                    return true;
                }
            }
            return patternPos < pattern2.length && patternPos >= 0;
        }

        /**
         * Iterate over the pattern's chars parsing/matching the input value chars
         * until the end of the pattern. If the pattern ends with recursive chars
         * the iteration will continue until the end of the input value.
         *
         * Note: The iteration must stop if an invalid char is found.
         */
        for (patternPos = steps.start; continueCondition(this.options); patternPos = patternPos + steps.inc) {
            // Value char
            var vc = value.charAt(valuePos);
            // Pattern char to match with the value char
            var pc = pattern2.charAt(patternPos);

            var token = tokens[pc];
            if (recursive.length && token && !token.recursive) {
                // In the recursive portion of the pattern: tokens not recursive must be seen as static chars
                token = null;
            }

            // 1. Handle escape tokens in pattern
            // go to next iteration: if the pattern char is a escape char or was escaped
            if (!inRecursiveMode || vc) {
                if (this.options.reverse && isEscaped(pattern2, patternPos)) {
                    // pattern char is escaped, just add it and move on
                    formatted = concatChar(formatted, pc, this.options, token);
                    // skip escape token
                    patternPos = patternPos + steps.inc;
                    continue;
                } else if (!this.options.reverse && escapeNext) {
                    // pattern char is escaped, just add it and move on
                    formatted = concatChar(formatted, pc, this.options, token);
                    escapeNext = false;
                    continue;
                } else if (!this.options.reverse && token && token.escape) {
                    // mark to escape the next pattern char
                    escapeNext = true;
                    continue;
                }
            }

            // 2. Handle recursive tokens in pattern
            // go to next iteration: if the value str is finished or
            //                       if there is a normal token in the recursive portion of the pattern
            if (!inRecursiveMode && token && token.recursive) {
                // save it to repeat in the end of the pattern and handle the value char now
                recursive.push(pc);
            } else if (inRecursiveMode && !vc) {
                // in recursive mode but value is finished. Add the pattern char if it is not a recursive token
                formatted = concatChar(formatted, pc, this.options, token);
                continue;
            } else if (!inRecursiveMode && recursive.length > 0 && !vc) {
                // recursiveMode not started but already in the recursive portion of the pattern
                continue;
            }

            // 3. Handle the value
            // break iterations: if value is invalid for the given pattern
            if (!token) {
                // add char of the pattern
                formatted = concatChar(formatted, pc, this.options, token);
                if (!inRecursiveMode && recursive.length) {
                    // save it to repeat in the end of the pattern
                    recursive.push(pc);
                }
            } else if (token.optional) {
                // if token is optional, only add the value char if it matchs the token pattern
                //                       if not, move on to the next pattern char
                if (token.pattern.test(vc) && optionalNumbersToUse) {
                    formatted = concatChar(formatted, vc, this.options, token);
                    valuePos = valuePos + steps.inc;
                    optionalNumbersToUse--;
                } else if (recursive.length > 0 && vc) {
                    valid = false;
                    break;
                }
            } else if (token.pattern.test(vc)) {
                // if token isn't optional the value char must match the token pattern
                formatted = concatChar(formatted, vc, this.options, token);
                valuePos = valuePos + steps.inc;
            } else if (!vc && token._default && this.options.usedefaults) {
                // if the token isn't optional and has a default value, use it if the value is finished
                formatted = concatChar(formatted, token._default, this.options, token);
            } else {
                // the string value don't match the given pattern
                valid = false;
                break;
            }
        }

        return {result: formatted, valid: valid};
    };

    StringMask.prototype.apply = function(value) {
        return this.process(value).result;
    };

    StringMask.prototype.validate = function(value) {
        return this.process(value).valid;
    };

    StringMask.process = function(value, pattern, options) {
        return new StringMask(pattern, options).process(value);
    };

    StringMask.apply = function(value, pattern, options) {
        return new StringMask(pattern, options).apply(value);
    };

    StringMask.validate = function(value, pattern, options) {
        return new StringMask(pattern, options).validate(value);
    };

    return StringMask;
}));

},{}],3:[function(require,module,exports){
'use strict';

module.exports = angular.module('angular.fluig', [
    require('./global/global-masks'),
    require('./br/br-masks'),
    require('./fluig/fluig-ui'),
    require('./filters/filter')
]).name;
},{"./br/br-masks":5,"./filters/filter":14,"./fluig/fluig-ui":19,"./global/global-masks":27}],4:[function(require,module,exports){
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
},{"mask-factory":"mask-factory","string-mask":2}],5:[function(require,module,exports){
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
},{"../helpers":36,"./boleto-bancario/boleto-bancario":4,"./car-plate/car-plate":6,"./cep/cep":7,"./cnpj/cnpj":8,"./cpf-cnpj/cpf-cnpj":9,"./cpf/cpf":10,"./inscricao-estadual/ie":11,"./nfe/nfe":12,"./phone/br-phone":13}],6:[function(require,module,exports){
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
},{"mask-factory":"mask-factory","string-mask":2}],7:[function(require,module,exports){
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
},{"mask-factory":"mask-factory","string-mask":2}],8:[function(require,module,exports){
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
},{"br-validations":1,"mask-factory":"mask-factory","string-mask":2}],9:[function(require,module,exports){
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
},{"br-validations":1,"mask-factory":"mask-factory","string-mask":2}],10:[function(require,module,exports){
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
},{"br-validations":1,"mask-factory":"mask-factory","string-mask":2}],11:[function(require,module,exports){
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

},{"br-validations":1,"string-mask":2}],12:[function(require,module,exports){
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
},{"mask-factory":"mask-factory","string-mask":2}],13:[function(require,module,exports){
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
},{"mask-factory":"mask-factory","string-mask":2}],14:[function(require,module,exports){
'use strict';

var m = angular.module('angular.filters', [
        require('../helpers'),
    ])
    .filter('pagination', require('./pagination/pagination'))

module.exports = m.name;
},{"../helpers":36,"./pagination/pagination":15}],15:[function(require,module,exports){
'use strict';

function PaginationFilter() {
    return function(input, start) {
        start = +start;

        if (!input) return 0;
        return input.slice(start);
    };
};


module.exports = PaginationFilter;
},{}],16:[function(require,module,exports){
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
},{}],17:[function(require,module,exports){
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
},{}],18:[function(require,module,exports){
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
},{}],19:[function(require,module,exports){
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
},{"../helpers":36,"./autocomplete/autocomplete":16,"./chart/chart":17,"./date/date":18,"./header/header":20,"./popover/popover":21,"./required/required":22,"./switch/switch":23}],20:[function(require,module,exports){
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
},{}],21:[function(require,module,exports){
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
},{}],22:[function(require,module,exports){
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
},{}],23:[function(require,module,exports){
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

            console.log('switcher');

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
                } else {
                    FLUIGC.switcher.enable(element);
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
},{}],24:[function(require,module,exports){
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

},{"mask-factory":"mask-factory","string-mask":2}],25:[function(require,module,exports){
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
},{"./messages":26}],26:[function(require,module,exports){
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
},{}],27:[function(require,module,exports){
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
},{"../helpers":36,"./credit-card/credit-card":24,"./error/error":25,"./money/money":28,"./name/name":29,"./number/number":30,"./percentage/percentage":32,"./percentage/percentage-filter":31,"./scientific-notation/scientific-notation":33,"./time/time":35,"./time/time-filter":34}],28:[function(require,module,exports){
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
},{"string-mask":2,"validators":"validators"}],29:[function(require,module,exports){
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
},{}],30:[function(require,module,exports){
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
},{"validators":"validators"}],31:[function(require,module,exports){
'use strict';


function PercentageFilter($filter) {
    return function (input, decimals) {
        return $filter('number')(input * 100, decimals) + '%';
    };
}
PercentageFilter.$inject = ['$filter'];

module.exports = PercentageFilter;
},{}],32:[function(require,module,exports){
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
},{"validators":"validators"}],33:[function(require,module,exports){
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

},{"string-mask":2}],34:[function(require,module,exports){
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
},{"string-mask":2}],35:[function(require,module,exports){
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
},{"string-mask":2}],36:[function(require,module,exports){
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

},{"string-mask":2}],"mask-factory":[function(require,module,exports){
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

},{}]},{},[3])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIuLi9ub2RlX21vZHVsZXMvYnItdmFsaWRhdGlvbnMvcmVsZWFzZXMvYnItdmFsaWRhdGlvbnMuanMiLCIuLi9ub2RlX21vZHVsZXMvc3RyaW5nLW1hc2svc3JjL3N0cmluZy1tYXNrLmpzIiwiYW5ndWxhci1mbHVpZy5qcyIsImJyL2JvbGV0by1iYW5jYXJpby9ib2xldG8tYmFuY2FyaW8uanMiLCJici9ici1tYXNrcy5qcyIsImJyL2Nhci1wbGF0ZS9jYXItcGxhdGUuanMiLCJici9jZXAvY2VwLmpzIiwiYnIvY25wai9jbnBqLmpzIiwiYnIvY3BmLWNucGovY3BmLWNucGouanMiLCJici9jcGYvY3BmLmpzIiwiYnIvaW5zY3JpY2FvLWVzdGFkdWFsL2llLmpzIiwiYnIvbmZlL25mZS5qcyIsImJyL3Bob25lL2JyLXBob25lLmpzIiwiZmlsdGVycy9maWx0ZXIuanMiLCJmaWx0ZXJzL3BhZ2luYXRpb24vcGFnaW5hdGlvbi5qcyIsImZsdWlnL2F1dG9jb21wbGV0ZS9hdXRvY29tcGxldGUuanMiLCJmbHVpZy9jaGFydC9jaGFydC5qcyIsImZsdWlnL2RhdGUvZGF0ZS5qcyIsImZsdWlnL2ZsdWlnLXVpLmpzIiwiZmx1aWcvaGVhZGVyL2hlYWRlci5qcyIsImZsdWlnL3BvcG92ZXIvcG9wb3Zlci5qcyIsImZsdWlnL3JlcXVpcmVkL3JlcXVpcmVkLmpzIiwiZmx1aWcvc3dpdGNoL3N3aXRjaC5qcyIsImdsb2JhbC9jcmVkaXQtY2FyZC9jcmVkaXQtY2FyZC5qcyIsImdsb2JhbC9lcnJvci9lcnJvci5qcyIsImdsb2JhbC9lcnJvci9tZXNzYWdlcy5qcyIsImdsb2JhbC9nbG9iYWwtbWFza3MuanMiLCJnbG9iYWwvbW9uZXkvbW9uZXkuanMiLCJnbG9iYWwvbmFtZS9uYW1lLmpzIiwiZ2xvYmFsL251bWJlci9udW1iZXIuanMiLCJnbG9iYWwvcGVyY2VudGFnZS9wZXJjZW50YWdlLWZpbHRlci5qcyIsImdsb2JhbC9wZXJjZW50YWdlL3BlcmNlbnRhZ2UuanMiLCJnbG9iYWwvc2NpZW50aWZpYy1ub3RhdGlvbi9zY2llbnRpZmljLW5vdGF0aW9uLmpzIiwiZ2xvYmFsL3RpbWUvdGltZS1maWx0ZXIuanMiLCJnbG9iYWwvdGltZS90aW1lLmpzIiwiaGVscGVycy5qcyIsIi4uL21hc2stZmFjdG9yeSIsIi4uL3ZhbGlkYXRvcnMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsb0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25KQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsIi8qKlxuICogYnItdmFsaWRhdGlvbnNcbiAqIEEgbGlicmFyeSBvZiB2YWxpZGF0aW9ucyBhcHBsaWNhYmxlIHRvIHNldmVyYWwgQnJhemlsaWFuIGRhdGEgbGlrZSBJLkUuLCBDTlBKLCBDUEYgYW5kIG90aGVyc1xuICogQHZlcnNpb24gdjAuMi40XG4gKiBAbGluayBodHRwOi8vZ2l0aHViLmNvbS90aGUtZGFyYy9ici12YWxpZGF0aW9uc1xuICogQGxpY2Vuc2UgTUlUXG4gKi9cbihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge1xuXHRpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG5cdFx0Ly8gQU1ELiBSZWdpc3RlciBhcyBhbiBhbm9ueW1vdXMgbW9kdWxlLlxuXHRcdGRlZmluZShbXSwgZmFjdG9yeSk7XG5cdH0gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG5cdFx0Ly8gTm9kZS4gRG9lcyBub3Qgd29yayB3aXRoIHN0cmljdCBDb21tb25KUywgYnV0XG5cdFx0Ly8gb25seSBDb21tb25KUy1saWtlIGVudmlyb25tZW50cyB0aGF0IHN1cHBvcnQgbW9kdWxlLmV4cG9ydHMsXG5cdFx0Ly8gbGlrZSBOb2RlLlxuXHRcdG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSgpO1xuXHR9IGVsc2Uge1xuXHRcdC8vIEJyb3dzZXIgZ2xvYmFscyAocm9vdCBpcyB3aW5kb3cpXG5cdFx0cm9vdC5CclYgPSBmYWN0b3J5KCk7XG5cdH1cbn0odGhpcywgZnVuY3Rpb24gKCkge1xudmFyIENOUEogPSB7fTtcblxuQ05QSi52YWxpZGF0ZSA9IGZ1bmN0aW9uKGMpIHtcblx0dmFyIGIgPSBbNiw1LDQsMywyLDksOCw3LDYsNSw0LDMsMl07XG5cdGMgPSBjLnJlcGxhY2UoL1teXFxkXS9nLCcnKTtcblxuXHR2YXIgciA9IC9eKDB7MTR9fDF7MTR9fDJ7MTR9fDN7MTR9fDR7MTR9fDV7MTR9fDZ7MTR9fDd7MTR9fDh7MTR9fDl7MTR9KSQvO1xuXHRpZiAoIWMgfHwgYy5sZW5ndGggIT09IDE0IHx8IHIudGVzdChjKSkge1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXHRjID0gYy5zcGxpdCgnJyk7XG5cblx0Zm9yICh2YXIgaSA9IDAsIG4gPSAwOyBpIDwgMTI7IGkrKykge1xuXHRcdG4gKz0gY1tpXSAqIGJbaSsxXTtcblx0fVxuXHRuID0gMTEgLSBuJTExO1xuXHRuID0gbiA+PSAxMCA/IDAgOiBuO1xuXHRpZiAocGFyc2VJbnQoY1sxMl0pICE9PSBuKSAge1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXG5cdGZvciAoaSA9IDAsIG4gPSAwOyBpIDw9IDEyOyBpKyspIHtcblx0XHRuICs9IGNbaV0gKiBiW2ldO1xuXHR9XG5cdG4gPSAxMSAtIG4lMTE7XG5cdG4gPSBuID49IDEwID8gMCA6IG47XG5cdGlmIChwYXJzZUludChjWzEzXSkgIT09IG4pICB7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG5cdHJldHVybiB0cnVlO1xufTtcblxuXG52YXIgQ1BGID0ge307XG5cbkNQRi52YWxpZGF0ZSA9IGZ1bmN0aW9uKGNwZikge1xuXHRjcGYgPSBjcGYucmVwbGFjZSgvW15cXGRdKy9nLCcnKTtcblx0dmFyIHIgPSAvXigwezExfXwxezExfXwyezExfXwzezExfXw0ezExfXw1ezExfXw2ezExfXw3ezExfXw4ezExfXw5ezExfSkkLztcblx0aWYgKCFjcGYgfHwgY3BmLmxlbmd0aCAhPT0gMTEgfHwgci50ZXN0KGNwZikpIHtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblx0ZnVuY3Rpb24gdmFsaWRhdGVEaWdpdChkaWdpdCkge1xuXHRcdHZhciBhZGQgPSAwO1xuXHRcdHZhciBpbml0ID0gZGlnaXQgLSA5O1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgOTsgaSArKykge1xuXHRcdFx0YWRkICs9IHBhcnNlSW50KGNwZi5jaGFyQXQoaSArIGluaXQpKSAqIChpKzEpO1xuXHRcdH1cblx0XHRyZXR1cm4gKGFkZCUxMSklMTAgPT09IHBhcnNlSW50KGNwZi5jaGFyQXQoZGlnaXQpKTtcblx0fVxuXHRyZXR1cm4gdmFsaWRhdGVEaWdpdCg5KSAmJiB2YWxpZGF0ZURpZ2l0KDEwKTtcbn07XG5cbnZhciBJRSA9IGZ1bmN0aW9uKHVmKSB7XG5cdGlmICghKHRoaXMgaW5zdGFuY2VvZiBJRSkpIHtcblx0XHRyZXR1cm4gbmV3IElFKHVmKTtcblx0fVxuXG5cdHRoaXMucnVsZXMgPSBJRXJ1bGVzW3VmXSB8fCBbXTtcblx0dGhpcy5ydWxlO1xuXHRJRS5wcm90b3R5cGUuX2RlZmluZVJ1bGUgPSBmdW5jdGlvbih2YWx1ZSkge1xuXHRcdHRoaXMucnVsZSA9IHVuZGVmaW5lZDtcblx0XHRmb3IgKHZhciByID0gMDsgciA8IHRoaXMucnVsZXMubGVuZ3RoICYmIHRoaXMucnVsZSA9PT0gdW5kZWZpbmVkOyByKyspIHtcblx0XHRcdHZhciBzdHIgPSB2YWx1ZS5yZXBsYWNlKC9bXlxcZF0vZywnJyk7XG5cdFx0XHR2YXIgcnVsZUNhbmRpZGF0ZSA9IHRoaXMucnVsZXNbcl07XG5cdFx0XHRpZiAoc3RyLmxlbmd0aCA9PT0gcnVsZUNhbmRpZGF0ZS5jaGFycyAmJiAoIXJ1bGVDYW5kaWRhdGUubWF0Y2ggfHwgcnVsZUNhbmRpZGF0ZS5tYXRjaC50ZXN0KHZhbHVlKSkpIHtcblx0XHRcdFx0dGhpcy5ydWxlID0gcnVsZUNhbmRpZGF0ZTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuICEhdGhpcy5ydWxlO1xuXHR9O1xuXG5cdElFLnByb3RvdHlwZS52YWxpZGF0ZSA9IGZ1bmN0aW9uKHZhbHVlKSB7XG5cdFx0aWYgKCF2YWx1ZSB8fCAhdGhpcy5fZGVmaW5lUnVsZSh2YWx1ZSkpIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cdFx0cmV0dXJuIHRoaXMucnVsZS52YWxpZGF0ZSh2YWx1ZSk7XG5cdH07XG59O1xuXG52YXIgSUVydWxlcyA9IHt9O1xuXG52YXIgYWxnb3JpdGhtU3RlcHMgPSB7XG5cdGhhbmRsZVN0cjoge1xuXHRcdG9ubHlOdW1iZXJzOiBmdW5jdGlvbihzdHIpIHtcblx0XHRcdHJldHVybiBzdHIucmVwbGFjZSgvW15cXGRdL2csJycpLnNwbGl0KCcnKTtcblx0XHR9LFxuXHRcdG1nU3BlYzogZnVuY3Rpb24oc3RyKSB7XG5cdFx0XHR2YXIgcyA9IHN0ci5yZXBsYWNlKC9bXlxcZF0vZywnJyk7XG5cdFx0XHRzID0gcy5zdWJzdHIoMCwzKSsnMCcrcy5zdWJzdHIoMywgcy5sZW5ndGgpO1xuXHRcdFx0cmV0dXJuIHMuc3BsaXQoJycpO1xuXHRcdH1cblx0fSxcblx0c3VtOiB7XG5cdFx0bm9ybWFsU3VtOiBmdW5jdGlvbihoYW5kbGVkU3RyLCBwZXNvcykge1xuXHRcdFx0dmFyIG51bXMgPSBoYW5kbGVkU3RyO1xuXHRcdFx0dmFyIHN1bSA9IDA7XG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHBlc29zLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdHN1bSArPSBwYXJzZUludChudW1zW2ldKSAqIHBlc29zW2ldO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIHN1bTtcblx0XHR9LFxuXHRcdGluZGl2aWR1YWxTdW06IGZ1bmN0aW9uKGhhbmRsZWRTdHIsIHBlc29zKSB7XG5cdFx0XHR2YXIgbnVtcyA9IGhhbmRsZWRTdHI7XG5cdFx0XHR2YXIgc3VtID0gMDtcblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgcGVzb3MubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0dmFyIG11bHQgPSBwYXJzZUludChudW1zW2ldKSAqIHBlc29zW2ldO1xuXHRcdFx0XHRzdW0gKz0gbXVsdCUxMCArIHBhcnNlSW50KG11bHQvMTApO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIHN1bTtcblx0XHR9LFxuXHRcdGFwU3BlYzogZnVuY3Rpb24oaGFuZGxlZFN0ciwgcGVzb3MpIHtcblx0XHRcdHZhciBzdW0gPSB0aGlzLm5vcm1hbFN1bShoYW5kbGVkU3RyLCBwZXNvcyk7XG5cdFx0XHR2YXIgcmVmID0gaGFuZGxlZFN0ci5qb2luKCcnKTtcblx0XHRcdGlmIChyZWYgPj0gJzAzMDAwMDAxMCcgJiYgcmVmIDw9ICcwMzAxNzAwMDknKSB7XG5cdFx0XHRcdHJldHVybiBzdW0gKyA1O1xuXHRcdFx0fVxuXHRcdFx0aWYgKHJlZiA+PSAnMDMwMTcwMDEwJyAmJiByZWYgPD0gJzAzMDE5MDIyOScpIHtcblx0XHRcdFx0cmV0dXJuIHN1bSArIDk7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gc3VtO1xuXHRcdH1cblx0fSxcblx0cmVzdDoge1xuXHRcdG1vZDExOiBmdW5jdGlvbihzdW0pIHtcblx0XHRcdHJldHVybiBzdW0lMTE7XG5cdFx0fSxcblx0XHRtb2QxMDogZnVuY3Rpb24oc3VtKSB7XG5cdFx0XHRyZXR1cm4gc3VtJTEwO1xuXHRcdH0sXG5cdFx0bW9kOTogZnVuY3Rpb24oc3VtKSB7XG5cdFx0XHRyZXR1cm4gc3VtJTk7XG5cdFx0fVxuXHR9LFxuXHRleHBlY3RlZERWOiB7XG5cdFx0bWludXNSZXN0T2YxMTogZnVuY3Rpb24ocmVzdCkge1xuXHRcdFx0cmV0dXJuIHJlc3QgPCAyID8gMCA6IDExIC0gcmVzdDtcblx0XHR9LFxuXHRcdG1pbnVzUmVzdE9mMTF2MjogZnVuY3Rpb24ocmVzdCkge1xuXHRcdFx0cmV0dXJuIHJlc3QgPCAyID8gMTEgLSByZXN0IC0gMTAgOiAxMSAtIHJlc3Q7XG5cdFx0fSxcblx0XHRtaW51c1Jlc3RPZjEwOiBmdW5jdGlvbihyZXN0KSB7XG5cdFx0XHRyZXR1cm4gcmVzdCA8IDEgPyAwIDogMTAgLSByZXN0O1xuXHRcdH0sXG5cdFx0bW9kMTA6IGZ1bmN0aW9uKHJlc3QpIHtcblx0XHRcdHJldHVybiByZXN0JTEwO1xuXHRcdH0sXG5cdFx0Z29TcGVjOiBmdW5jdGlvbihyZXN0LCBoYW5kbGVkU3RyKSB7XG5cdFx0XHR2YXIgcmVmID0gaGFuZGxlZFN0ci5qb2luKCcnKTtcblx0XHRcdGlmIChyZXN0ID09PSAxKSB7XG5cdFx0XHRcdHJldHVybiByZWYgPj0gJzEwMTAzMTA1MCcgJiYgcmVmIDw9ICcxMDExOTk5NzknID8gMSA6IDA7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gcmVzdCA9PT0gMCA/IDAgOiAxMSAtIHJlc3Q7XG5cdFx0fSxcblx0XHRhcFNwZWM6IGZ1bmN0aW9uKHJlc3QsIGhhbmRsZWRTdHIpIHtcblx0XHRcdHZhciByZWYgPSBoYW5kbGVkU3RyLmpvaW4oJycpO1xuXHRcdFx0aWYgKHJlc3QgPT09IDApIHtcblx0XHRcdFx0cmV0dXJuIHJlZiA+PSAnMDMwMTcwMDEwJyAmJiByZWYgPD0gJzAzMDE5MDIyOScgPyAxIDogMDtcblx0XHRcdH1cblx0XHRcdHJldHVybiByZXN0ID09PSAxID8gMCA6IDExIC0gcmVzdDtcblx0XHR9LFxuXHRcdHZvaWRGbjogZnVuY3Rpb24ocmVzdCkge1xuXHRcdFx0cmV0dXJuIHJlc3Q7XG5cdFx0fVxuXHR9XG59O1xuXG5cbi8qKlxuICogb3B0aW9ucyB7XG4gKiAgICAgcGVzb3M6IEFycmF5IG9mIHZhbHVlcyB1c2VkIHRvIG9wZXJhdGUgaW4gc3VtIHN0ZXBcbiAqICAgICBkdlBvczogUG9zaXRpb24gb2YgdGhlIERWIHRvIHZhbGlkYXRlIGNvbnNpZGVyaW5nIHRoZSBoYW5kbGVkU3RyXG4gKiAgICAgYWxnb3JpdGhtU3RlcHM6IFRoZSBmb3VyIERWJ3MgdmFsaWRhdGlvbiBhbGdvcml0aG0gc3RlcHMgbmFtZXNcbiAqIH1cbiAqL1xuZnVuY3Rpb24gdmFsaWRhdGVEVih2YWx1ZSwgb3B0aW9ucykge1xuXHR2YXIgc3RlcHMgPSBvcHRpb25zLmFsZ29yaXRobVN0ZXBzO1xuXG5cdC8vIFN0ZXAgMDE6IEhhbmRsZSBTdHJpbmdcblx0dmFyIGhhbmRsZWRTdHIgPSBhbGdvcml0aG1TdGVwcy5oYW5kbGVTdHJbc3RlcHNbMF1dKHZhbHVlKTtcblxuXHQvLyBTdGVwIDAyOiBTdW0gY2hhcnNcblx0dmFyIHN1bSA9IGFsZ29yaXRobVN0ZXBzLnN1bVtzdGVwc1sxXV0oaGFuZGxlZFN0ciwgb3B0aW9ucy5wZXNvcyk7XG5cblx0Ly8gU3RlcCAwMzogUmVzdCBjYWxjdWxhdGlvblxuXHR2YXIgcmVzdCA9IGFsZ29yaXRobVN0ZXBzLnJlc3Rbc3RlcHNbMl1dKHN1bSk7XG5cblx0Ly8gRml4ZWQgU3RlcDogR2V0IGN1cnJlbnQgRFZcblx0dmFyIGN1cnJlbnREViA9IHBhcnNlSW50KGhhbmRsZWRTdHJbb3B0aW9ucy5kdnBvc10pO1xuXG5cdC8vIFN0ZXAgMDQ6IEV4cGVjdGVkIERWIGNhbGN1bGF0aW9uXG5cdHZhciBleHBlY3RlZERWID0gYWxnb3JpdGhtU3RlcHMuZXhwZWN0ZWREVltzdGVwc1szXV0ocmVzdCwgaGFuZGxlZFN0cik7XG5cblx0Ly8gRml4ZWQgc3RlcDogRFYgdmVyaWZpY2F0aW9uXG5cdHJldHVybiBjdXJyZW50RFYgPT09IGV4cGVjdGVkRFY7XG59XG5cbmZ1bmN0aW9uIHZhbGlkYXRlSUUodmFsdWUsIHJ1bGUpIHtcblx0aWYgKHJ1bGUubWF0Y2ggJiYgIXJ1bGUubWF0Y2gudGVzdCh2YWx1ZSkpIHtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblx0Zm9yICh2YXIgaSA9IDA7IGkgPCBydWxlLmR2cy5sZW5ndGg7IGkrKykge1xuXHRcdC8vIGNvbnNvbGUubG9nKCc+PiA+PiBkdicraSk7XG5cdFx0aWYgKCF2YWxpZGF0ZURWKHZhbHVlLCBydWxlLmR2c1tpXSkpIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cdH1cblx0cmV0dXJuIHRydWU7XG59XG5cbklFcnVsZXMuUEUgPSBbe1xuXHQvL21hc2s6IG5ldyBTdHJpbmdNYXNrKCcwMDAwMDAwLTAwJyksXG5cdGNoYXJzOiA5LFxuXHRkdnM6IFt7XG5cdFx0ZHZwb3M6IDcsXG5cdFx0cGVzb3M6IFs4LDcsNiw1LDQsMywyXSxcblx0XHRhbGdvcml0aG1TdGVwczogWydvbmx5TnVtYmVycycsICdub3JtYWxTdW0nLCAnbW9kMTEnLCAnbWludXNSZXN0T2YxMSddXG5cdH0se1xuXHRcdGR2cG9zOiA4LFxuXHRcdHBlc29zOiBbOSw4LDcsNiw1LDQsMywyXSxcblx0XHRhbGdvcml0aG1TdGVwczogWydvbmx5TnVtYmVycycsICdub3JtYWxTdW0nLCAnbW9kMTEnLCAnbWludXNSZXN0T2YxMSddXG5cdH1dLFxuXHR2YWxpZGF0ZTogZnVuY3Rpb24odmFsdWUpIHsgcmV0dXJuIHZhbGlkYXRlSUUodmFsdWUsIHRoaXMpOyB9XG59LHtcblx0Ly8gbWFzazogbmV3IFN0cmluZ01hc2soJzAwLjAuMDAwLjAwMDAwMDAtMCcpLFxuXHRjaGFyczogMTQsXG5cdHBlc29zOiBbWzEsMiwzLDQsNSw5LDgsNyw2LDUsNCwzLDJdXSxcblx0ZHZzOiBbe1xuXHRcdGR2cG9zOiAxMyxcblx0XHRwZXNvczogWzUsNCwzLDIsMSw5LDgsNyw2LDUsNCwzLDJdLFxuXHRcdGFsZ29yaXRobVN0ZXBzOiBbJ29ubHlOdW1iZXJzJywgJ25vcm1hbFN1bScsICdtb2QxMScsICdtaW51c1Jlc3RPZjExdjInXVxuXHR9XSxcblx0dmFsaWRhdGU6IGZ1bmN0aW9uKHZhbHVlKSB7IHJldHVybiB2YWxpZGF0ZUlFKHZhbHVlLCB0aGlzKTsgfVxufV07XG5cbklFcnVsZXMuUlMgPSBbe1xuXHQvLyBtYXNrOiBuZXcgU3RyaW5nTWFzaygnMDAwLzAwMDAwMDAnKSxcblx0Y2hhcnM6IDEwLFxuXHRkdnM6IFt7XG5cdFx0ZHZwb3M6IDksXG5cdFx0cGVzb3M6IFsyLDksOCw3LDYsNSw0LDMsMl0sXG5cdFx0YWxnb3JpdGhtU3RlcHM6IFsnb25seU51bWJlcnMnLCAnbm9ybWFsU3VtJywgJ21vZDExJywgJ21pbnVzUmVzdE9mMTEnXVxuXHR9XSxcblx0dmFsaWRhdGU6IGZ1bmN0aW9uKHZhbHVlKSB7IHJldHVybiB2YWxpZGF0ZUlFKHZhbHVlLCB0aGlzKTsgfVxufV07XG5cbklFcnVsZXMuQUMgPSBbe1xuXHQvLyBtYXNrOiBuZXcgU3RyaW5nTWFzaygnMDAuMDAwLjAwMC8wMDAtMDAnKSxcblx0Y2hhcnM6IDEzLFxuXHRtYXRjaDogL14wMS8sXG5cdGR2czogW3tcblx0XHRkdnBvczogMTEsXG5cdFx0cGVzb3M6IFs0LDMsMiw5LDgsNyw2LDUsNCwzLDJdLFxuXHRcdGFsZ29yaXRobVN0ZXBzOiBbJ29ubHlOdW1iZXJzJywgJ25vcm1hbFN1bScsICdtb2QxMScsICdtaW51c1Jlc3RPZjExJ11cblx0fSx7XG5cdFx0ZHZwb3M6IDEyLFxuXHRcdHBlc29zOiBbNSw0LDMsMiw5LDgsNyw2LDUsNCwzLDJdLFxuXHRcdGFsZ29yaXRobVN0ZXBzOiBbJ29ubHlOdW1iZXJzJywgJ25vcm1hbFN1bScsICdtb2QxMScsICdtaW51c1Jlc3RPZjExJ11cblx0fV0sXG5cdHZhbGlkYXRlOiBmdW5jdGlvbih2YWx1ZSkgeyByZXR1cm4gdmFsaWRhdGVJRSh2YWx1ZSwgdGhpcyk7IH1cbn1dO1xuXG5JRXJ1bGVzLk1HID0gW3tcblx0Ly8gbWFzazogbmV3IFN0cmluZ01hc2soJzAwMC4wMDAuMDAwLzAwMDAnKSxcblx0Y2hhcnM6IDEzLFxuXHRkdnM6IFt7XG5cdFx0ZHZwb3M6IDEyLFxuXHRcdHBlc29zOiBbMSwyLDEsMiwxLDIsMSwyLDEsMiwxLDJdLFxuXHRcdGFsZ29yaXRobVN0ZXBzOiBbJ21nU3BlYycsICdpbmRpdmlkdWFsU3VtJywgJ21vZDEwJywgJ21pbnVzUmVzdE9mMTAnXVxuXHR9LHtcblx0XHRkdnBvczogMTIsXG5cdFx0cGVzb3M6IFszLDIsMTEsMTAsOSw4LDcsNiw1LDQsMywyXSxcblx0XHRhbGdvcml0aG1TdGVwczogWydvbmx5TnVtYmVycycsICdub3JtYWxTdW0nLCAnbW9kMTEnLCAnbWludXNSZXN0T2YxMSddXG5cdH1dLFxuXHR2YWxpZGF0ZTogZnVuY3Rpb24odmFsdWUpIHsgcmV0dXJuIHZhbGlkYXRlSUUodmFsdWUsIHRoaXMpOyB9XG59XTtcblxuSUVydWxlcy5TUCA9IFt7XG5cdC8vIG1hc2s6IG5ldyBTdHJpbmdNYXNrKCcwMDAuMDAwLjAwMC4wMDAnKSxcblx0Y2hhcnM6IDEyLFxuXHRtYXRjaDogL15bMC05XS8sXG5cdGR2czogW3tcblx0XHRkdnBvczogOCxcblx0XHRwZXNvczogWzEsMyw0LDUsNiw3LDgsMTBdLFxuXHRcdGFsZ29yaXRobVN0ZXBzOiBbJ29ubHlOdW1iZXJzJywgJ25vcm1hbFN1bScsICdtb2QxMScsICdtb2QxMCddXG5cdH0se1xuXHRcdGR2cG9zOiAxMSxcblx0XHRwZXNvczogWzMsMiwxMCw5LDgsNyw2LDUsNCwzLDJdLFxuXHRcdGFsZ29yaXRobVN0ZXBzOiBbJ29ubHlOdW1iZXJzJywgJ25vcm1hbFN1bScsICdtb2QxMScsICdtb2QxMCddXG5cdH1dLFxuXHR2YWxpZGF0ZTogZnVuY3Rpb24odmFsdWUpIHsgcmV0dXJuIHZhbGlkYXRlSUUodmFsdWUsIHRoaXMpOyB9XG59LHtcblx0Ly8gbWFzazogbmV3IFN0cmluZ01hc2soJ1AtMDAwMDAwMDAuMC8wMDAnKVxuXHRjaGFyczogMTIsXG5cdG1hdGNoOiAvXlAvaSxcblx0ZHZzOiBbe1xuXHRcdGR2cG9zOiA4LFxuXHRcdHBlc29zOiBbMSwzLDQsNSw2LDcsOCwxMF0sXG5cdFx0YWxnb3JpdGhtU3RlcHM6IFsnb25seU51bWJlcnMnLCAnbm9ybWFsU3VtJywgJ21vZDExJywgJ21vZDEwJ11cblx0fV0sXG5cdHZhbGlkYXRlOiBmdW5jdGlvbih2YWx1ZSkgeyByZXR1cm4gdmFsaWRhdGVJRSh2YWx1ZSwgdGhpcyk7IH1cbn1dO1xuXG5JRXJ1bGVzLkRGID0gW3tcblx0Ly8gbWFzazogbmV3IFN0cmluZ01hc2soJzAwMDAwMDAwMDAwLTAwJyksXG5cdGNoYXJzOiAxMyxcblx0ZHZzOiBbe1xuXHRcdGR2cG9zOiAxMSxcblx0XHRwZXNvczogWzQsMywyLDksOCw3LDYsNSw0LDMsMl0sXG5cdFx0YWxnb3JpdGhtU3RlcHM6IFsnb25seU51bWJlcnMnLCAnbm9ybWFsU3VtJywgJ21vZDExJywgJ21pbnVzUmVzdE9mMTEnXVxuXHR9LHtcblx0XHRkdnBvczogMTIsXG5cdFx0cGVzb3M6IFs1LDQsMywyLDksOCw3LDYsNSw0LDMsMl0sXG5cdFx0YWxnb3JpdGhtU3RlcHM6IFsnb25seU51bWJlcnMnLCAnbm9ybWFsU3VtJywgJ21vZDExJywgJ21pbnVzUmVzdE9mMTEnXVxuXHR9XSxcblx0dmFsaWRhdGU6IGZ1bmN0aW9uKHZhbHVlKSB7IHJldHVybiB2YWxpZGF0ZUlFKHZhbHVlLCB0aGlzKTsgfVxufV07XG5cbklFcnVsZXMuRVMgPSBbe1xuXHQvLyBtYXNrOiBuZXcgU3RyaW5nTWFzaygnMDAwLjAwMC4wMC0wJylcblx0Y2hhcnM6IDksXG5cdGR2czogW3tcblx0XHRkdnBvczogOCxcblx0XHRwZXNvczogWzksOCw3LDYsNSw0LDMsMl0sXG5cdFx0YWxnb3JpdGhtU3RlcHM6IFsnb25seU51bWJlcnMnLCAnbm9ybWFsU3VtJywgJ21vZDExJywgJ21pbnVzUmVzdE9mMTEnXVxuXHR9XSxcblx0dmFsaWRhdGU6IGZ1bmN0aW9uKHZhbHVlKSB7IHJldHVybiB2YWxpZGF0ZUlFKHZhbHVlLCB0aGlzKTsgfVxufV07XG5cbklFcnVsZXMuQkEgPSBbe1xuXHQvLyBtYXNrOiBuZXcgU3RyaW5nTWFzaygnMDAwMDAwLTAwJylcblx0Y2hhcnM6IDgsXG5cdG1hdGNoOiAvXlswMTIzNDU4XS8sXG5cdGR2czogW3tcblx0XHRkdnBvczogNyxcblx0XHRwZXNvczogWzcsNiw1LDQsMywyXSxcblx0XHRhbGdvcml0aG1TdGVwczogWydvbmx5TnVtYmVycycsICdub3JtYWxTdW0nLCAnbW9kMTAnLCAnbWludXNSZXN0T2YxMCddXG5cdH0se1xuXHRcdGR2cG9zOiA2LFxuXHRcdHBlc29zOiBbOCw3LDYsNSw0LDMsMCwyXSxcblx0XHRhbGdvcml0aG1TdGVwczogWydvbmx5TnVtYmVycycsICdub3JtYWxTdW0nLCAnbW9kMTAnLCAnbWludXNSZXN0T2YxMCddXG5cdH1dLFxuXHR2YWxpZGF0ZTogZnVuY3Rpb24odmFsdWUpIHsgcmV0dXJuIHZhbGlkYXRlSUUodmFsdWUsIHRoaXMpOyB9XG59LHtcblx0Y2hhcnM6IDgsXG5cdG1hdGNoOiAvXls2NzldLyxcblx0ZHZzOiBbe1xuXHRcdGR2cG9zOiA3LFxuXHRcdHBlc29zOiBbNyw2LDUsNCwzLDJdLFxuXHRcdGFsZ29yaXRobVN0ZXBzOiBbJ29ubHlOdW1iZXJzJywgJ25vcm1hbFN1bScsICdtb2QxMScsICdtaW51c1Jlc3RPZjExJ11cblx0fSx7XG5cdFx0ZHZwb3M6IDYsXG5cdFx0cGVzb3M6IFs4LDcsNiw1LDQsMywwLDJdLFxuXHRcdGFsZ29yaXRobVN0ZXBzOiBbJ29ubHlOdW1iZXJzJywgJ25vcm1hbFN1bScsICdtb2QxMScsICdtaW51c1Jlc3RPZjExJ11cblx0fV0sXG5cdHZhbGlkYXRlOiBmdW5jdGlvbih2YWx1ZSkgeyByZXR1cm4gdmFsaWRhdGVJRSh2YWx1ZSwgdGhpcyk7IH1cbn0se1xuXHQvLyBtYXNrOiBuZXcgU3RyaW5nTWFzaygnMDAwMDAwMC0wMCcpXG5cdGNoYXJzOiA5LFxuXHRtYXRjaDogL15bMC05XVswMTIzNDU4XS8sXG5cdGR2czogW3tcblx0XHRkdnBvczogOCxcblx0XHRwZXNvczogWzgsNyw2LDUsNCwzLDJdLFxuXHRcdGFsZ29yaXRobVN0ZXBzOiBbJ29ubHlOdW1iZXJzJywgJ25vcm1hbFN1bScsICdtb2QxMCcsICdtaW51c1Jlc3RPZjEwJ11cblx0fSx7XG5cdFx0ZHZwb3M6IDcsXG5cdFx0cGVzb3M6IFs5LDgsNyw2LDUsNCwzLDAsMl0sXG5cdFx0YWxnb3JpdGhtU3RlcHM6IFsnb25seU51bWJlcnMnLCAnbm9ybWFsU3VtJywgJ21vZDEwJywgJ21pbnVzUmVzdE9mMTAnXVxuXHR9XSxcblx0dmFsaWRhdGU6IGZ1bmN0aW9uKHZhbHVlKSB7IHJldHVybiB2YWxpZGF0ZUlFKHZhbHVlLCB0aGlzKTsgfVxufSx7XG5cdGNoYXJzOiA5LFxuXHRtYXRjaDogL15bMC05XVs2NzldLyxcblx0ZHZzOiBbe1xuXHRcdGR2cG9zOiA4LFxuXHRcdHBlc29zOiBbOCw3LDYsNSw0LDMsMl0sXG5cdFx0YWxnb3JpdGhtU3RlcHM6IFsnb25seU51bWJlcnMnLCAnbm9ybWFsU3VtJywgJ21vZDExJywgJ21pbnVzUmVzdE9mMTEnXVxuXHR9LHtcblx0XHRkdnBvczogNyxcblx0XHRwZXNvczogWzksOCw3LDYsNSw0LDMsMCwyXSxcblx0XHRhbGdvcml0aG1TdGVwczogWydvbmx5TnVtYmVycycsICdub3JtYWxTdW0nLCAnbW9kMTEnLCAnbWludXNSZXN0T2YxMSddXG5cdH1dLFxuXHR2YWxpZGF0ZTogZnVuY3Rpb24odmFsdWUpIHsgcmV0dXJuIHZhbGlkYXRlSUUodmFsdWUsIHRoaXMpOyB9XG59XTtcblxuSUVydWxlcy5BTSA9IFt7XG5cdC8vbWFzazogbmV3IFN0cmluZ01hc2soJzAwLjAwMC4wMDAtMCcpXG5cdGNoYXJzOiA5LFxuXHRkdnM6IFt7XG5cdFx0ZHZwb3M6IDgsXG5cdFx0cGVzb3M6IFs5LDgsNyw2LDUsNCwzLDJdLFxuXHRcdGFsZ29yaXRobVN0ZXBzOiBbJ29ubHlOdW1iZXJzJywgJ25vcm1hbFN1bScsICdtb2QxMScsICdtaW51c1Jlc3RPZjExJ11cblx0fV0sXG5cdHZhbGlkYXRlOiBmdW5jdGlvbih2YWx1ZSkgeyByZXR1cm4gdmFsaWRhdGVJRSh2YWx1ZSwgdGhpcyk7IH1cbn1dO1xuXG5JRXJ1bGVzLlJOID0gW3tcblx0Ly8ge21hc2s6IG5ldyBTdHJpbmdNYXNrKCcwMC4wMDAuMDAwLTAnKVxuXHRjaGFyczogOSxcblx0bWF0Y2g6IC9eMjAvLFxuXHRkdnM6IFt7XG5cdFx0ZHZwb3M6IDgsXG5cdFx0cGVzb3M6IFs5LDgsNyw2LDUsNCwzLDJdLFxuXHRcdGFsZ29yaXRobVN0ZXBzOiBbJ29ubHlOdW1iZXJzJywgJ25vcm1hbFN1bScsICdtb2QxMScsICdtaW51c1Jlc3RPZjExJ11cblx0fV0sXG5cdHZhbGlkYXRlOiBmdW5jdGlvbih2YWx1ZSkgeyByZXR1cm4gdmFsaWRhdGVJRSh2YWx1ZSwgdGhpcyk7IH1cbn0se1xuXHQvLyB7bWFzazogbmV3IFN0cmluZ01hc2soJzAwLjAuMDAwLjAwMC0wJyksIGNoYXJzOiAxMH1cblx0Y2hhcnM6IDEwLFxuXHRtYXRjaDogL14yMC8sXG5cdGR2czogW3tcblx0XHRkdnBvczogOCxcblx0XHRwZXNvczogWzEwLDksOCw3LDYsNSw0LDMsMl0sXG5cdFx0YWxnb3JpdGhtU3RlcHM6IFsnb25seU51bWJlcnMnLCAnbm9ybWFsU3VtJywgJ21vZDExJywgJ21pbnVzUmVzdE9mMTEnXVxuXHR9XSxcblx0dmFsaWRhdGU6IGZ1bmN0aW9uKHZhbHVlKSB7IHJldHVybiB2YWxpZGF0ZUlFKHZhbHVlLCB0aGlzKTsgfVxufV07XG5cbklFcnVsZXMuUk8gPSBbe1xuXHQvLyBtYXNrOiBuZXcgU3RyaW5nTWFzaygnMDAwMDAwMDAwMDAwMC0wJylcblx0Y2hhcnM6IDE0LFxuXHRkdnM6IFt7XG5cdFx0ZHZwb3M6IDEzLFxuXHRcdHBlc29zOiBbNiw1LDQsMywyLDksOCw3LDYsNSw0LDMsMl0sXG5cdFx0YWxnb3JpdGhtU3RlcHM6IFsnb25seU51bWJlcnMnLCAnbm9ybWFsU3VtJywgJ21vZDExJywgJ21pbnVzUmVzdE9mMTEnXVxuXHR9XSxcblx0dmFsaWRhdGU6IGZ1bmN0aW9uKHZhbHVlKSB7IHJldHVybiB2YWxpZGF0ZUlFKHZhbHVlLCB0aGlzKTsgfVxufV07XG5cbklFcnVsZXMuUFIgPSBbe1xuXHQvLyBtYXNrOiBuZXcgU3RyaW5nTWFzaygnMDAwMDAwMDAtMDAnKVxuXHRjaGFyczogMTAsXG5cdGR2czogW3tcblx0XHRkdnBvczogOCxcblx0XHRwZXNvczogWzMsMiw3LDYsNSw0LDMsMl0sXG5cdFx0YWxnb3JpdGhtU3RlcHM6IFsnb25seU51bWJlcnMnLCAnbm9ybWFsU3VtJywgJ21vZDExJywgJ21pbnVzUmVzdE9mMTEnXVxuXHR9LHtcblx0XHRkdnBvczogOSxcblx0XHRwZXNvczogWzQsMywyLDcsNiw1LDQsMywyXSxcblx0XHRhbGdvcml0aG1TdGVwczogWydvbmx5TnVtYmVycycsICdub3JtYWxTdW0nLCAnbW9kMTEnLCAnbWludXNSZXN0T2YxMSddXG5cdH1dLFxuXHR2YWxpZGF0ZTogZnVuY3Rpb24odmFsdWUpIHsgcmV0dXJuIHZhbGlkYXRlSUUodmFsdWUsIHRoaXMpOyB9XG59XTtcblxuSUVydWxlcy5TQyA9IFt7XG5cdC8vIHttYXNrOiBuZXcgU3RyaW5nTWFzaygnMDAwLjAwMC4wMDAnKSwgdWY6ICdTQU5UQSBDQVRBUklOQSd9XG5cdGNoYXJzOiA5LFxuXHRkdnM6IFt7XG5cdFx0ZHZwb3M6IDgsXG5cdFx0cGVzb3M6IFs5LDgsNyw2LDUsNCwzLDJdLFxuXHRcdGFsZ29yaXRobVN0ZXBzOiBbJ29ubHlOdW1iZXJzJywgJ25vcm1hbFN1bScsICdtb2QxMScsICdtaW51c1Jlc3RPZjExJ11cblx0fV0sXG5cdHZhbGlkYXRlOiBmdW5jdGlvbih2YWx1ZSkgeyByZXR1cm4gdmFsaWRhdGVJRSh2YWx1ZSwgdGhpcyk7IH1cbn1dO1xuXG5JRXJ1bGVzLlJKID0gW3tcblx0Ly8ge21hc2s6IG5ldyBTdHJpbmdNYXNrKCcwMC4wMDAuMDAtMCcpLCB1ZjogJ1JJTyBERSBKQU5FSVJPJ31cblx0Y2hhcnM6IDgsXG5cdGR2czogW3tcblx0XHRkdnBvczogNyxcblx0XHRwZXNvczogWzIsNyw2LDUsNCwzLDJdLFxuXHRcdGFsZ29yaXRobVN0ZXBzOiBbJ29ubHlOdW1iZXJzJywgJ25vcm1hbFN1bScsICdtb2QxMScsICdtaW51c1Jlc3RPZjExJ11cblx0fV0sXG5cdHZhbGlkYXRlOiBmdW5jdGlvbih2YWx1ZSkgeyByZXR1cm4gdmFsaWRhdGVJRSh2YWx1ZSwgdGhpcyk7IH1cbn1dO1xuXG5JRXJ1bGVzLlBBID0gW3tcblx0Ly8ge21hc2s6IG5ldyBTdHJpbmdNYXNrKCcwMC0wMDAwMDAtMCcpXG5cdGNoYXJzOiA5LFxuXHRtYXRjaDogL14xNS8sXG5cdGR2czogW3tcblx0XHRkdnBvczogOCxcblx0XHRwZXNvczogWzksOCw3LDYsNSw0LDMsMl0sXG5cdFx0YWxnb3JpdGhtU3RlcHM6IFsnb25seU51bWJlcnMnLCAnbm9ybWFsU3VtJywgJ21vZDExJywgJ21pbnVzUmVzdE9mMTEnXVxuXHR9XSxcblx0dmFsaWRhdGU6IGZ1bmN0aW9uKHZhbHVlKSB7IHJldHVybiB2YWxpZGF0ZUlFKHZhbHVlLCB0aGlzKTsgfVxufV07XG5cbklFcnVsZXMuU0UgPSBbe1xuXHQvLyB7bWFzazogbmV3IFN0cmluZ01hc2soJzAwMDAwMDAwLTAnKVxuXHRjaGFyczogOSxcblx0ZHZzOiBbe1xuXHRcdGR2cG9zOiA4LFxuXHRcdHBlc29zOiBbOSw4LDcsNiw1LDQsMywyXSxcblx0XHRhbGdvcml0aG1TdGVwczogWydvbmx5TnVtYmVycycsICdub3JtYWxTdW0nLCAnbW9kMTEnLCAnbWludXNSZXN0T2YxMSddXG5cdH1dLFxuXHR2YWxpZGF0ZTogZnVuY3Rpb24odmFsdWUpIHsgcmV0dXJuIHZhbGlkYXRlSUUodmFsdWUsIHRoaXMpOyB9XG59XTtcblxuSUVydWxlcy5QQiA9IFt7XG5cdC8vIHttYXNrOiBuZXcgU3RyaW5nTWFzaygnMDAwMDAwMDAtMCcpXG5cdGNoYXJzOiA5LFxuXHRkdnM6IFt7XG5cdFx0ZHZwb3M6IDgsXG5cdFx0cGVzb3M6IFs5LDgsNyw2LDUsNCwzLDJdLFxuXHRcdGFsZ29yaXRobVN0ZXBzOiBbJ29ubHlOdW1iZXJzJywgJ25vcm1hbFN1bScsICdtb2QxMScsICdtaW51c1Jlc3RPZjExJ11cblx0fV0sXG5cdHZhbGlkYXRlOiBmdW5jdGlvbih2YWx1ZSkgeyByZXR1cm4gdmFsaWRhdGVJRSh2YWx1ZSwgdGhpcyk7IH1cbn1dO1xuXG5JRXJ1bGVzLkNFID0gW3tcblx0Ly8ge21hc2s6IG5ldyBTdHJpbmdNYXNrKCcwMDAwMDAwMC0wJylcblx0Y2hhcnM6IDksXG5cdGR2czogW3tcblx0XHRkdnBvczogOCxcblx0XHRwZXNvczogWzksOCw3LDYsNSw0LDMsMl0sXG5cdFx0YWxnb3JpdGhtU3RlcHM6IFsnb25seU51bWJlcnMnLCAnbm9ybWFsU3VtJywgJ21vZDExJywgJ21pbnVzUmVzdE9mMTEnXVxuXHR9XSxcblx0dmFsaWRhdGU6IGZ1bmN0aW9uKHZhbHVlKSB7IHJldHVybiB2YWxpZGF0ZUlFKHZhbHVlLCB0aGlzKTsgfVxufV07XG5cbklFcnVsZXMuUEkgPSBbe1xuXHQvLyB7bWFzazogbmV3IFN0cmluZ01hc2soJzAwMDAwMDAwMCcpXG5cdGNoYXJzOiA5LFxuXHRkdnM6IFt7XG5cdFx0ZHZwb3M6IDgsXG5cdFx0cGVzb3M6IFs5LDgsNyw2LDUsNCwzLDJdLFxuXHRcdGFsZ29yaXRobVN0ZXBzOiBbJ29ubHlOdW1iZXJzJywgJ25vcm1hbFN1bScsICdtb2QxMScsICdtaW51c1Jlc3RPZjExJ11cblx0fV0sXG5cdHZhbGlkYXRlOiBmdW5jdGlvbih2YWx1ZSkgeyByZXR1cm4gdmFsaWRhdGVJRSh2YWx1ZSwgdGhpcyk7IH1cbn1dO1xuXG5JRXJ1bGVzLk1BID0gW3tcblx0Ly8ge21hc2s6IG5ldyBTdHJpbmdNYXNrKCcwMDAwMDAwMDAnKVxuXHRjaGFyczogOSxcblx0bWF0Y2g6IC9eMTIvLFxuXHRkdnM6IFt7XG5cdFx0ZHZwb3M6IDgsXG5cdFx0cGVzb3M6IFs5LDgsNyw2LDUsNCwzLDJdLFxuXHRcdGFsZ29yaXRobVN0ZXBzOiBbJ29ubHlOdW1iZXJzJywgJ25vcm1hbFN1bScsICdtb2QxMScsICdtaW51c1Jlc3RPZjExJ11cblx0fV0sXG5cdHZhbGlkYXRlOiBmdW5jdGlvbih2YWx1ZSkgeyByZXR1cm4gdmFsaWRhdGVJRSh2YWx1ZSwgdGhpcyk7IH1cbn1dO1xuXG5JRXJ1bGVzLk1UID0gW3tcblx0Ly8ge21hc2s6IG5ldyBTdHJpbmdNYXNrKCcwMDAwMDAwMDAwLTAnKVxuXHRjaGFyczogMTEsXG5cdGR2czogW3tcblx0XHRkdnBvczogMTAsXG5cdFx0cGVzb3M6IFszLDIsOSw4LDcsNiw1LDQsMywyXSxcblx0XHRhbGdvcml0aG1TdGVwczogWydvbmx5TnVtYmVycycsICdub3JtYWxTdW0nLCAnbW9kMTEnLCAnbWludXNSZXN0T2YxMSddXG5cdH1dLFxuXHR2YWxpZGF0ZTogZnVuY3Rpb24odmFsdWUpIHsgcmV0dXJuIHZhbGlkYXRlSUUodmFsdWUsIHRoaXMpOyB9XG59XTtcblxuSUVydWxlcy5NUyA9IFt7XG5cdC8vIHttYXNrOiBuZXcgU3RyaW5nTWFzaygnMDAwMDAwMDAwJylcblx0Y2hhcnM6IDksXG5cdG1hdGNoOiAvXjI4Lyxcblx0ZHZzOiBbe1xuXHRcdGR2cG9zOiA4LFxuXHRcdHBlc29zOiBbOSw4LDcsNiw1LDQsMywyXSxcblx0XHRhbGdvcml0aG1TdGVwczogWydvbmx5TnVtYmVycycsICdub3JtYWxTdW0nLCAnbW9kMTEnLCAnbWludXNSZXN0T2YxMSddXG5cdH1dLFxuXHR2YWxpZGF0ZTogZnVuY3Rpb24odmFsdWUpIHsgcmV0dXJuIHZhbGlkYXRlSUUodmFsdWUsIHRoaXMpOyB9XG59XTtcblxuSUVydWxlcy5UTyA9IFt7XG5cdC8vIHttYXNrOiBuZXcgU3RyaW5nTWFzaygnMDAwMDAwMDAwMDAnKSxcblx0Y2hhcnM6IDExLFxuXHRtYXRjaDogL15bMC05XXsyfSgoMFsxMjNdKXwoOTkpKS8sXG5cdGR2czogW3tcblx0XHRkdnBvczogMTAsXG5cdFx0cGVzb3M6IFs5LDgsMCwwLDcsNiw1LDQsMywyXSxcblx0XHRhbGdvcml0aG1TdGVwczogWydvbmx5TnVtYmVycycsICdub3JtYWxTdW0nLCAnbW9kMTEnLCAnbWludXNSZXN0T2YxMSddXG5cdH1dLFxuXHR2YWxpZGF0ZTogZnVuY3Rpb24odmFsdWUpIHsgcmV0dXJuIHZhbGlkYXRlSUUodmFsdWUsIHRoaXMpOyB9XG59XTtcblxuSUVydWxlcy5BTCA9IFt7XG5cdC8vIHttYXNrOiBuZXcgU3RyaW5nTWFzaygnMDAwMDAwMDAwJylcblx0Y2hhcnM6IDksXG5cdG1hdGNoOiAvXjI0WzAzNTc4XS8sXG5cdGR2czogW3tcblx0XHRkdnBvczogOCxcblx0XHRwZXNvczogWzksOCw3LDYsNSw0LDMsMl0sXG5cdFx0YWxnb3JpdGhtU3RlcHM6IFsnb25seU51bWJlcnMnLCAnbm9ybWFsU3VtJywgJ21vZDExJywgJ21pbnVzUmVzdE9mMTEnXVxuXHR9XSxcblx0dmFsaWRhdGU6IGZ1bmN0aW9uKHZhbHVlKSB7IHJldHVybiB2YWxpZGF0ZUlFKHZhbHVlLCB0aGlzKTsgfVxufV07XG5cbklFcnVsZXMuUlIgPSBbe1xuXHQvLyB7bWFzazogbmV3IFN0cmluZ01hc2soJzAwMDAwMDAwLTAnKVxuXHRjaGFyczogOSxcblx0bWF0Y2g6IC9eMjQvLFxuXHRkdnM6IFt7XG5cdFx0ZHZwb3M6IDgsXG5cdFx0cGVzb3M6IFsxLDIsMyw0LDUsNiw3LDhdLFxuXHRcdGFsZ29yaXRobVN0ZXBzOiBbJ29ubHlOdW1iZXJzJywgJ25vcm1hbFN1bScsICdtb2Q5JywgJ3ZvaWRGbiddXG5cdH1dLFxuXHR2YWxpZGF0ZTogZnVuY3Rpb24odmFsdWUpIHsgcmV0dXJuIHZhbGlkYXRlSUUodmFsdWUsIHRoaXMpOyB9XG59XTtcblxuSUVydWxlcy5HTyA9IFt7XG5cdC8vIHttYXNrOiBuZXcgU3RyaW5nTWFzaygnMDAuMDAwLjAwMC0wJylcblx0Y2hhcnM6IDksXG5cdG1hdGNoOiAvXjFbMDE1XS8sXG5cdGR2czogW3tcblx0XHRkdnBvczogOCxcblx0XHRwZXNvczogWzksOCw3LDYsNSw0LDMsMl0sXG5cdFx0YWxnb3JpdGhtU3RlcHM6IFsnb25seU51bWJlcnMnLCAnbm9ybWFsU3VtJywgJ21vZDExJywgJ2dvU3BlYyddXG5cdH1dLFxuXHR2YWxpZGF0ZTogZnVuY3Rpb24odmFsdWUpIHsgcmV0dXJuIHZhbGlkYXRlSUUodmFsdWUsIHRoaXMpOyB9XG59XTtcblxuSUVydWxlcy5BUCA9IFt7XG5cdC8vIHttYXNrOiBuZXcgU3RyaW5nTWFzaygnMDAwMDAwMDAwJylcblx0Y2hhcnM6IDksXG5cdG1hdGNoOiAvXjAzLyxcblx0ZHZzOiBbe1xuXHRcdGR2cG9zOiA4LFxuXHRcdHBlc29zOiBbOSw4LDcsNiw1LDQsMywyXSxcblx0XHRhbGdvcml0aG1TdGVwczogWydvbmx5TnVtYmVycycsICdhcFNwZWMnLCAnbW9kMTEnLCAnYXBTcGVjJ11cblx0fV0sXG5cdHZhbGlkYXRlOiBmdW5jdGlvbih2YWx1ZSkgeyByZXR1cm4gdmFsaWRhdGVJRSh2YWx1ZSwgdGhpcyk7IH1cbn1dO1xuXG5cdHJldHVybiB7XG5cdFx0aWU6IElFLFxuXHRcdGNwZjogQ1BGLFxuXHRcdGNucGo6IENOUEpcblx0fTtcbn0pKTsiLCIoZnVuY3Rpb24ocm9vdCwgZmFjdG9yeSkge1xuICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICAvLyBBTUQuIFJlZ2lzdGVyIGFzIGFuIGFub255bW91cyBtb2R1bGUuXG4gICAgICAgIGRlZmluZShbXSwgZmFjdG9yeSk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgLy8gTm9kZS4gRG9lcyBub3Qgd29yayB3aXRoIHN0cmljdCBDb21tb25KUywgYnV0XG4gICAgICAgIC8vIG9ubHkgQ29tbW9uSlMtbGlrZSBlbnZpcm9ubWVudHMgdGhhdCBzdXBwb3J0IG1vZHVsZS5leHBvcnRzLFxuICAgICAgICAvLyBsaWtlIE5vZGUuXG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIEJyb3dzZXIgZ2xvYmFscyAocm9vdCBpcyB3aW5kb3cpXG4gICAgICAgIHJvb3QuU3RyaW5nTWFzayA9IGZhY3RvcnkoKTtcbiAgICB9XG59KHRoaXMsIGZ1bmN0aW9uKCkge1xuICAgIHZhciB0b2tlbnMgPSB7XG4gICAgICAgICcwJzoge3BhdHRlcm46IC9cXGQvLCBfZGVmYXVsdDogJzAnfSxcbiAgICAgICAgJzknOiB7cGF0dGVybjogL1xcZC8sIG9wdGlvbmFsOiB0cnVlfSxcbiAgICAgICAgJyMnOiB7cGF0dGVybjogL1xcZC8sIG9wdGlvbmFsOiB0cnVlLCByZWN1cnNpdmU6IHRydWV9LFxuICAgICAgICAnQSc6IHtwYXR0ZXJuOiAvW2EtekEtWjAtOV0vfSxcbiAgICAgICAgJ1MnOiB7cGF0dGVybjogL1thLXpBLVpdL30sXG4gICAgICAgICdVJzoge3BhdHRlcm46IC9bYS16QS1aXS8sIHRyYW5zZm9ybTogZnVuY3Rpb24oYykgeyByZXR1cm4gYy50b0xvY2FsZVVwcGVyQ2FzZSgpOyB9fSxcbiAgICAgICAgJ0wnOiB7cGF0dGVybjogL1thLXpBLVpdLywgdHJhbnNmb3JtOiBmdW5jdGlvbihjKSB7IHJldHVybiBjLnRvTG9jYWxlTG93ZXJDYXNlKCk7IH19LFxuICAgICAgICAnJCc6IHtlc2NhcGU6IHRydWV9XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIGlzRXNjYXBlZChwYXR0ZXJuLCBwb3MpIHtcbiAgICAgICAgdmFyIGNvdW50ID0gMDtcbiAgICAgICAgdmFyIGkgPSBwb3MgLSAxO1xuICAgICAgICB2YXIgdG9rZW4gPSB7ZXNjYXBlOiB0cnVlfTtcbiAgICAgICAgd2hpbGUgKGkgPj0gMCAmJiB0b2tlbiAmJiB0b2tlbi5lc2NhcGUpIHtcbiAgICAgICAgICAgIHRva2VuID0gdG9rZW5zW3BhdHRlcm4uY2hhckF0KGkpXTtcbiAgICAgICAgICAgIGNvdW50ICs9IHRva2VuICYmIHRva2VuLmVzY2FwZSA/IDEgOiAwO1xuICAgICAgICAgICAgaS0tO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjb3VudCA+IDAgJiYgY291bnQgJSAyID09PSAxO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNhbGNPcHRpb25hbE51bWJlcnNUb1VzZShwYXR0ZXJuLCB2YWx1ZSkge1xuICAgICAgICB2YXIgbnVtYmVyc0luUCA9IHBhdHRlcm4ucmVwbGFjZSgvW14wXS9nLCcnKS5sZW5ndGg7XG4gICAgICAgIHZhciBudW1iZXJzSW5WID0gdmFsdWUucmVwbGFjZSgvW15cXGRdL2csJycpLmxlbmd0aDtcbiAgICAgICAgcmV0dXJuIG51bWJlcnNJblYgLSBudW1iZXJzSW5QO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNvbmNhdENoYXIodGV4dCwgY2hhcmFjdGVyLCBvcHRpb25zLCB0b2tlbikge1xuICAgICAgICBpZiAodG9rZW4gJiYgdHlwZW9mIHRva2VuLnRyYW5zZm9ybSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgY2hhcmFjdGVyID0gdG9rZW4udHJhbnNmb3JtKGNoYXJhY3Rlcik7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG9wdGlvbnMucmV2ZXJzZSkge1xuICAgICAgICAgICAgcmV0dXJuIGNoYXJhY3RlciArIHRleHQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRleHQgKyBjaGFyYWN0ZXI7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaGFzTW9yZVRva2VucyhwYXR0ZXJuLCBwb3MsIGluYykge1xuICAgICAgICB2YXIgcGMgPSBwYXR0ZXJuLmNoYXJBdChwb3MpO1xuICAgICAgICB2YXIgdG9rZW4gPSB0b2tlbnNbcGNdO1xuICAgICAgICBpZiAocGMgPT09ICcnKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRva2VuICYmICF0b2tlbi5lc2NhcGUgPyB0cnVlIDogaGFzTW9yZVRva2VucyhwYXR0ZXJuLCBwb3MgKyBpbmMsIGluYyk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaGFzTW9yZVJlY3Vyc2l2ZVRva2VucyhwYXR0ZXJuLCBwb3MsIGluYykge1xuICAgICAgICB2YXIgcGMgPSBwYXR0ZXJuLmNoYXJBdChwb3MpO1xuICAgICAgICB2YXIgdG9rZW4gPSB0b2tlbnNbcGNdO1xuICAgICAgICBpZiAocGMgPT09ICcnKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRva2VuICYmIHRva2VuLnJlY3Vyc2l2ZSA/IHRydWUgOiBoYXNNb3JlUmVjdXJzaXZlVG9rZW5zKHBhdHRlcm4sIHBvcyArIGluYywgaW5jKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBpbnNlcnRDaGFyKHRleHQsIGNoYXIsIHBvc2l0aW9uKSB7XG4gICAgICAgIHZhciB0ID0gdGV4dC5zcGxpdCgnJyk7XG4gICAgICAgIHQuc3BsaWNlKHBvc2l0aW9uLCAwLCBjaGFyKTtcbiAgICAgICAgcmV0dXJuIHQuam9pbignJyk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gU3RyaW5nTWFzayhwYXR0ZXJuLCBvcHQpIHtcbiAgICAgICAgdGhpcy5vcHRpb25zID0gb3B0IHx8IHt9O1xuICAgICAgICB0aGlzLm9wdGlvbnMgPSB7XG4gICAgICAgICAgICByZXZlcnNlOiB0aGlzLm9wdGlvbnMucmV2ZXJzZSB8fCBmYWxzZSxcbiAgICAgICAgICAgIHVzZWRlZmF1bHRzOiB0aGlzLm9wdGlvbnMudXNlZGVmYXVsdHMgfHwgdGhpcy5vcHRpb25zLnJldmVyc2VcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5wYXR0ZXJuID0gcGF0dGVybjtcbiAgICB9XG5cbiAgICBTdHJpbmdNYXNrLnByb3RvdHlwZS5wcm9jZXNzID0gZnVuY3Rpb24gcHJvY2Nlc3ModmFsdWUpIHtcbiAgICAgICAgaWYgKCF2YWx1ZSkge1xuICAgICAgICAgICAgcmV0dXJuIHtyZXN1bHQ6ICcnLCB2YWxpZDogZmFsc2V9O1xuICAgICAgICB9XG4gICAgICAgIHZhbHVlID0gdmFsdWUgKyAnJztcbiAgICAgICAgdmFyIHBhdHRlcm4yID0gdGhpcy5wYXR0ZXJuO1xuICAgICAgICB2YXIgdmFsaWQgPSB0cnVlO1xuICAgICAgICB2YXIgZm9ybWF0dGVkID0gJyc7XG4gICAgICAgIHZhciB2YWx1ZVBvcyA9IHRoaXMub3B0aW9ucy5yZXZlcnNlID8gdmFsdWUubGVuZ3RoIC0gMSA6IDA7XG4gICAgICAgIHZhciBwYXR0ZXJuUG9zID0gMDtcbiAgICAgICAgdmFyIG9wdGlvbmFsTnVtYmVyc1RvVXNlID0gY2FsY09wdGlvbmFsTnVtYmVyc1RvVXNlKHBhdHRlcm4yLCB2YWx1ZSk7XG4gICAgICAgIHZhciBlc2NhcGVOZXh0ID0gZmFsc2U7XG4gICAgICAgIHZhciByZWN1cnNpdmUgPSBbXTtcbiAgICAgICAgdmFyIGluUmVjdXJzaXZlTW9kZSA9IGZhbHNlO1xuXG4gICAgICAgIHZhciBzdGVwcyA9IHtcbiAgICAgICAgICAgIHN0YXJ0OiB0aGlzLm9wdGlvbnMucmV2ZXJzZSA/IHBhdHRlcm4yLmxlbmd0aCAtIDEgOiAwLFxuICAgICAgICAgICAgZW5kOiB0aGlzLm9wdGlvbnMucmV2ZXJzZSA/IC0xIDogcGF0dGVybjIubGVuZ3RoLFxuICAgICAgICAgICAgaW5jOiB0aGlzLm9wdGlvbnMucmV2ZXJzZSA/IC0xIDogMVxuICAgICAgICB9O1xuXG4gICAgICAgIGZ1bmN0aW9uIGNvbnRpbnVlQ29uZGl0aW9uKG9wdGlvbnMpIHtcbiAgICAgICAgICAgIGlmICghaW5SZWN1cnNpdmVNb2RlICYmICFyZWN1cnNpdmUubGVuZ3RoICYmIGhhc01vcmVUb2tlbnMocGF0dGVybjIsIHBhdHRlcm5Qb3MsIHN0ZXBzLmluYykpIHtcbiAgICAgICAgICAgICAgICAvLyBjb250aW51ZSBpbiB0aGUgbm9ybWFsIGl0ZXJhdGlvblxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfSBlbHNlIGlmICghaW5SZWN1cnNpdmVNb2RlICYmIHJlY3Vyc2l2ZS5sZW5ndGggJiZcbiAgICAgICAgICAgICAgICBoYXNNb3JlUmVjdXJzaXZlVG9rZW5zKHBhdHRlcm4yLCBwYXR0ZXJuUG9zLCBzdGVwcy5pbmMpKSB7XG4gICAgICAgICAgICAgICAgLy8gY29udGludWUgbG9va2luZyBmb3IgdGhlIHJlY3Vyc2l2ZSB0b2tlbnNcbiAgICAgICAgICAgICAgICAvLyBOb3RlOiBhbGwgY2hhcnMgaW4gdGhlIHBhdHRlcm5zIGFmdGVyIHRoZSByZWN1cnNpdmUgcG9ydGlvbiB3aWxsIGJlIGhhbmRsZWQgYXMgc3RhdGljIHN0cmluZ1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfSBlbHNlIGlmICghaW5SZWN1cnNpdmVNb2RlKSB7XG4gICAgICAgICAgICAgICAgLy8gc3RhcnQgdG8gaGFuZGxlIHRoZSByZWN1cnNpdmUgcG9ydGlvbiBvZiB0aGUgcGF0dGVyblxuICAgICAgICAgICAgICAgIGluUmVjdXJzaXZlTW9kZSA9IHJlY3Vyc2l2ZS5sZW5ndGggPiAwO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoaW5SZWN1cnNpdmVNb2RlKSB7XG4gICAgICAgICAgICAgICAgdmFyIHBjID0gcmVjdXJzaXZlLnNoaWZ0KCk7XG4gICAgICAgICAgICAgICAgcmVjdXJzaXZlLnB1c2gocGMpO1xuICAgICAgICAgICAgICAgIGlmIChvcHRpb25zLnJldmVyc2UgJiYgdmFsdWVQb3MgPj0gMCkge1xuICAgICAgICAgICAgICAgICAgICBwYXR0ZXJuUG9zKys7XG4gICAgICAgICAgICAgICAgICAgIHBhdHRlcm4yID0gaW5zZXJ0Q2hhcihwYXR0ZXJuMiwgcGMsIHBhdHRlcm5Qb3MpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKCFvcHRpb25zLnJldmVyc2UgJiYgdmFsdWVQb3MgPCB2YWx1ZS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgcGF0dGVybjIgPSBpbnNlcnRDaGFyKHBhdHRlcm4yLCBwYywgcGF0dGVyblBvcyk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwYXR0ZXJuUG9zIDwgcGF0dGVybjIubGVuZ3RoICYmIHBhdHRlcm5Qb3MgPj0gMDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBJdGVyYXRlIG92ZXIgdGhlIHBhdHRlcm4ncyBjaGFycyBwYXJzaW5nL21hdGNoaW5nIHRoZSBpbnB1dCB2YWx1ZSBjaGFyc1xuICAgICAgICAgKiB1bnRpbCB0aGUgZW5kIG9mIHRoZSBwYXR0ZXJuLiBJZiB0aGUgcGF0dGVybiBlbmRzIHdpdGggcmVjdXJzaXZlIGNoYXJzXG4gICAgICAgICAqIHRoZSBpdGVyYXRpb24gd2lsbCBjb250aW51ZSB1bnRpbCB0aGUgZW5kIG9mIHRoZSBpbnB1dCB2YWx1ZS5cbiAgICAgICAgICpcbiAgICAgICAgICogTm90ZTogVGhlIGl0ZXJhdGlvbiBtdXN0IHN0b3AgaWYgYW4gaW52YWxpZCBjaGFyIGlzIGZvdW5kLlxuICAgICAgICAgKi9cbiAgICAgICAgZm9yIChwYXR0ZXJuUG9zID0gc3RlcHMuc3RhcnQ7IGNvbnRpbnVlQ29uZGl0aW9uKHRoaXMub3B0aW9ucyk7IHBhdHRlcm5Qb3MgPSBwYXR0ZXJuUG9zICsgc3RlcHMuaW5jKSB7XG4gICAgICAgICAgICAvLyBWYWx1ZSBjaGFyXG4gICAgICAgICAgICB2YXIgdmMgPSB2YWx1ZS5jaGFyQXQodmFsdWVQb3MpO1xuICAgICAgICAgICAgLy8gUGF0dGVybiBjaGFyIHRvIG1hdGNoIHdpdGggdGhlIHZhbHVlIGNoYXJcbiAgICAgICAgICAgIHZhciBwYyA9IHBhdHRlcm4yLmNoYXJBdChwYXR0ZXJuUG9zKTtcblxuICAgICAgICAgICAgdmFyIHRva2VuID0gdG9rZW5zW3BjXTtcbiAgICAgICAgICAgIGlmIChyZWN1cnNpdmUubGVuZ3RoICYmIHRva2VuICYmICF0b2tlbi5yZWN1cnNpdmUpIHtcbiAgICAgICAgICAgICAgICAvLyBJbiB0aGUgcmVjdXJzaXZlIHBvcnRpb24gb2YgdGhlIHBhdHRlcm46IHRva2VucyBub3QgcmVjdXJzaXZlIG11c3QgYmUgc2VlbiBhcyBzdGF0aWMgY2hhcnNcbiAgICAgICAgICAgICAgICB0b2tlbiA9IG51bGw7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIDEuIEhhbmRsZSBlc2NhcGUgdG9rZW5zIGluIHBhdHRlcm5cbiAgICAgICAgICAgIC8vIGdvIHRvIG5leHQgaXRlcmF0aW9uOiBpZiB0aGUgcGF0dGVybiBjaGFyIGlzIGEgZXNjYXBlIGNoYXIgb3Igd2FzIGVzY2FwZWRcbiAgICAgICAgICAgIGlmICghaW5SZWN1cnNpdmVNb2RlIHx8IHZjKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5yZXZlcnNlICYmIGlzRXNjYXBlZChwYXR0ZXJuMiwgcGF0dGVyblBvcykpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gcGF0dGVybiBjaGFyIGlzIGVzY2FwZWQsIGp1c3QgYWRkIGl0IGFuZCBtb3ZlIG9uXG4gICAgICAgICAgICAgICAgICAgIGZvcm1hdHRlZCA9IGNvbmNhdENoYXIoZm9ybWF0dGVkLCBwYywgdGhpcy5vcHRpb25zLCB0b2tlbik7XG4gICAgICAgICAgICAgICAgICAgIC8vIHNraXAgZXNjYXBlIHRva2VuXG4gICAgICAgICAgICAgICAgICAgIHBhdHRlcm5Qb3MgPSBwYXR0ZXJuUG9zICsgc3RlcHMuaW5jO1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKCF0aGlzLm9wdGlvbnMucmV2ZXJzZSAmJiBlc2NhcGVOZXh0KSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIHBhdHRlcm4gY2hhciBpcyBlc2NhcGVkLCBqdXN0IGFkZCBpdCBhbmQgbW92ZSBvblxuICAgICAgICAgICAgICAgICAgICBmb3JtYXR0ZWQgPSBjb25jYXRDaGFyKGZvcm1hdHRlZCwgcGMsIHRoaXMub3B0aW9ucywgdG9rZW4pO1xuICAgICAgICAgICAgICAgICAgICBlc2NhcGVOZXh0ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoIXRoaXMub3B0aW9ucy5yZXZlcnNlICYmIHRva2VuICYmIHRva2VuLmVzY2FwZSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBtYXJrIHRvIGVzY2FwZSB0aGUgbmV4dCBwYXR0ZXJuIGNoYXJcbiAgICAgICAgICAgICAgICAgICAgZXNjYXBlTmV4dCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gMi4gSGFuZGxlIHJlY3Vyc2l2ZSB0b2tlbnMgaW4gcGF0dGVyblxuICAgICAgICAgICAgLy8gZ28gdG8gbmV4dCBpdGVyYXRpb246IGlmIHRoZSB2YWx1ZSBzdHIgaXMgZmluaXNoZWQgb3JcbiAgICAgICAgICAgIC8vICAgICAgICAgICAgICAgICAgICAgICBpZiB0aGVyZSBpcyBhIG5vcm1hbCB0b2tlbiBpbiB0aGUgcmVjdXJzaXZlIHBvcnRpb24gb2YgdGhlIHBhdHRlcm5cbiAgICAgICAgICAgIGlmICghaW5SZWN1cnNpdmVNb2RlICYmIHRva2VuICYmIHRva2VuLnJlY3Vyc2l2ZSkge1xuICAgICAgICAgICAgICAgIC8vIHNhdmUgaXQgdG8gcmVwZWF0IGluIHRoZSBlbmQgb2YgdGhlIHBhdHRlcm4gYW5kIGhhbmRsZSB0aGUgdmFsdWUgY2hhciBub3dcbiAgICAgICAgICAgICAgICByZWN1cnNpdmUucHVzaChwYyk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGluUmVjdXJzaXZlTW9kZSAmJiAhdmMpIHtcbiAgICAgICAgICAgICAgICAvLyBpbiByZWN1cnNpdmUgbW9kZSBidXQgdmFsdWUgaXMgZmluaXNoZWQuIEFkZCB0aGUgcGF0dGVybiBjaGFyIGlmIGl0IGlzIG5vdCBhIHJlY3Vyc2l2ZSB0b2tlblxuICAgICAgICAgICAgICAgIGZvcm1hdHRlZCA9IGNvbmNhdENoYXIoZm9ybWF0dGVkLCBwYywgdGhpcy5vcHRpb25zLCB0b2tlbik7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKCFpblJlY3Vyc2l2ZU1vZGUgJiYgcmVjdXJzaXZlLmxlbmd0aCA+IDAgJiYgIXZjKSB7XG4gICAgICAgICAgICAgICAgLy8gcmVjdXJzaXZlTW9kZSBub3Qgc3RhcnRlZCBidXQgYWxyZWFkeSBpbiB0aGUgcmVjdXJzaXZlIHBvcnRpb24gb2YgdGhlIHBhdHRlcm5cbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gMy4gSGFuZGxlIHRoZSB2YWx1ZVxuICAgICAgICAgICAgLy8gYnJlYWsgaXRlcmF0aW9uczogaWYgdmFsdWUgaXMgaW52YWxpZCBmb3IgdGhlIGdpdmVuIHBhdHRlcm5cbiAgICAgICAgICAgIGlmICghdG9rZW4pIHtcbiAgICAgICAgICAgICAgICAvLyBhZGQgY2hhciBvZiB0aGUgcGF0dGVyblxuICAgICAgICAgICAgICAgIGZvcm1hdHRlZCA9IGNvbmNhdENoYXIoZm9ybWF0dGVkLCBwYywgdGhpcy5vcHRpb25zLCB0b2tlbik7XG4gICAgICAgICAgICAgICAgaWYgKCFpblJlY3Vyc2l2ZU1vZGUgJiYgcmVjdXJzaXZlLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAvLyBzYXZlIGl0IHRvIHJlcGVhdCBpbiB0aGUgZW5kIG9mIHRoZSBwYXR0ZXJuXG4gICAgICAgICAgICAgICAgICAgIHJlY3Vyc2l2ZS5wdXNoKHBjKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRva2VuLm9wdGlvbmFsKSB7XG4gICAgICAgICAgICAgICAgLy8gaWYgdG9rZW4gaXMgb3B0aW9uYWwsIG9ubHkgYWRkIHRoZSB2YWx1ZSBjaGFyIGlmIGl0IG1hdGNocyB0aGUgdG9rZW4gcGF0dGVyblxuICAgICAgICAgICAgICAgIC8vICAgICAgICAgICAgICAgICAgICAgICBpZiBub3QsIG1vdmUgb24gdG8gdGhlIG5leHQgcGF0dGVybiBjaGFyXG4gICAgICAgICAgICAgICAgaWYgKHRva2VuLnBhdHRlcm4udGVzdCh2YykgJiYgb3B0aW9uYWxOdW1iZXJzVG9Vc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgZm9ybWF0dGVkID0gY29uY2F0Q2hhcihmb3JtYXR0ZWQsIHZjLCB0aGlzLm9wdGlvbnMsIHRva2VuKTtcbiAgICAgICAgICAgICAgICAgICAgdmFsdWVQb3MgPSB2YWx1ZVBvcyArIHN0ZXBzLmluYztcbiAgICAgICAgICAgICAgICAgICAgb3B0aW9uYWxOdW1iZXJzVG9Vc2UtLTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHJlY3Vyc2l2ZS5sZW5ndGggPiAwICYmIHZjKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhbGlkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSBpZiAodG9rZW4ucGF0dGVybi50ZXN0KHZjKSkge1xuICAgICAgICAgICAgICAgIC8vIGlmIHRva2VuIGlzbid0IG9wdGlvbmFsIHRoZSB2YWx1ZSBjaGFyIG11c3QgbWF0Y2ggdGhlIHRva2VuIHBhdHRlcm5cbiAgICAgICAgICAgICAgICBmb3JtYXR0ZWQgPSBjb25jYXRDaGFyKGZvcm1hdHRlZCwgdmMsIHRoaXMub3B0aW9ucywgdG9rZW4pO1xuICAgICAgICAgICAgICAgIHZhbHVlUG9zID0gdmFsdWVQb3MgKyBzdGVwcy5pbmM7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKCF2YyAmJiB0b2tlbi5fZGVmYXVsdCAmJiB0aGlzLm9wdGlvbnMudXNlZGVmYXVsdHMpIHtcbiAgICAgICAgICAgICAgICAvLyBpZiB0aGUgdG9rZW4gaXNuJ3Qgb3B0aW9uYWwgYW5kIGhhcyBhIGRlZmF1bHQgdmFsdWUsIHVzZSBpdCBpZiB0aGUgdmFsdWUgaXMgZmluaXNoZWRcbiAgICAgICAgICAgICAgICBmb3JtYXR0ZWQgPSBjb25jYXRDaGFyKGZvcm1hdHRlZCwgdG9rZW4uX2RlZmF1bHQsIHRoaXMub3B0aW9ucywgdG9rZW4pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyB0aGUgc3RyaW5nIHZhbHVlIGRvbid0IG1hdGNoIHRoZSBnaXZlbiBwYXR0ZXJuXG4gICAgICAgICAgICAgICAgdmFsaWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB7cmVzdWx0OiBmb3JtYXR0ZWQsIHZhbGlkOiB2YWxpZH07XG4gICAgfTtcblxuICAgIFN0cmluZ01hc2sucHJvdG90eXBlLmFwcGx5ID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJvY2Vzcyh2YWx1ZSkucmVzdWx0O1xuICAgIH07XG5cbiAgICBTdHJpbmdNYXNrLnByb3RvdHlwZS52YWxpZGF0ZSA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnByb2Nlc3ModmFsdWUpLnZhbGlkO1xuICAgIH07XG5cbiAgICBTdHJpbmdNYXNrLnByb2Nlc3MgPSBmdW5jdGlvbih2YWx1ZSwgcGF0dGVybiwgb3B0aW9ucykge1xuICAgICAgICByZXR1cm4gbmV3IFN0cmluZ01hc2socGF0dGVybiwgb3B0aW9ucykucHJvY2Vzcyh2YWx1ZSk7XG4gICAgfTtcblxuICAgIFN0cmluZ01hc2suYXBwbHkgPSBmdW5jdGlvbih2YWx1ZSwgcGF0dGVybiwgb3B0aW9ucykge1xuICAgICAgICByZXR1cm4gbmV3IFN0cmluZ01hc2socGF0dGVybiwgb3B0aW9ucykuYXBwbHkodmFsdWUpO1xuICAgIH07XG5cbiAgICBTdHJpbmdNYXNrLnZhbGlkYXRlID0gZnVuY3Rpb24odmFsdWUsIHBhdHRlcm4sIG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBTdHJpbmdNYXNrKHBhdHRlcm4sIG9wdGlvbnMpLnZhbGlkYXRlKHZhbHVlKTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIFN0cmluZ01hc2s7XG59KSk7XG4iLCIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gYW5ndWxhci5tb2R1bGUoJ2FuZ3VsYXIuZmx1aWcnLCBbXG4gICAgcmVxdWlyZSgnLi9nbG9iYWwvZ2xvYmFsLW1hc2tzJyksXG4gICAgcmVxdWlyZSgnLi9ici9ici1tYXNrcycpLFxuICAgIHJlcXVpcmUoJy4vZmx1aWcvZmx1aWctdWknKSxcbiAgICByZXF1aXJlKCcuL2ZpbHRlcnMvZmlsdGVyJylcbl0pLm5hbWU7IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgU3RyaW5nTWFzayA9IHJlcXVpcmUoJ3N0cmluZy1tYXNrJyk7XG52YXIgbWFza0ZhY3RvcnkgPSByZXF1aXJlKCdtYXNrLWZhY3RvcnknKTtcblxudmFyIGJvbGV0b0JhbmNhcmlvTWFzayA9IG5ldyBTdHJpbmdNYXNrKCcwMDAwMC4wMDAwMCAwMDAwMC4wMDAwMDAgMDAwMDAuMDAwMDAwIDAgMDAwMDAwMDAwMDAwMDAnKTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cdGRpcmVjdGl2ZTogbWFza0ZhY3Rvcnkoe1xuXHRcdGNsZWFyVmFsdWU6IGZ1bmN0aW9uIChyYXdWYWx1ZSkge1xuXHRcdFx0cmV0dXJuIHJhd1ZhbHVlLnJlcGxhY2UoL1teMC05XS9nLCAnJykuc2xpY2UoMCwgNDcpO1xuXHRcdH0sXG5cdFx0Zm9ybWF0OiBmdW5jdGlvbiAoY2xlYW5WYWx1ZSkge1xuXHRcdFx0cmV0dXJuIGZvcm1hdChjbGVhblZhbHVlKTtcblx0XHR9LFxuXHRcdHZhbGlkYXRpb25zOiB7XG5cdFx0XHRib2xldG9CYW5jYXJpbzogZnVuY3Rpb24gKHZhbHVlKSB7XG5cdFx0XHRcdHJldHVybiB2YWx1ZS5sZW5ndGggPT09IDQ3O1xuXHRcdFx0fVxuXHRcdH1cblx0fSksXG5cdGZpbHRlcjogQm9sZXRvQmFuY2FyaW9GaWx0ZXJcbn1cblxuZnVuY3Rpb24gZm9ybWF0ICh2YWx1ZSkge1xuXHRpZiAoIXZhbHVlIHx8IHZhbHVlLmxlbmd0aCA9PT0gMCkge1xuXHRcdHJldHVybiB2YWx1ZTtcblx0fVxuXG5cdHJldHVybiBib2xldG9CYW5jYXJpb01hc2suYXBwbHkodmFsdWUpLnJlcGxhY2UoL1teMC05XSQvLCAnJyk7XG59XG5cbmZ1bmN0aW9uIEJvbGV0b0JhbmNhcmlvRmlsdGVyKCRmaWx0ZXIpIHtcblx0cmV0dXJuIGZ1bmN0aW9uIChpbnB1dCkge1xuXHRcdHJldHVybiBmb3JtYXQoaW5wdXQpO1xuXHR9O1xufVxuQm9sZXRvQmFuY2FyaW9GaWx0ZXIuJGluamVjdCA9IFsnJGZpbHRlciddOyIsIid1c2Ugc3RyaWN0JztcblxudmFyIG0gPSBhbmd1bGFyLm1vZHVsZSgnZmx1aWcubWFza3MuYnInLCBbXG4gICAgICAgIHJlcXVpcmUoJy4uL2hlbHBlcnMnKSxcbiAgICBdKVxuICAgIC5kaXJlY3RpdmUoJ2ZsdWlnQm9sZXRvQmFuY2FyaW9NYXNrJywgcmVxdWlyZSgnLi9ib2xldG8tYmFuY2FyaW8vYm9sZXRvLWJhbmNhcmlvJykuZGlyZWN0aXZlKVxuICAgIC5maWx0ZXIoJ2JvbGV0b0JhbmNhcmlvJywgcmVxdWlyZSgnLi9ib2xldG8tYmFuY2FyaW8vYm9sZXRvLWJhbmNhcmlvJykuZmlsdGVyKVxuXG4gICAgLmRpcmVjdGl2ZSgnZmx1aWdDZXBNYXNrJywgcmVxdWlyZSgnLi9jZXAvY2VwJykuZGlyZWN0aXZlKVxuICAgIC5maWx0ZXIoJ2NlcCcsIHJlcXVpcmUoJy4vY2VwL2NlcCcpLmZpbHRlcilcblxuICAgIC5kaXJlY3RpdmUoJ2ZsdWlnQ25wak1hc2snLCByZXF1aXJlKCcuL2NucGovY25waicpLmRpcmVjdGl2ZSlcbiAgICAuZmlsdGVyKCdjbnBqJywgcmVxdWlyZSgnLi9jbnBqL2NucGonKS5maWx0ZXIpXG5cbiAgICAuZGlyZWN0aXZlKCdmbHVpZ0NwZk1hc2snLCByZXF1aXJlKCcuL2NwZi9jcGYnKS5kaXJlY3RpdmUpXG4gICAgLmZpbHRlcignY3BmJywgcmVxdWlyZSgnLi9jcGYvY3BmJykuZmlsdGVyKVxuXG4gICAgLmRpcmVjdGl2ZSgnZmx1aWdDcGZDbnBqTWFzaycsIHJlcXVpcmUoJy4vY3BmLWNucGovY3BmLWNucGonKS5kaXJlY3RpdmUpXG4gICAgLmZpbHRlcignY3BmQ25waicsIHJlcXVpcmUoJy4vY3BmLWNucGovY3BmLWNucGonKS5maWx0ZXIpXG5cbiAgICAuZGlyZWN0aXZlKCdmbHVpZ0llTWFzaycsIHJlcXVpcmUoJy4vaW5zY3JpY2FvLWVzdGFkdWFsL2llJykpXG5cbiAgICAuZGlyZWN0aXZlKCdmbHVpZ05mZU1hc2snLCByZXF1aXJlKCcuL25mZS9uZmUnKS5kaXJlY3RpdmUpXG4gICAgLmZpbHRlcignbmZlJywgcmVxdWlyZSgnLi9uZmUvbmZlJykuZmlsdGVyKVxuXG4gICAgLmRpcmVjdGl2ZSgnZmx1aWdDYXJQbGF0ZU1hc2snLCByZXF1aXJlKCcuL2Nhci1wbGF0ZS9jYXItcGxhdGUnKS5kaXJlY3RpdmUpXG4gICAgLmZpbHRlcignY2FyUGxhdGUnLCByZXF1aXJlKCcuL2Nhci1wbGF0ZS9jYXItcGxhdGUnKS5maWx0ZXIpXG5cbiAgICAuZGlyZWN0aXZlKCdmbHVpZ0JyUGhvbmVNYXNrJywgcmVxdWlyZSgnLi9waG9uZS9ici1waG9uZScpLmRpcmVjdGl2ZSlcbiAgICAuZmlsdGVyKCdiclBob25lJywgcmVxdWlyZSgnLi9waG9uZS9ici1waG9uZScpLmZpbHRlcilcblxuICAgIFxuICAgIFxuICAgIFxuXG5tb2R1bGUuZXhwb3J0cyA9IG0ubmFtZTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBTdHJpbmdNYXNrID0gcmVxdWlyZSgnc3RyaW5nLW1hc2snKTtcbnZhciBtYXNrRmFjdG9yeSA9IHJlcXVpcmUoJ21hc2stZmFjdG9yeScpO1xuXG52YXIgY2FyUGxhdGVNYXNrID0gbmV3IFN0cmluZ01hc2soJ1VVVS0wQTAwJyk7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXHRkaXJlY3RpdmU6IG1hc2tGYWN0b3J5KHtcblx0XHRjbGVhclZhbHVlOiBmdW5jdGlvbiAocmF3VmFsdWUpIHtcblx0XHRcdHJldHVybiByYXdWYWx1ZS5yZXBsYWNlKC9bXmEtekEtWjAtOV0vZywgJycpLnNsaWNlKDAsIDcpO1xuXHRcdH0sXG5cdFx0Zm9ybWF0OiBmdW5jdGlvbiAoY2xlYW5WYWx1ZSkge1xuXHRcdFx0cmV0dXJuIGZvcm1hdChjbGVhblZhbHVlKTtcblx0XHR9LFxuXHRcdHZhbGlkYXRpb25zOiB7XG5cdFx0XHRjYXJQbGF0ZTogZnVuY3Rpb24gKHZhbHVlKSB7XG5cdFx0XHRcdHJldHVybiB2YWx1ZS5sZW5ndGggPT09IDc7XG5cdFx0XHR9XG5cdFx0fVxuXHR9KSxcblx0ZmlsdGVyOiBDYXJQbGF0ZUZpbHRlclxufVxuXG5mdW5jdGlvbiBmb3JtYXQodmFsdWUpIHtcblx0cmV0dXJuIChjYXJQbGF0ZU1hc2suYXBwbHkodmFsdWUpIHx8ICcnKS5yZXBsYWNlKC9bXmEtekEtWjAtOV0kLywgJycpO1xufVxuXG5mdW5jdGlvbiBDYXJQbGF0ZUZpbHRlcigkZmlsdGVyKSB7XG5cdHJldHVybiBmdW5jdGlvbiAoaW5wdXQpIHtcblx0XHRyZXR1cm4gZm9ybWF0KGlucHV0KTtcblx0fTtcbn1cblxuQ2FyUGxhdGVGaWx0ZXIuJGluamVjdCA9IFsnJGZpbHRlciddOyIsIid1c2Ugc3RyaWN0JztcblxudmFyIFN0cmluZ01hc2sgPSByZXF1aXJlKCdzdHJpbmctbWFzaycpO1xudmFyIG1hc2tGYWN0b3J5ID0gcmVxdWlyZSgnbWFzay1mYWN0b3J5Jyk7XG5cbnZhciBjZXBNYXNrID0gbmV3IFN0cmluZ01hc2soJzAwMDAwLTAwMCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblx0ZGlyZWN0aXZlOiBtYXNrRmFjdG9yeSh7XG5cdFx0Y2xlYXJWYWx1ZTogZnVuY3Rpb24gKHJhd1ZhbHVlKSB7XG5cdFx0XHRyZXR1cm4gcmF3VmFsdWUudG9TdHJpbmcoKS5yZXBsYWNlKC9bXjAtOV0vZywgJycpLnNsaWNlKDAsIDgpO1xuXHRcdH0sXG5cdFx0Zm9ybWF0OiBmdW5jdGlvbiAoY2xlYW5WYWx1ZSkge1xuXHRcdFx0cmV0dXJuIGZvcm1hdChjbGVhblZhbHVlKTtcblx0XHR9LFxuXHRcdHZhbGlkYXRpb25zOiB7XG5cdFx0XHRjZXA6IGZ1bmN0aW9uICh2YWx1ZSkge1xuXHRcdFx0XHRyZXR1cm4gdmFsdWUudG9TdHJpbmcoKS5sZW5ndGggPT09IDg7XG5cdFx0XHR9XG5cdFx0fVxuXHR9KSxcblx0ZmlsdGVyOiBDZXBGaWx0ZXJcdFxufTtcblxuZnVuY3Rpb24gZm9ybWF0ICh2YWx1ZSkge1xuXHRyZXR1cm4gKGNlcE1hc2suYXBwbHkodmFsdWUpIHx8ICcnKS5yZXBsYWNlKC9bXjAtOV0kLywgJycpO1xufVxuXG5mdW5jdGlvbiBDZXBGaWx0ZXIoJGZpbHRlcikge1xuICAgIHJldHVybiBmdW5jdGlvbiAoaW5wdXQpIHtcbiAgICAgICAgcmV0dXJuIGZvcm1hdChpbnB1dCk7XG4gICAgfTtcbn1cbkNlcEZpbHRlci4kaW5qZWN0ID0gWyckZmlsdGVyJ107IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgU3RyaW5nTWFzayA9IHJlcXVpcmUoJ3N0cmluZy1tYXNrJyk7XG52YXIgQnJWID0gcmVxdWlyZSgnYnItdmFsaWRhdGlvbnMnKTtcbnZhciBtYXNrRmFjdG9yeSA9IHJlcXVpcmUoJ21hc2stZmFjdG9yeScpO1xuXG52YXIgY25walBhdHRlcm4gPSBuZXcgU3RyaW5nTWFzaygnMDAuMDAwLjAwMFxcLzAwMDAtMDAnKTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cdGRpcmVjdGl2ZTogbWFza0ZhY3Rvcnkoe1xuXHRcdGNsZWFyVmFsdWU6IGZ1bmN0aW9uIChyYXdWYWx1ZSkge1xuXHRcdFx0cmV0dXJuIFN0cmluZyhyYXdWYWx1ZSkucmVwbGFjZSgvW15cXGRdL2csICcnKS5zbGljZSgwLCAxNCk7XG5cdFx0fSxcblx0XHRmb3JtYXQ6IGZ1bmN0aW9uIChjbGVhblZhbHVlKSB7XG5cdFx0XHRyZXR1cm4gZm9ybWF0KGNsZWFuVmFsdWUpO1xuXHRcdH0sXG5cdFx0dmFsaWRhdGlvbnM6IHtcblx0XHRcdGNucGo6IGZ1bmN0aW9uICh2YWx1ZSkge1xuXHRcdFx0XHRyZXR1cm4gQnJWLmNucGoudmFsaWRhdGUoU3RyaW5nKHZhbHVlKSk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9KSxcblx0ZmlsdGVyOiBDbnBqRmlsdGVyXG59XG5cbmZ1bmN0aW9uIGZvcm1hdCh2YWx1ZSkge1xuXHRyZXR1cm4gKGNucGpQYXR0ZXJuLmFwcGx5KHZhbHVlKSB8fCAnJykudHJpbSgpLnJlcGxhY2UoL1teMC05XSQvLCAnJyk7XG59XG5cbmZ1bmN0aW9uIENucGpGaWx0ZXIoJGZpbHRlcikge1xuXHRyZXR1cm4gZnVuY3Rpb24gKGlucHV0KSB7XG5cdFx0cmV0dXJuIGZvcm1hdChpbnB1dCk7XG5cdH07XG59XG5DbnBqRmlsdGVyLiRpbmplY3QgPSBbJyRmaWx0ZXInXTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBTdHJpbmdNYXNrID0gcmVxdWlyZSgnc3RyaW5nLW1hc2snKTtcbnZhciBCclYgPSByZXF1aXJlKCdici12YWxpZGF0aW9ucycpO1xudmFyIG1hc2tGYWN0b3J5ID0gcmVxdWlyZSgnbWFzay1mYWN0b3J5Jyk7XG5cbnZhciBjbnBqUGF0dGVybiA9IG5ldyBTdHJpbmdNYXNrKCcwMC4wMDAuMDAwXFwvMDAwMC0wMCcpO1xudmFyIGNwZlBhdHRlcm4gPSBuZXcgU3RyaW5nTWFzaygnMDAwLjAwMC4wMDAtMDAnKTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cdGRpcmVjdGl2ZTogbWFza0ZhY3Rvcnkoe1xuXHRcdGNsZWFyVmFsdWU6IGZ1bmN0aW9uIChyYXdWYWx1ZSkge1xuXHRcdFx0cmV0dXJuIFN0cmluZyhyYXdWYWx1ZSkucmVwbGFjZSgvW15cXGRdL2csICcnKS5zbGljZSgwLCAxNCk7XG5cdFx0fSxcblx0XHRmb3JtYXQ6IGZ1bmN0aW9uIChjbGVhblZhbHVlKSB7XG5cdFx0XHRyZXR1cm4gZm9ybWF0KGNsZWFuVmFsdWUpO1xuXHRcdH0sXG5cdFx0dmFsaWRhdGlvbnM6IHtcblx0XHRcdGNwZjogZnVuY3Rpb24gKHZhbHVlKSB7XG5cdFx0XHRcdFxuXHRcdFx0XHRyZXR1cm4gU3RyaW5nKHZhbHVlKS5sZW5ndGggPiAxMSB8fCBCclYuY3BmLnZhbGlkYXRlKFN0cmluZyh2YWx1ZSkpO1xuXHRcdFx0fSxcblx0XHRcdGNucGo6IGZ1bmN0aW9uICh2YWx1ZSkge1xuXHRcdFx0XHRcblx0XHRcdFx0cmV0dXJuICBTdHJpbmcodmFsdWUpLmxlbmd0aCA8PSAxMSB8fCBCclYuY25wai52YWxpZGF0ZShTdHJpbmcodmFsdWUpKTtcblx0XHRcdH1cblx0XHR9XG5cdH0pLFxuXHRmaWx0ZXI6IENwZkNucGpGaWx0ZXJcbn1cblxuZnVuY3Rpb24gZm9ybWF0KHZhbHVlKSB7XG5cblx0aWYgKCF2YWx1ZSkgcmV0dXJuIHZhbHVlO1xuXHR2YXIgZm9ybWF0ZWRWYWx1ZTtcblxuXHRpZiAodmFsdWUubGVuZ3RoID4gMTEpIHtcblx0XHRmb3JtYXRlZFZhbHVlID0gY25walBhdHRlcm4uYXBwbHkodmFsdWUpO1xuXHR9IGVsc2Uge1xuXHRcdGZvcm1hdGVkVmFsdWUgPSBjcGZQYXR0ZXJuLmFwcGx5KHZhbHVlKSB8fCAnJztcblx0fVxuXG5cdHJldHVybiBmb3JtYXRlZFZhbHVlLnRyaW0oKS5yZXBsYWNlKC9bXjAtOV0kLywgJycpO1xufVxuXG5mdW5jdGlvbiBDcGZDbnBqRmlsdGVyKCRmaWx0ZXIpIHtcblx0cmV0dXJuIGZ1bmN0aW9uIChpbnB1dCkge1xuXHRcdHJldHVybiBmb3JtYXQoaW5wdXQpO1xuXHR9O1xufVxuQ3BmQ25wakZpbHRlci4kaW5qZWN0ID0gWyckZmlsdGVyJ107IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgU3RyaW5nTWFzayA9IHJlcXVpcmUoJ3N0cmluZy1tYXNrJyk7XG52YXIgQnJWID0gcmVxdWlyZSgnYnItdmFsaWRhdGlvbnMnKTtcbnZhciBtYXNrRmFjdG9yeSA9IHJlcXVpcmUoJ21hc2stZmFjdG9yeScpO1xuXG52YXIgY3BmUGF0dGVybiA9IG5ldyBTdHJpbmdNYXNrKCcwMDAuMDAwLjAwMC0wMCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblx0ZGlyZWN0aXZlOiBtYXNrRmFjdG9yeSh7XG5cdFx0Y2xlYXJWYWx1ZTogZnVuY3Rpb24gKHJhd1ZhbHVlKSB7XG5cdFx0XHRyZXR1cm4gU3RyaW5nKHJhd1ZhbHVlKS5yZXBsYWNlKC9bXlxcZF0vZywgJycpLnNsaWNlKDAsIDExKTtcblx0XHR9LFxuXHRcdGZvcm1hdDogZnVuY3Rpb24gKGNsZWFuVmFsdWUpIHtcblx0XHRcdHJldHVybiBmb3JtYXQoU3RyaW5nKGNsZWFuVmFsdWUpKTtcblx0XHR9LFxuXHRcdHZhbGlkYXRpb25zOiB7XG5cdFx0XHRjcGY6IGZ1bmN0aW9uICh2YWx1ZSkge1xuXHRcdFx0XHRyZXR1cm4gQnJWLmNwZi52YWxpZGF0ZShTdHJpbmcodmFsdWUpKTtcblx0XHRcdH1cblx0XHR9XG5cdH0pLFxuXHRmaWx0ZXI6IENwZkZpbHRlclxufVxuXG5mdW5jdGlvbiBmb3JtYXQodmFsdWUpIHtcblx0cmV0dXJuIChjcGZQYXR0ZXJuLmFwcGx5KFN0cmluZyh2YWx1ZSkpIHx8ICcnKS50cmltKCkucmVwbGFjZSgvW14wLTldJC8sICcnKTtcbn1cblxuZnVuY3Rpb24gQ3BmRmlsdGVyKCRmaWx0ZXIpIHtcblx0cmV0dXJuIGZ1bmN0aW9uIChpbnB1dCkge1xuXHRcdHJldHVybiBmb3JtYXQoaW5wdXQpO1xuXHR9O1xufVxuQ3BmRmlsdGVyLiRpbmplY3QgPSBbJyRmaWx0ZXInXTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBTdHJpbmdNYXNrID0gcmVxdWlyZSgnc3RyaW5nLW1hc2snKTtcbnZhciBCclYgPSByZXF1aXJlKCdici12YWxpZGF0aW9ucycpO1xuXG5mdW5jdGlvbiBGbHVpZ0llTWFza0RpcmVjdGl2ZSgkcGFyc2UpIHtcblx0dmFyIGllTWFza3MgPSB7XG5cdFx0J0FDJzogW3ttYXNrOiBuZXcgU3RyaW5nTWFzaygnMDAuMDAwLjAwMC8wMDAtMDAnKX1dLFxuXHRcdCdBTCc6IFt7bWFzazogbmV3IFN0cmluZ01hc2soJzAwMDAwMDAwMCcpfV0sXG5cdFx0J0FNJzogW3ttYXNrOiBuZXcgU3RyaW5nTWFzaygnMDAuMDAwLjAwMC0wJyl9XSxcblx0XHQnQVAnOiBbe21hc2s6IG5ldyBTdHJpbmdNYXNrKCcwMDAwMDAwMDAnKX1dLFxuXHRcdCdCQSc6IFt7Y2hhcnM6IDgsIG1hc2s6IG5ldyBTdHJpbmdNYXNrKCcwMDAwMDAtMDAnKX0sXG5cdFx0XHR7bWFzazogbmV3IFN0cmluZ01hc2soJzAwMDAwMDAtMDAnKX1dLFxuXHRcdCdDRSc6IFt7bWFzazogbmV3IFN0cmluZ01hc2soJzAwMDAwMDAwLTAnKX1dLFxuXHRcdCdERic6IFt7bWFzazogbmV3IFN0cmluZ01hc2soJzAwMDAwMDAwMDAwLTAwJyl9XSxcblx0XHQnRVMnOiBbe21hc2s6IG5ldyBTdHJpbmdNYXNrKCcwMDAwMDAwMC0wJyl9XSxcblx0XHQnR08nOiBbe21hc2s6IG5ldyBTdHJpbmdNYXNrKCcwMC4wMDAuMDAwLTAnKX1dLFxuXHRcdCdNQSc6IFt7bWFzazogbmV3IFN0cmluZ01hc2soJzAwMDAwMDAwMCcpfV0sXG5cdFx0J01HJzogW3ttYXNrOiBuZXcgU3RyaW5nTWFzaygnMDAwLjAwMC4wMDAvMDAwMCcpfV0sXG5cdFx0J01TJzogW3ttYXNrOiBuZXcgU3RyaW5nTWFzaygnMDAwMDAwMDAwJyl9XSxcblx0XHQnTVQnOiBbe21hc2s6IG5ldyBTdHJpbmdNYXNrKCcwMDAwMDAwMDAwLTAnKX1dLFxuXHRcdCdQQSc6IFt7bWFzazogbmV3IFN0cmluZ01hc2soJzAwLTAwMDAwMC0wJyl9XSxcblx0XHQnUEInOiBbe21hc2s6IG5ldyBTdHJpbmdNYXNrKCcwMDAwMDAwMC0wJyl9XSxcblx0XHQnUEUnOiBbe2NoYXJzOiA5LCBtYXNrOiBuZXcgU3RyaW5nTWFzaygnMDAwMDAwMC0wMCcpfSxcblx0XHRcdHttYXNrOiBuZXcgU3RyaW5nTWFzaygnMDAuMC4wMDAuMDAwMDAwMC0wJyl9XSxcblx0XHQnUEknOiBbe21hc2s6IG5ldyBTdHJpbmdNYXNrKCcwMDAwMDAwMDAnKX1dLFxuXHRcdCdQUic6IFt7bWFzazogbmV3IFN0cmluZ01hc2soJzAwMC4wMDAwMC0wMCcpfV0sXG5cdFx0J1JKJzogW3ttYXNrOiBuZXcgU3RyaW5nTWFzaygnMDAuMDAwLjAwLTAnKX1dLFxuXHRcdCdSTic6IFt7Y2hhcnM6IDksIG1hc2s6IG5ldyBTdHJpbmdNYXNrKCcwMC4wMDAuMDAwLTAnKX0sXG5cdFx0XHR7bWFzazogbmV3IFN0cmluZ01hc2soJzAwLjAuMDAwLjAwMC0wJyl9XSxcblx0XHQnUk8nOiBbe21hc2s6IG5ldyBTdHJpbmdNYXNrKCcwMDAwMDAwMDAwMDAwLTAnKX1dLFxuXHRcdCdSUic6IFt7bWFzazogbmV3IFN0cmluZ01hc2soJzAwMDAwMDAwLTAnKX1dLFxuXHRcdCdSUyc6IFt7bWFzazogbmV3IFN0cmluZ01hc2soJzAwMC8wMDAwMDAwJyl9XSxcblx0XHQnU0MnOiBbe21hc2s6IG5ldyBTdHJpbmdNYXNrKCcwMDAuMDAwLjAwMCcpfV0sXG5cdFx0J1NFJzogW3ttYXNrOiBuZXcgU3RyaW5nTWFzaygnMDAwMDAwMDAtMCcpfV0sXG5cdFx0J1NQJzogW3ttYXNrOiBuZXcgU3RyaW5nTWFzaygnMDAwLjAwMC4wMDAuMDAwJyl9LFxuXHRcdFx0e21hc2s6IG5ldyBTdHJpbmdNYXNrKCctMDAwMDAwMDAuMC8wMDAnKX1dLFxuXHRcdCdUTyc6IFt7bWFzazogbmV3IFN0cmluZ01hc2soJzAwMDAwMDAwMDAwJyl9XVxuXHR9O1xuXG5cdGZ1bmN0aW9uIGNsZWFyVmFsdWUodmFsdWUpIHtcblx0XHRpZiAoIXZhbHVlKSB7XG5cdFx0XHRyZXR1cm4gdmFsdWU7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHZhbHVlLnJlcGxhY2UoL1teMC05XS9nLCAnJyk7XG5cdH1cblxuXHRmdW5jdGlvbiBnZXRNYXNrKHVmLCB2YWx1ZSkge1xuXHRcdGlmICghdWYgfHwgIWllTWFza3NbdWZdKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0aWYgKHVmID09PSAnU1AnICYmIC9eUC9pLnRlc3QodmFsdWUpKSB7XG5cdFx0XHRyZXR1cm4gaWVNYXNrcy5TUFsxXS5tYXNrO1xuXHRcdH1cblxuXHRcdHZhciBtYXNrcyA9IGllTWFza3NbdWZdO1xuXHRcdHZhciBpID0gMDtcblx0XHR3aGlsZSAobWFza3NbaV0uY2hhcnMgJiYgbWFza3NbaV0uY2hhcnMgPCBjbGVhclZhbHVlKHZhbHVlKS5sZW5ndGggJiYgaSA8IG1hc2tzLmxlbmd0aCAtIDEpIHtcblx0XHRcdGkrKztcblx0XHR9XG5cblx0XHRyZXR1cm4gbWFza3NbaV0ubWFzaztcblx0fVxuXG5cdGZ1bmN0aW9uIGFwcGx5SUVNYXNrKHZhbHVlLCB1Zikge1xuXHRcdHZhciBtYXNrID0gZ2V0TWFzayh1ZiwgdmFsdWUpO1xuXG5cdFx0aWYgKCFtYXNrKSB7XG5cdFx0XHRyZXR1cm4gdmFsdWU7XG5cdFx0fVxuXG5cdFx0dmFyIHByb2Nlc3NlZCA9IG1hc2sucHJvY2VzcyhjbGVhclZhbHVlKHZhbHVlKSk7XG5cdFx0dmFyIGZvcm1hdGVkVmFsdWUgPSBwcm9jZXNzZWQucmVzdWx0IHx8ICcnO1xuXHRcdGZvcm1hdGVkVmFsdWUgPSBmb3JtYXRlZFZhbHVlLnRyaW0oKS5yZXBsYWNlKC9bXjAtOV0kLywgJycpO1xuXG5cdFx0aWYgKHVmID09PSAnU1AnICYmIC9ecC9pLnRlc3QodmFsdWUpKSB7XG5cdFx0XHRyZXR1cm4gJ1AnICsgZm9ybWF0ZWRWYWx1ZTtcblx0XHR9XG5cblx0XHRyZXR1cm4gZm9ybWF0ZWRWYWx1ZTtcblx0fVxuXG5cdHJldHVybiB7XG5cdFx0cmVzdHJpY3Q6ICdBJyxcblx0XHRyZXF1aXJlOiAnbmdNb2RlbCcsXG5cdFx0bGluazogZnVuY3Rpb24oc2NvcGUsIGVsZW1lbnQsIGF0dHJzLCBjdHJsKSB7XG5cdFx0XHR2YXIgc3RhdGUgPSAoJHBhcnNlKGF0dHJzLmZsdWlnSWVNYXNrKShzY29wZSkgfHwgJycpLnRvVXBwZXJDYXNlKCk7XG5cblx0XHRcdGZ1bmN0aW9uIGZvcm1hdHRlcih2YWx1ZSkge1xuXHRcdFx0XHRpZiAoY3RybC4kaXNFbXB0eSh2YWx1ZSkpIHtcblx0XHRcdFx0XHRyZXR1cm4gdmFsdWU7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRyZXR1cm4gYXBwbHlJRU1hc2sodmFsdWUsIHN0YXRlKTtcblx0XHRcdH1cblxuXHRcdFx0ZnVuY3Rpb24gcGFyc2VyKHZhbHVlKSB7XG5cdFx0XHRcdGlmIChjdHJsLiRpc0VtcHR5KHZhbHVlKSkge1xuXHRcdFx0XHRcdHJldHVybiB2YWx1ZTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHZhciBmb3JtYXRlZFZhbHVlID0gYXBwbHlJRU1hc2sodmFsdWUsIHN0YXRlKTtcblx0XHRcdFx0dmFyIGFjdHVhbFZhbHVlID0gY2xlYXJWYWx1ZShmb3JtYXRlZFZhbHVlKTtcblxuXHRcdFx0XHRpZiAoY3RybC4kdmlld1ZhbHVlICE9PSBmb3JtYXRlZFZhbHVlKSB7XG5cdFx0XHRcdFx0Y3RybC4kc2V0Vmlld1ZhbHVlKGZvcm1hdGVkVmFsdWUpO1xuXHRcdFx0XHRcdGN0cmwuJHJlbmRlcigpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYgKHN0YXRlICYmIHN0YXRlLnRvVXBwZXJDYXNlKCkgPT09ICdTUCcgJiYgL15wL2kudGVzdCh2YWx1ZSkpIHtcblx0XHRcdFx0XHRyZXR1cm4gJ1AnICsgYWN0dWFsVmFsdWU7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRyZXR1cm4gYWN0dWFsVmFsdWU7XG5cdFx0XHR9XG5cblx0XHRcdGN0cmwuJGZvcm1hdHRlcnMucHVzaChmb3JtYXR0ZXIpO1xuXHRcdFx0Y3RybC4kcGFyc2Vycy5wdXNoKHBhcnNlcik7XG5cblx0XHRcdGN0cmwuJHZhbGlkYXRvcnMuaWUgPSBmdW5jdGlvbiB2YWxpZGF0b3IobW9kZWxWYWx1ZSkge1xuXHRcdFx0XHRyZXR1cm4gY3RybC4kaXNFbXB0eShtb2RlbFZhbHVlKSB8fCBCclYuaWUoc3RhdGUpLnZhbGlkYXRlKG1vZGVsVmFsdWUpO1xuXHRcdFx0fTtcblxuXHRcdFx0c2NvcGUuJHdhdGNoKGF0dHJzLmZsdWlnSWVNYXNrLCBmdW5jdGlvbihuZXdTdGF0ZSkge1xuXHRcdFx0XHRzdGF0ZSA9IChuZXdTdGF0ZSB8fCAnJykudG9VcHBlckNhc2UoKTtcblxuXHRcdFx0XHRwYXJzZXIoY3RybC4kdmlld1ZhbHVlKTtcblx0XHRcdFx0Y3RybC4kdmFsaWRhdGUoKTtcblx0XHRcdH0pO1xuXHRcdH1cblx0fTtcbn1cbkZsdWlnSWVNYXNrRGlyZWN0aXZlLiRpbmplY3QgPSBbJyRwYXJzZSddO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEZsdWlnSWVNYXNrRGlyZWN0aXZlO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgU3RyaW5nTWFzayA9IHJlcXVpcmUoJ3N0cmluZy1tYXNrJyk7XG52YXIgbWFza0ZhY3RvcnkgPSByZXF1aXJlKCdtYXNrLWZhY3RvcnknKTtcblxudmFyIG5mZUFjY2Vzc0tleU1hc2sgPSBuZXcgU3RyaW5nTWFzaygnMDAwMCAwMDAwIDAwMDAgMDAwMCAwMDAwJyArXG5cdCcgMDAwMCAwMDAwIDAwMDAgMDAwMCAwMDAwIDAwMDAnKTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cdGRpcmVjdGl2ZTogbWFza0ZhY3Rvcnkoe1xuXHRcdGNsZWFyVmFsdWU6IGZ1bmN0aW9uIChyYXdWYWx1ZSkge1xuXHRcdFx0cmV0dXJuIHJhd1ZhbHVlLnJlcGxhY2UoL1teMC05XS9nLCAnJykuc2xpY2UoMCwgNDQpO1xuXHRcdH0sXG5cdFx0Zm9ybWF0OiBmdW5jdGlvbiAoY2xlYW5WYWx1ZSkge1xuXHRcdFx0cmV0dXJuIGZvcm1hdChjbGVhblZhbHVlKTtcblx0XHR9LFxuXHRcdHZhbGlkYXRpb25zOiB7XG5cdFx0XHRuZmVBY2Nlc3NLZXk6IGZ1bmN0aW9uICh2YWx1ZSkge1xuXHRcdFx0XHRyZXR1cm4gdmFsdWUubGVuZ3RoID09PSA0NDtcblx0XHRcdH1cblx0XHR9XG5cdH0pLFxuXHRmaWx0ZXI6IE5mZUZpbHRlclxufVxuXG5mdW5jdGlvbiBmb3JtYXQodmFsdWUpIHtcblx0cmV0dXJuIChuZmVBY2Nlc3NLZXlNYXNrLmFwcGx5KHZhbHVlKSB8fCAnJykucmVwbGFjZSgvW14wLTldJC8sICcnKTtcbn1cblxuZnVuY3Rpb24gTmZlRmlsdGVyKCRmaWx0ZXIpIHtcblx0cmV0dXJuIGZ1bmN0aW9uIChpbnB1dCkge1xuXHRcdHJldHVybiBmb3JtYXQoaW5wdXQpO1xuXHR9O1xufVxuTmZlRmlsdGVyLiRpbmplY3QgPSBbJyRmaWx0ZXInXTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBTdHJpbmdNYXNrID0gcmVxdWlyZSgnc3RyaW5nLW1hc2snKTtcbnZhciBtYXNrRmFjdG9yeSA9IHJlcXVpcmUoJ21hc2stZmFjdG9yeScpO1xuXG4vKipcbiAqIEZJWE1FOiBhbGwgbnVtYmVycyB3aWxsIGhhdmUgOSBkaWdpdHMgYWZ0ZXIgMjAxNi5cbiAqIHNlZSBodHRwOi8vcG9ydGFsLmVtYnJhdGVsLmNvbS5ici9lbWJyYXRlbC85LWRpZ2l0by9cbiAqL1xudmFyIHBob25lTWFzazhEID0gbmV3IFN0cmluZ01hc2soJygwMCkgMDAwMC0wMDAwJyksXG5cdHBob25lTWFzazlEID0gbmV3IFN0cmluZ01hc2soJygwMCkgMDAwMDAtMDAwMCcpLFxuXHRwaG9uZU1hc2s4RFNlbURERCA9IG5ldyBTdHJpbmdNYXNrKCcwMDAwLTAwMDAnKSxcblx0cGhvbmVNYXNrOURTZW1EREQgPSBuZXcgU3RyaW5nTWFzaygnMDAwMDAtMDAwMCcpLFxuXHRwaG9uZU1hc2swODAwID0gbmV3IFN0cmluZ01hc2soJzAwMDAtMDAwLTAwMDAnKTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cdGRpcmVjdGl2ZTogbWFza0ZhY3Rvcnkoe1xuXHRcdGNsZWFyVmFsdWU6IGZ1bmN0aW9uIChyYXdWYWx1ZSkge1xuXHRcdFx0cmV0dXJuIHJhd1ZhbHVlLnRvU3RyaW5nKCkucmVwbGFjZSgvW14wLTldL2csICcnKS5zbGljZSgwLCAxMSk7XG5cdFx0fSxcblx0XHRmb3JtYXQ6IGZ1bmN0aW9uIChjbGVhblZhbHVlKSB7XG5cdFx0XHRyZXR1cm4gZm9ybWF0KGNsZWFuVmFsdWUpXG5cdFx0fSxcblx0XHRnZXRNb2RlbFZhbHVlOiBmdW5jdGlvbiAoZm9ybWF0dGVkVmFsdWUsIG9yaWdpbmFsTW9kZWxUeXBlKSB7XG5cdFx0XHR2YXIgY2xlYW5WYWx1ZSA9IHRoaXMuY2xlYXJWYWx1ZShmb3JtYXR0ZWRWYWx1ZSk7XG5cblx0XHRcdHJldHVybiBvcmlnaW5hbE1vZGVsVHlwZSA9PT0gJ251bWJlcicgPyBwYXJzZUludChjbGVhblZhbHVlKSA6IGNsZWFuVmFsdWU7XG5cdFx0fSxcblx0XHR2YWxpZGF0aW9uczoge1xuXHRcdFx0cGhvbmVOdW1iZXI6IGZ1bmN0aW9uICh2YWx1ZSkge1xuXHRcdFx0XHR2YXIgdmFsdWVMZW5ndGggPSB2YWx1ZSAmJiB2YWx1ZS50b1N0cmluZygpLmxlbmd0aDtcblx0XHRcdFx0cmV0dXJuIHZhbHVlTGVuZ3RoID09PSA4IHx8IHZhbHVlTGVuZ3RoID09PSA5IHx8IHZhbHVlTGVuZ3RoID09PSAxMCB8fCB2YWx1ZUxlbmd0aCA9PT0gMTE7XG5cdFx0XHR9XG5cdFx0fVxuXHR9KSxcblx0ZmlsdGVyOiBCclBob25lRmlsdGVyXG59XG5cbmZ1bmN0aW9uIGZvcm1hdCh2YWx1ZSkge1xuXG5cdGlmICghdmFsdWUpIHJldHVybiBcIlwiO1xuXG5cdHZhciBmb3JtYXRlZFZhbHVlO1xuXHRpZiAodmFsdWUuaW5kZXhPZignMDgwMCcpID09PSAwKSB7XG5cdFx0Zm9ybWF0ZWRWYWx1ZSA9IHBob25lTWFzazA4MDAuYXBwbHkodmFsdWUpO1xuXHR9IGVsc2UgaWYgKHZhbHVlLmxlbmd0aCA8IDkpIHtcblx0XHRmb3JtYXRlZFZhbHVlID0gcGhvbmVNYXNrOERTZW1EREQuYXBwbHkodmFsdWUpIHx8ICcnO1xuXHR9IGVsc2UgaWYgKHZhbHVlLmxlbmd0aCA8IDEwKSB7XG5cdFx0Zm9ybWF0ZWRWYWx1ZSA9IHBob25lTWFzazlEU2VtRERELmFwcGx5KHZhbHVlKSB8fCAnJztcblx0fSBlbHNlIGlmICh2YWx1ZS5sZW5ndGggPCAxMSkge1xuXHRcdGZvcm1hdGVkVmFsdWUgPSBwaG9uZU1hc2s4RC5hcHBseSh2YWx1ZSkgfHwgJyc7XG5cdH0gZWxzZSB7XG5cdFx0Zm9ybWF0ZWRWYWx1ZSA9IHBob25lTWFzazlELmFwcGx5KHZhbHVlKTtcblx0fVxuXG5cdHJldHVybiBmb3JtYXRlZFZhbHVlLnRyaW0oKS5yZXBsYWNlKC9bXjAtOV0kLywgJycpO1xufVxuXG5mdW5jdGlvbiBCclBob25lRmlsdGVyKCRmaWx0ZXIpIHtcblx0cmV0dXJuIGZ1bmN0aW9uIChpbnB1dCkge1xuXHRcdHJldHVybiBmb3JtYXQoaW5wdXQpO1xuXHR9O1xufVxuQnJQaG9uZUZpbHRlci4kaW5qZWN0ID0gWyckZmlsdGVyJ107IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgbSA9IGFuZ3VsYXIubW9kdWxlKCdhbmd1bGFyLmZpbHRlcnMnLCBbXG4gICAgICAgIHJlcXVpcmUoJy4uL2hlbHBlcnMnKSxcbiAgICBdKVxuICAgIC5maWx0ZXIoJ3BhZ2luYXRpb24nLCByZXF1aXJlKCcuL3BhZ2luYXRpb24vcGFnaW5hdGlvbicpKVxuXG5tb2R1bGUuZXhwb3J0cyA9IG0ubmFtZTsiLCIndXNlIHN0cmljdCc7XG5cbmZ1bmN0aW9uIFBhZ2luYXRpb25GaWx0ZXIoKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKGlucHV0LCBzdGFydCkge1xuICAgICAgICBzdGFydCA9ICtzdGFydDtcblxuICAgICAgICBpZiAoIWlucHV0KSByZXR1cm4gMDtcbiAgICAgICAgcmV0dXJuIGlucHV0LnNsaWNlKHN0YXJ0KTtcbiAgICB9O1xufTtcblxuXG5tb2R1bGUuZXhwb3J0cyA9IFBhZ2luYXRpb25GaWx0ZXI7IiwiJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBBdXRvY29tcGxldGVEaXJlY3RpdmUoJGxvY2FsZSwgJHdpbmRvdywgJHRpbWVvdXQsICRjb21waWxlKSB7XG5cbiAgICByZXR1cm4ge1xuICAgICAgICByZXN0cmljdDogJ0EnLFxuICAgICAgICByZXF1aXJlOiAnP25nTW9kZWwnLFxuICAgICAgICBzY29wZToge1xuICAgICAgICAgICAgZGF0YXNldDogXCJAXCIsXG4gICAgICAgICAgICBmbHVpZ0F1dG9jb21wbGV0ZUxpbWl0OiBcIkBcIixcbiAgICAgICAgICAgIGZsdWlnQXV0b2NvbXBsZXRlVHlwZTogXCJAXCIsXG4gICAgICAgICAgICBtaW5MZW5ndGg6IFwiQFwiLFxuICAgICAgICAgICAgZmlsdGVyRmllbGRzOiBcIj1cIixcbiAgICAgICAgICAgIHJlc3VsdEZpZWxkczogXCI9XCIsXG4gICAgICAgICAgICBkaXNwbGF5S2V5OiBcIkBcIixcbiAgICAgICAgICAgIHNlYXJjaFRpbWVvdXQ6IFwiQFwiLFxuICAgICAgICAgICAgdmFsdWVzOiBcIj1cIixcbiAgICAgICAgICAgIGFjU2VsZWN0ZWQ6IFwiJlwiXG4gICAgICAgIH0sXG4gICAgICAgIGxpbms6IGZ1bmN0aW9uIChzY29wZSwgZWxlbWVudCwgYXR0cnMsIGN0cmwpIHtcblxuICAgICAgICAgICAgdmFyIGZsdWlnQXV0b2NvbXBsZXRlID0gYXR0cnMuZmx1aWdBdXRvY29tcGxldGU7XG5cbiAgICAgICAgICAgIGlmIChmbHVpZ0F1dG9jb21wbGV0ZSA9PSAnZmFsc2UnKSByZXR1cm47XG5cbiAgICAgICAgICAgIGlmICghY3RybCkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ25nTW9kZWwgbsOjbyBpbmZvcm1hZG8gcGFyYSBvIGVsZW1lbnRvOicsIGVsZW1lbnRbMF0pO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgc2NvcGUuZGlzcGxheUtleSA9IHNjb3BlLmRpc3BsYXlLZXkgfHwgJ25hbWUnO1xuICAgICAgICAgICAgc2NvcGUuZmx1aWdBdXRvY29tcGxldGVMaW1pdCA9IHNjb3BlLmZsdWlnQXV0b2NvbXBsZXRlTGltaXQgfHwgMTAwO1xuICAgICAgICAgICAgc2NvcGUuZmx1aWdBdXRvY29tcGxldGVUeXBlID0gc2NvcGUuZmx1aWdBdXRvY29tcGxldGVUeXBlIHx8ICdhdXRvY29tcGxldGUnO1xuICAgICAgICAgICAgc2NvcGUubWluTGVuZ3RoID0gTnVtYmVyKGF0dHJzLm1pbkxlbmd0aCkgfHwgMDtcbiAgICAgICAgICAgIHNjb3BlLnNlYXJjaFRpbWVvdXQgPSBhdHRycy5zZWFyY2hUaW1lb3V0IHx8IDUwMDtcblxuICAgICAgICAgICAgZWxlbWVudC5vbignZm9jdXMnLCBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgICAgICAgICBpZiAoISR3aW5kb3cuZ2V0U2VsZWN0aW9uKCkudG9TdHJpbmcoKSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNldFNlbGVjdGlvblJhbmdlKDAsIHRoaXMudmFsdWUubGVuZ3RoKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBzY29wZS4kd2F0Y2goJ2ZpbHRlckZpZWxkcycsIGZ1bmN0aW9uICh2YWwsIG9sZHZhbCkge1xuXG4gICAgICAgICAgICAgICAgaWYgKChvbGR2YWwgfHwgdmFsKSAmJiB2YWwgIT0gb2xkdmFsKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgLy9jcmVhdGVBdXRvY29tcGxldGUoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgc2NvcGUuJHdhdGNoKCdyZXN1bHRGaWVsZHMnLCBmdW5jdGlvbiAodmFsLCBvbGR2YWwpIHtcblxuICAgICAgICAgICAgICAgIGlmICgob2xkdmFsIHx8IHZhbCkgJiYgdmFsICE9IG9sZHZhbCkge1xuICAgICAgICAgICAgICAgICAgICAvL2NyZWF0ZUF1dG9jb21wbGV0ZSgpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHNjb3BlLiR3YXRjaCgndmFsdWVzJywgZnVuY3Rpb24gKHZhbCwgb2xkdmFsKSB7XG5cbiAgICAgICAgICAgICAgICBpZiAoKG9sZHZhbCB8fCB2YWwpICYmIHZhbCAhPSBvbGR2YWwpIHtcbiAgICAgICAgICAgICAgICAgICAgY3JlYXRlQXV0b2NvbXBsZXRlKCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9KVxuXG4gICAgICAgICAgICBzY29wZS4kd2F0Y2goJ2RhdGFzZXQnLCBmdW5jdGlvbiAodmFsLCBvbGR2YWwpIHtcblxuICAgICAgICAgICAgICAgIGlmICgob2xkdmFsIHx8IHZhbCkgJiYgdmFsICE9IG9sZHZhbCkge1xuICAgICAgICAgICAgICAgICAgICBjcmVhdGVBdXRvY29tcGxldGUoKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH0pXG5cbiAgICAgICAgICAgIGNyZWF0ZUF1dG9jb21wbGV0ZSgpXG5cblxuICAgICAgICAgICAgZnVuY3Rpb24gbG9hZERhdGEoYXJyKSB7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24gKHR4dCwgZm5jKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciByZXN1bHQsIGYsIGZpbHRlcjtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gW10sXG4gICAgICAgICAgICAgICAgICAgICAgICBmaWx0ZXIgPSBuZXcgUmVnRXhwKCh0eHQubm9ybWFsaXplID8gdHh0Lm5vcm1hbGl6ZShcIk5GRFwiKSA6IHR4dCkucmVwbGFjZSgvW1xcdTAzMDAtXFx1MDM2Zl0vZywgXCJcIiksIFwiaVwiKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICQuZWFjaChhcnIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24gKGFyciwgb2JqKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBvYmoyO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzY29wZS5yZXN1bHRGaWVsZHMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9iajIgPSB7fTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNjb3BlLnJlc3VsdEZpZWxkcy5mb3JFYWNoKGZ1bmN0aW9uIChmKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb2JqMltmXSA9IG9ialtmXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvYmoyID0gb2JqO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKChzY29wZS5kaXNwbGF5S2V5ICYmIGZpbHRlci50ZXN0KChTdHJpbmcob2JqMltzY29wZS5kaXNwbGF5S2V5XSkubm9ybWFsaXplID8gU3RyaW5nKG9iajJbc2NvcGUuZGlzcGxheUtleV0pLm5vcm1hbGl6ZShcIk5GRFwiKSA6IFN0cmluZyhvYmoyW3Njb3BlLmRpc3BsYXlLZXldKSkucmVwbGFjZSgvW1xcdTAzMDAtXFx1MDM2Zl0vZywgXCJcIikpKSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKCFzY29wZS5kaXNwbGF5S2V5ICYmIGZpbHRlci50ZXN0KEpTT04uc3RyaW5naWZ5KG9iajIpKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSAmJiByZXN1bHQubGVuZ3RoIDwgc2NvcGUuZmx1aWdBdXRvY29tcGxldGVMaW1pdCAmJiByZXN1bHQucHVzaChvYmoyKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pLCBmbmMocmVzdWx0KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIGNyZWF0ZUF1dG9jb21wbGV0ZSgpIHtcblxuICAgICAgICAgICAgICAgIGlmICghc2NvcGUuZGF0YXNldCAmJiAhc2NvcGUudmFsdWVzKSByZXR1cm47XG5cbiAgICAgICAgICAgICAgICBpZiAoc2NvcGUuYXV0b2NvbXBsZXRlKSB7XG4gICAgICAgICAgICAgICAgICAgIHNjb3BlLmF1dG9jb21wbGV0ZS5kZXN0cm95KCk7XG4gICAgICAgICAgICAgICAgICAgIHNjb3BlLmF1dG9jb21wbGV0ZSA9IG51bGw7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdmFyIGZpbHRlckZpZWxkcyA9ICcnO1xuICAgICAgICAgICAgICAgIGlmIChzY29wZS5maWx0ZXJGaWVsZHMpIHtcbiAgICAgICAgICAgICAgICAgICAgZmlsdGVyRmllbGRzID0gc2NvcGUuZmlsdGVyRmllbGRzLmpvaW4oKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB2YXIgcmVzdWx0RmllbGRzID0gJyc7XG4gICAgICAgICAgICAgICAgaWYgKHNjb3BlLnJlc3VsdEZpZWxkcykge1xuICAgICAgICAgICAgICAgICAgICByZXN1bHRGaWVsZHMgPSBzY29wZS5yZXN1bHRGaWVsZHMuam9pbigpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChzY29wZS5kYXRhc2V0KSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciByZXN0VXJsID0gXCIvYXBpL3B1YmxpYy9lY20vZGF0YXNldC9zZWFyY2g/ZGF0YXNldElkPVwiICsgc2NvcGUuZGF0YXNldCArIFwiJnNlYXJjaEZpZWxkPVwiICsgc2NvcGUuZGlzcGxheUtleSArIFwiJmZpbHRlckZpZWxkcz1cIiArIGZpbHRlckZpZWxkcyArIFwiJnJlc3VsdEZpZWxkcz1cIiArIHJlc3VsdEZpZWxkcyArIFwiJmxpbWl0PVwiICsgc2NvcGUuZmx1aWdBdXRvY29tcGxldGVMaW1pdCArIFwiJlwiO1xuXG4gICAgICAgICAgICAgICAgICAgIHZhciBzb3VyY2UgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB1cmw6IHJlc3RVcmwsXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXR0ZXJuS2V5OiBcInNlYXJjaFZhbHVlXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICByb290OiBcImNvbnRlbnRcIlxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBzb3VyY2UgPSBsb2FkRGF0YShzY29wZS52YWx1ZXMpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmICghc2NvcGUuYXV0b2NvbXBsZXRlKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgc2NvcGUuYXV0b2NvbXBsZXRlID0gRkxVSUdDLmF1dG9jb21wbGV0ZShlbGVtZW50LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzb3VyY2U6IHNvdXJjZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGhpZ2hsaWdodDogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpc3BsYXlLZXk6IHNjb3BlLmRpc3BsYXlLZXksXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiBzY29wZS5mbHVpZ0F1dG9jb21wbGV0ZVR5cGUsXG4gICAgICAgICAgICAgICAgICAgICAgICBtaW5MZW5ndGg6IE51bWJlcihzY29wZS5taW5MZW5ndGgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGltaXQ6IHNjb3BlLmZsdWlnQXV0b2NvbXBsZXRlTGltaXQsXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWFyY2hUaW1lb3V0OiBzY29wZS5zZWFyY2hUaW1lb3V0XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgIHNjb3BlLmF1dG9jb21wbGV0ZVxuICAgICAgICAgICAgICAgICAgICAgICAgLm9uKCdmbHVpZy5hdXRvY29tcGxldGUub3BlbmVkJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vZWxlbWVudC5wYXJlbnQoKS5hZGRDbGFzcyhcImFjdGl2ZVwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAub24oJ2ZsdWlnLmF1dG9jb21wbGV0ZS5jbG9zZWQnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9lbGVtZW50LnBhcmVudCgpLnJlbW92ZUNsYXNzKFwiYWN0aXZlXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgIC5vbignZmx1aWcuYXV0b2NvbXBsZXRlLnNlbGVjdGVkJywgZnVuY3Rpb24gKHJlc3VsdCkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5ibHVyKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkdGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzY29wZS5mbHVpZ0F1dG9jb21wbGV0ZVR5cGUgPT0gJ2F1dG9jb21wbGV0ZScpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN0cmwuJHNldFZpZXdWYWx1ZShyZXN1bHQuaXRlbSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdHJsLiRzZXRWaWV3VmFsdWUoc2NvcGUuYXV0b2NvbXBsZXRlLml0ZW1zKCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhdHRycy5mbHVpZ09uU2VsZWN0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzY29wZS4kYXBwbHkoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNjb3BlLiRldmFsKGF0dHJzLmZsdWlnT25TZWxlY3QpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzY29wZS5hY1NlbGVjdGVkKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAub24oJ2ZsdWlnLmF1dG9jb21wbGV0ZS5pdGVtUmVtb3ZlZCcsIGZ1bmN0aW9uIChyZXN1bHQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoc2NvcGUuZmx1aWdBdXRvY29tcGxldGVUeXBlID09ICdhdXRvY29tcGxldGUnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN0cmwuJHNldFZpZXdWYWx1ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN0cmwuJHNldFZpZXdWYWx1ZShzY29wZS5hdXRvY29tcGxldGUuaXRlbXMoKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIGZvcm1hdHRlcih2YWx1ZSkge1xuXG4gICAgICAgICAgICAgICAgdmFyIGFjID0gW107XG5cbiAgICAgICAgICAgICAgICBpZiAoc2NvcGUuZmx1aWdBdXRvY29tcGxldGVUeXBlID09ICdhdXRvY29tcGxldGUnKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjdHJsLiRpc0VtcHR5KHZhbHVlKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChzY29wZS5hdXRvY29tcGxldGUpIHNjb3BlLmF1dG9jb21wbGV0ZS52YWwodmFsdWVbc2NvcGUuZGlzcGxheUtleV0pO1xuICAgICAgICAgICAgICAgICAgICBhYy5wdXNoKHZhbHVlW3Njb3BlLmRpc3BsYXlLZXldKTtcblxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChzY29wZS5hdXRvY29tcGxldGUpIHNjb3BlLmF1dG9jb21wbGV0ZS5yZW1vdmVBbGwoKTtcbiAgICAgICAgICAgICAgICAgICAgYW5ndWxhci5mb3JFYWNoKHZhbHVlLCBmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHNjb3BlLmF1dG9jb21wbGV0ZSkgc2NvcGUuYXV0b2NvbXBsZXRlLmFkZChpdGVtKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFjLnB1c2goaXRlbVtzY29wZS5kaXNwbGF5S2V5XSk7XG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIGN0cmwuJHNldFZpZXdWYWx1ZSh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcmV0dXJuIGFjLmpvaW4oKTtcblxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjdHJsLiRmb3JtYXR0ZXJzLnB1c2goZm9ybWF0dGVyKTtcbiAgICAgICAgICAgIGVsZW1lbnQuYXR0cigncGxhY2Vob2xkZXInLCAnRGlnaXRlIHBhcmEgYnVzY2FyLi4uJylcblxuICAgICAgICAgICAgLy8gdmFyIHRlbXBsYXRlID0gJGNvbXBpbGUoJzxkaXYgY2xhc3M9XCJpbnB1dC1ncm91cFwiPjxzcGFuIGNsYXNzPVwiaW5wdXQtZ3JvdXAtYWRkb25cIj48aSBjbGFzcz1cImZsdWlnaWNvbiBmbHVpZ2ljb24tc2VhcmNoXCI+PC9pPjwvc3Bhbj48L2Rpdj4nKShzY29wZSk7XG5cbiAgICAgICAgICAgIC8vIGVsZW1lbnQuYWZ0ZXIodGVtcGxhdGUpO1xuICAgICAgICAgICAgLy8gdGVtcGxhdGUuYXBwZW5kKGVsZW1lbnQpO1xuXG4gICAgICAgIH1cbiAgICB9O1xufVxuXG5BdXRvY29tcGxldGVEaXJlY3RpdmUuJGluamVjdCA9IFsnJGxvY2FsZScsICckd2luZG93JywgJyR0aW1lb3V0JywgJyRjb21waWxlJ107XG5cbm1vZHVsZS5leHBvcnRzID0gQXV0b2NvbXBsZXRlRGlyZWN0aXZlOyIsIid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gQ2hhcnREaXJlY3RpdmUoJGxvY2FsZSwgJHdpbmRvdykge1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgcmVzdHJpY3Q6ICdBJyxcbiAgICAgICAgc2NvcGU6IHtcbiAgICAgICAgICAgIGNoYXJ0VHlwZTogXCJAXCIsXG4gICAgICAgICAgICBjaGFydExhYmVsczogXCI9XCIsXG4gICAgICAgICAgICBjaGFydERhdGFzZXRzOiBcIj1cIlxuICAgICAgICB9LFxuICAgICAgICBsaW5rOiBmdW5jdGlvbiAoc2NvcGUsIGVsZW1lbnQsIGF0dHJzKSB7XG5cbiAgICAgICAgICAgIHZhciBmbHVpZ0NoYXJ0ID0gYXR0cnMuZmx1aWdDaGFydDtcbiAgICAgICAgICAgIHZhciBkZWZhdWx0RmlsbENvbG9yID0gW1xuICAgICAgICAgICAgICAgIFwicmdiYSgyNiwgMTg4LCAxNTYsMC4yKVwiLFxuICAgICAgICAgICAgICAgIFwicmdiYSg1MiwgMTUyLCAyMTksMC4yKVwiLFxuICAgICAgICAgICAgICAgIFwicmdiYSgxNTUsIDg5LCAxODIsMC4yKVwiLFxuICAgICAgICAgICAgICAgIFwicmdiYSg1MiwgNzMsIDk0LDAuMilcIixcbiAgICAgICAgICAgICAgICBcInJnYmEoMjMwLCAxMjYsIDM0LDAuMilcIixcbiAgICAgICAgICAgICAgICBcInJnYmEoMjMxLCA3NiwgNjAsMC4yKVwiLFxuICAgICAgICAgICAgICAgIFwicmdiYSgxNDksIDE2NSwgMTY2LDAuMilcIixcbiAgICAgICAgICAgICAgICBcInJnYmEoMjQxLCAxOTYsIDE1LDAuMilcIixcbiAgICAgICAgICAgICAgICBcInJnYmEoMjM2LCAyNDAsIDI0MSwwLjIpXCJcbiAgICAgICAgICAgIF1cbiAgICAgICAgICAgIHZhciBkZWZhdWx0U3Ryb2tlQ29sb3IgPSBbXG4gICAgICAgICAgICAgICAgXCJyZ2JhKDI2LCAxODgsIDE1NiwxLjApXCIsXG4gICAgICAgICAgICAgICAgXCJyZ2JhKDUyLCAxNTIsIDIxOSwxLjApXCIsXG4gICAgICAgICAgICAgICAgXCJyZ2JhKDE1NSwgODksIDE4MiwxLjApXCIsXG4gICAgICAgICAgICAgICAgXCJyZ2JhKDUyLCA3MywgOTQsMS4wKVwiLFxuICAgICAgICAgICAgICAgIFwicmdiYSgyMzAsIDEyNiwgMzQsMS4wKVwiLFxuICAgICAgICAgICAgICAgIFwicmdiYSgyMzEsIDc2LCA2MCwxLjApXCIsXG4gICAgICAgICAgICAgICAgXCJyZ2JhKDE0OSwgMTY1LCAxNjYsMS4wKVwiLFxuICAgICAgICAgICAgICAgIFwicmdiYSgyNDEsIDE5NiwgMTUsMS4wKVwiLFxuICAgICAgICAgICAgICAgIFwicmdiYSgyMzYsIDI0MCwgMjQxLDEuMClcIlxuICAgICAgICAgICAgXVxuXG4gICAgICAgICAgICB2YXIgZGVmYXVsdFBvaW50Q29sb3IgPSBkZWZhdWx0U3Ryb2tlQ29sb3I7XG5cbiAgICAgICAgICAgIHZhciBkZWZhdWx0UG9pbnRTdHJva2VDb2xvciA9IFtcbiAgICAgICAgICAgICAgICBcIiNmZmZcIiwgXCIjZmZmXCIsIFwiI2ZmZlwiLCBcIiNmZmZcIiwgXCIjZmZmXCIsIFwiI2ZmZlwiLCBcIiNmZmZcIiwgXCIjZmZmXCIsIFwiI2ZmZlwiXG4gICAgICAgICAgICBdXG5cbiAgICAgICAgICAgIHZhciBkZWZhdWx0UG9pbnRIaWdobGlnaHRGaWxsID0gZGVmYXVsdFBvaW50U3Ryb2tlQ29sb3I7XG4gICAgICAgICAgICB2YXIgZGVmYXVsdFBvaW50SGlnaGxpZ2h0U3Ryb2tlID0gZGVmYXVsdFN0cm9rZUNvbG9yO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiAoZmx1aWdDaGFydCA9PSAnZmFsc2UnKSByZXR1cm47XG5cbiAgICAgICAgICAgIHZhciBjaGFydDtcblxuICAgICAgICAgICAgc2NvcGUuJHdhdGNoKCdjaGFydFR5cGUnLCBmdW5jdGlvbiAodmFsLCBvbGR2YWwpIHtcbiAgICAgICAgICAgICAgICBjcmVhdGVDaGFydCgpO1xuICAgICAgICAgICAgfSlcblxuICAgICAgICAgICAgc2NvcGUuJHdhdGNoKCdjaGFydExhYmVscycsIGZ1bmN0aW9uICh2YWwsIG9sZHZhbCkge1xuICAgICAgICAgICAgICAgIGNyZWF0ZUNoYXJ0KCk7XG4gICAgICAgICAgICB9KVxuXG4gICAgICAgICAgICBzY29wZS4kd2F0Y2goJ2NoYXJ0RGF0YScsIGZ1bmN0aW9uICh2YWwsIG9sZHZhbCkge1xuICAgICAgICAgICAgICAgIGNyZWF0ZUNoYXJ0KCk7XG4gICAgICAgICAgICB9KVxuXG4gICAgICAgICAgICBjcmVhdGVDaGFydCgpXG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIGNyZWF0ZUNoYXJ0KCkge1xuXG4gICAgICAgICAgICAgICAgaWYgKCFzY29wZS5jaGFydExhYmVscyB8fCAhc2NvcGUuY2hhcnREYXRhc2V0cyB8fCAhc2NvcGUuY2hhcnRUeXBlKSByZXR1cm47XG5cbiAgICAgICAgICAgICAgICBpZiAoY2hhcnQpIHtcblxuICAgICAgICAgICAgICAgICAgICBjaGFydC5kZXN0cm95KCk7XG4gICAgICAgICAgICAgICAgICAgIGNoYXJ0ID0gbnVsbDtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoIWNoYXJ0KSB7XG5cbiAgICAgICAgICAgICAgICAgICAgY2hhcnQgPSBGTFVJR0MuY2hhcnQoZWxlbWVudCk7XG5cbiAgICAgICAgICAgICAgICAgICAgc2NvcGUuY2hhcnREYXRhc2V0cy5mb3JFYWNoKGZ1bmN0aW9uIChkYXRhc2V0LCBpbmRleCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YXNldC5maWxsQ29sb3IgPSBkYXRhc2V0LmZpbGxDb2xvciB8fCBkZWZhdWx0RmlsbENvbG9yW2luZGV4XTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFzZXQuc3Ryb2tlQ29sb3IgPSBkYXRhc2V0LnN0cm9rZUNvbG9yIHx8IGRlZmF1bHRTdHJva2VDb2xvcltpbmRleF07XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhc2V0LnBvaW50Q29sb3IgPSBkYXRhc2V0LnBvaW50Q29sb3IgfHwgZGVmYXVsdFBvaW50Q29sb3JbaW5kZXhdO1xuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YXNldC5wb2ludFN0cm9rZUNvbG9yID0gZGF0YXNldC5wb2ludFN0cm9rZUNvbG9yIHx8IGRlZmF1bHRQb2ludFN0cm9rZUNvbG9yW2luZGV4XTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFzZXQucG9pbnRIaWdobGlnaHRGaWxsID0gZGF0YXNldC5wb2ludEhpZ2hsaWdodEZpbGwgfHwgZGVmYXVsdFBvaW50SGlnaGxpZ2h0RmlsbFtpbmRleF07XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhc2V0LnBvaW50SGlnaGxpZ2h0U3Ryb2tlID0gZGF0YXNldC5wb2ludEhpZ2hsaWdodFN0cm9rZSB8fCBkZWZhdWx0UG9pbnRIaWdobGlnaHRTdHJva2VbaW5kZXhdO1xuICAgICAgICAgICAgICAgICAgICB9KVxuXG4gICAgICAgICAgICAgICAgICAgIHZhciBkYXRhID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWxzOiBzY29wZS5jaGFydExhYmVscyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFzZXRzOiBzY29wZS5jaGFydERhdGFzZXRzXG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBzd2l0Y2ggKHNjb3BlLmNoYXJ0VHlwZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcImxpbmVcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGFydC5saW5lKGRhdGEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcbn1cblxuQ2hhcnREaXJlY3RpdmUuJGluamVjdCA9IFsnJGxvY2FsZScsICckd2luZG93J107XG5cbm1vZHVsZS5leHBvcnRzID0gQ2hhcnREaXJlY3RpdmU7IiwiJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBEYXRlTWFza0RpcmVjdGl2ZSgkbG9jYWxlLCAkY29tcGlsZSwgJHRpbWVvdXQsICRwYXJzZSkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHJlc3RyaWN0OiAnQScsXG4gICAgICAgIHJlcXVpcmU6ICc/bmdNb2RlbCcsXG4gICAgICAgIHNjb3BlOiB7XG4gICAgICAgICAgICBzaG93RGlzYWJsZWQ6IFwiQFwiLFxuICAgICAgICAgICAgZGVmYXVsdERhdGU6IFwiPVwiLFxuICAgICAgICAgICAgbWluRGF0ZTogXCI9XCIsXG4gICAgICAgICAgICBtYXhEYXRlOiBcIj1cIixcbiAgICAgICAgICAgIHVzZUN1cnJlbnQ6ICdAJyxcbiAgICAgICAgICAgIHNob3dPblN0YXJ0OiAnQCcsXG4gICAgICAgICAgICBkaXNhYmxlZERhdGVzOiAnPScsXG4gICAgICAgICAgICBzaWRlQnlTaWRlOiAnQCcsXG4gICAgICAgICAgICBkYXRlUGF0dGVybjogXCJAXCIsXG4gICAgICAgICAgICBkYXRlTG9jYWxlOiBcIkBcIlxuXG4gICAgICAgIH0sXG4gICAgICAgIGxpbms6IGZ1bmN0aW9uIChzY29wZSwgZWxlbWVudCwgYXR0cnMsIGN0cmwpIHtcblxuICAgICAgICAgICAgaWYgKGF0dHJzLmZsdWlnRGF0ZU1hc2sgPT09IFwiZmFsc2VcIikgcmV0dXJuO1xuXG4gICAgICAgICAgICB2YXIgZHQgPSBGTFVJR0MuY2FsZW5kYXIoZWxlbWVudCwge1xuICAgICAgICAgICAgICAgIHBpY2tEYXRlOiBhdHRycy5waWNrRGF0ZSxcbiAgICAgICAgICAgICAgICBwaWNrVGltZTogYXR0cnMucGlja1RpbWUsXG4gICAgICAgICAgICAgICAgZGlzYWJsZWREYXRlczogc2NvcGUuZGlzYWJsZWREYXRlcyxcbiAgICAgICAgICAgICAgICBtaW5EYXRlOiBzY29wZS5taW5EYXRlLFxuICAgICAgICAgICAgICAgIG1heERhdGU6IHNjb3BlLm1heERhdGUsXG4gICAgICAgICAgICAgICAgZGVmYXVsdERhdGU6IHNjb3BlLmRlZmF1bHREYXRlLFxuICAgICAgICAgICAgICAgIG1pbnV0ZVN0ZXBwaW5nOiBhdHRycy5taW51dGVTdGVwcGluZyxcbiAgICAgICAgICAgICAgICBzaWRlQnlTaWRlOiBzY29wZS5zaWRlQnlTaWRlLFxuICAgICAgICAgICAgICAgIHVzZUN1cnJlbnQ6IHNjb3BlLnVzZUN1cnJlbnQgPT0gJ2ZhbHNlJyA/IGZhbHNlIDogdHJ1ZVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGlmIChzY29wZS5zaG93T25TdGFydCA9PSAndHJ1ZScpIHtcbiAgICAgICAgICAgICAgICBkdC5zaG93KCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChzY29wZS5zaG93RGlzYWJsZWQpIHtcblxuICAgICAgICAgICAgICAgIGVsZW1lbnQucHJvcCgncmVhZG9ubHknLCB0cnVlKTtcbiAgICAgICAgICAgICAgICBlbGVtZW50Lm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgZHQuc2hvdygpO1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGVsZW1lbnQub24oJ2NoYW5nZScsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBjaGFuZ2UoKVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIGNoYW5nZSgpIHtcblxuICAgICAgICAgICAgICAgIGlmIChkdC5nZXREYXRlKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGRhdGUgPSBuZXcgRGF0ZShkdC5nZXREYXRlKCkpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWF0dHJzLnBpY2tUaW1lKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRlLnNldEhvdXJzKDEyLCAwLCAwKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGN0cmwuJHNldFZpZXdWYWx1ZShkYXRlLmdldFRpbWUoKSk7XG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQudmFsKEZMVUlHQy5jYWxlbmRhci5mb3JtYXREYXRlKGRhdGUsIHNjb3BlLmRhdGVQYXR0ZXJuLCBzY29wZS5kYXRlTG9jYWxlKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZnVuY3Rpb24gZm9ybWF0dGVyKHZhbHVlKSB7XG5cbiAgICAgICAgICAgICAgICBpZiAoY3RybC4kaXNFbXB0eSh2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGR0LnNldERhdGUobmV3IERhdGUoTnVtYmVyKHZhbHVlKSkpO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIEZMVUlHQy5jYWxlbmRhci5mb3JtYXREYXRlKG5ldyBEYXRlKE51bWJlcih2YWx1ZSkpLCBzY29wZS5kYXRlUGF0dGVybiwgc2NvcGUuZGF0ZUxvY2FsZSk7XG4gICAgICAgICAgICAgICAgLy8gcmV0dXJuIGVsZW1lbnQudmFsKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGN0cmwuJGZvcm1hdHRlcnMucHVzaChmb3JtYXR0ZXIpO1xuXG4gICAgICAgICAgICB2YXIgdGVtcGxhdGUgPSAkY29tcGlsZSgnPGRpdiBjbGFzcz1cImlucHV0LWdyb3VwXCIgPjxzcGFuIGNsYXNzPVwiaW5wdXQtZ3JvdXAtYWRkb25cIj48aSBjbGFzcz1cImZsdWlnaWNvbiBmbHVpZ2ljb24tY2FsZW5kYXJcIj48L2k+PC9zcGFuPjwvZGl2PicpKHNjb3BlKTtcblxuICAgICAgICAgICAgZWxlbWVudC5hZnRlcih0ZW1wbGF0ZSk7XG4gICAgICAgICAgICB0ZW1wbGF0ZS5hcHBlbmQoZWxlbWVudCk7XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG5EYXRlTWFza0RpcmVjdGl2ZS4kaW5qZWN0ID0gWyckbG9jYWxlJywgJyRjb21waWxlJywgJyR0aW1lb3V0JywgJyRwYXJzZSddO1xuXG5tb2R1bGUuZXhwb3J0cyA9IERhdGVNYXNrRGlyZWN0aXZlOyIsIid1c2Ugc3RyaWN0JztcblxudmFyIG0gPSBhbmd1bGFyLm1vZHVsZSgnYW5ndWxhci5mbHVpZy51dGlscycsIFtcbiAgICAgICAgcmVxdWlyZSgnLi4vaGVscGVycycpLFxuICAgIF0pXG5cbiAgICAuZGlyZWN0aXZlKCdmbHVpZ0F1dG9jb21wbGV0ZScsIHJlcXVpcmUoJy4vYXV0b2NvbXBsZXRlL2F1dG9jb21wbGV0ZScpKVxuICAgIC5kaXJlY3RpdmUoJ2ZsdWlnQ2hhcnQnLCByZXF1aXJlKCcuL2NoYXJ0L2NoYXJ0JykpXG4gICAgLmRpcmVjdGl2ZSgnZmx1aWdEYXRlTWFzaycsIHJlcXVpcmUoJy4vZGF0ZS9kYXRlJykpXG4gICAgLmRpcmVjdGl2ZSgnZmx1aWdIZWFkZXInLCByZXF1aXJlKCcuL2hlYWRlci9oZWFkZXInKSlcbiAgICAuZGlyZWN0aXZlKCdmbHVpZ1JlcXVpcmVkJywgcmVxdWlyZSgnLi9yZXF1aXJlZC9yZXF1aXJlZCcpKVxuICAgIFxuICAgIC5kaXJlY3RpdmUoJ2ZsdWlnU3dpdGNoJywgcmVxdWlyZSgnLi9zd2l0Y2gvc3dpdGNoJykpXG4gICAgLmRpcmVjdGl2ZSgnZmx1aWdQb3BvdmVyJywgcmVxdWlyZSgnLi9wb3BvdmVyL3BvcG92ZXInKSlcblxubW9kdWxlLmV4cG9ydHMgPSBtLm5hbWU7IiwiJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBIZWFkZXJEaXJlY3RpdmUoJGxvY2FsZSkge1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgcmVzdHJpY3Q6ICdBJyxcbiAgICAgICAgcmVxdWlyZTogJz9uZ01vZGVsJyxcbiAgICAgICAgbGluazogZnVuY3Rpb24gKHNjb3BlLCBlbGVtZW50LCBhdHRycywgY3RybCkge1xuXG4gICAgICAgICAgICB2YXIgdGl0bGUgPSBhdHRycy5mbHVpZ0hlYWRlciB8fCAkKGRvY3VtZW50KS5maW5kKFwidGl0bGVcIikudGV4dCgpO1xuICAgICAgICAgICAgdmFyIGxvZ28gPSBhdHRycy5sb2dvIHx8ICcvcG9ydGFsL3Jlc291cmNlcy9pbWFnZXMvbG9nby5wbmcnO1xuICAgICAgICAgICAgdmFyIGhlaWdodCA9IGF0dHJzLmhlaWdodCB8fCAnODAnO1xuXG4gICAgICAgICAgICB2YXIgaHRtbCA9ICc8ZGl2IGNsYXNzPVwicm93XCI+JztcbiAgICAgICAgICAgIHZhciBoID0gXCJoMVwiO1xuXG4gICAgICAgICAgICBpZiAodGl0bGUubGVuZ3RoID4gNTQpIHtcbiAgICAgICAgICAgICAgICBoID0gXCJoNFwiO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0aXRsZS5sZW5ndGggPiA0Mykge1xuICAgICAgICAgICAgICAgIGggPSBcImgzXCI7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRpdGxlLmxlbmd0aCA+IDM0KSB7XG4gICAgICAgICAgICAgICAgaCA9IFwiaDJcIjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaHRtbCArPSAnPGRpdiBjbGFzcz1cImNvbC14cy02XCI+JztcbiAgICAgICAgICAgIGh0bWwgKz0gXCI8aW1nIHNyYz0nXCIgKyBsb2dvICsgXCInIGlkPSdsb2dvJyBjbGFzcz0nbG9nbycgaGVpZ2h0PSdcIiArIGhlaWdodCArIFwiJyBhbHQ9J0xvZ28nIHRpdGxlPSdMb2dvJyBib3JkZXI9JzAnIC8+XCI7XG4gICAgICAgICAgICBodG1sICs9ICc8L2Rpdj4nO1xuICAgICAgICAgICAgaHRtbCArPSAnPGRpdiBjbGFzcz1cImNvbC14cy02XCI+JztcbiAgICAgICAgICAgIGh0bWwgKz0gJzwnICsgaCArICcgY2xhc3M9XCJ0ZXh0LXJpZ2h0XCI+JyArIHRpdGxlICsgJzwvJyArIGggKyAnPic7XG4gICAgICAgICAgICBodG1sICs9ICc8L2Rpdj4nO1xuICAgICAgICAgICAgaHRtbCArPSAnPC9kaXY+JztcblxuICAgICAgICAgICAgZWxlbWVudC5wcmVwZW5kKGh0bWwpO1xuXG4gICAgICAgIH1cbiAgICB9O1xufVxuXG5IZWFkZXJEaXJlY3RpdmUuJGluamVjdCA9IFsnJGxvY2FsZSddO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEhlYWRlckRpcmVjdGl2ZTsiLCIndXNlIHN0cmljdCc7XG5cbmZ1bmN0aW9uIFBvcG92ZXJEaXJlY3RpdmUoJGNvbXBpbGUpIHtcblxuICAgIHJldHVybiB7XG4gICAgICAgIHJlc3RyaWN0OiAnQScsXG4gICAgICAgIGxpbms6IGZ1bmN0aW9uKHNjb3BlLCBlbGVtZW50LCBhdHRycykge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB2YXIgdHJpZ2dlciA9IGF0dHJzLnRyaWdnZXIgfHwgJ2hvdmVyJztcbiAgICAgICAgICAgIHZhciBwbGFjZW1lbnQgPSBhdHRycy5wbGFjZW1lbnQgfHwgJ2F1dG8nO1xuICAgICAgICAgICAgdmFyIGNvbnRlbnQgPSBhdHRycy5mbHVpZ0NvbnRlbnQgfHwgYXR0cnMuZGF0YUNvbnRlbnQgfHwgJyc7XG5cbiAgICAgICAgICAgIEZMVUlHQy5wb3BvdmVyKGVsZW1lbnQsIHsgdHJpZ2dlcjogdHJpZ2dlciwgcGxhY2VtZW50OiBwbGFjZW1lbnQsIGNvbnRlbnQ6IGNvbnRlbnQgfSk7XG5cbiAgICAgICAgfVxuICAgIH1cbn1cblxuUG9wb3ZlckRpcmVjdGl2ZS4kaW5qZWN0ID0gWyckY29tcGlsZSddO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFBvcG92ZXJEaXJlY3RpdmU7IiwiJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBSZXF1aXJlZERpcmVjdGl2ZSgkY29tcGlsZSkge1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgcmVzdHJpY3Q6ICdBJyxcbiAgICAgICAgcmVxdWlyZTogJz9uZ01vZGVsJyxcbiAgICAgICAgbGluazogZnVuY3Rpb24oc2NvcGUsIGVsZW1lbnQsIGF0dHJzLCBjdHJsKSB7XG4gICAgICAgICAgICBpZiAoIWN0cmwpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCduZ01vZGVsIG7Do28gaW5mb3JtYWRvIHBhcmEgbyBlbGVtZW50bzonLCBlbGVtZW50WzBdKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICghY3RybCB8fCAhYXR0cnMuZmx1aWdSZXF1aXJlZCkgcmV0dXJuO1xuICAgICAgICAgICAgYXR0cnMucmVxdWlyZWQgPSB0cnVlOyAvLyBmb3JjZSB0cnV0aHkgaW4gY2FzZSB3ZSBhcmUgb24gbm9uIGlucHV0IGVsZW1lbnRcblxuICAgICAgICAgICAgdmFyIHZhbGlkYXRvciA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgaWYgKGF0dHJzLnJlcXVpcmVkICYmICh2YWx1ZSA9PSAnJyB8fCB2YWx1ZSA9PT0gZmFsc2UpKSB7XG4gICAgICAgICAgICAgICAgICAgIGN0cmwuJHNldFZhbGlkaXR5KCdyZXF1aXJlZCcsIGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGN0cmwuJHNldFZhbGlkaXR5KCdyZXF1aXJlZCcsIHRydWUpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgY3RybC4kZm9ybWF0dGVycy5wdXNoKHZhbGlkYXRvcik7XG4gICAgICAgICAgICBjdHJsLiRwYXJzZXJzLnVuc2hpZnQodmFsaWRhdG9yKTtcblxuICAgICAgICAgICAgYXR0cnMuJG9ic2VydmUoJ2ZsdWlnUmVxdWlyZWQnLCBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAgICAgICAgIHZhciBsYWJlbCA9ICQoXCJsYWJlbFtmb3I9J1wiICsgZWxlbWVudC5hdHRyKCduYW1lJykgKyBcIiddXCIpO1xuXG4gICAgICAgICAgICAgICAgaWYgKHZhbHVlID09PSBcInRydWVcIikge1xuICAgICAgICAgICAgICAgICAgICBsYWJlbC5hZGRDbGFzcyhcInJlcXVpcmVkXCIpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGxhYmVsLnJlbW92ZUNsYXNzKFwicmVxdWlyZWRcIik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHZhbGlkYXRvcihjdHJsLiR2aWV3VmFsdWUpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cblJlcXVpcmVkRGlyZWN0aXZlLiRpbmplY3QgPSBbJyRjb21waWxlJ107XG5cbm1vZHVsZS5leHBvcnRzID0gUmVxdWlyZWREaXJlY3RpdmU7IiwiJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBTd2l0Y2hEaXJlY3RpdmUoJGNvbXBpbGUsICR0aW1lb3V0KSB7XG5cbiAgICByZXR1cm4ge1xuICAgICAgICByZXN0cmljdDogJ0EnLFxuICAgICAgICByZXF1aXJlOiAnP25nTW9kZWwnLFxuICAgICAgICBzY29wZToge1xuICAgICAgICAgICAgbmdSZWFkb25seTogXCI9XCIsXG4gICAgICAgICAgICBuZ0Rpc2FibGVkOiBcIj1cIlxuICAgICAgICB9LFxuICAgICAgICBsaW5rOiBmdW5jdGlvbiAoc2NvcGUsIGVsZW1lbnQsIGF0dHJzLCBjdHJsKSB7XG5cbiAgICAgICAgICAgIGlmICghY3RybCkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ25nTW9kZWwgbsOjbyBpbmZvcm1hZG8gcGFyYSBvIGVsZW1lbnRvOicsIGVsZW1lbnRbMF0pO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc29sZS5sb2coJ3N3aXRjaGVyJyk7XG5cbiAgICAgICAgICAgIHZhciB0ZW1wbGF0ZSA9ICRjb21waWxlKCc8ZGl2IHN0eWxlPVwid2lkdGg6IDExMHB4XCI+PC9kaXY+Jykoc2NvcGUpO1xuXG4gICAgICAgICAgICBlbGVtZW50LmFmdGVyKHRlbXBsYXRlKTtcbiAgICAgICAgICAgIHRlbXBsYXRlLmFwcGVuZChlbGVtZW50KTtcblxuICAgICAgICAgICAgdGVtcGxhdGUuaGlkZSgpO1xuXG4gICAgICAgICAgICBzY29wZS4kd2F0Y2goJ25nUmVhZG9ubHknLCBmdW5jdGlvbiAodmFsLCBvbGR2YWwpIHtcbiAgICAgICAgICAgICAgICBGTFVJR0Muc3dpdGNoZXIuaXNSZWFkT25seShlbGVtZW50LCB2YWwpO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIHNjb3BlLiR3YXRjaCgnbmdEaXNhYmxlZCcsIGZ1bmN0aW9uICh2YWwsIG9sZHZhbCkge1xuICAgICAgICAgICAgICAgIGlmICh2YWwpIHtcbiAgICAgICAgICAgICAgICAgICAgRkxVSUdDLnN3aXRjaGVyLmRpc2FibGUoZWxlbWVudCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgRkxVSUdDLnN3aXRjaGVyLmVuYWJsZShlbGVtZW50KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KVxuXG4gICAgICAgICAgICAkdGltZW91dChmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgICAgICAgICBGTFVJR0Muc3dpdGNoZXIuaW5pdChlbGVtZW50LCB7XG4gICAgICAgICAgICAgICAgICAgIFwic3RhdGVcIjogY3RybC4kbW9kZWxWYWx1ZVxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgaWYgKGN0cmwuJG1vZGVsVmFsdWUgPT0gdHJ1ZSB8fCBjdHJsLiRtb2RlbFZhbHVlID09ICd0cnVlJykge1xuICAgICAgICAgICAgICAgICAgICAkdGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBGTFVJR0Muc3dpdGNoZXIuc2V0VHJ1ZShlbGVtZW50KTtcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBGTFVJR0Muc3dpdGNoZXIub25DaGFuZ2UoZWxlbWVudCwgZnVuY3Rpb24gKGV2ZW50LCBzdGF0ZSkge1xuICAgICAgICAgICAgICAgICAgICBjdHJsLiRzZXRWaWV3VmFsdWUoc3RhdGUpO1xuICAgICAgICAgICAgICAgICAgICBjdHJsLiRyZW5kZXIoKTtcblxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGUuZmFkZUluKCk7XG4gICAgICAgICAgICAgICAgfSwgMTApO1xuICAgICAgICAgICAgfSwgMTApO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5Td2l0Y2hEaXJlY3RpdmUuJGluamVjdCA9IFsnJGNvbXBpbGUnLCAnJHRpbWVvdXQnXTtcblxubW9kdWxlLmV4cG9ydHMgPSBTd2l0Y2hEaXJlY3RpdmU7IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgU3RyaW5nTWFzayA9IHJlcXVpcmUoJ3N0cmluZy1tYXNrJyk7XG52YXIgbWFza0ZhY3RvcnkgPSByZXF1aXJlKCdtYXNrLWZhY3RvcnknKTtcblxudmFyIGNjU2l6ZSA9IDE2O1xuXG52YXIgY2NNYXNrID0gbmV3IFN0cmluZ01hc2soJzAwMDAgMDAwMCAwMDAwIDAwMDAnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBtYXNrRmFjdG9yeSh7XG5cdGNsZWFyVmFsdWU6IGZ1bmN0aW9uKHJhd1ZhbHVlKSB7XG5cdFx0cmV0dXJuIHJhd1ZhbHVlLnRvU3RyaW5nKCkucmVwbGFjZSgvW14wLTldL2csICcnKS5zbGljZSgwLCBjY1NpemUpO1xuXHR9LFxuXHRmb3JtYXQ6IGZ1bmN0aW9uKGNsZWFuVmFsdWUpIHtcblx0XHR2YXIgZm9ybWF0ZWRWYWx1ZTtcblxuXHRcdGZvcm1hdGVkVmFsdWUgPSBjY01hc2suYXBwbHkoY2xlYW5WYWx1ZSkgfHwgJyc7XG5cblx0XHRyZXR1cm4gZm9ybWF0ZWRWYWx1ZS50cmltKCkucmVwbGFjZSgvW14wLTldJC8sICcnKTtcblx0fSxcblx0dmFsaWRhdGlvbnM6IHtcblx0XHRjcmVkaXRDYXJkOiBmdW5jdGlvbih2YWx1ZSkge1xuXHRcdFx0dmFyIHZhbHVlTGVuZ3RoID0gdmFsdWUgJiYgdmFsdWUudG9TdHJpbmcoKS5sZW5ndGg7XG5cdFx0XHRyZXR1cm4gdmFsdWVMZW5ndGggPT09IGNjU2l6ZTtcblx0XHR9XG5cdH1cbn0pO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgbWVzc2FnZXMgPSByZXF1aXJlKCcuL21lc3NhZ2VzJyk7XG5cbmZ1bmN0aW9uIEVycm9yRGlyZWN0aXZlKCRjb21waWxlLCAkdGltZW91dCkge1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgcmVzdHJpY3Q6ICdBJyxcbiAgICAgICAgcmVxdWlyZTogJz9uZ01vZGVsJyxcbiAgICAgICAgbGluazogZnVuY3Rpb24gKHNjb3BlLCBlbGVtZW50LCBhdHRycywgY3RybCkge1xuICAgICAgICAgICAgaWYgKCFjdHJsKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcignbmdNb2RlbCBuw6NvIGluZm9ybWFkbyBwYXJhIG8gZWxlbWVudG86JywgZWxlbWVudFswXSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgd2F0Y2hBdHRyID0gYXR0cnMuZmx1aWdFcnJvcjtcblxuICAgICAgICAgICAgc2NvcGUuJHdhdGNoQ29sbGVjdGlvbih3YXRjaEF0dHIsIGZ1bmN0aW9uICh2YWx1ZXMpIHtcblxuICAgICAgICAgICAgICAgIHZhciBlcnJvciA9IFwiXCI7XG5cbiAgICAgICAgICAgICAgICBhbmd1bGFyLmZvckVhY2godmFsdWVzLCBmdW5jdGlvbiAodmFsdWUsIGtleSkge1xuXG4gICAgICAgICAgICAgICAgICAgIGlmICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG1lc3NhZ2VzW2tleV0pIGVycm9yICs9IG1lc3NhZ2VzW2tleV0gKyBcIjxicj5cIjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgZWxlbWVudC5wb3BvdmVyKCdkZXN0cm95Jyk7XG5cbiAgICAgICAgICAgICAgICB2YXIgbGFiZWwgPSAkKFwibGFiZWxbZm9yPSdcIiArIGVsZW1lbnQuYXR0cignbmFtZScpICsgXCInXVwiKTtcblxuICAgICAgICAgICAgICAgIGlmIChlcnJvciAhPSAnJykge1xuXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsLnBhcmVudCgpXG4gICAgICAgICAgICAgICAgICAgICAgICAuYWRkQ2xhc3MoXCJoYXMtZXJyb3JcIik7XG5cbiAgICAgICAgICAgICAgICAgICAgRkxVSUdDLnBvcG92ZXIoZWxlbWVudCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgaHRtbDogJ3RydWUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgdHJpZ2dlcjogJ2ZvY3VzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBsYWNlbWVudDogJ3RvcCcsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250ZW50OiBlcnJvclxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgLy9lbGVtZW50LnBvcG92ZXIoJ3Nob3cnKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBsYWJlbC5wYXJlbnQoKVxuICAgICAgICAgICAgICAgICAgICAgICAgLnJlbW92ZUNsYXNzKFwiaGFzLWVycm9yXCIpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbkVycm9yRGlyZWN0aXZlLiRpbmplY3QgPSBbJyRjb21waWxlJywgJyR0aW1lb3V0J107XG5cbm1vZHVsZS5leHBvcnRzID0gRXJyb3JEaXJlY3RpdmU7IiwidmFyIG1lc3NhZ2VzID0ge1xuICAgIFwicmVxdWlyZWRcIjogXCJPIGNhbXBvIMOpIG9icmlnYXTDs3Jpb1wiLFxuICAgIFwibWlubGVuZ3RoXCI6IFwiTyB0YW1hbmhvIGRvIGNhbXBvIMOpIGluZmVyaW9yIGFvIG3DrW5pbW8gcGVybWl0aWRvXCIsXG4gICAgXCJtYXhsZW5ndGhcIjogXCJPIHRhbWFuaG8gZG8gY2FtcG8gw6kgc3VwZXJpb3IgYW8gbcOheGltbyBwZXJtaXRpZG9cIixcbiAgICBcIm1pblwiOiBcIk8gdmFsb3IgaW5mb3JtYWRvIMOpIGluZmVyaW9yIGFvIG3DrW5pbW9cIixcbiAgICBcIm1heFwiOiBcIk8gdmFsb3IgaW5mb3JtYWRvIMOpIHN1cGVyaW9yIGFvIG3DoXhpbW9cIixcbiAgICBcImNwZlwiOiBcIk8gQ1BGIGluZm9ybWFkbyDDqSBpbnbDoWxpZG9cIixcbiAgICBcInRpbWVcIjogXCJPIGhvcsOhcmlvIGluZm9ybWFkbyDDqSBpbnbDoWxpZG9cIixcbiAgICBcImNucGpcIjogXCJPIENOUEogaW5mb3JtYWRvIMOpIGludsOhbGlkb1wiLFxuICAgIFwicGhvbmVOdW1iZXJcIjogXCJPIHRlbGVmb25lIGluZm9ybWFkbyDDqSBpbnbDoWxpZG9cIixcbiAgICBcImNlcFwiOiBcIk8gQ0VQIGluZm9ybWFkbyDDqSBpbnbDoWxpZG9cIixcbiAgICBcImllXCI6IFwiSW5zY3Jpw6fDo28gZXN0YWR1YWwgaW52w6FsaWRhXCIsXG4gICAgXCJjYXJQbGF0ZVwiOiBcIkEgcGxhY2EgaW5mb3JtYWRhIMOpIGludsOhbGlkYVwiLFxuICAgIFwiY3JlZGl0Q2FyZFwiOiBcIk8gbsO6bWVybyBkZSBjYXJ0w6NvIGRlIGNyw6lkaXRvIGluZm9ybWFkbyDDqSBpbnbDoWxpZG9cIixcbiAgICBcImJvbGV0b0JhbmNhcmlvXCI6IFwiTyBuw7ptZXJvIGRvIGJvbGV0byBiYW5jw6FyaW8gaW5mb3JtYWRvIMOpIGludsOhbGlkb1wiLFxuICAgIFwibmZlQWNjZXNzS2V5XCI6IFwiQ2hhdmUgZGUgYWNlc3NvIGludsOhbGlkYVwiXG5cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBtZXNzYWdlczsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBtID0gYW5ndWxhci5tb2R1bGUoJ2ZsdWlnLmdsb2JhbC5tYXNrcycsIFtcbiAgICAgICAgcmVxdWlyZSgnLi4vaGVscGVycycpLFxuICAgIF0pXG4gICAgLmRpcmVjdGl2ZSgnZmx1aWdNb25leU1hc2snLCByZXF1aXJlKCcuL21vbmV5L21vbmV5JykpXG4gICAgLmRpcmVjdGl2ZSgnZmx1aWdOdW1iZXJNYXNrJywgcmVxdWlyZSgnLi9udW1iZXIvbnVtYmVyJykpXG4gICAgLmRpcmVjdGl2ZSgnZmx1aWdQZXJjZW50YWdlTWFzaycsIHJlcXVpcmUoJy4vcGVyY2VudGFnZS9wZXJjZW50YWdlJykpXG4gICAgLmRpcmVjdGl2ZSgnZmx1aWdTY2llbnRpZmljTm90YXRpb25NYXNrJywgcmVxdWlyZSgnLi9zY2llbnRpZmljLW5vdGF0aW9uL3NjaWVudGlmaWMtbm90YXRpb24nKSlcbiAgICAuZGlyZWN0aXZlKCdmbHVpZ1RpbWVNYXNrJywgcmVxdWlyZSgnLi90aW1lL3RpbWUnKSlcbiAgICAuZGlyZWN0aXZlKCdmbHVpZ0NyZWRpdENhcmQnLCByZXF1aXJlKCcuL2NyZWRpdC1jYXJkL2NyZWRpdC1jYXJkJykpXG4gICAgLmRpcmVjdGl2ZSgnZmx1aWdFcnJvcicsIHJlcXVpcmUoJy4vZXJyb3IvZXJyb3InKSlcbiAgICAuZGlyZWN0aXZlKCduZ05hbWUnLCByZXF1aXJlKCcuL25hbWUvbmFtZScpKVxuXG4gICAgLmZpbHRlcigncGVyY2VudGFnZScsIHJlcXVpcmUoJy4vcGVyY2VudGFnZS9wZXJjZW50YWdlLWZpbHRlcicpKVxuICAgIC5maWx0ZXIoJ3RpbWUnLCByZXF1aXJlKCcuL3RpbWUvdGltZS1maWx0ZXInKSlcblxuXG5tb2R1bGUuZXhwb3J0cyA9IG0ubmFtZTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBTdHJpbmdNYXNrID0gcmVxdWlyZSgnc3RyaW5nLW1hc2snKTtcbnZhciB2YWxpZGF0b3JzID0gcmVxdWlyZSgndmFsaWRhdG9ycycpO1xuXG5mdW5jdGlvbiBNb25leU1hc2tEaXJlY3RpdmUoJGxvY2FsZSwgJHBhcnNlLCAkY29tcGlsZSwgUHJlRm9ybWF0dGVycykge1xuICAgIHJldHVybiB7XG4gICAgICAgIHJlc3RyaWN0OiAnQScsXG4gICAgICAgIHJlcXVpcmU6ICduZ01vZGVsJyxcbiAgICAgICAgbGluazogZnVuY3Rpb24oc2NvcGUsIGVsZW1lbnQsIGF0dHJzLCBjdHJsKSB7XG5cbiAgICAgICAgICAgIGlmIChhdHRycy5mbHVpZ01vbmV5TWFzayA9PT0gXCJmYWxzZVwiKSByZXR1cm47XG5cbiAgICAgICAgICAgIHZhciBkZWNpbWFsRGVsaW1pdGVyID0gJGxvY2FsZS5OVU1CRVJfRk9STUFUUy5ERUNJTUFMX1NFUCxcbiAgICAgICAgICAgICAgICB0aG91c2FuZHNEZWxpbWl0ZXIgPSAkbG9jYWxlLk5VTUJFUl9GT1JNQVRTLkdST1VQX1NFUCxcbiAgICAgICAgICAgICAgICBjdXJyZW5jeVN5bSA9ICRsb2NhbGUuTlVNQkVSX0ZPUk1BVFMuQ1VSUkVOQ1lfU1lNLFxuICAgICAgICAgICAgICAgIHN5bWJvbFNlcGFyYXRpb24gPSAnICcsXG4gICAgICAgICAgICAgICAgZGVjaW1hbHMgPSAkcGFyc2UoYXR0cnMuZmx1aWdNb25leU1hc2spKHNjb3BlKTtcblxuXG4gICAgICAgICAgICBmdW5jdGlvbiBtYXNrRmFjdG9yeShkZWNpbWFscykge1xuICAgICAgICAgICAgICAgIHZhciBkZWNpbWFsc1BhdHRlcm4gPSBkZWNpbWFscyA+IDAgPyBkZWNpbWFsRGVsaW1pdGVyICsgbmV3IEFycmF5KGRlY2ltYWxzICsgMSkuam9pbignMCcpIDogJyc7XG4gICAgICAgICAgICAgICAgdmFyIG1hc2tQYXR0ZXJuID0gc3ltYm9sU2VwYXJhdGlvbiArICcjJyArIHRob3VzYW5kc0RlbGltaXRlciArICcjIzAnICsgZGVjaW1hbHNQYXR0ZXJuO1xuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgU3RyaW5nTWFzayhtYXNrUGF0dGVybiwgeyByZXZlcnNlOiB0cnVlIH0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoYW5ndWxhci5pc0RlZmluZWQoYXR0cnMuZmx1aWdIaWRlU3BhY2UpICYmIGF0dHJzLmZsdWlnSGlkZVNwYWNlICE9ICdmYWxzZScpIHtcbiAgICAgICAgICAgICAgICBzeW1ib2xTZXBhcmF0aW9uID0gJyc7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChhbmd1bGFyLmlzRGVmaW5lZChhdHRycy5jdXJyZW5jeVN5bWJvbCkpIHtcbiAgICAgICAgICAgICAgICBjdXJyZW5jeVN5bSA9IGF0dHJzLmN1cnJlbmN5U3ltYm9sO1xuICAgICAgICAgICAgICAgIGlmIChhdHRycy5jdXJyZW5jeVN5bWJvbC5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgc3ltYm9sU2VwYXJhdGlvbiA9ICcnO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGlzTmFOKGRlY2ltYWxzKSkge1xuICAgICAgICAgICAgICAgIGRlY2ltYWxzID0gMjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGRlY2ltYWxzID0gcGFyc2VJbnQoZGVjaW1hbHMpO1xuICAgICAgICAgICAgdmFyIG1vbmV5TWFzayA9IG1hc2tGYWN0b3J5KGRlY2ltYWxzKTtcblxuICAgICAgICAgICAgZnVuY3Rpb24gZm9ybWF0dGVyKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgaWYgKGN0cmwuJGlzRW1wdHkodmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdmFyIHByZWZpeCA9IChhbmd1bGFyLmlzRGVmaW5lZChhdHRycy5mbHVpZ05lZ2F0aXZlTnVtYmVyKSAmJiB2YWx1ZSA8IDApID8gJy0nIDogJyc7XG4gICAgICAgICAgICAgICAgdmFyIHZhbHVlVG9Gb3JtYXQgPSBQcmVGb3JtYXR0ZXJzLnByZXBhcmVOdW1iZXJUb0Zvcm1hdHRlcih2YWx1ZSwgZGVjaW1hbHMpO1xuICAgICAgICAgICAgICAgIHJldHVybiBwcmVmaXggKyBtb25leU1hc2suYXBwbHkodmFsdWVUb0Zvcm1hdCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIHBhcnNlcih2YWx1ZSkge1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIChjdHJsLiRpc0VtcHR5KHZhbHVlKSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdmFyIGFjdHVhbE51bWJlciA9IHZhbHVlLnJlcGxhY2UoL1teXFxkXSsvZywgJycpO1xuICAgICAgICAgICAgICAgIGFjdHVhbE51bWJlciA9IGFjdHVhbE51bWJlci5yZXBsYWNlKC9eWzBdKyhbMS05XSkvLCAnJDEnKTtcbiAgICAgICAgICAgICAgICBhY3R1YWxOdW1iZXIgPSBhY3R1YWxOdW1iZXIgfHwgJzAnO1xuICAgICAgICAgICAgICAgIHZhciBmb3JtYXRlZFZhbHVlID0gbW9uZXlNYXNrLmFwcGx5KGFjdHVhbE51bWJlcik7XG5cbiAgICAgICAgICAgICAgICBpZiAoYW5ndWxhci5pc0RlZmluZWQoYXR0cnMuZmx1aWdOZWdhdGl2ZU51bWJlcikpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGlzTmVnYXRpdmUgPSAodmFsdWVbMF0gPT09ICctJyksXG4gICAgICAgICAgICAgICAgICAgICAgICBuZWVkc1RvSW52ZXJ0U2lnbiA9ICh2YWx1ZS5zbGljZSgtMSkgPT09ICctJyk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy9vbmx5IGFwcGx5IHRoZSBtaW51cyBzaWduIGlmIGl0IGlzIG5lZ2F0aXZlIG9yKGV4Y2x1c2l2ZSlcbiAgICAgICAgICAgICAgICAgICAgLy9uZWVkcyB0byBiZSBuZWdhdGl2ZSBhbmQgdGhlIG51bWJlciBpcyBkaWZmZXJlbnQgZnJvbSB6ZXJvXG4gICAgICAgICAgICAgICAgICAgIGlmIChuZWVkc1RvSW52ZXJ0U2lnbiBeIGlzTmVnYXRpdmUgJiYgISFhY3R1YWxOdW1iZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFjdHVhbE51bWJlciAqPSAtMTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvcm1hdGVkVmFsdWUgPSAnLScgKyBmb3JtYXRlZFZhbHVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKHZhbHVlICE9PSBmb3JtYXRlZFZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgIGN0cmwuJHNldFZpZXdWYWx1ZShmb3JtYXRlZFZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgY3RybC4kcmVuZGVyKCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZvcm1hdGVkVmFsdWUgPyBwYXJzZUludChmb3JtYXRlZFZhbHVlLnJlcGxhY2UoL1teXFxkXFwtXSsvZywgJycpKSAvIE1hdGgucG93KDEwLCBkZWNpbWFscykgOiBudWxsO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjdHJsLiRmb3JtYXR0ZXJzLnB1c2goZm9ybWF0dGVyKTtcbiAgICAgICAgICAgIGN0cmwuJHBhcnNlcnMucHVzaChwYXJzZXIpO1xuXG4gICAgICAgICAgICBpZiAoYXR0cnMuZmx1aWdNb25leU1hc2spIHtcbiAgICAgICAgICAgICAgICBzY29wZS4kd2F0Y2goYXR0cnMuZmx1aWdNb25leU1hc2ssIGZ1bmN0aW9uKF9kZWNpbWFscykge1xuICAgICAgICAgICAgICAgICAgICBkZWNpbWFscyA9IGlzTmFOKF9kZWNpbWFscykgPyAyIDogX2RlY2ltYWxzO1xuICAgICAgICAgICAgICAgICAgICBkZWNpbWFscyA9IHBhcnNlSW50KGRlY2ltYWxzKTtcbiAgICAgICAgICAgICAgICAgICAgbW9uZXlNYXNrID0gbWFza0ZhY3RvcnkoZGVjaW1hbHMpO1xuXG4gICAgICAgICAgICAgICAgICAgIHBhcnNlcihjdHJsLiR2aWV3VmFsdWUpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuXG5cblxuICAgICAgICAgICAgaWYgKGF0dHJzLmZsdWlnSGlkZUdyb3VwU2VwKSB7XG4gICAgICAgICAgICAgICAgc2NvcGUuJHdhdGNoKGF0dHJzLmZsdWlnSGlkZUdyb3VwU2VwLCBmdW5jdGlvbihfaGlkZUdyb3VwU2VwKSB7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBpZiAoX2hpZGVHcm91cFNlcCA9PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aG91c2FuZHNEZWxpbWl0ZXIgPSAnJztcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRob3VzYW5kc0RlbGltaXRlciA9ICRsb2NhbGUuTlVNQkVSX0ZPUk1BVFMuR1JPVVBfU0VQO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIG1vbmV5TWFzayA9IG1hc2tGYWN0b3J5KGRlY2ltYWxzKTtcbiAgICAgICAgICAgICAgICAgICAgcGFyc2VyKGN0cmwuJHZpZXdWYWx1ZSk7XG5cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGF0dHJzLm1pbikge1xuICAgICAgICAgICAgICAgIHZhciBtaW5WYWw7XG5cbiAgICAgICAgICAgICAgICBjdHJsLiR2YWxpZGF0b3JzLm1pbiA9IGZ1bmN0aW9uKG1vZGVsVmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHZhbGlkYXRvcnMubWluTnVtYmVyKGN0cmwsIG1vZGVsVmFsdWUsIG1pblZhbCk7XG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIHNjb3BlLiR3YXRjaChhdHRycy5taW4sIGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgIG1pblZhbCA9IHZhbHVlO1xuICAgICAgICAgICAgICAgICAgICBjdHJsLiR2YWxpZGF0ZSgpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoYXR0cnMubWF4KSB7XG4gICAgICAgICAgICAgICAgdmFyIG1heFZhbDtcblxuICAgICAgICAgICAgICAgIGN0cmwuJHZhbGlkYXRvcnMubWF4ID0gZnVuY3Rpb24obW9kZWxWYWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdmFsaWRhdG9ycy5tYXhOdW1iZXIoY3RybCwgbW9kZWxWYWx1ZSwgbWF4VmFsKTtcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgc2NvcGUuJHdhdGNoKGF0dHJzLm1heCwgZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgbWF4VmFsID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIGN0cmwuJHZhbGlkYXRlKCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciB0ZW1wbGF0ZSA9ICRjb21waWxlKCc8ZGl2IGNsYXNzPVwiaW5wdXQtZ3JvdXBcIiA+PHNwYW4gY2xhc3M9XCJpbnB1dC1ncm91cC1hZGRvblwiPjxiPicgKyBjdXJyZW5jeVN5bSArICc8L2I+PC9zcGFuPjwvZGl2PicpKHNjb3BlKTtcblxuICAgICAgICAgICAgZWxlbWVudC5hZnRlcih0ZW1wbGF0ZSk7XG4gICAgICAgICAgICB0ZW1wbGF0ZS5hcHBlbmQoZWxlbWVudCk7XG4gICAgICAgIH1cbiAgICB9O1xufVxuTW9uZXlNYXNrRGlyZWN0aXZlLiRpbmplY3QgPSBbJyRsb2NhbGUnLCAnJHBhcnNlJywgJyRjb21waWxlJywgJ1ByZUZvcm1hdHRlcnMnXTtcblxubW9kdWxlLmV4cG9ydHMgPSBNb25leU1hc2tEaXJlY3RpdmU7IiwiJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBOZ05hbWVEaXJlY3RpdmUoJGNvbXBpbGUpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICByZXN0cmljdDogJ0EnLFxuICAgICAgICBsaW5rOiBmdW5jdGlvbiAoc2NvcGUsIGVsZW1lbnQsIGF0dHJzLCBjdHJsKSB7XG4gICAgICAgICAgICAvLyBlbGVtZW50LmF0dHIoJ25hbWUnLCBhdHRycy5uZ05hbWUpO1xuICAgICAgICAgICAgYXR0cnMuJHNldChcIm5hbWVcIiwgYXR0cnMubmdOYW1lKTtcbiAgICAgICAgfVxuICAgIH07XG59XG5cbk5nTmFtZURpcmVjdGl2ZS4kaW5qZWN0ID0gWyckY29tcGlsZSddO1xuXG5tb2R1bGUuZXhwb3J0cyA9IE5nTmFtZURpcmVjdGl2ZTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciB2YWxpZGF0b3JzID0gcmVxdWlyZSgndmFsaWRhdG9ycycpO1xuXG5mdW5jdGlvbiBOdW1iZXJNYXNrRGlyZWN0aXZlKCRsb2NhbGUsICRwYXJzZSwgUHJlRm9ybWF0dGVycywgTnVtYmVyTWFza3MpIHtcblx0cmV0dXJuIHtcblx0XHRyZXN0cmljdDogJ0EnLFxuXHRcdHJlcXVpcmU6ICduZ01vZGVsJyxcblx0XHRsaW5rOiBmdW5jdGlvbiAoc2NvcGUsIGVsZW1lbnQsIGF0dHJzLCBjdHJsKSB7XG5cdFx0XHR2YXIgZGVjaW1hbERlbGltaXRlciA9ICRsb2NhbGUuTlVNQkVSX0ZPUk1BVFMuREVDSU1BTF9TRVAsXG5cdFx0XHRcdHRob3VzYW5kc0RlbGltaXRlciA9ICRsb2NhbGUuTlVNQkVSX0ZPUk1BVFMuR1JPVVBfU0VQLFxuXHRcdFx0XHRkZWNpbWFscyA9ICRwYXJzZShhdHRycy5mbHVpZ051bWJlck1hc2spKHNjb3BlKTtcblxuXHRcdFx0aWYgKGFuZ3VsYXIuaXNEZWZpbmVkKGF0dHJzLmZsdWlnSGlkZUdyb3VwU2VwKSkge1xuXHRcdFx0XHR0aG91c2FuZHNEZWxpbWl0ZXIgPSAnJztcblx0XHRcdH1cblxuXHRcdFx0aWYgKGlzTmFOKGRlY2ltYWxzKSkge1xuXHRcdFx0XHRkZWNpbWFscyA9IDI7XG5cdFx0XHR9XG5cblx0XHRcdHZhciB2aWV3TWFzayA9IE51bWJlck1hc2tzLnZpZXdNYXNrKGRlY2ltYWxzLCBkZWNpbWFsRGVsaW1pdGVyLCB0aG91c2FuZHNEZWxpbWl0ZXIpLFxuXHRcdFx0XHRtb2RlbE1hc2sgPSBOdW1iZXJNYXNrcy5tb2RlbE1hc2soZGVjaW1hbHMpO1xuXG5cdFx0XHRmdW5jdGlvbiBwYXJzZXIodmFsdWUpIHtcblx0XHRcdFx0aWYgKGN0cmwuJGlzRW1wdHkodmFsdWUpKSB7XG5cdFx0XHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHR2YXIgdmFsdWVUb0Zvcm1hdCA9IFByZUZvcm1hdHRlcnMuY2xlYXJEZWxpbWl0ZXJzQW5kTGVhZGluZ1plcm9zKHZhbHVlKSB8fCAnMCc7XG5cdFx0XHRcdHZhciBmb3JtYXRlZFZhbHVlID0gdmlld01hc2suYXBwbHkodmFsdWVUb0Zvcm1hdCk7XG5cdFx0XHRcdHZhciBhY3R1YWxOdW1iZXIgPSBwYXJzZUZsb2F0KG1vZGVsTWFzay5hcHBseSh2YWx1ZVRvRm9ybWF0KSk7XG5cblx0XHRcdFx0aWYgKGFuZ3VsYXIuaXNEZWZpbmVkKGF0dHJzLmZsdWlnTmVnYXRpdmVOdW1iZXIpKSB7XG5cdFx0XHRcdFx0dmFyIGlzTmVnYXRpdmUgPSAodmFsdWVbMF0gPT09ICctJyksXG5cdFx0XHRcdFx0XHRuZWVkc1RvSW52ZXJ0U2lnbiA9ICh2YWx1ZS5zbGljZSgtMSkgPT09ICctJyk7XG5cblx0XHRcdFx0XHQvL29ubHkgYXBwbHkgdGhlIG1pbnVzIHNpZ24gaWYgaXQgaXMgbmVnYXRpdmUgb3IoZXhjbHVzaXZlKSBvciB0aGUgZmlyc3QgY2hhcmFjdGVyXG5cdFx0XHRcdFx0Ly9uZWVkcyB0byBiZSBuZWdhdGl2ZSBhbmQgdGhlIG51bWJlciBpcyBkaWZmZXJlbnQgZnJvbSB6ZXJvXG5cdFx0XHRcdFx0aWYgKChuZWVkc1RvSW52ZXJ0U2lnbiBeIGlzTmVnYXRpdmUpIHx8IHZhbHVlID09PSAnLScpIHtcblx0XHRcdFx0XHRcdGFjdHVhbE51bWJlciAqPSAtMTtcblx0XHRcdFx0XHRcdGZvcm1hdGVkVmFsdWUgPSAnLScgKyAoKGFjdHVhbE51bWJlciAhPT0gMCkgPyBmb3JtYXRlZFZhbHVlIDogJycpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmIChjdHJsLiR2aWV3VmFsdWUgIT09IGZvcm1hdGVkVmFsdWUpIHtcblx0XHRcdFx0XHRjdHJsLiRzZXRWaWV3VmFsdWUoZm9ybWF0ZWRWYWx1ZSk7XG5cdFx0XHRcdFx0Y3RybC4kcmVuZGVyKCk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRyZXR1cm4gYWN0dWFsTnVtYmVyO1xuXHRcdFx0fVxuXG5cdFx0XHRmdW5jdGlvbiBmb3JtYXR0ZXIodmFsdWUpIHtcblx0XHRcdFx0aWYgKGN0cmwuJGlzRW1wdHkodmFsdWUpKSB7XG5cdFx0XHRcdFx0cmV0dXJuIHZhbHVlO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0dmFyIHByZWZpeCA9IChhbmd1bGFyLmlzRGVmaW5lZChhdHRycy5mbHVpZ05lZ2F0aXZlTnVtYmVyKSAmJiB2YWx1ZSA8IDApID8gJy0nIDogJyc7XG5cdFx0XHRcdHZhciB2YWx1ZVRvRm9ybWF0ID0gUHJlRm9ybWF0dGVycy5wcmVwYXJlTnVtYmVyVG9Gb3JtYXR0ZXIodmFsdWUsIGRlY2ltYWxzKTtcblx0XHRcdFx0cmV0dXJuIHByZWZpeCArIHZpZXdNYXNrLmFwcGx5KHZhbHVlVG9Gb3JtYXQpO1xuXHRcdFx0fVxuXG5cdFx0XHRmdW5jdGlvbiBjbGVhclZpZXdWYWx1ZUlmTWludXNTaWduKCkge1xuXHRcdFx0XHRpZiAoY3RybC4kdmlld1ZhbHVlID09PSAnLScpIHtcblx0XHRcdFx0XHRjdHJsLiRzZXRWaWV3VmFsdWUoJycpO1xuXHRcdFx0XHRcdGN0cmwuJHJlbmRlcigpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdGVsZW1lbnQub24oJ2JsdXInLCBjbGVhclZpZXdWYWx1ZUlmTWludXNTaWduKTtcblxuXHRcdFx0Y3RybC4kZm9ybWF0dGVycy5wdXNoKGZvcm1hdHRlcik7XG5cdFx0XHRjdHJsLiRwYXJzZXJzLnB1c2gocGFyc2VyKTtcblxuXHRcdFx0aWYgKGF0dHJzLmZsdWlnTnVtYmVyTWFzaykge1xuXHRcdFx0XHRzY29wZS4kd2F0Y2goYXR0cnMuZmx1aWdOdW1iZXJNYXNrLCBmdW5jdGlvbiAoX2RlY2ltYWxzKSB7XG5cdFx0XHRcdFx0ZGVjaW1hbHMgPSBpc05hTihfZGVjaW1hbHMpID8gMiA6IF9kZWNpbWFscztcblx0XHRcdFx0XHR2aWV3TWFzayA9IE51bWJlck1hc2tzLnZpZXdNYXNrKGRlY2ltYWxzLCBkZWNpbWFsRGVsaW1pdGVyLCB0aG91c2FuZHNEZWxpbWl0ZXIpO1xuXHRcdFx0XHRcdG1vZGVsTWFzayA9IE51bWJlck1hc2tzLm1vZGVsTWFzayhkZWNpbWFscyk7XG5cblx0XHRcdFx0XHRwYXJzZXIoY3RybC4kdmlld1ZhbHVlKTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cblx0XHRcdGlmIChhdHRycy5taW4pIHtcblx0XHRcdFx0dmFyIG1pblZhbDtcblxuXHRcdFx0XHRjdHJsLiR2YWxpZGF0b3JzLm1pbiA9IGZ1bmN0aW9uIChtb2RlbFZhbHVlKSB7XG5cdFx0XHRcdFx0cmV0dXJuIHZhbGlkYXRvcnMubWluTnVtYmVyKGN0cmwsIG1vZGVsVmFsdWUsIG1pblZhbCk7XG5cdFx0XHRcdH07XG5cblx0XHRcdFx0c2NvcGUuJHdhdGNoKGF0dHJzLm1pbiwgZnVuY3Rpb24gKHZhbHVlKSB7XG5cdFx0XHRcdFx0bWluVmFsID0gdmFsdWU7XG5cdFx0XHRcdFx0Y3RybC4kdmFsaWRhdGUoKTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cblx0XHRcdGlmIChhdHRycy5tYXgpIHtcblx0XHRcdFx0dmFyIG1heFZhbDtcblxuXHRcdFx0XHRjdHJsLiR2YWxpZGF0b3JzLm1heCA9IGZ1bmN0aW9uIChtb2RlbFZhbHVlKSB7XG5cdFx0XHRcdFx0cmV0dXJuIHZhbGlkYXRvcnMubWF4TnVtYmVyKGN0cmwsIG1vZGVsVmFsdWUsIG1heFZhbCk7XG5cdFx0XHRcdH07XG5cblx0XHRcdFx0c2NvcGUuJHdhdGNoKGF0dHJzLm1heCwgZnVuY3Rpb24gKHZhbHVlKSB7XG5cdFx0XHRcdFx0bWF4VmFsID0gdmFsdWU7XG5cdFx0XHRcdFx0Y3RybC4kdmFsaWRhdGUoKTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9O1xufVxuTnVtYmVyTWFza0RpcmVjdGl2ZS4kaW5qZWN0ID0gWyckbG9jYWxlJywgJyRwYXJzZScsICdQcmVGb3JtYXR0ZXJzJywgJ051bWJlck1hc2tzJ107XG5cbm1vZHVsZS5leHBvcnRzID0gTnVtYmVyTWFza0RpcmVjdGl2ZTsiLCIndXNlIHN0cmljdCc7XG5cblxuZnVuY3Rpb24gUGVyY2VudGFnZUZpbHRlcigkZmlsdGVyKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChpbnB1dCwgZGVjaW1hbHMpIHtcbiAgICAgICAgcmV0dXJuICRmaWx0ZXIoJ251bWJlcicpKGlucHV0ICogMTAwLCBkZWNpbWFscykgKyAnJSc7XG4gICAgfTtcbn1cblBlcmNlbnRhZ2VGaWx0ZXIuJGluamVjdCA9IFsnJGZpbHRlciddO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFBlcmNlbnRhZ2VGaWx0ZXI7IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdmFsaWRhdG9ycyA9IHJlcXVpcmUoJ3ZhbGlkYXRvcnMnKTtcblxuZnVuY3Rpb24gUGVyY2VudGFnZU1hc2tEaXJlY3RpdmUoJGxvY2FsZSwgJHBhcnNlLCBQcmVGb3JtYXR0ZXJzLCBOdW1iZXJNYXNrcywgJGZpbHRlcikge1xuICAgIGZ1bmN0aW9uIHByZXBhcmVQZXJjZW50YWdlVG9Gb3JtYXR0ZXIodmFsdWUsIGRlY2ltYWxzLCBtb2RlbE11bHRpcGxpZXIpIHtcbiAgICAgICAgLy8gcmV0dXJuICRmaWx0ZXIoJ251bWJlcicpKHZhbHVlICogbW9kZWxNdWx0aXBsaWVyLCBkZWNpbWFscylcbiAgICAgICAgcmV0dXJuIFByZUZvcm1hdHRlcnMuY2xlYXJEZWxpbWl0ZXJzQW5kTGVhZGluZ1plcm9zKChwYXJzZUZsb2F0KHZhbHVlKSAqIG1vZGVsTXVsdGlwbGllcikudG9GaXhlZChkZWNpbWFscykpO1xuICAgIH1cblxuICAgIHJldHVybiB7XG5cdFx0cmVzdHJpY3Q6ICdBJyxcblx0XHRyZXF1aXJlOiAnbmdNb2RlbCcsXG5cdFx0bGluazogZnVuY3Rpb24oc2NvcGUsIGVsZW1lbnQsIGF0dHJzLCBjdHJsKSB7XG5cdFx0XHR2YXIgZGVjaW1hbERlbGltaXRlciA9ICRsb2NhbGUuTlVNQkVSX0ZPUk1BVFMuREVDSU1BTF9TRVA7XG5cblx0XHRcdHZhciBiYWNrc3BhY2VQcmVzc2VkID0gZmFsc2U7XG5cdFx0XHRlbGVtZW50LmJpbmQoJ2tleWRvd24ga2V5cHJlc3MnLCBmdW5jdGlvbihldmVudCkge1xuXHRcdFx0XHRiYWNrc3BhY2VQcmVzc2VkID0gZXZlbnQud2hpY2ggPT09IDg7XG5cdFx0XHR9KTtcblxuXHRcdFx0dmFyIHRob3VzYW5kc0RlbGltaXRlciA9ICRsb2NhbGUuTlVNQkVSX0ZPUk1BVFMuR1JPVVBfU0VQO1xuXHRcdFx0aWYgKGFuZ3VsYXIuaXNEZWZpbmVkKGF0dHJzLmZsdWlnSGlkZUdyb3VwU2VwKSkge1xuXHRcdFx0XHR0aG91c2FuZHNEZWxpbWl0ZXIgPSAnJztcblx0XHRcdH1cblxuXHRcdFx0dmFyIHBlcmNlbnRhZ2VTeW1ib2wgPSAnICUnO1xuXHRcdFx0aWYgKGFuZ3VsYXIuaXNEZWZpbmVkKGF0dHJzLmZsdWlnSGlkZVBlcmNlbnRhZ2VTaWduKSkge1xuXHRcdFx0XHRwZXJjZW50YWdlU3ltYm9sID0gJyc7XG5cdFx0XHR9IGVsc2UgaWYgKGFuZ3VsYXIuaXNEZWZpbmVkKGF0dHJzLmZsdWlnSGlkZVNwYWNlKSkge1xuXHRcdFx0XHRwZXJjZW50YWdlU3ltYm9sID0gJyUnO1xuXHRcdFx0fVxuXG5cdFx0XHR2YXIgZGVjaW1hbHMgPSBwYXJzZUludChhdHRycy5mbHVpZ1BlcmNlbnRhZ2VNYXNrKTtcblx0XHRcdGlmIChpc05hTihkZWNpbWFscykpIHtcblx0XHRcdFx0ZGVjaW1hbHMgPSAyO1xuXHRcdFx0fVxuXG5cdFx0XHR2YXIgbW9kZWxWYWx1ZSA9IHtcblx0XHRcdFx0bXVsdGlwbGllciA6IDEwMCxcblx0XHRcdFx0ZGVjaW1hbE1hc2s6IDJcblx0XHRcdH07XG5cdFx0XHRpZiAoYW5ndWxhci5pc0RlZmluZWQoYXR0cnMuZmx1aWdQZXJjZW50YWdlVmFsdWUpKSB7XG5cdFx0XHRcdG1vZGVsVmFsdWUubXVsdGlwbGllciAgPSAxO1xuXHRcdFx0XHRtb2RlbFZhbHVlLmRlY2ltYWxNYXNrID0gMDtcblx0XHRcdH1cblxuXHRcdFx0dmFyIG51bWJlckRlY2ltYWxzID0gZGVjaW1hbHMgKyBtb2RlbFZhbHVlLmRlY2ltYWxNYXNrO1xuXHRcdFx0dmFyIHZpZXdNYXNrID0gTnVtYmVyTWFza3Mudmlld01hc2soZGVjaW1hbHMsIGRlY2ltYWxEZWxpbWl0ZXIsIHRob3VzYW5kc0RlbGltaXRlciksXG5cdFx0XHRcdG1vZGVsTWFzayA9IE51bWJlck1hc2tzLm1vZGVsTWFzayhudW1iZXJEZWNpbWFscyk7XG5cblx0XHRcdGZ1bmN0aW9uIGZvcm1hdHRlcih2YWx1ZSkge1xuXHRcdFx0XHRpZiAoY3RybC4kaXNFbXB0eSh2YWx1ZSkpIHtcblx0XHRcdFx0XHRyZXR1cm4gdmFsdWU7XG5cdFx0XHRcdH1cblx0XHRcdFx0dmFyIHByZWZpeCA9IChhbmd1bGFyLmlzRGVmaW5lZChhdHRycy5mbHVpZ05lZ2F0aXZlTnVtYmVyKSAmJiB2YWx1ZSA8IDApID8gJy0nIDogJyc7XG5cdFx0XHRcdHZhciB2YWx1ZVRvRm9ybWF0ID0gcHJlcGFyZVBlcmNlbnRhZ2VUb0Zvcm1hdHRlcih2YWx1ZSwgZGVjaW1hbHMsIG1vZGVsVmFsdWUubXVsdGlwbGllcik7XG5cdFx0XHRcdHZhciBmb3JtYXRlZFZhbHVlID0gcHJlZml4ICsgdmlld01hc2suYXBwbHkodmFsdWVUb0Zvcm1hdCkgKyBwZXJjZW50YWdlU3ltYm9sO1xuXG5cdFx0XHRcdHJldHVybiBmb3JtYXRlZFZhbHVlO1xuXHRcdFx0fVxuXG5cdFx0XHRmdW5jdGlvbiBwYXJzZXIodmFsdWUpIHtcblx0XHRcdFx0aWYgKGN0cmwuJGlzRW1wdHkodmFsdWUpKSB7XG5cdFx0XHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHR2YXIgdmFsdWVUb0Zvcm1hdCA9IFByZUZvcm1hdHRlcnMuY2xlYXJEZWxpbWl0ZXJzQW5kTGVhZGluZ1plcm9zKHZhbHVlKSB8fCAnMCc7XG5cdFx0XHRcdGlmIChwZXJjZW50YWdlU3ltYm9sICE9PSAnJyAmJiB2YWx1ZS5sZW5ndGggPiAxICYmIHZhbHVlLmluZGV4T2YoJyUnKSA9PT0gLTEpIHtcblx0XHRcdFx0XHR2YWx1ZVRvRm9ybWF0ID0gdmFsdWVUb0Zvcm1hdC5zbGljZSgwLCB2YWx1ZVRvRm9ybWF0Lmxlbmd0aCAtIDEpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYgKGJhY2tzcGFjZVByZXNzZWQgJiYgdmFsdWUubGVuZ3RoID09PSAxICYmIHZhbHVlICE9PSAnJScpIHtcblx0XHRcdFx0XHR2YWx1ZVRvRm9ybWF0ID0gJzAnO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0dmFyIGZvcm1hdGVkVmFsdWUgPSB2aWV3TWFzay5hcHBseSh2YWx1ZVRvRm9ybWF0KSArIHBlcmNlbnRhZ2VTeW1ib2w7XG5cdFx0XHRcdHZhciBhY3R1YWxOdW1iZXIgPSBwYXJzZUZsb2F0KG1vZGVsTWFzay5hcHBseSh2YWx1ZVRvRm9ybWF0KSk7XG5cblx0XHRcdFx0aWYgKGFuZ3VsYXIuaXNEZWZpbmVkKGF0dHJzLmZsdWlnTmVnYXRpdmVOdW1iZXIpKSB7XG5cdFx0XHRcdFx0dmFyIGlzTmVnYXRpdmUgPSAodmFsdWVbMF0gPT09ICctJyksXG5cdFx0XHRcdFx0XHRuZWVkc1RvSW52ZXJ0U2lnbiA9ICh2YWx1ZS5zbGljZSgtMSkgPT09ICctJyk7XG5cblx0XHRcdFx0XHQvL29ubHkgYXBwbHkgdGhlIG1pbnVzIHNpZ24gaWYgaXQgaXMgbmVnYXRpdmUgb3IoZXhjbHVzaXZlKSBvciB0aGUgZmlyc3QgY2hhcmFjdGVyXG5cdFx0XHRcdFx0Ly9uZWVkcyB0byBiZSBuZWdhdGl2ZSBhbmQgdGhlIG51bWJlciBpcyBkaWZmZXJlbnQgZnJvbSB6ZXJvXG5cdFx0XHRcdFx0aWYgKChuZWVkc1RvSW52ZXJ0U2lnbiBeIGlzTmVnYXRpdmUpIHx8IHZhbHVlID09PSAnLScpIHtcblx0XHRcdFx0XHRcdGFjdHVhbE51bWJlciAqPSAtMTtcblx0XHRcdFx0XHRcdGZvcm1hdGVkVmFsdWUgPSAnLScgKyAoKGFjdHVhbE51bWJlciAhPT0gMCkgPyBmb3JtYXRlZFZhbHVlIDogJycpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmIChjdHJsLiR2aWV3VmFsdWUgIT09IGZvcm1hdGVkVmFsdWUpIHtcblx0XHRcdFx0XHRjdHJsLiRzZXRWaWV3VmFsdWUoZm9ybWF0ZWRWYWx1ZSk7XG5cdFx0XHRcdFx0Y3RybC4kcmVuZGVyKCk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRyZXR1cm4gYWN0dWFsTnVtYmVyO1xuXHRcdFx0fVxuXG5cdFx0XHRjdHJsLiRmb3JtYXR0ZXJzLnB1c2goZm9ybWF0dGVyKTtcblx0XHRcdGN0cmwuJHBhcnNlcnMucHVzaChwYXJzZXIpO1xuXG5cdFx0XHRpZiAoYXR0cnMuZmx1aWdQZXJjZW50YWdlTWFzaykge1xuXHRcdFx0XHRzY29wZS4kd2F0Y2goYXR0cnMuZmx1aWdQZXJjZW50YWdlTWFzaywgZnVuY3Rpb24oX2RlY2ltYWxzKSB7XG5cdFx0XHRcdFx0ZGVjaW1hbHMgPSBpc05hTihfZGVjaW1hbHMpID8gMiA6IF9kZWNpbWFscztcblxuXHRcdFx0XHRcdG51bWJlckRlY2ltYWxzID0gZGVjaW1hbHMgKyBtb2RlbFZhbHVlLmRlY2ltYWxNYXNrO1xuXHRcdFx0XHRcdHZpZXdNYXNrID0gTnVtYmVyTWFza3Mudmlld01hc2soZGVjaW1hbHMsIGRlY2ltYWxEZWxpbWl0ZXIsIHRob3VzYW5kc0RlbGltaXRlcik7XG5cdFx0XHRcdFx0bW9kZWxNYXNrID0gTnVtYmVyTWFza3MubW9kZWxNYXNrKG51bWJlckRlY2ltYWxzKTtcblxuXHRcdFx0XHRcdHBhcnNlcihmb3JtYXR0ZXIoY3RybC4kbW9kZWxWYWx1ZSkpO1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKGF0dHJzLm1pbikge1xuXHRcdFx0XHR2YXIgbWluVmFsO1xuXG5cdFx0XHRcdGN0cmwuJHZhbGlkYXRvcnMubWluID0gZnVuY3Rpb24obW9kZWxWYWx1ZSkge1xuXHRcdFx0XHRcdHJldHVybiB2YWxpZGF0b3JzLm1pbk51bWJlcihjdHJsLCBtb2RlbFZhbHVlLCBtaW5WYWwpO1xuXHRcdFx0XHR9O1xuXG5cdFx0XHRcdHNjb3BlLiR3YXRjaChhdHRycy5taW4sIGZ1bmN0aW9uKHZhbHVlKSB7XG5cdFx0XHRcdFx0bWluVmFsID0gdmFsdWU7XG5cdFx0XHRcdFx0Y3RybC4kdmFsaWRhdGUoKTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cblx0XHRcdGlmIChhdHRycy5tYXgpIHtcblx0XHRcdFx0dmFyIG1heFZhbDtcblxuXHRcdFx0XHRjdHJsLiR2YWxpZGF0b3JzLm1heCA9IGZ1bmN0aW9uKG1vZGVsVmFsdWUpIHtcblx0XHRcdFx0XHRyZXR1cm4gdmFsaWRhdG9ycy5tYXhOdW1iZXIoY3RybCwgbW9kZWxWYWx1ZSwgbWF4VmFsKTtcblx0XHRcdFx0fTtcblxuXHRcdFx0XHRzY29wZS4kd2F0Y2goYXR0cnMubWF4LCBmdW5jdGlvbih2YWx1ZSkge1xuXHRcdFx0XHRcdG1heFZhbCA9IHZhbHVlO1xuXHRcdFx0XHRcdGN0cmwuJHZhbGlkYXRlKCk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdH1cblx0fTtcbn1cblBlcmNlbnRhZ2VNYXNrRGlyZWN0aXZlLiRpbmplY3QgPSBbJyRsb2NhbGUnLCAnJHBhcnNlJywgJ1ByZUZvcm1hdHRlcnMnLCAnTnVtYmVyTWFza3MnLCAnJGZpbHRlciddO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFBlcmNlbnRhZ2VNYXNrRGlyZWN0aXZlOyIsIid1c2Ugc3RyaWN0JztcblxudmFyIFN0cmluZ01hc2sgPSByZXF1aXJlKCdzdHJpbmctbWFzaycpO1xuXG5mdW5jdGlvbiBTY2llbnRpZmljTm90YXRpb25NYXNrRGlyZWN0aXZlKCRsb2NhbGUsICRwYXJzZSkge1xuXHR2YXIgZGVjaW1hbERlbGltaXRlciA9ICRsb2NhbGUuTlVNQkVSX0ZPUk1BVFMuREVDSU1BTF9TRVAsXG5cdFx0ZGVmYXVsdFByZWNpc2lvbiA9IDI7XG5cblx0ZnVuY3Rpb24gc2lnbmlmaWNhbmRNYXNrQnVpbGRlcihkZWNpbWFscykge1xuXHRcdHZhciBtYXNrID0gJzAnO1xuXG5cdFx0aWYgKGRlY2ltYWxzID4gMCkge1xuXHRcdFx0bWFzayArPSBkZWNpbWFsRGVsaW1pdGVyO1xuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBkZWNpbWFsczsgaSsrKSB7XG5cdFx0XHRcdG1hc2sgKz0gJzAnO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiBuZXcgU3RyaW5nTWFzayhtYXNrLCB7XG5cdFx0XHRyZXZlcnNlOiB0cnVlXG5cdFx0fSk7XG5cdH1cblxuXHRyZXR1cm4ge1xuXHRcdHJlc3RyaWN0OiAnQScsXG5cdFx0cmVxdWlyZTogJ25nTW9kZWwnLFxuXHRcdGxpbms6IGZ1bmN0aW9uKHNjb3BlLCBlbGVtZW50LCBhdHRycywgY3RybCkge1xuXHRcdFx0dmFyIGRlY2ltYWxzID0gJHBhcnNlKGF0dHJzLmZsdWlnU2NpZW50aWZpY05vdGF0aW9uTWFzaykoc2NvcGUpO1xuXG5cdFx0XHRpZiAoaXNOYU4oZGVjaW1hbHMpKSB7XG5cdFx0XHRcdGRlY2ltYWxzID0gZGVmYXVsdFByZWNpc2lvbjtcblx0XHRcdH1cblxuXHRcdFx0dmFyIHNpZ25pZmljYW5kTWFzayA9IHNpZ25pZmljYW5kTWFza0J1aWxkZXIoZGVjaW1hbHMpO1xuXG5cdFx0XHRmdW5jdGlvbiBzcGxpdE51bWJlcih2YWx1ZSkge1xuXHRcdFx0XHR2YXIgc3RyaW5nVmFsdWUgPSB2YWx1ZS50b1N0cmluZygpLFxuXHRcdFx0XHRcdHNwbGl0dGVkTnVtYmVyID0gc3RyaW5nVmFsdWUubWF0Y2goLygtP1swLTldKilbXFwuXT8oWzAtOV0qKT9bRWVdPyhbXFwrLV0/WzAtOV0qKT8vKTtcblxuXHRcdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRcdGludGVnZXJQYXJ0T2ZTaWduaWZpY2FuZDogc3BsaXR0ZWROdW1iZXJbMV0sXG5cdFx0XHRcdFx0ZGVjaW1hbFBhcnRPZlNpZ25pZmljYW5kOiBzcGxpdHRlZE51bWJlclsyXSxcblx0XHRcdFx0XHRleHBvbmVudDogc3BsaXR0ZWROdW1iZXJbM10gfCAwXG5cdFx0XHRcdH07XG5cdFx0XHR9XG5cblx0XHRcdGZ1bmN0aW9uIGZvcm1hdHRlcih2YWx1ZSkge1xuXHRcdFx0XHRpZiAoY3RybC4kaXNFbXB0eSh2YWx1ZSkpIHtcblx0XHRcdFx0XHRyZXR1cm4gdmFsdWU7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJykge1xuXHRcdFx0XHRcdHZhbHVlID0gdmFsdWUucmVwbGFjZShkZWNpbWFsRGVsaW1pdGVyLCAnLicpO1xuXHRcdFx0XHR9IGVsc2UgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicpIHtcblx0XHRcdFx0XHR2YWx1ZSA9IHZhbHVlLnRvRXhwb25lbnRpYWwoZGVjaW1hbHMpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0dmFyIGZvcm1hdHRlZFZhbHVlLCBleHBvbmVudDtcblx0XHRcdFx0dmFyIHNwbGl0dGVkTnVtYmVyID0gc3BsaXROdW1iZXIodmFsdWUpO1xuXG5cdFx0XHRcdHZhciBpbnRlZ2VyUGFydE9mU2lnbmlmaWNhbmQgPSBzcGxpdHRlZE51bWJlci5pbnRlZ2VyUGFydE9mU2lnbmlmaWNhbmQgfHwgMDtcblx0XHRcdFx0dmFyIG51bWJlclRvRm9ybWF0ID0gaW50ZWdlclBhcnRPZlNpZ25pZmljYW5kLnRvU3RyaW5nKCk7XG5cdFx0XHRcdGlmIChhbmd1bGFyLmlzRGVmaW5lZChzcGxpdHRlZE51bWJlci5kZWNpbWFsUGFydE9mU2lnbmlmaWNhbmQpKSB7XG5cdFx0XHRcdFx0bnVtYmVyVG9Gb3JtYXQgKz0gc3BsaXR0ZWROdW1iZXIuZGVjaW1hbFBhcnRPZlNpZ25pZmljYW5kO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0dmFyIG5lZWRzTm9ybWFsaXphdGlvbiA9XG5cdFx0XHRcdFx0KGludGVnZXJQYXJ0T2ZTaWduaWZpY2FuZCA+PSAxIHx8IGludGVnZXJQYXJ0T2ZTaWduaWZpY2FuZCA8PSAtMSkgJiZcblx0XHRcdFx0XHQoXG5cdFx0XHRcdFx0XHQoYW5ndWxhci5pc0RlZmluZWQoc3BsaXR0ZWROdW1iZXIuZGVjaW1hbFBhcnRPZlNpZ25pZmljYW5kKSAmJlxuXHRcdFx0XHRcdFx0c3BsaXR0ZWROdW1iZXIuZGVjaW1hbFBhcnRPZlNpZ25pZmljYW5kLmxlbmd0aCA+IGRlY2ltYWxzKSB8fFxuXHRcdFx0XHRcdFx0KGRlY2ltYWxzID09PSAwICYmIG51bWJlclRvRm9ybWF0Lmxlbmd0aCA+PSAyKVxuXHRcdFx0XHRcdCk7XG5cblx0XHRcdFx0aWYgKG5lZWRzTm9ybWFsaXphdGlvbikge1xuXHRcdFx0XHRcdGV4cG9uZW50ID0gbnVtYmVyVG9Gb3JtYXQuc2xpY2UoZGVjaW1hbHMgKyAxLCBudW1iZXJUb0Zvcm1hdC5sZW5ndGgpO1xuXHRcdFx0XHRcdG51bWJlclRvRm9ybWF0ID0gbnVtYmVyVG9Gb3JtYXQuc2xpY2UoMCwgZGVjaW1hbHMgKyAxKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGZvcm1hdHRlZFZhbHVlID0gc2lnbmlmaWNhbmRNYXNrLmFwcGx5KG51bWJlclRvRm9ybWF0KTtcblxuXHRcdFx0XHRpZiAoc3BsaXR0ZWROdW1iZXIuZXhwb25lbnQgIT09IDApIHtcblx0XHRcdFx0XHRleHBvbmVudCA9IHNwbGl0dGVkTnVtYmVyLmV4cG9uZW50O1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYgKGFuZ3VsYXIuaXNEZWZpbmVkKGV4cG9uZW50KSkge1xuXHRcdFx0XHRcdGZvcm1hdHRlZFZhbHVlICs9ICdlJyArIGV4cG9uZW50O1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0cmV0dXJuIGZvcm1hdHRlZFZhbHVlO1xuXHRcdFx0fVxuXG5cdFx0XHRmdW5jdGlvbiBwYXJzZXIodmFsdWUpIHtcblx0XHRcdFx0aWYgKGN0cmwuJGlzRW1wdHkodmFsdWUpKSB7XG5cdFx0XHRcdFx0cmV0dXJuIHZhbHVlO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0dmFyIHZpZXdWYWx1ZSA9IGZvcm1hdHRlcih2YWx1ZSksXG5cdFx0XHRcdFx0bW9kZWxWYWx1ZSA9IHBhcnNlRmxvYXQodmlld1ZhbHVlLnJlcGxhY2UoZGVjaW1hbERlbGltaXRlciwgJy4nKSk7XG5cblx0XHRcdFx0aWYgKGN0cmwuJHZpZXdWYWx1ZSAhPT0gdmlld1ZhbHVlKSB7XG5cdFx0XHRcdFx0Y3RybC4kc2V0Vmlld1ZhbHVlKHZpZXdWYWx1ZSk7XG5cdFx0XHRcdFx0Y3RybC4kcmVuZGVyKCk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRyZXR1cm4gbW9kZWxWYWx1ZTtcblx0XHRcdH1cblxuXHRcdFx0Y3RybC4kZm9ybWF0dGVycy5wdXNoKGZvcm1hdHRlcik7XG5cdFx0XHRjdHJsLiRwYXJzZXJzLnB1c2gocGFyc2VyKTtcblxuXHRcdFx0Y3RybC4kdmFsaWRhdG9ycy5tYXggPSBmdW5jdGlvbiB2YWxpZGF0b3IodmFsdWUpIHtcblx0XHRcdFx0cmV0dXJuIGN0cmwuJGlzRW1wdHkodmFsdWUpIHx8IHZhbHVlIDwgTnVtYmVyLk1BWF9WQUxVRTtcblx0XHRcdH07XG5cdFx0fVxuXHR9O1xufVxuU2NpZW50aWZpY05vdGF0aW9uTWFza0RpcmVjdGl2ZS4kaW5qZWN0ID0gWyckbG9jYWxlJywgJyRwYXJzZSddO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFNjaWVudGlmaWNOb3RhdGlvbk1hc2tEaXJlY3RpdmU7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBTdHJpbmdNYXNrID0gcmVxdWlyZSgnc3RyaW5nLW1hc2snKTtcbnZhciB0aW1lRm9ybWF0ID0gJzAwOjAwJztcblxudmFyIGZvcm1hdHRlZFZhbHVlTGVuZ3RoID0gdGltZUZvcm1hdC5sZW5ndGg7XG52YXIgdW5mb3JtYXR0ZWRWYWx1ZUxlbmd0aCA9IHRpbWVGb3JtYXQucmVwbGFjZSgnOicsICcnKS5sZW5ndGg7XG52YXIgdGltZU1hc2sgPSBuZXcgU3RyaW5nTWFzayh0aW1lRm9ybWF0KTtcblxuZnVuY3Rpb24gVGltZUZpbHRlcigkZmlsdGVyKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChpbnB1dCwgZGVjaW1hbHMpIHtcblxuICAgICAgICByZXR1cm4gKHRpbWVNYXNrLmFwcGx5KGlucHV0KSB8fCAnJykucmVwbGFjZSgvW14wLTldJC8sICcnKTtcbiAgICB9O1xufVxuVGltZUZpbHRlci4kaW5qZWN0ID0gWyckZmlsdGVyJ107XG5cbm1vZHVsZS5leHBvcnRzID0gVGltZUZpbHRlcjsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBTdHJpbmdNYXNrID0gcmVxdWlyZSgnc3RyaW5nLW1hc2snKTtcblxuZnVuY3Rpb24gVGltZU1hc2tEaXJlY3RpdmUoJHRpbWVvdXQpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICByZXN0cmljdDogJ0EnLFxuICAgICAgICByZXF1aXJlOiAnbmdNb2RlbCcsXG4gICAgICAgIGxpbms6IGZ1bmN0aW9uIChzY29wZSwgZWxlbWVudCwgYXR0cnMsIGN0cmwpIHtcblxuICAgICAgICAgICAgaWYgKGF0dHJzLmZsdWlnVGltZU1hc2sgPT09IFwiZmFsc2VcIikgcmV0dXJuO1xuXG4gICAgICAgICAgICB2YXIgdGltZUZvcm1hdCA9ICcwMDowMDowMCc7XG5cbiAgICAgICAgICAgIGlmIChhbmd1bGFyLmlzRGVmaW5lZChhdHRycy5mbHVpZ1RpbWVNYXNrKSAmJiBhdHRycy5mbHVpZ1RpbWVNYXNrID09PSAnc2hvcnQnKSB7XG4gICAgICAgICAgICAgICAgdGltZUZvcm1hdCA9ICcwMDowMCc7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBmb3JtYXR0ZWRWYWx1ZUxlbmd0aCA9IHRpbWVGb3JtYXQubGVuZ3RoO1xuICAgICAgICAgICAgdmFyIHVuZm9ybWF0dGVkVmFsdWVMZW5ndGggPSB0aW1lRm9ybWF0LnJlcGxhY2UoJzonLCAnJykubGVuZ3RoO1xuICAgICAgICAgICAgdmFyIHRpbWVNYXNrID0gbmV3IFN0cmluZ01hc2sodGltZUZvcm1hdCk7XG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIGZvcm1hdHRlcih2YWx1ZSkge1xuICAgICAgICAgICAgICAgIGlmIChjdHJsLiRpc0VtcHR5KHZhbHVlKSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdmFyIGNsZWFuVmFsdWUgPSB2YWx1ZS5yZXBsYWNlKC9bXjAtOV0vZywgJycpLnNsaWNlKDAsIHVuZm9ybWF0dGVkVmFsdWVMZW5ndGgpIHx8ICcnO1xuICAgICAgICAgICAgICAgIHJldHVybiAodGltZU1hc2suYXBwbHkoY2xlYW5WYWx1ZSkgfHwgJycpLnJlcGxhY2UoL1teMC05XSQvLCAnJyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGN0cmwuJGZvcm1hdHRlcnMucHVzaChmb3JtYXR0ZXIpO1xuXG4gICAgICAgICAgICBjdHJsLiRwYXJzZXJzLnB1c2goZnVuY3Rpb24gcGFyc2VyKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgaWYgKGN0cmwuJGlzRW1wdHkodmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB2YXIgdmlld1ZhbHVlID0gZm9ybWF0dGVyKHZhbHVlKTtcbiAgICAgICAgICAgICAgICB2YXIgbW9kZWxWYWx1ZSA9IHZpZXdWYWx1ZTtcblxuICAgICAgICAgICAgICAgIGlmIChjdHJsLiR2aWV3VmFsdWUgIT09IHZpZXdWYWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICBjdHJsLiRzZXRWaWV3VmFsdWUodmlld1ZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgY3RybC4kcmVuZGVyKCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdmFyIHN0YXJ0ID0gZWxlbWVudFswXS5zZWxlY3Rpb25TdGFydDtcbiAgICAgICAgICAgICAgICB2YXIgZW5kID0gZWxlbWVudFswXS5zZWxlY3Rpb25FbmQgKyB2aWV3VmFsdWUubGVuZ3RoIC0gdmFsdWUubGVuZ3RoO1xuXG4gICAgICAgICAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBlbGVtZW50WzBdLnNldFNlbGVjdGlvblJhbmdlKHN0YXJ0LCBzdGFydCk7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gbW9kZWxWYWx1ZTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBjdHJsLiR2YWxpZGF0b3JzLnRpbWUgPSBmdW5jdGlvbiAobW9kZWxWYWx1ZSkge1xuICAgICAgICAgICAgICAgIGlmIChjdHJsLiRpc0VtcHR5KG1vZGVsVmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHZhciBzcGxpdHRlZFZhbHVlID0gbW9kZWxWYWx1ZS50b1N0cmluZygpLnNwbGl0KC86LykuZmlsdGVyKGZ1bmN0aW9uICh2KSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAhIXY7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICB2YXIgaG91cnMgPSBwYXJzZUludChzcGxpdHRlZFZhbHVlWzBdKSxcbiAgICAgICAgICAgICAgICAgICAgbWludXRlcyA9IHBhcnNlSW50KHNwbGl0dGVkVmFsdWVbMV0pLFxuICAgICAgICAgICAgICAgICAgICBzZWNvbmRzID0gcGFyc2VJbnQoc3BsaXR0ZWRWYWx1ZVsyXSB8fCAwKTtcblxuICAgICAgICAgICAgICAgIHJldHVybiBtb2RlbFZhbHVlLnRvU3RyaW5nKCkubGVuZ3RoID09PSBmb3JtYXR0ZWRWYWx1ZUxlbmd0aCAmJlxuICAgICAgICAgICAgICAgICAgICBob3VycyA8IDI0ICYmIG1pbnV0ZXMgPCA2MCAmJiBzZWNvbmRzIDwgNjA7XG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfTtcbn1cblxuVGltZU1hc2tEaXJlY3RpdmUuJGluamVjdCA9IFsnJHRpbWVvdXQnXTtcblxubW9kdWxlLmV4cG9ydHMgPSBUaW1lTWFza0RpcmVjdGl2ZTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBTdHJpbmdNYXNrID0gcmVxdWlyZSgnc3RyaW5nLW1hc2snKTtcblxudmFyIG0gPSBhbmd1bGFyLm1vZHVsZSgndWkudXRpbHMubWFza3MuaGVscGVycycsIFtdKTtcblxubW9kdWxlLmV4cG9ydHMgPSBtLm5hbWU7XG5cbm0uZmFjdG9yeSgnUHJlRm9ybWF0dGVycycsIFtmdW5jdGlvbigpIHtcblx0ZnVuY3Rpb24gY2xlYXJEZWxpbWl0ZXJzQW5kTGVhZGluZ1plcm9zKHZhbHVlKSB7XG5cdFx0aWYgKHZhbHVlID09PSAnMCcpIHtcblx0XHRcdHJldHVybiAnMCc7XG5cdFx0fVxuXG5cdFx0dmFyIGNsZWFuVmFsdWUgPSB2YWx1ZS5yZXBsYWNlKC9eLS8sJycpLnJlcGxhY2UoL14wKi8sICcnKTtcblx0XHRyZXR1cm4gY2xlYW5WYWx1ZS5yZXBsYWNlKC9bXjAtOV0vZywgJycpO1xuXHR9XG5cblx0ZnVuY3Rpb24gcHJlcGFyZU51bWJlclRvRm9ybWF0dGVyKHZhbHVlLCBkZWNpbWFscykge1xuXHRcdHJldHVybiBjbGVhckRlbGltaXRlcnNBbmRMZWFkaW5nWmVyb3MoKHBhcnNlRmxvYXQodmFsdWUpKS50b0ZpeGVkKGRlY2ltYWxzKSk7XG5cdH1cblxuXHRyZXR1cm4ge1xuXHRcdGNsZWFyRGVsaW1pdGVyc0FuZExlYWRpbmdaZXJvczogY2xlYXJEZWxpbWl0ZXJzQW5kTGVhZGluZ1plcm9zLFxuXHRcdHByZXBhcmVOdW1iZXJUb0Zvcm1hdHRlcjogcHJlcGFyZU51bWJlclRvRm9ybWF0dGVyXG5cdH07XG59XSlcbi5mYWN0b3J5KCdOdW1iZXJNYXNrcycsIFtmdW5jdGlvbigpIHtcblx0cmV0dXJuIHtcblx0XHR2aWV3TWFzazogZnVuY3Rpb24oZGVjaW1hbHMsIGRlY2ltYWxEZWxpbWl0ZXIsIHRob3VzYW5kc0RlbGltaXRlcikge1xuXHRcdFx0dmFyIG1hc2sgPSAnIycgKyB0aG91c2FuZHNEZWxpbWl0ZXIgKyAnIyMwJztcblxuXHRcdFx0aWYgKGRlY2ltYWxzID4gMCkge1xuXHRcdFx0XHRtYXNrICs9IGRlY2ltYWxEZWxpbWl0ZXI7XG5cdFx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgZGVjaW1hbHM7IGkrKykge1xuXHRcdFx0XHRcdG1hc2sgKz0gJzAnO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiBuZXcgU3RyaW5nTWFzayhtYXNrLCB7XG5cdFx0XHRcdHJldmVyc2U6IHRydWVcblx0XHRcdH0pO1xuXHRcdH0sXG5cdFx0bW9kZWxNYXNrOiBmdW5jdGlvbihkZWNpbWFscykge1xuXHRcdFx0dmFyIG1hc2sgPSAnIyMjMCc7XG5cblx0XHRcdGlmIChkZWNpbWFscyA+IDApIHtcblx0XHRcdFx0bWFzayArPSAnLic7XG5cdFx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgZGVjaW1hbHM7IGkrKykge1xuXHRcdFx0XHRcdG1hc2sgKz0gJzAnO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiBuZXcgU3RyaW5nTWFzayhtYXNrLCB7XG5cdFx0XHRcdHJldmVyc2U6IHRydWVcblx0XHRcdH0pO1xuXHRcdH1cblx0fTtcbn1dKTtcbiIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBtYXNrRmFjdG9yeShtYXNrRGVmaW5pdGlvbikge1xuXHRyZXR1cm4gZnVuY3Rpb24gTWFza0RpcmVjdGl2ZSgpIHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0cmVzdHJpY3Q6ICdBJyxcblx0XHRcdHJlcXVpcmU6ICduZ01vZGVsJyxcblx0XHRcdGxpbms6IGZ1bmN0aW9uKHNjb3BlLCBlbGVtZW50LCBhdHRycywgY3RybCkge1xuXHRcdFx0XHRjdHJsLiRmb3JtYXR0ZXJzLnB1c2goZnVuY3Rpb24gZm9ybWF0dGVyKHZhbHVlKSB7XG5cdFx0XHRcdFx0aWYgKGN0cmwuJGlzRW1wdHkodmFsdWUpKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gdmFsdWU7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0dmFyIGNsZWFuVmFsdWUgPSBtYXNrRGVmaW5pdGlvbi5jbGVhclZhbHVlKHZhbHVlKTtcblx0XHRcdFx0XHRyZXR1cm4gbWFza0RlZmluaXRpb24uZm9ybWF0KGNsZWFuVmFsdWUpO1xuXHRcdFx0XHR9KTtcblxuXHRcdFx0XHRjdHJsLiRwYXJzZXJzLnB1c2goZnVuY3Rpb24gcGFyc2VyKHZhbHVlKSB7XG5cdFx0XHRcdFx0aWYgKGN0cmwuJGlzRW1wdHkodmFsdWUpKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gdmFsdWU7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0dmFyIGNsZWFuVmFsdWUgPSBtYXNrRGVmaW5pdGlvbi5jbGVhclZhbHVlKHZhbHVlKTtcblx0XHRcdFx0XHR2YXIgZm9ybWF0dGVkVmFsdWUgPSBtYXNrRGVmaW5pdGlvbi5mb3JtYXQoY2xlYW5WYWx1ZSk7XG5cblx0XHRcdFx0XHRpZiAoY3RybC4kdmlld1ZhbHVlICE9PSBmb3JtYXR0ZWRWYWx1ZSkge1xuXHRcdFx0XHRcdFx0Y3RybC4kc2V0Vmlld1ZhbHVlKGZvcm1hdHRlZFZhbHVlKTtcblx0XHRcdFx0XHRcdGN0cmwuJHJlbmRlcigpO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGlmIChhbmd1bGFyLmlzVW5kZWZpbmVkKG1hc2tEZWZpbml0aW9uLmdldE1vZGVsVmFsdWUpKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gY2xlYW5WYWx1ZTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHR2YXIgYWN0dWFsTW9kZWxUeXBlID0gdHlwZW9mIGN0cmwuJG1vZGVsVmFsdWU7XG5cdFx0XHRcdFx0cmV0dXJuIG1hc2tEZWZpbml0aW9uLmdldE1vZGVsVmFsdWUoZm9ybWF0dGVkVmFsdWUsIGFjdHVhbE1vZGVsVHlwZSk7XG5cdFx0XHRcdH0pO1xuXG5cdFx0XHRcdGFuZ3VsYXIuZm9yRWFjaChtYXNrRGVmaW5pdGlvbi52YWxpZGF0aW9ucywgZnVuY3Rpb24odmFsaWRhdG9yRm4sIHZhbGlkYXRpb25FcnJvcktleSkge1xuXHRcdFx0XHRcdGN0cmwuJHZhbGlkYXRvcnNbdmFsaWRhdGlvbkVycm9yS2V5XSA9IGZ1bmN0aW9uIHZhbGlkYXRvcihtb2RlbFZhbHVlLCB2aWV3VmFsdWUpIHtcblx0XHRcdFx0XHRcdHJldHVybiBjdHJsLiRpc0VtcHR5KG1vZGVsVmFsdWUpIHx8IHZhbGlkYXRvckZuKG1vZGVsVmFsdWUsIHZpZXdWYWx1ZSk7XG5cdFx0XHRcdFx0fTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0fTtcblx0fTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXHRtYXhOdW1iZXI6IGZ1bmN0aW9uKGN0cmwsIHZhbHVlLCBsaW1pdCkge1xuXHRcdHZhciBtYXggPSBwYXJzZUZsb2F0KGxpbWl0LCAxMCk7XG5cdFx0cmV0dXJuIGN0cmwuJGlzRW1wdHkodmFsdWUpIHx8IGlzTmFOKG1heCkgfHwgdmFsdWUgPD0gbWF4O1xuXHR9LFxuXHRtaW5OdW1iZXI6IGZ1bmN0aW9uKGN0cmwsIHZhbHVlLCBsaW1pdCkge1xuXHRcdHZhciBtaW4gPSBwYXJzZUZsb2F0KGxpbWl0LCAxMCk7XG5cdFx0cmV0dXJuIGN0cmwuJGlzRW1wdHkodmFsdWUpIHx8IGlzTmFOKG1pbikgfHwgdmFsdWUgPj0gbWluO1xuXHR9XG59O1xuIl19
