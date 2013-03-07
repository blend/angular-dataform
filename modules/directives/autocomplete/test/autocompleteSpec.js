/*global describe, beforeEach, module, inject, it, spyOn, expect, $, console */

describe('dfAutocompleteDatalist', function() {
  'use strict';

  var scope, $compile;
  beforeEach(module('dataform.directives'));
  beforeEach(inject(function(_$rootScope_, _$compile_, _$window_) {
    scope = _$rootScope_.$new();
    $compile = _$compile_;
  }));

  describe('compiling this directive', function() {
    it('should throw an error if there is no df-list attribute value', function() {
      function compile() {
        $compile('<input df-autocomplete-datalist>')(scope);
      }
      expect(compile).toThrow();
    });
    it('should throw an error if the df-list attribute points to a nonexistent datalist', function() {
      function compile() {
        $compile('<input df-autocomplete-datalist=foo>')(scope);
      }
      expect(compile).toThrow();
    });
  });
});

describe('dfDatalist', function() {
  'use strict';

  var scope, $compile;
  beforeEach(module('dataform.directives'));
  beforeEach(inject(function(_$rootScope_, _$compile_, _$window_) {
    scope = _$rootScope_.$new();
    $compile = _$compile_;
  }));

  describe('compiling this directive', function() {
    it('should not throw an error', function() {
      function compile() {
        $compile('<ol df-datalist id=foo></ol>')(scope);
      }
      expect(compile).not.toThrow();
    });
  });
  describe('custom events', function() {
    it('should respond to "show" by showing', function() {
      var elem = $compile('<ol df-datalist id=foo></ol>')(scope);
      elem.hide();
      expect(elem.css('display')).toBe('none');
      elem.trigger('show');
      expect(elem.css('display')).not.toBe('none');
    });
    it('should respond to "hide" by hiding and resetting activeIndex', function() {
      scope.activeIndex = 3;
      var elem = $compile('<ol df-datalist id=foo></ol>')(scope);
      elem.trigger('hide');
      expect(elem.css('display')).toBe('none');
      expect(scope.activeIndex).toBeNull();
    });
  });
  describe('clicking on item', function() {
    var html = '<ol df-datalist><li ng-repeat="i in items" class="item{{$index}}" df-value="i">{{i}}</li></ol>';
    it('should call back to input with the chosen value', function() {
      scope.items = ['foo', 'bar'];
      scope._$ac_on = {select: function() {}};
      spyOn(scope._$ac_on, 'select');
      var elem = $compile(html)(scope);
      scope.$digest();
      elem.children('li.item0').click();
      expect(scope._$ac_on.select).toHaveBeenCalled();
      var $event = scope._$ac_on.select.mostRecentCall.args[0];
      var itemValue = scope._$ac_on.select.mostRecentCall.args[1];
      expect($event.type).toEqual('click');
      expect(itemValue).toEqual('foo');
    });
  });
});
