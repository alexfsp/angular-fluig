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

<<<<<<< HEAD
            html += "<img src='" + logo + "' id='logo' class='logo' height='" + height + "' alt='Logo' title='Logo' border='0' />";
            html += '<' + h + ' class="title text-center">' + title + '</' + h + '>';
=======
            html += '<div class="col-xs-6">';
            html += "<img src='" + logo + "' id='logo' class='logo' height='" + height + "' alt='Logo' title='Logo' border='0' />";
            html += '</div>';
            html += '<div class="col-xs-6">';
            html += '<' + h + ' class="text-right">' + title + '</' + h + '>';
            html += '</div>';
>>>>>>> 217e137a94c24903eb60922dfa14d26d885e80f9
            html += '</div>';

            element.prepend(html);

        }
    };
}

HeaderDirective.$inject = ['$locale'];

module.exports = HeaderDirective;