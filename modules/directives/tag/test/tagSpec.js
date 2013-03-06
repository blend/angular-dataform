/*global describe, beforeEach, module, inject, it, iit, spyOn, expect, $, console */

describe('dfTagList', function() {
  'use strict';

  var scope, $compile;
  beforeEach(module('dataform.directives'));
  beforeEach(inject(function(_$rootScope_, _$compile_, _$window_) {
    scope = _$rootScope_.$new();
    $compile = _$compile_;
  }));

  describe('compiling this directive', function() {
    it('should throw an error if there is no items attribute', function() {
      function compile() {
        $compile('<ol df-tag-list></div>')(scope);
      }

      expect(compile).toThrow();
    });
  });
});

describe('dfTagAdd', function() {
  'use strict';

  var scope, $compile, $document;
  beforeEach(module('dataform.directives'));
  beforeEach(inject(function(_$rootScope_, _$compile_, _$window_) {
    scope = _$rootScope_.$new();
    $compile = _$compile_;
  }));

  describe('compiling this directive', function() {
    it('should construct proper DOM structure', function() {
      scope.items = ['foo'];
      scope.$digest();
      var element = $compile('<div df-tag-add></div>')(scope);
      expect(element.html()).toBe('<form><input placeholder="Tag"></form><button class="add"><i class="icon-plus"></i></button>');
    });
  });
  describe('when the tags array begins non-empty', function() {
    it('should hide the input and show the + button', function() {
      scope.items = ['foo'];
      var element = $compile('<div df-tag-add></div>')(scope);
      scope.$digest();
      expect(element.find('form').css('display')).toBe('none');
      expect(element.find('button').css('display')).not.toBe('none');
    });
  });
  describe('when the tags array begins empty', function() {
    it('should show the input and hide the + button', function() {
      scope.items = [];
      var element = $compile('<div df-tag-add></div>')(scope);
      scope.$digest();
      expect(element.find('form').css('display')).not.toBe('none');
      expect(element.find('button').css('display')).toBe('none');
    });
  });
  describe('when the tags array is emptied (but does not begin empty)', function() {
    it('should show the input and hide the + button', function() {
      scope.items = ['foo'];
      var element = $compile('<div df-tag-add></div>')(scope);
      scope.$digest();
      scope.items.pop();
      scope.$digest();
      expect(element.find('form').css('display')).not.toBe('none');
      expect(element.find('button').css('display')).toBe('none');
    });
  });
  describe('after clicking +', function() {
    it('should hide the + button and show the input', function() {
      scope.items = ['foo'];
      var element = $compile('<div df-tag-add></div>')(scope);
      scope.$digest();
      element.find('button.add').click();
      expect(element.find('form').css('display')).not.toBe('none');
      expect(element.find('button.add').css('display')).toBe('none');
    });
    it('de-focusing the input should clear and hide the input and show the + button (after a timeout)', function() {
      scope.items = ['foo'];
      var element = $compile('<div df-tag-add></div>')(scope);
      scope.$digest();
      element.find('button.add').click();
      element.find('input').val('bar');
      element.find('input').blur();
      expect(element.find('input').val()).toBe('');
      expect(element.find('form').css('display')).toBe('none');
      expect(element.find('button.add').css('display')).not.toBe('none');
    });
  });
  describe('after submitting input value', function() {
    it('should append value', function() {
      scope.items = ['foo'];
      var element = $compile('<div df-tag-add></div>')(scope);
      scope.$digest();
      element.find('input').val('bar');
      element.find('form').trigger('submit');
      expect(scope.items).toEqual(['foo','bar']);
    });
    it('should clear input value', function() {
      scope.items = [];
      var element = $compile('<div df-tag-add></div>')(scope);
      scope.$digest();
      element.find('input').val('bar');
      element.find('form').trigger('submit');
      scope.$digest();
      expect(element.find('input').val()).toBe('');
    });
    it('should show and focus input (and hide +) for adding next tag', function() {
      scope.items = [];
      var element = $compile('<div df-tag-add></div>')(scope);
      scope.$digest();
      element.find('add.button').click();
      element.find('input').focus().val('foo');
      element.find('form').trigger('submit');
      scope.$digest();
      expect(element.find('form').css('display')).not.toBe('none');
      expect(element.find('button.add').css('display')).toBe('none');      
    });
  });
});

describe('dfTag', function() {
  'use strict';

  var scope, $compile;
  beforeEach(module('dataform.directives'));
  beforeEach(inject(function(_$rootScope_, _$compile_, _$window_) {
    scope = _$rootScope_.$new();
    $compile = _$compile_;
  }));

  describe('compiling this directive', function() {
    it('should throw an error if we have no $scope.items', function() {
      function compile() {
        $compile('<div df-tag>foo</div>')(scope);
      }

      expect(compile).toThrow();
    });
    it('should construct proper DOM structure', function() {
      scope.items = ['foo'];
      scope.$digest();
      var element = $compile('<div df-tag>bar</div>')(scope);
      expect(element.html()).toBe('<span class="df-tag-wrap">bar<button class="remove"><i class="icon-remove"></i></button></span>');
    });
  });
  describe('clicking on the remove button', function() {
    it('should remove the tag from the parent scope tags array', function() {
      scope.items = ['foo'];
      var element = $compile('<div df-tag>bar</div>')(scope);
      scope.$digest();
      element.find('button.remove').click();
      expect(scope.items).toEqual([]);
    });
  });
});
