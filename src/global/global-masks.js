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