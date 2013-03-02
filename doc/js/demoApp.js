
/**
 * demoApp - 1.0.0rc2
 */

angular.module('demoApp', ['dataform'], function($locationProvider) {
  $locationProvider.hashPrefix('');
  // Make code pretty
  window.prettyPrint && prettyPrint();
}).directive('scrollto', [function(){
  return function(scope, elm, attrs) {
    elm.bind('click', function(e){
      e.preventDefault();
      if (attrs.href) {
	attrs.scrollto = attrs.href;
      }
      var top = $(attrs.scrollto).offset().top;
      $('body,html').animate({ scrollTop: top }, 800);
    });
  };
}]);

var CITIES = [
    {name: 'San Francisco'},
    {name: 'Hong Kong'},
    {name: 'New York'},
    {name: 'Chicago'},
    {name: 'Palo Alto'},
    {name: 'London'},
    {name: 'Shanghai'},
    {name: 'Beijing'},
    {name: 'Tokyho'},
    {name: 'Osaka'},
    {name: 'Berlin'},
    {name: 'Frankfurt'},
    {name: 'Cairo'},
    {name: 'Dubai'},
    {name: 'Sydney'},
    {name: 'Singapore'},
    {name: 'Los Angeles'},
    {name: 'Buenos Aires'},
    {name: 'Mexico City'},
    {name: 'Accra'}
];

function AutocompleteDatalistCtrl($scope) {
  $scope.cities = angular.copy(CITIES);
}

function TagCtrl($scope) {
  $scope.tags = ['Alice', 'Bob', 'Carol'];
}

function ObjectInputCtrl($scope) {
  $scope.obj = {color: 'Blue', user: 'Alice'};
}


// Integrations

function ObjectTagsCtrl($scope) {
  $scope.colors = [{color: 'Red'}, {color: 'Green'}, {color: 'Blue'}];
}
