
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
          scope.items.push(item);
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
