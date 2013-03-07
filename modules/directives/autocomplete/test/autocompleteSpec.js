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
});
