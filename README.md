# Angular Dataform - Reliable, componentized data form controls for AngularJS

***

[![Build Status](https://secure.travis-ci.org/blendlabs/angular-dataform.png)](http://travis-ci.org/blendlabs/angular-dataform)

## Usage

### Requirements

* **AngularJS v1.1.3+** is currently required.

## Installation

The repository comes with the modules pre-built and compressed into the `build/` directory.

```javascript
angular.module('myApp', ['dataform']);
```

The modules can be found in the [Directives](https://github.com/blendlabs/angular-dataform/tree/master/modules/directives). Check out the readme file associated with each module for specific module usage information.

## Development

You do not need to build the project to use it - see above - but if you are working on it then this is what you need to know.

### Requirements

0. Install [Node.js](http://nodejs.org/) and NPM (should come with)

1. Install local dependencies:

```bash
$ npm install
```

2. Install global dependencies `grunt`, `coffee-script`, and `testacular`:

```bash
$ npm install -g testacular coffee-script grunt-cli
```

### Build Files & Run Tests

Before you commit, always run `grunt` to build and test everything once.

```bash
$ grunt
```

### Test & Develop

The modules come with unit tests that should be run on any changes and certainly before commiting changes to the project.  The unit tests should also provide further insight into the usage of the modules.

First, start the testacular server:
```bash
$ grunt server
```
Then, open your browser to http://localhost:8080 and run the watch command to re-run tests on every save:
```bash
$ grunt watch
```

### Publishing

For core team: if you wish to publish a new version follow these steps:

1. Bump the version number inside `component.json` and `package.json`
2. Build and test
3. Commit the updated `component.json`, `package.json`, and `dist/` folder on their own commit
4. Tag the commit: `git tag v[maj].[min].[patch]`
5. Push the tag: `git push [angular-dataform] master --tags`
