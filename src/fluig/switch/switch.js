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