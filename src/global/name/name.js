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