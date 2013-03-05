var testacular = require('testacular');

/*global module:false*/
module.exports = function (grunt) {

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    meta: {
      banner: '/**\n' + ' * <%= pkg.description %>\n' +
      ' * @version v<%= pkg.version %> - ' +
      '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
      ' * @link <%= pkg.homepage %>\n' +
      ' * @license MIT License, http://www.opensource.org/licenses/MIT\n' + ' */'
    },
    clean: {
      src: ['dist']
    },
    concat: {
      options: {
        banner: '<%= banner %>',
        stripBanners: true
      },
      dist: {
        src: ['common/module.js', 'modules/**/*.js', '!modules/**/test/*.js'],
        dest: 'dist/<%= pkg.name %>.js'
      }
    },
    uglify: {
      options: {
        banner: '<%= banner %>'
      },
      dist: {
        src: ['<%= concat.dist.dest %>'],
        dest: 'dist/<%= pkg.name %>.min.js'
      }
    },
     less: {
      options: {
        dumpLineNumbers: 'all'
      },
      dist: {
        files: {
          'dist/<%= pkg.name %>.css': ['modules/**/*.less']
        }
      }
    },
    jshint: {
      gruntfile: {
        src: 'Gruntfile.js'
      },
      src: {
        src: ['modules/**/*.js', '!modules/**/test/*.js']
      },
      test: {
        src: ['modules/**/test/*.js']
      }
    },
    watch: {
      files: ['modules/**/*.js', 'modules/**/*.less', 'common/**/*.js', 'common/**/*.less'],
      tasks: ['build', 'test']
    }
  });

  // Default task.
  grunt.registerTask('default', ['build', 'test']);

  grunt.registerTask('build', ['jshint', 'concat', 'less:dist']);

  grunt.registerTask('server', 'start testacular server', function () {
    //Mark the task as async but never call done, so the server stays up
    var done = this.async();
    testacular.server.start({ configFile: 'test/test-config.js'});
  });

  grunt.registerTask('test', 'run tests (make sure server task is run first)', function () {
    var done = this.async();
    grunt.util.spawn({
      cmd: process.platform === 'win32' ? 'testacular.cmd' : 'testacular',
      args: process.env.TRAVIS ? ['start', 'test/test-config.js', '--single-run', '--no-auto-watch', '--reporters=dots', '--browsers=Firefox'] : ['run']
    }, function (error, result, code) {
      if (error) {
        grunt.warn("Make sure the testacular server is online: run `grunt server`.\n" +
          "Also make sure you have a browser open to http://localhost:8080/.\n" +
          error.stdout + error.stderr);
        //the testacular runner somehow modifies the files if it errors(??).
        //this causes grunt's watch task to re-fire itself constantly,
        //unless we wait for a sec
        setTimeout(done, 1000);
      } else {
        grunt.log.write(result.stdout);
        done();
      }
    });
  });
};
