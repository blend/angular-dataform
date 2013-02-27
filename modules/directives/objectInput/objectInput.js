
angular.module('dataform.directives').directive('dfObjectInput', [function() {
  return {
    restrict: 'A',
    require: 'ngModel',
    link: function(scope, elem, attrs, ngModel) {
      if (!attrs.displayField) {
        throw new Error('dfObjectInput requires a displayField attribute');
      }
      ngModel.$parsers.push(function(s) {
        if (!ngModel.$modelValue) {
          ngModel.$modelValue = {};
        }
        ngModel.$modelValue[attrs.displayField] = s;
        return ngModel.$modelValue;
      });
      ngModel.$formatters.push(function(s) {
        return s ? s[attrs.displayField] : '';
      });
    }
  };
}]);
