
angular.module('dataform.directives').directive('dfTagList', [function() {
  return {
    restrict: 'A',
    link: function(scope, elem, attrs) {
      if (!scope.tags) {
        throw new Error('dfTagList requires its scope to have a "tags" property');
      }
    }
  };
}]);

angular.module('dataform.directives').directive('dfTagAdd', ['$document', function($document) {
  return {
    restrict: 'A',
    link: function(scope, elem, attrs) {
      if (!scope.tags) {
        throw new Error('dfTagAdd requires its scope to have a "tags" property');
      }

      var input = angular.element('<input placeholder=Tag>');
      var form = angular.element('<form>').append(input);
      var addButton = angular.element('<button class=add><i class="icon-plus"></i></button>');

      setFormVisibility();
      elem.append(form, addButton);

      function reset() {
        input.val(undefined);
        addButton.show();
        setFormVisibility();
      }

      function setFormVisibility() {
        if (!scope.tags || scope.tags.length === 0) {
          elem.addClass('empty');
          form.show();
          addButton.hide();
        } else {
          elem.removeClass('empty');
          form.hide();
        }        
      }

      addButton.on('click', function($event) {
        $event.preventDefault();
        form.show();
        addButton.hide();
        input.focus();
      });

      input.on('focus', function() {
        form.show();
        addButton.hide();
      });

      input.on('blur', reset);

      form.on('submit', function($event) {
        $event.preventDefault();
        scope.tags = scope.tags || [];
        scope.$apply(function() {
          scope.tags.push(input.val());
        });
        reset();
      });

      scope.$watch('tags.length', setFormVisibility);
    }
  };  
}]);

angular.module('dataform.directives').directive('dfTag', [function() {
  return {
    restrict: 'EAC',
    link: function(scope, elem, attrs) {
      if (!scope.tags) {
        throw new Error('dfTag requires its scope to have a "tags" property');
      }

      var wrapper = angular.element('<span class="df-tag-wrap">');
      var removeButton = angular.element('<button class="remove"><i class="icon-remove"></i></button>');

      elem.html(wrapper.append(elem.contents()));
      wrapper.append(removeButton);

      removeButton.on('click', function($event) {
        scope.$apply(function() {
          // TODO: un-hardcode "tags" property name
          scope.tags.splice(scope.$index, 1);
        });
      });
    }
  };
}]);
