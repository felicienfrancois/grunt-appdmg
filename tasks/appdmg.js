'use strict';

var path = require('path');
var appdmg = require('appdmg');
var chalk = require('chalk');

module.exports = function (grunt) {

  // Please see the Grunt documentation for more information regarding task
  // creation: http://gruntjs.com/creating-tasks
  grunt.registerMultiTask('appdmg', 'Generate DMG-images for Mac OSX', function () {

    var options = this.options();
    var done = this.async();

    if (options.configFile) {
      grunt.log.warn('"configFile" option has been deprecated.');
      delete options.configFile;
    }

    var basepath = options.basepath || process.cwd();
    delete options.basepath;

    // Iterate over all specified file groups.
    this.files.forEach(function (filePair) {

      var dirname = path.dirname(filePair.dest);
      var emitter;

      // Create directory beforehand to prevent error.
      grunt.file.mkdir(dirname);

      // Run appdmg module.
      // TODO: Remove logging and use native appdmg's method in the future release.
      emitter = appdmg({basepath: basepath, specification: options, target: filePair.dest});
      emitter.on('progress', function (info) {
        if (info.type === 'step-begin') {
          var line =  '[' + (info.current <= 9 ? ' ' : '') + info.current + '/' + info.total + '] ' + info.title + '...';
          grunt.log.write(line + grunt.util.repeat(' ', 45 - line.length));
        }
        if (info.type === 'step-end') {
          var op = ({
            ok: ['green', ' OK '],
            skip: ['yellow', 'SKIP'],
            error: ['red', 'FAIL']
          }[info.status]);
          grunt.log.write('[' + chalk[op[0]](op[1]) + ']\n');
        }
      });
      emitter.on('finish', function (image) {
        grunt.log.writeln('\nImage: ' + chalk.cyan(filePair.dest) + ' was created');
        done();
      });
      emitter.on('error', function (info) {
        grunt.log.error('Error');
        done(false);
      });

    });

  });

};
