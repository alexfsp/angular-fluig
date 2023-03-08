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