
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
        scope.$parent.query = ngModel.$viewValue;
        scope.$parent._$ac_on = handlers;
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

      function selectItem($li, $event) {
        var value = scope.searchResults[scope.activeIndex];
        scope._$ac_on.select($event, value);
      }

      function resetActiveIndex() {
        scope.activeIndex = attrs.dfInitialSelection;
        if (scope.activeIndex) scope.activeIndex = parseInt(scope.activeIndex, 10);
      }

      elem.delegate('li[df-value]', 'click', function($event) {
        selectItem(angular.element($event.currentTarget), $event);
      });

      elem.bind('show', function() {
        elem.show();
        renderActiveIndex(scope.activeIndex);
      });

      elem.bind('hide', function() {
        elem.hide();
        scope.$apply(resetActiveIndex);
      });

      function nthItem(n) {
        return angular.element(elem.children('li[df-value]').get(n));
      }

      function renderActiveIndex() {
        elem.children('li').removeClass('active');
        var lis = elem.children('li');
        if (angular.isDefined(scope.activeIndex)) nthItem(scope.activeIndex).addClass('active');

      }
      scope.$watch('activeIndex', function(activeIndex, prevActiveIndex) {
        renderActiveIndex();
      });

      function itemCount() {
        return elem.children('li[df-value]').length;
      }

      function ensureHighlightVisible() {
        scope.ignoreMouse = true;
        var container = elem[0];
        var choices = elem.querySelectorAll('#search > li');
        if (choices.length < 1) return;

        if (scope.activeIndex < 0) {
          return;
        }

        var highlighted = choices[scope.activeIndex];
        var posY = highlighted.offsetTop + highlighted.clientHeight - container.scrollTop - container.offsetTop;
        var height = container.offsetHeight;

        if (posY > height) {
          container.scrollTop += posY - height;
        } else if (posY < highlighted.clientHeight) {
          container.scrollTop -= highlighted.clientHeight - posY;
        } else {
          scope.ignoreMouse = false;
        }
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
              // already at top; deselect active
              scope.activeIndex = undefined;
            } else {
              scope.activeIndex -= 1;
              ensureHighlightVisible();
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
              ensureHighlightVisible();
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
          if (typeof scope.activeIndex === 'number') {
            selectItem(nthItem(scope.activeIndex), $event);
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

      elem.delegate('li[df-value]', 'mouseenter', function($event) {
        scope.$apply(function() {
          if (scope.ignoreMouse) {
            scope.ignoreMouse = false;
          } else {
            scope.activeIndex = elem.children('li[df-value]').index($event.currentTarget);
          }
        });
      });

      // We want to know when the underlying data used to generate <li>s changes,
      // which we can approximate by determining the ngRepeat iterables used.
      angular.forEach(elem.contents(), function(node) {
        if (node.nodeType === 8) { // Comment node
          var m = node.nodeValue.match(/^\s*ngRepeat:\s*(.+)\s+in\s+(.*)\s*$/);
          if (m) {
            var rhs = m[2];
            if (rhs) {
              var reactToActiveIndexChange = function(v, oldv) {
                if (v || !oldv) {
                  resetActiveIndex();
                  renderActiveIndex();
                }
              };

              // Watch on both deep-equality changes and object changes. This is so that the watch triggers
              // if the scope attribute is replaced by a DIFFERENT object that is deep-equal to the previous object.
              scope.$watch(rhs, reactToActiveIndexChange, true);
              scope.$watch('(' + rhs + ')[0]', reactToActiveIndexChange, false);
            }
          }
        }
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
          if (scope.items && scope.items.length) {
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
