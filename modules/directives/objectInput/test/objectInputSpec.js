/*global describe, xdescribe, beforeEach, module, inject, it, spyOn, expect, $, console */

describe('dfObjectInput', function() {
  'use strict';

  var scope, $compile, changeInputValueTo;
  beforeEach(module('dataform.directives'));
  beforeEach(inject(function(_$rootScope_, _$compile_, $sniffer) {
    scope = _$rootScope_.$new();
    $compile = _$compile_;

    changeInputValueTo = function(inputElement, value) {
      inputElement.val(value);
      inputElement.trigger($sniffer.hasEvent('input') ? 'input' : 'change');
      scope.$digest();
    };
  }));

  describe('compiling this directive', function() {
    it('should throw an error if we have no display-field attribute', function() {
      function compile() {
        $compile('<input df-object-input ng-model=obj />')(scope);
      }

      expect(compile).toThrow();
    });
  });

  describe('input -> model', function() {
    it('should update the object', function() {
      scope.obj = {foo: 'bar'};
      var element = $compile('<input df-object-input ng-model=obj display-field=foo />')(scope);
      scope.$digest();
      changeInputValueTo(element, 'qux');
      expect(scope.obj.foo).toBe('qux');
    });
    it('should not nullify the object when the input is empty', function() {
      scope.obj = {foo: 'bar'};
      var element = $compile('<input df-object-input ng-model=obj display-field=foo />')(scope);
      scope.$digest();
      changeInputValueTo(element, '');
      expect(scope.obj.foo).toBe('');
    });
  });

  describe('model -> input', function() {
    it('should initialize the input from the model value', function() {
      scope.obj = {foo: 'bar'};
      var element = $compile('<input df-object-input ng-model=obj display-field=foo />')(scope);
      scope.$digest();
      expect(element.val()).toBe('bar');
    });    
    it('should update the input view value after changing the ngModel object', function() {
      scope.obj = {foo: 'bar'};
      var element = $compile('<input df-object-input ng-model=obj display-field=foo />')(scope);
      scope.$digest();
      scope.$apply(function() {
        scope.obj = {foo: 'qux'};
      });
      expect(element.val()).toBe('qux');
    });
    it('should update the input view value after changing the displayField key on the ngModel object', function() {
      scope.obj = {foo: 'bar'};
      var element = $compile('<input df-object-input ng-model=obj display-field=foo />')(scope);
      scope.$apply(function() {
        scope.obj.foo = 'qux';
      });
      expect(element.val()).toBe('qux');
    });
    describe('starting with a null object', function() {
      it('should create the object when the input value changes', function() {
        scope.obj = null;
        var element = $compile('<input df-object-input ng-model=obj display-field=foo />')(scope);
        expect(element.val()).toBe('');
        changeInputValueTo(element, 'bar');
        expect(scope.obj.foo).toBe('bar');
      });
    });
  });
});
