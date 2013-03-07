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
});
