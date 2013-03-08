/*global describe, ddescribe, beforeEach, module, inject, it, iit, spyOn, expect, $, console, jQuery */

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
      expect(scope.activeIndex).toBeUndefined();
    });
  });
  var html = '<ol df-datalist><li ng-repeat="i in items" class="item{{$index}}" df-value="i">{{i}}</li></ol>';
  describe('clicking on item', function() {
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
  describe('active item selection', function() {
    var DOWN_ARROW = 40;
    var UP_ARROW = 38;
    it('starts undefined', function() {
      scope.items = ['foo'];
      var elem = $compile(html)(scope);
      expect(scope.activeIndex).toBeUndefined();
    });
    describe('down arrow', function() {
      it('advances through items upon hitting the down arrow', function() {
        scope.items = ['foo', 'bar'];
        var elem = $compile(html)(scope);
        scope.$digest();
        elem.trigger(jQuery.Event('keypress', {keyCode: DOWN_ARROW}));
        expect(scope.activeIndex).toBe(0);
        elem.trigger(jQuery.Event('keypress', {keyCode: DOWN_ARROW}));
        expect(scope.activeIndex).toBe(1);
      });
      it('does not advance beyond last item', function() {
        scope.items = ['foo', 'bar'];
        var elem = $compile(html)(scope);
        scope.$digest();
        elem.trigger(jQuery.Event('keypress', {keyCode: DOWN_ARROW}));
        elem.trigger(jQuery.Event('keypress', {keyCode: DOWN_ARROW}));
        elem.trigger(jQuery.Event('keypress', {keyCode: DOWN_ARROW}));
        expect(scope.activeIndex).toBe(1);
      });
    });
    describe('up arrow', function() {
      it('does nothing when there is no selection', function() {
        scope.items = ['foo', 'bar'];
        var elem = $compile(html)(scope);
        scope.$digest();
        elem.trigger(jQuery.Event('keypress', {keyCode: UP_ARROW}));
        expect(scope.activeIndex).toBeUndefined();
      });
      it('moves up', function() {
        scope.items = ['foo', 'bar'];
        var elem = $compile(html)(scope);
        scope.$digest();
        scope.activeIndex = 1;
        elem.trigger(jQuery.Event('keypress', {keyCode: UP_ARROW}));
        expect(scope.activeIndex).toBe(0);
      });
      it('moves up to defocus all items, but does not move up beyond', function() {
        scope.items = ['foo', 'bar'];
        var elem = $compile(html)(scope);
        scope.activeIndex = 1;
        scope.$digest();
        elem.trigger(jQuery.Event('keypress', {keyCode: UP_ARROW}));
        elem.trigger(jQuery.Event('keypress', {keyCode: UP_ARROW}));
        expect(scope.activeIndex).toBeUndefined();
        elem.trigger(jQuery.Event('keypress', {keyCode: UP_ARROW}));
        expect(scope.activeIndex).toBeUndefined();
      });
    });
    describe('when data changes', function() {
      it('resets the activeIndex', function() {
        scope.items = ['foo', 'bar'];
        scope.activeIndex = 1;
        var elem = $compile(html)(scope);
        scope.items = ['foo', 'bar', 'baz'];
        scope.$digest();
        expect(scope.activeIndex).toBeUndefined();
      });
    });
  });
});
