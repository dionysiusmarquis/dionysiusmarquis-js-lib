var gulp = require('gulp');
var Q = require('q');
var resolveDependencies = require('gulp-resolve-dependencies');
var concat = require('gulp-concat');
var replace = require('gulp-replace');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');

var path = require('path');
var browserify = require('browserify');

var paths = {
  js: "src/js/",
  jsCore: "src/js/dm/core/",
  jsWebgl: "src/js/dm/webgl/"
};

var files = {
  'core': [paths.jsCore+"*"],
  'beziermodifier': [paths.jsWebgl+'beziermodifier/*'],
  'displacement': [paths.jsWebgl+'displacementshader/*'],
  'fluids': [paths.jsWebgl+'fluids/*'],
  'shaderlib': [paths.jsWebgl+'shaderlib/*'],
  'sem': [paths.jsWebgl+'sphericalenvmapping/*'],
};

var requirePattern = /\* @requires [\s-]*(.*\.js)/g;

function requireResolvePath(match, targetFile) {
  return path.join(path.resolve(paths.js), match);
}

gulp.task('buidjs', function(){
  var promises = Object.keys(files).map(function (key) {
    var deferred = Q.defer();
    var val = files[key];

    gulp.src(val)
      .pipe(resolveDependencies({
        pattern: requirePattern,
        log: true,
        resolvePath: requireResolvePath
      }))
      .on('error', function(err) {
            console.log(err.message);
          })
      .pipe(concat("dionysiusmarquis."+key+".js"))
      .pipe(gulp.dest('build/js/'))
      .pipe(uglify())
      .pipe(rename({
        extname: '.min.js'
      }))
      .pipe(gulp.dest('build/js/'))
      .on('end', function () {
        deferred.resolve();
      });

    return deferred.promise;
  });

  return Q.all(promises);
});


gulp.task('default', ['buidjs']);