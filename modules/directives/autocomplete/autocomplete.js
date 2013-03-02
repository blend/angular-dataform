
angular.module('dataform.directives').directive('dfAutocompleteDatalist', ['$document', '$timeout', function($document, $timeout) {
  return {
    restrict: 'A',
    require: 'ngModel',
    link: function(scope, elem, attrs, ngModel) {
      if (!attrs.dfAutocompleteDatalist) throw new Error('df-autocomplete-datalist attribute must not be empty');

      var $datalist = $document.find('ol[df-datalist]#' + attrs.dfAutocompleteDatalist);
      if (!$datalist.length) {
        throw new Error('df-autocomplete-datalist attribute value "' + attrs.dfAutocompleteDatalist + '" ' +
                        'must refer to DOM ID of existing <ol df-datalist> element');
      }
      $datalist.hide();
      var dlScope = $datalist.scope();

      // Position the datalist right underneath this <input> and make it take up the full width.
      function setDatalistPosition() {
        var dim = angular.extend({width: elem[0].offsetWidth, height: elem[0].offsetHeight}, elem.position());
        $datalist.css({top: dim.top + dim.height, left: dim.left, width: dim.width});
      }

      var handlers = {
        select: function($event, value) {
          $event.stopPropagation();
          $event.preventDefault();

          $datalist.hide();

          scope.$apply(function() {
            scope[attrs.ngModel] = value;
          });

          // Allow <input ... df-autocomplete-submit-on-select> option that instructs this
          // directive to submit its parent form when the user makes a selection.
          if (attrs.hasOwnProperty('dfAutocompleteSubmitOnSelect')) {
            if (elem.parent().is('form')) {
              elem.parent().submit();
            }
          }
        }
      };

      function syncToDatalist() {
        dlScope.query = ngModel.$viewValue;
        dlScope._$ac_on = handlers;
      }

      // Listen on the input value.
      ngModel.$viewChangeListeners.push(function() {
        syncToDatalist();
      });

      // Listen on our ngModel value.
      scope.$watch(attrs.ngModel, function() { syncToDatalist(); }, true);

      // Show datalist when focused.
      elem.on('focus', function($event) {
        setDatalistPosition();
        syncToDatalist();
        $datalist.show();
      });

      // Hide datalist when blurred, UNLESS we're hovering the datalist.
      // This is to avoid removing the datalist before the click event registers.
      var $datalist_mousedOver = false;
      $datalist.on('mouseenter', function() { $datalist_mousedOver = true; });
      $datalist.on('mouseleave', function() { $datalist_mousedOver = false; });
      elem.on('blur', function($event) {
        if (!$datalist_mousedOver) {
          $datalist.hide();
        }
      });

      // If the element loaded in a focused state (e.g., <input autofocus>), the
      // focus event handler won't be called unless we manually trigger it.
      if (elem.is(':focus')) {
        elem.trigger('focus');
      }
    }
  };
}]);

angular.module('dataform.directives').directive('dfDatalist', [function() {
  return {
    restrict: 'A',
    link: function(scope, elem, attrs) {
      elem.addClass('df-datalist');

      elem.delegate('li[df-value]', 'click', function($event) {
        var $li = angular.element($event.currentTarget);
        var value = $li.scope().$eval($li.attr('df-value'));
        scope._$ac_on.select($event, value);
      });
    }
  };
}]);
