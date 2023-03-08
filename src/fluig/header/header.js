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

            html += "<img src='" + logo + "' id='logo' class='logo' height='" + height + "' alt='Logo' title='Logo' border='0' />";
            html += '<' + h + ' class="title text-center">' + title + '</' + h + '>';
            html += '</div>';

            element.prepend(html);

        }
    };
}

HeaderDirective.$inject = ['$locale'];

module.exports = HeaderDirective;