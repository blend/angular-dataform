
angular.module('dataform.directives', []);
angular.module('dataform', ['dataform.directives']);


angular.module('dataform.directives').directive('dfAutocompleteDatalist', ['$document', '$timeout', function($document, $timeout) {
  return {
    restrict: 'A',
    require: 'ngModel',
    link: function(scope, elem, attrs, ngModel) {
      if (!attrs.dfAutocompleteDatalist) throw new Error('df-autocomplete-datalist attribute must not be empty');

      var datalistSel = 'ol[df-datalist]#' + attrs.dfAutocompleteDatalist;
      // Search for datalist by ID among siblings first so that we can have multiple datalists with
      // the same ID in the document but still use the nearest one. TODO: this is obviously a bad workaround.
      var matchingSiblings = elem.siblings(datalistSel);
      var $datalist = (matchingSiblings.length > 0) ? matchingSiblings : $document.find(datalistSel);
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

          $datalist.trigger('hide');

          scope.$apply(function() {
            scope[attrs.ngModel] = value;
          });

          // Allow <input ... df-autocomplete-submit-on-select> option that instructs this
          // directive to submit its parent form when the user makes a selection.
          if (attrs.hasOwnProperty('dfAutocompleteSubmitOnSelect')) {
            if (elem[0].form) {
              angular.element(elem[0].form).submit();
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
        $datalist.trigger('show');
      });

      // Hide datalist when blurred, UNLESS we're hovering the datalist.
      // This is to avoid removing the datalist before the click event registers.
      var $datalist_mousedOver = false;
      $datalist.on('mouseenter', function() { $datalist_mousedOver = true; });
      $datalist.on('mouseleave', function() { $datalist_mousedOver = false; });
      elem.on('blur', function($event) {
        if (!$datalist_mousedOver) {
          $datalist.trigger('hide');
        }
      });

      // If the element loaded in a focused state (e.g., <input autofocus>), the
      // focus event handler won't be called unless we manually trigger it.
      if (elem.is(':focus')) {
        elem.trigger('focus');
      }

      elem.bind('keypress', function($event) {
        $datalist.trigger($event);
      });
      elem.bind('keyup', function($event) {
        $datalist.trigger($event);
      });
      elem.bind('keydown', function($event) {
        $datalist.trigger($event);
      });
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

      elem.bind('show', function() {
        elem.show();
      });

      elem.bind('hide', function() {
        elem.hide();
        scope.$apply(function() {
          scope.activeIndex = undefined;
        });
      });

      function nthItem(n) {
        return angular.element(elem.children('li').get(n));
      }

      scope.$watch('activeIndex', function(activeIndex, prevActiveIndex) {
        if (!angular.isDefined(activeIndex)) {
          elem.children('li').removeClass('active');
        } else if (typeof activeIndex === 'number') {
          var lis = elem.children('li');
          if (angular.isDefined(prevActiveIndex)) nthItem(prevActiveIndex).removeClass('active');
          if (angular.isDefined(activeIndex)) nthItem(activeIndex).addClass('active');
        }
      });

      function itemCount() {
        return elem.children('li[df-value]').length;
      }

      function move($event) {
        switch ($event.keyCode) {
        case 13: // enter
        case 27: // escape
          $event.preventDefault();
          break;
        case 38: // up arrow
          $event.preventDefault();
          scope.$apply(function() {
            if (typeof scope.activeIndex !== 'number') {
              // do nothing, already inactive
            } else if (scope.activeIndex === 0) {
              // already at top; deselect
              scope.activeIndex = undefined;
            } else {
              scope.activeIndex -= 1;
            }
          });
          break;
        case 40: // down arrow
          $event.preventDefault();
          scope.$apply(function() {
            if (scope.activeIndex >= itemCount() - 1) {
              scope.activeIndex = itemCount() - 1; // TODO: make this work when the length changes
              // do nothing, already at bottom
            } else if (typeof scope.activeIndex === 'number') {
              scope.activeIndex += 1;
            } else {
              scope.activeIndex = 0;
            }
          });
          break;
        default:
          elem.show();
        }
        $event.stopPropagation();
      }

      elem.bind('keyup', function ($event) {
        switch ($event.keyCode) {
        case 40: // down arrow
        case 38: // up arrow
        case 16: // shift
        case 17: // ctrl
        case 18: // alt
          break;
        case 13: // enter
          if (scope.activeIndex >= 0) {
            nthItem(scope.activeIndex).trigger('click');
          }
          break;
        case 27: // escape
          elem.trigger('hide');
          break;
        }
        $event.stopPropagation();
        $event.preventDefault();
      });

      elem.on('keypress', function($event) {
        move($event);
      });

      elem.on('keydown', function($event) {
        move($event);
      });
    }
  };
}]);


angular.module('dataform.directives').directive('dfObjectInput', [function() {
  return {
    restrict: 'A',
    require: 'ngModel',
    link: function(scope, elem, attrs, ngModel) {
      if (!attrs.displayField) {
        throw new Error('dfObjectInput requires a displayField attribute');
      }
      ngModel.$parsers.push(function(s) {
        var o = {};
        o[attrs.displayField] = s;
        return o;
      });
      ngModel.$formatters.push(function(s) {
        return s ? s[attrs.displayField] : '';
      });
    }
  };
}]);


angular.module('dataform.directives').directive('dfTagList', [function() {
  return {
    restrict: 'A',
    link: function(scope, elem, attrs) {
      if (!attrs.items) {
        throw new Error('<df-tag-list> requires an "items" attribute');
      }
      scope.items = [];
      scope.$watch(attrs.items, function(items) {
        scope.items = items;
      });
    }
  };
}]);

angular.module('dataform.directives').directive('dfTagAdd', ['$document', '$timeout', function($document, $timeout) {
  return {
    restrict: 'A',
    require: '?ngModel',
    link: function(scope, elem, attrs, ngModel) {
      var form = elem.find('form');
      if (!form.length) {
        form = angular.element('<form>');
        elem.append(form);
      }

      var input = elem.find('input');
      if (!input.length) {
        // Create default input if none exists.
        input = angular.element('<input placeholder=Tag>');
        form.append(input); // TODO '<button class=commit style="display:none">Commit</button>'
      }

      var addButton = angular.element('<button class=add><i class="icon-plus"></i></button>');

      elem.append(addButton);

      var addingMode = false;
      function setAddingMode(adding) {
        addingMore = adding;
        if (adding) {
          elem.addClass('adding');
          addButton.hide();
          form.show();
          input.focus();
        } else {
          elem.removeClass('adding');
          addButton.show();
          if (scope.items.length) {
            $timeout(function() { form.hide(); }, 150);
          }
        }
      }

      addButton.on('click', function($event) {
        $event.preventDefault();
        setAddingMode(true);
      });

      var inputFocused = false;
      input.on('focus', function() {
        inputFocused = true;
      });

      input.on('blur', function() {
        inputFocused = false;
        setAddingMode(false);
        input.val(undefined);
      });

      form.on('submit', function($event) {
        $event.preventDefault();
        scope.items = scope.items || [];
        scope.$apply(function() {
          var item = ngModel ? ngModel.$modelValue : input.val();
          if (item) {
            scope.items.push(item);
          }
        });

        // Continue adding
        setAddingMode(true);

        // Reset input value
        if (ngModel) {
          scope.$apply(function() {
            ngModel.$setViewValue(null);
          });
        } else {
          input.val(undefined);
        }
      });

      scope.$watch('items.length', function(length, prevLength) {
        if (!length || length === 0) {
          elem.addClass('empty');
          form.show();
          addButton.hide();
        } else {
          elem.removeClass('empty');
          if (!addingMode) {
            form.hide();
            addButton.show();
          }
        }
      });
    }
  };
}]);

angular.module('dataform.directives').directive('dfTag', [function() {
  return {
    restrict: 'EAC',
    link: function(scope, elem, attrs) {
      if (!scope.items) {
        throw new Error('dfTag requires its scope to have an "items" property');
      }

      var wrapper = angular.element('<span class="df-tag-wrap">');
      var removeButton = angular.element('<button class="remove"><i class="icon-remove"></i></button>');

      elem.html(wrapper.append(elem.contents()));
      wrapper.append(removeButton);

      removeButton.on('click', function($event) {
        scope.$apply(function() {
          scope.items.splice(scope.$index, 1);
        });
      });
    }
  };
}]);
