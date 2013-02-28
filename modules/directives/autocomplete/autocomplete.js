
angular.module('dataform.directives').directive('dfList', ['$document', function($document) {
  return {
    restrict: 'A',
    require: '?ngModel',
    link: function(scope, elem, attrs, ngModel) {
      if (!attrs.dfList) throw new Error('df-list attribute must not be empty');

      var eDatalist = $document.find('#' + attrs.dfList);
      if (!eDatalist.length) {
        throw new Error('df-list attribute value "' + attrs.dfList + '" ' +
                        'must refer to DOM ID of existing <datalist> element');
      }

      elem.attr('list', attrs.dfList);
    }
  };
}]);
