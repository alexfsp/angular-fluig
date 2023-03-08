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
            searchField: "@",
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
                    // createAutocomplete();
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
                    var restUrl = "/api/public/ecm/dataset/search?datasetId=" + scope.dataset + "&searchField=" + (scope.searchField || scope.displayKey) + "&filterFields=" + filterFields + "&resultFields=" + resultFields + "&limit=" + scope.fluigAutocompleteLimit + "&";

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